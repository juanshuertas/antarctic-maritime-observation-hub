import type { Map as MlMap } from 'maplibre-gl';
import {
  latLngToCell,
  cellToBoundary,
  cellArea,
  UNITS,
  polygonToCells,
  gridPathCells
} from 'h3-js';

export type CrossMode = 'overlap' | 'composite' | 'contrast';

export type AnalysisLayerDefinition = {
  id: string;
  label: string;
  color: string;
  aliases: string[];
  weightKeys: string[];
  weightMode?: 'numeric' | 'presence';
};

export type CrossAnalysisResult = {
  type: 'FeatureCollection';
  features: any[];
  meta: {
    method: string;
    mode: CrossMode;
    resolution: number;
    layers: string[];
    labels: string[];
    cells: number;
    unionCells: number;
    intersectionCells: number;
    jaccard: number | null;
    overlapPct: number | null;
    pearson: number | null;
    spearman: number | null;
    areaKm2: number;
    temporalAlignment: 'UNVERIFIED_CLIENT_SIDE';
    causal: false;
    generatedAt: string;
  };
};

export const ANALYSIS_LAYER_CATALOG: AnalysisLayerDefinition[] = [
  {
    id: 'fauna_krill',
    label: 'Krill',
    color: '#22c55e',
    aliases: ['fauna_krill', 'fauna_krill_swarms', 'krill'],
    weightKeys: ['biomass_density_g_m2', 'school_biomass_tons', 'biomass', 'density', 'weight']
  },
  {
    id: 'penguin_colonies',
    label: 'Pingüinos',
    color: '#c084fc',
    aliases: ['penguin_colonies', 'emperor_penguin_colonies', 'fauna_penguins'],
    weightKeys: ['population_estimate', 'population', 'individuals', 'count', 'density']
  },
  {
    id: 'whales',
    label: 'Cetáceos',
    color: '#38bdf8',
    aliases: ['whales', 'fauna_cetaceans', 'cetaceans'],
    weightKeys: ['pod_size', 'individuals', 'count', 'density', 'weight']
  },
  {
    id: 'fisheries_effort',
    label: 'Pesca GFW',
    color: '#ff8a4c',
    aliases: ['fisheries_effort', 'gfw_fishing_effort', 'gfw_effort'],
    weightKeys: ['fishing_hours', 'effort', 'hours', 'value', 'intensity']
  },
  {
    id: 'seismic_events',
    label: 'Sismicidad',
    color: '#ff827d',
    aliases: ['seismic_events', 'seismic_heatmap', 'earthscope-seismic', 'scotia-seismic'],
    weightKeys: ['magnitude', 'mag', 'intensity', 'weight']
  },
  {
    id: 'maris_nuclear',
    label: 'Radioactividad',
    color: '#ff5e8a',
    aliases: ['maris_nuclear', 'nuclear_contamination', 'nuclear_sites'],
    weightKeys: ['activity_bq_m3', 'activity', 'concentration', 'cesium_137', 'cs137', 'tritium']
  },
  {
    id: 'tourism_routes',
    label: 'Turismo / rutas',
    color: '#eab308',
    aliases: ['tourism_routes', 'iaato_routes', 'tourism_vessels', 'influencer_tourism_footprint'],
    weightKeys: ['passengers', 'visits', 'landings', 'density'],
    weightMode: 'presence'
  },
  {
    id: 'aspa',
    label: 'ASPA',
    color: '#fb7185',
    aliases: ['aspa', 'protected_area'],
    weightKeys: ['weight'],
    weightMode: 'presence'
  },
  {
    id: 'ccamlr_mpa',
    label: 'MPA CCAMLR',
    color: '#34d399',
    aliases: ['ccamlr_mpa', 'ccamlr_mpas', 'marine_protected'],
    weightKeys: ['weight'],
    weightMode: 'presence'
  },
  {
    id: 'polar_friction_sectors',
    label: 'Fricción polar',
    color: '#f59e0b',
    aliases: ['polar_friction_sectors', 'grey_zones_defense', 'grey_zones_buffers'],
    weightKeys: ['polar_friction_index', 'tension_weight', 'weight', 'density']
  },
  {
    id: 'quantarctica_ice',
    label: 'Hielo / plataformas',
    color: '#caf9f7',
    aliases: ['quantarctica_ice', 'ice_shelves', 'ice_shelf'],
    weightKeys: ['weight'],
    weightMode: 'presence'
  },
  {
    id: 'antarctic_fauna',
    label: 'Fauna total',
    color: '#72e0b5',
    aliases: ['antarctic_fauna', 'fauna_density', 'fauna_polar'],
    weightKeys: ['density', 'individuals', 'count', 'weight']
  }
];

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '_');

