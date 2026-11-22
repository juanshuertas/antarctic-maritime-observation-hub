// SPDX-License-Identifier: AGPL-3.0-or-later
// AMOH_CINEMATIC_ORBIT_GODS_EYE_V12_1_FIXED
//
// Visual + logic upgrade focused on:
// - more realistic hero aircraft/satellites
// - explicit trajectory cues (where they came from / where they are going)
// - optional space debris overlay when a live source exists
// - polar “Eye of God” observatory focus in immersive modes
// - stable heat runtime (inherits V11 anti-flicker logic)
//
// Scientific/live truth is preserved.
// No backend mutation. No SGP4 mutation. No PB124 mutation.

import type { GeoJSONSource, Map as MlMap } from 'maplibre-gl';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';

type Controller = { refresh: () => void; destroy: () => void };
type HeatPoint = { lng: number; lat: number; weight: number; sourceLayer: string };
type CachedHeat = { points: HeatPoint[]; lastNonEmptyAt: number };
type HistoryEntry = { lng: number; lat: number; t: number; heading?: number };
type SourceClass = 'aircraft' | 'satellite' | 'other';
type FeatureCollection = GeoJSON.FeatureCollection;

type LiveState = {
  aircraftCount: number;
  satelliteCount: number;
  debrisCount: number;
  aircraftLastOk: number;
  satelliteLastOk: number;
  debrisLastOk: number;
};

const controllers = new WeakMap<MlMap, Controller>();
const overlayState = new WeakMap<MlMap, { overlay: any; cache: Map<string, CachedHeat>; airHist: Map<string, HistoryEntry[]>; satHist: Map<string, HistoryEntry[]>; live: LiveState; destroyers: Array<() => void>; wasImmersive: boolean; warmStreak: number; deckOwnsHeat: boolean; lastActiveHeatSig: string; lastDeckSig: string; refreshTimer: number; liveTimer: number; refreshInterval: number; destroyed: boolean; }>();

const HEAT_CACHE_GRACE_MS = 10_000;
const LIVE_REFRESH_MS = 12_000;
const UI_REFRESH_MS = 420;
const HISTORY_AGE_MS = 45 * 60 * 1000;
const HISTORY_MAX_POINTS = 18;

const SOURCES = {
  air: 'amoh-v12-aircraft-live',
  sat: 'amoh-v12-satellites-live',
  debris: 'amoh-v12-space-debris-live',
  airTrail: 'amoh-v12-aircraft-trails',
  satTrail: 'amoh-v12-satellite-trails',
  airLead: 'amoh-v12-aircraft-leads',
  satLead: 'amoh-v12-satellite-leads',
  eye: 'amoh-v12-polar-eye',
} as const;

const LAYERS = {
  eyeHalo: 'amoh-v12-eye-halo',
  eyeRing1: 'amoh-v12-eye-ring-1',
  eyeRing2: 'amoh-v12-eye-ring-2',
  airTrailGlow: 'amoh-v12-air-trail-glow',
  airTrail: 'amoh-v12-air-trail',
  airLeadGlow: 'amoh-v12-air-lead-glow',
  airLead: 'amoh-v12-air-lead',
  satTrailGlow: 'amoh-v12-sat-trail-glow',
  satTrail: 'amoh-v12-sat-trail',
  satLeadGlow: 'amoh-v12-sat-lead-glow',
  satLead: 'amoh-v12-sat-lead',
  debris: 'amoh-v12-debris',
  airGlow: 'amoh-v12-aircraft-glow',
  airHero: 'amoh-v12-aircraft-hero',
  satGlow: 'amoh-v12-satellite-glow',
  satHero: 'amoh-v12-satellite-hero',
} as const;

const V12_PREFIX = 'amoh-v12-';
const OLD_HERO_RE = /^amoh-v(?:9|10|11)-(?:aircraft|satellite)/i;
const RUNTIME_HEAT_RE = /^amoh-runtime-heat-/i;
const RUNTIME_POINT_RE = /^amoh-runtime-points-/i;
const QUANTARCTICA_RE = /^quantarctica/i;
const EARTH_CENTER: [number, number] = [-34.0, -85.7];

function isImmersive(map: MlMap): boolean {
  try {
    return String(map.getProjection?.()?.type ?? '').toLowerCase() === 'globe';
  } catch {
    return false;
  }
}

