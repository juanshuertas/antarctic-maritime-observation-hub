import { Award } from 'lucide-react';
import { INITIAL_ACHIEVEMENTS } from './passport-data';

export default function PassportAchievements() {
  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-[#1b3543] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#ffd9b8]" />
            <span>Insignias & Logros Polares</span>
          </h1>
          <p className="text-xs text-[#8faab5] mt-1">
            Reconocimientos otorgados por misiones extremas, hitos de navegación y aportes destacados a la ciencia antártica.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-[#213f4f] bg-[#0c1824] text-[#ffd9b8] text-xs font-bold">
          {INITIAL_ACHIEVEMENTS.length} Insignias Desbloqueadas
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INITIAL_ACHIEVEMENTS.map((ach) => (
          <div
            key={ach.id}
            className="p-6 rounded-3xl border border-[#1b3543] bg-[#0a1520] hover:border-[#ffd9b8]/50 transition-all space-y-4 shadow-xl flex items-start gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#122330] border border-[#213f4f] flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {ach.icon}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#ffd9b8] uppercase tracking-wider">
                  {ach.category}
                </span>
                <span className="text-[11px] text-[#6e8996]">{ach.date}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{ach.title}</h3>
              <p className="text-xs text-[#8faab5] leading-relaxed">{ach.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
