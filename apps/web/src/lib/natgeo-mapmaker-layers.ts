/**
 * OLEA — Integración del atlas National Geographic MapMaker.
 *
 * Origen: https://education.nationalgeographic.org/resource/mapmaker-ocean-currents/
 * Ese recurso de aula apunta a dos webmaps de la app MapMaker (appid 0cd1cdee853c413a84bfe4b9a6931f0d):
 *   - "Ocean Currents"            webmap 5a63cae1c0e54d239eb9318ea6ef24c7
 *   - "Ocean Currents in Motion"  webmap c69ed6f0677d4eb98d362f6d176dadf9
 * Detrás de ellos está la cuenta de ArcGIS Online `mm.atlas` (National Geographic MapMaker atlas),
 * con 267 ítems al 2026-11-02: 106 Feature Services, 30 Image Services, 5 Map Services,
 * 3 Vector Tile Services, 1 WMTS y 119 web maps.
 *
 * Catálogo completo y atribución por capa:  data/natgeo_mapmaker/
 * Regenerar / descargar:                    node scripts/natgeo_mapmaker_harvest.mjs
 *
 * Licencia: la mayoría de los ítems declaran CC BY 4.0 (algunos CC BY 3.0), pero varias capas
 * arrastran términos del proveedor original (Smithsonian GVP, UNEP-WCMC, USGS, NOAA, Esri MLA).
 * Verifica `license` en el catálogo antes de redistribuir.
 */

import { SDG_COLORS } from './sdg-registry';
import type { LayerDefinition } from './layer-registry';
import type { LeafLayerItem } from './hierarchical-layers';

const ATTRIB = 'National Geographic MapMaker (NGS / Esri) — CC BY 4.0';

/** Construye la URL de consulta GeoJSON de una capa de Feature Service de ArcGIS. */
const agsQuery = (service: string, layer: number, limit = 2000) =>
  `${service}/${layer}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson&resultRecordCount=${limit}`;

/** Plantilla de teselas de un Map Service cacheado de ArcGIS (row=y, col=x). */
const agsTiles = (service: string) => `${service}/tile/{z}/{y}/{x}`;

/* ------------------------------------------------------------------ capas */

