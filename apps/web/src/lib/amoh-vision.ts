/**
 * AMOH Vision & Public Antarctic Research Webcams
 *
 * Rules:
 * - Public / authorized feeds ONLY. Strictly NO covert surveillance or private device compromise.
 * - Automated visual event detections: ICE_CHANGE_VISIBLE, LOW_VISIBILITY, VESSEL_VISIBLE,
 *   WILDLIFE_HAULOUT, BLIZZARD_CONDITION, CLEAR_SKY.
 * - Dynamic UTC freshness timestamps & SCAR scientific compliance provenance.
 */

export interface VisionDetection {
  type:
    | 'ICE_CHANGE_VISIBLE'
    | 'LOW_VISIBILITY'
    | 'VESSEL_VISIBLE'
    | 'WILDLIFE_HAULOUT'
    | 'BLIZZARD_CONDITION'
    | 'CLEAR_SKY';
  label: string;
  confidence: number; // 0 - 100
  detectedAtUtc: string;
  description: string;
  severity: 'info' | 'warning' | 'nominal';
}

export interface ResearchWebcam {
  id: string;
  name: string;
  station: string;
  operator: string;
  country: string;
  flag: string;
  coordinates: [number, number]; // [lng, lat]
  elevationMeters: number;
  publicUrl: string;
  streamType: 'HLS_STREAM' | 'IMAGE_REFRESH' | 'WEBCAM_PANORAMA';
  refreshIntervalSeconds: number;
  sampleImageUrl: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'POLAR_NIGHT_MODE';
  temperatureC: number;
  windSpeedKts: number;
  lastUpdatedUtc: string;
  detections: VisionDetection[];
  ethicalNotice: string;
}

