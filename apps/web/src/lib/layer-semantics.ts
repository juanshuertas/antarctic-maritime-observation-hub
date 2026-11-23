/**
 * AMOH V11 — Master Layer Semantics, Agency Logos & Scientific Logic Catalog
 * Estructura declarativa exhaustiva que asocia a cada dato:
 * 1. Logotipo oficial del ODS de la ONU (/sdg-icons/[1-17].png)
 * 2. Logotipo e identidad institucional de la Agencia Proveedora (GFW, SCAR, COMNAP, ATS, etc.)
 * 3. ¿Qué es este dato? (Definición científica/técnica del fenómeno observado)
 * 4. ¿Para qué sirve? (Impacto operativo, geopolítico y de conservación polar)
 * 5. Lógica de representación gráfica (Color ODS, grosor, gradiente y simbología)
 * 6. Ficha técnica (Sensor, resolución, frecuencia, proyección original, licencia)
 */

import { SDG_COLORS } from './sdg-registry';

export interface AgencyInfo {
  code: string;
  name: string;
  shortName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  website: string;
  headquarters: string;
}

export const AGENCIES: Record<string, AgencyInfo> = {
  GFW: {
    code: 'GFW',
    name: 'Global Fishing Watch',
    shortName: 'Global Fishing Watch',
    badgeBg: '#3b1016',
    badgeText: '#ff4d6d',
    badgeBorder: '#ff4d6d60',
    website: 'https://globalfishingwatch.org',
    headquarters: 'Washington, D.C. / Global',
  },
  SCAR: {
    code: 'SCAR',
    name: 'Scientific Committee on Antarctic Research',
    shortName: 'SCAR / NPI Quantarctica',
    badgeBg: '#08253a',
    badgeText: '#38bdf8',
    badgeBorder: '#38bdf860',
    website: 'https://www.scar.org',
    headquarters: 'Cambridge, Reino Unido',
  },
  COMNAP: {
    code: 'COMNAP',
    name: 'Council of Managers of National Antarctic Programs',
    shortName: 'COMNAP',
    badgeBg: '#0d2822',
    badgeText: '#34d399',
    badgeBorder: '#34d39960',
    website: 'https://www.comnap.aq',
    headquarters: 'Christchurch, Nueva Zelanda',
  },
  ATS: {
    code: 'ATS',
    name: 'Secretaría del Tratado Antártico (Secretariat of the Antarctic Treaty)',
    shortName: 'Tratado Antártico / CEP',
    badgeBg: '#1e1b4b',
    badgeText: '#a78bfa',
    badgeBorder: '#a78bfa60',
    website: 'https://www.ats.aq',
    headquarters: 'Buenos Aires, Argentina',
  },
  CCAMLR: {
    code: 'CCAMLR',
    name: 'Comisión para la Conservación de los Recursos Vivos Marinos Antárticos',
    shortName: 'CCAMLR',
    badgeBg: '#092e40',
    badgeText: '#00e5ff',
    badgeBorder: '#00e5ff60',
    website: 'https://www.ccamlr.org',
    headquarters: 'Hobart, Tasmania, Australia',
  },
  NASA: {
    code: 'NASA',
    name: 'National Aeronautics and Space Administration (MEaSUREs / PGC)',
    shortName: 'NASA MEaSUREs',
    badgeBg: '#111c44',
    badgeText: '#60a5fa',
    badgeBorder: '#60a5fa60',
    website: 'https://earthdata.nasa.gov',
    headquarters: 'Washington, D.C., EE.UU.',
  },
  CMEMS: {
    code: 'CMEMS',
    name: 'Copernicus Marine Service (Mercator Ocean International / Comision Europea)',
    shortName: 'Copernicus Marine',
    badgeBg: '#0b2436',
    badgeText: '#49b6c8',
    badgeBorder: '#49b6c860',
    website: 'https://marine.copernicus.eu',
    headquarters: 'Tolosa, Francia',
  },
  CAMS: {
    code: 'CAMS',
    name: 'Copernicus Atmosphere Monitoring Service (CAMS / ESA / ECMWF)',
    shortName: 'Copernicus CAMS',
    badgeBg: '#13283b',
    badgeText: '#38bdf8',
    badgeBorder: '#38bdf860',
    website: 'https://atmosphere.copernicus.eu',
    headquarters: 'Bonn, Alemania / Reading, Reino Unido',
  },
  ARGO: {
    code: 'ARGO',
    name: 'Argo Global Data Assembly Centre / SOOS',
    shortName: 'Argo GDAC',
    badgeBg: '#032644',
    badgeText: '#22d3ee',
    badgeBorder: '#22d3ee60',
    website: 'https://argo.ucsd.edu',
    headquarters: 'Brest, Francia / UCSD, EE.UU.',
  },
  USGS: {
    code: 'USGS',
    name: 'United States Geological Survey — Earthquake Hazards Program',
    shortName: 'USGS FDSN',
    badgeBg: '#361515',
    badgeText: '#f87171',
    badgeBorder: '#f8717160',
    website: 'https://earthquake.usgs.gov',
    headquarters: 'Reston, Virginia, EE.UU.',
  },
  NORAD: {
    code: 'NORAD',
    name: 'North American Aerospace Defense Command / CelesTrak',
    shortName: 'NORAD / CelesTrak',
    badgeBg: '#27123d',
    badgeText: '#c084fc',
    badgeBorder: '#c084fc60',
    website: 'https://celestrak.org',
    headquarters: 'Peterson SFB, Colorado, EE.UU.',
  },
  IAATO: {
    code: 'IAATO',
    name: 'International Association of Antarctica Tour Operators',
    shortName: 'IAATO',
    badgeBg: '#2d2508',
    badgeText: '#fbbf24',
    badgeBorder: '#fbbf2460',
    website: 'https://iaato.org',
    headquarters: 'Newport, Rhode Island, EE.UU.',
  },
  OBIS: {
    code: 'OBIS',
    name: 'Ocean Biodiversity Information System / SCAR-MarBIN',
    shortName: 'OBIS-SEAMAP',
    badgeBg: '#13281d',
    badgeText: '#4ade80',
    badgeBorder: '#4ade8060',
    website: 'https://obis.org',
    headquarters: 'Oostende, Bélgica (UNESCO-IOC)',
  },
  NOAA: {
    code: 'NOAA',
    name: 'National Oceanic and Atmospheric Administration / NSIDC',
    shortName: 'NOAA / NSIDC',
    badgeBg: '#07243b',
    badgeText: '#38bdf8',
    badgeBorder: '#38bdf860',
    website: 'https://nsidc.org',
    headquarters: 'Boulder, Colorado, EE.UU.',
  },
  TELEGEOGRAPHY: {
    code: 'TELEGEOGRAPHY',
    name: 'TeleGeography Submarine Cable Registry / ITU SMART',
    shortName: 'TeleGeography / ITU',
    badgeBg: '#2c2207',
    badgeText: '#fcd34d',
    badgeBorder: '#fcd34d60',
    website: 'https://www.submarinecablemap.com',
    headquarters: 'Washington, D.C., EE.UU.',
  },
  IAEA: {
    code: 'IAEA',
    name: 'International Atomic Energy Agency — Marine Information System',
    shortName: 'IAEA MARIS',
    badgeBg: '#1e1b4b',
    badgeText: '#818cf8',
    badgeBorder: '#818cf860',
    website: 'https://maris.iaea.org',
    headquarters: 'Mónaco / Viena, Austria',
  },
  AMOH: {
    code: 'AMOH',
    name: 'Antarctic Maritime Observation Hub — Expeditions Network',
    shortName: 'AMOH Red Propia',
    badgeBg: '#03202e',
    badgeText: '#00f0ff',
    badgeBorder: '#00f0ff60',
    website: 'http://localhost:5174',
    headquarters: 'Punta Arenas / Estrecho de Magallanes',
  },
  CTBTO: {
    code: 'CTBTO',
    name: 'Comprehensive Nuclear-Test-Ban Treaty Organization — IMS Hydroacoustics',
    shortName: 'CTBTO IMS',
    badgeBg: '#311019',
    badgeText: '#f43f5e',
    badgeBorder: '#f43f5e60',
    website: 'https://www.ctbto.org',
    headquarters: 'Viena, Austria',
  },
};

