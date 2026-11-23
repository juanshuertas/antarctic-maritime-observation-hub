// SPDX-License-Identifier: AGPL-3.0-or-later
// AMOH_CINEMATIC_GRAPHICS_V10_FULL
//
// Graphical-only upgrade on top of the verified V9 live-source architecture.
//
// Goals:
// - premium continuous heat surfaces using deck.gl + MapLibre globe sync;
// - keep V9 real live aircraft/satellite hero geometry and physical altitude;
// - add restrained glow/microtexture instead of GIS "bulbs";
// - polish orbit/air/ship visual hierarchy;
// - reduce visual noise while preserving scientific 2D restoration;
// - improve MapLibre controls/popups/canvas atmosphere without changing data truth.
//
// No provider, backend, PB124, Supabase or GitHub data is mutated.

import type { Map as MlMap } from 'maplibre-gl';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';

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

type LayerSnapshot = {
  layerId: string;
  property: string;
  value: unknown;
};

const controllers = new WeakMap<MlMap, Controller>();
const paintSnapshots = new WeakMap<MlMap, Map<string, LayerSnapshot>>();
const layoutSnapshots = new WeakMap<MlMap, Map<string, LayerSnapshot>>();

const STYLE_ID = 'amoh-v10-cinematic-style';
const VIGNETTE_ID = 'amoh-v10-vignette';
const AURORA_ID = 'amoh-v10-aurora';

const V9_HERO_RE = /^amoh-v9-(?:aircraft|satellite)/i;
const V9_LABEL_RE = /^amoh-v9-polar-labels/i;
const RUNTIME_HEAT_RE = /^amoh-runtime-heat-/i;
const RUNTIME_POINT_RE = /^amoh-runtime-points-/i;
const QUANTARCTICA_RE = /^quantarctica/i;

const SHIP_RE = /(ship|ships|vessel|vessels|ais)/i;
const ORBIT_RE = /(satellites.*(?:orbit|track)|orbit.*satellite)/i;
const AIR_ROUTE_RE = /(aircraft.*(?:corridor|track)|aviation.*(?:route|corridor))/i;

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
    // unsupported paint property
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
    // unsupported layout property
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
    map.setPaintProperty(
      layerId,
      property as never,
      value as never,
    );
  } catch {
    // style transition or unsupported property
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
    map.setLayoutProperty(
      layerId,
      property as never,
      value as never,
    );
  } catch {
    // style transition or unsupported property
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

function installCinematicCss(map: MlMap): void {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;

    style.textContent = `
      .amoh-v10-cinematic .maplibregl-canvas {
        filter:
          saturate(1.075)
          contrast(1.045)
          brightness(0.985);
      }

      .amoh-v10-cinematic .maplibregl-ctrl-group {
        overflow: hidden;
        border: 1px solid rgba(48, 221, 239, 0.20) !important;
        border-radius: 16px !important;
        background:
          linear-gradient(
            180deg,
            rgba(4, 21, 31, 0.86),
            rgba(2, 12, 19, 0.80)
          ) !important;
        box-shadow:
          0 12px 38px rgba(0, 0, 0, 0.36),
          inset 0 1px 0 rgba(180, 252, 255, 0.04) !important;
        backdrop-filter: blur(16px) saturate(1.2);
      }

      .amoh-v10-cinematic .maplibregl-ctrl-group button {
        width: 38px !important;
        height: 38px !important;
        background-color: transparent !important;
      }

      .amoh-v10-cinematic .maplibregl-ctrl-group button:hover {
        background:
          rgba(21, 224, 240, 0.09) !important;
      }

      .amoh-v10-cinematic .maplibregl-popup-content {
        color: #dffbff;
        border: 1px solid rgba(61, 228, 244, 0.27);
        border-radius: 16px;
        background:
          linear-gradient(
            160deg,
            rgba(4, 25, 35, 0.94),
            rgba(1, 13, 21, 0.92)
          );
        box-shadow:
          0 20px 60px rgba(0, 0, 0, 0.46),
          inset 0 1px 0 rgba(188, 252, 255, 0.05);
        backdrop-filter: blur(18px) saturate(1.25);
      }

      .amoh-v10-cinematic .maplibregl-popup-tip {
        border-top-color: rgba(5, 24, 34, 0.96) !important;
        border-bottom-color: rgba(5, 24, 34, 0.96) !important;
      }

      #${VIGNETTE_ID} {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 360ms ease;
        background:
          radial-gradient(
            circle at 50% 48%,
            rgba(0,0,0,0) 42%,
            rgba(0,8,13,0.06) 66%,
            rgba(0,4,8,0.22) 100%
          );
        box-shadow:
          inset 0 0 110px rgba(0, 0, 0, 0.22);
      }

      #${AURORA_ID} {
        position: absolute;
        left: 18%;
        right: 18%;
        top: 6%;
        height: 28%;
        z-index: 1;
        pointer-events: none;
        opacity: 0;
        transition: opacity 480ms ease;
        filter: blur(24px);
        mix-blend-mode: screen;
        transform: perspective(700px) rotateX(66deg);
        background:
          radial-gradient(
            ellipse at 46% 72%,
            rgba(47, 252, 211, 0.10),
            rgba(15, 183, 229, 0.045) 38%,
            rgba(0,0,0,0) 70%
          );
      }

      .amoh-v10-cinematic.amoh-v10-immersive #${VIGNETTE_ID} {
        opacity: 1;
      }

      .amoh-v10-cinematic.amoh-v10-immersive #${AURORA_ID} {
        opacity: 0.48;
      }
    `;

    document.head.appendChild(style);
  }

  const container = map.getContainer();
  container.classList.add('amoh-v10-cinematic');

  if (!container.querySelector(`#${VIGNETTE_ID}`)) {
    const vignette = document.createElement('div');
    vignette.id = VIGNETTE_ID;
    container.appendChild(vignette);
  }

  if (!container.querySelector(`#${AURORA_ID}`)) {
    const aurora = document.createElement('div');
    aurora.id = AURORA_ID;
    container.appendChild(aurora);
  }
}

