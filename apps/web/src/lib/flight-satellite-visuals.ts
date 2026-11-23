// SPDX-License-Identifier: AGPL-3.0-or-later
// AMOH — Flight / Satellite cinematic live-object overlay.
// Visual layer only: does not change provider truth states, backend payloads, or scientific records.
// AMOH_CINEMATIC_GLOBE_VISUAL_PARITY_V7 — reference-driven hero aircraft/satellites + cleaner globe hierarchy.
// Preserves real SGP4 satellite altitude and provider truth; changes visual presentation only.

import * as maplibregl from 'maplibre-gl';
import type { Map as MlMap, MapMouseEvent } from 'maplibre-gl';

type Kind = 'aircraft' | 'satellite';
type LngLat = [number, number];

type EntityState = {
  id: string;
  kind: Kind;
  start: LngLat;
  target: LngLat;
  current: LngLat;
  startedAt: number;
  durationMs: number;
  props: Record<string, unknown>;
  trail: LngLat[];
  seenAt: number;
};

type Controller = {
  destroy: () => void;
  refresh: () => void;
};

const controllers = new WeakMap<MlMap, Controller>();

const IDS = {
  aircraftSource: 'amoh-cinematic-aircraft',
  aircraftTrailSource: 'amoh-cinematic-aircraft-trails',
  satelliteSource: 'amoh-cinematic-satellites',
  satelliteTrailSource: 'amoh-cinematic-satellite-trails',
  selectedSource: 'amoh-cinematic-selected',

  aircraftTrailGlow: 'amoh-cinematic-aircraft-trails-glow',
  aircraftTrail: 'amoh-cinematic-aircraft-trails-core',
  aircraftHalo: 'amoh-cinematic-aircraft-halo',
  aircraftGlowIcon: 'amoh-cinematic-aircraft-glow-icon',
  aircraftIcon: 'amoh-cinematic-aircraft-icon',
  aircraftLabel: 'amoh-cinematic-aircraft-label',

  satelliteTrailGlow: 'amoh-cinematic-satellite-trails-glow',
  satelliteTrail: 'amoh-cinematic-satellite-trails-core',
  satelliteHalo: 'amoh-cinematic-satellite-halo',
  satelliteGlowIcon: 'amoh-cinematic-satellite-glow-icon',
  satelliteIcon: 'amoh-cinematic-satellite-icon',
  satelliteLabel: 'amoh-cinematic-satellite-label',

  selectedGlow: 'amoh-cinematic-selected-glow',
  selectedRing: 'amoh-cinematic-selected-ring',
  selectedOrbitRing: 'amoh-cinematic-selected-orbit-ring',
} as const;

const AIRCRAFT_SOURCE_RE = /(aircraft|flight|opensky|aviation|air_traffic)/i;
const SATELLITE_SOURCE_RE = /(satellite|polar[_-]?sat|celestrak|orbit|sgp4)/i;
const OUR_SOURCE_RE = /^amoh-cinematic-/i;

const AIRCRAFT_MAX = 500;
const SATELLITE_MAX = 120;
const AIRCRAFT_TRAIL_POINTS = 36;
const SATELLITE_TRAIL_POINTS = 10;
const SAMPLE_INTERVAL_MS = 1600;
const FRAME_INTERVAL_MS = 66;
const STALE_MS = 20_000;

const EMPTY_FC: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function str(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function firstString(props: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = str(props[key]);
    if (value) return value;
  }
  return null;
}

function firstNumber(props: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = num(props[key]);
    if (value != null) return value;
  }
  return null;
}

function normalizeLon(lon: number): number {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

function shortestLonDelta(from: number, to: number): number {
  let delta = to - from;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

function lerpLngLat(a: LngLat, b: LngLat, t: number): LngLat {
  const eased = t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;

  return [
    normalizeLon(a[0] + shortestLonDelta(a[0], b[0]) * eased),
    a[1] + (b[1] - a[1]) * eased,
  ];
}

function distanceScore(center: maplibregl.LngLat, coord: LngLat): number {
  const dLon = shortestLonDelta(center.lng, coord[0]);
  const dLat = coord[1] - center.lat;
  return dLon * dLon + dLat * dLat;
}

function sourceIdsForKind(map: MlMap, kind: Kind): string[] {
  const style = map.getStyle();
  const sources = style?.sources ?? {};
  const layers = style?.layers ?? [];
  const regex = kind === 'aircraft' ? AIRCRAFT_SOURCE_RE : SATELLITE_SOURCE_RE;

  const out = new Set<string>();

  for (const sourceId of Object.keys(sources)) {
    if (OUR_SOURCE_RE.test(sourceId)) continue;
    if (regex.test(sourceId)) out.add(sourceId);
  }

  for (const layer of layers) {
    const source = 'source' in layer ? layer.source : undefined;
    if (typeof source !== 'string' || OUR_SOURCE_RE.test(source)) continue;
    if (regex.test(layer.id) || regex.test(source)) out.add(source);
  }

  return [...out];
}

function sourceIsVisible(map: MlMap, sourceId: string): boolean {
  const layers = map.getStyle()?.layers ?? [];
  const matching = layers.filter((layer) => 'source' in layer && layer.source === sourceId);
  if (matching.length === 0) return true;

  return matching.some((layer) => {
    try {
      return map.getLayoutProperty(layer.id, 'visibility') !== 'none';
    } catch {
      return true;
    }
  });
}

function pointCoord(feature: maplibregl.MapGeoJSONFeature): LngLat | null {
  const geometry = feature.geometry;
  if (!geometry || geometry.type !== 'Point') return null;

  const coords = geometry.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const lon = num(coords[0]);
  const lat = num(coords[1]);
  if (lon == null || lat == null) return null;
  if (lat < -90 || lat > 90) return null;

  return [normalizeLon(lon), lat];
}

function entityId(kind: Kind, feature: maplibregl.MapGeoJSONFeature): string {
  const props = (feature.properties ?? {}) as Record<string, unknown>;

  if (kind === 'aircraft') {
    return (
      firstString(props, [
        'icao24',
        'hex',
        'icao',
        'callsign',
        'registration',
        'flight',
        'id',
      ]) ??
      String(feature.id ?? `${feature.geometry.type}-${JSON.stringify(feature.geometry)}`)
    );
  }

  return (
    firstString(props, [
      'norad_id',
      'noradId',
      'norad',
      'catalog_number',
      'satellite_id',
      'name',
      'mission',
      'id',
    ]) ??
    String(feature.id ?? `${feature.geometry.type}-${JSON.stringify(feature.geometry)}`)
  );
}

function headingFromProps(props: Record<string, unknown>): number {
  return (
    firstNumber(props, ['true_track', 'track', 'heading', 'course', 'cog', 'bearing']) ??
    0
  );
}


function aircraftAltitudeMeters(props: Record<string, unknown>): number {
  const meters = firstNumber(props, [
    'geo_altitude',
    'baro_altitude',
    'altitude_m',
    'height_m',
    'altitude',
  ]);

  const feet = firstNumber(props, ['altitude_ft', 'alt_ft']);

  if (feet != null) {
    return Math.max(0, Math.min(25_000, feet * 0.3048));
  }

  if (meters != null) {
    return Math.max(0, Math.min(25_000, meters));
  }

  return 0;
}

function aircraftColor(props: Record<string, unknown>): string {
  const emergency = firstString(props, ['emergency', 'squawk', 'status']);
  if (emergency && /(emerg|7700|distress)/i.test(emergency)) return '#ff4668';

  const onGround = props.on_ground === true || props.onGround === true;
  if (onGround) return '#f5cc4a';

  const altM = firstNumber(props, [
    'baro_altitude',
    'geo_altitude',
    'altitude_m',
    'altitude',
  ]);

  const altFt = firstNumber(props, ['altitude_ft', 'alt_ft']);
  const meters = altFt != null ? altFt * 0.3048 : altM;

  if (meters == null) return '#68f59a';
  if (meters < 1500) return '#f5cc4a';
  if (meters < 5000) return '#68f59a';
  if (meters < 9000) return '#44e7ff';
  return '#d871ff';
}

function satelliteColor(props: Record<string, unknown>): string {
  const category = (
    firstString(props, ['category', 'type', 'mission_type', 'constellation']) ?? ''
  ).toLowerCase();

  if (/weather|meteor/.test(category)) return '#44e7ff';
  if (/earth|observation|sar|sentinel|landsat/.test(category)) return '#68f59a';
  if (/starlink|telecom|communication/.test(category)) return '#d871ff';
  return '#62ffc8';
}

function asAircraftFeature(state: EntityState): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: 'Feature',
    id: state.id,
    geometry: { type: 'Point', coordinates: state.current },
    properties: {
      ...state.props,
      __amoh_kind: 'aircraft',
      __amoh_id: state.id,
      __amoh_heading: headingFromProps(state.props),
      __amoh_altitude_m: aircraftAltitudeMeters(state.props),
      __amoh_color: aircraftColor(state.props),
      __amoh_label:
        firstString(state.props, ['callsign', 'flight', 'registration', 'icao24']) ??
        state.id,
    },
  };
}

