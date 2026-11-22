import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  Image as ImageIcon,
  MapPin,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { API_BASE } from '../lib/api';
import { offlineStore, type PendingObservation } from '../lib/offline-store';
import { mediaStore, type PendingMediaInventory } from '../lib/pb124-media';
import {
  getPB124LocalMediaStatus,
  getPB124LocalObservationStatus,
} from '../lib/pb124-local-audit';
import {
  getPB124PhotoDraft,
  listPB124PhotoDrafts,
  type PB124PhotoDraftSummary,
} from '../lib/pb124-photo-draft-v8';
import PB124RouteMap from './PB124RouteMap';
import PB124VoyageTimeline from './PB124VoyageTimeline';

type ObservationSummary = {
  observation_id: string;
  expedition_id: string;
  participant_id?: string | null;
  device_id?: string | null;
  utc: string;
  latitude: number;
  longitude: number;
  accuracy_m?: number | null;
  altitude_m?: number | null;
  heading_deg?: number | null;
  speed_mps?: number | null;
  observer_type: string;
  observation_type: string;
  field_status: string;
  notes?: string | null;
  record_hash: string;
};

type ObservationDetail = ObservationSummary & {
  field_payload: Record<string, unknown>;
  provenance: Record<string, unknown> | null;
};

type MediaRecord = {
  media_id: string;
  capture_label: string;
  original_name: string;
  mime_type: string;
  byte_size: number;
  sha256_original: string;
  sha256_preview?: string | null;
  sha256_thumbnail?: string | null;
  exif: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
  sync_status: string;
  created_at: string;
};

type ReviewRecord = {
  review_id: string;
  reviewer_id: string;
  decision: string;
  reason?: string | null;
  previous_status?: string | null;
  created_at: string;
  record_hash?: string | null;
};

type ReviewResponse = {
  review_id: string;
  observation_id: string;
  previous_status: string;
  decision: string;
  passport_entry_id?: string | null;
  passport_entry_issued: boolean;
};

const EXPEDITION_ID = 'PB124-OLEA-2026';
const KEY_STORAGE = 'amoh_pb124_researcher_key';


// PB124_CAPTURE_PROVENANCE_UI_V6
function pb124Value(record: Record<string, unknown> | undefined | null, key: string): unknown {
  if (!record) return undefined;
  return record[key];
}

function pb124Text(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'NOT EMBEDDED / NOT AVAILABLE';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NOT AVAILABLE';
  return String(value);
}

function pb124CaptureProvenance(m: MediaRecord) {
  const exif = m.exif || {};
  const app = m.app_metadata || {};
  const nestedLocation = (app.capture_location || {}) as Record<string, unknown>;
  const nestedEquipment = (app.equipment_metadata || {}) as Record<string, unknown>;

  const exifLat = pb124Value(exif, 'GPSLatitude');
  const exifLon = pb124Value(exif, 'GPSLongitude');
  const exifGps = exifLat !== undefined && exifLat !== null && exifLon !== undefined && exifLon !== null;

  const latitude = exifGps
    ? exifLat
    : (pb124Value(nestedLocation, 'latitude') ?? pb124Value(app, 'latitude'));
  const longitude = exifGps
    ? exifLon
    : (pb124Value(nestedLocation, 'longitude') ?? pb124Value(app, 'longitude'));

  return {
    latitude,
    longitude,
    accuracy: pb124Value(nestedLocation, 'accuracy_m') ?? pb124Value(app, 'accuracy_m'),
    altitude: exifGps
      ? pb124Value(exif, 'GPSAltitude')
      : (pb124Value(nestedLocation, 'altitude_m') ?? pb124Value(app, 'altitude_m')),
    locationSource: exifGps
      ? 'PHOTO EXIF GPS'
      : (pb124Value(nestedLocation, 'source') ?? pb124Value(app, 'location_source') ?? 'DEVICE GNSS'),
    positionTimestamp:
      pb124Value(nestedLocation, 'position_timestamp_utc')
      ?? pb124Value(app, 'position_timestamp_utc'),
    make: pb124Value(exif, 'Make') ?? pb124Value(nestedEquipment, 'make'),
    model: pb124Value(exif, 'Model') ?? pb124Value(nestedEquipment, 'model'),
    lensMake: pb124Value(exif, 'LensMake') ?? pb124Value(nestedEquipment, 'lens_make'),
    lensModel: pb124Value(exif, 'LensModel') ?? pb124Value(nestedEquipment, 'lens_model'),
    focalLength: pb124Value(exif, 'FocalLength') ?? pb124Value(nestedEquipment, 'focal_length_mm'),
    focal35: pb124Value(exif, 'FocalLengthIn35mmFilm') ?? pb124Value(nestedEquipment, 'focal_length_35mm_equivalent_mm'),
    aperture: pb124Value(exif, 'FNumber') ?? pb124Value(nestedEquipment, 'aperture_f_number'),
    exposure: pb124Value(exif, 'ExposureTime') ?? pb124Value(nestedEquipment, 'exposure_time_s'),
    iso: pb124Value(exif, 'ISO') ?? pb124Value(nestedEquipment, 'iso'),
    software: pb124Value(exif, 'Software') ?? pb124Value(nestedEquipment, 'software'),
    dateOriginal: pb124Value(exif, 'DateTimeOriginal') ?? pb124Value(nestedEquipment, 'date_time_original'),
    equipmentStatus:
      pb124Value(app, 'equipment_metadata_status')
      ?? (
        (pb124Value(exif, 'Make') || pb124Value(exif, 'Model') || pb124Value(exif, 'LensModel'))
          ? 'EMBEDDED_EXIF_AVAILABLE'
          : 'NOT_EMBEDDED_IN_ORIGINAL_FILE'
      ),
    clientDeviceContext: (app.client_device_context || {}) as Record<string, unknown>,
    deviceId: pb124Value(app, 'device_id') ?? pb124Value(app, 'observation_device_id'),
  };
}

