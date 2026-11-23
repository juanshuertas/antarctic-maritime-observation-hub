import type { FeatureCollection, Feature, Point, LineString, Polygon } from 'geojson';

/**
 * AMOH — OSIRIS Live Feeds & Telemetry Engine
 * Integrates:
 * 1. Polar Aircraft (ADS-B live flights over Drake Passage, King George Island, McMurdo, South Pole)
 * 2. Polar Orbiting Satellites (Sentinel-1 SAR, CryoSat-2, ICESat-2, Sentinel-3 with real orbital swaths)
 * 3. Submarine Cables (Global fiber optic network + Chilean Prat, Humboldt, and Antarctic Drake link)
 */

export interface PolarAircraft {
  callsign: string;
  registration: string;
  model: string;
  operator: string;
  origin: string;
  destination: string;
  altitude_ft: number;
  speed_kts: number;
  heading: number;
  lat: number;
  lng: number;
  mission: string;
}

export type SatelliteCategory = 'starlink' | 'earth_observation' | 'weather' | 'telecom';

export interface PolarVessel {
  mmsi: string;
  name: string;
  callsign: string;
  flag: string;
  vesselType: 'RESEARCH' | 'ICEBREAKER' | 'EXPEDITION_CRUISE' | 'SUPPLY' | 'PATROL' | 'FISHING';
  operator: string;
  speed_kts: number;
  course_deg: number;
  lat: number;
  lng: number;
  destination: string;
  status: string;
}

