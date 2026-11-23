/**
 * AMOH — geospatial feed adapter contract (spec-required interface).
 * Every external/synthetic feed (AIS, satellite, community, etc.) implements
 * this so the map layer, health indicator, and StatusBar dataMode can treat
 * them uniformly regardless of transport (WS, poll, static file).
 */
export type FeedSourceType = 'live' | 'delayed' | 'historical' | 'static' | 'simulated';

export interface FeedHealth {
  connected: boolean;
  lastEventAtUtc: string | null;
  latencyMs: number | null;
  error: string | null;
}

export interface SourceMetadata {
  id: string;
  name: string;
  license?: string;
  sourceUrl?: string;
  restricted: boolean;
  synthetic: boolean;
}

export interface GeospatialFeedAdapter<T> {
  id: string;
  label: string;
  sourceType: FeedSourceType;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getSnapshot(): Promise<T[]>;
  subscribe?(handler: (event: T) => void): () => void;
  getHealth(): Promise<FeedHealth>;
  getMetadata(): SourceMetadata;
}
