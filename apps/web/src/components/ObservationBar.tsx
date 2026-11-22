import { Plus, Eye, FileText, ShieldCheck } from 'lucide-react';

interface ObservationBarProps {
  onNewObservation: () => void;
}

export default function ObservationBar({
  onNewObservation,
}: ObservationBarProps) {
  return (
    <div
      className="w-full h-[76px] z-[300] border-t px-6 sm:px-8 flex items-center justify-between select-none transition-all"
      style={{
        backgroundColor: '#071620',
        borderColor: '#193444',
        color: '#edf5f5',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Left: De la observación a la evidencia */}
      <div className="flex flex-col min-w-[240px] max-w-[320px]">
        <span className="text-[9px] uppercase tracking-[1.5px] font-mono text-[#58d5e3] font-semibold">
          DE LA OBSERVACIÓN A LA EVIDENCIA
        </span>
        <span className="text-sm font-bold text-white tracking-wide">
          Tu mirada también cuenta.
        </span>
        <span className="text-[11px] text-[#8faab5] truncate">
          Registra el océano. Conserva el contexto.
        </span>
      </div>

      {/* Center: The 3 Core Principles */}
      <div className="hidden md:flex items-center gap-8 lg:gap-12">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#102430] border border-[#213f4f] flex items-center justify-center text-xs font-mono font-bold text-[#72e0b5]">
            01
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#72e0b5]" />
              Observa
            </span>
            <span className="text-[10px] text-[#8faab5]">Hielo, buques, fauna</span>
          </div>
        </div>

        <div className="w-px h-6 bg-[#1a3848]" />

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#102430] border border-[#213f4f] flex items-center justify-center text-xs font-mono font-bold text-[#58d5e3]">
            02
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#58d5e3]" />
              Documenta
            </span>
            <span className="text-[10px] text-[#8faab5]">Ubicación y notas</span>
          </div>
        </div>

        <div className="w-px h-6 bg-[#1a3848]" />

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#102430] border border-[#213f4f] flex items-center justify-center text-xs font-mono font-bold text-[#caf9f7]">
            03
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#caf9f7]" />
              Conserva
            </span>
            <span className="text-[10px] text-[#8faab5]">En este dispositivo</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">

        <button
          onClick={onNewObservation}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#72e0b5] text-[#06141c] hover:bg-[#8ef0cb] transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Nueva observación</span>
        </button>
      </div>
    </div>
  );
}
