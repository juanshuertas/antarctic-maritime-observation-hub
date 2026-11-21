import type { FeatureCollection, Point } from 'geojson';
import { degreesLat, degreesLong, eciToGeodetic, gstime, json2satrec, propagate } from 'satellite.js';

type Omm = Parameters<typeof json2satrec>[0];
const CATALOG_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json';
const BUNDLED_CATALOG = '/amoh/orbital_v15/orbital/celestrak/active_omm.json';
let catalog: {
  expires: number;
  bundled: boolean;
  newestEpoch: string | null;
  entries: { row: Omm; orbit: ReturnType<typeof json2satrec> }[];
} | undefined;

async function readCatalog(url: string): Promise<Omm[]> {
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Catálogo CelesTrak no disponible');
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) throw new Error('Catálogo CelesTrak vacío');
  return rows;
}

export async function getActiveSatellitePositions() {
  if (!catalog || Date.now() >= catalog.expires) {
    let bundled = false;
    const rows = await readCatalog(CATALOG_URL).catch(() => {
      bundled = true;
      return readCatalog(BUNDLED_CATALOG);
    });
    const entries = rows.flatMap(row => {
      try {
        return [{ row, orbit: json2satrec(row) }];
      } catch {
        return [];
      }
    });
    const newestEpoch = entries.reduce<string | null>((latest, { row }) =>
      row.EPOCH && (!latest || row.EPOCH > latest) ? row.EPOCH : latest, null);
    catalog = { expires: Date.now() + (bundled ? 120 : 180) * 60_000, entries, bundled, newestEpoch };
  }
  const now = new Date();
  const siderealTime = gstime(now);
  const data: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: catalog.entries.flatMap(({ row, orbit }) => {
      const state = propagate(orbit, now);
      if (!state?.position || !state.velocity) return [];
      const point = eciToGeodetic(state.position, siderealTime);
      if (![point.longitude, point.latitude, point.height].every(Number.isFinite)) return [];
      return [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [degreesLong(point.longitude), degreesLat(point.latitude)] },
        properties: {
          norad_id: row.NORAD_CAT_ID,
          name: row.OBJECT_NAME,
          altitude_km: Math.round(point.height),
          inclination_deg: Number(row.INCLINATION),
          velocity_kms: Number(Math.hypot(state.velocity.x, state.velocity.y, state.velocity.z).toFixed(2)),
          orbit_epoch: row.EPOCH,
          calculated_at: now.toISOString(),
          source: catalog?.bundled ? 'CelesTrak (archivo) · SGP4' : 'CelesTrak · SGP4',
          freshness: 'PROPAGATED',
        },
      }];
    }),
  };
  return { data, catalogDate: catalog.newestEpoch?.slice(0, 10) ?? null, bundled: catalog.bundled };
}
