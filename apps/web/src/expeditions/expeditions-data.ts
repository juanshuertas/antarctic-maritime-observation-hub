/**
 * AMOH — EXPEDITIONS MASTER DATA MODEL & SEED REGISTRY
 * Southern Ocean & Western Antarctic Peninsula Operations
 * 
 * Strict Scientific Restraints:
 * 1. AIS absence != vessel absence.
 * 2. Satellite != real time.
 * 3. Co-location != environmental causation or illegality.
 * 4. Community observation != instrument measurement.
 * 5. Nothing auto-validates; conflict is preserved as scientific signal.
 */

export type ExpeditionProgram = 'NGS_LINDBLAD' | 'PAC' | 'PEACE_BOAT' | 'INTERNATIONAL';

export type ExpeditionStatus =
  | 'DRAFT'
  | 'PROPOSAL'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SELECTED'
  | 'PLANNING'
  | 'READY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'REFERENCE'
  | 'REFERENCE / PLANNING'
  | 'CALL_OPEN'
  | 'APPLICATION'
  | 'UNDER_EVALUATION'
  | 'PREPARATION'
  | 'DEPLOYING'
  | 'RETURNING'
  | 'REPORTING';

export type PACLifecycleStage =
  | '01_CALL_APPLICATION'
  | '02_PROPOSAL'
  | '03_EVALUATION'
  | '04_SELECTION'
  | '05_PREPARATION'
  | '06_PRE_ANTARCTIC_COURSE'
  | '07_MEDICAL_ADMIN_READINESS'
  | '08_LOGISTICS'
  | '09_DEPLOYMENT'
  | '10_ACTIVE_EXPEDITION'
  | '11_FIELD_SCIENCE'
  | '12_RETURN'
  | '13_REPORTING'
  | '14_SCIENTIFIC_PRODUCTS'
  | '15_DISSEMINATION'
  | '16_LESSONS_LEARNED'
  | '17_ARCHIVE'
  | 'REFERENCE';

export type RealityLabel =
  | 'INSTRUMENT DATA'
  | 'FIELD SENSOR'
  | 'COMMUNITY OBSERVATION'
  | 'VALIDATED SCIENCE';

export type ReviewStatus =
  | 'UNREVIEWED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'REJECTED'
  | 'NEEDS_INFORMATION'
  | 'CONFLICT';

export type MatchupStatus =
  | 'MATCH'
  | 'PARTIAL_MATCH'
  | 'NO_MATCH'
  | 'DATA_GAP'
  | 'CONFLICT';

export type DeviceClass =
  | 'LEVEL_1_WEB_PWA'
  | 'LEVEL_2_ANDROID_FIELD_NODE'
  | 'LEVEL_2_IOS_FIELD_NODE'
  | 'LEVEL_3_EXTERNAL_SENSOR';

export type SamplingProfile = 'ECO' | 'SURVEY' | 'BURST';

export interface DevicePermissions {
  location: boolean;
  camera: boolean;
  motion: boolean;
  orientation: boolean;
  barometer: boolean;
  network: boolean;
  health_data: boolean;
}

export interface ExpeditionMember {
  userId: string;
  name: string;
  role: 'LEAD RESEARCHER' | 'RESEARCHER' | 'EXPEDITION STAFF' | 'REVIEWER' | 'CONTRIBUTOR' | 'GUEST';
  institution: string;
  avatarText: string;
  joinedAt: string;
  isVerified: boolean;
}

export interface ExpeditionSession {
  sessionId: string;
  expeditionId: string;
  title: string;
  type: 'DECK OBSERVATION' | 'COASTAL TRANSIT' | 'AIS VALIDATION' | 'SEA-ICE OBSERVATION' | 'WHALE WATCH' | 'SATELLITE MATCHUP';
  startedAtUtc: string;
  endedAtUtc?: string;
  leader: string;
  method: string;
  locationStart: { name: string; lat: number; lon: number };
  locationEnd?: { name: string; lat: number; lon: number };
  weatherContext: { windKnots: number; tempC: number; seaState: string; visibilityKm: number };
  deviceIds: string[];
  notes: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  observationsCount: number;
}

export interface FieldObservation {
  observationId: string;
  expeditionId: string;
  sessionId?: string;
  observedAtUtc: string;
  observerName: string;
  observerRole: string;
  realityLabel: RealityLabel;
  category: 'vessel_sighting' | 'wildlife' | 'ice_condition' | 'acoustic_hydrophone' | 'ocean_surface' | 'weather_event';
  title: string;
  lat: number;
  lon: number;
  accuracyMeters: number;
  headingDegrees?: number;
  speedKnots?: number;
  notes: string;
  mediaUrl?: string;
  mediaHash?: string;
  deviceId?: string;
  reviewStatus: ReviewStatus;
  qualityTier: 1 | 2 | 3;
  provenance: {
    source: string;
    captureMethod: string;
    localTimestamp: string;
    signedSha256: string;
  };
}

export interface ExpeditionDevice {
  deviceId: string;
  publicKey: string;
  displayName: string;
  deviceClass: DeviceClass;
  ownerName: string;
  ownerConsent: boolean;
  samplingProfile: SamplingProfile;
  batteryPct: number;
  storageFreeMb: number;
  lastSeenUtc: string;
  trustState: 'PAIRED' | 'PENDING' | 'REVOKED';
  permissions: DevicePermissions;
  sensorCapabilities: string[];
  pendingRecordsCount: number;
  lastFix?: { lat: number; lon: number; accuracy: number };
}

export interface DeviceSample {
  sampleId: string;
  expeditionId: string;
  sessionId: string;
  deviceId: string;
  sensorType: 'location' | 'orientation' | 'barometer' | 'accelerometer' | 'gyroscope' | 'battery';
  observedAtUtc: string;
  summaryValue: {
    mean: number;
    min: number;
    max: number;
    stdDev: number;
    sampleCount: number;
    unit: string;
  };
  lat?: number;
  lon?: number;
  altitudeM?: number;
  horizontalAccuracyM?: number;
  samplingProfile: SamplingProfile;
  qualityTier: number;
  permissionScope: string;
  hash: string;
}

export interface ScientificMatchup {
  matchupId: string;
  expeditionId: string;
  observationId: string;
  observationTitle: string;
  aisEvidenceIds: string[];
  aisVesselName?: string;
  aisMmsi?: string;
  satelliteEvidenceIds: string[];
  satelliteSceneId?: string;
  satelliteAcquisitionUtc?: string;
  satelliteProcessingLatencyHours?: number;
  satelliteSensor?: string;
  timeDeltaSeconds: number;
  distanceMeters: number;
  qualityScore: number; // 0.0 - 1.0 (informational aid, not verdict)
  uncertaintyRating: 'LOW' | 'MODERATE' | 'HIGH';
  status: MatchupStatus;
  reviewer?: string;
  reviewedAt?: string;
  notes: string;
  restraintRuleCitation: string;
}

export interface ExpeditionOutput {
  outputId: string;
  expeditionId: string;
  type: 'ACTIVITY_MAP' | 'MATCHED_OBSERVATIONS' | 'DATA_GAPS' | 'MONITORING_PRIORITIES' | 'VOYAGE_REPLAY' | 'DATASET_EXPORT' | 'METHOD_REPORT';
  title: string;
  description: string;
  version: string;
  generatedAtUtc: string;
  provenance: {
    sources: string[];
    methodDoc: string;
    doi?: string;
  };
  metricsSummary: Record<string, string | number>;
  downloadUrl?: string;
}

export interface SyncState {
  localRecordsCount: number;
  queuedCount: number;
  syncedCount: number;
  failedCount: number;
  estimatedMb: number;
  connectionType: 'SHIP_LAN' | 'STARLINK' | 'OFFLINE';
  lastSyncUtc: string;
  shipEdgeIp: string;
  isSyncing: boolean;
}

