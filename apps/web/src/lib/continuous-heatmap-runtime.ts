import { buildEvidenceRecord } from './friction-evidence';
import { installHeatmapHoverTooltips } from './heatmap-hover-tooltips';
import { buildOceanopoliticalFrictionLayer } from './oceanopolitical-friction-engine';
import type { Map as MlMap } from 'maplibre-gl';

type FeatureCollection = {
  type: 'FeatureCollection';
  features: any[];
};

type HeatConfig = {
  id: string;
  label: string;
  urls: string[];
  weightKeys: string[];
  ramp: [string, string, string, string, string, string];
  baseColor: string;
  edgeColor: string;
  radius: [number, number, number];
  intensity: number;
  opacity: number;
  polygonOverlay?: 'friction' | 'buffer';
};

type RuntimeRecord = {
  active: boolean;
  loaded: boolean;
  url: string | null;
  rawFeatures: number;
  pointFeatures: number;
  error: string | null;
  layerExists: boolean;
};

const CONFIGS: HeatConfig[] = [
  {
    id: 'grey_zones_defense_heatmap',
    label: 'Fricción & Zonas Grises',
    urls: [
      '/data/web/geojson/grey_zones_defense.geojson'
    ],
    weightKeys: [
      'oceanopolitical_friction_index',
      'tension_weight',
      'polar_friction_index',
      'weight',
      'density',
      'magnitude'
    ],
    ramp: ['#2e1065', '#6b21a8', '#be185d', '#f43f5e', '#f59e0b', '#fef3c7'],
    baseColor: '#f43f5e',
    edgeColor: '#fde68a',
    radius: [9, 26, 54],
    intensity: 0.95,
    opacity: 0.72
  },
  {
    id: 'polar_friction_sectors',
    label: 'Sectores Fricción Polar (PFI)',
    urls: [
      '/data/web/geojson/polar_friction_sectors.geojson'
    ],
    weightKeys: [
      'polar_friction_index',
      'tension_weight',
      'weight'
    ],
    ramp: ['#422006', '#92400e', '#d97706', '#f59e0b', '#facc15', '#fef3c7'],
    baseColor: '#f59e0b',
    edgeColor: '#fde68a',
    radius: [10, 30, 58],
    intensity: 0.88,
    opacity: 0.65,
    polygonOverlay: 'friction'
  },
  {
    id: 'grey_zones_buffers',
    label: 'Radios & Buffers SIGINT',
    urls: [
      '/data/web/geojson/grey_zones_buffers.geojson'
    ],
    weightKeys: [
      'tension_weight',
      'weight',
      'density',
      'radius_km',
      'buffer_km'
    ],
    ramp: ['#2e1065', '#5b21b6', '#7c3aed', '#8b5cf6', '#c4b5fd', '#ede9fe'],
    baseColor: '#8b5cf6',
    edgeColor: '#ddd6fe',
    radius: [8, 24, 48],
    intensity: 0.82,
    opacity: 0.60,
    polygonOverlay: 'buffer'
  },
  {
    id: 'fauna_density_heatmap',
    label: 'Fauna Marina (Krill)',
    urls: [
      '/data/web/geojson/fauna_krill_swarms.geojson',
      '/data/web/geojson/fauna_krill.geojson'
    ],
    weightKeys: [
      'biomass_density_g_m2',
      'school_biomass_tons',
      'biomass',
      'density',
      'abundance',
      'count'
    ],
    ramp: ['#052e2b', '#0f766e', '#14b8a6', '#22c55e', '#86efac', '#ecfdf5'],
    baseColor: '#22c55e',
    edgeColor: '#bbf7d0',
    radius: [8, 24, 50],
    intensity: 0.95,
    opacity: 0.70
  },
  {
    id: 'penguin_heatmap',
    label: 'Colonias de Pingüinos',
    urls: [
      '/data/web/geojson/penguin_colonies.geojson',
      '/api/quantarctica/layers/emperor_penguin_colonies'
    ],
    weightKeys: [
      'population',
      'population_estimate',
      'individuals',
      'count',
      'density'
    ],
    ramp: ['#312e81', '#6d28d9', '#9333ea', '#c084fc', '#e879f9', '#fdf4ff'],
    baseColor: '#c084fc',
    edgeColor: '#f5d0fe',
    radius: [7, 22, 44],
    intensity: 0.90,
    opacity: 0.70
  },
  {
    id: 'whales_heatmap',
    label: 'Cetáceos / Ballenas',
    urls: [
      '/data/web/geojson/whales.geojson',
      '/data/web/geojson/fauna_cetaceans.geojson'
    ],
    weightKeys: [
      'individuals',
      'pod_size',
      'count',
      'density',
      'weight'
    ],
    ramp: ['#172554', '#1d4ed8', '#0284c7', '#06b6d4', '#67e8f9', '#ecfeff'],
    baseColor: '#38bdf8',
    edgeColor: '#bae6fd',
    radius: [8, 25, 52],
    intensity: 0.92,
    opacity: 0.70
  },
  {
    id: 'gfw_fishing_effort_heatmap',
    label: 'Esfuerzo Pesquero GFW',
    urls: [
      '/api/gfw/fishing-effort-heatmap'
    ],
    weightKeys: [
      'hours',
      'fishing_hours',
      'apparent_fishing_hours',
      'effort',
      'value'
    ],
    ramp: ['#164e63', '#06b6d4', '#22c55e', '#fde047', '#fb923c', '#ef4444'],
    baseColor: '#ff8a4c',
    edgeColor: '#fed7aa',
    radius: [7, 23, 46],
    intensity: 1.0,
    opacity: 0.76
  },
  {
    id: 'nuclear_contamination_heatmap',
    label: 'Residuos Nucleares',
    urls: [
      '/data/web/geojson/nuclear_sites.geojson'
    ],
    weightKeys: [
      'activity_bq_m3',
      'activity',
      'concentration',
      'cesium_137',
      'cs137',
      'tritium',
      'weight'
    ],
    ramp: ['#3b0764', '#7e22ce', '#c026d3', '#f43f5e', '#fb7185', '#ffe4e6'],
    baseColor: '#ff5e8a',
    edgeColor: '#fbcfe8',
    radius: [8, 24, 48],
    intensity: 0.94,
    opacity: 0.72
  },
  {
    id: 'seismic_heatmap',
    label: 'Concentración Sísmica',
    urls: [
      '/data/web/geojson/seismic_events.geojson',
      '/api/seismic/events'
    ],
    weightKeys: [
      'magnitude',
      'mag',
      'intensity',
      'weight'
    ],
    ramp: ['#450a0a', '#991b1b', '#dc2626', '#f97316', '#fdba74', '#fff7ed'],
    baseColor: '#ff827d',
    edgeColor: '#fecaca',
    radius: [7, 22, 42],
    intensity: 0.95,
    opacity: 0.70
  }
];

