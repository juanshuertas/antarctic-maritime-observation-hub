// SPDX-License-Identifier: AGPL-3.0-or-later
// AMOH_SMART_CINEMATIC_RUNTIME_V11
//
// Logic-first visual runtime built from the V10 recording review.
//
// Fixes:
// 1. Aircraft are AUTO-ACTIVATED in immersive modes through a dedicated read-only
//    live feed, independent of whether the Control Center layer was manually toggled.
// 2. Aircraft and satellites use intentionally different hero silhouettes/colors.
// 3. Native/legacy craft circles and symbols are suppressed semantically, not just by IDs.
// 4. deck.gl heat data uses cache + hysteresis, preventing transient empty source reads
//    from switching the heat surface off/on.
// 5. Native heat remains visible until deck heat is stable, then hands off once.
// 6. Camera framing is adaptive and applied only when ENTERING immersive mode,
//    never continuously while the user navigates.
//
// Provider truth, backend, PB124, Supabase, GitHub and SGP4 are unchanged.

import type {
  GeoJSONSource,
  Map as MlMap,
} from 'maplibre-gl';

import {
  MapLibreOverlay,
} from '@deck.gl/maplibre';

import {
  HeatmapLayer,
} from '@deck.gl/aggregation-layers';

import {
  ScatterplotLayer,
} from '@deck.gl/layers';

type Controller = {
  refresh: () => void;
  destroy: () => void;
};

type HeatPoint = {
  lng: number;
  lat: number;
  weight: number;
  sourceLayer: string;
};

type CachedHeat = {
  points: HeatPoint[];
  lastNonEmptyAt: number;
  signature: string;
};

type SourceClass = 'aircraft' | 'satellite' | 'other';

const controllers =
  new WeakMap<MlMap, Controller>();

const HEAT_CACHE_GRACE_MS = 10_000;
const LIVE_REFRESH_MS = 12_000;
const UI_REFRESH_MS = 420;

const AIR_SOURCE = 'amoh-v11-aircraft-live';
const SAT_SOURCE = 'amoh-v11-satellites-live';

const IDS = {
  airGlow: 'amoh-v11-aircraft-glow',
  airHero: 'amoh-v11-aircraft-hero',
  satGlow: 'amoh-v11-satellite-glow',
  satHero: 'amoh-v11-satellite-hero',
} as const;

const V11_PREFIX = 'amoh-v11-';
const OLD_HERO_RE =
  /^amoh-v9-(?:aircraft|satellite)/i;

const RUNTIME_HEAT_RE =
  /^amoh-runtime-heat-/i;

const RUNTIME_POINT_RE =
  /^amoh-runtime-points-/i;

const QUANTARCTICA_RE =
  /^quantarctica/i;

function isImmersive(map: MlMap): boolean {
  try {
    return (
      String(
        map.getProjection?.()?.type ?? '',
      ).toLowerCase() === 'globe'
    );
  } catch {
    return false;
  }
}

function emptyFeatureCollection(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [],
  };
}

function imageDataFromCanvas(
  canvas: HTMLCanvasElement,
): ImageData {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new ImageData(
      canvas.width,
      canvas.height,
    );
  }

  return ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );
}

function createGlow(
  rgb: string,
  alpha: number,
): ImageData {
  const canvas =
    document.createElement('canvas');

  canvas.width = 160;
  canvas.height = 160;

  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);

  const g =
    ctx.createRadialGradient(
      80,
      80,
      2,
      80,
      80,
      76,
    );

  g.addColorStop(
    0,
    `rgba(${rgb},${alpha})`,
  );

  g.addColorStop(
    0.18,
    `rgba(${rgb},${alpha * 0.58})`,
  );

  g.addColorStop(
    0.48,
    `rgba(${rgb},${alpha * 0.16})`,
  );

  g.addColorStop(
    0.78,
    `rgba(${rgb},${alpha * 0.035})`,
  );

  g.addColorStop(
    1,
    `rgba(${rgb},0)`,
  );

  ctx.fillStyle = g;
  ctx.fillRect(
    0,
    0,
    160,
    160,
  );

  return imageDataFromCanvas(canvas);
}

// AIRCRAFT: pure-white directional airplane.
// No solar-panel rectangles, so it cannot be mistaken for a satellite.
function createAircraftImage(): ImageData {
  const canvas =
    document.createElement('canvas');

  canvas.width = 112;
  canvas.height = 112;

  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);

  ctx.translate(56, 56);

  ctx.shadowColor =
    'rgba(190,248,255,0.95)';
  ctx.shadowBlur = 10;

  ctx.fillStyle = '#ffffff';

  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(6, -13);
  ctx.lineTo(38, -1);
  ctx.lineTo(40, 7);
  ctx.lineTo(9, 5);
  ctx.lineTo(6, 29);
  ctx.lineTo(18, 38);
  ctx.lineTo(17, 43);
  ctx.lineTo(0, 36);
  ctx.lineTo(-17, 43);
  ctx.lineTo(-18, 38);
  ctx.lineTo(-6, 29);
  ctx.lineTo(-9, 5);
  ctx.lineTo(-40, 7);
  ctx.lineTo(-38, -1);
  ctx.lineTo(-6, -13);
  ctx.closePath();
  ctx.fill();

  // Short cyan tail cue only.
  ctx.shadowBlur = 0;
  ctx.strokeStyle =
    'rgba(82,234,255,0.90)';
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.moveTo(-4, 39);
  ctx.lineTo(-4, 49);
  ctx.moveTo(4, 39);
  ctx.lineTo(4, 49);
  ctx.stroke();

  return imageDataFromCanvas(canvas);
}

