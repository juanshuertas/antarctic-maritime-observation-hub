// SPDX-License-Identifier: AGPL-3.0-or-later
// AMOH_REFERENCE_LOCK_V9
//
// Deep reference-parity runtime:
// - renders aircraft/satellites from the canonical LIVE sources;
// - uses ImageData-backed icons so MapLibre receives valid runtime images;
// - hides every competing native circle/symbol tied to the craft sources;
// - keeps orbital tracks subtle but visible;
// - styles the ACTUAL AMOH runtime heatmap layers;
// - suppresses Quantarctica visual clutter in immersive modes;
// - adds a tiny curated polar label set for reference-style readability;
// - restores scientific 2D layers when leaving globe mode.
//
// No provider/backend/scientific data are changed.

import type { Map as MlMap, StyleImageMetadata } from 'maplibre-gl';

type Controller = {
  refresh: () => void;
  destroy: () => void;
};

type PaintSnapshot = {
  layerId: string;
  property: string;
  value: unknown;
};

type LayoutSnapshot = {
  layerId: string;
  property: string;
  value: unknown;
};

const controllers = new WeakMap<MlMap, Controller>();
const paintSnapshots = new WeakMap<MlMap, Map<string, PaintSnapshot>>();
const layoutSnapshots = new WeakMap<MlMap, Map<string, LayoutSnapshot>>();

const IDS = {
  aircraftGlow: 'amoh-v9-aircraft-glow',
  aircraftHero: 'amoh-v9-aircraft-hero',
  satelliteGlow: 'amoh-v9-satellite-glow',
  satelliteHero: 'amoh-v9-satellite-hero',
  polarLabelSource: 'amoh-v9-polar-labels',
  polarLabels: 'amoh-v9-polar-labels-symbol',
} as const;

const HERO_PREFIX = 'amoh-v9-';
const OLD_VISUAL_RE =
  /^(amoh-cinematic-|amoh-v[678]-|amoh-v[67]-continuous-heat-)/i;

const QUANTARCTICA_RE = /^quantarctica/i;
const RUNTIME_HEAT_RE = /^amoh-runtime-heat-/i;

const CRAFT_SOURCES = new Set([
  'polar_aircraft',
  'polar_aircraft_elevated',
  'polar_satellites',
  'polar_satellites_points',
  'polar_satellites_elevated',
]);

function snapshotKey(layerId: string, property: string): string {
  return `${layerId}::${property}`;
}

function rememberPaint(
  map: MlMap,
  layerId: string,
  property: string,
): void {
  let root = paintSnapshots.get(map);

  if (!root) {
    root = new Map();
    paintSnapshots.set(map, root);
  }

  const key = snapshotKey(layerId, property);
  if (root.has(key)) return;

  try {
    root.set(key, {
      layerId,
      property,
      value: map.getPaintProperty(layerId, property as never),
    });
  } catch {
    // unsupported property
  }
}

function rememberLayout(
  map: MlMap,
  layerId: string,
  property: string,
): void {
  let root = layoutSnapshots.get(map);

  if (!root) {
    root = new Map();
    layoutSnapshots.set(map, root);
  }

  const key = snapshotKey(layerId, property);
  if (root.has(key)) return;

  try {
    root.set(key, {
      layerId,
      property,
      value: map.getLayoutProperty(layerId, property as never),
    });
  } catch {
    // unsupported property
  }
}

function setPaint(
  map: MlMap,
  layerId: string,
  property: string,
  value: unknown,
): void {
  if (!map.getLayer(layerId)) return;

  rememberPaint(map, layerId, property);

  try {
    map.setPaintProperty(layerId, property as never, value as never);
  } catch {
    // non-fatal during style transitions
  }
}

function setLayout(
  map: MlMap,
  layerId: string,
  property: string,
  value: unknown,
): void {
  if (!map.getLayer(layerId)) return;

  rememberLayout(map, layerId, property);

  try {
    map.setLayoutProperty(layerId, property as never, value as never);
  } catch {
    // non-fatal during style transitions
  }
}