function emptyFC(): FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function imageDataFromCanvas(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function createGlow(rgb: string, alpha: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);
  const g = ctx.createRadialGradient(80,80,2,80,80,76);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.18, `rgba(${rgb},${alpha * 0.62})`);
  g.addColorStop(0.48, `rgba(${rgb},${alpha * 0.18})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,160,160);
  return imageDataFromCanvas(canvas);
}

function createAircraftImage(): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = 144; canvas.height = 144;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);
  ctx.translate(72, 72);
  ctx.shadowColor = 'rgba(185,248,255,0.95)';
  ctx.shadowBlur = 12;
  const body = new Path2D();
  body.moveTo(0, -56);
  body.lineTo(7, -20);
  body.lineTo(18, 2);
  body.lineTo(55, 12);
  body.lineTo(54, 20);
  body.lineTo(18, 18);
  body.lineTo(8, 49);
  body.lineTo(19, 59);
  body.lineTo(18, 64);
  body.lineTo(0, 55);
  body.lineTo(-18, 64);
  body.lineTo(-19, 59);
  body.lineTo(-8, 49);
  body.lineTo(-18, 18);
  body.lineTo(-54, 20);
  body.lineTo(-55, 12);
  body.lineTo(-18, 2);
  body.lineTo(-7, -20);
  body.closePath();
  const grad = ctx.createLinearGradient(0,-56,0,64);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.45, '#e8f7ff');
  grad.addColorStop(1, '#b7d8e5');
  ctx.fillStyle = grad;
  ctx.fill(body);
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke(body);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(53,232,255,0.92)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0,-18); ctx.lineTo(0,38); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-5, 57); ctx.lineTo(-5, 68); ctx.moveTo(5,57); ctx.lineTo(5,68); ctx.stroke();
  return imageDataFromCanvas(canvas);
}

function createSatelliteImage(): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 144;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataFromCanvas(canvas);
  ctx.translate(80,72);
  ctx.shadowColor = 'rgba(66,240,255,1)';
  ctx.shadowBlur = 12;
  const busGrad = ctx.createLinearGradient(-16,-18,16,18);
  busGrad.addColorStop(0, '#d2fbff');
  busGrad.addColorStop(0.4, '#6bf1ff');
  busGrad.addColorStop(1, '#11bdd7');
  ctx.fillStyle = busGrad;
  ctx.strokeStyle = '#f4ffff';
  ctx.lineWidth = 2.2;
  ctx.fillRect(-16,-18,32,36);
  ctx.strokeRect(-16,-18,32,36);
  const panelGrad = ctx.createLinearGradient(-64,0,64,0);
  panelGrad.addColorStop(0, '#17304e');
  panelGrad.addColorStop(0.5, '#4fefff');
  panelGrad.addColorStop(1, '#17304e');
  ctx.fillStyle = panelGrad;
  ctx.fillRect(-72,-20,42,40);
  ctx.fillRect(30,-20,42,40);
  ctx.strokeStyle = '#dfffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-72,-20,42,40);
  ctx.strokeRect(30,-20,42,40);
  ctx.strokeStyle = 'rgba(5,54,86,0.92)';
  for (const x of [-62,-52,-42,40,50,60]) {
    ctx.beginPath(); ctx.moveTo(x,-18); ctx.lineTo(x,18); ctx.stroke();
  }
  for (const y of [-8, 0, 8]) {
    ctx.beginPath(); ctx.moveTo(-70,y); ctx.lineTo(-32,y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(32,y); ctx.lineTo(70,y); ctx.stroke();
  }
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(0,-18); ctx.lineTo(0,-35); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,-40,6,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, 25); ctx.lineTo(-30, 38); ctx.moveTo(14,25); ctx.lineTo(30,38); ctx.stroke();
  return imageDataFromCanvas(canvas);
}

function ensureImage(map: MlMap, name: string, image: ImageData, meta: Record<string, unknown>) {
  if (map.hasImage(name)) return;
  try { map.addImage(name, image, meta as never); } catch {}
}

function ensureImages(map: MlMap) {
  ensureImage(map, 'amoh-v12-aircraft', createAircraftImage(), { pixelRatio: 2 });
  ensureImage(map, 'amoh-v12-aircraft-glow', createGlow('230,252,255',0.66), { pixelRatio: 2 });
  ensureImage(map, 'amoh-v12-satellite', createSatelliteImage(), { pixelRatio: 2 });
  ensureImage(map, 'amoh-v12-satellite-glow', createGlow('54,242,255',0.80), { pixelRatio: 2 });
}

function ensureSource(map: MlMap, id: string, data?: FeatureCollection) {
  if (map.getSource(id)) return;
  try {
    map.addSource(id, { type: 'geojson', data: data ?? emptyFC(), lineMetrics: true } as never);
  } catch {}
}

function ensureSources(map: MlMap) {
  ensureSource(map, SOURCES.air); ensureSource(map, SOURCES.sat); ensureSource(map, SOURCES.debris);
  ensureSource(map, SOURCES.airTrail); ensureSource(map, SOURCES.satTrail);
  ensureSource(map, SOURCES.airLead); ensureSource(map, SOURCES.satLead);
  ensureSource(map, SOURCES.eye, { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, -90] }, properties: {} }] });
}

function aircraftAltitude(): unknown {
  return ['case', ['has','altitude_ft'], ['*',['to-number',['get','altitude_ft'],0],0.3048], ['has','geo_altitude'], ['to-number',['get','geo_altitude'],0], ['has','baro_altitude'], ['to-number',['get','baro_altitude'],0], ['has','altitude_m'], ['to-number',['get','altitude_m'],0], ['has','height_m'], ['to-number',['get','height_m'],0], 0];
}

function satelliteAltitude(): unknown {
  return ['case', ['has','altitude_m'], ['to-number',['get','altitude_m'],0], ['has','height_m'], ['to-number',['get','height_m'],0], ['has','orbital_altitude_m'], ['to-number',['get','orbital_altitude_m'],0], ['has','altitude_km'], ['*',['to-number',['get','altitude_km'],0],1000], ['has','alt_km'], ['*',['to-number',['get','alt_km'],0],1000], ['has','height_km'], ['*',['to-number',['get','height_km'],0],1000], ['has','orbital_altitude_km'], ['*',['to-number',['get','orbital_altitude_km'],0],1000], 0];
}

function ensurePolarEye(map: MlMap) {
  if (!map.getSource(SOURCES.eye)) return;
  const defs = [
    { id: LAYERS.eyeHalo, type: 'circle', paint: { 'circle-radius': ['interpolate',['linear'],['zoom'],0,220,2,300,4,380], 'circle-color': 'rgba(33,255,248,0.18)', 'circle-blur': 0.92, 'circle-opacity': 0.48 }, layout: { visibility: 'visible' } },
    { id: LAYERS.eyeRing1, type: 'circle', paint: { 'circle-radius': ['interpolate',['linear'],['zoom'],0,170,2,235,4,290], 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': 'rgba(93,245,255,0.45)', 'circle-stroke-width': 1.2, 'circle-opacity': 0.78 }, layout: { visibility: 'visible' } },
    { id: LAYERS.eyeRing2, type: 'circle', paint: { 'circle-radius': ['interpolate',['linear'],['zoom'],0,95,2,132,4,180], 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': 'rgba(255,255,255,0.34)', 'circle-stroke-width': 1.1, 'circle-opacity': 0.86 }, layout: { visibility: 'visible' } },
  ];
  for (const def of defs) {
    if (map.getLayer(def.id)) continue;
    try { map.addLayer({ source: SOURCES.eye, ...def } as never); } catch {}
  }
}

function ensureLineLayer(map: MlMap, id: string, source: string, paint: Record<string, unknown>, minzoom = 0) {
  if (map.getLayer(id)) return;
  try {
    map.addLayer({
      id, type: 'line', source, minzoom,
      layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'visible' },
      paint,
    } as never);
  } catch {}
}

function ensureCircleLayer(map: MlMap, id: string, source: string, paint: Record<string, unknown>) {
  if (map.getLayer(id)) return;
  try {
    map.addLayer({ id, type: 'circle', source, layout: { visibility: 'visible' }, paint } as never);
  } catch {}
}

function ensureSymbolLayer(map: MlMap, id: string, source: string, image: string, size: unknown, offsetExpr: unknown, rotateExpr: unknown | null, opacity = 1) {
  if (map.getLayer(id)) return;
  try {
    map.addLayer({
      id, type: 'symbol', source, minzoom: 0,
      layout: {
        'symbol-placement': 'point',
        'symbol-height-offset': offsetExpr as never,
        'icon-image': image,
        'icon-size': size as never,
        ...(rotateExpr ? { 'icon-rotate': rotateExpr as never, 'icon-rotation-alignment': 'map' } : { 'icon-rotation-alignment': 'viewport' }),
        'icon-pitch-alignment': 'viewport',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: { 'icon-opacity': opacity },
    } as never);
  } catch {}
}

function ensureLayers(map: MlMap) {
  ensureImages(map);
  ensureSources(map);
  ensurePolarEye(map);

  ensureLineLayer(map, LAYERS.airTrailGlow, SOURCES.airTrail, { 'line-color': 'rgba(210,248,255,0.24)', 'line-width': ['interpolate',['linear'],['zoom'],0,3.0,2,3.6,5,4.5], 'line-opacity': 0.92, 'line-blur': 0.6 });
  ensureLineLayer(map, LAYERS.airTrail, SOURCES.airTrail, { 'line-color': 'rgba(255,255,255,0.78)', 'line-width': ['interpolate',['linear'],['zoom'],0,1.3,2,1.7,5,2.2], 'line-opacity': 0.96, 'line-dasharray': [2,1.2] });
  ensureLineLayer(map, LAYERS.airLeadGlow, SOURCES.airLead, { 'line-color': 'rgba(115,245,255,0.28)', 'line-width': ['interpolate',['linear'],['zoom'],0,2.5,2,3.1,5,4.0], 'line-opacity': 0.86, 'line-blur': 0.6 });
  ensureLineLayer(map, LAYERS.airLead, SOURCES.airLead, { 'line-color': 'rgba(143,115,255,0.94)', 'line-width': ['interpolate',['linear'],['zoom'],0,1.4,2,1.8,5,2.2], 'line-opacity': 0.94, 'line-dasharray': [0.8,1.1] });

  ensureLineLayer(map, LAYERS.satTrailGlow, SOURCES.satTrail, { 'line-color': 'rgba(50,245,255,0.22)', 'line-width': ['interpolate',['linear'],['zoom'],0,2.4,2,3.2,5,4.0], 'line-opacity': 0.78, 'line-blur': 0.8 });
  ensureLineLayer(map, LAYERS.satTrail, SOURCES.satTrail, { 'line-color': 'rgba(122,247,255,0.72)', 'line-width': ['interpolate',['linear'],['zoom'],0,1.0,2,1.4,5,1.8], 'line-opacity': 0.92, 'line-dasharray': [1.2,1.4] });
  ensureLineLayer(map, LAYERS.satLeadGlow, SOURCES.satLead, { 'line-color': 'rgba(59,240,255,0.20)', 'line-width': ['interpolate',['linear'],['zoom'],0,2.0,2,2.6,5,3.1], 'line-opacity': 0.82, 'line-blur': 0.9 });
  ensureLineLayer(map, LAYERS.satLead, SOURCES.satLead, { 'line-color': 'rgba(38,245,255,0.88)', 'line-width': ['interpolate',['linear'],['zoom'],0,1.0,2,1.3,5,1.7], 'line-opacity': 0.94, 'line-dasharray': [1.0,1.6] });

  ensureCircleLayer(map, LAYERS.debris, SOURCES.debris, {
    'circle-radius': ['interpolate',['linear'],['zoom'],0,0.6,2,1.1,4,1.6,6,2.2],
    'circle-color': ['case', ['has','debris_class'], ['match',['get','debris_class'], 'rocket-body','rgba(255,190,88,0.90)','fragment','rgba(255,108,108,0.84)','rgba(154,234,255,0.68)'], 'rgba(154,234,255,0.68)'],
    'circle-opacity': 0.68,
    'circle-stroke-width': 0.6,
    'circle-stroke-color': 'rgba(255,255,255,0.25)'
  });

  ensureSymbolLayer(map, LAYERS.airGlow, SOURCES.air, 'amoh-v12-aircraft-glow', ['interpolate',['linear'],['zoom'],0,0.70,2,0.88,5,1.08], aircraftAltitude(), null, 0.92);
  ensureSymbolLayer(map, LAYERS.airHero, SOURCES.air, 'amoh-v12-aircraft', ['interpolate',['linear'],['zoom'],0,0.72,2,0.94,5,1.16], aircraftAltitude(), ['coalesce',['get','true_track'],['get','track'],['get','heading'],['get','course'],0], 1);

  ensureSymbolLayer(map, LAYERS.satGlow, SOURCES.sat, 'amoh-v12-satellite-glow', ['interpolate',['linear'],['zoom'],0,0.64,2,0.80,5,1.02], satelliteAltitude(), null, 0.94);
  ensureSymbolLayer(map, LAYERS.satHero, SOURCES.sat, 'amoh-v12-satellite', ['interpolate',['linear'],['zoom'],0,0.64,2,0.84,5,1.08], satelliteAltitude(), null, 1);
}

function setGeoJsonSource(map: MlMap, id: string, data: FeatureCollection) {
  const src = map.getSource(id) as GeoJSONSource | undefined;
  if (!src) return;
  try { src.setData(data as never); } catch {}
}

function sourceIdOf(layer: unknown): string {
  try {
    const src = (layer as { source?: unknown }).source;
    return typeof src === 'string' ? src : '';
  } catch { return ''; }
}

function featureProperties(map: MlMap, sourceId: string): Record<string, unknown>[] {
  if (!sourceId) return [];
  try { return map.querySourceFeatures(sourceId).slice(0, 24).map((f) => (f.properties ?? {}) as Record<string, unknown>); } catch { return []; }
}

function classifyProperties(list: Record<string, unknown>[]): SourceClass {
  let aircraft = 0, satellite = 0;
  for (const props of list) {
    const keys = new Set(Object.keys(props).map((k) => k.toLowerCase()));
    for (const key of ['icao24','callsign','true_track','track','baro_altitude','geo_altitude','altitude_ft','velocity','ground_speed']) if (keys.has(key)) aircraft += 1;
    for (const key of ['norad','norad_id','tle','object_name','orbital_altitude_km','altitude_km','period_min','satellite']) if (keys.has(key)) satellite += 1;
    const akm = Number((props as any).altitude_km ?? (props as any).orbital_altitude_km);
    if (Number.isFinite(akm) && akm > 80) satellite += 2;
  }
  if (aircraft >= 2 && aircraft > satellite) return 'aircraft';
  if (satellite >= 2 && satellite >= aircraft) return 'satellite';
  return 'other';
}

function suppressCompetingCraft(map: MlMap) {
  const cache = new Map<string, SourceClass>();
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.id.startsWith(V12_PREFIX)) continue;
    if (layer.type !== 'circle' && layer.type !== 'symbol') continue;
    const src = sourceIdOf(layer);
    if (RUNTIME_POINT_RE.test(src) || RUNTIME_HEAT_RE.test(src)) continue;
    const combined = `${layer.id} ${src}`.toLowerCase();
    let craft: SourceClass = 'other';
    if (/polar_aircraft|aviation|aircraft|flights/.test(combined)) craft = 'aircraft';
    else if (/polar_satellites|satellite|satélites|sgp4|norad/.test(combined)) craft = 'satellite';
    else if (src) {
      craft = cache.get(src) ?? classifyProperties(featureProperties(map, src));
      cache.set(src, craft);
    }
    if (craft === 'other') continue;
    try { map.setLayoutProperty(layer.id, 'visibility', 'none'); } catch {}
    if (layer.type === 'circle') {
      try { map.setPaintProperty(layer.id, 'circle-opacity', 0); } catch {}
      try { map.setPaintProperty(layer.id, 'circle-stroke-opacity', 0); } catch {}
    }
    if (layer.type === 'symbol') {
      try { map.setPaintProperty(layer.id, 'icon-opacity', 0); } catch {}
      try { map.setPaintProperty(layer.id, 'text-opacity', 0); } catch {}
    }
  }
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!OLD_HERO_RE.test(layer.id)) continue;
    try { map.setLayoutProperty(layer.id, 'visibility', 'none'); } catch {}
  }
}

function immersiveCleanup(map: MlMap) {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (!QUANTARCTICA_RE.test(layer.id)) continue;
    if (layer.type === 'symbol') { try { map.setLayoutProperty(layer.id, 'visibility', 'none'); } catch {} }
    if (layer.type === 'fill') { try { map.setPaintProperty(layer.id, 'fill-opacity', 0.018); } catch {} }
    if (layer.type === 'line') { try { map.setPaintProperty(layer.id, 'line-opacity', /coast/i.test(layer.id) ? 0.25 : 0.05); } catch {} }
  }
}

function featureCollectionFromCanonical(map: MlMap, sourceId: string): FeatureCollection | null {
  if (!map.getSource(sourceId)) return null;
  try {
    const features = map.querySourceFeatures(sourceId) as unknown as GeoJSON.Feature[];
    if (!features.length) return null;
    const clean: GeoJSON.Feature[] = [];
    const seen = new Set<string>();
    for (const f of features) {
      const g: any = f.geometry;
      if (g?.type !== 'Point' || !Array.isArray(g.coordinates)) continue;
      const id = String(f.id ?? (f.properties as any)?.id ?? (f.properties as any)?.norad_id ?? (f.properties as any)?.icao24 ?? '');
      const key = `${id}:${g.coordinates[0]}:${g.coordinates[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      clean.push(f);
    }
    return clean.length ? { type: 'FeatureCollection', features: clean } : null;
  } catch { return null; }
}

