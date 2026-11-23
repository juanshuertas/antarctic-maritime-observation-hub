/** Shared entity types mirrored from the backend schema (backend/app/database.py). */

export interface Observation {
  observation_id: string;
  expedition_id: string;
  utc: string;
  latitude: number;
  longitude: number;
  position_source: 'phone_gps' | 'manual' | 'estimated';
  accuracy_m?: number | null;
  observer_type: string;
  observation_type: string;
  quality_level: number;
  qa_qc_status: 'raw' | 'reviewed' | 'accepted' | 'rejected';
  notes?: string | null;
  media_path?: string | null;
}

export interface AisVessel {
  id: number;
  expedition_id: string;
  mmsi?: string | null;
  name?: string | null;
  latitude: number;
  longitude: number;
  speed?: number | null;
  course?: number | null;
  utc: string;
}

export interface SatelliteScene {
  scene_id: string;
  sensor: 'sentinel-1' | 'sentinel-2';
  acquired_utc: string;
  footprint_geojson: GeoJSON.Geometry;
  cloud_cover_pct?: number | null;
}

/** Always rendered as a dashed line and labeled "Simulación / Inferencia Mirofish" — never confused with observed AIS. */
export interface MirofishInference {
  inference_id: string;
  based_on_window: { start_utc: string; end_utc: string };
  path_geojson: GeoJSON.Geometry;
  confidence: number;
  method: string;
}

export interface MatchCandidate {
  match_id: string;
  observation_id: string;
  candidate_type: 'ais' | 'satellite' | 'mirofish';
  candidate_id: string;
  score_time: number;
  score_position: number;
  score_source_quality: number;
  score_total: number;
  decision?: 'accepted' | 'partial' | 'rejected' | 'insufficient' | null;
  decision_note?: string | null;
}
