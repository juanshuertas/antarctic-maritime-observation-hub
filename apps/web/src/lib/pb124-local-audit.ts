import type { PendingObservation } from './offline-store';
import type { PendingMediaInventory } from './pb124-media';

const REQUIRED_GUIDED_PHOTO_LABELS = ['HORIZON', 'SEA_SURFACE', 'CONTEXT'] as const;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_RE = /^[0-9a-f]{64}$/i;

export function getPB124LocalObservationStatus(
  observation: PendingObservation,
  media: PendingMediaInventory[],
): string {
  const payload = observation.payload || {};
  if (observation.sync_status === 'SYNC_ERROR') return 'SYNC_ERROR';
  if (observation.sync_status === 'SYNCING') return 'SYNCING';
  if (payload.field_payload?.capture_schema_version === 'PB124_GUIDED_CAPTURE_V1') {
    const labels = new Set(media.map((item) => item.capture_label));
    if (!REQUIRED_GUIDED_PHOTO_LABELS.every((label) => labels.has(label))) return 'INCOMPLETE';
  }
  if (observation.sync_status === 'SYNCED') {
    if (
      observation.sync_destination === 'CLOUD_RELAY' &&
      typeof observation.receipt_id === 'string' &&
      UUID_RE.test(observation.receipt_id) &&
      typeof observation.server_hash === 'string' &&
      SHA256_RE.test(observation.server_hash)
    ) return 'CLOUD_CONFIRMED';
    if (observation.sync_destination === 'LOCAL_API') return 'LOCAL_API_ACK';
    return 'UNVERIFIED';
  }
  return observation.sync_status;
}

export function getPB124LocalMediaStatus(media: PendingMediaInventory): string {
  if (media.sync_status === 'SYNC_ERROR') return 'SYNC_ERROR';
  if (media.sync_status === 'SYNCING') return 'SYNCING';
  if (media.sync_status === 'SYNCED') {
    if (
      media.sync_destination === 'CLOUD_RELAY' &&
      typeof media.receipt_id === 'string' &&
      UUID_RE.test(media.receipt_id) &&
      typeof media.verified_sha256 === 'string' &&
      SHA256_RE.test(media.verified_sha256) &&
      media.verified_sha256.toLowerCase() === media.sha256_original.toLowerCase()
    ) return 'CLOUD_CONFIRMED';
    if (media.sync_destination === 'LOCAL_API') return 'LOCAL_API_ACK';
    return 'UNVERIFIED';
  }
  return media.sync_status;
}
