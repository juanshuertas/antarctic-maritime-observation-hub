/**
 * AMOH — Science Diplomacy & Peace Impact Ledger (Master Consolidated V4)
 *
 * Implements an auditable, non-partisan evidence ledger of international scientific
 * cooperation and peaceful infrastructure under the Antarctic Treaty of 1959.
 *
 * Strict Rule: Factual cooperation outputs only. No "peace scores", no ranking of states.
 */

export interface PeaceLedgerEntry {
  id: string;
  category:
    | 'JOINT_EXPEDITION'
    | 'SHARED_DATASET'
    | 'OPEN_SENSOR_ARRAY'
    | 'CROSS_BORDER_RESEARCH'
    | 'TREATY_COMPLIANCE'
    | 'HUMAN_SECURITY_SAR'
    | 'LOGISTICS_SHARING';
  title: string;
  description: string;
  participatingNations: string[];
  participatingInstitutions: string[];
  vesselsOrStations?: string[];
  sdgLinks: number[];
  verifiedDate: string;
  auditEvidenceUrl?: string;
  verificationSource: string;
}

export interface DiplomacyGraphNode {
  id: string;
  type: 'RESEARCHER' | 'INSTITUTION' | 'NATION' | 'PROJECT' | 'INFRASTRUCTURE';
  name: string;
  country?: string;
  details?: string;
}

export interface DiplomacyGraphEdge {
  source: string;
  target: string;
  type:
    | 'COLLABORATES_WITH'
    | 'SHARES_DATA'
    | 'JOINT_EXPEDITION'
    | 'USES_INFRASTRUCTURE'
    | 'CO_AUTHORS';
  label: string;
  year: number;
}

