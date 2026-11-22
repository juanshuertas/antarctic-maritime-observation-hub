/**
 * AMOH — OSIRIS 14 Core Layers Adapter & Registry.
 *
 * Provides a unified catalog of the 14 foundational layers across:
 * - Polar Cartography (Quantarctica Coastline, Ice Shelves, Stations, ASPA)
 * - Maritime Intelligence (AIS Vessels, Tracks & Chokepoints)
 * - Field Science & Ground Truth (AMOH Observations)
 * - Earth Observation (Satellites & Google Earth Engine analyses)
 * - Agent-based Simulation (MiroFish Density Heatmaps & Trajectories)
 * - Operational Surveillance (Station Cam Wall Feeds & Infrastructure)
 * - Strategic Registry (SURIE ArcGIS WebMap de8bb6821bf148649f1e7b9154592a97)
 */

export interface OsirisLayerDef {
  id: string;
  category: 'cartography' | 'maritime' | 'science' | 'satellite' | 'simulation' | 'surveillance' | 'registry';
  label: string;
  fullLabel: string;
  description: string;
  color: string;
  defaultEnabled: boolean;
  endpoint?: string;
  dataKey?: string;
  isSimulation?: boolean;
  provenance: string;
}

export const OSIRIS_14_CORE_LAYERS: OsirisLayerDef[] = [
  // 1. Polar Cartography - Coastline
  {
    id: 'quantarctica_coast',
    category: 'cartography',
    label: 'Coastline',
    fullLabel: 'SCAR / ADD Antarctic Coastline',
    description: 'High-resolution Antarctic coastline & ice-front boundaries (WGS84 / EPSG:3031)',
    color: '#CAF9F7',
    defaultEnabled: true,
    endpoint: '/api/quantarctica/layers/coastline',
    provenance: 'SCAR Antarctic Digital Database / Norwegian Polar Institute',
  },
  // 2. Polar Cartography - Ice Shelves
  {
    id: 'quantarctica_ice',
    category: 'cartography',
    label: 'Ice Shelves',
    fullLabel: 'Antarctic Ice Shelves & Glacial Margins',
    description: 'Floating ice shelves (Larsen C, Ronne-Filchner, Ross) and active grounding lines',
    color: '#84D8FF',
    defaultEnabled: true,
    endpoint: '/api/quantarctica/layers/ice_shelves',
    provenance: 'Quantarctica 3 Basemap / NSIDC',
  },
  // 3. Polar Cartography - Research Stations
  {
    id: 'quantarctica_stations',
    category: 'cartography',
    label: 'Research Stations',
    fullLabel: 'Antarctic Scientific Bases & Outposts',
    description: 'Permanent and summer polar stations (King George Island, McMurdo, Esperanza, O\'Higgins)',
    color: '#FFFFFF',
    defaultEnabled: true,
    endpoint: '/api/quantarctica/layers/stations',
    provenance: 'COMNAP (Council of Managers of National Antarctic Programs)',
  },
  // 4. Polar Conservation - ASPA / ASMA
  {
    id: 'aspa',
    category: 'cartography',
    label: 'Protected Areas (ASPA)',
    fullLabel: 'Antarctic Specially Protected Areas',
    description: 'Legally protected ecological, historical and scientific zones under the Antarctic Treaty',
    color: '#55D48B',
    defaultEnabled: true,
    endpoint: '/api/quantarctica/layers/aspa',
    provenance: 'Antarctic Treaty Secretariat / CEP',
  },
  // 5. Maritime - AIS Vessels
  {
    id: 'maritime_vessels',
    category: 'maritime',
    label: 'AIS Vessels',
    fullLabel: 'Real-time & Cached AIS Maritime Traffic',
    description: 'Expedition vessels, icebreakers, scientific research ships and cruise liners',
    color: '#35C3C8',
    defaultEnabled: true,
    endpoint: '/api/overview',
    provenance: 'AMOH Edge AIS Receiver / Spire Maritime / OSIRIS Feed',
  },
  // 6. Maritime - Vessel Tracks & Corridors
  {
    id: 'maritime_corridors',
    category: 'maritime',
    label: 'Shipping Corridors',
    fullLabel: 'Drake Passage & Gerlache Navigational Tracks',
    description: 'Aggregated navigation routes and strait chokepoints in the Antarctic Peninsula',
    color: '#00A3C4',
    defaultEnabled: false,
    endpoint: '/api/overview',
    provenance: 'AMOH Maritime Corridor Model',
  },
  // 7. Science - Field Observations
  {
    id: 'field_observations',
    category: 'science',
    label: 'Field Evidence',
    fullLabel: 'Ground-Truth Scientific Observations',
    description: 'In-situ records: cetacean sightings, sea ice observations, microplastics, CTD casts',
    color: '#FF6B00',
    defaultEnabled: true,
    endpoint: '/api/observations',
    provenance: 'AMOH Field Connect & Scientific Expeditions',
  },
  // 8. Earth Observation - Polar Satellites
  {
    id: 'satellites_earth',
    category: 'satellite',
    label: 'Earth Observation',
    fullLabel: 'Polar Orbiting Satellites (Sentinel / Landsat)',
    description: 'Sub-orbital tracks and ground footprints for Sentinel-1/2, Aqua/Terra MODIS, and CryoSat',
    color: '#58D5E3',
    defaultEnabled: false,
    endpoint: '/api/earth-engine/status',
    provenance: 'ESA Copernicus / NASA Earthdata',
  },
  // 9. Earth Observation - GEE Remote Sensing
  {
    id: 'gee_analysis',
    category: 'satellite',
    label: 'GEE Analysis',
    fullLabel: 'Google Earth Engine Spectral Overlays',
    description: 'Cloud-masked NDSI (Normalized Difference Snow/Ice Index) and radar backscatter',
    color: '#00E5FF',
    defaultEnabled: false,
    endpoint: '/api/earth-engine/analyses',
    provenance: 'Google Earth Engine / AMOH Remote Sensing Engine',
  },
  // 10. Agent Simulation - MiroFish Heatmap
  {
    id: 'mirofish_heatmap',
    category: 'simulation',
    label: 'Traffic Density [SIM]',
    fullLabel: 'MiroFish Agent-Based Vessel Density Heatmap',
    description: 'Synthetic scenario forecast of tourism and logistical vessel concentrations',
    color: '#A995FF',
    defaultEnabled: true,
    endpoint: '/api/mirofish/heatmap',
    isSimulation: true,
    provenance: 'MiroFish Multi-Agent Simulation Engine (Rule 14/16: Synthetically Generated)',
  },
  // 11. Agent Simulation - MiroFish Trajectories
  {
    id: 'mirofish_trajectories',
    category: 'simulation',
    label: 'Routing Vectors [SIM]',
    fullLabel: 'MiroFish Predictive Vessel Vectors',
    description: 'Agent decision paths, waypoint routing simulations, and acoustic footprint corridors',
    color: '#E085FF',
    defaultEnabled: true,
    endpoint: '/api/mirofish/trajectories',
    isSimulation: true,
    provenance: 'MiroFish Behavior Model (Rule 14/16: Synthetically Generated)',
  },
  // 12. Surveillance & Hazard - Station Webcams
  {
    id: 'cctv_cams',
    category: 'surveillance',
    label: 'Station Cameras',
    fullLabel: 'Antarctic Base Webcams & Optical Nodes',
    description: 'Live and periodic optical feeds from King George Island, Rothera, O\'Higgins, Palmer',
    color: '#FDE047',
    defaultEnabled: false,
    endpoint: '/api/cameras',
    provenance: 'National Antarctic Programs / Polar Cam Network',
  },
  // 13. Infrastructure - Logistics & Mooring Nodes
  {
    id: 'infrastructure_nodes',
    category: 'surveillance',
    label: 'Infrastructure',
    fullLabel: 'Polar Facilities, Airstrips & Moorings',
    description: 'Maritime anchorages, runway locations, meteorological buoys and hydrophone arrays',
    color: '#94A3B8',
    defaultEnabled: false,
    endpoint: '/api/intelligence/jurisdictions',
    provenance: 'Antarctic Treaty Electronic Information Exchange System (EIES)',
  },
  // 14. Live Operations - Polar Aircraft
  {
    id: 'polar_aircraft',
    category: 'surveillance',
    label: 'Aviones en Vivo',
    fullLabel: 'Vuelos y Logística Polar ADS-B',
    description: 'Aeronaves en vuelo sobre la Antártida y Paso Drake: LC-130 Hercules, Twin Otter, Dash-7, C-130H, Il-76',
    color: '#38BDF8',
    defaultEnabled: true,
    provenance: 'OSIRIS ADS-B Telemetry / Polar Air Bridge Network',
  },
  // 15. Earth Observation - Polar Satellites
  {
    id: 'polar_satellites',
    category: 'satellite',
    label: 'Satélites en Órbita',
    fullLabel: 'Constelación Satelital Polar (Sentinel / CryoSat / ICESat)',
    description: 'Órbitas polares activas, trazas terrestres y huellas de barrido radar SAR y óptico sobre el casquete polar',
    color: '#00E5FF',
    defaultEnabled: true,
    provenance: 'ESA Copernicus / NASA Earthdata / SGP4 Orbital Propagator',
  },
  // 16. Marine Infrastructure - Submarine Cables
  {
    id: 'submarine_cables',
    category: 'maritime',
    label: 'Cables Submarinos',
    fullLabel: 'Red Global de Fibra Submarina y Enlace Antártico',
    description: 'Cables de fibra óptica submarina transoceánicos, Fibra Óptica Austral (Puerto Williams 54°S) y proyecto Paso Drake',
    color: '#8DE8CD',
    defaultEnabled: true,
    provenance: 'Telegeography Submarine Cable Data / SCAR Subsea Fiber Working Group',
  },
  // 17. Fisheries Intelligence - GFW / CCAMLR
  {
    id: 'fisheries_effort',
    category: 'maritime',
    label: 'Pesquerías (GFW)',
    fullLabel: 'Esfuerzo Pesquero Aparente Global Fishing Watch & CCAMLR',
    description: 'Actividad de buques pesqueros de krill y bacalao antártico, zonas CCAMLR y cotejo radar SAR',
    color: '#FF8A4C',
    defaultEnabled: true,
    provenance: 'Global Fishing Watch (GFW API v3) / CCAMLR',
  },
  // 18. Marine Biodiversity - OBIS Antarctic Fauna
  {
    id: 'antarctic_fauna',
    category: 'science',
    label: 'Fauna Polar (OBIS)',
    fullLabel: 'Biodiversidad Marina Antártica (OBIS / SCAR)',
    description: 'Avistamientos científicos verificados de cetáceos, pingüinos emperador/adelia, krill y focas leopardo',
    color: '#72E0B5',
    defaultEnabled: true,
    provenance: 'Ocean Biodiversity Information System (OBIS) / SCAR MarBIN',
  },
  // 19. Antarctic Tourism - IAATO Routes
  {
    id: 'iaato_routes',
    category: 'maritime',
    label: 'Rutas IAATO',
    fullLabel: 'Expediciones y Rutas Turísticas Antárticas IAATO',
    description: 'Trayectorias y recaladas de buques de expedición polar turística regulados por IAATO',
    color: '#E085FF',
    defaultEnabled: true,
    provenance: 'International Association of Antarctica Tour Operators (IAATO)',
  },
  // 20. Radiochemistry Baseline - IAEA MARIS
  {
    id: 'maris_nuclear',
    category: 'science',
    label: 'Radioactividad (MARIS)',
    fullLabel: 'Línea Base Radiológica Marina IAEA MARIS',
    description: 'Estaciones de muestreo radiológico del OIEA en el Océano Austral (Cs-137, H-3, Pu-239/240)',
    color: '#FF5E8A',
    defaultEnabled: false,
    provenance: 'Organismo Internacional de Energía Atómica (IAEA MARIS)',
  },
  // 21. Hydrographic Profilers - Argo Floats
  {
    id: 'argo_floats',
    category: 'science',
    label: 'Perfiladores Argo',
    fullLabel: 'Flotadores Oceanográficos Argo (0–2000m)',
    description: 'Boyas perfiladoras de temperatura y salinidad en la columna de agua del Frente Polar',
    color: '#38BDF8',
    defaultEnabled: true,
    provenance: 'Argo Global Ocean Observing System / Copernicus Marine',
  },
  // 22. Tectonic Hazards - USGS Seismology
  {
    id: 'seismic_events',
    category: 'science',
    label: 'Sismología (USGS)',
    fullLabel: 'Sismos Tectónicos y Arco de Scotia USGS',
    description: 'Eventos sísmicos en la Placa de Scotia, Estrecho de Bransfield y Fosa de las Sandwich del Sur',
    color: '#FF827D',
    defaultEnabled: false,
    provenance: 'USGS Earthquake Hazards Program (FDSN)',
  },
  // 23. Strategic Registry - SURIE ArcGIS WebMap
  {
    id: 'surie_webmap',
    category: 'registry',
    label: 'SURIE WebMap',
    fullLabel: 'SURIE ArcGIS WebMap (de8bb6821bf148649f1e7b9154592a97)',
    description: 'Official Colombian Antarctic Strategic Registry WebMap with side-by-side comparison mode',
    color: '#38BDF8',
    defaultEnabled: false,
    provenance: 'SURIE / Dirección General Marítima (DIMAR) / ArcGIS Online',
  },
];

export const SURIE_WEBMAP_ID = 'de8bb6821bf148649f1e7b9154592a97';
