// SPDX-License-Identifier: AGPL-3.0-or-later
// AMOH_DEEP_REFERENCE_PARITY_V8
//
// Structural visual runtime:
// - binds hero aircraft directly to the LIVE `polar_aircraft` source;
// - binds hero satellites directly to the LIVE `polar_satellites_points` source;
// - restyles the ACTUAL `amoh-runtime-heat-*` / canonical heatmap layers;
// - suppresses stale/native map-pin clutter only in globe/SAT modes;
// - restores 2D thematic rendering when returning to MAP.
//
// Provider truth, SGP4 positions, backend data and scientific records are untouched.

import * as maplibregl from 'maplibre-gl';
import type { Map as MlMap } from 'maplibre-gl';

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
  aircraftGlow: 'amoh-v8-live-aircraft-glow',
  aircraftHero: 'amoh-v8-live-aircraft-hero',
  satelliteGlow: 'amoh-v8-live-satellite-glow',
  satelliteHero: 'amoh-v8-live-satellite-hero',
} as const;

const OLD_OVERLAY_RE = /^(amoh-cinematic-|amoh-v[67]-continuous-heat-)/i;
const QUANTARCTICA_RE = /^quantarctica/i;
const HEAT_RE =
  /(amoh-runtime-heat-|heatmap|fishing.*effort|fauna|krill|penguin|whale|cetace|nuclear|seismic|friction)/i;

function key(layerId: string, property: string): string {
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

  const k = key(layerId, property);
  if (root.has(k)) return;

  try {
    root.set(k, {
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

  const k = key(layerId, property);
  if (root.has(k)) return;

  try {
    root.set(k, {
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
    // style transitions are non-fatal
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
    // style transitions are non-fatal
  }
}

function restore2D(map: MlMap): void {
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

function createGlowCanvas(
  rgb: string,
  alpha: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const g = ctx.createRadialGradient(96, 96, 4, 96, 96, 92);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.18, `rgba(${rgb},${alpha * 0.62})`);
  g.addColorStop(0.48, `rgba(${rgb},${alpha * 0.20})`);
  g.addColorStop(0.78, `rgba(${rgb},${alpha * 0.05})`);
  g.addColorStop(1, `rgba(${rgb},0)`);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 192, 192);

  return canvas;
}

function createPlaneCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, 96, 96);
  ctx.translate(48, 48);

  ctx.shadowColor = 'rgba(95,235,255,0.95)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#f7fdff';

  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.lineTo(7, -9);
  ctx.lineTo(34, 1);
  ctx.lineTo(35, 8);
  ctx.lineTo(8, 5);
  ctx.lineTo(7, 28);
  ctx.lineTo(17, 36);
  ctx.lineTo(17, 40);
  ctx.lineTo(0, 35);
  ctx.lineTo(-17, 40);
  ctx.lineTo(-17, 36);
  ctx.lineTo(-7, 28);
  ctx.lineTo(-8, 5);
  ctx.lineTo(-35, 8);
  ctx.lineTo(-34, 1);
  ctx.lineTo(-7, -9);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

function createSatelliteCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 112;
  canvas.height = 112;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, 112, 112);
  ctx.translate(56, 56);

  ctx.shadowColor = 'rgba(87,245,255,1)';
  ctx.shadowBlur = 13;

  ctx.fillStyle = '#f7feff';
  ctx.strokeStyle = '#5fe9ff';
  ctx.lineWidth = 2;

  ctx.fillRect(-13, -13, 26, 26);
  ctx.strokeRect(-13, -13, 26, 26);

  ctx.fillStyle = '#dffcff';
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

  return canvas;
}

/** MapLibre 6 no acepta HTMLCanvasElement en addImage; se entrega como ImageData. */
function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function ensureImages(map: MlMap): void {
  const images: Array<[
    string,
    HTMLCanvasElement,
    Partial<maplibregl.StyleImageMetadata>,
  ]> = [
    [
      'amoh-v8-plane',
      createPlaneCanvas(),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v8-plane-glow',
      createGlowCanvas('230,252,255', 0.62),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v8-satellite',
      createSatelliteCanvas(),
      { pixelRatio: 2 },
    ],
    [
      'amoh-v8-satellite-glow',
      createGlowCanvas('53,244,255', 0.70),
      { pixelRatio: 2 },
    ],
  ];

  for (const [name, image, metadata] of images) {
    if (map.hasImage(name)) continue;

    try {
      map.addImage(name, canvasToImageData(image), metadata);
    } catch {
      // retry on next refresh after style transition
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
          'icon-image': 'amoh-v8-plane-glow',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.62,
            1.5, 0.78,
            3.0, 0.96,
            6.0, 1.18,
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
      // source/style can be mid-update
    }
  }

  if (
    map.getSource('polar_aircraft') &&
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
          'icon-image': 'amoh-v8-plane',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.82,
            1.5, 1.00,
            3.0, 1.18,
            6.0, 1.38,
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
      // source/style can be mid-update
    }
  }

  if (
    map.getSource('polar_satellites_points') &&
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
          'icon-image': 'amoh-v8-satellite-glow',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.72,
            1.5, 0.92,
            3.0, 1.12,
            6.0, 1.32,
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
      // source/style can be mid-update
    }
  }

  if (
    map.getSource('polar_satellites_points') &&
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
          'icon-image': 'amoh-v8-satellite',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.96,
            1.5, 1.18,
            3.0, 1.38,
            6.0, 1.58,
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
      // source/style can be mid-update
    }
  }
}