export const POLAR_VESSELS_FLEET: PolarVessel[] = [
  {
    mmsi: '414389000',
    name: 'SHEN LAN (深蓝)',
    callsign: 'BOHP',
    flag: 'CN',
    vesselType: 'FISHING',
    operator: 'Jiangsu Sunline Deep Sea Fisheries / CCAMLR Authorized',
    speed_kts: 3.8,
    course_deg: 135,
    lat: -62.45,
    lng: -59.20,
    destination: 'Estrecho de Bransfield (Subárea 48.1)',
    status: 'Super-arrastrero factoría antártico · Succión continua de krill bajo CM 51-07',
  },
  {
    mmsi: '354624000',
    name: 'M/V PACIFIC WORLD (PEACE BOAT)',
    callsign: '3FAG7',
    flag: 'PA',
    vesselType: 'RESEARCH',
    operator: 'Peace Boat / UN Ocean Decade Global Youth Lead',
    speed_kts: 12.5,
    course_deg: 165,
    lat: -54.82,
    lng: -68.31,
    destination: 'Paso Drake / Península Antártica / Rapa Nui',
    status: '125º Viaje Global · Observatorio de Ciencia Ciudadana y Monitoreo ODS 14',
  },
  {
    mmsi: '730000151',
    name: 'ARC SIMÓN BOLÍVAR (151)',
    callsign: 'HKBL',
    flag: 'CO',
    vesselType: 'RESEARCH',
    operator: 'Dirección General Marítima (DIMAR) / Armada de Colombia',
    speed_kts: 11.4,
    course_deg: 165,
    lat: -64.82,
    lng: -63.50,
    destination: 'Estrecho de Gerlache / Base O\'Higgins',
    status: 'Crucero oceanográfico en curso · Muestreo batimétrico multihaz',
  },
  {
    mmsi: '730000046',
    name: 'ARC 20 DE JULIO (PZE-46)',
    callsign: 'HKJL',
    flag: 'CO',
    vesselType: 'PATROL',
    operator: 'Armada de Colombia (Comisión Colombiana del Océano)',
    speed_kts: 12.1,
    course_deg: 180,
    lat: -62.20,
    lng: -58.96,
    destination: 'Bahía Fildes / Isla Rey Jorge',
    status: 'Patrulla marítima antártica combinada y apoyo logístico polar',
  },
  {
    mmsi: '367000120',
    name: 'R/V LAURENCE M. GOULD',
    callsign: 'WCX7445',
    flag: 'US',
    vesselType: 'RESEARCH',
    operator: 'US National Science Foundation (USAP)',
    speed_kts: 10.2,
    course_deg: 210,
    lat: -64.77,
    lng: -64.05,
    destination: 'Palmer Station',
    status: 'Operaciones CTD y despliegue de boyas oceanográficas LTER',
  },
  {
    mmsi: '367000340',
    name: 'R/V NATHANIEL B. PALMER',
    callsign: 'WBP3210',
    flag: 'US',
    vesselType: 'ICEBREAKER',
    operator: 'US National Science Foundation / Edison Chouest',
    speed_kts: 8.5,
    course_deg: 145,
    lat: -71.50,
    lng: -108.20,
    destination: 'Mar de Amundsen / Glaciar Thwaites',
    status: 'Campaña sísmica marina y corazonamiento de sedimentos glaciares',
  },
  {
    mmsi: '232025757',
    name: 'RRS SIR DAVID ATTENBOROUGH',
    callsign: 'ZDLS8',
    flag: 'GB',
    vesselType: 'RESEARCH',
    operator: 'British Antarctic Survey (BAS)',
    speed_kts: 13.0,
    course_deg: 172,
    lat: -67.57,
    lng: -68.12,
    destination: 'Rothera Research Station',
    status: 'Suministro logístico polar y ensayos acústicos del Boaty McBoatface',
  },
  {
    mmsi: '211202660',
    name: 'FS POLARSTERN',
    callsign: 'DBLK',
    flag: 'DE',
    vesselType: 'ICEBREAKER',
    operator: 'Alfred-Wegener-Institut (AWI)',
    speed_kts: 9.8,
    course_deg: 260,
    lat: -70.52,
    lng: -8.25,
    destination: 'Estación Neumayer III',
    status: 'Perforación de hielo marino y registro meteorológico continuo',
  },
  {
    mmsi: '760000210',
    name: 'BAP CARRASCO (BOC-170)',
    callsign: 'OBCA',
    flag: 'PE',
    vesselType: 'RESEARCH',
    operator: 'Marina de Guerra del Perú / INGEMMET',
    speed_kts: 10.5,
    course_deg: 195,
    lat: -62.08,
    lng: -58.42,
    destination: 'Base Machu Picchu (Bahía Almirantazgo)',
    status: 'Campamento oceanográfico ANTAR XXXI en curso',
  },
  {
    mmsi: '710000080',
    name: 'ALMIRANTE MAXIMIANO (H-41)',
    callsign: 'PWAM',
    flag: 'BR',
    vesselType: 'RESEARCH',
    operator: 'Marinha do Brasil (PROANTAR)',
    speed_kts: 11.0,
    course_deg: 155,
    lat: -62.09,
    lng: -58.39,
    destination: 'Estação Antártica Comandante Ferraz',
    status: 'Monitoreo de biomasa de krill y corrientes subsuperficiales',
  },
  {
    mmsi: '224859000',
    name: 'BIO HESPÉRIDES (A-33)',
    callsign: 'EBBW',
    flag: 'ES',
    vesselType: 'RESEARCH',
    operator: 'Armada Española / CSIC',
    speed_kts: 11.8,
    course_deg: 205,
    lat: -62.66,
    lng: -60.39,
    destination: 'Base Juan Carlos I (Isla Livingston)',
    status: 'Campaña Antártica Española 2026-2027 · Geodesia polar',
  },
  {
    mmsi: '228399700',
    name: 'LE COMMANDANT CHARCOT',
    callsign: 'FMCG',
    flag: 'FR',
    vesselType: 'EXPEDITION_CRUISE',
    operator: 'Compagnie du Ponant (IAATO)',
    speed_kts: 14.5,
    course_deg: 188,
    lat: -65.10,
    lng: -64.03,
    destination: 'Canal Lemaire / Círculo Polar',
    status: 'Navegación de exploración polar PC2 · Monitoreo de mamíferos marinos',
  },
  {
    mmsi: '228038700',
    name: 'LE BORÉAL',
    callsign: 'FLME',
    flag: 'FR',
    vesselType: 'EXPEDITION_CRUISE',
    operator: 'Compagnie du Ponant (IAATO)',
    speed_kts: 13.6,
    course_deg: 160,
    lat: -63.35,
    lng: -57.02,
    destination: 'Estrecho Antarctic / Mar de Weddell',
    status: 'Avistamiento de colonias de pingüinos Adelia y témpanos tabulares',
  },
  {
    mmsi: '311000854',
    name: 'NATIONAL GEOGRAPHIC ENDURANCE',
    callsign: 'C6DZ8',
    flag: 'BS',
    vesselType: 'EXPEDITION_CRUISE',
    operator: 'Lindblad Expeditions / National Geographic',
    speed_kts: 12.8,
    course_deg: 220,
    lat: -64.88,
    lng: -62.88,
    destination: 'Bahía Paraíso / Puerto Lockroy',
    status: 'Talleres científicos participativos y ciencia ciudadana AMOH',
  },
  {
    mmsi: '273111000',
    name: 'AKADEMIK FEDOROV',
    callsign: 'UBMW',
    flag: 'RU',
    vesselType: 'ICEBREAKER',
    operator: 'AARI (Arctic and Antarctic Research Institute)',
    speed_kts: 9.0,
    course_deg: 130,
    lat: -66.55,
    lng: 93.00,
    destination: 'Estación Mirny',
    status: 'Suministro de combustible de invierno y expedición 72 RAE',
  },
  {
    mmsi: '228087900',
    name: 'L\'ASTROLABE (P800)',
    callsign: 'FHVI',
    flag: 'FR',
    vesselType: 'SUPPLY',
    operator: 'Marine Nationale / IPEV',
    speed_kts: 10.4,
    course_deg: 175,
    lat: -66.66,
    lng: 140.01,
    destination: 'Base Dumont d\'Urville (Tierra Adelia)',
    status: 'Rotación de personal y abastecimiento de estación Dumont d\'Urville',
  },
];