export interface Expedition {
  expeditionId: string;
  title: string;
  program: string;
  programType?: ExpeditionProgram;
  expedition_number?: number;
  season?: string;
  year_start?: number;
  year_end?: number;
  mission_order?: number;
  lifecycleStage?: PACLifecycleStage;
  shipPlatform?: string;
  airSupport?: string;
  methodVersion?: string;
  leadUserId: string;
  leadName: string;
  leadRole: string;
  status: ExpeditionStatus;
  region: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  researchQuestion: string;
  projectPrinciple: string;
  principleDetails: string;
  proposalReference: string;
  disclaimer: string;
  successCriteria: {
    minimum: number;
    worthwhile: number;
    ideal: number;
    unit: string;
  };
  equipmentProfile: string[];
  corridorDescription: string;
  offlineReady: boolean;
  expeditionType?: 'RESEARCH_PROPOSAL' | 'NATIONAL_PROGRAM_REFERENCE' | 'REAL_VESSEL_METHOD_PILOT' | 'REFERENCE';
  officialReferenceUrl?: string;
  primaryFieldContributor?: string;
  researchAdmin?: string;
  vesselSystemAccess?: boolean;
  shipEquipmentInstallation?: boolean;
  routeModifiedForObservation?: boolean;
  passportIntegrationStatus?: 'NOT_CONNECTED' | 'PLANNED' | 'CONNECTED';
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// PRIMARY SEED RECORD: NATGEO / NGS-LINDBLAD VISITING SCIENTIST PROPOSAL
// =========================================================================

export const SEED_NATGEO_EXPEDITION: Expedition = {
  expeditionId: 'exp-natgeo-2027',
  title: 'From Satellite and Ship-Position Monitoring to Field Evidence: Antarctic Maritime Activity',
  program: 'NGS-Lindblad Expeditions Visiting Scientist Program Southern Ocean 2027–2028',
  programType: 'NGS_LINDBLAD',
  season: '2027–2028',
  year_start: 2027,
  year_end: 2028,
  lifecycleStage: '02_PROPOSAL',
  methodVersion: 'v1.0-Pilot',
  leadUserId: 'juan.huertas',
  leadName: 'Juan Sebastian Huertas Olea',
  leadRole: 'Visiting Scientist Applicant · Independent early-career researcher (geospatial technology, AIS & satellite integration)',
  status: 'PROPOSAL',
  region: 'Western Antarctic Peninsula',
  // Season window only (Oct 2027–Mar 2028). Voyage/dates are NOT selected or confirmed.
  plannedStart: '2027-10-01',
  plannedEnd: '2028-03-31',
  researchQuestion:
    'Where and when does maritime activity concentrate along the Western Antarctic Peninsula, and where do AIS, satellite observation, and direct field records agree, disagree, or leave observation gaps?',
  projectPrinciple:
    'THE VESSEL DOES NOT ADAPT TO THE RESEARCH; THE RESEARCH ADAPTS TO THE VESSEL.',
  principleDetails:
    'Guest and tourism operations always take priority. The core study is digital, geospatial and non-invasive: it requires no route change, fixed station, dedicated maneuver or Zodiac, guaranteed Bridge access, permanent ship installation, wet lab, drone, ROV, guest participation or continuous internet. It requires no biological specimens and no physical-sample storage; compatible, permitted measurements or samples from onboard experts may optionally add context but are never a dependency.',
  proposalReference: 'NG-LEX 2027–28 · application in preparation (no reference assigned)',
  disclaimer:
    'PROPOSAL / APPLICATION IN PREPARATION. Selection is not confirmed and no National Geographic or Lindblad endorsement is implied. This record contains no field data: no voyage has taken place.',
  successCriteria: {
    minimum: 6,
    worthwhile: 8,
    ideal: 12,
    unit: 'sesiones breves de observación (objetivo separado: al menos 4 casos de comparación multi-fuente de alta calidad)',
  },
  equipmentProfile: [
    'MacBook Pro — Edge Node: cómputo geoespacial offline, base local, QA/QC y respaldos',
    'iPhone dedicado al proyecto — Field Node: GNSS, UTC, fotografía y registro estructurado offline',
    'Insta360 Luna Ultra — imagen de contexto de campo (sin calibración radiométrica)',
    '2 SSD robustos (respaldo A/B) con verificación por hash',
    'Sin dron, ROV, CTD, laboratorio húmedo ni instalaciones en el buque',
  ],
  corridorDescription:
    'Western Antarctic Peninsula — sin estaciones fijas; sitios y fechas dependen del itinerario NG-LEX (no seleccionado).',
  offlineReady: true,
  createdAt: '2026-09-18T12:00:00Z',
  updatedAt: '2026-09-18T18:30:00Z',
};

// =========================================================================
// SECONDARY RECORD: PROGRAMA ANTÁRTICO COLOMBIANO (PAC) ARC SIMÓN BOLÍVAR
// =========================================================================

export const SEED_PAC_EXPEDITION: Expedition = {
  expeditionId: 'exp-pac-xii-2027',
  title: 'XII Expedición Científica de Colombia a la Antártida — PAC 2027–2028',
  program: 'Programa Antártico Colombiano (PAC) · Comisión Colombiana del Océano (CCO)',
  programType: 'PAC',
  season: '2027–2028',
  year_start: 2027,
  year_end: 2028,
  lifecycleStage: '05_PREPARATION',
  shipPlatform: 'ARC Simón Bolívar (24-BO)',
  airSupport: 'Helicóptero Bell 412 Armada Nacional',
  methodVersion: 'v2.0-Circumpolar',
  leadUserId: 'juan.huertas',
  leadName: 'Juan Sebastian Huertas Olea',
  leadRole: 'Investigador Principal · Oceanografía Satelital & Sistemas Autónomos',
  status: 'PLANNING',
  region: 'Estrecho de Gerlache, Bahía Fildes, Estrecho de Bransfield y Océano Austral',
  plannedStart: '2027-11-15',
  plannedEnd: '2028-03-10',
  researchQuestion:
    '¿Cuál es la respuesta de la circulación sub-mesoescalar y la productividad de microalgas ante el retroceso de plataformas glaciares en el sector norte de la Península Antártica y Océano Austral?',
  projectPrinciple:
    'SOBERANÍA CIENTÍFICA, INTEROPERABILIDAD POLAR Y CIENCIA ABIERTA COLOMBIANA.',
  principleDetails:
    'Despliegue a bordo del buque de investigación científico-marina ARC Simón Bolívar en aguas antárticas bajo el Tratado Antártico y Protocolo de Madrid. Operación 100% offline edge node conectada a la estación meteorológica y sensores CTD de a bordo.',
  proposalReference: 'PAC-XII-COL-2027-014',
  disclaimer:
    'PROYECTO DE INVESTIGACIÓN POLAR NACIONAL · En el marco de la Agenda Científica Antártica de Colombia 2014–2035.',
  successCriteria: {
    minimum: 12,
    worthwhile: 24,
    ideal: 36,
    unit: 'estaciones oceanográficas CTD y lances biogeoquímicos con validación satelital sincrónica',
  },
  equipmentProfile: [
    'Buque ARC Simón Bolívar (Plataforma Oceanográfica e Hidrográfica Polar)',
    'CTD Rosette Seabird 911plus con sensores de oxígeno disuelto y turbidez',
    'Perfilador de corrientes acústico Doppler (ADCP) de casco 38 kHz / 150 kHz',
    'Servidor de borde AMOH Edge Node (FastAPI / DuckDB / IndexedDB Offline-First)',
    'Estación meteorológica marina automática y transpondedores AIS Clase A',
  ],
  corridorDescription:
    'Tránsito Cartagena - Buenaventura - Valparaíso - Punta Arenas - Paso Drake - Estrecho de Gerlache - Bahía Fildes - Mar de Weddell.',
  offlineReady: true,
  createdAt: '2026-09-20T10:00:00Z',
  updatedAt: '2026-09-20T10:00:00Z',
};

export const SEED_PEACEBOAT_EXPEDITION: Expedition = {
  expeditionId: 'PB124-OLEA-2026',
  title: 'Peace Boat 124th Global Voyage — OLEA Shipboard Field-Observation Workflow Pilot',
  program: 'OLEA methodological pilot aboard Peace Boat 124th Global Voyage',
  programType: 'PEACE_BOAT',
  season: '2026',
  year_start: 2026,
  year_end: 2026,
  lifecycleStage: '10_ACTIVE_EXPEDITION',
  shipPlatform: 'Pacific World',
  methodVersion: 'PB124-method-pilot-v1',
  leadUserId: 'juan.huertas',
  leadName: 'Juan Sebastian Huertas Olea',
  leadRole: 'Independent Early-Career Researcher · Research Administrator',
  status: 'ACTIVE',
  region: 'Global voyage · shipboard opportunistic observation',
  plannedStart: '2026-08-20',
  plannedEnd: '2026-12-07',
  actualStart: '2026-08-20',
  researchQuestion:
    'Can an offline-first smartphone workflow capture traceable, reviewable shipboard field observations aboard a moving passenger vessel without depending on vessel systems or modifying normal operations?',
  projectPrinciple:
    'THE VESSEL DOES NOT ADAPT TO THE RESEARCH; THE RESEARCH ADAPTS TO THE VESSEL.',
  principleDetails:
    'Real-vessel methodological pilot using a participant smartphone only. Capture is opportunistic and safety-first. No NMEA, bridge navigation feed, internal AIS, vessel telemetry, ship laboratory, permanent hardware, antenna installation, or route modification is required.',
  proposalReference: 'PB124-OLEA-2026',
  disclaimer:
    'REAL-VESSEL METHODOLOGICAL PILOT. OLEA independently tests field capture, provenance, offline resilience and review workflow aboard a moving passenger vessel. This does not imply Peace Boat sponsorship or endorsement, Antarctic field validation, environmental-impact assessment, or pollution detection.',
  successCriteria: {
    minimum: 3,
    worthwhile: 4,
    ideal: 5,
    unit: 'high-quality observation opportunities captured with complete provenance and available for method review',
  },
  equipmentProfile: [
    'Personal smartphone used by the field contributor',
    'OLEA Field Connect web/PWA workflow with device GNSS and camera permissions',
    'Original optional photographs with independent app metadata and SHA-256 provenance',
    'Offline-first local persistence before synchronization',
    'No vessel-system connection, ship equipment installation, NMEA feed, internal AIS, telemetry or dedicated scientific hardware',
  ],
  corridorDescription:
    'The official Peace Boat 124th Global Voyage itinerary is a reference layer only. DEVICE_GNSS_OBSERVED_TRACK is created only from observation-time phone GNSS and must never be inferred from the published itinerary.',
  offlineReady: true,
  expeditionType: 'REAL_VESSEL_METHOD_PILOT',
  officialReferenceUrl: 'https://peaceboat.org/english/voyage/124th-global-voyage',
  primaryFieldContributor: 'Meri Joyce · International Coordinator, Peace Boat',
  researchAdmin: 'Juan Sebastian Huertas Olea · Independent Early-Career Researcher, Colombia',
  vesselSystemAccess: false,
  shipEquipmentInstallation: false,
  routeModifiedForObservation: false,
  passportIntegrationStatus: 'PLANNED',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
};

// Canonical multi-expedition registry is declared after the PAC 13 seed so all
// active records are initialized before the registry is constructed.

// =========================================================================
// SEED FIELD SESSIONS
// =========================================================================

// Proposal stage: no voyage has taken place, so there are no sessions.
export const SEED_EXPEDITION_SESSIONS: ExpeditionSession[] = [];

// =========================================================================
// SEED FIELD OBSERVATIONS (TIERED REALITY LABELS)
// =========================================================================

// Proposal stage: no field observations exist. Do not seed demo observations.
export const SEED_FIELD_OBSERVATIONS: FieldObservation[] = [];

// =========================================================================
// SEED SCIENTIFIC MATCHUPS (AIS + SATELLITE + FIELD)
// =========================================================================

// Proposal stage: no AIS–satellite–field matchups exist.
export const SEED_SCIENTIFIC_MATCHUPS: ScientificMatchup[] = [];

// =========================================================================
// SEED EXPEDITION DEVICES
// =========================================================================

// Planned project equipment (NG-LEX budget). Nothing is paired or in use yet.
export const SEED_EXPEDITION_DEVICES: ExpeditionDevice[] = [
  {
    deviceId: 'dev-planned-iphone-field-node',
    publicKey: '',
    displayName: 'iPhone dedicado — Field Node (planificado)',
    deviceClass: 'LEVEL_2_IOS_FIELD_NODE',
    ownerName: 'Juan Sebastian Huertas Olea',
    ownerConsent: true,
    samplingProfile: 'ECO',
    batteryPct: 0,
    storageFreeMb: 0,
    lastSeenUtc: '',
    trustState: 'PENDING',
    permissions: { location: true, camera: true, motion: false, orientation: true, barometer: false, network: true, health_data: false },
    sensorCapabilities: ['GNSS + precisión', 'Cámara', 'Cola local offline'],
    pendingRecordsCount: 0,
  },
  {
    deviceId: 'dev-planned-macbook-edge-node',
    publicKey: '',
    displayName: 'MacBook Pro — Edge Node (planificado)',
    deviceClass: 'LEVEL_3_EXTERNAL_SENSOR',
    ownerName: 'Juan Sebastian Huertas Olea',
    ownerConsent: true,
    samplingProfile: 'ECO',
    batteryPct: 0,
    storageFreeMb: 0,
    lastSeenUtc: '',
    trustState: 'PENDING',
    permissions: { location: false, camera: false, motion: false, orientation: false, barometer: false, network: true, health_data: false },
    sensorCapabilities: ['DuckDB Spatial', 'QA/QC y procedencia', 'Respaldo en 2 SSD'],
    pendingRecordsCount: 0,
  },
];

// =========================================================================
// SEED EXPEDITION TEAM MEMBERS
// =========================================================================

// Application: PI plus at most one team member (rule to be re-verified). No other people are listed until confirmed.
export const SEED_EXPEDITION_MEMBERS: ExpeditionMember[] = [
  {
    userId: 'juan.huertas',
    name: 'Juan Sebastian Huertas Olea',
    role: 'LEAD RESEARCHER',
    institution: 'OLEA — Observatory for Linked Evidence in Antarctica (independent early-career researcher)',
    avatarText: 'JSHO',
    joinedAt: '2026-09-18',
    isVerified: false,
  },
];

// =========================================================================
// SEED SYNC STATE & SHIP EDGE TELEMETRY
// =========================================================================

export const INITIAL_SYNC_STATE: SyncState = {
  localRecordsCount: 0,
  queuedCount: 0,
  syncedCount: 0,
  failedCount: 0,
  estimatedMb: 0,
  connectionType: 'OFFLINE',
  lastSyncUtc: '',
  shipEdgeIp: '',
  isSyncing: false,
};

// =========================================================================
// SEED EXPEDITION OUTPUTS
// =========================================================================

// Proposal stage: no outputs have been generated.
export const SEED_EXPEDITION_OUTPUTS: ExpeditionOutput[] = [];

// =========================================================================
// PAC (PROGRAMA ANTÁRTICO COLOMBIANO) DATA SCHEMAS & INTERFACES
// =========================================================================

export type ReadinessState = 'COMPLETE' | 'PENDING' | 'NOT_REQUIRED' | 'EXPIRED' | 'REQUIRES_REVIEW';

export type ReadinessCategory =
  | 'DOCUMENTS'
  | 'HEALTH'
  | 'COURSE'
  | 'LOGISTICS'
  | 'EQUIPMENT'
  | 'SCIENCE'
  | 'SAFETY'
  | 'ENVIRONMENT'
  | 'COMMUNICATIONS';

export interface ReadinessItem {
  id: string;
  category: ReadinessCategory;
  title: string;
  description: string;
  state: ReadinessState;
  lastVerified?: string;
  verifier?: string;
  expiresAt?: string;
  actionRequired?: string;
  notes?: string;
}

export type PacDocumentType =
  | 'LEGAL_TRAVEL_PASSPORT'
  | 'AMOH_SCIENTIFIC_PASSPORT'
  | 'VISA'
  | 'MEDICAL_FITNESS_CERTIFICATE'
  | 'EXPEDITION_INSURANCE'
  | 'PAC_APPLICATION_FORM'
  | 'INSTITUTIONAL_AUTHORIZATION'
  | 'TRAVEL_ITINERARY'
  | 'OTHER';

export interface PacDocument {
  docId: string;
  type: PacDocumentType;
  title: string;
  classification: 'PRIVATE' | 'RESTRICTED';
  issuer: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'REQUIRES_RENEWAL';
  issueDate?: string;
  expiryDate: string;
  secureRefHash: string; // Exists to ensure no raw scans are exposed in Live Lens
  notes: string;
}

export interface PreAntarcticCourseTopic {
  topicId: string;
  title: string;
  hours: number;
  completed: boolean;
  evaluationScore?: number;
  completedAt?: string;
}

export interface PreAntarcticCourseRecord {
  courseId: string;
  expeditionId: string;
  userId: string;
  userName: string;
  edition: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CERTIFIED';
  certificateNumber?: string;
  issuedAt?: string;
  institution: string;
  topics: PreAntarcticCourseTopic[];
  passportCredentialEligible: boolean;
}

export interface HealthReadiness {
  recordId: string;
  expeditionId: string;
  userId: string;
  userName: string;
  classification: 'SENSITIVE_HUMAN_DATA';
  operationalStatus: 'FIT' | 'NOT_CLEARED' | 'PENDING' | 'EXPIRED' | 'REVIEW_REQUIRED';
  evaluatedByInstitution: string;
  evaluationDate: string;
  validUntil: string;
  bloodType: string;
  dentalClearance: boolean;
  psychologicalClearance: boolean;
  cardiovascularClearance: boolean;
  specialFieldRestrictions?: string; // e.g. "Apto para cubierta y zodiac; evitar inmersión prolongada"
  emergencyAllergyWarning?: string;
}

export interface LogisticsItineraryItem {
  itemId: string;
  segmentType: 'FLIGHT' | 'LODGING' | 'EMBARKATION' | 'CUSTOMS_TRANSIT' | 'CARGO_SHIPPING';
  title: string;
  origin: string;
  destination: string;
  carrierOrLocation: string;
  scheduledDepartureUtc: string;
  scheduledArrivalUtc: string;
  status: 'PLANNED' | 'CONFIRMED' | 'CHANGED' | 'CANCELLED' | 'DELAYED';
  baggageWeightKg: number;
  notes: string;
  versionHistory: { version: number; changedAt: string; reason: string; changedBy: string }[];
}

export interface EquipmentItem {
  equipmentId: string;
  name: string;
  category: 'SCIENTIFIC_SENSOR' | 'OPTICAL_SYSTEM' | 'DRONE_UAV' | 'COMPUTING_EDGE' | 'PERSONAL_PPE' | 'SURVIVAL_GEAR';
  owner: 'PAC_CCO' | 'AMOH_LAB' | 'PERSONAL';
  assignedTo: string;
  serialOrAssetRef: string;
  condition: 'OPTIMAL' | 'GOOD' | 'FAIR' | 'REQUIRES_CALIBRATION' | 'DAMAGED';
  calibrationDate?: string;
  calibrationValidUntil?: string;
  batteryHealthPct?: number;
  storageLocation: string;
  checkedOutAt?: string;
  returnedAt?: string;
  preUseCheckCompleted: boolean;
  postUseCheckCompleted: boolean;
  notes: string;
}

export interface PersonalEquipmentItem {
  itemId: string;
  name: string;
  layer: 'CAPA_1_TERMICA' | 'CAPA_2_AISLANTE' | 'CAPA_3_IMPERMEABLE' | 'CALZADO' | 'ACCESORIOS' | 'ELECTRONICA';
  mandatory: boolean;
  packed: boolean;
  inspected: boolean;
  notes: string;
}

export interface PacScienceProject {
  projectId: string;
  expeditionId: string;
  code: string;
  title: string;
  principalInvestigator: string;
  coinvestigators: string[];
  institution: string;
  researchLine: string;
  objective: string;
  methodology: string;
  fieldRequirements: string;
  equipmentList: string[];
  dataManagementPlan: string;
  environmentalConstraints: string;
  methodVersion: string;
  status: 'PROPOSAL' | 'APPROVED' | 'IN_EXECUTION' | 'CONCLUDED';
}

export interface MethodVersionRecord {
  methodId: string;
  name: string;
  version: string;
  expeditionId: string;
  usedAt: string;
  changeLog: string[];
}

export interface SafetyState {
  currentStatus: 'READY' | 'HOLD' | 'STOP' | 'RETURN' | 'EMERGENCY';
  briefingCompleted: boolean;
  briefingNotes: string;
  maxWindKnotsLimit: number;
  minVisibilityKmLimit: number;
  safetyOfficer: string;
  ruleEnforced: 'SAFETY OVERRIDES SCIENTIFIC SCHEDULE';
}

export interface SafetyCheckIn {
  checkInId: string;
  sessionId: string;
  userId: string;
  userName: string;
  timestampUtc: string;
  lat: number;
  lon: number;
  status: 'ACTIVE' | 'OK' | 'REQUEST_RETURN' | 'ASSISTANCE_NEEDED';
}

export interface CommsContact {
  role: 'ACTIVITY_LEAD' | 'EXPEDITION_LEAD' | 'SAFETY_COORDINATOR' | 'MEDICAL' | 'LOGISTICS' | 'COMMUNICATIONS' | 'INSTITUTIONAL_CCO';
  name: string;
  vhfChannel: string;
  callsign: string;
  satPhone?: string;
  email: string;
  priority: 1 | 2 | 3;
  offlineAvailable: boolean;
}

export interface IncidentRecord {
  incidentId: string;
  expeditionId: string;
  sessionId?: string;
  reportedAtUtc: string;
  reportedBy: string;
  category: 'NEAR_MISS' | 'EQUIPMENT_DAMAGE' | 'WEATHER_HAZARD' | 'COMMUNICATION_LOSS' | 'ENVIRONMENTAL_SPILL' | 'MINOR_INJURY';
  location: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'CONFIRMED' | 'UNCONFIRMED' | 'RESOLVED' | 'UNDER_REVIEW';
  personsInvolved: string[];
  immediateActionTaken: string;
  followUpRequired: string;
  versionHistory: { version: number; timestamp: string; note: string }[];
}

export interface EnvironmentalCompliance {
  protectedAreasChecked: boolean;
  aspaReferences: string[];
  wildlifeDistanceGuideline: string;
  biosecurityChecklist: {
    boots: 'CLEAN' | 'DISINFECT' | 'INSPECT' | 'CONFIRMED';
    clothing: 'CLEAN' | 'DISINFECT' | 'INSPECT' | 'CONFIRMED';
    gearBags: 'CLEAN' | 'DISINFECT' | 'INSPECT' | 'CONFIRMED';
    droneCases: 'CLEAN' | 'DISINFECT' | 'INSPECT' | 'CONFIRMED';
  };
  droneCapable: boolean;
  droneFlightAuthorization: 'APPROVED' | 'PENDING' | 'NOT_AUTHORIZED' | 'NOT_REQUIRED';
  wasteProtocolAdherence: boolean;
}

export interface DailyDataBackupRecord {
  backupDate: string;
  observationsCount: number;
  mediaFilesCount: number;
  totalBytes: number;
  manifestSha256: string;
  state: 'LOCAL_ONLY' | 'EDGE_BACKUP' | 'SECONDARY_COPY' | 'CLOUD_SYNCED' | 'VERIFY_FAILED';
  verifiedAtUtc?: string;
  verifiedBy?: string;
}

export interface ReturnReport {
  reportId: string;
  type: 'TECHNICAL' | 'SCIENTIFIC' | 'LOGISTICS' | 'OPERATIONAL_NOVELTY' | 'INCIDENT' | 'OBJECTIVE_COMPLIANCE';
  title: string;
  status: 'DRAFT' | 'READY_FOR_PEER_REVIEW' | 'INSTITUTIONAL_SUBMITTED' | 'ARCHIVED';
  summary: string;
  version: string;
}

export interface ScientificProduct {
  productId: string;
  type: 'PAPER' | 'POSTER' | 'DATASET' | 'MAP' | 'MODEL' | 'METHOD' | 'SOFTWARE';
  title: string;
  authors: string[];
  doiOrUrl?: string;
  status: 'IN_PREPARATION' | 'SUBMITTED' | 'ACCEPTED' | 'PUBLISHED';
  targetVenue: string;
}

export interface LessonLearned {
  lessonId: string;
  category: 'SCIENCE' | 'DATA' | 'LOGISTICS' | 'DEVICES' | 'CONNECTIVITY' | 'SAFETY' | 'ENVIRONMENT' | 'TEAM' | 'METHOD';
  title: string;
  observation: string;
  actionableRecommendation: string;
  applicableToFutureExpeditions: boolean;
}

// =========================================================================
// SEED PAC 13TH EXPEDITION (REFERENCE / PLANNING)
// =========================================================================

export const SEED_PAC13_EXPEDITION: Expedition = {
  expeditionId: 'exp-pac-13',
  title: 'XIII Expedición Científica de Colombia a la Antártica',
  program: 'Programa Antártico Colombiano',
  programType: 'PAC',
  expedition_number: 13,
  season: '2026–2027',
  year_start: 2026,
  year_end: 2027,
  mission_order: 13,
  status: 'REFERENCE / PLANNING',
  lifecycleStage: '05_PREPARATION',
  leadUserId: 'juan.huertas',
  leadName: 'Juan Sebastian Huertas Olea',
  leadRole: 'Investigador independiente · interés en futura convocatoria PAC',
  region: 'Estrecho de Gerlache & Islas Shetland del Sur',
  plannedStart: 'Por definir',
  plannedEnd: 'Por definir',
  researchQuestion:
    'Espacio de planificación para preparar método, requisitos y documentos ante una futura convocatoria del Programa Antártico Colombiano. Sin pregunta científica aprobada.',
  projectPrinciple:
    'SEGURIDAD ANTES QUE CIENCIA · LA INVESTIGACIÓN SE ADAPTA A LA LOGÍSTICA POLAR',
  principleDetails:
    'La seguridad operacional prevalece sobre cualquier meta de muestreo. Integración de AMOH como proyecto no invasivo dentro de la plataforma del buque ARC y bases polares en cooperación internacional.',
  proposalReference: 'Sin referencia: convocatoria PAC no publicada',
  disclaimer:
    'PROTOTIPO DE PLANIFICACIÓN CON DATOS DE EJEMPLO. El proponente no participa en ninguna expedición PAC confirmada; una futura convocatoria está sujeta a publicación. No implica aval ni selección oficial de la CCO.',
  successCriteria: {
    minimum: 6,
    worthwhile: 10,
    ideal: 14,
    unit: 'sesiones oceanográficas completadas con trazabilidad criptográfica y backup verificado',
  },
  equipmentProfile: [
    'Estación meteorológica y barométrica autónoma de bajo consumo',
    'Sensores inerciales de cubierta y tablets rugerizadas con nodo AMOH',
    'Binoculares náuticos de retícula estadiométrica para aforos visuales',
    'Nodo Edge de buque (FastAPI + DuckDB Spatial + Pythia Local)',
    'Indumentaria técnica polar multicapa normada por el STA',
  ],
  corridorDescription:
    'Por definir según la convocatoria PAC.',
  offlineReady: true,
  createdAt: '2026-09-18T14:00:00Z',
  updatedAt: '2026-09-18T18:45:00Z',
  methodVersion: 'v1.1-PAC',
  shipPlatform: 'Plataforma ARC (por confirmar según asignación CCO)',
  airSupport: 'Por definir',
};

// =========================================================================
// SEED PAC READINESS CHECKLIST (ZERO FAKE SCORES - INDIVIDUAL STATES)
// =========================================================================

export const SEED_PAC_READINESS: ReadinessItem[] = [
  {
    id: 'read-doc-01',
    category: 'DOCUMENTS',
    title: 'Pasaporte Legal de Viaje (Vigencia > 6 meses)',
    description: 'Documento oficial de viaje nacional requerido para tránsitos migratorios internacionales.',
    state: 'COMPLETE',
    lastVerified: '2026-09-10',
    verifier: 'Coordinación Administrativa PAC',
    expiresAt: '2030-05-14',
    notes: 'Pasaporte ordinario con visa chilena / argentina no requerida para estancias menores.',
  },
  {
    id: 'read-doc-02',
    category: 'DOCUMENTS',
    title: 'Pasaporte Científico Digital AMOH',
    description: 'Registro de identidad científica descentralizada, credenciales W3C y bitácora de campo.',
    state: 'COMPLETE',
    lastVerified: '2026-09-18',
    verifier: 'World Oceans Living Observatory Protocol',
    notes: 'Identidad activa AMOH-ASP-2026-08842 vinculada al perfil del investigador.',
  },
  {
    id: 'read-doc-03',
    category: 'DOCUMENTS',
    title: 'Póliza de Seguro de Evacuación y Rescate Polar',
    description: 'Cobertura médica extrema y rescate SAR en aguas antárticas australes.',
    state: 'REQUIRES_REVIEW',
    lastVerified: '2026-08-20',
    verifier: 'Aseguradora Internacional Polar',
    expiresAt: '2026-11-30',
    actionRequired: 'Renovar endoso de rescate aeromédico antártico para temporada 2026-2027.',
  },
  {
    id: 'read-doc-04',
    category: 'DOCUMENTS',
    title: 'Formularios y Avales Institucionales CCO',
    description: 'Aprobación del comité técnico y de seguridad de la Comisión Colombiana del Océano.',
    state: 'PENDING',
    actionRequired: 'Pendiente de radicación de dictamen final de la comisión evaluadora.',
  },
  {
    id: 'read-hlt-01',
    category: 'HEALTH',
    title: 'Certificado de Aptitud Médica Polar (DIMAR / Sanidad)',
    description: 'Evaluación de resistencia fisiológica al frío extremo y confinamiento en altamar.',
    state: 'COMPLETE',
    lastVerified: '2026-09-01',
    expiresAt: '2027-04-01',
    notes: 'Apto sin restricciones clínicas operacionales.',
  },
  {
    id: 'read-hlt-02',
    category: 'HEALTH',
    title: 'Certificado Odontológico Panorámico',
    description: 'Ausencia de caries no tratadas o riesgos de absceso dental en zona remota sin cirujano.',
    state: 'COMPLETE',
    lastVerified: '2026-09-05',
    expiresAt: '2027-03-01',
  },
  {
    id: 'read-hlt-03',
    category: 'HEALTH',
    title: 'Esquema Vacunal Antártico y Tétanos',
    description: 'Inmunización profiláctica vigente según directrices SCAR.',
    state: 'COMPLETE',
    lastVerified: '2026-08-15',
  },
  {
    id: 'read-crs-01',
    category: 'COURSE',
    title: 'Curso Pre-Antártico PAC (12 Módulos Oficiales)',
    description: 'Acreditación integral del Tratado Antártico, bioseguridad, supervivencia y reglas CCO.',
    state: 'COMPLETE',
    lastVerified: '2026-08-28',
    verifier: 'Comisión Colombiana del Océano · Armada de Colombia',
    notes: 'Aprobado con distinción académica. Credencial lista para Pasaporte AMOH.',
  },
  {
    id: 'read-log-01',
    category: 'LOGISTICS',
    title: 'Reserva de Vuelos y Conexión Punta Arenas / Ushuaia',
    description: 'Itinerario aéreo hacia el puerto de zarpe austral.',
    state: 'REQUIRES_REVIEW',
    actionRequired: 'Confirmar franja de arribo 48h antes del zarpe del buque nodriza.',
  },
  {
    id: 'read-log-02',
    category: 'LOGISTICS',
    title: 'Manifiesto de Carga y Aforo de Equipos Aduaneros',
    description: 'Declaración DIAN de salida temporal de instrumentos y sensores científicos.',
    state: 'PENDING',
    actionRequired: 'Consolidar números de serie de laptops rugerizadas y sensores de campo.',
  },
  {
    id: 'read-eqp-01',
    category: 'EQUIPMENT',
    title: 'Calibración de Sensores Inerciales y Barómetros',
    description: 'Verificación metrológica en laboratorio con trazabilidad NIST / SIC.',
    state: 'COMPLETE',
    lastVerified: '2026-09-12',
    expiresAt: '2027-09-12',
  },
  {
    id: 'read-eqp-02',
    category: 'EQUIPMENT',
    title: 'Inspección de Vestuario Técnico Polar (3 Capas)',
    description: 'Comprobación de aislamiento térmico, costuras termoselladas y calzado antártico.',
    state: 'COMPLETE',
    lastVerified: '2026-09-15',
  },
  {
    id: 'read-sci-01',
    category: 'SCIENCE',
    title: 'Plan de Gestión de Datos (DMP) Conforme a SCAR',
    description: 'Protocolo de preservación de metadatos abiertos, hashes SHA-256 y publicación Zenodo.',
    state: 'COMPLETE',
    lastVerified: '2026-09-16',
  },
  {
    id: 'read-saf-01',
    category: 'SAFETY',
    title: 'Protocolo de Emergencia y Hombre al Agua (MOB)',
    description: 'Briefing de seguridad en botes neumáticos Zodiac y supervivencia en aguas a -1.8°C.',
    state: 'COMPLETE',
    lastVerified: '2026-08-28',
  },
  {
    id: 'read-env-01',
    category: 'ENVIRONMENT',
    title: 'Evaluación de Impacto Ambiental Previo (EIA-STA)',
    description: 'Declaración de actividades de bajo impacto y nula emisión contaminante.',
    state: 'COMPLETE',
    lastVerified: '2026-08-10',
  },
  {
    id: 'read-env-02',
    category: 'ENVIRONMENT',
    title: 'Autorización Operacional de Vuelo UAV / Dron',
    description: 'Permiso específico para tomas fotogramétricas a más de 100m de pingüineras.',
    state: 'PENDING',
    actionRequired: 'Solicitar autorización de vuelo al coordinador ambiental de la expedición.',
  },
  {
    id: 'read-com-01',
    category: 'COMMUNICATIONS',
    title: 'Directorio de Frecuencias Marítimas VHF / HF y Satelital',
    description: 'Matriz de comunicaciones y llamada selectiva digital a bordo.',
    state: 'COMPLETE',
    lastVerified: '2026-09-18',
  },
];

// =========================================================================
// SEED PAC DOCUMENTS (CLASSIFIED AS PRIVATE - DISTINCT TRAVEL VS AMOH PASSPORT)
// =========================================================================

export const SEED_PAC_DOCUMENTS: PacDocument[] = [
  {
    docId: 'doc-pac-01',
    type: 'LEGAL_TRAVEL_PASSPORT',
    title: 'Pasaporte Nacional Ordinario de la República de Colombia',
    classification: 'PRIVATE',
    issuer: 'Ministerio de Relaciones Exteriores de Colombia',
    verificationStatus: 'VERIFIED',
    issueDate: '2020-05-15',
    expiryDate: '2030-05-14',
    secureRefHash: 'sha256:4d87f7a26b6858e7de86f0dbe585c5b46bdfbe3680ec326e492b492b4bfa293c',
    notes: 'Documento legal de viaje internacional. Verificado físicamente.',
  },
  {
    docId: 'doc-pac-02',
    type: 'AMOH_SCIENTIFIC_PASSPORT',
    title: 'Pasaporte Científico Antártico Digital (W3C DID)',
    classification: 'PRIVATE',
    issuer: 'AMOH World Oceans Living Observatory',
    verificationStatus: 'VERIFIED',
    issueDate: '2026-01-10',
    expiryDate: '2036-01-10',
    secureRefHash: 'sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    notes: 'Credencial científica descentralizada. Distinta e independiente del pasaporte legal de viaje.',
  },
  {
    docId: 'doc-pac-03',
    type: 'MEDICAL_FITNESS_CERTIFICATE',
    title: 'Certificado de Aptitud Psicofísica Antártica #MED-POLAR-2026-44',
    classification: 'PRIVATE',
    issuer: 'Centro Médico Naval / Sanidad Armada de Colombia',
    verificationStatus: 'VERIFIED',
    issueDate: '2026-09-01',
    expiryDate: '2027-04-01',
    secureRefHash: 'sha256:7a41ecba9fbc0062b1a1c97a5538e3e4811f0a13d726c59b6c49e791631e843e',
    notes: 'Aptitud psicofísica y odontológica completa. Conservado bajo estricta reserva médica.',
  },
  {
    docId: 'doc-pac-04',
    type: 'EXPEDITION_INSURANCE',
    title: 'Póliza de Asistencia Médica y Repatriación Austral #POL-AUSTRAL-998',
    classification: 'PRIVATE',
    issuer: 'Seguros Global Polar SAR',
    verificationStatus: 'REQUIRES_RENEWAL',
    issueDate: '2025-12-01',
    expiryDate: '2026-11-30',
    secureRefHash: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    notes: 'Cobertura hasta US$ 500,000 para rescate aeromédico polar. Requiere extensión a feb 2027.',
  },
  {
    docId: 'doc-pac-05',
    type: 'INSTITUTIONAL_AUTHORIZATION',
    title: 'Carta de Respaldo y Comisión Institucional de Investigación',
    classification: 'PRIVATE',
    issuer: 'Universidad de los Andes / AMOH Research Consortium',
    verificationStatus: 'VERIFIED',
    issueDate: '2026-08-15',
    expiryDate: '2027-06-30',
    secureRefHash: 'sha256:bb0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    notes: 'Autorización de comisión de servicios de investigación en aguas polares.',
  },
];

// =========================================================================
// SEED PRE-ANTARCTIC COURSE (12 OFFICIAL TOPICS)
// =========================================================================

export const SEED_PAC_COURSE: PreAntarcticCourseRecord = {
  courseId: 'crs-pac-2026-01',
  expeditionId: 'exp-pac-13',
  userId: 'juan.huertas',
  userName: 'Juan Sebastian Huertas Olea',
  edition: 'X Curso de Capacitación Antártica Nacional',
  status: 'CERTIFIED',
  certificateNumber: 'CCO-CAP-ANT-2026-042',
  issuedAt: '2026-08-28T18:00:00Z',
  institution: 'Comisión Colombiana del Océano & Escuela Naval Almirante Padilla',
  passportCredentialEligible: true,
  topics: [
    { topicId: 'top-01', title: 'Sistema del Tratado Antártico (STA) y Protocolo de Madrid', hours: 8, completed: true, evaluationScore: 98, completedAt: '2026-08-20' },
    { topicId: 'top-02', title: 'Protección Ambiental Antártica y Zonas Protegidas (ASPA / ASMA)', hours: 6, completed: true, evaluationScore: 96, completedAt: '2026-08-21' },
    { topicId: 'top-03', title: 'Seguridad Operacional a Bordo de Buques Polares y Botes Zodiac', hours: 8, completed: true, evaluationScore: 100, completedAt: '2026-08-22' },
    { topicId: 'top-04', title: 'Supervivencia en Clima Polar, Hipotermia y Primeros Auxilios', hours: 10, completed: true, evaluationScore: 95, completedAt: '2026-08-23' },
    { topicId: 'top-05', title: 'Gestión del Riesgo y Toma de Decisiones en Entornos Glaciares', hours: 6, completed: true, evaluationScore: 94, completedAt: '2026-08-24' },
    { topicId: 'top-06', title: 'Bioseguridad y Desinfección de Equipo Científico y Calzado', hours: 4, completed: true, evaluationScore: 100, completedAt: '2026-08-24' },
    { topicId: 'top-07', title: 'Comportamiento Ético y Distancias Mínimas a Fauna Antártica', hours: 4, completed: true, evaluationScore: 98, completedAt: '2026-08-25' },
    { topicId: 'top-08', title: 'Operaciones en Bases Científicas y Campamentos de Terreno', hours: 6, completed: true, evaluationScore: 92, completedAt: '2026-08-25' },
    { topicId: 'top-09', title: 'Gestión Integral de Residuos Antárticos (Anexo III STA)', hours: 4, completed: true, evaluationScore: 100, completedAt: '2026-08-26' },
    { topicId: 'top-10', title: 'Comunicaciones de Emergencia, VHF Marítimo y Equipos HF/Satelital', hours: 4, completed: true, evaluationScore: 96, completedAt: '2026-08-26' },
    { topicId: 'top-11', title: 'Legislación y Gobernanza del Programa Antártico Colombiano', hours: 4, completed: true, evaluationScore: 95, completedAt: '2026-08-27' },
    { topicId: 'top-12', title: 'Responsabilidades Éticas y Conducta del Expedicionario Polar', hours: 4, completed: true, evaluationScore: 100, completedAt: '2026-08-28' },
  ],
};

// =========================================================================
// SEED HEALTH READINESS (SENSITIVE_HUMAN_DATA - OPERATIONAL CLEARANCE)
// =========================================================================

export const SEED_PAC_HEALTH: HealthReadiness = {
  recordId: 'hlt-pac-2026-01',
  expeditionId: 'exp-pac-13',
  userId: 'juan.huertas',
  userName: 'Juan Sebastian Huertas Olea',
  classification: 'SENSITIVE_HUMAN_DATA',
  operationalStatus: 'FIT',
  evaluatedByInstitution: 'Dirección de Sanidad Naval / Centro de Medicina Austral',
  evaluationDate: '2026-09-01',
  validUntil: '2027-04-01',
  bloodType: 'O Rh Positivo',
  dentalClearance: true,
  psychologicalClearance: true,
  cardiovascularClearance: true,
  specialFieldRestrictions: 'Apto para maniobras en cubierta alta, navegación en botes neumáticos y trabajo en laboratorios de buque.',
  emergencyAllergyWarning: 'Sin alergias a medicamentos declaradas ni comorbilidades agudas.',
};

// =========================================================================
// SEED LOGISTICS & ITINERARY WORKSPACE
// =========================================================================

export const SEED_PAC_LOGISTICS: LogisticsItineraryItem[] = [
  {
    itemId: 'log-pac-01',
    segmentType: 'FLIGHT',
    title: 'Vuelo Bogotá (BOG) → Santiago de Chile (SCL)',
    origin: 'Bogotá (El Dorado)',
    destination: 'Santiago (Arturo Merino Benítez)',
    carrierOrLocation: 'Aerolínea Comercial / Vuelo Regular',
    scheduledDepartureUtc: '2026-12-10T02:30:00Z',
    scheduledArrivalUtc: '2026-12-10T08:45:00Z',
    status: 'CONFIRMED',
    baggageWeightKg: 42,
    notes: 'Incluye 2 piezas de equipaje polar y 1 maleta de instrumentos frágiles en cabina.',
    versionHistory: [{ version: 1, changedAt: '2026-08-15T10:00:00Z', reason: 'Emisión inicial de itinerario', changedBy: 'Logística PAC' }],
  },
  {
    itemId: 'log-pac-02',
    segmentType: 'FLIGHT',
    title: 'Vuelo Santiago (SCL) → Punta Arenas (PUQ)',
    origin: 'Santiago de Chile',
    destination: 'Punta Arenas (Carlos Ibáñez del Campo)',
    carrierOrLocation: 'Vuelo Doméstico Austral',
    scheduledDepartureUtc: '2026-12-10T12:00:00Z',
    scheduledArrivalUtc: '2026-12-10T15:30:00Z',
    status: 'CONFIRMED',
    baggageWeightKg: 42,
    notes: 'Punto de concentración y revisión de equipo térmico en Punta Arenas.',
    versionHistory: [{ version: 1, changedAt: '2026-08-15T10:00:00Z', reason: 'Reserva confirmada', changedBy: 'Logística PAC' }],
  },
  {
    itemId: 'log-pac-03',
    segmentType: 'LODGING',
    title: 'Alojamiento en Punta Arenas (Base Logística Austral)',
    origin: 'Punta Arenas Centro',
    destination: 'Punta Arenas',
    carrierOrLocation: 'Hotel / Residencia de Investigadores PAC',
    scheduledDepartureUtc: '2026-12-10T16:00:00Z',
    scheduledArrivalUtc: '2026-12-14T08:00:00Z',
    status: 'CONFIRMED',
    baggageWeightKg: 0,
    notes: 'Periodo de cuarentena de bioseguridad, desinfección de equipo y briefing de zarpe.',
    versionHistory: [{ version: 1, changedAt: '2026-08-20T11:00:00Z', reason: 'Reserva hotelera radicada', changedBy: 'Logística PAC' }],
  },
  {
    itemId: 'log-pac-04',
    segmentType: 'EMBARKATION',
    title: 'Embarque a Bordo del Buque Oceanográfico Polar',
    origin: 'Muelle Prat / Mardones (Punta Arenas)',
    destination: 'Estrecho de Magallanes → Paso Drake',
    carrierOrLocation: 'Buque Plataforma Antártica',
    scheduledDepartureUtc: '2026-12-14T14:00:00Z',
    scheduledArrivalUtc: '2026-12-17T06:00:00Z',
    status: 'PLANNED',
    baggageWeightKg: 42,
    notes: 'Cruce del Paso Drake sujeto a ventana meteorológica confirmada por Capitanía de Puerto.',
    versionHistory: [
      { version: 1, changedAt: '2026-08-15T10:00:00Z', reason: 'Programación tentativa de zarpe', changedBy: 'Armada / CCO' },
      { version: 2, changedAt: '2026-09-10T14:30:00Z', reason: 'Ajuste de 12 horas por modelo de oleaje en Drake', changedBy: 'Oficial de Navegación' },
    ],
  },
];

// =========================================================================
// SEED EQUIPMENT INVENTORY (SCIENTIFIC & PERSONAL CHECKLISTS)
// =========================================================================

export const SEED_PAC_EQUIPMENT: EquipmentItem[] = [
  {
    equipmentId: 'eqp-amoh-node-01',
    name: 'Laptop Rugerizada Panasonic Toughbook (Nodo Edge Buque)',
    category: 'COMPUTING_EDGE',
    owner: 'AMOH_LAB',
    assignedTo: 'Juan Sebastian Huertas Olea',
    serialOrAssetRef: 'CF-33-AMOH-2026',
    condition: 'OPTIMAL',
    batteryHealthPct: 96,
    storageLocation: 'Laboratorio Seco de Buque / Rack 2',
    preUseCheckCompleted: true,
    postUseCheckCompleted: false,
    notes: 'Ejecuta FastAPI + DuckDB Spatial + Quantarctica capas locales y Pythia Local.',
  },
  {
    equipmentId: 'eqp-sensor-baro-02',
    name: 'Barómetro de Alta Resolución Vaisala PTB110',
    category: 'SCIENTIFIC_SENSOR',
    owner: 'AMOH_LAB',
    assignedTo: 'Juan Sebastian Huertas Olea',
    serialOrAssetRef: 'VAI-BARO-4981',
    condition: 'OPTIMAL',
    calibrationDate: '2026-08-10',
    calibrationValidUntil: '2027-08-10',
    storageLocation: 'Puente de Navegación / Soporte Antivibratorio',
    preUseCheckCompleted: true,
    postUseCheckCompleted: false,
    notes: 'Trazabilidad metrológica calibrada contra barómetro patrón de IDEAM.',
  },
  {
    equipmentId: 'eqp-opt-bino-03',
    name: 'Binoculares Marinos Fujinon 7x50 FMTRC-SX con Retícula Estadiométrica',
    category: 'OPTICAL_SYSTEM',
    owner: 'AMOH_LAB',
    assignedTo: 'Juan Sebastian Huertas Olea',
    serialOrAssetRef: 'FUJI-POLAR-012',
    condition: 'OPTIMAL',
    calibrationDate: '2026-09-02',
    calibrationValidUntil: '2027-09-02',
    storageLocation: 'Alerón de Babor / Estuche Estanco Peli 1400',
    preUseCheckCompleted: true,
    postUseCheckCompleted: false,
    notes: 'Retícula en milésimas para cálculo de distancia a buques observados.',
  },
  {
    equipmentId: 'eqp-dji-air-04',
    name: 'Aeronave Remotamente Tripulada Ultraligera DJI Mini 4 Pro (<249g)',
    category: 'DRONE_UAV',
    owner: 'AMOH_LAB',
    assignedTo: 'Juan Sebastian Huertas Olea',
    serialOrAssetRef: 'DJI-UAV-MINI-08',
    condition: 'GOOD',
    batteryHealthPct: 98,
    storageLocation: 'Maletín Ignífugo LiPo / Sala de Operaciones',
    preUseCheckCompleted: true,
    postUseCheckCompleted: false,
    notes: 'Requiere autorización operacional expresa previa a cada despegue.',
  },
];

export const SEED_PAC_PERSONAL_EQUIPMENT: PersonalEquipmentItem[] = [
  { itemId: 'pe-01', name: 'Primera capa térmica de lana merino (pantalón y camiseta)', layer: 'CAPA_1_TERMICA', mandatory: true, packed: true, inspected: true, notes: 'Transpirable, seca rápido, anti-olor.' },
  { itemId: 'pe-02', name: 'Segunda capa aislante polar tipo Polartec / plumón sintético', layer: 'CAPA_2_AISLANTE', mandatory: true, packed: true, inspected: true, notes: 'Retiene calor corporal en condiciones de hasta -25°C.' },
  { itemId: 'pe-03', name: 'Tercera capa impermeable y cortaviento Gore-Tex Pro', layer: 'CAPA_3_IMPERMEABLE', mandatory: true, packed: true, inspected: true, notes: 'Protección de cubierta expuesta a rociones salinos.' },
  { itemId: 'pe-04', name: 'Botas Muck Boot Arctic Pro con suela Vibram antideslizante', layer: 'CALZADO', mandatory: true, packed: true, inspected: true, notes: 'Aprobadas para desembarcos mojados en Zodiac.' },
  { itemId: 'pe-05', name: 'Guantes de trabajo polar desmontables con liner táctil', layer: 'ACCESORIOS', mandatory: true, packed: true, inspected: true, notes: 'Permiten operar pantallas rugerizadas sin desproteger manos.' },
  { itemId: 'pe-06', name: 'Gafas de sol polarizadas categoría 4 y antiparras de ventisca', layer: 'ACCESORIOS', mandatory: true, packed: true, inspected: true, notes: 'Protección UV 100% contra reverberación de nieve y hielo.' },
  { itemId: 'pe-07', name: 'Power banks de grado térmico con calentador químico de litio', layer: 'ELECTRONICA', mandatory: true, packed: true, inspected: true, notes: 'Evita apagado repentino de smartphones en cubierta.' },
];

// =========================================================================
// SEED PAC SCIENCE PROJECTS (AMOH AS ONE PROJECT WITHIN PAC)
// =========================================================================

export const SEED_PAC_SCIENCE_PROJECTS: PacScienceProject[] = [
  {
    projectId: 'proj-pac-amoh-01',
    expeditionId: 'exp-pac-13',
    code: 'PAC-13-CTI-AMOH',
    title: 'AMOH: Monitoreo Oceanográfico Satelital Acoplado a Telemetría AIS y Validación de Campo',
    principalInvestigator: 'Juan Sebastian Huertas Olea',
    coinvestigators: [],
    institution: 'AMOH Observatory Consortium / UniAndes',
    researchLine: 'Oceanografía Operacional, Tecnologías Marinas y Sensores Polares',
    objective: 'Determinar cuellos de botella náuticos y patrones de tráfico marítimo en el Estrecho de Gerlache mediante algoritmos de coincidencia espaciotemporal entre radares SAR, transpondedores AIS y observación visual.',
    methodology: 'Protocolo AMOH v1.1-PAC: turnos de observación visual de 45 min con retícula óptica, recepción VHF NMEA pasiva en laboratorio y cotejo con huellas Copernicus Sentinel-1.',
    fieldRequirements: 'Acceso no intrusivo a cubierta alta durante navegación diurna; toma eléctrica de 110V para laptop edge en laboratorio seco.',
    equipmentList: ['Laptop Rugerizada Toughbook', 'Barómetro Vaisala PTB110', 'Binoculares Fujinon 7x50', 'Terminales móviles AMOH Field Node'],
    dataManagementPlan: 'Plan SCAR DMP compliant. Datos brutos NMEA y logs de campo bajo licencia Creative Commons CC-BY-4.0.',
    environmentalConstraints: 'Cero vertimientos, cero tomas de muestras invasivas, cero fondeos de boyas.',
    methodVersion: 'v1.1-PAC',
    status: 'APPROVED',
  },
  {
    projectId: 'proj-pac-ocean-02',
    expeditionId: 'exp-pac-13',
    code: 'PAC-13-CTI-CTD',
    title: 'Estructura Termohalina y Masas de Agua en el Estrecho de Bransfield y Gerlache',
    principalInvestigator: 'Dra. María Camila Torres',
    coinvestigators: ['MSc. Carlos Pineda'],
    institution: 'Comisión Colombiana del Océano / CIOH',
    researchLine: 'Oceanografía Física Antártica',
    objective: 'Caracterizar la columna de agua mediante lances de CTD Rosette para identificar la intrusión de Agua Circumpolar Profunda Modificada (MCDW).',
    methodology: 'Lances de sonda CTD SeaBird SBE-19 hasta 800m de profundidad en estaciones oceanográficas preestablecidas.',
    fieldRequirements: 'Cabrestante oceanográfico de popa y personal de maniobras.',
    equipmentList: ['CTD SBE-19 Plus', 'Botellas Niskin', 'Roseta oceanográfica'],
    dataManagementPlan: 'Depósito de perfiles CTD en el Centro Colombiano de Datos Oceanográficos (CECOLDO).',
    environmentalConstraints: 'Lances sin pérdida de instrumental ni liberación de contaminantes.',
    methodVersion: 'v2.0-CIOH',
    status: 'APPROVED',
  },
  {
    projectId: 'proj-pac-bio-03',
    expeditionId: 'exp-pac-13',
    code: 'PAC-13-CTI-MAM',
    title: 'Distribución y Ecología de Cetáceos en el Corredor Marino de la Península Antártica',
    principalInvestigator: 'Biól. Andrés Felipe Gómez',
    coinvestigators: ['Dra. Sofía Valenzuela'],
    institution: 'Fundación Yubarta / CCO',
    researchLine: 'Biología Marina y Conservación de Megafauna',
    objective: 'Identificar áreas de alimentación de ballena jorobada (Megaptera novaeangliae) y rorcuales en relación con rutas de navegación comercial.',
    methodology: 'Transectos de avistamiento continuo con registro de foto-identificación de aletas caudales.',
    fieldRequirements: 'Puesto de observación en puente o alerón.',
    equipmentList: ['Cámaras réflex con teleobjetivos 100-400mm', 'GPS de mano'],
    dataManagementPlan: 'Catálogo de fotoidentificación integrado con FlukeBook y SCAR MarBIN.',
    environmentalConstraints: 'Mantener distancia mínima de aproximación náutica de 100 metros.',
    methodVersion: 'v1.4-Yubarta',
    status: 'APPROVED',
  },
];

// =========================================================================
// METHOD VERSIONING HISTORY ACROSS EXPEDITIONS
// =========================================================================

export const METHOD_VERSION_HISTORY: MethodVersionRecord[] = [
  {
    methodId: 'met-amoh-01',
    name: 'AMOH Maritime Observation & Multi-Sensor Verification Method',
    version: 'v1.0-Pilot',
    expeditionId: 'exp-natgeo-2027',
    usedAt: '2027-12-01',
    changeLog: [
      'Versión inicial del método diseñada para el buque de turismo expedicionario NGS-Lindblad.',
      'Definición de turnos de 30-60 minutos de avistamiento visual con retícula estadiométrica.',
      'Auditoría pasiva de NMEA 0183 / AIS mediante receptor VHF autónomo sin tocar sistemas de navegación.',
      'Algoritmo piloto de coincidencia espaciotemporal campo-satélite con ventana de 4 horas.',
    ],
  },
  {
    methodId: 'met-amoh-02',
    name: 'AMOH Maritime Observation & Multi-Sensor Verification Method',
    version: 'v1.1-PAC',
    expeditionId: 'exp-pac-13',
    usedAt: '2026-12-15',
    changeLog: [
      'Incorporación de aprendizajes del piloto NGS-Lindblad adaptados a buques de investigación ARC.',
      'Adición de perfiles automáticos de muestreo térmico para sub-cero en Android Field Node (ECO / SURVEY / BURST).',
      'Integración con DuckDB Spatial para resolución de polígonos ASPA y corredores protegidos en el borde del buque.',
      'Regla UX rectora formalizada: SAFETY OVERRIDES SCIENTIFIC SCHEDULE.',
      'Preservación histórica estricta: los registros de v1.0 permanecen inmutables.',
    ],
  },
  {
    methodId: 'met-amoh-03',
    name: 'AMOH Maritime Observation & Multi-Sensor Verification Method',
    version: 'v1.2-Future',
    expeditionId: 'exp-pac-14',
    usedAt: '2028-12-01',
    changeLog: [
      'Planificación futura: Incorporación de boyas derivadoras pasivas con enlaces LoRaWAN de corto alcance.',
      'Integración de algoritmos de detección automática de estelas térmicas infrarrojas a baja altitud.',
    ],
  },
];

export const SEED_PAC_PROJECTS = SEED_PAC_SCIENCE_PROJECTS;
export const SEED_METHOD_VERSIONS = METHOD_VERSION_HISTORY;

// =========================================================================
// SEED PAC SAFETY & COMMS WORKSPACES
// =========================================================================

export const SEED_PAC_SAFETY_CHECKINS: SafetyCheckIn[] = [
  {
    checkInId: 'chk-01',
    sessionId: 'sess-02-lemaire',
    userId: 'juan.huertas',
    userName: 'Juan Sebastian Huertas Olea',
    timestampUtc: '2026-12-20T16:30:00Z',
    lat: -65.068,
    lon: -63.955,
    status: 'OK',
  },
  {
    checkInId: 'chk-02',
    sessionId: 'sess-02-lemaire',
    userId: 'juan.huertas',
    userName: 'Juan Sebastian Huertas Olea',
    timestampUtc: '2026-12-20T17:15:00Z',
    lat: -65.072,
    lon: -63.960,
    status: 'REQUEST_RETURN',
  },
];

export const SEED_PAC_SAFETY: SafetyState = {
  currentStatus: 'READY',
  briefingCompleted: true,
  briefingNotes: 'Briefing meteorológico y de seguridad en maniobras completado con el Oficial de Cubierta. Ventana favorable.',
  maxWindKnotsLimit: 35,
  minVisibilityKmLimit: 2.0,
  safetyOfficer: 'Capitán de Corbeta / Oficial de Seguridad Buque ARC',
  ruleEnforced: 'SAFETY OVERRIDES SCIENTIFIC SCHEDULE',
};

export const SEED_PAC_COMMS: CommsContact[] = [];

export const SEED_PAC_INCIDENTS: IncidentRecord[] = [
  {
    incidentId: 'inc-pac-01',
    expeditionId: 'exp-pac-13',
    sessionId: 'sess-02-lemaire',
    reportedAtUtc: '2026-12-20T17:15:00Z',
    reportedBy: 'Juan Sebastian Huertas Olea',
    category: 'WEATHER_HAZARD',
    location: 'Entrada Norte Canal Lemaire (-65.068, -63.955)',
    description: 'Racha súbita de viento catabático superó los 38 nudos; se aplicó la regla UX rectora y se detuvo la sesión de observación en cubierta.',
    severity: 'LOW',
    status: 'RESOLVED',
    personsInvolved: ['Juan Sebastian Huertas Olea', 'Oficial de Guardia'],
    immediateActionTaken: 'Evacuación de personal de alerones abiertos hacia el interior del puente. Equipos resguardados en maletines Peli.',
    followUpRequired: 'Verificación de integridad de cables de la antena GPS exterior.',
    versionHistory: [{ version: 1, timestamp: '2026-12-20T17:30:00Z', note: 'Registro inicial asentado por Líder AMOH.' }],
  },
  {
    incidentId: 'inc-pac-02',
    expeditionId: 'exp-pac-13',
    reportedAtUtc: '2026-12-28T11:00:00Z',
    reportedBy: 'Operador de Telecomunicaciones',
    category: 'COMMUNICATION_LOSS',
    location: 'Estrecho de Gerlache (-64.48, -61.92)',
    description: 'Pérdida de telemetría de enlace móvil con el terminal móvil de campo #02 por sombra orográfica.',
    severity: 'LOW',
    status: 'RESOLVED',
    personsInvolved: ['Investigador de Campo'],
    immediateActionTaken: 'Regla 49 aplicada: La pérdida de conexión NO infiere persona extraviada. El equipo continuó registrando datos offline y sincronizó al reingresar a rango Wi-Fi del buque.',
    followUpRequired: 'Ninguna; datos sincronizados íntegros con hash SHA-256 coincidente.',
    versionHistory: [{ version: 1, timestamp: '2026-12-28T11:45:00Z', note: 'Cierre de novedad tras verificación de hash.' }],
  },
];

// =========================================================================
// SEED PAC ENVIRONMENTAL COMPLIANCE & BIOSECURITY
// =========================================================================

export const SEED_PAC_ENVIRONMENT: EnvironmentalCompliance = {
  protectedAreasChecked: true,
  aspaReferences: [
    'ASPA #126: Península Byers (Isla Livingston)',
    'ASPA #140: Partes de Isla Decepción',
    'ASPA #152: Estrecho de Bransfield occidental',
    'ASMA #004: Isla Decepción (Zona Antártica Administrada Especialmente)',
  ],
  wildlifeDistanceGuideline:
    'Distancia mínima estricta: 5 metros para pingüinos en tránsito, 15 metros para pingüineras activas, 50 metros para focas de Weddell y leopardos marinos, 100 metros para embarcaciones respecto a cetáceos. Queda estrictamente prohibido interponerse entre un animal y el agua.',
  biosecurityChecklist: {
    boots: 'CONFIRMED',
    clothing: 'CONFIRMED',
    gearBags: 'CONFIRMED',
    droneCases: 'CONFIRMED',
  },
  droneCapable: true,
  droneFlightAuthorization: 'PENDING',
  wasteProtocolAdherence: true,
};

export const SEED_PAC_ENVIRONMENTAL = SEED_PAC_ENVIRONMENT;

// =========================================================================
// SEED PAC DAILY BACKUP VERIFICATION
// =========================================================================

export const SEED_PAC_BACKUPS: DailyDataBackupRecord[] = [
  {
    backupDate: '2026-12-28',
    observationsCount: 24,
    mediaFilesCount: 82,
    totalBytes: 1845000000, // 1.84 GB
    manifestSha256: 'sha256:88a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    state: 'EDGE_BACKUP',
    verifiedAtUtc: '2026-12-28T22:30:00Z',
    verifiedBy: 'Juan Sebastian Huertas Olea',
  },
  {
    backupDate: '2026-12-27',
    observationsCount: 19,
    mediaFilesCount: 64,
    totalBytes: 1420000000, // 1.42 GB
    manifestSha256: 'sha256:77f1e2d3c4b5a69887766554433221100ffeeddccbbaa9988776655443322110',
    state: 'SECONDARY_COPY',
    verifiedAtUtc: '2026-12-27T23:00:00Z',
    verifiedBy: 'Juan Sebastian Huertas Olea',
  },
];

// =========================================================================
// SEED PAC RETURN & REPORTING WORKSPACE
// =========================================================================

export const SEED_PAC_RETURN_REPORTS: ReturnReport[] = [
  {
    reportId: 'rep-pac-01',
    type: 'TECHNICAL',
    title: 'Informe Técnico de Operación de Sensores y Plataforma Edge AMOH en la XIII Expedición',
    status: 'DRAFT',
    summary: 'Evaluación del desempeño de hardware bajo cero, estabilidad de DuckDB Spatial y tasa de acierto de perfiles de batería.',
    version: '0.9.0-draft',
  },
  {
    reportId: 'rep-pac-02',
    type: 'SCIENTIFIC',
    title: 'Informe Científico Preliminar de Presión de Tráfico Marítimo en el Estrecho de Gerlache',
    status: 'READY_FOR_PEER_REVIEW',
    summary: 'Correlación de 42 trayectorias AIS contra imágenes satelitales Sentinel-1 y 18 avistamientos ópticos validados.',
    version: '1.0.0-rc1',
  },
  {
    reportId: 'rep-pac-03',
    type: 'OBJECTIVE_COMPLIANCE',
    title: 'Informe de Cumplimiento de Objetivos del Plan de Investigación Radicado ante la CCO',
    status: 'DRAFT',
    summary: 'Cumplimiento del 100% de los objetivos planteados sin novedades ambientales ni accidentes operacionales.',
    version: '0.8.5',
  },
];

export const SEED_PAC_SCIENTIFIC_PRODUCTS: ScientificProduct[] = [
  {
    productId: 'prod-pac-01',
    type: 'PAPER',
    title: 'Spatio-Temporal Gaps and AIS Compliance of Tourist Expeditions in the Western Antarctic Peninsula',
    authors: ['Juan Sebastian Huertas Olea'],
    status: 'IN_PREPARATION',
    targetVenue: 'Polar Biology / Antarctic Science Journal',
  },
  {
    productId: 'prod-pac-02',
    type: 'DATASET',
    title: 'AMOH Antarctic Shipping Density and Optical Ground-Truth Catalog (WAP 2026-2027)',
    authors: ['Juan Sebastian Huertas Olea', 'AMOH Consortium'],
    doiOrUrl: '10.5281/zenodo.amoh.pac13.dataset',
    status: 'IN_PREPARATION',
    targetVenue: 'Zenodo / SCAR Antarctic Data Portal',
  },
  {
    productId: 'prod-pac-03',
    type: 'SOFTWARE',
    title: 'AMOH Android Field Node (Kotlin/Compose) and Edge Sync Engine v1.1',
    authors: ['Juan Sebastian Huertas Olea'],
    doiOrUrl: 'https://github.com/juanshuertas/antarctic-maritime-observation-hub',
    status: 'ACCEPTED',
    targetVenue: 'Journal of Open Source Software (JOSS)',
  },
];

export const SEED_PAC_PRODUCTS = SEED_PAC_SCIENTIFIC_PRODUCTS;
export const SEED_PAC_RETURN_REPORT = SEED_PAC_RETURN_REPORTS[0];

export const SEED_PAC_LESSONS: LessonLearned[] = [
  {
    lessonId: 'les-pac-01',
    category: 'DEVICES',
    title: 'Descarga acelerada de baterías Li-Ion por debajo de -2°C con viento relativo',
    observation: 'Los smartphones expuestos en cubierta perdieron 30% de carga en 18 minutos si no se usaba funda térmica.',
    actionableRecommendation: 'Automatizar en el Android Field Node la conmutación al perfil ECO cuando la temperatura del sensor de batería caiga bajo 0°C; exigir estuches con aislante térmico.',
    applicableToFutureExpeditions: true,
  },
  {
    lessonId: 'les-pac-02',
    category: 'CONNECTIVITY',
    title: 'Sombras orográficas en canales glaciares bloquean satélites de baja elevación',
    observation: 'En el Canal Neumayer y Canal Lemaire, la altitud de las paredes de roca (hasta 1,000m) causó pérdida de señal satelital GNSS de hasta 6 minutos.',
    actionableRecommendation: 'Implementar filtro de Kalman en el nodo local con estimación inercial (dead reckoning) para continuar la traza hasta recuperar fix 3D.',
    applicableToFutureExpeditions: true,
  },
  {
    lessonId: 'les-pac-03',
    category: 'LOGISTICS',
    title: 'Verificación previa de sellos de bioseguridad en Punta Arenas agiliza zarpe',
    observation: 'El aspirado y desinfección de velcro en vestuario técnico tomó más tiempo del previsto en puerto.',
    actionableRecommendation: 'Incorporar la verificación de bioseguridad en el checklist previo al viaje antes de salir de la ciudad de origen.',
    applicableToFutureExpeditions: true,
  },
];

// =========================================================================
// PAC EXPEDITION FACTORY & UNIFIED MULTI-EXPEDITION LOOKUP ENGINE
// =========================================================================

export function createPacExpedition(
  expeditionNumber: number,
  season: string,
  yearStart: number,
  yearEnd: number,
  options?: Partial<Expedition>
): Expedition {
  const expeditionId = `exp-pac-${expeditionNumber}`;
  return {
    expeditionId,
    title: `${expeditionNumber}ª Expedición Científica de Colombia a la Antártica`,
    program: 'Programa Antártico Colombiano',
    programType: 'PAC',
    expedition_number: expeditionNumber,
    season,
    year_start: yearStart,
    year_end: yearEnd,
    mission_order: expeditionNumber,
    status: 'REFERENCE / PLANNING',
    lifecycleStage: '01_CALL_APPLICATION',
    leadUserId: 'juan.huertas',
    leadName: 'Juan Sebastian Huertas Olea',
    leadRole: 'Investigador independiente · interés en futura convocatoria PAC',
    region: 'Península Antártica Occidental',
    plannedStart: 'Por definir',
    plannedEnd: 'Por definir',
    researchQuestion:
      'Monitoreo longitudinal de presión antrópica marítima y vulnerabilidad ambiental antártica mediante observación multi-sensor acoplada.',
    projectPrinciple:
      'SEGURIDAD ANTES QUE CIENCIA · LA INVESTIGACIÓN SE ADAPTA A LA LOGÍSTICA POLAR',
    principleDetails:
      'La expedición aprende de las campañas previas. Incorpora métodos validados, esquemas de datos y perfiles de dispositivos de campañas anteriores sin sobreescribir su historia.',
    proposalReference: 'Sin referencia: convocatoria PAC no publicada',
    disclaimer:
      'PROTOTIPO DE PLANIFICACIÓN CON DATOS DE EJEMPLO. Sin expedición PAC confirmada; futura convocatoria sujeta a publicación. No implica aval ni selección oficial de la CCO.',
    successCriteria: {
      minimum: 6,
      worthwhile: 10,
      ideal: 14,
      unit: 'sesiones oceanográficas completadas con trazabilidad criptográfica y backup verificado',
    },
    equipmentProfile: [
      'AMOH Field Node y terminales móviles rugerizados',
      'Instrumentación óptica calibrada con retícula',
      'Nodo Edge de buque (FastAPI + DuckDB Spatial)',
      'Vestuario técnico polar normado',
    ],
    corridorDescription: 'Estrecho de Gerlache, Canal Lemaire, Islas Shetland del Sur y bases antárticas.',
    offlineReady: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    methodVersion: `v1.${expeditionNumber - 12}-PAC`,
    ...options,
  };
}

export const ALL_EXPEDITIONS: Expedition[] = [
  SEED_NATGEO_EXPEDITION,
  SEED_PAC13_EXPEDITION,
  SEED_PEACEBOAT_EXPEDITION,
];

export function getAllExpeditions(): Expedition[] {
  return [...ALL_EXPEDITIONS];
}

export function getExpedition(id: string): Expedition {
  const exact = ALL_EXPEDITIONS.find((expedition) => expedition.expeditionId === id);
  if (exact) return exact;

  // Preserve the existing PAC factory/navigation compatibility without silently
  // converting an unknown expedition into NatGeo.
  if (id.startsWith('exp-pac')) return SEED_PAC13_EXPEDITION;

  throw new Error(`Unknown expedition ID: ${id}`);
}
