/**
 * AMOH — INACH (Instituto Antártico Chileno) Official Cartography & Toponymy
 * Derived from the official INACH Antarctic Map (authorized by DIFROL Res. Exenta Nº 43 / 2021).
 * 
 * Includes:
 * 1. Territorio Chileno Antártico Official Boundaries (53°W & 90°W to 90°S)
 * 2. South Shetland Islands (Islas Shetland del Sur) Inset with the 23 bases/refuges
 * 3. Complete Continental and Polar Research Stations
 * 4. High-precision Toponymy: Domes, Mountain Ranges, Ice Shelves, and Seas
 */

import type { FeatureCollection, Point, LineString, Polygon } from 'geojson';

export interface InachStation {
  index: number;
  name: string;
  officialName: string;
  country: string;
  countryCode: string;
  flag: string;
  islandSector: string;
  coordinates: [number, number]; // [lng, lat]
  status: 'permanent' | 'seasonal' | 'refuge' | 'field_camp';
  foundedYear?: number;
  description: string;
}

/** 
 * Islas Shetland del Sur — 23 Bases y Refugios según Inset Oficial INACH 
 */
export const INACH_SHETLAND_23_BASES: InachStation[] = [
  {
    index: 1,
    name: 'Refugio República del Ecuador',
    officialName: 'Refugio Ecuatoriano República del Ecuador',
    country: 'Ecuador',
    countryCode: 'ECU',
    flag: '🇪🇨',
    islandSector: 'Isla Rey Jorge (Bahía Maxwell)',
    coordinates: [-58.9167, -62.2000],
    status: 'refuge',
    foundedYear: 1990,
    description: 'Refugio de apoyo para investigaciones científicas ecuatorianas en Maxwell Bay.',
  },
  {
    index: 2,
    name: 'Comandante Ferraz',
    officialName: 'Estação Antártica Comandante Ferraz (EACF)',
    country: 'Brasil',
    countryCode: 'BRA',
    flag: '🇧🇷',
    islandSector: 'Isla Rey Jorge (Bahía Almirantazgo)',
    coordinates: [-58.3917, -62.0833],
    status: 'permanent',
    foundedYear: 1984,
    description: 'Estación científica permanente brasileña con modernos laboratorios de biología y meteorología.',
  },
  {
    index: 3,
    name: 'Machu Picchu',
    officialName: 'Estación de Investigación Machu Picchu',
    country: 'Perú',
    countryCode: 'PER',
    flag: '🇵🇪',
    islandSector: 'Isla Rey Jorge (Ensenada Mackellar)',
    coordinates: [-58.4683, -62.0917],
    status: 'seasonal',
    foundedYear: 1989,
    description: 'Centro polar peruano enfocado en oceanografía y glaciología en la Bahía Almirantazgo.',
  },
  {
    index: 4,
    name: 'Henryk Arctowski',
    officialName: 'Polska Stacja Antarktyczna im. Henryka Arctowskiego',
    country: 'Polonia',
    countryCode: 'POL',
    flag: '🇵🇱',
    islandSector: 'Isla Rey Jorge (Punta Thomas)',
    coordinates: [-58.4600, -62.2300],
    status: 'permanent',
    foundedYear: 1977,
    description: 'Estación permanente de la Academia Polaca de Ciencias; monitoreo a largo plazo de fauna marina.',
  },
  {
    index: 5,
    name: 'Base Carlini',
    officialName: 'Base Científica Carlini (ex Jubany)',
    country: 'Argentina',
    countryCode: 'ARG',
    flag: '🇦🇷',
    islandSector: 'Isla Rey Jorge (Caleta Potter)',
    coordinates: [-58.6667, -62.2333],
    status: 'permanent',
    foundedYear: 1953,
    description: 'Estación científica permanente argentina con acuario de biología marina y monitoreo sismológico.',
  },
  {
    index: 6,
    name: 'Laboratorio Dallmann',
    officialName: 'Dallmann Laboratory (AWI / IAA)',
    country: 'Alemania / Argentina',
    countryCode: 'DEU',
    flag: '🇩🇪',
    islandSector: 'Isla Rey Jorge (Caleta Potter)',
    coordinates: [-58.6660, -62.2330],
    status: 'seasonal',
    foundedYear: 1994,
    description: 'Centro binacional operado conjuntamente por el Instituto Alfred Wegener y el Instituto Antártico Argentino.',
  },
  {
    index: 7,
    name: 'King Sejong',
    officialName: 'King Sejong Station',
    country: 'Corea del Sur',
    countryCode: 'KOR',
    flag: '🇰🇷',
    islandSector: 'Isla Rey Jorge (Península Barton)',
    coordinates: [-58.7875, -62.2239],
    status: 'permanent',
    foundedYear: 1988,
    description: 'Estación permanente operada por KOPRI; monitoreo de atmósfera superior y biodiversidad bentónica.',
  },
  {
    index: 8,
    name: 'Base Artigas',
    officialName: 'Base Científica Antártica Artigas (BCAA)',
    country: 'Uruguay',
    countryCode: 'URY',
    flag: '🇺🇾',
    islandSector: 'Isla Rey Jorge (Península Fildes)',
    coordinates: [-58.9036, -62.1847],
    status: 'permanent',
    foundedYear: 1984,
    description: 'Base permanente uruguaya con estación meteorológica e investigación ambiental en Fildes.',
  },
  {
    index: 9,
    name: 'Bellingshausen',
    officialName: 'Bellingshausen Station',
    country: 'Rusia',
    countryCode: 'RUS',
    flag: '🇷🇺',
    islandSector: 'Isla Rey Jorge (Península Fildes)',
    coordinates: [-58.9600, -62.2000],
    status: 'permanent',
    foundedYear: 1968,
    description: 'Estación permanente rusa vecina a Base Frei, incluye la histórica Iglesia de la Santísima Trinidad.',
  },
  {
    index: 10,
    name: 'Eduardo Frei Montalva',
    officialName: 'Base Aérea Presidente Eduardo Frei Montalva',
    country: 'Chile',
    countryCode: 'CHL',
    flag: '🇨🇱',
    islandSector: 'Isla Rey Jorge (Península Fildes)',
    coordinates: [-58.9833, -62.1917],
    status: 'permanent',
    foundedYear: 1969,
    description: 'Principal centro logístico antártico chileno operado por la FACH; incluye pista de aterrizaje Teniente Rodolfo Marsh y Villa Las Estrellas.',
  },
  {
    index: 11,
    name: 'Profesor Julio Escudero',
    officialName: 'Base Científica Profesor Julio Escudero (INACH)',
    country: 'Chile',
    countryCode: 'CHL',
    flag: '🇨🇱',
    islandSector: 'Isla Rey Jorge (Península Fildes)',
    coordinates: [-58.9636, -62.2014],
    status: 'permanent',
    foundedYear: 1994,
    description: 'Sede científica permanente del Instituto Antártico Chileno (INACH); laboratorios de microbiología, paleobotánica y cambio climático.',
  },
  {
    index: 12,
    name: 'Gran Muralla (Great Wall)',
    officialName: 'Great Wall Station',
    country: 'China',
    countryCode: 'CHN',
    flag: '🇨🇳',
    islandSector: 'Isla Rey Jorge (Península Fildes)',
    coordinates: [-58.9633, -62.2167],
    status: 'permanent',
    foundedYear: 1985,
    description: 'Primera estación polar china en la Antártida; estudios geomagnéticos, oceanográficos y ecológicos.',
  },
  {
    index: 13,
    name: 'Refugio Ripamonti',
    officialName: 'Refugio Julio Ripamonti (INACH)',
    country: 'Chile',
    countryCode: 'CHL',
    flag: '🇨🇱',
    islandSector: 'Isla Rey Jorge (Bahía Ardley / ASPA 150)',
    coordinates: [-58.9333, -62.2083],
    status: 'refuge',
    foundedYear: 1982,
    description: 'Refugio de investigación biológica para el monitoreo de colonias de pingüinos papúa y adelia en la Isla Ardley.',
  },
  {
    index: 14,
    name: 'Refugio Luis Risopatrón',
    officialName: 'Refugio Luis Risopatrón (INACH)',
    country: 'Chile',
    countryCode: 'CHL',
    flag: '🇨🇱',
    islandSector: 'Isla Robert (Península Coppermine)',
    coordinates: [-59.7000, -62.3667],
    status: 'refuge',
    foundedYear: 1954,
    description: 'Refugio del INACH en la Península Coppermine (ASPA 112); investigación geológica y botánica.',
  },
  {
    index: 15,
    name: 'Pedro Vicente Maldonado',
    officialName: 'Estación Científica Pedro Vicente Maldonado',
    country: 'Ecuador',
    countryCode: 'ECU',
    flag: '🇪🇨',
    islandSector: 'Isla Greenwich (Bahía Guayaquil)',
    coordinates: [-59.7436, -62.4497],
    status: 'seasonal',
    foundedYear: 1990,
    description: 'Estación científica ecuatoriana operada por el INOCAR; investigaciones glaciológicas y oceanográficas.',
  },
  {
    index: 16,
    name: 'Arturo Prat',
    officialName: 'Base Naval Capitán Arturo Prat (Armada de Chile)',
    country: 'Chile',
    countryCode: 'CHL',
    flag: '🇨🇱',
    islandSector: 'Isla Greenwich (Bahía Chile)',
    coordinates: [-59.6644, -62.4792],
    status: 'permanent',
    foundedYear: 1947,
    description: 'La base antártica chilena más antigua; centro de soberanía científica, meteorología y apoyo marítimo de la Armada de Chile.',
  },
  {
    index: 17,
    name: 'Base Cámara',
    officialName: 'Base de Verano Teniente Cámara',
    country: 'Argentina',
    countryCode: 'ARG',
    flag: '🇦🇷',
    islandSector: 'Isla Media Luna (Half Moon Island)',
    coordinates: [-59.9167, -62.5917],
    status: 'seasonal',
    foundedYear: 1953,
    description: 'Estación de verano argentina en el Estrecho de McFarlane; monitoreo de colonias de pingüinos de barbijo.',
  },
  {
    index: 18,
    name: 'St. Kliment Ohridski',
    officialName: 'San Clemente de Ohrid (Bulgaria)',
    country: 'Bulgaria',
    countryCode: 'BGR',
    flag: '🇧🇬',
    islandSector: 'Isla Livingston (Bahía Emona)',
    coordinates: [-60.3667, -62.6417],
    status: 'seasonal',
    foundedYear: 1988,
    description: 'Base de investigación científica del Instituto Antártico Búlgaro en Livingston.',
  },
  {
    index: 19,
    name: 'Juan Carlos I',
    officialName: 'Base Antártica Juan Carlos I (CSIC)',
    country: 'España',
    countryCode: 'ESP',
    flag: '🇪🇸',
    islandSector: 'Isla Livingston (Bahía Sur)',
    coordinates: [-60.3833, -62.6639],
    status: 'seasonal',
    foundedYear: 1988,
    description: 'Estación polar española gestionada por el CSIC; estudios de geodinámica, permafrost y biología de líquenes.',
  },
  {
    index: 20,
    name: 'Dr. Guillermo Mann',
    officialName: 'Campamento Científico Dr. Guillermo Mann (INACH)',
    country: 'Chile',
    countryCode: 'CHL',
    flag: '🇨🇱',
    islandSector: 'Isla Livingston (Cabo Shirreff / ASPA 149)',
    coordinates: [-60.7833, -62.4667],
    status: 'seasonal',
    foundedYear: 1991,
    description: 'Campamento científico de alta importancia ecológica; monitoreo intensivo conjunto Chile-EE.UU. de focas y aves marinas.',
  },
  {
    index: 21,
    name: 'Base Decepción',
    officialName: 'Base Decepción (Fuerza Aérea / EA)',
    country: 'Argentina',
    countryCode: 'ARG',
    flag: '🇦🇷',
    islandSector: 'Isla Decepción (Bahía 1º de Mayo)',
    coordinates: [-60.6833, -62.9750],
    status: 'seasonal',
    foundedYear: 1948,
    description: 'Estación de verano argentina en el interior de la caldera volcánica de Decepción; vigilancia sismológica y vulcanológica.',
  },
  {
    index: 22,
    name: 'Gabriel de Castilla',
    officialName: 'Base Antártica Gabriel de Castilla (Ejército de Tierra)',
    country: 'España',
    countryCode: 'ESP',
    flag: '🇪🇸',
    islandSector: 'Isla Decepción (Bahía Fumarolas)',
    coordinates: [-60.5667, -62.9778],
    status: 'seasonal',
    foundedYear: 1989,
    description: 'Estación estival militar y científica española; monitoreo sísmico-volcánico de la caldera activa de Decepción.',
  },
  {
    index: 23,
    name: 'Campamento Byers Peninsula',
    officialName: 'International Field Camp Byers Peninsula (ASPA 126)',
    country: 'España / Internacional',
    countryCode: 'ESP',
    flag: '🇪🇸',
    islandSector: 'Isla Livingston (Península Byers)',
    coordinates: [-61.0833, -62.6667],
    status: 'field_camp',
    foundedYear: 2001,
    description: 'Campamento temporal en la mayor área libre de hielo de las Shetland; estudios limnológicos y geomorfológicos.',
  },
];

