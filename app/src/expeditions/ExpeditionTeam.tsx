import { type ReactNode } from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import { SEED_EXPEDITION_MEMBERS, SEED_NATGEO_EXPEDITION } from './expeditions-data';

export default function ExpeditionTeam(): ReactNode {
  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00e5ff]" />
            <span>Equipo Científico & Gobernanza de la Misión</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Estructura de roles y responsabilidades editoriales para la campaña Antártica 2027–2028.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081824] border border-[#1d3d52] text-xs text-[#72e0b5]">
          <ShieldCheck className="w-4 h-4" />
          <span>Equipo por confirmar</span>
        </div>
      </div>

      {/* Principal Investigator Spotlight Card */}
      <div className="p-6 rounded-3xl border-2 border-[#00e5ff]/50 bg-gradient-to-r from-[#071926] via-[#092233] to-[#05131e] space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18364a] pb-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40">
            INVESTIGADOR PRINCIPAL (LEAD RESEARCHER)
          </span>
          <span className="text-xs text-[#72e0b5]">
            Candidatura Programa Visiting Scientist
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e5ff] to-[#72e0b5] text-[#050e14] font-black text-xl flex items-center justify-center shadow-lg">
            JSHO
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              {SEED_NATGEO_EXPEDITION.leadName}
            </h3>
            <p className="text-xs text-[#38bdf8] font-sans">
              Investigador independiente en etapa temprana · OLEA
            </p>
            <p className="text-[11px] text-[#8faab5] font-sans mt-1">
              Liderazgo en tecnología geoespacial, integración AIS–satélite, diplomacia científica y comunicación. La postulación admite el PI y como máximo un miembro de equipo (regla por reverificar).
            </p>
          </div>
        </div>
      </div>

      {/* Team Roster Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[#8faab5]">
          Cuerpo Científico & Miembros Asignados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEED_EXPEDITION_MEMBERS.map((member) => (
            <div
              key={member.userId}
              className="p-5 rounded-2xl border border-[#1b3543] bg-[#081724] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#00e5ff]/15 text-[#00e5ff]">
                    {member.role}
                  </span>
                  <span className="text-[10px] text-[#72e0b5] font-bold">
                    {member.isVerified ? 'VERIFICADO' : 'PENDIENTE'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-sans">
                    {member.name}
                  </h4>
                  <p className="text-xs text-[#8faab5] font-sans">
                    {member.institution}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#142836] text-[11px] text-[#6e8996] flex items-center justify-between">
                <span>Desde {member.joinedAt}</span>
                <span className="text-[#38bdf8] truncate font-mono">@{member.userId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
