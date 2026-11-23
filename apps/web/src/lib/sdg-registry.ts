/**
 * AMOH — SDG Registry & Visual Architecture (Master Consolidated V4)
 *
 * Implements the 17 United Nations Sustainable Development Goals and relevant Polar Targets.
 * Complies with official UN Guidelines (Non-UN Version 2):
 * - Official unmodified color palette
 * - 1:1 square aspect ratio
 * - Official UN disclaimer & external link
 * - Evidence linkage types: SOURCE_DECLARED | EXPERT_REVIEWED | AI_SUGGESTED
 */

export interface SDGTarget {
  id: string; // e.g. "14.1", "13.2"
  code: string;
  title: string;
  description: string;
  polarContext: string;
}

export interface SDGDefinition {
  number: number;
  name: string;
  shortTitle: string;
  color: string;
  contrastTextColor: '#FFFFFF' | '#000000';
  iconUrl?: string;
  description: string;
  polarRelevance: string;
  targets: SDGTarget[];
}

export type SDGLinkageType = 'SOURCE_DECLARED' | 'EXPERT_REVIEWED' | 'AI_SUGGESTED';

export interface SDGEvidenceLink {
  sdgNumber: number;
  targetId?: string;
  type: SDGLinkageType;
  basis: string;
  evidence: string;
  reviewer?: string;
  timestamp: string;
  confidence?: number;
}

export const OFFICIAL_UN_SDG_DISCLAIMER =
  'El contenido de esta plataforma científica independiente no ha sido aprobado por las Naciones Unidas y no refleja las opiniones de las Naciones Unidas o sus funcionarios. Para obtener información oficial sobre los Objetivos de Desarrollo Sostenible, visite https://www.un.org/sustainabledevelopment.';

