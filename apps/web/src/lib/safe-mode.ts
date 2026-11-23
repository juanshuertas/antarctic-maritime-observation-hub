/**
 * AMOH Safe Mode Helper
 * Emergency performance recovery: allows loading only the core UI shell,
 * a single lightweight MapLibre basemap, and Antarctic continent polygons,
 * bypassing heavy telemetry, orbital calculations, and 3D terrain overhead.
 */
export function isSafeMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('safe');
}
