// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Juan Sebastián Huertas Olea. All rights reserved.
// NatGeo Director Store — High-End Expedition Cinematography & Storytelling State

export type AspectRatioMode = '2.39:1' | '16:9' | 'IMAX 1.43:1' | '4:3';
export type CinematicLut = 'natgeo-prime' | 'golden-hour' | 'infrared-aurora' | 'shackleton-1911' | 'bathy-sonar' | 'thermal-flir' | 'pristine';
export type LensFocal = '18mm' | '35mm' | '85mm' | '200mm';
export type AudioPreset = 'polar-wind' | 'glacial-depths' | 'hydrophone' | 'aurora-resonance';

export interface ExpeditionWaypoint {
  id: string;
  title: string;
  region: string;
  coordinates: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  durationSec: number;
  directorNote: string;
  expeditionLog: string;
  cinematicLens: LensFocal;
  recommendedFilter: CinematicLut;
  audioPreset: AudioPreset;
  telemetryTag: string;
}

export interface WildlifeSpotlight {
  id: string;
  commonName: string;
  scientificName: string;
  category: 'mammal' | 'bird' | 'crustacean' | 'cetacean';
  conservationStatus: string;
  bestShotLocation: string;
  coordinates: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  directorTip: string;
  behavioralInsight: string;
  soundCue: string;
}

export const EXPEDITION_WAYPOINTS: ExpeditionWaypoint[] = [
  {
    id: 'DRAKE_PASSAGE',
    title: 'Paso Drake: El Abismo de los 50 Aullantes',
    region: 'Convergencia Antártica',
    coordinates: [-63.0, -58.5],
    zoom: 4.6,
    pitch: 52,
    bearing: -25,
    durationSec: 14,
    directorNote: 'Toma angular abierta a 18mm. Enfatizar la colisión de masas de agua circumpolares y la violencia épica de los oleajes antárticos.',
    expeditionLog: 'El Paso Drake representa la frontera más indómita del planeta: 800 km de aguas profundas donde se canalizan 140 millones de m³/s de corriente marina.',
    cinematicLens: '18mm',
    recommendedFilter: 'natgeo-prime',
    audioPreset: 'polar-wind',
    telemetryTag: 'WGS84 58°30\'S 63°00\'W // OLEAJES 9.2m',
  },
  {
    id: 'DECEPTION_ISLAND',
    title: 'Isla Decepción: La Caldera Volcánica Oculta',
    region: 'Islas Shetland del Sur',
    coordinates: [-60.6, -62.95],
    zoom: 8.4,
    pitch: 60,
    bearing: 42,
    durationSec: 16,
    directorNote: 'Transición lenta a 35mm. Resaltar los vapores geotérmicos que se elevan sobre la nieve negra volcánica de Port Foster.',
    expeditionLog: 'Antiguo cráter colapsado inundado por el mar. Un ecosistema extremo donde coexisten bacterias termófilas, colonias de pingüinos barbijo y sismicidad activa.',
    cinematicLens: '35mm',
    recommendedFilter: 'golden-hour',
    audioPreset: 'glacial-depths',
    telemetryTag: 'VOLCANIC CALDERA // FUMAROLAS ACTIVAS',
  },
  {
    id: 'LEMAIRE_CHANNEL',
    title: 'Canal Lemaire: El Desfiladero Kodak de 1.000m',
    region: 'Península Antártica',
    coordinates: [-65.05, -65.1],
    zoom: 7.8,
    pitch: 58,
    bearing: -15,
    durationSec: 15,
    directorNote: 'Paso cinematográfico entre paredes verticales de granito negro y témpanos azul zafiro. Encuadre CinemaScope 2.39:1 recomendado.',
    expeditionLog: 'Un canal de apenas 1.6 km de ancho flanqueado por monolitos de hielo de 1.000 metros de caída directa hacia el abismo polar.',
    cinematicLens: '85mm',
    recommendedFilter: 'natgeo-prime',
    audioPreset: 'hydrophone',
    telemetryTag: 'MONOLITOS 1.050M // AGUAS CRISTALINAS',
  },
  {
    id: 'ROSS_ICE_SHELF',
    title: 'Barrera de Hielo de Ross: El Borde de lo Infinito',
    region: 'Mar de Ross',
    coordinates: [178.0, -78.5],
    zoom: 4.8,
    pitch: 48,
    bearing: -165,
    durationSec: 18,
    directorNote: 'Vuelo rasante al horizonte. Simular óptica anamórfica con reflejo de destello polar sobre la mayor plataforma flotante de la Tierra.',
    expeditionLog: 'Una masa de hielo del tamaño de Francia. Sus acantilados frontales de 50 metros de altura flotan sobre aguas de más de 800 metros de profundidad.',
    cinematicLens: '35mm',
    recommendedFilter: 'infrared-aurora',
    audioPreset: 'aurora-resonance',
    telemetryTag: 'ICE MASS: 500.800 KM² // ELEVACIÓN 55M',
  },
  {
    id: 'ENDURANCE_WRECK',
    title: 'Santuario del Endurance: El Naufragio de Shackleton',
    region: 'Mar de Weddell',
    coordinates: [-52.05, -68.65],
    zoom: 6.2,
    pitch: 54,
    bearing: 65,
    durationSec: 16,
    directorNote: 'Filtro Sepia 1911 Terra Nova. Descender suavemente sobre el punto de hundimiento del buque de Shackleton en 1915 a 3.008m de profundidad.',
    expeditionLog: 'Preservado en aguas gélidas y libres de organismos xilófagos por más de un siglo. Testimonio eterno del heroísmo polar de la Edad Heroica.',
    cinematicLens: '85mm',
    recommendedFilter: 'shackleton-1911',
    audioPreset: 'hydrophone',
    telemetryTag: 'PROFUNDIDAD 3.008M // RESTOS PRESERVADOS',
  },
  {
    id: 'SOUTH_POLE',
    title: 'Polo Sur Geográfico: La Ventana Cósmica de Amundsen-Scott',
    region: 'Meseta Polar Antártica',
    coordinates: [0.0, -89.98],
    zoom: 3.4,
    pitch: 35,
    bearing: 0,
    durationSec: 16,
    directorNote: 'Órbita cenital lenta a 18mm con destello solar. El eje axial del hemisferio sur donde convergen todos los meridianos.',
    expeditionLog: 'A 2.835 metros de altitud sobre 3 kilómetros de manto de hielo continuo. El telescopio IceCube sondea aquí los neutrinos más energéticos del cosmos.',
    cinematicLens: '18mm',
    recommendedFilter: 'natgeo-prime',
    audioPreset: 'aurora-resonance',
    telemetryTag: 'ELEV 2.835M // TEMP -58°C // ICECUBE NEUTRINOS',
  },
];

