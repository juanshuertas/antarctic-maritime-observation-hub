// SPDX-License-Identifier: AGPL-3.0-or-later
// AMOH_CINEMATIC_GLOBE_VISUAL_PARITY_V7
// Reference-driven continuous heat surfaces. Provider/backend/scientific truth remains untouched.

import type { Map as MlMap } from 'maplibre-gl';

type Controller = {
  destroy: () => void;
  refresh: () => void;
};

type PaintSnapshot = {
  property: string;
  value: unknown;
};

const controllers = new WeakMap<MlMap, Controller>();
const snapshots = new WeakMap<MlMap, Map<string, PaintSnapshot[]>>();

const HEAT_RE =
  /(heat|density|penguin|pinguin|krill|whale|cetace|fishing|gfw|seismic|radioactiv|nuclear|fauna|coloni)/i;

const SATELLITE_IMAGERY_RE =
  /(satellite-layer|imagery|gibs|viirs|sentinel|landsat|modis|esri.*sat|world.*imagery)/i;

const V7_PREFIX = 'amoh-v7-continuous-heat-';

function projectionType(map: MlMap): string {
  try {
    const projection = map.getProjection?.() as { type?: string } | undefined;
    return String(projection?.type ?? '');
  } catch {
    return '';
  }
}

function layerVisible(map: MlMap, id: string): boolean {
  try {
    return map.getLayoutProperty(id, 'visibility') !== 'none';
  } catch {
    return true;
  }
}

function satelliteImageryVisible(map: MlMap): boolean {
  const layers = map.getStyle()?.layers ?? [];

  for (const layer of layers) {
    if (!SATELLITE_IMAGERY_RE.test(layer.id)) continue;
    if (!layerVisible(map, layer.id)) continue;

    if (layer.type === 'raster') {
      try {
        const opacity = map.getPaintProperty(layer.id, 'raster-opacity' as never);
        if (typeof opacity === 'number') {
          if (opacity > 0.01) return true;
          continue;
        }
      } catch {
        return true;
      }
      return true;
    }

    if (/satellite-layer|imagery|gibs|viirs/i.test(layer.id)) {
      return true;
    }
  }

  return false;
}

function immersiveMode(map: MlMap): boolean {
  if (projectionType(map).toLowerCase() === 'globe') return true;

  try {
    if (map.getPitch() >= 22) return true;
  } catch {
    // Ignore transient camera state.
  }

  return satelliteImageryVisible(map);
}

function rememberPaint(
  map: MlMap,
  layerId: string,
  property: string,
): void {
  let mapSnapshots = snapshots.get(map);

  if (!mapSnapshots) {
    mapSnapshots = new Map();
    snapshots.set(map, mapSnapshots);
  }

  const current = mapSnapshots.get(layerId) ?? [];
  if (current.some((entry) => entry.property === property)) return;

  try {
    current.push({
      property,
      value: map.getPaintProperty(layerId, property as never),
    });
    mapSnapshots.set(layerId, current);
  } catch {
    // Unsupported paint property.
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
    // Unsupported property or style transition.
  }
}

function restoreNativePaint(map: MlMap): void {
  const mapSnapshots = snapshots.get(map);
  if (!mapSnapshots) return;

  for (const [layerId, entries] of mapSnapshots) {
    if (!map.getLayer(layerId)) continue;

    for (const entry of entries) {
      try {
        map.setPaintProperty(
          layerId,
          entry.property as never,
          entry.value as never,
        );
      } catch {
        // Layer may have been removed by a style transition.
      }
    }
  }

  mapSnapshots.clear();
}

function companionId(nativeId: string): string {
  const safe = nativeId
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .slice(0, 64);

  let hash = 2166136261;
  for (let i = 0; i < nativeId.length; i += 1) {
    hash ^= nativeId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return `${V7_PREFIX}${safe}-${(hash >>> 0).toString(16)}`;
}

function heatColor(): unknown {
  return [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0.00, 'rgba(0,18,32,0)',
    0.08, 'rgba(0,171,255,0.05)',
    0.20, 'rgba(0,220,255,0.18)',
    0.34, 'rgba(0,236,182,0.36)',
    0.49, 'rgba(116,245,101,0.52)',
    0.62, 'rgba(235,246,71,0.68)',
    0.74, 'rgba(255,190,45,0.82)',
    0.86, 'rgba(255,103,32,0.91)',
    0.95, 'rgba(255,48,36,0.96)',
    1.00, 'rgba(255,30,30,0.98)',
  ];
}

function heatRadius(): unknown {
  return [
    'interpolate',
    ['linear'],
    ['zoom'],
    0.5, 13,
    2.0, 18,
    3.5, 25,
    5.5, 34,
    8.0, 46,
    11.0, 60,
  ];
}

function heatIntensity(): unknown {
  return [
    'interpolate',
    ['linear'],
    ['zoom'],
    0.5, 0.86,
    3.0, 1.06,
    6.0, 1.22,
    9.0, 1.36,
  ];
}


function activeHeatLayerCount(map: MlMap): number {
  let count = 0;

  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.id.startsWith(V7_PREFIX)) continue;
    if (!layerVisible(map, layer.id)) continue;

    const source =
      'source' in layer && typeof layer.source === 'string'
        ? layer.source
        : '';

    const heatLike =
      HEAT_RE.test(layer.id) ||
      (source !== '' && HEAT_RE.test(source));

    if (!heatLike) continue;
    if (layer.type !== 'circle' && layer.type !== 'heatmap') continue;

    count += 1;
  }

  return Math.max(1, count);
}

