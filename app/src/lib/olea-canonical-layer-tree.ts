// OLEA_RESEARCH_V2 — generated canonical layer tree. Do not hand-edit.
import {
  HIERARCHICAL_LAYER_TREE,
  type DomainCategory,
  type LeafLayerItem,
} from './hierarchical-layers';

export interface CanonicalLayerMeta {
  domain: string;
  group: string;
  role: string;
}

export const CANONICAL_LAYER_META: Record<string, CanonicalLayerMeta> =
{
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
  "ocean_currents": {
    "domain": "ENVIRONMENT",
    "group": "ocean_circulation",
    "role": "ENVIRONMENT_STATE"
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
    "group": "seismicity_geophysics",
    "role": "PHYSICAL_PREDICTOR"
  },
  "antgg_bouguer_anomaly": {
    "domain": "PHYSICAL_EARTH",
    "group": "seismicity_geophysics",
    "role": "CONDITIONAL_CONTEXT"
  },
  "admap2b_magnetic_anomaly": {
    "domain": "PHYSICAL_EARTH",
    "group": "seismicity_geophysics",
    "role": "PHYSICAL_PREDICTOR"
  },
  "admap2s_magnetic_anomaly": {
    "domain": "PHYSICAL_EARTH",
    "group": "seismicity_geophysics",
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
        label: id.replace(/_/g, ' ').toUpperCase(),
        layers: layers.sort((a, b) => a.label.localeCompare(b.label)),
      }));

    if (subdomains.length) result.push({ id: domainId, label, icon, color, subdomains });
  }

  return result;
}

export const CANONICAL_LAYER_TREE: DomainCategory[] = buildCanonicalTree();