async function fetchJson(candidates: string[]): Promise<any | null> {
  for (const url of candidates) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6500);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!res.ok) continue;
      return await res.json();
    } catch {
    } finally {
      window.clearTimeout(timeout);
    }
  }
  return null;
}

function validFeatureCollection(value: any): value is FeatureCollection {
  return value?.type === 'FeatureCollection' && Array.isArray(value.features);
}

function toNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toId(props: Record<string, unknown> | undefined, fallback: string): string {
  if (!props) return fallback;
  return String((props as any).icao24 ?? (props as any).callsign ?? (props as any).id ?? (props as any).norad_id ?? (props as any).object_name ?? fallback);
}

function lonLat(feature: any): [number, number] | null {
  const g = feature?.geometry;
  if (g?.type !== 'Point' || !Array.isArray(g.coordinates)) return null;
  const lon = Number(g.coordinates[0]);
  const lat = Number(g.coordinates[1]);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lon, lat];
}

function radians(v: number): number { return v * Math.PI / 180; }
function degrees(v: number): number { return v * 180 / Math.PI; }

function projectPoint(lon: number, lat: number, bearingDeg: number, distanceKm: number): [number, number] {
  const R = 6371;
  const brng = radians(bearingDeg);
  const lat1 = radians(lat);
  const lon1 = radians(lon);
  const d = distanceKm / R;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  let lonDeg = degrees(lon2);
  while (lonDeg > 180) lonDeg -= 360;
  while (lonDeg < -180) lonDeg += 360;
  return [lonDeg, degrees(lat2)];
}