export const SDG_REGISTRY: Record<number, SDGDefinition> = {
  1: {
    number: 1,
    name: 'Fin de la pobreza',
    shortTitle: 'Pobreza',
    color: '#E5243B',
    contrastTextColor: '#FFFFFF',
    description: 'Poner fin a la pobreza en todas sus formas en todo el mundo.',
    polarRelevance: 'Acceso equitativo al conocimiento oceánico global y soberanía alimentaria basada en pesca sostenible.',
    targets: [
      {
        id: '1.5',
        code: '1.5',
        title: 'Resiliencia ante desastres',
        description: 'Fomentar la resiliencia de los pobres ante desastres climáticos.',
        polarContext: 'Mitigación del impacto del aumento del nivel del mar por deshielo antártico en comunidades costeras vulnerables.',
      },
    ],
  },
  2: {
    number: 2,
    name: 'Hambre cero',
    shortTitle: 'Hambre Cero',
    color: '#DDA63A',
    contrastTextColor: '#FFFFFF',
    description: 'Poner fin al hambre, lograr la seguridad alimentaria y la mejora de la nutrición.',
    polarRelevance: 'Cadena trófica del krill antártico y pesca regulada por la CCAMLR como recurso proteico global.',
    targets: [
      {
        id: '2.4',
        code: '2.4',
        title: 'Producción sostenible',
        description: 'Asegurar la sostenibilidad de los sistemas de producción de alimentos.',
        polarContext: 'Gestión ecosistémica de pesquerías en el Océano Austral.',
      },
    ],
  },
  3: {
    number: 3,
    name: 'Salud y bienestar',
    shortTitle: 'Salud',
    color: '#4C9F38',
    contrastTextColor: '#FFFFFF',
    description: 'Garantizar una vida sana y promover el bienestar para todos en todas las edades.',
    polarRelevance: 'Bioprospección polar, psicofisiología del aislamiento y telemedicina en expediciones extremas.',
    targets: [
      {
        id: '3.9',
        code: '3.9',
        title: 'Reducción de contaminación',
        description: 'Reducir el número de muertes y enfermedades producidas por productos químicos peligrosos.',
        polarContext: 'Monitoreo de contaminantes orgánicos persistentes (POPs) y microplásticos en aguas polares.',
      },
    ],
  },
  4: {
    number: 4,
    name: 'Educación de calidad',
    shortTitle: 'Educación',
    color: '#C5192D',
    contrastTextColor: '#FFFFFF',
    description: 'Garantizar una educación inclusiva, equitativa y de calidad y promover oportunidades de aprendizaje.',
    polarRelevance: 'Formación de científicos jóvenes (APECS), ciencia abierta y capacitación expedicionaria polar.',
    targets: [
      {
        id: '4.7',
        code: '4.7',
        title: 'Educación para el desarrollo sostenible',
        description: 'Asegurar que los alumnos adquieran conocimientos teóricos y prácticos para el desarrollo sostenible.',
        polarContext: 'Educación antártica en escuelas y alfabetización oceánica.',
      },
    ],
  },
  5: {
    number: 5,
    name: 'Igualdad de género',
    shortTitle: 'Igualdad',
    color: '#FF3A21',
    contrastTextColor: '#FFFFFF',
    description: 'Lograr la igualdad entre los géneros y empoderar a todas las mujeres y las niñas.',
    polarRelevance: 'Liderazgo de mujeres en expediciones antárticas, programas como Homeward Bound y comités SCAR.',
    targets: [
      {
        id: '5.5',
        code: '5.5',
        title: 'Participación plena en el liderazgo',
        description: 'Asegurar la participación plena y efectiva de las mujeres y la igualdad de oportunidades de liderazgo.',
        polarContext: 'Equidad en jefaturas de base polar y direcciones científicas de campaña.',
      },
    ],
  },
  6: {
    number: 6,
    name: 'Agua limpia y saneamiento',
    shortTitle: 'Agua Limpia',
    color: '#26BDE2',
    contrastTextColor: '#FFFFFF',
    description: 'Garantizar la disponibilidad de agua y su gestión sostenible y el saneamiento para todos.',
    polarRelevance: 'La Antártida contiene el 70% del agua dulce del planeta en forma de hielo glacial.',
    targets: [
      {
        id: '6.6',
        code: '6.6',
        title: 'Protección de ecosistemas hídricos',
        description: 'Proteger y restablecer los ecosistemas relacionados con el agua, incluidos montañas, bosques y lagos.',
        polarContext: 'Monitoreo de lagos subglaciales (Vostok, Mercer) y preservación de cuencas polares puras.',
      },
    ],
  },
  7: {
    number: 7,
    name: 'Energía asequible y no contaminante',
    shortTitle: 'Energía Limpia',
    color: '#FCC30B',
    contrastTextColor: '#000000',
    description: 'Garantizar el acceso a una energía asequible, segura, sostenible y moderna.',
    polarRelevance: 'Descarbonización de bases antárticas mediante energía solar polar, eólica y microrredes híbridas.',
    targets: [
      {
        id: '7.2',
        code: '7.2',
        title: 'Aumento de energías renovables',
        description: 'Aumentar considerablemente la proporción de energía renovable en el conjunto de fuentes energéticas.',
        polarContext: 'Reemplazo de generadores diésel en bases antárticas por energía eólica y fotovoltaica.',
      },
    ],
  },
  8: {
    number: 8,
    name: 'Trabajo decente y crecimiento económico',
    shortTitle: 'Trabajo Decente',
    color: '#A21942',
    contrastTextColor: '#FFFFFF',
    description: 'Promover el crecimiento económico inclusivo y sostenible, el empleo y el trabajo decente para todos.',
    polarRelevance: 'Operaciones antárticas seguras, estándares IAATO de turismo responsable y tripulaciones marítimas certificadas.',
    targets: [
      {
        id: '8.8',
        code: '8.8',
        title: 'Protección de los derechos laborales',
        description: 'Proteger los derechos laborales y promover un entorno de trabajo seguro y sin riesgos.',
        polarContext: 'Seguridad extrema y normativas del Código Polar de la OMI para marinos antárticos.',
      },
    ],
  },
  9: {
    number: 9,
    name: 'Industria, innovación e infraestructura',
    shortTitle: 'Innovación',
    color: '#FD6925',
    contrastTextColor: '#FFFFFF',
    description: 'Construir infraestructuras resilientes, promover la industrialización inclusiva y sostenible y fomentar la innovación.',
    polarRelevance: 'Cables submarinos científicos (SMART Cables), flotas de drones autónomos, boyas Argo y sensores satelitales.',
    targets: [
      {
        id: '9.5',
        code: '9.5',
        title: 'Fomento de la investigación científica',
        description: 'Aumentar la investigación científica y mejorar la capacidad tecnológica de los sectores industriales.',
        polarContext: 'Innovación instrumental autónoma en oceanografía física de aguas polares profundas.',
      },
    ],
  },
  10: {
    number: 10,
    name: 'Reducción de las desigualdades',
    shortTitle: 'Desigualdades',
    color: '#DD1367',
    contrastTextColor: '#FFFFFF',
    description: 'Reducir la desigualdad en y entre los países.',
    polarRelevance: 'Inclusión de países del Sur Global y programas antárticos emergentes (como el Programa Antártico Colombiano).',
    targets: [
      {
        id: '10.6',
        code: '10.6',
        title: 'Participación de países en desarrollo',
        description: 'Asegurar una mayor representación de los países en desarrollo en las instituciones mundiales.',
        polarContext: 'Membresía activa y capacidad de toma de decisiones en el Tratado Antártico y SCAR.',
      },
    ],
  },
  11: {
    number: 11,
    name: 'Ciudades y comunidades sostenibles',
    shortTitle: 'Comunidades',
    color: '#FD9D24',
    contrastTextColor: '#000000',
    description: 'Lograr que las ciudades y los asentamientos humanos sean inclusivos, seguros, resilientes y sostenibles.',
    polarRelevance: 'Resiliencia de ciudades gateway antárticas (Punta Arenas, Ushuaia, Hobart, Christchurch, Ciudad del Cabo).',
    targets: [
      {
        id: '11.5',
        code: '11.5',
        title: 'Reducción del impacto de desastres',
        description: 'Reducir significativamente las pérdidas causadas por los desastres en zonas costeras.',
        polarContext: 'Sistemas de alerta temprana ante desprendimiento de témpanos gigantes (icebergs).',
      },
    ],
  },
  12: {
    number: 12,
    name: 'Producción y consumo responsables',
    shortTitle: 'Consumo Responsable',
    color: '#BF8B2E',
    contrastTextColor: '#FFFFFF',
    description: 'Garantizar modalidades de consumo y producción sostenibles.',
    polarRelevance: 'Protocolo de Madrid al Tratado Antártico: gestión rigurosa de residuos y prohibición de plásticos.',
    targets: [
      {
        id: '12.4',
        code: '12.4',
        title: 'Gestión ecológica de desechos',
        description: 'Lograr la gestión ecológicamente racional de los productos químicos y de todos los desechos.',
        polarContext: 'Evacuación total de residuos biológicos e inorgánicos de las estaciones polares.',
      },
    ],
  },
  13: {
    number: 13,
    name: 'Acción por el clima',
    shortTitle: 'Acción Climática',
    color: '#3F7E44',
    contrastTextColor: '#FFFFFF',
    description: 'Adoptar medidas urgentes para combatir el cambio climático y sus efectos.',
    polarRelevance: 'El Océano Austral absorbe el 40% del CO2 oceánico antropogénico y el 75% del calor oceánico excedente.',
    targets: [
      {
        id: '13.1',
        code: '13.1',
        title: 'Resiliencia climática',
        description: 'Fortalecer la resiliencia y la capacidad de adaptación a los riesgos relacionados con el clima.',
        polarContext: 'Monitoreo del colapso de glaciares como Thwaites y Pine Island en la Antártida Occidental.',
      },
      {
        id: '13.3',
        code: '13.3',
        title: 'Educación y sensibilización',
        description: 'Mejorar la educación, la sensibilización y la capacidad humana e institucional sobre el cambio climático.',
        polarContext: 'Divulgación del rol polar en el sistema climático planetario.',
      },
    ],
  },
  14: {
    number: 14,
    name: 'Vida submarina',
    shortTitle: 'Vida Submarina',
    color: '#0A97D9',
    contrastTextColor: '#FFFFFF',
    description: 'Conservar y utilizar sosteniblemente los océanos, los mares y los recursos marinos.',
    polarRelevance: 'Protección de áreas marinas protegidas (MPA Mar de Ross) y monitoreo de acidificación del océano polar.',
    targets: [
      {
        id: '14.1',
        code: '14.1',
        title: 'Prevención de la contaminación marina',
        description: 'Prevenir y reducir significativamente la contaminación marina de todo tipo.',
        polarContext: 'Vigilancia de descargas de aguas de lastre y combustible pesado en aguas antárticas.',
      },
      {
        id: '14.2',
        code: '14.2',
        title: 'Gestión sostenible de ecosistemas marinos',
        description: 'Proteger sosteniblemente los ecosistemas marinos y costeros para evitar efectos adversos importantes.',
        polarContext: 'Creación de nuevas Áreas Marinas Protegidas (AMP) en la Península Antártica y Mar de Weddell.',
      },
      {
        id: '14.3',
        code: '14.3',
        title: 'Mitigación de la acidificación del océano',
        description: 'Minimizar y abordar los efectos de la acidificación de los océanos.',
        polarContext: 'Mediciones de pH y saturación de aragonita en aguas antárticas hipersaturadas.',
      },
      {
        id: '14.4',
        code: '14.4',
        title: 'Regulación de la pesca excesiva',
        description: 'Reglamentar eficazmente la explotación pesquera y poner fin a la pesca excesiva e ilegal (IUU).',
        polarContext: 'Fiscalización satelital y AIS de pesquerías de bacalao de profundidad y krill bajo CCAMLR.',
      },
    ],
  },
  15: {
    number: 15,
    name: 'Vida de ecosistemas terrestres',
    shortTitle: 'Ecosistemas',
    color: '#56C02B',
    contrastTextColor: '#FFFFFF',
    description: 'Proteger, restablecer y promover el uso sostenible de los ecosistemas terrestres.',
    polarRelevance: 'Preservación de oasis antárticos libres de hielo, musgos, líquenes y colonias reproductivas costeras.',
    targets: [
      {
        id: '15.5',
        code: '15.5',
        title: 'Detener la pérdida de biodiversidad',
        description: 'Adoptar medidas urgentes para reducir la degradación de los hábitats naturales.',
        polarContext: 'Prevención de introducción de especies biológicas invasoras en el continente blanco.',
      },
    ],
  },
  16: {
    number: 16,
    name: 'Paz, justicia e instituciones sólidas',
    shortTitle: 'Paz e Instituciones',
    color: '#00689D',
    contrastTextColor: '#FFFFFF',
    description: 'Promover sociedades pacíficas e inclusivas para el desarrollo sostenible.',
    polarRelevance: 'Tratado Antártico de 1959: desmilitarización absoluta, prohibición nuclear y ciencia para la paz.',
    targets: [
      {
        id: '16.a',
        code: '16.a',
        title: 'Fortalecimiento institucional pacífico',
        description: 'Fortalecer las instituciones pertinentes para prevenir la violencia y combatir el terrorismo y la delincuencia.',
        polarContext: 'Cumplimiento del Artículo I del Tratado Antártico: uso de la Antártida exclusivamente para fines pacíficos.',
      },
    ],
  },
  17: {
    number: 17,
    name: 'Alianzas para lograr los objetivos',
    shortTitle: 'Alianzas',
    color: '#19486A',
    contrastTextColor: '#FFFFFF',
    description: 'Fortalecer los medios de ejecución y revitalizar la Alianza Mundial para el Desarrollo Sostenible.',
    polarRelevance: 'Cooperación científica internacional: SCAR, COMNAP, intercambio de datos en tiempo real y buques compartidos.',
    targets: [
      {
        id: '17.6',
        code: '17.6',
        title: 'Cooperación científica y tecnológica',
        description: 'Mejorar la cooperación regional e internacional en materia de ciencia, tecnología e innovación.',
        polarContext: 'Campañas oceanográficas multinacionales y acceso abierto a datos de teledetección.',
      },
      {
        id: '17.18',
        code: '17.18',
        title: 'Aumento de datos de alta calidad',
        description: 'Mejorar la prestación de apoyo para el desarrollo de la capacidad estadística.',
        polarContext: 'Integración de series temporales oceanográficas en el Antarctic Master Directory.',
      },
    ],
  },
};

