// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Juan Sebastián Huertas Olea. All rights reserved.
// Antarctic Maritime Observation Hub (AMOH) / OLEA

/**
 * Tarjeta de punto — la pieza central de la ergonomía de SIPSEM.
 *
 * En el visor de DIMAR, un clic en el mapa abre una tarjeta con el estado del
 * punto y su evolución por horas. Es lo que convierte un observatorio en algo
 * operable desde el puente. OLEA no lo tenía: el mapa sólo respondía a hover
 * sobre heatmaps.
 *
 * Aquí la versión antártica: corriente, temperatura, salinidad, nivel del mar y
 * —lo que de verdad importa al sur— concentración y espesor de hielo con una
 * lectura de navegabilidad.
 *
 * Datos de HYCOM ESPC-D-V02 vía `/api/ocean/*`. El componente nunca inventa:
 * si el modelo no cubre el punto, lo dice.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NAVIGABILITY_LABELS,
  OCEAN_LABELS,
  OCEAN_MODEL_SOUTH_LIMIT,
  isWithinOceanModel,
  oceanApi,
  type OceanMeteogram,
  type OceanPoint,
} from '../lib/ocean-api';

interface OceanPointCardProps {
  lat: number;
  lon: number;
  onClose: () => void;
  /** Centra el mapa en el punto, si quien usa la tarjeta lo permite. */
  onFlyTo?: (coords: [number, number]) => void;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'out_of_coverage';

