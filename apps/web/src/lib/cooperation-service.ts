/**
 * AMOH V8.6 — Cliente de Cooperación Internacional y Recursos de Financiación ODS
 * Provee acceso a fondos multilaterales (GEF, GCF, CCAMLR, UNESCO, SCAR, BBNJ, OMI)
 * con soporte offline-first y generación de notas conceptuales diplomáticas.
 */

export interface CooperationResource {
  id: string;
  name: string;
  entity: string;
  category: 'MULTILATERAL_FUND' | 'CLIMATE_FINANCE' | 'FELLOWSHIP' | 'DECADE_ACTION' | 'TREATY_MECHANISM' | 'RESEARCH_CONSORTIUM' | 'TECHNICAL_ASSISTANCE' | 'BILATERAL_PARTNERSHIP';
  funding_type: string;
  amount_min_usd: number;
  amount_max_usd: number;
  currency: string;
  sdgs: number[];
  sdg_targets: string[];
  focus_areas: string[];
  eligible_countries: string[];
  application_window: string;
  next_deadline: string;
  official_url: string;
  requirements: string[];
  status: 'OPEN' | 'CLOSED';
  antarctic_treaty_relevance: string;
}

export interface MatchCooperationQuery {
  title: string;
  sdgs: number[];
  expedition_type?: string;
  estimated_budget_usd?: number;
  partner_countries?: string[];
}

export interface MatchedResourceItem {
  resource_id: string;
  resource_name: string;
  entity: string;
  category: string;
  compatibility_score: number;
  tier: 'ALTA COMPATIBILIDAD' | 'COMPATIBILIDAD MEDIA' | 'OPORTUNIDAD SECUNDARIA' | string;
  next_deadline: string;
  official_url: string;
  key_reasons: string[];
  sdgs: number[];
}

export interface MatchCooperationResponse {
  query: MatchCooperationQuery;
  total_evaluated: number;
  top_matches_count: number;
  matches: MatchedResourceItem[];
  generated_at_utc: string;
}

export interface ConceptNoteRequestParams {
  resource_id: string;
  project_title: string;
  lead_investigator: string;
  lead_institution: string;
  partner_institutions: string[];
  selected_sdgs: number[];
  requested_budget_usd: number;
  sector_description: string;
}

export interface ConceptNoteResponse {
  document_code: string;
  resource: CooperationResource;
  project_title: string;
  lead_investigator: string;
  lead_institution: string;
  partner_institutions: string[];
  selected_sdgs: number[];
  requested_budget_usd: number;
  sector_description: string;
  generated_at_utc: string;
  sha256_verification_hash: string;
  markdown_content: string;
}