function satelliteAltitudeMeters(props: Record<string, unknown>): number {
  const km = firstNumber(props, [
    'altitude_km',
    'alt_km',
    'height_km',
    'orbital_altitude_km',
    'orbit_altitude_km',
  ]);

  if (km != null) {
    return Math.max(0, Math.min(60_000_000, km * 1000));
  }

  const meters = firstNumber(props, [
    'altitude_m',
    'height_m',
    'orbital_altitude_m',
    'orbit_altitude_m',
    'altitude',
  ]);

  if (meters != null) {
    return Math.max(0, Math.min(60_000_000, meters));
  }

  return 0;
}

function asSatelliteFeature(state: EntityState): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: 'Feature',
    id: state.id,
    geometry: { type: 'Point', coordinates: state.current },
    properties: {
      ...state.props,
      __amoh_kind: 'satellite',
      __amoh_id: state.id,
      __amoh_color: satelliteColor(state.props),
      __amoh_altitude_m: satelliteAltitudeMeters(state.props),
      __amoh_altitude_km: Math.round(satelliteAltitudeMeters(state.props) / 1000),
      __amoh_elevation_mode: 'EARTH_SCALE_1_TO_1',
      __amoh_label:
        firstString(state.props, ['name', 'mission', 'satellite', 'norad_id']) ??
        state.id,
    },
  };
}

function trailFeature(state: EntityState): GeoJSON.Feature<GeoJSON.LineString> | null {
  const coords = [...state.trail, state.current];
  if (coords.length < 2) return null;

  return {
    type: 'Feature',
    id: state.id,
    geometry: { type: 'LineString', coordinates: coords },
    properties: {
      __amoh_kind: state.kind,
      __amoh_id: state.id,
      __amoh_color:
        state.kind === 'aircraft'
          ? aircraftColor(state.props)
          : satelliteColor(state.props),
    },
  };
}

function createPlaneCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, 64, 64);
  ctx.translate(32, 32);

  ctx.shadowColor = 'rgba(255,255,255,0.95)';
  ctx.shadowBlur = 7;
  ctx.fillStyle = '#ffffff';

  ctx.beginPath();
  ctx.moveTo(0, -27);
  ctx.lineTo(5, -5);
  ctx.lineTo(23, 4);
  ctx.lineTo(23, 9);
  ctx.lineTo(6, 5);
  ctx.lineTo(4, 21);
  ctx.lineTo(12, 26);
  ctx.lineTo(12, 29);
  ctx.lineTo(0, 25);
  ctx.lineTo(-12, 29);
  ctx.lineTo(-12, 26);
  ctx.lineTo(-4, 21);
  ctx.lineTo(-6, 5);
  ctx.lineTo(-23, 9);
  ctx.lineTo(-23, 4);
  ctx.lineTo(-5, -5);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

function createSatelliteCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, 64, 64);
  ctx.translate(32, 32);
  ctx.shadowColor = 'rgba(80,255,213,0.95)';
  ctx.shadowBlur = 8;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-7, -9, 14, 18);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(-13, 0);
  ctx.moveTo(7, 0);
  ctx.lineTo(13, 0);
  ctx.stroke();

  ctx.fillStyle = '#e8fdff';
  ctx.fillRect(-27, -10, 14, 20);
  ctx.fillRect(13, -10, 14, 20);

  ctx.strokeStyle = '#49cfe3';
  ctx.lineWidth = 1;
  for (const x of [-23, -18, 17, 22]) {
    ctx.beginPath();
    ctx.moveTo(x, -10);
    ctx.lineTo(x, 10);
    ctx.stroke();
  }

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -12, 7, Math.PI, 0);
  ctx.stroke();

  return canvas;
}



function createHeroGlowCanvas(
  rgb: string,
  coreAlpha = 0.42,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const cx = 80;
  const cy = 80;
  const gradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, 76);
  gradient.addColorStop(0, `rgba(${rgb},${coreAlpha})`);
  gradient.addColorStop(0.16, `rgba(${rgb},0.28)`);
  gradient.addColorStop(0.40, `rgba(${rgb},0.13)`);
  gradient.addColorStop(0.72, `rgba(${rgb},0.04)`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 160, 160);
  return canvas;
}

function createOrbitRingCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, 128, 128);
  ctx.translate(64, 64);

  const gradient = ctx.createRadialGradient(0, 0, 28, 0, 0, 58);
  gradient.addColorStop(0, 'rgba(98,255,200,0)');
  gradient.addColorStop(0.72, 'rgba(98,255,200,0.03)');
  gradient.addColorStop(0.88, 'rgba(98,255,200,0.16)');
  gradient.addColorStop(1, 'rgba(98,255,200,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(226,255,246,0.96)';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(98,255,200,0.95)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(98,255,200,0.70)';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.stroke();

  return canvas;
}

