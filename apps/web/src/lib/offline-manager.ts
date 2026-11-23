/**
 * AMOH V9 — OfflineManager
 * Offline-First execution engine for whole-continent Antarctic observation.
 * Operates with 0 internet connection (National Geographic Resolution 10-day field mode).
 */

import { ANTARCTIC_SECTORS } from './antarctic-bounds';

export type NetworkOperationalMode = 'OFFLINE' | 'DEGRADED' | 'ONLINE';

export interface CachedDataset {
  providerId: string;
  datasetId: string;
  timestamp: number;
  coverageBbox: [number, number, number, number];
  featureCount: number;
  data: any;
}

const CACHE_DB_NAME = 'amoh_v9_offline_cache';
const CACHE_STORE_NAME = 'layer_snapshots';

class OfflineManagerEngine {
  private mode: NetworkOperationalMode = 'OFFLINE';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: Map<string, CachedDataset> = new Map();
  private listeners: Set<(mode: NetworkOperationalMode) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Determine initial state from navigator
      this.mode = navigator.onLine ? 'ONLINE' : 'OFFLINE';
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB not supported'));
      }
      const req = indexedDB.open(CACHE_DB_NAME, 2);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'datasetId' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.dbPromise;
  }

  private handleNetworkChange(isOnline: boolean) {
    const old = this.mode;
    if (!isOnline) {
      this.mode = 'OFFLINE';
    } else {
      // Check if degraded (Starlink high latency or packet loss)
      this.mode = 'ONLINE';
    }
    if (old !== this.mode) {
      console.log(`[AMOH V9 OfflineManager] Network state changed: ${old} -> ${this.mode}`);
      this.listeners.forEach((cb) => cb(this.mode));
    }
  }

  public getMode(): NetworkOperationalMode {
    return this.mode;
  }

  public setMode(mode: NetworkOperationalMode) {
    this.mode = mode;
    this.listeners.forEach((cb) => cb(this.mode));
  }

  public subscribe(cb: (mode: NetworkOperationalMode) => void): () => void {
    this.listeners.add(cb);
    cb(this.mode);
    return () => this.listeners.delete(cb);
  }

  /**
   * Caches a dataset snapshot for offline whole-continent use
   */
  public async cacheDataset(providerId: string, datasetId: string, data: any, featureCount = 0): Promise<void> {
    const entry: CachedDataset = {
      providerId,
      datasetId,
      timestamp: Date.now(),
      coverageBbox: [-180, -90, 180, -45],
      featureCount,
      data,
    };

    this.memoryCache.set(datasetId, entry);

    try {
      const db = await this.initDB();
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CACHE_STORE_NAME);
      store.put(entry);
    } catch (e) {
      console.warn(`[AMOH V9] Failed to persist ${datasetId} in IndexedDB:`, e);
    }
  }

  /**
   * Retrieves dataset from cache or executes upstream query
   */
  public async query(
    providerId: string,
    datasetId: string,
    fetchOnlineFn?: () => Promise<any>
  ): Promise<{ source: 'LOCAL_CACHE' | 'UPSTREAM_LIVE' | 'OFFLINE_FALLBACK'; data: any; count: number; timestamp: number }> {
    // 1. If memory cache has it and it's offline mode, return immediate
    if (this.memoryCache.has(datasetId)) {
      const cached = this.memoryCache.get(datasetId)!;
      if (this.mode === 'OFFLINE' || !fetchOnlineFn) {
        return {
          source: 'LOCAL_CACHE',
          data: cached.data,
          count: cached.featureCount,
          timestamp: cached.timestamp,
        };
      }
    }

    // 2. Try IndexedDB if memory cache empty
    try {
      const db = await this.initDB();
      const tx = db.transaction(CACHE_STORE_NAME, 'readonly');
      const store = tx.objectStore(CACHE_STORE_NAME);
      const req = store.get(datasetId);
      const diskEntry = await new Promise<CachedDataset | null>((resolve) => {
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });

      if (diskEntry) {
        this.memoryCache.set(datasetId, diskEntry);
        if (this.mode === 'OFFLINE' || !fetchOnlineFn) {
          return {
            source: 'LOCAL_CACHE',
            data: diskEntry.data,
            count: diskEntry.featureCount,
            timestamp: diskEntry.timestamp,
          };
        }
      }
    } catch (e) {
      // ignore IndexedDB errors
    }

    // 3. If online/degraded and fetch function provided, query upstream
    if (this.mode !== 'OFFLINE' && fetchOnlineFn) {
      try {
        const liveData = await fetchOnlineFn();
        const count = Array.isArray(liveData)
          ? liveData.length
          : liveData?.features?.length || liveData?.records?.length || 1;
        await this.cacheDataset(providerId, datasetId, liveData, count);
        return {
          source: 'UPSTREAM_LIVE',
          data: liveData,
          count,
          timestamp: Date.now(),
        };
      } catch (err) {
        console.warn(`[AMOH V9] Upstream fetch failed for ${datasetId}, falling back to cache:`, err);
      }
    }

    // 4. Fallback to cached version if upstream failed
    if (this.memoryCache.has(datasetId)) {
      const cached = this.memoryCache.get(datasetId)!;
      return {
        source: 'OFFLINE_FALLBACK',
        data: cached.data,
        count: cached.featureCount,
        timestamp: cached.timestamp,
      };
    }

    return {
      source: 'OFFLINE_FALLBACK',
      data: null,
      count: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Pre-load baseline Antarctic datasets for 10-day disconnected field operation
   */
  /**
   * `network: true` descarga los datasets base para operar 10 dias sin conexion.
   * Por defecto NO se baja nada: al abrir el observatorio (sobre todo en celular)
   * no tiene sentido traer ~1 MB de GeoJSON que nadie pidio. Cada capa se cachea
   * sola al activarse, via OfflineManager.query().
   */
  public async preloadAntarcticBaselines(options: { network?: boolean } = {}): Promise<void> {
    const withNetwork = options.network === true;
    try {
      console.log('[AMOH V9] Pre-loading 18-sector Antarctic baselines into IndexedDB v2...');
      // 1. Seed stations synthetic fallback
      const stationsSeed = {
        type: 'FeatureCollection',
        features: ANTARCTIC_SECTORS.map((s) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [(s.lon_min + s.lon_max) / 2, (s.lat_min + s.lat_max) / 2],
          },
          properties: {
            name: `Sector Hub: ${s.name}`,
            zone: s.zone,
            priority: s.scientificPriority,
            targetSpecies: s.targetSpecies,
          },
        })),
      };
      await this.cacheDataset('comnap', 'antarctic_facilities', stationsSeed, stationsSeed.features.length);

      // 2. Pre-cache high-priority local static datasets in background if online or available locally
      const coreFiles = [
        { provider: 'naturalearth', id: 'ne_land', url: '/data/ne_land.json' },
        { provider: 'naturalearth', id: 'ne_antarctic_ice', url: '/data/ne_antarctic_ice.json' },
        { provider: 'comnap', id: 'comnap_stations', url: '/data/web/geojson/comnap_stations.geojson' },
        { provider: 'maritime', id: 'maritime_vessels', url: '/data/web/geojson/maritime_vessels.geojson' },
        { provider: 'aviation', id: 'polar_aircraft', url: '/data/web/geojson/polar_aircraft.geojson' },
        { provider: 'ccamlr', id: 'ccamlr_zones', url: '/data/web/geojson/ccamlr_zones.geojson' },
        { provider: 'ats', id: 'treaty_claims', url: '/data/web/geojson/treaty_claims.geojson' },
        { provider: 'ats', id: 'aspa', url: '/data/web/geojson/aspa.geojson' },
        { provider: 'biodiversity', id: 'fauna_penguins', url: '/data/web/geojson/fauna_penguins.geojson' },
        { provider: 'biodiversity', id: 'fauna_whale_pods', url: '/data/web/geojson/fauna_whale_pods.geojson' },
        { provider: 'copernicus', id: 'antarctic_ozone', url: '/data/web/geojson/antarctic_ozone.geojson' },
        { provider: 'argo', id: 'argo_floats', url: '/data/web/geojson/argo_floats.geojson' },
      ];

      if (!withNetwork) return;
      for (const item of coreFiles) {
        if (!this.memoryCache.has(item.id)) {
          fetch(item.url)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (data) {
                const count = Array.isArray(data) ? data.length : data.features?.length || 1;
                this.cacheDataset(item.provider, item.id, data, count);
              }
            })
            .catch(() => {
              // Silently ignore background prefetch errors
            });
        }
      }
    } catch (e) {
      console.warn('[AMOH V9] preloadAntarcticBaselines notice:', e);
    }
  }
}

export const OfflineManager = new OfflineManagerEngine();

if (typeof window !== 'undefined') {
  (window as any).__offlineManager = OfflineManager;
  // Solo siembra el fallback sintetico en IndexedDB; la descarga de los
  // datasets base es opt-in:  __offlineManager.preloadAntarcticBaselines({ network: true })
  OfflineManager.preloadAntarcticBaselines();
}
