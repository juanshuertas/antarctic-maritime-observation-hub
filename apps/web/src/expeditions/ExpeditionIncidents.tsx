import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Compass,
  ArrowLeft,
  Plus,
  FileCheck,
} from 'lucide-react';
import {
  SEED_PAC_INCIDENTS,
  type IncidentRecord,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionIncidents(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(SEED_PAC_INCIDENTS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCategory, setNewCategory] = useState<IncidentRecord['category']>('COMMUNICATION_LOSS');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('Península Antártica');
  const [newSeverity, setNewSeverity] = useState<IncidentRecord['severity']>('LOW');
  const [newStatus, setNewStatus] = useState<IncidentRecord['status']>('CONFIRMED');
  const [newImmediateAction, setNewImmediateAction] = useState('');

  const getSeverityBadge = (sev: IncidentRecord['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40">CRÍTICO</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40">ALTO</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">MEDIO</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">LEVE</span>;
    }
  };

  const getStatusBadge = (status: IncidentRecord['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>CONFIRMADO</span>
          </span>
        );
      case 'UNCONFIRMED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>NO CONFIRMADO (RUMOR / PENDIENTE)</span>
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 flex items-center gap-1">
            <FileCheck className="w-3 h-3" />
            <span>RESUELTO</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>EN REVISIÓN</span>
          </span>
        );
    }
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const created: IncidentRecord = {
      incidentId: `inc-${Date.now()}`,
      expeditionId,
      reportedAtUtc: new Date().toISOString(),
      category: newCategory,
      location: newLocation,
      description: newDesc,
      severity: newSeverity,
      status: newStatus,
      reportedBy: 'Juan Sebastian Huertas Olea',
      personsInvolved: ['Juan Sebastian Huertas Olea'],
      immediateActionTaken: newImmediateAction || 'Registro asentado en bitácora.',
      followUpRequired: 'Verificación en siguiente cambio de guardia.',
      versionHistory: [{ version: 1, timestamp: new Date().toISOString(), note: 'Asentado por Líder AMOH.' }],
    };

    setIncidents([created, ...incidents]);
    setShowNewModal(false);
    setNewDesc('');
    setNewImmediateAction('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>GESTIÓN DE INCIDENTES & CONTINGENCIAS</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Bitácora de Novedades, Incidentes y Regla 49 de Telemetría
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Diferenciación estricta entre incidentes confirmados y no confirmados. Trazabilidad inmutable y principio polar: la pérdida de localización no es rescate hasta ser verificada.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Novedad</span>
          </button>

          <Link
            to={`/expeditions/${expeditionId}/readiness`}
            className="px-3.5 py-2 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-xs text-[#d8e7ee] flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Volver a Matriz</span>
          </Link>
        </div>
      </div>

      {/* REGLA 49: LOCATION LOSS != MISSING PERSON BANNER */}
      <div className="p-4 rounded-xl bg-[#081f2f] border-2 border-[#00e5ff]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-black text-[#00e5ff] tracking-wider uppercase flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#00e5ff]" />
            <span>REGLA 49 AMOH: LOCATION LOSS != MISSING PERSON (PÉRDIDA DE TELEMETRÍA NO ES EXTRAVÍO)</span>
          </div>
          <p className="text-xs text-[#b8d4e3] font-sans leading-relaxed">
            La pérdida momentánea de señal GPS o enlace celular/satelital en fiordos y canales polares es un comportamiento electromagnético previsto por sombras orográficas. El sistema clasifica estos eventos como <code>COMMUNICATION_LOSS</code> y nunca activa alertas de emergencia SAR a menos que se incumpla el intervalo de reporte obligatorio en radio marina VHF.
          </p>
        </div>
      </div>

      {/* Incident List */}
      <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#f97316]" />
            <span>Historial de Novedades Registradas ({incidents.length})</span>
          </h3>
          <span className="text-xs text-[#8faab5]">
            Auditoría inmutable para reporte de cierre
          </span>
        </div>

        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.incidentId}
              className="p-5 rounded-2xl bg-[#081824] border border-[#173042] hover:border-[#22445c] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(inc.severity)}
                    {getStatusBadge(inc.status)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                      {inc.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-sans pt-1">
                    {inc.category === 'COMMUNICATION_LOSS' ? 'Pérdida de Enlace de Telemetría' : inc.category}
                  </h4>
                </div>

                <div className="text-[11px] text-[#6b8c9c] font-mono self-start">
                  {new Date(inc.reportedAtUtc).toLocaleString()} UTC
                </div>
              </div>

              <p className="text-xs text-[#8faab5] leading-relaxed">
                {inc.description}
              </p>

              {inc.immediateActionTaken && (
                <div className="p-3 rounded-xl bg-[#050f16] border border-[#122432] text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#10b981] uppercase">
                    Acción Inmediata / Resolución:
                  </span>
                  <p className="text-[#8faab5]">{inc.immediateActionTaken}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#5c7f91] pt-1 border-t border-[#122837]">
                <span>Reportado por: <strong className="text-white">{inc.reportedBy}</strong></span>
                <span>Ubicación: <strong className="text-white">{inc.location}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Incident Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#091b29] border border-[#1b3543] rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white font-sans">
              Registrar Nueva Novedad Operacional
            </h3>

            <form onSubmit={handleAddIncident} className="space-y-3">
              <div>
                <label className="block text-[#8faab5] mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as IncidentRecord['category'])}
                  className="w-full p-2.5 rounded-xl bg-[#050f16] border border-[#1d3c50] text-white"
                >
                  <option value="COMMUNICATION_LOSS">COMMUNICATION_LOSS (Pérdida de Telemetría)</option>
                  <option value="WEATHER_HAZARD">WEATHER_HAZARD (Alerta Meteorológica)</option>
                  <option value="EQUIPMENT_DAMAGE">EQUIPMENT_DAMAGE (Falla de Equipo)</option>
                  <option value="NEAR_MISS">NEAR_MISS (Cuasi-accidente)</option>
                  <option value="ENVIRONMENTAL_SPILL">ENVIRONMENTAL_SPILL (Incidente Ambiental)</option>
                  <option value="MINOR_INJURY">MINOR_INJURY (Lesión Menor)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8faab5] mb-1">Ubicación</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#050f16] border border-[#1d3c50] text-white"
                />
              </div>

              <div>
                <label className="block text-[#8faab5] mb-1">Descripción de los Hechos</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detallar condiciones observadas, personal involucrado y estado actual..."
                  className="w-full p-2.5 rounded-xl bg-[#050f16] border border-[#1d3c50] text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8faab5] mb-1">Acción Inmediata Adoptada</label>
                <input
                  type="text"
                  value={newImmediateAction}
                  onChange={(e) => setNewImmediateAction(e.target.value)}
                  placeholder="e.g. Resguardo de personal en puente, verificación de canal VHF..."
                  className="w-full p-2.5 rounded-xl bg-[#050f16] border border-[#1d3c50] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8faab5] mb-1">Severidad</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as IncidentRecord['severity'])}
                    className="w-full p-2.5 rounded-xl bg-[#050f16] border border-[#1d3c50] text-white"
                  >
                    <option value="LOW">LEVE (LOW)</option>
                    <option value="MEDIUM">MEDIO (MEDIUM)</option>
                    <option value="HIGH">ALTO (HIGH)</option>
                    <option value="CRITICAL">CRÍTICO (CRITICAL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8faab5] mb-1">Estado de Confirmación</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IncidentRecord['status'])}
                    className="w-full p-2.5 rounded-xl bg-[#050f16] border border-[#1d3c50] text-white"
                  >
                    <option value="CONFIRMED">CONFIRMADO</option>
                    <option value="UNCONFIRMED">NO CONFIRMADO (RUMOR)</option>
                    <option value="RESOLVED">RESUELTO</option>
                    <option value="UNDER_REVIEW">EN REVISIÓN</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e2738] text-[#8faab5] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#f97316] text-white font-bold hover:bg-[#ea580c]"
                >
                  Asentar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
