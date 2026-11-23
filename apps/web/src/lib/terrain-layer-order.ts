import type { Map } from 'maplibre-gl';

/**
 * AMOH — terrain layer batching.
 * Ported verbatim from OSIRIS (src/lib/terrain-layer-order.ts). Batches the
 * ground surface (draped layers) below labels/markers without hiding data,
 * so terrain and vector overlays don't force extra render passes.
 */
const DRAPED_TYPES = new Set(['background', 'fill', 'line', 'raster', 'hillshade', 'color-relief']);

export function batchTerrainLayers(map: Map): () => void {
  let originalOrder = map.getLayersOrder();
  let lastOrder: string[] = [];
  let reordering = false;
  let disposed = false;

  const rememberAddedLayers = (current: string[]) => {
    const surviving = new Set(current);
    originalOrder = originalOrder.filter(id => surviving.has(id));
    const known = new Set(originalOrder);
    for (let i = current.length - 1; i >= 0; i--) {
      const id = current[i];
      if (known.has(id)) continue;
      const before = i + 1 < current.length ? originalOrder.indexOf(current[i + 1]) : -1;
      originalOrder.splice(before < 0 ? originalOrder.length : before, 0, id);
      known.add(id);
    }
  };

  const applyOrder = (desired: string[], current: string[]) => {
    const order = [...current];
    for (let i = desired.length - 1; i >= 0; i--) {
      const id = desired[i];
      const index = order.indexOf(id);
      const before = desired[i + 1];
      if (order[index + 1] === before) continue;
      map.moveLayer(id, before);
      order.splice(index, 1);
      order.splice(before ? order.indexOf(before) : order.length, 0, id);
    }
  };

  const refresh = () => {
    if (disposed || reordering) return;
    const current = map.getLayersOrder();
    if (current.length === lastOrder.length && current.every((id, i) => id === lastOrder[i])) return;
    rememberAddedLayers(current);
    const ground: string[] = [];
    const overlays: string[] = [];
    for (const id of current) {
      const layer = map.getLayer(id);
      (layer && DRAPED_TYPES.has(layer.type) ? ground : overlays).push(id);
    }
    lastOrder = [...ground, ...overlays];
    reordering = true;
    try { applyOrder(lastOrder, current); }
    finally { reordering = false; }
  };

  map.on('styledata', refresh);
  refresh();

  return () => {
    if (disposed) return;
    disposed = true;
    map.off('styledata', refresh);
    const current = map.getLayersOrder();
    rememberAddedLayers(current);
    applyOrder(originalOrder, current);
  };
}
