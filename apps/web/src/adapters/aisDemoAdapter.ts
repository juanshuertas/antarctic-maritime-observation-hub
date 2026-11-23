import type { GeospatialFeedAdapter, FeedHealth, SourceMetadata } from './GeospatialFeedAdapter';

/**
 * AMOH — synthetic AIS demo adapter.
 * Not a live feed. Used to demonstrate the map/adapter contract when no real
 * AIS provider (aisstream.io, terrestrial receiver, satellite AIS) is
 * configured. Every position is `synthetic: true` and this adapter's
 * sourceType is "simulated" — the map/StatusBar must never label it LIVE.
 */
export type AisPosition = {
  id: string;
  mmsi: string;
  imo?: string;
  vesselName?: string;
  timestampUtc: string;
  receivedAtUtc: string;
  latitude: number;
  longitude: number;
  sogKnots?: number;
  cogDegrees?: number;
  headingDegrees?: number;
  navStatus?: string;
  shipType?: string;
  sourceId: string;
  sourceMode: 'live' | 'delayed' | 'historical';
  qualityFlags: string[];
  synthetic: true;
};

const DEMO_POSITIONS: AisPosition[] = [
  { id: 'demo-1', mmsi: '000000001', vesselName: 'DEMO VESSEL 1', timestampUtc: new Date().toISOString(), receivedAtUtc: new Date().toISOString(), latitude: -63.4, longitude: -57.0, sogKnots: 9.2, cogDegrees: 210, sourceId: 'ais-demo', sourceMode: 'historical', qualityFlags: ['simulated_only'], synthetic: true },
  { id: 'demo-2', mmsi: '000000002', vesselName: 'DEMO VESSEL 2', timestampUtc: new Date().toISOString(), receivedAtUtc: new Date().toISOString(), latitude: -63.9, longitude: -58.1, sogKnots: 4.5, cogDegrees: 95, sourceId: 'ais-demo', sourceMode: 'historical', qualityFlags: ['simulated_only'], synthetic: true },
];

export class AisDemoAdapter implements GeospatialFeedAdapter<AisPosition> {
  id = 'ais-demo';
  label = 'AIS (demo fixture)';
  sourceType = 'simulated' as const;
  private connected = false;

  async connect() { this.connected = true; }
  async disconnect() { this.connected = false; }
  async getSnapshot() { return DEMO_POSITIONS; }

  async getHealth(): Promise<FeedHealth> {
    return { connected: this.connected, lastEventAtUtc: this.connected ? new Date().toISOString() : null, latencyMs: this.connected ? 0 : null, error: null };
  }

  getMetadata(): SourceMetadata {
    return { id: this.id, name: 'AIS demo fixture', restricted: false, synthetic: true };
  }
}