/**
 * Territorio Chileno Antártico (53°W - 90°W hasta Polo Sur 90°S)
 */
export const INACH_CHILEAN_TERRITORY_FC: FeatureCollection<Polygon | LineString, any> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-90.0, -90.0],
            [-90.0, -60.0],
            [-53.0, -60.0],
            [-53.0, -90.0],
            [-90.0, -90.0],
          ],
        ],
      },
      properties: {
        name: 'Territorio Chileno Antártico',
        shortName: 'T.Ch.A.',
        authority: 'INACH / Ministerio de Relaciones Exteriores / DIFROL Res. Exenta 43 (2021)',
        meridianWest: '90° W',
        meridianEast: '53° W',
        parallelNorth: '60° S',
        status: 'Reclamación Soberana de Chile bajo el Artículo IV del Tratado Antártico (Paz y Ciencia)',
        area_km2: 1250257,
      },
    },
    // Meridian 53° W Line
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-53.0, -60.0],
          [-53.0, -70.0],
          [-53.0, -80.0],
          [-53.0, -90.0],
        ],
      },
      properties: {
        name: 'Límite Oriental Territorio Chileno Antártico (Meridiano 53° O)',
        meridian: '53° W',
        type: 'boundary_line',
      },
    },
    // Meridian 90° W Line
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-90.0, -60.0],
          [-90.0, -70.0],
          [-90.0, -80.0],
          [-90.0, -90.0],
        ],
      },
      properties: {
        name: 'Límite Occidental Territorio Chileno Antártico (Meridiano 90° O)',
        meridian: '90° W',
        type: 'boundary_line',
      },
    },
  ],
};

