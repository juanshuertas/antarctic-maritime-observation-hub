import { useState, useEffect } from 'react';
import TrafficControls from './TrafficControls';



import {



  Search,



  ChevronLeft,



  ChevronRight,



  Ship,



  Plane,



  Waves,



  Mountain,



  Fish,



  CheckCircle2,



  ExternalLink,



  Flame,



  Radio,



  Wind,



  X,



  Compass,



  Thermometer,



  Cloud,



  Shield,



  Sparkles,



  Camera,



  RotateCcw,



  FlaskConical,



  Layers,



} from 'lucide-react';



import type { ControlCenterTab, SavedView } from '../lib/workspace-store';



import { useI18nStore } from '../lib/i18n';



import { ExpeditionTab, type Milestone } from './expedition/ExpeditionTab';



import UnifiedControlCenterWorkspace, { type UnifiedControlMode } from './UnifiedControlCenterWorkspace';







export interface EntityDetail {



  id: string;



  type: 'vessel' | 'aircraft' | 'satellite' | 'fauna' | 'seismic' | 'station' | 'sensor' | 'cable';



  title: string;



  subtitle?: string;



  coordinates?: [number, number];



  data?: Record<string, any>;



}







interface ControlCenterProps {



  currentTab: ControlCenterTab;



  onTabChange: (tab: ControlCenterTab) => void;



  activeLayers: Record<string, boolean>;



  onToggleLayer: (layerId: string, enabled: boolean) => void;



  telemetry: {



    vessels_count: number | null;



    satellites_count: number | null;



    aircraft_count: number | null;



    ais_connected?: boolean;
    ais_freshness?: string;
    aviation_freshness?: string;



    gfw_configured?: boolean;



  };
  monitoredVessels?: EntityDetail[];



  selectedEntity: EntityDetail | null;



  onSelectEntity: (entity: EntityDetail | null) => void;



  onFlyTo: (coords: [number, number], zoom?: number) => void;



  savedViews: SavedView[];



  onSelectSavedView: (view: SavedView) => void;



  isOpen?: boolean;



  onToggleOpen?: () => void;



  onOpenLayers?: () => void;



  onOpenFauna?: () => void;



  onOpenGfw?: () => void;



  onOpenCoverage?: () => void;



  onOpenSelfHealing?: () => void;



  onOpenPythia?: () => void;



  onOpenObservation?: () => void;



  onSetLayerOpacity?: (layerId: string, opacity: number) => void;



  layerOpacities?: Record<string, number>;



  activeSdgGoal?: number | null;



  onSelectSdgGoal?: (goal: number | null) => void;



}







interface LayerItem {



  id: string;



  label: string;



  desc: string;



  color: string;



}







interface LayerCategory {



  id: string;



  title: string;



  description: string;



  icon: any;



  color: string;



  layers: LayerItem[];



}