function disableOldVisualOverlays(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!OLD_OVERLAY_RE.test(layer.id)) continue;
    setLayout(map, layer.id, 'visibility', 'none');
  }
}

function declutterCanonicalCraft(map: MlMap): void {
  const hiddenLayers = [
    'polar_aircraft-ground-shadow',
    'polar_aircraft-nadir-dot',
    'polar_aircraft-glow',
    'polar_aircraft-symbol',
    'polar_satellites_points-nadir-target',
    'polar_satellites_points-nadir-dot',
    'polar_satellites_points-outer',
    'polar_satellites_points-symbol',
  ];

  for (const id of hiddenLayers) {
    if (!map.getLayer(id)) continue;
    setLayout(map, id, 'visibility', 'none');
  }

  const subtleLines: Array<[string, number, number]> = [
    ['polar_aircraft-corridors', 0.16, 0.75],
    ['polar_aircraft-tethers', 0.08, 0.55],
    ['polar_satellites_tracks-line', 0.22, 0.72],
    ['polar_satellites_orbit_rings-line', 0.18, 0.62],
    ['polar_satellites_tethers-line', 0.06, 0.55],
    ['polar_satellites_swaths-line', 0.10, 0.55],
  ];

  for (const [id, opacity, width] of subtleLines) {
    setPaint(map, id, 'line-opacity', opacity);
    setPaint(map, id, 'line-width', width);
  }

  setPaint(map, 'polar_satellites_swaths-fill', 'fill-opacity', 0.025);
}

function suppressQuantarcticaPatchwork(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!QUANTARCTICA_RE.test(layer.id)) continue;

    if (layer.type === 'fill' || layer.type === 'raster') {
      setLayout(map, layer.id, 'visibility', 'none');
      continue;
    }

    if (layer.type === 'line') {
      const coastLike = /coast/i.test(layer.id);
      setPaint(
        map,
        layer.id,
        'line-opacity',
        coastLike ? 0.34 : 0.10,
      );
      setPaint(
        map,
        layer.id,
        'line-width',
        coastLike ? 0.75 : 0.45,
      );
      continue;
    }

    if (layer.type === 'symbol') {
      setPaint(map, layer.id, 'text-opacity', 0.10);
      setPaint(map, layer.id, 'icon-opacity', 0.12);
    }
  }
}

function visibleHeatLayers(map: MlMap): string[] {
  const out: string[] = [];

  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== 'heatmap') continue;
    if (!HEAT_RE.test(layer.id)) continue;

    let visible = true;
    try {
      visible = map.getLayoutProperty(layer.id, 'visibility') !== 'none';
    } catch {
      visible = true;
    }

    if (visible) out.push(layer.id);
  }

  return out;
}

function referenceHeatOpacity(activeCount: number): number {
  if (activeCount <= 1) return 0.86;
  if (activeCount === 2) return 0.62;
  if (activeCount === 3) return 0.49;
  if (activeCount === 4) return 0.42;
  return 0.36;
}