function statusClass(status: string): string {
  if (status === 'ACCEPTED_FOR_METHOD_TEST') return 'text-[#72e0b5]';
  if (status === 'EXCLUDED_FROM_METHOD_TEST') return 'text-[#ef7777]';
  if (status === 'PILOT_METHOD_REVIEWED') return 'text-[#00e5ff]';
  return 'text-[#f0b35a]';
}

function localStatusClass(status: string): string {
  if (status === 'CLOUD_CONFIRMED') return 'text-[#72e0b5]';
  if (status === 'SYNC_ERROR' || status === 'INCOMPLETE') return 'text-[#ff9c9c]';
  if (status === 'PENDING_SYNC' || status === 'LOCAL_SAVED' || status === 'UNVERIFIED') return 'text-[#f0b35a]';
  return 'text-[#8faab5]';
}

export default function PB124AdminReview() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '');
  const [keyDraft, setKeyDraft] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '');
  const [queue, setQueue] = useState<ObservationSummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<ObservationDetail | null>(null);
  const [media, setMedia] = useState<MediaRecord[]>([]);
  // PB124_PRIVATE_EVIDENCE_VIEWER_V4B
  const [pb124MediaUrls, setPb124MediaUrls] = useState<Record<string, string>>({});
  const [pb124MediaErrors, setPb124MediaErrors] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [localObservations, setLocalObservations] = useState<PendingObservation[]>([]);
  const [localMedia, setLocalMedia] = useState<PendingMediaInventory[]>([]);
  const [localDrafts, setLocalDrafts] = useState<PB124PhotoDraftSummary[]>([]);
  const [selectedLocalId, setSelectedLocalId] = useState('');
  const [localArchiveError, setLocalArchiveError] = useState('');
  const [localArchiveBusy, setLocalArchiveBusy] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<{
    url: string;
    name: string;
    digest: string;
    integrity: string;
  } | null>(null);

  const headers = useMemo(() => ({ 'X-AMOH-RESEARCHER-KEY': key }), [key]);

  const refreshLocalArchive = useCallback(async () => {
    if (!key) {
      setLocalObservations([]);
      setLocalMedia([]);
      setLocalDrafts([]);
      setSelectedLocalId('');
      setLocalPhoto(null);
      return;
    }
    setLocalArchiveBusy(true);
    setLocalArchiveError('');
    try {
      const [observations, mediaRows, drafts] = await Promise.all([
        offlineStore.getAll(),
        mediaStore.getInventory(EXPEDITION_ID),
        listPB124PhotoDrafts(),
      ]);
      const matchingObservations = observations.filter(
        (item) => item.expedition_id === EXPEDITION_ID,
      );
      setLocalObservations(matchingObservations);
      setLocalMedia(mediaRows);
      setLocalDrafts(drafts);
      setSelectedLocalId((current) =>
        current && matchingObservations.some((item) => item.id === current)
          ? current
          : matchingObservations[0]?.id || '',
      );
    } catch (e) {
      setLocalArchiveError(e instanceof Error ? e.message : String(e));
    } finally {
      setLocalArchiveBusy(false);
    }
  }, [key]);

  const adminFetch = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`${res.status} ${body || res.statusText}`);
    }
    return res.json() as Promise<T>;
  }, [headers]);

  useEffect(() => {
    void refreshLocalArchive();
  }, [refreshLocalArchive]);

  useEffect(() => () => {
    if (localPhoto?.url) URL.revokeObjectURL(localPhoto.url);
  }, [localPhoto]);

  const openLocalMedia = useCallback(async (mediaId: string) => {
    setLocalArchiveError('');
    try {
      const record = await mediaStore.getById(mediaId);
      if (!record?.original?.size) throw new Error('Original photo is not available in this browser store.');
      const bytes = new Uint8Array(await record.original.arrayBuffer());
      const digestBuffer = await crypto.subtle.digest('SHA-256', bytes);
      const digest = [...new Uint8Array(digestBuffer)]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      const integrity = digest.toLowerCase() === record.sha256_original.toLowerCase()
        ? 'MATCHES STORED SHA-256'
        : 'SHA-256 MISMATCH';
      setLocalPhoto({
        url: URL.createObjectURL(record.original),
        name: record.original_name,
        digest,
        integrity,
      });
    } catch (e) {
      setLocalArchiveError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const openLocalDraft = useCallback(async (draftId: string) => {
    setLocalArchiveError('');
    try {
      const draft = await getPB124PhotoDraft(draftId);
      if (!draft?.file?.size) throw new Error('Original draft photo is not available in this browser store.');
      const digestBuffer = await crypto.subtle.digest('SHA-256', await draft.file.arrayBuffer());
      const digest = [...new Uint8Array(digestBuffer)]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      setLocalPhoto({
        url: URL.createObjectURL(draft.file),
        name: draft.name,
        digest,
        integrity: 'COMPUTED NOW; DRAFT HAS NO SAVED SHA-256 BASELINE',
      });
    } catch (e) {
      setLocalArchiveError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const exportLocalInventory = useCallback(() => {
    const report = {
      exported_at: new Date().toISOString(),
      source: 'This browser device IndexedDB only; not a cloud/Supabase query.',
      photo_bytes_included: false,
      observations: localObservations.map((item) => ({
        observation_id: item.observation_id,
        timestamp: item.timestamp,
        latitude: item.payload?.latitude ?? null,
        longitude: item.payload?.longitude ?? null,
        accuracy_m: item.payload?.accuracy_m ?? null,
        position_timestamp_utc: item.payload?.position_timestamp_utc ?? null,
        field_payload: item.payload?.field_payload ?? null,
        sync_status: item.sync_status,
        sync_destination: item.sync_destination ?? null,
        receipt_id: item.receipt_id ?? null,
        server_hash: item.server_hash ?? null,
        last_error: item.last_error ?? null,
        photo_status: getPB124LocalObservationStatus(
          item,
          localMedia.filter((mediaItem) => mediaItem.observation_id === item.id),
        ),
      })),
      media: localMedia.map((item) => ({
        media_id: item.id,
        observation_id: item.observation_id,
        capture_label: item.capture_label,
        original_name: item.original_name,
        mime_type: item.mime_type,
        byte_size: item.byte_size,
        sha256_original: item.sha256_original,
        verified_sha256: item.verified_sha256 ?? null,
        sync_status: getPB124LocalMediaStatus(item),
        sync_destination: item.sync_destination ?? null,
        receipt_id: item.receipt_id ?? null,
        last_error: item.last_error ?? null,
      })),
      unlinked_photo_drafts: localDrafts.map((item) => ({
        draft_photo_id: item.id,
        draft_id: item.draftId,
        capture_label: item.label,
        original_name: item.name,
        mime_type: item.type,
        byte_size: item.byteSize,
        saved_at: item.savedAt,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pb124-local-inventory-${new Date().toISOString().replaceAll(':', '-')}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [localDrafts, localMedia, localObservations]);

  const selectedLocalObservation = localObservations.find((item) => item.id === selectedLocalId);
  const selectedLocalMedia = localMedia.filter((item) => item.observation_id === selectedLocalId);
  const localMapPoints = localObservations.flatMap((item) => {
    const lat = Number(item.payload?.latitude);
    const lng = Number(item.payload?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
    return [{
      observationId: item.id,
      lat,
      lng,
      utc: item.timestamp,
      accuracy: Number.isFinite(Number(item.payload?.accuracy_m))
        ? Number(item.payload.accuracy_m)
        : null,
      status: getPB124LocalObservationStatus(
        item,
        localMedia.filter((mediaItem) => mediaItem.observation_id === item.id),
      ),
      label: item.id.slice(0, 8),
    }];
  });
  const selectedLocalPosition = selectedLocalObservation
    && Number.isFinite(Number(selectedLocalObservation.payload?.latitude))
    && Number.isFinite(Number(selectedLocalObservation.payload?.longitude))
    ? {
        lat: Number(selectedLocalObservation.payload?.latitude),
        lng: Number(selectedLocalObservation.payload?.longitude),
        accuracy: Number(selectedLocalObservation.payload?.accuracy_m),
        status: getPB124LocalObservationStatus(selectedLocalObservation, selectedLocalMedia),
      }
    : null;
  const localCloudConfirmedCount = localObservations.filter((item) =>
    getPB124LocalObservationStatus(
      item,
      localMedia.filter((mediaItem) => mediaItem.observation_id === item.id),
    ) === 'CLOUD_CONFIRMED',
  ).length;
  const localIncompleteCount = localObservations.filter((item) =>
    getPB124LocalObservationStatus(
      item,
      localMedia.filter((mediaItem) => mediaItem.observation_id === item.id),
    ) === 'INCOMPLETE',
  ).length;
  const localPendingCount = localObservations.filter((item) => item.sync_status !== 'SYNCED').length
    + localMedia.filter((item) => item.sync_status !== 'SYNCED').length;

  const pb124AdminFetchBlob = useCallback(async (path: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`${res.status} ${body || res.statusText}`);
    }
    return res.blob();
  }, [headers]);


  const loadQueue = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setError('');
    try {
      const rows = await adminFetch<ObservationSummary[]>(
        `/api/observations?expedition_id=${encodeURIComponent(EXPEDITION_ID)}&limit=250`,
      );
      setQueue(rows);
      setSelectedId((current) =>
        current && rows.some((r) => r.observation_id === current)
          ? current
          : rows[0]?.observation_id || '',
      );
    } catch (e: any) {
      setError(e?.message || 'Unable to load PB124 review queue.');
    } finally {
      setLoading(false);
    }
  }, [adminFetch, key]);

  const loadSelected = useCallback(async (observationId: string) => {
    if (!key || !observationId) {
      setDetail(null);
      setMedia([]);
      setReviews([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [d, m, r] = await Promise.all([
        adminFetch<ObservationDetail>(`/api/observations/${observationId}`),
        adminFetch<MediaRecord[]>(`/api/observations/${observationId}/media`),
        adminFetch<ReviewRecord[]>(`/api/observations/${observationId}/reviews`),
      ]);
      setDetail(d);
      setMedia(m);
      setReviews(r);
    } catch (e: any) {
      setError(e?.message || 'Unable to load observation detail.');
      setDetail(null);
      setMedia([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [adminFetch, key]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    void loadSelected(selectedId);
  }, [selectedId, loadSelected]);

  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];

    setPb124MediaUrls({});
    setPb124MediaErrors({});

    if (!key || !selectedId || media.length === 0) {
      return () => {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
      };
    }

    const loadPrivateEvidence = async () => {
      await Promise.all(
        media.map(async (record) => {
          const variants: Array<'preview' | 'thumbnail' | 'original'> = [
            'preview',
            'thumbnail',
            'original',
          ];
          let lastError = 'No renderable evidence image was returned.';

          for (const variant of variants) {
            try {
              const blob = await pb124AdminFetchBlob(
                `/api/observations/${encodeURIComponent(selectedId)}/media/${encodeURIComponent(record.media_id)}/content?variant=${variant}`,
              );
              if (cancelled) return;

              const objectUrl = URL.createObjectURL(blob);
              createdUrls.push(objectUrl);
              setPb124MediaUrls((current) => ({
                ...current,
                [record.media_id]: objectUrl,
              }));
              return;
            } catch (e: any) {
              lastError = e?.message || lastError;
            }
          }

          if (!cancelled) {
            setPb124MediaErrors((current) => ({
              ...current,
              [record.media_id]: lastError,
            }));
          }
        }),
      );
    };

    void loadPrivateEvidence();

    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [key, media, pb124AdminFetchBlob, selectedId]);

  const pb124OpenOriginal = useCallback(async (record: MediaRecord) => {
    setError('');
    try {
      const popup = window.open('', '_blank');
      const blob = await pb124AdminFetchBlob(
        `/api/observations/${encodeURIComponent(selectedId)}/media/${encodeURIComponent(record.media_id)}/content?variant=original`,
      );
      const objectUrl = URL.createObjectURL(blob);

      if (popup) {
        popup.location.href = objectUrl;
      } else {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = record.original_name || `${record.media_id}.bin`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (e: any) {
      setError(e?.message || 'Unable to open original evidence file.');
    }
  }, [pb124AdminFetchBlob, selectedId]);


  const saveKey = () => {
    const next = keyDraft.trim();
    if (!next) {
      sessionStorage.removeItem(KEY_STORAGE);
      setKey('');
      return;
    }
    sessionStorage.setItem(KEY_STORAGE, next);
    setKey(next);
    setFeedback('Researcher key loaded for this browser session only.');
  };

  const decide = async (
    decision: 'PILOT_METHOD_REVIEWED' | 'ACCEPTED_FOR_METHOD_TEST' | 'EXCLUDED_FROM_METHOD_TEST',
  ) => {
    if (!detail) return;
    if (!note.trim()) {
      setError('Write a review note before recording a method decision.');
      return;
    }
    setLoading(true);
    setError('');
    setFeedback('');
    try {
      const result = await adminFetch<ReviewResponse>(
        `/api/observations/${detail.observation_id}/review`,
        {
          method: 'POST',
          body: JSON.stringify({
            reviewer_id: 'Juan Sebastian Huertas Olea',
            decision,
            reason: note.trim(),
          }),
        },
      );
      setFeedback(
        result.passport_entry_issued
          ? `${decision} saved. Evidence-backed PB124 passport participation entry issued.`
          : `${decision} saved. No automatic scientific-validation claim was issued.`,
      );
      setNote('');
      await loadQueue();
      await loadSelected(detail.observation_id);
    } catch (e: any) {
      setError(e?.message || 'Review decision failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!key) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 font-mono">
        <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-[#00e5ff]" />
            <div>
              <h2 className="text-lg font-bold text-white">PB124 Research Admin</h2>
              <p className="text-xs text-[#8faab5]">
                Exact coordinates, evidence metadata and method-review actions require the local researcher key.
              </p>
            </div>
          </div>
          <input
            type="password"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="AMOH_RESEARCHER_API_KEY"
            className="w-full rounded-xl border border-[#1b3543] bg-[#050f16] px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={saveKey}
            className="rounded-xl bg-[#00e5ff] px-4 py-2 text-xs font-bold text-[#03131b]"
          >
            OPEN ADMIN REVIEW
          </button>
          <div className="text-[10px] text-[#6e8996]">
            The key is kept in sessionStorage only and is not written into frontend source.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-[#688895]">PB124-OLEA-2026 · Research Admin</div>
          <h2 className="mt-1 text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#72e0b5]" />
            <span>Method Review · Evidence Intelligence</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-1">
            Private review surface with exact GNSS, evidence hashes and route context. Not a public vessel tracker.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refreshLocalArchive()}
            className="flex items-center gap-2 rounded-xl border border-[#315f4c] px-3 py-2 text-xs text-[#72e0b5]"
          >
            <RefreshCw className={`w-4 h-4 ${localArchiveBusy ? 'animate-spin' : ''}`} />
            Refresh local device
          </button>
          <button
            type="button"
            onClick={() => void loadQueue()}
            className="flex items-center gap-2 rounded-xl border border-[#1d3d52] px-3 py-2 text-xs text-[#00e5ff]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh API archive
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-[#7f3232] bg-[#3a1717] p-3 text-xs text-[#ff9c9c]">{error}</div>}
      {feedback && <div className="rounded-xl border border-[#245442] bg-[#0d2b20] p-3 text-xs text-[#72e0b5]">{feedback}</div>}

      <PB124VoyageTimeline
        variant="review"
        observationCount={queue.length}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          ['REAL RECORDS', queue.length],
          ['ACCEPTED FOR METHOD', queue.filter((o) => o.field_status === 'ACCEPTED_FOR_METHOD_TEST').length],
          ['METHOD REVIEWED', queue.filter((o) => o.field_status === 'PILOT_METHOD_REVIEWED').length],
          ['PENDING / FIELD', queue.filter((o) => !['ACCEPTED_FOR_METHOD_TEST', 'PILOT_METHOD_REVIEWED', 'EXCLUDED_FROM_METHOD_TEST'].includes(o.field_status)).length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-[#183140] bg-[#071722] p-3">
            <div className="text-[8px] uppercase tracking-[0.13em] text-[#668693]">{label}</div>
            <div className="mt-1 text-sm font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-3xl border border-[#315f4c] bg-gradient-to-br from-[#071a17] via-[#071722] to-[#06131c] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#72e0b5]">
              LOCAL DEVICE ARCHIVE · PRIVATE
            </div>
            <h3 className="mt-1 text-base font-bold text-white">This browser's PB124 observations and original photos</h3>
            <p className="mt-1 max-w-3xl text-[10px] leading-relaxed text-[#8faab5]">
              IndexedDB on this device only. It does not query Supabase or prove that another phone's data is absent.
              Cloud confirmation is shown only when a matching relay receipt and original SHA-256 are stored.
            </p>
          </div>
          <button
            type="button"
            onClick={exportLocalInventory}
            className="rounded-xl border border-[#315f4c] px-3 py-2 text-[10px] font-bold text-[#72e0b5]"
          >
            Export local metadata (JSON)
          </button>
        </div>

        {localArchiveError && (
          <div role="alert" className="rounded-xl border border-[#7f3232] bg-[#3a1717] p-3 text-[10px] text-[#ffb0b0]">
            Local archive read or photo inspection failed. Existing rows are retained as last-known data. {localArchiveError}
          </div>
        )}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
          {[
            ['LOCAL OBSERVATIONS', localObservations.length],
            ['PENDING / FAILED ITEMS', localPendingCount],
            ['VERIFIED CLOUD RECEIPTS', localCloudConfirmedCount + localMedia.filter((item) => getPB124LocalMediaStatus(item) === 'CLOUD_CONFIRMED').length],
            ['UNLINKED PHOTO DRAFTS', localDrafts.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-[#183140] bg-[#050f16] p-3">
              <div className="text-[8px] uppercase tracking-[0.12em] text-[#6f919d]">{label}</div>
              <div className="mt-1 text-sm font-black text-white">{value}</div>
            </div>
          ))}
        </div>
        {localIncompleteCount > 0 && (
          <div className="rounded-xl border border-[#7f3232] bg-[#3a1717] p-3 text-[10px] text-[#ffb0b0]">
            {localIncompleteCount} newly guided capture(s) are missing one or more required photo labels. Do not treat them as complete.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-[#183140] bg-[#050f16]">
              {localMapPoints.length > 0 ? (
                <PB124RouteMap
                  variant="review"
                  selectedPosition={selectedLocalPosition}
                  observationPoints={localMapPoints}
                  selectedObservationId={selectedLocalId}
                  onObservationSelect={setSelectedLocalId}
                />
              ) : (
                <div className="p-6 text-center text-[10px] text-[#8faab5]">
                  {localArchiveError
                    ? 'Local points unavailable because the device archive could not be read.'
                    : 'No PB124 points are stored in this browser. This is not a cloud or other-device count.'}
                </div>
              )}
            </div>
            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {localObservations.length === 0 && !localArchiveError && (
                <div className="rounded-xl border border-[#183140] bg-[#050f16] p-4 text-[10px] text-[#8faab5]">
                  No local observation rows found for {EXPEDITION_ID}.
                </div>
              )}
              {localObservations.map((item) => {
                const linkedMedia = localMedia.filter((mediaItem) => mediaItem.observation_id === item.id);
                const status = getPB124LocalObservationStatus(item, linkedMedia);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLocalId(item.id)}
                    className={`w-full rounded-xl border p-3 text-left ${
                      selectedLocalId === item.id
                        ? 'border-[#00e5ff] bg-[#0b2436]'
                        : 'border-[#183140] bg-[#050f16]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-[#4de3ff]">{item.id}</span>
                      <span className={`text-[9px] font-bold ${localStatusClass(status)}`}>{status}</span>
                    </div>
                    <div className="mt-1 text-[9px] text-[#8faab5]">
                      {item.timestamp} · {linkedMedia.length} linked photo(s)
                    </div>
                    <div className="mt-1 text-[9px] text-[#6e8996]">
                      {item.payload?.latitude ?? '—'}, {item.payload?.longitude ?? '—'} · ±{item.payload?.accuracy_m ?? '—'} m
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {!selectedLocalObservation ? (
              <div className="rounded-2xl border border-[#183140] bg-[#050f16] p-5 text-[10px] text-[#8faab5]">
                Select a local observation to inspect its location, synchronization receipts and attached photos.
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl border border-[#183140] bg-[#050f16] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px] font-bold text-white">LOCAL OBSERVATION · {selectedLocalObservation.id}</div>
                  <div className={`text-[9px] font-bold ${
                    localStatusClass(getPB124LocalObservationStatus(selectedLocalObservation, selectedLocalMedia))
                  }`}>
                    {getPB124LocalObservationStatus(selectedLocalObservation, selectedLocalMedia)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div className="rounded-lg bg-[#081724] p-2 text-[#b8d2de]">
                    UTC {selectedLocalObservation.timestamp}
                  </div>
                  <div className="rounded-lg bg-[#081724] p-2 text-[#b8d2de]">
                    {selectedLocalObservation.payload?.latitude ?? '—'}, {selectedLocalObservation.payload?.longitude ?? '—'}
                    {' '}· ±{selectedLocalObservation.payload?.accuracy_m ?? '—'} m
                  </div>
                  <div className="rounded-lg bg-[#081724] p-2 text-[#8faab5]">
                    Destination: {selectedLocalObservation.sync_destination || 'NOT CONFIRMED'}
                  </div>
                  <div className="rounded-lg bg-[#081724] p-2 break-all text-[#8faab5]">
                    Receipt: {selectedLocalObservation.receipt_id || 'NONE'}
                  </div>
                </div>
                {selectedLocalObservation.last_error && (
                  <div className="rounded-lg border border-[#7f3232] bg-[#3a1717] p-2 text-[9px] text-[#ffb0b0]">
                    {selectedLocalObservation.last_error}
                  </div>
                )}
                <div className="max-h-40 overflow-auto rounded-lg bg-[#081724] p-2">
                  <div className="mb-1 text-[8px] uppercase tracking-[0.12em] text-[#6f919d]">Field metadata</div>
                  <pre className="whitespace-pre-wrap break-words text-[9px] text-[#b8d2de]">
                    {JSON.stringify(selectedLocalObservation.payload?.field_payload || {}, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8faab5]">
                    Local original media ({selectedLocalMedia.length})
                  </div>
                  {selectedLocalMedia.length === 0 && (
                    <div className="text-[9px] text-[#6e8996]">No linked original media in this browser store.</div>
                  )}
                  {selectedLocalMedia.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#183140] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[9px] font-bold text-[#4de3ff]">{item.capture_label}</span>
                        <span className={`text-[9px] font-bold ${localStatusClass(getPB124LocalMediaStatus(item))}`}>
                          {getPB124LocalMediaStatus(item)}
                        </span>
                      </div>
                      <div className="mt-1 break-all text-[9px] text-[#8faab5]">
                        {item.original_name} · {item.byte_size} bytes · {item.created_at}
                      </div>
                      <div className="mt-1 break-all text-[8px] text-[#6e8996]">
                        SHA-256 {item.sha256_original}
                      </div>
                      {item.receipt_id && (
                        <div className="mt-1 break-all text-[8px] text-[#72e0b5]">
                          Receipt {item.receipt_id} · verified hash {item.verified_sha256 || 'NOT STORED'}
                        </div>
                      )}
                      {item.last_error && (
                        <div className="mt-1 text-[8px] text-[#ff9c9c]">{item.last_error}</div>
                      )}
                      <button
                        type="button"
                        onClick={() => void openLocalMedia(item.id)}
                        className="mt-2 rounded-lg border border-[#1d3d52] px-2 py-1 text-[8px] text-[#4de3ff]"
                      >
                        Verify hash and inspect local original
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-[#183140] bg-[#050f16] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-white">
                <ImageIcon className="h-4 w-4 text-[#00e5ff]" />
                Unlinked original-photo drafts ({localDrafts.length})
              </div>
              <div className="mt-2 max-h-48 space-y-2 overflow-auto">
                {localDrafts.length === 0 && (
                  <div className="text-[9px] text-[#6e8996]">No unlinked draft photos in this browser vault.</div>
                )}
                {localDrafts.map((draft) => (
                  <div key={draft.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#183140] p-2">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold text-[#4de3ff]">
                        {draft.label} · {draft.name}
                      </div>
                      <div className="text-[8px] text-[#6e8996]">
                        {draft.byteSize} bytes · {draft.savedAt} · draft {draft.draftId.slice(0, 8)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void openLocalDraft(draft.id)}
                      className="rounded-lg border border-[#1d3d52] px-2 py-1 text-[8px] text-[#4de3ff]"
                    >
                      Inspect draft
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {localPhoto && (
          <div className="rounded-2xl border border-[#315f4c] bg-[#050f16] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[10px] font-bold text-white">{localPhoto.name}</div>
              <div className="text-[8px] font-bold text-[#72e0b5]">{localPhoto.integrity}</div>
            </div>
            <div className="mt-1 break-all text-[8px] text-[#8faab5]">Computed SHA-256 {localPhoto.digest}</div>
            <img src={localPhoto.url} alt={`Private local original ${localPhoto.name}`} className="mt-3 max-h-[60vh] w-full object-contain" />
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[10px] uppercase font-bold text-[#8faab5]">Real PB124 records ({queue.length})</div>
          {queue.length === 0 && (
            <div className="p-5 rounded-2xl border border-[#183140] bg-[#081724] text-xs text-[#8faab5]">
              No synchronized PB124 observation exists yet. Nothing is auto-generated.
            </div>
          )}
          {queue.map((obs) => (
            <button
              key={obs.observation_id}
              type="button"
              onClick={() => setSelectedId(obs.observation_id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedId === obs.observation_id ? 'bg-[#0b2436] border-[#00e5ff]' : 'bg-[#081724] border-[#183140]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#00e5ff]">REAL FIELD RECORD</span>
                <span className={`text-[10px] font-bold ${statusClass(obs.field_status)}`}>{obs.field_status}</span>
              </div>
              <div className="text-xs text-white mt-2">{new Date(obs.utc).toLocaleString()}</div>
              <div className="text-[10px] text-[#8faab5] mt-1">
                ±{obs.accuracy_m == null ? '—' : Math.round(obs.accuracy_m)} m · {obs.observation_id.slice(0, 8)}…
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 space-y-4">
          {!detail ? (
            <div className="p-8 rounded-3xl border border-[#1b3543] bg-[#081724] text-center text-xs text-[#8faab5]">
              Select a synchronized observation.
            </div>
          ) : (
            <>
              <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-[#72e0b5]">OBSERVATION {detail.observation_id}</div>
                    <div className="text-sm font-bold text-white mt-1">{detail.observation_type}</div>
                  </div>
                  <div className={`text-xs font-bold ${statusClass(detail.field_status)}`}>{detail.field_status}</div>
                </div>

                <PB124RouteMap
                  variant="review"
                  selectedPosition={{
                    lat: detail.latitude,
                    lng: detail.longitude,
                    accuracy: detail.accuracy_m,
                    status: detail.field_status,
                  }}
                  observationPoints={queue.map((obs) => ({
                    observationId: obs.observation_id,
                    lat: obs.latitude,
                    lng: obs.longitude,
                    utc: obs.utc,
                    accuracy: obs.accuracy_m,
                    status: obs.field_status,
                    label: obs.observation_id.slice(0, 8),
                  }))}
                  selectedObservationId={selectedId}
                  onObservationSelect={setSelectedId}
                />

                {queue.length > 0 && (
                  <div className="rounded-2xl border border-[#183140] bg-[#050f16] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6f919d]">
                          Map-linked real observations
                        </div>
                        <div className="mt-1 text-[10px] text-[#8faab5]">
                          Click a card or an OBS marker to inspect the same record.
                        </div>
                      </div>
                      <div className="rounded-full border border-[#315747] bg-[#0a2119] px-2.5 py-1 text-[8px] font-bold text-[#72e0b5]">
                        {queue.length} RECORDS
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {queue.map((obs) => (
                        <button
                          key={`map-card-${obs.observation_id}`}
                          type="button"
                          onClick={() => setSelectedId(obs.observation_id)}
                          className={`w-[190px] flex-shrink-0 rounded-xl border p-3 text-left transition-all ${
                            selectedId === obs.observation_id
                              ? 'border-[#00d1ff] bg-[#0b2436]'
                              : 'border-[#183140] bg-[#071722] hover:border-[#2a5669]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] font-bold text-[#4de3ff]">
                              {obs.observation_id.slice(0, 8)}
                            </span>
                            <span className={`text-[8px] font-bold ${statusClass(obs.field_status)}`}>
                              {obs.field_status.split('_').join(' ')}
                            </span>
                          </div>
                          <div className="mt-2 text-[9px] text-white">{new Date(obs.utc).toLocaleString()}</div>
                          <div className="mt-1 text-[8px] text-[#6f8d98]">
                            GNSS ±{obs.accuracy_m == null ? '—' : Math.round(obs.accuracy_m)} m
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-[#183140] bg-[#050f16] p-3">
                    <div className="flex items-center gap-2 text-[#00e5ff] text-xs font-bold"><MapPin className="w-4 h-4" /> Device GNSS</div>
                    <div className="text-[11px] text-[#b8d2de] mt-2">{detail.latitude.toFixed(6)}, {detail.longitude.toFixed(6)}</div>
                    <div className="text-[10px] text-[#8faab5]">Accuracy ±{detail.accuracy_m ?? '—'} m</div>
                  </div>
                  <div className="rounded-2xl border border-[#183140] bg-[#050f16] p-3">
                    <div className="flex items-center gap-2 text-[#72e0b5] text-xs font-bold"><Database className="w-4 h-4" /> Provenance</div>
                    <div className="text-[10px] text-[#8faab5] mt-2 break-all">{detail.record_hash}</div>
                    <div className="text-[10px] text-[#8faab5] mt-1">vessel_system_access = {String(detail.provenance?.vessel_system_access ?? false)}</div>
                  </div>
                  <div className="rounded-2xl border border-[#183140] bg-[#050f16] p-3">
                    <div className="flex items-center gap-2 text-[#f0b35a] text-xs font-bold"><AlertTriangle className="w-4 h-4" /> Post-hoc corroboration</div>
                    <div className="text-[10px] text-[#8faab5] mt-2">AIS: NOT RUN<br />Satellite: NOT RUN</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#183140] bg-[#050f16] p-3">
                  <div className="text-[10px] uppercase font-bold text-[#8faab5]">Field payload</div>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[10px] text-[#b8d2de]">{JSON.stringify(detail.field_payload || {}, null, 2)}</pre>
                </div>

                <div className="rounded-2xl border border-[#183140] bg-[#050f16] p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ImageIcon className="w-4 h-4 text-[#00e5ff]" /> Evidence media ({media.length})
                  </div>
                  <div className="space-y-2 mt-3">
                    {media.length === 0 && <div className="text-[10px] text-[#8faab5]">No photo evidence attached.</div>}
                    {media.map((m) => (
                      <div key={m.media_id} className="rounded-xl border border-[#142836] p-3">
                        <div className="flex justify-between gap-2">
                          <span className="text-[11px] font-bold text-[#00e5ff]">{m.capture_label}</span>
                          <span className="text-[10px] text-[#8faab5]">{m.sync_status}</span>
                        </div>
                        <div className="mt-1 text-[10px] text-[#8faab5] break-all">SHA-256 {m.sha256_original}</div>
                        <div className="mt-1 text-[10px] text-[#6e8996]">{m.original_name} · {m.byte_size} bytes</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* PB124_PRIVATE_EVIDENCE_VIEWER_V4B */}
              <div className="rounded-3xl border border-[#1a4350] bg-[#06131c] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <ImageIcon className="w-4 h-4 text-[#00e5ff]" />
                      Private evidence inspection ({media.length})
                    </div>
                    <div className="mt-1 text-[9px] text-[#8faab5]">
                      Researcher-only image bytes · EXIF · OLEA metadata · integrity hashes
                    </div>
                  </div>
                  <div className="rounded-full border border-[#315f4c] bg-[#0b251c] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#72e0b5]">
                    PRIVATE
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {media.length === 0 && (
                    <div className="text-[10px] text-[#8faab5]">No photo evidence attached.</div>
                  )}

                  {media.map((m) => (
                    <div key={`private-${m.media_id}`} className="overflow-hidden rounded-2xl border border-[#173341] bg-[#050f16]">
                      <div className="relative aspect-[4/3] bg-black/40">
                        {pb124MediaUrls[m.media_id] ? (
                          <a href={pb124MediaUrls[m.media_id]} target="_blank" rel="noreferrer">
                            <img
                              src={pb124MediaUrls[m.media_id]}
                              alt={`${m.capture_label} PB124 evidence`}
                              className="h-full w-full object-contain"
                            />
                          </a>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-[10px] text-[#6e8996]">
                            {pb124MediaErrors[m.media_id]
                              ? `Image unavailable: ${pb124MediaErrors[m.media_id]}`
                              : 'Loading private evidence preview…'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="text-[11px] font-bold text-[#00e5ff]">{m.capture_label}</div>
                            <div className="mt-0.5 break-all text-[8px] text-[#6e8996]">{m.media_id}</div>
                          </div>
                          <div className="text-[9px] text-[#72e0b5]">{m.sync_status}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px]">
                          <div className="rounded-xl border border-[#142836] bg-[#07131b] p-2">
                            <div className="font-bold uppercase tracking-[0.1em] text-[#6e8996]">File</div>
                            <div className="mt-1 break-all text-[#b8d2de]">{m.original_name}</div>
                            <div className="text-[#8faab5]">
                              {m.mime_type} · {Number(m.byte_size || 0).toLocaleString()} bytes
                            </div>
                            <div className="text-[#6e8996]">{m.created_at}</div>
                          </div>

                          <div className="rounded-xl border border-[#142836] bg-[#07131b] p-2">
                            <div className="font-bold uppercase tracking-[0.1em] text-[#6e8996]">Capture</div>
                            <div className="mt-1 text-[#b8d2de]">{m.capture_label}</div>
                            <div className="text-[#8faab5]">Status: {m.sync_status}</div>
                          </div>
                        </div>


                        {/* PB124_CAPTURE_PROVENANCE_UI_V6 */}
                        {(() => {
                          const p = pb124CaptureProvenance(m);
                          const highEntropy = (p.clientDeviceContext.ua_high_entropy || {}) as Record<string, unknown>;
                          const browserModel = highEntropy.model;
                          return (
                            <div className="rounded-xl border border-[#295265] bg-[#071722] p-3 text-[9px]">
                              <div className="font-bold uppercase tracking-[0.12em] text-[#4de3ff]">
                                Capture provenance · location + equipment
                              </div>

                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="rounded-lg border border-[#173341] bg-[#050f16] p-2">
                                  <div className="font-bold text-[#72e0b5]">LOCATION</div>
                                  <div className="mt-1 text-[#d5e9ee]">Lat: {pb124Text(p.latitude)}</div>
                                  <div className="text-[#d5e9ee]">Lon: {pb124Text(p.longitude)}</div>
                                  <div className="text-[#9bb5be]">Accuracy: {pb124Text(p.accuracy)} m</div>
                                  <div className="text-[#9bb5be]">Altitude: {pb124Text(p.altitude)} m</div>
                                  <div className="text-[#9bb5be]">Source: {pb124Text(p.locationSource)}</div>
                                  <div className="mt-1 break-all text-[#6e8996]">{pb124Text(p.positionTimestamp)}</div>
                                </div>

                                <div className="rounded-lg border border-[#173341] bg-[#050f16] p-2">
                                  <div className="font-bold text-[#f0b35a]">CAMERA / DEVICE</div>
                                  <div className="mt-1 text-[#d5e9ee]">Make: {pb124Text(p.make)}</div>
                                  <div className="text-[#d5e9ee]">Model: {pb124Text(p.model)}</div>
                                  <div className="text-[#9bb5be]">Lens make: {pb124Text(p.lensMake)}</div>
                                  <div className="text-[#9bb5be]">Lens model: {pb124Text(p.lensModel)}</div>
                                  <div className="text-[#9bb5be]">Focal length: {pb124Text(p.focalLength)} mm</div>
                                  <div className="text-[#9bb5be]">35 mm equivalent: {pb124Text(p.focal35)} mm</div>
                                  <div className="mt-1 text-[#6e8996]">Status: {pb124Text(p.equipmentStatus)}</div>
                                </div>

                                <div className="rounded-lg border border-[#173341] bg-[#050f16] p-2">
                                  <div className="font-bold text-[#9bb5be]">EXPOSURE</div>
                                  <div className="mt-1">Aperture: f/{pb124Text(p.aperture)}</div>
                                  <div>Exposure: {pb124Text(p.exposure)} s</div>
                                  <div>ISO: {pb124Text(p.iso)}</div>
                                  <div>Captured: {pb124Text(p.dateOriginal)}</div>
                                  <div>Software: {pb124Text(p.software)}</div>
                                </div>

                                <div className="rounded-lg border border-[#173341] bg-[#050f16] p-2">
                                  <div className="font-bold text-[#9bb5be]">PHONE / WEB CONTEXT</div>
                                  <div className="mt-1">AMOH device ID: {pb124Text(p.deviceId)}</div>
                                  <div>Browser model hint: {pb124Text(browserModel)}</div>
                                  <div>Platform: {pb124Text(p.clientDeviceContext.ua_data_platform ?? p.clientDeviceContext.navigator_platform)}</div>
                                  <div>Capture camera requested: {pb124Text(p.clientDeviceContext.camera_facing_requested)}</div>
                                </div>
                              </div>

                              <div className="mt-2 rounded-lg border border-[#493f24] bg-[#171308] p-2 text-[#c9b780]">
                                Exact camera model and lens are shown only when embedded in the original photo EXIF.
                                If the browser removed those tags, AMOH marks them as not embedded instead of guessing.
                              </div>
                            </div>
                          );
                        })()}

                        <div className="rounded-xl border border-[#142836] bg-[#07131b] p-2 text-[9px]">
                          <div className="font-bold uppercase tracking-[0.1em] text-[#8faab5]">Integrity hashes</div>
                          <div className="mt-1 break-all text-[#b8d2de]">Original: {m.sha256_original}</div>
                          <div className="mt-1 break-all text-[#8faab5]">Preview: {m.sha256_preview || '—'}</div>
                          <div className="mt-1 break-all text-[#8faab5]">Thumbnail: {m.sha256_thumbnail || '—'}</div>
                        </div>

                        <details className="rounded-xl border border-[#142836] bg-[#07131b] p-2">
                          <summary className="cursor-pointer text-[9px] font-bold uppercase tracking-[0.1em] text-[#f0b35a]">
                            EXIF / camera metadata
                          </summary>
                          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[9px] text-[#b8d2de]">
                            {JSON.stringify(m.exif || {}, null, 2)}
                          </pre>
                        </details>

                        <details open className="rounded-xl border border-[#142836] bg-[#07131b] p-2">
                          <summary className="cursor-pointer text-[9px] font-bold uppercase tracking-[0.1em] text-[#72e0b5]">
                            OLEA app metadata
                          </summary>
                          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words text-[9px] text-[#b8d2de]">
                            {JSON.stringify(m.app_metadata || {}, null, 2)}
                          </pre>
                        </details>

                        <button
                          type="button"
                          onClick={() => void pb124OpenOriginal(m)}
                          className="w-full rounded-xl border border-[#00e5ff]/40 bg-[#00e5ff]/10 px-3 py-2 text-[10px] font-bold text-[#00e5ff]"
                        >
                          OPEN ORIGINAL EVIDENCE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
                <div>
                  <div className="text-xs font-bold text-white">Human method decision</div>
                  <div className="text-[10px] text-[#8faab5] mt-1">
                    Observation is not causation. Acceptance means accepted for the method test, not validated science.
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Required review note / rationale…"
                  className="w-full rounded-xl border border-[#183140] bg-[#050f16] p-3 text-xs text-white"
                />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void decide('PILOT_METHOD_REVIEWED')} className="rounded-xl border border-[#00e5ff]/40 bg-[#00e5ff]/10 px-3 py-2 text-xs font-bold text-[#00e5ff]">METHOD REVIEWED</button>
                  <button type="button" onClick={() => void decide('ACCEPTED_FOR_METHOD_TEST')} className="rounded-xl border border-[#72e0b5]/40 bg-[#72e0b5]/10 px-3 py-2 text-xs font-bold text-[#72e0b5]">ACCEPT FOR METHOD TEST</button>
                  <button type="button" onClick={() => void decide('EXCLUDED_FROM_METHOD_TEST')} className="rounded-xl border border-[#ef7777]/40 bg-[#ef7777]/10 px-3 py-2 text-xs font-bold text-[#ef7777]">EXCLUDE</button>
                </div>

                <div className="border-t border-[#142836] pt-3">
                  <div className="text-[10px] uppercase font-bold text-[#8faab5]">Review history ({reviews.length})</div>
                  <div className="space-y-2 mt-2">
                    {reviews.length === 0 && <div className="text-[10px] text-[#6e8996]">No review decisions yet.</div>}
                    {reviews.map((r) => (
                      <div key={r.review_id} className="rounded-xl border border-[#142836] p-3">
                        <div className={`text-[10px] font-bold ${statusClass(r.decision)}`}>{r.decision}</div>
                        <div className="text-[10px] text-[#b8d2de] mt-1">{r.reason || 'No reason recorded'}</div>
                        <div className="text-[9px] text-[#6e8996] mt-1">{r.created_at} · {r.reviewer_id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-[10px] text-[#6e8996] flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5" />
        PB124 review data are sourced from the live AMOH database, not expedition seed records.
      </div>
    </div>
  );
}