// SATELLITE: cyan/teal spacecraft with unmistakable rectangular solar panels.
// It intentionally does NOT look like an aircraft.
function createSatelliteImage(): ImageData {
  const canvas =
    document.createElement('canvas');

  canvas.width = 128;
  canvas.height = 112;

  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);

  ctx.translate(64, 56);

  ctx.shadowColor =
    'rgba(46,244,255,1)';
  ctx.shadowBlur = 11;

  // Central bus.
  ctx.fillStyle = '#0fd8e7';
  ctx.strokeStyle = '#ddfdff';
  ctx.lineWidth = 2.2;

  ctx.fillRect(-13, -14, 26, 28);
  ctx.strokeRect(-13, -14, 26, 28);

  // Large solar panels.
  ctx.fillStyle = '#64eff7';

  ctx.fillRect(-54, -16, 32, 32);
  ctx.fillRect(22, -16, 32, 32);

  ctx.strokeStyle = '#d9fdff';
  ctx.lineWidth = 1.4;

  ctx.strokeRect(-54, -16, 32, 32);
  ctx.strokeRect(22, -16, 32, 32);

  // Panel grid.
  ctx.strokeStyle =
    'rgba(6,70,94,0.86)';

  for (
    const x of [-46, -38, -30, 30, 38, 46]
  ) {
    ctx.beginPath();
    ctx.moveTo(x, -15);
    ctx.lineTo(x, 15);
    ctx.stroke();
  }

  for (const y of [-5, 5]) {
    ctx.beginPath();
    ctx.moveTo(-53, y);
    ctx.lineTo(-23, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(23, y);
    ctx.lineTo(53, y);
    ctx.stroke();
  }

  // Antenna.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(0, -30);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -34, 5, 0, Math.PI * 2);
  ctx.stroke();

  return imageDataFromCanvas(canvas);
}

function ensureImages(map: MlMap): void {
  const images: Array<
    [string, ImageData, Record<string, unknown>]
  > = [
    [
      'amoh-v11-aircraft',
      createAircraftImage(),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v11-aircraft-glow',
      createGlow(
        '225,253,255',
        0.60,
      ),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v11-satellite',
      createSatelliteImage(),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v11-satellite-glow',
      createGlow(
        '48,242,255',
        0.72,
      ),
      { pixelRatio: 2 },
    ],
  ];

  for (const [name, image, metadata] of images) {
    if (map.hasImage(name)) continue;

    try {
      map.addImage(
        name,
        image,
        metadata as never,
      );
    } catch {
      // retry after style settles
    }
  }
}

function aircraftAltitude(): unknown {
  return [
    'case',
    ['has', 'altitude_ft'],
    ['*', ['to-number', ['get', 'altitude_ft'], 0], 0.3048],
    ['has', 'geo_altitude'],
    ['to-number', ['get', 'geo_altitude'], 0],
    ['has', 'baro_altitude'],
    ['to-number', ['get', 'baro_altitude'], 0],
    ['has', 'altitude_m'],
    ['to-number', ['get', 'altitude_m'], 0],
    ['has', 'height_m'],
    ['to-number', ['get', 'height_m'], 0],
    0,
  ];
}

function satelliteAltitude(): unknown {
  return [
    'case',
    ['has', 'altitude_m'],
    ['to-number', ['get', 'altitude_m'], 0],
    ['has', 'height_m'],
    ['to-number', ['get', 'height_m'], 0],
    ['has', 'orbital_altitude_m'],
    ['to-number', ['get', 'orbital_altitude_m'], 0],
    ['has', 'altitude_km'],
    ['*', ['to-number', ['get', 'altitude_km'], 0], 1000],
    ['has', 'alt_km'],
    ['*', ['to-number', ['get', 'alt_km'], 0], 1000],
    ['has', 'height_km'],
    ['*', ['to-number', ['get', 'height_km'], 0], 1000],
    ['has', 'orbital_altitude_km'],
    ['*', ['to-number', ['get', 'orbital_altitude_km'], 0], 1000],
    0,
  ];
}

function ensureSources(map: MlMap): void {
  if (!map.getSource(AIR_SOURCE)) {
    try {
      map.addSource(
        AIR_SOURCE,
        {
          type: 'geojson',
          data: emptyFeatureCollection(),
        } as never,
      );
    } catch {
      // style transition
    }
  }

  if (!map.getSource(SAT_SOURCE)) {
    try {
      map.addSource(
        SAT_SOURCE,
        {
          type: 'geojson',
          data: emptyFeatureCollection(),
        } as never,
      );
    } catch {
      // style transition
    }
  }
}