const FALLBACK_RESOURCES: CooperationResource[] = [
  {
    id: 'GEF-POLAR-OCEANS',
    name: 'Fondo para el Medio Ambiente Mundial (GEF) — Aguas Internacionales y Biodiversidad Marina',
    entity: 'Global Environment Facility (GEF) / PNUD / PNUMA',
    category: 'MULTILATERAL_FUND',
    funding_type: 'GRANT',
    amount_min_usd: 500000,
    amount_max_usd: 6000000,
    currency: 'USD',
    sdgs: [14, 13, 17, 16],
    sdg_targets: ['14.2', '14.5', '13.1', '17.6', '17.9'],
    focus_areas: [
      'Áreas Marinas Protegidas de Alta Mar (MPA)',
      'Implementación del Acuerdo BBNJ en el Océano Austral',
      'Gobernanza ecosistémica de pesquerías y hábitats bénticos vulnerables',
    ],
    eligible_countries: ['GLOBAL_SOUTH', 'NON_CONSULTATIVE_AT_PARTIES', 'DEVELOPING_STATES'],
    application_window: 'Convocatorias Semestrales GEF-8',
    next_deadline: '2027-04-30',
    official_url: 'https://www.thegef.org',
    requirements: ['Aval Punto Focal Operativo GEF', 'Cofinanciamiento en especie o líquido 1:2'],
    status: 'OPEN',
    antarctic_treaty_relevance: 'Apoyo a la creación y monitoreo científico de MPAs en el Dominio CCAMLR y ASPA.',
  },
  {
    id: 'GCF-CRYOSPHERE-RESILIENCE',
    name: 'Fondo Verde del Clima (GCF) — Preparación y Resiliencia Criósférica Antártica',
    entity: 'Green Climate Fund (GCF) / CMNUCC',
    category: 'CLIMATE_FINANCE',
    funding_type: 'BLENDED_FINANCE',
    amount_min_usd: 1000000,
    amount_max_usd: 25000000,
    currency: 'USD',
    sdgs: [13, 9, 7, 17],
    sdg_targets: ['13.1', '13.3', '13.a', '9.1', '7.2'],
    focus_areas: [
      'Monitoreo del balance de masa de hielo y desglaciación',
      'Infraestructura científica carbono-neutral en bases antárticas',
      'Sistemas de alerta temprana de aumento del nivel del mar',
    ],
    eligible_countries: ['ALL_UNFCCC_MEMBERS', 'COASTAL_DEVELOPING_STATES'],
    application_window: 'Ventanilla Abierta Continua',
    next_deadline: '2027-06-15',
    official_url: 'https://www.greenclimate.fund',
    requirements: ['Acreditación DAE o Internacional', 'Carta No Objeción de NDA'],
    status: 'OPEN',
    antarctic_treaty_relevance: 'Cumplimiento del Protocolo de Madrid para minimización de emisiones e impacto.',
  },
  {
    id: 'CCAMLR-SCHOLARSHIP',
    name: 'Programa de Becas Científicas CCAMLR para Jóvenes Investigadores Polares',
    entity: 'Secretaría de CCAMLR',
    category: 'FELLOWSHIP',
    funding_type: 'GRANT',
    amount_min_usd: 20000,
    amount_max_usd: 30000,
    currency: 'AUD',
    sdgs: [14, 4, 17],
    sdg_targets: ['14.4', '14.b', '4.b', '17.9'],
    focus_areas: [
      'Evaluación acústica de Euphausia superba (Krill Antártico)',
      'Monitoreo de predadores dependientes (CEMP)',
      'Modelado trófico y pesquerías precautorias',
    ],
    eligible_countries: ['CCAMLR_MEMBER_STATES'],
    application_window: 'Convocatoria Anual',
    next_deadline: '2027-04-01',
    official_url: 'https://www.ccamlr.org',
    requirements: ['Científico en carrera temprana (<5 años post-doc)', 'Mentor institucional en otro Estado Miembro'],
    status: 'OPEN',
    antarctic_treaty_relevance: 'Fomento activo de la ciencia pesquera precautoria consagrada en CCAMLR.',
  },
  {
    id: 'SCAR-FELLOWSHIP',
    name: 'Programa de Becas de Investigación SCAR / COMNAP / WMO',
    entity: 'Scientific Committee on Antarctic Research (SCAR)',
    category: 'FELLOWSHIP',
    funding_type: 'GRANT',
    amount_min_usd: 15000,
    amount_max_usd: 15000,
    currency: 'USD',
    sdgs: [4, 9, 13, 17],
    sdg_targets: ['4.b', '9.5', '13.3', '17.6'],
    focus_areas: [
      'Meteorología y balance de radiación polar',
      'Geociencias y dinámica de placas australes',
      'Biodiversidad antártica y genómica ambiental',
    ],
    eligible_countries: ['GLOBAL_EARLY_CAREER', 'EMERGING_POLAR_NATIONS'],
    application_window: 'Convocatoria Anual (Cierre Junio)',
    next_deadline: '2027-06-30',
    official_url: 'https://scar.org/awards/fellowships',
    requirements: ['Estancia de investigación 1 a 6 meses en institución extranjera', 'Endoso del Comité Nacional de SCAR'],
    status: 'OPEN',
    antarctic_treaty_relevance: 'Materialización del Artículo III del Tratado Antártico (intercambio de personal).',
  },
  {
    id: 'UN-OCEAN-DECADE-ALLIANCE',
    name: 'Facilidad del Decenio del Océano para el Desarrollo de Capacidades Científicas',
    entity: 'COI-UNESCO / UN Ocean Decade Alliance',
    category: 'DECADE_ACTION',
    funding_type: 'CO_FINANCING',
    amount_min_usd: 50000,
    amount_max_usd: 500000,
    currency: 'USD',
    sdgs: [14, 4, 9, 17],
    sdg_targets: ['14.a', '14.2', '4.7', '17.16'],
    focus_areas: [
      'Ciencia Ciudadana Oceanográfica (Peace Boat Ecoship)',
      'Redes de sensores interoperables (ODIS)',
      'Profesionales del Océano en Carrera Temprana (ECOPs)',
    ],
    eligible_countries: ['ALL_UN_MEMBERS', 'CIVIL_SOCIETY'],
    application_window: 'Llamadas a Acciones del Decenio',
    next_deadline: '2027-01-31',
    official_url: 'https://oceandecade.org',
    requirements: ['Alineación con 3 Desafíos del Decenio', 'Datos abiertos bajo principios FAIR'],
    status: 'OPEN',
    antarctic_treaty_relevance: 'Conexión del Océano Austral con la red de observación oceánica global de la ONU.',
  },
];