const matches = (value: string, aliases: string[]) => {
  const n = normalize(value);
  return aliases.some((alias) => n.includes(normalize(alias)));
};

function getStyleLayersForDefinition(map: MlMap, def: AnalysisLayerDefinition) {
  return (map.getStyle()?.layers || []).filter((layer: any) =>
    matches(layer.id, [def.id, ...def.aliases])
  ) as any[];
}

function visible(map: MlMap, id: string) {
  try {
    return map.getLayoutProperty(id, 'visibility') !== 'none';
  } catch {
    return true;
  }
}

export function discoverAnalysisLayers(map: MlMap) {
  return ANALYSIS_LAYER_CATALOG
    .map((def) => {
      const styleLayers = getStyleLayersForDefinition(map, def);
      const layerIds = styleLayers.map((l: any) => l.id);
      const sources = Array.from(
        new Set(
          styleLayers
            .map((l: any) => l.source)
            .filter((s: any) => typeof s === 'string')
        )
      ) as string[];

      return {
        ...def,
        present: styleLayers.length > 0,
        visible: styleLayers.some((l: any) => visible(map, l.id)),
        layerIds,
        sources
      };
    })
    .filter((item) => item.present);
}

function numericWeight(
  properties: Record<string, any> | null | undefined,
  def: AnalysisLayerDefinition
) {
  if (def.weightMode === 'presence') return 1;

  const p = properties || {};

  for (const key of def.weightKeys) {
    const value = Number(p[key]);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return 1;
}

function featureKey(feature: any) {
  const id =
    feature?.id ??
    feature?.properties?.id ??
    feature?.properties?.feature_id ??
    feature?.properties?.name ??
    '';

  return `${id}|${JSON.stringify(feature?.geometry ?? null)}`;
}

function collectFeatures(map: MlMap, def: AnalysisLayerDefinition) {
  const styleLayers = getStyleLayersForDefinition(map, def);
  const layerIds = styleLayers.map((l: any) => l.id);
  const sources = Array.from(
    new Set(
      styleLayers
        .map((l: any) => l.source)
        .filter((s: any) => typeof s === 'string')
    )
  ) as string[];

  const features: any[] = [];

  for (const sourceId of sources) {
    try {
      features.push(...(map.querySourceFeatures(sourceId) as any[]));
    } catch {
      // some raster / custom sources cannot be queried
    }
  }

  if (!features.length && layerIds.length) {
    try {
      features.push(
        ...(map.queryRenderedFeatures(undefined, {
          layers: layerIds
        }) as any[])
      );
    } catch {
      // non-fatal
    }
  }

  const deduped = new Map<string, any>();

  for (const feature of features.slice(0, 30000)) {
    deduped.set(featureKey(feature), feature);
  }

  return Array.from(deduped.values());
}

function validLngLat(coord: any): coord is [number, number] {
  return (
    Array.isArray(coord) &&
    coord.length >= 2 &&
    Number.isFinite(Number(coord[0])) &&
    Number.isFinite(Number(coord[1])) &&
    Number(coord[0]) >= -180 &&
    Number(coord[0]) <= 180 &&
    Number(coord[1]) >= -90 &&
    Number(coord[1]) <= 90
  );
}

function pointCell(coord: any, resolution: number) {
  if (!validLngLat(coord)) return null;

  const [lng, lat] = coord;

  try {
    return latLngToCell(lat, lng, resolution);
  } catch {
    return null;
  }
}

function lineCells(coords: any[], resolution: number) {
  const cells = new Set<string>();

  let previous: string | null = null;

  for (const coord of coords || []) {
    const current = pointCell(coord, resolution);
    if (!current) continue;

    cells.add(current);

    if (previous && previous !== current) {
      try {
        const path = gridPathCells(previous, current);
        if (path.length <= 1000) {
          for (const cell of path) cells.add(cell);
        }
      } catch {
        // polar/pentagon discontinuities can make a path undefined
      }
    }

    previous = current;

    if (cells.size > 12000) break;
  }

  return cells;
}

function polygonCells(coords: any, resolution: number) {
  const cells = new Set<string>();

  try {
    const found = polygonToCells(coords, resolution, true);
    for (const cell of found.slice(0, 25000)) {
      cells.add(cell);
    }
    return cells;
  } catch {
    // fall back to boundary sampling below
  }

  const outer = Array.isArray(coords?.[0]) ? coords[0] : [];
  return lineCells(outer, resolution);
}

function geometryCells(geometry: any, resolution: number) {
  const cells = new Set<string>();
  if (!geometry) return cells;

  const add = (items: Iterable<string>) => {
    for (const item of items) {
      cells.add(item);
      if (cells.size > 25000) break;
    }
  };

  switch (geometry.type) {
    case 'Point': {
      const cell = pointCell(geometry.coordinates, resolution);
      if (cell) cells.add(cell);
      break;
    }

    case 'MultiPoint':
      for (const coord of geometry.coordinates || []) {
        const cell = pointCell(coord, resolution);
        if (cell) cells.add(cell);
      }
      break;

    case 'LineString':
      add(lineCells(geometry.coordinates || [], resolution));
      break;

    case 'MultiLineString':
      for (const line of geometry.coordinates || []) {
        add(lineCells(line, resolution));
      }
      break;

    case 'Polygon':
      add(polygonCells(geometry.coordinates || [], resolution));
      break;

    case 'MultiPolygon':
      for (const polygon of geometry.coordinates || []) {
        add(polygonCells(polygon, resolution));
      }
      break;

    case 'GeometryCollection':
      for (const child of geometry.geometries || []) {
        add(geometryCells(child, resolution));
      }
      break;
  }

  return cells;
}

function aggregateLayer(
  map: MlMap,
  def: AnalysisLayerDefinition,
  resolution: number
) {
  const features = collectFeatures(map, def);
  const values = new Map<string, number>();

  for (const feature of features) {
    const cells = geometryCells(feature.geometry, resolution);
    if (!cells.size) continue;

    const raw = numericWeight(feature.properties, def);
    const robustWeight =
      def.weightMode === 'presence'
        ? 1
        : Math.max(0.01, Math.log1p(Math.max(0, raw)));

    for (const cell of cells) {
      if (def.weightMode === 'presence') {
        values.set(cell, 1);
      } else {
        values.set(
          cell,
          (values.get(cell) || 0) + robustWeight
        );
      }
    }
  }

  return {
    def,
    featureCount: features.length,
    values
  };
}

function percentile(values: number[], p: number) {
  if (!values.length) return 1;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(
    0,
    Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))
  );

  return sorted[index] || 1;
}

