import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity,
  Clock,
  MapPin,
  Wind,
  Thermometer,
  Smartphone,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { SEED_EXPEDITION_SESSIONS, type ExpeditionSession } from './expeditions-data';
import SessionRunnerModal from './components/SessionRunnerModal';

export default function ExpeditionSessions(): ReactNode {
  const { expeditionId = 'exp-natgeo-2027' } = useParams();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const expeditionSessions = SEED_EXPEDITION_SESSIONS.filter((s) => s.expeditionId === expeditionId);
  const [selectedSession, setSelectedSession] = useState<ExpeditionSession | null>(
    expeditionSessions[0] ?? null
  );

  useEffect(() => {
    setSelectedSession(expeditionSessions[0] ?? null);
  }, [expeditionId]);

  const filteredSessions = expeditionSessions.filter((s) => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header and Quick New Session Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b3543] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00e5ff]" />
            <span>Sesiones Científicas de Campo</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Actividades acotadas en el tiempo y espacio para muestreo oportunista en aguas polares.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#071722] p-1 rounded-xl border border-[#1b3543] text-xs">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filter === mode
                    ? 'bg-[#00e5ff] text-[#050e14]'
                    : 'text-[#8faab5] hover:text-white'
                }`}
              >
                {mode === 'ALL' ? 'Todas' : mode === 'ACTIVE' ? 'Activas' : 'Completadas'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Sesión</span>
          </button>
        </div>
      </div>

      {/* Grid: Sessions List (7 Cols) & Detail View (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          {filteredSessions.length === 0 && (
            <div className="p-8 rounded-3xl border border-[#1b3543] bg-[#081724] text-center text-xs text-[#8faab5]">
              No real field sessions are registered for this expedition yet.
            </div>
          )}
          {filteredSessions.map((session) => (
            <div
              key={session.sessionId}
              onClick={() => setSelectedSession(session)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                selectedSession?.sessionId === session.sessionId
                  ? 'bg-[#0a1e2d] border-[#00e5ff] shadow-lg shadow-[#00e5ff]/10'
                  : 'bg-[#081724] border-[#183140] hover:border-[#214357]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                    {session.type}
                  </span>
                  <span className="text-xs text-[#8faab5]">
                    Líder: <strong className="text-white">{session.leader}</strong>
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    session.status === 'ACTIVE'
                      ? 'bg-[#72e0b5]/20 text-[#72e0b5] border border-[#72e0b5]/40 animate-pulse'
                      : 'bg-[#183547] text-[#8faab5]'
                  }`}
                >
                  {session.status === 'ACTIVE' ? 'EN CURSO' : 'COMPLETADA'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white font-sans">
                {session.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#8faab5]">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#38bdf8] flex-shrink-0" />
                  <span className="truncate">{session.locationStart.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#72e0b5] flex-shrink-0" />
                  <span>{session.startedAtUtc.slice(0, 16).replace('T', ' ')} UTC</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#142836] text-[11px] text-[#6e8996]">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{session.deviceIds.length} Dispositivos</span>
                </div>
                <div className="flex items-center gap-1 text-[#00e5ff] font-bold">
                  <span>{session.observationsCount} observaciones registradas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Session Detail Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedSession ? (
            <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4 shadow-xl sticky top-24">
              <div className="flex items-center justify-between border-b border-[#142836] pb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                  {selectedSession.type}
                </span>
                <span className="text-xs text-[#72e0b5] font-bold">
                  {selectedSession.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  {selectedSession.title}
                </h3>
                <p className="text-xs text-[#8faab5] mt-1 font-sans">
                  {selectedSession.method}
                </p>
              </div>

              {/* Weather & Context Card */}
              <div className="p-4 rounded-2xl bg-[#050f16] border border-[#142836] space-y-2.5 text-xs">
                <div className="text-[10px] uppercase font-bold text-[#8faab5] flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>Condiciones Meteorológicas del Lance</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-white">
                    <Thermometer className="w-3.5 h-3.5 text-[#72e0b5]" />
                    <span>{selectedSession.weatherContext.tempC}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white">
                    <Wind className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>{selectedSession.weatherContext.windKnots} nudos</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#8faab5] border-t border-[#132734] pt-2">
                  <span>Mar: <strong className="text-white">{selectedSession.weatherContext.seaState}</strong></span>
                  <span className="block mt-0.5">Visibilidad: {selectedSession.weatherContext.visibilityKm} km</span>
                </div>
              </div>

              {/* Notes */}
              <div className="text-xs text-[#b0c4cf] font-sans leading-relaxed border-l-2 border-[#1e3c50] pl-3 py-1">
                {selectedSession.notes}
              </div>

              <div className="pt-2 border-t border-[#142836] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#8faab5] block">
                  Dispositivos de Adquisición
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSession.deviceIds.map((devId) => (
                    <span
                      key={devId}
                      className="px-2.5 py-1 rounded-xl bg-[#050e14] border border-[#132835] text-[10px] text-[#38bdf8]"
                    >
                      {devId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-[#1b3543] bg-[#081724] text-center text-xs text-[#8faab5]">
              Selecciona una sesión para ver detalles.
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <SessionRunnerModal
          expeditionId={expeditionId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
