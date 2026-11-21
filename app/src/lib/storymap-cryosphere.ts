/**
 * AMOH — Cryosphere & Space Module: "The Antarctic from Space"
 * Derived from SatSchool & ArcGIS StoryMap (Slater & Fotheringham).
 * URL: https://storymaps.arcgis.com/stories/3bccba89dad7440baaa3afc97cd1359f
 */

export interface StoryChapter {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  scientificContext: string;
  satelliteSensors: string[];
  keyMetrics: { label: string; value: string }[];
  cameraPreset: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  };
  recommendedLayer?: string;
  interactiveAction?: string;
}

export const STORYMAP_CHAPTERS: StoryChapter[] = [
  {
    id: 'antarctica-overview',
    title: '1. La Antártica desde el Espacio',
    subtitle: 'El continente blanco visto por constelaciones en órbita polar',
    summary:
      'La Antártica es el lugar más frío, ventoso y seco de la Tierra, con un área de 14 millones de km². El 99% de su superficie está cubierta por una capa de hielo que contiene el 70% del agua dulce del planeta. Los satélites de órbita polar heliosincrónica son los únicos capaces de vigilar su evolución continua durante la noche polar.',
    scientificContext:
      'Si todo el manto de hielo antártico se derritiera, el nivel del mar global se elevaría aproximadamente 58 metros. El manto antártico oriental (EAIS) reposa mayoritariamente sobre tierra firme, mientras que el manto antártico occidental (WAIS) es un manto marino cuyo lecho rocoso yace cientos de metros bajo el nivel del mar, haciéndolo vulnerable a la inestabilidad marina.',
    satelliteSensors: ['Copernicus Sentinel-2', 'Landsat-8/9', 'NASA MODIS', 'PGC REMA Mosaics'],
    keyMetrics: [
      { label: 'Superficie Continental', value: '14,000,000 km²' },
      { label: 'Volumen de Hielo', value: '27,000,000 km³' },
      { label: 'Espesor Máximo', value: '4,892 m (Tierra Adelia)' },
      { label: 'Potencial Aumento Nivel del Mar', value: '+58.3 metros' },
    ],
    cameraPreset: {
      center: [0, -82],
      zoom: 3.2,
      pitch: 35,
      bearing: 0,
    },
    recommendedLayer: 'satellite-tiles',
  },
  {
    id: 'ice-sheets-shelves',
    title: '2. Manto de Hielo, Glaciares y Plataformas Flotantes',
    subtitle: 'La dinámica del hielo: desde las cúpulas centrales hasta el océano',
    summary:
      'La nieve se acumula en el interior formando hielo que fluye lentamente por gravedad hacia la costa a través de gigantescas corrientes de hielo y glaciares emisores. Al llegar al mar, forman plataformas de hielo flotantes (Ross, Ronne-Filchner, Amery, Larsen) que actúan como contrafuertes frenando la descarga hacia el océano.',
    scientificContext:
      'Cuando una plataforma de hielo se adelgaza o colapsa debido al agua cálida circumpolar profunda (CDW) que derrite su base, los glaciares tributarios en tierra se aceleran exponencialmente hacia el océano, acelerando la pérdida neta de masa.',
    satelliteSensors: ['CryoSat-2 SIRAL', 'ICESat-2 ATLAS', 'Sentinel-1 InSAR'],
    keyMetrics: [
      { label: 'Mayor Plataforma Flotante', value: 'Ross (487,000 km²)' },
      { label: 'Espesor en Frentes de Hielo', value: '200 a 800 m' },
      { label: 'Temperatura Mínima Registrada', value: '-89.2 °C (Vostok)' },
    ],
    cameraPreset: {
      center: [-175, -81.5],
      zoom: 4.5,
      pitch: 45,
      bearing: 15,
    },
    recommendedLayer: 'ice_shelves',
  },
  {
    id: 'glacier-speed-radar',
    title: '3. Velocidad del Hielo y Radares SAR (InSAR)',
    subtitle: 'Pine Island & Thwaites: el talón de Aquiles de la Antártica',
    summary:
      'Mediante interferometría de radar de apertura sintética (InSAR) con Sentinel-1, los científicos miden la velocidad del flujo del hielo con precisión milimétrica a través de las nubes y durante la noche polar invernal. Los glaciares Pine Island y Thwaites en el Mar de Amundsen fluyen a más de 3.5 km por año.',
    scientificContext:
      'La línea de apoyo (grounding line), donde el glaciar se despega del lecho rocoso y comienza a flotar, retrocede rápidamente hacia cuencas profundas continentales debido al retroceso forzado por el agua marina tibia.',
    satelliteSensors: ['Sentinel-1A/1B C-Band SAR', 'TanDEM-X', 'ALOS-2 PALSAR'],
    keyMetrics: [
      { label: 'Velocidad Glaciar Pine Island', value: '> 3,800 m / año' },
      { label: 'Aporte de Thwaites al nivel del mar', value: '4% global anual' },
      { label: 'Resolución InSAR Sentinel-1', value: '10 metros' },
    ],
    cameraPreset: {
      center: [-105, -75],
      zoom: 6.2,
      pitch: 50,
      bearing: -35,
    },
    recommendedLayer: 'glacier_velocity',
    interactiveAction: 'SWIPE_INSAR',
  },
  {
    id: 'satellites-altimetry',
    title: '4. Altimetría Satelital Láser y Radar',
    subtitle: 'CryoSat-2 & ICESat-2: pesando el hielo continental desde 500 km de altura',
    summary:
      'La altimetría satelital mide la elevación de la superficie del hielo enviando pulsos electromagnéticos y cronometrando su rebote. ICESat-2 utiliza micro-pulsos láser verdes (532 nm), detectando fotones individuales cada 70 cm en el suelo para mapear las grietas y adelgazamiento de las plataformas.',
    scientificContext:
      'La combinación de altímetros radar (CryoSat-2) que penetran la nieve superficial con altímetros lidar (ICESat-2) que rebotan en la superficie exacta permite calcular la densidad de la nieve y separar la acumulación meteorológica de la pérdida dinámica de hielo.',
    satelliteSensors: ['ICESat-2 ATLAS Laser', 'CryoSat-2 SIRAL Radar', 'GRACE-FO Gravimetry'],
    keyMetrics: [
      { label: 'Pulsos Láser ICESat-2', value: '10,000 pulsos / seg' },
      { label: 'Precisión Vertical', value: '< 3 centímetros' },
      { label: 'Pérdida de Masa Anual Antártica', value: '~150 Gt / año' },
    ],
    cameraPreset: {
      center: [-64, -66],
      zoom: 5.5,
      pitch: 42,
      bearing: 25,
    },
    recommendedLayer: 'quantarctica-aspa',
  },
  {
    id: 'wildlife-from-space',
    title: '5. Monitoreo de Fauna desde el Espacio',
    subtitle: 'Detectando colonias de Pingüinos Emperador por manchas de guano',
    summary:
      'Los pingüinos emperador se reproducen exclusivamente sobre el hielo marino durante el gélido invierno antártico (-40 °C). Son difíciles de visitar en persona, pero sus colonias dejan grandes manchas marrón-rojizas de guano sobre el hielo blanco, visibles en imágenes ópticas satelitales Sentinel-2 y Landsat.',
    scientificContext:
      'En 2020 y 2023, análisis de imágenes satelitales revelaron colonias nunca antes descubiertas, pero también mostraron catastróficas fallas reproductivas por la ruptura prematura del hielo marino antes de que los polluelos desarrollaran plumas impermeables.',
    satelliteSensors: ['Sentinel-2 MSI (Bandas NIR/Rojo)', 'WorldView-3 (0.3m HD)', 'PlanetScope'],
    keyMetrics: [
      { label: 'Colonias Conocidas Vía Satélite', value: '66 colonias globales' },
      { label: 'Colonias en AMOH / Quantarctica', value: '46 registradas' },
      { label: 'Población Total Estimada', value: '~250,000 parejas reproductoras' },
    ],
    cameraPreset: {
      center: [-61, -64.5],
      zoom: 7.8,
      pitch: 30,
      bearing: 10,
    },
    recommendedLayer: 'emperor_penguin_colonies',
  },
  {
    id: 'mcmurdo-dry-valleys',
    title: '6. Valles Secos de McMurdo y Roca Basal',
    subtitle: 'El desierto no cubierto por hielo y la anatomía oculta de la Antártica',
    summary:
      'A pesar del manto de hielo, existen áreas libres de hielo llamadas Valles Secos de McMurdo, barridas por vientos catabáticos a más de 300 km/h con humedad casi cero. Representan el análogo terrestre más cercano a la superficie de Marte.',
    scientificContext:
      'Bajo los 4 kilómetros de hielo yace un relieve rocoso milenario compuesto por cañones subglaciales, cadenas montañosas (Montañas Gamburtsev) y más de 400 lagos subglaciales de agua líquida aislados durante millones de años, como el Lago Vostok.',
    satelliteSensors: ['Bedmap2 / BedMachine', 'REMA v2.0 DEM', 'Airborne Ice-Penetrating Radar'],
    keyMetrics: [
      { label: 'Área Libre de Hielo', value: '< 0.35% del continente' },
      { label: 'Profundidad Cañón Subglacial Denman', value: '-3,500 m bajo el mar' },
      { label: 'Lago Vostok', value: '15,690 km² bajo 4 km de hielo' },
    ],
    cameraPreset: {
      center: [162.5, -77.5],
      zoom: 8.0,
      pitch: 55,
      bearing: 45,
    },
    recommendedLayer: 'rock_outcrops',
    interactiveAction: 'SWIPE_BEDROCK',
  },
];
