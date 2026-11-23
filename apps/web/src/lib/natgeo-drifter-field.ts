/**
 * OLEA — "Ocean Currents in Motion" de National Geographic MapMaker, de verdad.
 *
 * Origen declarado por el recurso de aula:
 *   https://education.nationalgeographic.org/resource/mapmaker-ocean-currents/
 *   webmap c69ed6f0677d4eb98d362f6d176dadf9 -> capa "Ocean Currents in Motion"
 *   item   b5b41304a18049f28325674dcdaf5dd3
 *   https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/annual_drifter_mean_v3/ImageServer
 *
 * Datos: Global Drifter Program — NOAA (AOML, CIMAS, PMEL) y Univ. de Miami.
 * Climatología de corriente superficial media anual derivada de derivadores. CC BY 3.0.
 *
 * Por qué este archivo existe
 * ---------------------------
 * El servicio es un ImageServer `TilesOnly` de 2 bandas F64 servido en teselas
 * LERC2: no son teselas de imagen, MapLibre no las puede pintar como ráster, y
 * el servicio no expone `identify` ni `exportImage`. Hasta ahora la capa estaba
 * documentada como no soportada. Aquí se decodifica el LERC en el cliente y se
 * reconstruye el campo vectorial global, que es lo que alimenta la animación de
 * partículas de `CircumpolarFlowCanvas` (antes movida por fórmulas sintéticas).
 *
 * Esquema de teselado (leído de tileInfo, 04-nov-2026)
 * ----------------------------------------------------
 *   EPSG:4326, origen (-180, 85), teselas de 256x256, 3 niveles:
 *   LOD 0 = 1deg/px, LOD 1 = 0.5, LOD 2 = 0.25 (resolucion nativa).
 *   Extensión -180..180 / 85..-73. A LOD 2 el mundo entero son
 *   6 columnas x 3 filas = 18 teselas (~1.25 MB), verificado: todas 200.
 *
 * Convención de la dirección
 * --------------------------
 * El popup de la capa lo dice textualmente: "Direction = Geographic: 0 points
 * due north, and 90 points due east", y el renderer declara
 * `flowRepresentation: "flow_from"`, es decir que el ángulo indica de DÓNDE
 * viene el flujo. Por tanto el vector de movimiento va negado:
 *
 *   u(este)  = -mag * sin(dir)
 *   v(norte) = -mag * cos(dir)
 *
 * El rango observado de la banda de dirección es [-90, 270), consistente con un
 * `90 - atan2(v, u)` sin envolver, lo que respalda que es un rumbo geográfico.
 *
 * Como esa convención es la única pieza que no se puede verificar leyendo
 * metadatos, el campo se **autocalibra** contra la Corriente Circumpolar
 * Antártica: entre 60S y 45S la ACC fluye al este en cualquier climatología de
 * superficie. Si la media zonal sale al oeste, la interpretación se invierte a
 * `flow_to` y queda registrada en `field.calibration`.
 */

import * as LercModule from 'lerc';

/**
 * `lerc` 2.0.0 es UMD (`module.exports = Lerc`). Según cómo resuelva el interop
 * de CommonJS (Vite en dev, Rollup en build, Node en el script de verificación)
 * `decode` puede quedar en el namespace o bajo `default`. Resolverlo así evita
 * un fallo en runtime en un bundle que compila sin quejarse.
 */
const lercDecode: typeof LercModule.decode =
  (LercModule as { decode?: typeof LercModule.decode }).decode ??
  (LercModule as unknown as { default?: { decode: typeof LercModule.decode } }).default?.decode ??
  (() => {
    throw new Error('lerc: no se encontró decode() en el módulo');
  })();

const SERVICE =
  'https://tiledimageservices.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/annual_drifter_mean_v3/ImageServer';

/** tileInfo del servicio. No inventar: viene de `${SERVICE}?f=json`. */
const LOD = 2;
const RES = 0.25;
const TILE = 256;
const ORIGIN_X = -180;
const ORIGIN_Y = 85;
const TILE_ROWS = 3;
const TILE_COLS = 6;

/** Rejilla global a resolución nativa. */
const GRID_W = Math.round(360 / RES); // 1440
const GRID_H = Math.round((85 - -73) / RES); // 632

export const NATGEO_DRIFTER_SOURCE = {
  service: SERVICE,
  item: 'b5b41304a18049f28325674dcdaf5dd3',
  itemPage: 'https://www.arcgis.com/home/item.html?id=b5b41304a18049f28325674dcdaf5dd3',
  webmap: 'c69ed6f0677d4eb98d362f6d176dadf9',
  title: 'Ocean Currents in Motion',
  dataset: 'annual_drifter_mean_v3',
  provider: 'NOAA Global Drifter Program (AOML, CIMAS, PMEL) / Univ. Miami — vía NatGeo MapMaker',
  license: 'CC BY 3.0',
  units: 'm/s',
  resolutionDeg: RES,
  tiles: TILE_ROWS * TILE_COLS,
} as const;

