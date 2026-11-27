import type { FeatureCollection, LineString, Point } from 'geojson';
import { degreesLat, degreesLong, eciToGeodetic, gstime, json2satrec, propagate, twoline2satrec } from 'satellite.js';

type Omm = Parameters<typeof json2satrec>[0];
type Orbit = ReturnType<typeof twoline2satrec>;
type Entry = { name: string; norad: number; epoch: string; orbit: Orbit; source: string; inclination?: number };
const SNAPSHOT_URL = `${import.meta.env.BASE_URL}data/live/satellites_tle.json`;
const DIRECT_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=earth-resources&FORMAT=json';
const MAX_EPOCH_AGE_MS = 14 * 24 * 60 * 60_000;
const EO_NAMES = new Set([
  'NISAR', 'LANDSAT 8', 'LANDSAT 9', 'ALOS 2', 'ALOS-4', 'CRYOSAT 2', 'ICESAT-2',
  'RADARSAT 2', 'TERRA', 'AQUA', 'METOP-C', 'NOAA 20', 'NOAA 21',
  'RESOURCESAT 2A', 'CARTOSAT 3', 'PLEIADES 1B', 'KOMPSAT 5',
]);
let catalog: { expires: number; entries: Entry[]; snapshot: boolean; newestEpoch: string | null } | undefined;

function recentEpoch(value: string): boolean {
  const age = Date.now() - Date.parse(value);
  return Number.isFinite(age) && age >= -24 * 60 * 60_000 && age <= MAX_EPOCH_AGE_MS;
}

async function readSnapshot(): Promise<Entry[]> {
  const response = await fetch(SNAPSHOT_URL, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`TLE snapshot HTTP ${response.status}`);
  const body: unknown = await response.json();
  if (!body || typeof body !== 'object' || !('fetched_at' in body) || typeof body.fetched_at !== 'string'
      || !('satellites' in body) || !Array.isArray(body.satellites)) throw new Error('Invalid TLE snapshot');
  const fetchedAge = Date.now() - Date.parse(body.fetched_at);
  if (!Number.isFinite(fetchedAge) || fetchedAge < -60 * 60_000 || fetchedAge > 6 * 60 * 60_000) {
    throw new Error('TLE snapshot expired');
  }
  return body.satellites.flatMap((row): Entry[] => {
    if (!row || typeof row !== 'object' || typeof row.name !== 'string'
        || typeof row.norad_id !== 'number' || typeof row.epoch !== 'string'
        || typeof row.tle1 !== 'string' || typeof row.tle2 !== 'string'
        || !recentEpoch(row.epoch)) return [];
    try {
      const orbit = twoline2satrec(row.tle1, row.tle2);
      if (orbit.error !== 0) return [];
      return [{ name: row.name, norad: row.norad_id, epoch: row.epoch, orbit,
        source: typeof row.upstream_source === 'string' ? `SatNOGS / ${row.upstream_source}` : 'CelesTrak' }];
    } catch { return []; }
  });
}

async function readDirect(): Promise<Entry[]> {
  const response = await fetch(DIRECT_URL, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`CelesTrak HTTP ${response.status}`);
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error('Invalid CelesTrak catalog');
  return rows.flatMap((row): Entry[] => {
    if (!row || typeof row !== 'object') return [];
    const omm = row as Omm;
    if (typeof omm.OBJECT_NAME !== 'string' || typeof omm.EPOCH !== 'string'
        || !recentEpoch(omm.EPOCH) || !EO_NAMES.has(omm.OBJECT_NAME.toUpperCase())) return [];
    try {
      const orbit = json2satrec(omm);
      if (orbit.error !== 0) return [];
      return [{ name: omm.OBJECT_NAME, norad: Number(omm.NORAD_CAT_ID), epoch: omm.EPOCH,
        orbit, source: 'CelesTrak', inclination: Number(omm.INCLINATION) }];
    } catch { return []; }
  });
}

function groundPosition(orbit: Orbit, at: Date): [number, number, number, number] | null {
  const state = propagate(orbit, at);
  if (!state?.position || !state.velocity) return null;
  const geo = eciToGeodetic(state.position, gstime(at));
  const longitude = degreesLong(geo.longitude);
  const latitude = degreesLat(geo.latitude);
  const velocity = Math.hypot(state.velocity.x, state.velocity.y, state.velocity.z);
  return [longitude, latitude, geo.height, velocity].every(Number.isFinite)
    ? [longitude, latitude, geo.height, velocity] : null;
}

export async function getActiveSatellitePositions(): Promise<{
  data: FeatureCollection<Point>; tracks: FeatureCollection<LineString>; catalogDate: string | null; bundled: boolean;
}> {
  if (!catalog || Date.now() >= catalog.expires) {
    let snapshot = true;
    const entries = await readSnapshot().catch(async () => {
      snapshot = false;
      return readDirect();
    });
    if (!entries.length) throw new Error('No recent Earth-observation TLEs');
    catalog = {
      expires: Date.now() + 30 * 60_000, entries, snapshot,
      newestEpoch: entries.reduce<string | null>((latest, entry) =>
        !latest || entry.epoch > latest ? entry.epoch : latest, null),
    };
  }
  const now = new Date();
  const points: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] };
  const tracks: FeatureCollection<LineString> = { type: 'FeatureCollection', features: [] };
  for (const entry of catalog.entries) {
    const current = groundPosition(entry.orbit, now);
    if (!current) continue;
    points.features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: current.slice(0, 2) },
      properties: {
        norad_id: entry.norad, name: entry.name, altitude_km: Math.round(current[2]),
        velocity_kms: Number(current[3].toFixed(2)), inclination_deg: entry.inclination ?? null,
        orbit_epoch: entry.epoch, calculated_at: now.toISOString(), source: `${entry.source} · SGP4`,
        freshness: 'PROPAGATED',
      } });
    // A 60-minute ground track is a propagated path, not a measured sensor swath.
    let segment: number[][] = [];
    for (let minute = -30; minute <= 30; minute += 5) {
      const position = groundPosition(entry.orbit, new Date(now.getTime() + minute * 60_000));
      if (!position) continue;
      if (segment.length && Math.abs(segment[segment.length - 1][0] - position[0]) > 180) {
        if (segment.length > 1) tracks.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: segment },
          properties: { norad_id: entry.norad, name: entry.name, source: `${entry.source} · SGP4`, orbit_epoch: entry.epoch } });
        segment = [];
      }
      segment.push(position.slice(0, 2));
    }
    if (segment.length > 1) tracks.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: segment },
      properties: { norad_id: entry.norad, name: entry.name, source: `${entry.source} · SGP4`, orbit_epoch: entry.epoch } });
  }
  return { data: points, tracks, catalogDate: catalog.newestEpoch?.slice(0, 10) ?? null, bundled: catalog.snapshot };
}