function restoreScientific2D(map: MlMap): void {
  const paints = paintSnapshots.get(map);

  if (paints) {
    for (const snap of paints.values()) {
      if (!map.getLayer(snap.layerId)) continue;

      try {
        map.setPaintProperty(
          snap.layerId,
          snap.property as never,
          snap.value as never,
        );
      } catch {
        // layer may have disappeared
      }
    }

    paints.clear();
  }

  const layouts = layoutSnapshots.get(map);

  if (layouts) {
    for (const snap of layouts.values()) {
      if (!map.getLayer(snap.layerId)) continue;

      try {
        map.setLayoutProperty(
          snap.layerId,
          snap.property as never,
          snap.value as never,
        );
      } catch {
        // layer may have disappeared
      }
    }

    layouts.clear();
  }
}

function isGlobe(map: MlMap): boolean {
  try {
    return String(map.getProjection?.()?.type ?? '').toLowerCase() === 'globe';
  } catch {
    return false;
  }
}

function imageDataFromCanvas(
  canvas: HTMLCanvasElement,
): ImageData {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new ImageData(canvas.width, canvas.height);
  }

  return ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );
}

function createGlowImage(
  rgb: string,
  alpha: number,
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;

  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);

  const g = ctx.createRadialGradient(
    80,
    80,
    3,
    80,
    80,
    77,
  );

  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.18, `rgba(${rgb},${alpha * 0.62})`);
  g.addColorStop(0.46, `rgba(${rgb},${alpha * 0.20})`);
  g.addColorStop(0.76, `rgba(${rgb},${alpha * 0.04})`);
  g.addColorStop(1, `rgba(${rgb},0)`);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 160, 160);

  return imageDataFromCanvas(canvas);
}

function createPlaneImage(): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;

  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);

  ctx.clearRect(0, 0, 96, 96);
  ctx.translate(48, 48);

  ctx.shadowColor = 'rgba(89,235,255,1)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffffff';

  ctx.beginPath();
  ctx.moveTo(0, -37);
  ctx.lineTo(7, -10);
  ctx.lineTo(35, 1);
  ctx.lineTo(35, 8);
  ctx.lineTo(8, 5);
  ctx.lineTo(7, 28);
  ctx.lineTo(18, 37);
  ctx.lineTo(18, 41);
  ctx.lineTo(0, 35);
  ctx.lineTo(-18, 41);
  ctx.lineTo(-18, 37);
  ctx.lineTo(-7, 28);
  ctx.lineTo(-8, 5);
  ctx.lineTo(-35, 8);
  ctx.lineTo(-35, 1);
  ctx.lineTo(-7, -10);
  ctx.closePath();
  ctx.fill();

  return imageDataFromCanvas(canvas);
}

function createSatelliteImage(): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = 112;
  canvas.height = 112;

  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);

  ctx.clearRect(0, 0, 112, 112);
  ctx.translate(56, 56);

  ctx.shadowColor = 'rgba(72,242,255,1)';
  ctx.shadowBlur = 13;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#57e4f7';
  ctx.lineWidth = 2;

  ctx.fillRect(-13, -13, 26, 26);
  ctx.strokeRect(-13, -13, 26, 26);

  ctx.fillStyle = '#e8fdff';
  ctx.fillRect(-43, -14, 24, 28);
  ctx.fillRect(19, -14, 24, 28);

  ctx.strokeStyle = '#41cde8';
  ctx.lineWidth = 1.5;

  for (const x of [-37, -31, -25, 25, 31, 37]) {
    ctx.beginPath();
    ctx.moveTo(x, -13);
    ctx.lineTo(x, 13);
    ctx.stroke();
  }

  for (const y of [-5, 5]) {
    ctx.beginPath();
    ctx.moveTo(-42, y);
    ctx.lineTo(-20, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(42, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(0, -30);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -34, 5, 0, Math.PI * 2);
  ctx.stroke();

  return imageDataFromCanvas(canvas);
}

function ensureImages(map: MlMap): void {
  const images: Array<[
    string,
    ImageData,
    Partial<StyleImageMetadata>,
  ]> = [
    [
      'amoh-v9-plane',
      createPlaneImage(),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v9-plane-glow',
      createGlowImage('235,253,255', 0.68),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v9-satellite',
      createSatelliteImage(),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v9-satellite-glow',
      createGlowImage('62,244,255', 0.74),
      { pixelRatio: 2 },
    ],
  ];

  for (const [name, image, metadata] of images) {
    if (map.hasImage(name)) continue;

    try {
      map.addImage(name, image, metadata);
    } catch {
      // retry after style lifecycle settles
    }
  }
}

function aircraftHeightExpression(): unknown {
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
    ['has', 'altitude'],
    ['to-number', ['get', 'altitude'], 0],
    0,
  ];
}

