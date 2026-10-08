// OLEA_RESEARCH_V2 — additive registry overlay for canonical research layers.
import type { LayerDefinition } from './layer-registry';

export const OLEA_RESEARCH_LAYER_REGISTRY: Record<string, LayerDefinition> = {
  maris_radionuclides: {
    id: 'maris_radionuclides',
    name: 'IAEA MARIS — Mediciones Radiológicas Marinas',
    category: 'AMBIENTE · TRAZADORES',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/maris_antarctic_measurements.geojson',
      attribution: 'IAEA MARIS · OLEA normalized Antarctic extract',
    },
    paint: {
      'circle-radius': 4,
      'circle-color': '#f59e0b',
      'circle-opacity': 0.72,
      'circle-stroke-width': 0.8,
      'circle-stroke-color': '#fff7ed',
    },
  },

  antgg_gravity_anomaly: {
    id: 'antgg_gravity_anomaly',
    name: 'AntGG2021 — Anomalía de Gravedad',
    category: 'TIERRA FÍSICA & GEOFÍSICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/antgg_gravity_anomaly.geojson',
      attribution: 'IAG AntGG / PANGAEA · CC-BY-4.0',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.7, 5, 4.3, 8, 6.2],
      'circle-color': ["interpolate", ["linear"], ["get", "gravity_anomaly_mgal"], -68.469061, "#25377f", -22.700624, "#58a9d4", -7.717007, "#f7f7f7", 9.820899, "#e89a7e", 70.338241, "#9d2137"],
      'circle-opacity': 0.90,
      'circle-stroke-width': 0.25,
      'circle-stroke-color': '#ebf4fb',
    },
  },

  antgg_bouguer_anomaly: {
    id: 'antgg_bouguer_anomaly',
    name: 'AntGG2021 — Anomalía de Bouguer',
    category: 'TIERRA FÍSICA & GEOFÍSICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/antgg_bouguer_anomaly.geojson',
      attribution: 'IAG AntGG / PANGAEA · CC-BY-4.0',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.7, 5, 4.3, 8, 6.2],
      'circle-color': ["interpolate", ["linear"], ["get", "bouguer_anomaly_mgal"], -457.337312, "#25377f", -317.85464, "#58a9d4", -117.675659, "#f7f7f7", 19.159877, "#e89a7e", 167.177949, "#9d2137"],
      'circle-opacity': 0.90,
      'circle-stroke-width': 0.25,
      'circle-stroke-color': '#ebf4fb',
    },
  },

  admap2b_magnetic_anomaly: {
    id: 'admap2b_magnetic_anomaly',
    name: 'ADMAP2B — Anomalía Magnética Observada',
    category: 'TIERRA FÍSICA & GEOFÍSICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/admap2b_magnetic_anomaly.geojson',
      attribution: 'SCAR ADMAP / PANGAEA · CC-BY-4.0',
    },
    paint: {
      'circle-radius': 2,
      'circle-color': ['interpolate', ['linear'], ['get', 'magnetic_anomaly_nt'], -500, '#172554', 0, '#f8fafc', 500, '#7f1d1d'],
      'circle-opacity': 0.65,
    },
  },

  admap2s_magnetic_anomaly: {
    id: 'admap2s_magnetic_anomaly',
    name: 'ADMAP2S — Anomalía Magnética + Gap-Fill',
    category: 'TIERRA FÍSICA & GEOFÍSICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/admap2s_magnetic_anomaly.geojson',
      attribution: 'SCAR ADMAP / PANGAEA · CC-BY-4.0',
    },
    paint: {
      'circle-radius': 1.8,
      'circle-color': ['interpolate', ['linear'], ['get', 'magnetic_anomaly_nt'], -500, '#1e1b4b', 0, '#e0f2fe', 500, '#9f1239'],
      'circle-opacity': 0.48,
    },
  },

  live_webcams: {
    id: 'live_webcams',
    name: 'Cámaras Polares y Marítimas en Vivo',
    category: 'OBSERVACIONES & EVIDENCIA',
    sdg: 9,
    sdgColor: '#FD6925',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/live_webcams.geojson',
      attribution: 'Official operators / BAS · Cruising Earth is discovery only',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#10b981',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },

  research_vessel_webcams: {
    id: 'research_vessel_webcams',
    name: 'Webcams Oficiales de Buques de Investigación',
    category: 'OBSERVACIONES & EVIDENCIA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/research_vessel_webcams.geojson',
      attribution: 'British Antarctic Survey / official vessel operators',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#22d3ee',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ecfeff',
    },
  },
  olea_antarctic_hexacorals: {
    id: 'olea_antarctic_hexacorals',
    name: 'Corales antárticos · Hexacorallia',
    category: 'ECOLOGÍA & BIODIVERSIDAD',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: { type: 'geojson', url: '/data/web/geojson/antarctic_hexacorals.geojson', attribution: 'SCAR AntOBIS / OBIS (CC-BY-4.0)' },
    paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3, 7, 6], 'circle-color': '#e8a9dc', 'circle-opacity': 0.85, 'circle-stroke-width': 0.7, 'circle-stroke-color': '#6b255f' },
  },

  olea_antarctic_stylasteridae: {
    id: 'olea_antarctic_stylasteridae',
    name: 'Corales antárticos · Stylasteridae',
    category: 'ECOLOGÍA & BIODIVERSIDAD',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: { type: 'geojson', url: '/data/web/geojson/antarctic_stylasteridae.geojson', attribution: 'SCAR AntOBIS / OBIS (CC-BY-4.0)' },
    paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3, 7, 6], 'circle-color': '#e8a9dc', 'circle-opacity': 0.85, 'circle-stroke-width': 0.7, 'circle-stroke-color': '#6b255f' },
  },

  olea_wap_2024_microphytoplankton: {
    id: 'olea_wap_2024_microphytoplankton',
    name: 'Microfitoplancton · estaciones 2024',
    category: 'OBSERVACIONES & EVIDENCIA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: { type: 'geojson', url: '/data/web/geojson/wap_2024_stations_verified_v3_1.geojson', attribution: 'Calderon-Valderrama et al. 2026 / study DOI 1419' },
    paint: { 'circle-radius': ['interpolate',['linear'],['zoom'],2,3.5,7,7.5], 'circle-color': ['case', ['==', ['get', 'science_role'], 'PILOT_A_GROUND_TRUTH_CANDIDATE'], ['interpolate',['linear'],['get','total_microphytoplankton_density_cells_l'], 0, '#dbeafe', 170, '#38bdf8', 620, '#c026d3'], '#94a3b8'], 'circle-opacity': 0.88, 'circle-stroke-width': 0.6, 'circle-stroke-color': '#eef2ff' },
  },

  olea_obis_icefree_antarctica: {
    id: 'olea_obis_icefree_antarctica',
    name: 'Biodiversidad terrestre · Antártida sin hielo',
    category: 'ECOLOGÍA & BIODIVERSIDAD',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: { type: 'geojson', url: '/data/web/geojson/obis_icefree_antarctica_grid.geojson', attribution: 'ANTABIF / Terauds 2025 CC-BY-4.0' },
    paint: { 'circle-radius': ['interpolate',['linear'],['get','records'],1,2.5,10,5.5,100,11], 'circle-color': '#a3e635', 'circle-opacity': 0.88, 'circle-stroke-width': 0.6, 'circle-stroke-color': '#eef2ff' },
  },

};