function formatCoord(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(3)}°${ns} ${Math.abs(lon).toFixed(3)}°${ew}`;
}

function formatValue(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toFixed(digits);
}

function formatClock(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  return new Date(parsed).toLocaleString('es-CO', {
    weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC',
  });
}

/** Rosa de 8 rumbos a partir de grados. */
function compass(deg: number | undefined): string {
  if (deg === undefined || Number.isNaN(deg)) return '';
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return points[Math.round(((deg % 360) / 45)) % 8];
}

function navigabilityTone(key: string | undefined): string {
  switch (key) {
    case 'AGUA_ABIERTA': return 'var(--wod-env-good, #35c3c8)';
    case 'HIELO_DISPERSO': return 'var(--wod-accent-cyan, #58d5e3)';
    case 'HIELO_ABIERTO': return 'var(--wod-status-warn, #ffd600)';
    default: return 'var(--wod-status-alert, #ff6b4a)';
  }
}

export default function OceanPointCard({ lat, lon, onClose, onFlyTo }: OceanPointCardProps) {
  const [state, setState] = useState<LoadState>('idle');
  const [point, setPoint] = useState<OceanPoint | null>(null);
  const [meteogram, setMeteogram] = useState<OceanMeteogram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!isWithinOceanModel(lat)) {
      setState('out_of_coverage');
      return;
    }
    const current = ++requestId.current;
    setState('loading');
    setError(null);
    try {
      const snapshot = await oceanApi.point(lat, lon);
      if (current !== requestId.current) return;
      setPoint(snapshot);
      setState('ready');
      // El meteograma llega después: la tarjeta ya es útil sin él.
      // Solo las variables que la tira horaria pinta, y las dos de cadencia
      // 3 h: pedir ssh/ice (horarios, 120 pasos) hacia que esto tardase mas
      // de 45 s y la tarjeta se quedara sin meteograma.
      const serie = await oceanApi.meteogram(lat, lon, 72, undefined, [
        'water_u', 'water_v', 'water_temp',
      ]);
      if (current !== requestId.current) return;
      setMeteogram(serie);
    } catch (err) {
      if (current !== requestId.current) return;
      setError(err instanceof Error ? err.message : String(err));
      setState('error');
    }
  }, [lat, lon]);

  useEffect(() => { void load(); }, [load]);

  const rows = useMemo(() => {
    if (!point) return [];
    const order = ['water_temp', 'salinity', 'surf_el', 'sic', 'sih'];
    return order
      .filter((key) => point.variables[key])
      .map((key) => ({
        key,
        label: OCEAN_LABELS[key] ?? key,
        value: point.variables[key].value,
        unit: point.variables[key].unit,
      }));
  }, [point]);

  const derived = point?.derived ?? {};

  return (
    <section
      aria-label="Pronóstico oceánico del punto seleccionado"
      className="w-[340px] max-w-[92vw] rounded-xl overflow-hidden shadow-2xl backdrop-blur"
      style={{
        background: 'var(--wod-bg-surface, rgba(9,18,26,0.92))',
        border: '1px solid var(--wod-border-grid, rgba(88,213,227,0.25))',
        color: 'var(--wod-text-main, #dff3f7)',
      }}
    >
      <header
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid var(--wod-border-grid, rgba(88,213,227,0.25))' }}
      >
        <div className="min-w-0">
          <div
            className="text-[10px] tracking-[0.18em] opacity-70"
            style={{ fontFamily: 'var(--wod-font-mono, ui-monospace, monospace)' }}
          >
            PUNTO DEL MAPA
          </div>
          <div
            className="text-[13px] truncate"
            style={{ fontFamily: 'var(--wod-font-mono, ui-monospace, monospace)' }}
          >
            {formatCoord(lat, lon)}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onFlyTo && (
            <button
              type="button"
              onClick={() => onFlyTo([lon, lat])}
              className="px-2 py-1 text-[11px] rounded opacity-80 hover:opacity-100"
              aria-label="Centrar el mapa en este punto"
            >
              Centrar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-[13px] rounded opacity-80 hover:opacity-100"
            aria-label="Cerrar la tarjeta del punto"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="px-3 py-2.5">
        {state === 'out_of_coverage' && (
          <p className="text-[12px] leading-relaxed opacity-80">
            El modelo oceánico HYCOM no cubre al sur de {OCEAN_MODEL_SOUTH_LIMIT}°.
            Este punto queda fuera de su rejilla.
          </p>
        )}

        {state === 'loading' && (
          <p className="text-[12px] opacity-70">Cargando el pronóstico de esta posición…</p>
        )}

        {state === 'error' && (
          <div className="text-[12px] leading-relaxed">
            <p style={{ color: 'var(--wod-status-alert, #ff6b4a)' }}>
              No se pudo leer el modelo en este punto.
            </p>
            {/* Nunca volcar la respuesta cruda: en la version publica el shim
                devuelve un JSON de servicio que no le dice nada a nadie. */}
            <p className="opacity-70 mt-1 break-words">
              {/sin backend|snapshot|Failed to fetch|NetworkError/i.test(error ?? '')
                ? 'Esta posición no está en la rejilla congelada del modelo. Prueba un punto algo más al norte o dentro del área del Océano Austral.'
                : error}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 px-2 py-1 text-[11px] rounded"
              style={{ border: '1px solid var(--wod-border-grid, rgba(88,213,227,0.25))' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {state === 'ready' && point && (
          <>
            {point.coverage_note && (
              <p className="text-[11px] leading-relaxed opacity-70 mb-2">
                {point.coverage_note}
              </p>
            )}

            {derived.current_speed_kt !== undefined && (
              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className="text-[26px] leading-none"
                  style={{ fontFamily: 'var(--wod-font-mono, ui-monospace, monospace)' }}
                >
                  {formatValue(derived.current_speed_kt, 2)}
                </span>
                <span className="text-[12px] opacity-70">kt de corriente</span>
                {derived.current_toward_deg !== undefined && (
                  <span className="text-[11px] opacity-60 ml-auto">
                    hacia {compass(derived.current_toward_deg)}{' '}
                    ({formatValue(derived.current_toward_deg, 0)}°)
                  </span>
                )}
              </div>
            )}

            {derived.navigability && (
              <div
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded mb-2.5 text-[11px]"
                style={{
                  border: `1px solid ${navigabilityTone(derived.navigability)}`,
                  color: navigabilityTone(derived.navigability),
                }}
              >
                <span aria-hidden>●</span>
                {NAVIGABILITY_LABELS[derived.navigability] ?? derived.navigability}
                {derived.sea_ice_percent !== undefined && (
                  <span className="opacity-80">
                    · {formatValue(derived.sea_ice_percent, 0)}% hielo
                  </span>
                )}
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {rows.map((row) => (
                <div key={row.key} className="flex flex-col">
                  <dt className="text-[10px] uppercase tracking-wider opacity-60">
                    {row.label}
                  </dt>
                  <dd
                    className="text-[13px]"
                    style={{ fontFamily: 'var(--wod-font-mono, ui-monospace, monospace)' }}
                  >
                    {row.key === 'sic'
                      ? `${formatValue((row.value ?? 0) * 100, 0)} %`
                      : `${formatValue(row.value)} ${row.unit ?? ''}`}
                  </dd>
                </div>
              ))}
            </dl>

            {meteogram && meteogram.steps.length > 0 && (
              <div
                className="mt-3 pt-2"
                style={{ borderTop: '1px solid var(--wod-border-grid, rgba(88,213,227,0.2))' }}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1.5">
                  Próximas horas
                </div>
                <ul className="flex gap-2 overflow-x-auto pb-1">
                  {meteogram.steps.slice(0, 10).map((step) => {
                    const speed = step.derived?.current_speed_kt;
                    const temp = step.water_temp as number | null | undefined;
                    return (
                      <li key={step.time} className="shrink-0 text-center min-w-[52px]">
                        <div className="text-[10px] opacity-60">
                          {formatClock(step.time).split(',').pop()?.trim()}
                        </div>
                        <div
                          className="text-[12px]"
                          style={{ fontFamily: 'var(--wod-font-mono, ui-monospace, monospace)' }}
                        >
                          {formatValue(speed, 1)}
                        </div>
                        <div className="text-[10px] opacity-60">
                          {formatValue(temp, 1)}°
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <footer className="mt-2.5 text-[10px] leading-relaxed opacity-55">
              {point.model} · válido {formatClock(point.valid_time)} UTC
            </footer>
          </>
        )}
      </div>
    </section>
  );
}