/**
 * Toponimia Completa de la Antártida según Mapa Oficial INACH (Domos, Cordilleras, Plataformas, Mares)
 */
export const INACH_TOPONYMY_FC: FeatureCollection<Point, { name: string; category: string; elevation_or_type: string }> = {
  type: 'FeatureCollection',
  features: [
    // Domos (Grandes domos de hielo continentales)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [123.35, -75.10] }, properties: { name: 'Domo Charlie (Dome C)', category: 'Domo de Hielo', elevation_or_type: '3,233 m · EPICA Core' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [169.00, -88.50] }, properties: { name: 'Domo Titán', category: 'Domo de Hielo', elevation_or_type: '3,100 m' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [105.00, -86.00] }, properties: { name: 'Domo Hércules', category: 'Domo de Hielo', elevation_or_type: '2,900 m' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-149.00, -81.60] }, properties: { name: 'Domo Siple', category: 'Domo de Hielo', elevation_or_type: '621 m · WAIS' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [135.00, -77.20] }, properties: { name: 'Domo Valkyrie (Dome F)', category: 'Domo de Hielo', elevation_or_type: '3,810 m' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.50, -80.36] }, properties: { name: 'Domo Angus (Dome A)', category: 'Domo de Hielo', elevation_or_type: '4,093 m · Punto más alto del manto' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [112.80, -66.73] }, properties: { name: 'Domo Law', category: 'Domo de Hielo', elevation_or_type: '1,390 m' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [39.70, -77.31] }, properties: { name: 'Domo Fuji', category: 'Domo de Hielo', elevation_or_type: '3,810 m' } },

    // Cordilleras & Montes Principales
    { type: 'Feature', geometry: { type: 'Point', coordinates: [170.00, -84.00] }, properties: { name: 'Montañas Transantárticas', category: 'Cordillera', elevation_or_type: 'Divide Antártica Oriental y Occidental' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-86.00, -78.50] }, properties: { name: 'Montes Ellsworth (Macizo Vinson)', category: 'Cordillera', elevation_or_type: '4,892 m · Punto culminante continental' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-90.20, -85.20] }, properties: { name: 'Montes Thiel', category: 'Cordillera', elevation_or_type: '2,810 m' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-80.50, -80.30] }, properties: { name: 'Patriot Hills / Union Glacier', category: 'Montes', elevation_or_type: '1,250 m · Pista en hielo azul' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-105.00, -85.50] }, properties: { name: 'Montes Horlick', category: 'Cordillera', elevation_or_type: '3,940 m' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [167.15, -77.53] }, properties: { name: 'Monte Erebus', category: 'Volcán Activo', elevation_or_type: '3,794 m · Lago de lava persistente' } },

    // Plataformas de Hielo
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-175.00, -81.50] }, properties: { name: 'Barrera de Hielo de Ross', category: 'Plataforma de Hielo', elevation_or_type: '487,000 km² · Mayor del planeta' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-60.00, -77.50] }, properties: { name: 'Barrera de Hielo Ronne-Filchner', category: 'Plataforma de Hielo', elevation_or_type: '422,000 km²' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [71.00, -69.80] }, properties: { name: 'Barrera de Hielo Amery', category: 'Plataforma de Hielo', elevation_or_type: 'Drenaje del Glaciar Lambert' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-62.00, -67.50] }, properties: { name: 'Plataforma de Hielo Larsen C', category: 'Plataforma de Hielo', elevation_or_type: 'Desprendimiento de icebergs gigantes A-68' } },

    // Puntos Geográficos Notables
    { type: 'Feature', geometry: { type: 'Point', coordinates: [0.00, -90.00] }, properties: { name: 'POLO SUR GEOGRÁFICO', category: 'Polo', elevation_or_type: '90°00′S · 2,835 m' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [82.10, -82.13] }, properties: { name: 'Polo de Inaccesibilidad', category: 'Polo', elevation_or_type: 'Punto más distante del océano (3,718 m)' } },
  ],
};