/**
 * Parámetros visuales del FlowRenderer del propio webmap de NatGeo, para que la
 * animación de OLEA se parezca a la suya en vez de inventar una paleta.
 */
export const NATGEO_FLOW_STYLE = {
  trailColor: 'rgba(0, 255, 255, 1)',
  density: 1,
  maxPathLength: 200,
  trailWidth: 1.125,
  trailLength: 150,
  flowSpeed: 40,
  /** Paradas de magnitud en m/s, de la rampa azul->amarillo pálido del renderer. */
  magnitudeStops: [
    { value: 0.001, color: 'rgb(37, 52, 148)' },
    { value: 0.126, color: 'rgb(44, 127, 184)' },
    { value: 0.251, color: 'rgb(65, 182, 196)' },
    { value: 0.375, color: 'rgb(161, 218, 180)' },
    { value: 0.5, color: 'rgb(255, 255, 204)' },
  ],
} as const;

export interface DrifterCalibration {
  /** Media zonal (m/s) en la banda 60S-45S bajo la interpretación documentada. */
  accMeanU: number;
  /** Celdas válidas usadas en la calibración. */
  accSamples: number;
  /** true si hubo que invertir a `flow_to` porque la ACC salía al oeste. */
  flipped: boolean;
}

export interface DrifterField {
  width: number;
  height: number;
  lonMin: number;
  latMax: number;
  res: number;
  /** Componente este, m/s. */
  u: Float32Array;
  /** Componente norte, m/s. */
  v: Float32Array;
  /** Magnitud tal como viene del servicio, m/s. */
  speed: Float32Array;
  /** 1 = celda con dato, 0 = tierra o sin dato. */
  mask: Uint8Array;
  validCells: number;
  tilesLoaded: number;
  tilesFailed: number;
  flowRepresentation: 'flow_from' | 'flow_to';
  calibration: DrifterCalibration;
  loadedAt: string;
}

let field: DrifterField | null = null;
let inFlight: Promise<DrifterField | null> | null = null;

/** Última razón de fallo, para que la UI pueda decir algo concreto. */
let lastError: string | null = null;

export function getNatGeoDrifterField(): DrifterField | null {
  return field;
}

export function getNatGeoDrifterError(): string | null {
  return lastError;
}

export function isNatGeoDrifterReady(): boolean {
  return field !== null;
}

async function fetchTile(row: number, col: number, signal?: AbortSignal): Promise<ArrayBuffer> {
  const res = await fetch(`${SERVICE}/tile/${LOD}/${row}/${col}`, { signal });
  if (!res.ok) throw new Error(`tesela ${row}/${col}: HTTP ${res.status}`);
  return res.arrayBuffer();
}

/**
 * Baja las 18 teselas LERC, las decodifica y arma el campo global.
 * Idempotente: llamadas concurrentes comparten la misma promesa.
 */
export function loadNatGeoDrifterField(signal?: AbortSignal): Promise<DrifterField | null> {
  if (field) return Promise.resolve(field);
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const u = new Float32Array(GRID_W * GRID_H);
    const v = new Float32Array(GRID_W * GRID_H);
    const speed = new Float32Array(GRID_W * GRID_H);
    const mask = new Uint8Array(GRID_W * GRID_H);

    let tilesLoaded = 0;
    let tilesFailed = 0;

    const jobs: Array<{ row: number; col: number }> = [];
    for (let row = 0; row < TILE_ROWS; row++) {
      for (let col = 0; col < TILE_COLS; col++) jobs.push({ row, col });
    }

    // Concurrencia moderada: 18 teselas, 6 a la vez.
    const CONCURRENCY = 6;
    let cursor = 0;
    const worker = async () => {
      for (;;) {
        const job = jobs[cursor++];
        if (!job) return;
        try {
          const buf = await fetchTile(job.row, job.col, signal);
          const img = lercDecode(buf);
          if (img.pixels.length < 2) throw new Error('se esperaban 2 bandas (magnitud, dirección)');
          const mag = img.pixels[0];
          const dir = img.pixels[1];
          const tmask = img.mask;
          const w = img.width;
          const h = img.height;

          for (let py = 0; py < h; py++) {
            const gy = job.row * TILE + py;
            if (gy >= GRID_H) break;
            for (let px = 0; px < w; px++) {
              const gx = job.col * TILE + px;
              if (gx >= GRID_W) break;
              const si = py * w + px;
              if (tmask && !tmask[si]) continue;
              const m = mag[si];
              if (!Number.isFinite(m) || m <= 0) continue;
              const d = dir[si];
              if (!Number.isFinite(d)) continue;
              const rad = (d * Math.PI) / 180;
              const gi = gy * GRID_W + gx;
              // Documentado como `flow_from`: el rumbo dice de dónde viene.
              u[gi] = -m * Math.sin(rad);
              v[gi] = -m * Math.cos(rad);
              speed[gi] = m;
              mask[gi] = 1;
            }
          }
          tilesLoaded++;
        } catch (err) {
          tilesFailed++;
          lastError = err instanceof Error ? err.message : String(err);
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    if (tilesLoaded === 0) {
      lastError = lastError || 'ninguna tesela del servicio de derivadores respondió';
      inFlight = null;
      return null;
    }

    // --- Autocalibración contra la Corriente Circumpolar Antártica ---------
    // Entre 60S y 45S la ACC es al este en cualquier climatología de superficie.
    let accSum = 0;
    let accSamples = 0;
    const yFrom = Math.round((ORIGIN_Y - -45) / RES); // borde norte de la banda
    const yTo = Math.round((ORIGIN_Y - -60) / RES); // borde sur
    for (let gy = yFrom; gy < Math.min(yTo, GRID_H); gy++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        const gi = gy * GRID_W + gx;
        if (!mask[gi]) continue;
        accSum += u[gi];
        accSamples++;
      }
    }
    const accMeanU = accSamples ? accSum / accSamples : 0;
    const flipped = accSamples > 0 && accMeanU < 0;
    if (flipped) {
      for (let i = 0; i < u.length; i++) {
        u[i] = -u[i];
        v[i] = -v[i];
      }
      // eslint-disable-next-line no-console
      console.warn(
        '[natgeo-drifter] La ACC salía al oeste con flowRepresentation=flow_from ' +
          `(media zonal ${accMeanU.toFixed(4)} m/s). Invertido a flow_to.`,
      );
    }

    let validCells = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i]) validCells++;

    field = {
      width: GRID_W,
      height: GRID_H,
      lonMin: ORIGIN_X,
      latMax: ORIGIN_Y,
      res: RES,
      u,
      v,
      speed,
      mask,
      validCells,
      tilesLoaded,
      tilesFailed,
      flowRepresentation: flipped ? 'flow_to' : 'flow_from',
      calibration: { accMeanU, accSamples, flipped },
      loadedAt: new Date().toISOString(),
    };
    inFlight = null;
    return field;
  })();

  return inFlight;
}

