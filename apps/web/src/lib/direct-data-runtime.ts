import type { Map as MlMap } from 'maplibre-gl';
import { DIRECT_DATA_BINDINGS, type DirectDataBinding } from './direct-data-bindings.generated';

type ActiveLayers = Record<string, boolean>;

type RuntimeStatus = {
  state: 'native' | 'direct' | 'loading' | 'off' | 'error';
  files?: number;
  features?: number;
  error?: string;
};

declare global {
  interface Window {
    __amohDirectDataStatus?: Record<string, RuntimeStatus>;
  }
}

const status = () => {
  if (!window.__amohDirectDataStatus) window.__amohDirectDataStatus = {};
  return window.__amohDirectDataStatus;
};

const safe = (id: string) => id.replace(/[^A-Za-z0-9_-]/g, '-');

function firstSymbol(map: MlMap): string | undefined {
  return (map.getStyle()?.layers || []).find((x: any) => x.type === 'symbol')?.id;
}

function nativeVisualExists(map: MlMap, logicalId: string): boolean {
  const ownPrefix = `amoh-direct-${safe(logicalId)}-`;
  const variants = [
    logicalId.toLowerCase(),
    logicalId.replace(/_/g, '-').toLowerCase(),
  ];
  return (map.getStyle()?.layers || []).some((layer: any) => {
    const id = String(layer.id || '').toLowerCase();
    if (id.startsWith(ownPrefix.toLowerCase())) return false;
    return variants.some((v) =>
      id === v ||
      id.startsWith(`${v}-`) ||
      id.startsWith(`${v}_`)
    );
  });
}

function idsFor(logicalId: string, index: number) {
  const prefix = `amoh-direct-${safe(logicalId)}-${index}`;
  return {
    source: `${prefix}-source`,
    point: `${prefix}-point`,
    line: `${prefix}-line`,
    fill: `${prefix}-fill`,
    outline: `${prefix}-outline`,
  };
}

function setFallbackVisibility(map: MlMap, logicalId: string, visible: boolean) {
  const binding = DIRECT_DATA_BINDINGS[logicalId];
  if (!binding) return;
  binding.files.forEach((_, index) => {
    const ids = idsFor(logicalId, index);
    [ids.point, ids.line, ids.fill, ids.outline].forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    });
  });
}

function fallbackUrl(file: DirectDataBinding['files'][number]): string | null {
  const normalized = file.relativePath.replace(/\\/g, '/');
  const marker = 'data/web/geojson/';
  const ix = normalized.toLowerCase().indexOf(marker);
  if (ix < 0) return null;
  return `/${normalized.slice(ix)}`;
}