/** MapLibre 6 no acepta HTMLCanvasElement en addImage; se entrega como ImageData. */
function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function ensureImages(map: MlMap): void {
  if (!map.hasImage('amoh-cinematic-plane')) {
    try {
      map.addImage('amoh-cinematic-plane', canvasToImageData(createPlaneCanvas()), { pixelRatio: 2 });
    } catch {
      // Style may be changing; next refresh retries.
    }
  }


  if (!map.hasImage('amoh-cinematic-plane-glow')) {
    try {
      map.addImage(
        'amoh-cinematic-plane-glow',
        canvasToImageData(createHeroGlowCanvas('255,255,255', 0.40)),
        { pixelRatio: 2 },
      );
    } catch {
      // Style may be changing; next refresh retries.
    }
  }

  if (!map.hasImage('amoh-cinematic-satellite')) {
    try {
      map.addImage('amoh-cinematic-satellite', canvasToImageData(createSatelliteCanvas()), {
        pixelRatio: 2,
      });
    } catch {
      // Style may be changing; next refresh retries.
    }
  }


  if (!map.hasImage('amoh-cinematic-satellite-glow')) {
    try {
      map.addImage(
        'amoh-cinematic-satellite-glow',
        canvasToImageData(createHeroGlowCanvas('80,255,213', 0.55)),
        { pixelRatio: 2 },
      );
    } catch {
      // Style may be changing; next refresh retries.
    }
  }

  if (!map.hasImage('amoh-cinematic-orbit-ring')) {
    try {
      map.addImage('amoh-cinematic-orbit-ring', canvasToImageData(createOrbitRingCanvas()), {
        pixelRatio: 2,
      });
    } catch {
      // Style may be changing; next refresh retries.
    }
  }
}

function ensureGeoJSONSource(map: MlMap, id: string): void {
  if (map.getSource(id)) return;

  try {
    map.addSource(id, {
      type: 'geojson',
      data: EMPTY_FC,
      promoteId: '__amoh_id',
      lineMetrics: false,
    });
  } catch {
    // Style may be in transition.
  }
}

function addLayerSafe(map: MlMap, layer: maplibregl.LayerSpecification): void {
  if (map.getLayer(layer.id)) return;

  try {
    map.addLayer(layer);
  } catch {
    // Style may be changing; retry later.
  }
}


type PaintSnapshot = {
  property: string;
  value: unknown;
};

const scenePaintSnapshots = new WeakMap<MlMap, Map<string, PaintSnapshot[]>>();

function rememberPaint(
  map: MlMap,
  layerId: string,
  property: string,
): void {
  let mapSnapshots = scenePaintSnapshots.get(map);
  if (!mapSnapshots) {
    mapSnapshots = new Map();
    scenePaintSnapshots.set(map, mapSnapshots);
  }

  const existing = mapSnapshots.get(layerId) ?? [];
  if (existing.some((entry) => entry.property === property)) return;

  try {
    const value = map.getPaintProperty(layerId, property as never);
    existing.push({ property, value });
    mapSnapshots.set(layerId, existing);
  } catch {
    // Layer/property may not support this paint property.
  }
}

function setPaintQuiet(
  map: MlMap,
  layerId: string,
  property: string,
  value: unknown,
): void {
  rememberPaint(map, layerId, property);
  try {
    map.setPaintProperty(layerId, property as never, value as never);
  } catch {
    // Ignore incompatible layer paint properties.
  }
}

function nativeSatelliteSceneActive(map: MlMap): boolean {
  const layers = map.getStyle()?.layers ?? [];

  return layers.some((layer) => {
    if (OUR_SOURCE_RE.test(layer.id)) return false;

    const source =
      'source' in layer && typeof layer.source === 'string'
        ? layer.source
        : '';

    const isSatellite =
      SATELLITE_SOURCE_RE.test(layer.id) ||
      (source !== '' && SATELLITE_SOURCE_RE.test(source));

    if (!isSatellite) return false;
    if (layer.id === 'satellite-layer' || /imagery|basemap/i.test(layer.id)) {
      return false;
    }

    try {
      return map.getLayoutProperty(layer.id, 'visibility') !== 'none';
    } catch {
      return true;
    }
  });
}

function restoreSceneDeclutter(map: MlMap): void {
  const snapshots = scenePaintSnapshots.get(map);
  if (!snapshots) return;

  for (const [layerId, entries] of snapshots) {
    if (!map.getLayer(layerId)) continue;

    for (const entry of entries) {
      try {
        map.setPaintProperty(
          layerId,
          entry.property as never,
          entry.value as never,
        );
      } catch {
        // Ignore layers removed during style transitions.
      }
    }
  }

  snapshots.clear();
}


function nativeAircraftSceneActive(map: MlMap): boolean {
  const layers = map.getStyle()?.layers ?? [];

  return layers.some((layer) => {
    if (OUR_SOURCE_RE.test(layer.id)) return false;

    const source =
      'source' in layer && typeof layer.source === 'string'
        ? layer.source
        : '';

    const isAircraft =
      AIRCRAFT_SOURCE_RE.test(layer.id) ||
      (source !== '' && AIRCRAFT_SOURCE_RE.test(source));

    if (!isAircraft) return false;

    try {
      return map.getLayoutProperty(layer.id, 'visibility') !== 'none';
    } catch {
      return true;
    }
  });
}

function applyNativeAircraftDeclutter(map: MlMap): void {
  if (!nativeAircraftSceneActive(map)) return;

  const layers = map.getStyle()?.layers ?? [];

  for (const layer of layers) {
    if (OUR_SOURCE_RE.test(layer.id)) continue;

    const source =
      'source' in layer && typeof layer.source === 'string'
        ? layer.source
        : '';

    const isAircraft =
      AIRCRAFT_SOURCE_RE.test(layer.id) ||
      (source !== '' && AIRCRAFT_SOURCE_RE.test(source));

    if (!isAircraft) continue;

    if (layer.type === 'symbol') {
      setPaintQuiet(map, layer.id, 'icon-opacity', 0);
      setPaintQuiet(map, layer.id, 'text-opacity', 0);
      continue;
    }

    if (layer.type === 'circle') {
      setPaintQuiet(map, layer.id, 'circle-opacity', 0);
      setPaintQuiet(map, layer.id, 'circle-stroke-opacity', 0);
      continue;
    }

    if (layer.type === 'line') {
      setPaintQuiet(map, layer.id, 'line-opacity', 0.10);
      setPaintQuiet(map, layer.id, 'line-width', 0.65);
    }
  }
}

