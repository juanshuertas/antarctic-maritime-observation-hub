export type EvidenceStatus =
  | 'VERIFICADO'
  | 'PARCIAL'
  | 'NO_VERIFICADO'
  | 'SIN_FUENTE';

export type EvidenceRecord = {
  status: EvidenceStatus;
  source: string | null;
  sourceUrl: string | null;
  date: string | null;
  confidence: number | null;
  sourceType: string;
  verificationRaw: string | boolean | number | null;
  claimVisibility:
    | 'SOURCE_CLAIM_REVIEWABLE'
    | 'WITHHELD_UNCORROBORATED';
  reason: string;
};

const SOURCE_KEYS = [
  'source','provider','agency','provenance','dataset','reference','citation'
];

const URL_KEYS = [
  'source_url','reference_url','citation_url','url'
];

const DATE_KEYS = [
  'last_verified','verified_at','observed_at','observation_date',
  'datetime','timestamp','date','updated_at','year'
];

const CONFIDENCE_KEYS = [
  'evidence_confidence','data_confidence','confidence','quality','confidence_score'
];

const VERIFY_KEYS = [
  'verification_status','validation_status','verified','is_verified','evidence_status'
];

const SOURCE_TYPE_KEYS = [
  'source_type','evidence_tier','provenance_type'
];

function first(props: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = props?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }
  return null;
}

function normalizeConfidence(value: any) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n > 1 && n <= 100) return Math.max(0, Math.min(1, n / 100));
  return Math.max(0, Math.min(1, n));
}

function verificationState(value: any): 'VERIFIED' | 'UNVERIFIED' | 'UNKNOWN' {
  if (value === true || value === 1) return 'VERIFIED';
  if (value === false || value === 0) return 'UNVERIFIED';
  if (value === null || value === undefined) return 'UNKNOWN';

  const text = String(value)
    .trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if ([
    'verified','verificado','validated','validado','confirmed','confirmado','approved','aprobado'
  ].some(token => text === token || text.includes(token))) {
    return 'VERIFIED';
  }

  if ([
    'unverified','no verificado','not verified','unconfirmed','no confirmado','rejected','rechazado'
  ].some(token => text === token || text.includes(token))) {
    return 'UNVERIFIED';
  }

  return 'UNKNOWN';
}

export function buildEvidenceRecord(properties: Record<string, any>): EvidenceRecord {
  const props = properties || {};

  const sourceRaw = first(props, SOURCE_KEYS);
  const source = sourceRaw === null ? null : String(sourceRaw);

  const sourceUrlRaw = first(props, URL_KEYS);
  const sourceUrl = sourceUrlRaw === null ? null : String(sourceUrlRaw);

  const dateRaw = first(props, DATE_KEYS);
  const date = dateRaw === null ? null : String(dateRaw);

  const confidence = normalizeConfidence(first(props, CONFIDENCE_KEYS));

  const verificationRaw = first(props, VERIFY_KEYS);
  const verification = verificationState(verificationRaw);

  const declaredSource = Boolean(source || sourceUrl);

  let status: EvidenceStatus;
  let reason: string;

  if (verification === 'VERIFIED' && declaredSource) {
    status = 'VERIFICADO';
    reason = 'La metadata declara verificación/validación y existe procedencia explícita.';
  } else if (verification === 'VERIFIED' && !declaredSource) {
    status = 'PARCIAL';
    reason = 'El registro declara verificación, pero AMOH no puede mostrar una fuente explícita.';
  } else if (verification === 'UNVERIFIED') {
    status = 'NO_VERIFICADO';
    reason = declaredSource
      ? 'La propia metadata del registro lo marca como no verificado.'
      : 'El registro está marcado como no verificado y tampoco declara fuente.';
  } else if (declaredSource) {
    status = 'PARCIAL';
    reason = 'Existe procedencia declarada, pero no una confirmación explícita de verificación.';
  } else {
    status = 'SIN_FUENTE';
    reason = 'El registro no expone procedencia verificable en sus propiedades.';
  }

  const sourceTypeRaw = first(props, SOURCE_TYPE_KEYS);
  const sourceType = sourceTypeRaw === null
    ? (declaredSource ? 'FUENTE_DECLARADA_EN_DATASET' : 'NO_DECLARADA')
    : String(sourceTypeRaw);

  return {
    status,
    source,
    sourceUrl,
    date,
    confidence,
    sourceType,
    verificationRaw: verificationRaw === null ? null : verificationRaw,
    claimVisibility:
      declaredSource && confidence !== null
        ? 'SOURCE_CLAIM_REVIEWABLE'
        : 'WITHHELD_UNCORROBORATED',
    reason
  };
}
