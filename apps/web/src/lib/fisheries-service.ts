/**
 * AMOH Fisheries Intelligence Engine (GFW API v3 + CCAMLR Registry)
 * Rules 46-55: Apparent fishing effort, SAR detections, CCAMLR legal status.
 */

export type CcamlrStatus =
  | 'AUTHORIZED_RECORD_FOUND'
  | 'NO_AUTHORIZATION_MATCH_FOUND'
  | 'VERIFICATION_IN_PROGRESS';

export interface FishingVesselIntel {
  mmsi: string;
  name: string;
  flag: string;
  gearType: 'TRAWL' | 'LONGLINE' | 'POTS' | 'CARRIER';
  targetSpecies: string;
  ccamlrArea: string; // e.g. "Subarea 48.1 (Peninsula)"
  ccamlrStatus: CcamlrStatus;
  ccamlrLicenseId?: string;
  apparentEffortHours: number;
  lastReportedUtc: string;
  coordinates: [number, number]; // [lng, lat]
  sarMatch: boolean;
  notes: string;
}

export const SEED_FISHING_INTEL: FishingVesselIntel[] = [
  {
    mmsi: '414389000',
    name: 'SHEN LAN (深蓝)',
    flag: 'CN',
    gearType: 'TRAWL',
    targetSpecies: 'Krill antártico (Euphausia superba)',
    ccamlrArea: 'Subárea 48.1 (Estrecho de Bransfield)',
    ccamlrStatus: 'AUTHORIZED_RECORD_FOUND',
    ccamlrLicenseId: 'CCAMLR-2026-CHN-001',
    apparentEffortHours: 38.4,
    lastReportedUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
    coordinates: [-59.20, -62.45],
    sarMatch: true,
    notes: 'Super-arrastrero factoría de última generación (115 m). Tecnología de bombeo continuo de krill con capacidad de procesamiento > 300 t/día.',
  },
  {
    mmsi: '412345678',
    name: 'HAI FENG 68',
    flag: 'CN',
    gearType: 'TRAWL',
    targetSpecies: 'Krill antártico (Euphausia superba)',
    ccamlrArea: 'Subárea 48.2 (Islas Orcadas del Sur)',
    ccamlrStatus: 'AUTHORIZED_RECORD_FOUND',
    ccamlrLicenseId: 'CCAMLR-2026-CHN-008',
    apparentEffortHours: 22.8,
    lastReportedUtc: new Date(Date.now() - 3600000 * 4).toISOString(),
    coordinates: [-45.10, -60.65],
    sarMatch: true,
    notes: 'Operación de arrastre pelágico bajo cuota precautoria CM 51-07. Inspección por observador científico a bordo.',
  },
  {
    mmsi: '412431000',
    name: 'FU RONG HAI',
    flag: 'CN',
    gearType: 'TRAWL',
    targetSpecies: 'Krill antártico (Euphausia superba)',
    ccamlrArea: 'Subárea 48.2 (Mar de Scotia)',
    ccamlrStatus: 'AUTHORIZED_RECORD_FOUND',
    ccamlrLicenseId: 'CCAMLR-2026-CHN-012',
    apparentEffortHours: 19.5,
    lastReportedUtc: new Date(Date.now() - 3600000 * 5).toISOString(),
    coordinates: [-43.80, -59.90],
    sarMatch: true,
    notes: 'Extracción industrial de krill para aceite de fosfolípidos y harina de alta proteína.',
  },
  {
    mmsi: '412440620',
    name: 'LONG TENG',
    flag: 'CN',
    gearType: 'TRAWL',
    targetSpecies: 'Krill antártico (Euphausia superba)',
    ccamlrArea: 'Subárea 58.4.2 (Antártida Oriental / Bahía Prydz)',
    ccamlrStatus: 'AUTHORIZED_RECORD_FOUND',
    ccamlrLicenseId: 'CCAMLR-2026-CHN-015',
    apparentEffortHours: 31.0,
    lastReportedUtc: new Date(Date.now() - 3600000 * 3).toISOString(),
    coordinates: [76.50, -65.20],
    sarMatch: true,
    notes: 'Operación frente a la costa de Prydz Bay en proximidad al corredor logístico de la estación Zhongshan.',
  },
  {
    mmsi: '412211928',
    name: 'ZHOU SHANG 928',
    flag: 'CN',
    gearType: 'POTS',
    targetSpecies: 'Calamar Illex (Illex argentinus)',
    ccamlrArea: 'Corredor Atlántico Sudoccidental (Milla 201 - Agujero Azul)',
    ccamlrStatus: 'VERIFICATION_IN_PROGRESS',
    apparentEffortHours: 45.2,
    lastReportedUtc: new Date(Date.now() - 3600000 * 1).toISOString(),
    coordinates: [-60.20, -53.50],
    sarMatch: true,
    notes: 'Potero de aguas distantes con guirnaldas de iluminación de 300 kW. Detectado por radiometría nocturna satelital VIIRS en el borde exterior de la ZEE argentina.',
  },
  {
    mmsi: '413367000',
    name: 'YONG SHENG 2 (REEFER)',
    flag: 'CN',
    gearType: 'CARRIER',
    targetSpecies: 'Transbordo de capturas congeladas & Bunkering',
    ccamlrArea: 'Paso Drake / Límite Norte Subárea 48.1',
    ccamlrStatus: 'VERIFICATION_IN_PROGRESS',
    apparentEffortHours: 12.0,
    lastReportedUtc: new Date(Date.now() - 3600000 * 8).toISOString(),
    coordinates: [-61.80, -58.10],
    sarMatch: true,
    notes: 'Buque nodriza frigorífico de apoyo logístico. Permite a la flota de aguas distantes descargar y abastecerse sin ingresar a puertos sudamericanos.',
  },
  {
    mmsi: '412534888',
    name: 'CHANG TAI 888',
    flag: 'CN',
    gearType: 'POTS',
    targetSpecies: 'Pota / Calamar gigante (Dosidicus gigas)',
    ccamlrArea: 'Pacífico Sudeste / Corredor Magallanes (SPRFMO)',
    ccamlrStatus: 'VERIFICATION_IN_PROGRESS',
    apparentEffortHours: 28.7,
    lastReportedUtc: new Date(Date.now() - 3600000 * 6).toISOString(),
    coordinates: [-75.50, -56.80],
    sarMatch: false,
    notes: 'Potero operando en aguas internacionales del Pacífico Sur bajo marco de la OROP-PS (SPRFMO) previo al cruce austral.',
  },
  {
    mmsi: '257001000',
    name: 'ANTARCTIC ENDEAVOUR',
    flag: 'NO',
    gearType: 'TRAWL',
    targetSpecies: 'Krill antártico (Euphausia superba)',
    ccamlrArea: 'Subárea 48.1 (Estrecho de Bransfield)',
    ccamlrStatus: 'AUTHORIZED_RECORD_FOUND',
    ccamlrLicenseId: 'CCAMLR-2026-NOR-019',
    apparentEffortHours: 14.2,
    lastReportedUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
    coordinates: [-58.42, -62.85],
    sarMatch: true,
    notes: 'Monitoreo acústico continuo y observador científico CCAMLR a bordo verificado.',
  },
  {
    mmsi: '725000123',
    name: 'CABO DE HORNOS IV',
    flag: 'CL',
    gearType: 'LONGLINE',
    targetSpecies: 'Bacalao de profundidad (Dissostichus eleginoides)',
    ccamlrArea: 'Subárea 48.3 (Georgia del Sur)',
    ccamlrStatus: 'AUTHORIZED_RECORD_FOUND',
    ccamlrLicenseId: 'CCAMLR-2026-CHL-003',
    apparentEffortHours: 8.5,
    lastReportedUtc: new Date(Date.now() - 3600000 * 6).toISOString(),
    coordinates: [-37.50, -54.30],
    sarMatch: false,
    notes: 'Líneas con espantapájaros reglamentarios y calado nocturno CM 25-02.',
  },
  {
    mmsi: '636099999',
    name: 'DARK CONTACT #481-B',
    flag: 'UNKNOWN',
    gearType: 'CARRIER',
    targetSpecies: 'Transbordo no clasificado',
    ccamlrArea: 'Límite Exterior Subárea 48.1',
    ccamlrStatus: 'NO_AUTHORIZATION_MATCH_FOUND',
    apparentEffortHours: 0,
    lastReportedUtc: new Date(Date.now() - 3600000 * 18).toISOString(),
    coordinates: [-63.15, -60.80],
    sarMatch: true,
    notes: 'Detección radar Sentinel-1 SAR sin transmisión AIS correspondiente en ventana temporal.',
  },
];
