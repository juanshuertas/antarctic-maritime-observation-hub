import { Play, FastForward, Rewind } from 'lucide-react';

export default function Timeline() {
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[300] h-[64px] min-w-[600px] rounded-full border px-4 py-2 flex items-center gap-6 backdrop-blur-md shadow-2xl"
      style={{
        backgroundColor: 'rgba(16, 22, 38, 0.8)',
        borderColor: 'var(--amoh-border)'
      }}
    >
      {/* Controls */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
          <Rewind className="w-4 h-4" />
        </button>
        <button className="p-3 rounded-full bg-white text-black hover:bg-white/90 transition-all active:scale-95">
          <Play className="w-5 h-5 fill-current" />
        </button>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Time Slider / Range */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between text-[10px] font-mono opacity-50 text-white px-1">
          <span>2026-01-01</span>
          <span className="text-cyan-400 font-bold">2026-09-17 14:30 UTC</span>
          <span>2026-12-31</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full relative cursor-pointer group">
          <div className="absolute left-0 top-0 h-full bg-cyan-500 w-2/3 rounded-full" />
          <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-cyan-500 shadow-lg group-hover:scale-125 transition-transform" />
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2">
        <div className="flex p-1 rounded-lg bg-black/40 border border-white/10">
          <button className="px-3 py-1 rounded-md text-[11px] font-bold transition-all"
            style={{ backgroundColor: 'var(--amoh-surface-raised)', color: 'var(--amoh-text)' }}>
            LIVE
          </button>
          <button className="px-3 py-1 rounded-md text-[11px] font-medium opacity-50 hover:opacity-100 transition-all"
            style={{ color: 'var(--amoh-text-secondary)' }}>
            REPLAY
          </button>
        </div>
      </div>
    </div>
  );
}
