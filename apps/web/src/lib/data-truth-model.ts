/**
 * AMOH V8.2 — Data Truth & Provenance Model
 * Enforces strict provenance metadata and prevents fallback/cached data from impersonating live feeds.
 */

export type SourceState =
  | 'UPSTREAM_LIVE'
  | 'UPSTREAM_RECENT'
  | 'UPSTREAM_HISTORICAL'
  | 'OFFICIAL_STATIC'
  | 'MODEL_ANALYSIS'
  | 'MODEL_FORECAST'
  | 'PROPAGATED'
  | 'LOCAL_CACHE'
  | 'OFFLINE_FALLBACK'
  | 'DEMO'
  | 'USER_RECORD';

export type LayerHealthColor =
  | 'GREEN'   // Upstream verified live/recent
  | 'BLUE'    // Historical / Official static
  | 'AMBER'   // Cached / Stale
  | 'GRAY'    // No data / Outside coverage
  | 'RED'     // Provider error / Offline
  | 'PURPLE'; // Model / Forecast

export interface ProvenanceRecord {
  record_id: string;
  entity_type: string;
  provider: string;
  dataset: string;
  upstream_record_id?: string;
  observed_at?: string;
  retrieved_at?: string;
  valid_at?: string;
  age_description?: string;
  spatial_accuracy?: string;
  temporal_status: SourceState;
  qc_status?: string;
  license: string;
  source_url?: string;
  original_source?: string;
  processing_level?: string;
  quality_score?: number;
  freshness: SourceState;
  is_fallback: boolean;
  is_demo: boolean;
  is_cached: boolean;
  is_modelled: boolean;
}

export const SOURCE_STATE_LABELS: Record<SourceState, { label: string; badgeColor: string; health: LayerHealthColor }> = {
  UPSTREAM_LIVE: { label: 'EN VIVO (UPSTREAM LIVE)', badgeColor: '#00e5ff', health: 'GREEN' },
  UPSTREAM_RECENT: { label: 'RECIENTE VERIFICADO', badgeColor: '#00e676', health: 'GREEN' },
  UPSTREAM_HISTORICAL: { label: 'ARCHIVO HISTÓRICO', badgeColor: '#4da8ff', health: 'BLUE' },
  OFFICIAL_STATIC: { label: 'REFERENCIA OFICIAL ESTÁTICA', badgeColor: '#a78bfa', health: 'BLUE' },
  MODEL_ANALYSIS: { label: 'ANÁLISIS DE MODELO', badgeColor: '#c084fc', health: 'PURPLE' },
  MODEL_FORECAST: { label: 'PRONÓSTICO MODELADO', badgeColor: '#e879f9', health: 'PURPLE' },
  PROPAGATED: { label: 'PROPAGADO POR EFEMÉRIDES', badgeColor: '#38bdf8', health: 'BLUE' },
  LOCAL_CACHE: { label: 'COPIA LOCAL EN CACHÉ', badgeColor: '#f59e0b', health: 'AMBER' },
  OFFLINE_FALLBACK: { label: 'REFERENCIA OFFLINE', badgeColor: '#f59e0b', health: 'AMBER' },
  DEMO: { label: 'DATOS DE DEMOSTRACIÓN', badgeColor: '#ef4444', health: 'RED' },
  USER_RECORD: { label: 'OBSERVACIÓN DE CAMPO LOCAL', badgeColor: '#10b981', health: 'GREEN' },
};

export function getHealthColorHex(health: LayerHealthColor): string {
  switch (health) {
    case 'GREEN': return '#00e676';
    case 'BLUE': return '#38bdf8';
    case 'AMBER': return '#f59e0b';
    case 'GRAY': return '#64748b';
    case 'RED': return '#ef4444';
    case 'PURPLE': return '#c084fc';
    default: return '#64748b';
  }
}

export function formatEvidenceId(recordId: string, provider: string): string {
  const cleanProv = provider.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
  const cleanId = recordId.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
  return `EVID-${cleanProv}-${cleanId}-${Date.now().toString(36).toUpperCase()}`;
}
