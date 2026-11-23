import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2,
  GitCompare,
  ShieldCheck,
  Ship,
  Eye,
} from 'lucide-react';
import {
  SEED_FIELD_OBSERVATIONS,
  SEED_SCIENTIFIC_MATCHUPS,
} from './expeditions-data';
import PB124AdminReview from './PB124AdminReview';

export default function ExpeditionReview(): ReactNode {
  const { expeditionId = 'exp-natgeo-2027' } = useParams();
  const expeditionObservations = SEED_FIELD_OBSERVATIONS.filter((o) => o.expeditionId === expeditionId);
  const expeditionMatchups = SEED_SCIENTIFIC_MATCHUPS.filter((m) => m.expeditionId === expeditionId);
  const [selectedObsId, setSelectedObsId] = useState(expeditionObservations[0]?.observationId ?? '');
  const [reviewNote, setReviewNote] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSelectedObsId(expeditionObservations[0]?.observationId ?? '');
  }, [expeditionId]);

  if (expeditionId === 'PB124-OLEA-2026') {
    return <PB124AdminReview />;
  }

  const currentObs = expeditionObservations.find((o) => o.observationId === selectedObsId);

  const currentMatchup = currentObs
    ? expeditionMatchups.find((m) => m.observationId === currentObs.observationId)
    : undefined;

  if (!currentObs) {
    return (
      <div className="space-y-6 font-mono">
        <div className="border-b border-[#1b3543] pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#72e0b5]" />
            <span>Method Review Queue</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-1">No reviewable observation exists for this expedition yet. Nothing is auto-validated.</p>
        </div>
        <div className="p-8 rounded-3xl border border-[#1b3543] bg-[#081724] text-center text-xs text-[#8faab5]">
          Review remains empty until a real expedition observation is synchronized.
        </div>
      </div>
    );
  }

  const handleAction = (decision: string) => {
    setActionFeedback(`Decisión registrada: ${decision}. Firma editorial anexada al registro.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header and Anti-Automation Principle */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#72e0b5]" />
            <span>Cola de Revisión Científica & Arbitraje</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Evaluación humana rigurosa de evidencia cruzada. Prohibida la auto-validación masiva.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081824] border border-[#1d3d52] text-[11px] text-[#72e0b5]">
          <ShieldCheck className="w-4 h-4" />
          <span>SCAR Data Management Compliant</span>
        </div>
      </div>

      {/* Main Review Workspace: Queue List (4 Cols) & Evidence Comparison Board (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue Items */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] uppercase font-bold text-[#8faab5] block">
            Registros Pendientes de Dictamen ({expeditionObservations.length})
          </span>

          {expeditionObservations.map((obs) => {
            const isSelected = obs.observationId === currentObs.observationId;
            return (
              <div
                key={obs.observationId}
                onClick={() => setSelectedObsId(obs.observationId)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-[#0b2436] border-[#00e5ff] shadow-lg'
                    : 'bg-[#081724] border-[#183140] hover:border-[#204256]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00e5ff]/15 text-[#00e5ff]">
                    {obs.realityLabel}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      obs.reviewStatus === 'VALIDATED'
                        ? 'text-[#72e0b5]'
                        : obs.reviewStatus === 'UNDER_REVIEW'
                        ? 'text-[#00e5ff]'
                        : 'text-[#f59e0b]'
                    }`}
                  >
                    {obs.reviewStatus}
                  </span>
                </div>

                <div className="text-xs font-bold text-white truncate font-sans">
                  {obs.title}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8faab5]">
                  <span>{obs.observedAtUtc.slice(11, 16)} UTC</span>
                  <span>±{obs.accuracyMeters}m</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Comparative Multi-Stream Evidence Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-6 shadow-xl">
            {/* Header of Item under Review */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142836] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#72e0b5]">
                  Expediente de Revisión #{currentObs.observationId}
                </span>
                <h3 className="text-base font-bold text-white font-sans mt-0.5">
                  {currentObs.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                  {currentObs.realityLabel}
                </span>
              </div>
            </div>

            {/* Tri-Partite Evidence Streams (Field vs AIS vs Satellite) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Evidence 1: Field Observation */}
              <div className="p-4 rounded-2xl bg-[#050f16] border border-[#152c3c] space-y-2">
                <div className="flex items-center justify-between text-[#00e5ff] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>01. Campo Óptico</span>
                  </span>
                  <span className="text-[10px] bg-[#00e5ff]/20 px-1.5 py-0.5 rounded">OBS</span>
                </div>
                <div className="space-y-1 text-[#8faab5] text-[11px]">
                  <p><strong className="text-white">Hora:</strong> {currentObs.observedAtUtc.slice(11, 19)} UTC</p>
                  <p><strong className="text-white">Posición:</strong> {currentObs.lat}, {currentObs.lon}</p>
                  <p><strong className="text-white">Incertidumbre:</strong> ±{currentObs.accuracyMeters} m</p>
                  <p><strong className="text-white">Observador:</strong> {currentObs.observerName}</p>
                </div>
              </div>

              {/* Evidence 2: AIS Stream */}
              <div className="p-4 rounded-2xl bg-[#050f16] border border-[#152c3c] space-y-2">
                <div className="flex items-center justify-between text-[#38bdf8] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5" />
                    <span>02. Correlato AIS</span>
                  </span>
                  <span className="text-[10px] bg-[#38bdf8]/20 px-1.5 py-0.5 rounded">VHF</span>
                </div>
                {currentMatchup?.aisVesselName ? (
                  <div className="space-y-1 text-[#8faab5] text-[11px]">
                    <p><strong className="text-white">Buque:</strong> {currentMatchup.aisVesselName}</p>
                    <p><strong className="text-white">MMSI:</strong> {currentMatchup.aisMmsi}</p>
                    <p><strong className="text-white">&Delta; Distancia:</strong> {currentMatchup.distanceMeters} m</p>
                    <p><strong className="text-white">&Delta; Tiempo:</strong> {Math.round(currentMatchup.timeDeltaSeconds / 60)} min</p>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#f59e0b] italic pt-2">
                    Sin señal AIS recibida en la ventana temporal. Posible sombra orográfica o transponder apagado.
                  </div>
                )}
              </div>

              {/* Evidence 3: Satellite Scene */}
              <div className="p-4 rounded-2xl bg-[#050f16] border border-[#152c3c] space-y-2">
                <div className="flex items-center justify-between text-[#f59e0b] font-bold">
                  <span className="flex items-center gap-1.5">
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>03. Escena Satélite</span>
                  </span>
                  <span className="text-[10px] bg-[#f59e0b]/20 px-1.5 py-0.5 rounded">SAR</span>
                </div>
                {currentMatchup?.satelliteSensor ? (
                  <div className="space-y-1 text-[#8faab5] text-[11px]">
                    <p><strong className="text-white">Sensor:</strong> {currentMatchup.satelliteSensor.split(' ')[0]} SAR</p>
                    <p><strong className="text-white">Latencia:</strong> {currentMatchup.satelliteProcessingLatencyHours} h</p>
                    <p><strong className="text-white">Calidad:</strong> {Math.round((currentMatchup.qualityScore || 0) * 100)}%</p>
                    <p><strong className="text-white">Modo:</strong> C-Band Interferometric</p>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#8faab5] italic pt-2">
                    Sin pasada orbital en la ventana temporal (DATA_GAP).
                  </div>
                )}
              </div>
            </div>

            {/* Scientific Restraint Rule Citation */}
            {currentMatchup?.restraintRuleCitation && (
              <div className="p-3.5 rounded-2xl bg-[#0a1e2c] border border-[#1d3d52] text-xs text-[#72e0b5] space-y-1">
                <strong>Regla de Restricción Científica:</strong>
                <p className="text-[11px] font-sans text-[#b8d2de]">
                  {currentMatchup.restraintRuleCitation}
                </p>
              </div>
            )}

            {/* Reviewer Justification Input */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase font-bold text-[#8faab5]">
                Dictamen Editorial / Justificación del Par Científico
              </label>
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Indica la justificación científica para validar, solicitar mayor precisión o asentar discrepancia de datos..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050f16] border border-[#152c3c] text-white text-xs focus:border-[#00e5ff] focus:outline-none font-sans"
              />
            </div>

            {actionFeedback && (
              <div className="p-3 rounded-xl bg-[#72e0b5]/15 border border-[#72e0b5]/40 text-[#72e0b5] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}

            {/* Decision Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#142836]">
              <div className="text-[10px] text-[#8faab5]">
                Revisor: <strong className="text-white">Juan Sebastian Huertas Olea (Lead)</strong>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction('RECHAZADO')}
                  className="px-3.5 py-2 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/25 text-xs font-bold transition-all"
                >
                  Rechazar
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('INFORMACIÓN REQUERIDA')}
                  className="px-3.5 py-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#38bdf8] hover:text-white text-xs font-bold transition-all"
                >
                  Solicitar Info
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('CONFLICTO ASENTADO')}
                  className="px-3.5 py-2 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/25 text-xs font-bold transition-all"
                >
                  Registrar Conflicto
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('VALIDADO')}
                  className="px-4 py-2 rounded-xl bg-[#72e0b5] text-[#050e14] font-bold text-xs hover:bg-[#5cd4a5] transition-all shadow-md shadow-[#72e0b5]/20"
                >
                  Validar Registro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