function setImmersiveDomState(
  map: MlMap,
  immersive: boolean,
): void {
  const container = map.getContainer();

  container.classList.toggle(
    'amoh-v10-immersive',
    immersive,
  );
}

function polishAtmosphere(
  map: MlMap,
  immersive: boolean,
): void {
  if (!immersive) return;

  try {
    map.setSky({
      'sky-color': '#00060b',
      'sky-horizon-blend': 0.046,
      'horizon-color': '#0596b8',
      'horizon-fog-blend': 0.064,
      'fog-color': '#29cce3',
      'fog-ground-blend': 0.030,
    });
  } catch {
    // style may be mid-transition
  }
}

function styleHeroObjects(map: MlMap): void {
  const layers = map.getStyle()?.layers ?? [];

  for (const layer of layers) {
    if (!V9_HERO_RE.test(layer.id)) continue;

    if (layer.type !== 'symbol') continue;

    const isSatellite =
      /satellite/i.test(layer.id);
    const isGlow =
      /glow/i.test(layer.id);

    const size = isSatellite
      ? (
          isGlow
            ? [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.86,
                1.5, 1.04,
                3, 1.20,
                6, 1.38,
              ]
            : [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1.12,
                1.5, 1.32,
                3, 1.52,
                6, 1.72,
              ]
        )
      : (
          isGlow
            ? [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.78,
                1.5, 0.94,
                3, 1.10,
                6, 1.26,
              ]
            : [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.98,
                1.5, 1.16,
                3, 1.34,
                6, 1.52,
              ]
        );

    setLayout(
      map,
      layer.id,
      'icon-size',
      size,
    );

    setPaint(
      map,
      layer.id,
      'icon-opacity',
      isGlow ? 0.90 : 1,
    );
  }

  // Labels remain readable, but only the curated V9 label layer survives.
  for (const layer of layers) {
    if (!V9_LABEL_RE.test(layer.id)) continue;

    setPaint(
      map,
      layer.id,
      'text-opacity',
      0.90,
    );
  }
}