export const NATGEO_MAPMAKER_LAYERS: Record<string, LayerDefinition> = {
  /**
   * La capa que pide el recurso de origen. Copia local verificada contra el servicio vivo:
   * 51 corrientes con nombre, 1605 vértices, clasificadas Warm (29) / Cold (22).
   * Simplificada a 0.01° desde las 161.173 vértices del original (6 MB -> 35 KB).
   */
  natgeo_ocean_surface_currents: {
    id: 'natgeo_ocean_surface_currents',
    name: 'Corrientes Oceánicas Superficiales (NatGeo MapMaker)',
    category: 'OCEANOGRAFÍA & FÍSICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/natgeo_ocean_surface_currents.geojson',
      attribution: `${ATTRIB} · capa de Heather Smith, Esri`,
    },
    paint: {
      'line-color': [
        'match',
        ['get', 'temperature'],
        'Warm', '#f97316',
        'Cold', '#38bdf8',
        SDG_COLORS[14],
      ],
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 1.4, 4, 2.6, 8, 4.5],
    },
  },

  natgeo_tectonic_plate_boundaries: {
    id: 'natgeo_tectonic_plate_boundaries',
    name: 'Límites de Placas Tectónicas (NatGeo MapMaker)',
    category: 'GEOLOGÍA & TECTÓNICA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Tectonic_Plates_and_Boundaries/FeatureServer',
        0,
      ),
      attribution: `${ATTRIB} · 241 segmentos`,
    },
    paint: {
      'line-color': '#f59e0b',
      'line-width': 1.8,
      'line-dasharray': [3, 1.5],
    },
  },

  natgeo_volcanoes_world: {
    id: 'natgeo_volcanoes_world',
    name: 'Volcanes del Mundo — Holoceno/Pleistoceno (NatGeo MapMaker)',
    category: 'GEOLOGÍA & TECTÓNICA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services7.arcgis.com/iFGeGXTAJXnjq0YN/arcgis/rest/services/Smithsonian_Global_Volcanism_Program_Holocene_Volcano_List_/FeatureServer',
        0,
      ),
      attribution: 'Smithsonian Global Volcanism Program (v5.2.5) vía NatGeo MapMaker',
    },
    paint: {
      'circle-color': '#ef4444',
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 2.2, 5, 4.5, 9, 8],
      'circle-stroke-color': '#7f1d1d',
      'circle-stroke-width': 0.8,
    },
  },

  natgeo_earthquakes_major: {
    id: 'natgeo_earthquakes_major',
    name: 'Sismos Mayores (NatGeo MapMaker)',
    category: 'GEOLOGÍA & TECTÓNICA',
    sdg: 11,
    sdgColor: SDG_COLORS[11],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services.arcgis.com/BG6nSlhZSAWtExvp/arcgis/rest/services/Major_Earthquakes_2_view/FeatureServer',
        0,
      ),
      attribution: 'USGS vía NatGeo MapMaker',
    },
    paint: {
      'circle-color': '#fb923c',
      'circle-radius': [
        'interpolate', ['linear'], ['coalesce', ['get', 'mag'], ['get', 'Mag'], 6],
        5, 3, 7, 6, 9, 12,
      ],
      'circle-opacity': 0.75,
      'circle-stroke-color': '#7c2d12',
      'circle-stroke-width': 0.6,
    },
  },

  natgeo_coral_bleaching_stress: {
    id: 'natgeo_coral_bleaching_stress',
    name: 'Estrés Térmico de Blanqueamiento Coralino (NatGeo MapMaker)',
    category: 'ECOLOGÍA & BIODIVERSIDAD',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Coral_Reef_Stations/FeatureServer',
        0,
      ),
      attribution: 'NOAA Coral Reef Watch vía NatGeo MapMaker',
    },
    paint: {
      'circle-color': '#fda4af',
      'circle-radius': 4.5,
      'circle-stroke-color': '#9f1239',
      'circle-stroke-width': 0.8,
    },
  },

  natgeo_biomes: {
    id: 'natgeo_biomes',
    name: 'Biomas — Ecorregiones RESOLVE (NatGeo MapMaker)',
    category: 'ECOLOGÍA & BIODIVERSIDAD',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/Resolve_Ecoregions/FeatureServer',
        0,
      ),
      attribution: 'RESOLVE Ecoregions 2017 vía NatGeo MapMaker',
    },
    paint: {
      'fill-color': ['coalesce', ['get', 'COLOR'], SDG_COLORS[15]],
      'fill-opacity': 0.35,
      'fill-outline-color': '#065f46',
    },
  },

  natgeo_pristine_seas: {
    id: 'natgeo_pristine_seas',
    name: 'Pristine Seas — Expediciones y AMP (National Geographic)',
    category: 'EXPEDICIONES & CIENCIA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services3.arcgis.com/AdYB7LvDmN7hzWUb/arcgis/rest/services/Pristine_Seas_Data/FeatureServer',
        0,
      ),
      attribution: 'National Geographic Pristine Seas',
    },
    paint: {
      'circle-color': '#22d3ee',
      'circle-radius': 6,
      'circle-stroke-color': '#0e7490',
      'circle-stroke-width': 1.4,
    },
  },

  natgeo_perpetual_planet_everest: {
    id: 'natgeo_perpetual_planet_everest',
    name: 'Perpetual Planet — Expedición Everest (National Geographic)',
    category: 'EXPEDICIONES & CIENCIA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services3.arcgis.com/AdYB7LvDmN7hzWUb/arcgis/rest/services/Perpetual_Planet_Everest_Data/FeatureServer',
        0,
      ),
      attribution: 'National Geographic Perpetual Planet',
    },
    paint: {
      'circle-color': '#fde047',
      'circle-radius': 6,
      'circle-stroke-color': '#a16207',
      'circle-stroke-width': 1.4,
    },
  },

  natgeo_okavango_tracks: {
    id: 'natgeo_okavango_tracks',
    name: 'Okavango Wilderness Project — Trazas de Expedición (National Geographic)',
    category: 'EXPEDICIONES & CIENCIA',
    sdg: 6,
    sdgColor: SDG_COLORS[6],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services3.arcgis.com/AdYB7LvDmN7hzWUb/arcgis/rest/services/OWP_Expedition_Tracks/FeatureServer',
        0,
      ),
      attribution: 'National Geographic Okavango Wilderness Project',
    },
    paint: {
      'line-color': '#4ade80',
      'line-width': 2.2,
    },
  },

  natgeo_time_zones: {
    id: 'natgeo_time_zones',
    name: 'Husos Horarios (NatGeo MapMaker)',
    category: 'BASE & REFERENCIA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Time_Zones/FeatureServer',
        0,
      ),
      attribution: ATTRIB,
    },
    paint: {
      'fill-color': '#64748b',
      'fill-opacity': 0.12,
      'fill-outline-color': '#94a3b8',
    },
  },

  natgeo_meridians_parallels: {
    id: 'natgeo_meridians_parallels',
    name: 'Meridianos y Paralelos Principales (NatGeo MapMaker)',
    category: 'BASE & REFERENCIA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: agsQuery(
        'https://services.arcgis.com/As5CFN3ThbQpy8Ph/arcgis/rest/services/LongitudesAndLatitudes/FeatureServer',
        0,
      ),
      attribution: ATTRIB,
    },
    paint: {
      'line-color': '#94a3b8',
      'line-width': 0.7,
      'line-dasharray': [4, 3],
    },
  },

  /** Único Map Service del atlas que sirve teselas de imagen legibles (image/jpeg, verificado). */
  natgeo_light_pollution: {
    id: 'natgeo_light_pollution',
    name: 'Contaminación Lumínica — Earth at Night 2016 (NatGeo MapMaker)',
    category: 'ACTIVIDAD HUMANA',
    sdg: 11,
    sdgColor: SDG_COLORS[11],
    type: 'raster',
    source: {
      type: 'raster',
      url: agsTiles(
        'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Earth_at_Night_2016/MapServer',
      ),
      tileSize: 256,
      attribution: 'NASA Earth at Night 2016 vía NatGeo MapMaker',
    },
    paint: {
      'raster-opacity': 0.75,
    },
  },
};