export async function fetchCooperationResources(sdg?: number, category?: string): Promise<CooperationResource[]> {
  try {
    const params = new URLSearchParams();
    if (sdg !== undefined) params.append('sdg', sdg.toString());
    if (category) params.append('category', category);

    const res = await fetch(`/api/cooperation/resources?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Modo offline resiliente
  }

  // Filtrado local fallback
  let data = FALLBACK_RESOURCES;
  if (sdg !== undefined) {
    data = data.filter((r) => r.sdgs.includes(sdg));
  }
  if (category) {
    data = data.filter((r) => r.category === category);
  }
  return data;
}

export async function matchCooperationResources(query: MatchCooperationQuery): Promise<MatchCooperationResponse> {
  try {
    const res = await fetch('/api/cooperation/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback offline matching
  }

  const matches: MatchedResourceItem[] = FALLBACK_RESOURCES.map((r) => {
    const shared = query.sdgs.filter((s) => r.sdgs.includes(s));
    const score = Math.min(100, Math.round((shared.length / Math.max(query.sdgs.length, 1)) * 50 + 40));
    return {
      resource_id: r.id,
      resource_name: r.name,
      entity: r.entity,
      category: r.category,
      compatibility_score: score,
      tier: (score >= 75 ? 'ALTA COMPATIBILIDAD' : score >= 50 ? 'COMPATIBILIDAD MEDIA' : 'OPORTUNIDAD SECUNDARIA') as MatchedResourceItem['tier'],
      next_deadline: r.next_deadline,
      official_url: r.official_url,
      key_reasons: [`Coincidencia ODS: ${shared.join(', ')}`, 'Elegibilidad geográfica conforme a normativas'],
      sdgs: r.sdgs,
    };
  }).sort((a, b) => b.compatibility_score - a.compatibility_score);

  return {
    query,
    total_evaluated: FALLBACK_RESOURCES.length,
    top_matches_count: matches.filter((m) => m.compatibility_score >= 70).length,
    matches,
    generated_at_utc: new Date().toISOString(),
  };
}

export async function generateConceptNote(params: ConceptNoteRequestParams): Promise<ConceptNoteResponse> {
  const res = await fetch('/api/cooperation/concept-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error al generar nota conceptual' }));
    throw new Error(err.detail || 'Fallo en la generación diplomática');
  }
  return await res.json();
}