function polishTracksAndShips(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    const source = sourceIdOf(layer);
    const combined = `${layer.id} ${source}`;

    if (layer.type === 'line' && ORBIT_RE.test(combined)) {
      setPaint(
        map,
        layer.id,
        'line-opacity',
        0.26,
      );

      setPaint(
        map,
        layer.id,
        'line-width',
        [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0.55,
          3, 0.82,
          7, 1.10,
        ],
      );
    }

    if (layer.type === 'line' && AIR_ROUTE_RE.test(combined)) {
      setPaint(
        map,
        layer.id,
        'line-opacity',
        0.14,
      );

      setPaint(
        map,
        layer.id,
        'line-width',
        0.65,
      );
    }

    if (SHIP_RE.test(combined)) {
      if (layer.type === 'symbol') {
        setPaint(
          map,
          layer.id,
          'icon-opacity',
          0.94,
        );
      }

      if (layer.type === 'circle') {
        setPaint(
          map,
          layer.id,
          'circle-opacity',
          0.72,
        );
        setPaint(
          map,
          layer.id,
          'circle-stroke-opacity',
          0.45,
        );
      }
    }
  }
}

function cleanImmersiveBase(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!QUANTARCTICA_RE.test(layer.id)) continue;

    if (layer.type === 'symbol') {
      setLayout(
        map,
        layer.id,
        'visibility',
        'none',
      );
      continue;
    }

    if (layer.type === 'fill') {
      setPaint(
        map,
        layer.id,
        'fill-opacity',
        0.02,
      );
      continue;
    }

    if (layer.type === 'line') {
      const coastLike = /coast/i.test(layer.id);

      setPaint(
        map,
        layer.id,
        'line-opacity',
        coastLike ? 0.24 : 0.045,
      );

      setPaint(
        map,
        layer.id,
        'line-width',
        coastLike ? 0.65 : 0.35,
      );
    }
  }
}

function layerIsVisible(
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
  feature: unknown,
): [number, number] | null {
  const geometry =
    (feature as any)?.geometry;

  if (
    geometry?.type === 'Point' &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length >= 2
  ) {
    const lng = Number(
      geometry.coordinates[0],
    );
    const lat = Number(
      geometry.coordinates[1],
    );

    if (
      Number.isFinite(lng) &&
      Number.isFinite(lat)
    ) {
      return [lng, lat];
    }
  }

  return null;
}

function normalizedWeight(
  properties: Record<string, unknown> | null | undefined,
): number {
  if (!properties) return 0.20;

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
    const raw = Number(properties[key]);

    if (
      Number.isFinite(raw) &&
      raw > 0
    ) {
      // Protect the visual layer from outliers while preserving relative signal.
      return Math.max(
        0.05,
        Math.min(
          1,
          raw <= 1
            ? raw
            : Math.log10(raw + 1) / 4,
        ),
      );
    }
  }

  return 0.20;
}

function collectHeatPoints(map: MlMap): HeatPoint[] {
  const out: HeatPoint[] = [];
  const seen = new Set<string>();

  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== 'heatmap') continue;
    if (!RUNTIME_HEAT_RE.test(layer.id)) continue;
    if (!layerIsVisible(map, layer.id)) continue;

    const sourceId = sourceIdOf(layer);
    if (!sourceId) continue;

    let features: any[] = [];

    try {
      features =
        map.querySourceFeatures(sourceId) as any[];
    } catch {
      features = [];
    }

    for (const feature of features) {
      const point = featurePoint(feature);
      if (!point) continue;

      const weight =
        normalizedWeight(
          feature.properties as
            | Record<string, unknown>
            | undefined,
        );

      const id = String(
        feature.id ??
        feature.properties?.id ??
        '',
      );

      const key =
        `${layer.id}:${id}:${point[0].toFixed(5)}:${point[1].toFixed(5)}`;

      if (seen.has(key)) continue;
      seen.add(key);

      out.push({
        lng: point[0],
        lat: point[1],
        weight,
        sourceLayer: layer.id,
      });
    }
  }

  return out;
}

function visibleHeatLayerCount(map: MlMap): number {
  let count = 0;

  for (const layer of map.getStyle()?.layers ?? []) {
    if (
      layer.type === 'heatmap' &&
      RUNTIME_HEAT_RE.test(layer.id) &&
      layerIsVisible(map, layer.id)
    ) {
      count += 1;
    }
  }

  return count;
}

