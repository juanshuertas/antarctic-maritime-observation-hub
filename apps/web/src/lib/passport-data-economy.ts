/**
 * AMOH Scientific Passport & Data Economy Engine
 * Rules 131-140: Proof of Observation, Proof of Quality, Bounties, Oceanic Global Grant seed, World ID.
 */

export interface ScientificPassport {
  id: string;
  holderName: string;
  worldIdVerified: boolean;
  nullifierHash?: string;
  proofOfObservationCount: number;
  proofOfQualityCount: number;
  totalAmohXp: number;
  currentTier: 'OBSERVADOR_CADETE' | 'CIENTÍFICO_DE_CAMPO' | 'INVESTIGADOR_POLAR' | 'EXPEDICIONARIO_MAESTRO';
  issuedAt: string;
}

export interface DataBounty {
  id: string;
  title: string;
  objective: string;
  targetRegion: string;
  targetDataType: 'ICE_THICKNESS' | 'WHALE_PHOTO_ID' | 'MICROPLASTICS' | 'SEAWATER_SALINITY';
  rewardXp: number;
  rewardGrantUsd?: number;
  sponsor: string;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
}

export const SEED_DATA_BOUNTIES: DataBounty[] = [
  {
    id: 'BOUNTY-2026-01',
    title: 'Foto-Identificación de Cola de Ballena Jorobada',
    objective: 'Captura de cara ventral de aleta caudal con resolución suficiente para matching Happywhale.',
    targetRegion: 'Canal Lemaire / Bahía Flandres',
    targetDataType: 'WHALE_PHOTO_ID',
    rewardXp: 500,
    rewardGrantUsd: 150,
    sponsor: 'IAATO Whale Ecology Taskforce',
    deadline: '2026-12-15',
    status: 'OPEN',
  },
  {
    id: 'BOUNTY-2026-02',
    title: 'Medición de Espesor de Nieve sobre Hielo Marino',
    objective: 'Sondaje de espesor con vara calibrada y registro georreferenciado para calibración CryoSat-2.',
    targetRegion: 'Mar de Bellingshausen',
    targetDataType: 'ICE_THICKNESS',
    rewardXp: 850,
    rewardGrantUsd: 250,
    sponsor: 'SCAR Glaciology Working Group',
    deadline: '2026-11-30',
    status: 'OPEN',
  },
  {
    id: 'BOUNTY-2026-03',
    title: 'Muestreo de Microplásticos en Agua Superficial',
    objective: 'Filtrado de red manta 330 µm con registro de volumen y conservación en frascos de vidrio.',
    targetRegion: 'Estrecho de Bransfield',
    targetDataType: 'MICROPLASTICS',
    rewardXp: 1200,
    rewardGrantUsd: 400,
    sponsor: 'Oceanic Global Research Alliance',
    deadline: '2027-01-20',
    status: 'OPEN',
  },
];

export const CURRENT_GRANTS_RADAR = [
  {
    name: 'Oceanic Global — Beach 100 Grant Initiative',
    openDate: '2026-09-01',
    deadline: '2026-10-09',
    microGrantRange: '$5.000 – $15.000 USD',
    multiYearRange: '$50.000 – $100.000 USD/año',
    eligibility: 'Investigación marina aplicada, conservación costera y ciencia ciudadana verificada.',
    sourceUrl: 'https://oceanic.global/',
    status: 'CONVOCATORIA_ABIERTA',
  },
  {
    name: 'AMOH Polar Research Fellowship 2026–2027',
    openDate: '2026-08-15',
    deadline: '2026-11-01',
    microGrantRange: '$10.000 – $25.000 USD',
    multiYearRange: 'N/A',
    eligibility: 'Campañas de telemetría de campo con nodo de borde AMOH y sensores DJI/móviles.',
    sourceUrl: 'https://amoh.science/grants',
    status: 'CONVOCATORIA_ABIERTA',
  },
];
