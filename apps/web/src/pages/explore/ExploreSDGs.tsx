import { useState } from 'react';
import {
  SDG_REGISTRY,
  OFFICIAL_UN_SDG_DISCLAIMER,
  type SDGDefinition,
  type SDGEvidenceLink,
} from '../../lib/sdg-registry';
import { AlertCircle, Info, Lock, ExternalLink } from 'lucide-react';

export default function ExploreSDGs() {
  const [selectedGoal, setSelectedGoal] = useState<SDGDefinition>(SDG_REGISTRY[14]);
  const [commercialMode, setCommercialMode] = useState(false);

  // Sample verified evidence links
  const SAMPLE_EVIDENCE: SDGEvidenceLink[] = [
    {
      sdgNumber: 14,
      targetId: '14.1',
      type: 'SOURCE_DECLARED',
      basis: 'Publicación Científica / Datos Abiertos PAC X',
      evidence: 'Campaña oceanográfica ARC Simón Bolívar: Muestreo de microplásticos y calidad de columna de agua en Estrecho de Gerlache.',
      reviewer: 'Comisión Colombiana del Océano (CCO)',
      timestamp: '2026-02-18T14:30:00Z',
      confidence: 1.0,
    },
    {
      sdgNumber: 14,
      targetId: '14.4',
      type: 'EXPERT_REVIEWED',
      basis: 'Informe Técnico Grupo Científico CCAMLR',
      evidence: 'Datos de esfuerzo pesquero aparente de Global Fishing Watch validados contra cuotas de captura de krill (Euphausia superba).',
      reviewer: 'Dr. M. Arana (Observador Científico CCAMLR)',
      timestamp: '2026-01-20T09:15:00Z',
      confidence: 0.95,
    },
    {
      sdgNumber: 13,
      targetId: '13.1',
      type: 'AI_SUGGESTED',
      basis: 'Análisis de Correlación Multiespectral Sentinel-1 SAR',
      evidence: 'Detección automática de aceleración de flujo glacial en Thwaites coincidente con anomalía positiva de temperatura superficial de fondo.',
      reviewer: 'AMOH Pythia Inference Engine v2.4 (Algorítmico)',
      timestamp: '2026-03-01T18:00:00Z',
      confidence: 0.88,
    },
  ];

  const currentEvidence = SAMPLE_EVIDENCE.filter((e) => e.sdgNumber === selectedGoal.number);

  return (
    <div className="space-y-6 text-[#edf5f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* 1. Official Compliance Banner */}
      <div className="p-4 rounded-2xl bg-[#080e19] border border-[#1c2940] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#35c3c8]/10 text-[#35c3c8] border border-[#35c3c8]/30 font-bold">
              NON-UN VERSION 2 COMPLIANCE
            </span>
            <span className="text-xs text-[#8faab5]">· 17 Objetivos · 169 Metas Globales</span>
          </div>
          <p className="text-xs text-[#8faab5] leading-relaxed">
            {OFFICIAL_UN_SDG_DISCLAIMER}
          </p>
        </div>

        {/* Commercial/Fundraising License Gate */}
        <div className="shrink-0 flex items-center gap-3 p-2 rounded-xl bg-[#101626] border border-[#24344d]">
          <div className="text-right font-mono">
            <div className="text-[10px] uppercase font-bold text-white flex items-center justify-end gap-1">
              <Lock className="w-3 h-3 text-[#ffc845]" />
              <span>Modo Comercial</span>
            </div>
            <div className="text-[9px] text-[#8faab5]">
              {commercialMode ? 'Licencia Comercial Requerida' : 'Uso Científico / Educativo'}
            </div>
          </div>
          <button
            onClick={() => setCommercialMode(!commercialMode)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              commercialMode ? 'bg-[#ffc845]' : 'bg-[#1c2940]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                commercialMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Grid of 17 Official 1:1 Square SDG Cards */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-[#8faab5] mb-3 flex items-center justify-between">
          <span>Los 17 Objetivos de Desarrollo Sostenible (Click para explorar metas polares)</span>
          <a
            href="https://www.un.org/sustainabledevelopment"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#35c3c8] hover:underline flex items-center gap-1 normal-case text-[11px]"
          >
            <span>Portal Oficial ONU</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2.5">
          {Object.values(SDG_REGISTRY).map((sdg) => {
            const isSelected = selectedGoal.number === sdg.number;
            return (
              <button
                key={sdg.number}
                onClick={() => setSelectedGoal(sdg)}
                className={`aspect-square p-2.5 rounded-2xl flex flex-col justify-between text-left transition-all relative overflow-hidden group shadow-md ${
                  isSelected
                    ? 'ring-2 ring-white scale-[1.03] shadow-xl'
                    : 'opacity-90 hover:opacity-100 hover:scale-[1.02]'
                }`}
                style={{ backgroundColor: sdg.color }}
              >
                <div className="flex justify-between items-start">
                  <span
                    className="text-lg font-black font-mono leading-none"
                    style={{ color: sdg.contrastTextColor }}
                  >
                    {sdg.number}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  )}
                </div>

                <div className="mt-auto">
                  <div
                    className="text-[11px] font-bold leading-tight uppercase line-clamp-3"
                    style={{ color: sdg.contrastTextColor }}
                  >
                    {sdg.shortTitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Selected Goal View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left 2 Cols: Goal Context & Polar Targets */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="p-6 rounded-3xl border shadow-xl flex flex-col justify-between"
            style={{
              backgroundColor: '#0a1622',
              borderColor: `${selectedGoal.color}66`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-lg text-white shrink-0 shadow-md"
                style={{ backgroundColor: selectedGoal.color }}
              >
                {selectedGoal.number}
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  ODS {selectedGoal.number}: {selectedGoal.name}
                </h2>
                <p className="text-xs text-[#8faab5]">
                  {selectedGoal.description}
                </p>
              </div>
            </div>

            <div className="mt-3 p-3.5 rounded-xl bg-[#061019] border border-[#1b394b] space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-[#35c3c8] font-bold">
                Relevancia en el Continente Blanco y Océano Austral
              </div>
              <p className="text-xs text-[#b7c5d8] leading-relaxed">
                {selectedGoal.polarRelevance}
              </p>
            </div>
          </div>

          {/* Targets List */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#8faab5]">
              Metas Aplicables a la Investigación Polar ({selectedGoal.targets.length})
            </div>

            {selectedGoal.targets.map((tgt) => (
              <div
                key={tgt.id}
                className="p-4 rounded-2xl bg-[#080e19] border border-[#1c2940] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-[#1c2940]">
                    Meta {tgt.code} · {tgt.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#72e0b5]">
                    Auditable
                  </span>
                </div>
                <p className="text-xs text-[#b7c5d8]">
                  {tgt.description}
                </p>
                <div className="p-2.5 rounded-xl bg-[#0d1b28] border border-[#1b394b] text-[11px] text-[#caf9f7] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#35c3c8] shrink-0 mt-0.5" />
                  <span><strong>Contexto Polar:</strong> {tgt.polarContext}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Evidence Audit Trail & Provenance */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#080e19] border border-[#1c2940] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#1c2940]">
              <span className="font-bold text-white uppercase">Registro de Evidencia</span>
              <span className="text-[#35c3c8]">{currentEvidence.length} Enlaces</span>
            </div>

            {currentEvidence.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8faab5] space-y-1">
                <AlertCircle className="w-6 h-6 text-[#8faab5] mx-auto opacity-50" />
                <p>Sin evidencia directa cargada para este objetivo en la sesión actual.</p>
                <p className="text-[10px]">Las misiones de campo pueden asociar observaciones con este ODS.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentEvidence.map((ev, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#101626] border border-[#24344d] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          ev.type === 'SOURCE_DECLARED'
                            ? 'bg-[#35c3c8]/20 text-[#35c3c8]'
                            : ev.type === 'EXPERT_REVIEWED'
                            ? 'bg-[#72e0b5]/20 text-[#72e0b5]'
                            : 'bg-[#a995ff]/20 text-[#a995ff]'
                        }`}
                      >
                        {ev.type}
                      </span>
                      {ev.confidence && (
                        <span className="text-[10px] font-mono text-[#8faab5]">
                          {(ev.confidence * 100).toFixed(0)}% Confianza
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-semibold text-white">
                      {ev.basis}
                    </div>

                    <p className="text-[10px] text-[#b7c5d8] leading-relaxed">
                      {ev.evidence}
                    </p>

                    <div className="pt-1 border-t border-[#1c2940] flex justify-between items-center text-[9px] font-mono text-[#8faab5]">
                      <span>{ev.reviewer}</span>
                      <span>{ev.timestamp.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