function styleActualHeatmaps(map: MlMap): void {
  const active = visibleHeatLayers(map);
  const opacity = referenceHeatOpacity(active.length);

  const color = [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0.00, 'rgba(0,12,22,0)',
    0.08, 'rgba(0,170,255,0.08)',
    0.20, 'rgba(0,220,255,0.24)',
    0.36, 'rgba(0,235,165,0.46)',
    0.52, 'rgba(159,245,77,0.64)',
    0.66, 'rgba(250,235,67,0.78)',
    0.78, 'rgba(255,168,44,0.90)',
    0.90, 'rgba(255,78,35,0.97)',
    1.00, 'rgba(255,28,28,1)',
  ];

  const radius = [
    'interpolate',
    ['linear'],
    ['zoom'],
    0.0, 13,
    1.5, 20,
    3.0, 28,
    5.0, 38,
    8.0, 52,
  ];

  const intensity = [
    'interpolate',
    ['linear'],
    ['zoom'],
    0.0, 0.88,
    2.0, 1.02,
    4.0, 1.18,
    8.0, 1.34,
  ];

  for (const id of active) {
    setPaint(map, id, 'heatmap-color', color);
    setPaint(map, id, 'heatmap-radius', radius);
    setPaint(map, id, 'heatmap-intensity', intensity);
    setPaint(map, id, 'heatmap-opacity', opacity);

    try {
      map.moveLayer(id);
    } catch {
      // continue
    }
  }

  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== 'circle') continue;
    if (!HEAT_RE.test(layer.id)) continue;

    setPaint(map, layer.id, 'circle-opacity', 0.04);
    setPaint(map, layer.id, 'circle-stroke-opacity', 0.0);
    setPaint(map, layer.id, 'circle-radius', 0.85);
    setPaint(map, layer.id, 'circle-blur', 0.10);
  }
}

function promoteHeroes(map: MlMap): void {
  for (const id of [
    IDS.aircraftGlow,
    IDS.satelliteGlow,
    IDS.aircraftHero,
    IDS.satelliteHero,
  ]) {
    if (!map.getLayer(id)) continue;

    try {
      map.moveLayer(id);
    } catch {
      // style transitions are non-fatal
    }
  }
}

function sourceFeatureCount(map: MlMap, sourceId: string): number {
  if (!map.getSource(sourceId)) return 0;

  try {
    return map.querySourceFeatures(sourceId).length;
  } catch {
    return 0;
  }
}

function writeDiagnostics(map: MlMap): void {
  const heatLayers = visibleHeatLayers(map);

  const root = {
    version: '8.0',
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
    sources: {
      polar_aircraft: sourceFeatureCount(map, 'polar_aircraft'),
      polar_satellites_points: sourceFeatureCount(
        map,
        'polar_satellites_points',
      ),
    },
    heroes: {
      aircraft: Boolean(map.getLayer(IDS.aircraftHero)),
      satellite: Boolean(map.getLayer(IDS.satelliteHero)),
    },
    heat: {
      activeLayers: heatLayers,
      activeCount: heatLayers.length,
      runtimeStatus:
        (window as any).__amohHeatRuntimeStatus ?? null,
    },
    controller: null as Controller | null,
  };

  const previous = (window as any).__amohReferenceV8;
  if (previous?.controller) {
    root.controller = previous.controller;
  }

  (window as any).__amohReferenceV8 = root;
}

function apply(map: MlMap): void {
  if (!map.isStyleLoaded()) return;

  const immersive = isGlobe(map);

  if (!immersive) {
    restore2D(map);

    for (const id of Object.values(IDS)) {
      if (!map.getLayer(id)) continue;
      try {
        map.setLayoutProperty(id, 'visibility', 'none');
      } catch {
        // ignore
      }
    }

    writeDiagnostics(map);
    return;
  }

  ensureHeroLayers(map);

  for (const id of Object.values(IDS)) {
    if (!map.getLayer(id)) continue;
    try {
      map.setLayoutProperty(id, 'visibility', 'visible');
    } catch {
      // ignore
    }
  }

  disableOldVisualOverlays(map);
  declutterCanonicalCraft(map);
  suppressQuantarcticaPatchwork(map);
  styleActualHeatmaps(map);
  promoteHeroes(map);
  writeDiagnostics(map);
}

export function installReferenceVisualParityV8(
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
    timer = window.setTimeout(refresh, 40);
  };

  map.on('styledata', schedule);
  map.on('idle', schedule);
  map.on('moveend', schedule);
  map.on('zoomend', schedule);

  const interval = window.setInterval(refresh, 450);

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

      restore2D(map);

      for (const id of Object.values(IDS)) {
        if (!map.getLayer(id)) continue;
        try {
          map.removeLayer(id);
        } catch {
          // ignore
        }
      }

      controllers.delete(map);
    },
  };

  controllers.set(map, controller);

  (window as any).__amohReferenceV8 = {
    ...((window as any).__amohReferenceV8 ?? {}),
    controller,
  };

  return controller;
}
