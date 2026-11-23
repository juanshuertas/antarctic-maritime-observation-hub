import type { PendingMediaRecord } from './pb124-media';

const EXPEDITION_ID = 'PB124-OLEA-2026';
const TOKEN_STORAGE_KEY = 'pb124_ingest_token';
const RELAY_URL = (import.meta.env.VITE_PB124_RELAY_URL || '').trim();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_RE = /^[0-9a-f]{64}$/i;

export interface PB124ObservationReceipt {
  observation_id: string;
  record_hash: string;
  receipt_id: string;
  idempotent?: boolean;
}

export interface PB124MediaReceipt {
  media_id: string;
  observation_id: string;
  sha256_original: string;
  receipt_id: string;
  idempotent?: boolean;
}

function receiptRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('PB124_RECEIPT_NOT_VERIFIABLE');
  }
  const receipt = value as Record<string, unknown>;
  if (receipt.ok !== true || receipt.error || receipt.success === false) {
    throw new Error('PB124_RECEIPT_NOT_CONFIRMED');
  }
  return receipt;
}

export function validatePB124ObservationReceipt(
  value: unknown,
  expectedObservationId: string,
): PB124ObservationReceipt {
  const receipt = receiptRecord(value);
  if (
    receipt.observation_id !== expectedObservationId ||
    typeof receipt.record_hash !== 'string' ||
    !SHA256_RE.test(receipt.record_hash) ||
    typeof receipt.receipt_id !== 'string' ||
    !UUID_RE.test(receipt.receipt_id)
  ) {
    throw new Error('PB124_OBSERVATION_RECEIPT_UNVERIFIED');
  }
  return {
    observation_id: receipt.observation_id,
    record_hash: receipt.record_hash,
    receipt_id: receipt.receipt_id,
    ...(typeof receipt.idempotent === 'boolean' ? { idempotent: receipt.idempotent } : {}),
  };
}

export function validatePB124MediaReceipt(
  value: unknown,
  expected: Pick<PendingMediaRecord, 'id' | 'observation_id' | 'sha256_original'>,
): PB124MediaReceipt {
  const receipt = receiptRecord(value);
  if (
    receipt.media_id !== expected.id ||
    receipt.observation_id !== expected.observation_id ||
    typeof receipt.sha256_original !== 'string' ||
    receipt.sha256_original.toLowerCase() !== expected.sha256_original.toLowerCase() ||
    !SHA256_RE.test(receipt.sha256_original) ||
    typeof receipt.receipt_id !== 'string' ||
    !UUID_RE.test(receipt.receipt_id)
  ) {
    throw new Error('PB124_MEDIA_RECEIPT_UNVERIFIED');
  }
  return {
    media_id: receipt.media_id,
    observation_id: receipt.observation_id,
    sha256_original: receipt.sha256_original,
    receipt_id: receipt.receipt_id,
    ...(typeof receipt.idempotent === 'boolean' ? { idempotent: receipt.idempotent } : {}),
  };
}

function extractHashAccessToken(url: URL): string {
  const raw = url.hash.replace(/^#/, '');
  if (!raw) return '';
  const hashParams = new URLSearchParams(raw);
  return hashParams.get('access')?.trim() || '';
}

function cleanUrlAccessToken() {
  const url = new URL(window.location.href);
  const hadQueryAccess = url.searchParams.has('access');
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  const hadHashAccess = hashParams.has('access');

  if (!hadQueryAccess && !hadHashAccess) return;

  url.searchParams.delete('access');
  hashParams.delete('access');
  const hash = hashParams.toString();

  window.history.replaceState(
    {},
    document.title,
    `${url.pathname}${url.search}${hash ? `#${hash}` : ''}`,
  );
}

export function isPB124CloudRelayEnabled(): boolean {
  return import.meta.env.VITE_PB124_PUBLIC_MODE === '1' && /^https:\/\//i.test(RELAY_URL);
}

export function capturePB124AccessTokenFromUrl(): string | null {
  const url = new URL(window.location.href);
  const incoming =
    extractHashAccessToken(url) ||
    url.searchParams.get('access')?.trim() ||
    '';

  if (incoming) {
    localStorage.setItem(TOKEN_STORAGE_KEY, incoming);
    cleanUrlAccessToken();
    return incoming;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getPB124AccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function hasPB124AccessToken(): boolean {
  return Boolean(getPB124AccessToken());
}

export function clearPB124AccessToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function parseRelayResponse(response: Response) {
  const text = await response.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { message: text };
  }

  if (!response.ok || body?.ok === false ||
      body?.success === false || body?.error) {
    const message = body?.error || body?.message || `Relay HTTP ${response.status}`;
    throw new Error(message);
  }

  if (!body || typeof body !== 'object') {
    throw new Error('PB124_RELAY_RESPONSE_NOT_VERIFIABLE');
  }
  return body;
}

async function relayFetch(init: RequestInit): Promise<any> {
  const token = getPB124AccessToken();
  if (!token) throw new Error('PB124 access token is missing on this device. Re-open the original Meri link.');
  if (!RELAY_URL) throw new Error('PB124 cloud relay is not configured.');

  const headers = new Headers(init.headers || {});
  headers.set('X-PB124-Ingest-Token', token);

  const response = await fetch(RELAY_URL, {
    ...init,
    headers,
    cache: 'no-store',
  });
  return parseRelayResponse(response);
}

export async function pingPB124CloudRelay() {
  return relayFetch({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ping', expedition_id: EXPEDITION_ID }),
  });
}

export async function postPB124CloudObservation(payload: any): Promise<{
  observation_id: string;
  record_hash: string;
  receipt_id: string;
  idempotent?: boolean;
}> {
  if (payload?.expedition_id !== EXPEDITION_ID) {
    throw new Error('PB124 cloud relay rejected a non-PB124 expedition payload.');
  }

  const response = await relayFetch({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'observation', payload }),
  });
  return validatePB124ObservationReceipt(response, payload.observation_id);
}

export async function postPB124CloudMedia(media: PendingMediaRecord): Promise<PB124MediaReceipt> {
  if (media.expedition_id !== EXPEDITION_ID) {
    throw new Error('PB124 cloud relay rejected a non-PB124 media record.');
  }

  const form = new FormData();
  form.append('action', 'media');
  form.append('media_id', media.id);
  form.append('observation_id', media.observation_id);
  form.append('expedition_id', media.expedition_id);
  form.append('participant_id', media.participant_id);
  form.append('capture_label', media.capture_label);
  form.append('client_sha256_original', media.sha256_original);
  if (media.sha256_preview) form.append('client_sha256_preview', media.sha256_preview);
  if (media.sha256_thumbnail) form.append('client_sha256_thumbnail', media.sha256_thumbnail);
  form.append('app_metadata_json', JSON.stringify(media.app_metadata || {}));
  form.append('file', media.original, media.original_name || `${media.id}-original`);
  if (media.preview) form.append('preview', media.preview, `${media.id}-preview.jpg`);
  if (media.thumbnail) form.append('thumbnail', media.thumbnail, `${media.id}-thumbnail.jpg`);

  const response = await relayFetch({ method: 'POST', body: form });
  return validatePB124MediaReceipt(response, media);
}
