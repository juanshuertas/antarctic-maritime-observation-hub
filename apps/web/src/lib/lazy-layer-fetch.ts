/**
 * lazyFetch — baja los datos de una capa solo cuando la capa se enciende.
 *
 * El observatorio sembraba todas sus capas al montar el mapa: ~100 peticiones
 * y ~1 MB de GeoJSON antes de que nadie pidiera nada, lo que en celular es
 * lento y caro. Con esto, cada `fetch` de datos de capa queda en espera y se
 * dispara la primera vez que esa capa aparece activa en el workspace.
 *
 * Devuelve un Promise<Response> normal, asi que las cadenas .then() existentes
 * no cambian: simplemente no resuelven hasta que la capa se active.
 */
import { WorkspaceStore } from './workspace-store';

type Resume = () => void;

const waiting = new Map<string, Resume[]>();
let subscribed = false;

function ensureSubscription(): void {
  if (subscribed) return;
  subscribed = true;
  WorkspaceStore.subscribe((state) => {
    if (waiting.size === 0) return;
    for (const [layerId, queue] of Array.from(waiting.entries())) {
      if (state.activeLayers?.[layerId]) {
        waiting.delete(layerId);
        for (const resume of queue) resume();
      }
    }
  });
}

function isActive(layerId: string): boolean {
  try {
    return WorkspaceStore.getState().activeLayers?.[layerId] === true;
  } catch {
    return true; // ante la duda, no bloquear
  }
}

export function lazyFetch(layerId: string, url: string, init?: RequestInit): Promise<Response> {
  if (isActive(layerId)) return fetch(url, init);
  ensureSubscription();
  return new Promise<Response>((resolve, reject) => {
    const queue = waiting.get(layerId) ?? [];
    queue.push(() => {
      fetch(url, init).then(resolve, reject);
    });
    waiting.set(layerId, queue);
  });
}

/**
 * Resuelve de inmediato con `fallback` si la capa esta apagada, en vez de
 * pedir sus datos. Al encenderla, useMapLayers la carga desde el registro.
 */
export function whenActive<T>(layerId: string, load: () => Promise<T>, fallback: T): Promise<T> {
  return isActive(layerId) ? load() : Promise.resolve(fallback);
}

export default lazyFetch;