function distSq(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0]; const dy = a[1] - b[1];
  return dx*dx + dy*dy;
}

function updateHistory(hist: Map<string, HistoryEntry[]>, id: string, point: [number, number], t: number, heading?: number) {
  const arr = hist.get(id) ?? [];
  const prev = arr[arr.length - 1];
  if (!prev || distSq([prev.lng, prev.lat], point) > 0.0005 || (t - prev.t) > 18_000) {
    arr.push({ lng: point[0], lat: point[1], t, heading });
  } else {
    prev.t = t;
    prev.heading = heading ?? prev.heading;
  }
  const minTime = t - HISTORY_AGE_MS;
  while (arr.length && (arr[0].t < minTime || arr.length > HISTORY_MAX_POINTS)) arr.shift();
  hist.set(id, arr);
}

function buildTrailAndLead(hist: Map<string, HistoryEntry[]>, current: FeatureCollection, kind: 'air' | 'sat'): { trail: FeatureCollection; lead: FeatureCollection } {
  const trailFeatures: GeoJSON.Feature[] = [];
  const leadFeatures: GeoJSON.Feature[] = [];
  const now = Date.now();
  for (const feature of current.features as any[]) {
    const p = lonLat(feature);
    if (!p) continue;
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const id = toId(props, String(feature.id ?? Math.random()));
    let heading = toNumber((props as any).true_track ?? (props as any).track ?? (props as any).heading ?? (props as any).course, NaN);
    const history = hist.get(id) ?? [];
    if ((!Number.isFinite(heading)) && history.length >= 2) {
      const a = history[history.length - 2];
      const b = history[history.length - 1];
      const dx = b.lng - a.lng; const dy = b.lat - a.lat;
      if (Math.abs(dx) + Math.abs(dy) > 0.00001) heading = (degrees(Math.atan2(dx, dy)) + 360) % 360;
    }
    updateHistory(hist, id, p, now, Number.isFinite(heading) ? heading : undefined);
    const h = hist.get(id) ?? [];
    if (h.length >= 2) {
      trailFeatures.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: h.map((v) => [v.lng, v.lat]) },
        properties: { id, kind }
      });
    }
    const speed = kind === 'air'
      ? Math.max(180, Math.min(620, toNumber((props as any).ground_speed ?? (props as any).velocity, 410)))
      : Math.max(28000, Math.min(62000, toNumber((props as any).speed_kmh, 28000)));
    const distanceKm = kind === 'air'
      ? Math.max(90, Math.min(420, speed * 0.18))
      : Math.max(350, Math.min(1800, speed * 0.02));
    if (Number.isFinite(heading)) {
      const target = projectPoint(p[0], p[1], heading, distanceKm);
      leadFeatures.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [p, target] },
        properties: { id, kind, heading }
      });
    }
  }
  return { trail: { type: 'FeatureCollection', features: trailFeatures }, lead: { type: 'FeatureCollection', features: leadFeatures } };
}