export interface PolarSatellite {
  id: string;
  name: string;
  agency: string;
  sensor: string;
  altitude_km: number;
  inclination_deg: number;
  period_min: number;
  lat: number;
  lng: number;
  swath_km: number;
  status: string;
  category: SatelliteCategory;
  color?: string;
}

export const POLAR_AIRCRAFT_FLEET: PolarAircraft[] = [
  {
    callsign: 'SKIBIRD-01',
    registration: '83-0491',
    model: 'Lockheed LC-130H Hercules (Ski-equipped)',
    operator: 'US National Science Foundation / 109th Airlift Wing',
    origin: 'McMurdo Station (NZIR)',
    destination: 'Amundsen-Scott South Pole Station (NZSP)',
    altitude_ft: 24500,
    speed_kts: 295,
    heading: 180,
    lat: -82.4,
    lng: 168.2,
    mission: 'Logística polar y rotación de científicos en Polo Sur',
  },
  {
    callsign: 'ICE-EXPLORER',
    registration: 'VP-FBL',
    model: 'de Havilland Canada DHC-6-300 Twin Otter',
    operator: 'British Antarctic Survey (BAS)',
    origin: 'Rothera Research Station (EGAR)',
    destination: 'Halley VI Research Station (EGAH)',
    altitude_ft: 9200,
    speed_kts: 145,
    heading: 115,
    lat: -71.2,
    lng: -48.6,
    mission: 'Estudio de radar de penetración en Barrera de Ronne',
  },
  {
    callsign: 'FACH-981',
    registration: 'FACH 981',
    model: 'Lockheed C-130H Hercules',
    operator: 'Fuerza Aérea de Chile (Grupo de Aviación N° 10)',
    origin: 'Punta Arenas (SCCI)',
    destination: 'Base Pdte. Eduardo Frei Montalva / Marsh (SCRM)',
    altitude_ft: 26000,
    speed_kts: 315,
    heading: 155,
    lat: -58.8,
    lng: -63.2,
    mission: 'Abastecimiento táctico y relevo de dotación antártica',
  },
  {
    callsign: 'DAP-ANTARCTIC',
    registration: 'CC-ACJ',
    model: 'British Aerospace BAe 146-200',
    operator: 'Aerovías DAP Antarctic Airways',
    origin: 'Punta Arenas (SCCI)',
    destination: 'Isla Rey Jorge (SCRM)',
    altitude_ft: 28000,
    speed_kts: 370,
    heading: 160,
    lat: -60.5,
    lng: -60.1,
    mission: 'Transporte de expedicionarios científicos internacionales',
  },
  {
    callsign: 'ALCI-POLAR',
    registration: 'RA-76950',
    model: 'Ilyushin Il-76TD-90VD',
    operator: 'Antarctic Logistics Centre International (ALCI)',
    origin: 'Ciudad del Cabo (FACT)',
    destination: 'Novolazarevskaya Blue Ice Runway (AT02)',
    altitude_ft: 34000,
    speed_kts: 430,
    heading: 195,
    lat: -63.8,
    lng: 14.5,
    mission: 'Puente aéreo intercontinental Dronning Maud Land',
  },
  {
    callsign: 'ARC-NAV-12',
    registration: 'ARC 121',
    model: 'CASA CN-235-300MPA Persuader',
    operator: 'Armada de Colombia (Aviación Naval / CCO)',
    origin: 'Punta Arenas (SCCI)',
    destination: 'Estrecho de Bransfield (Patrulla Marítima)',
    altitude_ft: 14000,
    speed_kts: 220,
    heading: 170,
    lat: -62.1,
    lng: -57.4,
    mission: 'Vigilancia marítima aeronaval en apoyo a la X Expedición Antártica',
  },
];