function satelliteHeightExpression(): unknown {
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

function ensureHeroLayers(map: MlMap): void {
  ensureImages(map);

  if (
    map.getSource('polar_aircraft') &&
    map.hasImage('amoh-v9-plane-glow') &&
    !map.getLayer(IDS.aircraftGlow)
  ) {
    try {
      map.addLayer({
        id: IDS.aircraftGlow,
        type: 'symbol',
        source: 'polar_aircraft',
        minzoom: 0,
        layout: {
          'symbol-placement': 'point',
          'symbol-height-offset': aircraftHeightExpression() as never,
          'icon-image': 'amoh-v9-plane-glow',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.72,
            1.5, 0.86,
            3, 1.02,
            6, 1.20,
          ],
          'icon-rotation-alignment': 'viewport',
          'icon-pitch-alignment': 'viewport',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 0.92,
        },
      } as never);
    } catch {
      // retry on next refresh
    }
  }

  if (
    map.getSource('polar_aircraft') &&
    map.hasImage('amoh-v9-plane') &&
    !map.getLayer(IDS.aircraftHero)
  ) {
    try {
      map.addLayer({
        id: IDS.aircraftHero,
        type: 'symbol',
        source: 'polar_aircraft',
        minzoom: 0,
        layout: {
          'symbol-placement': 'point',
          'symbol-height-offset': aircraftHeightExpression() as never,
          'icon-image': 'amoh-v9-plane',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.92,
            1.5, 1.08,
            3, 1.24,
            6, 1.42,
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
          'icon-pitch-alignment': 'viewport',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 1,
        },
      } as never);
    } catch {
      // retry on next refresh
    }
  }

  if (
    map.getSource('polar_satellites_points') &&
    map.hasImage('amoh-v9-satellite-glow') &&
    !map.getLayer(IDS.satelliteGlow)
  ) {
    try {
      map.addLayer({
        id: IDS.satelliteGlow,
        type: 'symbol',
        source: 'polar_satellites_points',
        minzoom: 0,
        layout: {
          'symbol-placement': 'point',
          'symbol-height-offset': satelliteHeightExpression() as never,
          'icon-image': 'amoh-v9-satellite-glow',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.78,
            1.5, 0.94,
            3, 1.12,
            6, 1.30,
          ],
          'icon-rotation-alignment': 'viewport',
          'icon-pitch-alignment': 'viewport',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 0.94,
        },
      } as never);
    } catch {
      // retry on next refresh
    }
  }

  if (
    map.getSource('polar_satellites_points') &&
    map.hasImage('amoh-v9-satellite') &&
    !map.getLayer(IDS.satelliteHero)
  ) {
    try {
      map.addLayer({
        id: IDS.satelliteHero,
        type: 'symbol',
        source: 'polar_satellites_points',
        minzoom: 0,
        layout: {
          'symbol-placement': 'point',
          'symbol-height-offset': satelliteHeightExpression() as never,
          'icon-image': 'amoh-v9-satellite',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1.04,
            1.5, 1.24,
            3, 1.42,
            6, 1.62,
          ],
          'icon-rotation-alignment': 'viewport',
          'icon-pitch-alignment': 'viewport',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 1,
        },
      } as never);
    } catch {
      // retry on next refresh
    }
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