async function refreshLiveCraft(map: MlMap, state: LiveState, airHist: Map<string, HistoryEntry[]>, satHist: Map<string, HistoryEntry[]>) {
  if (!isImmersive(map)) return;
  ensureSources(map);
  const [airJson, satJson, debrisJson] = await Promise.all([
    fetchJson(['/api/aviation/flights','http://127.0.0.1:8000/api/aviation/flights']),
    fetchJson(['/api/satellites/current','http://127.0.0.1:8000/api/satellites/current']),
    fetchJson(['/api/satellites/debris','http://127.0.0.1:8000/api/satellites/debris']),
  ]);
  let airData = validFeatureCollection(airJson) ? airJson : null;
  let satData = validFeatureCollection(satJson) ? satJson : null;
  let debrisData = validFeatureCollection(debrisJson) ? debrisJson : null;
  airData ??= featureCollectionFromCanonical(map, 'polar_aircraft');
  satData ??= featureCollectionFromCanonical(map, 'polar_satellites_points');
  debrisData ??= featureCollectionFromCanonical(map, 'polar_space_debris');
  debrisData ??= featureCollectionFromCanonical(map, 'space_debris');
  if (airData && airData.features.length) {
    setGeoJsonSource(map, SOURCES.air, airData);
    state.aircraftCount = airData.features.length; state.aircraftLastOk = Date.now();
    const lines = buildTrailAndLead(airHist, airData, 'air');
    setGeoJsonSource(map, SOURCES.airTrail, lines.trail); setGeoJsonSource(map, SOURCES.airLead, lines.lead);
  }
  if (satData && satData.features.length) {
    setGeoJsonSource(map, SOURCES.sat, satData);
    state.satelliteCount = satData.features.length; state.satelliteLastOk = Date.now();
    const lines = buildTrailAndLead(satHist, satData, 'sat');
    setGeoJsonSource(map, SOURCES.satTrail, lines.trail); setGeoJsonSource(map, SOURCES.satLead, lines.lead);
  }
  if (debrisData) {
    setGeoJsonSource(map, SOURCES.debris, debrisData);
    state.debrisCount = debrisData.features.length; state.debrisLastOk = Date.now();
  }
}