function ensureHeroLayers(map: MlMap): void {
  ensureImages(map);
  ensureSources(map);

  if (
    map.getSource(AIR_SOURCE) &&
    map.hasImage('amoh-v11-aircraft-glow') &&
    !map.getLayer(IDS.airGlow)
  ) {
    try {
      map.addLayer({
        id: IDS.airGlow,
        type: 'symbol',
        source: AIR_SOURCE,
        minzoom: 0,
        layout: {
          'symbol-placement': 'point',
          'symbol-height-offset':
            aircraftAltitude() as never,
          'icon-image':
            'amoh-v11-aircraft-glow',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.72,
            1.5, 0.90,
            3, 1.08,
            6, 1.26,
          ],
          'icon-rotation-alignment':
            'viewport',
          'icon-pitch-alignment':
            'viewport',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 0.86,
        },
      } as never);
    } catch {
      // retry
    }
  }

  if (
    map.getSource(AIR_SOURCE) &&
    map.hasImage('amoh-v11-aircraft') &&
    !map.getLayer(IDS.airHero)
  ) {
    try {
      map.addLayer({
        id: IDS.airHero,
        type: 'symbol',
        source: AIR_SOURCE,
        minzoom: 0,
        layout: {
          'symbol-placement': 'point',
          'symbol-height-offset':
            aircraftAltitude() as never,
          'icon-image':
            'amoh-v11-aircraft',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.96,
            1.5, 1.14,
            3, 1.32,
            6, 1.52,
          ],
          'icon-rotate': [
            'coalesce',
            ['get', 'true_track'],
            ['get', 'track'],
            ['get', 'heading'],
            ['get', 'course'],
            0,
          ],
          'icon-rotation-alignment': 'map',
          'icon-pitch-alignment':
            'viewport',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 1,
        },
      } as never);
    } catch {
      // retry
    }
  }

  if (
    map.getSource(SAT_SOURCE) &&
    map.hasImage('amoh-v11-satellite-glow') &&
    !map.getLayer(IDS.satGlow)
  ) {
    try {
      map.addLayer({
        id: IDS.satGlow,
        type: 'symbol',
        source: SAT_SOURCE,
        minzoom: 0,
        layout: {
          'symbol-placement': 'point',
          'symbol-height-offset':
            satelliteAltitude() as never,
          'icon-image':
            'amoh-v11-satellite-glow',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.78,
            1.5, 0.96,
            3, 1.14,
            6, 1.34,
          ],
          'icon-rotation-alignment':
            'viewport',
          'icon-pitch-alignment':
            'viewport',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 0.91,
        },
      } as never);
    } catch {
      // retry
    }
  }

  if (
    map.getSource(SAT_SOURCE) &&
    map.hasImage('amoh-v11-satellite') &&
    !map.getLayer(IDS.satHero)
  ) {
    try {
      map.addLayer({
        id: IDS.satHero,
        type: 'symbol',
        source: SAT_SOURCE,
        minzoom: 0,
        layout: {
          'symbol-placement': 'point',
          'symbol-height-offset':
            satelliteAltitude() as never,
          'icon-image':
            'amoh-v11-satellite',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1.04,
            1.5, 1.24,
            3, 1.44,
            6, 1.66,
          ],
          'icon-rotation-alignment':
            'viewport',
          'icon-pitch-alignment':
            'viewport',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 1,
        },
      } as never);
    } catch {
      // retry
    }
  }
}

