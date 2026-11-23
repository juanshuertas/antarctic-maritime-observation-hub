export type PB124OpportunityStatus =
  | 'WAITING_FOR_GNSS'
  | 'FIRST_OPPORTUNITY'
  | 'COOLDOWN'
  | 'WATCH'
  | 'GOOD_OPPORTUNITY'
  | 'ENOUGH_FOR_PILOT';

export interface PB124Opportunity {
  status: PB124OpportunityStatus;
  shouldCapture: boolean;
  label: string;
  reason: string;
  distanceKm: number | null;
  elapsedMinutes: number | null;
  captureCount: number;
}

type CaptureState = {
  lat: number;
  lng: number;
  capturedAtMs: number;
  context: string;
  visibility: string;
  count: number;
};

const KEY = 'pb124_opportunity_state_v1';
const COOLDOWN_MIN = 45;
const WATCH_TIME_MIN = 60;
const STRONG_TIME_MIN = 90;
const WATCH_DISTANCE_KM = 15;
const STRONG_DISTANCE_KM = 20;
const TARGET_MAX = 5;

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function readState(): CaptureState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CaptureState;
    if (!Number.isFinite(parsed.lat) || !Number.isFinite(parsed.lng) || !Number.isFinite(parsed.capturedAtMs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeState(state: CaptureState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Prompting must never block scientific capture.
  }
}

export function evaluatePB124Opportunity(input: {
  lat?: number | null;
  lng?: number | null;
  context: string;
  visibility: string;
  nowMs?: number;
}): PB124Opportunity {
  const last = readState();
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) {
    return {
      status: 'WAITING_FOR_GNSS',
      shouldCapture: false,
      label: 'Waiting for GNSS',
      reason: 'Field Mode needs a valid device GNSS reading before evaluating an opportunity.',
      distanceKm: null,
      elapsedMinutes: null,
      captureCount: last?.count ?? 0,
    };
  }

  if (!last) {
    return {
      status: 'FIRST_OPPORTUNITY',
      shouldCapture: true,
      label: 'Good first opportunity',
      reason: 'No PB124 field observation has been saved on this device yet.',
      distanceKm: null,
      elapsedMinutes: null,
      captureCount: 0,
    };
  }

  const distanceKm = haversineKm(last.lat, last.lng, input.lat!, input.lng!);
  const elapsedMinutes = Math.max(0, ((input.nowMs ?? Date.now()) - last.capturedAtMs) / 60000);

  if ((last.count ?? 0) >= TARGET_MAX) {
    return {
      status: 'ENOUGH_FOR_PILOT',
      shouldCapture: false,
      label: 'Pilot target reached',
      reason: 'Five observations are already stored on this device. Additional capture is optional and should add clear methodological value.',
      distanceKm,
      elapsedMinutes,
      captureCount: last.count,
    };
  }

  if (elapsedMinutes < COOLDOWN_MIN) {
    return {
      status: 'COOLDOWN',
      shouldCapture: false,
      label: 'Cooldown',
      reason: `Last local capture was ${Math.round(elapsedMinutes)} min ago. Prefer fewer, better-spaced observations.`,
      distanceKm,
      elapsedMinutes,
      captureCount: last.count,
    };
  }

  const reasons: string[] = [];
  if (distanceKm >= STRONG_DISTANCE_KM) reasons.push(`${distanceKm.toFixed(1)} km spatial gap`);
  if (elapsedMinutes >= STRONG_TIME_MIN) reasons.push(`${Math.round(elapsedMinutes)} min temporal gap`);
  if (input.context !== last.context) reasons.push('environmental-context change');
  if (input.visibility !== last.visibility) reasons.push('visibility change');

  if (reasons.length) {
    return {
      status: 'GOOD_OPPORTUNITY',
      shouldCapture: true,
      label: 'Good observation opportunity',
      reason: reasons.join(' · '),
      distanceKm,
      elapsedMinutes,
      captureCount: last.count,
    };
  }

  if (distanceKm >= WATCH_DISTANCE_KM || elapsedMinutes >= WATCH_TIME_MIN) {
    return {
      status: 'WATCH',
      shouldCapture: false,
      label: 'Watch for a meaningful change',
      reason: `${distanceKm.toFixed(1)} km since last capture · ${Math.round(elapsedMinutes)} min elapsed.`,
      distanceKm,
      elapsedMinutes,
      captureCount: last.count,
    };
  }

  return {
    status: 'COOLDOWN',
    shouldCapture: false,
    label: 'No strong opportunity yet',
    reason: `${distanceKm.toFixed(1)} km since last capture · ${Math.round(elapsedMinutes)} min elapsed.`,
    distanceKm,
    elapsedMinutes,
    captureCount: last.count,
  };
}

export function registerPB124Capture(input: {
  lat: number;
  lng: number;
  context: string;
  visibility: string;
  capturedAtMs?: number;
}): void {
  const previous = readState();
  writeState({
    lat: input.lat,
    lng: input.lng,
    context: input.context,
    visibility: input.visibility,
    capturedAtMs: input.capturedAtMs ?? Date.now(),
    count: (previous?.count ?? 0) + 1,
  });
}
