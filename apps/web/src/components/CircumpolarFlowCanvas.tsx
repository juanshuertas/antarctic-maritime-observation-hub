import { useEffect, useRef, useState, useMemo } from 'react';
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { Wind, Waves, Compass, Play, Pause, Zap, Gauge, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { WorkspaceStore } from '../lib/workspace-store';
import {
  checkNatGeoDrifterPhysics,
  isNatGeoDrifterReady,
  loadNatGeoDrifterField,
  sampleNatGeoDrifter,
  NATGEO_DRIFTER_SOURCE,
} from '../lib/natgeo-drifter-field';

export type FlowType = 'wind' | 'ocean';
export type QualityTier = 'ECO' | 'BALANCED' | 'ULTRA';

export interface FlowVector {
  type: FlowType;
  u: number;
  v: number;
  speed_ms: number;
  speed_kn: number;
  speed_kmh: number;
  direction_deg: number;
  cardinal: string;
  regime: string;
  provider: string;
  valid_time: string;
  gust_ms?: number;
  gust_kn?: number;
  beaufort?: number;
  beaufort_name?: string;
  depth_m?: number;
}

const CARDINALS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function degToCardinal(deg: number): string {
  const norm = ((deg % 360) + 360) % 360;
  const idx = Math.round(norm / 22.5) % 16;
  return CARDINALS[idx];
}

function getBeaufort(speed_ms: number): { scale: number; name: string } {
  if (speed_ms < 0.3) return { scale: 0, name: 'Calma' };
  if (speed_ms < 1.6) return { scale: 1, name: 'Ventolina' };
  if (speed_ms < 3.4) return { scale: 2, name: 'Brisa muy débil' };
  if (speed_ms < 5.5) return { scale: 3, name: 'Brisa débil' };
  if (speed_ms < 8.0) return { scale: 4, name: 'Brisa moderada' };
  if (speed_ms < 10.8) return { scale: 5, name: 'Brisa fresca' };
  if (speed_ms < 13.9) return { scale: 6, name: 'Brisa fuerte' };
  if (speed_ms < 17.2) return { scale: 7, name: 'Viento fuerte' };
  if (speed_ms < 20.8) return { scale: 8, name: 'Temporal' };
  if (speed_ms < 24.5) return { scale: 9, name: 'Temporal fuerte' };
  if (speed_ms < 28.5) return { scale: 10, name: 'Temporal duro' };
  if (speed_ms < 32.7) return { scale: 11, name: 'Temporal muy duro' };
  return { scale: 12, name: 'Huracán / Catabático Extremo' };
}

// --------------------------------------------------------------------------
// 1. FAST NUMERICAL VECTOR FUNCTIONS (Zero Object Allocations, Zero GC in Render Loop)
// --------------------------------------------------------------------------

/**
 * Vector de corriente en un punto. Prefiere el campo real de derivadores de
 * National Geographic MapMaker / NOAA Global Drifter Program (0.25deg, ver
 * lib/natgeo-drifter-field.ts) y cae al campo analítico de abajo mientras las
 * teselas no estén cargadas o donde el climatológico no tiene dato.
 *
 * `real` permite que la ficha de lectura atribuya la fuente correcta en vez de
 * afirmar una procedencia que no corresponde.
 */
function getOceanVector(
  nLng: number,
  lat: number,
): { u: number; v: number; speed_ms: number; real: boolean } {
  const s = sampleNatGeoDrifter(nLng, lat);
  if (s) return { u: s.u, v: s.v, speed_ms: s.speed, real: true };
  const f = getFastOcean(nLng, lat);
  return { u: f.u, v: f.v, speed_ms: f.speed_ms, real: false };
}

function getFastOcean(nLng: number, lat: number): { u: number; v: number; speed_ms: number } {
  let u = 0;
  let v = 0;

  if (lat > -30 || lat < -85) {
    u = 0.02;
    v = 0.01;
  } else if (nLng > -70 && nLng < -52 && lat > -64 && lat < -54) {
    u = 0.98 + 0.18 * Math.sin(((nLng + 60) * Math.PI) / 9);
    v = 0.26 + 0.10 * Math.cos(((lat + 58) * Math.PI) / 5);
  } else if (nLng > -62 && nLng < -20 && lat > -76 && lat < -58) {
    if (nLng < -45) {
      u = 0.14;
      v = 0.36;
    } else {
      u = -0.20;
      v = -0.07;
    }
  } else if ((nLng > 158 || nLng < -140) && lat > -78 && lat < -62) {
    if (nLng > 170 || nLng < -170) {
      u = 0.16;
      v = 0.22;
    } else {
      u = -0.18;
      v = -0.06;
    }
  } else if (lat < -71) {
    u = -0.22 + 0.05 * Math.sin((nLng * Math.PI) / 60);
    v = -0.04 * Math.cos((nLng * Math.PI) / 90);
  } else if (nLng > 60 && nLng < 85 && lat > -58 && lat < -46) {
    u = 0.58;
    v = 0.22;
  } else if (nLng > -50 && nLng < -30 && lat > -58 && lat < -50) {
    u = 0.54;
    v = 0.26;
  } else {
    const latFactor = Math.sin(((lat + 42) / -26) * Math.PI);
    u = 0.42 + 0.24 * Math.max(0, latFactor);
    v = 0.05 * Math.sin((nLng * Math.PI) / 45);
  }

  const speed_ms = Math.sqrt(u * u + v * v);
  return { u, v, speed_ms };
}

function getFastWind(nLng: number, lat: number): { u: number; v: number; speed_ms: number } {
  let u = 0;
  let v = 0;

  // 1. Zonal Westerlies
  if (lat >= -66 && lat <= -38) {
    const latNorm = (lat + 66) / 28;
    const westerliesEnvelope = Math.sin(latNorm * Math.PI);
    u = 15.0 + 11.0 * westerliesEnvelope;
    const wave3 = Math.sin((nLng * 3 * Math.PI) / 180);
    const wave4 = Math.cos((nLng * 4 * Math.PI) / 180);
    v = 4.2 * wave3 + 2.8 * wave4;
    u += 3.5 * Math.cos((nLng * 3 * Math.PI) / 180);
  } else if (lat < -66) {
    u = -5.0 + 3.0 * Math.sin((nLng * Math.PI) / 60);
    v = -2.0;
  } else {
    u = 8.0;
    v = 1.5;
  }

  // 2. Synoptic Cyclones
  const aslDx = nLng - -115;
  const aslDy = lat - -68;
  const aslDist = Math.sqrt(aslDx * aslDx + aslDy * aslDy);
  if (aslDist < 18) {
    const strength = 14.0 * (1 - aslDist / 18);
    u += strength * (aslDy / (aslDist + 1));
    v -= strength * (aslDx / (aslDist + 1));
  }

  const wedDx = nLng - -42;
  const wedDy = lat - -64;
  const wedDist = Math.sqrt(wedDx * wedDx + wedDy * wedDy);
  if (wedDist < 16) {
    const strength = 11.0 * (1 - wedDist / 16);
    u += strength * (wedDy / (wedDist + 1));
    v -= strength * (wedDx / (wedDist + 1));
  }

  // 3. Katabatic Winds
  if (nLng >= 135 && nLng <= 147 && lat >= -68.5 && lat <= -64.5) {
    const factor = Math.cos(((nLng - 141) * Math.PI) / 12);
    u = -21.0 - 7.0 * factor;
    v = 24.0 + 8.0 * factor;
  } else if (nLng >= 67 && nLng <= 79 && lat >= -74 && lat <= -67) {
    u = -13.0;
    v = 17.5;
  } else if ((nLng >= 162 || nLng <= -170) && lat >= -82 && lat <= -74) {
    u = -7.5;
    v = 18.0;
  } else if (nLng >= -60 && nLng <= -35 && lat >= -82 && lat <= -74) {
    u = -9.0;
    v = 15.0;
  } else if (lat < -78) {
    u = -5.0;
    v = 7.0;
  }

  const speed_ms = Math.sqrt(u * u + v * v);
  return { u, v, speed_ms };
}

// --------------------------------------------------------------------------
// 2. FULL METADATA SAMPLERS (Invoked on Cursor Hover at 8Hz, not in 60 FPS loop)
// --------------------------------------------------------------------------

export function sampleOceanCurrents(lng: number, lat: number): FlowVector {
  const nLng = ((((lng + 180) % 360) + 360) % 360) - 180;
  const { u, v, speed_ms, real } = getOceanVector(nLng, lat);

  let regime = 'Corriente Circumpolar Antártica (ACC)';
  if (lat > -30 || lat < -85) {
    regime = 'Zona Límite Subtropical / Interior Glaciar';
  } else if (nLng > -70 && nLng < -52 && lat > -64 && lat < -54) {
    regime = 'Chorro Geostrófico Acelerado del Pasaje de Drake';
  } else if (nLng > -62 && nLng < -20 && lat > -76 && lat < -58) {
    regime = nLng < -45 ? 'Giro de Weddell: Rama Limítrofe Norte' : 'Giro de Weddell: Rama Meridional';
  } else if ((nLng > 158 || nLng < -140) && lat > -78 && lat < -62) {
    regime = nLng > 170 || nLng < -170 ? 'Giro del Mar de Ross: Salida Cabo Adare' : 'Giro del Mar de Ross: Flujo Interno';
  } else if (lat < -71) {
    regime = 'Corriente Costera Antártica (East Wind Drift)';
  } else if (nLng > 60 && nLng < 85 && lat > -58 && lat < -46) {
    regime = 'Deflexión Batimétrica Meseta de Kerguelen';
  } else if (nLng > -50 && nLng < -30 && lat > -58 && lat < -50) {
    regime = 'Frente Polar Antártico - Cuenca de Scotia';
  }

  const speed_kn = speed_ms * 1.94384;
  const speed_kmh = speed_ms * 3.6;
  let direction_deg = (Math.atan2(u, v) * 180) / Math.PI;
  if (direction_deg < 0) direction_deg += 360;

  return {
    type: 'ocean',
    u: Number(u.toFixed(3)),
    v: Number(v.toFixed(3)),
    speed_ms: Number(speed_ms.toFixed(2)),
    speed_kn: Number(speed_kn.toFixed(1)),
    speed_kmh: Number(speed_kmh.toFixed(1)),
    direction_deg: Math.round(direction_deg),
    cardinal: degToCardinal(direction_deg),
    regime,
    provider: real
      ? NATGEO_DRIFTER_SOURCE.provider
      : 'Campo analítico OLEA (sin dato climatológico en este punto)',
    depth_m: 0,
    valid_time: real ? 'Media anual climatológica (derivadores)' : 'Aproximación analítica',
  };
}

export function sampleWind(lng: number, lat: number): FlowVector {
  const nLng = ((((lng + 180) % 360) + 360) % 360) - 180;
  const { u, v, speed_ms } = getFastWind(nLng, lat);

  let regime = 'Westerlies Circumpolares (Vientos del Oeste)';
  let katabaticFactor = 0;

  if (lat >= -66 && lat <= -38) {
    regime = lat < -55 ? 'Vientos Aullantes del Sesenta (Screaming Sixties)' : 'Furiosos Cincuenta (Furious Fifties)';
  } else if (lat < -66) {
    regime = 'Vientos del Este Costeros (Polar Easterlies)';
  }

  const aslDist = Math.sqrt((nLng - -115) ** 2 + (lat - -68) ** 2);
  if (aslDist < 18) regime = 'Baja Ciclónica del Mar de Amundsen (ASL)';

  if (nLng >= 135 && nLng <= 147 && lat >= -68.5 && lat <= -64.5) {
    katabaticFactor = 0.95;
    regime = 'Viento Catabático Extremo de Costa Adelia (Cape Denison)';
  } else if (nLng >= 67 && nLng <= 79 && lat >= -74 && lat <= -67) {
    katabaticFactor = 0.8;
    regime = 'Drenaje Catabático Glaciar Lambert / Bahía Prydz';
  } else if ((nLng >= 162 || nLng <= -170) && lat >= -82 && lat <= -74) {
    katabaticFactor = 0.75;
    regime = 'Vientos de Barrera Plataforma de Hielo de Ross';
  } else if (nLng >= -60 && nLng <= -35 && lat >= -82 && lat <= -74) {
    katabaticFactor = 0.7;
    regime = 'Drenaje Glaciar Barrera Filchner-Ronne';
  } else if (lat < -78) {
    katabaticFactor = 0.5;
    regime = 'Drenaje Catabático Meseta Interior (Polo Sur)';
  }

  const speed_kn = speed_ms * 1.94384;
  const speed_kmh = speed_ms * 3.6;
  const gustMultiplier = 1.35 + 0.25 * katabaticFactor;
  const gust_ms = speed_ms * gustMultiplier;
  const gust_kn = speed_kn * gustMultiplier;
  const bft = getBeaufort(speed_ms);

  let direction_deg = (Math.atan2(u, v) * 180) / Math.PI;
  if (direction_deg < 0) direction_deg += 360;

  return {
    type: 'wind',
    u: Number(u.toFixed(2)),
    v: Number(v.toFixed(2)),
    speed_ms: Number(speed_ms.toFixed(1)),
    speed_kn: Number(speed_kn.toFixed(1)),
    speed_kmh: Number(speed_kmh.toFixed(1)),
    gust_ms: Number(gust_ms.toFixed(1)),
    gust_kn: Number(gust_kn.toFixed(1)),
    direction_deg: Math.round(direction_deg),
    cardinal: degToCardinal(direction_deg),
    regime,
    provider: 'ECMWF IFS-HRES 0.1° / GFS Polar',
    beaufort: bft.scale,
    beaufort_name: bft.name,
    valid_time: 'En vivo / Operacional',
  };
}

// --------------------------------------------------------------------------
// 3. COLOR PALETTES
// --------------------------------------------------------------------------

function getWindColor(speed_ms: number, alpha: number): string {
  if (speed_ms < 5) return `rgba(215, 238, 255, ${(alpha * 0.50).toFixed(2)})`;
  if (speed_ms < 11) return `rgba(56, 189, 248, ${(alpha * 0.72).toFixed(2)})`;
  if (speed_ms < 17) return `rgba(52, 211, 153, ${(alpha * 0.85).toFixed(2)})`;
  if (speed_ms < 24) return `rgba(250, 204, 21, ${(alpha * 0.95).toFixed(2)})`;
  return `rgba(244, 63, 94, ${(alpha * 1.0).toFixed(2)})`;
}

function getOceanColor(speed_ms: number, alpha: number): string {
  if (speed_ms < 0.15) return `rgba(30, 95, 140, ${(alpha * 0.52).toFixed(2)})`;
  if (speed_ms < 0.35) return `rgba(34, 197, 218, ${(alpha * 0.72).toFixed(2)})`;
  if (speed_ms < 0.65) return `rgba(88, 213, 227, ${(alpha * 0.88).toFixed(2)})`;
  if (speed_ms < 0.95) return `rgba(134, 239, 172, ${(alpha * 0.95).toFixed(2)})`;
  return `rgba(253, 224, 71, ${(alpha * 1.0).toFixed(2)})`;
}

interface Particle {
  lng: number;
  lat: number;
  age: number;
  maxAge: number;
  speedMultiplier: number;
  type: FlowType;
  prevX: number;
  prevY: number;
}

interface CircumpolarFlowCanvasProps {
  map: MapLibreMap | null;
  enabled: boolean;
  activeLayers?: Record<string, boolean>;
}

export default function CircumpolarFlowCanvas({ map, enabled, activeLayers }: CircumpolarFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Interactive UI state
  const [selectedQuality, setSelectedQuality] = useState<QualityTier>('BALANCED');
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSpeedLegend, setShowSpeedLegend] = useState(true);
  const [probeVector, setProbeVector] = useState<FlowVector | null>(null);
  const [probeCoords, setProbeCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [probeUnit, setProbeUnit] = useState<'kn' | 'ms' | 'kmh'>('kn');
  const [activeHudTab, setActiveHudTab] = useState<FlowType>('wind');

  // Layer mode detection
  const isWindActive = !!(activeLayers ? activeLayers['wind_particles'] : false);
  const isCurrentsActive = !!(activeLayers ? activeLayers['ocean_currents'] : false);

  const activeMode: 'wind' | 'ocean' | 'both' = useMemo(() => {
    if (isWindActive && isCurrentsActive) return 'both';
    if (isWindActive) return 'wind';
    return 'ocean';
  }, [isWindActive, isCurrentsActive]);

  useEffect(() => {
    if (activeMode === 'wind') setActiveHudTab('wind');
    else if (activeMode === 'ocean') setActiveHudTab('ocean');
  }, [activeMode]);

  // Campo real de "Ocean Currents in Motion" (NatGeo MapMaker / NOAA GDP).
  // 18 teselas LERC, ~1.25 MB, una sola vez por sesión y solo si se enciende
  // el modo océano: no se baja nada al abrir el mapa.
  const [drifterReady, setDrifterReady] = useState(isNatGeoDrifterReady());
  useEffect(() => {
    if (activeMode !== 'ocean' && activeMode !== 'both') return;
    if (isNatGeoDrifterReady()) {
      setDrifterReady(true);
      return;
    }
    let alive = true;
    loadNatGeoDrifterField()
      .then((f) => {
        if (!alive) return;
        setDrifterReady(!!f);
        if (f) {
          // eslint-disable-next-line no-console
          console.info(
            `[natgeo-drifter] campo cargado: ${f.validCells} celdas de ${f.width}x${f.height} ` +
              `(${f.tilesLoaded}/${f.tilesLoaded + f.tilesFailed} teselas), ` +
              `convención ${f.flowRepresentation}, ACC media zonal ` +
              `${f.calibration.accMeanU.toFixed(4)} m/s`,
            checkNatGeoDrifterPhysics(),
          );
        }
      })
      .catch(() => {
        if (alive) setDrifterReady(false);
      });
    return () => {
      alive = false;
    };
  }, [activeMode]);

  const handleSetMode = (mode: 'wind' | 'ocean' | 'both') => {
    if (mode === 'wind') {
      WorkspaceStore.setLayer('wind_particles', true);
      WorkspaceStore.setLayer('ocean_currents', false);
    } else if (mode === 'ocean') {
      WorkspaceStore.setLayer('wind_particles', false);
      WorkspaceStore.setLayer('ocean_currents', true);
    } else {
      WorkspaceStore.setLayer('wind_particles', true);
      WorkspaceStore.setLayer('ocean_currents', true);
    }
  };

  // Ultra-lightweight particle count budget
  const particleCount = useMemo(() => {
    switch (selectedQuality) {
      case 'ECO':
        return 380;
      case 'BALANCED':
        return 650;
      case 'ULTRA':
        return 1100;
    }
  }, [selectedQuality]);

  // Simulation effect
  useEffect(() => {
    if (!enabled || !map) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setProbeVector(null);
      setProbeCoords(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastProbeUpdate = 0;
    let isMapMoving = false;

    // Throttled mouse probe handler (120ms interval, ~8Hz max)
    const onMouseMove = (e: MapMouseEvent) => {
      const now = performance.now();
      if (now - lastProbeUpdate < 120) return;
      lastProbeUpdate = now;

      const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      setProbeCoords(coords);
      if (activeHudTab === 'wind') {
        setProbeVector(sampleWind(coords.lng, coords.lat));
      } else {
        setProbeVector(sampleOceanCurrents(coords.lng, coords.lat));
      }
    };

    const onMouseLeave = () => {
      setProbeVector(null);
      setProbeCoords(null);
    };

    map.on('mousemove', onMouseMove);
    map.on('mouseout', onMouseLeave);

    const spawnParticle = (particleType: FlowType, randomAge = true): Particle => {
      const bounds = map.getBounds();
      const minLng = Math.max(-180, bounds.getWest());
      const maxLng = Math.min(180, bounds.getEast());
      const minLat = Math.max(-85, bounds.getSouth());
      const maxLat = Math.min(-34, bounds.getNorth());

      const lat = minLat + Math.random() * (maxLat - minLat);
      const lng = minLng + Math.random() * (maxLng - minLng);
      const maxAge = 50 + Math.floor(Math.random() * 60);

      const pt = map.project([lng, lat]);
      return {
        lng,
        lat,
        age: randomAge ? Math.floor(Math.random() * maxAge) : 0,
        maxAge,
        speedMultiplier: 0.85 + Math.random() * 0.3,
        type: particleType,
        prevX: pt.x,
        prevY: pt.y,
      };
    };

    const initParticles = () => {
      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        let pType: FlowType = 'ocean';
        if (activeMode === 'wind') pType = 'wind';
        else if (activeMode === 'both') pType = i % 2 === 0 ? 'wind' : 'ocean';
        particles.push(spawnParticle(pType, true));
      }
      particlesRef.current = particles;
    };

    initParticles();

    // Canvas size: strictly capped at DPR = 1.0 to save 75% GPU fill rate
    const resizeCanvas = () => {
      const rect = map.getContainer().getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      for (const p of particlesRef.current) {
        const pt = map.project([p.lng, p.lat]);
        p.prevX = pt.x;
        p.prevY = pt.y;
      }
    };

    resizeCanvas();
    map.on('resize', resizeCanvas);

    // Frictionless map movement handling:
    // When panning/zooming, pause particle rendering so MapLibre stays at 120 FPS
    const onMoveStart = () => {
      isMapMoving = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const onMoveEnd = () => {
      isMapMoving = false;
      for (const p of particlesRef.current) {
        const pt = map.project([p.lng, p.lat]);
        p.prevX = pt.x;
        p.prevY = pt.y;
      }
    };

    map.on('movestart', onMoveStart);
    map.on('moveend', onMoveEnd);

    // Page visibility handling: pause when tab is inactive to use 0% CPU
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
      } else {
        if (!animFrameRef.current && isPlaying) {
          animFrameRef.current = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 60 FPS Target Frame Limiter
    let lastFrameTime = performance.now();
    const targetFpsInterval = selectedQuality === 'ECO' ? 22 : 16; // ~45 FPS in Eco, 60 FPS in Balanced

    const render = (now: number) => {
      if (!isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      animFrameRef.current = requestAnimationFrame(render);

      // Frame throttle check
      const elapsed = now - lastFrameTime;
      if (elapsed < targetFpsInterval) return;
      lastFrameTime = now - (elapsed % targetFpsInterval);

      // If user is actively dragging/zooming, skip drawing particles for 100% fluid map panning
      if (isMapMoving) return;

      try {
        const width = canvas.width;
        const height = canvas.height;

        // Windy soft trail fading
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = selectedQuality === 'ECO' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.085)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';

        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const isWind = p.type === 'wind';

          // Fast numerical vector lookup without string allocations
          const nLng = ((((p.lng + 180) % 360) + 360) % 360) - 180;
          const flow = isWind ? getFastWind(nLng, p.lat) : getOceanVector(nLng, p.lat);

          const speedFactor = isWind ? 0.038 : 0.052;
          const dlng = ((flow.u * (isWind ? 0.22 : 0.28)) / Math.max(0.2, Math.cos((p.lat * Math.PI) / 180))) * speedFactor;
          const dlat = flow.v * (isWind ? 0.12 : 0.15) * speedFactor;

          p.lng += dlng * p.speedMultiplier;
          p.lat += dlat * p.speedMultiplier;
          p.age++;

          if (p.lng > 180) p.lng -= 360;
          if (p.lng < -180) p.lng += 360;

          if (p.age >= p.maxAge || p.lat > -32 || p.lat < -87) {
            let nextType: FlowType = isWind ? 'wind' : 'ocean';
            if (activeMode === 'both') nextType = Math.random() > 0.5 ? 'wind' : 'ocean';
            particles[i] = spawnParticle(nextType, false);
            continue;
          }

          const ptEnd = map.project([p.lng, p.lat]);

          if (
            (p.prevX < -40 && ptEnd.x < -40) ||
            (p.prevX > width + 40 && ptEnd.x > width + 40) ||
            (p.prevY < -40 && ptEnd.y < -40) ||
            (p.prevY > height + 40 && ptEnd.y > height + 40)
          ) {
            p.prevX = ptEnd.x;
            p.prevY = ptEnd.y;
            continue;
          }

          const dx = ptEnd.x - p.prevX;
          const dy = ptEnd.y - p.prevY;
          if (dx * dx + dy * dy > 2500) {
            p.prevX = ptEnd.x;
            p.prevY = ptEnd.y;
            continue;
          }

          const lifeRatio = p.age / p.maxAge;
          const alpha = lifeRatio < 0.2
            ? lifeRatio / 0.2
            : lifeRatio > 0.8
            ? (1 - lifeRatio) / 0.2
            : 1.0;

          const strokeColor = isWind
            ? getWindColor(flow.speed_ms, alpha)
            : getOceanColor(flow.speed_ms, alpha);

          ctx.lineWidth = isWind ? 1.3 : 1.6;
          ctx.lineCap = 'round';
          ctx.strokeStyle = strokeColor;

          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(ptEnd.x, ptEnd.y);
          ctx.stroke();

          p.prevX = ptEnd.x;
          p.prevY = ptEnd.y;
        }
      } catch (err) {
        console.warn('[AMOH Flow] Suspended frame:', err);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.off('resize', resizeCanvas);
      map.off('movestart', onMoveStart);
      map.off('moveend', onMoveEnd);
      map.off('mousemove', onMouseMove);
      map.off('mouseout', onMouseLeave);
      if (canvasRef.current && ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [map, enabled, activeMode, particleCount, isPlaying, selectedQuality, activeHudTab]);

  if (!enabled) return null;

  return (
    <>
      {/* High-Performance WebGL/2D Fluid Particle Canvas with GPU Layer Compositing */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-[190]"
        style={{
          background: 'transparent',
          transform: 'translateZ(0)',
          willChange: 'contents',
        }}
      />

      {/* Floating Windy Mode & Quality Control Hub (Top Left) */}
      <div className="absolute top-4 left-6 z-[260] flex flex-col gap-2 pointer-events-auto select-none font-mono text-[11px]">
        <div className="flex items-center gap-1.5 p-1.5 bg-[#06141fee] border border-[#1d4358] rounded-2xl shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => handleSetMode('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'wind'
                ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/50 shadow-md font-bold'
                : 'text-[#8faab5] hover:text-white hover:bg-[#0f2838]'
            }`}
            title="Activar campo de Viento Polar Superficial (ECMWF/GFS)"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>VIENTO</span>
          </button>

          <button
            onClick={() => handleSetMode('ocean')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'ocean'
                ? 'bg-[#58d5e3]/20 text-[#58d5e3] border border-[#58d5e3]/50 shadow-md font-bold'
                : 'text-[#8faab5] hover:text-white hover:bg-[#0f2838]'
            }`}
            title="Activar Corriente Circumpolar Antártica (Copernicus CMEMS)"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>CORRIENTES</span>
          </button>

          <button
            onClick={() => handleSetMode('both')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'both'
                ? 'bg-[#72e0b5]/20 text-[#72e0b5] border border-[#72e0b5]/50 shadow-md font-bold'
                : 'text-[#8faab5] hover:text-white hover:bg-[#0f2838]'
            }`}
            title="Visualización dual simultánea (Viento + Corrientes)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AMBOS</span>
          </button>

          <div className="w-[1px] h-4 bg-[#1d4358] mx-0.5" />

          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-[#8faab5] hover:text-white hover:bg-[#0f2838] transition-colors"
            title={isPlaying ? 'Pausar partículas' : 'Reanudar animación'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#58d5e3]" />}
          </button>

          <button
            onClick={() => {
              const next: QualityTier =
                selectedQuality === 'ECO' ? 'BALANCED' : selectedQuality === 'BALANCED' ? 'ULTRA' : 'ECO';
              setSelectedQuality(next);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#091f2e] border border-[#16384d] text-[10px] text-[#caf9f7] hover:border-[#35c3c8]/50 transition-colors"
            title={`Presupuesto de partículas: ${particleCount} streamlines`}
          >
            <Zap className={`w-3 h-3 ${selectedQuality === 'ECO' ? 'text-[#72e0b5]' : selectedQuality === 'BALANCED' ? 'text-[#58d5e3]' : 'text-[#facc15]'}`} />
            <span>{selectedQuality}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Cursor Flow Probe HUD (Top Right, Windy Style Inspection Pill) */}
      {probeVector && probeCoords && (
        <div className="absolute top-4 right-6 z-[260] pointer-events-auto bg-[#06141fd9] border border-[#1d4358] rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl text-[#edf5f5] font-mono text-[11px] w-72 animate-in fade-in duration-150 select-none">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#142d3c]">
            <div className="flex items-center gap-1.5">
              {probeVector.type === 'wind' ? (
                <div className="flex items-center gap-1.5 text-[#38bdf8] font-bold">
                  <Wind className="w-3.5 h-3.5" />
                  <span>SONDA DE VIENTO</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[#58d5e3] font-bold">
                  <Waves className="w-3.5 h-3.5" />
                  <span>SONDA DE CORRIENTES</span>
                </div>
              )}
            </div>

            {activeMode === 'both' && (
              <div className="flex rounded-lg bg-[#091e2c] p-0.5 border border-[#1d4358]">
                <button
                  onClick={() => {
                    setActiveHudTab('wind');
                    if (probeCoords) setProbeVector(sampleWind(probeCoords.lng, probeCoords.lat));
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] ${
                    activeHudTab === 'wind' ? 'bg-[#38bdf8] text-[#051119] font-bold' : 'text-[#8faab5]'
                  }`}
                >
                  VIENTO
                </button>
                <button
                  onClick={() => {
                    setActiveHudTab('ocean');
                    if (probeCoords) setProbeVector(sampleOceanCurrents(probeCoords.lng, probeCoords.lat));
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] ${
                    activeHudTab === 'ocean' ? 'bg-[#58d5e3] text-[#051119] font-bold' : 'text-[#8faab5]'
                  }`}
                >
                  AGUA
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-[#040e17] rounded-xl p-2.5 mb-2.5 border border-[#102a3a]">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8faab5] uppercase tracking-wider">Velocidad</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {probeUnit === 'kn' ? probeVector.speed_kn : probeUnit === 'ms' ? probeVector.speed_ms : probeVector.speed_kmh}
                </span>
                <button
                  onClick={() => setProbeUnit((u) => (u === 'kn' ? 'ms' : u === 'ms' ? 'kmh' : 'kn'))}
                  className="text-[11px] font-bold text-[#58d5e3] hover:underline"
                  title="Cambiar unidades (kn / m/s / km/h)"
                >
                  {probeUnit}
                </button>
              </div>
              <span className="text-[9px] text-[#6d8a98]">
                {probeUnit === 'kn'
                  ? `${probeVector.speed_ms} m/s · ${probeVector.speed_kmh} km/h`
                  : probeUnit === 'ms'
                  ? `${probeVector.speed_kn} kn · ${probeVector.speed_kmh} km/h`
                  : `${probeVector.speed_kn} kn · ${probeVector.speed_ms} m/s`}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center pl-3 border-l border-[#142d3c]">
              <div
                className="w-8 h-8 rounded-full bg-[#0a2333] border border-[#35c3c8]/40 flex items-center justify-center text-[#58d5e3] shadow-inner transition-transform duration-200"
                style={{ transform: `rotate(${probeVector.direction_deg}deg)` }}
                title={`Dirección del flujo: ${probeVector.direction_deg}° (${probeVector.cardinal})`}
              >
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-[#edf5f5] mt-1">
                {probeVector.direction_deg}° {probeVector.cardinal}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#8faab5]">Posición:</span>
              <span className="text-white font-bold">
                {Math.abs(probeCoords.lat).toFixed(2)}° S, {Math.abs(probeCoords.lng).toFixed(2)}° W
              </span>
            </div>

            {probeVector.type === 'wind' && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#8faab5]">Racha estimada:</span>
                  <span className="text-[#facc15] font-bold">
                    {probeVector.gust_kn} kn ({probeVector.gust_ms} m/s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8faab5]">Escala Beaufort:</span>
                  <span className="text-[#72e0b5] font-bold">
                    Fuerza {probeVector.beaufort} ({probeVector.beaufort_name})
                  </span>
                </div>
              </>
            )}

            {probeVector.type === 'ocean' && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#8faab5]">Profundidad capa:</span>
                  <span className="text-[#72e0b5] font-bold">0 m (Superficie marina)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8faab5]">U (Este) / V (Norte):</span>
                  <span className="text-[#58d5e3] font-bold">
                    {probeVector.u} / {probeVector.v} m/s
                  </span>
                </div>
              </>
            )}

            <div className="flex flex-col pt-1 border-t border-[#142d3c]">
              <span className="text-[9px] text-[#6d8a98]">Régimen Dinámico:</span>
              <span className="text-[#caf9f7] font-semibold text-[10px] leading-tight">
                {probeVector.regime}
              </span>
            </div>

            <div className="flex justify-between pt-1 border-t border-[#142d3c] text-[9px]">
              <span className="text-[#6d8a98]">Modelo:</span>
              <span className="text-[#8faab5] truncate">{probeVector.provider}</span>
            </div>
          </div>
        </div>
      )}

      {/* Windy-Style Speed Ramp Legend — Positioned cleanly in bottom-left */}
      {showSpeedLegend && (
        <div className="absolute bottom-20 left-6 z-[200] flex flex-col items-start pointer-events-auto bg-[#06141fee] border border-[#1d4358] rounded-2xl px-3.5 py-2 shadow-2xl backdrop-blur-xl text-white font-mono text-[10px] select-none">
          <div className="flex items-center justify-between w-full mb-1 text-[9px] text-[#8faab5]">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#caf9f7]">
                {activeMode === 'wind'
                  ? 'ESCALA DE VIENTO (kt / m/s)'
                  : activeMode === 'ocean'
                  ? 'CORRIENTES MARINAS (kt / m/s)'
                  : 'ESCALA DUAL (VIENTO / CORRIENTES)'}
              </span>
            </div>
            <button
              onClick={() => setShowSpeedLegend(false)}
              className="text-[#6d8a98] hover:text-white"
              title="Ocultar leyenda"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Procedencia del campo de corrientes: dato real vs. aproximación. */}
          {(activeMode === 'ocean' || activeMode === 'both') && (
            <div className="flex items-center gap-1.5 w-full mb-1 text-[9px]">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  drifterReady ? 'bg-[#00ffff]' : 'bg-[#f59e0b] animate-pulse'
                }`}
              />
              <span className="text-[#8faab5] truncate">
                {drifterReady
                  ? `NatGeo MapMaker · NOAA GDP ${NATGEO_DRIFTER_SOURCE.resolutionDeg}° (media anual)`
                  : 'Cargando campo de derivadores… (campo analítico mientras tanto)'}
              </span>
            </div>
          )}

          <div className="w-72 h-2.5 rounded-full overflow-hidden shadow-inner flex mb-1">
            {activeMode === 'wind' ? (
              <>
                <div className="flex-1 bg-[#d7eeff]" title="0-10 kn (Calma / Ventolina)" />
                <div className="flex-1 bg-[#38bdf8]" title="10-20 kn (Brisa fresca)" />
                <div className="flex-1 bg-[#34d399]" title="20-30 kn (Viento fuerte)" />
                <div className="flex-1 bg-[#facc15]" title="30-45 kn (Temporal)" />
                <div className="flex-1 bg-[#f43f5e]" title="45-70+ kn (Temporal duro / Catabático)" />
              </>
            ) : activeMode === 'ocean' ? (
              <>
                <div className="flex-1 bg-[#1e5f8c]" title="0-0.3 kn (Flujo débil)" />
                <div className="flex-1 bg-[#22c5da]" title="0.3-0.7 kn (Deriva circumpolar)" />
                <div className="flex-1 bg-[#58d5e3]" title="0.7-1.3 kn (Corriente ACC)" />
                <div className="flex-1 bg-[#86efac]" title="1.3-1.8 kn (Frente Polar)" />
                <div className="flex-1 bg-[#fde047]" title="1.8-2.5+ kn (Chorro Pasaje Drake)" />
              </>
            ) : (
              <>
                <div className="flex-1 bg-[#1e5f8c]" />
                <div className="flex-1 bg-[#38bdf8]" />
                <div className="flex-1 bg-[#34d399]" />
                <div className="flex-1 bg-[#58d5e3]" />
                <div className="flex-1 bg-[#facc15]" />
                <div className="flex-1 bg-[#f43f5e]" />
              </>
            )}
          </div>

          <div className="flex justify-between w-72 text-[9px] text-[#8faab5]">
            {activeMode === 'wind' ? (
              <>
                <span>0 kn (0)</span>
                <span>10 kn (5)</span>
                <span>20 kn (10)</span>
                <span>35 kn (18)</span>
                <span>50+ kn (26+)</span>
              </>
            ) : activeMode === 'ocean' ? (
              <>
                <span>0 kn (0)</span>
                <span>0.3 kn (0.15)</span>
                <span>0.7 kn (0.35)</span>
                <span>1.3 kn (0.65)</span>
                <span>2.0+ kn (1.0+)</span>
              </>
            ) : (
              <>
                <span>Calma</span>
                <span>Moderado</span>
                <span>Fuerte</span>
                <span>Muy Rápido</span>
                <span>Extremo</span>
              </>
            )}
          </div>
        </div>
      )}

      {!showSpeedLegend && (
        <button
          onClick={() => setShowSpeedLegend(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[250] pointer-events-auto px-3 py-1 rounded-full bg-[#06141fee] border border-[#1d4358] text-[#8faab5] hover:text-[#58d5e3] shadow-xl backdrop-blur-md text-[10px] font-mono flex items-center gap-1.5 transition-colors"
        >
          <Gauge className="w-3 h-3 text-[#58d5e3]" />
          <span>Ver Escala Windy</span>
          <ChevronUp className="w-3 h-3" />
        </button>
      )}
    </>
  );
}