function normalizeValues(values: Map<string, number>) {
  const positive = Array.from(values.values()).filter((v) => v > 0);
  const p95 = Math.max(1e-9, percentile(positive, 0.95));

  const out = new Map<string, number>();

  for (const [cell, value] of values) {
    out.set(cell, Math.max(0, Math.min(1, value / p95)));
  }

  return out;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pearson(a: number[], b: number[]) {
  if (a.length < 3 || a.length !== b.length) return null;

  const ma = average(a);
  const mb = average(b);

  let numerator = 0;
  let da = 0;
  let db = 0;

  for (let i = 0; i < a.length; i++) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;

    numerator += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }

  const denominator = Math.sqrt(da * db);
  return denominator > 0 ? numerator / denominator : null;
}

function ranks(values: number[]) {
  const indexed = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);

  const result = new Array(values.length).fill(0);

  let i = 0;

  while (i < indexed.length) {
    let j = i;

    while (
      j + 1 < indexed.length &&
      indexed[j + 1].value === indexed[i].value
    ) {
      j++;
    }

    const rank = (i + j + 2) / 2;

    for (let k = i; k <= j; k++) {
      result[indexed[k].index] = rank;
    }

    i = j + 1;
  }

  return result;
}

function spearman(a: number[], b: number[]) {
  if (a.length < 3 || a.length !== b.length) return null;
  return pearson(ranks(a), ranks(b));
}