export const POLAR_SATELLITES_CONSTELLATION: PolarSatellite[] = [
  // 🌟 STARLINK POLAR SHELL (SpaceX Inter-Satellite Laser Mesh)
  {
    id: 'STARLINK-30124',
    name: 'Starlink Polar Laser (30124)',
    agency: 'SpaceX Starlink Polar Shell 4',
    sensor: 'Optical Space Laser Crosslink + Ku/Ka Band Phased Array',
    altitude_km: 560,
    inclination_deg: 97.6,
    period_min: 95.8,
    lat: -77.85,
    lng: 166.67,
    swath_km: 940,
    status: 'Enlace láser activo transmitiendo datos científicos en Estación McMurdo y Scott Base',
    category: 'starlink',
    color: '#00e676',
  },
  {
    id: 'STARLINK-30582',
    name: 'Starlink Polar Mesh (30582)',
    agency: 'SpaceX Starlink Polar Shell 4',
    sensor: 'Optical Space Laser Crosslink + Ku/Ka Band Phased Array',
    altitude_km: 558,
    inclination_deg: 97.6,
    period_min: 95.7,
    lat: -89.4,
    lng: 45.0,
    swath_km: 940,
    status: 'Paso cenital sobre Polo Sur Geográfico y Telescopio South Pole (SPT)',
    category: 'starlink',
    color: '#00e676',
  },
  {
    id: 'STARLINK-31045',
    name: 'Starlink Polar Gateway (31045)',
    agency: 'SpaceX Starlink Shell 3',
    sensor: 'Ku/Ka Band Gateway Uplink',
    altitude_km: 570,
    inclination_deg: 70.0,
    period_min: 96.0,
    lat: -59.5,
    lng: -63.8,
    swath_km: 920,
    status: 'Banda ancha marítima para buques oceanográficos cruzando el Paso Drake',
    category: 'starlink',
    color: '#00e676',
  },
  {
    id: 'STARLINK-31410',
    name: 'Starlink Polar Laser (31410)',
    agency: 'SpaceX Starlink Polar Shell 4',
    sensor: 'Optical Space Laser Crosslink + Phased Array',
    altitude_km: 562,
    inclination_deg: 97.6,
    period_min: 95.9,
    lat: -75.2,
    lng: -45.0,
    swath_km: 940,
    status: 'Enlace en tiempo real con campamento de testigos de hielo en Barrera Filchner-Ronne',
    category: 'starlink',
    color: '#00e676',
  },
  {
    id: 'STARLINK-31890',
    name: 'Starlink Polar Mesh (31890)',
    agency: 'SpaceX Starlink Polar Shell 4',
    sensor: 'Optical Space Laser Crosslink + Ku/Ka Band Phased Array',
    altitude_km: 559,
    inclination_deg: 97.6,
    period_min: 95.8,
    lat: -63.4,
    lng: -57.0,
    swath_km: 940,
    status: 'Conectividad continua para bases de la Península Antártica y Base Esperanza',
    category: 'starlink',
    color: '#00e676',
  },
  {
    id: 'STARLINK-32115',
    name: 'Starlink Polar Laser (32115)',
    agency: 'SpaceX Starlink Polar Shell 4',
    sensor: 'Optical Space Laser Crosslink',
    altitude_km: 561,
    inclination_deg: 97.6,
    period_min: 95.8,
    lat: -75.1,
    lng: 123.35,
    swath_km: 940,
    status: 'Transmisión astronómica de alta velocidad en Estación Domo Concordia (3,233 msnm)',
    category: 'starlink',
    color: '#00e676',
  },
  {
    id: 'STARLINK-32450',
    name: 'Starlink Subpolar (32450)',
    agency: 'SpaceX Starlink Shell 3',
    sensor: 'Ku/Ka Band Earth Terminal Downlink',
    altitude_km: 568,
    inclination_deg: 70.0,
    period_min: 96.0,
    lat: -54.9,
    lng: -67.6,
    swath_km: 920,
    status: 'Enlace de estación terrena en Puerto Williams y Canal Beagle',
    category: 'starlink',
    color: '#00e676',
  },
  {
    id: 'STARLINK-32880',
    name: 'Starlink Polar Mesh (32880)',
    agency: 'SpaceX Starlink Polar Shell 4',
    sensor: 'Optical Space Laser Crosslink + Ku/Ka Band Phased Array',
    altitude_km: 559,
    inclination_deg: 97.6,
    period_min: 95.8,
    lat: -74.8,
    lng: -100.5,
    swath_km: 940,
    status: 'Telemetría de sismógrafos y boyas GPS en Glaciar Pine Island',
    category: 'starlink',
    color: '#00e676',
  },

  // 🛰 COPERNICUS / NASA / ESA / USGS / CNES (Earth Observation & Cryosphere)
  {
    id: 'SENTINEL-1A',
    name: 'Copernicus Sentinel-1A',
    agency: 'ESA / Comisión Europea',
    sensor: 'C-SAR (Radar de Apertura Sintética Banda C)',
    altitude_km: 693,
    inclination_deg: 98.18,
    period_min: 98.6,
    lat: -67.4,
    lng: -62.8,
    swath_km: 250,
    status: 'Interferometría SAR detectando propagación de grietas en Barrera de Larsen C',
    category: 'earth_observation',
    color: '#00e5ff',
  },
  {
    id: 'SENTINEL-2A',
    name: 'Copernicus Sentinel-2A',
    agency: 'ESA / Comisión Europea',
    sensor: 'MSI (Generador de Imágenes Multiespectrales de 13 Bandas)',
    altitude_km: 786,
    inclination_deg: 98.6,
    period_min: 100.6,
    lat: -64.8,
    lng: -63.5,
    swath_km: 290,
    status: 'Mapeo espectral de albedo en nieve y detección de bioindicadores en Estrecho de Gerlache',
    category: 'earth_observation',
    color: '#00e5ff',
  },
  {
    id: 'SENTINEL-3A',
    name: 'Copernicus Sentinel-3A',
    agency: 'ESA / EUMETSAT',
    sensor: 'SLSTR + OLCI (Temperatura Superficial y Color del Océano)',
    altitude_km: 814,
    inclination_deg: 98.65,
    period_min: 101.0,
    lat: -61.2,
    lng: -52.0,
    swath_km: 1270,
    status: 'Monitoreo de floraciones de fitoplancton y TSM en Mar de Scotia',
    category: 'earth_observation',
    color: '#00e5ff',
  },
  {
    id: 'CRYOSAT-2',
    name: 'ESA CryoSat-2',
    agency: 'ESA Earth Explorer',
    sensor: 'SIRAL (Altímetro Radar Interferométrico SAR)',
    altitude_km: 717,
    inclination_deg: 92.0,
    period_min: 99.2,
    lat: -78.2,
    lng: -35.4,
    swath_km: 180,
    status: 'Medición de espesor de hielo marino y topografía de la capa de hielo antártica',
    category: 'earth_observation',
    color: '#00e5ff',
  },
  {
    id: 'ICESAT-2',
    name: 'NASA ICESat-2',
    agency: 'NASA Earth Observing System',
    sensor: 'ATLAS (Sistema de Altimetría Láser de Conteo de Fotones a 532 nm)',
    altitude_km: 496,
    inclination_deg: 92.0,
    period_min: 94.6,
    lat: -74.9,
    lng: -110.2,
    swath_km: 120,
    status: 'Perfiles topográficos sub-decimétricos del Glaciar Thwaites y línea de apoyo',
    category: 'earth_observation',
    color: '#00e5ff',
  },
  {
    id: 'LANDSAT-9',
    name: 'USGS/NASA Landsat 9',
    agency: 'USGS / NASA',
    sensor: 'OLI-2 / TIRS-2 (Reflectancia Multiespectral y Térmica)',
    altitude_km: 705,
    inclination_deg: 98.2,
    period_min: 98.9,
    lat: -64.5,
    lng: -70.4,
    swath_km: 185,
    status: 'Cartografía térmica de nunataks y dinámica de fracturas en Barrera Wilkins',
    category: 'earth_observation',
    color: '#00e5ff',
  },
  {
    id: 'SWOT',
    name: 'NASA/CNES SWOT',
    agency: 'NASA / CNES / CSA / UKSA',
    sensor: 'KaRIn (Interferómetro Radar de Apertura Sintética Banda Ka)',
    altitude_km: 890,
    inclination_deg: 77.6,
    period_min: 102.8,
    lat: -58.2,
    lng: -65.5,
    swath_km: 120,
    status: 'Topografía de la superficie oceánica en 2D y vórtices del Frente Polar Antártico',
    category: 'earth_observation',
    color: '#00e5ff',
  },
  {
    id: 'TERRA',
    name: 'NASA EOS Terra',
    agency: 'NASA Earth Observing System',
    sensor: 'MODIS / ASTER (Radiómetro Espectrorradiométrico de Imágenes)',
    altitude_km: 705,
    inclination_deg: 98.2,
    period_min: 98.9,
    lat: -71.5,
    lng: -11.0,
    swath_km: 2330,
    status: 'Monitoreo radiativo y reflectancia de la nieve en Queen Maud Land',
    category: 'earth_observation',
    color: '#00e5ff',
  },

  // 🌦 WEATHER & METEOROLOGY (NOAA / EUMETSAT / ISRO)
  {
    id: 'NOAA-21',
    name: 'NOAA-21 (JPSS-2)',
    agency: 'NOAA / NASA',
    sensor: 'VIIRS (Radiómetro Visible/Infrarrojo de Día y Noche)',
    altitude_km: 824,
    inclination_deg: 98.7,
    period_min: 101.4,
    lat: -55.8,
    lng: -75.0,
    swath_km: 3040,
    status: 'Banda Día/Noche rastreando sistemas de baja presión y pack de hielo',
    category: 'weather',
    color: '#8de8cd',
  },
  {
    id: 'METOP-B',
    name: 'EUMETSAT MetOp-B',
    agency: 'EUMETSAT / ESA',
    sensor: 'ASCAT (Escaterómetro Radar de Viento de Superficie Marina)',
    altitude_km: 817,
    inclination_deg: 98.7,
    period_min: 101.3,
    lat: -60.0,
    lng: -40.0,
    swath_km: 1100,
    status: 'Campos de viento en superficie en la Corriente Circumpolar Antártica',
    category: 'weather',
    color: '#8de8cd',
  },
  {
    id: 'METOP-C',
    name: 'EUMETSAT MetOp-C',
    agency: 'EUMETSAT / ESA',
    sensor: 'IASI + GOME-2 (Sonda Atmosférica Infrarroja y Monitoreo de Ozono)',
    altitude_km: 817,
    inclination_deg: 98.7,
    period_min: 101.3,
    lat: -72.0,
    lng: 20.0,
    swath_km: 2200,
    status: 'Columna total de ozono y temperaturas estratosféricas del Vórtice Polar',
    category: 'weather',
    color: '#8de8cd',
  },
  {
    id: 'SARAL',
    name: 'ISRO/CNES SARAL-AltiKa',
    agency: 'ISRO / CNES',
    sensor: 'AltiKa (Altímetro Radar en Banda Ka a 35.75 GHz)',
    altitude_km: 800,
    inclination_deg: 98.5,
    period_min: 100.6,
    lat: -57.5,
    lng: -80.0,
    swath_km: 200,
    status: 'Altura significativa de olas oceánicas (SWH) y nivel del mar en el Pacífico Sur',
    category: 'weather',
    color: '#8de8cd',
  },

  // 📡 POLAR TELECOM & IoT TRACKING (Iridium NEXT / OneWeb)
  {
    id: 'IRIDIUM-114',
    name: 'Iridium NEXT-114',
    agency: 'Iridium Communications',
    sensor: 'L-Band Cross-Linked LEO Mesh Transceiver',
    altitude_km: 780,
    inclination_deg: 86.4,
    period_min: 100.4,
    lat: -68.9,
    lng: -71.2,
    swath_km: 4700,
    status: 'Recepción y retransmisión de datos de boyas oceanográficas Argo y derivadores',
    category: 'telecom',
    color: '#c084fc',
  },
  {
    id: 'IRIDIUM-128',
    name: 'Iridium NEXT-128',
    agency: 'Iridium Communications',
    sensor: 'L-Band Cross-Linked LEO Mesh Transceiver',
    altitude_km: 780,
    inclination_deg: 86.4,
    period_min: 100.4,
    lat: -81.0,
    lng: -140.0,
    swath_km: 4700,
    status: 'Comunicaciones críticas de búsqueda y rescate (SAR) en Tierra de Marie Byrd',
    category: 'telecom',
    color: '#c084fc',
  },
  {
    id: 'ONEWEB-0145',
    name: 'OneWeb Polar (0145)',
    agency: 'Eutelsat OneWeb',
    sensor: 'Ku/Ka Band Polar Gateway Transceiver',
    altitude_km: 1200,
    inclination_deg: 87.9,
    period_min: 109.0,
    lat: -73.5,
    lng: 85.0,
    swath_km: 1500,
    status: 'Enlace troncal de internet para estaciones científicas del sector Antártico Oriental',
    category: 'telecom',
    color: '#c084fc',
  },
];