type RuntimeState = {
  data: Map<string, {
    raw: FeatureCollection;
    points: FeatureCollection;
    url: string;
  }>;
  loads: Map<string, Promise<void>>;
  active: Record<string, boolean>;
};

const states = new WeakMap<MlMap, RuntimeState>();

function stateFor(map: MlMap) {
  let state = states.get(map);

  if (!state) {
    state = {
      data: new Map(),
      loads: new Map(),
      active: {}
    };

    states.set(map, state);
  }

  return state;
}

function featureCollection(payload: any): FeatureCollection | null {
  if (!payload) return null;

  if (
    payload.type === 'FeatureCollection' &&
    Array.isArray(payload.features)
  ) {
    return payload as FeatureCollection;
  }

  for (const key of [
    'heatmap_points',
    'grid_cells',
    'data',
    'geojson',
    'result'
  ]) {
    const value = payload?.[key];

    if (
      value?.type === 'FeatureCollection' &&
      Array.isArray(value.features)
    ) {
      return value as FeatureCollection;
    }
  }

  if (Array.isArray(payload.features)) {
    return {
      type: 'FeatureCollection',
      features: payload.features
    };
  }

  if (Array.isArray(payload.grid_cells)) {
    const features = payload.grid_cells
      .filter((item: any) => item?.type === 'Feature');

    if (features.length) {
      return {
        type: 'FeatureCollection',
        features
      };
    }
  }

  return null;
}