function suppressNativeHeat(
  map: MlMap,
  suppress: boolean,
): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (
      layer.type === 'heatmap' &&
      RUNTIME_HEAT_RE.test(layer.id)
    ) {
      setPaint(
        map,
        layer.id,
        'heatmap-opacity',
        suppress ? 0.015 : 0.78,
      );
    }

    const source = sourceIdOf(layer);

    if (
      layer.type === 'circle' &&
      (
        RUNTIME_POINT_RE.test(source) ||
        /heat|density|fauna|krill|fishing|nuclear|seismic/i.test(layer.id)
      )
    ) {
      setPaint(
        map,
        layer.id,
        'circle-opacity',
        suppress ? 0.018 : 0.65,
      );
      setPaint(
        map,
        layer.id,
        'circle-stroke-opacity',
        suppress ? 0 : 0.25,
      );
    }
  }
}

function heatOpacity(
  activeLayerCount: number,
): number {
  if (activeLayerCount <= 1) return 0.88;
  if (activeLayerCount === 2) return 0.67;
  if (activeLayerCount === 3) return 0.52;
  if (activeLayerCount === 4) return 0.44;
  return 0.36;
}

function hottestSubset(
  data: HeatPoint[],
): HeatPoint[] {
  if (data.length <= 80) {
    return data.filter(
      (d) => d.weight >= 0.58,
    );
  }

  const sorted = [...data].sort(
    (a, b) => b.weight - a.weight,
  );

  return sorted.slice(
    0,
    Math.min(
      320,
      Math.max(
        60,
        Math.round(data.length * 0.10),
      ),
    ),
  );
}

function deckLayers(
  map: MlMap,
  immersive: boolean,
): unknown[] {
  if (!immersive) return [];

  const data = collectHeatPoints(map);
  if (!data.length) return [];

  const activeCount =
    visibleHeatLayerCount(map);

  const opacity =
    heatOpacity(activeCount);

  const zoom = map.getZoom();

  const radius =
    zoom < 1.2
      ? 18
      : zoom < 2.5
        ? 24
        : zoom < 4
          ? 30
          : 38;

  const peakData =
    hottestSubset(data);

  return [
    new HeatmapLayer<HeatPoint>({
      id: 'amoh-v10-deck-heat',
      data,
      getPosition: (d) => [
        d.lng,
        d.lat,
      ],
      getWeight: (d) => d.weight,
      radiusPixels: radius,
      intensity:
        activeCount <= 1
          ? 1.05
          : 0.88,
      threshold: 0.028,
      aggregation: 'SUM',
      opacity,
      colorRange: [
        [0, 160, 255, 0],
        [0, 220, 255, 64],
        [0, 239, 177, 124],
        [155, 244, 74, 171],
        [242, 236, 67, 205],
        [255, 164, 42, 232],
        [255, 71, 32, 250],
        [255, 24, 28, 255],
      ],
      parameters: {
        depthTest: false,
      } as never, // clave WebGL heredada; equivalente deck.gl 9: depthCompare: 'always'
    }),
    new ScatterplotLayer<HeatPoint>({
      id: 'amoh-v10-heat-peaks',
      data: peakData,
      getPosition: (d) => [
        d.lng,
        d.lat,
      ],
      getRadius: (d) =>
        1200 + d.weight * 3400,
      radiusUnits: 'meters',
      radiusMinPixels: 0.5,
      radiusMaxPixels: 2.3,
      getFillColor: (d) =>
        d.weight >= 0.80
          ? [255, 98, 38, 182]
          : [30, 229, 244, 116],
      stroked: false,
      opacity:
        activeCount <= 1
          ? 0.74
          : 0.46,
      pickable: false,
      parameters: {
        depthTest: false,
      } as never, // clave WebGL heredada; equivalente deck.gl 9: depthCompare: 'always'
    }),
  ];
}