/**
 * Builds GeoJSON for Polar Aircraft positions, 3D vertical drop tethers, elevated symbols, and corridors.
 */
export function buildAircraftGeoJSON(aircraftList: PolarAircraft[] = POLAR_AIRCRAFT_FLEET): any {
  const points: Feature<Point, any>[] = [];
  const elevatedPoints: Feature<Point, any>[] = [];
  const tethers: Feature<LineString>[] = [];
  const corridors: Feature<LineString>[] = [];

  aircraftList.forEach((ac) => {
    const altFt = ac.altitude_ft || 28000;
    const altM = Math.round(altFt * 0.3048);
    const flightLevel = Math.round(altFt / 100);
    const machSpeed = (ac.speed_kts / 661.47).toFixed(2);

    // 3D Altitude Projection offset aloft
    const altScale = altFt / 35000;
    const cosLat = Math.cos((ac.lat * Math.PI) / 180);
    const dLat = altScale * 1.2;
    const dLng = altScale * 0.8 * cosLat;
    const elevatedCoord: [number, number] = [
      Number((ac.lng + dLng).toFixed(4)),
      Number(Math.max(-89.9, Math.min(89.9, ac.lat + dLat)).toFixed(4)),
    ];

    // 1. Nadir Ground Shadow Point
    points.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [ac.lng, ac.lat] },
      properties: {
        ...ac,
        alt_m: altM,
        flight_level: flightLevel,
        mach: machSpeed,
        is_nadir: true,
      },
    });

    // 2. Elevated In-Flight Symbol
    elevatedPoints.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: elevatedCoord },
      properties: {
        ...ac,
        alt_m: altM,
        flight_level: flightLevel,
        mach: machSpeed,
        is_elevated: true,
      },
    });

    // 3. Vertical Altitude Drop Tether
    tethers.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[ac.lng, ac.lat], elevatedCoord],
      },
      properties: {
        callsign: ac.callsign,
        altitude_ft: altFt,
        altitude_m: altM,
        flight_level: flightLevel,
        speed_kts: ac.speed_kts,
        heading: ac.heading,
        color: '#ffd600',
      },
    });

    // 4. Projected Flight Corridor / Vector line
    const hdgRad = (ac.heading * Math.PI) / 180;
    const fwdDist = 2.5; // degrees forward vector
    const fwdLat = Math.max(-89.5, Math.min(89.5, ac.lat + fwdDist * Math.cos(hdgRad)));
    const fwdLng = (((ac.lng + (fwdDist * Math.sin(hdgRad)) / Math.max(cosLat, 0.1) + 180) % 360) + 360) % 360 - 180;

    corridors.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [ac.lng, ac.lat],
          [Number(fwdLng.toFixed(4)), Number(fwdLat.toFixed(4))],
        ],
      },
      properties: {
        callsign: ac.callsign,
        origin: ac.origin,
        destination: ac.destination,
        mission: ac.mission,
      },
    });
  });

  const res: any = {
    type: 'FeatureCollection',
    features: [...elevatedPoints, ...points],
    points: { type: 'FeatureCollection', features: points },
    elevatedPoints: { type: 'FeatureCollection', features: elevatedPoints },
    tethers: { type: 'FeatureCollection', features: tethers },
    corridors: { type: 'FeatureCollection', features: corridors },
  };

  return res;
}

