import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  Plane,
  Building,
  Anchor,
  Calendar,
  Clock,
  Weight,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import {
  SEED_PAC_LOGISTICS,
  type LogisticsItineraryItem,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionLogistics(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [itinerary] = useState<LogisticsItineraryItem[]>(SEED_PAC_LOGISTICS);

  const getSegmentIcon = (type: LogisticsItineraryItem['segmentType']) => {
    switch (type) {
      case 'FLIGHT':
        return <Plane className="w-4 h-4 text-[#00e5ff]" />;
      case 'LODGING':
        return <Building className="w-4 h-4 text-[#f59e0b]" />;
      case 'EMBARKATION':
        return <Anchor className="w-4 h-4 text-[#72e0b5]" />;
      default:
        return <Truck className="w-4 h-4 text-[#8faab5]" />;
    }
  };

  const getStatusBadge = (status: LogisticsItineraryItem['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmado</span>
          </span>
        );
      case 'PLANNED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Planificado</span>
          </span>
        );
      case 'CHANGED':
      case 'DELAYED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30 text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{status === 'DELAYED' ? 'Demorado' : 'Modificado'}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 text-xs font-bold">
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span>LOGÍSTICA AUSTRAL & DESPLIEGUE PAC</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Itinerario de Conexiones, Alojamiento y Embarque
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Trazabilidad del desplazamiento logístico desde Bogotá hasta Punta Arenas, cuarentena de bioseguridad y ventana de zarpe para cruce del Paso Drake.
          </p>
        </div>

        <Link
          to={`/expeditions/${expeditionId}/readiness`}
          className="px-3.5 py-2 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-xs text-[#d8e7ee] flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>Volver a Matriz</span>
        </Link>
      </div>

      {/* Itinerary Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#f59e0b]" />
            <span>Tramos del Despliegue Logístico ({itinerary.length})</span>
          </h3>
          <span className="text-xs text-[#8faab5]">
            Historial de versiones y auditoría de cambios activo
          </span>
        </div>

        <div className="space-y-3">
          {itinerary.map((item, idx) => (
            <div
              key={item.itemId}
              className="p-5 rounded-2xl bg-[#081824] border border-[#173042] hover:border-[#22445c] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0e2434] border border-[#213f52] flex items-center justify-center shrink-0">
                    {getSegmentIcon(item.segmentType)}
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8faab5] font-mono">
                      TRAMO {String(idx + 1).padStart(2, '0')} · {item.segmentType}
                    </div>
                    <h4 className="text-sm font-bold text-white font-sans">{item.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Transit Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-[#050f16] border border-[#102432] text-xs">
                <div>
                  <div className="text-[10px] text-[#698897] uppercase">Origen / Salida</div>
                  <div className="font-medium text-white flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#00e5ff]" />
                    <span>{item.origin}</span>
                  </div>
                  <div className="text-[11px] text-[#8faab5] mt-0.5">
                    {new Date(item.scheduledDepartureUtc).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#698897] uppercase">Destino / Arribo</div>
                  <div className="font-medium text-white flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#72e0b5]" />
                    <span>{item.destination}</span>
                  </div>
                  <div className="text-[11px] text-[#8faab5] mt-0.5">
                    {new Date(item.scheduledArrivalUtc).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#698897] uppercase">Operador & Carga</div>
                  <div className="font-medium text-white mt-0.5">{item.carrierOrLocation}</div>
                  <div className="text-[11px] text-[#f59e0b] mt-0.5 flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    <span>Aforo: {item.baggageWeightKg} kg de equipo</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#8faab5] leading-relaxed">
                {item.notes}
              </div>

              {/* Version History Pill */}
              {item.versionHistory && item.versionHistory.length > 0 && (
                <div className="pt-2 border-t border-[#122837] flex flex-wrap items-center gap-3 text-[11px] text-[#628495]">
                  <span className="flex items-center gap-1 text-[#8faab5] font-bold">
                    <History className="w-3 h-3" />
                    <span>Versión {item.versionHistory[item.versionHistory.length - 1].version}:</span>
                  </span>
                  <span>
                    {item.versionHistory[item.versionHistory.length - 1].reason} (Por: {item.versionHistory[item.versionHistory.length - 1].changedBy})
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