export const WILDLIFE_SPOTLIGHTS: WildlifeSpotlight[] = [
  {
    id: 'EMPEROR_PENGUIN',
    commonName: 'Pingüino Emperador',
    scientificName: 'Aptenodytes forsteri',
    category: 'bird',
    conservationStatus: 'Casi Amenazado (IUCN)',
    bestShotLocation: 'Mar de Weddell / Cabo Washington',
    coordinates: [-45.0, -74.0],
    zoom: 6.5,
    pitch: 50,
    bearing: 20,
    directorTip: 'Filmar a 200mm f/2.8 a ras de hielo durante tormenta para captar la termorregulación colectiva en forma de tortuga.',
    behavioralInsight: 'Soporta -60°C y vientos de 200 km/h incubando el huevo sobre sus patas durante los 64 días de noche polar absoluta.',
    soundCue: 'Vocalización acústica de baja frecuencia entre parejas.',
  },
  {
    id: 'BLUE_WHALE',
    commonName: 'Ballena Azul Antártica',
    scientificName: 'Balaenoptera musculus intermedia',
    category: 'cetacean',
    conservationStatus: 'En Peligro Crítico (IUCN)',
    bestShotLocation: 'Mar de Bellingshausen',
    coordinates: [-85.0, -68.0],
    zoom: 5.8,
    pitch: 45,
    bearing: -40,
    directorTip: 'Enfocar a 85mm con filtro polarizador para capturar la silueta turquesa bajo la superficie antes del soplido de 12 metros.',
    behavioralInsight: 'El animal más grande que jamás ha existido (hasta 150 toneladas). Consume hasta 4 toneladas de krill antártico por día.',
    soundCue: 'Canto infrasónico de 14 Hz detectable a más de 1.000 km.',
  },
  {
    id: 'LEOPARD_SEAL',
    commonName: 'Foca Leopardo',
    scientificName: 'Hydrurga leptonyx',
    category: 'mammal',
    conservationStatus: 'Preocupación Menor (IUCN)',
    bestShotLocation: 'Estrecho de Bransfield',
    coordinates: [-59.0, -63.2],
    zoom: 7.2,
    pitch: 55,
    bearing: 10,
    directorTip: 'Gran angular subacuático 18mm con cúpula hemisférica al borde del témpano para capturar su mirada reptiliana y agilidad hidrodinámica.',
    behavioralInsight: 'Superdepredador ápice polar. Sus mandíbulas pueden abrirse hasta 160 grados con dientes trilobulados para filtrar krill y capturar pingüinos.',
    soundCue: 'Chirridos ultrasónicos y percusión pectoral submarina.',
  },
  {
    id: 'WANDERING_ALBATROSS',
    commonName: 'Albatros Errante',
    scientificName: 'Diomedea exulans',
    category: 'bird',
    conservationStatus: 'Vulnerable (IUCN)',
    bestShotLocation: 'Islas Georgia del Sur / Mar de Scotia',
    coordinates: [-37.5, -54.5],
    zoom: 6.0,
    pitch: 45,
    bearing: -70,
    directorTip: 'Seguimiento de alta velocidad a 120 FPS siguiendo el planeo dinámico a centímetros de la cresta de olas gigantes.',
    behavioralInsight: 'La mayor envergadura alar del reino animal (hasta 3.5 metros). Puede circunnavegar el Océano Austral sin batir las alas por miles de kilómetros.',
    soundCue: 'Silbido del viento cortado por las alas rígidas.',
  },
];