function heatOpacity(map: MlMap): number {
  const count = activeHeatLayerCount(map);

  if (count <= 1) return 0.72;
  if (count === 2) return 0.58;
  if (count === 3) return 0.49;
  return 0.42;
}

function addContinuousCompanion(
  map: MlMap,
  nativeLayer: any,
): void {
  const nativeId = String(nativeLayer?.id ?? '');
  const source = nativeLayer?.source;

  if (!nativeId || typeof source !== 'string') return;
  if (nativeId.startsWith(V7_PREFIX)) return;
  if (!HEAT_RE.test(nativeId) && !HEAT_RE.test(source)) return;

  const id = companionId(nativeId);
  const show = immersiveMode(map) && layerVisible(map, nativeId);

  if (!map.getLayer(id)) {
    const spec: any = {
      id,
      type: 'heatmap',
      source,
      minzoom:
        typeof nativeLayer.minzoom === 'number'
          ? nativeLayer.minzoom
          : 0,
      maxzoom:
        typeof nativeLayer.maxzoom === 'number'
          ? nativeLayer.maxzoom
          : 24,
      layout: {
        visibility: show ? 'visible' : 'none',
      },
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': heatIntensity(),
        'heatmap-color': heatColor(),
        'heatmap-radius': heatRadius(),
        'heatmap-opacity': heatOpacity(map),
      },
    };

    if (typeof nativeLayer['source-layer'] === 'string') {
      spec['source-layer'] = nativeLayer['source-layer'];
    }

    if (Array.isArray(nativeLayer.filter)) {
      spec.filter = nativeLayer.filter;
    }

    try {
      // Place before the original point layer so native click/query behavior remains intact.
      map.addLayer(spec, nativeId);
    } catch {
      // Non-point source or style transition: leave native rendering untouched.
      return;
    }
  }

  try {
    map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
  } catch {
    // Ignore.
  }

  if (!show) return;

  // Remove the isolated glowing-dot look in 3D EARTH / SAT.
  const current = map.getLayer(nativeId) as any;
  if (current?.type === 'circle') {
    setPaintQuiet(map, nativeId, 'circle-opacity', 0.045);
    setPaintQuiet(map, nativeId, 'circle-stroke-opacity', 0.0);
    setPaintQuiet(map, nativeId, 'circle-radius', 0.70);
    setPaintQuiet(map, nativeId, 'circle-blur', 0.08);
  }

  // Bring the continuous analytical surface above raster imagery.
  try {
    map.moveLayer(id);
  } catch {
    // Ignore.
  }
}

function restyleExistingHeatmap(
  map: MlMap,
  layerId: string,
): void {
  if (!immersiveMode(map)) return;

  setPaintQuiet(map, layerId, 'heatmap-intensity', heatIntensity());
  setPaintQuiet(map, layerId, 'heatmap-radius', heatRadius());
  setPaintQuiet(map, layerId, 'heatmap-color', heatColor());
  setPaintQuiet(map, layerId, 'heatmap-opacity', heatOpacity(map));

  try {
    map.moveLayer(layerId);
  } catch {
    // Ignore.
  }
}

function apply(map: MlMap): void {
  if (!map.isStyleLoaded()) return;

  if (!immersiveMode(map)) {
    restoreNativePaint(map);

    for (const layer of map.getStyle()?.layers ?? []) {
      if (!layer.id.startsWith(V7_PREFIX)) continue;
      try {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      } catch {
        // Ignore.
      }
    }
    return;
  }

  const layers = [...(map.getStyle()?.layers ?? [])];

  for (const rawLayer of layers) {
    if (rawLayer.id.startsWith(V7_PREFIX)) continue;

    const layer = rawLayer as any;
    const source =
      typeof layer.source === 'string'
        ? layer.source
        : '';

    if (!HEAT_RE.test(rawLayer.id) && !HEAT_RE.test(source)) {
      continue;
    }

    if (rawLayer.type === 'heatmap') {
      restyleExistingHeatmap(map, rawLayer.id);
      continue;
    }

    if (rawLayer.type === 'circle') {
      addContinuousCompanion(map, layer);
    }
  }
}

export function installImmersiveVisualParityV7(
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
    timer = window.setTimeout(refresh, 70);
  };

  map.on('styledata', schedule);
  map.on('moveend', schedule);
  map.on('zoomend', schedule);

  // Captures mode/layer toggles that do not produce a navigation event.
  const interval = window.setInterval(refresh, 850);

  schedule();

  const controller: Controller = {
    refresh,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;

      window.clearTimeout(timer);
      window.clearInterval(interval);

      map.off('styledata', schedule);
      map.off('moveend', schedule);
      map.off('zoomend', schedule);

      restoreNativePaint(map);

      for (const layer of map.getStyle()?.layers ?? []) {
        if (!layer.id.startsWith(V7_PREFIX)) continue;
        try {
          map.removeLayer(layer.id);
        } catch {
          // Ignore.
        }
      }

      controllers.delete(map);
    },
  };

  controllers.set(map, controller);
  return controller;
}