function hideCompetingCraftLayers(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.id.startsWith(HERO_PREFIX)) continue;

    const source = sourceIdOf(layer);
    const craftSource =
      CRAFT_SOURCES.has(source) ||
      /^polar_aircraft(?:_|$)/.test(source) ||
      /^polar_satellites(?:_|$)/.test(source);

    const craftId =
      /^polar_aircraft(?:-|_|$)/.test(layer.id) ||
      /^polar_satellites(?:-|_|$)/.test(layer.id);

    if (!craftSource && !craftId) continue;

    if (layer.type === 'circle' || layer.type === 'symbol') {
      setLayout(map, layer.id, 'visibility', 'none');
    }
  }
}

function disableOldVisualOverlays(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!OLD_VISUAL_RE.test(layer.id)) continue;
    if (layer.id.startsWith(HERO_PREFIX)) continue;

    setLayout(map, layer.id, 'visibility', 'none');
  }
}

function styleOrbitalTracks(map: MlMap): void {
  const rules: Array<[
    string,
    number,
    number,
    number[] | null,
  ]> = [
    [
      'polar_satellites_orbit_rings-line',
      0.34,
      0.85,
      [1.2, 2.2],
    ],
    [
      'polar_satellites_tracks-line',
      0.28,
      0.78,
      [1.0, 1.8],
    ],
    [
      'polar_satellites_tethers-line',
      0.08,
      0.55,
      [1.0, 2.8],
    ],
    [
      'polar_aircraft-corridors',
      0.14,
      0.70,
      [1.4, 2.4],
    ],
    [
      'polar_aircraft-tethers',
      0.06,
      0.50,
      [1.0, 3.0],
    ],
  ];

  for (const [id, opacity, width, dash] of rules) {
    if (!map.getLayer(id)) continue;

    setPaint(map, id, 'line-opacity', opacity);
    setPaint(map, id, 'line-width', width);

    if (dash) {
      setPaint(map, id, 'line-dasharray', dash);
    }
  }

  setPaint(
    map,
    'polar_satellites_swaths-fill',
    'fill-opacity',
    0.018,
  );
}

function suppressQuantarcticaClutter(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!QUANTARCTICA_RE.test(layer.id)) continue;

    if (layer.type === 'fill' || layer.type === 'raster') {
      setLayout(map, layer.id, 'visibility', 'none');
      continue;
    }

    if (layer.type === 'symbol') {
      setLayout(map, layer.id, 'visibility', 'none');
      continue;
    }

    if (layer.type === 'line') {
      const coastLike = /coast/i.test(layer.id);

      setPaint(
        map,
        layer.id,
        'line-opacity',
        coastLike ? 0.30 : 0.07,
      );

      setPaint(
        map,
        layer.id,
        'line-width',
        coastLike ? 0.70 : 0.38,
      );
    }
  }
}

function ensureReferenceLabels(map: MlMap): void {
  const data = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-28, -84.4],
        },
        properties: {
          name: 'ANTÁRTIDA',
          kind: 'continent',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-63.5, -68.0],
        },
        properties: {
          name: 'Península Antártica',
          kind: 'region',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-41, -58.5],
        },
        properties: {
          name: 'Mar de Scotia',
          kind: 'sea',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-49, -71.5],
        },
        properties: {
          name: 'Mar de Weddell',
          kind: 'sea',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-102, -62.0],
        },
        properties: {
          name: 'Océano Austral',
          kind: 'ocean',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-67, -57.4],
        },
        properties: {
          name: 'Pasaje de Drake',
          kind: 'sea',
        },
      },
    ],
  } as const;

  if (!map.getSource(IDS.polarLabelSource)) {
    try {
      map.addSource(
        IDS.polarLabelSource,
        {
          type: 'geojson',
          data: data as never,
        },
      );
    } catch {
      return;
    }
  }

  if (!map.getLayer(IDS.polarLabels)) {
    try {
      map.addLayer({
        id: IDS.polarLabels,
        type: 'symbol',
        source: IDS.polarLabelSource,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Roboto Regular'],
          'text-size': [
            'match',
            ['get', 'kind'],
            'continent', 17,
            'ocean', 13,
            'region', 13,
            11.5,
          ],
          'text-letter-spacing': [
            'match',
            ['get', 'kind'],
            'continent', 0.22,
            0.03,
          ],
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': [
            'match',
            ['get', 'kind'],
            'continent', '#e7fbff',
            'ocean', '#36dff2',
            'region', '#d8fbff',
            '#74eaf7',
          ],
          'text-halo-color': 'rgba(0,9,16,0.92)',
          'text-halo-width': 2,
          'text-opacity': 0.90,
        },
      } as never);
    } catch {
      // retry next refresh
    }
  }
}

