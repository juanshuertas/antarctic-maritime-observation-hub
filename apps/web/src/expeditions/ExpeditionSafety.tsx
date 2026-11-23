import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Radio,
  Wind,
  Eye,
  ThermometerSnowflake,
  Waves,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react';
import {
  SEED_PAC_SAFETY_CHECKINS,
  type SafetyState,
  type SafetyCheckIn,
  getExpedition,
} from './expeditions-data';

interface ExtendedSafetyCheckIn extends SafetyCheckIn {
  notes?: string;
  windKnots?: number;
  visibilityKm?: number;
  batteryPhonePct?: number;
  locationName?: string;
}

export default function ExpeditionSafety(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [currentStatus, setCurrentStatus] = useState<SafetyState['currentStatus']>('READY');
  const [checkins, setCheckins] = useState<ExtendedSafetyCheckIn[]>(
    SEED_PAC_SAFETY_CHECKINS.map((c) => ({
      ...c,
      locationName: 'Península Antártica Occidental',
      notes: 'Check-in operacional normal.',
      windKnots: 18,
      visibilityKm: 15,
      batteryPhonePct: 92,
    }))
  );

  const handleEmergencyAbort = () => {
    setCurrentStatus('STOP');
    const newCheckIn: ExtendedSafetyCheckIn = {
      checkInId: `abort-${Date.now()}`,
      sessionId: 'sess-active',
      userId: 'juan.huertas',
      userName: 'Juan Sebastian Huertas Olea',
      timestampUtc: new Date().toISOString(),
      lat: -65.07,
      lon: -63.95,
      locationName: 'Península Antártica (Cubierta de Vuelo)',
      status: 'ASSISTANCE_NEEDED',
      notes: 'INTERRUPCIÓN DE SEGURIDAD ACTIVADA POR EL INVESTIGADOR: Condiciones de cubierta o visibilidad degradadas.',
      windKnots: 36,
      visibilityKm: 1.5,
      batteryPhonePct: 78,
    };
    setCheckins([newCheckIn, ...checkins]);
  };

  const getStatusBadge = (status: SafetyState['currentStatus'] | SafetyCheckIn['status']) => {
    switch (status) {
      case 'READY':
      case 'OK':
      case 'ACTIVE':
        return (
          <span className="px-3 py-1 rounded-xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>OPERACIÓN AUTORIZADA ({status})</span>
          </span>
        );
      case 'HOLD':
        return (
          <span className="px-3 py-1 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>EN ESPERA METEOROLÓGICA (HOLD)</span>
          </span>
        );
      case 'STOP':
      case 'ASSISTANCE_NEEDED':
        return (
          <span className="px-3 py-1 rounded-xl bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <AlertOctagon className="w-4 h-4" />
            <span>SESIÓN DETENIDA ({status})</span>
          </span>
        );
      case 'RETURN':
      case 'REQUEST_RETURN':
        return (
          <span className="px-3 py-1 rounded-xl bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40 text-xs font-bold flex items-center gap-1.5">
            <LifeBuoy className="w-4 h-4" />
            <span>RETORNO A BORDO OBLIGATORIO</span>
          </span>
        );
      case 'EMERGENCY':
        return (
          <span className="px-3 py-1 rounded-xl bg-[#ef4444] text-white text-xs font-bold flex items-center gap-1.5 animate-bounce">
            <ShieldAlert className="w-4 h-4" />
            <span>EMERGENCIA SAR DECLARADA</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-xl bg-[#8faab5]/20 text-[#8faab5] text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict UX Rule */}
      <div className="p-5 rounded-2xl bg-[#091b29] border border-[#1b3543] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                <span>SEGURIDAD OPERACIONAL Y PROTOCOLO DE ABORTO</span>
              </span>
              <span className="text-[#8faab5] text-xs">
                Expedición: {expedition.title}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-sans">
              Seguridad Marítima y Principio de Primacía Operacional
            </h2>
            <p className="text-xs text-[#8faab5] max-w-2xl mt-1">
              Monitoreo continuo de condiciones en cubierta, comunicación con el puente de mando y botón de aborto inmediato para todas las sesiones.
            </p>
          </div>

          <Link
            to={`/expeditions/${expeditionId}/overview`}
            className="px-3.5 py-2 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-xs text-[#d8e7ee] flex items-center gap-2 self-start md:self-auto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Volver a Misión</span>
          </Link>
        </div>

        {/* HARD-CODED UX PRINCIPLE BANNER */}
        <div className="p-4 rounded-xl bg-[#ef4444]/15 border-2 border-[#ef4444]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-black text-[#ef4444] tracking-wider uppercase flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
              <span>REGLA UX RECTORA: SAFETY OVERRIDES SCIENTIFIC SCHEDULE</span>
            </div>
            <p className="text-xs text-[#fed7d7] font-sans leading-relaxed">
              La expedición no se adapta a la investigación; la investigación se adapta a la seguridad del buque y la tripulación. Ningún modelo de IA o cronograma de muestreo puede invalidar la orden del Oficial de Seguridad o las condiciones meteorológicas adversas.
            </p>
          </div>

          <button
            onClick={handleEmergencyAbort}
            className="px-5 py-3 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#ef4444]/40 shrink-0 active:scale-95 transition-all"
          >
            <AlertTriangle className="w-5 h-5 fill-current" />
            <span>ABORTAR SESIÓN DE CAMPO</span>
          </button>
        </div>
      </div>

      {/* Safety Status & Environmental Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Current State Card */}
        <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
          <div className="text-xs text-[#8faab5] uppercase tracking-wider">
            Estado Operacional de Terreno
          </div>
          <div className="flex items-center justify-between">
            {getStatusBadge(currentStatus)}
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="text-[#8faab5]">Cambiar Estado Operativo:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentStatus('READY')}
                className="p-2 rounded-lg bg-[#0e2738] hover:bg-[#10b981]/20 border border-[#1d3c50] text-[#10b981] font-bold text-xs transition-colors"
              >
                READY (Autorizado)
              </button>
              <button
                onClick={() => setCurrentStatus('HOLD')}
                className="p-2 rounded-lg bg-[#0e2738] hover:bg-[#f59e0b]/20 border border-[#1d3c50] text-[#f59e0b] font-bold text-xs transition-colors"
              >
                HOLD (En Espera)
              </button>
              <button
                onClick={() => setCurrentStatus('RETURN')}
                className="p-2 rounded-lg bg-[#0e2738] hover:bg-[#f97316]/20 border border-[#1d3c50] text-[#f97316] font-bold text-xs transition-colors"
              >
                RETURN (Regreso)
              </button>
              <button
                onClick={() => setCurrentStatus('STOP')}
                className="p-2 rounded-lg bg-[#0e2738] hover:bg-[#ef4444]/20 border border-[#1d3c50] text-[#ef4444] font-bold text-xs transition-colors"
              >
                STOP (Detener)
              </button>
            </div>
          </div>
        </div>

        {/* Operational Limits */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#8faab5] uppercase tracking-wider">
              Límites Meteorológicos Críticos para Muestreo en Cubierta / Bote
            </div>
            <span className="text-[10px] text-[#00e5ff] font-mono">NORMAS DE LA ARMADA / STA</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#050f16] border border-[#112330] space-y-1">
              <div className="flex items-center gap-1.5 text-[#8faab5]">
                <Wind className="w-4 h-4 text-[#00e5ff]" />
                <span>Viento Máx.</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">&lt; 35 kts</div>
              <div className="text-[10px] text-[#638495]">Límite zódiacs: 25 kts</div>
            </div>

            <div className="p-3 rounded-xl bg-[#050f16] border border-[#112330] space-y-1">
              <div className="flex items-center gap-1.5 text-[#8faab5]">
                <Eye className="w-4 h-4 text-[#f59e0b]" />
                <span>Visibilidad</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">&gt; 2.0 km</div>
              <div className="text-[10px] text-[#638495]">Niebla densa aborta</div>
            </div>

            <div className="p-3 rounded-xl bg-[#050f16] border border-[#112330] space-y-1">
              <div className="flex items-center gap-1.5 text-[#8faab5]">
                <Waves className="w-4 h-4 text-[#72e0b5]" />
                <span>Oleaje / Mar</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">&lt; 2.5 m</div>
              <div className="text-[10px] text-[#638495]">Escala Douglas 4</div>
            </div>

            <div className="p-3 rounded-xl bg-[#050f16] border border-[#112330] space-y-1">
              <div className="flex items-center gap-1.5 text-[#8faab5]">
                <ThermometerSnowflake className="w-4 h-4 text-[#a855f7]" />
                <span>Sensación Térmica</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">&gt; -15°C</div>
              <div className="text-[10px] text-[#638495]">Riesgo congelamiento</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0e2738] border border-[#1f3d50] flex items-center justify-between text-xs text-[#8faab5]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span>Briefing de Seguridad con Oficial de Navegación Aprobado</span>
            </span>
            <span className="text-[11px] font-mono text-[#00e5ff]">Válido por 12 horas</span>
          </div>
        </div>
      </div>

      {/* Safety Check-Ins Log */}
      <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00e5ff]" />
            <span>Registro de Reportes de Seguridad y Check-Ins ({checkins.length})</span>
          </h3>
          <span className="text-xs text-[#8faab5]">
            Reporte cada 30 min en operaciones fuera de borda
          </span>
        </div>

        <div className="space-y-3">
          {checkins.map((chk) => (
            <div
              key={chk.checkInId}
              className="p-4 rounded-xl bg-[#091b29] border border-[#193345] hover:border-[#22445c] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{chk.userName}</span>
                  <span className="text-[#486b7d]">·</span>
                  <span className="text-[#8faab5]">{chk.locationName || 'Zona Operacional'}</span>
                  <span className="text-[#486b7d]">·</span>
                  <span className="text-[11px] text-[#628495] font-mono">
                    {new Date(chk.timestampUtc).toLocaleTimeString()} UTC
                  </span>
                </div>
                <p className="text-[#98b3c0]">{chk.notes}</p>
                <div className="flex items-center gap-3 text-[11px] text-[#7195a6] pt-0.5">
                  {chk.windKnots !== undefined && <span>Viento: <strong className="text-white">{chk.windKnots} kts</strong></span>}
                  {chk.visibilityKm !== undefined && <span>Visibilidad: <strong className="text-white">{chk.visibilityKm} km</strong></span>}
                  {chk.batteryPhonePct !== undefined && <span>Batería: <strong className="text-[#10b981]">{chk.batteryPhonePct}%</strong></span>}
                </div>
              </div>

              <div className="shrink-0">
                {getStatusBadge(chk.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
