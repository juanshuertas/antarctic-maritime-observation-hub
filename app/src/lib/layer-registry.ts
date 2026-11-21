/**
 * AMOH V11 — Central Declarative Layer Registry & SDG Color Engine
 * Integrates Quantarctica 3.0, Global Fishing Watch (GFW), and OSIRIS Live feeds
 * linked to the United Nations Sustainable Development Goals (SDG) color architecture.
 */

import { SDG_COLORS, LAYER_TO_SDG } from './sdg-registry';
import {
  NATGEO_MAPMAKER_LAYERS,
  NATGEO_MAPMAKER_ALIASES,
} from './natgeo-mapmaker-layers';
import { OLEA_SAR_LAYERS } from './olea-sar-layers';

// Retain legacy interfaces for backward compatibility across existing modules
export type LayerCategory =
  | 'ACTIVITY'
  | 'ATMOSPHERE'
  | 'OCEAN'
  | 'ICE'
  | 'LIFE'
  | 'SCIENCE_EXPEDITIONS'
  | 'SENSORS'
  | 'INFRASTRUCTURE'
  | 'POLLUTION'
  | 'GOVERNANCE'
  | 'FIELD';

export type LayerDomain =
  | 'observation'
  | 'maritime'
  | 'aviation'
  | 'space'
  | 'fisheries'
  | 'atmosphere'
  | 'ocean'
  | 'cryosphere'
  | 'earth'
  | 'biodiversity'
  | 'pollution'
  | 'infrastructure'
  | 'governance'
  | 'context';