async function fetchJson(
  candidates: string[],
): Promise<any | null> {
  for (const url of candidates) {
    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(
        () => controller.abort(),
        6500,
      );

    try {
      const response =
        await fetch(
          url,
          {
            signal:
              controller.signal,
            cache:
              'no-store',
          },
        );

      if (!response.ok) continue;

      return await response.json();
    } catch {
      // try next endpoint
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return null;
}

function validFeatureCollection(
  value: any,
): value is GeoJSON.FeatureCollection {
  return (
    value?.type === 'FeatureCollection' &&
    Array.isArray(value.features)
  );
}

function featureCollectionFromCanonical(
  map: MlMap,
  sourceId: string,
): GeoJSON.FeatureCollection | null {
  if (!map.getSource(sourceId)) return null;

  try {
    const features =
      map.querySourceFeatures(
        sourceId,
      ) as unknown as GeoJSON.Feature[];

    if (!features.length) return null;

    const seen = new Set<string>();
    const clean: GeoJSON.Feature[] = [];

    for (const feature of features) {
      const geometry =
        feature.geometry as any;

      if (
        geometry?.type !== 'Point' ||
        !Array.isArray(
          geometry.coordinates,
        )
      ) {
        continue;
      }

      const id =
        String(
          feature.id ??
          (feature.properties as any)?.id ??
          (feature.properties as any)?.norad_id ??
          (feature.properties as any)?.icao24 ??
          '',
        );

      const key =
        `${id}:${geometry.coordinates[0]}:${geometry.coordinates[1]}`;

      if (seen.has(key)) continue;
      seen.add(key);

      clean.push(feature);
    }

    if (!clean.length) return null;

    return {
      type: 'FeatureCollection',
      features: clean,
    };
  } catch {
    return null;
  }
}

function setGeoJsonSource(
  map: MlMap,
  sourceId: string,
  data: GeoJSON.FeatureCollection,
): void {
  const source =
    map.getSource(
      sourceId,
    ) as GeoJSONSource | undefined;

  if (!source) return;

  try {
    source.setData(data as never);
  } catch {
    // style may be mid transition
  }
}

type LiveState = {
  aircraftCount: number;
  satelliteCount: number;
  aircraftLastOk: number;
  satelliteLastOk: number;
};

async function refreshLiveCraft(
  map: MlMap,
  state: LiveState,
): Promise<void> {
  if (!isImmersive(map)) return;

  ensureSources(map);

  const [airJson, satJson] =
    await Promise.all([
      fetchJson([
        '/api/aviation/flights',
        'http://127.0.0.1:8000/api/aviation/flights',
      ]),
      fetchJson([
        '/api/satellites/current',
        'http://127.0.0.1:8000/api/satellites/current',
      ]),
    ]);

  let airData =
    validFeatureCollection(airJson)
      ? airJson
      : null;

  let satData =
    validFeatureCollection(satJson)
      ? satJson
      : null;

  // If the API fetch is temporarily unavailable, copy the app's canonical live source.
  airData ??=
    featureCollectionFromCanonical(
      map,
      'polar_aircraft',
    );

  satData ??=
    featureCollectionFromCanonical(
      map,
      'polar_satellites_points',
    );

  if (
    airData &&
    airData.features.length
  ) {
    setGeoJsonSource(
      map,
      AIR_SOURCE,
      airData,
    );

    state.aircraftCount =
      airData.features.length;

    state.aircraftLastOk =
      Date.now();
  }

  if (
    satData &&
    satData.features.length
  ) {
    setGeoJsonSource(
      map,
      SAT_SOURCE,
      satData,
    );

    state.satelliteCount =
      satData.features.length;

    state.satelliteLastOk =
      Date.now();
  }
}

function sourceIdOf(layer: unknown): string {
  try {
    const source =
      (layer as { source?: unknown })?.source;

    return typeof source === 'string'
      ? source
      : '';
  } catch {
    return '';
  }
}

function featureProperties(
  map: MlMap,
  sourceId: string,
): Record<string, unknown>[] {
  if (!sourceId) return [];

  try {
    return (
      map
        .querySourceFeatures(sourceId)
        .slice(0, 16)
        .map(
          (f) =>
            (
              f.properties ??
              {}
            ) as Record<string, unknown>,
        )
    );
  } catch {
    return [];
  }
}

function classifyProperties(
  propsList: Record<string, unknown>[],
): SourceClass {
  let aircraft = 0;
  let satellite = 0;

  for (const props of propsList) {
    const keys =
      new Set(
        Object.keys(props)
          .map((k) =>
            k.toLowerCase(),
          ),
      );

    for (const key of [
      'icao24',
      'callsign',
      'true_track',
      'squawk',
      'baro_altitude',
      'geo_altitude',
      'vertical_rate',
      'altitude_ft',
    ]) {
      if (keys.has(key)) aircraft += 1;
    }

    for (const key of [
      'norad',
      'norad_id',
      'tle',
      'inclination',
      'period_min',
      'satellite',
      'object_name',
      'orbital_altitude_km',
      'altitude_km',
    ]) {
      if (keys.has(key)) satellite += 1;
    }

    const altitudeKm =
      Number(
        props.altitude_km ??
        props.orbital_altitude_km,
      );

    if (
      Number.isFinite(altitudeKm) &&
      altitudeKm > 80
    ) {
      satellite += 2;
    }
  }

  if (
    aircraft >= 2 &&
    aircraft > satellite
  ) {
    return 'aircraft';
  }

  if (
    satellite >= 2 &&
    satellite >= aircraft
  ) {
    return 'satellite';
  }

  return 'other';
}

// This is the key anti-confusion pass.
// It removes native purple dots / yellow pins even if the layer IDs are generic.
function suppressCompetingCraft(
  map: MlMap,
): void {
  const sourceClassCache =
    new Map<string, SourceClass>();

  for (const layer of map.getStyle()?.layers ?? []) {
    if (
      layer.id.startsWith(V11_PREFIX)
    ) {
      continue;
    }

    if (
      layer.type !== 'circle' &&
      layer.type !== 'symbol'
    ) {
      continue;
    }

    const source =
      sourceIdOf(layer);

    if (
      RUNTIME_POINT_RE.test(source) ||
      RUNTIME_HEAT_RE.test(source)
    ) {
      continue;
    }

    const combined =
      `${layer.id} ${source}`.toLowerCase();

    let craft: SourceClass = 'other';

    if (
      /polar_aircraft|aviation|aircraft|flights/.test(
        combined,
      )
    ) {
      craft = 'aircraft';
    } else if (
      /polar_satellites|satellite|satélites|sgp4|norad/.test(
        combined,
      )
    ) {
      craft = 'satellite';
    } else if (source) {
      craft =
        sourceClassCache.get(source) ??
        classifyProperties(
          featureProperties(
            map,
            source,
          ),
        );

      sourceClassCache.set(
        source,
        craft,
      );
    }

    if (craft === 'other') continue;

    try {
      map.setLayoutProperty(
        layer.id,
        'visibility',
        'none',
      );
    } catch {
      // fall back to paint
    }

    if (layer.type === 'circle') {
      try {
        map.setPaintProperty(
          layer.id,
          'circle-opacity',
          0,
        );
      } catch {}

      try {
        map.setPaintProperty(
          layer.id,
          'circle-stroke-opacity',
          0,
        );
      } catch {}
    }

    if (layer.type === 'symbol') {
      try {
        map.setPaintProperty(
          layer.id,
          'icon-opacity',
          0,
        );
      } catch {}

      try {
        map.setPaintProperty(
          layer.id,
          'text-opacity',
          0,
        );
      } catch {}
    }
  }

  // V9 hero layers are now replaced by the visually distinct V11 heroes.
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!OLD_HERO_RE.test(layer.id)) continue;

    try {
      map.setLayoutProperty(
        layer.id,
        'visibility',
        'none',
      );
    } catch {}
  }
}

