/**
 * Shared TypeScript contracts mirroring `services/backend/app/schemas.py`
 * and core AMOH scientific/provenance responses.
 */

export type DataState = 'LIVE' | 'CACHED' | 'SIMULATION' | 'UNAVAILABLE';
export type ReviewState = 'UNREVIEWED' | 'REVIEWED' | 'VERIFIED' | 'FLAGGED';

export type ObserverType =
  | 'RESEARCHER'
  | 'EXPEDITION_STAFF'
  | 'GUEST_COMMUNITY'
  | 'SENSOR';

export type SharingPermission = 'private' | 'expedition' | 'public_science';

export interface ObservationCreate {
  expedition_id?: string | null;
  utc?: string | null;
  latitude: number;
  longitude: number;
  position_source?: string;
  accuracy_m?: number | null;
  observer_type?: ObserverType;
  observation_type: string;
  quality_level?: number;
  sharing_permission?: SharingPermission;
  notes?: string | null;
}

export interface MatchupRequest {
  observation_id: string;
  latitude: number;
  longitude: number;
  utc: string;
  expected_mmsi?: string | null;
}

export interface GSDRequest {
  sensor_width_mm?: number | null;
  altitude_m?: number | null;
  focal_length_mm?: number | null;
  image_width_px?: number | null;
}

export interface BrierWeightsRequest {
  agent_forecasts: Record<string, Array<number | null>>;
  outcomes: Array<number | floatLike | null>;
}

type floatLike = number;