async function fetchFirst(config: HeatConfig) {
  
  // AMOH_FRICTION_V5_DERIVED
  if (config.id === 'grey_zones_defense_heatmap') {
    const derivedBase =
      await buildOceanopoliticalFrictionLayer();

    // AMOH_FRICTION_EVIDENCE_V52
    const derived = {
      ...derivedBase,
      features: derivedBase.features.map((feature: any) => {
        const evidence =
          buildEvidenceRecord(
            feature.properties || {}
          );

        return {
          ...feature,
          properties: {
            ...(feature.properties || {}),

            evidence_status:
              evidence.status,

            evidence_source:
              evidence.source,

            evidence_source_url:
              evidence.sourceUrl,

            evidence_date:
              evidence.date,

            evidence_confidence:
              evidence.confidence,

            evidence_source_type:
              evidence.sourceType,

            evidence_verification_raw:
              evidence.verificationRaw,

            evidence_reason:
              evidence.reason,

            source_claim_visibility:
              evidence.claimVisibility,

            provenance_version:
              'AMOH-PROVENANCE-V5.2',

            analytical_framework:
              'AMOH-CODENAL-CIDENAL-OCEANOPOLITICS-V5.2'
          }
        };
      })
    };

    const statusCounts =
      derived.features.reduce(
        (
          acc: Record<string, number>,
          feature: any
        ) => {
          const status =
            feature.properties?.evidence_status ??
            'SIN_FUENTE';

          acc[status] =
            (acc[status] || 0) + 1;

          return acc;
        },
        {}
      );

    (window as any).__amohFrictionEvidenceSummary = {
      version: '5.2',
      records: derived.features.length,
      statuses: statusCounts,
      recordsWithSource:
        derived.features.filter(
          (feature: any) =>
            Boolean(
              feature.properties?.evidence_source ||
              feature.properties?.evidence_source_url
            )
        ).length,
      sensitiveClaimsPolicy:
        'WITHHOLD_FROM_TOOLTIP_UNLESS_SEPARATELY_CORROBORATED'
    };
    return {
      raw: derived,
      url: 'derived://AMOH-CODENAL-CIDENAL-OCEANOPOLITICS-V5.2'
    };
  }
let lastError = '';

  for (const url of config.urls) {
    try {
      const response = await fetch(url, {
        cache: 'no-store'
      });

      if (!response.ok) {
        lastError = `${url} -> HTTP ${response.status}`;
        continue;
      }

      const payload = await response.json();
      const fc = featureCollection(payload);

      if (!fc || !fc.features.length) {
        lastError = `${url} -> empty/unsupported GeoJSON`;
        continue;
      }

      return {
        raw: fc,
        url
      };
    } catch (err) {
      lastError = `${url} -> ${
        err instanceof Error ? err.message : String(err)
      }`;
    }
  }

  throw new Error(
    lastError || `No source available for ${config.id}`
  );
}

function finiteNumber(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function rawWeight(properties: any, config: HeatConfig) {
  const props = properties || {};

  for (const key of config.weightKeys) {
    const value = finiteNumber(props[key]);

    if (value != null && value >= 0) {
      return value;
    }
  }

  return 1;
}

function validCoord(value: any): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1])) &&
    Number(value[0]) >= -180 &&
    Number(value[0]) <= 180 &&
    Number(value[1]) >= -90 &&
    Number(value[1]) <= 90
  );
}

