import { useState, useRef, useEffect, useCallback } from 'react';
import { Split, X } from 'lucide-react';

export type SwipeComparisonMode =
  | 'OPTICAL_VS_VELOCITY'
  | 'BEDROCK_VS_SURFACE'
  | 'OPTICAL_VS_SAR_DARK_VESSELS';

interface MapSwipeComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  onSwipeChange?: (position: number, mode: SwipeComparisonMode) => void;
}

export default function MapSwipeComparison({
  isOpen,
  onClose,
  onSwipeChange,
}: MapSwipeComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 to 100
  const [mode, setMode] = useState<SwipeComparisonMode>('OPTICAL_VS_VELOCITY');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSliderPosition(percentage);
      if (onSwipeChange) {
        onSwipeChange(percentage, mode);
      }
    },
    [isDragging, mode, onSwipeChange]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (onSwipeChange) {
      onSwipeChange(sliderPosition, mode);
    }
  }, [sliderPosition, mode, onSwipeChange]);

  if (!isOpen) return null;

  const modeDescriptions: Record<
    SwipeComparisonMode,
    { title: string; leftLabel: string; rightLabel: string; description: string }
  > = {
    OPTICAL_VS_VELOCITY: {
      title: 'Mosaico Satelital 4K vs. Velocidad de Hielo InSAR',
      leftLabel: 'Satélite Óptico 4K UHD (ESRI / PGC)',
      rightLabel: 'Velocidad de Flujo Glaciar (Sentinel-1 InSAR)',
      description:
        'Compara visualmente la textura superficial de glaciares con la velocidad de deformación y flujo hacia el mar medida por radar.',
    },
    BEDROCK_VS_SURFACE: {
      title: 'Topografía de Superficie (REMA) vs. Roca Basal (BedMachine)',
      leftLabel: 'Elevación Superficial REMA 3D',
      rightLabel: 'Lecho Rocoso Subglacial (Bedmap2)',
      description:
        'Revela la topografía que yace oculta bajo los 4 kilómetros de hielo y las cuencas marinas bajo el nivel del mar.',
    },
    OPTICAL_VS_SAR_DARK_VESSELS: {
      title: 'Satélite Óptico vs. Detecciones SAR Global Fishing Watch',
      leftLabel: 'Vigilancia Visual Óptica',
      rightLabel: 'Buques Detectados por Radar SAR (Oscuros sin AIS)',
      description:
        'Contrasta la cobertura óptica con detecciones radar de buques que operan en zonas protegidas de la Antártida sin transmitir AIS.',
    },
  };

  const currentModeInfo = modeDescriptions[mode];

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="absolute inset-0 z-[190] pointer-events-none overflow-hidden select-none"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto z-[200] max-w-xl w-full px-4">
        <div className="bg-[#07131df2] border border-[#35c3c8]/40 rounded-2xl shadow-2xl p-3 backdrop-blur-xl text-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#35c3c8]/20 text-[#35c3c8] border border-[#35c3c8]/40">
                <Split className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Swipe Comparador Criosférico (SatSchool / StoryMap)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Desliza la barra central para comparar capas en tiempo real
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Cerrar Swipe"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Selector Buttons */}
          <div className="flex gap-1.5">
            {(Object.keys(modeDescriptions) as SwipeComparisonMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono transition-colors text-center truncate ${
                  mode === m
                    ? 'bg-[#35c3c8] text-black font-bold'
                    : 'bg-[#0f283a] text-slate-300 hover:bg-[#153a52] border border-[#1f3947]'
                }`}
              >
                {m === 'OPTICAL_VS_VELOCITY'
                  ? 'Satélite / InSAR'
                  : m === 'BEDROCK_VS_SURFACE'
                  ? 'Superficie / Roca Basal'
                  : 'Óptico / SAR Radar'}
              </button>
            ))}
          </div>

          {/* Labels for Left / Right */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-300">
            <span className="text-cyan-300 flex items-center gap-1 font-semibold truncate max-w-[45%]">
              ◀ {currentModeInfo.leftLabel}
            </span>
            <span className="text-[10px] text-slate-400">
              {Math.round(sliderPosition)}%
            </span>
            <span className="text-amber-300 flex items-center gap-1 font-semibold truncate max-w-[45%] justify-end">
              {currentModeInfo.rightLabel} ▶
            </span>
          </div>
        </div>
      </div>

      {/* Vertical Divider Line & Draggable Knob */}
      <div
        className="absolute top-0 bottom-0 pointer-events-auto cursor-ew-resize z-[195] flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onPointerDown={handlePointerDown}
      >
        {/* Glow Line */}
        <div className="w-[3px] h-full bg-gradient-to-b from-[#35c3c8] via-white to-[#35c3c8] shadow-[0_0_12px_#35c3c8]" />

        {/* Draggable Knob */}
        <div className="absolute w-10 h-10 rounded-full bg-[#07131d] border-2 border-[#35c3c8] shadow-2xl flex items-center justify-center text-[#35c3c8] hover:scale-110 active:scale-95 transition-transform">
          <Split className="w-5 h-5" />
        </div>
      </div>

      {/* Visual Overlay Indicators */}
      <div
        className="absolute top-36 left-4 pointer-events-none z-[192] px-3 py-1.5 rounded-xl bg-black/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md transition-opacity"
        style={{ opacity: sliderPosition < 15 ? 0 : 1 }}
      >
        {currentModeInfo.leftLabel}
      </div>

      <div
        className="absolute top-36 right-4 pointer-events-none z-[192] px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-amber-300 text-xs font-mono backdrop-blur-md transition-opacity"
        style={{ opacity: sliderPosition > 85 ? 0 : 1 }}
      >
        {currentModeInfo.rightLabel}
      </div>
    </div>
  );
}