function promoteV11Heroes(map: MlMap): void {
  for (const id of [
    IDS.airGlow,
    IDS.satGlow,
    IDS.airHero,
    IDS.satHero,
  ]) {
    if (!map.getLayer(id)) continue;

    try {
      map.moveLayer(id);
    } catch {
      // style transition
    }
  }
}

function layerVisible(
  map: MlMap,
  layerId: string,
): boolean {
  try {
    return (
      map.getLayoutProperty(
        layerId,
        'visibility',
      ) !== 'none'
    );
  } catch {
    return true;
  }
}

function featurePoint(
  feature: any,
): [number, number] | null {
  const geometry =
    feature?.geometry;

  if (
    geometry?.type !== 'Point' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length < 2
  ) {
    return null;
  }

  const lng =
    Number(geometry.coordinates[0]);
  const lat =
    Number(geometry.coordinates[1]);

  if (
    !Number.isFinite(lng) ||
    !Number.isFinite(lat)
  ) {
    return null;
  }

  return [lng, lat];
}

function heatWeight(
  properties: Record<string, unknown> | undefined,
): number {
  if (!properties) return 0.18;

  for (const key of [
    '_amoh_weight_norm',
    'weight_norm',
    'weight',
    'density',
    'intensity',
    'value',
    'score',
    'hours',
  ]) {
    const value =
      Number(properties[key]);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      continue;
    }

    if (value <= 1) {
      return Math.max(
        0.04,
        Math.min(1, value),
      );
    }

    return Math.max(
      0.04,
      Math.min(
        1,
        Math.log10(value + 1) / 4,
      ),
    );
  }

  return 0.18;
}

function readLayerHeat(
  map: MlMap,
  layerId: string,
): HeatPoint[] {
  const layer =
    map.getLayer(layerId) as any;

  const source =
    typeof layer?.source === 'string'
      ? layer.source
      : '';

  if (!source) return [];

  let features: any[] = [];

  try {
    features =
      map.querySourceFeatures(
        source,
      ) as any[];
  } catch {
    return [];
  }

  const out: HeatPoint[] = [];
  const seen = new Set<string>();

  for (const feature of features) {
    const point =
      featurePoint(feature);

    if (!point) continue;

    const weight =
      heatWeight(
        feature.properties as
          | Record<string, unknown>
          | undefined,
      );

    const id =
      String(
        feature.id ??
        feature.properties?.id ??
        '',
      );

    const key =
      `${id}:${point[0].toFixed(5)}:${point[1].toFixed(5)}`;

    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      lng: point[0],
      lat: point[1],
      weight,
      sourceLayer: layerId,
    });
  }

  return out;
}

function heatSignature(
  points: HeatPoint[],
): string {
  if (!points.length) return '0';

  const sample =
    points
      .slice(0, 12)
      .map(
        (p) =>
          `${p.lng.toFixed(3)},${p.lat.toFixed(3)},${p.weight.toFixed(2)}`,
      )
      .join('|');

  return `${points.length}:${sample}`;
}

function activeHeatLayerIds(
  map: MlMap,
): string[] {
  const ids: string[] = [];

  for (const layer of map.getStyle()?.layers ?? []) {
    if (
      layer.type !== 'heatmap' ||
      !RUNTIME_HEAT_RE.test(layer.id) ||
      !layerVisible(map, layer.id)
    ) {
      continue;
    }

    ids.push(layer.id);
  }

  return ids.sort();
}

