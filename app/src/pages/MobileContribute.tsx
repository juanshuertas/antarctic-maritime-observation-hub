import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import { offlineStore, type ObservationSyncStatus } from '../lib/offline-store';
import { mediaStore, prepareGuidedMedia, type PendingMediaRecord } from '../lib/pb124-media';
import PB124GuidedPhotos, { type GuidedPhotoSelection } from '../components/PB124GuidedPhotos';
import { evaluatePB124Opportunity, registerPB124Capture, type PB124Opportunity } from '../lib/pb124-opportunity';
import PB124RouteMap from '../expeditions/PB124RouteMap';
import PB124VoyageTimeline from '../expeditions/PB124VoyageTimeline';
import {
  capturePB124AccessTokenFromUrl,
  hasPB124AccessToken,
  isPB124CloudRelayEnabled,
  pingPB124CloudRelay,
  postPB124CloudMedia,
  postPB124CloudObservation,
} from '../lib/pb124-cloud-relay';

type FieldPosition = {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestampUtc: string;
};

const GENERIC_TYPES = ['wildlife', 'vessel_sighting', 'ice_condition', 'pollution', 'weather', 'other'];
const PB124_VISIBILITY = ['excellent', 'good', 'moderate haze', 'poor', 'fog', 'precipitation-obscured', 'horizon not visible', 'uncertain'];
const PB124_SEA_STATE = ['calm / glassy', 'ripples', 'small waves', 'moderate waves', 'rough', 'very rough', 'uncertain'];
const PB124_WHITECAPS = ['none', 'few', 'frequent', 'extensive', 'uncertain'];
const PB124_SURFACE = ['uniform', 'visible colour difference', 'foam', 'slick-like appearance', 'natural floating material', 'possible anthropogenic floating material', 'turbid appearance', 'other', 'uncertain'];
const PB124_SKY = ['clear', 'mostly clear', 'partly cloudy', 'mostly cloudy', 'overcast', 'fog', 'uncertain'];
const PB124_CONTEXT = ['open ocean', 'distant coast', 'coastal transit', 'approaching port', 'in port', 'departing port', 'anchored', 'uncertain'];
const PB124_WILDLIFE = ['none', 'seabirds', 'marine mammal', 'multiple', 'other', 'uncertain'];
const PB124_FLOATING = ['none', 'natural', 'possible anthropogenic', 'mixed', 'uncertain'];
// PB124_CAPTURE_COMPLETENESS_V6_1
const REQUIRED_GUIDED_PHOTO_LABELS = ['HORIZON', 'SEA_SURFACE', 'CONTEXT'] as const;