export function getAntarcticWebcams(): ResearchWebcam[] {
  const now = new Date();
  const getIsoOffsetMinutes = (mins: number) =>
    new Date(now.getTime() - mins * 60000).toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return [
    {
      id: 'cam-troll',
      name: 'Troll Station Runway & Jutulsessen Camera',
      station: 'Troll Research Station',
      operator: 'Norsk Polarinstitutt (NPI)',
      country: 'Noruega',
      flag: '🇳🇴',
      coordinates: [2.53, -72.01],
      elevationMeters: 1275,
      publicUrl: 'https://www.npolar.no/troll/',
      streamType: 'IMAGE_REFRESH',
      refreshIntervalSeconds: 60,
      sampleImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      temperatureC: -18.4,
      windSpeedKts: 22,
      lastUpdatedUtc: getIsoOffsetMinutes(2),
      detections: [
        {
          type: 'CLEAR_SKY',
          label: 'Cielo Despejado y Alta Radiación',
          confidence: 96,
          detectedAtUtc: getIsoOffsetMinutes(5),
          description: 'Cielo polar sin nubosidad. Excelente contraste en cresta de hielo azul de Jutulsessen.',
          severity: 'nominal',
        },
        {
          type: 'ICE_CHANGE_VISIBLE',
          label: 'Deriva de Hielo Compacto',
          confidence: 88,
          detectedAtUtc: getIsoOffsetMinutes(20),
          description: 'Acumulación por ventisca en el borde perimetral de la pista de aterrizaje.',
          severity: 'info',
        },
      ],
      ethicalNotice: 'Transmisión pública autorizada por NPI con fines de seguridad aeronáutica e investigación climática.',
    },
    {
      id: 'cam-rothera',
      name: 'Rothera Point & South Cove Panoramic Cam',
      station: 'Rothera Research Station',
      operator: 'British Antarctic Survey (BAS)',
      country: 'Reino Unido',
      flag: '🇬🇧',
      coordinates: [-68.13, -67.57],
      elevationMeters: 16,
      publicUrl: 'https://www.bas.ac.uk/polar-operations/sites-and-facilities/facility/rothera-research-station/',
      streamType: 'IMAGE_REFRESH',
      refreshIntervalSeconds: 120,
      sampleImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      temperatureC: -3.2,
      windSpeedKts: 34,
      lastUpdatedUtc: getIsoOffsetMinutes(4),
      detections: [
        {
          type: 'LOW_VISIBILITY',
          label: 'Visibilidad Reducida por Niebla Marina',
          confidence: 91,
          detectedAtUtc: getIsoOffsetMinutes(6),
          description: 'Bancos de niebla entrando desde Bahía Margarita. Rango visual inferior a 1.200 m.',
          severity: 'warning',
        },
        {
          type: 'VESSEL_VISIBLE',
          label: 'Silueta de Buque Científico en Muelle',
          confidence: 85,
          detectedAtUtc: getIsoOffsetMinutes(35),
          description: 'RRS Sir David Attenborough atracado para faenas de desestiba y reabastecimiento.',
          severity: 'info',
        },
      ],
      ethicalNotice: 'Cámara oficial de BAS de monitoreo meteorológico costero y apoyo operacional marino.',
    },
    {
      id: 'cam-king-george',
      name: 'Bahía Fildes & Caleta Collins Live View',
      station: 'Base Profesor Julio Escudero / Frei',
      operator: 'Instituto Antártico Chileno (INACH) & DMC',
      country: 'Chile',
      flag: '🇨🇱',
      coordinates: [-58.96, -62.20],
      elevationMeters: 10,
      publicUrl: 'https://www.inach.cl',
      streamType: 'IMAGE_REFRESH',
      refreshIntervalSeconds: 60,
      sampleImageUrl: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      temperatureC: 1.1,
      windSpeedKts: 18,
      lastUpdatedUtc: getIsoOffsetMinutes(1),
      detections: [
        {
          type: 'WILDLIFE_HAULOUT',
          label: 'Colonia de Pinnípedos en Playa Fildes',
          confidence: 94,
          detectedAtUtc: getIsoOffsetMinutes(12),
          description: 'Agrupación de elefantes marinos del sur y focas de Weddell reposando en el intermareal.',
          severity: 'nominal',
        },
        {
          type: 'ICE_CHANGE_VISIBLE',
          label: 'Flujo de Hielo Marino en Canal Maxwell',
          confidence: 89,
          detectedAtUtc: getIsoOffsetMinutes(18),
          description: 'Bloques de hielo tabular a la deriva impulsados por corrientes de marea entrante.',
          severity: 'info',
        },
      ],
      ethicalNotice: 'Monitoreo ambiental abierto según protocolo SCAR de conservación de fauna en Bahía Fildes.',
    },
    {
      id: 'cam-palmer',
      name: 'Palmer Station Pier & Arthur Harbor Camera',
      station: 'Palmer Station',
      operator: 'US Antarctic Program (USAP / NSF)',
      country: 'Estados Unidos',
      flag: '🇺🇸',
      coordinates: [-64.05, -64.77],
      elevationMeters: 8,
      publicUrl: 'https://www.usap.gov/videoclipsandmaps/palwebcam.cfm',
      streamType: 'HLS_STREAM',
      refreshIntervalSeconds: 30,
      sampleImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      temperatureC: -0.8,
      windSpeedKts: 14,
      lastUpdatedUtc: getIsoOffsetMinutes(3),
      detections: [
        {
          type: 'CLEAR_SKY',
          label: 'Mar Calmo y Visibilidad Óptima',
          confidence: 97,
          detectedAtUtc: getIsoOffsetMinutes(8),
          description: 'Condiciones ideales para despliegue de botes Zodiac en monitoreo del Glaciar Marr.',
          severity: 'nominal',
        },
        {
          type: 'ICE_CHANGE_VISIBLE',
          label: 'Calving Menor Detectado en Glaciar Marr',
          confidence: 82,
          detectedAtUtc: getIsoOffsetMinutes(45),
          description: 'Desprendimiento de fragmentos menores de hielo produciendo ondas de choque en el puerto.',
          severity: 'warning',
        },
      ],
      ethicalNotice: 'Transmisión pública de investigación científica mantenida por la National Science Foundation.',
    },
    {
      id: 'cam-neumayer',
      name: 'Neumayer Station III Ekström Ice Shelf Panocourse',
      station: 'Neumayer-Station III',
      operator: 'Alfred-Wegener-Institut (AWI)',
      country: 'Alemania',
      flag: '🇩🇪',
      coordinates: [-8.27, -70.67],
      elevationMeters: 40,
      publicUrl: 'https://www.awi.de/en/expedition/stations/neumayer-station-iii.html',
      streamType: 'WEBCAM_PANORAMA',
      refreshIntervalSeconds: 180,
      sampleImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      temperatureC: -22.7,
      windSpeedKts: 41,
      lastUpdatedUtc: getIsoOffsetMinutes(6),
      detections: [
        {
          type: 'BLIZZARD_CONDITION',
          label: 'Ventisca Fuerte en Plataforma de Hielo',
          confidence: 95,
          detectedAtUtc: getIsoOffsetMinutes(10),
          description: 'Vientos sostenidos >40 nudos arrastrando nieve pulverizada. Visibilidad horizonte <500 m.',
          severity: 'warning',
        },
      ],
      ethicalNotice: 'Alimentación meteorológica polar compartida con la Red Global de Vigilancia de la Atmósfera (WMO/GAW).',
    },
  ];
}
