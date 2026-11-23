export const PB124_EXPEDITION_ID = 'PB124-OLEA-2026';
const PAGE_SIZE = 100;

export type ObservationSource = 'CLOUD_LIVE' | 'LOCAL_VERIFIED' | 'HISTORICAL_SNAPSHOT';
export type MediaVariant = 'original' | 'preview' | 'thumbnail';
export type MediaIntegrity = 'LOCAL_VERIFIED' | 'ARCHIVED_UNVERIFIED' | 'MISSING' | 'INTEGRITY_ERROR';

export type MediaVariantInfo = {
  available: boolean;
  integrity_status?: MediaIntegrity;
  sha256?: string | null;
  byte_size?: number | null;
  width?: number | null;
  height?: number | null;
};

export type PB124Media = {
  media_id: string;
  capture_label?: string | null;
  source_status: ObservationSource;
  integrity_status: MediaIntegrity;
  variants: Partial<Record<MediaVariant, MediaVariantInfo>>;
};

export type PB124Observation = {
  observation_id: string;
  expedition_id: string;
  utc: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy_m?: number | null;
  observer_type?: string | null;
  observation_type?: string | null;
  quality_level?: number | null;
  qa_qc_status?: string | null;
  field_status?: string | null;
  notes?: string | null;
  record_hash?: string | null;
  field_payload?: Record<string, unknown>;
  source_status: ObservationSource;
  cloud_status: 'CLOUD_LIVE' | 'CLOUD_NOT_VERIFIED' | 'LOCAL_ONLY';
  local_status: 'LOCAL_VERIFIED' | 'ARCHIVED_UNVERIFIED' | 'PARTIAL';
  receipt_count?: number | null;
  receipt_count_source?: string | null;
  media: PB124Media[];
  snapshot_fields?: Record<string, string>;
};

export type PB124ObservationDetail = PB124Observation & {
  participant_id?: string | null;
  device_id?: string | null;
  altitude_m?: number | null;
  heading_deg?: number | null;
  speed_mps?: number | null;
  provenance?: Record<string, unknown> | null;
};

export class PB124ApiError extends Error {
  // Campo declarado aparte: las parameter properties no se permiten con
  // erasableSyntaxOnly (tsconfig.app.json).
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'PB124ApiError';
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === 'object' && 'detail' in body) {
        message = String(body.detail);
      }
    } catch {
      message = response.statusText || 'Request failed';
    }
    throw new PB124ApiError(message || 'Request failed', response.status);
  }
  return response.json() as Promise<T>;
}

export async function createPB124ResearcherSession(apiKey: string): Promise<void> {
  await requestJson<{ authenticated: boolean }>('/api/observations/researcher-session', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey }),
  });
}

export async function loadPB124Observations(): Promise<PB124Observation[]> {
  const live: PB124Observation[] = [];
  let offset = 0;

  while (true) {
    const query = new URLSearchParams({
      expedition_id: PB124_EXPEDITION_ID,
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    const page = await requestJson<Array<Omit<PB124Observation, 'source_status' | 'cloud_status' | 'local_status' | 'media'>>>(
      `/api/observations?${query.toString()}`,
    );
    live.push(...page.map((observation) => ({
      ...observation,
      source_status: 'LOCAL_VERIFIED' as const,
      cloud_status: 'LOCAL_ONLY' as const,
      local_status: 'LOCAL_VERIFIED' as const,
      media: [],
    })));
    if (page.length < PAGE_SIZE) break;
    offset += page.length;
  }

  const liveWithMedia = await Promise.all(live.map(async (observation) => ({
    ...observation,
    media: await requestJson<PB124Media[]>(
      `/api/observations/${encodeURIComponent(observation.observation_id)}/media`,
    ),
  })));

  const snapshot = await requestJson<PB124Observation[]>('/api/observations/archive/snapshot');
  const merged = new Map(snapshot.map((observation) => [observation.observation_id, observation]));
  const cloud = await requestJson<{
    observations: Array<{ observation_id: string; captured_at_utc: string; sync_state: string }>;
    media: Array<{
      media_id: string;
      observation_id: string;
      capture_label: string;
      sha256_original: string;
      byte_size: number;
    }>;
    receipts: Array<{ observation_id: string; media_id: string | null; status: string }>;
  }>('/api/observations/cloud');

  for (const observation of liveWithMedia) {
    const archived = merged.get(observation.observation_id);
    merged.set(observation.observation_id, {
      ...archived,
      ...observation,
      media: observation.media.length ? observation.media : archived?.media ?? [],
      snapshot_fields: archived?.snapshot_fields,
    });
  }

  for (const cloudObservation of cloud.observations) {
    const existing = merged.get(cloudObservation.observation_id);
    if (!existing) continue;
    const cloudMedia = cloud.media.filter((item) => item.observation_id === cloudObservation.observation_id);
    merged.set(cloudObservation.observation_id, {
      ...existing,
      source_status: 'CLOUD_LIVE',
      cloud_status: 'CLOUD_LIVE',
      local_status: existing.media.length ? 'LOCAL_VERIFIED' : 'PARTIAL',
      media: existing.media.map((item) => {
        const remote = cloudMedia.find((candidate) => candidate.media_id === item.media_id);
        return remote
          ? {
              ...item,
              capture_label: remote.capture_label,
              integrity_status: item.integrity_status,
              variants: {
                ...item.variants,
                original: item.variants.original
                  ? { ...item.variants.original, sha256: remote.sha256_original, byte_size: remote.byte_size }
                  : item.variants.original,
              },
            }
          : item;
      }),
      receipt_count: cloud.receipts.filter((receipt) => receipt.observation_id === cloudObservation.observation_id).length,
      receipt_count_source: 'CLOUD_LIVE',
    });
  }

  return [...merged.values()].sort((a, b) => (b.utc ?? '').localeCompare(a.utc ?? ''));
}

export async function loadPB124ObservationDetail(
  observation: PB124Observation,
): Promise<PB124ObservationDetail> {
  if (observation.source_status !== 'LOCAL_VERIFIED' || observation.snapshot_fields) {
    return observation;
  }

  const detail = await requestJson<Omit<PB124ObservationDetail, 'source_status' | 'cloud_status' | 'local_status' | 'media'>>(
    `/api/observations/${encodeURIComponent(observation.observation_id)}`,
  );
  const media = await requestJson<PB124Media[]>(
    `/api/observations/${encodeURIComponent(observation.observation_id)}/media`,
  );
  return {
    ...observation,
    ...detail,
    source_status: 'LOCAL_VERIFIED',
    cloud_status: 'LOCAL_ONLY',
    local_status: 'LOCAL_VERIFIED',
    media: media.map((item) => ({ ...item, source_status: 'LOCAL_VERIFIED' })),
  };
}

export function mediaContentUrl(
  observation: PB124Observation,
  media: PB124Media,
  variant: MediaVariant,
): string {
  if (media.source_status === 'HISTORICAL_SNAPSHOT') {
    return `/api/observations/archive/snapshot/${encodeURIComponent(observation.observation_id)}/media/${encodeURIComponent(media.media_id)}/${variant}`;
  }
  return `/api/observations/${encodeURIComponent(observation.observation_id)}/media/${encodeURIComponent(media.media_id)}/content?variant=${variant}`;
}