function layerVisible(map: MlMap, layerId: string): boolean {
  try { return map.getLayoutProperty(layerId, 'visibility') !== 'none'; } catch { return true; }
}

function featurePoint(feature: any): [number, number] | null {
  const g = feature?.geometry;
  if (g?.type !== 'Point' || !Array.isArray(g.coordinates) || g.coordinates.length < 2) return null;
  const lng = Number(g.coordinates[0]); const lat = Number(g.coordinates[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return [lng, lat];
}

function heatWeight(properties: Record<string, unknown> | undefined): number {
  if (!properties) return 0.18;
  for (const key of ['_amoh_weight_norm','weight_norm','weight','density','intensity','value','score','hours']) {
    const v = Number((properties as any)[key]);
    if (!Number.isFinite(v) || v <= 0) continue;
    if (v <= 1) return Math.max(0.04, Math.min(1, v));
    return Math.max(0.04, Math.min(1, Math.log10(v + 1) / 4));
  }
  return 0.18;
}

function readLayerHeat(map: MlMap, layerId: string): HeatPoint[] {
  const layer = map.getLayer(layerId) as any;
  const source = typeof layer?.source === 'string' ? layer.source : '';
  if (!source) return [];
  let features: any[] = [];
  try { features = map.querySourceFeatures(source) as any[]; } catch { return []; }
  const out: HeatPoint[] = []; const seen = new Set<string>();
  for (const feature of features) {
    const point = featurePoint(feature); if (!point) continue;
    const weight = heatWeight(feature.properties as Record<string, unknown> | undefined);
    const id = String(feature.id ?? feature.properties?.id ?? '');
    const key = `${id}:${point[0].toFixed(5)}:${point[1].toFixed(5)}`;
    if (seen.has(key)) continue; seen.add(key);
    out.push({ lng: point[0], lat: point[1], weight, sourceLayer: layerId });
  }
  return out;
}

function activeHeatLayerIds(map: MlMap): string[] {
  const ids: string[] = [];
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== 'heatmap' || !RUNTIME_HEAT_RE.test(layer.id) || !layerVisible(map, layer.id)) continue;
    ids.push(layer.id);
  }
  return ids.sort();
}

function cachedHeatPoints(map: MlMap, cache: Map<string, CachedHeat>): { points: HeatPoint[]; activeIds: string[]; liveNonEmpty: boolean } {
  const now = Date.now();
  const activeIds = activeHeatLayerIds(map); const activeSet = new Set(activeIds);
  for (const id of [...cache.keys()]) if (!activeSet.has(id)) cache.delete(id);
  let liveNonEmpty = false;
  for (const id of activeIds) {
    const fresh = readLayerHeat(map, id);
    if (fresh.length) { cache.set(id, { points: fresh, lastNonEmptyAt: now }); liveNonEmpty = true; continue; }
    const prev = cache.get(id);
    if (prev && now - prev.lastNonEmptyAt <= HEAT_CACHE_GRACE_MS) continue;
    cache.delete(id);
  }
  return { points: activeIds.flatMap((id) => cache.get(id)?.points ?? []), activeIds, liveNonEmpty };
}

function heatOpacity(activeCount: number): number {
  if (activeCount <= 1) return 0.88;
  if (activeCount === 2) return 0.68;
  if (activeCount === 3) return 0.52;
  if (activeCount === 4) return 0.44;
  return 0.36;
}

function hottest(points: HeatPoint[]): HeatPoint[] {
  if (points.length <= 80) return points.filter((p) => p.weight >= 0.62);
  return [...points].sort((a,b) => b.weight - a.weight).slice(0, Math.min(240, Math.max(50, Math.round(points.length * 0.08))));
}

function makeDeckLayers(points: HeatPoint[], activeCount: number): unknown[] {
  if (!points.length) return [];
  const peak = hottest(points);
  return [
    new HeatmapLayer<HeatPoint>({
      id: 'amoh-v12-stable-heat',
      data: points,
      getPosition: (d) => [d.lng, d.lat],
      getWeight: (d) => d.weight,
      radiusPixels: 23,
      intensity: activeCount <= 1 ? 1.08 : 0.90,
      threshold: 0.03,
      aggregation: 'SUM',
      opacity: heatOpacity(activeCount),
      colorRange: [
        [0, 170, 255, 0],
        [0, 225, 255, 70],
        [0, 238, 186, 132],
        [168, 244, 76, 176],
        [244, 236, 64, 210],
        [255, 165, 43, 236],
        [255, 82, 32, 250],
        [255, 25, 28, 255],
      ],
      parameters: { depthTest: false } as never, // clave WebGL heredada; equivalente deck.gl 9: depthCompare: 'always'
    }),
    new ScatterplotLayer<HeatPoint>({
      id: 'amoh-v12-heat-peaks',
      data: peak,
      getPosition: (d) => [d.lng, d.lat],
      getRadius: (d) => 850 + d.weight * 2450,
      radiusUnits: 'meters',
      radiusMinPixels: 0.4,
      radiusMaxPixels: 1.9,
      getFillColor: (d) => d.weight >= 0.82 ? [255, 88, 34, 168] : [42, 224, 242, 96],
      opacity: activeCount <= 1 ? 0.68 : 0.42,
      stroked: false,
      pickable: false,
      parameters: { depthTest: false } as never, // clave WebGL heredada; equivalente deck.gl 9: depthCompare: 'always'
    }),
  ];
}

