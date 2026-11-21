/**
 * AMOH Tourism Intelligence Engine (IAATO Registry & Published Routes 2026–2030)
 * Rules 76-85: Operator registry, route families, spatial overlap warnings.
 */

export interface TourismRoute {
  id: string;
  name: string;
  family: 'CLASSIC_PENINSULA' | 'POLAR_CIRCLE' | 'WEDDELL_SEA' | 'GRAND_ARC' | 'FLY_IN_INTERIOR' | 'FLY_AND_CRUISE' | 'ROSS_SEA' | 'SCENIC_FLIGHT' | 'CRUISE_ONLY';
  operator: string;
  vesselName: string;
  season: '2026-27' | '2027-28' | '2028-29' | '2029-30';
  paxCapacity: number;
  iaatoCategory: 'Category 1 (≤200 pax)' | 'Category 2 (201-500 pax)' | 'Category 3 (Cruise-only >500 pax)' | 'Air-Land Operator';
  waypointCount: number;
  coordinates: [number, number][]; // [lng, lat]
  overlapWarnings: string[];
}

export const SEED_TOURISM_ROUTES: TourismRoute[] = [
  {
    id: 'TR-NATGEO-01',
    name: 'Península Clásica e Islas Shetland del Sur',
    family: 'CLASSIC_PENINSULA',
    operator: 'Lindblad Expeditions / National Geographic',
    vesselName: 'National Geographic Resolution',
    season: '2026-27',
    paxCapacity: 126,
    iaatoCategory: 'Category 1 (≤200 pax)',
    waypointCount: 12,
    coordinates: [
      [-68.30, -54.80], // Ushuaia
      [-66.50, -56.20], // Salida Canal Beagle / Cabo de Hornos
      [-64.00, -58.50], // Paso de Drake central
      [-61.50, -61.20], // Aproximación Shetland del Sur
      [-62.20, -58.96], // Bahía Fildes / King George
      [-60.57, -62.97], // Bahía Balleneros / Decepción
      [-62.50, -64.80], // Estrecho de Gerlache / Cuverville
      [-63.50, -64.82], // Port Lockroy / Isla Wiencke
      [-64.05, -65.10], // Canal Lemaire
      [-64.10, -65.25], // Isla Petermann
      [-64.00, -58.50], // Retorno Drake
      [-68.30, -54.80], // Ushuaia
    ],
    overlapWarnings: ['Cruce de corredor de alimentación de Ballenas Jorobadas en Estrecho de Gerlache.'],
  },
  {
    id: 'TR-QUARK-02',
    name: 'Mar de Weddell Profundo y Pingüino Emperador',
    family: 'WEDDELL_SEA',
    operator: 'Quark Expeditions',
    vesselName: 'Ultramarine (Dual H145 Helicopters)',
    season: '2026-27',
    paxCapacity: 199,
    iaatoCategory: 'Category 1 (≤200 pax)',
    waypointCount: 10,
    coordinates: [
      [-68.30, -54.80], // Ushuaia
      [-65.00, -57.50], // Drake Este
      [-56.90, -63.50], // Estrecho Antarctic (Sound)
      [-55.78, -63.58], // Isla Paulet
      [-53.20, -64.50], // Isla Snow Hill (Colonia Pingüino Emperador)
      [-55.50, -63.90], // Golfo Erebus & Terror
      [-58.40, -63.30], // Brown Bluff (Continente)
      [-60.80, -62.40], // Shetland del Sur
      [-64.00, -58.50], // Drake retorno
      [-68.30, -54.80], // Ushuaia
    ],
    overlapWarnings: ['Límite estricto de helicóptero a 1.000 m sobre colonia reproductiva de Snow Hill.'],
  },
  {
    id: 'TR-AURORA-03',
    name: 'Expedición Extremo Sur Más Allá del Círculo Polar (66°33′ S)',
    family: 'POLAR_CIRCLE',
    operator: 'Aurora Expeditions',
    vesselName: 'Douglas Mawson (X-BOW)',
    season: '2027-28',
    paxCapacity: 154,
    iaatoCategory: 'Category 1 (≤200 pax)',
    waypointCount: 9,
    coordinates: [
      [-68.30, -54.80], // Ushuaia
      [-63.20, -62.50], // Isla Low
      [-64.05, -65.10], // Canal Lemaire
      [-65.25, -65.30], // Islas Argentine (Base Vernadsky)
      [-67.50, -66.55], // Isla Detaille (Cruce Círculo Polar 66°33′ S)
      [-68.10, -67.00], // Bahía Margarita / Isla Horseshoe
      [-68.80, -67.50], // Estrecho Gullet
      [-64.00, -58.50], // Drake retorno
      [-68.30, -54.80], // Ushuaia
    ],
    overlapWarnings: ['Monitoreo continuo de pack-ice a la deriva y áreas de descanso de focas cangrejeras.'],
  },
  {
    id: 'TR-ANT21-04',
    name: 'Fly & Cruise: Puente Aéreo Antártico Express',
    family: 'FLY_AND_CRUISE',
    operator: 'Antarctica21',
    vesselName: 'Magellan Discoverer (Híbrido) / BAE-146',
    season: '2026-27',
    paxCapacity: 76,
    iaatoCategory: 'Category 1 (≤200 pax)',
    waypointCount: 8,
    coordinates: [
      [-70.92, -53.16], // Aeropuerto Punta Arenas (PUQ)
      [-66.00, -58.00], // Corredor aéreo Drake
      [-58.98, -62.19], // Aeródromo Marsh / Base Frei (SCRM, Isla Rey Jorge)
      [-59.20, -62.30], // Transfer en Zodiacs a buque
      [-62.50, -64.80], // Estrecho de Gerlache / Cuverville
      [-62.86, -64.85], // Bahía Paraíso / Neko Harbour
      [-58.98, -62.19], // Regreso a Rey Jorge
      [-70.92, -53.16], // Vuelo retorno Punta Arenas
    ],
    overlapWarnings: ['Sujeto a techos de visibilidad meteorológica en aeródromo Teniente Marsh.'],
  },
  {
    id: 'TR-SILVER-05',
    name: 'Antarctica Bridge Luxury Explorer',
    family: 'FLY_AND_CRUISE',
    operator: 'Silversea Expeditions',
    vesselName: 'Silver Endeavour (PC6)',
    season: '2026-27',
    paxCapacity: 200,
    iaatoCategory: 'Category 1 (≤200 pax)',
    waypointCount: 8,
    coordinates: [
      [-67.60, -54.93], // Puerto Williams, Chile
      [-67.00, -55.80], // Paso Drake
      [-64.00, -58.50], // Drake Central
      [-60.50, -63.00], // Bahía Fildes
      [-63.50, -64.82], // Port Lockroy (Goudier)
      [-62.86, -64.85], // Bahía Paraíso
      [-62.00, -64.40], // Isla Danco
      [-67.60, -54.93], // Retorno Puerto Williams
    ],
    overlapWarnings: ['Coordinación de muelle preferente y protocolos de bioseguridad en Isla Navarino.'],
  },
  {
    id: 'TR-HURTI-06',
    name: 'Gran Circuito Austral: Malvinas, Georgias y Antártida',
    family: 'GRAND_ARC',
    operator: 'HX Expeditions (Hurtigruten)',
    vesselName: 'MS Roald Amundsen (Híbrido Baterías)',
    season: '2027-28',
    paxCapacity: 250,
    iaatoCategory: 'Category 2 (201-500 pax)',
    waypointCount: 11,
    coordinates: [
      [-68.30, -54.80], // Ushuaia
      [-57.85, -51.70], // Stanley (Islas Malvinas / Falklands)
      [-60.50, -51.30], // Saunders Island / Carcass Island
      [-42.00, -53.50], // Navegación hacia Georgia del Sur
      [-36.50, -54.28], // Grytviken (Georgia del Sur)
      [-36.00, -54.40], // Bahía San Andrés (St. Andrews Bay)
      [-37.30, -54.00], // Planicie de Salisbury / Gold Harbour
      [-45.50, -60.70], // Islas Orcadas del Sur (Signy)
      [-56.90, -63.50], // Bahía Esperanza / Península
      [-62.50, -64.80], // Estrecho de Gerlache
      [-68.30, -54.80], // Ushuaia
    ],
    overlapWarnings: ['Inspección biológica obligatoria de calzado antes de cualquier desembarco en Georgia del Sur.'],
  },
  {
    id: 'TR-PONANT-07',
    name: 'Expedición Transpolar y Hielo Marino Extremo',
    family: 'WEDDELL_SEA',
    operator: 'Ponant',
    vesselName: 'Le Commandant Charcot (PC2 Rompehielos GNL)',
    season: '2026-27',
    paxCapacity: 245,
    iaatoCategory: 'Category 2 (201-500 pax)',
    waypointCount: 7,
    coordinates: [
      [-68.30, -54.80], // Ushuaia
      [-60.00, -63.00], // Shetland del Sur
      [-50.00, -65.00], // Mar de Weddell Profundo
      [-40.00, -70.00], // Hielo Marino Consolidado (PC2)
      [-30.00, -73.00], // Barrera de Ronne / Filchner
      [-50.00, -65.00], // Retorno a Mar Abierto
      [-68.30, -54.80], // Ushuaia
    ],
    overlapWarnings: ['Operación sujeta a aprobación científica en zonas prístinas de hielo de plataforma.'],
  },
  {
    id: 'TR-SCENIC-08',
    name: 'Odisea Histórica en el Mar de Ross y Antártida Oriental',
    family: 'ROSS_SEA',
    operator: 'Scenic Luxury Cruises & Tours',
    vesselName: 'Scenic Eclipse II (Discovery Yacht & Submarinos)',
    season: '2027-28',
    paxCapacity: 200,
    iaatoCategory: 'Category 1 (≤200 pax)',
    waypointCount: 9,
    coordinates: [
      [172.72, -43.60], // Lyttelton / Christchurch, Nueva Zelanda
      [169.15, -52.55], // Campbell Island
      [158.95, -54.50], // Isla Macquarie (Australia)
      [170.23, -71.28], // Cabo Adare (Mar de Ross)
      [168.00, -75.00], // Mar de Ross Central
      [166.40, -77.63], // Cabo Royds (Choza Shackleton)
      [166.75, -77.85], // Hut Point & Base McMurdo / Scott Base
      [175.00, -78.00], // Barrera de Hielo de Ross (Ross Ice Shelf)
      [147.32, -42.88], // Hobart, Tasmania (Australia)
    ],
    overlapWarnings: ['Permiso especial de acceso a Zonas Antárticas Especialmente Protegidas (ZAEP) en chozas de Scott y Shackleton.'],
  },
  {
    id: 'TR-ALE-09',
    name: 'Puente Aéreo al Interior Profundo, Polo Sur y Macizo Vinson',
    family: 'FLY_IN_INTERIOR',
    operator: 'Antarctic Logistics & Expeditions (ALE)',
    vesselName: 'Boeing 757-200 / Basler BT-67 / Twin Otter',
    season: '2026-27',
    paxCapacity: 45,
    iaatoCategory: 'Air-Land Operator',
    waypointCount: 7,
    coordinates: [
      [-70.92, -53.16], // Punta Arenas, Chile (PUQ)
      [-75.00, -65.00], // Paso aéreo Paso de Drake / Península
      [-82.87, -79.77], // Pista de Hielo Azul Union Glacier (SCGC)
      [-60.00, -82.00], // Vuelo interno en Basler BT-67
      [0.00, -90.00],   // Polo Sur Geográfico (Amundsen-Scott)
      [-82.87, -79.77], // Regreso a Union Glacier
      [-70.92, -53.16], // Retorno a Punta Arenas
    ],
    overlapWarnings: ['Protocolo de aislamiento estricto y contingencia por tormentas de nieve catabáticas en el plateau.'],
  },
  {
    id: 'TR-WHITEDESERT-10',
    name: 'Ultralujo Antártico: Campamentos Echo y Whichaway',
    family: 'FLY_IN_INTERIOR',
    operator: 'White Desert Antarctica',
    vesselName: 'Gulfstream G550 / Airbus A340 / Basler BT-67',
    season: '2026-27',
    paxCapacity: 24,
    iaatoCategory: 'Air-Land Operator',
    waypointCount: 7,
    coordinates: [
      [18.42, -33.92],  // Ciudad del Cabo, Sudáfrica
      [12.00, -50.00],  // Océano Austral
      [8.50, -70.50],   // Pista de Hielo Azul Wolf's Fang Runway
      [8.65, -71.50],   // Whichaway Camp / Echo Camp (Oasis Schirmacher)
      [0.00, -90.00],   // Polo Sur Geográfico en Basler BT-67
      [8.50, -70.50],   // Wolf's Fang
      [18.42, -33.92],  // Regreso a Ciudad del Cabo
    ],
    overlapWarnings: ['Bioseguridad aeroespacial: desinfección ultravioleta de equipaje y vestimenta polar.'],
  },
  {
    id: 'TR-CELEBRITY-11',
    name: 'Navegación Escénica sin Desembarco (Crucero Polar Categoría 3)',
    family: 'CRUISE_ONLY',
    operator: 'Celebrity Cruises / Princess Cruises',
    vesselName: 'Celebrity Eclipse / Sapphire Princess',
    season: '2027-28',
    paxCapacity: 2850,
    iaatoCategory: 'Category 3 (Cruise-only >500 pax)',
    waypointCount: 8,
    coordinates: [
      [-58.38, -34.60], // Buenos Aires, Argentina
      [-68.30, -54.80], // Canal Beagle / Ushuaia
      [-64.00, -58.50], // Paso de Drake
      [-55.20, -61.10], // Isla Elefante (Elephant Island)
      [-56.90, -63.50], // Estrecho Antarctic (Sound)
      [-62.50, -64.80], // Estrecho de Gerlache (Navegación Escénica)
      [-64.05, -65.10], // Canal Lemaire
      [-71.62, -33.04], // Valparaíso, Chile
    ],
    overlapWarnings: ['PROHIBIDO EL DESEMBARCO: Buque >500 pax. Distancia mínima a costa y velocidad máx 10 nudos en áreas de cetáceos.'],
  },
  {
    id: 'TR-QANTAS-12',
    name: 'Sobrevuelo Panorámico Antártico sin Aterrizaje',
    family: 'SCENIC_FLIGHT',
    operator: 'Antarctica Flights / Qantas',
    vesselName: 'Boeing 787-9 Dreamliner',
    season: '2026-27',
    paxCapacity: 230,
    iaatoCategory: 'Air-Land Operator',
    waypointCount: 6,
    coordinates: [
      [151.21, -33.86], // Sídney, Australia (SYD)
      [150.00, -50.00], // Océano Austral
      [142.00, -67.00], // Tierra Adelia / Cabo Denison (Choza de Mawson)
      [136.00, -66.50], // Costa Clarie / Tierra de Wilkes
      [140.00, -66.66], // Archipiélago Pointe Géologie
      [151.21, -33.86], // Regreso a Sídney (Vuelo ida y vuelta en el día)
    ],
    overlapWarnings: ['Altitud mínima de sobrevuelo para protección acústica de colonias de fauna silvestre.'],
  },
  {
    id: 'TR-PEACEBOAT-13',
    name: 'Tránsito Circumpolar Austral y Océano del Sur',
    family: 'GRAND_ARC',
    operator: 'Peace Boat (Catálogo AMOH)',
    vesselName: 'Pacific World',
    season: '2026-27',
    paxCapacity: 2400,
    iaatoCategory: 'Category 3 (Cruise-only >500 pax)',
    waypointCount: 7,
    coordinates: [
      [-71.62, -33.04], // Valparaíso, Chile
      [-72.80, -45.45], // Puerto Chacabuco
      [-70.92, -53.16], // Punta Arenas / Estrecho de Magallanes
      [-68.30, -54.80], // Ushuaia
      [-60.00, -56.00], // Paso de Drake norte
      [-20.00, -50.00], // Tránsito Océano Atlántico Sur
      [18.42, -33.92],  // Ciudad del Cabo, Sudáfrica
    ],
    overlapWarnings: ['Cumplimiento estricto del Código Polar en aguas por debajo de los 50°S.'],
  },
];