/* --------------------------------------------------------------- basemaps */

export interface NatGeoBasemap {
  id: string;
  label: string;
  kind: 'raster' | 'vector-style';
  url: string;
  attribution: string;
}

/** Los dos mapas base que usa la app MapMaker del recurso de corrientes. */
export const NATGEO_MAPMAKER_BASEMAPS: NatGeoBasemap[] = [
  {
    id: 'natgeo_world_ocean_base',
    label: 'World Ocean Base (MapMaker · Ocean Currents)',
    kind: 'raster',
    url: agsTiles('https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer'),
    attribution: 'Esri World Ocean Base — basemap del webmap NatGeo "Ocean Currents"',
  },
  {
    id: 'natgeo_world_ocean_reference',
    label: 'World Ocean Reference (sin etiquetas)',
    kind: 'vector-style',
    url: 'https://www.arcgis.com/sharing/rest/content/items/4c8912e3453e4d2892e336a84fc8ae13/resources/styles/root.json',
    attribution: 'Esri World Ocean Reference — overlay del webmap NatGeo "Ocean Currents"',
  },
  {
    id: 'natgeo_world_imagery',
    label: 'World Imagery (MapMaker · Ocean Currents in Motion)',
    kind: 'raster',
    url: agsTiles('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'),
    attribution: 'Esri World Imagery — basemap del webmap NatGeo "Ocean Currents in Motion"',
  },
];

/* ------------------------------------------------- procedencia y pendientes */

export const NATGEO_MAPMAKER_PROVENANCE = {
  resource: 'https://education.nationalgeographic.org/resource/mapmaker-ocean-currents/',
  account: 'mm.atlas',
  appId: '0cd1cdee853c413a84bfe4b9a6931f0d',
  webmaps: {
    ocean_currents: '5a63cae1c0e54d239eb9318ea6ef24c7',
    ocean_currents_in_motion: 'c69ed6f0677d4eb98d362f6d176dadf9',
  },
  catalogDir: 'data/natgeo_mapmaker/',
  harvester: 'scripts/natgeo_mapmaker_harvest.mjs',
  totals: { items: 267, featureServices: 106, imageServices: 30, mapServices: 5, vectorTile: 3, wmts: 1, webMaps: 119 },
  harvested: '2026-11-02',
} as const;

/**
 * "Ocean Currents in Motion" SÍ está implementada, pero no como capa de MapLibre:
 * su ImageServer sirve teselas LERC de 2 bandas (magnitud, dirección) que se
 * decodifican en el cliente y alimentan la animación de partículas.
 * Implementación y procedencia: `lib/natgeo-drifter-field.ts`.
 * Se enciende con el id `ocean_currents` (alias `natgeo_ocean_currents_in_motion`).
 */
export const NATGEO_DRIFTER_IMPLEMENTED = {
  id: 'annual_drifter_mean_v3',
  title: 'Ocean Currents in Motion',
  item: 'b5b41304a18049f28325674dcdaf5dd3',
  toggleLayerId: 'ocean_currents',
  module: 'src/lib/natgeo-drifter-field.ts',
  renderer: 'src/components/CircumpolarFlowCanvas.tsx',
  attribution: 'NOAA Global Drifter Program (AOML, CIMAS, PMEL) / Univ. Miami — CC BY 3.0',
} as const;

