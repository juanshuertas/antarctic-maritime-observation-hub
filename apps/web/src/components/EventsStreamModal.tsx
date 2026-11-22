import { useState, useEffect } from 'react';
import {
  Radio,
  Activity,
  Snowflake,
  Shield,
  FlaskConical,
  X,
  FileCheck,
  Navigation,
  ShieldAlert,
} from 'lucide-react';

interface EventsStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (coords: [number, number], requiredLayer?: string, entity?: any) => void;
}

interface StreamEvent {
  id: string;
  type: string;
  source: string;
  time: string;
  location: string;
  coordinates: [number, number]; // [lng, lat]
  authority: string;
  severity: string;
  freshnessBadge: 'LIVE < 5 min' | 'RECENT < 1 h' | 'DELAYED' | 'HISTORICAL' | 'OFFLINE SNAPSHOT';
  requiredLayer?: string;
  title: string;
  evidence: string;
}

const DEFAULT_STREAM_EVENTS: StreamEvent[] = [
  {
    id: 'EVT-2026-001',
    type: 'ICE_CALVING',
    source: 'Copernicus Sentinel-1 SAR',
    time: '2026-03-21T14:32:00Z',
    location: 'Larsen C Ice Shelf (-67.5°, -62.5°)',
    coordinates: [-62.5, -67.5],
    authority: 'ESA / PolarView',
    severity: 'WARNING',
    freshnessBadge: 'RECENT < 1 h',
    requiredLayer: 'ice_shelves',
    title: 'Desprendimiento de Tabular Iceberg A-84 Observado',
    evidence: 'Verificado por radar de apertura sintética Copernicus Sentinel-1. Superficie estimada: 420 km² en deriva norte-noreste.',
  },
  {
    id: 'EVT-2026-002',
    type: 'SEISMIC',
    source: 'USGS Global Seismology Feed',
    time: '2026-03-21T11:15:20Z',
    location: 'South Sandwich Trench (-58.2°, -24.8°)',
    coordinates: [-24.8, -58.2],
    authority: 'USGS Earthquake Hazards',
    severity: 'NOTICE',
    freshnessBadge: 'LIVE < 5 min',
    requiredLayer: 'seismic_events',
    title: 'Sismo Submarino Mag 5.4 en Fosa de Sandwich',
    evidence: 'Epicentro a 35 km de profundidad. Sin riesgo de tsunami según el PTWC. Ondas registradas en estación Orcadas.',
  },
  {
    id: 'EVT-2026-003',
    type: 'FISHERIES_SAR',
    source: 'Global Fishing Watch (Sentinel-1 Match)',
    time: '2026-03-21T09:40:00Z',
    location: 'Mar de Scotia Occidental (-56.4°, -42.8°)',
    coordinates: [-42.8, -56.4],
    authority: 'GFW / CCAMLR Observer',
    severity: 'INFO',
    freshnessBadge: 'RECENT < 1 h',
    requiredLayer: 'gfw_fishing_effort',
    title: 'Detección Radar SAR Coincidente con Buque Autorizado',
    evidence: 'Eco radar de 94 metros correlacionado con AIS de buque factoría noruego. Licencia CCAMLR activa para krill.',
  },
  {
    id: 'EVT-2026-004',
    type: 'SCIENTIFIC_DEEP_CORING',
    source: 'COMNAP & British Antarctic Survey',
    time: '2026-03-20T18:00:00Z',
    location: 'Rothera Research Station (-67.57°, -68.12°)',
    coordinates: [-68.12, -67.57],
    authority: 'BAS / SCAR Operations',
    severity: 'SUCCESS',
    freshnessBadge: 'HISTORICAL',
    requiredLayer: 'antarctic_stations',
    title: 'Finalización de Perforación de Núcleo de Hielo Subglacial',
    evidence: 'Recuperados 680 m de testigo continuo con registros de paleoclima de los últimos 120.000 años.',
  },
  {
    id: 'EVT-GREY-001',
    type: 'SECURITY_GREY_ZONE',
    source: 'AMOH Strategic AIS & CCAMLR Radar Monitor',
    time: '2026-03-21T16:10:00Z',
    location: 'Larsemann Hills / Complejo Zhongshan (-69.37°, 76.38°)',
    coordinates: [76.38, -69.37],
    authority: 'ATS Art. VII Inspection Log',
    severity: 'WARNING',
    freshnessBadge: 'LIVE < 5 min',
    requiredLayer: 'grey_zones_defense',
    title: 'Actividad de Telemetría Satelital BeiDou en Radomos No Inspeccionados',
    evidence: 'Descarga masiva de datos en órbita polar sincrónica hacia estación terrena sin notificación de misión científica previa en EIES.',
  },
  {
    id: 'EVT-GREY-002',
    type: 'SECURITY_SEISMIC_PROSPECTING',
    source: 'SCAR SDLS & Satellite AIS Tracker',
    time: '2026-03-21T12:05:00Z',
    location: 'Cuenca Sur del Mar de Weddell (-71.5°, -45.0°)',
    coordinates: [-45.0, -71.5],
    authority: 'Protocolo de Madrid Art. 7 Watch',
    severity: 'CRITICAL',
    freshnessBadge: 'RECENT < 1 h',
    requiredLayer: 'grey_zones_defense',
    title: 'Alerta de Prospección Geofísica Profunda sobre Cuenca de Hidrocarburos',
    evidence: 'Buque oceanográfico estatal operando tren de cañones de aire sísmicos 2D sobre paquete sedimentario susceptible de hidrocarburos.',
  },
  {
    id: 'EVT-GREY-003',
    type: 'SECURITY_DARK_FLEET',
    source: 'Sentinel-1 SAR / GFW Radar Engine',
    time: '2026-03-21T08:22:00Z',
    location: 'Arco de Scotia / Subárea CCAMLR 48.3 (-54.5°, -38.5°)',
    coordinates: [-38.5, -54.5],
    authority: 'CCAMLR Conservation Registry',
    severity: 'WARNING',
    freshnessBadge: 'LIVE < 5 min',
    requiredLayer: 'grey_zones_defense',
    title: 'Detección Radar de Buque con AIS Apagado en Área Regulada',
    evidence: 'Doble eco SAR de 110 m y 45 m realizando maniobra de trasbordo no autorizada de capturas de krill en límite de zona de conservación.',
  },
  {
    id: 'EVT-GREY-004',
    type: 'SECURITY_GNSS_SPOOF',
    source: 'GPSJam Anomaly Feed / NOTMAR S04-26',
    time: '2026-03-21T05:40:00Z',
    location: 'Estrecho de Bransfield Central (-62.8°, -59.2°)',
    coordinates: [-59.2, -62.8],
    authority: 'OMI / Sub-Centro SAR Polar',
    severity: 'WARNING',
    freshnessBadge: 'RECENT < 1 h',
    requiredLayer: 'grey_zones_defense',
    title: 'Interferencia Electrónica & Salto de Posición GNSS Reportado',
    evidence: 'Tres buques de investigación y pasaje reportan desvío de pseudorrango GPS de 350 metros y pérdida temporal de fijación diferencial DGPS.',
  },
];

