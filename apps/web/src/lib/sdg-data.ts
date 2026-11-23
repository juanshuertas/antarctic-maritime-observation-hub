/**
 * AMOH V6 — Sustainable Development Goals (SDG) Registry & Antarctic Polar Alignment
 *
 * Rules:
 * - All 17 official goals with official UN hex color tokens.
 * - Non-UN assets: clean geometric numbers and iconography (no UN emblem).
 * - Honest provenance: if no verified mapped data exists for a goal in the Southern Ocean,
 *   explicitly show: "No hay evidencia geográfica directa mapeada para este objetivo en la vista polar actual."
 */

export interface SdgGoal {
  number: number;
  id: string;
  name: string;
  shortTitle: string;
  color: string;
  antarcticRelevance: string;
  discoveryText: {
    what: string;
    why: string;
  };
  associatedLayers: string[];
  primaryDatasets?: Array<{
    name: string;
    provider: string;
    doi?: string;
    url?: string;
  }>;
  hasMappedData: boolean;
}

export const SDG_GOALS: SdgGoal[] = [
  {
    number: 1,
    id: 'sdg-01',
    name: 'Fin de la Pobreza',
    shortTitle: 'Fin de la Pobreza',
    color: '#E5243B',
    antarcticRelevance: 'No aplicable directamente a asentamientos permanentes en la Antártida.',
    discoveryText: {
      what: 'La Antártida no tiene poblaciones humanas autóctonas permanentes ni pobreza urbana.',
      why: 'La investigación polar protege la estabilidad del clima global que previene catástrofes socioeconómicas.',
    },
    associatedLayers: [],
    hasMappedData: false,
  },
  {
    number: 2,
    id: 'sdg-02',
    name: 'Hambre Cero',
    shortTitle: 'Hambre Cero',
    color: '#DDA63A',
    antarcticRelevance: 'Gestión ecosistémica de pesquerías de krill (CCAMLR) y seguridad alimentaria marina.',
    discoveryText: {
      what: 'El krill antártico es la mayor biomasa animal del planeta y sustenta las cadenas tróficas oceánicas.',
      why: 'Regula las fuentes proteicas marinas globales bajo límites científicos estrictos de captura.',
    },
    associatedLayers: ['krill-biomass', 'fisheries-ccamlr'],
    primaryDatasets: [
      {
        name: 'CCAMLR Statistical Bulletin & Krill Catch Reports',
        provider: 'CCAMLR Secretariat',
        url: 'https://www.ccamlr.org',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 3,
    id: 'sdg-03',
    name: 'Salud y Bienestar',
    shortTitle: 'Salud y Bienestar',
    color: '#4C9F38',
    antarcticRelevance: 'Telemedicina polar, salud ocupacional en aislamiento extremo y compuestos biológicos polares.',
    discoveryText: {
      what: 'Organismos extremófilos antárticos producen moléculas bioactivas contra bacterias resistentes.',
      why: 'La medicina polar prueba protocolos de confinamiento aplicables a situaciones críticas de salud.',
    },
    associatedLayers: ['stations-medical'],
    hasMappedData: true,
  },
  {
    number: 4,
    id: 'sdg-04',
    name: 'Educación de Calidad',
    shortTitle: 'Educación de Calidad',
    color: '#C5192D',
    antarcticRelevance: 'Educación científica abierta (SCAR), becas para jóvenes investigadores y ciencia ciudadana.',
    discoveryText: {
      what: 'La ciencia antártica es compartida abiertamente con escuelas y universidades del mundo entero.',
      why: 'Cualquier persona puede explorar datos oceánicos reales sin barreras comerciales.',
    },
    associatedLayers: ['scar-fellowships', 'citizen-obs'],
    primaryDatasets: [
      {
        name: 'SCAR Open Science Framework & Capacity Building',
        provider: 'SCAR',
        url: 'https://scar.org',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 5,
    id: 'sdg-05',
    name: 'Igualdad de Género',
    shortTitle: 'Igualdad de Género',
    color: '#FF3A21',
    antarcticRelevance: 'Mujeres en la ciencia antártica (SCAR Women in Antarctic Research) y liderazgo polar.',
    discoveryText: {
      what: 'Científicas, capitanas y jefas de base lideran expediciones clave en el continente helado.',
      why: 'Promueve la equidad en entornos de alta exigencia logística y científica.',
    },
    associatedLayers: ['stations-diversity'],
    hasMappedData: false,
  },
  {
    number: 6,
    id: 'sdg-06',
    name: 'Agua Limpia y Saneamiento',
    shortTitle: 'Agua Limpia',
    color: '#26BDE2',
    antarcticRelevance: 'El manto de hielo antártico contiene el 70% del agua dulce del planeta.',
    discoveryText: {
      what: 'La Antártida almacena la mayor reserva de agua dulce congelada de la Tierra.',
      why: 'El deshielo polar afecta directamente el nivel del mar y los acuíferos costeros de todo el planeta.',
    },
    associatedLayers: ['cryosphere-ice-mass', 'lakes-subglacial'],
    primaryDatasets: [
      {
        name: 'Antarctic Ice Sheet Mass Balance (IMBIE / CryoSat-2)',
        provider: 'ESA / NASA',
        doi: '10.1038/s41586-018-0179-y',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 7,
    id: 'sdg-07',
    name: 'Energía Asequible y No Contaminante',
    shortTitle: 'Energía Limpia',
    color: '#FCC30B',
    antarcticRelevance: 'Bases polares con emisión cero (Princess Elisabeth) y microrredes híbridas eólica/solar.',
    discoveryText: {
      what: 'Estaciones polares pioneras funcionan exclusivamente con viento y sol en el frío más extremo.',
      why: 'Demuestran que las energías renovables pueden alimentar infraestructuras en condiciones extremas.',
    },
    associatedLayers: ['stations-renewable'],
    primaryDatasets: [
      {
        name: 'Zero-Emission Antarctic Station Infrastructure Registry',
        provider: 'International Polar Foundation',
        url: 'https://www.polarfoundation.org',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 8,
    id: 'sdg-08',
    name: 'Trabajo Decente y Crecimiento Económico',
    shortTitle: 'Trabajo Decente',
    color: '#A21942',
    antarcticRelevance: 'Pesquerías sostenibles certificadas CCAMLR y estándares laborales de tripulaciones antárticas.',
    discoveryText: {
      what: 'Normas laborales y de seguridad del Código Polar (IMO) para navegantes e investigadores.',
      why: 'Evita la explotación no regulada en uno de los océanos más peligrosos del mundo.',
    },
    associatedLayers: ['fisheries-certified'],
    hasMappedData: false,
  },
  {
    number: 9,
    id: 'sdg-09',
    name: 'Industria, Innovación e Infraestructura',
    shortTitle: 'Innovación & Infraestructura',
    color: '#FD6925',
    antarcticRelevance: 'Cables submarinos de fibra óptica (FOA), boyas biogeoquímicas Argo y flotillas robóticas.',
    discoveryText: {
      what: 'Sensores robóticos autónomos y fibra óptica submarina conectan los abismos del Océano Austral.',
      why: 'Permite alertar sobre cambios oceánicos profundos en tiempo real con tecnología de punta.',
    },
    associatedLayers: ['submarine-cables', 'argo-floats', 'satellites'],
    primaryDatasets: [
      {
        name: 'Argo Float Global Polar Telemetry',
        provider: 'Argo / JCOMMOPS',
        url: 'https://argo.ucsd.edu',
      },
      {
        name: 'Fibra Óptica Austral (FOA) Submarine Node',
        provider: 'Subtel Chile',
        url: 'https://www.subtel.gob.cl',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 10,
    id: 'sdg-10',
    name: 'Reducción de las Desigualdades',
    shortTitle: 'Reducción Desigualdades',
    color: '#DD1367',
    antarcticRelevance: 'Inclusión de países en desarrollo en la gobernanza polar y programas de intercambio científico.',
    discoveryText: {
      what: 'Científicos de naciones emergentes acceden a bases y buques polares mediante acuerdos abiertos.',
      why: 'El destino del clima polar no pertenece a unas pocas naciones, sino a toda la humanidad.',
    },
    associatedLayers: ['cooperation-visiting'],
    hasMappedData: false,
  },
  {
    number: 11,
    id: 'sdg-11',
    name: 'Ciudades y Comunidades Sostenibles',
    shortTitle: 'Comunidades Sostenibles',
    color: '#FD9D24',
    antarcticRelevance: 'Puertas de entrada antárticas sostenibles (Ushuaia, Punta Arenas, Puerto Williams, Hobart, Christchurch).',
    discoveryText: {
      what: 'Ciudades portuarias del hemisferio sur gestionan la logística limpia hacia el polo sur.',
      why: 'Protegen ecosistemas subantárticos frágiles frente al impacto del turismo y el transporte.',
    },
    associatedLayers: ['gateway-ports', 'tourism-traffic'],
    primaryDatasets: [
      {
        name: 'IAATO Tourism Statistics & Directory',
        provider: 'IAATO',
        url: 'https://iaato.org',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 12,
    id: 'sdg-12',
    name: 'Producción y Consumo Responsables',
    shortTitle: 'Consumo Responsable',
    color: '#BF8B2E',
    antarcticRelevance: 'Protocolo de Madrid: Prohibición total de vertidos, reciclaje integral y retiro obligatorio de residuos.',
    discoveryText: {
      what: 'En la Antártida todo residuo generado por el ser humano debe ser empacado y evacuado del continente.',
      why: 'Es el modelo de economía circular y contaminación cero más riguroso del planeta.',
    },
    associatedLayers: ['stations-waste-mgmt'],
    hasMappedData: false,
  },
  {
    number: 13,
    id: 'sdg-13',
    name: 'Acción por el Clima',
    shortTitle: 'Acción por el Clima',
    color: '#3F7E44',
    antarcticRelevance: 'Monitoreo continuo de la Corriente Circumpolar, absorción de calor oceánico y balance del hielo.',
    discoveryText: {
      what: 'El Océano Austral absorbe más del 40% del exceso de calor oceánico antropogénico de la Tierra.',
      why: 'Es el termostato del planeta: entenderlo es crucial para predecir el futuro de la humanidad.',
    },
    associatedLayers: ['sea-ice-extent', 'ocean-temperature', 'cryosphere-ice-mass'],
    primaryDatasets: [
      {
        name: 'World Ocean Database Polar CTD Profiles',
        provider: 'NOAA NCEI',
        url: 'https://www.ncei.noaa.gov/products/world-ocean-database',
      },
      {
        name: 'OSI-SAF Sea Ice Concentration & Extent',
        provider: 'EUMETSAT / OSI-SAF',
        url: 'https://osi-saf.eumetsat.int',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 14,
    id: 'sdg-14',
    name: 'Vida Submarina',
    shortTitle: 'Vida Submarina',
    color: '#0A97D9',
    antarcticRelevance: 'Krill antártico, cetáceos, focas, peces de hielo y Áreas Marinas Protegidas de CCAMLR.',
    discoveryText: {
      what: 'Aguas heladas ricas en oxígeno donde habitan ballenas azules, orcas, krill y peces con anticongelante en su sangre.',
      why: 'Alberga ecosistemas marinos prístinos protegidos por las mayores reservas oceánicas del mundo.',
    },
    associatedLayers: ['biodiversity-krill', 'biodiversity-penguins', 'biodiversity-mammals', 'ccamlr-mpas'],
    primaryDatasets: [
      {
        name: 'SCAR Antarctic Biodiversity Portal / OBIS',
        provider: 'SCAR / OBIS',
        url: 'https://biodiversity.aq',
      },
      {
        name: 'Mapping Application for Penguin Populations and Projected Dynamics (MAPPPD)',
        provider: 'Oceanites / Stony Brook',
        url: 'https://www.penguinmap.com',
      },
      {
        name: 'CCAMLR Marine Protected Areas Shapefiles',
        provider: 'CCAMLR Secretariat',
        url: 'https://www.ccamlr.org',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 15,
    id: 'sdg-15',
    name: 'Vida de Ecosistemas Terrestres',
    shortTitle: 'Vida Terrestre & Flora',
    color: '#56C02B',
    antarcticRelevance: 'Oasis antárticos libres de hielo: bancos de musgos, líquenes y dos especies de plantas vasculares.',
    discoveryText: {
      what: 'Musgos, líquenes y dos pequeñas plantas vasculares que florecen en las rocas del verano antártico.',
      why: 'Bioindicadores hipersensibles al calentamiento de la península y a especies invasoras.',
    },
    associatedLayers: ['biodiversity-flora', 'ice-free-areas'],
    primaryDatasets: [
      {
        name: 'BAS Herbarium & Antarctic Plant Database',
        provider: 'British Antarctic Survey',
        url: 'https://www.bas.ac.uk',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 16,
    id: 'sdg-16',
    name: 'Paz, Justicia e Instituciones Sólidas',
    shortTitle: 'Paz & Desmilitarización',
    color: '#00689D',
    antarcticRelevance: 'Tratado Antártico (1959): El único continente entero consagrado exclusivamente a la paz y la ciencia.',
    discoveryText: {
      what: 'Un continente sin armas, sin fronteras militares y gobernado por el consenso de naciones.',
      why: 'El tratado de desarme y cooperación científica más exitoso de la historia de la civilización.',
    },
    associatedLayers: ['treaty-inspections', 'peace-ledger', 'stations-all'],
    primaryDatasets: [
      {
        name: 'Antarctic Treaty Electronic Information Exchange System (EIES)',
        provider: 'Secretariat of the Antarctic Treaty',
        url: 'https://www.ats.aq',
      },
    ],
    hasMappedData: true,
  },
  {
    number: 17,
    id: 'sdg-17',
    name: 'Alianzas para Lograr los Objetivos',
    shortTitle: 'Alianzas Globales',
    color: '#19486A',
    antarcticRelevance: 'SCAR, WMO, UNESCO-IOC, IAATO y COMNAP en el intercambio libre de datos polares.',
    discoveryText: {
      what: 'Redes científicas internacionales donde todos los países comparten sus observaciones abiertas.',
      why: 'Ningún país puede estudiar el Océano Austral en solitario: la colaboración polar es indispensable.',
    },
    associatedLayers: ['scar-networks', 'international-stations'],
    primaryDatasets: [
      {
        name: 'Scientific Committee on Antarctic Research (SCAR) Open Data',
        provider: 'ICSU / SCAR',
        url: 'https://scar.org',
      },
    ],
    hasMappedData: true,
  },
];

export interface XdgPillar {
  id: string;
  name: string;
  focus: string;
  color: string;
  antarcticRelevance: string;
  themes: Array<{
    title: string;
    description: string;
    indicators: string[];
  }>;
}

export const XDG_2045_FRAMEWORK: XdgPillar[] = [
  {
    id: 'xdg-planet',
    name: 'Planeta (Planet & Biosphere)',
    focus: 'Estabilización de puntos de inflexión del Océano Austral y Criosfera',
    color: '#00c49f',
    antarcticRelevance: 'El Océano Austral absorbe el 40% del CO2 oceánico antropogénico y el 75% del calor oceánico excedente mundial.',
    themes: [
      {
        title: 'Custodia de Límites Planetarios & Sumideros de Carbono',
        description: 'Monitoreo biogeoquímico con BGC-Argo para calibrar la acidificación y absorción oceánica de carbono.',
        indicators: ['BGC-Argo pH/pCO2', 'Extensión mínima de banquisa', 'Tasa de desprendimiento de hielo de fondo'],
      },
      {
        title: 'Estabilización de Plataformas Glaciares (Thwaites / Pine Island)',
        description: 'Detección temprana de intrusión de Agua Circumpolar Profunda Cálida bajo las cavidades de hielo.',
        indicators: ['Anomalías térmicas CDW', 'Líneas de apoyo radar SAR', 'Velocidad de flujo glaciar'],
      },
    ],
  },
  {
    id: 'xdg-peace',
    name: 'Paz (Peace & Science Diplomacy)',
    focus: 'Gobernanza global no-militarizada y longevidad del Tratado Antártico',
    color: '#38bdf8',
    antarcticRelevance: 'Preservación estricta del Artículo I (Uso pacífico) y Artículo IV (Congelamiento de soberanías).',
    themes: [
      {
        title: 'Diplomacia Científica Multilateral & Inspecciones Abiertas',
        description: 'Intercambio transparente de información de bases y expediciones bajo el sistema EIES del ATS.',
        indicators: ['Informes de inspección mutua', 'Coparticipación de buques de investigación', 'Acceso abierto a telemetría'],
      },
      {
        title: 'Seguridad Cooperativa & Búsqueda/Salvamento (SAR)',
        description: 'Coordinación MRCC de rescate polar entre Chile, Argentina, Sudáfrica, Australia y Nueva Zelanda.',
        indicators: ['Tiempos de respuesta SAR', 'Cobertura satelital AIS/COSPAS-SARSAT', 'Corredores seguros Drake'],
      },
    ],
  },
  {
    id: 'xdg-partnership',
    name: 'Alianzas (Partnership & Digital Earth)',
    focus: 'Gemelos digitales de la Tierra, inclusión de IA polar y bienes comunes de datos',
    color: '#a855f7',
    antarcticRelevance: 'SCAR, WMO, COMNAP y UN Ocean Decade liderando el acceso universal y federado a la ciencia.',
    themes: [
      {
        title: 'Gemelo Digital Polar & Modelos Abiertos de IA',
        description: 'Simulaciones predictivas abiertas de corrientes, krill y meteorología sin monopolios tecnológicos.',
        indicators: ['Modelos de código abierto', 'Formatos interoperables Cloud-Optimized GeoTIFF/Parquet', 'Cero barreras de pago'],
      },
      {
        title: 'Iniciativas de Conectividad Polar & Cables SMART',
        description: 'Sensores oceanográficos y sísmicos integrados en repetidores de fibra submarina transoceánica.',
        indicators: ['Rutas SMART planificadas', 'Latencia de telemetría in situ', 'Densidad de nodos de fondo marino'],
      },
    ],
  },
  {
    id: 'xdg-people',
    name: 'Personas (People & Intergenerational Equity)',
    focus: 'Educación abierta, formación de jóvenes científicos polares y equidad de género',
    color: '#f59e0b',
    antarcticRelevance: 'Formación de la próxima generación de líderes en ciencias del océano y conservación.',
    themes: [
      {
        title: 'Becas Científicas Inclusivas para el Sur Global',
        description: 'Programas de estancia y mentoría SCAR/COMNAP/CCAMLR para países emergentes.',
        indicators: ['Becas otorgadas Sur Global', 'Participación científica femenina en terreno', 'Divulgación escolar'],
      },
    ],
  },
  {
    id: 'xdg-prosperity',
    name: 'Prosperidad (Prosperity & Regenerative Economy)',
    focus: 'Economía azul regenerativa con límites ecológicos infranqueables',
    color: '#10b981',
    antarcticRelevance: 'Regulación precautoria estricta de la pesca de krill y merluza; turismo con huella neta cero.',
    themes: [
      {
        title: 'Gestión Precautoria Ecosistémica CCAMLR',
        description: 'Cálculo de cuotas dinámicas de captura basadas en las necesidades alimentarias de predadores.',
        indicators: ['Biomasa reproductiva de krill', 'Monitoreo de predadores CEMP', 'Cumplimiento de Áreas Marinas Protegidas'],
      },
    ],
  },
];