/**
 * Capas del atlas que NO se pueden consumir todavía y por qué. Esto es deliberado:
 * no se registran como capas vacías para no simular datos que el mapa no puede dibujar.
 */
export const NATGEO_MAPMAKER_UNSUPPORTED = [
  {
    id: 'imageservices_lerc',
    title:
      'Resto de Image Services del atlas (Köppen, Seafloor Age, Continental Shelf, Marine/Terrestrial Biodiversity, Chlorophyll-a, Human Footprint, Population Density, Surface Winds, Jet Stream, Land Cover…)',
    service: 'tiledimageservices*.arcgis.com/.../ImageServer',
    reason:
      'Verificado 2026-11-02: devuelven application/octet-stream (LERC), no image/png|jpeg. ' +
      'Requieren decodificador LERC o un servicio exportImage con renderingRule.',
  },
] as const;

/* ---------------------------------------- items para la biblioteca de capas */

const leaf = (
  id: string,
  label: string,
  domain: string,
  subdomain: string,
  description: string,
  provider: string,
  dataset: string,
  variable: string,
  recordCount: number,
  license = 'CC-BY-4.0',
): LeafLayerItem => ({
  id,
  label,
  domain,
  subdomain,
  description,
  provider,
  dataset,
  variable,
  enabled: false,
  opacity: 0.85,
  health: 'BLUE',
  healthLabel: 'NATGEO MAPMAKER',
  recordCount,
  hasDataInView: false,
  license,
});

export const NATGEO_MAPMAKER_TREE_ITEMS: LeafLayerItem[] = [
  leaf(
    'natgeo_ocean_surface_currents',
    'NatGeo — Corrientes Oceánicas Superficiales',
    'ENVIRONMENT',
    'ocean_circulation',
    '51 corrientes superficiales con nombre, clasificadas cálida (29) / fría (22). Copia local simplificada a 0.01°, verificada contra el servicio vivo (1605 vértices).',
    'National Geographic MapMaker / Esri (Heather Smith)',
    'OceanSurfaceCurrents',
    'current_name_temperature',
    51,
  ),
  leaf(
    'natgeo_tectonic_plate_boundaries',
    'NatGeo — Límites de Placas Tectónicas',
    'PHYSICAL_EARTH',
    'seismicity_geophysics',
    '241 segmentos de límite de placa (divergente, convergente, transformante).',
    'National Geographic MapMaker / Esri',
    'Tectonic_Plates_and_Boundaries',
    'boundary_type',
    241,
  ),
  leaf(
    'natgeo_volcanoes_world',
    'NatGeo — Volcanes del Mundo',
    'PHYSICAL_EARTH',
    'seismicity_geophysics',
    '1281 volcanes con erupción en Holoceno o Pleistoceno; 132 de ellos al sur de 30°S.',
    'Smithsonian Global Volcanism Program vía NatGeo MapMaker',
    'GVP_Holocene_Volcano_List',
    'volcano_type_elevation',
    1281,
    'Smithsonian GVP terms',
  ),
  leaf(
    'natgeo_earthquakes_major',
    'NatGeo — Sismos Mayores',
    'PHYSICAL_EARTH',
    'seismicity_geophysics',
    '949 sismos mayores; 90 al sur de 30°S.',
    'USGS vía NatGeo MapMaker',
    'Major_Earthquakes',
    'magnitude_depth',
    949,
    'USGS public domain',
  ),
  leaf(
    'natgeo_coral_bleaching_stress',
    'NatGeo — Estrés Térmico Coralino',
    'ECOLOGY',
    'biodiversity_occurrences',
    '214 estaciones de arrecife con niveles de alerta de blanqueamiento.',
    'NOAA Coral Reef Watch vía NatGeo MapMaker',
    'Coral_Reef_Stations',
    'bleaching_alert_level',
    214,
  ),
  leaf(
    'natgeo_biomes',
    'NatGeo — Biomas (Ecorregiones RESOLVE)',
    'ECOLOGY',
    'biodiversity_occurrences',
    '847 ecorregiones terrestres RESOLVE 2017 agrupadas por bioma.',
    'RESOLVE vía NatGeo MapMaker',
    'Resolve_Ecoregions',
    'biome_ecoregion',
    847,
  ),
  leaf(
    'natgeo_pristine_seas',
    'NatGeo — Pristine Seas (Expediciones y AMP)',
    'OBSERVATIONS_EVIDENCE',
    'field_observations',
    '51 sitios de expedición Pristine Seas, con bandera de área marina protegida.',
    'National Geographic Pristine Seas',
    'Pristine_Seas_Data',
    'expedition_site_mpa',
    51,
  ),
  leaf(
    'natgeo_perpetual_planet_everest',
    'NatGeo — Perpetual Planet Everest',
    'OBSERVATIONS_EVIDENCE',
    'field_observations',
    '9 estaciones de la expedición Perpetual Planet al Everest.',
    'National Geographic Perpetual Planet',
    'Perpetual_Planet_Everest_Data',
    'station',
    9,
  ),
  leaf(
    'natgeo_okavango_tracks',
    'NatGeo — Okavango Wilderness Project',
    'OBSERVATIONS_EVIDENCE',
    'field_observations',
    '10 trazas de expedición del Okavango Wilderness Project.',
    'National Geographic Okavango Wilderness Project',
    'OWP_Expedition_Tracks',
    'track',
    10,
  ),
  leaf(
    'natgeo_light_pollution',
    'NatGeo — Contaminación Lumínica (Earth at Night 2016)',
    'HUMAN_ACTIVITY',
    'human_footprint',
    'Mosaico nocturno NASA 2016 como teselas de imagen.',
    'NASA vía NatGeo MapMaker',
    'Earth_at_Night_2016',
    'night_radiance',
    0,
  ),
  leaf(
    'natgeo_time_zones',
    'NatGeo — Husos Horarios',
    'REFERENCE_BASE',
    'cartography',
    '39 polígonos de huso horario.',
    'National Geographic MapMaker / Esri',
    'World_Time_Zones',
    'utc_offset',
    39,
  ),
  leaf(
    'natgeo_meridians_parallels',
    'NatGeo — Meridianos y Paralelos',
    'REFERENCE_BASE',
    'cartography',
    '54 líneas de referencia: meridianos y paralelos principales.',
    'National Geographic MapMaker / Esri',
    'LongitudesAndLatitudes',
    'graticule',
    54,
  ),
];

