// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Juan Sebastián Huertas Olea. All rights reserved.
// Antarctic Maritime Observation Hub (AMOH) / OLEA

/**
 * Cliente de los modelos oceánicos (HYCOM ESPC-D-V02 + Mercator) y de la capa
 * de ML del backend.
 *
 * La forma de estos endpoints sigue a la del SIPSEM de DIMAR, que resuelve bien
 * la ergonomía de un visor meteomarino: un punto que se consulta con un clic y
 * un meteograma de varios días.
 */

import { api } from './api';

export interface OceanVariable {
  value: number | null;
  unit: string | null;
}

export interface OceanDerived {
  current_speed_ms?: number;
  current_speed_kt?: number;
  current_toward_deg?: number;
  ice_drift_ms?: number;
  ice_drift_toward_deg?: number;
  sea_ice_percent?: number;
  navigability?: string;
}

export interface OceanPoint {
  model: string;
  source?: string;
  latitude: number;
  longitude: number;
  depth_m: number;
  valid_time: string | null;
  variables: Record<string, OceanVariable>;
  derived: OceanDerived;
  coverage_note?: string | null;
  partial_failures?: Record<string, string> | null;
}

export interface OceanStep {
  time: string;
  derived?: OceanDerived;
  [variable: string]: unknown;
}

export interface OceanMeteogram {
  model: string;
  latitude: number;
  longitude: number;
  depth_m: number;
  hours: number;
  units: Record<string, string | null>;
  steps: OceanStep[];
  cadence_note?: string;
}

export interface OceanAxes {
  dataset: string;
  time_iso: (string | null)[];
  time_steps: number;
  lat_range: [number, number] | null;
  lon_range: [number, number] | null;
  coverage_note?: string;
}

export interface OceanStatus {
  active_models: string[];
  primary: string | null;
  hycom: Record<string, unknown>;
  mercator: Record<string, unknown>;
  ml: Record<string, unknown>;
  checked_at: string;
}

/** Límite sur real de ESPC-D-V02. Al sur de aquí el modelo no tiene celdas. */
export const OCEAN_MODEL_SOUTH_LIMIT = -80;

export function isWithinOceanModel(lat: number): boolean {
  return lat >= OCEAN_MODEL_SOUTH_LIMIT && lat <= 90;
}

function qs(params: Record<string, string | number | undefined>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

export const oceanApi = {
  status: () => api.get<OceanStatus>('/api/ocean/status'),

  point: (lat: number, lon: number, opts?: { depth?: number; time?: string; model?: string }) =>
    api.get<OceanPoint>(
      `/api/ocean/point${qs({
        lat, lon, depth: opts?.depth, time: opts?.time, model: opts?.model,
      })}`,
    ),

  meteogram: (lat: number, lon: number, hours = 120, depth?: number, variables?: string[]) =>
    api.get<OceanMeteogram>(
      `/api/ocean/meteogram${qs({
        lat, lon, hours, depth, variables: variables?.join(','),
      })}`,
    ),

  axes: (dataset = 'uv3z') =>
    api.get<OceanAxes>(`/api/ocean/axes${qs({ dataset })}`),

  field: (variable: string, bbox: { north: number; south: number; west: number; east: number },
          opts?: { maxPoints?: number; time?: string }) =>
    api.get<Record<string, unknown>>(
      `/api/ocean/field${qs({
        variable, ...bbox, max_points: opts?.maxPoints, time: opts?.time,
      })}`,
    ),

  compare: (lat: number, lon: number, depth?: number) =>
    api.get<Record<string, unknown>>(`/api/ocean/compare${qs({ lat, lon, depth })}`),

  mlStatus: () => api.get<Record<string, unknown>>('/api/ocean/ml/status'),

  mlPredict: (lat: number, lon: number, target = 'sic', horizonSteps = 2) =>
    api.get<Record<string, unknown>>(
      `/api/ocean/ml/predict${qs({ lat, lon, target, horizon_steps: horizonSteps })}`,
    ),
};

/** Etiquetas en español para lo que se pinta en la tarjeta de punto. */
export const OCEAN_LABELS: Record<string, string> = {
  water_u: 'Corriente E',
  water_v: 'Corriente N',
  water_temp: 'Temperatura',
  salinity: 'Salinidad',
  surf_el: 'Nivel del mar',
  sic: 'Hielo marino',
  sih: 'Espesor de hielo',
  sst: 'Temp. superficie',
  sss: 'Salinidad superficie',
};

export const NAVIGABILITY_LABELS: Record<string, string> = {
  AGUA_ABIERTA: 'Agua abierta',
  HIELO_DISPERSO: 'Hielo disperso',
  HIELO_ABIERTO: 'Hielo abierto',
  HIELO_CERRADO: 'Hielo cerrado',
  HIELO_CERRADO_ESPESOR_ALTO: 'Hielo cerrado, espesor alto',
};