function polygonForCell(cell: string) {
  const boundary = cellToBoundary(cell);
  const ring = boundary.map(([lat, lng]) => [lng, lat]);

  if (
    ring.length &&
    (
      ring[0][0] !== ring[ring.length - 1][0] ||
      ring[0][1] !== ring[ring.length - 1][1]
    )
  ) {
    ring.push([...ring[0]]);
  }

  return ring;
}

export function runCrossAnalysis(
  map: MlMap,
  layerIds: string[],
  resolution = 4,
  mode: CrossMode = 'overlap'
): CrossAnalysisResult {
  const defs = layerIds
    .map((id) =>
      ANALYSIS_LAYER_CATALOG.find((def) => def.id === id)
    )
    .filter(Boolean) as AnalysisLayerDefinition[];

  if (defs.length < 2) {
    throw new Error('Select at least two analysis layers.');
  }

  if (defs.length > 4) {
    throw new Error('Use up to four layers per cross-analysis.');
  }

  if (mode === 'contrast' && defs.length !== 2) {
    throw new Error('Contrast mode requires exactly two layers.');
  }

  const aggregated = defs.map((def) =>
    aggregateLayer(map, def, resolution)
  );

  const normalized = aggregated.map((item) => ({
    ...item,
    normalized: normalizeValues(item.values)
  }));

  const union = new Set<string>();

  for (const item of normalized) {
    for (const cell of item.normalized.keys()) {
      union.add(cell);
    }
  }

  const features: any[] = [];
  let intersectionCells = 0;
  let areaKm2 = 0;

  for (const cell of union) {
    const values = normalized.map(
      (item) => item.normalized.get(cell) || 0
    );

    const present = values.filter((v) => v > 0).length;
    const coverage = present / values.length;
    const allPresent = present === values.length;

    if (allPresent) intersectionCells++;

    let score = 0;
    let sign = 0;

    if (mode === 'overlap') {
      if (!allPresent) continue;

      score = Math.pow(
        values.reduce((product, value) => product * Math.max(value, 1e-6), 1),
        1 / values.length
      );
    }

    if (mode === 'composite') {
      score = average(values) * Math.pow(coverage, 1.35);
      if (score <= 0.02) continue;
    }

    if (mode === 'contrast') {
      sign = values[0] - values[1];
      score = Math.abs(sign);
      if (score <= 0.05) continue;
    }

    const props: Record<string, any> = {
      h3: cell,
      score,
      coverage,
      contributors: present,
      source_count: values.length,
      cross_mode: mode,
      h3_resolution: resolution,
      temporal_alignment: 'UNVERIFIED_CLIENT_SIDE',
      causal: false,
      sign
    };

    normalized.forEach((item, index) => {
      props[`v_${item.def.id}`] = values[index];
      props[`raw_${item.def.id}`] =
        item.values.get(cell) || 0;
    });

    const area = cellArea(cell, UNITS.km2);
    props.area_km2 = area;
    areaKm2 += area;

    features.push({
      type: 'Feature',
      properties: props,
      geometry: {
        type: 'Polygon',
        coordinates: [polygonForCell(cell)]
      }
    });
  }

  features.sort(
    (a, b) =>
      Number(b.properties?.score || 0) -
      Number(a.properties?.score || 0)
  );

  const first = normalized[0]?.normalized || new Map();
  const second = normalized[1]?.normalized || new Map();

  const correlationCells = Array.from(
    new Set([...first.keys(), ...second.keys()])
  );

  const a = correlationCells.map((cell) => first.get(cell) || 0);
  const b = correlationCells.map((cell) => second.get(cell) || 0);

  const firstPresence = new Set(
    Array.from(first.entries())
      .filter(([, value]) => value > 0)
      .map(([cell]) => cell)
  );

  const secondPresence = new Set(
    Array.from(second.entries())
      .filter(([, value]) => value > 0)
      .map(([cell]) => cell)
  );

  const pairUnion = new Set([
    ...firstPresence,
    ...secondPresence
  ]);

  const pairIntersection = Array.from(firstPresence)
    .filter((cell) => secondPresence.has(cell))
    .length;

  const minPresence = Math.min(
    firstPresence.size,
    secondPresence.size
  );

  return {
    type: 'FeatureCollection',
    features,
    meta: {
      method: 'H3 robust percentile-normalized spatial cross-analysis',
      mode,
      resolution,
      layers: defs.map((d) => d.id),
      labels: defs.map((d) => d.label),
      cells: features.length,
      unionCells: union.size,
      intersectionCells,
      jaccard:
        pairUnion.size > 0
          ? pairIntersection / pairUnion.size
          : null,
      overlapPct:
        minPresence > 0
          ? pairIntersection / minPresence
          : null,
      pearson: pearson(a, b),
      spearman: spearman(a, b),
      areaKm2,
      temporalAlignment: 'UNVERIFIED_CLIENT_SIDE',
      causal: false,
      generatedAt: new Date().toISOString()
    }
  };
}