export const NATGEO_MAPMAKER_META: Record<string, { domain: string; group: string; role: string }> =
  Object.fromEntries(
    NATGEO_MAPMAKER_TREE_ITEMS.map((l) => [
      l.id,
      {
        domain: l.domain,
        group: l.subdomain,
        role:
          l.domain === 'REFERENCE_BASE'
            ? 'BASE_REFERENCE'
            : l.domain === 'OBSERVATIONS_EVIDENCE'
            ? 'FIELD_EVIDENCE'
            : 'CONTEXT',
      },
    ]),
  );

/** Alias en español/corto -> id canónico, para la barra de comandos y las URLs del mapa. */
export const NATGEO_MAPMAKER_ALIASES: Record<string, string> = {
  natgeo_currents: 'natgeo_ocean_surface_currents',
  corrientes_natgeo: 'natgeo_ocean_surface_currents',
  corrientes_superficiales: 'natgeo_ocean_surface_currents',
  ocean_surface_currents: 'natgeo_ocean_surface_currents',
  mapmaker_currents: 'natgeo_ocean_surface_currents',
  placas_tectonicas: 'natgeo_tectonic_plate_boundaries',
  limites_placas: 'natgeo_tectonic_plate_boundaries',
  volcanes: 'natgeo_volcanoes_world',
  sismos_mayores: 'natgeo_earthquakes_major',
  blanqueamiento_coralino: 'natgeo_coral_bleaching_stress',
  biomas: 'natgeo_biomes',
  pristine_seas: 'natgeo_pristine_seas',
  mares_pristinos: 'natgeo_pristine_seas',
  everest: 'natgeo_perpetual_planet_everest',
  okavango: 'natgeo_okavango_tracks',
  contaminacion_luminica: 'natgeo_light_pollution',
  husos_horarios: 'natgeo_time_zones',
  meridianos: 'natgeo_meridians_parallels',

  // "Ocean Currents in Motion" no es una capa de MapLibre: es el campo vectorial
  // de derivadores que mueve la animación de partículas de CircumpolarFlowCanvas,
  // que se enciende con `ocean_currents`. Ver lib/natgeo-drifter-field.ts.
  natgeo_ocean_currents_in_motion: 'ocean_currents',
  corrientes_en_movimiento: 'ocean_currents',
  derivadores: 'ocean_currents',
  drifters: 'ocean_currents',
};
