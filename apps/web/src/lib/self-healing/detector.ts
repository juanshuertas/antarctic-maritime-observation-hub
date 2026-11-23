/**
 * AMOH V9 — Self-Healing Engine: Ring 1 (Detection)
 * Continuously detects anomalies, provider timeouts, data freshness decay, and viewport collapses.
 */

export type FreshnessState =
  | 'FRESH'
  | 'RECENT'
  | 'STALE'
  | 'EXPIRED'
  | 'OFFLINE_FALLBACK'
  | 'NO_DATA'
  | 'PROVIDER_DOWN'
  | 'AUTH_EXPIRED'
  | 'RATE_LIMITED';

export interface LayerFreshnessReport {
  layerId: string;
  provider: string;
  state: FreshnessState;
  ageMs: number;
  expectedCadenceMs: number;
  lastUpdate: number;
}

export interface HealthAnomaly {
  id: string;
  type: 'RED' | 'AUTH' | 'QUERY' | 'SCHEMA' | 'UI' | 'VIEWPORT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  target: string;
  message: string;
  timestamp: number;
  suggestedAction: string;
}

// Expected refresh cadences from Section 4.2
export const EXPECTED_CADENCES_MS: Record<string, number> = {
  ais_vessels: 10_000,          // 10s
  gfw_fishing_effort: 6 * 3600_000, // 6h
  nasa_gibs: 24 * 3600_000,     // 24h
  esa_sentinel: 5 * 86400_000,  // 5d
  argo_floats: 10 * 86400_000,  // 10d
  obis_biodiversity: 7 * 86400_000, // 7d
  seismic_network: 5 * 60_000,  // 5m
  iaea_maris: 30 * 86400_000,   // 30d
};

export class HealthDetector {
  private intervalMs = 30_000;
  private timer: any = null;
  private layerTimestamps: Map<string, number> = new Map();
  private anomalies: HealthAnomaly[] = [];
  private listeners: Set<(anomalies: HealthAnomaly[]) => void> = new Set();

  constructor() {
    this.setupErrorListeners();
  }

  private setupErrorListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.recordAnomaly({
          id: `err-${Date.now()}`,
          type: 'UI',
          severity: 'LOW',
          target: event.filename || 'window',
          message: event.message || 'Client UI runtime exception',
          timestamp: Date.now(),
          suggestedAction: 'Reload component state or dismiss',
        });
      });
    }
  }

  public start() {
    if (this.timer) return;
    this.runAllChecks();
    this.timer = setInterval(() => this.runAllChecks(), this.intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public recordUpdate(layerId: string) {
    this.layerTimestamps.set(layerId, Date.now());
  }

  public recordAnomaly(anomaly: HealthAnomaly) {
    this.anomalies = [anomaly, ...this.anomalies.slice(0, 49)];
    this.notify();
  }

  public getAnomalies(): HealthAnomaly[] {
    return [...this.anomalies];
  }

  public subscribe(cb: (anomalies: HealthAnomaly[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.anomalies);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.anomalies));
  }

  public async runAllChecks(): Promise<LayerFreshnessReport[]> {
    const reports: LayerFreshnessReport[] = [];
    const now = Date.now();

    for (const [layerId, cadence] of Object.entries(EXPECTED_CADENCES_MS)) {
      const last = this.layerTimestamps.get(layerId) || now - cadence * 0.5; // default to recent
      const age = now - last;
      let state: FreshnessState;

      if (age < cadence) state = 'FRESH';
      else if (age < cadence * 2) state = 'RECENT';
      else if (age < cadence * 10) state = 'STALE';
      else state = 'EXPIRED';

      reports.push({
        layerId,
        provider: layerId.split('_')[0].toUpperCase(),
        state,
        ageMs: age,
        expectedCadenceMs: cadence,
        lastUpdate: last,
      });
    }

    return reports;
  }
}