function cachedHeatPoints(
  map: MlMap,
  cache: Map<string, CachedHeat>,
): {
  points: HeatPoint[];
  activeIds: string[];
  liveNonEmpty: boolean;
} {
  const now = Date.now();

  const activeIds =
    activeHeatLayerIds(map);

  const activeSet =
    new Set(activeIds);

  // A truly toggled-off layer is removed immediately.
  for (const id of [...cache.keys()]) {
    if (!activeSet.has(id)) {
      cache.delete(id);
    }
  }

  let liveNonEmpty = false;

  for (const id of activeIds) {
    const fresh =
      readLayerHeat(
        map,
        id,
      );

    if (fresh.length) {
      liveNonEmpty = true;

      cache.set(
        id,
        {
          points: fresh,
          lastNonEmptyAt: now,
          signature:
            heatSignature(fresh),
        },
      );

      continue;
    }

    // Source reads can transiently return zero during style/data cycles.
    // Keep the last non-empty frame rather than flashing the heat layer off.
    const previous =
      cache.get(id);

    if (
      previous &&
      now - previous.lastNonEmptyAt <=
        HEAT_CACHE_GRACE_MS
    ) {
      continue;
    }

    cache.delete(id);
  }

  return {
    points:
      activeIds.flatMap(
        (id) =>
          cache.get(id)?.points ??
          [],
      ),
    activeIds,
    liveNonEmpty,
  };
}

function heatOpacity(
  activeCount: number,
): number {
  if (activeCount <= 1) return 0.88;
  if (activeCount === 2) return 0.66;
  if (activeCount === 3) return 0.51;
  if (activeCount === 4) return 0.43;
  return 0.35;
}

function hottest(
  points: HeatPoint[],
): HeatPoint[] {
  if (points.length <= 80) {
    return points.filter(
      (p) => p.weight >= 0.62,
    );
  }

  return [...points]
    .sort(
      (a, b) =>
        b.weight - a.weight,
    )
    .slice(
      0,
      Math.min(
        260,
        Math.max(
          50,
          Math.round(
            points.length * 0.08,
          ),
        ),
      ),
    );
}

function makeDeckLayers(
  points: HeatPoint[],
  activeCount: number,
): unknown[] {
  if (!points.length) return [];

  const peak =
    hottest(points);

  return [
    new HeatmapLayer<HeatPoint>({
      id: 'amoh-v11-stable-heat',
      data: points,
      getPosition: (d) => [
        d.lng,
        d.lat,
      ],
      getWeight: (d) =>
        d.weight,
      radiusPixels: 23,
      intensity:
        activeCount <= 1
          ? 1.04
          : 0.88,
      threshold: 0.030,
      aggregation: 'SUM',
      opacity:
        heatOpacity(activeCount),
      colorRange: [
        [0, 155, 255, 0],
        [0, 218, 255, 62],
        [0, 237, 180, 122],
        [157, 244, 78, 172],
        [244, 236, 65, 207],
        [255, 165, 43, 232],
        [255, 74, 32, 250],
        [255, 25, 28, 255],
      ],
      parameters: {
        depthTest: false,
      } as never, // clave WebGL heredada; equivalente deck.gl 9: depthCompare: 'always'
    }),
    new ScatterplotLayer<HeatPoint>({
      id: 'amoh-v11-heat-peaks',
      data: peak,
      getPosition: (d) => [
        d.lng,
        d.lat,
      ],
      getRadius: (d) =>
        850 +
        d.weight * 2450,
      radiusUnits: 'meters',
      radiusMinPixels: 0.4,
      radiusMaxPixels: 1.9,
      getFillColor: (d) =>
        d.weight >= 0.82
          ? [255, 91, 34, 166]
          : [42, 224, 242, 96],
      opacity:
        activeCount <= 1
          ? 0.68
          : 0.42,
      stroked: false,
      pickable: false,
      parameters: {
        depthTest: false,
      } as never, // clave WebGL heredada; equivalente deck.gl 9: depthCompare: 'always'
    }),
  ];
}

function nativeHeatOpacity(
  map: MlMap,
  opacity: number,
): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (
      layer.type === 'heatmap' &&
      RUNTIME_HEAT_RE.test(layer.id)
    ) {
      try {
        map.setPaintProperty(
          layer.id,
          'heatmap-opacity',
          opacity,
        );
      } catch {}
    }
  }
}

function combinedHeatSignature(
  ids: string[],
  points: HeatPoint[],
): string {
  return [
    ids.join(','),
    heatSignature(points),
  ].join('::');
}

function adaptiveCamera(
  map: MlMap,
): {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
} {
  const container =
    map.getContainer();

  const width =
    container.clientWidth ||
    window.innerWidth;

  const height =
    container.clientHeight ||
    window.innerHeight;

  let zoom = 1.92;

  if (height < 760) {
    zoom = 1.72;
  } else if (height < 880) {
    zoom = 1.84;
  } else if (height > 1080) {
    zoom = 2.04;
  }

  if (width < 1500) {
    zoom -= 0.06;
  }

  return {
    // Slightly rotates/recenters South America toward the upper-left,
    // closer to the supplied target reference.
    center: [-38, -85.6],
    zoom,
    pitch: 0,
    bearing: -10,
  };
}