export default function ControlCenter({



  currentTab,



  onTabChange,



  activeLayers,



  onToggleLayer,




  monitoredVessels = [],



  selectedEntity,



  onSelectEntity,



  onFlyTo,



  savedViews,



  onSelectSavedView,



  isOpen = true,



  onToggleOpen,



  onOpenLayers,



  onOpenFauna,



  onOpenGfw,



  onOpenCoverage,



  onOpenSelfHealing,



  onOpenPythia,



  onOpenObservation,



  onSetLayerOpacity,



  layerOpacities = {},



  activeSdgGoal = null,



  onSelectSdgGoal,



}: ControlCenterProps) {



  useI18nStore(); // mantiene la suscripción al idioma; 't' no se usa en este componente



  const [searchQuery, setSearchQuery] = useState('');



  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);







  // AMOH_UNIFIED_CC_SAFE_V3 — visual organization only; WorkspaceStore schema is unchanged.



  const [unifiedMode, setUnifiedMode] = useState<UnifiedControlMode>('CAPAS');







  useEffect(() => {



    const handler = (event: Event) => {



      const mode = (event as CustomEvent<UnifiedControlMode>).detail;



      if (!['CAPAS','ODS','XDG','CRUCE'].includes(mode)) return;



      setUnifiedMode(mode);



      onSelectEntity(null);



      onTabChange('EXPLORE');



    };



    window.addEventListener('amoh:control-center-mode', handler as EventListener);



    return () => window.removeEventListener('amoh:control-center-mode', handler as EventListener);



  }, [onSelectEntity, onTabChange]);







  const openUnifiedMode = (mode: UnifiedControlMode) => {



    setUnifiedMode(mode);



    onSelectEntity(null);



    onTabChange('EXPLORE');



  };







  // 11 Human Categories Architecture (V7)



  const CATEGORIES: LayerCategory[] = [



    {



      id: 'QUANTARCTICA',



      title: 'Quantarctica 3 & NPI',



      description: 'Líneas de costa SCAR ADD, barreras de hielo, afloramientos y biogeografía oficial',



      icon: Layers,



      color: '#00e5ff',



      layers: [



        { id: 'quantarctica_coastline', label: 'Línea de Costa SCAR ADD', desc: 'Cartografía base circumpolar de alta precisión', color: '#38bdf8' },



        { id: 'quantarctica_ice_shelf', label: 'Barreras de Hielo Flotante', desc: 'Plataformas Ross, Ronne-Filchner, Amery y Larsen', color: '#a7f3d0' },



        { id: 'rock_outcrops', label: 'Afloramientos Rocosos (SCAR ADD)', desc: 'Nunataks y cordilleras libres de hielo', color: '#94a3b8' },



        { id: 'glacier_velocity', label: 'Velocidad Glaciar (MEaSUREs)', desc: 'Flujo y dinámica de hielo InSAR', color: '#34d399' },



        { id: 'median_sea_ice_extents', label: 'Banquisa Mediana 1981–2010', desc: 'Línea base climática mensual NSIDC/NPI', color: '#67e8f9' },



        { id: 'southern_ocean_fronts', label: 'Frentes Oceánicos (SCAR / Orsi)', desc: 'Frente Polar (PF), Subantártico (SAF) y ACC', color: '#06b6d4' },



        { id: 'acbrs', label: 'Ecorregiones Terrestres (ACBRs v2)', desc: '16 regiones biogeográficas adoptadas por el CEP', color: '#10b981' },



        { id: 'emperor_penguin_colonies', label: 'Colonias Pingüino Emperador', desc: 'Censo satelital circumpolar BAS / NPI', color: '#fbbf24' },



        { id: 'important_bird_areas', label: 'Áreas Importantes Aves (IBAs)', desc: 'Sitios nodales BirdLife / SCAR', color: '#f59e0b' },



        { id: 'ccamlr_statistical_areas', label: 'Áreas Estadísticas CCAMLR', desc: 'Divisiones de pesca 48, 58 y 88', color: '#c084fc' },



        { id: 'comnap_facilities', label: 'Instalaciones COMNAP', desc: 'Red oficial de 82 estaciones científicas', color: '#38bdf8' },



        { id: 'historic_routes', label: 'Rutas Históricas Era Heroica', desc: 'Travesías Amundsen, Scott, Shackleton', color: '#eab308' },



        { id: 'historic_stations', label: 'Sitios y Monumentos SMH (ATS)', desc: 'Patrimonio histórico protegido', color: '#eab308' },



      ],



    },



    {



      id: 'DEFENSE',



      title: 'Geopolítica y Defensa Polar',



      description: 'Zonas de fricción, zonas grises, radares EW y corredores estratégicos',



      icon: Shield,



      color: '#ef4444',



      layers: [



        { id: 'grey_zones_defense', label: 'Zonas Grises de Defensa', desc: 'Superposiciones de soberanía y zonas de patrullaje', color: '#ef4444' },



        { id: 'polar_friction_sectors', label: 'Barómetro de Fricción Polar', desc: 'Sectores calientes de tensión geopolítica', color: '#f97316' },



        { id: 'grey_zones_buffers', label: 'Buffers Radares & EW', desc: 'Zonas de alerta temprana y guerra electrónica', color: '#eab308' },



        { id: 'subsurface_nuclear', label: 'Submarinos Nucleares & CTBTO', desc: 'Corredores Drake/Malvinas e hidrófonos SOFAR', color: '#e11d48' },



      ],



    },



    {



      id: 'ACTIVITY',



      title: 'Actividad Humana',



      description: 'Tráfico marítimo AIS, puentes aéreos, turismo IAATO y pesca GFW',



      icon: Ship,



      color: '#35c3c8',



      layers: [



        { id: 'maritime_vessels', label: 'Buques AIS en Vivo', desc: 'Posiciones y rumbos en tiempo real', color: '#35c3c8' },



        { id: 'polar_aircraft', label: 'Vuelos Polares ADS-B', desc: 'Puente aéreo Punta Arenas & McMurdo', color: '#4da8ff' },



        { id: 'polar_satellites', label: 'Satélites de Observación', desc: 'Órbitas SGP4 y footprints SAR', color: '#a995ff' },



        { id: 'fisheries_effort', label: 'Pesquerías Monitoreadas (GFW)', desc: 'Esfuerzo aparente y buques CCAMLR', color: '#ff8a4c' },



        { id: 'tourism_routes', label: 'Turismo IAATO & Rutas 2030', desc: 'Itinerarios publicados vs trazas AIS', color: '#dda63a' },



        { id: 'iaato_landing_sites', label: 'Desembarcos IAATO & Zodiacs', desc: 'Directrices de sitio, aforos y bioseguridad H5N1', color: '#38bdf8' },



        { id: 'iaato_deep_field_camps', label: 'Campamentos y Pistas de Interior', desc: 'Bases ALE, White Desert y pistas de hielo azul', color: '#a855f7' },



        { id: 'luxury_camps', label: 'Campamentos de Lujo & Glamping', desc: 'Whichaway, Echo, Wolf\'s Fang y Three Glaciers', color: '#f59e0b' },



        { id: 'tourist_submersibles', label: 'Sumergibles de Expedición', desc: 'Inmersiones U-Boat Worx y Triton en la Península', color: '#0284c7' },



        { id: 'heavy_traverses', label: 'Travesías Oruga Pesadas', desc: 'Convoyes SPoT, Raid Concordia y Raid Vostok', color: '#ea580c' },



        { id: 'autonomous_yachts', label: 'Misiones Autónomas & Veleros', desc: 'Circunnavegación Saildrone y ski-alpinismo', color: '#06b6d4' },



        { id: 'maritime_corridors', label: 'Corredores del Paso Drake', desc: 'Rutas de navegación y chokepoints', color: '#00a3c4' },



      ],



    },



    {



      id: 'ATMOSPHERE',



      title: 'Atmósfera y Clima',



      description: 'Vientos sinópticos, temperatura superficial, frentes polares y presión',



      icon: Wind,



      color: '#58d5e3',



      layers: [



        { id: 'wind_particles', label: 'Viento Polar Superficial', desc: 'Campo vectorial y rachas catabáticas', color: '#58d5e3' },



        { id: 'atmosphere_temp', label: 'Temperatura a 2m', desc: 'Isotermas y gradiente térmico', color: '#ffa726' },



        { id: 'cloud_cover', label: 'Cobertura de Nubes & Niebla', desc: 'Visibilidad de vuelo y navegación', color: '#b0bec5' },



        { id: 'pressure_msl', label: 'Presión a Nivel del Mar', desc: 'Centros de baja presión polar', color: '#ab47bc' },



      ],



    },



    {



      id: 'OCEAN',



      title: 'Océano Austral',



      description: 'Corriente Circumpolar Antártica (ACC), boyas Argo y salinidad',



      icon: Waves,



      color: '#38bdf8',



      layers: [



        { id: 'quantarctica_bathymetry', label: 'Batimetría IBCSO v2 (SCAR)', desc: 'Isobates de alta resolución (-500m a -4000m)', color: '#0a97d9' },



        { id: 'ocean_currents', label: 'Corriente Circumpolar (ACC)', desc: 'Flujo geostrófico de 1,000 partículas', color: '#58d5e3' },



        { id: 'argo_floats', label: 'Perfiladores Argo (0–2000m)', desc: 'Salinidad, temperatura y ciclos CTD', color: '#38bdf8' },



        { id: 'ocean_sst', label: 'Temperatura Superficial Marina', desc: 'Anomalías térmicas oceánicas', color: '#26a69a' },



      ],



    },



    {



      id: 'ICE',



      title: 'Criosfera e Hielo',



      description: 'Banquisa marina, plataformas glaciares y deriva de témpanos',



      icon: Mountain,



      color: '#caf9f7',



      layers: [



        { id: 'quantarctica_glaciers', label: 'Velocidad de Glaciares (MEaSUREs)', desc: 'Flujo y dinámica de corrientes de hielo (InSAR)', color: '#3f7e44' },



        { id: 'quantarctica_ice', label: 'Plataformas de Hielo (Larsen/Ross)', desc: 'Márgenes de hielo y líneas de apoyo', color: '#84d8ff' },



        { id: 'sea_ice_concentration', label: 'Concentración de Banquisa', desc: 'Satélite AMSR2 / Sentinel-1 SAR', color: '#caf9f7' },



        { id: 'iceberg_drift', label: 'Témpanos Tabulares Mayores', desc: 'Monitoreo de desprendimientos activos', color: '#e0f7fa' },



      ],



    },



    {



      id: 'LIFE',



      title: 'Biodiversidad y Fauna',



      description: 'Avistamientos circumpolares, fitoplancton, cardúmenes, ballenas y krill',



      icon: Fish,



      color: '#72e0b5',



      layers: [



        { id: 'antarctic_fauna', label: 'Fauna Antártica Completa (18 Sectores)', desc: '53 especies catalogadas, OBIS y SCAR', color: '#72e0b5' },



        { id: 'phytoplankton_chlorophyll', label: 'Fitoplancton y Clorofila-a', desc: 'Floraciones algales y polinias (Sentinel-3 / MODIS)', color: '#10b981' },



        { id: 'fauna_schools_fish', label: 'Cardúmenes de Peces Polares', desc: 'Capas de dispersión acústica Simrad EK80 (Bacalao/Pleuragramma)', color: '#38bdf8' },



        { id: 'fauna_krill_swarms', label: 'Súper-enjambres de Krill', desc: 'Concentraciones acústicas de biomasa (CCAMLR)', color: '#fb923c' },



        { id: 'fauna_whale_pods', label: 'Manadas y Corredores de Ballenas', desc: 'Agrupaciones de forrajeo y acústica IWC SOWER', color: '#06b6d4' },



        { id: 'fauna_penguins', label: 'Colonias de Pingüinos (MAPPPD)', desc: 'Adelia, barbijo, papúa, emperador y penacho', color: '#fbbf24' },



        { id: 'fauna_pinnipeds', label: 'Focas y Pinnípedos Polares', desc: 'Weddell, leopardo, cangrejera y elefante', color: '#2dd4bf' },



        { id: 'fauna_seabirds', label: 'Aves Marinas y Albatros', desc: 'Albatros viajero, petrel gigante y gaviotín (ACAP)', color: '#a78bfa' },



      ],



    },



    {



      id: 'SCIENCE_EXPEDITIONS',



      title: 'Ciencia y Expediciones',



      description: 'Cruceros oceanográficos SOOS, lances CTD y estaciones polares',



      icon: FlaskConical,



      color: '#a78bfa',



      layers: [



        { id: 'expedition_cruises', label: 'Campañas Científicas SOOS', desc: 'Derrota de buques polares y estaciones CTD', color: '#a78bfa' },



        { id: 'quantarctica_stations', label: 'Bases Científicas COMNAP', desc: 'Estaciones permanentes y de verano', color: '#ffffff' },



      ],



    },



    {



      id: 'SENSORS',



      title: 'Red de Sensores y Boyas',



      description: 'Instrumentación in situ, sismología FDSN y boyas meteorológicas',



      icon: Radio,



      color: '#58d5e3',



      layers: [



        { id: 'argo_floats', label: 'Boyas Perfiladoras Argo', desc: 'Red hidrográfica global activa', color: '#58d5e3' },



        { id: 'seismic_events', label: 'Sismicidad Tectónica (USGS)', desc: 'Enjambre Bransfield y Arco Scotia', color: '#ff827d' },



        { id: 'polar_satellites', label: 'Sensores Satelitales SGP4', desc: 'Sentinel-1, CryoSat-2 e ICESat-2', color: '#a995ff' },



      ],



    },



    {



      id: 'INFRASTRUCTURE',



      title: 'Infraestructura Polar',



      description: 'Bases permanentes, cables transoceánicos y pistas de aterrizaje',



      icon: Mountain,



      color: '#ffc845',



      layers: [



        { id: 'quantarctica_stations', label: 'Bases Científicas COMNAP', desc: 'Estaciones permanentes y de verano', color: '#ffffff' },



        { id: 'submarine_cables', label: 'Cables Submarinos & SMART', desc: 'Rutas operativas, planificadas y sensores', color: '#ffc845' },



        { id: 'offshore_energy', label: 'Energía de Puertas de Entrada', desc: 'Proyectos eólicos y energía austral', color: '#fbbf24' },



      ],



    },



    {



      id: 'POLLUTION',



      title: 'Contaminación y Radiación',



      description: 'Línea base radiológica IAEA MARIS, aerosoles y microplásticos',



      icon: Flame,



      color: '#ff5e8a',



      layers: [



        { id: 'maris_nuclear', label: 'Línea Base Radiológica (IAEA)', desc: 'Cesio-137 y tritio en aguas australes', color: '#ff5e8a' },



        { id: 'black_carbon', label: 'Aerosoles y Carbono Negro', desc: 'Depósito atmosférico sobre la nieve', color: '#f43f5e' },



      ],



    },



    {



      id: 'GOVERNANCE',



      title: 'Gobernanza y Tratado',



      description: 'Áreas protegidas ASPA/ASMA, límites CCAMLR y directrices ATS',



      icon: Shield,



      color: '#c084fc',



      layers: [



        { id: 'aspa', label: 'Áreas Especialmente Protegidas (ASPA)', desc: 'Conservación estricta Tratado Antártico', color: '#c084fc' },



        { id: 'ccamlr_zones', label: 'Áreas de Conservación CCAMLR', desc: 'Límites estadísticos y santuarios', color: '#f97316' },



        { id: 'subsurface_nuclear', label: 'Submarinos Nucleares & CTBTO', desc: 'Corredores Drake/Malvinas, hidrófonos SOFAR y 60°S', color: '#e11d48' },



      ],



    },



    {



      id: 'FIELD',



      title: 'Registro de Campo',



      description: 'Observaciones de expedición, imágenes DJI y evidencias de misión',



      icon: Camera,



      color: '#8de8cd',



      layers: [



        { id: 'field_observations', label: 'Mis Observaciones de Campo', desc: 'Registros de bitácora y waypoints', color: '#8de8cd' },



        { id: 'cctv_cams', label: 'Cámaras Científicas Públicas', desc: 'Webcams de bases de investigación', color: '#67e8f9' },



      ],



    },



  ];







  // Focus presets: quick multi-layer activation



  const FOCUS_PRESETS = [



    {



      id: 'QUANTARCTICA',



      name: 'Quantarctica',



      icon: Layers,



      color: '#00e5ff',



      layers: ['quantarctica_coastline', 'quantarctica_ice_shelf', 'rock_outcrops', 'glacier_velocity', 'southern_ocean_fronts', 'acbrs', 'comnap_facilities'],



    },



    {



      id: 'DEFENSE',



      name: 'Defensa',



      icon: Shield,



      color: '#ef4444',



      layers: ['grey_zones_defense', 'polar_friction_sectors', 'grey_zones_buffers', 'subsurface_nuclear'],



    },



    {



      id: 'MARITIME',



      name: 'Marítimo',



      icon: Ship,



      color: '#35c3c8',



      layers: ['maritime_vessels', 'maritime_corridors'],



    },



    {



      id: 'WEATHER',



      name: 'Clima',



      icon: Wind,



      color: '#58d5e3',



      layers: ['wind_particles', 'ocean_currents', 'copernicus_currents_peninsula'],



    },



    {



      id: 'OCEAN',



      name: 'Océano',



      icon: Waves,



      color: '#38bdf8',



      layers: ['ocean_currents', 'copernicus_currents_peninsula', 'argo_floats'],



    },



    {



      id: 'ICE',



      name: 'Hielo',



      icon: Mountain,



      color: '#caf9f7',



      layers: ['quantarctica_ice', 'sea_ice_concentration'],



    },



    {



      id: 'LIFE',



      name: 'Vida',



      icon: Fish,



      color: '#72e0b5',



      layers: ['antarctic_fauna', 'aspa'],



    },



    {



      id: 'TOURISM',



      name: 'Turismo',



      icon: Compass,



      color: '#dda63a',



      layers: ['tourism_routes', 'quantarctica_stations'],



    },



    {



      id: 'NUCLEAR',



      name: 'Nuclear',



      icon: Flame,



      color: '#ff5e8a',



      layers: ['maris_nuclear', 'quantarctica_stations'],



    },



    {



      id: 'SENSORS',



      name: 'Sensores',



      icon: Radio,



      color: '#a995ff',



      layers: ['argo_floats', 'seismic_events', 'polar_satellites'],



    },



    {



      id: 'EXPEDITION',



      name: 'Misión PAC',



      icon: Sparkles,



      color: '#72e0b5',



      layers: ['quantarctica_stations', 'polar_aircraft', 'maritime_vessels'],



    },



  ];







  const handleApplyPreset = (presetLayers: string[]) => {



    // Clear all thematic layers, then enable only preset layers



    const allLayerIds = new Set<string>();



    CATEGORIES.forEach((c) => c.layers.forEach((l) => allLayerIds.add(l.id)));



    allLayerIds.forEach((id) => {



      const shouldEnable = presetLayers.includes(id);



      if (!!activeLayers[id] !== shouldEnable) {



        onToggleLayer(id, shouldEnable);



      }



    });



  };







  const handleClearAllThematicLayers = () => {



    const allLayerIds = new Set<string>();



    CATEGORIES.forEach((c) => c.layers.forEach((l) => allLayerIds.add(l.id)));



    allLayerIds.forEach((id) => {



      if (activeLayers[id]) {



        onToggleLayer(id, false);



      }



    });



  };







  // Sample fleet



  const SAMPLE_VESSELS: EntityDetail[] = [



    {



      id: 'v-simon-bolivar',



      type: 'vessel',



      title: 'ARC Simón Bolívar',



      subtitle: 'Buque de Investigación Científica Marina (Colombia)',



      coordinates: [-63.2, -64.8],



      data: {



        MMSI: '730000001',



        Tipo: 'Investigación Oceanográfica',



        Bandera: 'Colombia',



        Velocidad: '11.4 nudos',



        Rumbo: '184°',



        Estado: 'Misión Antártica X / PAC',



      },



    },



    {



      id: 'v-antarctic-endurance',



      type: 'vessel',



      title: 'Antarctic Endurance',



      subtitle: 'Buque Factoría Krill Eco-Harvesting (Noruega)',



      coordinates: [-58.4, -62.1],



      data: {



        MMSI: '257086870',



        Tipo: 'Pesca Sostenible CCAMLR',



        Bandera: 'Noruega',



        Velocidad: '8.2 nudos',



        Rumbo: '092°',



        Estado: 'Operación activa Bransfield',



      },



    },



  ];







  const SAMPLE_AIRCRAFT: EntityDetail[] = [



    {



      id: 'a-dap-901',



      type: 'aircraft',



      title: 'Aerovías DAP 901',



      subtitle: 'BAe 146-200 · Puente Aéreo Punta Arenas → King George Island',



      coordinates: [-58.9, -62.1],



      data: {



        ICAO24: 'E80214',



        Altitud: '28,000 pies',



        Velocidad: '380 nudos',



        Ruta: 'SCCI → SCRM',



        Estado: 'En crucero sobre Paso Drake',



      },



    },



  ];







  const SAMPLE_SATELLITES: EntityDetail[] = [



    {



      id: 's-sentinel-1a',



      type: 'satellite',



      title: 'Sentinel-1A (SAR-C)',



      subtitle: 'ESA Copernicus · Radar de Apertura Sintética Polar',



      coordinates: [-65.0, -64.0],



      data: {



        NORAD: '39634',



        Órbita: 'Polar Heliosincrónica (SSO)',



        Altitud: '693 km',



        Periodo: '98.6 min',



        Sensor: 'SAR Banda C (Interferometría de Hielo)',



        Estado: 'PROPAGADO (SGP4)',



      },



    },



  ];







  // Search filtering



  const allEntities = [...SAMPLE_VESSELS, ...SAMPLE_AIRCRAFT, ...SAMPLE_SATELLITES];



  const searchResults = searchQuery.trim()



    ? allEntities.filter(



        (e) =>



          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||



          (e.subtitle && e.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))



      )



    : [];







  // Active layer counter



  const totalThematicActive = Object.entries(activeLayers).filter(



    ([k, v]) => v && !['quantarctica_coast', 'quantarctica_ice'].includes(k)



  ).length;
  void totalThematicActive; // reservado: se conserva sin uso por ahora (corrección TS6133 sin cambiar comportamiento)







  if (!isOpen) return null;







  return (



    <aside



      className="absolute top-4 left-4 bottom-4 z-[230] w-[350px] max-w-[calc(100vw-32px)] flex flex-col bg-[#080e19f2] border border-[#24344d] rounded-2xl shadow-2xl backdrop-blur-xl select-none transition-all duration-200 overflow-hidden translate-x-0 opacity-100"



      style={{ fontFamily: "'DM Sans', sans-serif" }}



    >



      {/* 1. Header & Segment Tabs */}



      <div className="p-3 border-b border-[#1c2940] bg-[#101626]/80 shrink-0">



        <div className="flex items-center justify-between mb-2.5">



          <div className="flex items-center gap-2">



            <span className="w-2 h-2 rounded-full bg-[#35c3c8] animate-pulse" />



            <span className="text-xs font-mono font-bold tracking-wider text-[#f5f8fc] uppercase">



              Control Center



            </span>



          </div>



          <div className="flex items-center gap-1.5">



            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c2940] text-[#72e0b5]">



              AMOH V10



            </span>



            {onToggleOpen && (



              <button



                onClick={onToggleOpen}



                className="p-1 rounded-lg hover:bg-white/10 text-[#8fa3bd] hover:text-white transition-colors"



                title="Minimizar Control Center"



              >



                <X className="w-3.5 h-3.5" />



              </button>



            )}



          </div>



        </div>







        {/* AMOH_UNIFIED_CC_SAFE_V3 — primary modes */}



        <div className="grid grid-cols-5 gap-1 p-1 bg-[#080e19] border border-[#1c2940] rounded-xl font-mono text-[9px]">



          {([



            ['AHORA', 'NOW'],



            ['CAPAS', 'CAPAS'],



            ['ODS', 'ODS'],



            ['XDG', 'XDG'],



            ['CRUCE', 'CRUCE'],



          ] as const).map(([label,id]) => {



            const active = id === 'NOW'



              ? currentTab === 'NOW' && !selectedEntity



              : currentTab === 'EXPLORE' && unifiedMode === id && !selectedEntity;



            return <button



              key={id}



              type="button"



              onClick={() => id === 'NOW'



                ? (onSelectEntity(null), onTabChange('NOW'))



                : openUnifiedMode(id)}



              className={`py-1.5 rounded-lg font-semibold transition-all ${



                active



                  ? 'bg-[#24344d] text-white shadow-sm'



                  : 'text-[#8fa3bd] hover:text-white hover:bg-white/5'



              }`}



            >{label}</button>;



          })}



        </div>



        <div className="flex items-center gap-1 mt-1.5 font-mono">



          <button



            type="button"



            onClick={() => { onSelectEntity(null); onTabChange('EXPEDITION'); }}



            className={`px-2 py-1 rounded-md text-[8px] border ${



              currentTab==='EXPEDITION'



                ? 'bg-[#FFCC00]/15 border-[#FFCC00]/40 text-[#FFCC00]'



                : 'border-white/[0.07] text-[#8fa3bd]'



            }`}



          >🚢 EXP</button>



          <button



            type="button"



            onClick={() => { onSelectEntity(null); onTabChange('SEARCH'); }}



            className={`px-2 py-1 rounded-md text-[8px] border ${



              currentTab==='SEARCH'



                ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-200'



                : 'border-white/[0.07] text-[#8fa3bd]'



            }`}



          >BUSCAR</button>



          <button



            type="button"



            onClick={() => { onSelectEntity(null); onTabChange('SAVED'); }}



            className={`px-2 py-1 rounded-md text-[8px] border ${



              currentTab==='SAVED'



                ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-200'



                : 'border-white/[0.07] text-[#8fa3bd]'



            }`}



          >VISTAS</button>



        </div>







        {/* Quick Tools Tray */}



        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#1c2940] overflow-x-auto no-scrollbar text-[10px] font-mono">



          {onOpenLayers && (



            <button



              onClick={onOpenLayers}



              className="px-2 py-1 rounded-lg bg-[#080e19] border border-[#1c2940] hover:border-[#35c3c8] text-[#8fa3bd] hover:text-white shrink-0 flex items-center gap-1 transition-colors"



            >



              <span>🗺️ Capas</span>



            </button>



          )}



          {onOpenFauna && (



            <button



              onClick={onOpenFauna}



              className="px-2 py-1 rounded-lg bg-[#080e19] border border-[#1c2940] hover:border-[#58d5e3] text-[#8fa3bd] hover:text-white shrink-0 flex items-center gap-1 transition-colors"



            >



              <span>🐧 Fauna</span>



            </button>



          )}



          {onOpenGfw && (



            <button



              onClick={onOpenGfw}



              className="px-2 py-1 rounded-lg bg-[#080e19] border border-[#1c2940] hover:border-[#ff754b] text-[#8fa3bd] hover:text-white shrink-0 flex items-center gap-1 transition-colors"



            >



              <span>🐟 Pesca GFW</span>



            </button>



          )}



          {onOpenCoverage && (



            <button



              onClick={onOpenCoverage}



              className="px-2 py-1 rounded-lg bg-[#080e19] border border-[#1c2940] hover:border-[#00e676] text-[#8fa3bd] hover:text-white shrink-0 flex items-center gap-1 transition-colors"



            >



              <span>🌐 18 Sectores</span>



            </button>



          )}



          {onOpenSelfHealing && (



            <button



              onClick={onOpenSelfHealing}



              className="px-2 py-1 rounded-lg bg-[#080e19] border border-[#1c2940] hover:border-[#00e676] text-[#8fa3bd] hover:text-white shrink-0 flex items-center gap-1 transition-colors"



            >



              <span>✨ Salud</span>



            </button>



          )}



          {onOpenPythia && (



            <button



              onClick={onOpenPythia}



              className="px-2 py-1 rounded-lg bg-[#080e19] border border-[#1c2940] hover:border-[#00e5ff] text-[#8fa3bd] hover:text-white shrink-0 flex items-center gap-1 transition-colors"



            >



              <span>🔮 Pythia</span>



            </button>



          )}



          {onOpenObservation && (



            <button



              onClick={onOpenObservation}



              className="px-2 py-1 rounded-lg bg-[#080e19] border border-[#1c2940] hover:border-[#00e5ff] text-[#8fa3bd] hover:text-white shrink-0 flex items-center gap-1 transition-colors"



            >



              <span>📷 Registrar</span>



            </button>



          )}



        </div>



      </div>







      {/* 2. Body Area */}



      <div className="flex-1 overflow-y-auto p-3 text-xs custom-scrollbar">



        {selectedEntity ? (



          /* ENTITY DRILL-DOWN VIEW (Inside SAME sidebar) */



          <div className="space-y-3 animate-in fade-in duration-150">



            <button



              onClick={() => onSelectEntity(null)}



              className="flex items-center gap-1.5 text-[11px] font-mono text-[#35c3c8] hover:text-white transition-colors"



            >



              <ChevronLeft className="w-4 h-4" />



              <span>Volver al Control Center</span>



            </button>







            <div className="p-3 bg-[#101626] border border-[#24344d] rounded-xl space-y-2">



              <div className="flex items-center justify-between">



                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#35c3c8]/10 text-[#35c3c8] border border-[#35c3c8]/30 font-semibold">



                  {selectedEntity.type.toUpperCase()}



                </span>



                {selectedEntity.coordinates && (



                  <button



                    onClick={() => {



                      if (selectedEntity.coordinates) {



                        onFlyTo(selectedEntity.coordinates, 6);



                      }



                    }}



                    className="text-[10px] font-mono text-[#58d5e3] hover:underline flex items-center gap-1"



                  >



                    <span>Centrar en mapa</span>



                    <ExternalLink className="w-3 h-3" />



                  </button>



                )}



              </div>







              <h3 className="text-sm font-bold text-white tracking-wide">



                {selectedEntity.title}



              </h3>



              {selectedEntity.subtitle && (



                <p className="text-[11px] text-[#b7c5d8] leading-relaxed">



                  {selectedEntity.subtitle}



                </p>



              )}



            </div>







            {selectedEntity.data && (



              <div className="p-3 bg-[#101626] border border-[#1c2940] rounded-xl space-y-2 font-mono text-[11px]">



                <div className="text-[10px] uppercase font-bold text-[#8fa3bd] pb-1 border-b border-[#1c2940]">



                  Telemetría & Atributos



                </div>



                {Object.entries(selectedEntity.data).map(([key, val]) => (



                  <div key={key} className="flex justify-between items-center py-0.5">



                    <span className="text-[#8fa3bd]">{key}:</span>



                    <span className="text-[#f5f8fc] font-semibold">{String(val)}</span>



                  </div>



                ))}



              </div>



            )}



          </div>



        ) : (



          /* TAB VIEWS */



          <>



            {/* TAB: NOW (Antarctica Now Telemetry) */}



            {currentTab === 'NOW' && (



              <div className="space-y-3">



                <TrafficControls activeLayers={activeLayers} onToggleLayer={onToggleLayer} />
                {/* Sample Verified Polar Ships */}



                <div className="space-y-2 pt-1">



                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8fa3bd]">



                    <span>FLOTA MONITOREADA</span>



                    <span className="text-[#35c3c8]">Open Waters AIS</span>



                  </div>



                  {(monitoredVessels.length > 0 ? monitoredVessels : SAMPLE_VESSELS.slice(0, 0)).map((v) => (



                    <button



                      key={v.id}



                      onClick={() => {



                        onSelectEntity(v);



                        if (v.coordinates) onFlyTo(v.coordinates, 6);



                      }}



                      className="w-full p-2.5 rounded-xl bg-[#101626] border border-[#1c2940] hover:border-[#35c3c8]/50 transition-all text-left flex items-center justify-between group"



                    >



                      <div className="flex items-center gap-2 min-w-0">



                        <Ship className="w-3.5 h-3.5 text-[#35c3c8] shrink-0" />



                        <div className="truncate">



                          <div className="text-xs font-semibold text-white group-hover:text-[#35c3c8] transition-colors truncate">



                            {v.title}



                          </div>



                          <div className="text-[10px] text-[#8fa3bd] truncate">



                            {v.subtitle}



                          </div>



                        </div>



                      </div>



                      <span className="text-[10px] font-mono text-[#72e0b5] ml-2 shrink-0">



                        {v.data?.Velocidad}



                      </span>



                    </button>



                  ))}



                </div>







                {/* High-Latitude Flights */}



                <div className="space-y-2 pt-1">



                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8fa3bd]">



                    <span>VUELOS POLARES</span>



                    <span className="text-[#4da8ff]">ADS-B</span>



                  </div>



                  {SAMPLE_AIRCRAFT.slice(0, 0).map((a) => (



                    <button



                      key={a.id}



                      onClick={() => {



                        onSelectEntity(a);



                        if (a.coordinates) onFlyTo(a.coordinates, 6);



                      }}



                      className="w-full p-2.5 rounded-xl bg-[#101626] border border-[#1c2940] hover:border-[#4da8ff]/50 transition-all text-left flex items-center justify-between group"



                    >



                      <div className="flex items-center gap-2 min-w-0">



                        <Plane className="w-3.5 h-3.5 text-[#4da8ff] shrink-0" />



                        <div className="truncate">



                          <div className="text-xs font-semibold text-white group-hover:text-[#4da8ff] transition-colors truncate">



                            {a.title}



                          </div>



                          <div className="text-[10px] text-[#8fa3bd] truncate">



                            {a.subtitle}



                          </div>



                        </div>



                      </div>



                      <span className="text-[10px] font-mono text-[#4da8ff] ml-2 shrink-0">



                        {a.data?.Altitud}



                      </span>



                    </button>



                  ))}



                </div>



              </div>



            )}







            {/* TAB: EXPLORE / UNIFIED CONTROL CENTER — AMOH_UNIFIED_CC_SAFE_V3 */}



            {currentTab === 'EXPLORE' && (



              <div className="space-y-3">



                <UnifiedControlCenterWorkspace



                  mode={unifiedMode}



                  activeLayers={activeLayers}



                  onToggleLayer={onToggleLayer}



                  layerOpacities={layerOpacities}



                  onSetLayerOpacity={onSetLayerOpacity}



                  activeSdgGoal={activeSdgGoal}



                  onSelectSdgGoal={onSelectSdgGoal}



                  onOpenFauna={onOpenFauna}



                  onOpenGfw={onOpenGfw}



                  onOpenCoverage={onOpenCoverage}



                  onOpenSelfHealing={onOpenSelfHealing}



                  onOpenPythia={onOpenPythia}



                  onOpenObservation={onOpenObservation}



                />







                {unifiedMode === 'CAPAS' && (



                  <details className="rounded-xl border border-white/[0.06] bg-white/[0.015]">



                    <summary className="cursor-pointer px-3 py-2 text-[8px] font-mono text-[#6f8792] hover:text-white">



                      VISTA CLÁSICA / COMPATIBILIDAD



                    </summary>



                    <div className="p-2 border-t border-white/[0.06]">



            {/* TAB: EXPLORE / LAYERS (Apple-Like Drill-Down & Presets) */}



            {currentTab === 'EXPLORE' && (



              <div className="space-y-3">



                {selectedCategory ? (



                  /* CATEGORY DRILL-DOWN SUB-VIEW */



                  (() => {



                    const cat = CATEGORIES.find((c) => c.id === selectedCategory);



                    if (!cat) return null;



                    const CatIcon = cat.icon;



                    const catActiveCount = cat.layers.filter((l) => !!activeLayers[l.id]).length;







                    return (



                      <div className="space-y-3 animate-in fade-in duration-150">



                        {/* Back button */}



                        <div className="flex items-center justify-between">



                          <button



                            onClick={() => setSelectedCategory(null)}



                            className="flex items-center gap-1 text-[11px] font-mono text-[#35c3c8] hover:text-white transition-colors"



                          >



                            <ChevronLeft className="w-4 h-4" />



                            <span>Volver a Categorías</span>



                          </button>



                          <span className="text-[10px] font-mono text-[#8fa3bd]">



                            {catActiveCount} de {cat.layers.length} activas



                          </span>



                        </div>







                        {/* Category Banner */}



                        <div className="p-3 rounded-xl bg-[#101626] border border-[#24344d] flex items-center gap-3">



                          <div



                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"



                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}



                          >



                            <CatIcon className="w-4 h-4" />



                          </div>



                          <div className="min-w-0">



                            <h3 className="text-xs font-bold text-white tracking-wide">



                              {cat.title}



                            </h3>



                            <p className="text-[10px] text-[#8fa3bd] truncate">



                              {cat.description}



                            </p>



                          </div>



                        </div>







                        {/* Sub-layers List */}



                        <div className="space-y-1.5">



                          {cat.layers.map((layer) => {



                            const isEnabled = !!activeLayers[layer.id];



                            return (



                              <div



                                key={layer.id}



                                onClick={() => onToggleLayer(layer.id, !isEnabled)}



                                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${



                                  isEnabled



                                    ? 'bg-[#101626] border-[#35445b] shadow-sm'



                                    : 'bg-[#080e19] border-[#1c2940] hover:border-[#24344d] opacity-75'



                                }`}



                              >



                                <div className="flex items-center gap-2.5 min-w-0">



                                  <span



                                    className="w-2.5 h-2.5 rounded-full shrink-0"



                                    style={{ backgroundColor: layer.color }}



                                  />



                                  <div className="truncate">



                                    <div className="text-xs font-semibold text-white">



                                      {layer.label}



                                    </div>



                                    <div className="text-[10px] text-[#8fa3bd]">



                                      {layer.desc}



                                    </div>



                                  </div>



                                </div>







                                <div



                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ml-2 ${



                                    isEnabled



                                      ? 'bg-[#35c3c8] border-[#35c3c8] text-[#06141c]'



                                      : 'border-[#35445b] bg-transparent'



                                  }`}



                                >



                                  {isEnabled && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}



                                </div>



                              </div>



                            );



                          })}



                        </div>



                      </div>



                    );



                  })()



                ) : (



                  /* TOP LEVEL: PRESETS & 10 CATEGORIES */



                  <>



                    {/* Focus Mode Presets Bar */}



                    <div className="space-y-1.5">



                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8fa3bd] uppercase">



                        <span>Modos de Enfoque Rápido</span>



                        <button



                          onClick={handleClearAllThematicLayers}



                          className="hover:text-white flex items-center gap-1 transition-colors"



                          title="Desactivar todas las capas temáticas"



                        >



                          <RotateCcw className="w-2.5 h-2.5" />



                          <span>LIMPIAR</span>



                        </button>



                      </div>







                      <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">



                        {FOCUS_PRESETS.map((p) => {



                          const PkgIcon = p.icon;



                          const isFullyActive = p.layers.every((l) => !!activeLayers[l]);







                          return (



                            <button



                              key={p.id}



                              onClick={() => handleApplyPreset(p.layers)}



                              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-all ${



                                isFullyActive



                                  ? 'bg-[#101626] border-[#35c3c8] text-white shadow-sm'



                                  : 'bg-[#080e19] border-[#1c2940] text-[#8fa3bd] hover:text-white hover:border-[#24344d]'



                              }`}



                            >



                              <PkgIcon className="w-3 h-3" style={{ color: p.color }} />



                              <span>{p.name}</span>



                            </button>



                          );



                        })}



                      </div>



                    </div>







                    {/* Windy-Style Quick Environment Tiles */}



                    <div className="space-y-1.5 pt-1">



                      <div className="text-[10px] font-mono text-[#8fa3bd] uppercase">



                        Atmósfera y Océano (Estilo Windy)



                      </div>



                      <div className="grid grid-cols-4 gap-1.5">



                        {[



                          { id: 'wind_particles', name: 'Viento', icon: Wind, color: '#58d5e3' },



                          { id: 'atmosphere_temp', name: 'Temp', icon: Thermometer, color: '#ffa726' },



                          { id: 'cloud_cover', name: 'Nubes', icon: Cloud, color: '#b0bec5' },



                          { id: 'ocean_currents', name: 'Corrientes', icon: Waves, color: '#38bdf8' },



                        ].map((tile) => {



                          const TileIcon = tile.icon;



                          const isEnabled = !!activeLayers[tile.id];







                          return (



                            <button



                              key={tile.id}



                              onClick={() => onToggleLayer(tile.id, !isEnabled)}



                              className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${



                                isEnabled



                                  ? 'bg-[#101626] border-[#35c3c8] text-white'



                                  : 'bg-[#080e19] border-[#1c2940] text-[#8fa3bd] hover:text-white hover:border-[#24344d]'



                              }`}



                            >



                              <TileIcon className="w-3.5 h-3.5" style={{ color: tile.color }} />



                              <span className="text-[10px] font-semibold truncate">{tile.name}</span>



                            </button>



                          );



                        })}



                      </div>



                    </div>







                    {/* 10 First-Level Categories (Click to Drill-Down) */}



                    <div className="space-y-1.5 pt-2">



                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8fa3bd] uppercase">



                        <span>10 Dominios Cartográficos</span>



                        <span className="text-[#35c3c8]">V5 DRILL-DOWN</span>



                      </div>







                      <div className="space-y-1.5">



                        {CATEGORIES.map((cat) => {



                          const CatIcon = cat.icon;



                          const catActiveCount = cat.layers.filter((l) => !!activeLayers[l.id]).length;







                          return (



                            <div



                              key={cat.id}



                              onClick={() => setSelectedCategory(cat.id)}



                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${



                                catActiveCount > 0



                                  ? 'bg-[#101626] border-[#24344d] hover:border-[#35c3c8]/50 shadow-sm'



                                  : 'bg-[#080e19] border-[#1c2940] hover:border-[#24344d]'



                              }`}



                            >



                              <div className="flex items-center gap-2.5 min-w-0">



                                <div



                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"



                                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}



                                >



                                  <CatIcon className="w-3.5 h-3.5" />



                                </div>



                                <div className="truncate">



                                  <div className="text-xs font-semibold text-white group-hover:text-[#35c3c8] transition-colors">



                                    {cat.title}



                                  </div>



                                  <div className="text-[10px] text-[#8fa3bd] truncate">



                                    {cat.description}



                                  </div>



                                </div>



                              </div>







                              <div className="flex items-center gap-1.5 shrink-0 ml-2">



                                {catActiveCount > 0 ? (



                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#35c3c8]/20 text-[#35c3c8] font-bold">



                                    {catActiveCount}



                                  </span>



                                ) : (



                                  <span className="text-[10px] font-mono text-[#8fa3bd]">



                                    {cat.layers.length}



                                  </span>



                                )}



                                <ChevronRight className="w-3.5 h-3.5 text-[#8fa3bd] group-hover:text-white transition-colors" />



                              </div>



                            </div>



                          );



                        })}



                      </div>



                    </div>



                  </>



                )}



              </div>



            )}











                    </div>



                  </details>



                )}



              </div>



            )}







            {/* TAB: EXPEDITION (NG-LEX 2027-2028 Proposal) */}



            {currentTab === 'EXPEDITION' && (



              <ExpeditionTab



                onMilestoneClick={(m: Milestone) => {



                  onFlyTo([m.coordinates[0], m.coordinates[1]], 8);



                  m.layers_to_activate?.forEach((l) => onToggleLayer(l, true));



                }}



                onShowRoute={() => {



                  onFlyTo([-64.0, -60.0], 4.5);



                }}



              />



            )}







            {/* TAB: SEARCH (Instant Search across fleet, stations, species) */}



            {currentTab === 'SEARCH' && (



              <div className="space-y-3">



                <div className="relative">



                  <Search className="w-4 h-4 text-[#8fa3bd] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />



                  <input



                    type="text"



                    value={searchQuery}



                    onChange={(e) => setSearchQuery(e.target.value)}



                    placeholder="Buscar buque, vuelo, satélite..."



                    className="w-full bg-[#101626] border border-[#24344d] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8fa3bd] focus:outline-none focus:border-[#35c3c8] transition-colors"



                  />



                </div>







                {searchQuery.trim() === '' ? (



                  <div className="p-4 rounded-xl bg-[#101626]/50 border border-[#1c2940] text-center text-[#8fa3bd] space-y-1">



                    <p className="text-xs">Escribe para buscar</p>



                    <p className="text-[10px]">Buques AIS, vuelos ADS-B, satélites SGP4, bases</p>



                  </div>



                ) : searchResults.length === 0 ? (



                  <div className="p-4 rounded-xl bg-[#101626]/50 border border-[#1c2940] text-center text-[#8fa3bd]">



                    <p className="text-xs">No se encontraron resultados</p>



                  </div>



                ) : (



                  <div className="space-y-1.5">



                    {searchResults.map((res) => (



                      <button



                        key={res.id}



                        onClick={() => {



                          onSelectEntity(res);



                          if (res.coordinates) onFlyTo(res.coordinates, 6);



                        }}



                        className="w-full p-2.5 rounded-xl bg-[#101626] border border-[#1c2940] hover:border-[#35c3c8]/50 transition-all text-left flex items-center justify-between group"



                      >



                        <div className="truncate">



                          <div className="text-xs font-semibold text-white group-hover:text-[#35c3c8] transition-colors truncate">



                            {res.title}



                          </div>



                          <div className="text-[10px] text-[#8fa3bd] truncate">



                            {res.subtitle}



                          </div>



                        </div>



                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1c2940] text-[#72e0b5] ml-2 shrink-0">



                          {res.type}



                        </span>



                      </button>



                    ))}



                  </div>



                )}



              </div>



            )}







            {/* TAB: SAVED (Spatial Views & Bookmarks) */}



            {currentTab === 'SAVED' && (



              <div className="space-y-3">



                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8fa3bd]">



                  Vistas Espaciales Guardadas



                </div>







                <div className="space-y-2">



                  {savedViews.map((view) => (



                    <button



                      key={view.id}



                      onClick={() => onSelectSavedView(view)}



                      className="w-full p-3 rounded-xl bg-[#101626] border border-[#1c2940] hover:border-[#72e0b5]/50 transition-all text-left space-y-1 group"



                    >



                      <div className="flex items-center justify-between">



                        <span className="text-xs font-bold text-white group-hover:text-[#72e0b5] transition-colors">



                          {view.name}



                        </span>



                        <span className="text-[10px] font-mono text-[#35c3c8]">



                          {view.mode}



                        </span>



                      </div>



                      <p className="text-[11px] text-[#8fa3bd] leading-tight">



                        {view.description}



                      </p>



                      <div className="text-[9px] font-mono text-[#58d5e3] pt-1">



                        {view.latitude.toFixed(1)}°S · {view.longitude.toFixed(1)}°W · Zoom {view.zoom}



                      </div>



                    </button>



                  ))}



                </div>



              </div>



            )}



          </>



        )}



      </div>



    </aside>



  );



}