function createOverlay(
  map: MlMap,
): MapLibreOverlay {
  // MapLibre v5 globe works directly with MapLibreOverlay.
  // Interleaved mode is preferred; fallback to overlaid mode if the
  // current WebGL context is not WebGL2-capable.
  try {
    const overlay =
      new MapLibreOverlay({
        interleaved: true,
        layers: [],
      });

    map.addControl(
      overlay as never,
    );

    return overlay;
  } catch {
    const overlay =
      new MapLibreOverlay({
        interleaved: false,
        layers: [],
      });

    map.addControl(
      overlay as never,
    );

    return overlay;
  }
}

function promoteV9Heroes(map: MlMap): void {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (
      !V9_HERO_RE.test(layer.id) &&
      !V9_LABEL_RE.test(layer.id)
    ) {
      continue;
    }

    if (!map.getLayer(layer.id)) continue;

    try {
      map.moveLayer(layer.id);
    } catch {
      // style lifecycle
    }
  }
}

function diagnostics(
  map: MlMap,
  deckPointCount: number,
  overlay: MapLibreOverlay,
): void {
  (window as any).__amohCinematicV10 = {
    version: '10.0',
    projection: (() => {
      try {
        return (
          map.getProjection?.()?.type ??
          null
        );
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
    deck: {
      overlay: Boolean(overlay),
      heatPoints: deckPointCount,
      heatLayers:
        visibleHeatLayerCount(map),
    },
    hero: {
      aircraft:
        Boolean(
          map.getLayer(
            'amoh-v9-aircraft-hero',
          ),
        ),
      satellites:
        Boolean(
          map.getLayer(
            'amoh-v9-satellite-hero',
          ),
        ),
    },
  };
}

export function installCinematicGraphicsV10(
  map: MlMap,
): Controller {
  const existing =
    controllers.get(map);

  if (existing) return existing;

  (window as any).__amohV10DeckHeatEnabled = true;

  installCinematicCss(map);

  const overlay =
    createOverlay(map);

  let destroyed = false;
  let timer = 0;

  const refresh = (): void => {
    if (destroyed) return;
    if (!map.isStyleLoaded()) return;

    const immersive =
      isImmersive(map);

    setImmersiveDomState(
      map,
      immersive,
    );

    if (!immersive) {
      restoreScientific2D(map);

      try {
        overlay.setProps({
          layers: [],
        });
      } catch {
        // non-fatal
      }

      suppressNativeHeat(
        map,
        false,
      );

      diagnostics(
        map,
        0,
        overlay,
      );

      return;
    }

    polishAtmosphere(
      map,
      immersive,
    );

    styleHeroObjects(map);
    polishTracksAndShips(map);
    cleanImmersiveBase(map);

    const data =
      collectHeatPoints(map);

    const layers =
      deckLayers(
        map,
        immersive,
      );

    try {
      overlay.setProps({
        layers: layers as never[],
      });
    } catch {
      // deck overlay can be mid-context transition
    }

    suppressNativeHeat(
      map,
      layers.length > 0,
    );

    promoteV9Heroes(map);

    diagnostics(
      map,
      data.length,
      overlay,
    );
  };

  const schedule = (): void => {
    if (destroyed) return;

    window.clearTimeout(timer);

    timer =
      window.setTimeout(
        refresh,
        45,
      );
  };

  map.on('styledata', schedule);
  map.on('idle', schedule);
  map.on('moveend', schedule);
  map.on('zoomend', schedule);

  const interval =
    window.setInterval(
      refresh,
      420,
    );

  schedule();

  const controller: Controller = {
    refresh,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;

      (window as any).__amohV10DeckHeatEnabled = false;

      window.clearTimeout(timer);
      window.clearInterval(interval);

      map.off('styledata', schedule);
      map.off('idle', schedule);
      map.off('moveend', schedule);
      map.off('zoomend', schedule);

      restoreScientific2D(map);

      try {
        map.removeControl(
          overlay as never,
        );
      } catch {
        try {
          overlay.finalize();
        } catch {
          // ignore
        }
      }

      const container =
        map.getContainer();

      container.classList.remove(
        'amoh-v10-cinematic',
        'amoh-v10-immersive',
      );

      container
        .querySelector(`#${VIGNETTE_ID}`)
        ?.remove();

      container
        .querySelector(`#${AURORA_ID}`)
        ?.remove();

      controllers.delete(map);
    },
  };

  controllers.set(
    map,
    controller,
  );

  return controller;
}