function applyCameraOnce(
  map: MlMap,
): void {
  const target =
    adaptiveCamera(map);

  try {
    map.easeTo({
      ...target,
      duration: 850,
      essential: true,
    });
  } catch {
    // non-fatal
  }
}

function immersiveCleanup(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!QUANTARCTICA_RE.test(layer.id)) continue;

    if (layer.type === 'symbol') {
      try {
        map.setLayoutProperty(
          layer.id,
          'visibility',
          'none',
        );
      } catch {}
    }

    if (layer.type === 'fill') {
      try {
        map.setPaintProperty(
          layer.id,
          'fill-opacity',
          0.018,
        );
      } catch {}
    }

    if (layer.type === 'line') {
      const coast =
        /coast/i.test(layer.id);

      try {
        map.setPaintProperty(
          layer.id,
          'line-opacity',
          coast ? 0.25 : 0.05,
        );
      } catch {}
    }
  }
}

function diagnostics(
  map: MlMap,
  state: LiveState,
  heatIds: string[],
  heatPointCount: number,
  heatPhase: string,
): void {
  (window as any).__amohLogicV11 = {
    version: '11.0',
    projection: (() => {
      try {
        return map.getProjection?.()?.type ?? null;
      } catch {
        return null;
      }
    })(),
    camera: {
      center:
        map.getCenter().toArray(),
      zoom:
        map.getZoom(),
      pitch:
        map.getPitch(),
      bearing:
        map.getBearing(),
    },
    aviation: {
      autoActive: true,
      count:
        state.aircraftCount,
      lastOk:
        state.aircraftLastOk,
    },
    satellites: {
      autoActive: true,
      count:
        state.satelliteCount,
      lastOk:
        state.satelliteLastOk,
    },
    heat: {
      phase: heatPhase,
      activeLayers: heatIds,
      pointCount: heatPointCount,
    },
    heroes: {
      aircraft:
        Boolean(
          map.getLayer(
            IDS.airHero,
          ),
        ),
      satellite:
        Boolean(
          map.getLayer(
            IDS.satHero,
          ),
        ),
    },
  };
}