function applyGoogleEarthSceneDeclutter(map: MlMap): void {
  // AMOH_GOOGLE_EARTH_SCENE_DECLUTTER_V5
  if (!nativeSatelliteSceneActive(map)) {
    restoreSceneDeclutter(map);
    return;
  }

  const layers = map.getStyle()?.layers ?? [];

  for (const layer of layers) {
    if (OUR_SOURCE_RE.test(layer.id)) continue;

    const source =
      'source' in layer && typeof layer.source === 'string'
        ? layer.source
        : '';

    const isNativeSatellite =
      SATELLITE_SOURCE_RE.test(layer.id) ||
      (source !== '' && SATELLITE_SOURCE_RE.test(source));

    // Preserve photographic imagery.
    if (layer.id === 'satellite-layer' || /imagery|basemap/i.test(layer.id)) {
      continue;
    }

    if (isNativeSatellite) {
      if (layer.type === 'symbol') {
        setPaintQuiet(map, layer.id, 'icon-opacity', 0);
        setPaintQuiet(map, layer.id, 'text-opacity', 0);
        continue;
      }

      if (layer.type === 'circle') {
        setPaintQuiet(map, layer.id, 'circle-opacity', 0);
        setPaintQuiet(map, layer.id, 'circle-stroke-opacity', 0);
        continue;
      }

      if (layer.type === 'line') {
        setPaintQuiet(map, layer.id, 'line-opacity', 0.035);
        setPaintQuiet(map, layer.id, 'line-width', 0.55);
        continue;
      }
    }

    // Google-Earth-like cleanup for geographic labels only.
    if (
      layer.type === 'symbol' &&
      /(place|country|continent|ocean|marine|sea|settlement|admin|road|poi|label)/i.test(layer.id)
    ) {
      setPaintQuiet(map, layer.id, 'text-opacity', 0.11);
      setPaintQuiet(map, layer.id, 'icon-opacity', 0.08);
    }

    if (
      layer.type === 'line' &&
      /(boundary|admin|road|coastline-label)/i.test(layer.id)
    ) {
      setPaintQuiet(map, layer.id, 'line-opacity', 0.14);
    }
  }
}

function ensureLayers(map: MlMap): void {
  if (!map.isStyleLoaded()) return;

  ensureImages(map);
  ensureGeoJSONSource(map, IDS.aircraftSource);
  ensureGeoJSONSource(map, IDS.aircraftTrailSource);
  ensureGeoJSONSource(map, IDS.satelliteSource);
  ensureGeoJSONSource(map, IDS.satelliteTrailSource);
  ensureGeoJSONSource(map, IDS.selectedSource);

  applyGoogleEarthSceneDeclutter(map);
  applyNativeAircraftDeclutter(map);

  addLayerSafe(map, {
    id: IDS.aircraftTrailGlow,
    type: 'line',
    source: IDS.aircraftTrailSource,
    paint: {
      'line-color': ['coalesce', ['get', '__amoh_color'], '#68f59a'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 1.4, 7, 5.0],
      'line-opacity': 0.2,
      'line-blur': 5,
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
  });

  addLayerSafe(map, {
    id: IDS.aircraftTrail,
    type: 'line',
    source: IDS.aircraftTrailSource,
    paint: {
      'line-color': ['coalesce', ['get', '__amoh_color'], '#68f59a'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 7, 1.6],
      'line-opacity': 0.72,
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
  });

  addLayerSafe(map, {
    id: IDS.aircraftHalo,
    type: 'circle',
    source: IDS.aircraftSource,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 1.4, 7, 3.0],
      'circle-color': '#dffcff',
      'circle-opacity': 0.035,
      'circle-blur': 0.82,
      'circle-stroke-width': 0,
    },
  });


  addLayerSafe(map, {
    id: IDS.aircraftGlowIcon,
    type: 'symbol',
    source: IDS.aircraftSource,
    layout: {
      'symbol-placement': 'point',
      'symbol-height-offset': ['coalesce', ['get', '__amoh_altitude_m'], 0],
      'icon-image': 'amoh-cinematic-plane-glow',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 0.8, 0.62, 2.5, 0.78, 5, 0.96, 9, 1.12],
      'icon-rotation-alignment': 'viewport',
      'icon-pitch-alignment': 'viewport',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-opacity': 0.94,
    },
  });

  addLayerSafe(map, {
    id: IDS.aircraftIcon,
    type: 'symbol',
    source: IDS.aircraftSource,
    layout: {
      'symbol-placement': 'point',
      'symbol-height-offset': ['coalesce', ['get', '__amoh_altitude_m'], 0],
      'icon-image': 'amoh-cinematic-plane',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 0.8, 0.82, 2.5, 1.00, 5, 1.18, 8, 1.34],
      'icon-rotate': ['coalesce', ['get', '__amoh_heading'], 0],
      'icon-rotation-alignment': 'viewport',
      'icon-pitch-alignment': 'viewport',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-opacity': 1.0,
    },
  });

  addLayerSafe(map, {
    id: IDS.aircraftLabel,
    type: 'symbol',
    source: IDS.aircraftSource,
    minzoom: 7.0,
    layout: {
      'text-field': ['coalesce', ['get', '__amoh_label'], ''],
      'text-size': 10,
      'text-offset': [0, 1.8],
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-padding': 4,
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    },
    paint: {
      'text-color': '#eafcff',
      'text-halo-color': '#07131e',
      'text-halo-width': 1.5,
      'text-opacity': 0.88,
    },
  });

  addLayerSafe(map, {
    id: IDS.satelliteTrailGlow,
    type: 'line',
    source: IDS.satelliteTrailSource,
    paint: {
      'line-color': ['coalesce', ['get', '__amoh_color'], '#62ffc8'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.8, 7, 2.0],
      'line-opacity': 0.035,
      'line-blur': 5,
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
  });

  addLayerSafe(map, {
    id: IDS.satelliteTrail,
    type: 'line',
    source: IDS.satelliteTrailSource,
    paint: {
      'line-color': ['coalesce', ['get', '__amoh_color'], '#62ffc8'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.36, 7, 0.78],
      'line-opacity': 0.16,
      'line-dasharray': [1.0, 2.0],
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
  });

  // Ground sub-point only. The actual satellite symbol is elevated using
  // symbol-height-offset at the real SGP4 altitude.
  addLayerSafe(map, {
    id: IDS.satelliteHalo,
    type: 'circle',
    source: IDS.satelliteSource,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 0.35, 7, 0.75],
      'circle-color': '#8fffea',
      'circle-opacity': 0.010,
      'circle-blur': 0.45,
      'circle-stroke-color': 'rgba(255,255,255,0.08)',
      'circle-stroke-width': 0.3,
    },
  });


  addLayerSafe(map, {
    id: IDS.satelliteGlowIcon,
    type: 'symbol',
    source: IDS.satelliteSource,
    layout: {
      'symbol-placement': 'point',
      'symbol-height-offset': ['coalesce', ['get', '__amoh_altitude_m'], 0],
      'icon-image': 'amoh-cinematic-satellite-glow',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 0.8, 0.72, 2.5, 0.92, 5, 1.10, 9, 1.28],
      'icon-rotation-alignment': 'viewport',
      'icon-pitch-alignment': 'viewport',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-opacity': 0.92,
    },
  });

  addLayerSafe(map, {
    id: IDS.satelliteIcon,
    type: 'symbol',
    source: IDS.satelliteSource,
    layout: {
      'symbol-placement': 'point',
      'symbol-height-offset': ['coalesce', ['get', '__amoh_altitude_m'], 0],
      'icon-image': 'amoh-cinematic-satellite',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 0.8, 1.02, 2.2, 1.20, 4.5, 1.38, 7, 1.52, 9, 1.62],
      'icon-rotation-alignment': 'viewport',
      'icon-pitch-alignment': 'viewport',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-opacity': 1.0,
    },
  });

  addLayerSafe(map, {
    id: IDS.satelliteLabel,
    type: 'symbol',
    source: IDS.satelliteSource,
    minzoom: 24,
    layout: {
      'symbol-placement': 'point',
      'symbol-height-offset': ['coalesce', ['get', '__amoh_altitude_m'], 0],
      'text-field': [
        'concat',
        ['coalesce', ['get', '__amoh_label'], ''],
        '\n',
        ['to-string', ['coalesce', ['get', '__amoh_altitude_km'], 0]],
        ' km'
      ],
      'text-size': ['interpolate', ['linear'], ['zoom'], 4.8, 8, 8, 10],
      'text-offset': [0, 1.5],
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-optional': true,
      'text-padding': 10,
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    },
    paint: {
      'text-color': '#dffef4',
      'text-halo-color': '#07131e',
      'text-halo-width': 1.5,
      'text-opacity': 0.0,
    },
  });

  addLayerSafe(map, {
    id: IDS.selectedGlow,
    type: 'circle',
    source: IDS.selectedSource,
    filter: ['==', ['get', '__amoh_kind'], 'aircraft'],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 10, 7, 22],
      'circle-color': ['coalesce', ['get', '__amoh_color'], '#62ffc8'],
      'circle-opacity': 0.18,
      'circle-blur': 0.8,
    },
  });

  addLayerSafe(map, {
    id: IDS.selectedRing,
    type: 'circle',
    source: IDS.selectedSource,
    filter: ['==', ['get', '__amoh_kind'], 'aircraft'],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 6, 7, 15],
      'circle-color': 'rgba(0,0,0,0)',
      'circle-stroke-color': ['coalesce', ['get', '__amoh_color'], '#62ffc8'],
      'circle-stroke-width': 2,
      'circle-stroke-opacity': 0.95,
    },
  });

  addLayerSafe(map, {
    id: IDS.selectedOrbitRing,
    type: 'symbol',
    source: IDS.selectedSource,
    filter: ['==', ['get', '__amoh_kind'], 'satellite'],
    layout: {
      'symbol-placement': 'point',
      'symbol-height-offset': ['coalesce', ['get', '__amoh_altitude_m'], 0],
      'icon-image': 'amoh-cinematic-orbit-ring',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 1, 0.55, 4, 0.72, 8, 0.92],
      'icon-rotation-alignment': 'viewport',
      'icon-pitch-alignment': 'viewport',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-opacity': 0.98,
    },
  });

  // V7: keep hero craft above raster imagery, heatmaps and late-added analytical overlays.
  bringHeroLayersToFront(map);
}