async function fetchGeoJSON(file: DirectDataBinding['files'][number]) {
  const normalized = file.relativePath.replace(/\\/g, '/');
  const dataRelative = normalized.toLowerCase().startsWith('data/')
    ? normalized.slice(5)
    : normalized;
  const direct = `/api/amoh-data/${dataRelative}`;
  const attempts = [direct, fallbackUrl(file)].filter(Boolean) as string[];
  let lastError = 'No URL';
  for (const url of attempts) {
    try {
      const response = await fetch(encodeURI(url), { cache: 'no-store' });
      if (!response.ok) {
        lastError = `${response.status} ${response.statusText} @ ${url}`;
        continue;
      }
      const json = await response.json();
      if (!json || typeof json !== 'object') {
        lastError = `Invalid JSON @ ${url}`;
        continue;
      }
      return { json, url };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(lastError);
}

function geometrySet(data: any): Set<string> {
  const set = new Set<string>();
  const features =
    data?.type === 'FeatureCollection'
      ? data.features || []
      : data?.type === 'Feature'
      ? [data]
      : [];
  for (const feature of features) {
    const type = feature?.geometry?.type;
    if (type) set.add(type);
  }
  return set;
}

function addRenderLayers(
  map: MlMap,
  logicalId: string,
  index: number,
  color: string,
  geometry: Set<string>
) {
  const ids = idsFor(logicalId, index);
  const before = firstSymbol(map);

  const hasPoint = [...geometry].some((x) => x === 'Point' || x === 'MultiPoint');
  const hasLine = [...geometry].some((x) => x === 'LineString' || x === 'MultiLineString');
  const hasPolygon = [...geometry].some((x) => x === 'Polygon' || x === 'MultiPolygon');

  if (hasPolygon && !map.getLayer(ids.fill)) {
    map.addLayer({
      id: ids.fill,
      type: 'fill',
      source: ids.source,
      filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
      paint: {
        'fill-color': color,
        'fill-opacity': 0.18,
      },
    } as any, before);
  }

  if ((hasPolygon || hasLine) && !map.getLayer(ids.line)) {
    map.addLayer({
      id: ids.line,
      type: 'line',
      source: ids.source,
      filter: ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']]],
      paint: {
        'line-color': color,
        'line-width': 1.8,
        'line-opacity': 0.88,
      },
    } as any, before);
  }

  if (hasPolygon && !map.getLayer(ids.outline)) {
    map.addLayer({
      id: ids.outline,
      type: 'line',
      source: ids.source,
      filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
      paint: {
        'line-color': color,
        'line-width': 1.2,
        'line-opacity': 0.95,
      },
    } as any, before);
  }

  if (hasPoint && !map.getLayer(ids.point)) {
    map.addLayer({
      id: ids.point,
      type: 'circle',
      source: ids.source,
      filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
      paint: {
        'circle-color': color,
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          1, 2.4,
          5, 4.2,
          9, 6.2,
        ],
        'circle-opacity': 0.86,
        'circle-stroke-color': '#f8fafc',
        'circle-stroke-width': 0.55,
        'circle-stroke-opacity': 0.8,
      },
    } as any, before);
  }
}

async function ensureBinding(map: MlMap, binding: DirectDataBinding) {
  const logicalId = binding.layerId;

  if (nativeVisualExists(map, logicalId)) {
    setFallbackVisibility(map, logicalId, false);
    status()[logicalId] = {
      state: 'native',
      files: binding.files.length,
      features: binding.totalFeatures,
    };
    return;
  }

  status()[logicalId] = {
    state: 'loading',
    files: binding.files.length,
    features: binding.totalFeatures,
  };

  for (let index = 0; index < binding.files.length; index += 1) {
    const file = binding.files[index];
    const ids = idsFor(logicalId, index);

    if (!map.getSource(ids.source)) {
      const loaded = await fetchGeoJSON(file);
      map.addSource(ids.source, {
        type: 'geojson',
        data: loaded.json,
      } as any);
      addRenderLayers(map, logicalId, index, binding.color, geometrySet(loaded.json));
    } else {
      addRenderLayers(
        map,
        logicalId,
        index,
        binding.color,
        new Set(file.geometryTypes || [])
      );
    }
  }

  setFallbackVisibility(map, logicalId, true);
  status()[logicalId] = {
    state: 'direct',
    files: binding.files.length,
    features: binding.totalFeatures,
  };
}

export async function syncDirectDataLayers(map: MlMap, activeLayers: ActiveLayers) {
  if (!map || !map.getStyle()?.version) return;

  const jobs: Promise<void>[] = [];

  for (const binding of Object.values(DIRECT_DATA_BINDINGS)) {
    const active = !!activeLayers[binding.layerId];

    if (!active) {
      setFallbackVisibility(map, binding.layerId, false);
      status()[binding.layerId] = {
        state: 'off',
        files: binding.files.length,
        features: binding.totalFeatures,
      };
      continue;
    }

    jobs.push(
      ensureBinding(map, binding).catch((err) => {
        setFallbackVisibility(map, binding.layerId, false);
        status()[binding.layerId] = {
          state: 'error',
          files: binding.files.length,
          features: binding.totalFeatures,
          error: err instanceof Error ? err.message : String(err),
        };
        console.warn(`[AMOH DIRECT DATA] ${binding.layerId}:`, err);
      })
    );
  }

  await Promise.allSettled(jobs);
}
