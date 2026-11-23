// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Juan Sebastián Huertas Olea. All rights reserved.
// Antarctic Maritime Observation Hub (AMOH) / OLEA

/**
 * Estado del mapa en la URL — la práctica de SIPSEM que más echaba en falta OLEA.
 *
 * SIPSEM direcciona su visor con `?capa=viento&z=7&c=11.300,-76.500`: cualquier
 * vista es un enlace que se pega en un correo, se manda por radio o se imprime
 * en un QR. Aquí se adopta el mismo contrato, extendido con el instante del
 * pronóstico:
 *
 *     ?capa=<id>[,<id>...]&z=<zoom>&c=<lat>,<lon>&t=<ISO-8601>
 *
 * Se mantienen los nombres de parámetro de SIPSEM (`capa`, `z`, `c`) a
 * propósito: a quien ya usa el visor de DIMAR la URL le resulta legible.
 *
 * El módulo es autónomo: no importa nada de MapPage, así que puede probarse y
 * evolucionar sin tocar ese archivo de 9.000 líneas.
 */

export interface MapUrlState {
  layers: string[];
  zoom: number | null;
  center: { lat: number; lon: number } | null;
  time: string | null;
}

export const EMPTY_URL_STATE: MapUrlState = {
  layers: [],
  zoom: null,
  center: null,
  time: null,
};

const PARAM_LAYERS = 'capa';
const PARAM_ZOOM = 'z';
const PARAM_CENTER = 'c';
const PARAM_TIME = 't';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Lee el estado desde una query string (por defecto, la de la página). */
export function readMapUrlState(search?: string): MapUrlState {
  if (typeof window === 'undefined' && search === undefined) return { ...EMPTY_URL_STATE };
  const params = new URLSearchParams(
    search !== undefined ? search : window.location.search,
  );

  const rawLayers = params.get(PARAM_LAYERS);
  const layers = rawLayers
    ? rawLayers.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  let zoom: number | null = null;
  const rawZoom = params.get(PARAM_ZOOM);
  if (rawZoom !== null) {
    const parsed = Number.parseFloat(rawZoom);
    if (Number.isFinite(parsed)) zoom = clamp(parsed, 0, 22);
  }

  let center: { lat: number; lon: number } | null = null;
  const rawCenter = params.get(PARAM_CENTER);
  if (rawCenter) {
    const [latRaw, lonRaw] = rawCenter.split(',');
    const lat = Number.parseFloat(latRaw);
    const lon = Number.parseFloat(lonRaw);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      center = { lat: clamp(lat, -90, 90), lon: clamp(lon, -180, 180) };
    }
  }

  let time: string | null = null;
  const rawTime = params.get(PARAM_TIME);
  if (rawTime && !Number.isNaN(Date.parse(rawTime))) time = rawTime;

  return { layers, zoom, center, time };
}

/** Serializa el estado al formato de SIPSEM. */
export function serializeMapUrlState(state: Partial<MapUrlState>): string {
  const params = new URLSearchParams();
  if (state.layers && state.layers.length) {
    params.set(PARAM_LAYERS, state.layers.join(','));
  }
  if (typeof state.zoom === 'number' && Number.isFinite(state.zoom)) {
    params.set(PARAM_ZOOM, state.zoom.toFixed(2).replace(/\.?0+$/, ''));
  }
  if (state.center) {
    params.set(
      PARAM_CENTER,
      `${state.center.lat.toFixed(3)},${state.center.lon.toFixed(3)}`,
    );
  }
  if (state.time) params.set(PARAM_TIME, state.time);
  return params.toString();
}

/**
 * Escribe el estado en la barra de direcciones sin añadir entradas al
 * historial: mover el mapa no debe llenar el botón "atrás".
 */
export function writeMapUrlState(state: Partial<MapUrlState>): void {
  if (typeof window === 'undefined') return;
  const query = serializeMapUrlState(state);
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  if (next === `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    return;
  }
  window.history.replaceState(window.history.state, '', next);
}

/** URL absoluta para compartir la vista actual. */
export function shareableUrl(state: Partial<MapUrlState>): string {
  if (typeof window === 'undefined') return '';
  const query = serializeMapUrlState(state);
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
}

/**
 * Sincroniza el mapa con la URL.
 *
 * `map` se tipa de forma estructural para no acoplar este módulo a MapLibre ni
 * obligar a importar sus tipos.
 */
export interface MinimalMap {
  getZoom(): number;
  getCenter(): { lat: number; lng: number };
  on(event: string, handler: () => void): unknown;
  off(event: string, handler: () => void): unknown;
}

export interface UrlSyncOptions {
  /** Capas activas en el momento de escribir. */
  getLayers: () => string[];
  /** Instante del pronóstico seleccionado, si lo hay. */
  getTime?: () => string | null;
  /** Milisegundos de espera tras el último movimiento. */
  debounceMs?: number;
}

/**
 * Engancha el mapa a la URL. Devuelve la función para desengancharlo, pensada
 * para el cleanup de un `useEffect`.
 */
export function attachUrlSync(map: MinimalMap, options: UrlSyncOptions): () => void {
  const debounceMs = options.debounceMs ?? 400;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    try {
      const center = map.getCenter();
      writeMapUrlState({
        layers: options.getLayers(),
        zoom: map.getZoom(),
        center: { lat: center.lat, lon: center.lng },
        time: options.getTime ? options.getTime() : null,
      });
    } catch {
      // Un fallo escribiendo la URL nunca debe romper el mapa.
    }
  };

  const onMoveEnd = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  };

  map.on('moveend', onMoveEnd);
  map.on('zoomend', onMoveEnd);
  onMoveEnd();

  return () => {
    if (timer) clearTimeout(timer);
    map.off('moveend', onMoveEnd);
    map.off('zoomend', onMoveEnd);
  };
}

/**
 * Aplica a un mapa el estado leído de la URL. Devuelve `true` si había una
 * vista que restaurar, para que quien llama sepa si debe respetarla en vez de
 * aplicar su encuadre por defecto.
 */
/**
 * Enciende en el workspace las capas que trae la URL (`?capa=a,b`).
 *
 * `applyUrlStateToMap` solo movia la camara: el `capa=` se escribia en la URL
 * (ver `attachUrlSync`) pero nadie lo leia al cargar, asi que un enlace
 * compartido abria el mapa vacio. Esto cierra el contrato de SIPSEM.
 *
 * El modulo sigue siendo autonomo: recibe el setter y el resolvedor de alias
 * en vez de importar el workspace o el registro de capas.
 *
 * @returns los ids canonicos que se encendieron.
 */
export function applyUrlLayers(
  state: MapUrlState,
  setLayer: (layerId: string, enabled: boolean) => void,
  resolve: (id: string) => string = (id) => id,
): string[] {
  const applied: string[] = [];
  const seen = new Set<string>();
  for (const raw of state.layers) {
    let id = raw;
    try {
      id = resolve(raw) || raw;
    } catch {
      id = raw;
    }
    if (!id || seen.has(id)) continue;
    seen.add(id);
    setLayer(id, true);
    applied.push(id);
  }
  return applied;
}

export function applyUrlStateToMap(
  state: MapUrlState,
  flyTo: (coords: [number, number], zoom?: number) => void,
): boolean {
  if (!state.center) return false;
  flyTo([state.center.lon, state.center.lat], state.zoom ?? undefined);
  return true;
}
