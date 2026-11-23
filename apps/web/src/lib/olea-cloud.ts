/**
 * OLEA — puente con Supabase para el observatorio publico.
 *
 * El sitio publicado en GitHub Pages no tiene backend propio, asi que las
 * contribuciones de campo van a Supabase: las fotos a Storage y el registro a
 * `olea_public_observations`. Esa tabla esta separada a proposito de
 * `pb124_observations`, que es la cadena auditada de la expedicion: lo que entra
 * por aqui nace como PENDING_REVIEW.
 *
 * La clave publicable (sb_publishable_...) es publica por diseno. La politica RLS solo permite INSERTAR:
 * nadie puede leer las observaciones ni las fotos de otras personas desde el
 * navegador. La clave del modelo de vision NO esta aqui: vive en los secretos
 * de la Edge Function `olea-vision`.
 */

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://zzynhovjmgbfalfglgko.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'sb_publishable_JSxDOfKrbB4TrqAXw0dRLA_7SwNQoxD';

const BUCKET = 'olea-public-observations';
const TABLE = 'olea_public_observations';

export const cloudEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function authHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  };
}

// ---------------------------------------------------------------- imagenes

/**
 * Reduce la foto antes de mandarla: en el mar el ancho de banda es caro y una
 * captura de celular moderna pesa varios MB sin aportar nada al registro.
 */
export async function shrinkImage(
  source: Blob,
  maxSide = 1600,
  quality = 0.82,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar la imagen en este navegador.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  );
  if (!blob) throw new Error('No se pudo comprimir la imagen.');
  return { blob, width, height };
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}

// ---------------------------------------------------------------- vision

export interface VisionLabel {
  label: string;
  scientific_name?: string | null;
  confidence?: number;
}

export interface VisionResult {
  ok: boolean;
  provider?: string;
  model?: string;
  summary?: string;
  labels?: VisionLabel[];
  confidence?: number;
  caveats?: string;
  error?: string;
}

/** Identificacion asistida. La foto se manda a la Edge Function, no al modelo directamente. */
export async function identifyPhoto(params: {
  blob: Blob;
  hintType?: string;
  lat?: number | null;
  lon?: number | null;
  signal?: AbortSignal;
}): Promise<VisionResult> {
  const { blob } = await shrinkImage(params.blob, 1024, 0.8);
  const imageBase64 = await blobToBase64(blob);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/olea-vision`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      imageBase64,
      mimeType: 'image/jpeg',
      hintType: params.hintType,
      lat: typeof params.lat === 'number' ? params.lat : undefined,
      lon: typeof params.lon === 'number' ? params.lon : undefined,
    }),
    signal: params.signal,
  });

  const json = (await res.json().catch(() => ({}))) as VisionResult;
  if (!res.ok || json.ok === false) {
    return { ok: false, error: json.error || `El servicio de identificacion respondio ${res.status}.` };
  }
  return { ...json, ok: true };
}

// ---------------------------------------------------------------- envio

export interface PublicObservationInput {
  observation_type: string;
  notes?: string | null;
  captured_at_utc: string;
  device_local_time?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accuracy_m?: number | null;
  location_source?: 'browser' | 'manual' | 'none' | null;
  observer_name?: string | null;
  observer_contact?: string | null;
  photo_paths: string[];
  ai_identification?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

/** Sube una foto y devuelve su ruta dentro del bucket. */
export async function uploadObservationPhoto(blob: Blob, index: number): Promise<string> {
  const now = new Date();
  const folder = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${folder}/${now.toISOString().replace(/[:.]/g, '-')}_${rand}_${index}.jpg`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'image/jpeg', 'x-upsert': 'false' }),
    body: blob,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`No se pudo subir la foto (${res.status}). ${detail.slice(0, 160)}`);
  }
  return path;
}

/** Inserta la observacion. No pide devolucion: el rol anonimo no puede leer la tabla. */
export async function createPublicObservation(input: PublicObservationInput): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ ...input, source: 'olea-public-web', review_status: 'PENDING_REVIEW' }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`No se pudo registrar la observacion (${res.status}). ${detail.slice(0, 200)}`);
  }
}