export interface DrifterSample {
  u: number;
  v: number;
  speed: number;
}

/**
 * Muestrea el campo en grados. Bilineal sobre las celdas válidas: cerca de la
 * costa promedia solo las que tienen dato, y devuelve null si ninguna de las
 * cuatro vecinas es agua (o si el campo aún no está cargado).
 */
export function sampleNatGeoDrifter(lon: number, lat: number): DrifterSample | null {
  const f = field;
  if (!f) return null;
  if (lat > f.latMax || lat < f.latMax - f.height * f.res) return null;

  const fx = (((lon - f.lonMin) % 360) + 360) % 360 / f.res;
  const fy = (f.latMax - lat) / f.res;

  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;

  let su = 0;
  let sv = 0;
  let ss = 0;
  let wsum = 0;

  for (let dy = 0; dy <= 1; dy++) {
    const gy = y0 + dy;
    if (gy < 0 || gy >= f.height) continue;
    const wy = dy === 0 ? 1 - ty : ty;
    for (let dx = 0; dx <= 1; dx++) {
      const gx = (x0 + dx) % f.width;
      const gi = gy * f.width + (gx < 0 ? gx + f.width : gx);
      if (!f.mask[gi]) continue;
      const w = wy * (dx === 0 ? 1 - tx : tx);
      if (w <= 0) continue;
      su += f.u[gi] * w;
      sv += f.v[gi] * w;
      ss += f.speed[gi] * w;
      wsum += w;
    }
  }

  if (wsum <= 0) return null;
  return { u: su / wsum, v: sv / wsum, speed: ss / wsum };
}

/**
 * Comprobación física del campo cargado, para diagnóstico en consola y para la
 * ficha de procedencia. Cada caso es una corriente cuyo sentido está fuera de
 * discusión en cualquier climatología de superficie.
 */
export function checkNatGeoDrifterPhysics(): Array<{
  name: string;
  lon: number;
  lat: number;
  expect: string;
  got: DrifterSample | null;
  ok: boolean | null;
}> {
  const cases: Array<[string, number, number, string, (s: DrifterSample) => boolean]> = [
    ['ACC — Pasaje de Drake', -60, -58, 'este (u>0)', (s) => s.u > 0],
    ['ACC — sector índico', 90, -50, 'este (u>0)', (s) => s.u > 0],
    ['Corriente Sur Ecuatorial (Pacífico)', -150, -2, 'oeste (u<0)', (s) => s.u < 0],
    ['Gulf Stream — Cabo Hatteras', -73, 36, 'noreste (u>0, v>0)', (s) => s.u > 0 && s.v > 0],
    ['Kuroshio', 142, 35, 'noreste (u>0)', (s) => s.u > 0],
  ];
  return cases.map(([name, lon, lat, expect, pred]) => {
    const got = sampleNatGeoDrifter(lon, lat);
    return { name, lon, lat, expect, got, ok: got ? pred(got) : null };
  });
}