function nativeHeatOpacity(map: MlMap, opacity: number) {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type === 'heatmap' && RUNTIME_HEAT_RE.test(layer.id)) {
      try { map.setPaintProperty(layer.id, 'heatmap-opacity', opacity); } catch {}
    }
  }
}

function adaptiveCamera(map: MlMap) {
  const c = map.getContainer();
  const width = c.clientWidth || window.innerWidth;
  const height = c.clientHeight || window.innerHeight;
  let zoom = 1.96;
  if (height < 760) zoom = 1.76;
  else if (height < 880) zoom = 1.86;
  else if (height > 1080) zoom = 2.08;
  if (width < 1500) zoom -= 0.06;
  return { center: EARTH_CENTER, zoom, pitch: 0, bearing: -9 };
}

function applyCameraOnce(map: MlMap) {
  try { map.easeTo({ ...adaptiveCamera(map), duration: 900, essential: true }); } catch {}
}

function applyOleaNativeVisibilityV13B(map: MlMap) {
  const flags = ((window as any).__amohOleaNativeLayers ?? {}) as Record<string, boolean>;

  const resolveFlag = (keys: string[], fallback: boolean): boolean => {
    let found = false;
    let enabled = false;
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(flags, key)) {
        found = true;
        enabled = enabled || flags[key] === true;
      }
    }
    return found ? enabled : fallback;
  };

  const showAircraft = resolveFlag(
    ['polar_aircraft', 'polar_aviation', 'aviation', 'flights'],
    true,
  );
  const showSatellites = resolveFlag(
    ['polar_satellites', 'satellites', 'sgp4_satellites'],
    true,
  );
  const showDebris = resolveFlag(
    ['space_debris', 'polar_space_debris', 'orbital_debris'],
    false,
  );
  const showTrails = resolveFlag(
    ['orbit_tracks', 'flight_tracks', 'trajectories', 'mirofish_trajectories'],
    true,
  );
  const showEye = resolveFlag(
    ['polar_eye', 'gods_eye', 'antarctic_eye'],
    true,
  );

  const setVisible = (id: string, visible: boolean) => {
    if (!map.getLayer(id)) return;
    try {
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
    } catch {}
  };

  for (const id of [LAYERS.airGlow, LAYERS.airHero]) setVisible(id, showAircraft);
  for (const id of [LAYERS.satGlow, LAYERS.satHero]) setVisible(id, showSatellites);
  setVisible(LAYERS.debris, showDebris);

  for (const id of [LAYERS.airTrailGlow, LAYERS.airTrail, LAYERS.airLeadGlow, LAYERS.airLead]) {
    setVisible(id, showAircraft && showTrails);
  }
  for (const id of [LAYERS.satTrailGlow, LAYERS.satTrail, LAYERS.satLeadGlow, LAYERS.satLead]) {
    setVisible(id, showSatellites && showTrails);
  }
  for (const id of [LAYERS.eyeHalo, LAYERS.eyeRing1, LAYERS.eyeRing2]) {
    setVisible(id, showEye);
  }
}

