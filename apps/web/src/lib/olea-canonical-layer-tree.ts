// OLEA_RESEARCH_V2 — generated canonical layer tree. Do not hand-edit.
import {
  HIERARCHICAL_LAYER_TREE,
  type DomainCategory,
  type LeafLayerItem,
} from './hierarchical-layers';
import {
  NATGEO_MAPMAKER_TREE_ITEMS,
  NATGEO_MAPMAKER_META,
} from './natgeo-mapmaker-layers';
import {
  OLEA_SAR_TREE_ITEMS,
  OLEA_SAR_META,
} from './olea-sar-layers';

export interface CanonicalLayerMeta {
  domain: string;
  group: string;
  role: string;
}

export const CANONICAL_LAYER_META: Record<string, CanonicalLayerMeta> =
{
  lindeque_sediment_reference: { domain: 'PHYSICAL_EARTH', group: 'marine_geophysics', role: 'EXPLORATORY_REFERENCE' },
  khalifa_ml_exploratory_cpu: { domain: 'DERIVED_INTELLIGENCE', group: 'marine_geophysics', role: 'EXPLORATORY_ESTIMATE' },
  "pangaea_datasets": { domain: 'OBSERVATIONS_EVIDENCE', group: 'data_catalogs', role: 'DATA_CATALOG_INDEX' },
  "pangaea_global_density": { domain: 'OBSERVATIONS_EVIDENCE', group: 'data_catalogs', role: 'DATA_CATALOG_INDEX' },
  "copernicus_sst_peninsula": { domain: 'ENVIRONMENT', group: 'ocean_circulation', role: 'ENVIRONMENT_STATE' },
  "copernicus_sss_peninsula": { domain: 'ENVIRONMENT', group: 'ocean_circulation', role: 'ENVIRONMENT_STATE' },
  "copernicus_currents_peninsula": { domain: 'ENVIRONMENT', group: 'ocean_circulation', role: 'ENVIRONMENT_STATE' },
  "copernicus_sea_ice_edge": { domain: 'ENVIRONMENT', group: 'cryosphere', role: 'ENVIRONMENT_STATE' },
  "ibcso_v2_relief": { domain: 'PHYSICAL_EARTH', group: 'bathymetry_seafloor', role: 'PHYSICAL_PREDICTOR' },
  "ibcso_v2_tid": { domain: 'PHYSICAL_EARTH', group: 'bathymetry_seafloor', role: 'OBSERVATION' },
  "gebco_2025_relief": { domain: 'PHYSICAL_EARTH', group: 'bathymetry_seafloor', role: 'PHYSICAL_PREDICTOR' },
  "gsfm_seafloor_geomorphology": { domain: 'PHYSICAL_EARTH', group: 'bathymetry_seafloor', role: 'PHYSICAL_PREDICTOR' },
  "gebco_undersea_features": { domain: 'PHYSICAL_EARTH', group: 'bathymetry_seafloor', role: 'CONTEXT' },
  "gebco_undersea_feature_outlines": { domain: 'PHYSICAL_EARTH', group: 'bathymetry_seafloor', role: 'CONTEXT' },
  "bedmap3_ice_thickness": { domain: 'ENVIRONMENT', group: 'cryosphere', role: 'ENVIRONMENT_STATE' },
  "olea_obis_icefree_antarctica": { domain: 'ECOLOGY', group: 'terrestrial_icefree', role: 'TERRESTRIAL_OCCURRENCE_CONTEXT' },
  "olea_wap_2024_microphytoplankton": { domain: 'OBSERVATIONS_EVIDENCE', group: 'field_observations', role: 'FIELD_EVIDENCE' },
  "olea_antarctic_stylasteridae": { "domain": "ECOLOGY", "group": "biodiversity_occurrences", "role": "ECOLOGICAL_EVIDENCE" },
  "olea_antarctic_hexacorals": { "domain": "ECOLOGY", "group": "biodiversity_occurrences", "role": "ECOLOGICAL_EVIDENCE" },
  "rock_outcrops": {
    "domain": "REFERENCE_BASE",
    "group": "cartography",
    "role": "BASE_REFERENCE"
  },
  "quantarctica_coastline": {
    "domain": "REFERENCE_BASE",
    "group": "cartography",
    "role": "BASE_REFERENCE"
  },
  "historic_routes": {
    "domain": "REFERENCE_BASE",
    "group": "history_reference",
    "role": "CONTEXT"
  },
  "historic_stations": {
    "domain": "REFERENCE_BASE",
    "group": "history_reference",
    "role": "CONTEXT"
  },
  "quantarctica_bathymetry": {
    "domain": "PHYSICAL_EARTH",
    "group": "bathymetry_seafloor",
    "role": "PHYSICAL_PREDICTOR"
  },
  "seismic_events": {
    "domain": "PHYSICAL_EARTH",
    "group": "seismicity_geophysics",
    "role": "OBSERVATION"
  },
  "polar_cyclones": {
    "domain": "ENVIRONMENT",
    "group": "atmosphere_weather",
    "role": "ENVIRONMENT_STATE"
  },
  "ecmwf_wind": {
    "domain": "ENVIRONMENT",
    "group": "atmosphere_weather",
    "role": "ENVIRONMENT_STATE"
  },
  "quantarctica_ice_shelf": {
    "domain": "ENVIRONMENT",
    "group": "cryosphere",
    "role": "ENVIRONMENT_STATE"
  },
  "sea_ice_concentration": {
    "domain": "ENVIRONMENT",
    "group": "cryosphere",
    "role": "ENVIRONMENT_STATE"
  },
  "median_sea_ice_extents": {
    "domain": "ENVIRONMENT",
    "group": "cryosphere",
    "role": "ENVIRONMENT_STATE"
  },
  "ice_shelves": {
    "domain": "ENVIRONMENT",
    "group": "cryosphere",
    "role": "ENVIRONMENT_STATE"
  },
  "quantarctica_glaciers": {
    "domain": "ENVIRONMENT",
    "group": "cryosphere",
    "role": "ENVIRONMENT_STATE"
  },
  "glacier_velocity": {
    "domain": "ENVIRONMENT",
    "group": "cryosphere",
    "role": "ENVIRONMENT_STATE"
  },
  "maris_radionuclides": {
    "domain": "ENVIRONMENT",
    "group": "marine_contaminants_tracers",
    "role": "CONDITIONAL_CONTEXT"
  },
  "southern_ocean_fronts": {
    "domain": "ENVIRONMENT",
    "group": "ocean_circulation",
    "role": "ENVIRONMENT_STATE"
  },
  "acc_fronts": {
    "domain": "ENVIRONMENT",
    "group": "ocean_circulation",
    "role": "ENVIRONMENT_STATE"
  },
  "obis_biodiversity": {
    "domain": "ECOLOGY",
    "group": "biodiversity_occurrences",
    "role": "ECOLOGICAL_EVIDENCE"
  },
  "emperor_penguin_colonies": {
    "domain": "ECOLOGY",
    "group": "colonies_habitats",
    "role": "ECOLOGICAL_EVIDENCE"
  },
  "penguin_colonies": {
    "domain": "ECOLOGY",
    "group": "colonies_habitats",
    "role": "ECOLOGICAL_EVIDENCE"
  },
  "important_bird_areas": {
    "domain": "ECOLOGY",
    "group": "conservation_ecology",
    "role": "ECOLOGICAL_CONTEXT"
  },
  "polar_aviation": {
    "domain": "HUMAN_ACTIVITY",
    "group": "aviation_logistics",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "heavy_traverses": {
    "domain": "HUMAN_ACTIVITY",
    "group": "aviation_logistics",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "deepsea_mining": {
    "domain": "HUMAN_ACTIVITY",
    "group": "extractive_activity",
    "role": "HUMAN_ACTIVITY_CONTEXT"
  },
  "offshore_wells": {
    "domain": "HUMAN_ACTIVITY",
    "group": "extractive_activity",
    "role": "INFRASTRUCTURE"
  },
  "gfw_fishing_effort": {
    "domain": "HUMAN_ACTIVITY",
    "group": "fisheries",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "ccamlr_registry": {
    "domain": "HUMAN_ACTIVITY",
    "group": "fisheries",
    "role": "IDENTITY_CONTEXT"
  },
  "antarctic_stations": {
    "domain": "HUMAN_ACTIVITY",
    "group": "infrastructure",
    "role": "INFRASTRUCTURE"
  },
  "submarine_cables": {
    "domain": "HUMAN_ACTIVITY",
    "group": "infrastructure",
    "role": "INFRASTRUCTURE"
  },
  "comnap_facilities": {
    "domain": "HUMAN_ACTIVITY",
    "group": "infrastructure",
    "role": "INFRASTRUCTURE"
  },
  "inach_shetland_23": {
    "domain": "HUMAN_ACTIVITY",
    "group": "infrastructure",
    "role": "INFRASTRUCTURE"
  },
  "ais_vessels": {
    "domain": "HUMAN_ACTIVITY",
    "group": "maritime_vessels",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "research_vessels": {
    "domain": "HUMAN_ACTIVITY",
    "group": "maritime_vessels",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "tourist_vessels": {
    "domain": "HUMAN_ACTIVITY",
    "group": "maritime_vessels",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "gfw_vessel_presence": {
    "domain": "HUMAN_ACTIVITY",
    "group": "maritime_vessels",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "gfw_sar_detections": {
    "domain": "HUMAN_ACTIVITY",
    "group": "maritime_vessels",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "autonomous_yachts": {
    "domain": "HUMAN_ACTIVITY",
    "group": "maritime_vessels",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "iaato_deep_field_camps": {
    "domain": "HUMAN_ACTIVITY",
    "group": "tourism",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "luxury_camps": {
    "domain": "HUMAN_ACTIVITY",
    "group": "tourism",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "iaato_routes": {
    "domain": "HUMAN_ACTIVITY",
    "group": "tourism",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "iaato_landing_sites": {
    "domain": "HUMAN_ACTIVITY",
    "group": "tourism",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "tourist_submersibles": {
    "domain": "HUMAN_ACTIVITY",
    "group": "tourism",
    "role": "HUMAN_ACTIVITY_EVIDENCE"
  },
  "inach_chilean_territory": {
    "domain": "GOVERNANCE_CONSERVATION",
    "group": "claims_context",
    "role": "LEGAL_CONTEXT"
  },
  "acbrs": {
    "domain": "GOVERNANCE_CONSERVATION",
    "group": "protected_managed_areas",
    "role": "CONSERVATION_CONTEXT"
  },
  "asma": {
    "domain": "GOVERNANCE_CONSERVATION",
    "group": "protected_managed_areas",
    "role": "MANAGEMENT_CONTEXT"
  },
  "aspa_protected_areas": {
    "domain": "GOVERNANCE_CONSERVATION",
    "group": "protected_managed_areas",
    "role": "MANAGEMENT_CONTEXT"
  },
  "aspa": {
    "domain": "GOVERNANCE_CONSERVATION",
    "group": "protected_managed_areas",
    "role": "MANAGEMENT_CONTEXT"
  },
  "ccamlr_mpas": {
    "domain": "GOVERNANCE_CONSERVATION",
    "group": "protected_managed_areas",
    "role": "MANAGEMENT_CONTEXT"
  },
  "bbnj_high_seas": {
    "domain": "GOVERNANCE_CONSERVATION",
    "group": "treaties_management",
    "role": "LEGAL_CONTEXT"
  },
  "ccamlr_statistical_areas": {
    "domain": "GOVERNANCE_CONSERVATION",
    "group": "treaties_management",
    "role": "MANAGEMENT_CONTEXT"
  },
  "field_observations": {
    "domain": "OBSERVATIONS_EVIDENCE",
    "group": "field_observations",
    "role": "FIELD_EVIDENCE"
  },
  "argo_floats": {
    "domain": "OBSERVATIONS_EVIDENCE",
    "group": "in_situ_sensors",
    "role": "IN_SITU_OBSERVATION"
  },
  "hydrophone_network": {
    "domain": "OBSERVATIONS_EVIDENCE",
    "group": "in_situ_sensors",
    "role": "IN_SITU_OBSERVATION"
  },
  "live_webcams": {
    "domain": "OBSERVATIONS_EVIDENCE",
    "group": "live_cameras",
    "role": "LIVE_CONTEXT"
  },
  "satellite_tracking": {
    "domain": "OBSERVATIONS_EVIDENCE",
    "group": "remote_observation",
    "role": "REMOTE_OBSERVATION"
  },
  "polar_friction_sectors": {
    "domain": "DERIVED_INTELLIGENCE",
    "group": "derived_pressure",
    "role": "DERIVED"
  },
  "grey_zones_defense_heatmap": {
    "domain": "DERIVED_INTELLIGENCE",
    "group": "derived_pressure",
    "role": "DERIVED"
  },
  "subsurface_nuclear": {
    "domain": "DERIVED_INTELLIGENCE",
    "group": "experimental_legacy",
    "role": "EXPERIMENTAL_CONTEXT"
  },
  "grey_zones_defense": {
    "domain": "DERIVED_INTELLIGENCE",
    "group": "risk_intelligence",
    "role": "DERIVED"
  },
  "grey_zones_buffers": {
    "domain": "DERIVED_INTELLIGENCE",
    "group": "risk_intelligence",
    "role": "DERIVED"
  },
  "antgg_gravity_anomaly": {
    "domain": "PHYSICAL_EARTH",
    "group": "marine_geophysics",
    "role": "PHYSICAL_PREDICTOR"
  },
  "antgg_bouguer_anomaly": {
    "domain": "PHYSICAL_EARTH",
    "group": "marine_geophysics",
    "role": "CONDITIONAL_CONTEXT"
  },
  "admap2b_magnetic_anomaly": {
    "domain": "PHYSICAL_EARTH",
    "group": "marine_geophysics",
    "role": "PHYSICAL_PREDICTOR"
  },
  "admap2s_magnetic_anomaly": {
    "domain": "PHYSICAL_EARTH",
    "group": "marine_geophysics",
    "role": "CONDITIONAL_CONTEXT"
  },
  "research_vessel_webcams": {
    "domain": "OBSERVATIONS_EVIDENCE",
    "group": "live_cameras",
    "role": "LIVE_CONTEXT"
  }
};

const DOMAIN_SPECS = [
  [
    "REFERENCE_BASE",
    "BASE & REFERENCIA",
    "Layers",
    "#94a3b8"
  ],
  [
    "PHYSICAL_EARTH",
    "TIERRA FÍSICA & GEOFÍSICA",
    "Activity",
    "#f59e0b"
  ],
  [
    "ENVIRONMENT",
    "AMBIENTE · ATMÓSFERA · OCÉANO · CRIÓSFERA",
    "Cloud",
    "#38bdf8"
  ],
  [
    "ECOLOGY",
    "ECOLOGÍA & BIODIVERSIDAD",
    "TreePine",
    "#34d399"
  ],
  [
    "HUMAN_ACTIVITY",
    "ACTIVIDAD HUMANA & MARÍTIMA",
    "Ship",
    "#fb7185"
  ],
  [
    "GOVERNANCE_CONSERVATION",
    "CONSERVACIÓN & GOBERNANZA",
    "ShieldCheck",
    "#a78bfa"
  ],
  [
    "OBSERVATIONS_EVIDENCE",
    "OBSERVACIONES & EVIDENCIA",
    "Database",
    "#22d3ee"
  ],
  [
    "DERIVED_INTELLIGENCE",
    "DERIVADOS & INTELIGENCIA",
    "Sparkles",
    "#c084fc"
  ]
] as const;

const EXTRA_LAYERS: LeafLayerItem[] = [
  {
    id: 'khalifa_ml_exploratory_cpu',
    label: 'ML · Espesor sedimentario estimado (CPU)',
    domain: 'DERIVED_INTELLIGENCE',
    subdomain: 'marine_geophysics',
    description: 'Bosque entrenado contra Lindeque. Evaluación por bloques espaciales, con batimetría alineada y validación sísmica independiente pendientes.',
    provider: 'OLEA',
    dataset: 'Khalifa · corrida exploratoria en CPU',
    variable: 'predicted_m',
    enabled: false,
    opacity: 0.85,
    health: 'AMBER',
    healthLabel: 'ESTIMACIÓN EXPLORATORIA · CPU',
    hasDataInView: false,
    unit: 'm',
  },
  {
    id: 'lindeque_sediment_reference',
    label: 'Lindeque 2016 · Espesor sedimentario compilado (m)',
    domain: 'PHYSICAL_EARTH',
    subdomain: 'marine_geophysics',
    description: 'Compilación interpolada del margen pacífico de la Antártida Occidental. Muestreo del mapa cada 40 km sobre la rejilla original de 5 km. Referencia exploratoria con antecedentes gravimétricos. Validación con perfiles sísmicos independientes pendiente.',
    provider: 'Lindeque et al. / PANGAEA',
    dataset: 'sedthick_total_v2_5km_epsg3031.nc · doi:10.1594/PANGAEA.864906',
    variable: 'thickness_m',
    enabled: false,
    opacity: 0.86,
    health: 'AMBER',
    healthLabel: 'COMPILACIÓN INTERPOLADA',
    recordCount: 15451,
    hasDataInView: false,
    unit: 'm',
    license: 'CC-BY-3.0',
  },
  // National Geographic MapMaker — atlas mm.atlas
  ...NATGEO_MAPMAKER_TREE_ITEMS,
  // Radar de apertura sintética (NASA ASF · ESA · JAXA · CSA)
  ...OLEA_SAR_TREE_ITEMS,
  {
    "id": "antgg_gravity_anomaly",
    "label": "AntGG2021 — Anomalía de Gravedad",
    "subdomain": "seismicity_geophysics",
    "domain": "PHYSICAL_EARTH",
    "description": "Grid AntGG2021 de anomalía de gravedad; 5 km; EPSG:3031.",
    "provider": "IAG AntGG / PANGAEA",
    "dataset": "AntGG2021",
    "variable": "gravity_anomaly_mgal",
    "enabled": false,
    "opacity": 0.75,
    "health": "BLUE",
    "healthLabel": "OLEA RESEARCH V2",
    "recordCount": 0,
    "hasDataInView": false,
    "license": "CC-BY-4.0"
  },
  {
    "id": "antgg_bouguer_anomaly",
    "label": "AntGG2021 — Anomalía de Bouguer",
    "subdomain": "seismicity_geophysics",
    "domain": "PHYSICAL_EARTH",
    "description": "Contexto crustal/estructural de anomalía de Bouguer; uso exploratorio.",
    "provider": "IAG AntGG / PANGAEA",
    "dataset": "AntGG2021",
    "variable": "bouguer_anomaly_mgal",
    "enabled": false,
    "opacity": 0.75,
    "health": "BLUE",
    "healthLabel": "OLEA RESEARCH V2",
    "recordCount": 0,
    "hasDataInView": false,
    "license": "CC-BY-4.0"
  },
  {
    "id": "admap2b_magnetic_anomaly",
    "label": "ADMAP2B — Anomalía Magnética Observada",
    "subdomain": "seismicity_geophysics",
    "domain": "PHYSICAL_EARTH",
    "description": "Anomalía magnética near-surface; conserva vacíos de cobertura observacional.",
    "provider": "SCAR ADMAP / PANGAEA",
    "dataset": "ADMAP2B",
    "variable": "magnetic_anomaly_nt",
    "enabled": false,
    "opacity": 0.7,
    "health": "BLUE",
    "healthLabel": "OLEA RESEARCH V2",
    "recordCount": 0,
    "hasDataInView": false,
    "license": "CC-BY-4.0"
  },
  {
    "id": "admap2s_magnetic_anomaly",
    "label": "ADMAP2S — Anomalía Magnética + Gap-Fill",
    "subdomain": "seismicity_geophysics",
    "domain": "PHYSICAL_EARTH",
    "description": "ADMAP2S con relleno satelital; contexto, no sustituto de observación near-surface.",
    "provider": "SCAR ADMAP / PANGAEA",
    "dataset": "ADMAP2S",
    "variable": "magnetic_anomaly_nt",
    "enabled": false,
    "opacity": 0.55,
    "health": "BLUE",
    "healthLabel": "OLEA RESEARCH V2",
    "recordCount": 0,
    "hasDataInView": false,
    "license": "CC-BY-4.0"
  },
  {
    "id": "live_webcams",
    "label": "Cámaras Polares y Marítimas en Vivo",
    "subdomain": "live_cameras",
    "domain": "OBSERVATIONS_EVIDENCE",
    "description": "Contexto visual de operadores oficiales; no es un sensor científico calibrado.",
    "provider": "BAS / National Antarctic Programs",
    "dataset": "live_webcams",
    "variable": "live_visual_context",
    "enabled": false,
    "opacity": 1,
    "health": "GREEN",
    "healthLabel": "OLEA RESEARCH V2",
    "recordCount": 0,
    "hasDataInView": false,
    "license": "Source-specific"
  },
  {
    "id": "research_vessel_webcams",
    "label": "Webcams Oficiales de Buques de Investigación",
    "subdomain": "live_cameras",
    "domain": "OBSERVATIONS_EVIDENCE",
    "description": "Webcam vinculada a la entidad buque y a su geometría existente.",
    "provider": "BAS / National Antarctic Programs",
    "dataset": "research_vessel_webcam_bindings",
    "variable": "live_visual_context",
    "enabled": false,
    "opacity": 1,
    "health": "GREEN",
    "healthLabel": "OLEA RESEARCH V2",
    "recordCount": 0,
    "hasDataInView": false,
    "license": "Source-specific"
  },
  { id: 'olea_antarctic_hexacorals', label: 'Corales antárticos · Hexacorallia', subdomain: 'biodiversity_occurrences', domain: 'ECOLOGY', description: 'Presencia registrada en SCAR AntOBIS; no implica ausencia fuera de muestras.', provider: 'SCAR AntOBIS / OBIS', dataset: 'antarctic_hexacorals', variable: 'occurrence', enabled: false, opacity: 0.85, health: 'BLUE', healthLabel: 'OPEN SCIENCE V3', recordCount: 247, hasDataInView: false, license: 'CC-BY-4.0' },
  { id: 'olea_antarctic_stylasteridae', label: 'Corales antárticos · Stylasteridae', subdomain: 'biodiversity_occurrences', domain: 'ECOLOGY', description: 'Presencia registrada en SCAR AntOBIS; no implica ausencia fuera de muestras.', provider: 'SCAR AntOBIS / OBIS', dataset: 'antarctic_stylasteridae', variable: 'occurrence', enabled: false, opacity: 0.85, health: 'BLUE', healthLabel: 'OPEN SCIENCE V3', recordCount: 1035, hasDataInView: false, license: 'CC-BY-4.0' },

  { id: 'olea_wap_2024_microphytoplankton', label: 'Microfitoplancton WAP · estaciones 2024', subdomain: 'field_observations', domain: 'OBSERVATIONS_EVIDENCE', description: 'Datos medidos 2023-2024. Cinco estaciones sin densidad NO son cero.', provider: 'INVEMAR/Autores y Excel adjunto', dataset: 'wap_microphytoplankton_2024', variable: 'cells_per_liter', enabled: false, opacity: 0.85, health: 'BLUE', healthLabel: 'OPEN SCIENCE V3.1', recordCount: 31, hasDataInView: false, license: 'CC-BY-4.0' },

  { id: 'olea_obis_icefree_antarctica', label: 'Biodiversidad terrestre · zonas libres de hielo', subdomain: 'terrestrial_icefree', domain: 'ECOLOGY', description: 'Registros terrestres agregados en celdas de 0,25 grados. No son abundancia marina.', provider: 'ANTABIF / OBIS', dataset: 'obis_icefree_antarctica_source', variable: 'record_count', enabled: false, opacity: 0.85, health: 'BLUE', healthLabel: 'OPEN SCIENCE V3.1', recordCount: 965, hasDataInView: false, license: 'CC-BY-4.0' },

  { id: 'pangaea_datasets', label: 'PANGAEA · catalogo de datasets (region OLEA)', subdomain: 'data_catalogs', domain: 'OBSERVATIONS_EVIDENCE', description: 'Indice de 62.356 datasets publicados. El punto es el centroide del dataset, no una estacion: 19.930 son cajas de extension. Presencia de registro, no de medicion en ese punto.', provider: 'PANGAEA (AWI/MARUM)', dataset: 'pangaea_datasets', variable: 'dataset_index', enabled: false, opacity: 0.72, health: 'BLUE', healthLabel: 'PANGAEA HARVEST 2026-11-03', recordCount: 62356, hasDataInView: false, license: 'Metadatos PANGAEA; citar el DOI de cada dataset' },

  { id: 'pangaea_global_density', label: 'PANGAEA · densidad global del archivo', subdomain: 'data_catalogs', domain: 'OBSERVATIONS_EVIDENCE', description: 'Agregado geohash-3 de los 440.044 datasets georreferenciados del mundo. Centroide de celda ~156 km: lee cobertura y sesgo de muestreo, no posiciones.', provider: 'PANGAEA (AWI/MARUM)', dataset: 'pangaea_global_density', variable: 'dataset_count', enabled: false, opacity: 0.6, health: 'BLUE', healthLabel: 'PANGAEA HARVEST 2026-11-03', recordCount: 21406, hasDataInView: false, license: 'Metadatos PANGAEA' },

  { id: 'copernicus_sst_peninsula', label: 'CMEMS · temperatura superficial (Península)', subdomain: 'ocean_circulation', domain: 'ENVIRONMENT', description: 'Analisis de modelo a 1/12 grados, nivel 0,49 m, recorte 70-55 O / 68-54 S. 6.720 puntos del 2026-11-03, rango -1,84 a 12,45 C. Es modelo, no medicion.', provider: 'Copernicus Marine Service (Mercator Ocean)', dataset: 'cmems_mod_glo_phy-thetao_anfc_0.083deg_P1D-m', variable: 'thetao', enabled: false, opacity: 0.78, health: 'BLUE', healthLabel: 'CMEMS SUBSET 2026-11-03', recordCount: 6720, hasDataInView: false, unit: '°C', license: 'Copernicus Marine — acceso abierto, citar la fuente' },

  { id: 'copernicus_sss_peninsula', label: 'CMEMS · salinidad superficial (Península)', subdomain: 'ocean_circulation', domain: 'ENVIRONMENT', description: 'Mismo subset que la capa de temperatura. 6.720 puntos del 2026-11-03, rango 30,46 a 34,44 (unidades 1e-3). El gradiente marca la pluma de deshielo costera.', provider: 'Copernicus Marine Service (Mercator Ocean)', dataset: 'cmems_mod_glo_phy-so_anfc_0.083deg_P1D-m', variable: 'so', enabled: false, opacity: 0.78, health: 'BLUE', healthLabel: 'CMEMS SUBSET 2026-11-03', recordCount: 6720, hasDataInView: false, unit: '1e-3', license: 'Copernicus Marine — acceso abierto, citar la fuente' },

  { id: 'copernicus_currents_peninsula', label: 'CMEMS · corrientes superficiales (Península)', subdomain: 'ocean_circulation', domain: 'ENVIRONMENT', description: '1.719 vectores del 2026-11-03, rapidez 0,004 a 1,505 m/s. Color y tamano = rapidez; el rumbo esta en el popup, no en el simbolo.', provider: 'Copernicus Marine Service (Mercator Ocean)', dataset: 'cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m', variable: 'uo,vo', enabled: false, opacity: 0.8, health: 'BLUE', healthLabel: 'CMEMS SUBSET 2026-11-03', recordCount: 1719, hasDataInView: false, unit: 'm/s', license: 'Copernicus Marine — acceso abierto, citar la fuente' },

  { id: 'copernicus_sea_ice_edge', label: 'OSI SAF · borde del hielo marino (Península)', subdomain: 'cryosphere', domain: 'ENVIRONMENT', description: 'Contornos de concentracion al 15 % (borde estandar) y 80 % (hielo compacto) del 2026-11-02, rejilla AMSR2. Son contornos de un campo continuo, no un limite observado.', provider: 'EUMETSAT OSI SAF via Copernicus Marine', dataset: 'osisaf_obs-si_glo_phy-sic-south_nrt_amsr2_l4_P1D-m', variable: 'ice_conc', enabled: false, opacity: 0.9, health: 'BLUE', healthLabel: 'OSI SAF 2026-11-02', recordCount: 2, hasDataInView: false, unit: '%', license: 'Copernicus Marine — acceso abierto, citar la fuente' },

  // Batimetria antartica (2026-11-13): teselas de scripts/bathymetry_tiles.py y nomenclator GEBCO.
  { id: 'ibcso_v2_relief', label: 'Batimetría · IBCSO v2 relieve del lecho (500 m)', subdomain: 'bathymetry_seafloor', domain: 'PHYSICAL_EARTH', description: 'Relieve sombreado del fondo marino y de la roca bajo el hielo, sur de 50° S. Azules = bajo el nivel del mar, pardos = sobre él. Bajo el hielo muestra el lecho, no la superficie. Solo el 23,79 % del fondo está medido: ver la capa «dónde está medido».', provider: 'AWI / SCAR IBCSO', dataset: 'IBCSO v2 bed (doi:10.1594/PANGAEA.937574)', variable: 'elevation', enabled: false, opacity: 0.92, health: 'BLUE', healthLabel: 'IBCSO v2 · TESELAS z0–7', recordCount: 1, hasDataInView: false, unit: 'm', license: 'IBCSO v2: CC-BY-4.0, citar Dorschel et al. 2022' },

  { id: 'ibcso_v2_tid', label: 'Batimetría · IBCSO v2 dónde está medido (TID)', subdomain: 'bathymetry_seafloor', domain: 'PHYSICAL_EARTH', description: 'Origen de la profundidad en cada celda: amarillo multihaz, naranja monohaz, rojo sísmica, crema métodos directos combinados (radar bajo el hielo), violeta gravimetría, azul tenue interpolado. A ~1 km una celda cuenta como medida si contiene alguna medición.', provider: 'AWI / SCAR IBCSO', dataset: 'IBCSO v2 TID (doi:10.1594/PANGAEA.937574)', variable: 'data_type_identifier', enabled: false, opacity: 0.9, health: 'BLUE', healthLabel: 'IBCSO v2 · TESELAS z0–6', recordCount: 1, hasDataInView: false, unit: 'código TID', license: 'IBCSO v2: CC-BY-4.0, citar Dorschel et al. 2022' },

  { id: 'gebco_2025_relief', label: 'Batimetría · GEBCO 2025 relieve 40–50° S', subdomain: 'bathymetry_seafloor', domain: 'PHYSICAL_EARTH', description: 'Franja 40–50° S del recorte de GEBCO 2025 de Quantarctica 4, con la misma rampa y sombreado que IBCSO para que empalmen. Al sur de 50° S este recorte no trae datos: ahí manda IBCSO.', provider: 'GEBCO Compilation Group vía Quantarctica 4 (NPI)', dataset: 'GEBCO 2025 Grid', variable: 'elevation', enabled: false, opacity: 0.92, health: 'BLUE', healthLabel: 'GEBCO 2025 · TESELAS z0–6', recordCount: 1, hasDataInView: false, unit: 'm', license: 'GEBCO: dominio público, citar GEBCO Compilation Group (2025)' },

  { id: 'gsfm_seafloor_geomorphology', label: 'Batimetría · geomorfología del fondo (Harris GSFM)', subdomain: 'bathymetry_seafloor', domain: 'PHYSICAL_EARTH', description: '21 clases: plataforma, talud, zona abisal y hadal de fondo; encima cañones (magenta), montes submarinos (ámbar), dorsales de expansión (rojo), artesas glaciares (celeste), abanicos, mesetas, escarpes. Clasificación automática de 2014 sobre batimetría global, no un levantamiento.', provider: 'Harris et al. 2014 vía Quantarctica 4 (NPI)', dataset: 'Global Seafloor Geomorphic Features Map', variable: 'geomorphic_class', enabled: false, opacity: 0.75, health: 'BLUE', healthLabel: 'GSFM 2014 · TESELAS z0–6', recordCount: 21, hasDataInView: false, unit: 'clase', license: 'Harris et al. 2014 — CC-BY, citar Marine Geology 352' },

  { id: 'gebco_undersea_features', label: 'Batimetría · nombres de accidentes submarinos (GEBCO)', subdomain: 'bathymetry_seafloor', domain: 'PHYSICAL_EARTH', description: '491 accidentes con nombre aprobado por SCUFN al sur de 45° S: montes, cañones, bancos, zonas de fractura, cuencas. Clic para ver tipo, profundidades, quién lo descubrió y la historia del nombre, cuando el registro los trae.', provider: 'IHO-IOC GEBCO (API NOAA/NCEI)', dataset: 'GEBCO Gazetteer of Undersea Feature Names', variable: 'feature_name', enabled: false, opacity: 0.95, health: 'BLUE', healthLabel: 'GEBCO GAZETTEER 2026-11-13', recordCount: 491, hasDataInView: false, unit: '', license: 'GEBCO Gazetteer — uso libre citando la fuente' },

  { id: 'gebco_undersea_feature_outlines', label: 'Batimetría · trazas de accidentes submarinos (GEBCO)', subdomain: 'bathymetry_seafloor', domain: 'PHYSICAL_EARTH', description: 'Ejes y contornos de 291 de los 491 accidentes con nombre (los demás solo tienen punto en el nomenclátor).', provider: 'IHO-IOC GEBCO (API NOAA/NCEI)', dataset: 'GEBCO Gazetteer of Undersea Feature Names', variable: 'secondary_geometry', enabled: false, opacity: 0.85, health: 'BLUE', healthLabel: 'GEBCO GAZETTEER 2026-11-13', recordCount: 291, hasDataInView: false, unit: '', license: 'GEBCO Gazetteer — uso libre citando la fuente' },

  { id: 'bedmap3_ice_thickness', label: 'Bedmap3 · espesor del hielo (500 m)', subdomain: 'cryosphere', domain: 'ENVIRONMENT', description: 'Espesor del hielo antártico, de casi blanco (plataformas, hielo fino) a azul violáceo (más de 3.500 m). Transparente donde no hay hielo.', provider: 'BAS / SCAR Bedmap3 vía Quantarctica 4 (NPI)', dataset: 'Bedmap3 (doi:10.5285/2d0e4791-8e20-46a3-80e4-f5f6716025d2)', variable: 'ice_thickness', enabled: false, opacity: 0.85, health: 'BLUE', healthLabel: 'BEDMAP3 · TESELAS z0–6', recordCount: 1, hasDataInView: false, unit: 'm', license: 'Bedmap3: CC-BY-4.0, citar Pritchard et al. 2025' },
] as LeafLayerItem[];

function fallbackMeta(layer: LeafLayerItem): CanonicalLayerMeta {
  const d = String(layer.domain || '').toUpperCase();
  if (d === 'LIFE') return { domain: 'ECOLOGY', group: 'biodiversity_occurrences', role: 'ECOLOGICAL_EVIDENCE' };
  if (d === 'GOVERNANCE') return { domain: 'GOVERNANCE_CONSERVATION', group: 'treaties_management', role: 'MANAGEMENT_CONTEXT' };
  if (d === 'FIELD') return { domain: 'OBSERVATIONS_EVIDENCE', group: 'field_observations', role: 'FIELD_EVIDENCE' };
  if (d === 'SENSORS') return { domain: 'OBSERVATIONS_EVIDENCE', group: 'in_situ_sensors', role: 'IN_SITU_OBSERVATION' };
  if (d === 'SPACE_GEOPHYSICS') return { domain: 'OBSERVATIONS_EVIDENCE', group: 'remote_observation', role: 'REMOTE_OBSERVATION' };
  if (d === 'ACTIVITY' || d === 'INFRASTRUCTURE') return { domain: 'HUMAN_ACTIVITY', group: 'maritime_vessels', role: 'HUMAN_ACTIVITY_EVIDENCE' };
  if (d === 'ENVIRONMENT' || d === 'OCEAN' || d === 'ICE' || d === 'POLLUTION') return { domain: 'ENVIRONMENT', group: 'ocean_circulation', role: 'ENVIRONMENT_STATE' };
  return { domain: 'DERIVED_INTELLIGENCE', group: 'experimental_legacy', role: 'NEEDS_REVIEW' };
}

export function getCanonicalLayerMeta(layerId: string | null | undefined): CanonicalLayerMeta | null {
  if (!layerId) return null;
  return CANONICAL_LAYER_META[layerId] || null;
}

function buildCanonicalTree(): DomainCategory[] {
  const unique = new Map<string, LeafLayerItem>();

  for (const domain of HIERARCHICAL_LAYER_TREE) {
    for (const subdomain of domain.subdomains) {
      for (const layer of subdomain.layers) {
        if (!unique.has(layer.id)) unique.set(layer.id, layer);
      }
    }
  }

  for (const layer of EXTRA_LAYERS) {
    if (!unique.has(layer.id)) unique.set(layer.id, layer);
  }

  const result: DomainCategory[] = [];

  for (const [domainId, label, icon, color] of DOMAIN_SPECS) {
    const groups = new Map<string, LeafLayerItem[]>();

    for (const layer of unique.values()) {
      const meta = CANONICAL_LAYER_META[layer.id] || fallbackMeta(layer);
      if (meta.domain !== domainId) continue;

      CANONICAL_LAYER_META[layer.id] = meta;
      const cloned: LeafLayerItem = { ...layer, domain: domainId, subdomain: meta.group };
      const bucket = groups.get(meta.group) || [];
      bucket.push(cloned);
      groups.set(meta.group, bucket);
    }

    const subdomains = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, layers]) => ({
        id,
        label: id === 'marine_geophysics' ? 'GEOFÍSICA MARINA · OLEA × KHALIFA' : id.replace(/_/g, ' ').toUpperCase(),
        layers: layers.sort((a, b) => a.label.localeCompare(b.label)),
      }));

    if (subdomains.length) result.push({ id: domainId, label, icon, color, subdomains });
  }

  return result;
}

Object.assign(CANONICAL_LAYER_META, NATGEO_MAPMAKER_META);
Object.assign(CANONICAL_LAYER_META, OLEA_SAR_META);

export const CANONICAL_LAYER_TREE: DomainCategory[] = buildCanonicalTree();
