import type { FeatureCollection } from 'geojson';
import { ApiError } from './api';

export const TRAFFIC_LAYERS = {
  vessels: 'maritime_vessels',
  aircraft: 'polar_aircraft',
  satellites: 'polar_satellites',
} as const;

export type TrafficFeed = keyof typeof TRAFFIC_LAYERS;
type FeedState = { count: number | null; updated: string | null; detail?: string };

const pending: FeedState = { count: null, updated: null };
let snapshot = { vessels: pending, aircraft: pending, satellites: pending };
const listeners = new Set<() => void>();

export function subscribeTraffic(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getTrafficSnapshot() {
  return snapshot;
}

export function updateTraffic(feed: TrafficFeed, count: number | null, detail?: string) {
  snapshot = { ...snapshot, [feed]: { count, detail, updated: count === null ? null : new Date().toISOString() } };
  listeners.forEach(listener => listener());
}

export async function fetchOpenAircraft(): Promise<{ data: FeatureCollection; partial: boolean }> {
  const path = '/api/traffic/aircraft';
  const base = import.meta.env.VITE_TRAFFIC_API_URL || import.meta.env.VITE_API_URL || window.location.origin;
  // Absolute URLs bypass the GitHub Pages snapshot shim for operational feeds.
  const response = await fetch(new URL(path, base), { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new ApiError('Telemetría no disponible', response.status);
  const collection: FeatureCollection & { metadata?: { sectors_available?: number } } = await response.json();
  if (collection.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
    throw new Error('Respuesta de telemetría inválida');
  }
  const now = Date.now();
  const maxAge = 5 * 60_000;
  const data: FeatureCollection = {
    type: 'FeatureCollection',
    features: collection.features.filter(feature => {
      const properties = feature.properties;
      const observed = Date.parse(properties?.observed_at ?? properties?.timestamp ?? '');
      const age = now - observed;
      return feature.geometry?.type === 'Point' && feature.geometry.coordinates[1] <= -50 &&
        age >= -60_000 && age <= maxAge &&
        !['DEMO', 'SIMULATED', 'ESTIMATED'].includes(properties?.freshness);
    }),
  };
  return { data, partial: (collection.metadata?.sectors_available ?? 3) < 3 };
}