export const SDG_COLORS: Record<number, string> = {
  1: '#E5243B',
  2: '#DDA63A',
  3: '#4C9F38',
  4: '#C5192D',
  5: '#FF3A21',
  6: '#26BDE2',
  7: '#FCC30B',
  8: '#A21942',
  9: '#FD6925',
  10: '#DD1367',
  11: '#FD9D24',
  12: '#BF8B2E',
  13: '#3F7E44',
  14: '#0A97D9',
  15: '#56C02B',
  16: '#00689D',
  17: '#19486A',
};

export const LAYER_TO_SDG: Record<string, number> = {
  // Pesca y Océano (ODS 14)
  fisheries_effort: 14,
  maritime_vessels: 14,
  gfw_fishing_effort: 14,
  gfw_sar_detections: 14,
  gfw_vessel_presence: 14,
  gfw_encounters: 14,
  ocean_currents: 14,
  antarctic_fauna: 14,
  species_tracking: 14,
  argo_floats: 14,
  biodiversity_obis: 14,

  // Vida terrestre / Biodiversidad (ODS 15)
  biodiversity_atlas: 15,
  fauna_polar_all: 14,
  quantarctica_aspa: 15,
  rock_outcrops: 15,
  important_bird_areas: 15,
  acbrs: 15,
  fauna_penguins: 15,

  // Vida marina / Ecosistemas (ODS 14)
  emperor_penguin_colonies: 14,
  southern_ocean_fronts: 14,
  ccamlr_mpas: 14,
  ccamlr_zones: 14,
  fauna_benthos: 14,
  fauna_cetaceans: 14,
  fauna_fish: 14,
  fauna_krill: 14,
  fauna_schools_fish: 14,
  fauna_krill_swarms: 14,
  fauna_whale_pods: 14,
  fauna_pinnipeds: 14,
  fauna_seabirds: 14,
  strategic_waterways: 14,
  expedition_submersibles: 14,
  polar_autonomous_and_yachts: 14,

  // Clima, Atmósfera, Hielo, Glaciares (ODS 13)
  ozone_layer: 13,
  antarctic_ozone: 13,
  atmosphere: 13,
  aurora_australis: 13,
  polar_mesospheric_clouds: 13,
  polar_jet_stream: 13,
  wind_particles: 13,
  sea_ice_concentration: 13,
  median_sea_ice_extents: 13,
  cryosphere_ice: 13,
  glaciers: 13,
  quantarctica_glaciers: 13,
  glacier_velocity: 13,
  ice_shelves: 13,
  quantarctica_shelves: 13,

  // Industria, Innovación, Infraestructura (ODS 9)
  polar_aircraft: 9,
  polar_satellites: 9,
  submarine_cables: 9,
  quantarctica_stations: 9,
  stations: 9,
  comnap_facilities: 9,
  antarctic_heavy_traverses: 9,
  iaato_deep_field_camps: 9,
  seismic_events: 9,

  // Ciudades y Comunidades / Patrimonio Histórico (ODS 11)
  historic_stations: 11,
  historic_routes: 11,

  // Energía Limpia y Recursos (ODS 7)
  offshore_energy: 7,
  offshore_wells: 7,

  // Salud y Vigilancia Radiológica (ODS 3)
  maris_nuclear: 3,
  radionuclides_maris: 3,

  // Gobernanza, Tratados y Zonas Protegidas (ODS 16)
  aspa: 16,
  aspa_polygons: 16,
  asma: 16,
  asma_polygons: 16,
  governance_treaty: 16,
  treaty_claims: 16,
  ccamlr_statistical_areas: 16,
  grey_zones_defense: 16,
  polar_friction_sectors: 16,
  grey_zones_buffers: 16,
  subsurface_nuclear: 16,
  conflict_zones: 16,

  // Producción Responsable, Minerales y Minería Submarina (ODS 12)
  tourism_routes: 12,
  iaato_routes: 12,
  iaato_landing_sites: 12,
  influencer_tourism_footprint: 12,
  critical_minerals: 12,
  deepsea_mining: 12,

  // Alianzas y Ciencia de Campo (ODS 17)
  expedition_cruises: 17,
  field_observations: 17,
};