function stableDeviceId(): string {
  const key = 'amoh_device_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

function SelectField({ label, value, values, onChange }: {
  label: string;
  value: string;
  values: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 rounded-2xl border border-[#183140] bg-[#071722] p-3 text-xs">
      <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#7f9aa5]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[#214557] bg-[#06131c] px-3 py-2.5 text-xs text-white outline-none transition focus:border-[#00d1ff]"
      >
        {values.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  );
}


// PB124_CAPTURE_DEVICE_CONTEXT_V6
async function collectPB124ClientDeviceContext(): Promise<Record<string, unknown>> {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    userAgentData?: {
      mobile?: boolean;
      platform?: string;
      brands?: Array<{ brand: string; version: string }>;
      getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
    };
  };

  let highEntropy: Record<string, unknown> = {};
  try {
    if (nav.userAgentData?.getHighEntropyValues) {
      highEntropy = await nav.userAgentData.getHighEntropyValues([
        'model',
        'platform',
        'platformVersion',
        'architecture',
        'bitness',
        'fullVersionList',
      ]);
    }
  } catch {
    highEntropy = {};
  }

  return {
    metadata_schema_version: 'PB124_CAPTURE_PROVENANCE_V6',
    captured_private_research_metadata: true,
    user_agent: nav.userAgent || null,
    navigator_platform: nav.platform || null,
    language: nav.language || null,
    languages: Array.isArray(nav.languages) ? nav.languages : [],
    max_touch_points: nav.maxTouchPoints ?? null,
    hardware_concurrency: nav.hardwareConcurrency ?? null,
    device_memory_gb: nav.deviceMemory ?? null,
    screen_css_width: window.screen?.width ?? null,
    screen_css_height: window.screen?.height ?? null,
    device_pixel_ratio: window.devicePixelRatio ?? null,
    ua_data_mobile: nav.userAgentData?.mobile ?? null,
    ua_data_platform: nav.userAgentData?.platform ?? null,
    ua_data_brands: nav.userAgentData?.brands ?? [],
    ua_high_entropy: highEntropy,
    camera_facing_requested: 'environment',
    capture_input: 'html_file_input_capture_environment',
    exact_camera_and_lens_source: 'embedded_original_file_exif_when_available',
  };
}

export default function MobileContribute() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get('token');
  const pb124PublicMode = import.meta.env.VITE_PB124_PUBLIC_MODE === '1';
  const routeIsPB124 = window.location.pathname.replace(/\/+$/, '').endsWith('/peaceboat');
  const requestedExpedition = pb124PublicMode
    ? 'PB124-OLEA-2026'
    : (params.get('expedition') || (routeIsPB124 ? 'PB124-OLEA-2026' : ''));
  const isPB124 = requestedExpedition === 'PB124-OLEA-2026';
  const usePB124CloudRelay = isPB124 && isPB124CloudRelayEnabled();

  const participantKey = requestedExpedition ? `amoh_participant_id:${requestedExpedition}` : 'amoh_participant_id';
  const sessionKey = requestedExpedition ? `amoh_session_token:${requestedExpedition}` : 'amoh_session_token';

  const [step, setStep] = useState<'landing' | 'join' | 'consent' | 'form'>('landing');
  const [participantId, setParticipantId] = useState<string | null>(
    localStorage.getItem(participantKey) || (!requestedExpedition ? localStorage.getItem('amoh_participant_id') : null),
  );
  const [, setSessionToken] = useState<string | null>(localStorage.getItem(sessionKey));

  const [fieldMode, setFieldMode] = useState(false);
  const [coords, setCoords] = useState<FieldPosition | null>(null);
  const [geoState, setGeoState] = useState<'SUPPORTED_NOT_AUTHORIZED' | 'SUPPORTED_ACTIVE' | 'SUPPORTED_NO_READING' | 'NOT_SUPPORTED'>(
    'geolocation' in navigator ? 'SUPPORTED_NOT_AUTHORIZED' : 'NOT_SUPPORTED',
  );
  const [geoError, setGeoError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const syncingRef = useRef(false);

  const [genericType, setGenericType] = useState(GENERIC_TYPES[0]);
  const [visibility, setVisibility] = useState(PB124_VISIBILITY[1]);
  const [seaState, setSeaState] = useState(PB124_SEA_STATE[1]);
  const [whitecaps, setWhitecaps] = useState(PB124_WHITECAPS[0]);
  const [surface, setSurface] = useState(PB124_SURFACE[0]);
  const [sky, setSky] = useState(PB124_SKY[1]);
  const [context, setContext] = useState(PB124_CONTEXT[0]);
  const [wildlife, setWildlife] = useState(PB124_WILDLIFE[0]);
  const [floating, setFloating] = useState(PB124_FLOATING[0]);
  const [notes, setNotes] = useState('');
  const [guidedPhotos, setGuidedPhotos] = useState<GuidedPhotoSelection[]>([]);
  const submitLockRef = useRef(false);
  const [submittingObservation, setSubmittingObservation] = useState(false);
  const guidedPhotoComplete = useMemo(() => {
    const labels = new Set(guidedPhotos.map((item) => item.label));
    return REQUIRED_GUIDED_PHOTO_LABELS.every((label) => labels.has(label));
  }, [guidedPhotos]);

  const [pseudonym, setPseudonym] = useState(isPB124 ? 'Meri Joyce' : '');
  const [consentScope, setConsentScope] = useState('private');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingMediaCount, setPendingMediaCount] = useState(0);
  const [lastSyncStatus, setLastSyncStatus] = useState<ObservationSyncStatus | null>(null);
  const [opportunity, setOpportunity] = useState<PB124Opportunity | null>(null);
  const [promptPauseUntil, setPromptPauseUntil] = useState<number | null>(() => {
    const raw = localStorage.getItem('pb124_prompt_pause_until');
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > Date.now() ? parsed : null;
  });
  const [promptDismissed, setPromptDismissed] = useState(false);
  const deviceId = useMemo(() => stableDeviceId(), []);
  const [cloudAccessReady, setCloudAccessReady] = useState(() => !usePB124CloudRelay || hasPB124AccessToken());
  const [cloudRelayState, setCloudRelayState] = useState<'LOCAL_ONLY' | 'READY' | 'UNREACHABLE'>(
    usePB124CloudRelay ? 'UNREACHABLE' : 'LOCAL_ONLY',
  );

  useEffect(() => {
    if (!usePB124CloudRelay) return;
    const access = capturePB124AccessTokenFromUrl();
    setCloudAccessReady(Boolean(access));
    if (!access) {
      setCloudRelayState('UNREACHABLE');
      return;
    }
    if (navigator.onLine) {
      void pingPB124CloudRelay()
        .then(() => setCloudRelayState('READY'))
        .catch(() => setCloudRelayState('UNREACHABLE'));
    }
  }, [usePB124CloudRelay]);

  useEffect(() => {
    if (usePB124CloudRelay && !cloudAccessReady) {
      setStep('join');
      return;
    }
    if (participantId) setStep('form');
    else if (token || requestedExpedition) setStep('join');
    else setStep('landing');
  }, [participantId, token, requestedExpedition, usePB124CloudRelay, cloudAccessReady]);

  useEffect(() => () => {
    if (watchId.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
    }
  }, []);

  const refreshPending = async () => {
    try {
      const pending = await offlineStore.getPending(requestedExpedition || undefined);
      const pendingMedia = await mediaStore.getPending(requestedExpedition || undefined);
      setPendingCount(pending.length);
      setPendingMediaCount(pendingMedia.length);
    } catch {
      setPendingCount(0);
      setPendingMediaCount(0);
    }
  };

  const syncOneMedia = async (media: PendingMediaRecord) => {
    await mediaStore.markStatus(media.id, 'SYNCING');
    try {
      if (usePB124CloudRelay) {
        await postPB124CloudMedia(media);
      } else {
        const form = new FormData();
        form.append('media_id', media.id);
        form.append('participant_id', media.participant_id);
        form.append('capture_label', media.capture_label);
        form.append('client_sha256_original', media.sha256_original);
        if (media.sha256_preview) form.append('client_sha256_preview', media.sha256_preview);
        if (media.sha256_thumbnail) form.append('client_sha256_thumbnail', media.sha256_thumbnail);
        form.append('app_metadata_json', JSON.stringify(media.app_metadata));
        form.append('file', media.original, media.original_name);
        if (media.preview) form.append('preview', media.preview, `${media.id}-preview.jpg`);
        if (media.thumbnail) form.append('thumbnail', media.thumbnail, `${media.id}-thumbnail.jpg`);
        await api.postForm(`/api/observations/${media.observation_id}/media`, form);
      }
      await mediaStore.markStatus(media.id, 'SYNCED');
    } catch (e: any) {
      await mediaStore.markStatus(media.id, 'SYNC_ERROR', e?.message || 'media sync failed');
      throw e;
    }
  };

  const syncPendingMedia = async () => {
    const pendingMedia = await mediaStore.getPending(requestedExpedition || undefined);
    let failures = 0;

    for (const media of pendingMedia) {
      try {
        await syncOneMedia(media);
      } catch {
        failures += 1;
      }
    }

    if (failures > 0) {
      setLastSyncStatus('SYNC_ERROR');
    }
  };

  const syncPending = async () => {
    if (!navigator.onLine || syncingRef.current) return;
    const pending = await offlineStore.getPending(requestedExpedition || undefined);

    syncingRef.current = true;
    setSyncing(true);
    try {
      for (const item of pending) {
        try {
          await offlineStore.markStatus(item.id, 'SYNCING');
          setLastSyncStatus('SYNCING');
          const res = usePB124CloudRelay
            ? await postPB124CloudObservation(item.payload)
            : await api.post<{ observation_id: string; record_hash: string; idempotent?: boolean }>(
                '/api/observations',
                item.payload,
              );

          const mediaForObservation = await mediaStore.getPendingForObservation(item.id);
          for (const media of mediaForObservation) {
            await syncOneMedia(media);
          }
          await offlineStore.markStatus(item.id, 'SYNCED', { serverHash: res.record_hash });
          setLastSyncStatus('SYNCED');
        } catch (e: any) {
          await offlineStore.markStatus(item.id, 'SYNC_ERROR', { lastError: e?.message || 'sync failed' });
          setLastSyncStatus('SYNC_ERROR');
          break;
        }
      }
      await syncPendingMedia();
    } finally {
      syncingRef.current = false;
      setSyncing(false);
      await refreshPending();
    }
  };

  useEffect(() => {
    void refreshPending();
    void syncPending();
    const onOnline = () => {
      if (usePB124CloudRelay) {
        void pingPB124CloudRelay()
          .then(() => setCloudRelayState('READY'))
          .catch(() => setCloudRelayState('UNREACHABLE'));
      }
      void syncPending();
    };
    window.addEventListener('online', onOnline);
    const interval = window.setInterval(() => { void syncPending(); }, 30000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(interval);
    };
}, [requestedExpedition, usePB124CloudRelay]);

  useEffect(() => {
    if (!isPB124 || !fieldMode || !coords) {
      setOpportunity(null);
      return;
    }
    setOpportunity(evaluatePB124Opportunity({
      lat: coords.lat,
      lng: coords.lng,
      context,
      visibility,
    }));
  }, [isPB124, fieldMode, coords, context, visibility]);

  useEffect(() => {
    setPromptDismissed(false);
  }, [opportunity?.status, opportunity?.captureCount]);

  const snoozeOpportunity = () => {
    const until = Date.now() + 45 * 60 * 1000;
    localStorage.setItem('pb124_prompt_pause_until', String(until));
    setPromptPauseUntil(until);
    setPromptDismissed(false);
  };

  const dismissOpportunity = () => {
    setPromptDismissed(true);
  };

  const promptPaused = Boolean(promptPauseUntil && promptPauseUntil > Date.now());

  const startFieldMode = () => {
    setError(null);
    setGeoError(null);
    if (!('geolocation' in navigator)) {
      setGeoState('NOT_SUPPORTED');
      setError('Este dispositivo no soporta geolocalización.');
      return;
    }
    if (watchId.current != null) return;

    setFieldMode(true);
    setGeoState('SUPPORTED_NO_READING');
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          altitudeAccuracy: pos.coords.altitudeAccuracy,
          heading: Number.isFinite(pos.coords.heading) ? pos.coords.heading : null,
          speed: Number.isFinite(pos.coords.speed) ? pos.coords.speed : null,
          timestampUtc: new Date(pos.timestamp).toISOString(),
        });
        setGeoState('SUPPORTED_ACTIVE');
        setGeoError(null);
      },
      (err) => {
        setGeoState('SUPPORTED_NO_READING');
        setGeoError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  };

  const stopFieldMode = () => {
    if (watchId.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    watchId.current = null;
    setFieldMode(false);
    setCoords(null);
    setGeoState('SUPPORTED_NOT_AUTHORIZED');
  };

  const handleJoin = async () => {
    if (!token && !requestedExpedition) {
      setError('Token de invitación o expedición no encontrados.');
      return;
    }
    if (!pseudonym.trim()) {
      setError('Ingresa el nombre o seudónimo del participante.');
      return;
    }
    if (usePB124CloudRelay && !cloudAccessReady) {
      setError('Este dispositivo no tiene la credencial PB124. Abre el enlace original enviado para Meri.');
      return;
    }
    setError(null);

    if (usePB124CloudRelay) {
      const existing = localStorage.getItem(participantKey);
      const localParticipantId = existing || crypto.randomUUID();
      localStorage.setItem(participantKey, localParticipantId);
      localStorage.setItem('amoh_active_expedition_id', 'PB124-OLEA-2026');
      localStorage.setItem('pb124_participant_name', pseudonym.trim());
      setParticipantId(localParticipantId);
      setSessionToken('PB124_CLOUD_RELAY');
      setStep('consent');
      return;
    }

    try {
      const res = await api.post<{ participant_id: string; session_token: string; expedition_id: string }>(
        '/api/field/join',
        {
          token: token || 'GUEST_TOKEN',
          pseudonym: pseudonym.trim(),
          consent_version: '1.1',
          expedition_id: requestedExpedition || undefined,
        },
      );

      localStorage.setItem(`amoh_participant_id:${res.expedition_id}`, res.participant_id);
      localStorage.setItem(`amoh_session_token:${res.expedition_id}`, res.session_token);
      localStorage.setItem('amoh_active_expedition_id', res.expedition_id);
      setParticipantId(res.participant_id);
      setSessionToken(res.session_token);
      setStep('consent');
    } catch (e: any) {
      setError(e?.message || 'Error al unir la expedición.');
    }
  };

  const handleConsent = async () => {
    if (!participantId) return;
    setError(null);

    if (usePB124CloudRelay) {
      localStorage.setItem('pb124_consent_version', '1.1');
      localStorage.setItem('pb124_consent_at', new Date().toISOString());
      localStorage.setItem('pb124_consent_scope', 'private');
      setStep('form');
      return;
    }

    try {
      await api.post('/api/field/consent', {
        participant_id: participantId,
        permissions: { location: true, camera: isPB124 },
        scope: isPB124 ? 'private' : consentScope,
      });
      setStep('form');
    } catch (e: any) {
      setError(e?.message || 'Error al procesar el consentimiento.');
    }
  };

  const submit = async () => {
    if (!fieldMode) {
      setError('Activa Field Mode antes de capturar una observación.');
      return;
    }
    if (!coords) {
      setError('Esperando una lectura GNSS válida…');
      return;
    }
    if (!participantId || !requestedExpedition) {
      setError('Participante o expedición no definidos.');
      return;
    }

    if (isPB124 && !guidedPhotoComplete) {
      setError('Complete all 3 guided evidence photos before saving: Horizon, Sea Surface and Context.');
      return;
    }

    if (submitted) {
      setError('This capture is already saved. Use START NEW OBSERVATION before creating another record.');
      return;
    }

    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setSubmittingObservation(true);
    setError(null);
    const observationId = crypto.randomUUID();
    const now = new Date();
    const fieldPayload = isPB124
      ? {
          visibility_horizon: visibility,
          sea_state_visual: seaState,
          whitecaps,
          sea_surface_appearance: surface,
          sky_cloud: sky,
          observer_corrected_context: context,
          wildlife,
          floating_material: floating,
          notes: notes || null,
        }
      : { notes: notes || null };

    const payload = {
      observation_id: observationId,
      expedition_id: requestedExpedition,
      participant_id: participantId,
      participant_name: isPB124 ? (localStorage.getItem('pb124_participant_name') || pseudonym.trim() || 'Meri Joyce') : pseudonym.trim() || null,
      device_id: deviceId,
      observation_type: isPB124 ? 'pb124_shipboard_visual_observation' : genericType,
      utc: now.toISOString(),
      device_local_time: now.toString(),
      latitude: coords.lat,
      longitude: coords.lng,
      observer_latitude: coords.lat,
      observer_longitude: coords.lng,
      position_source: 'device_gnss',
      accuracy_m: coords.accuracy,
      altitude_m: coords.altitude,
      altitude_accuracy_m: coords.altitudeAccuracy,
      heading_deg: coords.heading,
      speed_mps: coords.speed,
      position_timestamp_utc: coords.timestampUtc,
      observer_type: isPB124 ? 'PILOT_COORDINATOR_FIELD_CONTRIBUTOR' : 'field_team',
      notes: notes || null,
      evidence_class: isPB124 ? 'PILOT_FIELD_OBSERVATION' : 'field',
      license: isPB124 ? 'PRIVATE_RESEARCH_PILOT' : 'CC-BY-4.0',
      source_name: isPB124 ? 'OLEA PB124 Field Connect' : 'AMOH Field Connect',
      field_status: isPB124 ? 'PILOT_FIELD_OBSERVATION' : 'UNREVIEWED',
      field_payload: fieldPayload,
      network_state_at_capture: navigator.onLine ? 'online' : 'offline',
      capture_method: isPB124 ? 'OLEA Field Connect Web PWA' : 'AMOH Field Connect',
      location_source: 'device_gnss',
      vessel_system_access: false,
      ship_equipment_installation: false,
      route_modified_for_observation: false,
    };

    await offlineStore.save(payload, observationId, requestedExpedition);

    try {
      const clientDeviceContext = isPB124
        ? await collectPB124ClientDeviceContext()
        : {};

      for (const selection of guidedPhotos) {
        const appMetadata = {
          observation_id: observationId,
          expedition_id: requestedExpedition,
          participant_id: participantId,
          device_id: deviceId,
          capture_label: selection.label,
          observed_at_utc: now.toISOString(),
          position_timestamp_utc: coords.timestampUtc,
          latitude: coords.lat,
          longitude: coords.lng,
          accuracy_m: coords.accuracy,
          altitude_m: coords.altitude,
          heading_deg: coords.heading,
          speed_mps: coords.speed,
          source_type: 'direct_shipboard_observation',
          capture_method: 'OLEA Field Connect Web PWA',
          location_source: 'device_gnss',
          vessel_system_access: false,
          ship_equipment_installation: false,
          route_modified_for_observation: false,
          photo_file: {
            original_name: selection.file.name || null,
            mime_type: selection.file.type || null,
            byte_size: selection.file.size,
            last_modified_utc: Number.isFinite(selection.file.lastModified)
              ? new Date(selection.file.lastModified).toISOString()
              : null,
          },
          client_device_context: clientDeviceContext,
          metadata_note: 'Exact camera make/model/lens are taken from original-file EXIF when the browser preserves those tags.',
        };
        const media = await prepareGuidedMedia({
          file: selection.file,
          observationId,
          expeditionId: requestedExpedition,
          participantId,
          label: selection.label,
          appMetadata,
        });
        await mediaStore.save(media);
        await mediaStore.markStatus(media.id, 'PENDING_SYNC');
      }
    } catch (e: any) {
      setSubmitted(observationId);
      setError(`Observation saved locally, but one photo could not be prepared: ${e?.message || 'unknown error'}`);
      await refreshPending();
      submitLockRef.current = false;
      setSubmittingObservation(false);
      return;
    }

    await offlineStore.markStatus(observationId, 'PENDING_SYNC');
    if (isPB124) {
      registerPB124Capture({
        lat: coords.lat,
        lng: coords.lng,
        context,
        visibility,
      });
      setOpportunity(evaluatePB124Opportunity({
        lat: coords.lat,
        lng: coords.lng,
        context,
        visibility,
      }));
    }
    setLastSyncStatus('PENDING_SYNC');
    setSubmitted(observationId);
    setNotes('');
    setGuidedPhotos([]);
    await refreshPending();

    try {
      if (navigator.onLine) {
        await syncPending();
      }
    } catch (e: any) {
      setError(e?.message || 'Cloud sync failed. The complete capture remains queued locally and will retry automatically.');
    } finally {
      submitLockRef.current = false;
      setSubmittingObservation(false);
    }
  };

  if (step === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center" style={{ background: 'var(--wod-bg-primary)', color: 'var(--wod-text-main)' }}>
        <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center border-2" style={{ borderColor: 'var(--wod-accent-cyan)', background: 'var(--wod-bg-surface)' }}>
          <span className="text-3xl">🌊</span>
        </div>
        <h1 className="text-2xl font-bold">OLEA Field Connect</h1>
        <p className="text-sm opacity-60 max-w-xs">Abre un enlace de expedición o escanea su QR para comenzar.</p>
      </div>
    );
  }

  if (step === 'join' && isPB124) {
    return (
      <div className="min-h-screen bg-[#020a10] text-white font-sans">
        <div className="mx-auto max-w-[1320px] p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8">
              <PB124RouteMap variant="overview" />
            </div>
            <div className="xl:col-span-4 rounded-[30px] border border-[#183140] bg-gradient-to-br from-[#071a24] to-[#041018] p-5 sm:p-6 flex flex-col justify-between gap-6">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#72e0b5]/30 bg-[#72e0b5]/10 px-2.5 py-1 text-[9px] font-bold text-[#72e0b5]">
                    REAL-VESSEL METHOD PILOT
                  </span>
                  <span className="rounded-full border border-[#00d1ff]/30 bg-[#00d1ff]/10 px-2.5 py-1 text-[9px] font-bold text-[#4de3ff]">
                    PB124-OLEA-2026
                  </span>
                </div>
                <div className="mt-5 text-[9px] uppercase tracking-[0.2em] text-[#648897]">OLEA Field Connect</div>
                <h1 className="mt-2 text-2xl font-bold leading-tight">Peace Boat 124th Global Voyage</h1>
                <p className="mt-3 text-xs leading-relaxed text-[#8faab5]">
                  Lightweight smartphone observations aboard Pacific World. No bridge feed, internal AIS,
                  NMEA or vessel telemetry is required.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block rounded-2xl border border-[#183140] bg-[#06131c] p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#718f9b]">Field contributor</span>
                  <input
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#214557] bg-[#041018] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00d1ff]"
                  />
                </label>

                <button
                  onClick={handleJoin}
                  className="w-full rounded-2xl bg-[#00d1ff] px-4 py-3.5 text-[11px] font-black tracking-[0.08em] text-[#021018] shadow-[0_0_30px_rgba(0,209,255,0.18)] transition hover:bg-[#4de3ff] active:scale-[0.99]"
                >
                  START FIELD PILOT
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ['OFFLINE', 'IndexedDB'],
                  ['GPS', 'Field Mode'],
                  ['EVIDENCE', '3 guided views'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#15303f] bg-[#041018] p-2.5">
                    <div className="text-[8px] font-bold text-[#4de3ff]">{label}</div>
                    <div className="mt-1 text-[8px] text-[#688895]">{value}</div>
                  </div>
                ))}
              </div>

              {usePB124CloudRelay && !cloudAccessReady && (
                <div className="rounded-xl border border-[#7a5b31] bg-[#2f2415] p-3 text-xs leading-relaxed text-[#ffd59a]">
                  Access credential missing. Re-open the original private PB124 link on this device.
                </div>
              )}
              {error && <div className="rounded-xl border border-[#7a3131] bg-[#2f1515] p-3 text-xs text-[#ffaaaa]">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'join') {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-6" style={{ background: 'var(--wod-bg-primary)', color: 'var(--wod-text-main)' }}>
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-mono opacity-60">{requestedExpedition || 'EXPEDITION'}</div>
          <h1 className="text-xl font-bold">{isPB124 ? 'Peace Boat 124th Global Voyage' : 'Unirse a la Expedición'}</h1>
          <p className="text-xs opacity-60">
            {isPB124
              ? 'OLEA methodological field-observation pilot aboard Pacific World. No vessel-system access is required.'
              : 'Ingresa un nombre o seudónimo para continuar.'}
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          {isPB124 ? 'Field contributor' : 'Nombre / seudónimo'}
          <input
            value={pseudonym}
            onChange={(e) => setPseudonym(e.target.value)}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: 'var(--wod-border-grid)', background: 'var(--wod-bg-surface)', color: 'var(--wod-text-main)' }}
          />
        </label>

        <button onClick={handleJoin} className="rounded-lg px-4 py-3 font-semibold active:scale-95" style={{ background: 'var(--wod-action)', color: 'var(--unwod-white)' }}>
          CONTINUE
        </button>
        {error && <div className="text-xs" style={{ color: 'var(--wod-status-alert)' }}>{error}</div>}
      </div>
    );
  }

  if (step === 'consent' && isPB124) {
    return (
      <div className="min-h-screen bg-[#020a10] text-white font-sans">
        <div className="mx-auto max-w-3xl p-4 sm:p-8">
          <div className="rounded-[30px] border border-[#183140] bg-gradient-to-br from-[#071a24] to-[#041018] p-5 sm:p-7">
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#648897]">PB124-OLEA-2026 · Field permissions</div>
            <h1 className="mt-2 text-2xl font-bold">Private-by-default field capture</h1>
            <p className="mt-2 text-xs leading-relaxed text-[#8faab5]">
              Location is used only while Field Mode is active. Exact coordinates remain research data and
              are never presented as a public live vessel tracker.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#183140] bg-[#06131c] p-4">
                <div className="text-[10px] font-bold text-[#4de3ff]">DEVICE GNSS</div>
                <div className="mt-2 text-[10px] leading-relaxed text-[#7895a2]">
                  Position, real accuracy, altitude, heading, speed and timestamp when available.
                </div>
              </div>
              <div className="rounded-2xl border border-[#183140] bg-[#06131c] p-4">
                <div className="text-[10px] font-bold text-[#72e0b5]">OPTIONAL CAMERA</div>
                <div className="mt-2 text-[10px] leading-relaxed text-[#7895a2]">
                  Horizon, Sea Surface and Context evidence can be attached to the same observation UUID.
                </div>
              </div>
              <div className="rounded-2xl border border-[#183140] bg-[#06131c] p-4">
                <div className="text-[10px] font-bold text-[#f0b35a]">NO VESSEL SYSTEMS</div>
                <div className="mt-2 text-[10px] leading-relaxed text-[#7895a2]">
                  No NMEA, internal AIS, bridge telemetry or ship-equipment installation is requested.
                </div>
              </div>
            </div>

            <button
              onClick={handleConsent}
              className="mt-6 w-full rounded-2xl bg-[#00d1ff] px-4 py-3.5 text-[11px] font-black tracking-[0.08em] text-[#021018] shadow-[0_0_30px_rgba(0,209,255,0.18)] transition hover:bg-[#4de3ff] active:scale-[0.99]"
            >
              ACCEPT & ENTER FIELD MODE
            </button>

            {error && <div className="mt-3 rounded-xl border border-[#7a3131] bg-[#2f1515] p-3 text-xs text-[#ffaaaa]">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'consent') {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-6" style={{ background: 'var(--wod-bg-primary)', color: 'var(--wod-text-main)' }}>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">{isPB124 ? 'Field permissions' : 'Consentimiento Científico'}</h1>
          <p className="text-xs opacity-60">
            {isPB124
              ? 'Location is used only while Field Mode is active. Exact coordinates remain research data and are not a public live tracker.'
              : 'Controla cómo se utilizarán tus datos de campo.'}
          </p>
        </div>

        <div className="rounded-xl border p-4 text-xs gap-4 flex flex-col" style={{ borderColor: 'var(--wod-border-grid)', background: 'var(--wod-bg-surface)' }}>
          <div><strong>📍 GNSS</strong><div className="opacity-60">Position, real accuracy, altitude, heading, speed and timestamp when available.</div></div>
          <div><strong>🔒 Scope</strong><div className="opacity-60">{isPB124 ? 'Private research pilot by default.' : 'Participant chooses sharing scope.'}</div></div>
          {isPB124 && <div><strong>🚢 Vessel systems</strong><div className="opacity-60">No NMEA, bridge feed, internal AIS or vessel telemetry is requested.</div></div>}
        </div>

        {!isPB124 && (
          <label className="flex flex-col gap-1 text-sm">
            Visibilidad de datos
            <select value={consentScope} onChange={(e) => setConsentScope(e.target.value)} className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--wod-border-grid)', background: 'var(--wod-bg-surface)', color: 'var(--wod-text-main)' }}>
              <option value="private">Privado</option>
              <option value="shared">Compartido / anónimo</option>
              <option value="public">Público / seudónimo</option>
            </select>
          </label>
        )}

        <button onClick={handleConsent} className="rounded-lg px-4 py-3 font-semibold active:scale-95" style={{ background: 'var(--wod-action)', color: 'var(--unwod-white)' }}>
          ACCEPT & CONTINUE
        </button>
        {error && <div className="text-xs" style={{ color: 'var(--wod-status-alert)' }}>{error}</div>}
      </div>
    );
  }

  if (isPB124) {
    return (
      <div className="min-h-screen bg-[#020a10] text-white font-sans">
        <div className="mx-auto max-w-[1500px] p-3 sm:p-5 lg:p-6 space-y-4">
          <header className="relative overflow-hidden rounded-[28px] border border-[#173746] bg-gradient-to-br from-[#071a24] via-[#06131c] to-[#020a10] p-4 sm:p-5">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#00d1ff]/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                    fieldMode
                      ? 'border-[#72e0b5]/40 bg-[#72e0b5]/10 text-[#72e0b5]'
                      : 'border-[#36515f] bg-[#0b1b24] text-[#8faab5]'
                  }`}>
                    FIELD MODE · {fieldMode ? 'ACTIVE' : 'OFF'}
                  </span>
                  <span className="rounded-full border border-[#00d1ff]/30 bg-[#00d1ff]/10 px-2.5 py-1 text-[9px] font-bold text-[#4de3ff]">
                    PB124-OLEA-2026
                  </span>
                  <span className="rounded-full border border-[#36515f] bg-[#0b1b24] px-2.5 py-1 text-[9px] font-bold text-[#a7bec8]">
                    {navigator.onLine ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  {usePB124CloudRelay && (
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                      cloudRelayState === 'READY'
                        ? 'border-[#72e0b5]/30 bg-[#72e0b5]/10 text-[#72e0b5]'
                        : 'border-[#f0b35a]/30 bg-[#f0b35a]/10 text-[#f0b35a]'
                    }`}>
                      CLOUD RELAY · {cloudRelayState}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-[9px] uppercase tracking-[0.2em] text-[#648897]">OLEA · Pacific World</div>
                <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">Peace Boat 124 · Field Observatory</h1>
                <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-[#86a4af]">
                  Phone-only field capture · offline-first evidence · no vessel-system dependency.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-[#183140] bg-[#06131c]/90 px-3 py-2">
                  <div className="text-[8px] uppercase tracking-[0.12em] text-[#658794]">GPS</div>
                  <div className="mt-1 text-[11px] font-bold text-[#4de3ff]">
                    {coords ? `±${Math.round(coords.accuracy)} m` : 'WAITING'}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#183140] bg-[#06131c]/90 px-3 py-2">
                  <div className="text-[8px] uppercase tracking-[0.12em] text-[#658794]">OBS QUEUE</div>
                  <div className="mt-1 text-[11px] font-bold text-white">{pendingCount}</div>
                </div>
                <div className="rounded-2xl border border-[#183140] bg-[#06131c]/90 px-3 py-2">
                  <div className="text-[8px] uppercase tracking-[0.12em] text-[#658794]">MEDIA</div>
                  <div className="mt-1 text-[11px] font-bold text-white">{pendingMediaCount}</div>
                </div>
              </div>
            </div>
          </header>

          <section className="rounded-[28px] border border-[#315f4c] bg-gradient-to-r from-[#0a2119] via-[#071722] to-[#06131c] p-4 sm:p-5 shadow-[0_0_28px_rgba(114,224,181,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#72e0b5]">
                  PB124 · LOW-BURDEN FIELD PRIORITY
                </div>
                <h2 className="mt-1 text-lg font-bold text-white">
                  Meri only needs a few good observations — the 10 map windows are guidance, not required stops.
                </h2>
                <p className="mt-2 text-[11px] leading-relaxed text-[#9bb5be]">
                  Target about <strong className="text-white">3–5 well-documented observations across the whole voyage</strong>.
                  Capture only when safe and convenient. There are <strong className="text-white">no zone quotas</strong>,
                  no background tracking and no penalty for skipping a prompt.
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[460px]">
                <div className="rounded-2xl border border-[#214838] bg-[#081b15] p-3">
                  <div className="text-[8px] font-black uppercase tracking-[0.13em] text-[#72e0b5]">1 · When ready</div>
                  <div className="mt-1 text-[10px] leading-snug text-white">Turn Field Mode ON only for an observation.</div>
                </div>
                <div className="rounded-2xl border border-[#21414f] bg-[#06131c] p-3">
                  <div className="text-[8px] font-black uppercase tracking-[0.13em] text-[#4de3ff]">2 · Record</div>
                  <div className="mt-1 text-[10px] leading-snug text-white">Visual conditions + short note if useful.</div>
                </div>
                <div className="rounded-2xl border border-[#21414f] bg-[#06131c] p-3">
                  <div className="text-[8px] font-black uppercase tracking-[0.13em] text-[#4de3ff]">3 · Photos</div>
                  <div className="mt-1 text-[10px] leading-snug text-white">Horizon · Sea Surface · Context.</div>
                </div>
                <div className="rounded-2xl border border-[#493f24] bg-[#1a160a] p-3">
                  <div className="text-[8px] font-black uppercase tracking-[0.13em] text-[#f0b35a]">Always optional</div>
                  <div className="mt-1 text-[10px] leading-snug text-white">Snooze 45 min or Not Now. Continue normal voyage activity.</div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[8px] font-bold uppercase tracking-[0.12em]">
              <span className="rounded-full border border-[#315f4c] bg-[#0b251c] px-2.5 py-1 text-[#72e0b5]">
                3–5 TOTAL VOYAGE
              </span>
              <span className="rounded-full border border-[#244e58] bg-[#071e28] px-2.5 py-1 text-[#4de3ff]">
                10 WINDOWS = GUIDANCE ONLY
              </span>
              <span className="rounded-full border border-[#294552] bg-[#06131c] px-2.5 py-1 text-[#9db7c1]">
                NO SHIP-SYSTEM ACCESS
              </span>
              <span className="rounded-full border border-[#294552] bg-[#06131c] px-2.5 py-1 text-[#9db7c1]">
                NO ROUTE CHANGE
              </span>
            </div>
          </section>

          <PB124VoyageTimeline
            variant="field"
            observationCount={opportunity?.captureCount ?? 0}
          />

          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8">
              <PB124RouteMap
                variant="field"
                currentPosition={coords ? {
                  lat: coords.lat,
                  lng: coords.lng,
                  accuracy: coords.accuracy,
                  status: geoState,
                } : null}
              />
            </div>

            <div className="xl:col-span-4 space-y-3">
              <div className="rounded-3xl border border-[#183140] bg-[#071722] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.14em] text-[#718f9b]">Field Mode</div>
                    <div className={`mt-1 text-sm font-bold ${fieldMode ? 'text-[#72e0b5]' : 'text-white'}`}>
                      {fieldMode ? 'GNSS OBSERVATION MODE ACTIVE' : 'READY TO START'}
                    </div>
                    <div className="mt-1 text-[9px] font-mono text-[#688794]">GNSS · {geoState}</div>
                  </div>
                  <button
                    onClick={fieldMode ? stopFieldMode : startFieldMode}
                    className={`rounded-2xl px-4 py-3 text-[10px] font-bold transition active:scale-95 ${
                      fieldMode
                        ? 'border border-[#8f4545] bg-[#431d1d] text-[#ffb3b3]'
                        : 'border border-[#00d1ff]/40 bg-[#00d1ff] text-[#03131b] shadow-[0_0_25px_rgba(0,209,255,0.18)]'
                    }`}
                  >
                    {fieldMode ? 'TURN FIELD MODE OFF' : 'TURN FIELD MODE ON'}
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-[#142d3a] bg-[#041018] p-3 font-mono">
                  {coords ? (
                    <>
                      <div className="text-xs font-bold text-[#4de3ff]">
                        {coords.lat.toFixed(5)}°, {coords.lng.toFixed(5)}°
                      </div>
                      <div className="mt-1 text-[9px] text-[#7595a1]">
                        ACC ±{Math.round(coords.accuracy)} m · ALT {coords.altitude == null ? '—' : `${Math.round(coords.altitude)} m`}
                      </div>
                      <div className="text-[9px] text-[#7595a1]">
                        HDG {coords.heading == null ? '—' : `${Math.round(coords.heading)}°`} · SPD {coords.speed == null ? '—' : `${coords.speed.toFixed(1)} m/s`}
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-[#f0b35a]">
                      {geoError ?? (fieldMode ? 'Waiting for device GNSS…' : 'Field Mode is off.')}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`rounded-3xl border p-4 ${
                  opportunity?.shouldCapture && !promptPaused && !promptDismissed
                    ? 'border-[#315f4c] bg-[#0b251c]'
                    : 'border-[#183140] bg-[#071722]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-[#718f9b]">
                    Optional observation opportunity
                  </div>
                  <span className="rounded-full border border-[#5c4c28] bg-[#221a0b] px-2 py-0.5 text-[8px] font-bold text-[#f0b35a]">
                    NO OBLIGATION
                  </span>
                </div>

                <div className={`mt-1 text-sm font-bold ${
                  opportunity?.shouldCapture && !promptPaused && !promptDismissed
                    ? 'text-[#72e0b5]'
                    : 'text-white'
                }`}>
                  {promptPaused
                    ? `Prompt paused until ${new Date(promptPauseUntil as number).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : promptDismissed
                      ? 'Not now · no penalty'
                      : opportunity?.label || (fieldMode ? 'Evaluating route / context…' : 'Activate Field Mode')}
                </div>

                <div className="mt-2 text-[10px] leading-relaxed text-[#8faab5]">
                  {promptPaused || promptDismissed
                    ? 'Continue normal voyage activity. OLEA will not treat a skipped prompt as missing work.'
                    : opportunity?.reason || 'Spatial, temporal and context gaps are evaluated locally on this phone.'}
                </div>

                {opportunity?.shouldCapture && !promptPaused && !promptDismissed && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={snoozeOpportunity}
                      className="rounded-xl border border-[#315747] bg-[#0a2119] px-3 py-2 text-[9px] font-bold text-[#72e0b5]"
                    >
                      SNOOZE 45 MIN
                    </button>
                    <button
                      type="button"
                      onClick={dismissOpportunity}
                      className="rounded-xl border border-[#294552] bg-[#06131c] px-3 py-2 text-[9px] font-bold text-[#9db7c1]"
                    >
                      NOT NOW
                    </button>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[9px] font-mono text-[#688794]">
                    LOCAL GOOD CAPTURES · {opportunity?.captureCount ?? 0}
                  </span>
                  <span className="rounded-full border border-[#244e58] bg-[#071e28] px-2.5 py-1 text-[8px] font-bold text-[#4de3ff]">
                    3–5 TOTAL VOYAGE GUIDANCE
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-[#26424d] bg-[#06131c] p-4 text-[10px] leading-relaxed text-[#89a4ae]">
                <strong className="text-white">Low-burden pilot rule:</strong> about 3–5 well-documented observations
                across the whole voyage are enough. There are no zone quotas, no background tracking and no need to
                interrupt normal Peace Boat operations. Prompts can always be snoozed or skipped.
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#183140] bg-[#041018] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="text-[9px] uppercase tracking-[0.16em] text-[#648897]">Observation matrix</div>
                <h2 className="mt-1 text-base font-bold text-white">Visual conditions & environmental context</h2>
              </div>
              <div className="text-[9px] text-[#668693]">Observer-corrected values · uncertainty allowed</div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <SelectField label="Visibility / horizon" value={visibility} values={PB124_VISIBILITY} onChange={setVisibility} />
              <SelectField label="Sea state — visual" value={seaState} values={PB124_SEA_STATE} onChange={setSeaState} />
              <SelectField label="Whitecaps" value={whitecaps} values={PB124_WHITECAPS} onChange={setWhitecaps} />
              <SelectField label="Sea-surface appearance" value={surface} values={PB124_SURFACE} onChange={setSurface} />
              <SelectField label="Sky / cloud" value={sky} values={PB124_SKY} onChange={setSky} />
              <SelectField label="Environmental context" value={context} values={PB124_CONTEXT} onChange={setContext} />
              <SelectField label="Wildlife" value={wildlife} values={PB124_WILDLIFE} onChange={setWildlife} />
              <SelectField label="Floating material" value={floating} values={PB124_FLOATING} onChange={setFloating} />
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 rounded-[28px] border border-[#183140] bg-[#041018] p-4 sm:p-5">
              <div className="mb-3">
                <div className="text-[9px] uppercase tracking-[0.16em] text-[#648897]">Guided evidence</div>
                <h2 className="mt-1 text-base font-bold text-white">Horizon · Sea Surface · Context</h2>
              </div>
              <PB124GuidedPhotos value={guidedPhotos} onChange={setGuidedPhotos} />
              <div className={`mt-3 rounded-xl border px-3 py-2 text-[10px] font-bold ${guidedPhotoComplete ? 'border-[#315f4c] bg-[#0b251c] text-[#72e0b5]' : 'border-[#7a3131] bg-[#2f1515] text-[#ffaaaa]'}`}>
                {guidedPhotoComplete ? 'EVIDENCE READY · 3/3' : `EVIDENCE REQUIRED · ${guidedPhotos.length}/3 · HORIZON + SEA SURFACE + CONTEXT`}
              </div>
            </div>

            <div className="xl:col-span-4 rounded-[28px] border border-[#183140] bg-[#041018] p-4 sm:p-5 flex flex-col">
              <div>
                <div className="text-[9px] uppercase tracking-[0.16em] text-[#648897]">Field notes</div>
                <h2 className="mt-1 text-base font-bold text-white">Short observer note</h2>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                placeholder="Only add what is visually relevant or methodologically useful…"
                className="mt-3 flex-1 rounded-2xl border border-[#1a3948] bg-[#06131c] px-3 py-3 text-xs text-white outline-none transition focus:border-[#00d1ff]"
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-[#1b4050] bg-gradient-to-r from-[#071722] to-[#06131c] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.16em] text-[#648897]">Offline-first save</div>
                <div className="mt-1 text-sm font-bold text-white">Persist locally before any network sync</div>
                <div className="mt-1 text-[10px] text-[#7f9aa5]">
                  One observation UUID · IndexedDB first · original media preserved · SHA-256 lineage
                </div>
              </div>
              <button
                onClick={submit}
                disabled={!fieldMode || !coords || submittingObservation || !guidedPhotoComplete || Boolean(submitted)}
                className="rounded-2xl bg-[#00d1ff] px-6 py-3.5 text-[11px] font-black tracking-[0.08em] text-[#021018] shadow-[0_0_30px_rgba(0,209,255,0.2)] transition hover:bg-[#4de3ff] disabled:cursor-not-allowed disabled:opacity-35 active:scale-[0.98]"
              >
                {submittingObservation
                  ? 'SAVING COMPLETE CAPTURE…'
                  : submitted
                    ? 'CAPTURE SAVED'
                    : guidedPhotoComplete
                      ? 'SAVE COMPLETE OBSERVATION · 3/3 EVIDENCE'
                      : 'ADD HORIZON · SEA SURFACE · CONTEXT'}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[9px] font-mono">
              {syncing && <span className="text-[#4de3ff] animate-pulse">SYNCING PENDING RECORDS…</span>}
              {lastSyncStatus && <span className="text-[#8faab5]">SYNC STATUS · {lastSyncStatus}</span>}
              {submitted && <span className="text-[#72e0b5]">LOCAL UUID · {submitted}</span>}
              {error && <span className="text-[#ef7777]">{error}</span>}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gap-4 p-4" style={{ background: 'var(--wod-bg-primary)', color: 'var(--wod-text-main)', fontFamily: 'var(--wod-font-sans)' }}>
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="text-[10px] opacity-55 font-mono">{requestedExpedition || 'FIELD CONNECT'}</div>
          <h1 className="text-lg font-semibold">{isPB124 ? 'Peace Boat 124 · Field Mode' : 'AMOH — Reporte de campo'}</h1>
        </div>
        <div className="text-right text-[10px] font-mono opacity-70">
          <div>{navigator.onLine ? 'ONLINE' : 'OFFLINE'}</div>
          <div>{pendingCount} OBS PENDING</div>
          <div>{pendingMediaCount} MEDIA PENDING</div>
        </div>
      </div>

      {isPB124 && (
        <div className="rounded-xl border p-3 text-xs" style={{ borderColor: '#245261', background: '#071b24' }}>
          <strong>Method pilot:</strong> quality over quantity. Capture only when safe and convenient. Approximately 3–5 good observations are sufficient.
        </div>
      )}

      {isPB124 && fieldMode && opportunity && (
        <div
          className="rounded-xl border p-3 text-xs"
          style={{
            borderColor: opportunity.shouldCapture ? '#2f8065' : '#294754',
            background: opportunity.shouldCapture ? '#0b2a20' : '#071b24',
          }}
        >
          <div className="font-bold">{opportunity.label}</div>
          <div className="opacity-70 mt-1">{opportunity.reason}</div>
          <div className="font-mono text-[10px] opacity-55 mt-1">
            Local good-capture count: {opportunity.captureCount}/5
          </div>
        </div>
      )}

      <div className="rounded-xl border p-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--wod-border-grid)', background: 'var(--wod-bg-surface)' }}>
        <div>
          <div className="text-[10px] uppercase opacity-55">Field Mode</div>
          <div className="text-sm font-semibold">{fieldMode ? 'ACTIVE' : 'OFF'}</div>
          <div className="text-[10px] font-mono opacity-60">GNSS: {geoState}</div>
        </div>
        <button
          onClick={fieldMode ? stopFieldMode : startFieldMode}
          className="rounded-lg px-4 py-2 text-xs font-bold"
          style={{ background: fieldMode ? '#7a3131' : 'var(--wod-action)', color: 'white' }}
        >
          {fieldMode ? 'TURN OFF' : 'TURN ON'}
        </button>
      </div>

      <div className="rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--wod-border-grid)', fontFamily: 'var(--wod-font-mono)' }}>
        {coords ? (
          <div className="space-y-1" style={{ color: 'var(--wod-accent-cyan)' }}>
            <div>{coords.lat.toFixed(5)}°, {coords.lng.toFixed(5)}° · ±{Math.round(coords.accuracy)} m</div>
            <div className="text-[10px] opacity-75">
              ALT {coords.altitude == null ? '—' : `${Math.round(coords.altitude)} m`} · HDG {coords.heading == null ? '—' : `${Math.round(coords.heading)}°`} · SPD {coords.speed == null ? '—' : `${coords.speed.toFixed(1)} m/s`}
            </div>
          </div>
        ) : (
          <span style={{ color: 'var(--wod-status-warn)' }}>{geoError ?? (fieldMode ? 'Waiting for GNSS reading…' : 'Field Mode is off.')}</span>
        )}
      </div>

      {isPB124 ? (
        <>
          <SelectField label="Visibility / horizon" value={visibility} values={PB124_VISIBILITY} onChange={setVisibility} />
          <SelectField label="Sea state — visual" value={seaState} values={PB124_SEA_STATE} onChange={setSeaState} />
          <SelectField label="Whitecaps" value={whitecaps} values={PB124_WHITECAPS} onChange={setWhitecaps} />
          <SelectField label="Sea-surface appearance" value={surface} values={PB124_SURFACE} onChange={setSurface} />
          <SelectField label="Sky / cloud" value={sky} values={PB124_SKY} onChange={setSky} />
          <SelectField label="Environmental context" value={context} values={PB124_CONTEXT} onChange={setContext} />
          <SelectField label="Wildlife" value={wildlife} values={PB124_WILDLIFE} onChange={setWildlife} />
          <SelectField label="Floating material" value={floating} values={PB124_FLOATING} onChange={setFloating} />
        </>
      ) : (
        <SelectField label="Tipo de observación" value={genericType} values={GENERIC_TYPES} onChange={setGenericType} />
      )}

      {isPB124 && (
        <PB124GuidedPhotos value={guidedPhotos} onChange={setGuidedPhotos} />
      )}

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--wod-border-grid)', background: 'var(--wod-bg-surface)', color: 'var(--wod-text-main)' }} />
      </label>

      <button
        onClick={submit}
        disabled={!fieldMode || !coords}
        className="rounded-lg px-4 py-3 font-semibold disabled:opacity-40 active:scale-95"
        style={{ background: 'var(--wod-action)', color: 'var(--unwod-white)' }}
      >
        SAVE OBSERVATION
      </button>

      {syncing && <div className="text-[10px] animate-pulse" style={{ color: 'var(--wod-accent-cyan)' }}>SYNCING PENDING RECORDS…</div>}
      {lastSyncStatus && <div className="text-[10px] font-mono opacity-70">SYNC STATUS: {lastSyncStatus}</div>}
      {error && <div className="text-sm" style={{ color: 'var(--wod-status-alert)' }}>{error}</div>}
      {submitted && (
        <div className="text-xs rounded-lg border p-3" style={{ borderColor: 'var(--wod-border-grid)', color: 'var(--wod-accent-cyan)' }}>
          Saved locally first · UUID {submitted}<br />
          {navigator.onLine ? 'Synchronization will be attempted automatically.' : 'Waiting for internet. The record remains in IndexedDB.'}
        </div>
      )}
    </div>
  );
}