export interface AmohLayerDefinition {
  id: string;
  label: string;
  shortLabel?: string;
  description: string;
  category: LayerCategory;
  domain: LayerDomain;
  iconId: string;
  color: string;
  providerId: string;
  defaultEnabled: boolean;
  heavy: boolean;
  animated?: boolean;
  sourceType: 'geojson' | 'mvt' | 'pmtiles' | 'raster' | 'wmts' | 'cog' | 'stream' | 'documentary';
  supportsBBox?: boolean;
  supportsTime?: boolean;
  supportsDepth?: boolean;
  mutuallyExclusiveGroup?: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface LayerDefinition {
  id: string;
  name: string;
  category: string;
  sdg: number;
  sdgColor: string;
  type: 'vector' | 'raster' | 'geojson' | 'heatmap';
  source: {
    type: 'geojson' | 'raster' | 'vector';
    url: string;
    tileSize?: number;
    attribution?: string;
    /** Solo raster XYZ: zooms que existen en disco y caja [O, S, E, N] fuera de la cual no se piden teselas. */
    minzoom?: number;
    maxzoom?: number;
    bounds?: [number, number, number, number];
  };
  paint: Record<string, any>;
  layout?: Record<string, any>;
  minzoom?: number;
  maxzoom?: number;
}

export const LAYER_ID_ALIASES: Record<string, string> = {
  // Retirado 2026-11-03: 'ocean_currents' publicaba 3 polilineas dibujadas a
  // mano (la ACC como una linea de ~10 vertices) con velocity_m_s y
  // transport_sv inventados, atribuidas a "SOOS / Copernicus Marine". El dato
  // real del mismo fenomeno es copernicus_currents_peninsula, medido sobre el
  // subset de Copernicus Marine. El id sobrevive SOLO como interruptor de la
  // animacion de particulas de CircumpolarFlowCanvas, que no lee ningun dato.
  ocean_currents_acc: 'copernicus_currents_peninsula',
  corrientes_circumpolares: 'copernicus_currents_peninsula',
  // Stratospheric Ozone
  ozone: 'ozone_layer',
  stratospheric_ozone: 'ozone_layer',
  capa_ozono: 'ozone_layer',
  capa_de_ozono: 'ozone_layer',
  ozone_hole: 'ozone_layer',
  agujero_ozono: 'ozone_layer',

  // Quantarctica baselines
  quantarctica_coast: 'quantarctica_coastline',
  coastline: 'quantarctica_coastline',
  quantarctica_ice: 'quantarctica_ice_shelf',
  ice_shelf: 'quantarctica_ice_shelf',
  quantarctica_ice_shelves: 'quantarctica_ice_shelf',
  southern_ocean_fronts: 'southern_ocean_fronts',
  ocean_fronts: 'southern_ocean_fronts',
  frentes_oceanicos: 'southern_ocean_fronts',
  acbrs: 'acbrs',
  regiones_biogeograficas: 'acbrs',
  ccamlr_statistical_areas: 'ccamlr_statistical_areas',
  ccamlr_stat: 'ccamlr_statistical_areas',
  median_sea_ice_extents: 'median_sea_ice_extents',
  sea_ice_extents: 'median_sea_ice_extents',
  historic_routes: 'historic_routes',
  rutas_historicas: 'historic_routes',
  rock_outcrops: 'rock_outcrops',
  afloramientos_rocosos: 'rock_outcrops',
  outcrops: 'rock_outcrops',
  important_bird_areas: 'important_bird_areas',
  iba: 'important_bird_areas',
  areas_aves: 'important_bird_areas',
  emperor_penguin_colonies: 'emperor_penguin_colonies',
  emperor_penguins: 'emperor_penguin_colonies',
  colonias_emperador: 'emperor_penguin_colonies',
  historic_stations: 'historic_stations',
  estaciones_historicas: 'historic_stations',
  monumentos_historicos: 'historic_stations',
  comnap_facilities: 'comnap_facilities',
  // comnap: 'comnap_facilities' -> clave duplicada; en runtime siempre ganó la entrada posterior (quantarctica_stations)
  instalaciones_comnap: 'comnap_facilities',
  glacier_velocity: 'glacier_velocity',
  velocidad_glaciar: 'glacier_velocity',
  aspa_polygons: 'aspa_polygons',
  asma_polygons: 'asma_polygons',
  ccamlr_mpas: 'ccamlr_mpas',
  fauna_benthos: 'fauna_benthos',
  fauna_cetaceans: 'fauna_cetaceans',
  fauna_fish: 'fauna_fish',
  fauna_krill: 'fauna_krill',
  argo_southern_ocean: 'argo_floats',
  influencer_tourism_footprint: 'influencer_tourism_footprint',
  antarctic_2020_now: 'seismic_events',

  // Maritime & AIS
  ais_vessels: 'maritime_vessels',
  live_vessels: 'maritime_vessels',
  research_vessels: 'maritime_vessels',
  oceanographic_vessels: 'maritime_vessels',
  commercial_traffic: 'maritime_vessels',
  maritime_traffic: 'maritime_vessels',
  vessel_traffic: 'maritime_vessels',
  buques: 'maritime_vessels',
  barcos: 'maritime_vessels',
  navios: 'maritime_vessels',
  embarcaciones: 'maritime_vessels',
  vessels: 'maritime_vessels',
  maritime_corridors: 'strategic_waterways',
  commercial_routes: 'strategic_waterways',
  rutas_maritimas: 'strategic_waterways',
  corredores_maritimos: 'strategic_waterways',

  // Aviation & ADS-B
  adsb_aircraft: 'polar_aircraft',
  polar_aviation: 'polar_aircraft',
  military_aviation: 'polar_aircraft',
  flight_delays: 'polar_aircraft',
  aviones: 'polar_aircraft',
  aeronaves: 'polar_aircraft',
  vuelos: 'polar_aircraft',
  aircraft: 'polar_aircraft',
  aviation: 'polar_aircraft',

  // Satellites & Space

    satellite_tracking: 'polar_satellites',

    satellites: 'polar_satellites',

    satellite: 'polar_satellites',
  norad_satellites: 'polar_satellites',
  satellites_orbital: 'polar_satellites',
  orbital_surveillance: 'polar_satellites',
  icesat2: 'nasa_icesat2_tracks',
  icesat_2: 'nasa_icesat2_tracks',
  nasa_icesat2: 'nasa_icesat2_tracks',
  firms: 'nasa_firms_thermal',
  nasa_firms: 'nasa_firms_thermal',
  thermal_anomalies: 'nasa_firms_thermal',
  satelites: 'polar_satellites',
  sentinel_sar: 'gfw_sar_detections',

  // Tourism & Expeditions
  tourism_routes: 'iaato_routes',
  iaato_tourism_routes: 'iaato_routes',
  tourism_vessels: 'iaato_routes',
  rutas: 'iaato_routes',
  rutas_turisticas: 'iaato_routes',
  expediciones: 'iaato_routes',
  tourism_sites: 'iaato_landing_sites',
  tourism_landing_sites: 'iaato_landing_sites',
  landing_sites: 'iaato_landing_sites',
  iaato_landing_sites: 'iaato_landing_sites',
  deep_field_camps: 'iaato_deep_field_camps',
  antarctic_camps: 'iaato_deep_field_camps',
  iaato_deep_field_camps: 'iaato_deep_field_camps',

  // Luxury Camps & Glamping
  luxury_camps: 'luxury_camps',
  camps_de_lujo: 'luxury_camps',
  campamentos_lujo: 'luxury_camps',
  glamping: 'luxury_camps',
  white_desert: 'luxury_camps',
  echo_camp: 'luxury_camps',
  whichaway: 'luxury_camps',
  three_glaciers: 'luxury_camps',
  wolfs_fang: 'luxury_camps',
  ultima_oasis: 'luxury_camps',

  // Subsurface, Nuclear & Defense
  submarines: 'subsurface_nuclear',
  nuclear_submarines: 'subsurface_nuclear',
  submarinos: 'subsurface_nuclear',
  submarinos_nucleares: 'subsurface_nuclear',
  ctbto: 'subsurface_nuclear',
  ctbto_hydroacoustics: 'subsurface_nuclear',
  subsurface_nuclear: 'subsurface_nuclear',

  // Deep Expedition Submersibles
  submersibles: 'tourist_submersibles',
  sumergibles: 'tourist_submersibles',
  tourist_submersibles: 'tourist_submersibles',
  scenic_neptune: 'tourist_submersibles',
  triton_submarines: 'tourist_submersibles',

  // Heavy Over-Snow Traverses
  traverses: 'heavy_traverses',
  heavy_traverses: 'heavy_traverses',
  travesias: 'heavy_traverses',
  spot: 'heavy_traverses',
  south_pole_traverse: 'heavy_traverses',
  concordia_traverse: 'heavy_traverses',
  vostok_traverse: 'heavy_traverses',
  tractor_trains: 'heavy_traverses',

  // Autonomous Ocean Platforms & Sailboats
  saildrone: 'autonomous_yachts',
  auv: 'autonomous_yachts',
  auvs: 'autonomous_yachts',
  autonomous_yachts: 'autonomous_yachts',
  polar_autonomous: 'autonomous_yachts',
  veleros: 'autonomous_yachts',
  yachts: 'autonomous_yachts',
  ski_alpinism: 'autonomous_yachts',

  // Cryosphere & Ocean
  sea_ice: 'quantarctica_ice',

  // Atmosphere & Climate
  ozone_layer: 'ozone_layer',
  antarctic_ozone: 'ozone_layer',
  cams_ozone: 'ozone_layer',
  sentinel5p_ozone: 'ozone_layer',
  // ozone / stratospheric_ozone ya definidos arriba con el mismo valor
  atmosphere: 'atmosphere',
  aurora: 'atmosphere',
  aurora_australis: 'atmosphere',
  polar_mesospheric_clouds: 'atmosphere',
  pmc: 'atmosphere',
  polar_jet_stream: 'atmosphere',
  ionosphere: 'atmosphere',

  // Sensors, Floats, Webcams & Seismic
  argo_gdac_floats: 'argo_floats',
  argo_floats: 'argo_floats',
  argo: 'argo_floats',
  boyas: 'argo_floats',
  boyas_argo: 'argo_floats',
  boyas_oceanograficas: 'argo_floats',
  sensores: 'argo_floats',
  sensores_oceanograficos: 'argo_floats',
  usgs_seismic_events: 'seismic_events',
  seismic_events: 'seismic_events',
  seismic: 'seismic_events',
  sismos: 'seismic_events',
  terremotos: 'seismic_events',
  sismica: 'seismic_events',
  terremoto: 'seismic_events',
  usgs: 'seismic_events',
  cctv_cams: 'live_webcams',
  live_webcams: 'live_webcams',
  cctv: 'live_webcams',
  webcams: 'live_webcams',
  camaras: 'live_webcams',
  camaras_en_vivo: 'live_webcams',
  gfw_sar: 'gfw_sar_detections',
  gfw_sar_detections: 'gfw_sar_detections',
  sar_radar: 'gfw_sar_detections',
  radar_sar: 'gfw_sar_detections',
  natural_hazards: 'natural_events',

  // Fauna & Biodiversity & Marine Monitoring
  antarctic_fauna: 'antarctic_fauna',
  fauna_polar: 'antarctic_fauna',
  fauna: 'antarctic_fauna',
  fauna_completa: 'antarctic_fauna',
  biodiversidad: 'antarctic_fauna',
  phytoplankton_chlorophyll: 'phytoplankton_chlorophyll',
  phytoplankton: 'phytoplankton_chlorophyll',
  fitoplancton: 'phytoplankton_chlorophyll',
  clorofila: 'phytoplankton_chlorophyll',
  chlorophyll: 'phytoplankton_chlorophyll',
  fauna_schools_fish: 'fauna_schools_fish',
  cardumenes: 'fauna_schools_fish',
  cardumen: 'fauna_schools_fish',
  peces: 'fauna_schools_fish',
  fish: 'fauna_schools_fish',
  fish_schools: 'fauna_schools_fish',
  fauna_krill_swarms: 'fauna_krill_swarms',
  krill_swarms: 'fauna_krill_swarms',
  enjambres_krill: 'fauna_krill_swarms',
  krill: 'fauna_krill_swarms',
  fauna_whale_pods: 'fauna_whale_pods',
  whale_pods: 'fauna_whale_pods',
  ballenas: 'fauna_whale_pods',
  manadas_ballenas: 'fauna_whale_pods',
  fauna_whales: 'fauna_whale_pods',
  whales: 'fauna_whale_pods',
  fauna_penguins: 'fauna_penguins',
  pinguinos: 'fauna_penguins',
  fauna_pinnipeds: 'fauna_pinnipeds',
  focas: 'fauna_pinnipeds',
  fauna_seals: 'fauna_pinnipeds',
  fauna_seabirds: 'fauna_seabirds',
  aves_marinas: 'fauna_seabirds',
  antarctic_vegetation: 'quantarctica_vegetation',

  // Governance & Protected Areas
  treaty_claims: 'treaty_claims',
  fronteras: 'treaty_claims',
  frontera: 'treaty_claims',
  limites: 'treaty_claims',
  tratado: 'treaty_claims',
  tratado_antartico: 'treaty_claims',
  treaty: 'treaty_claims',
  claims: 'treaty_claims',
  ccamlr_zones: 'ccamlr_zones',
  zonas_ccamlr: 'ccamlr_zones',
  sar_regions: 'sar_regions',
  sar: 'sar_regions',
  ats_aspa: 'quantarctica_aspa',
  aspa: 'quantarctica_aspa',
  ats_asma: 'quantarctica_asma',
  asma: 'quantarctica_asma',
  ccamlr_mpa: 'quantarctica_ccamlr_mpa',
  antarctic_stations: 'quantarctica_stations',
  comnap_stations: 'quantarctica_stations',
  stations_scientific: 'quantarctica_stations',
  quantarctica_stations: 'quantarctica_stations',
  bases: 'quantarctica_stations',
  base: 'quantarctica_stations',
  bases_antarticas: 'quantarctica_stations',
  bases_comnap: 'quantarctica_stations',
  estaciones: 'quantarctica_stations',
  estacion: 'quantarctica_stations',
  stations: 'quantarctica_stations',
  comnap: 'quantarctica_stations',
  inach: 'quantarctica_stations',
  runways_airfields: 'quantarctica_runways',

  // Nuclear & Radiation
  iaea_maris_cesium: 'nuclear_sites',
  maris_nuclear: 'nuclear_sites',
  maris_measurements: 'maris_measurements',
  maris_open_measurements: 'maris_measurements',
  radiation_watch: 'nuclear_sites',
  gamma_irradiators: 'nuclear_sites',

  // Strategic & Intelligence
  intel_hotspots: 'conflict_zones',
  ucdp_events: 'conflict_zones',
  protests: 'conflict_zones',
  displacement_flows: 'conflict_zones',
  cii_instability: 'conflict_zones',
  pipelines: 'submarine_cables',
  internet_outages: 'submarine_cables',
  cyber_threats: 'ai_datacenters',
  economic_centers: 'ai_datacenters',
  severe_weather_alerts: 'natural_events',
  wildfires_firms: 'wildfires',

  // Grey Zones & Defense
  grey_zones: 'grey_zones_defense',
  grey_zones_defense: 'grey_zones_defense',
  hybrid_threats: 'grey_zones_defense',
  defense_zones: 'grey_zones_defense',
  grey_zones_defense_heatmap: 'grey_zones_defense_heatmap',
  defense_heatmap: 'grey_zones_defense_heatmap',
  tension_heatmap: 'grey_zones_defense_heatmap',
  polar_friction_sectors: 'polar_friction_sectors',
  friction_sectors: 'polar_friction_sectors',
  pfi_sectors: 'polar_friction_sectors',
  grey_zones_buffers: 'grey_zones_buffers',
  defense_buffers: 'grey_zones_buffers',

  // Pozos Offshore y Minería Submarina
  offshore: 'offshore_wells',
  wells: 'offshore_wells',
  pozos: 'offshore_wells',
  pozos_offshore: 'offshore_wells',
  drilling: 'offshore_wells',
  fenix: 'offshore_wells',
  deepsea_mining: 'deepsea_mining',
  mining: 'deepsea_mining',
  mineria: 'deepsea_mining',
  mineria_submarina: 'deepsea_mining',
  black_smokers: 'deepsea_mining',
  hydrothermal_vents: 'deepsea_mining',

  // Heatmaps
  heat_penguins: 'penguin_heatmap',
  heat_whales: 'whales_heatmap',
  heat_nuclear: 'nuclear_contamination_heatmap',
  heat_fishing: 'gfw_fishing_effort_heatmap',
  heat_fauna: 'fauna_density_heatmap',
  heat_seismic: 'seismic_heatmap',

  // ── Alias de National Geographic MapMaker ──
  ...NATGEO_MAPMAKER_ALIASES,
};

export function resolveLayerId(id: string): string {
  return LAYER_ID_ALIASES[id] || id;
}

export function getLayerColor(layerId: string): string {
  const resolved = resolveLayerId(layerId);
  const sdg = LAYER_TO_SDG[resolved] || LAYER_TO_SDG[layerId];
  return sdg ? SDG_COLORS[sdg] : '#00f0ff';
}

export const LAYER_REGISTRY: Record<string, LayerDefinition> = {
  // 0. ATMÓSFERA & CLIMA POLAR (ODS 13: Acción por el Clima)
  ozone_layer: {
    id: 'ozone_layer',
    name: 'Capa de Ozono Antártica (Sentinel-5P / CAMS)',
    category: 'ATMÓSFERA & CLIMATOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/antarctic_ozone.geojson',
      attribution: 'Copernicus Sentinel-5P TROPOMI / NASA Ozone Watch',
    },
    paint: {
      'fill-color': ['coalesce', ['get', 'color'], '#06b6d4'],
      'fill-opacity': 0.35,
    },
  },
  atmosphere: {
    id: 'atmosphere',
    name: 'Atmósfera & Clima Espacial (Aurora Australis, PMCs & Lidar)',
    category: 'ATMÓSFERA & CLIMATOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/atmosphere',
      attribution: 'IPEV / PNRA / SuperDARN / NOAA Space Weather',
    },
    paint: {
      'fill-color': ['coalesce', ['get', 'color'], '#00e676'],
      'fill-opacity': 0.35,
    },
  },

  // 1. CRIÓSFERA & GLACIOLOGÍA (ODS 13: Acción por el Clima)
  quantarctica_coastline: {
    id: 'quantarctica_coastline',
    name: 'Línea de Costa SCAR ADD (Quantarctica)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/coastline.geojson',
      attribution: 'SCAR Antarctic Digital Database / NPI',
    },
    paint: {
      'line-color': '#38bdf8',
      'line-width': 1.5,
    },
  },
  quantarctica_ice_shelf: {
    id: 'quantarctica_ice_shelf',
    name: 'Plataformas de Hielo Flotante',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/ice_shelf.geojson',
      attribution: 'Quantarctica 3.0 / BAS',
    },
    paint: {
      'fill-color': '#00e5ff',
      'fill-opacity': 0.05,
      'fill-outline-color': '#38bdf8',
    },
  },
  quantarctica_gebco: {
    id: 'quantarctica_gebco',
    name: 'Batimetría IBCSO v2 — relieve del lecho (500 m)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'raster',
    source: {
      type: 'raster',
      // Antes apuntaba a /data/web/cog/gebco_2023.tif: un GeoTIFF no es una plantilla
      // de teselas y MapLibre no dibujaba nada. Ahora usa las teselas XYZ generadas
      // por scripts/bathymetry_tiles.py desde IBCSO v2 (misma fuente que ibcso_v2_relief).
      url: '/data/web/tiles/ibcso_v2_relief/{z}/{x}/{y}.webp',
      tileSize: 256,
      minzoom: 0,
      maxzoom: 7,
      bounds: [-180, -85.0511, 180, -50],
      attribution: 'IBCSO v2 — Dorschel et al. 2022, doi:10.1594/PANGAEA.937574 (CC-BY-4.0)',
    },
    paint: {
      'raster-opacity': 0.7,
    },
  },
  quantarctica_rema: {
    id: 'quantarctica_rema',
    name: 'Modelo de Elevación Digital REMA (DEM)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'raster',
    source: {
      type: 'raster',
      url: '/data/web/cog/rema_dem.tif',
      tileSize: 256,
      attribution: 'PGC / REMA DEM',
    },
    paint: {
      'raster-opacity': 0.65,
    },
  },
  quantarctica_ice_velocity: {
    id: 'quantarctica_ice_velocity',
    name: 'Velocidad de Flujo Glaciar (MEaSUREs InSAR)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'raster',
    source: {
      type: 'raster',
      url: '/data/web/cog/ice_velocity.tif',
      tileSize: 256,
      attribution: 'NASA MEaSUREs InSAR',
    },
    paint: {
      'raster-opacity': 0.75,
    },
  },
  quantarctica_grounding_line: {
    id: 'quantarctica_grounding_line',
    name: 'Línea de Apoyo ASAID (Grounding Line)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/grounding_line.geojson',
      attribution: 'NASA / ASAID',
    },
    paint: {
      'line-color': '#00e5ff',
      'line-width': 2.0,
      'line-dasharray': [2, 1],
    },
  },
  glaciers: {
    id: 'glaciers',
    name: 'Glaciares y Cuencas Principales',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/glaciers.geojson',
      attribution: 'Quantarctica 3.0 Glaciology',
    },
    paint: {
      'line-color': SDG_COLORS[13],
      'line-width': 2.2,
    },
  },
  sea_ice_concentration: {
    id: 'sea_ice_concentration',
    name: 'Concentración de Hielo Marino (NSIDC)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'raster',
    source: {
      type: 'raster',
      url: '/data/web/cog/sea_ice.tif',
      tileSize: 256,
      attribution: 'NSIDC / EUMETSAT OSI-SAF',
    },
    paint: {
      'raster-opacity': 0.7,
    },
  },
  median_sea_ice_extents: {
    id: 'median_sea_ice_extents',
    name: 'Extensión Mediana del Hielo Marino 1981-2010 (NSIDC/NPI)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/median_sea_ice_extents',
      attribution: 'NSIDC / NPI / Quantarctica',
    },
    paint: {
      'line-color': '#38bdf8',
      'line-width': 2.0,
      'line-dasharray': [3, 1],
    },
  },

  // 2. OCEANOGRAFÍA & FÍSICA (ODS 14: Vida Submarina)
  southern_ocean_fronts: {
    id: 'southern_ocean_fronts',
    name: 'Frentes Oceanográficos del Océano Austral (SCAR/Orsi)',
    category: 'OCEANOGRAFÍA & FÍSICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/southern_ocean_fronts',
      attribution: 'SCAR / Orsi et al. / SOOS',
    },
    paint: {
      'line-color': '#06b6d4',
      'line-width': 2.4,
    },
  },
  acbrs: {
    id: 'acbrs',
    name: 'Regiones Biogeográficas Antárticas (ACBRs v2)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/acbrs',
      attribution: 'SCAR / Terauds et al. / CEP',
    },
    paint: {
      'fill-color': '#10b981',
      'fill-opacity': 0.22,
      'fill-outline-color': '#059669',
    },
  },
  ccamlr_statistical_areas: {
    id: 'ccamlr_statistical_areas',
    name: 'Áreas Estadísticas de Pesca CCAMLR (48, 58, 88)',
    category: 'PESQUERÍAS & GOBERNANZA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/ccamlr_statistical_areas',
      attribution: 'CCAMLR Secretariat',
    },
    paint: {
      'line-color': '#c084fc',
      'line-width': 1.8,
      'line-dasharray': [4, 2],
    },
  },
  historic_routes: {
    id: 'historic_routes',
    name: 'Rutas Históricas de Exploración Polar',
    category: 'EXPLORACIÓN & CIENCIA',
    sdg: 11,
    sdgColor: SDG_COLORS[11],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/historic_routes',
      attribution: 'American Geographical Society / Quantarctica',
    },
    paint: {
      'line-color': '#eab308',
      'line-width': 2.4,
      'line-dasharray': [5, 2],
    },
  },
  rock_outcrops: {
    id: 'rock_outcrops',
    name: 'Afloramientos Rocosos Antárticos (SCAR ADD / NPI)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/rock_outcrops',
      attribution: 'SCAR Antarctic Digital Database / NPI Quantarctica',
    },
    paint: {
      'fill-color': '#94a3b8',
      'fill-opacity': 0.35,
      'fill-outline-color': '#475569',
    },
  },
  glacier_velocity: {
    id: 'glacier_velocity',
    name: 'Velocidad de Glaciares Vectorial (MEaSUREs InSAR)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/glacier_velocity',
      attribution: 'NASA MEaSUREs InSAR / Quantarctica Glaciology',
    },
    paint: {
      'line-color': '#34d399',
      'line-width': 2.4,
    },
  },
  emperor_penguin_colonies: {
    id: 'emperor_penguin_colonies',
    name: 'Colonias de Pingüino Emperador (BAS / NPI Satelital)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/emperor_penguin_colonies',
      attribution: 'British Antarctic Survey / NPI Quantarctica 3.0',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#fbbf24',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#000000',
    },
  },
  important_bird_areas: {
    id: 'important_bird_areas',
    name: 'Áreas Importantes para la Conservación de Aves (IBAs BirdLife)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/important_bird_areas',
      attribution: 'BirdLife International / SCAR Biology',
    },
    paint: {
      'fill-color': '#f59e0b',
      'fill-opacity': 0.28,
      'fill-outline-color': '#b45309',
    },
  },
  historic_stations: {
    id: 'historic_stations',
    name: 'Sitios y Monumentos Históricos Polares (SMH / ATS)',
    category: 'EXPLORACIÓN & CIENCIA',
    sdg: 11,
    sdgColor: SDG_COLORS[11],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/historic_stations',
      attribution: 'Secretaría del Tratado Antártico / Quantarctica Social Science',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#eab308',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  comnap_facilities: {
    id: 'comnap_facilities',
    name: 'Instalaciones Antárticas Globales COMNAP (Estaciones & Refugios)',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/comnap_facilities',
      attribution: 'COMNAP Antarctic Facilities Database / NPI',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#38bdf8',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  aspa_polygons: {
    id: 'aspa_polygons',
    name: 'Zonas Antárticas Especialmente Protegidas Polígonos (ASPA CEP)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/aspa_polygons',
      attribution: 'Secretaría del Tratado Antártico / CEP',
    },
    paint: {
      'fill-color': '#ef4444',
      'fill-opacity': 0.28,
      'fill-outline-color': '#b91c1c',
    },
  },
  asma_polygons: {
    id: 'asma_polygons',
    name: 'Zonas Antárticas Especialmente Administradas Polígonos (ASMA CEP)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/asma_polygons',
      attribution: 'Secretaría del Tratado Antártico / CEP',
    },
    paint: {
      'fill-color': '#8b5cf6',
      'fill-opacity': 0.25,
      'fill-outline-color': '#6d28d9',
    },
  },
  ccamlr_mpas: {
    id: 'ccamlr_mpas',
    name: 'Áreas Marinas Protegidas CCAMLR (Ross Sea & South Orkneys)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/quantarctica/layers/ccamlr_mpas',
      attribution: 'CCAMLR Secretariat / Marine Protection Areas',
    },
    paint: {
      'fill-color': '#0284c7',
      'fill-opacity': 0.25,
      'fill-outline-color': '#0369a1',
    },
  },
  salinity: {
    id: 'salinity',
    name: 'Salinidad Oceánica Superficial (WOA13)',
    category: 'OCEANOGRAFÍA & FÍSICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'raster',
    source: {
      type: 'raster',
      url: '/data/web/cog/salinity.tif',
      tileSize: 256,
      attribution: 'World Ocean Atlas 2013 / NOAA',
    },
    paint: {
      'raster-opacity': 0.6,
    },
  },
  argo_floats: {
    id: 'argo_floats',
    name: 'Flotadores Perfiladores Argo GDAC',
    category: 'OCEANOGRAFÍA & FÍSICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/argo/floats',
      attribution: 'Argo Global Data Assembly Center',
    },
    paint: {
      'circle-radius': 5,
      'circle-color': SDG_COLORS[14],
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },

  // 3. ACTIVIDAD MARÍTIMA & PESCA (GFW) (ODS 14: Vida Submarina)
  gfw_fishing_effort: {
    id: 'gfw_fishing_effort',
    name: 'Esfuerzo Pesquero Aparente (Global Fishing Watch)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/gfw/fishing-effort',
      attribution: 'Global Fishing Watch 4Wings API',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#ff4d4d',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  gfw_sar_detections: {
    id: 'gfw_sar_detections',
    name: 'Detecciones Satelitales Radar SAR (GFW)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/gfw/sar-detections',
      attribution: 'GFW Sentinel-1 SAR Vessel Detections',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#ffaa00',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#000000',
    },
  },
  gfw_encounters: {
    id: 'gfw_encounters',
    name: 'Encuentros y Transbordos en Alta Mar (GFW)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/gfw/encounters',
      attribution: 'Global Fishing Watch Encounter Events',
    },
    paint: {
      'circle-radius': 8,
      'circle-color': '#e040fb',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  gfw_vessel_presence: {
    id: 'gfw_vessel_presence',
    name: 'Presencia de Flotas Pesqueras (GFW)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/gfw/vessel-presence',
      attribution: 'Global Fishing Watch Presence API',
    },
    paint: {
      'circle-radius': 5,
      'circle-color': '#ff9100',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
  },
  ais_vessels: {
    id: 'ais_vessels',
    name: 'Tráfico de Buques en Vivo (AISStream / Hub)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/ais/vessels',
      attribution: 'AISStream / Live Maritime Tracking',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#35c3c8',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  tourism_vessels: {
    id: 'tourism_vessels',
    name: 'Rutas y Buques Turísticos (IAATO)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/tourism_vessels.geojson',
      attribution: 'IAATO / Expeditions Fleet',
    },
    paint: {
      'line-color': SDG_COLORS[12],
      'line-width': 2.0,
      'line-dasharray': [3, 1],
    },
  },

  // 4. BIODIVERSIDAD & ECOSISTEMAS (ODS 15: Ecosistemas Terrestres / 14: Vida Marina)
  quantarctica_penguins: {
    id: 'quantarctica_penguins',
    name: 'Colonias de Pingüino Emperador (Quantarctica)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/penguin_colonies.geojson',
      attribution: 'BAS / Quantarctica 3.0 Biology',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': SDG_COLORS[15],
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  quantarctica_seals: {
    id: 'quantarctica_seals',
    name: 'Distribución y Rastreo de Focas (MEOP)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/seal_distribution.geojson',
      attribution: 'MEOP / Marine Mammals Exploring the Oceans',
    },
    paint: {
      'circle-radius': 4,
      'circle-color': '#00e676',
      'circle-opacity': 0.85,
    },
  },
  krill_occurrences: {
    id: 'krill_occurrences',
    name: 'Distribución de Biomasa de Krill (OBIS / CCAMLR)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/krill.geojson',
      attribution: 'OBIS-SEAMAP / CCAMLR',
    },
    paint: {
      'circle-radius': 5,
      'circle-color': '#ff7043',
      'circle-opacity': 0.75,
    },
  },
  whales: {
    id: 'whales',
    name: 'Avistamientos de Cetáceos y Rutas de Migración',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/whales.geojson',
      attribution: 'IWC / Southern Ocean Whale Sanctuary',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#29b6f6',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  quantarctica_vegetation: {
    id: 'quantarctica_vegetation',
    name: 'Vegetación Antártica y Oasis Libres de Hielo',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/vegetation.geojson',
      attribution: 'ERA / SCAR Flora Registry',
    },
    paint: {
      'circle-radius': 5,
      'circle-color': SDG_COLORS[15],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
  },
  antarctic_fauna: {
    id: 'antarctic_fauna',
    name: 'Fauna Antártica Circumpolar (Catálogo 53 Especies / 18 Sectores)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/antarctic_fauna.geojson',
      attribution: 'SCAR / OBIS / AMOH Circumpolar Registry',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#72e0b5',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  phytoplankton_chlorophyll: {
    id: 'phytoplankton_chlorophyll',
    name: 'Floraciones de Fitoplancton y Clorofila-a (Sentinel-3 / MODIS)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: '#10b981',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/phytoplankton_chlorophyll.geojson',
      attribution: 'Copernicus Sentinel-3 OLCI / MODIS-Aqua Ocean Color',
    },
    paint: {
      'circle-radius': 7.5,
      'circle-color': '#10b981',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#a7f3d0',
    },
  },
  fauna_schools_fish: {
    id: 'fauna_schools_fish',
    name: 'Cardúmenes de Peces y Manto Acústico (Simrad EK80 38/120 kHz)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: '#38bdf8',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_schools_fish.geojson',
      attribution: 'Simrad EK80 Acoustic Backscatter / CCAMLR Subarea 48 & 88',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#38bdf8',
      'circle-stroke-width': 1.8,
      'circle-stroke-color': '#ffffff',
    },
  },
  fauna_krill_swarms: {
    id: 'fauna_krill_swarms',
    name: 'Súper-enjambres de Krill Antártico (Biomasa Acústica CCAMLR)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: '#fb923c',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_krill_swarms.geojson',
      attribution: 'CCAMLR Krill Acoustic Biomass Survey / WG-EMM',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#fb923c',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffedd5',
    },
  },
  fauna_whale_pods: {
    id: 'fauna_whale_pods',
    name: 'Manadas y Corredores de Ballenas (IWC SOWER / Ballenas)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: '#06b6d4',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_whale_pods.geojson',
      attribution: 'IWC SOWER / Southern Ocean Whale Sanctuary',
    },
    paint: {
      'circle-radius': 7.5,
      'circle-color': '#06b6d4',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  fauna_penguins: {
    id: 'fauna_penguins',
    name: 'Colonias y Censos de Pingüinos (MAPPPD / SCAR)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_penguins.geojson',
      attribution: 'MAPPPD / BAS / SCAR Antarctic Penguin Census',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#fbbf24',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  fauna_pinnipeds: {
    id: 'fauna_pinnipeds',
    name: 'Focas y Pinnípedos Polares (Weddell, Leopardo, Cangrejera)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_pinnipeds.geojson',
      attribution: 'MEOP / SCAR Expert Group on Birds and Marine Mammals',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#2dd4bf',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  fauna_seabirds: {
    id: 'fauna_seabirds',
    name: 'Aves Marinas y Albatros (ACAP / SCAR)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_seabirds.geojson',
      attribution: 'Agreement on the Conservation of Albatrosses and Petrels (ACAP)',
    },
    paint: {
      'circle-radius': 5.5,
      'circle-color': '#a78bfa',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  fauna_benthos: {
    id: 'fauna_benthos',
    name: 'Comunidades Bentónicas y Esponjas Polares (SCAR / CAML)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: '#10b981',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_benthos.geojson',
      attribution: 'Census of Antarctic Marine Life / SCAR Benthic Biology',
    },
    paint: {
      'circle-radius': 5.5,
      'circle-color': '#10b981',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  fauna_cetaceans: {
    id: 'fauna_cetaceans',
    name: 'Cetáceos y Grandes Ballenas (IWC / AMOH Marine Registry)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: '#06b6d4',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_cetaceans.geojson',
      attribution: 'International Whaling Commission / SOWER',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#06b6d4',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  fauna_fish: {
    id: 'fauna_fish',
    name: 'Ictiofauna Polar y Nototénidos (CCAMLR Fish Surveys)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: '#38bdf8',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_fish.geojson',
      attribution: 'CCAMLR Working Group on Fish Stock Assessment',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#38bdf8',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  fauna_krill: {
    id: 'fauna_krill',
    name: 'Biomasa y Muestreos de Krill (OBIS / CCAMLR)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: '#fb923c',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/fauna_krill.geojson',
      attribution: 'OBIS-SEAMAP / CCAMLR WG-EMM',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#fb923c',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },

  // 5. INFRAESTRUCTURA & LOGÍSTICA (ODS 9: Industria e Innovación)
  quantarctica_stations: {
    id: 'quantarctica_stations',
    name: 'Estaciones de Investigación Científica (COMNAP)',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/comnap_stations.geojson',
      attribution: 'Council of Managers of National Antarctic Programs',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': SDG_COLORS[9],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  quantarctica_runways: {
    id: 'quantarctica_runways',
    name: 'Pistas Aéreas y Aeródromos Polares (COMNAP/ICAO)',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/runways.geojson',
      attribution: 'COMNAP Air Operations Planning',
    },
    paint: {
      'line-color': '#ffa726',
      'line-width': 3,
    },
  },
  submarine_cables: {
    id: 'submarine_cables',
    name: 'Cables Submarinos y Puntos de Amarre Australes',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/landing_points.geojson',
      attribution: 'TeleGeography Submarine Cable Map',
    },
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffd54f',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#333333',
    },
  },

  // 6. GOBERNANZA & PROTECCIÓN (ODS 16: Paz e Instituciones Sólidas)
  quantarctica_aspa: {
    id: 'quantarctica_aspa',
    name: 'Zonas Antárticas Especialmente Protegidas (ASPA)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/aspa.geojson',
      attribution: 'Secretaría del Tratado Antártico (ATS) / CEP',
    },
    paint: {
      'fill-color': SDG_COLORS[16],
      'fill-opacity': 0.35,
      'fill-outline-color': SDG_COLORS[16],
    },
  },
  quantarctica_asma: {
    id: 'quantarctica_asma',
    name: 'Zonas Antárticas Especialmente Administradas (ASMA)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/asma.geojson',
      attribution: 'Secretaría del Tratado Antártico (ATS) / CEP',
    },
    paint: {
      'fill-color': '#9c27b0',
      'fill-opacity': 0.28,
      'fill-outline-color': '#ba68c8',
    },
  },
  quantarctica_ccamlr_mpa: {
    id: 'quantarctica_ccamlr_mpa',
    name: 'Áreas Marinas Protegidas CCAMLR (MPAs)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/ccamlr_mpa.geojson',
      attribution: 'CCAMLR Secretariat / Marine Protection Areas',
    },
    paint: {
      'fill-color': '#0288d1',
      'fill-opacity': 0.3,
      'fill-outline-color': '#29b6f6',
    },
  },
  treaty_claims: {
    id: 'treaty_claims',
    name: 'Fronteras y Reclamaciones del Tratado Antártico (Art. IV)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/treaty_claims.geojson',
      attribution: 'Secretaría del Tratado Antártico / ATS Article IV',
    },
    paint: {
      'fill-color': '#0284c7',
      'fill-opacity': 0.20,
      'line-color': '#38bdf8',
      'line-width': 2,
    },
  },
  ccamlr_zones: {
    id: 'ccamlr_zones',
    name: 'Zonas Estadísticas y de Pesca CCAMLR (Áreas 48, 58, 88)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/ccamlr_zones.geojson',
      attribution: 'CCAMLR Secretariat Fisheries Statistics',
    },
    paint: {
      'fill-color': '#06b6d4',
      'fill-opacity': 0.15,
      'line-color': '#22d3ee',
      'line-width': 1.8,
    },
  },
  sar_regions: {
    id: 'sar_regions',
    name: 'Regiones SAR de Búsqueda y Salvamento Marítimo Austral',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: '#ef4444',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/sar_regions.geojson',
      attribution: 'IMO / ICAO Global Search and Rescue Plan',
    },
    paint: {
      'line-color': '#ef4444',
      'line-width': 2.2,
      'line-dasharray': [4, 2],
    },
  },

  // 7. GEOFÍSICA & ESPACIO (ODS 9: Industria e Innovación / 11: Comunidades Resilientes)
  seismic_events: {
    id: 'seismic_events',
    name: 'Eventos Sísmicos Circumpolares (USGS)',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/seismic/events',
      attribution: 'USGS Earthquake Hazards Program',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#ff1744',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  satellites_orbital: {
    id: 'satellites_orbital',
    name: 'Constelación Satelital Polar (NORAD / CelesTrak)',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/satellites/current',
      attribution: 'NORAD / CelesTrak Orbital Ephemeris',
    },
    paint: {
      'circle-radius': 5,
      'circle-color': '#7c4dff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
  },
  nasa_icesat2_tracks: {
    id: 'nasa_icesat2_tracks',
    name: 'NASA ICESat-2 — Altimetría Láser & Francobordo ATL07',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/nasa/icesat2/tracks',
      attribution: 'NASA Cryospheric Sciences / NSIDC DAAC',
    },
    paint: {
      'line-color': '#00e5ff',
      'line-width': 2.5,
    },
  },
  nasa_firms_thermal: {
    id: 'nasa_firms_thermal',
    name: 'NASA FIRMS — Anomalías Térmicas Polares (VIIRS 375m)',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/nasa/firms/thermal-anomalies',
      attribution: 'NASA FIRMS / LANCE / EOSDIS',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#ff3d00',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },

  // 8. CAPAS CANÓNICAS DINÁMICAS & FLOTAS 4D
  maritime_vessels: {
    id: 'maritime_vessels',
    name: 'Tráfico de Buques en Vivo (AISStream / Hub)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/ais/vessels',
      attribution: 'AISStream.io / Coastal AIS Stations',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#00e5ff',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  polar_aircraft: {
    id: 'polar_aircraft',
    name: 'Tráfico Aéreo Polar y Logístico (ADS-B Hub)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/aviation/flights',
      attribution: 'ADS-B Exchange / OpenSky Network',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#ffd600',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#000000',
    },
  },
  polar_satellites: {
    id: 'polar_satellites',
    name: 'Vigilancia Orbital y Constelaciones Polares (NORAD)',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/api/satellites/current',
      attribution: 'NORAD / CelesTrak Space Catalog',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#b388ff',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  iaato_routes: {
    id: 'iaato_routes',
    name: 'Rutas de Turismo IAATO 2026–2030 (Expediciones & Vuelo)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/iaato_routes.geojson',
      attribution: 'IAATO Tourism Registry 2026-2030',
    },
    paint: {
      'line-color': SDG_COLORS[12],
      'line-width': 2.5,
      'line-opacity': 0.85,
      'line-dasharray': [3, 2],
    },
  },
  iaato_landing_sites: {
    id: 'iaato_landing_sites',
    name: 'Sitios de Desembarco en Zodiac (IAATO)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/iaato_landing_sites.geojson',
      attribution: 'IAATO Site Guidelines & Visitor Management',
    },
    paint: {
      'circle-radius': 5,
      'circle-color': '#38bdf8',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  iaato_deep_field_camps: {
    id: 'iaato_deep_field_camps',
    name: 'Campamentos de Interior Profundo & Pistas de Hielo Azul',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/iaato_deep_field_camps.geojson',
      attribution: 'COMNAP & IAATO Deep Field Operators',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#a855f7',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  luxury_camps: {
    id: 'luxury_camps',
    name: 'Campamentos de Lujo & Glamping Polar (White Desert / ALE)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: '#f59e0b',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/antarctic_luxury_camps.geojson',
      attribution: 'White Desert / ALE / Ultima Antarctic / IAATO Deep Field',
    },
    paint: {
      'circle-radius': 7.5,
      'circle-color': '#f59e0b',
      'circle-stroke-width': 2.2,
      'circle-stroke-color': '#ffffff',
    },
  },
  influencer_tourism_footprint: {
    id: 'influencer_tourism_footprint',
    name: 'Huella de Turismo e Impacto en Sitios Vulnerables (IAATO / CEP)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/influencer_tourism_footprint.geojson',
      attribution: 'AMOH Polar Tourism Observatory / IAATO Footprint Metrics',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#f43f5e',
      'circle-stroke-width': 1.8,
      'circle-stroke-color': '#ffffff',
    },
  },
  tourist_submersibles: {
    id: 'tourist_submersibles',
    name: 'Sumergibles de Expedición & Puntos de Inmersión',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/expedition_submersibles.geojson',
      attribution: 'IAATO Marine Operations / U-Boat Worx / Triton Submarines',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#0284c7',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  heavy_traverses: {
    id: 'heavy_traverses',
    name: 'Travesías Terrestres Pesadas (SPoT / Concordia / Vostok)',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/antarctic_heavy_traverses.geojson',
      attribution: 'USAP SPoT / IPEV-PNRA Raid Concordia / RAE Raid Vostok / ALE',
    },
    paint: {
      'line-color': '#ea580c',
      'line-width': 3.2,
    },
  },
  autonomous_yachts: {
    id: 'autonomous_yachts',
    name: 'Misiones Autónomas (Saildrone / AUVs) & Veleros de Expedición',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/polar_autonomous_and_yachts.geojson',
      attribution: 'Saildrone Inc. / ITGC Thwaites / IAATO Category 1 Sailboats',
    },
    paint: {
      'line-color': '#06b6d4',
      'line-width': 2.2,
      'line-dasharray': [3, 2],
    },
  },
  subsurface_nuclear: {
    id: 'subsurface_nuclear',
    name: 'Submarinos Nucleares & Red Hidroacústica CTBTO',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/subsurface_and_nuclear_patrols.geojson',
      attribution: 'CTBTO Preparatory Commission / Royal Navy / US Navy Geopolitical Baselines',
    },
    paint: {
      'line-color': '#e11d48',
      'line-width': 2.5,
      'line-dasharray': [4, 2],
    },
  },

  // 9. CAPAS ESTRATÉGICAS GLOBALES & INTEL OSINT
  military_bases: {
    id: 'military_bases',
    name: 'Bases Militares y Apoyo Logístico Antártico',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/military_bases.geojson',
      attribution: 'COMNAP & Southern Ocean Defense Logistics',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#ef4444',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  nuclear_sites: {
    id: 'nuclear_sites',
    name: 'Sitio Nuclear Histórico Antártico (McMurdo PM-3A / OIEA)',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/nuclear_sites.geojson',
      attribution: 'IAEA MARIS & Archivo Histórico PM-3A McMurdo',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#ff5e8a',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  maris_measurements: {
    id: 'maris_measurements',
    name: 'MARIS · Mediciones antárticas abiertas',
    category: 'CONTAMINANTES & TRAZADORES MARINOS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/maris_antarctic_measurements.geojson',
      attribution: 'IAEA MARIS · catálogo abierto local',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#fb7185',
      'circle-stroke-width': 1.8,
      'circle-stroke-color': '#ffe4e6',
    },
  },
  spaceports: {
    id: 'spaceports',
    name: 'Puertos Espaciales & Plataformas de Lanzamiento',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/spaceports.geojson',
      attribution: 'Global Spaceport Index / ESA / NASA',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#a855f7',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  strategic_waterways: {
    id: 'strategic_waterways',
    name: 'Pasajes y Vías Estratégicas Australes (Drake, Magallanes, Beagle)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/strategic_waterways.geojson',
      attribution: 'IHO / IMO / SHOA Corredores Australes',
    },
    paint: {
      'line-color': '#00e5ff',
      'line-width': 3,
      'line-dasharray': [4, 2],
    },
  },
  ai_datacenters: {
    id: 'ai_datacenters',
    name: 'Nodo de Cómputo Subpolar Austral (Punta Arenas Gateway)',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/ai_datacenters.geojson',
      attribution: 'Epoch AI / Green Supercomputing Registry',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#06b6d4',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  conflict_zones: {
    id: 'conflict_zones',
    name: 'Sectores Antárticos Reclamados & Monitoreo Geopolítico',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/conflict_zones.geojson',
      attribution: 'UCDP Uppsala Conflict Data Program / OSINT Hub',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#dc2626',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fee2e2',
    },
  },
  gps_jamming: {
    id: 'gps_jamming',
    name: 'Interferencia GNSS & GPS Jamming Monitor',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/gps_jamming.geojson',
      attribution: 'GPSJam & Ionospheric Disturbance Network',
    },
    paint: {
      'circle-radius': 8,
      'circle-color': '#f97316',
      'circle-opacity': 0.6,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffedd5',
    },
  },
  live_webcams: {
    id: 'live_webcams',
    name: 'Cámaras Polares y Marítimas en Vivo (HD / 4K)',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/live_webcams.geojson',
      attribution: 'COMNAP & National Antarctic Program Webcams',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#10b981',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },
  natural_events: {
    id: 'natural_events',
    name: 'Eventos Crioféricos & Desprendimiento de Icebergs (NASA EONET)',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/natural_events.geojson',
      attribution: 'NASA Earth Observatory Natural Event Tracker (EONET)',
    },
    paint: {
      'circle-radius': 5,
      'circle-color': '#f59e0b',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
  },
  wildfires: {
    id: 'wildfires',
    name: 'Focos de Calor e Incendios Forestales (FIRMS / NASA)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/wildfires.geojson',
      attribution: 'NASA FIRMS Fire Information for Resource Management',
    },
    paint: {
      'circle-radius': 5,
      'circle-color': '#ff3d00',
      'circle-stroke-width': 1.2,
      'circle-stroke-color': '#ffff00',
    },
  },
  critical_minerals: {
    id: 'critical_minerals',
    name: 'Yacimientos Minerales Antárticos (Moratoria Art. 7 Protocolo de Madrid)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/critical_minerals.geojson',
      attribution: 'SCAR Geoscience & Madrid Protocol Annex',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#eab308',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#000000',
    },
  },
  offshore_wells: {
    id: 'offshore_wells',
    name: 'Pozos Offshore & Sondeos de Investigación (CMA-1 / DSDP)',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 7,
    sdgColor: SDG_COLORS[7],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/offshore_wells.geojson',
      attribution: 'Secretaría de Energía / GEM / DSDP / ODP / SCAR',
    },
    paint: {
      'circle-radius': 6.5,
      'circle-color': '#f59e0b',
      'circle-stroke-width': 1.8,
      'circle-stroke-color': '#000000',
    },
  },
  deepsea_mining: {
    id: 'deepsea_mining',
    name: 'Minería Submarina & Depósitos Abisales (SMS, Nódulos, Venting)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/deepsea_mining.geojson',
      attribution: 'InterRidge / ISA / ChEss Southern Ocean / SCAR',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#d946ef',
      'circle-stroke-width': 1.8,
      'circle-stroke-color': '#ffffff',
    },
  },
  climate_anomalies: {
    id: 'climate_anomalies',
    name: 'Anomalías Climáticas & Pérdida Glaciar Crítica',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/climate_anomalies.geojson',
      attribution: 'NSIDC Polar Cryosphere Anomaly Monitor',
    },
    paint: {
      'circle-radius': 8,
      'circle-color': '#38bdf8',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },

  // 10. MAPAS DE CALOR CONTINUOS (WEBGL HEATMAPS)
  gfw_fishing_effort_heatmap: {
    id: 'gfw_fishing_effort_heatmap',
    name: 'Mapa de Calor: Esfuerzo Pesquero Continuo (GFW)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'heatmap',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/gfw_fishing_effort.geojson',
      attribution: 'Global Fishing Watch 4Wings Thermal Map',
    },
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['coalesce', ['get', 'hours'], 1], 0, 0, 100, 1],
      'heatmap-intensity': 1.5,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 0, 0)',
        0.2, '#00e5ff',
        0.5, '#ffd600',
        0.8, '#ff9100',
        1.0, '#ff1744',
      ],
      'heatmap-radius': 30,
      'heatmap-opacity': 0.85,
    },
  },
  seismic_heatmap: {
    id: 'seismic_heatmap',
    name: 'Mapa de Calor: Concentración Sísmica Litosférica',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    type: 'heatmap',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/seismic_events.geojson',
      attribution: 'USGS / SCAR Antarctic Seismic Catalog',
    },
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['coalesce', ['get', 'magnitude'], 4], 3, 0.2, 7, 1],
      'heatmap-intensity': 1.8,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 0, 0)',
        0.2, '#818cf8',
        0.5, '#f43f5e',
        1.0, '#fbbf24',
      ],
      'heatmap-radius': 35,
      'heatmap-opacity': 0.8,
    },
  },
  fauna_density_heatmap: {
    id: 'fauna_density_heatmap',
    name: 'Mapa de Calor: Densidad y Biomasa de Fauna Marina (Krill)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'heatmap',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/krill.geojson',
      attribution: 'CCAMLR / OBIS Biodiversity Heatmap',
    },
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': 1.4,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 0, 0)',
        0.2, '#10b981',
        0.5, '#3b82f6',
        0.8, '#a855f7',
        1.0, '#ec4899',
      ],
      'heatmap-radius': 40,
      'heatmap-opacity': 0.75,
    },
  },
  penguin_heatmap: {
    id: 'penguin_heatmap',
    name: 'Mapa de Calor: Concentración de Pingüinos Emperador',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    type: 'heatmap',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/penguin_colonies.geojson',
      attribution: 'BAS / Quantarctica 3.0 Biology',
    },
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['coalesce', ['get', 'population'], 100], 0, 0.2, 5000, 1],
      'heatmap-intensity': 1.6,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 0, 0)',
        0.2, '#34d399',
        0.5, '#06b6d4',
        0.8, '#f59e0b',
        1.0, '#ef4444',
      ],
      'heatmap-radius': 35,
      'heatmap-opacity': 0.85,
    },
  },
  whales_heatmap: {
    id: 'whales_heatmap',
    name: 'Mapa de Calor: Rutas y Densidad de Cetáceos (Ballenas)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'heatmap',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/whales.geojson',
      attribution: 'IWC / Southern Ocean Whale Sanctuary',
    },
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['coalesce', ['get', 'individuals'], 1], 1, 0.3, 10, 1],
      'heatmap-intensity': 1.5,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 0, 0)',
        0.2, '#00e5ff',
        0.5, '#3b82f6',
        0.8, '#8b5cf6',
        1.0, '#ec4899',
      ],
      'heatmap-radius': 45,
      'heatmap-opacity': 0.8,
    },
  },
  nuclear_contamination_heatmap: {
    id: 'nuclear_contamination_heatmap',
    name: 'Mapa de Calor: Residuos Nucleares y Radiactividad Oceánica',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    type: 'heatmap',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/nuclear_sites.geojson',
      attribution: 'IAEA MARIS / Nuclear Dumping Inventory',
    },
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': 2.0,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 0, 0)',
        0.2, '#facc15',
        0.5, '#f97316',
        0.8, '#ef4444',
        1.0, '#b91c1c',
      ],
      'heatmap-radius': 32,
      'heatmap-opacity': 0.85,
    },
  },
  grey_zones_defense: {
    id: 'grey_zones_defense',
    name: 'Zonas Grises en Seguridad, Defensa & Doble Uso Polar',
    category: 'GOBERNANZA & SOBERANÍA',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/grey_zones_defense.geojson',
      attribution: 'AMOH Strategic Defense Observatory / ATS & CCAMLR Radar Node',
    },
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1, 6,
        4, 9,
        8, 14,
      ],
      'circle-color': [
        'match',
        ['get', 'tension_level'],
        'CRITICAL', '#ef4444',
        'HIGH', '#f59e0b',
        'ELEVATED', '#a855f7',
        '#38bdf8',
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  grey_zones_defense_heatmap: {
    id: 'grey_zones_defense_heatmap',
    name: 'Mapa de Calor: Fricción Geopolítica & Zonas Grises',
    category: 'GOBERNANZA & SOBERANÍA',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'heatmap',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/grey_zones_defense.geojson',
      attribution: 'AMOH Strategic Defense Observatory / ATS & CCAMLR Radar Node',
    },
    paint: {
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'tension_weight'], 0.6],
        0, 0.2,
        0.5, 0.6,
        1.0, 1.0,
      ],
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1, 1.5,
        5, 2.2,
        9, 3.2,
      ],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 0, 0)',
        0.12, 'rgba(56, 189, 248, 0.35)',
        0.35, 'rgba(168, 85, 247, 0.65)',
        0.60, 'rgba(245, 158, 11, 0.85)',
        0.85, 'rgba(239, 68, 68, 0.95)',
        1.0, 'rgba(255, 255, 255, 1.0)',
      ],
      'heatmap-radius': [
        'interpolate',
        ['exponential', 1.3],
        ['zoom'],
        1, 28,
        4, 55,
        8, 110,
      ],
      'heatmap-opacity': 0.88,
    },
  },
  polar_friction_sectors: {
    id: 'polar_friction_sectors',
    name: 'Coropleta: Barómetro de Fricción Polar por Sectores (PFI)',
    category: 'GOBERNANZA & SOBERANÍA',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/polar_friction_sectors.geojson',
      attribution: 'AMOH Polar Friction Index / Multidimensional Model',
    },
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'polar_friction_index'], 30],
        20, '#10b981',
        40, '#38bdf8',
        65, '#f59e0b',
        80, '#ef4444',
      ],
      'fill-opacity': 0.35,
      'line-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'polar_friction_index'], 30],
        20, '#059669',
        40, '#0284c7',
        65, '#d97706',
        80, '#dc2626',
      ],
      'line-width': 2.0,
    },
  },
  grey_zones_buffers: {
    id: 'grey_zones_buffers',
    name: 'Zonas de Cobertura SIGINT, Radares & Buffers de Exclusión',
    category: 'GOBERNANZA & SOBERANÍA',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/grey_zones_buffers.geojson',
      attribution: 'AMOH Defense Radius / Sensor Cones Model',
    },
    paint: {
      'fill-color': ['coalesce', ['get', 'color'], '#a855f7'],
      'fill-opacity': 0.22,
      'line-color': ['coalesce', ['get', 'color'], '#a855f7'],
      'line-width': 1.8,
      'line-dasharray': [2, 2],
    },
  },

  // ── National Geographic MapMaker (atlas mm.atlas) ──
  ...NATGEO_MAPMAKER_LAYERS,

  // ── Radar de apertura sintética: NASA ASF (NISAR, Sentinel-1, ALOS PALSAR)
  //    y la escena abierta de RCM de la CSA. Procedencia y límites de la
  //    cosecha: src/lib/olea-sar-layers.ts
  ...OLEA_SAR_LAYERS,
};
