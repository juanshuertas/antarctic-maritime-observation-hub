import type { AddProtocolAction } from 'maplibre-gl';

/**
 * AMOH / OSIRIS Terrain DEM tile loader.
 * Loads AWS Open Data Terrarium elevation tiles (global high-resolution DEM),
 * with fallback to local pre-cached assets (`/dem/{z}/{x}/{y}.png`) for edge nodes.
 */
const MAX_BYTES = 16 * 1024 * 1024;
const MAX_REQUESTS = 4;
export const TERRAIN_REQUEST_TIMEOUT_MS = 10_000;
const AWS_TERRARIUM_BASE = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/';
const LOCAL_TILE_BASE = '/dem/';

/** Encoded-tile LRU, shared in-flight work and a cancellable request queue. */
export function createTerrainTileLoader(maxBytes = MAX_BYTES) {
  type Consumer = { resolve: (data: ArrayBuffer) => void; reject: (error: unknown) => void; cleanup: () => void };
  type Job = { key: string; controller: AbortController; consumers: Set<Consumer>; started: boolean };
  const cache = new Map<string, ArrayBuffer>();
  const jobs = new Map<string, Job>();
  const queue: Job[] = [];
  let bytes = 0;
  let running = 0;

  const read = (key: string) => {
    const data = cache.get(key);
    if (!data) return undefined;
    cache.delete(key);
    cache.set(key, data);
    return data.slice(0);
  };

  const pump = () => {
    while (running < MAX_REQUESTS && queue.length) {
      const job = queue.shift()!;
      if (!job.consumers.size) continue;
      job.started = true;
      running++;
      const timeout = setTimeout(
        () => job.controller.abort(new DOMException('Terrain request timed out', 'TimeoutError')),
        TERRAIN_REQUEST_TIMEOUT_MS
      );

      void (async () => {
        try {
          // Attempt remote AWS S3 terrarium first, fallback to local /dem/
          let response: Response;
          try {
            response = await fetch(`${AWS_TERRARIUM_BASE}${job.key}.png`, {
              signal: job.controller.signal,
              cache: 'force-cache',
              credentials: 'omit',
            });
            if (!response.ok) throw new Error(`Remote HTTP ${response.status}`);
          } catch {
            response = await fetch(`${LOCAL_TILE_BASE}${job.key}.png`, {
              signal: job.controller.signal,
              cache: 'force-cache',
              credentials: 'omit',
            });
          }

          if (!response.ok) throw new Error(`Terrain tile HTTP ${response.status}`);
          const data = await response.arrayBuffer();
          job.controller.signal.throwIfAborted();

          if (data.byteLength <= maxBytes && job.consumers.size) {
            bytes -= cache.get(job.key)?.byteLength ?? 0;
            cache.delete(job.key);
            cache.set(job.key, data);
            bytes += data.byteLength;
            while (bytes > maxBytes) {
              const oldest = cache.keys().next().value;
              if (!oldest) break;
              bytes -= cache.get(oldest)!.byteLength;
              cache.delete(oldest);
            }
          }
          job.consumers.forEach((consumer) => consumer.resolve(data.slice(0)));
        } catch (error) {
          job.consumers.forEach((consumer) => consumer.reject(error));
        } finally {
          clearTimeout(timeout);
          job.consumers.forEach((consumer) => consumer.cleanup());
          job.consumers.clear();
          if (jobs.get(job.key) === job) jobs.delete(job.key);
          running--;
          pump();
        }
      })();
    }
  };

  return (url: string, signal: AbortSignal): Promise<ArrayBuffer> => {
    const match = /^amoh-dem:\/\/(\d+)\/(\d+)\/(\d+)$/.exec(url);
    if (!match) return Promise.reject(new Error('Invalid terrain tile URL'));
    const [z, x, y] = match.slice(1).map(Number);
    if (z > 14 || x >= 2 ** z || y >= 2 ** z) return Promise.reject(new Error('Terrain tile out of range'));
    if (signal.aborted) return Promise.reject(signal.reason);

    const key = `${z}/${x}/${y}`;
    const hit = read(key);
    if (hit) return Promise.resolve(hit);

    let job = jobs.get(key);
    if (!job) {
      job = { key, controller: new AbortController(), consumers: new Set(), started: false };
      jobs.set(key, job);
      queue.push(job);
    }
    const task = job;

    return new Promise((resolve, reject) => {
      const consumer: Consumer = {
        resolve,
        reject,
        cleanup: () => signal.removeEventListener('abort', abort),
      };
      const abort = () => {
        consumer.cleanup();
        task.consumers.delete(consumer);
        reject(signal.reason);
        if (task.consumers.size) return;
        task.controller.abort();
        if (jobs.get(key) === task) jobs.delete(key);
        if (!task.started) {
          const index = queue.indexOf(task);
          if (index >= 0) queue.splice(index, 1);
        }
      };
      task.consumers.add(consumer);
      signal.addEventListener('abort', abort, { once: true });
      pump();
    });
  };
}

let installed = false;
export function installTerrainTileProtocol(addProtocol: (name: string, handler: AddProtocolAction) => void) {
  if (installed) return;
  const load = createTerrainTileLoader();
  addProtocol('amoh-dem', async (request, controller) => ({
    data: await load(request.url, controller.signal),
    cacheControl: 'max-age=86400',
  }));
  installed = true;
}
