// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Juan Sebastián Huertas Olea. All rights reserved.
// AMOH — NatGeo Expedition Film Director Suite & Cinematic Viewfinder

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera,
  Grid,
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2,
  Minimize2,
  Download
} from 'lucide-react';
import {
  NatGeoDirectorStore,
  type NatGeoDirectorState,
  type CinematicLut,
  type AspectRatioMode,
  type LensFocal,
  type AudioPreset,
  EXPEDITION_WAYPOINTS,
  WILDLIFE_SPOTLIGHTS
} from '../lib/natgeo-director-store';
import { NatGeoAudio } from '../lib/cinematic-audio';
import type { WodMapPanelHandle } from './WodMapPanel';

interface NatGeoDirectorSuiteProps {
  mapHandle: WodMapPanelHandle | null;
  onClose?: () => void;
}

export default function NatGeoDirectorSuite({ mapHandle, onClose }: NatGeoDirectorSuiteProps) {
  const [state, setState] = useState<NatGeoDirectorState>(() => NatGeoDirectorStore.get());
  const [activeDeckTab, setActiveDeckTab] = useState<'tour' | 'filters' | 'audio' | 'wildlife' | 'snapshot'>('tour');
  const [deckMinimized, setDeckMinimized] = useState(false);
  const [timecode, setTimecode] = useState('01:24:59:18');
  const [snapshotPreview, setSnapshotPreview] = useState<{
    imageUrl?: string;
    title: string;
    coords: string;
    date: string;
    lens: string;
    directorNote: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const tourTimerRef = useRef<number | null>(null);

  // Sync with store
  useEffect(() => {
    return NatGeoDirectorStore.subscribe((next) => {
      setState(next);
    });
  }, []);

  // Running timecode generator
  useEffect(() => {
    let frame = 18;
    let sec = 59;
    let min = 24;
    let hour = 1;

    const interval = window.setInterval(() => {
      frame = (frame + 1) % 60;
      if (frame === 0) {
        sec = (sec + 1) % 60;
        if (sec === 0) {
          min = (min + 1) % 60;
          if (min === 0) hour = (hour + 1) % 24;
        }
      }
      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimecode(`${pad(hour)}:${pad(min)}:${pad(sec)}:${pad(frame)}`);
    }, 1000 / 30);

    return () => window.clearInterval(interval);
  }, []);

  // Listen to map movements to update live telemetry
  useEffect(() => {
    if (!mapHandle) return;
    const map = mapHandle.getMap();
    if (!map) return;

    const updateTelemetry = () => {
      const center = map.getCenter();
      const pitch = map.getPitch();
      const bearing = map.getBearing();
      const zoom = map.getZoom();

      NatGeoDirectorStore.set({
        centerCoords: [center.lng, center.lat],
        cameraTilt: Math.round(pitch),
        cameraBearing: Math.round(bearing),
        cameraZoom: Number(zoom.toFixed(1)),
      });
    };

    map.on('move', updateTelemetry);
    updateTelemetry();

    return () => {
      map.off('move', updateTelemetry);
    };
  }, [mapHandle]);

  // Audio start / stop lifecycle
  useEffect(() => {
    if (state.isDirectorMode && !state.isAudioMuted) {
      NatGeoAudio.setVolume(state.audioVolume);
      NatGeoAudio.startSoundscape(state.audioPreset);
    } else {
      NatGeoAudio.stopSoundscape();
    }

    return () => {
      NatGeoAudio.stopSoundscape();
    };
  }, [state.isDirectorMode, state.isAudioMuted, state.audioPreset, state.audioVolume]);

  // Blizzard & Polar Aurora Canvas Particle System
  useEffect(() => {
    if (!state.showAtmosphericParticles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedX: (Math.random() - 0.5) * 1.8 + 1.2, // Drifting right like Antarctic gale
      speedY: Math.random() * 2.2 + 0.6,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    let frameCount = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frameCount++;

      // Aurora Australis atmospheric glow wave
      if (state.cinematicLut === 'infrared-aurora') {
        const grad = ctx.createLinearGradient(0, 0, width, height * 0.4);
        grad.addColorStop(0, 'rgba(0, 255, 180, 0.08)');
        grad.addColorStop(0.5, 'rgba(160, 32, 240, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height * 0.5);
      }

      // Draw blizzard snowflakes / ice crystals
      ctx.fillStyle = '#ffffff';
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.03;

        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
        if (p.y > height) p.y = 0;

        ctx.globalAlpha = p.opacity * (0.8 + Math.sin(p.pulse) * 0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.showAtmosphericParticles, state.cinematicLut]);

  // Automated Expedition Drone Tour Handler
  const flyToWaypoint = useCallback(
    (index: number) => {
      const wp = EXPEDITION_WAYPOINTS[index];
      if (!wp || !mapHandle) return;

      NatGeoAudio.playRadioWaypointChirp();

      const map = mapHandle.getMap();
      if (map) {
        map.flyTo({
          center: wp.coordinates,
          zoom: wp.zoom,
          pitch: wp.pitch,
          bearing: wp.bearing,
          duration: 4500,
          essential: true,
        });
      }

      NatGeoDirectorStore.set({
        currentTourIndex: index,
        lensFocal: wp.cinematicLens,
        cinematicLut: wp.recommendedFilter,
        audioPreset: wp.audioPreset,
      });
    },
    [mapHandle]
  );

  const nextWaypoint = () => {
    const nextIdx = (state.currentTourIndex + 1) % EXPEDITION_WAYPOINTS.length;
    flyToWaypoint(nextIdx);
  };

  const prevWaypoint = () => {
    const prevIdx = (state.currentTourIndex - 1 + EXPEDITION_WAYPOINTS.length) % EXPEDITION_WAYPOINTS.length;
    flyToWaypoint(prevIdx);
  };

  const toggleAutoTour = () => {
    const nextPlaying = !state.isAutoTourPlaying;
    NatGeoDirectorStore.set({ isAutoTourPlaying: nextPlaying });

    if (nextPlaying) {
      flyToWaypoint(state.currentTourIndex);
    } else {
      if (tourTimerRef.current) {
        window.clearTimeout(tourTimerRef.current);
        tourTimerRef.current = null;
      }
    }
  };

  // Auto-advance tour timer
  useEffect(() => {
    if (!state.isAutoTourPlaying) return;

    const currentWp = EXPEDITION_WAYPOINTS[state.currentTourIndex];
    const duration = (currentWp?.durationSec || 15) * 1000;

    tourTimerRef.current = window.setTimeout(() => {
      const nextIdx = (state.currentTourIndex + 1) % EXPEDITION_WAYPOINTS.length;
      flyToWaypoint(nextIdx);
    }, duration);

    return () => {
      if (tourTimerRef.current) {
        window.clearTimeout(tourTimerRef.current);
        tourTimerRef.current = null;
      }
    };
  }, [state.isAutoTourPlaying, state.currentTourIndex, flyToWaypoint]);

  // Jump to Wildlife Spotlight
  const handleSelectWildlife = (spotlight: (typeof WILDLIFE_SPOTLIGHTS)[0]) => {
    if (!mapHandle) return;
    NatGeoAudio.playRadioWaypointChirp();
    const map = mapHandle.getMap();
    if (map) {
      map.flyTo({
        center: spotlight.coordinates,
        zoom: spotlight.zoom,
        pitch: spotlight.pitch,
        bearing: spotlight.bearing,
        duration: 3500,
      });
    }
    NatGeoDirectorStore.set({
      activeSpotlightId: spotlight.id,
      lensFocal: '200mm',
      cinematicLut: 'natgeo-prime',
    });
  };

  // 4K Snapshot Frame Grabber
  const handleTakeSnapshot = () => {
    NatGeoAudio.playCameraShutter();
    const currentWp = EXPEDITION_WAYPOINTS[state.currentTourIndex];
    const coordsStr = `${Math.abs(state.centerCoords[1]).toFixed(4)}°S, ${Math.abs(state.centerCoords[0]).toFixed(4)}°W`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    setSnapshotPreview({
      title: currentWp ? currentWp.title : 'Observación Polar Antártica AMOH',
      coords: coordsStr,
      date: now,
      lens: `${state.lensFocal} T1.5 CINE // ${state.cinematicLut.toUpperCase()}`,
      directorNote: currentWp ? currentWp.directorNote : 'Fotograma de alta fidelidad registrado durante misión científica en el Océano Austral.',
    });
  };

  // Determine Aspect Ratio Letterbox CSS
  const getLetterboxPadding = () => {
    switch (state.aspectRatio) {
      case '2.39:1':
        return 'py-[7vh]';
      case 'IMAX 1.43:1':
        return 'px-[10vw]';
      case '4:3':
        return 'px-[15vw]';
      case '16:9':
      default:
        return 'py-0';
    }
  };

  // Determine Cinematic CSS Filters
  const getLutFilterClass = () => {
    switch (state.cinematicLut) {
      case 'natgeo-prime':
        return 'contrast-[1.12] saturate-[1.18] brightness-[0.98] hue-rotate-[-2deg]';
      case 'golden-hour':
        return 'contrast-[1.08] saturate-[1.35] sepia-[0.25] brightness-[1.04]';
      case 'infrared-aurora':
        return 'contrast-[1.25] saturate-[1.6] hue-rotate-[110deg] brightness-[1.1]';
      case 'shackleton-1911':
        return 'contrast-[1.2] saturate-[0.15] sepia-[0.6] brightness-[0.92]';
      case 'bathy-sonar':
        return 'contrast-[1.3] saturate-[1.8] hue-rotate-[195deg] brightness-[0.9]';
      case 'thermal-flir':
        return 'contrast-[1.4] saturate-[2.0] invert-[0.15] hue-rotate-[240deg]';
      case 'pristine':
      default:
        return '';
    }
  };

  void getLutFilterClass; // reservado: se conserva sin uso por ahora (corrección TS6133 sin cambiar comportamiento)
  const currentWp = EXPEDITION_WAYPOINTS[state.currentTourIndex];

  return (
    <div className="fixed inset-0 z-[600] pointer-events-none flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* 1. ATMOSPHERIC PARTICLE CANVAS */}
      {state.showAtmosphericParticles && (
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      )}

      {/* 2. CINEMATIC ASPECT RATIO LETTERBOX BARS */}
      <div
        className={`absolute inset-0 z-10 flex flex-col justify-between transition-all duration-700 ease-in-out ${getLetterboxPadding()}`}
      >
        {/* Top Letterbox Bar with NatGeo Gold Accent Strip */}
        <div className="w-full bg-[#03070d] pointer-events-auto border-b border-[#FFCC00]/40 shadow-2xl relative flex items-center justify-between px-6 py-2">
          {/* Left: National Geographic Director Mark */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-6 border-2 border-[#FFCC00] bg-transparent flex items-center justify-center">
              <span className="w-1.5 h-3 bg-[#FFCC00]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black tracking-[3px] text-[#FFCC00] uppercase font-mono">
                NATIONAL GEOGRAPHIC EXPEDITION
              </span>
              <span className="text-[9px] text-cyan-300/80 font-mono tracking-widest uppercase">
                AMOH 4K CINE VIEWFINDER // {state.aspectRatio}
              </span>
            </div>
          </div>

          {/* Center: Live REC & Timecode */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>REC</span>
            </div>
            <span className="text-sm font-mono font-extrabold tracking-widest text-slate-100 bg-slate-900/80 px-3 py-0.5 rounded border border-slate-700">
              {timecode}
            </span>
            <span className="hidden md:inline-flex text-[10px] font-mono text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-950/40">
              4K 60FPS RAW
            </span>
          </div>

          {/* Right: Quick Controls & Close */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => NatGeoDirectorStore.set({ isAudioMuted: !state.isAudioMuted })}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors"
              title={state.isAudioMuted ? 'Activar Paisaje Sonoro' : 'Silenciar'}
            >
              {state.isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => NatGeoDirectorStore.set({ showRuleOfThirds: !state.showRuleOfThirds })}
              className={`p-1.5 rounded-lg border transition-colors ${
                state.showRuleOfThirds ? 'bg-[#FFCC00]/20 border-[#FFCC00] text-[#FFCC00]' : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
              title="Rejilla de Composición (Regla de Tercios)"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={handleTakeSnapshot}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFCC00] text-slate-950 font-bold text-xs hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(255,204,0,0.4)]"
              title="Registrar Fotograma 4K NatGeo"
            >
              <Camera className="w-3.5 h-3.5 text-slate-950" />
              <span>FOTOGRAMA</span>
            </button>
            <button
              onClick={() => {
                NatGeoDirectorStore.set({ isDirectorMode: false });
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 hover:text-white hover:bg-rose-600 transition-colors"
              title="Salir del Modo Director NatGeo (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Letterbox Bar with Telemetry Readout */}
        <div className="w-full bg-[#03070d] pointer-events-auto border-t border-[#FFCC00]/40 shadow-2xl relative flex items-center justify-between px-6 py-2">
          {/* Telemetry metadata */}
          <div className="flex items-center gap-6 text-[11px] font-mono text-cyan-200/80">
            <div>
              <span className="text-slate-500 mr-1">OPTICA:</span>
              <span className="text-[#FFCC00] font-bold">{state.lensFocal} T1.5 CINE</span>
            </div>
            <div className="hidden sm:inline">
              <span className="text-slate-500 mr-1">LUT:</span>
              <span className="text-cyan-300 font-bold uppercase">{state.cinematicLut}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1">POS:</span>
              <span className="text-emerald-300">
                {Math.abs(state.centerCoords[1]).toFixed(3)}°S, {Math.abs(state.centerCoords[0]).toFixed(3)}°W
              </span>
            </div>
            <div className="hidden md:inline">
              <span className="text-slate-500 mr-1">INCLINACIÓN / RUMBO:</span>
              <span className="text-slate-200">
                {state.cameraTilt}° / {state.cameraBearing}°
              </span>
            </div>
          </div>

          {/* Tour chapter title */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#FFCC00] uppercase tracking-wider">
              CAPÍTULO {state.currentTourIndex + 1}/{EXPEDITION_WAYPOINTS.length}:
            </span>
            <span className="text-xs font-bold text-white max-w-xs truncate">
              {currentWp?.title}
            </span>
          </div>
        </div>
      </div>

      {/* 3. OPTICAL VIEWFINDER HUD & RULE OF THIRDS OVERLAY */}
      {state.showViewfinderHud && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-8">
          {/* Iconic Golden Framing Corners */}
          <div className="absolute inset-10 border border-white/10 pointer-events-none">
            {/* Top-Left */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#FFCC00]" />
            {/* Top-Right */}
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-[#FFCC00]" />
            {/* Bottom-Left */}
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-[#FFCC00]" />
            {/* Bottom-Right */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#FFCC00]" />
          </div>

          {/* Rule of Thirds Grid */}
          {state.showRuleOfThirds && (
            <div className="absolute inset-10 grid grid-cols-3 grid-rows-3 pointer-events-none border border-cyan-500/20">
              <div className="border-r border-b border-cyan-400/20" />
              <div className="border-r border-b border-cyan-400/20" />
              <div className="border-b border-cyan-400/20" />
              <div className="border-r border-b border-cyan-400/20" />
              <div className="border-r border-b border-cyan-400/20" />
              <div className="border-b border-cyan-400/20" />
              <div className="border-r border-cyan-400/20" />
              <div className="border-r border-cyan-400/20" />
              <div />
            </div>
          )}

          {/* Center Focus Reticle */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-full border border-cyan-400/40 animate-ping" style={{ animationDuration: '4s' }} />
            <div className="w-8 h-8 border border-[#FFCC00]/60 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#FFCC00] rounded-full" />
            </div>
            {/* Focus Crosshairs */}
            <div className="absolute top-0 w-0.5 h-2 bg-[#FFCC00]/70" />
            <div className="absolute bottom-0 w-0.5 h-2 bg-[#FFCC00]/70" />
            <div className="absolute left-0 w-2 h-0.5 bg-[#FFCC00]/70" />
            <div className="absolute right-0 w-2 h-0.5 bg-[#FFCC00]/70" />
          </div>

          {/* Anamorphic Lens Flare Streak */}
          {state.showAnamorphicFlare && (
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none transform -translate-y-1/2" />
          )}
        </div>
      )}

      {/* 4. DOCUMENTARY LOWER-THIRD NARRATIVE CARD */}
      {currentWp && state.directorNotesOpen && (
        <div className="absolute bottom-20 left-8 z-30 pointer-events-auto max-w-lg bg-[#061422]/90 backdrop-blur-xl border border-[#FFCC00]/40 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-4 bg-[#FFCC00]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFCC00] font-bold">
                {currentWp.region}
              </span>
            </div>
            <button
              onClick={() => NatGeoDirectorStore.set({ directorNotesOpen: false })}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="text-base font-extrabold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {currentWp.title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {currentWp.expeditionLog}
          </p>

          <div className="p-2.5 rounded-xl bg-[#081f33]/80 border border-cyan-500/20 text-[11px] text-cyan-200 font-mono flex items-start gap-2">
            <Film className="w-4 h-4 text-[#FFCC00] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#FFCC00] block mb-0.5">NOTA DEL DIRECTOR:</span>
              <span>{currentWp.directorNote}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING DIRECTOR CONTROL DECK (TOP RIGHT / BOTTOM RIGHT) */}
      <div className="absolute bottom-20 right-8 z-30 pointer-events-auto max-w-sm w-full bg-[#071728]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Deck Header */}
        <div className="p-3 bg-[#0a2238] border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFCC00] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-100">
              PANEL DE DIRECCIÓN FÍLMICA
            </span>
          </div>
          <button
            onClick={() => setDeckMinimized(!deckMinimized)}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            {deckMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!deckMinimized && (
          <div className="p-4 space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-semibold">
              <button
                onClick={() => setActiveDeckTab('tour')}
                className={`py-1.5 rounded-lg transition-colors ${
                  activeDeckTab === 'tour' ? 'bg-[#FFCC00] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tour
              </button>
              <button
                onClick={() => setActiveDeckTab('filters')}
                className={`py-1.5 rounded-lg transition-colors ${
                  activeDeckTab === 'filters' ? 'bg-[#FFCC00] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Filtros
              </button>
              <button
                onClick={() => setActiveDeckTab('audio')}
                className={`py-1.5 rounded-lg transition-colors ${
                  activeDeckTab === 'audio' ? 'bg-[#FFCC00] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Audio
              </button>
              <button
                onClick={() => setActiveDeckTab('wildlife')}
                className={`py-1.5 rounded-lg transition-colors ${
                  activeDeckTab === 'wildlife' ? 'bg-[#FFCC00] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fauna
              </button>
            </div>

            {/* Tab: Tour */}
            {activeDeckTab === 'tour' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevWaypoint}
                    className="p-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                    title="Capítulo Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleAutoTour}
                    className={`flex-1 mx-2 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      state.isAutoTourPlaying
                        ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    {state.isAutoTourPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{state.isAutoTourPlaying ? 'PAUSAR VUELO DRONE' : 'VUELO EXPEDICIÓN AUTO'}</span>
                  </button>
                  <button
                    onClick={nextWaypoint}
                    className="p-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                    title="Siguiente Capítulo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Waypoint List */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {EXPEDITION_WAYPOINTS.map((wp, i) => (
                    <button
                      key={wp.id}
                      onClick={() => flyToWaypoint(i)}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                        state.currentTourIndex === i
                          ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 font-bold'
                          : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{wp.title}</span>
                      <span className="text-[10px] font-mono text-[#FFCC00] shrink-0">{wp.cinematicLens}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Filters & Aspect Ratio */}
            {activeDeckTab === 'filters' && (
              <div className="space-y-3 text-xs">
                {/* Aspect Ratio */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                    Relación de Aspecto Fílmica
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['2.39:1', '16:9', 'IMAX 1.43:1', '4:3'] as AspectRatioMode[]).map((ar) => (
                      <button
                        key={ar}
                        onClick={() => NatGeoDirectorStore.set({ aspectRatio: ar })}
                        className={`py-1 rounded-lg font-mono text-[10px] border transition-colors ${
                          state.aspectRatio === ar
                            ? 'bg-[#FFCC00] border-[#FFCC00] text-slate-950 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LUT Filter */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                    Gradación de Color (LUT)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'natgeo-prime', name: 'NatGeo 35mm Prime' },
                      { id: 'golden-hour', name: 'Hora Dorada Glaciar' },
                      { id: 'infrared-aurora', name: 'Aurora Australis IR' },
                      { id: 'shackleton-1911', name: 'Shackleton 1911 Sepia' },
                      { id: 'bathy-sonar', name: 'Sonar Batimétrico' },
                      { id: 'thermal-flir', name: 'Térmico FLIR Hielo' },
                    ].map((lut) => (
                      <button
                        key={lut.id}
                        onClick={() => NatGeoDirectorStore.set({ cinematicLut: lut.id as CinematicLut })}
                        className={`p-2 rounded-xl text-left border transition-colors ${
                          state.cinematicLut === lut.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lut.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lenses */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                    Óptica / Longitud Focal
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['18mm', '35mm', '85mm', '200mm'] as LensFocal[]).map((focal) => (
                      <button
                        key={focal}
                        onClick={() => NatGeoDirectorStore.set({ lensFocal: focal })}
                        className={`py-1.5 rounded-lg font-mono text-[10px] border transition-colors ${
                          state.lensFocal === focal
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {focal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Audio */}
            {activeDeckTab === 'audio' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Paisaje Sonoro Polar</span>
                  <button
                    onClick={() => NatGeoDirectorStore.set({ isAudioMuted: !state.isAudioMuted })}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                      !state.isAudioMuted
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-red-500/20 border-red-400 text-red-300'
                    }`}
                  >
                    {!state.isAudioMuted ? 'ACTIVO (WEB AUDIO)' : 'SILENCIADO'}
                  </button>
                </div>

                {/* Volume Slider */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>VOLUMEN MASTER</span>
                    <span>{Math.round(state.audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={state.audioVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      NatGeoDirectorStore.set({ audioVolume: v });
                      NatGeoAudio.setVolume(v);
                    }}
                    className="w-full accent-[#FFCC00] bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Soundscape Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Ambientes Procedurales Sintetizados
                  </span>
                  {[
                    { id: 'polar-wind', name: 'Viento Katabático Polar' },
                    { id: 'glacial-depths', name: 'Resonancia & Fractura Glaciar' },
                    { id: 'hydrophone', name: 'Hidrófono & Bioacústica Marina' },
                    { id: 'aurora-resonance', name: 'Frecuencia Aurora Australis' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        NatGeoDirectorStore.set({ audioPreset: preset.id as AudioPreset, isAudioMuted: false });
                        NatGeoAudio.startSoundscape(preset.id as AudioPreset);
                      }}
                      className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-colors ${
                        state.audioPreset === preset.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{preset.name}</span>
                      {state.audioPreset === preset.id && !state.isAudioMuted && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Wildlife */}
            {activeDeckTab === 'wildlife' && (
              <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
                {WILDLIFE_SPOTLIGHTS.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => handleSelectWildlife(sp)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-[#FFCC00]/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-100 group-hover:text-[#FFCC00] transition-colors">
                        {sp.commonName}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {sp.conservationStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic mb-1.5">{sp.scientificName}</p>
                    <div className="p-1.5 rounded bg-slate-950/60 text-[10px] text-amber-200/90 font-mono">
                      <span className="text-[#FFCC00] font-bold">TIP FILMAJE:</span> {sp.directorTip}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. SNAPSHOT MODAL PREVIEW */}
      {snapshotPreview && (
        <div className="fixed inset-0 z-[700] pointer-events-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="max-w-2xl w-full bg-[#03070d] border-4 border-[#FFCC00] rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setSnapshotPreview(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Postcard Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#FFCC00]/40">
              <div className="w-6 h-8 border-2 border-[#FFCC00] bg-transparent flex items-center justify-center">
                <span className="w-2 h-4 bg-[#FFCC00]" />
              </div>
              <div>
                <h4 className="text-sm font-black font-mono tracking-widest text-[#FFCC00] uppercase">
                  NATIONAL GEOGRAPHIC EXPEDITION ARCHIVE
                </h4>
                <p className="text-[10px] text-cyan-300 font-mono">
                  REGISTRO FOTOGRAMÉTRICO DE CAMPO // AMOH V8.5
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {snapshotPreview.title}
              </h2>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">COORDENADAS GPS</span>
                  <span className="text-emerald-300 font-bold">{snapshotPreview.coords}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FECHA & HORA UTC</span>
                  <span className="text-cyan-300">{snapshotPreview.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CONFIGURACIÓN DE LENTE</span>
                  <span className="text-[#FFCC00]">{snapshotPreview.lens}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LICENCIA DE DATOS</span>
                  <span className="text-slate-300">CC-BY-4.0 SCAR / AMOH</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#081e30] border border-cyan-500/30 text-xs text-cyan-100 leading-relaxed">
                <span className="font-bold text-[#FFCC00] block mb-1 font-mono">DIARIO DE EXPEDICIÓN:</span>
                {snapshotPreview.directorNote}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    alert('Fotograma guardado en el archivo de misión local de AMOH.');
                    setSnapshotPreview(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#FFCC00] text-slate-950 font-extrabold text-xs flex items-center gap-2 hover:bg-yellow-300 transition-all shadow-[0_0_20px_rgba(255,204,0,0.5)]"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORTAR PLACA FOTOGRÁFICA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