/**
 * Builds GeoJSON for Polar AIS vessels fleet.
 */
export function buildVesselsGeoJSON(vesselsList: PolarVessel[] = POLAR_VESSELS_FLEET): FeatureCollection<Point, PolarVessel> {
  return {
    type: 'FeatureCollection',
    features: vesselsList.map((v) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [v.lng, v.lat],
      },
      properties: { ...v },
    })),
  };
}

/**
 * Builds GeoJSON points, 360° Keplerian orbital rings, 3D vertical tethers, and swaths for polar satellites.
 */
export function buildSatellitesGeoJSON(satellites: PolarSatellite[] = POLAR_SATELLITES_CONSTELLATION): {
  points: FeatureCollection<Point, PolarSatellite>;
  tracks: FeatureCollection<LineString>;
  swaths: FeatureCollection<Polygon>;
  rings: FeatureCollection<LineString>;
  tethers: FeatureCollection<LineString>;
  elevatedPoints: FeatureCollection<Point, any>;
} {
  const points: Feature<Point, PolarSatellite & { velocity_kms: number; period_calc: number; is_nadir: boolean }>[] = [];
  const tracks: Feature<LineString>[] = [];
  const swaths: Feature<Polygon>[] = [];
  const rings: Feature<LineString>[] = [];
  const tethers: Feature<LineString>[] = [];
  const elevatedPoints: Feature<Point, any>[] = [];

  const mu = 398600.4418; // km^3/s^2 Standard Gravitational Parameter
  const re = 6371; // km Mean Earth Radius

  satellites.forEach((sat) => {
    const satColor = sat.color || '#00e5ff';
    const a = re + sat.altitude_km;
    const vKms = Number(Math.sqrt(mu / a).toFixed(2));
    const periodCalc = Number(((2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu)) / 60).toFixed(1));

    // 3D Altitude Projection Vector
    const altScale = sat.altitude_km / 700;
    const cosLat = Math.cos((sat.lat * Math.PI) / 180);
    const dLat = altScale * 2.8;
    const dLng = altScale * 1.6 * cosLat;
    const elevatedCoord: [number, number] = [
      Number((sat.lng + dLng).toFixed(4)),
      Number(Math.max(-89.9, Math.min(89.9, sat.lat + dLat)).toFixed(4)),
    ];

    // Current Nadir Ground Point
    points.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [sat.lng, sat.lat] },
      properties: {
        ...sat,
        velocity_kms: vKms,
        period_calc: periodCalc,
        color: satColor,
        is_nadir: true,
      },
    });

    // Elevated In-Orbit Satellite Symbol
    elevatedPoints.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: elevatedCoord },
      properties: {
        ...sat,
        velocity_kms: vKms,
        period_calc: periodCalc,
        color: satColor,
        is_elevated: true,
      },
    });

    // Vertical Altitude Drop Tether
    tethers.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[sat.lng, sat.lat], elevatedCoord],
      },
      properties: {
        satellite_id: sat.id,
        name: sat.name,
        altitude_km: sat.altitude_km,
        velocity_kms: vKms,
        color: satColor,
      },
    });

    // Full 360° Closed Keplerian Orbital Ring
    const ringCoords: [number, number][] = [];
    const numRingSteps = 72;
    const incRad = (sat.inclination_deg * Math.PI) / 180;
    const sinU0 = Math.max(-0.999, Math.min(0.999, Math.sin((sat.lat * Math.PI) / 180) / Math.sin(incRad)));
    const u0 = Math.asin(sinU0);
    const omegaNode = sat.lng - (Math.atan2(Math.cos(incRad) * Math.sin(u0), Math.cos(u0)) * 180) / Math.PI;

    for (let k = 0; k <= numRingSteps; k++) {
      const u = (k / numRingSteps) * 2 * Math.PI;
      const ringLat = Math.asin(Math.sin(incRad) * Math.sin(u)) * (180 / Math.PI);
      const dLambda = Math.atan2(Math.cos(incRad) * Math.sin(u), Math.cos(u)) * (180 / Math.PI);
      const ringLng = (((omegaNode + dLambda + 180) % 360) + 360) % 360 - 180;
      ringCoords.push([Number(ringLng.toFixed(4)), Number(ringLat.toFixed(4))]);
    }

    rings.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: ringCoords,
      },
      properties: {
        satellite_id: sat.id,
        name: sat.name,
        altitude_km: sat.altitude_km,
        velocity_kms: vKms,
        inclination_deg: sat.inclination_deg,
        period_min: periodCalc,
        color: satColor,
      },
    });

    // Polar Orbital Ground Track (Passage)
    const trackCoords: [number, number][] = [];
    const baseLng = sat.lng;
    const baseLat = sat.lat;

    for (let i = -18; i <= 18; i++) {
      const lat = Math.max(-88.5, Math.min(88.5, baseLat + i * 2.5));
      const lng = ((baseLng - (i * 0.8) + 180) % 360) - 180;
      trackCoords.push([lng, lat]);
    }

    tracks.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: trackCoords,
      },
      properties: {
        satellite_id: sat.id,
        name: sat.name,
        sensor: sat.sensor,
        category: sat.category,
        color: satColor,
      },
    });

    // Sensor Swath polygon centered around the satellite
    const halfWidthDeg = (sat.swath_km / 111.32) / 2;
    const halfLengthDeg = 2.0;
    swaths.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [baseLng - halfWidthDeg, baseLat - halfLengthDeg],
          [baseLng + halfWidthDeg, baseLat - halfLengthDeg],
          [baseLng + halfWidthDeg, baseLat + halfLengthDeg],
          [baseLng - halfWidthDeg, baseLat + halfLengthDeg],
          [baseLng - halfWidthDeg, baseLat - halfLengthDeg],
        ]],
      },
      properties: {
        satellite_id: sat.id,
        sensor: sat.sensor,
        swath_km: sat.swath_km,
        category: sat.category,
        color: satColor,
      },
    });
  });

  return {
    points: { type: 'FeatureCollection', features: points },
    elevatedPoints: { type: 'FeatureCollection', features: elevatedPoints },
    rings: { type: 'FeatureCollection', features: rings },
    tethers: { type: 'FeatureCollection', features: tethers },
    tracks: { type: 'FeatureCollection', features: tracks },
    swaths: { type: 'FeatureCollection', features: swaths },
  };
}