export const VERIFIED_PEACE_LEDGER: PeaceLedgerEntry[] = [
  {
    id: 'ple-2026-001',
    category: 'JOINT_EXPEDITION',
    title: 'X Expedición Científica de Colombia a la Antártida (PAC X / ARC Simón Bolívar)',
    description: 'Campaña oceanográfica y de hidrografía en Estrecho de Gerlache y Bahía Paraíso con científicos de Colombia, Chile, Ecuador y Turquía a bordo.',
    participatingNations: ['Colombia', 'Chile', 'Ecuador', 'Turquía'],
    participatingInstitutions: ['CCO (Comisión Colombiana del Océano)', 'INOCAR', 'INACH', 'DIMAR'],
    vesselsOrStations: ['ARC Simón Bolívar (248)', 'Base O’Higgins'],
    sdgLinks: [14, 13, 17],
    verifiedDate: '2026-02-14',
    auditEvidenceUrl: 'https://kallpa.cco.gov.co/amoh/pac-x-manifest',
    verificationSource: 'CCO / Registro Público de Expedición PAC',
  },
  {
    id: 'ple-2026-002',
    category: 'OPEN_SENSOR_ARRAY',
    title: 'Red Antártica de Flotadores Biogeoquímicos Argo (SOCCOM / SOOS)',
    description: 'Despliegue coordinado y datos abiertos en tiempo real de 240+ flotadores perfiladores autónomos en el Giro de Weddell y Mar de Bellingshausen.',
    participatingNations: ['Estados Unidos', 'Reino Unido', 'Alemania', 'Australia', 'Noruega'],
    participatingInstitutions: ['SOOS', 'Scripps Institution of Oceanography', 'AWI', 'CSIRO'],
    vesselsOrStations: ['RV Polarstern', 'RRS Sir David Attenborough', 'RV Investigator'],
    sdgLinks: [9, 13, 14, 17],
    verifiedDate: '2026-01-30',
    auditEvidenceUrl: 'https://www.soos.aq/data/argo-bgc',
    verificationSource: 'Southern Ocean Observing System (SOOS) Data Portal',
  },
  {
    id: 'ple-2026-003',
    category: 'CROSS_BORDER_RESEARCH',
    title: 'Consorcio Internacional Glaciar Thwaites (ITGC)',
    description: 'Colaboración científica bilateral extendida para investigar la estabilidad física de la banquisa y el lecho rocoso del glaciar más vulnerable de la Antártida.',
    participatingNations: ['Reino Unido', 'Estados Unidos', 'Corea del Sur'],
    participatingInstitutions: ['British Antarctic Survey (BAS)', 'US National Science Foundation (NSF)', 'KOPRI'],
    vesselsOrStations: ['Araon (KOPRI)', 'Palmer Station'],
    sdgLinks: [13, 17],
    verifiedDate: '2026-01-10',
    auditEvidenceUrl: 'https://thwaitesglacier.org',
    verificationSource: 'ITGC Joint Steering Committee',
  },
  {
    id: 'ple-2026-004',
    category: 'HUMAN_SECURITY_SAR',
    title: 'Asistencia y Seguridad Marítima Polar en Paso Drake (Red SAR OMI / Tratado)',
    description: 'Monitoreo preventivo conjunto y canal de alerta SAR entre Armada de Chile (MRCC Punta Arenas) y Armada Argentina (MRCC Ushuaia) para embarcaciones científicas y turísticas.',
    participatingNations: ['Chile', 'Argentina'],
    participatingInstitutions: ['MRCC Punta Arenas', 'MRCC Ushuaia', 'Secretaría del Tratado Antártico'],
    vesselsOrStations: ['Patrulla Antártica Naval Combinada (PANC)'],
    sdgLinks: [3, 8, 16, 17],
    verifiedDate: '2026-02-01',
    auditEvidenceUrl: 'https://www.ats.aq/devAS/info_exchange.aspx',
    verificationSource: 'Antarctic Treaty Electronic Information Exchange System (EIES)',
  },
  {
    id: 'ple-2026-005',
    category: 'SHARED_DATASET',
    title: 'Liberación Pública de Cartografía Cuaternaria Multihaz (IBCAO / IBCSO v2)',
    description: 'Integración y acceso público sin restricciones a más de 4.8 millones de kilómetros cuadrados de batimetría del Océano Austral recopilada por 32 buques polares.',
    participatingNations: ['Alemania', 'Estados Unidos', 'Japón', 'Francia', 'España', 'Italia', 'Nueva Zelanda'],
    participatingInstitutions: ['SCAR', 'AWI', 'GEBCO', 'Nippon Foundation'],
    vesselsOrStations: ['Hespérides', 'Laura Bassi', 'L’Astrolabe', 'Mirai'],
    sdgLinks: [9, 14, 17],
    verifiedDate: '2025-11-20',
    auditEvidenceUrl: 'https://www.ibcso.org',
    verificationSource: 'SCAR Standing Committee on Antarctic Data Management (SCADM)',
  },
  {
    id: 'ple-2026-006',
    category: 'CROSS_BORDER_RESEARCH',
    title: 'Iniciativa Antarctica InSync (International Decade 2024–2030)',
    description: 'Sincronización global sin precedentes de campañas oceanográficas circumpolares para monitorear el acoplamiento atmósfera-hielo-océano simultáneamente en todos los cuadrantes antárticos.',
    participatingNations: ['Alemania', 'Australia', 'Chile', 'Colombia', 'Estados Unidos', 'Francia', 'Noruega', 'Reino Unido', 'Japón'],
    participatingInstitutions: ['SCAR', 'SOOS', 'AWI', 'NPI', 'CCO', 'BAS', 'IPEV'],
    vesselsOrStations: ['RV Polarstern', 'ARC Simón Bolívar', 'RSV Nuyina', 'RRS Sir David Attenborough', 'Troll Station'],
    sdgLinks: [13, 14, 17],
    verifiedDate: '2026-01-15',
    auditEvidenceUrl: 'https://www.scar.org/initiatives/antarctica-insync',
    verificationSource: 'SCAR Scientific Committee on Antarctic Research Secretariat',
  },
  {
    id: 'ple-2026-007',
    category: 'SHARED_DATASET',
    title: 'Ecosistema de Hielo y Carbono iC3 / Norsk Polarinstitutt (Troll - Mar de Weddell)',
    description: 'Pipeline de modelado biogeoquímico y flujo de carbono glaciar desarrollado por UiT The Arctic University of Norway (Centre for ice, Cryosphere, Carbon and Climate - iC3) en acceso abierto.',
    participatingNations: ['Noruega', 'Reino Unido', 'Alemania'],
    participatingInstitutions: ['UiT / iC3', 'Norsk Polarinstitutt (NPI)', 'University of Cambridge'],
    vesselsOrStations: ['Troll Research Station', 'Kronprins Haakon'],
    sdgLinks: [9, 13, 14, 17],
    verifiedDate: '2026-02-10',
    auditEvidenceUrl: 'https://uit.no/research/ic3',
    verificationSource: 'UiT iC3 Research Repository / NPI Open Data',
  },
  {
    id: 'ple-2026-008',
    category: 'JOINT_EXPEDITION',
    title: 'Cooperación Científica Multidisciplinaria PAC XI en Gerlache y Bransfield',
    description: 'Integración científica universitaria colombiana con apoyo logístico regional para medición de dispersión de sedimentos glaciomarinos y perfiles CTD de alta resolución.',
    participatingNations: ['Colombia', 'Chile'],
    participatingInstitutions: ['CCO', 'DIMAR', 'Universidad Militar Nueva Granada', 'Universidad Jorge Tadeo Lozano', 'INACH'],
    vesselsOrStations: ['ARC Simón Bolívar (248)', 'Base Escudero'],
    sdgLinks: [4, 9, 14, 17],
    verifiedDate: '2026-02-28',
    auditEvidenceUrl: 'https://cco.gov.co/programa-antartico-colombiano',
    verificationSource: 'Comisión Colombiana del Océano (CCO) — Expediciones PAC',
  },
  {
    id: 'ple-2026-009',
    category: 'CROSS_BORDER_RESEARCH',
    title: 'Integración Polar de Nuevos Actores Científicos (EAU & Arabia Saudita / SCAR)',
    description: 'Capacitación en investigación oceanográfica polar y modelado de teleconexiones climáticas intercontinentales en colaboración con programas antárticos de España y Bulgaria.',
    participatingNations: ['Emiratos Árabes Unidos', 'Arabia Saudita', 'España', 'Bulgaria'],
    participatingInstitutions: ['SCAR Associate Members Network', 'Universidad Rey Juan Carlos', 'Bulgarian Antarctic Institute'],
    vesselsOrStations: ['Base St. Kliment Ohridski', 'Base Juan Carlos I'],
    sdgLinks: [4, 13, 17],
    verifiedDate: '2026-01-20',
    auditEvidenceUrl: 'https://www.scar.org/members',
    verificationSource: 'SCAR Membership & Science Diplomacy Working Group',
  },
];