function visibleHeatLayers(map: MlMap): string[] {
  const layers: string[] = [];

  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== 'heatmap') continue;
    if (!RUNTIME_HEAT_RE.test(layer.id)) continue;

    let visible = true;

    try {
      visible =
        map.getLayoutProperty(
          layer.id,
          'visibility',
        ) !== 'none';
    } catch {
      visible = true;
    }

    if (visible) layers.push(layer.id);
  }

  return layers;
}

function heatOpacity(activeCount: number): number {
  if (activeCount <= 1) return 0.78;
  if (activeCount === 2) return 0.54;
  if (activeCount === 3) return 0.41;
  if (activeCount === 4) return 0.33;
  return 0.28;
}

function styleActualHeatmaps(map: MlMap): void {
  if ((window as any).__amohV10DeckHeatEnabled) return;
  const active = visibleHeatLayers(map);
  const opacity = heatOpacity(active.length);

  const weight = [
    '*',
    [
      'coalesce',
      ['get', '_amoh_weight_norm'],
      0.25,
    ],
    0.72,
  ];

  const intensity = [
    'interpolate',
    ['linear'],
    ['zoom'],
    0, 0.52,
    1.5, 0.66,
    3, 0.82,
    5, 1.00,
    8, 1.20,
  ];

  const radius = [
    'interpolate',
    ['linear'],
    ['zoom'],
    0, 5,
    1.5, 8,
    3, 12,
    5, 20,
    8, 32,
  ];

  const color = [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0.00, 'rgba(0,14,25,0)',
    0.10, 'rgba(0,167,255,0.06)',
    0.22, 'rgba(0,219,255,0.20)',
    0.38, 'rgba(0,235,169,0.44)',
    0.54, 'rgba(159,244,78,0.64)',
    0.68, 'rgba(246,235,65,0.78)',
    0.80, 'rgba(255,165,42,0.90)',
    0.91, 'rgba(255,77,34,0.97)',
    1.00, 'rgba(255,28,28,1)',
  ];

  for (const id of active) {
    setPaint(map, id, 'heatmap-weight', weight);
    setPaint(map, id, 'heatmap-intensity', intensity);
    setPaint(map, id, 'heatmap-radius', radius);
    setPaint(map, id, 'heatmap-color', color);
    setPaint(map, id, 'heatmap-opacity', opacity);

    try {
      map.moveLayer(id);
    } catch {
      // non-fatal
    }
  }

  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== 'circle') continue;

    const source = sourceIdOf(layer);
    const heatLike =
      /^amoh-runtime-points-/i.test(source) ||
      /heat|density|fauna|krill|fishing|nuclear|seismic/i.test(layer.id);

    if (!heatLike) continue;

    setPaint(map, layer.id, 'circle-opacity', 0.02);
    setPaint(map, layer.id, 'circle-stroke-opacity', 0);
    setPaint(map, layer.id, 'circle-radius', 0.60);
    setPaint(map, layer.id, 'circle-blur', 0.06);
  }
}

