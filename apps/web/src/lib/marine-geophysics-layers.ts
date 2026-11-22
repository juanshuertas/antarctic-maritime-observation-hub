export const MARINE_GEOPHYSICS_LAYERS = [
  { id: 'lindeque_sediment_reference', label: 'Lindeque · Espesor (m)' },
  { id: 'antgg_gravity_anomaly', label: 'AntGG · Gravedad (mGal)' },
  { id: 'antgg_bouguer_anomaly', label: 'AntGG · Bouguer (mGal)' },
  { id: 'admap2b_magnetic_anomaly', label: 'ADMAP‑2B · Magnetismo (nT)' },
  { id: 'admap2s_magnetic_anomaly', label: 'ADMAP‑2S · Magnetismo con relleno satelital' },
  { id: 'ibcso_v2_relief', label: 'IBCSO · Relieve del fondo' },
  { id: 'ibcso_v2_tid', label: 'IBCSO · Origen de la batimetría' },
  { id: 'seismic_heatmap', label: 'USGS · Concentración de sismos' },
  { id: 'khalifa_ml_exploratory_cpu', label: 'ML · Espesor estimado (CPU)' },
] as const;
