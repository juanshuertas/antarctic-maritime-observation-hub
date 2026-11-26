/** Public model output, not an in-situ station observation. */
export interface PolarWeatherPoint {
  station: string;
  latitude: number;
  longitude: number;
  temperatureC: number | null;
  windKts: number | null;
  validAt: string;
  delivery: 'direct' | 'snapshot';
}

const STATIONS = [
  { name: 'Rothera', latitude: -67.57, longitude: -68.13 },
  { name: 'McMurdo', latitude: -77.85, longitude: 166.67 },
  { name: 'Carlini', latitude: -62.238, longitude: -58.667 },
] as const;

const FORECAST_URL = new URL('https://api.open-meteo.com/v1/forecast');
FORECAST_URL.searchParams.set('latitude', STATIONS.map(station => station.latitude).join(','));
FORECAST_URL.searchParams.set('longitude', STATIONS.map(station => station.longitude).join(','));
FORECAST_URL.searchParams.set('current', 'temperature_2m,wind_speed_10m');
FORECAST_URL.searchParams.set('wind_speed_unit', 'kn');
FORECAST_URL.searchParams.set('timezone', 'UTC');

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function recentTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const age = Date.now() - Date.parse(value);
  return Number.isFinite(age) && age >= -60 * 60_000 && age <= 3 * 60 * 60_000;
}

async function fetchDirect(): Promise<PolarWeatherPoint[]> {
  const response = await fetch(FORECAST_URL, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length !== STATIONS.length) throw new Error('Formato meteorológico inesperado');

  const points = rows.flatMap((row, index) => {
    if (!row || typeof row !== 'object' || !('current' in row)) return [];
    const current = row.current;
    if (!current || typeof current !== 'object' || !('time' in current) || typeof current.time !== 'string') return [];
    const validAt = `${current.time}Z`;
    // Never present a stale or future model value as current.
    if (!recentTime(validAt)) return [];
    const temperatureC = 'temperature_2m' in current ? finite(current.temperature_2m) : null;
    const windKts = 'wind_speed_10m' in current ? finite(current.wind_speed_10m) : null;
    if (temperatureC === null && windKts === null) return [];
    return [{
      station: STATIONS[index].name,
      latitude: STATIONS[index].latitude,
      longitude: STATIONS[index].longitude,
      temperatureC,
      windKts,
      validAt,
      delivery: 'direct' as const,
    }];
  });
  if (!points.length) throw new Error('No hay pronóstico polar vigente');
  return points;
}

async function fetchDatedSnapshot(): Promise<PolarWeatherPoint[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/live/weather.json`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Weather snapshot HTTP ${response.status}`);
  const snapshot: unknown = await response.json();
  if (!snapshot || typeof snapshot !== 'object' || !('type' in snapshot) || snapshot.type !== 'weather_model'
      || !('fetched_at' in snapshot) || !recentTime(snapshot.fetched_at)
      || !('points' in snapshot) || !Array.isArray(snapshot.points)) {
    throw new Error('Pronóstico archivado ausente o vencido');
  }
  const points = snapshot.points.filter((point): point is PolarWeatherPoint =>
    point && typeof point === 'object' && typeof point.station === 'string'
    && recentTime(point.validAt) && (finite(point.temperatureC) !== null || finite(point.windKts) !== null)
  );
  if (!points.length) throw new Error('Pronóstico archivado sin valores vigentes');
  return points.map(point => ({ ...point, delivery: 'snapshot' as const }));
}

export async function fetchOpenPolarWeather(): Promise<PolarWeatherPoint[]> {
  try {
    return await fetchDirect();
  } catch {
    return fetchDatedSnapshot();
  }
}