export default function EventsStreamModal({
  isOpen,
  onClose,
  onSelectEvent,
}: EventsStreamModalProps) {
  const [events, setEvents] = useState<StreamEvent[]>(DEFAULT_STREAM_EVENTS);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/v8_2/events-stream')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.events && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredEvents =
    filterType === 'ALL'
      ? events
      : events.filter((e) => e.type.includes(filterType));

  const getEventIcon = (type: string) => {
    if (type.includes('SECURITY') || type.includes('GREY')) return <ShieldAlert className="w-4 h-4 text-[#ec4899]" />;
    if (type.includes('SEISMIC')) return <Activity className="w-4 h-4 text-[#ff827d]" />;
    if (type.includes('ICE')) return <Snowflake className="w-4 h-4 text-[#caf9f7]" />;
    if (type.includes('EXPEDITION') || type.includes('SCIENTIFIC')) return <FlaskConical className="w-4 h-4 text-[#a78bfa]" />;
    if (type.includes('BBNJ') || type.includes('GOVERNANCE')) return <Shield className="w-4 h-4 text-[#c084fc]" />;
    return <Radio className="w-4 h-4 text-[#00e5ff]" />;
  };

  const getFreshnessBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'LIVE < 5 min':
        return 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/50 animate-pulse';
      case 'RECENT < 1 h':
        return 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40';
      case 'DELAYED':
        return 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/40';
      case 'OFFLINE SNAPSHOT':
        return 'bg-[#f97316]/20 text-[#f97316] border-[#f97316]/40';
      default:
        return 'bg-[#64748b]/20 text-[#94a3b8] border-[#64748b]/40';
    }
  };

  const handleFlyToEvent = (evt: StreamEvent) => {
    if (onSelectEvent) {
      onSelectEvent(evt.coordinates, evt.requiredLayer, {
        id: evt.id,
        title: evt.title,
        type: evt.type,
        location: evt.location,
        authority: evt.authority,
        evidence: evt.evidence,
        time: evt.time,
        source: evt.source,
      });
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="Flujo de Eventos en Vivo Antártico"
      className="fixed inset-0 z-[260] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="bg-[#05131f] border border-[#1f3947] rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden text-[#edf5f5] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1f3947] bg-[#030c14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Flujo de Eventos Operacionales & Científicos V8.3</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30">
                  Data Truth
                </span>
              </h2>
              <p className="text-[11px] font-mono text-[#8faab5]">
                Sismos · Fracturas de Hielo · Pesca GFW · Zonas Grises · Telemetría
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0d2232] hover:bg-[#1a384f] text-[#8faab5] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 border-b border-[#183142] bg-[#081a28] flex items-center gap-2 overflow-x-auto text-xs">
          {['ALL', 'SECURITY', 'SEISMIC', 'ICE', 'FISHERIES', 'EXPEDITION', 'BBNJ'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1 rounded-md font-mono text-[11px] transition-all whitespace-nowrap ${
                filterType === f
                  ? 'bg-[#00e5ff] text-black font-bold shadow-sm'
                  : 'bg-[#0e273a] text-[#8faab5] hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'TODOS' : f === 'SECURITY' ? 'DEFENSA & ZONA GRIS' : f}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#607c8d]">
              No hay eventos recientes registrados para este filtro.
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleFlyToEvent(evt)}
                className="p-3.5 rounded-xl border border-[#1b3648] bg-[#081b29] hover:border-[#00e5ff] hover:bg-[#0a2335] cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#112a3d] group-hover:bg-[#00e5ff]/20 transition-colors">
                      {getEventIcon(evt.type)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-[#00e5ff] transition-colors">{evt.title}</h3>
                      <div className="text-[10px] font-mono text-[#8faab5] flex items-center gap-2 mt-0.5">
                        <span>{evt.location}</span>
                        <span>·</span>
                        <span>{evt.authority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${getFreshnessBadgeStyle(evt.freshnessBadge)}`}>
                      {evt.freshnessBadge}
                    </span>
                    <span className="text-[10px] font-mono text-[#8faab5]">
                      {evt.time.replace('T', ' ').replace('Z', ' UTC')}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#040f17] border border-[#132736] text-xs text-[#cadde6] font-sans flex items-start gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-[#00e5ff] flex-shrink-0 mt-0.5" />
                  <span>{evt.evidence}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#7b98a8] pt-1">
                  <span>ID: {evt.id} · Fuente: {evt.source}</span>
                  <span className="flex items-center gap-1 text-[#00e5ff] font-bold group-hover:underline">
                    <Navigation className="w-3 h-3" />
                    <span>Volar & Inspeccionar</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#030c14] border-t border-[#1f3947] flex items-center justify-between text-[11px] font-mono text-[#8faab5]">
          <span>Protocolo OSIRIS Events Stream · AMOH V8.3</span>
          <span>{filteredEvents.length} eventos en vista</span>
        </div>
      </div>
    </div>
  );
}