function promoteReferenceLayers(map: MlMap): void {
  for (const id of [
    IDS.aircraftGlow,
    IDS.satelliteGlow,
    IDS.aircraftHero,
    IDS.satelliteHero,
    IDS.polarLabels,
  ]) {
    if (!map.getLayer(id)) continue;

    try {
      map.moveLayer(id);
    } catch {
      // non-fatal
    }
  }
}

function featureCount(
  map: MlMap,
  sourceId: string,
): number {
  if (!map.getSource(sourceId)) return 0;

  try {
    return map.querySourceFeatures(sourceId).length;
  } catch {
    return 0;
  }
}

function diagnostics(map: MlMap): void {
  const heat = visibleHeatLayers(map);

  (window as any).__amohReferenceV9 = {
    version: '9.0',
    projection: (() => {
      try {
        return map.getProjection?.()?.type ?? null;
      } catch {
        return null;
      }
    })(),
    camera: {
      center: map.getCenter().toArray(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
    },
    images: {
      plane: map.hasImage('amoh-v9-plane'),
      satellite: map.hasImage('amoh-v9-satellite'),
    },
    sources: {
      aircraft: featureCount(map, 'polar_aircraft'),
      satellites: featureCount(
        map,
        'polar_satellites_points',
      ),
    },
    heroes: {
      aircraft: Boolean(map.getLayer(IDS.aircraftHero)),
      satellite: Boolean(map.getLayer(IDS.satelliteHero)),
    },
    heat: {
      layers: heat,
      count: heat.length,
    },
  };
}

function apply(map: MlMap): void {
  if (!map.isStyleLoaded()) return;

  if (!isGlobe(map)) {
    restoreScientific2D(map);

    for (const id of Object.values(IDS)) {
      if (!map.getLayer(id)) continue;

      try {
        map.setLayoutProperty(id, 'visibility', 'none');
      } catch {
        // ignore
      }
    }

    diagnostics(map);
    return;
  }

  ensureHeroLayers(map);
  ensureReferenceLabels(map);

  for (const id of Object.values(IDS)) {
    if (!map.getLayer(id)) continue;

    try {
      map.setLayoutProperty(id, 'visibility', 'visible');
    } catch {
      // ignore
    }
  }

  disableOldVisualOverlays(map);
  hideCompetingCraftLayers(map);
  styleOrbitalTracks(map);
  suppressQuantarcticaClutter(map);
  styleActualHeatmaps(map);
  promoteReferenceLayers(map);
  diagnostics(map);
}

export function installReferenceLockV9(
  map: MlMap,
): Controller {
  const existing = controllers.get(map);
  if (existing) return existing;

  let destroyed = false;
  let timer = 0;

  const refresh = (): void => {
    if (destroyed) return;
    apply(map);
  };

  const schedule = (): void => {
    if (destroyed) return;

    window.clearTimeout(timer);
    timer = window.setTimeout(refresh, 30);
  };

  map.on('styledata', schedule);
  map.on('idle', schedule);
  map.on('moveend', schedule);
  map.on('zoomend', schedule);

  const interval =
    window.setInterval(refresh, 250);

  schedule();

  const controller: Controller = {
    refresh,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;

      window.clearTimeout(timer);
      window.clearInterval(interval);

      map.off('styledata', schedule);
      map.off('idle', schedule);
      map.off('moveend', schedule);
      map.off('zoomend', schedule);

      restoreScientific2D(map);

      for (const id of [
        IDS.aircraftGlow,
        IDS.aircraftHero,
        IDS.satelliteGlow,
        IDS.satelliteHero,
        IDS.polarLabels,
      ]) {
        if (!map.getLayer(id)) continue;

        try {
          map.removeLayer(id);
        } catch {
          // ignore
        }
      }

      if (map.getSource(IDS.polarLabelSource)) {
        try {
          map.removeSource(IDS.polarLabelSource);
        } catch {
          // ignore
        }
      }

      controllers.delete(map);
    },
  };

  controllers.set(map, controller);
  return controller;
}
