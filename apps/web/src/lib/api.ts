// Falls back to the current hostname (not a hardcoded "localhost") so phones
// on the expedition LAN that open the app via the edge node's IP still reach
// the right backend — "localhost" on a phone would mean the phone itself.
// In local development use the Vite same-origin proxy. This keeps every
// observatory data request on the page origin and avoids losing layers when
// the backend's CORS middleware is restarted or configured differently.
export const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new ApiError(await res.text().catch(() => res.statusText), res.status);
  return res.json() as Promise<T>;
}

async function requestForm<T>(path: string, form: FormData, headers?: HeadersInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: form,
    headers,
  });
  if (!res.ok) throw new ApiError(await res.text().catch(() => res.statusText), res.status);
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, headers?: HeadersInit) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), headers }),
  postForm: <T>(path: string, form: FormData, headers?: HeadersInit) =>
    requestForm<T>(path, form, headers),
};