export function renderCrossAnalysis(
  map: MlMap,
  result: CrossAnalysisResult
) {
  const sourceId = 'amoh-cross-analysis-source';
  const fillId = 'amoh-cross-analysis-fill';
  const lineId = 'amoh-cross-analysis-line';

  const existing: any = map.getSource(sourceId);

  if (existing?.setData) {
    existing.setData(result as any);
  } else {
    map.addSource(sourceId, {
      type: 'geojson',
      data: result as any
    });
  }

  const firstSymbol = (map.getStyle()?.layers || [])
    .find((layer: any) => layer.type === 'symbol')
    ?.id;

  if (!map.getLayer(fillId)) {
    map.addLayer(
      {
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'score'],
            0, '#082f49',
            0.20, '#0369a1',
            0.40, '#0891b2',
            0.60, '#2dd4bf',
            0.80, '#a78bfa',
            1, '#fef9c3'
          ],
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'score'],
            0, 0.12,
            0.5, 0.50,
            1, 0.78
          ]
        }
      } as any,
      firstSymbol
    );
  }

  if (!map.getLayer(lineId)) {
    map.addLayer(
      {
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': 'rgba(220,252,255,0.72)',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.35,
            6, 1.1
          ],
          'line-opacity': 0.65
        }
      } as any,
      firstSymbol
    );
  }

  (window as any).__amohCrossAnalysis = result;
}

export function clearCrossAnalysis(map: MlMap) {
  for (const id of [
    'amoh-cross-analysis-line',
    'amoh-cross-analysis-fill'
  ]) {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  }

  if (map.getSource('amoh-cross-analysis-source')) {
    map.removeSource('amoh-cross-analysis-source');
  }

  delete (window as any).__amohCrossAnalysis;
}
