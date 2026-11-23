import { useState, type ReactNode } from 'react';
import {
  RefreshCw,
  Radio,
  Cloud,
  CheckCircle2,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_SYNC_STATE, type SyncState } from './expeditions-data';

export default function ExpeditionSync(): ReactNode {
  const [syncState, setSyncState] = useState<SyncState>(INITIAL_SYNC_STATE);
  const [syncing, setSyncing] = useState(false);
  const [onlyEssential, setOnlyEssential] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const STAGES = [
    { id: 'LOCAL', label: 'Local (Device)', desc: 'Sensor/App IndexedDB' },
    { id: 'QUEUED', label: 'En Cola Sync', desc: 'Esperando Wi-Fi buque' },
    { id: 'EDGE_RECEIVED', label: 'Recibido en Edge', desc: 'DuckDB local a bordo' },
    { id: 'MATCH_PENDING', label: 'Matchup Pending', desc: 'Correlación AIS/SAR' },
    { id: 'VALIDATED', label: 'Validado por Par', desc: 'Revisión SCAR completa' },
    { id: 'SYNCED_TO_CLOUD', label: 'Nube Sincronizada', desc: 'Google Cloud BigQuery' },
  ];

  const handleTriggerSync = (type: string) => {
    setSyncing(true);
    setFeedback(`Iniciando sincronización: ${type}...`);
    setTimeout(() => {
      setSyncing(false);
      setSyncState((prev) => ({
        ...prev,
        queuedCount: 0,
        syncedCount: prev.syncedCount + prev.queuedCount,
        lastSyncUtc: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      }));
      setFeedback('¡Sincronización completada con éxito contra el repositorio central!');
      setTimeout(() => setFeedback(null), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 text-[#00e5ff] ${syncing ? 'animate-spin' : ''}`} />
            <span>Sincronización Edge & Nodo a Bordo</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Gestión de colas de datos sin conexión en aguas polares y retransmisión oportuna a la nube.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#081824] border border-[#1d3d52] text-xs text-[#72e0b5]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{syncState.shipEdgeIp} (LAN Activa)</span>
          </span>
        </div>
      </div>

      {/* 1. VISUAL OFFLINE STATE MACHINE PIPELINE */}
      <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8faab5]">
          Máquina de Estados de Datos de Campo
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {STAGES.map((st, idx) => (
            <div
              key={st.id}
              className={`p-3.5 rounded-2xl border text-center space-y-1.5 transition-all ${
                idx <= 3
                  ? 'bg-[#0a2132] border-[#00e5ff] text-white'
                  : 'bg-[#050f16] border-[#152a38] text-[#6b8594]'
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-[#00e5ff]">
                0{idx + 1}
              </div>
              <div className="text-xs font-bold truncate">{st.label}</div>
              <div className="text-[10px] text-[#8faab5] truncate font-sans">
                {st.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SYNC METRICS & BANDWIDTH CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Metrics & Queue Status (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
            <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#38bdf8]" />
              <span>Estado de la Cola Local DuckDB</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-[#050f16] border border-[#142836]">
                <span className="text-[10px] text-[#8faab5] block">Registros Locales</span>
                <span className="text-lg font-bold text-white">{syncState.localRecordsCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#050f16] border border-[#142836]">
                <span className="text-[10px] text-[#8faab5] block">En Cola de Envío</span>
                <span className="text-lg font-bold text-[#f59e0b]">{syncState.queuedCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#050f16] border border-[#142836]">
                <span className="text-[10px] text-[#8faab5] block">En Nube AMOH</span>
                <span className="text-lg font-bold text-[#72e0b5]">{syncState.syncedCount}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#050e14] border border-[#132734] text-xs text-[#8faab5] flex items-center justify-between">
              <span>Última sincronización satelital:</span>
              <strong className="text-white">{syncState.lastSyncUtc}</strong>
            </div>

            {feedback && (
              <div className="p-3 rounded-xl bg-[#72e0b5]/15 border border-[#72e0b5]/40 text-[#72e0b5] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{feedback}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Satellite Bandwidth Saver (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
            <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#00e5ff]" />
              <span>Optimización de Enlace Satelital</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-[#050f16] border border-[#142836] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">Solo Datos Esenciales (JSON/Parquet)</span>
                <input
                  type="checkbox"
                  checked={onlyEssential}
                  onChange={(e) => setOnlyEssential(e.target.checked)}
                  className="rounded accent-[#00e5ff] w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-[#8faab5] font-sans">
                Ahorra hasta el 98% del ancho de banda satelital (Iridium/Starlink). Posterga la descarga de fotos raw y escenas radar pesadas hasta llegar a puerto en Ushuaia.
              </p>
            </div>

            {/* Sync Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleTriggerSync('DATOS_ESENCIALES')}
                disabled={syncing}
                className="w-full py-2.5 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sincronizar Datos Esenciales Ahora</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerSync('SOLO_VALIDADOS')}
                disabled={syncing}
                className="w-full py-2.5 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#72e0b5] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sincronizar Solo Registros Validados</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