function centroid(coords: any[]): [number, number] | null {
  const valid = coords.filter(validCoord);

  if (!valid.length) return null;

  let sx = 0;
  let sy = 0;

  for (const [x, y] of valid) {
    sx += Number(x);
    sy += Number(y);
  }

  return [
    sx / valid.length,
    sy / valid.length
  ];
}

function sampleLine(coords: any[]) {
  const valid = coords.filter(validCoord);

  if (!valid.length) return [];

  const step = Math.max(
    1,
    Math.floor(valid.length / 18)
  );

  const out: [number, number][] = [];

  for (let i = 0; i < valid.length; i += step) {
    out.push(valid[i]);
  }

  if (
    valid.length > 1 &&
    out[out.length - 1] !== valid[valid.length - 1]
  ) {
    out.push(valid[valid.length - 1]);
  }

  return out;
}

function pointsFromGeometry(geometry: any): [number, number][] {
  if (!geometry) return [];

  switch (geometry.type) {
    case 'Point':
      return validCoord(geometry.coordinates)
        ? [geometry.coordinates]
        : [];

    case 'MultiPoint':
      return (geometry.coordinates || [])
        .filter(validCoord);

    case 'LineString':
      return sampleLine(
        geometry.coordinates || []
      );

    case 'MultiLineString':
      return (geometry.coordinates || [])
        .flatMap((line: any[]) =>
          sampleLine(line || [])
        );

    case 'Polygon': {
      const ring =
        Array.isArray(geometry.coordinates?.[0])
          ? geometry.coordinates[0]
          : [];

      const center = centroid(ring);
      const boundary = sampleLine(ring);

      return center
        ? [center, ...boundary.filter((_, i) => i % 3 === 0)]
        : boundary;
    }

    case 'MultiPolygon':
      return (geometry.coordinates || [])
        .flatMap((polygon: any[]) => {
          const ring =
            Array.isArray(polygon?.[0])
              ? polygon[0]
              : [];

          const center = centroid(ring);
          const boundary = sampleLine(ring);

          return center
            ? [center, ...boundary.filter((_, i) => i % 3 === 0)]
            : boundary;
        });

    case 'GeometryCollection':
      return (geometry.geometries || [])
        .flatMap((g: any) =>
          pointsFromGeometry(g)
        );

    default:
      return [];
  }
}

function prepareData(
  raw: FeatureCollection,
  config: HeatConfig
) {
  const weightedRaw = raw.features
    .slice(0, 30000)
    .map((feature: any) => ({
      ...feature,
      properties: {
        ...(feature.properties || {}),
        _amoh_weight:
          rawWeight(
            feature.properties,
            config
          )
      }
    }));

  const pointFeatures: any[] = [];

  for (const feature of weightedRaw) {
    const coords = pointsFromGeometry(
      feature.geometry
    );

    for (const coord of coords) {
      pointFeatures.push({
        type: 'Feature',
        properties: {
          ...(feature.properties || {}),
          _amoh_parent_geometry:
            feature.geometry?.type ?? null
        },
        geometry: {
          type: 'Point',
          coordinates: coord
        }
      });

      if (pointFeatures.length >= 50000) {
        break;
      }
    }

    if (pointFeatures.length >= 50000) {
      break;
    }
  }

  const values = pointFeatures
    .map((feature) =>
      Number(feature.properties?._amoh_weight)
    )
    .filter((value) =>
      Number.isFinite(value) &&
      value >= 0
    )
    .sort((a, b) => a - b);

  const p95 =
    values.length
      ? values[
          Math.max(
            0,
            Math.min(
              values.length - 1,
              Math.floor((values.length - 1) * 0.95)
            )
          )
        ] || 1
      : 1;

  for (const feature of pointFeatures) {
    const rawValue =
      Number(feature.properties?._amoh_weight) || 1;

    feature.properties._amoh_weight_norm =
      Math.max(
        0.05,
        Math.min(
          1,
          Math.log1p(rawValue) /
            Math.log1p(Math.max(1, p95))
        )
      );
  }

  const rawValues = weightedRaw
    .map((feature) =>
      Number(feature.properties?._amoh_weight)
    )
    .filter((value) =>
      Number.isFinite(value)
    );

  const rawMax = Math.max(
    1,
    ...rawValues
  );

  for (const feature of weightedRaw) {
    feature.properties._amoh_weight_norm =
      Math.max(
        0,
        Math.min(
          1,
          Number(feature.properties?._amoh_weight || 0) /
            rawMax
        )
      );
  }

  return {
    raw: {
      type: 'FeatureCollection',
      features: weightedRaw
    } as FeatureCollection,

    points: {
      type: 'FeatureCollection',
      features: pointFeatures
    } as FeatureCollection
  };
}