function bringHeroLayersToFront(map: MlMap): void {
  const ordered = [
    IDS.aircraftTrailGlow,
    IDS.aircraftTrail,
    IDS.satelliteTrailGlow,
    IDS.satelliteTrail,
    IDS.aircraftHalo,
    IDS.satelliteHalo,
    IDS.aircraftGlowIcon,
    IDS.satelliteGlowIcon,
    IDS.aircraftIcon,
    IDS.satelliteIcon,
    IDS.selectedGlow,
    IDS.selectedRing,
    IDS.selectedOrbitRing,
    IDS.aircraftLabel,
    IDS.satelliteLabel,
  ];

  for (const layerId of ordered) {
    if (!map.getLayer(layerId)) continue;
    try {
      map.moveLayer(layerId);
    } catch {
      // Style mutation can briefly reject reordering.
    }
  }
}

function setData(
  map: MlMap,
  sourceId: string,
  data: GeoJSON.FeatureCollection,
): void {
  const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
  if (!source || typeof source.setData !== 'function') return;

  try {
    source.setData(data);
  } catch {
    // A style swap can briefly invalidate the source.
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

type UiLocale = 'es' | 'en' | 'ja' | 'nb' | 'zh' | 'ar';

function uiLocale(): UiLocale {
  const lang = (document.documentElement.lang || navigator.language || 'es').toLowerCase();
  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('nb') || lang.startsWith('no')) return 'nb';
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('ar')) return 'ar';
  return 'es';
}

const UI: Record<UiLocale, Record<string, string>> = {
  es: {
    aircraft: 'Avión',
    satellite: 'Satélite',
    callsign: 'Indicativo',
    registration: 'Registro',
    type: 'Tipo',
    altitude: 'Altitud',
    speed: 'Velocidad',
    orbitalSpeed: 'Velocidad orbital',
    track: 'Rumbo',
    country: 'País',
    lastContact: 'Último contacto',
    mission: 'Misión',
    norad: 'NORAD',
    epoch: 'Época',
    orbit: 'Órbita',
    nextPass: 'Próximo paso',
    followAircraft: 'Seguir este avión',
    followSatellite: 'Seguir este satélite',
    recent: 'RECENT / OpenSky',
    propagated: 'PROPAGATED / SGP4',
  },
  en: {
    aircraft: 'Aircraft',
    satellite: 'Satellite',
    callsign: 'Callsign',
    registration: 'Registration',
    type: 'Type',
    altitude: 'Altitude',
    speed: 'Speed',
    orbitalSpeed: 'Orbital speed',
    track: 'Track',
    country: 'Country',
    lastContact: 'Last contact',
    mission: 'Mission',
    norad: 'NORAD',
    epoch: 'Epoch',
    orbit: 'Orbit',
    nextPass: 'Next pass',
    followAircraft: 'Follow this aircraft',
    followSatellite: 'Follow this satellite',
    recent: 'RECENT / OpenSky',
    propagated: 'PROPAGATED / SGP4',
  },
  ja: {
    aircraft: '航空機',
    satellite: '衛星',
    callsign: 'コールサイン',
    registration: '登録',
    type: '機種',
    altitude: '高度',
    speed: '速度',
    orbitalSpeed: '軌道速度',
    track: '進行方向',
    country: '国',
    lastContact: '最終受信',
    mission: 'ミッション',
    norad: 'NORAD',
    epoch: 'エポック',
    orbit: '軌道',
    nextPass: '次回通過',
    followAircraft: 'この航空機を追跡',
    followSatellite: 'この衛星を追跡',
    recent: 'RECENT / OpenSky',
    propagated: 'PROPAGATED / SGP4',
  },
  nb: {
    aircraft: 'Fly',
    satellite: 'Satellitt',
    callsign: 'Kallesignal',
    registration: 'Registrering',
    type: 'Type',
    altitude: 'Høyde',
    speed: 'Hastighet',
    orbitalSpeed: 'Banehastighet',
    track: 'Kurs',
    country: 'Land',
    lastContact: 'Siste kontakt',
    mission: 'Oppdrag',
    norad: 'NORAD',
    epoch: 'Epoke',
    orbit: 'Bane',
    nextPass: 'Neste passering',
    followAircraft: 'Følg dette flyet',
    followSatellite: 'Følg denne satellitten',
    recent: 'RECENT / OpenSky',
    propagated: 'PROPAGATED / SGP4',
  },
  zh: {
    aircraft: '飞机',
    satellite: '卫星',
    callsign: '呼号',
    registration: '注册号',
    type: '类型',
    altitude: '高度',
    speed: '速度',
    orbitalSpeed: '轨道速度',
    track: '航向',
    country: '国家',
    lastContact: '最后联系',
    mission: '任务',
    norad: 'NORAD',
    epoch: '历元',
    orbit: '轨道',
    nextPass: '下次过境',
    followAircraft: '跟踪此飞机',
    followSatellite: '跟踪此卫星',
    recent: 'RECENT / OpenSky',
    propagated: 'PROPAGATED / SGP4',
  },
  ar: {
    aircraft: 'طائرة',
    satellite: 'قمر صناعي',
    callsign: 'نداء الرحلة',
    registration: 'التسجيل',
    type: 'النوع',
    altitude: 'الارتفاع',
    speed: 'السرعة',
    orbitalSpeed: 'السرعة المدارية',
    track: 'المسار',
    country: 'الدولة',
    lastContact: 'آخر اتصال',
    mission: 'المهمة',
    norad: 'NORAD',
    epoch: 'الحقبة',
    orbit: 'المدار',
    nextPass: 'المرور التالي',
    followAircraft: 'تتبّع هذه الطائرة',
    followSatellite: 'تتبّع هذا القمر',
    recent: 'RECENT / OpenSky',
    propagated: 'PROPAGATED / SGP4',
  },
};

