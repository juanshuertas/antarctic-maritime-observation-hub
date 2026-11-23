import { useState } from 'react';
import { Award, CheckCircle2, Sparkles, Coins } from 'lucide-react';
import { INITIAL_GRANTS, INITIAL_PASSPORT_PROFILE } from './passport-data';

export default function PassportRewards() {
  const profile = INITIAL_PASSPORT_PROFILE;
  const [grants, setGrants] = useState(INITIAL_GRANTS);
  const [claiming, setClaiming] = useState<string | null>(null);

  const handleClaim = (id: string) => {
    setClaiming(id);
    setTimeout(() => {
      setGrants((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: 'disbursed' as const } : g))
      );
      setClaiming(null);
    }, 1000);
  };

  return (
    <div className="space-y-8 font-mono animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#1b384c] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#35c3c8] font-bold tracking-wider uppercase mb-1">
            <Coins className="w-4 h-4" />
            <span>Economía de Ciencia Abierta</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Becas, Grants & Mérito Científico
          </h1>
          <p className="text-xs text-[#8faab5] mt-1 max-w-2xl">
            Incentivos para la administración de datos polares, fondos de investigación SCAR/CCAMLR y reconocimiento por contribuciones observacionales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl border border-[#72e0b5]/30 bg-[#72e0b5]/10 text-[#72e0b5] text-xs font-bold">
            Fondo Activo AMOH: $43,500 USD
          </div>
        </div>
      </div>

      {/* XP & Scientific Reputation Progress Card */}
      <div className="p-6 rounded-3xl bg-[#091824] border border-[#1d3c4e] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#6c8a99] uppercase tracking-wider block">
              Puntos de Mérito Científico (XP)
            </span>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-[#35c3c8]">{profile.amohXp} XP</span>
              <span className="text-xs text-[#8faab5] font-normal">/ {profile.nextMilestoneXp} XP para Nivel Revisor Senior</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#35c3c8]/15 text-[#35c3c8] border border-[#35c3c8]/30">
            Rango: Observador Certificado
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#06121c] border border-[#162d3d] overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#35c3c8] to-[#72e0b5] transition-all duration-500"
            style={{ width: `${(profile.amohXp / profile.nextMilestoneXp) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8faab5]">
          <span>30 XP restantes para desbloquear atribución en publicaciones CCAMLR</span>
          <span className="text-[#72e0b5] font-bold">96% Completado</span>
        </div>
      </div>

      {/* Scientific Grants List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-[#72e0b5]" />
          <span>Fondos y Becas Asignadas</span>
        </h2>

        {grants.map((gr) => (
          <div
            key={gr.id}
            className="p-6 rounded-3xl border border-[#1d3c4e] bg-[#091824] hover:border-[#35c3c8]/50 transition-all space-y-3 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#183446] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#35c3c8] uppercase tracking-wider block">
                  {gr.sponsor}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{gr.title}</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#72e0b5]">
                  {gr.amount} {gr.currency}
                </div>
                <div className="text-[10px] uppercase text-[#6c8a99] font-semibold">{gr.status}</div>
              </div>
            </div>

            <p className="text-xs text-[#cbd9df] leading-relaxed">{gr.purpose}</p>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[#6c8a99] text-[11px]">
                {gr.disbursedDate ? `Desembolsado: ${gr.disbursedDate}` : 'Elegible para ejecución de proyecto'}
              </span>

              {gr.status === 'awarded' && (
                <button
                  onClick={() => handleClaim(gr.id)}
                  disabled={claiming === gr.id}
                  className="px-4 py-2 rounded-xl bg-[#72e0b5] hover:bg-[#5cd4a3] text-[#050e14] font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{claiming === gr.id ? 'Procesando...' : 'Acreditar Beca'}</span>
                </button>
              )}

              {gr.status === 'disbursed' && (
                <div className="flex items-center gap-1 text-[#72e0b5] font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fondos Acreditados a Cuenta Institucional</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
