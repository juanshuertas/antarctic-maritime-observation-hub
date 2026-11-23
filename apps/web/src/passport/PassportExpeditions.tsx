import { Compass, Ship, Anchor, Calendar, CheckCircle2, AlertTriangle, ArrowRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { INITIAL_EXPEDITIONS } from './passport-data';

export default function PassportExpeditions() {
  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-[#1b3543] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-[#00e5ff]" />
            <span>Expediciones Científicas Polares</span>
          </h1>
          <p className="text-xs text-[#8faab5] mt-1">
            Cruceros oceanográficos, campañas del Programa Antártico Colombiano y propuestas de investigación vinculadas al Pasaporte AMOH.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/expeditions"
            className="px-3.5 py-1.5 rounded-xl bg-[#00e5ff] text-[#050e14] text-xs font-bold hover:bg-[#38bdf8] transition-all flex items-center gap-1.5 shadow-md"
          >
            <span>Explorar Módulo Expediciones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. PAC 13 COLOMBIAN ANTARCTIC EXPEDITION SPOTLIGHT */}
      <div className="p-6 rounded-3xl border-2 border-[#00e5ff]/60 bg-gradient-to-br from-[#071f2e] via-[#092233] to-[#041018] space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#183a50] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40">
              🇨🇴 PAC EXPEDITION WORKSPACE PROTOTYPE
            </span>
            <span className="text-[11px] text-[#72e0b5] font-bold">
              XIII Expedición Científica de Colombia a la Antártica (2026–2027)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/passport/credentials"
              className="inline-flex items-center gap-1 text-xs text-[#a855f7] hover:text-white font-bold bg-[#a855f7]/15 px-3 py-1 rounded-xl border border-[#a855f7]/30 hover:bg-[#a855f7] hover:text-[#050e14] transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Ver Credencial Pre-Antártica</span>
            </Link>

            <Link
              to="/expeditions/exp-pac-13/overview"
              className="inline-flex items-center gap-1.5 text-xs text-[#00e5ff] hover:text-white font-bold bg-[#00e5ff]/15 px-3 py-1 rounded-xl border border-[#00e5ff]/30 hover:bg-[#00e5ff] hover:text-[#050e14] transition-all"
            >
              <span>Abrir Misión PAC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white font-sans">
            Programa Antártico Colombiano (PAC) · Comisión Colombiana del Océano (CCO)
          </h2>
          <p className="text-xs text-[#8faab5] font-sans mt-1">
            Investigador Principal: <strong className="text-white">Juan Sebastian Huertas Olea</strong> · Buques: ARC Simón Bolívar / ARC 20 de Julio · Método: AMOH v1.1-PAC
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#050e14] border border-[#142836] text-[11px] text-[#f59e0b] italic flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Prototipo de planificación y gobernanza. No implica aval ni selección oficial de la CCO. Sellos y firmas criptográficas se acuñarán tras ratificación oficial.</span>
        </div>
      </div>

      {/* 2. FEATURED NATGEO PROPOSAL SPOTLIGHT */}
      <div className="p-6 rounded-3xl border border-[#1b3543] bg-gradient-to-br from-[#061724] via-[#081e2e] to-[#040f17] space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18364a] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
              PROPUESTA / APPLICATION (NO ADJUDICADA)
            </span>
            <span className="text-[11px] text-[#38bdf8] font-bold">
              NGS-Lindblad Expeditions Visiting Scientist Program 2027–2028
            </span>
          </div>

          <Link
            to="/expeditions/exp-natgeo-2027/overview"
            className="inline-flex items-center gap-1.5 text-xs text-[#00e5ff] hover:text-white font-bold bg-[#00e5ff]/15 px-3 py-1 rounded-xl border border-[#00e5ff]/30 hover:bg-[#00e5ff] hover:text-[#050e14] transition-all"
          >
            <span>Abrir en Expediciones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white font-sans">
            AI-enabled satellite and AIS monitoring of Antarctic shipping pressure
          </h2>
          <p className="text-xs text-[#8faab5] font-sans mt-1">
            Investigador Principal: <strong className="text-white">Juan Sebastian Huertas Olea</strong> · Región: Península Antártica Occidental (WAP)
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#050e14] border border-[#142836] text-[11px] text-[#f59e0b] italic flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>No National Geographic or Lindblad endorsement is implied. Registrado como propuesta de investigación no invasiva.</span>
        </div>
      </div>

      {/* 3. PREVIOUS VERIFIED EXPEDITIONS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8faab5]">
          Expediciones Previas Verificadas ({INITIAL_EXPEDITIONS.length})
        </h3>
        <div className="space-y-4">
        {INITIAL_EXPEDITIONS.map((exp) => (
          <div
            key={exp.id}
            className="p-6 rounded-3xl border border-[#1b3543] bg-[#0a1520] hover:border-[#00e5ff]/50 transition-all space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#162734] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/40">
                    {exp.code}
                  </span>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Ship className="w-4 h-4 text-[#72e0b5]" />
                    <span>{exp.vessel}</span>
                  </span>
                </div>
                <div className="text-xs text-[#8faab5] mt-1">
                  Científico Jefe: <span className="text-white font-semibold">{exp.chiefScientist}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] border ${
                  exp.status === 'completed'
                    ? 'bg-[#72e0b5]/15 border-[#72e0b5]/40 text-[#72e0b5]'
                    : 'bg-[#00e5ff]/15 border-[#00e5ff]/40 text-[#00e5ff]'
                }`}>
                  {exp.status === 'completed' ? 'Completada' : 'En Curso'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#b7c5d8] leading-relaxed">
              {exp.trackSummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-[#6e8996] border-t border-[#122330]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>{exp.startDate} al {exp.endDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-[#72e0b5]" />
                <span className="truncate">Puertos: {exp.ports.join(', ')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>{exp.samplesCount} Muestras Oceanográficas</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