function fmtAltitude(props: Record<string, unknown>, kind: Kind): string | null {
  if (kind === 'satellite') {
    const km = firstNumber(props, ['altitude_km', 'alt_km', 'height_km']);
    if (km != null) return `${Math.round(km).toLocaleString()} km`;

    const meters = firstNumber(props, ['altitude_m', 'altitude']);
    if (meters != null) return `${Math.round(meters / 1000).toLocaleString()} km`;

    return null;
  }

  const feet = firstNumber(props, ['altitude_ft', 'alt_ft']);
  if (feet != null) return `${Math.round(feet).toLocaleString()} ft`;

  const meters = firstNumber(props, [
    'baro_altitude',
    'geo_altitude',
    'altitude_m',
    'altitude',
  ]);

  if (meters != null) {
    const ft = meters * 3.28084;
    return `${Math.round(ft).toLocaleString()} ft · ${Math.round(meters).toLocaleString()} m`;
  }

  return null;
}

function fmtSpeed(props: Record<string, unknown>): string | null {
  const knots = firstNumber(props, ['speed_knots', 'speed_kts', 'knots']);
  if (knots != null) return `${Math.round(knots).toLocaleString()} kt`;

  const mps = firstNumber(props, ['velocity', 'speed_mps', 'speed']);
  if (mps != null) {
    const kt = mps * 1.94384;
    return `${Math.round(kt).toLocaleString()} kt · ${Math.round(mps * 3.6).toLocaleString()} km/h`;
  }

  return null;
}


function fmtOrbitalSpeed(props: Record<string, unknown>): string | null {
  const kmps = firstNumber(props, [
    'velocity_km_s',
    'speed_km_s',
    'orbital_speed_km_s',
    'velocity_kmps',
  ]);

  if (kmps != null) {
    return `${kmps.toFixed(2)} km/s · ${Math.round(kmps * 3600).toLocaleString()} km/h`;
  }

  const mps = firstNumber(props, [
    'velocity_m_s',
    'speed_m_s',
    'orbital_speed_m_s',
    'velocity',
  ]);

  if (mps != null && mps > 1000) {
    return `${(mps / 1000).toFixed(2)} km/s · ${Math.round(mps * 3.6).toLocaleString()} km/h`;
  }

  return null;
}

function fmtTrack(props: Record<string, unknown>): string | null {
  const track = headingFromProps(props);
  if (!Number.isFinite(track)) return null;
  return `${Math.round(((track % 360) + 360) % 360)}°`;
}