function diagnostics(map: MlMap, state: LiveState, heatIds: string[], heatCount: number, heatPhase: string) {
  (window as any).__amohGodsEyeV12 = {
    version: '12.0',
    projection: (() => { try { return map.getProjection?.()?.type ?? null; } catch { return null; } })(),
    camera: { center: map.getCenter().toArray(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() },
    aviation: { count: state.aircraftCount, lastOk: state.aircraftLastOk },
    satellites: { count: state.satelliteCount, lastOk: state.satelliteLastOk },
    debris: { count: state.debrisCount, lastOk: state.debrisLastOk },
    heat: { phase: heatPhase, activeLayers: heatIds, pointCount: heatCount },
  };
}

export function installCinematicOrbitGodsEyeV12(map: MlMap): Controller {
  const existing = controllers.get(map); if (existing) return existing;
  const overlay = new MapLibreOverlay({ interleaved: true, layers: [] });
  try { map.addControl(overlay as never); } catch { try { const fb = new MapLibreOverlay({ interleaved: false, layers: [] }); map.addControl(fb as never); (overlay as any).__fallback = fb; } catch {} }
  const overlayAny = () => (overlay as any).__fallback ?? overlay;
  const state = {
    overlay: overlayAny(), cache: new Map<string, CachedHeat>(), airHist: new Map<string, HistoryEntry[]>(), satHist: new Map<string, HistoryEntry[]>(),
    live: { aircraftCount: 0, satelliteCount: 0, debrisCount: 0, aircraftLastOk: 0, satelliteLastOk: 0, debrisLastOk: 0 },
    destroyers: [] as Array<() => void>, wasImmersive: false, warmStreak: 0, deckOwnsHeat: false, lastActiveHeatSig: '', lastDeckSig: '', refreshTimer: 0, liveTimer: 0, refreshInterval: 0, destroyed: false,
  };
  overlayState.set(map, state);
  (window as any).__amohCinematicV10 = undefined;
  (window as any).__amohLogicV11 = undefined;

  const refreshHeat = () => {
    const result = cachedHeatPoints(map, state.cache);
    const activeSig = result.activeIds.join('|');
    if (activeSig !== state.lastActiveHeatSig) {
      state.lastActiveHeatSig = activeSig; state.warmStreak = 0; state.deckOwnsHeat = false; nativeHeatOpacity(map, 0.72);
    }
    if (!result.activeIds.length) {
      state.cache.clear(); state.warmStreak = 0; state.deckOwnsHeat = false; state.lastDeckSig = '';
      try { overlayAny().setProps({ layers: [] }); } catch {}
      nativeHeatOpacity(map, 0.72);
      return { ids: [] as string[], count: 0, phase: 'OFF' };
    }
    const deckSig = `${result.activeIds.join(',')}::${result.points.length}::${result.points.slice(0,10).map((p) => `${p.lng.toFixed(3)},${p.lat.toFixed(3)},${p.weight.toFixed(2)}`).join('|')}`;
    if (result.points.length) {
      if (result.liveNonEmpty) state.warmStreak += 1;
      if (deckSig !== state.lastDeckSig) {
        state.lastDeckSig = deckSig;
        try { overlayAny().setProps({ layers: makeDeckLayers(result.points, result.activeIds.length) as never[] }); } catch {}
      }
      if (state.warmStreak >= 2 || state.deckOwnsHeat) {
        state.deckOwnsHeat = true; nativeHeatOpacity(map, 0.025);
        return { ids: result.activeIds, count: result.points.length, phase: 'DECK_STABLE' };
      }
      nativeHeatOpacity(map, 0.54);
      return { ids: result.activeIds, count: result.points.length, phase: 'WARMING' };
    }
    nativeHeatOpacity(map, state.deckOwnsHeat ? 0.025 : 0.72);
    return { ids: result.activeIds, count: 0, phase: state.deckOwnsHeat ? 'CACHE_GRACE' : 'WAITING_DATA' };
  };

  const refresh = () => {
    if (state.destroyed || !map.isStyleLoaded()) return;
    const immersive = isImmersive(map);
    if (immersive && !state.wasImmersive) { window.setTimeout(() => { if (!state.destroyed) applyCameraOnce(map); }, 120); void refreshLiveCraft(map, state.live, state.airHist, state.satHist); }
    state.wasImmersive = immersive;
    if (!immersive) {
      for (const id of Object.values(LAYERS)) { if (!map.getLayer(id)) continue; try { map.setLayoutProperty(id, 'visibility', 'none'); } catch {} }
      nativeHeatOpacity(map, 0.72); try { overlayAny().setProps({ layers: [] }); } catch {}
      diagnostics(map, state.live, [], 0, 'MAP_2D');
      return;
    }
    ensureLayers(map);
    for (const id of Object.values(LAYERS)) { if (!map.getLayer(id)) continue; try { map.setLayoutProperty(id, 'visibility', 'visible'); } catch {} }
    applyOleaNativeVisibilityV13B(map);
    suppressCompetingCraft(map); immersiveCleanup(map);
    for (const id of [LAYERS.eyeHalo, LAYERS.eyeRing1, LAYERS.eyeRing2, LAYERS.airTrailGlow, LAYERS.airTrail, LAYERS.airLeadGlow, LAYERS.airLead, LAYERS.satTrailGlow, LAYERS.satTrail, LAYERS.satLeadGlow, LAYERS.satLead, LAYERS.debris, LAYERS.airGlow, LAYERS.satGlow, LAYERS.airHero, LAYERS.satHero]) { if (map.getLayer(id)) try { map.moveLayer(id); } catch {} }
    const heat = refreshHeat();
    diagnostics(map, state.live, heat.ids, heat.count, heat.phase);
  };

  const schedule = () => { if (state.destroyed) return; window.clearTimeout(state.refreshTimer); state.refreshTimer = window.setTimeout(refresh, 45); };
  const liveLoop = () => { if (state.destroyed) return; void refreshLiveCraft(map, state.live, state.airHist, state.satHist).finally(() => { if (!state.destroyed) state.liveTimer = window.setTimeout(liveLoop, LIVE_REFRESH_MS); }); };

  map.on('styledata', schedule); map.on('idle', schedule); map.on('moveend', schedule); map.on('zoomend', schedule);
  state.destroyers.push(() => map.off('styledata', schedule), () => map.off('idle', schedule), () => map.off('moveend', schedule), () => map.off('zoomend', schedule));
  state.refreshInterval = window.setInterval(refresh, UI_REFRESH_MS);
  state.liveTimer = window.setTimeout(liveLoop, 400);
  schedule();

  const controller: Controller = {
    refresh,
    destroy: () => {
      if (state.destroyed) return;
      state.destroyed = true;
      window.clearTimeout(state.refreshTimer); window.clearTimeout(state.liveTimer); window.clearInterval(state.refreshInterval);
      for (const fn of state.destroyers) { try { fn(); } catch {} }
      try { map.removeControl(overlayAny() as never); } catch {}
      for (const id of Object.values(LAYERS)) { if (map.getLayer(id)) try { map.removeLayer(id); } catch {} }
      for (const id of Object.values(SOURCES)) { if (map.getSource(id)) try { map.removeSource(id); } catch {} }
      controllers.delete(map); overlayState.delete(map);
    },
  };
  controllers.set(map, controller);
  return controller;
}
