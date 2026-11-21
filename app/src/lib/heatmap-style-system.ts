import type { Map as MlMap, MapEventType } from 'maplibre-gl';

export type HeatmapProfile = {
  id: string;
  label: string;
  aliases: string[];
  baseColor: string;
  edgeColor: string;
  ramp: string[];
  weightKeys: string[];
  weightMid: number;
  weightHigh: number;
  radius: [number, number, number];
  intensity: number;
  opacity: number;
};

const transparent = (hex: string) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},0)`;
};

export const HEATMAP_PROFILES: HeatmapProfile[] = [
  {
    id: 'grey_zones_specific',
    label: 'Fricción & Zonas Grises',
    aliases: [
      'grey_zones_defense_heatmap'
    ],
    baseColor: '#fb7185',
    edgeColor: '#fecdd3',
    ramp: ['#3f0d12', '#7f1d1d', '#be123c', '#f43f5e', '#fb7185', '#ffe4e6'],
    weightKeys: ['tension_weight', 'polar_friction_index', 'weight', 'density'],
    weightMid: 50,
    weightHigh: 85,
    radius: [8, 24, 48],
    intensity: 0.92,
    opacity: 0.68
  },
  {
    id: 'pfi_specific',
    label: 'Sectores Fricción Polar',
    aliases: [
      'polar_friction_sectors'
    ],
    baseColor: '#f59e0b',
    edgeColor: '#fde68a',
    ramp: ['#422006', '#92400e', '#d97706', '#f59e0b', '#facc15', '#fef3c7'],
    weightKeys: ['polar_friction_index', 'tension_weight', 'weight'],
    weightMid: 50,
    weightHigh: 85,
    radius: [9, 27, 52],
    intensity: 0.88,
    opacity: 0.64
  },
  {
    id: 'sigint_buffers_specific',
    label: 'Radios & Buffers',
    aliases: [
      'grey_zones_buffers'
    ],
    baseColor: '#8b5cf6',
    edgeColor: '#ddd6fe',
    ramp: ['#2e1065', '#5b21b6', '#7c3aed', '#8b5cf6', '#c4b5fd', '#ede9fe'],
    weightKeys: ['tension_weight', 'weight', 'density', 'radius_km'],
    weightMid: 25,
    weightHigh: 100,
    radius: [8, 24, 46],
    intensity: 0.82,
    opacity: 0.60
  },
  {
    id: 'fisheries_effort',
    label: 'Esfuerzo pesquero GFW',
    aliases: [
      'fisheries_effort',
      'gfw_fishing_effort_heatmap',
      'gfw_fishing_effort',
      'gfw_effort',
      'fishing_effort'
    ],
    baseColor: '#ff8a4c',
    edgeColor: '#fed7aa',
    ramp: ['#164e63', '#06b6d4', '#22c55e', '#fde047', '#fb923c', '#ef4444'],
    weightKeys: ['fishing_hours', 'effort', 'hours', 'value', 'intensity'],
    weightMid: 50,
    weightHigh: 500,
    radius: [7, 22, 46],
    intensity: 1.0,
    opacity: 0.78
  },
  {
    id: 'fauna_krill',
    label: 'Krill / fauna marina',
    aliases: [
      'fauna_density_heatmap',
      'fauna_krill',
      'fauna_krill_swarms',
      'krill',
      'krill_heatmap'
    ],
    baseColor: '#3ddc97',
    edgeColor: '#bbf7d0',
    ramp: ['#052e2b', '#0f766e', '#14b8a6', '#22c55e', '#86efac', '#ecfdf5'],
    weightKeys: ['biomass_density_g_m2', 'school_biomass_tons', 'biomass', 'density', 'weight'],
    weightMid: 25,
    weightHigh: 150,
    radius: [8, 25, 50],
    intensity: 0.95,
    opacity: 0.72
  },
  {
    id: 'penguin_colonies',
    label: 'Colonias de pingüinos',
    aliases: [
      'penguin_heatmap',
      'penguin_colonies',
      'emperor_penguin_colonies',
      'fauna_penguins'
    ],
    baseColor: '#c084fc',
    edgeColor: '#f5d0fe',
    ramp: ['#312e81', '#6d28d9', '#a855f7', '#d946ef', '#f0abfc', '#fdf4ff'],
    weightKeys: ['population_estimate', 'population', 'individuals', 'count', 'density'],
    weightMid: 1000,
    weightHigh: 10000,
    radius: [6, 20, 40],
    intensity: 0.88,
    opacity: 0.70
  },
  {
    id: 'whales',
    label: 'Cetáceos / ballenas',
    aliases: [
      'whales_heatmap',
      'whales',
      'fauna_cetaceans',
      'cetaceans'
    ],
    baseColor: '#38bdf8',
    edgeColor: '#bae6fd',
    ramp: ['#172554', '#1d4ed8', '#0284c7', '#06b6d4', '#67e8f9', '#ecfeff'],
    weightKeys: ['pod_size', 'individuals', 'count', 'density', 'weight'],
    weightMid: 5,
    weightHigh: 25,
    radius: [7, 22, 44],
    intensity: 0.90,
    opacity: 0.70
  },
  {
    id: 'seismic_events',
    label: 'Sismicidad',
    aliases: [
      'seismic_heatmap',
      'seismic_events',
      'earthscope-seismic',
      'scotia-seismic'
    ],
    baseColor: '#ff827d',
    edgeColor: '#fecaca',
    ramp: ['#450a0a', '#991b1b', '#dc2626', '#f97316', '#fdba74', '#fff7ed'],
    weightKeys: ['magnitude', 'mag', 'intensity', 'weight'],
    weightMid: 3,
    weightHigh: 6,
    radius: [5, 18, 34],
    intensity: 0.95,
    opacity: 0.72
  },
  {
    id: 'maris_nuclear',
    label: 'Radioactividad marina',
    aliases: [
      'nuclear_contamination_heatmap',
      'maris_nuclear',
      'nuclear_sites',
      'nuclear',
      'subsurface_nuclear'
    ],
    baseColor: '#ff5e8a',
    edgeColor: '#fbcfe8',
    ramp: ['#3b0764', '#7e22ce', '#c026d3', '#f43f5e', '#fb7185', '#ffe4e6'],
    weightKeys: [
      'activity_bq_m3',
      'activity',
      'concentration',
      'cesium_137',
      'cs137',
      'tritium',
      'weight'
    ],
    weightMid: 5,
    weightHigh: 50,
    radius: [6, 20, 40],
    intensity: 0.92,
    opacity: 0.70
  },
  {
    id: 'polar_friction',
    label: 'Fricción / zonas grises',
    aliases: [
      'grey_zones_defense_heatmap',
      'polar_friction_sectors',
      'grey_zones_defense',
      'grey_zones_buffers',
      'friction'
    ],
    baseColor: '#f59e0b',
    edgeColor: '#fde68a',
    ramp: ['#1e293b', '#475569', '#b45309', '#f59e0b', '#f97316', '#ef4444'],
    weightKeys: ['polar_friction_index', 'tension_weight', 'weight', 'density'],
    weightMid: 50,
    weightHigh: 85,
    radius: [8, 26, 52],
    intensity: 0.88,
    opacity: 0.66
  },
  {
    id: 'tourism',
    label: 'Turismo / presión de visita',
    aliases: [
      'tourism_heatmap',
      'tourism_routes',
      'tourism_vessels',
      'influencer_tourism_footprint',
      'tourism'
    ],
    baseColor: '#eab308',
    edgeColor: '#fef08a',
    ramp: ['#365314', '#65a30d', '#a3e635', '#eab308', '#fde047', '#fefce8'],
    weightKeys: ['passengers', 'visits', 'landings', 'density', 'weight'],
    weightMid: 100,
    weightHigh: 1000,
    radius: [6, 18, 36],
    intensity: 0.82,
    opacity: 0.64
  },
  {
    id: 'fauna_density',
    label: 'Fauna / biodiversidad',
    aliases: [
      'antarctic_fauna',
      'fauna_density',
      'fauna_polar'
    ],
    baseColor: '#72e0b5',
    edgeColor: '#d1fae5',
    ramp: ['#064e3b', '#059669', '#34d399', '#72e0b5', '#a7f3d0', '#ecfdf5'],
    weightKeys: ['density', 'individuals', 'count', 'weight'],
    weightMid: 10,
    weightHigh: 100,
    radius: [7, 22, 44],
    intensity: 0.86,
    opacity: 0.68
  },
  {
    id: 'generic',
    label: 'Densidad',
    aliases: ['heatmap'],
    baseColor: '#58d5e3',
    edgeColor: '#cffafe',
    ramp: ['#0c4a6e', '#0284c7', '#06b6d4', '#58d5e3', '#67e8f9', '#ecfeff'],
    weightKeys: ['weight', 'density', 'magnitude', 'value', 'intensity'],
    weightMid: 1,
    weightHigh: 10,
    radius: [7, 22, 44],
    intensity: 0.85,
    opacity: 0.66
  }
];

const normalizeId = (id: string) =>
  id.toLowerCase().replace(/[^a-z0-9]+/g, '_');

export function getHeatmapProfile(layerId: string): HeatmapProfile {
  const normalized = normalizeId(layerId);

  for (const profile of HEATMAP_PROFILES) {
    if (
      profile.aliases.some((alias) =>
        normalized.includes(normalizeId(alias))
      )
    ) {
      return profile;
    }
  }

  return HEATMAP_PROFILES.find((p) => p.id === 'generic')!;
}

function rawWeightExpression(profile: HeatmapProfile): any[] {
  return [
    'to-number',
    [
      'coalesce',
      ...profile.weightKeys.map((key) => ['get', key]),
      1
    ],
    1
  ];
}

export function buildHeatmapPaint(
  profile: HeatmapProfile,
  activeHeatmaps = 1
): Record<string, any> {
  const raw = rawWeightExpression(profile);

  const blendPenalty = Math.max(
    0.48,
    Math.min(1, 1 / Math.sqrt(Math.max(1, activeHeatmaps)))
  );

  return {
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      raw,
      0, 0.04,
      profile.weightMid, 0.55,
      profile.weightHigh, 1
    ],

    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, profile.intensity * 0.72,
      4, profile.intensity,
      8, profile.intensity * 1.32
    ],

    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, profile.radius[0],
      4, profile.radius[1],
      8, profile.radius[2]
    ],

    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, transparent(profile.ramp[0]),
      0.10, profile.ramp[0],
      0.28, profile.ramp[1],
      0.48, profile.ramp[2],
      0.68, profile.ramp[3],
      0.86, profile.ramp[4],
      1, profile.ramp[5]
    ],

    'heatmap-opacity': profile.opacity * blendPenalty
  };
}

function isVisible(map: MlMap, layerId: string) {
  try {
    return map.getLayoutProperty(layerId, 'visibility') !== 'none';
  } catch {
    return true;
  }
}

function setVisibility(map: MlMap, layerId: string, visible: boolean) {
  if (!map.getLayer(layerId)) return;

  try {
    const current = map.getLayoutProperty(layerId, 'visibility');
    const next = visible ? 'visible' : 'none';
    if (current === next) return;
    map.setLayoutProperty(
      layerId,
      'visibility',
      next
    );
  } catch {
    // non-fatal
  }
}

function firstSymbolLayer(map: MlMap) {
  return (map.getStyle()?.layers || [])
    .find((layer: any) => layer.type === 'symbol')
    ?.id;
}

function companionIds(layerId: string) {
  const safe = normalizeId(layerId);
  return {
    halo: `amoh-heat3d-${safe}-halo`,
    core: `amoh-heat3d-${safe}-core`
  };
}

function create3DCompanions(
  map: MlMap,
  heatLayer: any,
  profile: HeatmapProfile
) {
  const source = heatLayer.source;

  if (!source || typeof source !== 'string') return null;

  const ids = companionIds(heatLayer.id);
  const before = firstSymbolLayer(map);
  const sourceLayer = heatLayer['source-layer'];
  const raw = rawWeightExpression(profile);

  const common: Record<string, any> = {
    id: ids.halo,
    type: 'circle',
    source,
    minzoom: heatLayer.minzoom,
    maxzoom: heatLayer.maxzoom,
    paint: {
      'circle-color': profile.baseColor,
      'circle-radius': [
        'interpolate',
        ['linear'],
        raw,
        0, 4,
        profile.weightMid, 10,
        profile.weightHigh, 18
      ],
      'circle-opacity': 0.22,
      'circle-blur': 0.72,
      'circle-pitch-alignment': 'map',
      'circle-pitch-scale': 'map'
    },
    layout: {
      visibility: 'none'
    }
  };

  if (sourceLayer) {
    common['source-layer'] = sourceLayer;
  }
  // MapLibre rejects an explicitly undefined filter. Native heatmap layers
  // often omit it, so only copy the expression when one is actually present.
  if (Array.isArray(heatLayer.filter)) {
    common.filter = heatLayer.filter;
  }

  if (!map.getLayer(ids.halo)) {
    try {
      map.addLayer(common as any, before);
    } catch (err) {
      console.warn(
        `[AMOH HEAT3D] halo failed for ${heatLayer.id}:`,
        err
      );
      return null;
    }
  }

  const core: Record<string, any> = {
    id: ids.core,
    type: 'circle',
    source,
    minzoom: heatLayer.minzoom,
    maxzoom: heatLayer.maxzoom,
    paint: {
      'circle-color': profile.baseColor,
      'circle-radius': [
        'interpolate',
        ['linear'],
        raw,
        0, 1.6,
        profile.weightMid, 3.3,
        profile.weightHigh, 5.8
      ],
      'circle-opacity': 0.82,
      'circle-blur': 0.10,
      'circle-stroke-color': profile.edgeColor,
      'circle-stroke-width': 0.8,
      'circle-stroke-opacity': 0.76,
      'circle-pitch-alignment': 'map',
      'circle-pitch-scale': 'map'
    },
    layout: {
      visibility: 'none'
    }
  };

  if (sourceLayer) {
    core['source-layer'] = sourceLayer;
  }
  if (Array.isArray(heatLayer.filter)) {
    core.filter = heatLayer.filter;
  }

  if (!map.getLayer(ids.core)) {
    try {
      map.addLayer(core as any, before);
    } catch (err) {
      console.warn(
        `[AMOH HEAT3D] core failed for ${heatLayer.id}:`,
        err
      );
    }
  }

  return ids;
}

function relatedLegacyLayers(
  map: MlMap,
  heatLayer: any
) {
  const source = heatLayer.source;

  if (!source || typeof source !== 'string') return [];

  const ids = companionIds(heatLayer.id);

  return (map.getStyle()?.layers || [])
    .filter((layer: any) =>
      layer.id !== heatLayer.id &&
      layer.id !== ids.halo &&
      layer.id !== ids.core &&
      layer.source === source &&
      (
        layer.type === 'circle' ||
        layer.type === 'symbol'
      )
    )
    .map((layer: any) => layer.id);
}

export function installHeatmapStyleSystem(map: MlMap) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastMode = '';
  let lastActiveCount = -1;
  let lastHeatmapSignature = '';

  const legacyVisibility = new Map<string, string>();

  const hideLegacy = (heatLayer: any) => {
    for (const id of relatedLegacyLayers(map, heatLayer)) {
      if (!legacyVisibility.has(id)) {
        let current = 'visible';

        try {
          current =
            map.getLayoutProperty(id, 'visibility') === 'none'
              ? 'none'
              : 'visible';
        } catch {
          current = 'visible';
        }

        legacyVisibility.set(id, current);
      }

      // Old generic orange/red point fallbacks are suppressed in GLOBE.
      // The semantic V3 companion becomes the only density point surface.
      setVisibility(map, id, false);

    }
  };

  const restoreLegacy = () => {
    for (const [id, visibility] of legacyVisibility) {
      if (map.getLayer(id)) {
        setVisibility(map, id, visibility !== 'none');
      }
    }

    legacyVisibility.clear();
  };

  const apply = () => {
    timer = undefined;

    const projection = map.getProjection()?.type;
    const is3D = projection === 'globe';

    if (!is3D && lastMode === '3D') {
      restoreLegacy();
    }

    const heatLayers = (map.getStyle()?.layers || [])
      .filter((layer: any) => layer.type === 'heatmap') as any[];
    const heatmapSignature = heatLayers.map((layer) => layer.id).join('|');

    const nativeVisible = heatLayers.filter((layer) =>
      isVisible(map, layer.id)
    );

    const activeCount = Math.max(1, nativeVisible.length);
    const visualStateChanged =
      lastMode !== (is3D ? '3D' : '2D') ||
      lastActiveCount !== activeCount ||
      lastHeatmapSignature !== heatmapSignature;

    for (const heatLayer of heatLayers) {
      const profile = getHeatmapProfile(heatLayer.id);
      const ids = create3DCompanions(map, heatLayer, profile);

      if (!ids) continue;

      if (!is3D) {
        const paint = buildHeatmapPaint(profile, activeCount);

        if (visualStateChanged) {
          for (const [property, value] of Object.entries(paint)) {
            try {
              map.setPaintProperty(
                heatLayer.id,
                property as any,
                value as any
              );
            } catch {
              // non-fatal
            }
          }
        }

        setVisibility(map, ids.halo, false);
        setVisibility(map, ids.core, false);
        continue;
      }

      const observedActive = isVisible(map, heatLayer.id);

      // Native heatmaps remain in the style/store state but become transparent
      // on the globe. This avoids fighting WorkspaceStore visibility.
      if (visualStateChanged) {
        try {
          map.setPaintProperty(
            heatLayer.id,
            'heatmap-opacity',
            0
          );
        } catch {
          // non-fatal
        }
      }

      if (observedActive) hideLegacy(heatLayer);

      const densityPenalty = Math.max(
        0.50,
        1 / Math.sqrt(activeCount)
      );

      try {
        const haloOpacity = 0.22 * densityPenalty;
        const coreOpacity = 0.82 * Math.max(0.70, densityPenalty);
        if (map.getPaintProperty(ids.halo, 'circle-opacity') !== haloOpacity) {
          map.setPaintProperty(ids.halo, 'circle-opacity', haloOpacity);
        }
        if (map.getPaintProperty(ids.core, 'circle-opacity') !== coreOpacity) {
          map.setPaintProperty(ids.core, 'circle-opacity', coreOpacity);
        }
      } catch {
        // non-fatal
      }

      setVisibility(
        map,
        ids.halo,
        observedActive
      );

      setVisibility(
        map,
        ids.core,
        observedActive
      );
    }

    // Remove companions whose source heatmap disappeared.
    const nativeIds = new Set(
      heatLayers.map((layer) => normalizeId(layer.id))
    );

    for (const layer of [...(map.getStyle()?.layers || [])] as any[]) {
      if (!layer.id.startsWith('amoh-heat3d-')) continue;

      const match = layer.id.match(
        /^amoh-heat3d-(.+)-(halo|core)$/
      );

      if (!match) continue;

      if (!nativeIds.has(match[1])) {
        try {
          map.removeLayer(layer.id);
        } catch {
          // non-fatal
        }
      }
    }

    lastMode = is3D ? '3D' : '2D';
    lastActiveCount = activeCount;
    lastHeatmapSignature = heatmapSignature;

    (window as any).__amohHeatmapV3 = {
      projection,
      heatmaps: heatLayers.map((layer) => ({
        id: layer.id,
        profile: getHeatmapProfile(layer.id).id,
        active3D: is3D && isVisible(map, layer.id)
      }))
    };
  };

  const schedule = () => {
    if (timer) return;
    timer = setTimeout(apply, 50);
  };

  map.on('styledata', schedule);
  map.on('projectiontransition' as keyof MapEventType, schedule);
  map.on('moveend', schedule);

  schedule();

  const cleanup = () => {
    if (timer) clearTimeout(timer);

    restoreLegacy();

    map.off('styledata', schedule);
    map.off('projectiontransition' as keyof MapEventType, schedule);
    map.off('moveend', schedule);
  };

  map.once('remove', cleanup);

  return cleanup;
}