function firstSymbol(map: MlMap) {
  return (map.getStyle()?.layers || [])
    .find((layer: any) =>
      layer.type === 'symbol'
    )
    ?.id;
}

function ids(config: HeatConfig) {
  return {
    rawSource: `amoh-runtime-raw-${config.id}`,
    pointSource: `amoh-runtime-points-${config.id}`,
    fill: `amoh-runtime-fill-${config.id}`,
    line: `amoh-runtime-line-${config.id}`,
    heat: `amoh-runtime-heat-${config.id}`,
    legacy: `amoh-layer-${config.id}`
  };
}

export function isContinuousHeatVisible(map: MlMap, layerId: string) {
  const config = CONFIGS.find(({ id }) => id === layerId);
  if (!config) return false;
  const { heat } = ids(config);
  return !!map.getLayer(heat) && map.getLayoutProperty(heat, 'visibility') !== 'none';
}

function setVisible(
  map: MlMap,
  id: string,
  visible: boolean
) {
  if (!map.getLayer(id)) return;

  try {
    map.setLayoutProperty(
      id,
      'visibility',
      visible ? 'visible' : 'none'
    );
  } catch {
    // non-fatal
  }
}

function promote(
  map: MlMap,
  layerIds: string[]
) {
  const before = firstSymbol(map);

  for (const id of layerIds) {
    if (!map.getLayer(id)) continue;

    try {
      map.moveLayer(id, before);
    } catch {
      // non-fatal
    }
  }
}

function addRuntimeLayers(
  map: MlMap,
  config: HeatConfig,
  data: {
    raw: FeatureCollection;
    points: FeatureCollection;
  }
) {
  const x = ids(config);

  if (!map.getSource(x.rawSource)) {
    map.addSource(x.rawSource, {
      type: 'geojson',
      data: data.raw as any
    });
  }

  if (!map.getSource(x.pointSource)) {
    map.addSource(x.pointSource, {
      type: 'geojson',
      data: data.points as any
    });
  }

  const before = firstSymbol(map);

  if (
    config.polygonOverlay &&
    !map.getLayer(x.fill)
  ) {
    map.addLayer(
      {
        id: x.fill,
        type: 'fill',
        source: x.rawSource,
        filter: [
          'match',
          ['geometry-type'],
          ['Polygon', 'MultiPolygon'],
          true,
          false
        ],
        layout: {
          visibility: 'none'
        },
        paint: config.polygonOverlay === 'friction'
          ? {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', '_amoh_weight_norm'],
                0, '#1f2937',
                0.35, '#92400e',
                0.65, '#f59e0b',
                1, '#ef4444'
              ],
              'fill-opacity': 0.16
            }
          : {
              'fill-color': '#8b5cf6',
              'fill-opacity': 0.10
            }
      } as any,
      before
    );
  }

  if (
    config.polygonOverlay &&
    !map.getLayer(x.line)
  ) {
    map.addLayer(
      {
        id: x.line,
        type: 'line',
        source: x.rawSource,
        layout: {
          visibility: 'none'
        },
        paint: {
          'line-color': config.edgeColor,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.6,
            6, 1.8
          ],
          'line-opacity': 0.78
        }
      } as any,
      before
    );
  }

  if (!map.getLayer(x.heat)) {
    map.addLayer(
      {
        id: x.heat,
        type: 'heatmap',
        source: x.pointSource,
        layout: {
          visibility: 'none'
        },
        paint: {
          'heatmap-weight': [
            'coalesce',
            ['get', '_amoh_weight_norm'],
            0.25
          ],

          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, config.intensity * 0.70,
            4, config.intensity,
            8, config.intensity * 1.25
          ],

          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, config.radius[0],
            4, config.radius[1],
            8, config.radius[2]
          ],

          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.10, config.ramp[0],
            0.28, config.ramp[1],
            0.48, config.ramp[2],
            0.68, config.ramp[3],
            0.86, config.ramp[4],
            1, config.ramp[5]
          ],

          'heatmap-opacity': config.opacity
        }
      } as any,
      before
    );
  }

  promote(
    map,
    [
      x.fill,
      x.heat,
      x.line
    ]
  );
}