export function installSmartCinematicRuntimeV11(
  map: MlMap,
): Controller {
  const existing =
    controllers.get(map);

  if (existing) return existing;

  // Keep V9's own native heat renderer from fighting the V11 deck handoff.
  (window as any).__amohV10DeckHeatEnabled = true;
  (window as any).__amohV11SmartHeatEnabled = true;

  const overlay =
    new MapLibreOverlay({
      interleaved: true,
      layers: [],
    });

  try {
    map.addControl(
      overlay as never,
    );
  } catch {
    // If interleaved mode cannot attach, retry overlaid.
    try {
      const fallback =
        new MapLibreOverlay({
          interleaved: false,
          layers: [],
        });

      map.addControl(
        fallback as never,
      );

      // The outer overlay remains unused, but the app remains functional.
      (overlay as any).__amohFallback = fallback;
    } catch {
      // Native heat remains visible until deck succeeds.
    }
  }

  const heatCache =
    new Map<string, CachedHeat>();

  const liveState: LiveState = {
    aircraftCount: 0,
    satelliteCount: 0,
    aircraftLastOk: 0,
    satelliteLastOk: 0,
  };

  let destroyed = false;
  let refreshTimer = 0;
  let liveTimer = 0;
  let refreshInterval = 0;

  let wasImmersive = false;
  let warmStreak = 0;
  let deckOwnsHeat = false;

  let lastDeckSignature = '';
  let lastActiveHeatSignature = '';

  const actualOverlay = (): any =>
    (overlay as any).__amohFallback ??
    overlay;

  const refreshHeat = (): {
    ids: string[];
    count: number;
    phase: string;
  } => {
    const result =
      cachedHeatPoints(
        map,
        heatCache,
      );

    const activeSignature =
      result.activeIds.join('|');

    if (
      activeSignature !==
      lastActiveHeatSignature
    ) {
      lastActiveHeatSignature =
        activeSignature;

      warmStreak = 0;
      deckOwnsHeat = false;

      // User changed active heat layers:
      // keep native heat visible during the new deck warm-up.
      nativeHeatOpacity(
        map,
        0.72,
      );
    }

    if (!result.activeIds.length) {
      heatCache.clear();
      warmStreak = 0;
      deckOwnsHeat = false;
      lastDeckSignature = '';

      try {
        actualOverlay().setProps({
          layers: [],
        });
      } catch {}

      nativeHeatOpacity(
        map,
        0.72,
      );

      return {
        ids: [],
        count: 0,
        phase: 'OFF',
      };
    }

    if (result.points.length) {
      if (result.liveNonEmpty) {
        warmStreak += 1;
      }

      const signature =
        combinedHeatSignature(
          result.activeIds,
          result.points,
        );

      // Do not rebuild deck layers on every 420 ms tick.
      // Rebuild only when the actual data/layer selection changes.
      if (
        signature !==
        lastDeckSignature
      ) {
        lastDeckSignature =
          signature;

        try {
          actualOverlay().setProps({
            layers:
              makeDeckLayers(
                result.points,
                result.activeIds.length,
              ) as never[],
          });
        } catch {}
      }

      if (
        warmStreak >= 2 ||
        deckOwnsHeat
      ) {
        deckOwnsHeat = true;

        nativeHeatOpacity(
          map,
          0.025,
        );

        return {
          ids: result.activeIds,
          count: result.points.length,
          phase: 'DECK_STABLE',
        };
      }

      // Handoff phase: deck is already drawing, but native heat remains behind it
      // until two consecutive valid reads confirm stability.
      nativeHeatOpacity(
        map,
        0.54,
      );

      return {
        ids: result.activeIds,
        count: result.points.length,
        phase: 'WARMING',
      };
    }

    // Transient empty result: do NOT clear the deck immediately.
    // If cache exists, cachedHeatPoints already retained it.
    nativeHeatOpacity(
      map,
      deckOwnsHeat ? 0.025 : 0.72,
    );

    return {
      ids: result.activeIds,
      count: 0,
      phase:
        deckOwnsHeat
          ? 'CACHE_GRACE'
          : 'WAITING_DATA',
    };
  };

  const refresh = (): void => {
    if (destroyed) return;
    if (!map.isStyleLoaded()) return;

    const immersive =
      isImmersive(map);

    if (
      immersive &&
      !wasImmersive
    ) {
      // Entering GLOBE/SAT: auto activate live aircraft/satellite feeds immediately.
      window.setTimeout(
        () => {
          if (!destroyed) {
            applyCameraOnce(map);
          }
        },
        120,
      );

      void refreshLiveCraft(
        map,
        liveState,
      );
    }

    wasImmersive = immersive;

    if (!immersive) {
      // 2D keeps native scientific layers and does not run hero overlays.
      for (const id of Object.values(IDS)) {
        if (!map.getLayer(id)) continue;

        try {
          map.setLayoutProperty(
            id,
            'visibility',
            'none',
          );
        } catch {}
      }

      nativeHeatOpacity(
        map,
        0.72,
      );

      try {
        actualOverlay().setProps({
          layers: [],
        });
      } catch {}

      diagnostics(
        map,
        liveState,
        [],
        0,
        'MAP_2D',
      );

      return;
    }

    ensureHeroLayers(map);

    for (const id of Object.values(IDS)) {
      if (!map.getLayer(id)) continue;

      try {
        map.setLayoutProperty(
          id,
          'visibility',
          'visible',
        );
      } catch {}
    }

    suppressCompetingCraft(map);
    immersiveCleanup(map);

    const heat =
      refreshHeat();

    promoteV11Heroes(map);

    diagnostics(
      map,
      liveState,
      heat.ids,
      heat.count,
      heat.phase,
    );
  };

  const schedule = (): void => {
    if (destroyed) return;

    window.clearTimeout(
      refreshTimer,
    );

    refreshTimer =
      window.setTimeout(
        refresh,
        45,
      );
  };

  const liveLoop = (): void => {
    if (destroyed) return;

    void refreshLiveCraft(
      map,
      liveState,
    ).finally(() => {
      if (!destroyed) {
        liveTimer =
          window.setTimeout(
            liveLoop,
            LIVE_REFRESH_MS,
          );
      }
    });
  };

  map.on('styledata', schedule);
  map.on('idle', schedule);
  map.on('moveend', schedule);
  map.on('zoomend', schedule);

  refreshInterval =
    window.setInterval(
      refresh,
      UI_REFRESH_MS,
    );

  liveTimer =
    window.setTimeout(
      liveLoop,
      400,
    );

  schedule();

  const controller: Controller = {
    refresh,
    destroy: () => {
      if (destroyed) return;

      destroyed = true;

      (window as any).__amohV11SmartHeatEnabled = false;
      (window as any).__amohV10DeckHeatEnabled = false;

      window.clearTimeout(
        refreshTimer,
      );

      window.clearTimeout(
        liveTimer,
      );

      window.clearInterval(
        refreshInterval,
      );

      map.off('styledata', schedule);
      map.off('idle', schedule);
      map.off('moveend', schedule);
      map.off('zoomend', schedule);

      try {
        map.removeControl(
          actualOverlay() as never,
        );
      } catch {}

      for (const id of Object.values(IDS)) {
        if (!map.getLayer(id)) continue;

        try {
          map.removeLayer(id);
        } catch {}
      }

      for (const sourceId of [
        AIR_SOURCE,
        SAT_SOURCE,
      ]) {
        if (!map.getSource(sourceId)) continue;

        try {
          map.removeSource(sourceId);
        } catch {}
      }

      controllers.delete(map);
    },
  };

  controllers.set(
    map,
    controller,
  );

  return controller;
}