export const BASE_CARTOGRAPHY_LAYERS = new Set([
  'quantarctica_coast',
  'quantarctica_ice',
  'quantarctica_bathymetry',
  'coastline',
  'bathymetry',
  'bathymetry_contours',
  'ice_shelves',
  'ice-shelves',
  'quantarctica_shelves',
  'inach-territory-fill',
  'inach-territory-line',
  'inach-toponymy-symbol',
]);

export const CATEGORY_TO_SDG: Record<string, number> = {
  ACTIVITY: 14,
  ATMOSPHERE: 13,
  OCEAN: 14,
  ICE: 13,
  LIFE: 14,
  SCIENCE_EXPEDITIONS: 17,
  SENSORS: 9,
  INFRASTRUCTURE: 9,
  POLLUTION: 3,
  GOVERNANCE: 16,
  FIELD: 17,
};

export function getLayerSDGNumber(layerId: string, category?: string): number | null {
  if (BASE_CARTOGRAPHY_LAYERS.has(layerId)) {
    return null;
  }
  if (LAYER_TO_SDG[layerId]) {
    return LAYER_TO_SDG[layerId];
  }
  if (category && CATEGORY_TO_SDG[category]) {
    return CATEGORY_TO_SDG[category];
  }
  return null;
}

export function getLayerSDG(layerId: string, category?: string): SDGDefinition {
  const num = getLayerSDGNumber(layerId, category);
  return (num ? SDG_REGISTRY[num] : null) || SDG_REGISTRY[14];
}

