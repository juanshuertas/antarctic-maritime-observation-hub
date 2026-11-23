import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  GitCompare,
  ShieldAlert,
} from 'lucide-react';
import {
  SEED_SCIENTIFIC_MATCHUPS,
  type ScientificMatchup,
} from './expeditions-data';

export default function ExpeditionMatchups(): ReactNode {
  const { expeditionId = 'exp-natgeo-2027' } = useParams();
  const expeditionMatchups = SEED_SCIENTIFIC_MATCHUPS.filter((m) => m.expeditionId === expeditionId);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<ScientificMatchup | null>(expeditionMatchups[0] ?? null);

  useEffect(() => {
    setSelectedMatch(expeditionMatchups[0] ?? null);
  }, [expeditionId]);

  const filtered = expeditionMatchups.filter((m) => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner & Scientific Restraint Maxims */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#00e5ff]" />
            <span>Motor de Matchup Espaciotemporal (AIS + SAR + Campo)</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            ScientificMatchupService · Alineación probabilística multiespectral en aguas polares.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'MATCH', label: 'Coincidencias (MATCH)' },
            { id: 'CONFLICT', label: 'Discrepancias (CONFLICT)' },
            { id: 'DATA_GAP', label: 'Vacíos (DATA_GAP)' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                filter === pill.id
                  ? 'bg-[#00e5ff] text-[#050e14] shadow-md'
                  : 'bg-[#081724] border-[#183140] text-[#8faab5] hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Restraint Alert Banner */}
      <div className="p-4 rounded-2xl bg-[#091b28] border border-[#1d3d52] text-xs text-[#72e0b5] flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#00e5ff] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block font-sans">
            Postulados de Integridad del Matchup Engine:
          </strong>
          <p className="text-[#a8c7d6] font-sans leading-relaxed text-[11px]">
            1. <strong>Ausencia de AIS &ne; Ausencia de buque:</strong> La falta de paquetes VHF no autoriza a concluir que un área esté despejada.
            <br />
            2. <strong>Satélite &ne; Tiempo real:</strong> Toda huella satelital documenta explícitamente hora de órbita y horas de latencia de procesado.
            <br />
            3. <strong>El conflicto es ciencia:</strong> La contradicción entre fuentes se cataloga con valor científico y jamás se purga del dataset.
          </p>
        </div>
      </div>

      {/* Grid: Matchup Cards (6 Cols) & Deep Inspector (6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          {filtered.length === 0 && (
            <div className="p-8 rounded-3xl border border-[#1b3543] bg-[#081724] text-center text-xs text-[#8faab5]">
              No post-hoc matchup records exist for this expedition yet.
            </div>
          )}
          {filtered.map((match) => {
            const isSelected = selectedMatch?.matchupId === match.matchupId;
            return (
              <div
                key={match.matchupId}
                onClick={() => setSelectedMatch(match)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-[#0a2030] border-[#00e5ff] shadow-lg'
                    : 'bg-[#081724] border-[#183140] hover:border-[#224458]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      match.status === 'MATCH'
                        ? 'bg-[#72e0b5]/15 text-[#72e0b5] border-[#72e0b5]/40'
                        : match.status === 'CONFLICT'
                        ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40'
                        : match.status === 'DATA_GAP'
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40'
                        : 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/40'
                    }`}
                  >
                    {match.status}
                  </span>

                  <span className="text-[11px] text-[#8faab5]">
                    Puntaje: <strong className="text-white">{Math.round((match.qualityScore || 0) * 100)}%</strong>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white font-sans">
                  {match.observationTitle}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#8faab5]">
                  <div>
                    <span className="text-[10px] uppercase block text-[#6b8896]">AIS Vinculado</span>
                    <span className="text-white font-bold truncate block">
                      {match.aisVesselName || 'No detectado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block text-[#6b8896]">Sensor Espacial</span>
                    <span className="text-[#00e5ff] font-bold truncate block">
                      {match.satelliteSensor?.split(' ')[0] || 'Sin órbita'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#142836] text-[11px] text-[#6e8996]">
                  <span>&Delta;t: {Math.round(match.timeDeltaSeconds / 60)} min</span>
                  <span>&Delta;d: {match.distanceMeters} m</span>
                  <span className="text-[#72e0b5] font-bold">{match.uncertaintyRating} Uncertainty</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Match Inspector */}
        <div className="lg:col-span-6 space-y-4">
          {selectedMatch ? (
            <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-5 shadow-xl sticky top-24">
              <div className="flex items-center justify-between border-b border-[#142836] pb-3">
                <span className="text-xs font-bold text-[#00e5ff]">
                  Matchup ID: {selectedMatch.matchupId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    selectedMatch.status === 'MATCH'
                      ? 'bg-[#72e0b5]/15 text-[#72e0b5] border-[#72e0b5]/40'
                      : 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40'
                  }`}
                >
                  {selectedMatch.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  {selectedMatch.observationTitle}
                </h3>
                <p className="text-xs text-[#8faab5] mt-1 font-sans">
                  {selectedMatch.notes}
                </p>
              </div>

              {/* Satellite Metadata Section */}
              <div className="p-4 rounded-2xl bg-[#050f16] border border-[#142836] space-y-2 text-xs">
                <div className="text-[10px] uppercase font-bold text-[#f59e0b] flex items-center justify-between">
                  <span>Detalle de Escena Satelital</span>
                  <span>Sentinel C-Band SAR</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#8faab5]">
                  <p><strong className="text-white">Escena:</strong> <code className="text-[#38bdf8] text-[10px] break-all">{selectedMatch.satelliteSceneId || 'N/A'}</code></p>
                  <p><strong className="text-white">Adquisición UTC:</strong> {selectedMatch.satelliteAcquisitionUtc || 'N/A'}</p>
                  <p><strong className="text-white">Latencia de Procesamiento:</strong> {selectedMatch.satelliteProcessingLatencyHours ? `${selectedMatch.satelliteProcessingLatencyHours} horas` : 'N/A'}</p>
                  <p><strong className="text-white">Sensor:</strong> {selectedMatch.satelliteSensor || 'N/A'}</p>
                </div>
              </div>

              {/* Restraint Rule Banner */}
              <div className="p-3.5 rounded-2xl bg-[#0a1e2c] border border-[#1d3d52] text-xs text-[#72e0b5] space-y-1">
                <strong>Fundamento Metodológico:</strong>
                <p className="text-[11px] font-sans text-[#b8d2de]">
                  {selectedMatch.restraintRuleCitation}
                </p>
              </div>

              {/* Reviewer signature */}
              <div className="pt-2 border-t border-[#142836] flex items-center justify-between text-xs text-[#8faab5]">
                <span>Revisor Asignado:</span>
                <span className="text-white font-bold">{selectedMatch.reviewer || 'Comité Editorial AMOH'}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-[#1b3543] bg-[#081724] text-center text-xs text-[#8faab5]">
              Selecciona un matchup para inspección.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
