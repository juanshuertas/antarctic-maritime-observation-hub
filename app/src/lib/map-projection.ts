import type { Map, ProjectionSpecification } from 'maplibre-gl';

/**
 * AMOH — map projection control.
 * Ported from OSIRIS (src/lib/map-projection.ts): MapLibre's own adaptive
 * globe holds a true globe at overview zooms and switches to mercator
 * internally as you zoom in, so the library owns the transition.
 */
export const GLOBE_PROJECTION: ProjectionSpecification = { type: 'globe' };

export function applyMapProjection(
  map: Pick<Map, 'getProjection' | 'setProjection'> & { isStyleLoaded?: () => boolean | void },
  mode: 'globe' | 'mercator',
  _terrainEnabled = false,
) {
  try {
    if (typeof map.isStyleLoaded === 'function' && !map.isStyleLoaded()) {
      return false;
    }
    const next: ProjectionSpecification = mode === 'mercator'
      ? { type: 'mercator' }
      : GLOBE_PROJECTION;
    // An omitted style projection is mercator, despite the library's return type.
    if (JSON.stringify(map.getProjection()?.type ?? 'mercator') === JSON.stringify(next.type)) return false;
    map.setProjection(next);
    return true;
  } catch (err) {
    console.warn('[AMOH Map Projection] Could not apply projection safely:', err);
    return false;
  }
}
