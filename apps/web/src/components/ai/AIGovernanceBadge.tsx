import { useState } from 'react';
import { ShieldCheck, Scale } from 'lucide-react';

interface AIGovernanceBadgeProps {
  modelName?: string;
  brierScore?: number;
  sha256Hash?: string;
  isSimulated?: boolean;
  className?: string;
}

export function AIGovernanceBadge({
  modelName = 'Pythia Ocean Intelligence',
  brierScore = 0.16,
  sha256Hash = 'sha256:7b4f8d...',
  isSimulated = false,
  className = '',
}: AIGovernanceBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#00a6a6]/10 border border-[#00a6a6]/30 text-[#35c3c8] text-[10px] font-mono cursor-pointer hover:bg-[#00a6a6]/20 transition-all ${className}`}
        title="Verificado bajo Marco de Gobernanza de IA de la ONU (Res. A/78/265)"
      >
        <ShieldCheck className="w-3 h-3 text-[#35c3c8]" />
        <span className="font-semibold tracking-wide">GOBIERNO IA ONU</span>
        <span className="text-[#8faab5]">|</span>
        <span className="text-[#a8c2ce]">Brier: {brierScore.toFixed(2)}</span>
        {isSimulated && (
          <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] border border-amber-500/30">
            SIMULADO
          </span>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#071722] border border-[#213f52] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#142e3d] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#00a6a6]/20 border border-[#00a6a6]/40 text-[#35c3c8]">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Certificación Ética de IA</h4>
                  <p className="text-[10px] font-mono text-[#8faab5]">Marco Normativo Multilateral AMOH</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-mono text-[#8faab5] hover:text-white px-2 py-1 rounded bg-[#0a1e2c]"
              >
                CERRAR
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#051119] border border-[#142e3d] space-y-1">
                <span className="text-[10px] font-mono text-[#8faab5] uppercase">Modelo Responsable</span>
                <p className="font-semibold text-white">{modelName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-[#051119] border border-[#142e3d]">
                  <span className="text-[10px] font-mono text-[#8faab5] uppercase">Calibración Brier</span>
                  <p className="font-mono font-bold text-[#72e0b5] text-sm mt-0.5">
                    {brierScore.toFixed(3)}
                    <span className="text-[9px] text-[#8faab5] font-normal ml-1">(Óptimo &lt;0.20)</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#051119] border border-[#142e3d]">
                  <span className="text-[10px] font-mono text-[#8faab5] uppercase">Soberanía Humana</span>
                  <p className="font-mono font-bold text-[#35c3c8] text-xs mt-0.5">
                    HITL OBLIGATORIO
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#051119] border border-[#142e3d] space-y-1">
                <span className="text-[10px] font-mono text-[#8faab5] uppercase">Tratados y Resoluciones Vigentes</span>
                <ul className="text-[11px] text-[#a8c2ce] space-y-1 list-disc list-inside">
                  <li>ONU Res. A/RES/78/265: IA segura para el desarrollo sostenible.</li>
                  <li>Recomendación UNESCO 2021 sobre la Ética de la IA.</li>
                  <li>Tratado Antártico (1959): Fines pacíficos y desmilitarización.</li>
                </ul>
              </div>

              <div className="p-2 rounded-lg bg-[#00a6a6]/5 border border-[#00a6a6]/20 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#8faab5]">SELLO CRIPTOGRÁFICO:</span>
                <span className="text-[#35c3c8] truncate max-w-[200px]">{sha256Hash}</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 rounded-xl bg-[#00a6a6] hover:bg-[#35c3c8] text-[#06141c] font-mono text-xs font-bold transition-all shadow-md"
            >
              Comprendido y Verificado
            </button>
          </div>
        </div>
      )}
    </>
  );
}