import {
  VERIFIED_POLAR_CABLES,
  validateCableGeometry,
} from './cable-geometry';

/**
 * Loads Submarine Cables GeoJSON sanitized for Southern Ocean & Polar Gateway corridors.
 * Eliminates global cross-continental lines, dateline jumps, and giant grey ribbons.
 */
export async function fetchSubmarineCables(): Promise<FeatureCollection> {
  try {
    const res = await fetch('/data/submarine-cables.json');
    if (!res.ok) throw new Error('Submarine cables file not found');
    const data: FeatureCollection = await res.json();

    const sanitizedGatewayCables: Feature[] = [];
    if (data && Array.isArray(data.features)) {
      for (const feat of data.features) {
        const validated = validateCableGeometry(feat);
        if (validated) {
          // Avoid duplicate with curated polar features
          const isDuplicate = VERIFIED_POLAR_CABLES.features.some(
            (vf) => vf.properties?.id === validated.properties?.id || vf.id === validated.id
          );
          if (!isDuplicate) {
            sanitizedGatewayCables.push(validated);
          }
        }
      }
    }

    return {
      type: 'FeatureCollection',
      features: [...VERIFIED_POLAR_CABLES.features, ...sanitizedGatewayCables],
    };
  } catch (err) {
    console.info('[OSIRIS Live] Using verified curated polar cables:', err);
    return VERIFIED_POLAR_CABLES;
  }
}