export interface NatGeoDirectorState {
  isDirectorMode: boolean;
  aspectRatio: AspectRatioMode;
  cinematicLut: CinematicLut;
  lensFocal: LensFocal;
  showViewfinderHud: boolean;
  showRuleOfThirds: boolean;
  showGoldenSpiral: boolean;
  showAnamorphicFlare: boolean;
  showAtmosphericParticles: boolean;
  isAutoTourPlaying: boolean;
  currentTourIndex: number;
  audioVolume: number;
  isAudioMuted: boolean;
  audioPreset: AudioPreset;
  activeSpotlightId: string | null;
  directorNotesOpen: boolean;
  timecode: string;
  cameraTilt: number;
  cameraBearing: number;
  cameraZoom: number;
  centerCoords: [number, number];
}

const DEFAULT_STATE: NatGeoDirectorState = {
  isDirectorMode: false,
  aspectRatio: '2.39:1',
  cinematicLut: 'natgeo-prime',
  lensFocal: '35mm',
  showViewfinderHud: true,
  showRuleOfThirds: false,
  showGoldenSpiral: false,
  showAnamorphicFlare: true,
  showAtmosphericParticles: true,
  isAutoTourPlaying: false,
  currentTourIndex: 0,
  audioVolume: 0.65,
  isAudioMuted: false,
  audioPreset: 'polar-wind',
  activeSpotlightId: null,
  directorNotesOpen: true,
  timecode: '01:24:59:18',
  cameraTilt: 45,
  cameraBearing: 0,
  cameraZoom: 3.2,
  centerCoords: [-64.8, -65.0],
};

class NatGeoDirectorStoreManager {
  private state: NatGeoDirectorState = { ...DEFAULT_STATE };
  private listeners: Array<(state: NatGeoDirectorState) => void> = [];

  public get(): NatGeoDirectorState {
    return this.state;
  }

  public set(updates: Partial<NatGeoDirectorState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  public toggleDirectorMode() {
    this.set({ isDirectorMode: !this.state.isDirectorMode });
  }

  public subscribe(listener: (state: NatGeoDirectorState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }
}

export const NatGeoDirectorStore = new NatGeoDirectorStoreManager();
