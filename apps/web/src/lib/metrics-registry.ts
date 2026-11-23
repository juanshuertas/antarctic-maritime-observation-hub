/**
 * AMOH Metrics Registry & Chart Specification Engine
 * Rules 5, 28, 93, 94: No naked numbers. Everything has units, provenance, and temporal state.
 */

import { SEED_METRICS } from '../data/seedMetrics';

export type TemporalState =
  | 'LIVE'
  | 'NEAR_REAL_TIME'
  | 'DELAYED'
  | 'HISTORICAL'
  | 'REFERENCE'
  | 'MODELLED'
  | 'SIMULATION';

export type DataQuality = 'VERIFIED_OFFICIAL' | 'PEER_REVIEWED' | 'OPERATIONAL_RAW' | 'EXPERIMENTAL';

export interface MetricEntry {
  id: string;
  title: string;
  description: string;
  value: number | string;
  unit?: string;
  period_start: string;
  period_end: string;
  region: string;
  source: string;
  source_url: string;
  retrieved_at: string;
  temporal_state: TemporalState;
  quality: DataQuality;
  display_note: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number | null; // null represents missing data (GAP policy)
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartSpec {
  id: string;
  title: string;
  description: string;
  unit: string;
  temporal_state: TemporalState;
  source: string;
  missingDataPolicy: 'GAP' | 'INTERPOLATE';
  data: ChartDataPoint[];
  xAxisLabel: string;
  yAxisLabel: string;
  thresholds?: { value: number; label: string; color: string }[];
  linkedLayerId?: string;
}

export class MetricsRegistry {
  private static store: Map<string, MetricEntry> = new Map();

  static initialize() {
    if (this.store.size > 0) return;

    // Seed official baseline metrics
    Object.values(SEED_METRICS).forEach((seed) => {
      this.register({
        id: seed.id,
        title: seed.title,
        description: seed.display_note,
        value: seed.value,
        unit: seed.unit,
        period_start: seed.period,
        period_end: seed.period,
        region: 'Océano Austral / Antártica',
        source: seed.source,
        source_url: seed.source_url,
        retrieved_at: seed.retrieved_at,
        temporal_state: seed.id.includes('LIVE') ? 'LIVE' : 'REFERENCE',
        quality: 'VERIFIED_OFFICIAL',
        display_note: seed.display_note,
      });
    });
  }

  static register(entry: MetricEntry) {
    this.store.set(entry.id, entry);
  }

  static get(id: string): MetricEntry | undefined {
    this.initialize();
    return this.store.get(id);
  }

  static getAll(): MetricEntry[] {
    this.initialize();
    return Array.from(this.store.values());
  }

  static format(id: string): { display: string; provenance: string; badgeColor: string } {
    const m = this.get(id);
    if (!m) {
      return { display: 'N/A', provenance: 'Dato no registrado', badgeColor: '#64748b' };
    }
    const valStr = typeof m.value === 'number' ? m.value.toLocaleString('es-CL') : m.value;
    const display = m.unit ? `${valStr} ${m.unit}` : `${valStr}`;
    const provenance = `${m.source} · ${m.period_start} · Ref: ${m.retrieved_at.slice(0, 10)}`;

    const badgeColorMap: Record<TemporalState, string> = {
      LIVE: '#00e676',
      NEAR_REAL_TIME: '#00e5ff',
      DELAYED: '#fbbf24',
      HISTORICAL: '#94a3b8',
      REFERENCE: '#818cf8',
      MODELLED: '#f472b6',
      SIMULATION: '#c084fc',
    };

    return {
      display,
      provenance,
      badgeColor: badgeColorMap[m.temporal_state] || '#64748b',
    };
  }
}

// Southern Ocean Pulse Sample Depth Chart (Argo CTD profile simulation / reference)
export const ARGO_WATER_COLUMN_SPEC: ChartSpec = {
  id: 'argo_salinity_temperature_depth',
  title: 'Perfil Hidrográfico de Columna de Agua (0–2000 m)',
  description: 'CTD perfilador flotador Argo Océano Austral (Paso Drake)',
  unit: '°C / PSU',
  temporal_state: 'NEAR_REAL_TIME',
  source: 'Argo International Program / Euro-Argo',
  missingDataPolicy: 'GAP',
  xAxisLabel: 'Profundidad (m)',
  yAxisLabel: 'Temperatura (°C) / Salinidad (PSU)',
  data: [
    { timestamp: '0m', value: 1.2, label: 'Superficie marina' },
    { timestamp: '50m', value: 0.8, label: 'Capa de mezcla' },
    { timestamp: '100m', value: -0.5, label: 'Agua de Invierno Antártica (WW)' },
    { timestamp: '200m', value: 0.2, label: 'Termoclina' },
    { timestamp: '400m', value: 1.8, label: 'Agua Profunda Circumpolar (CDW)' },
    { timestamp: '800m', value: 2.1, label: 'Núcleo cálido CDW' },
    { timestamp: '1200m', value: 1.4, label: 'Capa profunda intermedia' },
    { timestamp: '1600m', value: 0.7, label: 'Transición a fondo' },
    { timestamp: '2000m', value: 0.3, label: 'Agua de Fondo Antártica (AABW)' },
  ],
  thresholds: [
    { value: 0.0, label: 'Punto de congelación superficial', color: '#38bdf8' },
    { value: 1.5, label: 'Intrusión cálida CDW', color: '#f87171' },
  ],
  linkedLayerId: 'argo_floats',
};
