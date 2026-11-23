/**
 * AMOH — geodesic primitives.
 * Ported from OSIRIS (src/lib/geo.ts): spherical rather than ellipsoidal
 * measurement floor, cheap and exact enough for AIS/field-observation
 * positions. Every function takes/returns [lng, lat] in degrees (GeoJSON
 * axis order) — never varied, even for "convenience" helpers.
 */

/** Mean Earth radius (IUGG), km. */
export const EARTH_RADIUS_KM = 6371;

export type LngLat = [number, number];

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in km. */
export function haversine(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Initial bearing from `a` to `b`, degrees clockwise from north, 0-360. */
export function bearing(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLambda = toRad(lng2 - lng1);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** The point `distKm` from `origin` along `bearingDeg`. Inverse of the pair above. */
export function destination(origin: LngLat, bearingDeg: number, distKm: number): LngLat {
  const [lng, lat] = origin;
  const delta = distKm / EARTH_RADIUS_KM;
  const theta = toRad(bearingDeg);
  const phi1 = toRad(lat);
  const lambda1 = toRad(lng);

  const sinPhi2 = Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
  const phi2 = Math.asin(Math.min(1, Math.max(-1, sinPhi2)));
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * sinPhi2,
    );

  return [((toDeg(lambda2) + 540) % 360) - 180, toDeg(phi2)];
}

/** Spherical polygon area in km^2 (Chamberlain-Duquette). Ring may be open or closed. */
export function polygonArea(ring: number[][]): number {
  const n = ring.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = toRad(ring[i][1]);
    const lat2 = toRad(ring[j][1]);
    const dLng = toRad(ring[j][0] - ring[i][0]);
    sum += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs((sum * EARTH_RADIUS_KM * EARTH_RADIUS_KM) / 2);
}

/** Perimeter of a closed ring in km. Closes the ring implicitly. */
export function ringPerimeter(ring: number[][]): number {
  const n = ring.length;
  if (n < 2) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    total += haversine(ring[i] as LngLat, ring[j] as LngLat);
  }
  return total;
}

/** Length of an open path in km. Unlike a ring, the ends are not joined. */
export function pathLength(coords: number[][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1] as LngLat, coords[i] as LngLat);
  }
  return total;
}

/** A circle of true geodesic radius, as a closed ring (walks `steps` bearings). */
export function circleToRing(center: LngLat, radiusKm: number, steps = 64): number[][] {
  const ring: number[][] = [];
  for (let i = 0; i < steps; i++) {
    ring.push(destination(center, (360 / steps) * i, radiusKm));
  }
  ring.push(ring[0]);
  return ring;
}

/** Axis-aligned rectangle from two opposite corners, as a closed ring. */
export function rectToRing(a: LngLat, b: LngLat): number[][] {
  const west = Math.min(a[0], b[0]);
  const east = Math.max(a[0], b[0]);
  const south = Math.min(a[1], b[1]);
  const north = Math.max(a[1], b[1]);
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ];
}

/** Compact distance for a readout: metres under 1 km, then km. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

/** Compact area for a readout: m^2 under a hectare, then km^2. */
export function formatArea(km2: number): string {
  if (km2 < 0.01) return `${Math.round(km2 * 1_000_000).toLocaleString()} m\u00b2`;
  if (km2 < 100) return `${km2.toFixed(2)} km\u00b2`;
  return `${Math.round(km2).toLocaleString()} km\u00b2`;
}

/** 0-360 to a 16-point compass label, for bearing readouts (e.g. AIS course). */
export function compassPoint(deg: number): string {
  const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return points[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}
