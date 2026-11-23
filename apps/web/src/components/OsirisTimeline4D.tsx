import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Radio, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { SpatialCameraStore, type SpatialCameraState } from '../lib/spatial-camera-store';

export default function OsirisTimeline4D() {
  const [cameraState, setCameraState] = useState<SpatialCameraState>(() => SpatialCameraStore.getState());
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    return SpatialCameraStore.subscribe((state) => {
      setCameraState(state);
    });
  }, []);

  const currentDate = useMemo(() => new Date(cameraState.selectedTimeUtc), [cameraState.selectedTimeUtc]);
  const isPlaying = Boolean(cameraState.isPlaying);
  const isLive = Boolean(cameraState.isLive);
  const currentSpeed = cameraState.playbackSpeed || 60;
  const timeRangeHours = cameraState.timeRangeHours || 24;

  // Window bounds (e.g. from -24h to Now)
  const windowEndMs = Date.now();
  const windowStartMs = windowEndMs - timeRangeHours * 3600 * 1000;
  const currentMs = Math.min(windowEndMs, Math.max(windowStartMs, currentDate.getTime()));

  // Slider progress (0 to 100%)
  const progressPercent = Math.max(0, Math.min(100, ((currentMs - windowStartMs) / (windowEndMs - windowStartMs)) * 100));

  const handleTogglePlay = () => {
    if (isPlaying) {
      SpatialCameraStore.setPlaying(false);
    } else {
      if (isLive) {
        // When starting play from live, set current time to now and begin
        SpatialCameraStore.setPlaying(true);
      } else {
        SpatialCameraStore.setPlaying(true);
      }
    }
  };

  const handleSetLive = () => {
    SpatialCameraStore.setLive();
  };

  const handleSpeedSelect = (speed: number) => {
    SpatialCameraStore.setPlaybackSpeed(speed);
  };

  const handleRangeSelect = (hours: number) => {
    SpatialCameraStore.setTimeRangeHours(hours);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    const targetMs = windowStartMs + (pct / 100) * (windowEndMs - windowStartMs);
    SpatialCameraStore.setTime(new Date(targetMs).toISOString());
  };

  const handleStep = (hours: number) => {
    const targetMs = currentMs + hours * 3600 * 1000;
    const clampedMs = Math.min(windowEndMs, Math.max(windowStartMs, targetMs));
    SpatialCameraStore.setTime(new Date(clampedMs).toISOString());
  };

  // Format date helper
  const dateStr = currentDate.toISOString().slice(0, 10);
  const timeStr = currentDate.toISOString().slice(11, 19);

  return (
    <div
      className="absolute bottom-[134px] md:bottom-[76px] left-1/2 -translate-x-1/2 z-[150] transition-all duration-300 select-none pointer-events-auto"
      style={{ maxWidth: 'calc(100vw - 32px)', width: isCollapsed ? 'auto' : '820px' }}
    >
      {isCollapsed ? (
        // Collapsed Floating Pill
        <div
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full cursor-pointer border shadow-xl backdrop-blur-md hover:scale-105 transition-all bg-[#050e18ee] border-cyan-500/30 hover:border-cyan-400/60"
        >
          <div className="flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-[10px] font-mono font-bold text-white tracking-wider">
              {isLive ? '4D EN VIVO' : '4D REPLAY'}
            </span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <span className="text-[11px] font-mono text-cyan-300 font-bold">
            {timeStr} UTC
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-cyan-400/80 ml-0.5" />
        </div>
      ) : (
        // Expanded Full Aerospace 4D Timeline
        <div
          className="rounded-2xl border px-4 py-3 flex flex-col gap-2.5 backdrop-blur-xl shadow-2xl text-white transition-all bg-[#040c16f2] border-cyan-500/40 shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_24px_rgba(6,182,212,0.15)]"
        >
          {/* Header Row: LIVE Status, UTC Readout, Window Ranges, Collapse */}
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <div className="flex items-center gap-3">
              {/* LIVE Badge Button */}
              <button
                onClick={handleSetLive}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-all ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
                }`}
              >
                <Radio className={`w-3 h-3 ${isLive ? 'animate-pulse text-emerald-400' : ''}`} />
                <span>{isLive ? 'EN VIVO' : 'SALTAR A VIVO'}</span>
              </button>

              {/* Exact UTC Monospace Clock */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px] text-white/60">{dateStr}</span>
                <span className="text-[13px] font-bold text-cyan-300 tracking-wider">{timeStr}</span>
                <span className="text-[10px] text-white/40">UTC</span>
              </div>
            </div>

            {/* Range Presets: 24H, 7D, TEMPORADA */}
            <div className="flex items-center gap-1.5 bg-black/50 p-0.5 rounded-lg border border-white/10">
              {[
                { label: '24H', hours: 24 },
                { label: '7D', hours: 168 },
                { label: 'TEMPORADA', hours: 2160 },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleRangeSelect(r.hours)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                    timeRangeHours === r.hours
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Minimizar Línea de Tiempo"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber Slider Row */}
          <div className="flex flex-col gap-1 px-1">
            <div className="relative flex items-center group">
              {/* Range Input Slider */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.05"
                value={progressPercent}
                onChange={handleSliderChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-800/80 accent-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #38bdf8 ${progressPercent}%, rgba(30, 41, 59, 0.8) ${progressPercent}%, rgba(30, 41, 59, 0.8) 100%)`,
                }}
              />
            </div>

            {/* Time Ticks */}
            <div className="flex justify-between text-[10px] font-mono text-white/40 px-0.5">
              <span>-{timeRangeHours}h ({new Date(windowStartMs).toISOString().slice(5, 16)} UTC)</span>
              <span className="text-cyan-400 font-bold">{dateStr} {timeStr}</span>
              <span>AHORA ({new Date(windowEndMs).toISOString().slice(5, 16)} UTC)</span>
            </div>
          </div>

          {/* Bottom Controls Row: Play/Pause, Step, Speed */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {/* Step Back -1h */}
              <button
                onClick={() => handleStep(-1)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors"
                title="Retroceder 1 Hora"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Play / Pause Toggle */}
              <button
                onClick={handleTogglePlay}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 ${
                  isPlaying
                    ? 'bg-amber-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.5)]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_16px_rgba(6,182,212,0.4)]'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                <span>{isPlaying ? 'PAUSAR' : 'REPRODUCIR 4D'}</span>
              </button>

              {/* Step Forward +1h */}
              <button
                onClick={() => handleStep(1)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors"
                title="Avanzar 1 Hora"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Playback Speeds */}
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
              <span className="text-[10px] font-mono text-white/40 px-1.5">VELOCIDAD:</span>
              {[
                { label: '1x', val: 1 },
                { label: '10x', val: 10 },
                { label: '60x (1m/s)', val: 60 },
                { label: '300x (5m/s)', val: 300 },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSpeedSelect(s.val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    currentSpeed === s.val
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