export function getLayerSDGColor(layerId: string, category?: string): string {
  const num = getLayerSDGNumber(layerId, category);
  return (num ? SDG_COLORS[num] : null) || '#0A97D9';
}

export function getLayerSDGBadge(layerId: string, category?: string) {
  const sdg = getLayerSDG(layerId, category);
  return {
    number: sdg.number,
    name: sdg.name,
    shortTitle: sdg.shortTitle,
    color: sdg.color,
    textColor: sdg.contrastTextColor,
  };
}

export const MULTILINGUAL_SDG_NAMES: Record<string, Record<number, { name: string; shortTitle: string }>> = {
  es: {
    1: { name: 'Fin de la pobreza', shortTitle: 'Pobreza' },
    2: { name: 'Hambre cero', shortTitle: 'Hambre' },
    3: { name: 'Salud y bienestar', shortTitle: 'Salud' },
    4: { name: 'Educación de calidad', shortTitle: 'Educación' },
    5: { name: 'Igualdad de género', shortTitle: 'Género' },
    6: { name: 'Agua limpia y saneamiento', shortTitle: 'Agua Limpia' },
    7: { name: 'Energía asequible y no contaminante', shortTitle: 'Energía Limpia' },
    8: { name: 'Trabajo decente y crecimiento económico', shortTitle: 'Trabajo Decente' },
    9: { name: 'Industria, innovación e infraestructura', shortTitle: 'Innovación' },
    10: { name: 'Reducción de las desigualdades', shortTitle: 'Desigualdades' },
    11: { name: 'Ciudades y comunidades sostenibles', shortTitle: 'Comunidades' },
    12: { name: 'Producción y consumo responsables', shortTitle: 'Consumo Responsable' },
    13: { name: 'Acción por el clima', shortTitle: 'Acción Climática' },
    14: { name: 'Vida submarina', shortTitle: 'Vida Submarina' },
    15: { name: 'Vida de ecosistemas terrestres', shortTitle: 'Ecosistemas' },
    16: { name: 'Paz, justicia e instituciones sólidas', shortTitle: 'Paz y Justicia' },
    17: { name: 'Alianzas para lograr los objetivos', shortTitle: 'Alianzas' },
  },
  en: {
    1: { name: 'No Poverty', shortTitle: 'Poverty' },
    2: { name: 'Zero Hunger', shortTitle: 'Zero Hunger' },
    3: { name: 'Good Health and Well-being', shortTitle: 'Good Health' },
    4: { name: 'Quality Education', shortTitle: 'Education' },
    5: { name: 'Gender Equality', shortTitle: 'Equality' },
    6: { name: 'Clean Water and Sanitation', shortTitle: 'Clean Water' },
    7: { name: 'Affordable and Clean Energy', shortTitle: 'Clean Energy' },
    8: { name: 'Decent Work and Economic Growth', shortTitle: 'Decent Work' },
    9: { name: 'Industry, Innovation and Infrastructure', shortTitle: 'Innovation' },
    10: { name: 'Reduced Inequalities', shortTitle: 'Reduced Inequalities' },
    11: { name: 'Sustainable Cities and Communities', shortTitle: 'Communities' },
    12: { name: 'Responsible Consumption and Production', shortTitle: 'Responsible Consumption' },
    13: { name: 'Climate Action', shortTitle: 'Climate Action' },
    14: { name: 'Life Below Water', shortTitle: 'Life Below Water' },
    15: { name: 'Life on Land', shortTitle: 'Life on Land' },
    16: { name: 'Peace, Justice and Strong Institutions', shortTitle: 'Peace & Justice' },
    17: { name: 'Partnerships for the Goals', shortTitle: 'Partnerships' },
  },
  fr: {
    1: { name: 'Pas de pauvreté', shortTitle: 'Pauvreté' },
    2: { name: 'Faim "zéro"', shortTitle: 'Faim Zéro' },
    3: { name: 'Bonne santé et bien-être', shortTitle: 'Santé' },
    4: { name: 'Éducation de qualité', shortTitle: 'Éducation' },
    5: { name: 'Égalité entre les sexes', shortTitle: 'Égalité' },
    6: { name: 'Eau propre et assainissement', shortTitle: 'Eau Propre' },
    7: { name: 'Énergie propre et d\'un coût abordable', shortTitle: 'Énergie Propre' },
    8: { name: 'Travail décent et croissance économique', shortTitle: 'Travail Décent' },
    9: { name: 'Industrie, innovation et infrastructure', shortTitle: 'Innovation' },
    10: { name: 'Inégalités réduites', shortTitle: 'Inégalités' },
    11: { name: 'Villes et communautés durables', shortTitle: 'Villes Durables' },
    12: { name: 'Consommation et production responsables', shortTitle: 'Consommation' },
    13: { name: 'Lutte contre les changements climatiques', shortTitle: 'Action Climat' },
    14: { name: 'Vie aquatique', shortTitle: 'Vie Aquatique' },
    15: { name: 'Vie terrestre', shortTitle: 'Vie Terrestre' },
    16: { name: 'Paix, justice et institutions efficaces', shortTitle: 'Paix & Justice' },
    17: { name: 'Partenariats pour la réalisation des objectifs', shortTitle: 'Partenariats' },
  },
  de: {
    1: { name: 'Keine Armut', shortTitle: 'Armut' },
    2: { name: 'Kein Hunger', shortTitle: 'Hunger' },
    3: { name: 'Gesundheit und Wohlergehen', shortTitle: 'Gesundheit' },
    4: { name: 'Hochwertige Bildung', shortTitle: 'Bildung' },
    5: { name: 'Geschlechtergleichheit', shortTitle: 'Gleichheit' },
    6: { name: 'Sauberes Wasser und Sanitäreinrichtungen', shortTitle: 'Wasser' },
    7: { name: 'Bezahlbare und saubere Energie', shortTitle: 'Energie' },
    8: { name: 'Menschenwürdige Arbeit und Wirtschaftswachstum', shortTitle: 'Arbeit' },
    9: { name: 'Industrie, Innovation und Infrastruktur', shortTitle: 'Innovation' },
    10: { name: 'Weniger Ungleichheiten', shortTitle: 'Ungleichheiten' },
    11: { name: 'Nachhaltige Städte und Gemeinden', shortTitle: 'Städte' },
    12: { name: 'Nachhaltige/r Konsum und Produktion', shortTitle: 'Konsum' },
    13: { name: 'Maßnahmen zum Klimaschutz', shortTitle: 'Klimaschutz' },
    14: { name: 'Leben unter Wasser', shortTitle: 'Leben unter Wasser' },
    15: { name: 'Leben an Land', shortTitle: 'Leben an Land' },
    16: { name: 'Frieden, Gerechtigkeit und starke Institutionen', shortTitle: 'Frieden' },
    17: { name: 'Partnerschaften zur Erreichung der Ziele', shortTitle: 'Partnerschaften' },
  },
  zh: {
    1: { name: '无贫穷', shortTitle: '无贫穷' },
    2: { name: '零饥饿', shortTitle: '零饥饿' },
    3: { name: '良好健康与福祉', shortTitle: '健康福祉' },
    4: { name: '优质教育', shortTitle: '优质教育' },
    5: { name: '性别平等', shortTitle: '性别平等' },
    6: { name: '清洁饮水和卫生设施', shortTitle: '清洁饮水' },
    7: { name: '经济适用的清洁能源', shortTitle: '清洁能源' },
    8: { name: '体面工作和经济增长', shortTitle: '体面工作' },
    9: { name: '产业、创新和基础设施', shortTitle: '产业创新' },
    10: { name: '减少不平等', shortTitle: '减少不平等' },
    11: { name: '可持续城市和社区', shortTitle: '可持续社区' },
    12: { name: '负责任消费和生产', shortTitle: '负责任生产' },
    13: { name: '气候行动', shortTitle: '气候行动' },
    14: { name: '水下生物', shortTitle: '水下生物' },
    15: { name: '陆地生物', shortTitle: '陆地生物' },
    16: { name: '和平、正义与强大机构', shortTitle: '和平正义' },
    17: { name: '促进目标实现的伙伴关系', shortTitle: '全球伙伴' },
  },
  ru: {
    1: { name: 'Ликвидация нищеты', shortTitle: 'Нищета' },
    2: { name: 'Ликвидация голода', shortTitle: 'Голод' },
    3: { name: 'Хорошее здоровье и благополучие', shortTitle: 'Здоровье' },
    4: { name: 'Качественное образование', shortTitle: 'Образование' },
    5: { name: 'Гендерное равенство', shortTitle: 'Равенство' },
    6: { name: 'Чистая вода и санитария', shortTitle: 'Чистая вода' },
    7: { name: 'Недорогостоящая и чистая энергия', shortTitle: 'Энергия' },
    8: { name: 'Достойная работа и экономический рост', shortTitle: 'Работа' },
    9: { name: 'Индустриализация, инновации и инфраструктура', shortTitle: 'Инновации' },
    10: { name: 'Уменьшение неравенства', shortTitle: 'Неравенство' },
    11: { name: 'Устойчивые города и населенные пункты', shortTitle: 'Города' },
    12: { name: 'Ответственное потребление и производство', shortTitle: 'Потребление' },
    13: { name: 'Борьба с изменением климата', shortTitle: 'Климат' },
    14: { name: 'Сохранение морских экосистем', shortTitle: 'Морская жизнь' },
    15: { name: 'Сохранение экосистем суши', shortTitle: 'Экосистемы' },
    16: { name: 'Мир, правосудие и эффективные институты', shortTitle: 'Мир и право' },
    17: { name: 'Партнерство в интересах устойчивого развития', shortTitle: 'Партнерство' },
  },
};

export function getLocalizedSDG(num: number, lang: string = 'es'): { name: string; shortTitle: string } {
  const dict = MULTILINGUAL_SDG_NAMES[lang] || MULTILINGUAL_SDG_NAMES.es;
  return dict[num] || MULTILINGUAL_SDG_NAMES.es[num] || { name: `ODS ${num}`, shortTitle: `ODS ${num}` };
}


