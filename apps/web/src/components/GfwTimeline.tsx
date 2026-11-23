import { useState, useEffect } from 'react';
import { Play, Pause, Calendar, CheckCircle2 } from 'lucide-react';

export type TimeWindow = 'NOW' | '1H' | '6H' | '24H' | '7D' | '30D' | '1Y' | 'HISTORY';

interface GfwTimelineProps {
  onTimeWindowChange?: (window: TimeWindow) => void;
}

export default function GfwTimeline({ onTimeWindowChange }: GfwTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<TimeWindow>('NOW');
  const [utcDate, setUtcDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcDate(now.toISOString().slice(0, 10));
    };
    updateTime();
  }, []);

  const windows: TimeWindow[] = ['NOW', '1H', '6H', '24H', '7D', '30D', '1Y', 'HISTORY'];

  const handleSelectWindow = (w: TimeWindow) => {
    setSelectedWindow(w);
    onTimeWindowChange?.(w);
  };

  return (
    <div className="w-full bg-[#050e14]/90 border-t border-[#1b3543] backdrop-blur-md z-[240] select-none text-[#edf5f5] flex flex-col">
      {/* Top Scrubber & Controls */}
      <div className="h-10 px-4 flex items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-[#f59e0b] text-[#050e14]'
                : 'bg-[#091b24] text-[#00e5ff] hover:bg-[#122b38] border border-[#213f4f]'
            }`}
            title={isPlaying ? 'Pausar Reproducción' : 'Iniciar Reproducción Temporal'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <span className="text-[11px] font-mono text-[#8aa5af] hidden sm:inline">
            {isPlaying ? 'REPLAY EN CURSO' : 'MODO EN VIVO'}
          </span>
        </div>

        {/* Time Windows (GFW inspired) */}
        <div className="flex items-center gap-1 bg-[#091b24] p-0.5 rounded border border-[#213f4f]">
          {windows.map((w) => {
            const isActive = selectedWindow === w;
            return (
              <button
                key={w}
                onClick={() => handleSelectWindow(w)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold transition-all ${
                  isActive
                    ? 'bg-[#00e5ff] text-[#050e14]'
                    : 'text-[#8aa5af] hover:text-white'
                }`}
              >
                {w}
              </button>
            );
          })}
        </div>

        {/* Calendar / Date */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8de8cd]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{utcDate}</span>
        </div>
      </div>

      {/* Bottom Status Ticker (Real states) */}
      <div className="h-6 px-4 bg-[#03090e] border-t border-[#122633] flex items-center justify-between text-[10px] font-mono text-[#627d89]">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <span className="flex items-center gap-1 text-[#00e676]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
            ONLINE
          </span>
          <span>·</span>
          <span>AIS 14 VECTORES</span>
          <span>·</span>
          <span>GFW LATENCIA ~96H</span>
          <span>·</span>
          <span>SENTINEL-1 SAR LATENCIA ~5D</span>
          <span>·</span>
          <span>QUANTARCTICA LOCAL EPSG:3031</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[#8aa5af]">
          <CheckCircle2 className="w-3 h-3 text-[#00e676]" />
          <span>SHA-256 PROVENANCE VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