export interface LayerSemanticMetadata {
  id: string;
  name: string;
  category: string;
  sdg: number;
  sdgColor: string;
  sdgTitle: string;
  sdgIconUrl: string;
  agency: AgencyInfo;
  whatIsIt: string;
  purpose: string;
  visualLogic: string;
  techSpecs: {
    sensorOrMethod: string;
    temporalResolution: string;
    spatialCoverage: string;
    format: string;
    originalCrs: string;
    sourceEndpoint: string;
    license: string;
  };
}

export const LAYER_SEMANTICS: Record<string, LayerSemanticMetadata> = {
  // -------------------------------------------------------------
  // 0. ATMÓSFERA & CLIMATOLOGÍA (ODS 13: Acción por el Clima)
  // -------------------------------------------------------------
  ozone_layer: {
    id: 'ozone_layer',
    name: 'Capa de Ozono Antártica (Sentinel-5P / CAMS)',
    category: 'ATMÓSFERA & CLIMATOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    sdgTitle: 'ODS 13: Acción por el Clima',
    sdgIconUrl: '/sdg-icons/13.png',
    agency: AGENCIES.CAMS,
    whatIsIt:
      'Columna total de ozono atmosférico sobre el continente blanco y el Océano Austral medida en Unidades Dobson (DU) mediante el espectrómetro TROPOMI a bordo del satélite Copernicus Sentinel-5P y NASA OMPS. Delimita con precisión el vórtice polar y la extensión del agujero de ozono (< 220 DU).',
    purpose:
      'Supervisión crítica del cumplimiento del Protocolo de Montreal, dinámica del vórtice polar estratosférico y radiación ultravioleta UV-B incidente sobre la biota marina antártica (fitoplancton y kril).',
    visualLogic:
      'Gradiente colorimétrico WMO/NASA desde violeta profundo (< 140 DU) y azul (140-180 DU) hasta cian (180-220 DU), delimitando con contorno brillante el límite de 220 DU.',
    techSpecs: {
      sensorOrMethod: 'Copernicus Sentinel-5P TROPOMI (Tropospheric Monitoring Instrument) y NASA OMPS',
      temporalResolution: 'Diaria en tiempo cuasi-real (NRT)',
      spatialCoverage: 'Circumpolar Antártica (50°S a 90°S)',
      format: 'GeoJSON / MultiPolygon con atributos de DU e isolíneas',
      originalCrs: 'WGS 84 / EPSG:4326',
      sourceEndpoint: '/data/web/geojson/antarctic_ozone.geojson',
      license: 'Copernicus Open Access / NASA Open Data',
    },
  },

  // -------------------------------------------------------------
  // 1. CRIÓSFERA & GLACIOLOGÍA (ODS 13: Acción por el Clima)
  // -------------------------------------------------------------
  quantarctica_coastline: {
    id: 'quantarctica_coastline',
    name: 'Línea de Costa Oficial SCAR ADD',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    sdgTitle: 'ODS 13: Acción por el Clima',
    sdgIconUrl: '/sdg-icons/13.png',
    agency: AGENCIES.SCAR,
    whatIsIt:
      'Delineación vectorial de alta precisión del límite físico entre la roca/hielo continental y el Océano Austral. Producida por el Antarctic Digital Database (ADD) del Comité Científico de Investigación Antártica (SCAR).',
    purpose:
      'Sirve como marco de referencia geodésico primario para todo análisis cartográfico, cálculo de retroceso costero y delimitación de soberanía científica bajo el Tratado Antártico.',
    visualLogic:
      'Trazo continuo verde bosque (#3F7E44, ODS 13) con grosor de 1.5px. Representa la estabilidad y monitorización climática del manto de hielo.',
    techSpecs: {
      sensorOrMethod: 'Compilación satelital multiespectral (Landsat 8, Sentinel-2) y radar altimétrico',
      temporalResolution: 'Actualización bianual (Versión actual: ADD v7.4)',
      spatialCoverage: 'Circumpolar Antártica (60°S a 90°S)',
      format: 'GeoJSON (reproyectado de Shapefile)',
      originalCrs: 'EPSG:3031 (WGS 84 Antarctic Polar Stereographic)',
      sourceEndpoint: '/data/web/geojson/coastline.geojson',
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    },
  },

  quantarctica_ice_shelf: {
    id: 'quantarctica_ice_shelf',
    name: 'Plataformas de Hielo Flotante (Ice Shelves)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    sdgTitle: 'ODS 13: Acción por el Clima',
    sdgIconUrl: '/sdg-icons/13.png',
    agency: AGENCIES.SCAR,
    whatIsIt:
      'Polígonos que delimitan las inmensas plataformas glaciares flotantes que se extienden desde el continente hacia el mar (como Ross, Ronne-Filchner, Larsen C y Amery).',
    purpose:
      'Crucial para monitorear el efecto de contrafuerte ("buttressing effect") que frena la descarga de glaciares terrestres hacia el océano, detectando riesgo de colapsos estructurales por calentamiento subglacial.',
    visualLogic:
      'Relleno semitransparente verde claro (#3F7E44 con opacidad 25%) y contorno marcado. Evita ocultar la batimetría subyacente.',
    techSpecs: {
      sensorOrMethod: 'Imágenes satelitales ópticas y radar MODIS/RADARSAT',
      temporalResolution: 'Decenal con revisiones post-desprendimientos mayores',
      spatialCoverage: 'Perímetro continental antártico',
      format: 'GeoJSON Polígonos',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/ice_shelf.geojson',
      license: 'SCAR / British Antarctic Survey Open Data',
    },
  },

  quantarctica_gebco: {
    id: 'quantarctica_gebco',
    name: 'Batimetría Oceánica GEBCO / IBCSO v2',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.NOAA,
    whatIsIt:
      'Malla batimétrica digital continua del relieve del fondo marino polar del Océano Austral, compilada por la Carta Batimétrica Internacional del Océano Austral (IBCSO).',
    purpose:
      'Fundamental para modelar el transporte de agua cálida profunda circumpolar hacia las cavidades subglaciares, calcular rutas seguras de navegación para rompehielos y mapear cañones submarinos.',
    visualLogic:
      'Mosaico ráster Cloud Optimized GeoTIFF (COG) con rampa hipsométrica azul marino (#0A97D9). Permite lectura instantánea de profundidad.',
    techSpecs: {
      sensorOrMethod: 'Ecosondas multihaz de buques polares + gravimetría satelital altimétrica',
      temporalResolution: 'Edición IBCSO v2 / GEBCO 2023',
      spatialCoverage: '50°S a 90°S a 500m de resolución de celda',
      format: 'Cloud Optimized GeoTIFF (COG) en mosaicos WebGL',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/cog/gebco_2023.tif',
      license: 'GEBCO / IHO-IOC Open Data',
    },
  },

  quantarctica_rema: {
    id: 'quantarctica_rema',
    name: 'Modelo de Elevación Digital REMA (DEM)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    sdgTitle: 'ODS 13: Acción por el Clima',
    sdgIconUrl: '/sdg-icons/13.png',
    agency: AGENCIES.NASA,
    whatIsIt:
      'Reference Elevation Model of Antarctica (REMA): mapa topográfico en 3D de alta resolución de la superficie de hielo y roca del continente polar.',
    purpose:
      'Permite calcular pendientes para logística aérea y terrestre de travesías científicas, modelar la dinámica de flujo del hielo y calibrar altímetros satelitales.',
    visualLogic:
      'Ráster de sombreado de relieve en escala monocromática de alta reflectancia (#f0f9ff), acentuando grietas, nunataks y divisorias de hielo.',
    techSpecs: {
      sensorOrMethod: 'Estereofotogrametría satelital de altísima resolución (WorldView-1/2/3)',
      temporalResolution: 'Compilación multitemporal PGC (Polar Geospatial Center)',
      spatialCoverage: '98% del continente antártico a 8m/100m res',
      format: 'Cloud Optimized GeoTIFF (COG)',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/cog/rema_dem.tif',
      license: 'Polar Geospatial Center Open Access',
    },
  },

  quantarctica_ice_velocity: {
    id: 'quantarctica_ice_velocity',
    name: 'Velocidad de Flujo Glaciar (MEaSUREs InSAR)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    sdgTitle: 'ODS 13: Acción por el Clima',
    sdgIconUrl: '/sdg-icons/13.png',
    agency: AGENCIES.NASA,
    whatIsIt:
      'Campo vectorial de velocidades de desplazamiento del manto de hielo hacia el océano en metros por año (m/año), derivado de radar interferométrico satelital.',
    purpose:
      'Detecta de forma inmediata qué corrientes glaciares (ice streams) como Thwaites o Pine Island se están acelerando, siendo el indicador más crítico del balance de masa antártico.',
    visualLogic:
      'Gradiente termográfico de velocidad: de cian translúcido (0-10 m/año) a magenta y rojo intenso (>1,000 m/año en frentes de descarga).',
    techSpecs: {
      sensorOrMethod: 'InSAR satelital (ALOS PALSAR, Envisat ASAR, ERS-1/2, RADARSAT)',
      temporalResolution: 'Serie temporal MEaSUREs v2 NASA JPL',
      spatialCoverage: 'Continental completo a 450m',
      format: 'Cloud Optimized GeoTIFF (COG) 298.8 MB',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/cog/ice_velocity.tif',
      license: 'NASA Earthdata Open Access',
    },
  },

  quantarctica_grounding_line: {
    id: 'quantarctica_grounding_line',
    name: 'Línea de Apoyo ASAID (Grounding Line)',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    sdgTitle: 'ODS 13: Acción por el Clima',
    sdgIconUrl: '/sdg-icons/13.png',
    agency: AGENCIES.NASA,
    whatIsIt:
      'Línea de transición exacta donde el glaciar anclado al lecho rocoso continental comienza a flotar libremente sobre el agua oceánica.',
    purpose:
      'El retroceso hacia el interior de esta línea es la señal inequívoca de desestabilización marina del manto de hielo de la Antártida Occidental (WAIS).',
    visualLogic:
      'Línea discontinua luminosa en cian polar (#00e5ff) con patrón [2, 1], indicando frontera crítica tierra-mar subglacial.',
    techSpecs: {
      sensorOrMethod: 'Altimetría láser ICESat y radar interferométrico diferencial',
      temporalResolution: 'ASAID NASA Project Compilation',
      spatialCoverage: 'Todo el perímetro continental anclado',
      format: 'GeoJSON LineString (2,099 features)',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/grounding_line.geojson',
      license: 'NASA Goddard Space Flight Center',
    },
  },

  glaciers: {
    id: 'glaciers',
    name: 'Glaciares Principales y Cuencas Hidrológicas',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    sdgTitle: 'ODS 13: Acción por el Clima',
    sdgIconUrl: '/sdg-icons/13.png',
    agency: AGENCIES.SCAR,
    whatIsIt:
      'Cartografía vectorial de las mayores cuencas glaciarias y corrientes de hielo tributarias que drenan el casquete polar.',
    purpose:
      'Permite atribuir las pérdidas de volumen de hielo registradas por satélites gravimétricos GRACE a cuencas hidrográficas específicas.',
    visualLogic:
      'Líneas estructurales verde menta (#3F7E44) de 2.2px con delineación de cuenca de captación.',
    techSpecs: {
      sensorOrMethod: 'Mapeo glaciológico SCAR Quantarctica v3',
      temporalResolution: 'Estándar geológico',
      spatialCoverage: 'Cuencas principales continentales',
      format: 'GeoJSON Polylines',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/glaciers.geojson',
      license: 'SCAR Open Data',
    },
  },

  sea_ice_concentration: {
    id: 'sea_ice_concentration',
    name: 'Concentración de Hielo Marino Circumpolar',
    category: 'CRIÓSFERA & GLACIOLOGÍA',
    sdg: 13,
    sdgColor: SDG_COLORS[13],
    sdgTitle: 'ODS 13: Acción por el Clima',
    sdgIconUrl: '/sdg-icons/13.png',
    agency: AGENCIES.NOAA,
    whatIsIt:
      'Fracción de superficie oceánica cubierta por banquisa polar (0% a 100%), calculada a partir de radiómetros de microondas pasivas satelitales.',
    purpose:
      'Vital para planificar la navegación de expediciones marítimas, evaluar el hábitat del krill y monitorear el mínimo récord histórico de hielo marino antártico.',
    visualLogic:
      'Ráster azul translúcido con gradiente de opacidad proporcional al porcentaje de cobertura de hielo.',
    techSpecs: {
      sensorOrMethod: 'Radiometría de microondas pasivas SSMIS / AMSR2',
      temporalResolution: 'Climatología mensual y compuestos diarios NSIDC',
      spatialCoverage: 'Océano Austral completo (50°S - 85°S)',
      format: 'Cloud Optimized GeoTIFF (COG)',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/cog/sea_ice.tif',
      license: 'NOAA / NSIDC Public Domain',
    },
  },

  // -------------------------------------------------------------
  // 2. OCEANOGRAFÍA & FÍSICA (ODS 14: Vida Submarina)
  // -------------------------------------------------------------
  // Sustituye a 'ocean_currents' (retirada el 2026-11-03): aquella capa eran 3
  // polilineas dibujadas a mano con velocidad y transporte inventados, pero
  // declaraba "GLORYS12 + boyas drifter" como metodo. Esta es el subset real.
  copernicus_currents_peninsula: {
    id: 'copernicus_currents_peninsula',
    name: 'Corrientes superficiales medidas — Península (CMEMS)',
    category: 'OCEANOGRAFÍA & FÍSICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.CMEMS,
    whatIsIt:
      'Componentes este y norte de la velocidad superficial (uo, vo) del analisis global de Copernicus Marine, recortadas a la Peninsula Antartica y el Paso de Drake (70–55 O / 68–54 S) y submuestreadas a 1 de cada 4 celdas: 1.719 vectores del nivel de 0,49 m.',
    purpose:
      'La rama norte de la Corriente Circumpolar Antartica atraviesa el Paso de Drake, y es la via por la que el agua, el krill y los tempanos entran y salen de la Peninsula. Esta capa da la rapidez y el rumbo reales del dia, no un esquema del flujo medio.',
    visualLogic:
      'Circulos con radio proporcional a la raiz de la rapidez (el area es lo que se compara a ojo) y rampa secuencial verde a amarillo. El simbolo codifica SOLO la rapidez: el rumbo esta en la propiedad `d` y se lee en el popup, porque un circulo no puede mostrar direccion sin mentir sobre ella.',
    techSpecs: {
      sensorOrMethod: 'Analisis del modelo global GLOBAL_ANALYSISFORECAST_PHY_001_024 (cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m) — es un MODELO, no una medicion in situ ni satelital',
      temporalResolution: 'Media diaria; la capa publica un solo dia (2026-11-03)',
      spatialCoverage: 'Peninsula Antartica y Paso de Drake (70–55 O / 68–54 S)',
      format: 'GeoJSON de puntos derivado de NetCDF',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/copernicus_currents_peninsula.geojson',
      license: 'Copernicus Marine — acceso abierto, citar la fuente',
    },
  },

  salinity: {
    id: 'salinity',
    name: 'Salinidad Oceánica Superficial (WOA13)',
    category: 'OCEANOGRAFÍA & FÍSICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.NOAA,
    whatIsIt:
      'Concentración de sales disueltas en gramos por kilogramo de agua de mar (PSU) en la capa superficial polar.',
    purpose:
      'El agua dulce del derretimiento de glaciares disminuye la salinidad superficial, inhibiendo la formación del "Agua de Fondo Antártica" (AABW), motor de la circulación termohalina global.',
    visualLogic:
      'Ráster en gradiente oceánico de esmeralda a azul ultramar con opacidad del 60%.',
    techSpecs: {
      sensorOrMethod: 'Base de datos histórica World Ocean Atlas (WOA13) NOAA / NCEI',
      temporalResolution: 'Climatología multidecenal',
      spatialCoverage: 'Circumpolar a 0.25° de resolución',
      format: 'Cloud Optimized GeoTIFF (COG)',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/cog/salinity.tif',
      license: 'NOAA NCEI Public Domain',
    },
  },

  argo_floats: {
    id: 'argo_floats',
    name: 'Flotadores Perfiladores Autónomos Argo GDAC',
    category: 'OCEANOGRAFÍA & FÍSICA',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.ARGO,
    whatIsIt:
      'Red de boyas robóticas perfiladoras sumergibles que descienden cíclicamente hasta 2,000 metros de profundidad, midiendo temperatura, salinidad y oxígeno antes de transmitir vía satélite.',
    purpose:
      'Proporciona la única serie de datos físicos en tiempo real de la columna de agua bajo el hielo invernal y en mares remotos del Océano Austral.',
    visualLogic:
      'Puntos circulares azul cian (#0A97D9, ODS 14) con borde blanco reflectante y radio proporcional a la profundidad máxima alcanzada.',
    techSpecs: {
      sensorOrMethod: 'Sensores CTD de alta precisión con satélite Iridium',
      temporalResolution: 'Ciclos de ascenso de 10 días, refresco en vivo vía FastAPI',
      spatialCoverage: '120 estaciones activas en sectores Ross, Weddell, Amundsen y Drake',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:4326 (WGS 84)',
      sourceEndpoint: 'http://localhost:8000/api/argo/floats',
      license: 'Argo International Open Data (WMO/IOC)',
    },
  },

  // -------------------------------------------------------------
  // 3. ACTIVIDAD MARÍTIMA & PESCA (GFW) (ODS 14: Vida Submarina)
  // -------------------------------------------------------------
  gfw_fishing_effort: {
    id: 'gfw_fishing_effort',
    name: 'Esfuerzo Pesquero Aparente Global Fishing Watch',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.GFW,
    whatIsIt:
      'Horas acumuladas de actividad pesquera aparente por celda espacial, identificadas mediante redes neuronales convolucionales sobre trayectorias AIS y VMS de barcos pesqueros.',
    purpose:
      'Supervisa la presión extractiva de krill y merluza negra en las divisiones estadísticas de CCAMLR, verificando que no se pesque en Áreas Marinas Protegidas ni fuera de temporada autorizada.',
    visualLogic:
      'Círculos rojos brillantes (#ff4d4d) con borde blanco, cuyo radio escala con las horas de faena pesquera acumuladas.',
    techSpecs: {
      sensorOrMethod: 'Recepción satelital AIS (Spire / Orbcomm) + inferencia IA GFW 4Wings',
      temporalResolution: 'Compilado continuo y series horarias',
      spatialCoverage: 'Todos los sectores marítimos australes (Áreas CCAMLR 48, 58, 88)',
      format: 'GeoJSON FeatureCollection (38 polígonos/puntos con metadatos de flota y bandera)',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: 'http://localhost:8000/api/gfw/fishing-effort',
      license: 'Global Fishing Watch Open Data License (CC BY-SA 4.0)',
    },
  },

  gfw_sar_detections: {
    id: 'gfw_sar_detections',
    name: 'Detecciones Satelitales Radar SAR (Buques Oscuros)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.GFW,
    whatIsIt:
      'Reflectores metálicos de buques en el mar detectados por Radar de Apertura Sintética (SAR) de Sentinel-1 que NO emitían señal AIS correspondiente ("flota oscura").',
    purpose:
      'Herramienta reina contra la pesca ilegal, no declarada y no reglamentada (INDNR) en aguas antárticas protegidas.',
    visualLogic:
      'Puntos amarillos radar (#ffaa00) con doble aro de impacto y pulso de alerta visual.',
    techSpecs: {
      sensorOrMethod: 'Copernicus Sentinel-1 C-SAR Interferometric Wide Swath',
      temporalResolution: 'Pasadas orbitales cada 6-12 días',
      spatialCoverage: 'Pasaje de Drake, Estrecho de Bransfield y Mar de Ross',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: 'http://localhost:8000/api/gfw/sar-detections',
      license: 'Global Fishing Watch / ESA Copernicus Open Access',
    },
  },

  gfw_encounters: {
    id: 'gfw_encounters',
    name: 'Encuentros y Transbordos en Alta Mar (GFW)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.GFW,
    whatIsIt:
      'Eventos en los que dos buques (generalmente un pesquero y un buque frigorífico reefer o tanquero) se mantienen a menos de 500 metros a baja velocidad por más de 2 horas en alta mar.',
    purpose:
      'Auditoría de transbordos de captura pesquera y aprovisionamiento de combustible (bunkering), facilitando la trazabilidad de la cadena de custodia marina.',
    visualLogic:
      'Círculos magenta (#e040fb) con anillo exterior blanco y tooltip interactivo de buques involucrados.',
    techSpecs: {
      sensorOrMethod: 'Algoritmo de proximidad espaciotemporal GFW Encounters API',
      temporalResolution: 'Eventos históricos y alertas recientes',
      spatialCoverage: 'Aguas circumpolares fuera de ZEE nacionales',
      format: 'GeoJSON Point con propiedades pareadas (vessel_1, vessel_2)',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: 'http://localhost:8000/api/gfw/encounters',
      license: 'GFW Research Partner Open Data',
    },
  },

  gfw_vessel_presence: {
    id: 'gfw_vessel_presence',
    name: 'Presencia Global de Buques Pesqueros (GFW)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.GFW,
    whatIsIt:
      'Huella acumulada de tránsito y permanencia de embarcaciones comerciales en aguas australes.',
    purpose:
      'Permite mapear la densidad de tráfico y corredores marítimos pesqueros para evaluar solapamiento con áreas de forrajeo de pingüinos y ballenas.',
    visualLogic:
      'Círculos naranja ámbar (#ff9100) de 5px con semitransparencia acumulativa.',
    techSpecs: {
      sensorOrMethod: 'Global Fishing Watch Vessel Presence API v3',
      temporalResolution: 'Mensual / Estacional',
      spatialCoverage: 'Cuadrícula global polar',
      format: 'GeoJSON Point FeatureCollection (38 puntos activos)',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: 'http://localhost:8000/api/gfw/vessel-presence',
      license: 'GFW Open Access',
    },
  },

  ais_vessels: {
    id: 'ais_vessels',
    name: 'Buques en Tránsito AIS en Tiempo Real',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.AMOH,
    whatIsIt:
      'Posiciones, velocidades sobre el fondo (SOG), rumbos (COG) y nombres de embarcaciones activas en el Océano Austral transmitidas por transpondedores AIS Clase A y B.',
    purpose:
      'Conciencia situacional en tiempo real para búsqueda y rescate (SAR marítimo bajo el tratado SOLAS/Código Polar) e inspección de buques que ingresan al área del Tratado Antártico.',
    visualLogic:
      'Iconos navales cian (#35c3c8) orientados según el rumbo del barco, con tarjeta de inspección detallada de entidad al hacer clic.',
    techSpecs: {
      sensorOrMethod: 'Receptores AIS terrestres en bases y repetidores satelitales AISStream',
      temporalResolution: 'Streaming en vivo (WebSocket / polling cada 30 segundos)',
      spatialCoverage: 'Península Antártica, Drake, Mar de Bellingshausen y Mar de Scotia',
      format: 'GeoJSON dinámico desde backend FastAPI',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: 'http://localhost:8000/api/ais/vessels',
      license: 'AMOH Open Maritime Feed',
    },
  },

  tourism_vessels: {
    id: 'tourism_vessels',
    name: 'Rutas y Buques Turísticos IAATO',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    sdgTitle: 'ODS 12: Producción y Consumo Responsables',
    sdgIconUrl: '/sdg-icons/12.png',
    agency: AGENCIES.IAATO,
    whatIsIt:
      'Corredores de expedición y registro de barcos de turismo polar operados bajo los protocolos ambientales de la Asociación Internacional de Operadores Turísticos de la Antártida.',
    purpose:
      'Garantiza que el turismo no sature los sitios de desembarco vulnerables y respete el límite de 100 pasajeros en tierra simultáneamente.',
    visualLogic:
      'Línea dorada ocre (#BF8B2E, ODS 12) discontinua con marcas de fondeaderos autorizados.',
    techSpecs: {
      sensorOrMethod: 'Planes de navegación IAATO y telemetría de crucero',
      temporalResolution: 'Temporada estival (noviembre a marzo)',
      spatialCoverage: 'Islas Shetland del Sur y Península Antártica',
      format: 'GeoJSON LineString y Points',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/tourism_vessels.geojson',
      license: 'IAATO Directory Public Access',
    },
  },

  // -------------------------------------------------------------
  // 4. BIODIVERSIDAD & ECOSISTEMAS (ODS 15: Vida Terrestre / 14: Vida Submarina)
  // -------------------------------------------------------------
  quantarctica_penguins: {
    id: 'quantarctica_penguins',
    name: 'Colonias de Pingüino Emperador (Aptenodytes forsteri)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    sdgTitle: 'ODS 15: Vida de Ecosistemas Terrestres',
    sdgIconUrl: '/sdg-icons/15.png',
    agency: AGENCIES.SCAR,
    whatIsIt:
      'Localización exacta de colonias de cría de pingüino emperador descubiertas y censadas mediante firmas espectrales de guano en el hielo marino en imágenes satelitales de alta resolución.',
    purpose:
      'Especie centinela del cambio climático: al reproducirse exclusivamente sobre hielo marino fijo, la pérdida temprana de la banquisa provoca el fracaso reproductivo total de colonias enteras.',
    visualLogic:
      'Puntos verde naturaleza (#56C02B, ODS 15) de radio 6px con halo protector blanco.',
    techSpecs: {
      sensorOrMethod: 'Imágenes satelitales WorldView y Landsat (British Antarctic Survey)',
      temporalResolution: 'Censo multianual SCAR Biology',
      spatialCoverage: '46 colonias registradas alrededor de todo el perímetro polar',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/penguin_colonies.geojson',
      license: 'BAS / SCAR Open Biology Dataset',
    },
  },

  quantarctica_seals: {
    id: 'quantarctica_seals',
    name: 'Distribución y Rastreo Satelital de Focas (MEOP)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.OBIS,
    whatIsIt:
      'Trayectorias y buceos de focas de Weddell, cangrejeras y elefantes marinos equipadas con transmisores CTD miniaturizados no invasivos (Marine Mammals Exploring the Oceans Pole to Pole).',
    purpose:
      'Los mamíferos marinos actúan como oceanógrafos biológicos autónomos, muestreando agua a profundidades extremas bajo plataformas de hielo inaccesibles para buques humanos.',
    visualLogic:
      'Nube de puntos verde esmeralda (#00e676) con opacidad calibrada para identificar zonas calientes de buceo.',
    techSpecs: {
      sensorOrMethod: 'Transmisores satelitales Argos CTD-SRDL fijados temporalmente',
      temporalResolution: '500 registros curados en el Océano Austral',
      spatialCoverage: 'Plataformas continentales antárticas y mar abierto',
      format: 'GeoJSON Point FeatureCollection (6.17 MB)',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/seal_distribution.geojson',
      license: 'MEOP Ocean Data Access (CC BY-NC 4.0)',
    },
  },

  krill_occurrences: {
    id: 'krill_occurrences',
    name: 'Distribución de Biomasa de Krill (Euphausia superba)',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.CCAMLR,
    whatIsIt:
      'Muestreos acústicos y lances de red oceanográficos que cuantifican la abundancia y densidad del krill antártico, piedra angular de la red trófica polar.',
    purpose:
      'Base científica indispensable para que CCAMLR establezca límites de captura precautorios y asigne cuotas por subárea para evitar el colapso de depredadores como ballenas y pingüinos.',
    visualLogic:
      'Puntos naranja coral (#ff7043) con opacidad relativa a la densidad de biomasa registrada.',
    techSpecs: {
      sensorOrMethod: 'Ecosondas científicas multifrecuencia Simrad EK80 + redes Bongo',
      temporalResolution: 'Campañas estivales CCAMLR / KROCK Survey',
      spatialCoverage: 'Mar de Scotia, Península Antártica e Islas Orcadas del Sur',
      format: 'GeoJSON Point FeatureCollection (300 estaciones)',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/krill.geojson',
      license: 'CCAMLR / OBIS-SEAMAP Open Data',
    },
  },

  whales: {
    id: 'whales',
    name: 'Santuario Ballenero Austral y Rutas de Migración',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.OBIS,
    whatIsIt:
      'Zonas de avistamiento y corredores migratorios de ballenas jorobadas, minke antárticas, rorcuales comunes y ballenas azules en el Santuario Ballenero del Océano Austral de la CBI.',
    purpose:
      'Prevención de colisiones con buques turísticos y pesqueros comerciales, y evaluación de la recuperación poblacional post-moratoria ballenera.',
    visualLogic:
      'Puntos azul cielo (#29b6f6) de 7px con borde blanco prominente.',
    techSpecs: {
      sensorOrMethod: 'Avistamientos científicos visuales e hidrófonos pasivos acústicos',
      temporalResolution: 'Compilación OBIS-SEAMAP / IWC',
      spatialCoverage: 'Estrecho de Gerlache, Canal Lemaire y Mar de Bellingshausen',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/whales.geojson',
      license: 'OBIS / International Whaling Commission',
    },
  },

  quantarctica_vegetation: {
    id: 'quantarctica_vegetation',
    name: 'Vegetación Antártica y Oasis Libres de Hielo',
    category: 'BIODIVERSIDAD & ECOSISTEMAS',
    sdg: 15,
    sdgColor: SDG_COLORS[15],
    sdgTitle: 'ODS 15: Vida de Ecosistemas Terrestres',
    sdgIconUrl: '/sdg-icons/15.png',
    agency: AGENCIES.SCAR,
    whatIsIt:
      'Registros botánicos de las únicas dos especies de plantas vasculares nativas (Deschampsia antarctica y Colobanthus quitensis), además de comunidades de musgos y líquenes en nunataks.',
    purpose:
      'El reverdecimiento antártico ("Antarctic greening") es uno de los bioindicadores más rápidos del calentamiento de la península; su monitoreo previene además la introducción de especies invasoras.',
    visualLogic:
      'Puntos verde hoja (#56C02B, ODS 15) de 5px.',
    techSpecs: {
      sensorOrMethod: 'Muestreo botánico de campo + firmas espectrales Sentinel-2',
      temporalResolution: 'Inventario SCAR Flora Registry',
      spatialCoverage: 'Península Antártica e Islas Shetland del Sur',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/vegetation.geojson',
      license: 'SCAR Biology Action Group',
    },
  },

  // -------------------------------------------------------------
  // 5. INFRAESTRUCTURA & LOGÍSTICA (ODS 9: Industria, Innovación e Infraestructura)
  // -------------------------------------------------------------
  quantarctica_stations: {
    id: 'quantarctica_stations',
    name: 'Estaciones de Investigación Científica COMNAP',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    sdgTitle: 'ODS 9: Industria, Innovación e Infraestructura',
    sdgIconUrl: '/sdg-icons/9.png',
    agency: AGENCIES.COMNAP,
    whatIsIt:
      'Censo georreferenciado oficial de las 108 bases polares permanentes y de verano operadas por los 32 países miembros del Consejo de Administradores de Programas Antárticos Nacionales.',
    purpose:
      'Permite la coordinación de socorro y búsqueda de emergencias, inspecciones mutuas de desmilitarización según el Art. VII del Tratado Antártico y logística interinstitucional.',
    visualLogic:
      'Puntos naranja brillante (#FD6925, ODS 9) de 6.5px con borde blanco nítido y metadatos de país operador, capacidad invernal/veraniega y estatus.',
    techSpecs: {
      sensorOrMethod: 'Directorio oficial geodésico COMNAP',
      temporalResolution: 'Actualización estacional anual (108 bases)',
      spatialCoverage: 'Distribución circumpolar continental e insular',
      format: 'GeoJSON Point FeatureCollection (72 KB)',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/comnap_stations.geojson',
      license: 'COMNAP Public Information',
    },
  },

  quantarctica_runways: {
    id: 'quantarctica_runways',
    name: 'Pistas Aéreas y Aeródromos de Hielo Azul',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    sdgTitle: 'ODS 9: Industria, Innovación e Infraestructura',
    sdgIconUrl: '/sdg-icons/9.png',
    agency: AGENCIES.COMNAP,
    whatIsIt:
      'Pistas de aterrizaje preparadas sobre nieve compactada, pistas naturales de hielo azul (blue ice) y helipuertos de acceso logístico antártico (ej: Teniente Rodolfo Marsh, Wilkins, Novo Runway).',
    purpose:
      'Garantiza la seguridad en operaciones aéreas polares, puentes aéreos intercontinentales de relevo científico y evacuaciones aeromédicas críticas (MEDEVAC).',
    visualLogic:
      'Líneas de pista ámbar aeronáutico (#ffa726) de 3px de grosor con alineación de cabecera.',
    techSpecs: {
      sensorOrMethod: 'Cartografía COMNAP Air Operations Planning & ICAO',
      temporalResolution: 'Revisión anual pretemporada',
      spatialCoverage: 'Península, Meseta polar e Islas periféricas',
      format: 'GeoJSON LineString (7 pistas principales)',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/runways.geojson',
      license: 'COMNAP Open Logistics Data',
    },
  },

  submarine_cables: {
    id: 'submarine_cables',
    name: 'Cables Submarinos y Puntos de Amarre Australes',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    sdgTitle: 'ODS 9: Industria, Innovación e Infraestructura',
    sdgIconUrl: '/sdg-icons/9.png',
    agency: AGENCIES.TELEGEOGRAPHY,
    whatIsIt:
      'Rutas de fibra óptica submarina y estaciones de amarre (landing stations) en los puertos puerta de entrada a la Antártida (Punta Arenas, Ushuaia, Hobart, Christchurch), además del proyecto de cable Humboldt / SMART.',
    purpose:
      'Monitorea la conectividad de telecomunicaciones de alta velocidad y el potencial de sensores acústicos y sísmicos integrados en repetidores submarinos para alerta temprana de tsunamis.',
    visualLogic:
      'Líneas amarillas (#ffd54f) y puntos de amarre costeros.',
    techSpecs: {
      sensorOrMethod: 'TeleGeography Submarine Cable Map + ITU SMART Joint Task Force',
      temporalResolution: 'Actualización trimestral (1,925 landing points)',
      spatialCoverage: 'Cono Sur, Oceanía y proximidades del Pasaje de Drake',
      format: 'GeoJSON Points y Multilines',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/landing_points.geojson',
      license: 'TeleGeography Public Registry',
    },
  },

  // -------------------------------------------------------------
  // 6. GOBERNANZA & PROTECCIÓN (ODS 16: Paz, Justicia e Instituciones Sólidas)
  // -------------------------------------------------------------
  quantarctica_aspa: {
    id: 'quantarctica_aspa',
    name: 'Zonas Antárticas Especialmente Protegidas (ASPA)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    sdgTitle: 'ODS 16: Paz, Justicia e Instituciones Sólidas',
    sdgIconUrl: '/sdg-icons/16.png',
    agency: AGENCIES.ATS,
    whatIsIt:
      'Áreas declaradas bajo el Anexo V del Protocolo de Madrid al Tratado Antártico para proteger valores científicos, ecológicos, históricos o estéticos excepcionales. El ingreso está estrictamente prohibido sin permiso oficial de una autoridad nacional.',
    purpose:
      'Es el instrumento jurídico de máxima conservación de la Antártida. AMOH genera alertas automáticas si un buque o aeronave transgrede el polígono sin autorización.',
    visualLogic:
      'Polígonos azul institucional (#00689D, ODS 16) con 35% de transparencia y borde sólido para rápida identificación de frontera de veda.',
    techSpecs: {
      sensorOrMethod: 'Delimitación jurídica oficial de la Secretaría del Tratado Antártico (ATS)',
      temporalResolution: 'Actualizaciones tras cada Reunión Consultiva del Tratado (RCTA/ATCM)',
      spatialCoverage: '74 áreas protegidas en todo el continente (2.44 MB)',
      format: 'GeoJSON Polygon FeatureCollection',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/aspa.geojson',
      license: 'Secretariat of the Antarctic Treaty Open Legal Data',
    },
  },

  quantarctica_asma: {
    id: 'quantarctica_asma',
    name: 'Zonas Antárticas Especialmente Administradas (ASMA)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    sdgTitle: 'ODS 16: Paz, Justicia e Instituciones Sólidas',
    sdgIconUrl: '/sdg-icons/16.png',
    agency: AGENCIES.ATS,
    whatIsIt:
      'Zonas donde se llevan a cabo múltiples actividades simultáneas (investigación, logística de varias bases, turismo) y que requieren un plan de gestión coordinado para evitar conflictos mutuos e impacto ambiental.',
    purpose:
      'Garantiza la cooperación pacífica entre programas antárticos de diferentes naciones que operan en un mismo valle o bahía (ej: Bahía Almirantazgo, Isla Decepción, Valles Secos de McMurdo).',
    visualLogic:
      'Polígonos púrpura (#9c27b0 con 28% de opacidad) con contorno lila (#ba68c8).',
    techSpecs: {
      sensorOrMethod: 'Planes de gestión ASMA aprobados por el Comité de Protección Ambiental (CEP)',
      temporalResolution: 'Vigente según medidas RCTA',
      spatialCoverage: '6 zonas administradas estratégicas (871 KB)',
      format: 'GeoJSON Polygon FeatureCollection',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/asma.geojson',
      license: 'ATS Legal Registry',
    },
  },

  quantarctica_ccamlr_mpa: {
    id: 'quantarctica_ccamlr_mpa',
    name: 'Áreas Marinas Protegidas CCAMLR (MPAs)',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.CCAMLR,
    whatIsIt:
      'Santuarios marinos oceánicos protegidos por consenso multilateral internacional, destacando el Área Marina Protegida de la Región del Mar de Ross (la mayor reserva marina del planeta con 1.55 millones de km²).',
    purpose:
      'Prohíbe o restringe severamente la pesca comercial en las zonas más prístinas del planeta para servir como laboratorios naturales de referencia contra el calentamiento global.',
    visualLogic:
      'Zonas marinas azul celeste (#0288d1) con borde azul brillante (#29b6f6) y 30% de opacidad.',
    techSpecs: {
      sensorOrMethod: 'Conservación Marina Multilateral CCAMLR (Medidas de Conservación 91-03 y 91-05)',
      temporalResolution: 'Revisión en asamblea anual de CCAMLR',
      spatialCoverage: 'Mar de Ross y Plataforma Sur de las Islas Orcadas del Sur (207 KB)',
      format: 'GeoJSON Polygon FeatureCollection',
      originalCrs: 'EPSG:3031',
      sourceEndpoint: '/data/web/geojson/ccamlr_mpa.geojson',
      license: 'CCAMLR Open Protection Registry',
    },
  },

  // -------------------------------------------------------------
  // 7. GEOFÍSICA & ESPACIO (ODS 9: Industria, Innovación / ODS 11)
  // -------------------------------------------------------------
  seismic_events: {
    id: 'seismic_events',
    name: 'Eventos Sísmicos Circumpolares USGS',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    sdgTitle: 'ODS 9: Industria, Innovación e Infraestructura',
    sdgIconUrl: '/sdg-icons/9.png',
    agency: AGENCIES.USGS,
    whatIsIt:
      'Terremotos y sismos corticales (magnitud M ≥ 3.0) detectados en las dorsales oceánicas antárticas, el Estrecho de Bransfield (enjambres volcánicos submarinos) y la Fosa de las Sandwich del Sur.',
    purpose:
      'Alerta temprana de riesgo de tsunami para estaciones costeras, monitoreo del vulcanismo activo del Monte Erebus y la Isla Decepción, y estudio de la tectónica de placas en el borde de Scotia.',
    visualLogic:
      'Círculos rojos brillantes (#ff1744) con radio escalado por magnitud sísmica y halo animado de ondas de pulso.',
    techSpecs: {
      sensorOrMethod: 'Red sismográfica global FDSN (USGS / IRIS / GEOFON)',
      temporalResolution: 'Tiempo real continuo (actualización periódica vía FastAPI)',
      spatialCoverage: 'Dorsales Pacífico-Antártica, Scotia, Sandwich y Bransfield',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: 'http://localhost:8000/api/seismic/events',
      license: 'USGS Public Domain',
    },
  },

  satellites_orbital: {
    id: 'satellites_orbital',
    name: 'Constelación Satelital Polar y Huellas Orbitales',
    category: 'GEOFÍSICA & ESPACIO',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    sdgTitle: 'ODS 9: Industria, Innovación e Infraestructura',
    sdgIconUrl: '/sdg-icons/9.png',
    agency: AGENCIES.NORAD,
    whatIsIt:
      'Posición en tiempo real y trayectorias terrestres de satélites en órbita polar sincrónica al sol (Sentinel-1/2/3, CryoSat-2, ICESat-2, MetOp, NOAA-20) propagadas con modelos matemáticos SGP4.',
    purpose:
      'Permite calcular ventanas de pase orbital sobre estaciones antárticas para enlace de telemetría de bajada de datos (downlink) y sincronizar capturas de imágenes ópticas/radar.',
    visualLogic:
      'Marcadores violeta (#7c4dff) con estela de trayectoria orbital LineString y cono de cobertura de antena en tierra.',
    techSpecs: {
      sensorOrMethod: 'Elementos orbitales de dos líneas (TLE) de NORAD / Space-Track propagados con SGP4',
      temporalResolution: 'Cálculo continuo en vivo cada 60 segundos',
      spatialCoverage: 'Órbita baja terrestre (LEO) circumpolar',
      format: 'GeoJSON Point + LineString FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: 'http://localhost:8000/api/satellites/current',
      license: 'CelesTrak / NORAD Public Orbital Data',
    },
  },

  // -------------------------------------------------------------
  // 7. TURISMO ANTÁRTICO & ACTIVIDADES PRIVADAS (ODS 12 & 9)
  // -------------------------------------------------------------
  iaato_routes: {
    id: 'iaato_routes',
    name: 'Rutas Publicadas de Turismo Antártico IAATO 2026–2030',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    sdgTitle: 'ODS 12: Producción y Consumo Responsables',
    sdgIconUrl: '/sdg-icons/12.png',
    agency: AGENCIES.IAATO,
    whatIsIt:
      'Corredores de navegación marítima y puentes aéreos oficiales para las temporadas 2026 a 2030 registrados ante la Asociación Internacional de Operadores Turísticos de la Antártida (IAATO). Abarca rutas de expedición tradicional en el Paso de Drake, vuelos Aerocruise, incursiones en el Mar de Weddell y cruceros de navegación escénica de gran porte.',
    purpose:
      'Monitorea el cumplimiento de las restricciones de tonelaje y aforo (buques de más de 500 pasajeros tienen prohibido el desembarco), supervisa la velocidad máxima de 10 nudos en áreas de concentración de cetáceos y evalúa la huella de carbono y riesgo de vertidos en aguas prístinas.',
    visualLogic:
      'Líneas doradas punteadas (#dda63a) con espesor de 2.5 px indicando corredores de tránsito comercial y waypoints clave.',
    techSpecs: {
      sensorOrMethod: 'Planes de navegación publicados y registros IAATO 2026–2030 contrastados con telemetría AIS',
      temporalResolution: 'Temporadas estivales australes (Noviembre a Marzo) 2026–2030',
      spatialCoverage: 'Península Antártica, Mar de Weddell, Mar de Ross y aproximaciones subantárticas',
      format: 'GeoJSON LineString FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/iaato_tourism_routes.geojson',
      license: 'IAATO Public Directory',
    },
  },

  iaato_landing_sites: {
    id: 'iaato_landing_sites',
    name: 'Sitios de Desembarco Regulados en Zodiac (IAATO)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: SDG_COLORS[12],
    sdgTitle: 'ODS 12: Producción y Consumo Responsables',
    sdgIconUrl: '/sdg-icons/12.png',
    agency: AGENCIES.IAATO,
    whatIsIt:
      'Puntos costeros autorizados para desembarco de pasajeros en botes neumáticos (Zodiacs), incluyendo colonias de pingüinos, playas geotérmicas en la Isla Decepción y estaciones científicas con museos o estafetas postales (Port Lockroy, Base Vernadsky).',
    purpose:
      'Verifica la aplicación estricta de las directrices de sitio (límite máximo de 100 pasajeros simultáneos en tierra, o 50 en sitios sensibles), distancia preventiva mínima de 5 metros a la fauna y protocolos de bioseguridad reforzados por brotes de gripe aviar (HPAI H5N1).',
    visualLogic:
      'Puntos celestes brillantes (#38bdf8) con borde blanco que destacan los enclaves de alta afluencia ecoturística.',
    techSpecs: {
      sensorOrMethod: 'Directrices de Sitio para Visitantes (Tratado Antártico / CEP / IAATO)',
      temporalResolution: 'Revisión anual por el Comité para la Protección del Medio Ambiente (CEP)',
      spatialCoverage: 'Archipiélago de las Shetland del Sur, Estrecho de Gerlache y Costa Danco',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/iaato_landing_sites.geojson',
      license: 'Secretaría del Tratado Antártico / IAATO Open Data',
    },
  },

  iaato_deep_field_camps: {
    id: 'iaato_deep_field_camps',
    name: 'Campamentos y Pistas de Hielo Azul de Interior Profundo',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    sdgTitle: 'ODS 9: Industria, Innovación e Infraestructura',
    sdgIconUrl: '/sdg-icons/9.png',
    agency: AGENCIES.COMNAP,
    whatIsIt:
      'Instalaciones logísticas privadas y aeródromos naturales sobre hielo azul (blue-ice runways) situados en el plateau y la Antártida profunda, operados principalmente por Antarctic Logistics & Expeditions (ALE) y White Desert, además del hub de aerocruceros en el Aeródromo Marsh / Base Frei.',
    purpose:
      'Control de operaciones aéreas transcontinentales (Boeing 757, Airbus A340, Basler BT-67), coordinación de soporte en búsqueda y salvamento (SAR) y monitoreo de la preservación ambiental del hielo prístino en el interior polar.',
    visualLogic:
      'Nodos púrpuras (#a855f7) con halo blanco que representan bases logísticas y pistas de alta montaña.',
    techSpecs: {
      sensorOrMethod: 'Registros COMNAP de aeródromos y planes de operaciones aéreas privadas',
      temporalResolution: 'Operación estival (Noviembre a Febrero)',
      spatialCoverage: 'Montes Ellsworth, Tierra de la Reina Maud y Meseta del Polo Sur (90° S)',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/iaato_deep_field_camps.geojson',
      license: 'COMNAP & Operator Public Filings',
    },
  },

  luxury_camps: {
    id: 'luxury_camps',
    name: 'Campamentos de Lujo & Glamping Polar (White Desert / ALE)',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 12,
    sdgColor: '#f59e0b',
    sdgTitle: 'ODS 12: Producción y Consumo Responsables',
    sdgIconUrl: '/sdg-icons/12.png',
    agency: AGENCIES.IAATO,
    whatIsIt:
      'Campamentos y eco-domos de ultra-lujo situados en el interior de la Antártida (Whichaway, Echo, Wolf\'s Fang, Three Glaciers Retreat, Ultima Oasis, Gould Bay), operados bajo estrictos estándares de huella ambiental cero y carbono neutro por White Desert, ALE y Ultima Antarctic Expeditions.',
    purpose:
      'Cartografiar los complejos de glamping polar más exclusivos del planeta, sus cápsulas futuristas (Sky Pods), saunas sobre hielo glaciar, pistas privadas de aterrizaje de jets transcontinentales, tarifas ($60.000 a $115.000 USD/pax) y el estricto cumplimiento del Protocolo al Tratado Antártico sobre Protección del Medio Ambiente (Protocolo de Madrid).',
    visualLogic:
      'Nodos dorados ambarinos (#f59e0b) de 7.5px con borde blanco e icono vectorial SVG de domo geodésico polar.',
    techSpecs: {
      sensorOrMethod: 'Manifiestos de expedición IAATO, registros de huella de carbono y planes operacionales ATCM',
      temporalResolution: 'Operación estival (Noviembre a Febrero)',
      spatialCoverage: 'Tierra de la Reina Maud, Montes Ellsworth, Meseta Polar y Mar de Weddell',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/antarctic_luxury_camps.geojson',
      license: 'IAATO & Operator Public Documentation',
    },
  },

  tourist_submersibles: {
    id: 'tourist_submersibles',
    name: 'Sumergibles de Expedición & Puntos de Inmersión Profunda',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.IAATO,
    whatIsIt:
      'Puntos autorizados de inmersión para sumergibles tripulados de turismo de expedición (U-Boat Worx Cruise Sub 7 y Triton 660/9 AVA) transportados en buques clase PC6 (Scenic Eclipse I/II, Seabourn Venture/Pursuit, Viking Octantis/Polaris) con capacidad de inmersión hasta 300 metros.',
    purpose:
      'Monitoreo ambiental de perturbación acústica y lumínica sobre el benthos antártico, inspección de fondos glaciares y cañones submarinos bajo regulaciones de bioseguridad IAATO.',
    visualLogic:
      'Círculos azul marino (#0284c7) de 7px con borde blanco que identifican cañones submarinos y calderas con autorización de inmersión.',
    techSpecs: {
      sensorOrMethod: 'Telemetría acústica USBL, cámaras 4K submarinas y sensores CTD de sumergibles',
      temporalResolution: 'Inmersiones estivales sujetas a condiciones de banquisa y viento',
      spatialCoverage: 'Península Antártica, Estrecho de Gerlache y Caldera de Isla Decepción',
      format: 'GeoJSON Point FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/expedition_submersibles.geojson',
      license: 'Directrices IAATO / Operadores Navales de Expedición',
    },
  },

  heavy_traverses: {
    id: 'heavy_traverses',
    name: 'Travesías Terrestres Pesadas & Convoyes Oruga Continentales',
    category: 'INFRAESTRUCTURA & LOGÍSTICA',
    sdg: 9,
    sdgColor: SDG_COLORS[9],
    sdgTitle: 'ODS 9: Industria, Innovación e Infraestructura',
    sdgIconUrl: '/sdg-icons/9.png',
    agency: AGENCIES.COMNAP,
    whatIsIt:
      'Líneas continentales de trenes de tractores oruga pesados (Caterpillar MT865, Case Quadtrac, PistenBully, Prinoth) que arrastran trineos de combustible y carga pesada: South Pole Traverse (SPoT McMurdo-Polo Sur), Raid Concordia (Cap Prudhomme-Domo C), Raid Vostok (Progress-Vostok) y Union Glacier Traverse (ALE / Arctic Trucks).',
    purpose:
      'Línea de vida logística continental que permite el abastecimiento de estaciones científicas en el interior del manto de hielo con una fracción de la huella de carbono de los aviones hércules LC-130.',
    visualLogic:
      'Líneas continuas color naranja polar (#ea580c) de 3.2px de grosor que marcan los surcos sobre el hielo continental.',
    techSpecs: {
      sensorOrMethod: 'Georradar de penetración terrestre (GPR) para detección de grietas y navegación GPS polar diferencial',
      temporalResolution: 'Campañas estivales anuales (diciembre a febrero)',
      spatialCoverage: 'Manto de Hielo Antártico Continental (Ross Ice Shelf a Polo Sur, Domo C, Vostok)',
      format: 'GeoJSON LineString FeatureCollection',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/antarctic_heavy_traverses.geojson',
      license: 'USAP / IPEV-PNRA / RAE / ALE Logistics Database',
    },
  },

  autonomous_yachts: {
    id: 'autonomous_yachts',
    name: 'Misiones Autónomas (Saildrone / AUVs) & Veleros de Expedición',
    category: 'ACTIVIDAD MARÍTIMA & PESCA (GFW)',
    sdg: 14,
    sdgColor: SDG_COLORS[14],
    sdgTitle: 'ODS 14: Vida Submarina',
    sdgIconUrl: '/sdg-icons/14.png',
    agency: AGENCIES.NOAA,
    whatIsIt:
      'Monitoreo no tripulado mediante vehículos de superficie a vela autónomos (Saildrone Explorer circumpolar), inmersiones de AUVs submarinos de gran profundidad (Ran / Hugin) bajo las cavidades de los glaciares Thwaites y Dotson, y corredores de veleros de chárter polar clase hielo para montañismo y ski-alpinismo.',
    purpose:
      'Cálculo ininterrumpido del flujo de CO2 marino en vientos extremos, detección de derretimiento basal en glaciares críticos y seguimiento de expediciones de vela deportiva.',
    visualLogic:
      'Trazos cian (#06b6d4) de línea discontinua para la circunnavegación y puntos de inmersión AUV.',
    techSpecs: {
      sensorOrMethod: 'Sensores biogeoquímicos Saildrone ASV, ecosondas multihaz AUV y tracking satelital Iridium',
      temporalResolution: 'Misiones multimensuales continuas y temporadas estivales de vela',
      spatialCoverage: 'Circumpolar (45° S a 60° S) y Mar de Amundsen / Glaciar Thwaites',
      format: 'GeoJSON FeatureCollection (LineString y Point)',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/polar_autonomous_and_yachts.geojson',
      license: 'Saildrone Inc. / ITGC / IAATO Category 1 Sailboats',
    },
  },

  subsurface_nuclear: {
    id: 'subsurface_nuclear',
    name: 'Submarinos Nucleares & Red Hidroacústica CTBTO',
    category: 'GOBERNANZA & PROTECCIÓN (TRATADO ANTÁRTICO)',
    sdg: 16,
    sdgColor: SDG_COLORS[16],
    sdgTitle: 'ODS 16: Paz, Justicia e Instituciones Sólidas',
    sdgIconUrl: '/sdg-icons/16.png',
    agency: AGENCIES.CTBTO,
    whatIsIt:
      'Corredores estratégicos sumergidos de tránsito y patrulla de submarinos de propulsión nuclear (SSN clase Astute, Vanguard, Virginia, Los Angeles) en los chokepoints de aguas profundas (Paso de Drake, Cuenca de Malvinas, Fosa de Sandwich del Sur, Cresta de Macquarie), estaciones hidroacústicas globales del IMS de la CTBTO (HA01, HA03, HA04, HA08, HA12) y el límite de desnuclearización y desmilitarización absoluta del Paralelo 60° S estipulado por los Artículos I y V del Tratado Antártico.',
    purpose:
      'Vigilancia estratégica de no proliferación nuclear, detección de detonaciones e implosiones submarinas en el canal SOFAR y salvaguarda de la zona desnuclearizada más grande del planeta.',
    visualLogic:
      'Líneas discontinuas rojo carmesí (#e11d48) para corredores de aguas profundas, línea continua para el paralelo 60°S y círculos radiológicos en las estaciones hidroacústicas.',
    techSpecs: {
      sensorOrMethod: 'Tríadas de hidrófonos anclados en canal SOFAR CTBTO, sonar pasivo y registros geopolíticos navales abiertos',
      temporalResolution: 'Monitoreo acústico continuo 24/7 en tiempo real',
      spatialCoverage: 'Océano Austral y cuencas subantárticas adyacentes (30° S a 65° S)',
      format: 'GeoJSON FeatureCollection (LineString y Point)',
      originalCrs: 'EPSG:4326',
      sourceEndpoint: '/data/web/geojson/subsurface_and_nuclear_patrols.geojson',
      license: 'CTBTO Preparatory Commission / Tratado Antártico (Art. I & V)',
    },
  },
};

/**
 * Helper para obtener los metadatos semánticos completos de cualquier capa
 */
export function getLayerSemantics(layerId: string): LayerSemanticMetadata | null {
  if (layerId === 'maritime_vessels' || layerId === 'vessels') {
    return LAYER_SEMANTICS['ais_vessels'] || null;
  }
  return LAYER_SEMANTICS[layerId] || null;
}
