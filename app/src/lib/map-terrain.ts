import type { Map, MapSourceDataEvent, ErrorEvent } from 'maplibre-gl';
import { batchTerrainLayers } from './terrain-layer-order';

/**
 * AMOH — lazy bounded terrain, adapted from OSIRIS (src/lib/map-terrain.ts).
 * Uses the local `amoh-dem://` protocol (see terrain-tiles.ts) instead of a
 * hosted DEM service — edge-node offline-first, no CDN at runtime.
 */
export const TERRAIN_SOURCE = 'amoh-terrain-dem';
export type TerrainStatus = 'idle' | 'waiting' | 'loading' | 'ready' | 'error';

// Hysteresis prevents reloading tiles when hovering around the activation zoom.
// Set to zoom 1.0 so Antarctic mountains and continental relief render at full 3D globe overview scale.
export const TERRAIN_MIN_ZOOM = 1.0;
const DISABLE_ZOOM = 0.5;
export const TERRAIN_SETTLE_MS = 250;

/** Lazy, bounded terrain using the existing renderer; no second map or imagery. */
export function attachTerrain(map: Map, onStatus: (status: TerrainStatus) => void) {
  let disposed = false;
  let active = false;
  let failed = false;
  let restoreLayerOrder: (() => void) | undefined;
  let status: TerrainStatus | undefined;
  let activationTimer: ReturnType<typeof setTimeout> | undefined;
  const originalPitchLimit = map.getMaxPitch();
  const originalPixelRatio = map.getPixelRatio();
  map.setMaxPitch(Math.min(originalPitchLimit, 75));
  // Enable crystal-clear 4K UHD rendering without downscaling to 1.5
  const targetRatio = Math.min(window.devicePixelRatio || 1, 2.5);
  map.setPixelRatio(targetRatio);

  const report = (next: TerrainStatus) => {
    if (disposed || next === status) return;
    status = next;
    onStatus(next);
  };
  const release = () => {
    active = false;
    if (map.getTerrain()?.source === TERRAIN_SOURCE) map.setTerrain(null);
    if (map.getSource(TERRAIN_SOURCE)) map.removeSource(TERRAIN_SOURCE);
    restoreLayerOrder?.();
    restoreLayerOrder = undefined;
  };
  const cancelActivation = () => {
    clearTimeout(activationTimer);
    activationTimer = undefined;
  };
  const hidden = () => typeof document !== 'undefined' && document.hidden;
  const activate = () => {
    activationTimer = undefined;
    if (disposed || active || failed || map.isMoving() || hidden() || map.getZoom() < TERRAIN_MIN_ZOOM) return;
    active = true;
    report('loading');
    try {
      map.addSource(TERRAIN_SOURCE, {
        type: 'raster-dem',
        tiles: ['amoh-dem://{z}/{x}/{y}'],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 10,
        attribution: 'AWS Terrarium / Mapzen DEM (3D Relief)',
      });
      map.setSourceTileLodParams(10, 1.25, TERRAIN_SOURCE);
      restoreLayerOrder = batchTerrainLayers(map);
      map.setTerrain({ source: TERRAIN_SOURCE, exaggeration: 2.2 });
    } catch (error) {
      failed = true;
      release();
      report('error');
      console.warn('[AMOH] Terrain unavailable:', error);
    }
  };
  const update = () => {
    if (disposed || active || failed) return;
    cancelActivation();
    if (map.getZoom() < TERRAIN_MIN_ZOOM) {
      report('idle');
      return;
    }
    report('waiting');
    if (!map.isMoving() && !hidden()) activationTimer = setTimeout(activate, TERRAIN_SETTLE_MS);
  };
  const onZoom = () => {
    if (!active && map.getZoom() < TERRAIN_MIN_ZOOM) {
      cancelActivation();
      if (!failed) report('idle');
    }
    if (active && map.getZoom() < DISABLE_ZOOM) {
      release();
      report('idle');
    }
  };
  const onData = (event: MapSourceDataEvent) => {
    if (active && !failed && event.sourceId === TERRAIN_SOURCE &&
        event.isSourceLoaded && (event.tile || event.sourceDataType === 'idle')) report('ready');
  };
  const onError = (event: ErrorEvent & { sourceId?: string }) => {
    if (!active || event.sourceId !== TERRAIN_SOURCE) return;
    failed = true;
    report('error');
    // Let MapLibre finish its source callback before removing its resources.
    queueMicrotask(() => { if (!disposed) release(); });
  };

  map.on('movestart', cancelActivation);
  map.on('zoom', onZoom);
  map.on('moveend', update);
  map.on('sourcedata', onData);
  map.on('error', onError);
  const onVisibility = () => { if (hidden()) cancelActivation(); else update(); };
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);
  const onRemove = () => {
    disposed = true;
    cancelActivation();
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
  };
  map.on('remove', onRemove);
  report('idle');
  update();

  return () => {
    if (disposed) return;
    disposed = true;
    cancelActivation();
    map.off('remove', onRemove);
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    map.off('movestart', cancelActivation);
    map.off('zoom', onZoom);
    map.off('moveend', update);
    map.off('sourcedata', onData);
    map.off('error', onError);
    release();
    map.setMaxPitch(originalPitchLimit);
    if (originalPixelRatio > 1.5) map.setPixelRatio(originalPixelRatio);
  };
}