function writeStatus(
  map: MlMap,
  config: HeatConfig,
  patch: Partial<RuntimeRecord>
) {
  const root =
    ((window as any).__amohHeatRuntimeStatus ||= {});

  const current: RuntimeRecord =
    root[config.id] || {
      active: false,
      loaded: false,
      url: null,
      rawFeatures: 0,
      pointFeatures: 0,
      error: null,
      layerExists: false
    };

  root[config.id] = {
    ...current,
    ...patch,
    layerExists:
      map.getLayer(
        ids(config).heat
      ) != null
  };
}

async function loadConfig(
  map: MlMap,
  config: HeatConfig
) {
  const state = stateFor(map);

  const cached = state.data.get(config.id);
  if (cached) {
    if (!map.getLayer(ids(config).heat)) addRuntimeLayers(map, config, cached);
    return;
  }

  const pending = state.loads.get(config.id);

  if (pending) {
    await pending;
    return;
  }

  const promise = (async () => {
    const fetched = await fetchFirst(config);
    const prepared = prepareData(
      fetched.raw,
      config
    );

    if (!prepared.points.features.length) {
      throw new Error(
        `${config.label}: source has no renderable positions`
      );
    }

    state.data.set(
      config.id,
      {
        ...prepared,
        url: fetched.url
      }
    );

    addRuntimeLayers(
      map,
      config,
      prepared
    );

    writeStatus(
      map,
      config,
      {
        loaded: true,
        url: fetched.url,
        rawFeatures:
          prepared.raw.features.length,
        pointFeatures:
          prepared.points.features.length,
        error: null
      }
    );
  })();

  state.loads.set(
    config.id,
    promise
  );

  try {
    await promise;
  } finally {
    state.loads.delete(config.id);
  }
}