export interface InfluencerTourismHotspot {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [lng, lat]
  platforms: string[];
  viralTropes: string[];
  topHashtags: string[];
  vulnerability: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  impactMetrics: {
    faunaStress: number; // 0 - 10
    blackCarbonLossMm: number; // mm/yr
    biosecurityRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    droneHazard: 'VERY HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
    vegetationTrampling: string;
  };
  documentedCases: string[];
  iaatoGuidelines: string;
}

export const INFLUENCER_TOURISM_HOTSPOTS: InfluencerTourismHotspot[] = [
  {
    id: 'INF-DEC-01',
    name: 'Whalers Bay & Pendulum Cove',
    region: 'Isla Decepción (Shetland del Sur)',
    coordinates: [-60.5667, -62.9833],
    platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
    viralTropes: ['Polar Plunge en bañador', 'Vapor geotérmico en playa volcánica', 'Factoría ballenera abandonada'],
    topHashtags: ['#polarplunge', '#deceptionisland', '#antarcticaswim'],
    vulnerability: 'CRITICAL',
    impactMetrics: {
      faunaStress: 7.5,
      blackCarbonLossMm: 19.8,
      biosecurityRisk: 'MEDIUM',
      droneHazard: 'HIGH',
      vegetationTrampling: 'Crítico en tapetes de briófitos geotérmicos protegidos (ASPA 140)',
    },
    documentedCases: ['Videos virales de Polar Plunge con >15M reproducciones; posado en estructuras oxidadas de HSM 71'],
    iaatoGuidelines: 'Lavado biológico obligatorio; prohibido escalar estructuras históricas; distancia 5m a pingüinos barbijo.',
  },
  {
    id: 'INF-LCK-02',
    name: 'Port Lockroy & Goudier Island',
    region: 'Archipiélago Palmer (Península Antártica)',
    coordinates: [-63.4967, -64.8250],
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    viralTropes: ['Selfie en la estafeta postal Penguin Post Office', 'Pingüinos papúa en pasarelas'],
    topHashtags: ['#portlockroy', '#penguinpostoffice', '#antarcticapostcard'],
    vulnerability: 'HIGH',
    impactMetrics: {
      faunaStress: 8.9,
      blackCarbonLossMm: 16.5,
      biosecurityRisk: 'HIGH',
      droneHazard: 'VERY HIGH',
      vegetationTrampling: 'Medio (islote rocoso)',
    },
    documentedCases: ['Selfies con pingüinos gentoo bajo pilotes de la base histórica Base A (HSM 61)'],
    iaatoGuidelines: 'Máximo 35-40 visitantes simultáneos en el islote; senderos delimitados obligatorios.',
  },
  {
    id: 'INF-NEK-03',
    name: 'Neko Harbour (Bahía Andvord)',
    region: 'Costa Danco (Península Antártica)',
    coordinates: [-62.5400, -64.8400],
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    viralTropes: ['Desembarco continental', 'Reacciones a tsunamis por desprendimiento glaciar'],
    topHashtags: ['#nekoharbour', '#mainlandantarctica', '#antarcticaexpedition'],
    vulnerability: 'CRITICAL',
    impactMetrics: {
      faunaStress: 8.2,
      blackCarbonLossMm: 22.4,
      biosecurityRisk: 'MEDIUM',
      droneHazard: 'HIGH',
      vegetationTrampling: 'Alto en bancos de musgo sobre morrenas',
    },
    documentedCases: ['Celebración de pisar tierra continental antártica y clips de olas de marea por calving'],
    iaatoGuidelines: 'Alerta por olas de maremoto glaciar; permanecer a más de 10m de altitud en playa.',
  },
  {
    id: 'INF-PAR-04',
    name: 'Paradise Harbour (Bahía Paraíso)',
    region: 'Costa Danco (Península Antártica)',
    coordinates: [-62.8667, -64.8900],
    platforms: ['YouTube', 'Instagram', 'TikTok'],
    viralTropes: ['Campamento nocturno en la nieve', 'Deslizamiento en pendiente nevada', 'Zodiac con copas de champán'],
    topHashtags: ['#paradisebay', '#antarcticcamping', '#zodiaccruise'],
    vulnerability: 'HIGH',
    impactMetrics: {
      faunaStress: 7.8,
      blackCarbonLossMm: 21.0,
      biosecurityRisk: 'MEDIUM',
      droneHazard: 'HIGH',
      vegetationTrampling: 'Alto en afloramientos con Deschampsia antarctica',
    },
    documentedCases: ['Vlogs de Kara & Nate durmiendo al aire libre en nieve con millones de vistas'],
    iaatoGuidelines: 'Evacuación estricta de residuos; límites de velocidad de zodiacs junto a colonias de cormoranes.',
  },
  {
    id: 'INF-LEM-05',
    name: 'Canal Lemaire (Kodak Gap)',
    region: 'Tierra de Graham',
    coordinates: [-63.9500, -65.0700],
    platforms: ['TikTok', 'Instagram Reels'],
    viralTropes: ['Time-lapse cinematográfico desde balcón', 'Acantilados verticales de 1.000m reflejados en agua'],
    topHashtags: ['#lemairechannel', '#kodakgap', '#polariceberg'],
    vulnerability: 'HIGH',
    impactMetrics: {
      faunaStress: 6.9,
      blackCarbonLossMm: 23.1,
      biosecurityRisk: 'LOW',
      droneHazard: 'VERY HIGH',
      vegetationTrampling: 'Nulo (marítimo)',
    },
    documentedCases: ['Reels virales navegando por la hendidura glacial de 1.600m con audio relajante ambiental'],
    iaatoGuidelines: 'Restricción acústica de máquinas para no interferir con ballenas jorobadas y orcas.',
  },
  {
    id: 'INF-CUV-06',
    name: 'Cuverville Island',
    region: 'Canal Errera',
    coordinates: [-62.6300, -64.6900],
    platforms: ['TikTok', 'Instagram'],
    viralTropes: ['6.500 parejas de pingüinos papúa', 'Clips a ras de suelo en senderos de pingüinos'],
    topHashtags: ['#cuvervilleisland', '#gentoopenguin', '#penguinwalk'],
    vulnerability: 'CRITICAL',
    impactMetrics: {
      faunaStress: 9.4,
      blackCarbonLossMm: 17.2,
      biosecurityRisk: 'HIGH',
      droneHazard: 'HIGH',
      vegetationTrampling: 'Extremo en alfombras de Sanionia uncinata',
    },
    documentedCases: ['Influencers tumbados en la nieve para grabar pingüinos pasando a centímetros'],
    iaatoGuidelines: 'Prohibido pisar fuera de nieve consolidada; respetar autopistas de tránsito de pingüinos.',
  },
  {
    id: 'INF-HLF-07',
    name: 'Half Moon Island',
    region: 'Islas Shetland del Sur',
    coordinates: [-59.9100, -62.5900],
    platforms: ['Instagram', 'TikTok'],
    viralTropes: ['Retratos bokeh con pingüinos barbijo', 'Vistas de la bahía en media luna'],
    topHashtags: ['#halfmoonisland', '#chinstrappenguin', '#antarcticadventure'],
    vulnerability: 'CRITICAL',
    impactMetrics: {
      faunaStress: 9.1,
      blackCarbonLossMm: 14.8,
      biosecurityRisk: 'MEDIUM',
      droneHazard: 'HIGH',
      vegetationTrampling: 'Alto en líquenes sobre promontorios volcánicos',
    },
    documentedCases: ['Posados fotográficos individuales en colonias de barbijos en fuerte declive numérico'],
    iaatoGuidelines: 'Especie en declive por cambio climático; tolerancia cero a desvíos del sendero balizado.',
  },
  {
    id: 'INF-BEA-08',
    name: "Union Glacier & Heritage Range ('Shopify Mtn')",
    region: 'Montes Ellsworth (Interior Continental)',
    coordinates: [-82.9167, -79.7667],
    platforms: ['YouTube', 'TikTok', 'X'],
    viralTropes: ['Reto extremo 50 horas de supervivencia', 'Bautizo publicitario de montañas sin nombre', 'Aterrizaje en IL-76'],
    topHashtags: ['#mrbeastantarctica', '#unionglacier', '#50hoursinantarctica'],
    vulnerability: 'CRITICAL',
    impactMetrics: {
      faunaStress: 1.2,
      blackCarbonLossMm: 8.5,
      biosecurityRisk: 'HIGH',
      droneHazard: 'HIGH',
      vegetationTrampling: 'Nulo (hielo azul)',
    },
    documentedCases: ['MrBeast: I Survived 50 Hours In Antarctica (>140M visualizaciones)'],
    iaatoGuidelines: 'Nombres comerciales no reconocidos por SCAR; huella aérea extrema por participante.',
  },
  {
    id: 'INF-WHI-09',
    name: "Whichaway Camp & Wolf's Fang Runway",
    region: 'Tierra de la Reina Maud (Dronning Maud Land)',
    coordinates: [11.6178, -70.7642],
    platforms: ['Instagram', 'TikTok'],
    viralTropes: ['Domo futurista de ultralujo', 'Sauna polar', 'Vuelo privado en Basler BT-67 a colonia de emperadores'],
    topHashtags: ['#whitedesertantarctica', '#whichawaycamp', '#polarglamping'],
    vulnerability: 'HIGH',
    impactMetrics: {
      faunaStress: 6.8,
      blackCarbonLossMm: 12.0,
      biosecurityRisk: 'CRITICAL',
      droneHazard: 'MEDIUM',
      vegetationTrampling: 'Medio (endolitos y micro-líquenes del Oasis de Schirmacher)',
    },
    documentedCases: ['Celebridades e influencers de lujo con champán en domos calefaccionados en el interior polar'],
    iaatoGuidelines: 'Desinfección ultravioleta y química estricta de equipaje antes de volar desde Ciudad del Cabo.',
  },
  {
    id: 'INF-FIL-10',
    name: 'Bahía Fildes & Villa Las Estrellas',
    region: 'Isla Rey Jorge (Shetland del Sur)',
    coordinates: [-58.9600, -62.2000],
    platforms: ['TikTok', 'YouTube', 'Instagram'],
    viralTropes: ['Pueblo antártico civil con escuela y banco', 'Hub de transbordo aeromarítimo fly-cruise'],
    topHashtags: ['#villalasestrellas', '#fildesbay', '#antarcticlife'],
    vulnerability: 'CRITICAL',
    impactMetrics: {
      faunaStress: 8.7,
      blackCarbonLossMm: 28.5,
      biosecurityRisk: 'CRITICAL',
      droneHazard: 'HIGH',
      vegetationTrampling: 'Muy alto por rodados y tránsito peatonal en tundra permafrost',
    },
    documentedCases: ['Reportajes virales de la vida cotidiana en el poblado civil y llegada de vuelos turísticos'],
    iaatoGuidelines: 'Zona de máxima presión humana acumulada; control fronterizo hacia la pingüinera de Ardley (ASPA 150).',
  },
  {
    id: 'INF-SCO-11',
    name: 'Scott Base & McMurdo Sound',
    region: 'Isla de Ross (Sector Mar de Ross)',
    coordinates: [166.7680, -77.8490],
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    viralTropes: ['Desafío de comida congelada al aire a -60°C', 'Física del frío polar', 'Vida de invernada'],
    topHashtags: ['#scottbase', '#mcmurdo', '#antarctictok', '@mattykjordan'],
    vulnerability: 'HIGH',
    impactMetrics: {
      faunaStress: 4.1,
      blackCarbonLossMm: 15.0,
      biosecurityRisk: 'MEDIUM',
      droneHazard: 'LOW',
      vegetationTrampling: 'Bajo',
    },
    documentedCases: ['Matty Jordan (@mattykjordan) con millones de seguidores en TikTok divulgando ciencia y vida polar'],
    iaatoGuidelines: 'Instalación científica de acceso restringido (ASMA 2); modelo de divulgación positiva.',
  },
];