function fmtTime(value: unknown): string | null {
  const n = num(value);
  if (n != null) {
    const ms = n < 10_000_000_000 ? n * 1000 : n;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  const s = str(value);
  if (!s) return null;

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString();

  return s;
}

function infoRows(kind: Kind, props: Record<string, unknown>): [string, string][] {
  const t = UI[uiLocale()];
  const rows: [string, string][] = [];

  const add = (label: string, value: string | null) => {
    if (value) rows.push([label, value]);
  };

  if (kind === 'aircraft') {
    add(t.callsign, firstString(props, ['callsign', 'flight']));
    add(t.registration, firstString(props, ['registration', 'reg']));
    add(t.type, firstString(props, ['type', 'aircraft_type', 'model', 'category']));
    add(t.altitude, fmtAltitude(props, kind));
    add(t.speed, fmtSpeed(props));
    add(t.track, fmtTrack(props));
    add(t.country, firstString(props, ['origin_country', 'country']));
    add(
      t.lastContact,
      fmtTime(props.last_contact ?? props.lastContact ?? props.timestamp),
    );
  } else {
    add(t.mission, firstString(props, ['mission', 'name', 'satellite']));
    add(t.norad, firstString(props, ['norad_id', 'noradId', 'norad', 'catalog_number']));
    add(t.type, firstString(props, ['type', 'category', 'mission_type', 'constellation']));
    add(t.altitude, fmtAltitude(props, kind));
    add(t.orbitalSpeed, fmtOrbitalSpeed(props));
    add(t.epoch, fmtTime(props.epoch));
    add(t.orbit, firstString(props, ['orbit', 'orbit_type', 'inclination']));
    add(t.nextPass, fmtTime(props.next_pass ?? props.nextPass));
  }

  return rows;
}

function photoUrl(props: Record<string, unknown>): string | null {
  const value = firstString(props, ['photo_url', 'image_url', 'thumbnail_url', 'photo']);
  if (!value) return null;
  if (!/^https:\/\//i.test(value)) return null;
  return value;
}

function popupHtml(state: EntityState): string {
  const t = UI[uiLocale()];
  const kind = state.kind;
  const color = kind === 'aircraft' ? aircraftColor(state.props) : satelliteColor(state.props);
  const title =
    kind === 'aircraft'
      ? firstString(state.props, ['callsign', 'flight', 'registration', 'icao24']) ?? state.id
      : firstString(state.props, ['name', 'mission', 'satellite', 'norad_id']) ?? state.id;

  const rows = infoRows(kind, state.props);
  const image = photoUrl(state.props);
  const isRtl = uiLocale() === 'ar';

  const body = rows
    .map(
      ([label, value]) => `
        <div style="display:grid;grid-template-columns:minmax(92px,0.9fr) minmax(120px,1.35fr);gap:12px;padding:3px 0;">
          <span style="color:#8195a6;">${escapeHtml(label)}</span>
          <strong style="color:#edfaff;text-align:${isRtl ? 'left' : 'right'};font-weight:650;">${escapeHtml(value)}</strong>
        </div>`,
    )
    .join('');

  const imageBlock = image
    ? `<img src="${escapeHtml(image)}" alt="" style="width:100%;height:112px;object-fit:cover;border-radius:8px;margin-top:10px;border:1px solid rgba(255,255,255,.12);" />`
    : '';

  return `
    <div dir="${isRtl ? 'rtl' : 'ltr'}" style="
      min-width:270px;
      max-width:330px;
      color:#eafcff;
      background:rgba(5,13,20,.97);
      border:1.5px solid ${color};
      border-radius:10px;
      box-shadow:0 0 24px color-mix(in srgb, ${color} 32%, transparent),0 18px 50px rgba(0,0,0,.46);
      padding:13px 14px 12px;
      font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:12px;
      line-height:1.35;
    ">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;">
        <div style="width:8px;height:8px;border-radius:999px;background:${color};box-shadow:0 0 10px ${color};"></div>
        <div style="font-size:14px;font-weight:800;letter-spacing:.02em;flex:1;">${escapeHtml(title)}</div>
        <div style="font-size:10px;color:${color};font-weight:800;letter-spacing:.06em;">${escapeHtml(kind === 'aircraft' ? t.aircraft : t.satellite)}</div>
      </div>
      ${body}
      <label style="display:flex;align-items:center;gap:8px;margin-top:11px;padding-top:9px;border-top:1px solid rgba(255,255,255,.10);cursor:pointer;">
        <input type="checkbox" data-amoh-follow="1" style="accent-color:${color};width:14px;height:14px;" />
        <span>${escapeHtml(kind === 'aircraft' ? t.followAircraft : t.followSatellite)}</span>
      </label>
      ${imageBlock}
      <div style="margin-top:10px;font-size:9px;color:#73889b;letter-spacing:.05em;">
        ${escapeHtml(kind === 'aircraft' ? t.recent : t.propagated)}
      </div>
    </div>
  `;
}


function orbitalFocusCamera(
  map: MlMap,
  state: EntityState,
  duration = 950,
): void {
  if (state.kind !== 'satellite') {
    try {
      map.easeTo({
        center: state.current,
        duration,
        essential: true,
      });
    } catch {}
    return;
  }

  const altitude = satelliteAltitudeMeters(state.props);
  const target = new maplibregl.LngLat(state.current[0], state.current[1]);

  const cameraLat = Math.max(-80, Math.min(80, state.current[1] + 4.2));
  const cameraLon = normalizeLon(state.current[0] - 7.5);
  const camera = new maplibregl.LngLat(cameraLon, cameraLat);
  const cameraAltitude = Math.max(1_450_000, altitude * 2.55);

  try {
    const options = map.calculateCameraOptionsFromTo(
      camera,
      cameraAltitude,
      target,
      altitude,
    );

    map.easeTo({
      ...options,
      duration,
      essential: true,
    });
  } catch {
    map.easeTo({
      center: state.current,
      zoom: Math.max(map.getZoom(), 3.0),
      pitch: Math.max(map.getPitch(), 58),
      duration,
      essential: true,
    });
  }
}

function layerExists(map: MlMap, id: string): boolean {
  return Boolean(map.getLayer(id));
}

function queryClickFeature(
  map: MlMap,
  e: MapMouseEvent,
): maplibregl.MapGeoJSONFeature | null {
  const layers = [
    IDS.satelliteIcon,
    IDS.selectedOrbitRing,
    IDS.aircraftIcon,
    IDS.satelliteHalo,
    IDS.aircraftHalo,
  ].filter((id) => layerExists(map, id));

  if (layers.length === 0) return null;

  const features = map.queryRenderedFeatures(e.point, { layers });
  return features[0] ?? null;
}

function eventState(
  feature: maplibregl.MapGeoJSONFeature,
  aircraft: Map<string, EntityState>,
  satellites: Map<string, EntityState>,
): EntityState | null {
  const props = (feature.properties ?? {}) as Record<string, unknown>;
  const id = firstString(props, ['__amoh_id']) ?? String(feature.id ?? '');
  const kind = firstString(props, ['__amoh_kind']);

  if (!id) return null;
  if (kind === 'aircraft') return aircraft.get(id) ?? null;
  if (kind === 'satellite') return satellites.get(id) ?? null;

  return aircraft.get(id) ?? satellites.get(id) ?? null;
}

export function installFlightSatelliteVisuals(map: MlMap): Controller {
  const existing = controllers.get(map);
  if (existing) return existing;

  const aircraft = new Map<string, EntityState>();
  const satellites = new Map<string, EntityState>();

  let destroyed = false;
  let sampleTimer = 0;
  let raf = 0;
  let lastFrameAt = 0;
  let selected: { kind: Kind; id: string } | null = null;
  let followSelected = false;
  let popup: maplibregl.Popup | null = null;
  let lastFollowCameraAt = 0;

  function syncSelectedSource(): void {
    if (!selected) {
      setData(map, IDS.selectedSource, EMPTY_FC);
      return;
    }

    const state =
      selected.kind === 'aircraft'
        ? aircraft.get(selected.id)
        : satellites.get(selected.id);

    if (!state) {
      setData(map, IDS.selectedSource, EMPTY_FC);
      return;
    }

    setData(map, IDS.selectedSource, {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: state.current },
          properties: {
            __amoh_id: state.id,
            __amoh_kind: state.kind,
            __amoh_altitude_m:
              state.kind === 'satellite'
                ? satelliteAltitudeMeters(state.props)
                : aircraftAltitudeMeters(state.props),
            __amoh_label:
              state.kind === 'satellite'
                ? firstString(state.props, ['name', 'mission', 'satellite', 'norad_id']) ?? state.id
                : firstString(state.props, ['callsign', 'flight', 'registration', 'icao24']) ?? state.id,
            __amoh_color:
              state.kind === 'aircraft'
                ? aircraftColor(state.props)
                : satelliteColor(state.props),
          },
        },
      ],
    });

    if (followSelected) {
      const now = performance.now();
      if (now - lastFollowCameraAt >= 850) {
        lastFollowCameraAt = now;
        orbitalFocusCamera(map, state, 820);
      }
    }

    if (popup?.isOpen()) {
      try {
        popup.setLngLat(state.current);
      } catch {
        // Ignore.
      }
    }
  }

  function updateOverlayData(now: number): void {
    const aircraftFeatures: GeoJSON.Feature<GeoJSON.Point>[] = [];
    const satelliteFeatures: GeoJSON.Feature<GeoJSON.Point>[] = [];
    const aircraftTrails: GeoJSON.Feature<GeoJSON.LineString>[] = [];
    const satelliteTrails: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    for (const state of aircraft.values()) {
      const progress = Math.min(1, Math.max(0, (now - state.startedAt) / state.durationMs));
      state.current = lerpLngLat(state.start, state.target, progress);

      aircraftFeatures.push(asAircraftFeature(state));
      const trail = trailFeature(state);
      if (trail) aircraftTrails.push(trail);
    }

    for (const state of satellites.values()) {
      const progress = Math.min(1, Math.max(0, (now - state.startedAt) / state.durationMs));
      state.current = lerpLngLat(state.start, state.target, progress);

      satelliteFeatures.push(asSatelliteFeature(state));
      const trail = trailFeature(state);
      if (trail) satelliteTrails.push(trail);
    }

    setData(map, IDS.aircraftSource, {
      type: 'FeatureCollection',
      features: aircraftFeatures,
    });

    setData(map, IDS.aircraftTrailSource, {
      type: 'FeatureCollection',
      features: aircraftTrails,
    });

    setData(map, IDS.satelliteSource, {
      type: 'FeatureCollection',
      features: satelliteFeatures,
    });

    setData(map, IDS.satelliteTrailSource, {
      type: 'FeatureCollection',
      features: satelliteTrails,
    });

    syncSelectedSource();
  }

  function removeStale(now: number): void {
    for (const [id, state] of aircraft) {
      if (now - state.seenAt > STALE_MS) aircraft.delete(id);
    }

    for (const [id, state] of satellites) {
      if (now - state.seenAt > STALE_MS) satellites.delete(id);
    }
  }

  function upsert(
    kind: Kind,
    feature: maplibregl.MapGeoJSONFeature,
    coord: LngLat,
    now: number,
  ): void {
    const mapState = kind === 'aircraft' ? aircraft : satellites;
    const id = entityId(kind, feature);
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const old = mapState.get(id);

    if (!old) {
      mapState.set(id, {
        id,
        kind,
        start: coord,
        target: coord,
        current: coord,
        startedAt: now,
        durationMs: SAMPLE_INTERVAL_MS + 350,
        props,
        trail: [coord],
        seenAt: now,
      });
      return;
    }

    const moved =
      Math.abs(shortestLonDelta(old.target[0], coord[0])) > 0.00001 ||
      Math.abs(old.target[1] - coord[1]) > 0.00001;

    if (moved) {
      const maxTrail =
        kind === 'aircraft' ? AIRCRAFT_TRAIL_POINTS : SATELLITE_TRAIL_POINTS;

      old.trail.push(old.current);
      if (old.trail.length > maxTrail) {
        old.trail.splice(0, old.trail.length - maxTrail);
      }

      old.start = old.current;
      old.target = coord;
      old.startedAt = now;
      old.durationMs = SAMPLE_INTERVAL_MS + 450;
    }

    old.props = props;
    old.seenAt = now;
  }

  function sampleKind(kind: Kind, now: number): void {
    const ids = sourceIdsForKind(map, kind).filter((id) => sourceIsVisible(map, id));
    const center = map.getCenter();
    const candidates: Array<{
      feature: maplibregl.MapGeoJSONFeature;
      coord: LngLat;
      score: number;
    }> = [];

    for (const sourceId of ids) {
      let features: maplibregl.MapGeoJSONFeature[] = [];

      try {
        features = map.querySourceFeatures(sourceId) as maplibregl.MapGeoJSONFeature[];
      } catch {
        continue;
      }

      for (const feature of features) {
        const coord = pointCoord(feature);
        if (!coord) continue;

        candidates.push({
          feature,
          coord,
          score: distanceScore(center, coord),
        });
      }
    }

    candidates.sort((a, b) => a.score - b.score);
    const limit = kind === 'aircraft' ? AIRCRAFT_MAX : SATELLITE_MAX;

    const seen = new Set<string>();

    for (const item of candidates.slice(0, limit)) {
      const id = entityId(kind, item.feature);
      if (seen.has(id)) continue;
      seen.add(id);
      upsert(kind, item.feature, item.coord, now);
    }
  }

  function sample(): void {
    if (destroyed || !map.isStyleLoaded()) return;

    ensureLayers(map);

    const now = performance.now();
    sampleKind('aircraft', now);
    sampleKind('satellite', now);
    removeStale(now);
  }

  function frame(now: number): void {
    if (destroyed) return;

    if (now - lastFrameAt >= FRAME_INTERVAL_MS) {
      lastFrameAt = now;
      if (map.isStyleLoaded()) {
        ensureLayers(map);
        updateOverlayData(now);
      }
    }

    raf = requestAnimationFrame(frame);
  }

  function onStyleData(): void {
    if (destroyed) return;

    window.setTimeout(() => {
      if (!destroyed && map.isStyleLoaded()) {
        ensureLayers(map);
        sample();
      }
    }, 60);
  }

  function onClick(e: MapMouseEvent): void {
    const feature = queryClickFeature(map, e);
    if (!feature) return;

    const state = eventState(feature, aircraft, satellites);
    if (!state) return;

    selected = { kind: state.kind, id: state.id };
    followSelected = false;
    syncSelectedSource();

    if (state.kind === 'satellite') {
      orbitalFocusCamera(map, state, 900);
    }

    popup?.remove();

    popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '360px',
      className: 'amoh-cinematic-object-popup',
      offset: 22,
    })
      .setLngLat(state.current)
      .setHTML(popupHtml(state))
      .addTo(map);

    const root = popup.getElement();
    const follow = root.querySelector<HTMLInputElement>('[data-amoh-follow="1"]');

    if (follow) {
      follow.checked = false;
      follow.addEventListener('change', () => {
        followSelected = follow.checked;
        syncSelectedSource();
      });
    }

    popup.on('close', () => {
      followSelected = false;
      selected = null;
      syncSelectedSource();
    });
  }

  function onMouseMove(e: MapMouseEvent): void {
    const feature = queryClickFeature(map, e);
    map.getCanvas().style.cursor = feature ? 'pointer' : '';
  }

  function injectPopupCss(): void {
    const id = 'amoh-cinematic-live-object-style';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .amoh-cinematic-object-popup {
        position: absolute !important;
        top: 78px !important;
        right: 18px !important;
        left: auto !important;
        bottom: auto !important;
        transform: none !important;
        z-index: 8 !important;
      }
      .amoh-cinematic-object-popup .maplibregl-popup-content {
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .amoh-cinematic-object-popup .maplibregl-popup-tip {
        display: none !important;
      }
      .amoh-cinematic-object-popup .maplibregl-popup-close-button {
        color: #dffaff;
        z-index: 5;
        font-size: 20px;
        line-height: 20px;
        right: 5px;
        top: 5px;
      }
      .amoh-cinematic-object-popup .maplibregl-popup-close-button:hover {
        background: rgba(255,255,255,.08);
      }

      @media (max-width: 760px) {
        .amoh-cinematic-object-popup {
          top: auto !important;
          right: 10px !important;
          left: 10px !important;
          bottom: 90px !important;
          max-width: none !important;
        }
        .amoh-cinematic-object-popup .maplibregl-popup-content {
          width: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  injectPopupCss();

  map.on('styledata', onStyleData);
  map.on('sourcedata', onStyleData);
  map.on('click', onClick);
  map.on('mousemove', onMouseMove);

  const start = () => {
    if (destroyed) return;
    ensureLayers(map);
    sample();
    sampleTimer = window.setInterval(sample, SAMPLE_INTERVAL_MS);
    raf = requestAnimationFrame(frame);
  };

  if (map.isStyleLoaded()) {
    start();
  } else {
    map.once('load', start);
  }

  const controller: Controller = {
    refresh: () => {
      if (!destroyed) {
        ensureLayers(map);
        sample();
      }
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;

      if (sampleTimer) window.clearInterval(sampleTimer);
      if (raf) cancelAnimationFrame(raf);

      map.off('styledata', onStyleData);
      map.off('sourcedata', onStyleData);
      map.off('click', onClick);
      map.off('mousemove', onMouseMove);

      popup?.remove();
      popup = null;
      restoreSceneDeclutter(map);
      map.getCanvas().style.cursor = '';

      controllers.delete(map);
    },
  };

  controllers.set(map, controller);
  return controller;
}