async function setRuntimeLayer(
  map: MlMap,
  config: HeatConfig,
  active: boolean
) {
  const state = stateFor(map);
  state.active[config.id] = active;

  writeStatus(
    map,
    config,
    {
      active
    }
  );

  const x = ids(config);

  if (!active) {
    setVisible(map, x.fill, false);
    setVisible(map, x.line, false);
    setVisible(map, x.heat, false);

    return;
  }

  try {
    await loadConfig(
      map,
      config
    );

    if (!state.active[config.id]) return;

    // The old registry layer can remain in state, but it is hidden once the
    // guaranteed runtime rendering has successfully loaded.
    setVisible(
      map,
      x.legacy,
      false
    );

    setVisible(
      map,
      x.fill,
      !!config.polygonOverlay
    );

    setVisible(
      map,
      x.line,
      !!config.polygonOverlay
    );

    setVisible(
      map,
      x.heat,
      true
    );

    promote(
      map,
      [
        x.fill,
        x.heat,
        x.line
      ]
    );

    const data =
      state.data.get(config.id);

    writeStatus(
      map,
      config,
      {
        active: true,
        loaded: true,
        url: data?.url ?? null,
        rawFeatures:
          data?.raw.features.length ?? 0,
        pointFeatures:
          data?.points.features.length ?? 0,
        error: null
      }
    );

  } catch (err) {
    if (!state.active[config.id]) return;
    const message =
      err instanceof Error
        ? err.message
        : String(err);

    console.warn(
      `[AMOH HEATMAP RUNTIME] ${config.id}:`,
      message
    );

    // Do not suppress the registry fallback when runtime loading fails.
    setVisible(
      map,
      x.legacy,
      true
    );

    writeStatus(
      map,
      config,
      {
        active: true,
        loaded: false,
        error: message
      }
    );
  }
}


export function installContinuousHeatRuntime(map: MlMap) {
  if (!map) return false;

  
  // AMOH_HEAT_HOVER_V5
  installHeatmapHoverTooltips(map);
(window as any).__amohHeatRuntimeMap = map;
  (window as any).__amohHeatRuntimeInstalled = true;

  (window as any).__amohHeatRuntimeForce =
    async (
      id: string,
      active: boolean
    ) => {
      const config =
        CONFIGS.find(
          (item) => item.id === id
        );

      if (!config) {
        throw new Error(
          `Unknown heatmap id: ${id}`
        );
      }

      await setRuntimeLayer(
        map,
        config,
        active
      );

      return (
        (window as any)
          .__amohHeatRuntimeStatus?.[id] ??
        null
      );
    };

  return true;
}
export async function syncContinuousHeatLayers(
  map: MlMap,
  activeLayers: Record<string, boolean>
) {
  if (!map) return;

  
  // AMOH_V41_SYNC_BOOTSTRAP
  installContinuousHeatRuntime(map);
const jobs = CONFIGS.map((config) =>
    setRuntimeLayer(
      map,
      config,
      !!activeLayers[config.id]
    )
  );

  await Promise.allSettled(jobs);

  (window as any).__amohHeatRuntimeForce =
    async (
      id: string,
      active: boolean
    ) => {
      const config =
        CONFIGS.find(
          (item) => item.id === id
        );

      if (!config) {
        throw new Error(
          `Unknown heatmap id: ${id}`
        );
      }

      await setRuntimeLayer(
        map,
        config,
        active
      );

      return (
        (window as any)
          .__amohHeatRuntimeStatus?.[id] ??
        null
      );
    };
}

export const AMOH_CONTINUOUS_HEATMAP_IDS =
  CONFIGS.map((item) => item.id);


// AMOH_V41_AUTO_BOOTSTRAP
// The V4 verifier revealed a lifecycle race: the runtime module loaded,
// but the force bridge was only created after syncContinuousHeatLayers ran.
// Poll briefly for the already-existing AMOH MapLibre instance and install.
if (typeof window !== 'undefined') {
  let amohHeatBootstrapAttempts = 0;

  const amohHeatBootstrap = () => {
    const w = window as any;

    const map =
      w.__amohHeatRuntimeMap ||
      w.__wodEngine?.map ||
      w.__map ||
      w.map ||
      null;

    if (map?.getStyle && map?.addLayer) {
      installContinuousHeatRuntime(map);
      return true;
    }

    return false;
  };

  if (!amohHeatBootstrap()) {
    const timer = window.setInterval(() => {
      amohHeatBootstrapAttempts += 1;

      if (
        amohHeatBootstrap() ||
        amohHeatBootstrapAttempts >= 120
      ) {
        window.clearInterval(timer);
      }
    }, 100);
  }
}




