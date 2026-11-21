/**
 * AMOH Nuclear Legacy & Marine Radioactivity Service (IAEA MARIS Baseline)
 * Rules 91-100: IAEA MARIS sample database, radionuclide levels, Antarctic Treaty historical context.
 */

export interface MarisSample {
  id: string;
  stationName: string;
  medium: 'SEAWATER' | 'BIOTA' | 'SEDIMENT' | 'SUSPENDED_MATTER';
  radionuclide: 'Cs-137' | 'Sr-90' | 'Pu-239,240' | 'H-3';
  valueBq: number;
  unit: string;
  depthMeters: number;
  coordinates: [number, number]; // [lng, lat]
  sampleDate: string;
  referenceBaseline: string;
}

export const SEED_MARIS_SAMPLES: MarisSample[] = [
  {
    id: 'MARIS-SO-2026-001',
    stationName: 'Drake Passage Transect DP-4',
    medium: 'SEAWATER',
    radionuclide: 'Cs-137',
    valueBq: 0.18,
    unit: 'Bq/m³',
    depthMeters: 10,
    coordinates: [-62.50, -59.20],
    sampleDate: '2026-01-14',
    referenceBaseline: 'Nivel basal de fondo global (trazador de circulación oceánica)',
  },
  {
    id: 'MARIS-SO-2026-002',
    stationName: 'Bransfield Strait Core BS-12',
    medium: 'SEDIMENT',
    radionuclide: 'Pu-239,240',
    valueBq: 0.045,
    unit: 'Bq/kg seco',
    depthMeters: 850,
    coordinates: [-58.20, -62.40],
    sampleDate: '2025-12-08',
    referenceBaseline: 'Depósito atmosférico remanente de ensayos nucleares década 1960',
  },
  {
    id: 'MARIS-SO-2026-003',
    stationName: 'King George Island Maxwell Bay',
    medium: 'BIOTA',
    radionuclide: 'Cs-137',
    valueBq: 0.12,
    unit: 'Bq/kg húmedo',
    depthMeters: 5,
    coordinates: [-58.85, -62.25],
    sampleDate: '2026-02-02',
    referenceBaseline: 'Muestra biológica en macroalgas (Himantothallus grandifolius)',
  },
  {
    id: 'MARIS-HIST-PM3A',
    stationName: 'Estación Histórica McMurdo (Sitio Nuclear PM-3A)',
    medium: 'SEDIMENT',
    radionuclide: 'Cs-137',
    valueBq: 0.08,
    unit: 'Bq/kg seco',
    depthMeters: 0,
    coordinates: [166.66, -77.85],
    sampleDate: '2025-11-20',
    referenceBaseline: 'Desmantelamiento total completado en 1979; suelo radiactivo repatriado a EE.UU. bajo Tratado Antártico Art. V',
  },
];

export const HISTORICAL_NUCLEAR_CONTEXT = {
  treatyArticleV: 'El Tratado Antártico prohíbe explícitamente todas las explosiones nucleares y la eliminación de desechos radiactivos en la Antártica.',
  pm3aSummary: 'El reactor PM-3A "Nukey Poo" operó en McMurdo entre 1962 y 1972. Tras su cierre definitivo, se retiraron más de 12.000 toneladas de suelo y roca triturada contaminada hacia Savannah River Site (EE. UU.), restituyendo la condición ambiental original del sitio.',
  oceanDumpingStatus: 'El Océano Austral al sur de 60°S nunca ha sido utilizado como sitio de vertimiento marino de residuos radiactivos en contenedores.',
};
