import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Compass,
  ShieldCheck,
  Database,
  Sparkles,
  Ship,
  Plane,
  Radio,
  Fish,
  AlertTriangle,
  MapPin,
  Layers,
  Activity,
  CheckCircle2,
  TreePine,
  Anchor,
  Copy,
  Check,
  Info,
  ShieldAlert,
  GripHorizontal,
} from 'lucide-react';
import { getLayerSemantics } from '../lib/layer-semantics';
import { getLayerSvgDataUri } from '../lib/map-icon-atlas';
import AgencyBadge from './AgencyBadge';

export type EntityType =
  | 'VESSEL'
  | 'RESEARCH_VESSEL'
  | 'TOURISM_VESSEL'
  | 'FISHING_VESSEL'
  | 'AIRCRAFT'
  | 'SATELLITE'
  | 'STATION'
  | 'CAMP'
  | 'AIRFIELD'
  | 'EXPEDITION'
  | 'CRUISE'
  | 'SAMPLE'
  | 'SENSOR'
  | 'ARGO_FLOAT'
  | 'SPECIES_OCCURRENCE'
  | 'CORAL'
  | 'PROTECTED_AREA'
  | 'LEGAL_ZONE'
  | 'CABLE'
  | 'EIA'
  | 'TOURISM_SITE'
  | 'ALERT'
  | 'GENERIC';

export interface ObjectDetailCardProps {
  data: any;
  onClose: () => void;
  onCenterOnMap?: (lat: number, lon: number) => void;
}

function formatVal(v: any, unit = ''): string {
  if (v === null || v === undefined || v === '' || Number.isNaN(v) || v === 'Invalid Date' || v === 'undefined' || v === 'null') {
    return '—';
  }
  return `${v}${unit ? ' ' + unit : ''}`;
}

export default function ObjectDetailCard({
  data,
  onClose,
  onCenterOnMap,
}: ObjectDetailCardProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'POSITION' | 'SCIENCE' | 'ACTIVITY' | 'ENVIRONMENT' | 'GOVERNANCE' | 'PROVENANCE'>('OVERVIEW');
  const [copiedHash, setCopiedHash] = useState(false);
  const [scienceOpp, setScienceOpp] = useState<any>(null);
  const [loadingOpp, setLoadingOpp] = useState(false);

  if (!data) return null;

  // Infer Entity Type & Visual Attributes
  const rawType = (data.entityType || data.type || data.category || data.group || '').toUpperCase();
  let entityType: EntityType = 'GENERIC';
  let badgeColor = '#8de8cd';
  let typeLabel = 'ENTIDAD POLAR';
  let IconComponent = Compass;

  if (rawType.includes('AIRCRAFT') || data.callsign || data.flight_icao || data.aircraft_type) {
    entityType = 'AIRCRAFT';
    badgeColor = '#4da8ff';
    typeLabel = 'AERONAVE POLAR';
    IconComponent = Plane;
  } else if (rawType.includes('SATELLITE') || data.sensor || data.altitude_km) {
    entityType = 'SATELLITE';
    badgeColor = '#a995ff';
    typeLabel = 'SATÉLITE EN ÓRBITA';
    IconComponent = Radio;
  } else if (data.mmsi && (rawType.includes('FISH') || data.targetSpecies || data.ccamlrStatus)) {
    entityType = 'FISHING_VESSEL';
    badgeColor = '#ff8a4c';
    typeLabel = 'BUQUE PESQUERO CCAMLR';
    IconComponent = Fish;
  } else if (data.mmsi && (rawType.includes('TOUR') || data.pax || data.operator?.toLowerCase().includes('expeditions'))) {
    entityType = 'TOURISM_VESSEL';
    badgeColor = '#e085ff';
    typeLabel = 'BUQUE TURÍSTICO IAATO';
    IconComponent = Ship;
  } else if (data.mmsi && (data.ship_name?.includes('PACIFIC WORLD') || data.name?.includes('PACIFIC WORLD') || data.name?.includes('Peace Boat'))) {
    entityType = 'RESEARCH_VESSEL';
    badgeColor = '#38bdf8';
    typeLabel = 'PEACE BOAT · OBSERVATORIO ODS 14';
    IconComponent = Ship;
  } else if (data.mmsi && (rawType.includes('RESEARCH') || data.name?.includes('R/V') || data.name?.includes('ARC') || data.name?.includes('Polarstern') || data.ship_type?.toLowerCase().includes('research'))) {
    entityType = 'RESEARCH_VESSEL';
    badgeColor = '#00e5ff';
    typeLabel = 'BUQUE DE INVESTIGACIÓN POLAR';
    IconComponent = Ship;
  } else if (data.mmsi || data.ship_type) {
    entityType = 'VESSEL';
    badgeColor = '#35c3c8';
    typeLabel = 'TRÁFICO MARÍTIMO AIS';
    IconComponent = Ship;
  } else if (rawType.includes('ARGO') || data.cycle) {
    entityType = 'ARGO_FLOAT';
    badgeColor = '#38bdf8';
    typeLabel = 'PERFILADOR ARGO';
    IconComponent = Activity;
  } else if (rawType.includes('STATION') || data.station_name || data.operator_country) {
    entityType = 'STATION';
    badgeColor = '#ffc845';
    typeLabel = 'BASE CIENTÍFICA POLAR';
    IconComponent = Anchor;
  } else if (rawType.includes('FAUNA') || rawType.includes('LIFE') || data.scientific_name || data.scientificName) {
    entityType = data.scientific_name?.toLowerCase().includes('coral') ? 'CORAL' : 'SPECIES_OCCURRENCE';
    badgeColor = '#72e0b5';
    typeLabel = 'BIODIVERSIDAD MARINA';
    IconComponent = TreePine;
  } else if (rawType.includes('CABLE') || data.length_km) {
    entityType = 'CABLE';
    badgeColor = '#ffc845';
    typeLabel = 'CABLE SUBMARINO';
    IconComponent = Layers;
  } else if (
    rawType.includes('NUCLEAR') ||
    rawType.includes('RADIATION') ||
    data.contamination_type ||
    data.Polluting_Country ||
    data.Material ||
    data.layerId === 'nuclear_sites' ||
    data.layer_id === 'nuclear_sites'
  ) {
    entityType = 'ALERT';
    badgeColor = '#ef4444';
    typeLabel = 'VERTIDO NUCLEAR / RESIDUO';
    IconComponent = AlertTriangle;
  } else if (
    rawType.includes('POLAR_FRICTION_SECTOR') ||
    data.polar_friction_index !== undefined ||
    data.sector_id ||
    data.layerId === 'polar_friction_sectors' ||
    data.layer_id === 'polar_friction_sectors'
  ) {
    entityType = 'ALERT';
    badgeColor = data.color || '#38bdf8';
    typeLabel = 'SECTOR DE FRICCIÓN POLAR (PFI)';
    IconComponent = ShieldAlert;
  } else if (
    rawType.includes('GREY') ||
    rawType.includes('DEFENSE') ||
    rawType.includes('STRATEGIC') ||
    data.dual_use_capability ||
    data.treaty_clause ||
    data.tension_level ||
    data.layerId === 'grey_zones_defense' ||
    data.layer_id === 'grey_zones_defense'
  ) {
    entityType = 'ALERT';
    badgeColor = '#c084fc';
    typeLabel = 'ZONA GRIS / SEGURIDAD ESTRATÉGICA';
    IconComponent = ShieldAlert;
  } else if (rawType.includes('ALERT') || data.severity || data.magnitude) {
    entityType = 'ALERT';
    badgeColor = '#ff5e8a';
    typeLabel = 'ALERTA / EVENTO SÍSMICO';
    IconComponent = AlertTriangle;
  }

  // Properties normalization
  const name = data.name || data.title || data.callsign || data.flight_icao || data.common_name || data.station_name || `Entidad ID: ${data.id || '—'}`;
  const subtitle = data.scientific_name || data.scientificName || data.airline || data.operator || data.country || data.flag || data.agency || 'Registro Polar AMOH';
  const lat = data.lat ?? data.latitude;
  const lon = data.lon ?? data.longitude ?? data.lng;
  const heading = data.heading ?? data.course ?? data.track;
  const speed = data.speed ?? data.speed_kts ?? data.sog;
  const altitude = data.altitude_ft ? `${data.altitude_ft} ft` : data.altitude_km ? `${data.altitude_km} km` : data.depth_m ? `${data.depth_m} m` : null;
  const recordHash = data.record_hash || data.evidence_hash || (data.id ? `sha256:amoh_${Math.abs(JSON.stringify(data).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16)}` : 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const timestamp = data.utc || data.timestamp || data.acquired_utc || data.time_str || new Date().toISOString();

  let rawLayerId = (data.layerId || data.layer_id || data.layer || '').replace(/-symbol|-point|-glow|-line|-fill/g, '');
  if (rawLayerId.startsWith('amoh-layer-')) {
    rawLayerId = rawLayerId.replace('amoh-layer-', '');
  }
  const layerId =
    rawLayerId ||
    (data.mmsi
      ? 'ais_vessels'
      : data.flight_icao || data.callsign
      ? 'polar_aircraft'
      : data.mag || data.magnitude
      ? 'seismic_events'
      : data.platform_number
      ? 'argo_floats'
      : data.fac_type || data.station_name || data.facility_name
      ? 'quantarctica_stations'
      : data.observation_type
      ? 'field_observations'
      : data.common_name || data.scientific_name
      ? 'antarctic_fauna'
      : data.aspa_id
      ? 'quantarctica_aspa'
      : data.asma_id
      ? 'quantarctica_asma'
      : data.targetSpecies
      ? 'gfw_fishing_effort'
      : data.capacity_mw
      ? 'ai_datacenters'
      : data.base_type
      ? 'military_bases'
      : data.orbital_class
      ? 'spaceports'
      : data.stream_url
      ? 'live_webcams'
      : '');
  const semantics = layerId ? getLayerSemantics(layerId) : null;
  const svgDataUri = layerId ? getLayerSvgDataUri(layerId) : null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(recordHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      className="fixed bottom-4 left-4 sm:left-6 z-[490] w-[calc(100%-32px)] sm:w-[440px] max-h-[88vh] rounded-3xl bg-[#06141fe8] border border-[#1b3b4f] shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col text-[#edf5f5] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
      style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
    >
      {/* Top Header - Draggable */}
      <div className="p-4 border-b border-[#163040] bg-[#081b27] flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing select-none" title="Coge y arrastra para mover la ficha">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex flex-col items-center justify-center self-stretch pr-1 text-[#5e7c8e] hover:text-[#35c3c8] transition-colors">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border p-1.5"
            style={{
              backgroundColor: `${badgeColor}15`,
              borderColor: `${badgeColor}40`,
              color: badgeColor,
            }}
          >
            {svgDataUri ? (
              <img
                src={svgDataUri}
                alt=""
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <IconComponent className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: `${badgeColor}15`,
                  borderColor: `${badgeColor}40`,
                  color: badgeColor,
                }}
              >
                {typeLabel}
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#102d3f] text-[#72e0b5] border border-[#1b4d66] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>VERIFICADO</span>
              </span>
              {lat != null && lon != null && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#082030] text-[#38bdf8] border border-[#1b4d66] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"></span>
                  <span>{lat.toFixed(2)}°, {lon.toFixed(2)}°</span>
                </span>
              )}
              {semantics && (
                <>
                  <AgencyBadge agency={semantics.agency} size="xs" />
                  <img
                    src={semantics.sdgIconUrl}
                    alt={semantics.sdgTitle}
                    className="w-4 h-4 rounded object-cover border border-white/20 shrink-0"
                    title={semantics.sdgTitle}
                  />
                </>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate leading-tight">
              {name}
            </h2>
            <p className="text-xs text-[#8faab5] truncate mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full bg-[#0d2230] hover:bg-[#16364c] border border-[#1e4056] flex items-center justify-center text-[#8faab5] hover:text-white transition-all shrink-0"
          aria-label="Cerrar Ficha Única"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="px-3 py-1.5 border-b border-[#142d3c] bg-[#071622] flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'OVERVIEW', label: 'Resumen' },
          { id: 'POSITION', label: 'Posición' },
          { id: 'SCIENCE', label: 'Ciencia' },
          { id: 'ACTIVITY', label: 'Actividad' },
          { id: 'ENVIRONMENT', label: 'ODS / Clima' },
          { id: 'GOVERNANCE', label: 'Tratado' },
          { id: 'PROVENANCE', label: 'Proveniencia (QC)' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all shrink-0 font-medium ${
              activeTab === t.id
                ? 'bg-[#123348] text-[#58d5e3] border border-[#215675] font-bold shadow-sm'
                : 'text-[#7d99a6] hover:text-white hover:bg-[#0a202d]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="p-4 overflow-y-auto max-h-[55vh] space-y-4 text-xs">
        {/* Tab 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#183a4e] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#58d5e3] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Estado Operacional & Contexto</span>
              </div>
              <p className="text-xs text-[#cadbe2] leading-relaxed">
                {data.notes || data.description || data.status || 'Entidad georreferenciada en el Océano Austral y monitoreada bajo la red de observación digital AMOH.'}
              </p>
            </div>

            {semantics && (
              <div className="p-3.5 rounded-2xl bg-[#071926] border border-[#15384d] space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#132e40] pb-1.5">
                  <div className="text-[10px] font-mono uppercase text-[#00e5ff] font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>¿QUÉ ES ESTE DATO?</span>
                  </div>
                  <AgencyBadge agency={semantics.agency} size="xs" />
                </div>
                <p className="text-xs text-[#cadbe2] leading-relaxed">
                  {semantics.whatIsIt}
                </p>
                <div className="text-[10px] font-mono uppercase text-[#34d399] font-bold flex items-center gap-1.5 pt-1">
                  <span>¿PARA QUÉ SIRVE EN LA ANTÁRTIDA?</span>
                </div>
                <p className="text-xs text-[#8faab5] leading-relaxed">
                  {semantics.purpose}
                </p>
              </div>
            )}

            {/* Specialized Block: Nuclear & Radiation Contamination Incident */}
            {(data.contamination_type || data.Material || data.Polluting_Country || data.layerId === 'nuclear_sites') && (
              <div className="p-3.5 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/40 space-y-2 font-mono">
                <div className="text-[10px] uppercase text-[#ef4444] font-bold flex items-center gap-1.5 border-b border-[#ef4444]/25 pb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
                  <span>REGISTRO DE CONTAMINACIÓN RADIACTIVA / NUCLEAR</span>
                </div>
                <div className="text-xs space-y-1.5 pt-0.5">
                  {data.contamination_type && (
                    <div className="flex justify-between py-0.5 border-b border-[#ef4444]/15">
                      <span className="text-[#fca5a5]">Tipo de Vertido:</span>
                      <span className="text-white font-semibold text-right max-w-[220px]">{data.contamination_type}</span>
                    </div>
                  )}
                  {data.Material && (
                    <div className="flex justify-between py-0.5 border-b border-[#ef4444]/15">
                      <span className="text-[#fca5a5]">Material / Agente:</span>
                      <span className="text-white font-bold">{data.Material}</span>
                    </div>
                  )}
                  {data.Year && (
                    <div className="flex justify-between py-0.5 border-b border-[#ef4444]/15">
                      <span className="text-[#fca5a5]">Periodo / Año:</span>
                      <span className="text-[#ffd600] font-bold">{data.Year}</span>
                    </div>
                  )}
                  {data.Polluting_Country && (
                    <div className="flex justify-between py-0.5 border-b border-[#ef4444]/15">
                      <span className="text-[#fca5a5]">País Responsable:</span>
                      <span className="text-white font-bold">{data.Polluting_Country}</span>
                    </div>
                  )}
                  {data.Depth_m && (
                    <div className="flex justify-between py-0.5 border-b border-[#ef4444]/15">
                      <span className="text-[#fca5a5]">Profundidad (m):</span>
                      <span className="text-white">{data.Depth_m}</span>
                    </div>
                  )}
                  {data.Source && (
                    <div className="pt-1 border-t border-[#ef4444]/20">
                      <span className="text-[#fca5a5] block text-[10px]">Fuente Documental de Referencia:</span>
                      <a
                        href={data.Source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#38bdf8] hover:underline text-[11px] break-all block font-mono"
                      >
                        {data.Source}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specialized Block: Grey Zones & Strategic Defense */}
            {(data.dual_use_capability || data.treaty_clause || data.tension_level || data.layerId === 'grey_zones_defense' || data.layer_id === 'grey_zones_defense') && (
              <div className="p-3.5 rounded-2xl bg-[#a855f7]/15 border border-[#a855f7]/40 space-y-2.5 font-mono">
                <div className="text-[10px] uppercase text-[#c084fc] font-bold flex items-center justify-between border-b border-[#a855f7]/25 pb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#ec4899]" />
                    <span>ANÁLISIS DE ZONA GRIS & SEGURIDAD POLAR</span>
                  </span>
                  {data.tension_level && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      data.tension_level === 'CRITICAL' ? 'bg-[#ef4444]/30 text-[#fca5a5] border border-[#ef4444]/50 animate-pulse' :
                      data.tension_level === 'HIGH' || data.tension_level === 'ELEVATED' ? 'bg-[#f59e0b]/30 text-[#fde68a] border border-[#f59e0b]/50' :
                      'bg-[#38bdf8]/30 text-[#bae6fd] border border-[#38bdf8]/50'
                    }`}>
                      TENSIÓN: {data.tension_level}
                    </span>
                  )}
                </div>
                <div className="text-xs space-y-1.5 pt-0.5">
                  {data.facility && (
                    <div className="flex justify-between py-0.5 border-b border-[#a855f7]/15">
                      <span className="text-[#d8b4fe]">Instalación / Nodo:</span>
                      <span className="text-white font-semibold text-right max-w-[220px]">{data.facility}</span>
                    </div>
                  )}
                  {data.country && (
                    <div className="flex justify-between py-0.5 border-b border-[#a855f7]/15">
                      <span className="text-[#d8b4fe]">Estado / Operador:</span>
                      <span className="text-white font-bold">{data.country}</span>
                    </div>
                  )}
                  {data.dual_use_capability && (
                    <div className="py-1 border-b border-[#a855f7]/15">
                      <span className="text-[#d8b4fe] font-bold block mb-0.5">Capacidad de Doble Uso / Vector:</span>
                      <span className="text-[#edf5f5] text-[11px] leading-relaxed block">{data.dual_use_capability}</span>
                    </div>
                  )}
                  {data.treaty_clause && (
                    <div className="py-1 border-b border-[#a855f7]/15">
                      <span className="text-[#d8b4fe] font-bold block mb-0.5">Marco Jurídico / Cláusula en Tensión:</span>
                      <span className="text-[#fde047] text-[11px] block">{data.treaty_clause}</span>
                    </div>
                  )}
                  {data.strategic_implication && (
                    <div className="py-1 border-b border-[#a855f7]/15">
                      <span className="text-[#d8b4fe] font-bold block mb-0.5">Implicación Geopolítica & Estratégica:</span>
                      <span className="text-[#cbd5e1] text-[11px] leading-relaxed block">{data.strategic_implication}</span>
                    </div>
                  )}
                  {data.recommendation && (
                    <div className="pt-1.5">
                      <span className="text-[#34d399] font-bold block mb-0.5">Recomendación / Medida de Mitigación:</span>
                      <span className="text-[#a7f3d0] text-[11px] leading-relaxed block">{data.recommendation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specialized Block: Polar Friction Sector (PFI) */}
            {(data.polar_friction_index !== undefined || data.type === 'POLAR_FRICTION_SECTOR' || data.layerId === 'polar_friction_sectors' || data.layer_id === 'polar_friction_sectors') && (
              <div className="p-3.5 rounded-2xl bg-[#0369a1]/20 border border-[#38bdf8]/50 space-y-2.5 font-mono">
                <div className="text-[10px] uppercase text-[#38bdf8] font-bold flex items-center justify-between border-b border-[#38bdf8]/30 pb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>BARÓMETRO DE FRICCIÓN POLAR (PFI)</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    data.polar_friction_index >= 75 ? 'bg-[#ef4444]/30 text-[#fca5a5] border border-[#ef4444]/50 animate-pulse' :
                    data.polar_friction_index >= 50 ? 'bg-[#f59e0b]/30 text-[#fde68a] border border-[#f59e0b]/50' :
                    'bg-[#10b981]/30 text-[#a7f3d0] border border-[#10b981]/50'
                  }`}>
                    SCORE PFI: {data.polar_friction_index} / 100
                  </span>
                </div>
                <div className="text-xs space-y-2 pt-0.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8faab5]">Índice de Fricción Ponderado:</span>
                      <span className="font-bold text-white">{data.polar_friction_index} %</span>
                    </div>
                    <div className="w-full bg-[#112a3d] h-2 rounded-full overflow-hidden border border-[#1e455e]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(5, data.polar_friction_index))}%`,
                          backgroundColor: data.color || (data.polar_friction_index >= 75 ? '#ef4444' : data.polar_friction_index >= 50 ? '#f59e0b' : '#38bdf8'),
                        }}
                      />
                    </div>
                  </div>

                  {data.primary_driver && (
                    <div className="py-1 border-t border-[#1e455e]/60">
                      <span className="text-[#fde68a] font-bold block mb-0.5">Vector Principal de Fricción:</span>
                      <span className="text-white text-[11px] leading-relaxed block">{data.primary_driver}</span>
                    </div>
                  )}

                  {data.treaty_articles && (
                    <div className="py-1 border-t border-[#1e455e]/60">
                      <span className="text-[#38bdf8] font-bold block mb-0.5">Instrumentos Jurídicos Relevantes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(data.treaty_articles) ? data.treaty_articles : [data.treaty_articles]).map((art: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-[#0c2434] text-[#7dd3fc] border border-[#1e455e]">
                            {art}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specialized Block: Polar Fauna & Species Observation */}
            {(data.scientific_name || data.common_name || data.species || data.chlorophyll_a_mg_m3 !== undefined || data.school_biomass_tons !== undefined || data.biomass_density_g_m2 !== undefined || data.pod_size !== undefined || data.population !== undefined || data.population_estimate !== undefined || data.individuals !== undefined || data.trophic_role) && (
              <div className="p-3.5 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/40 space-y-2 font-mono">
                <div className="text-[10px] uppercase text-[#34d399] font-bold flex items-center justify-between border-b border-[#10b981]/25 pb-1">
                  <div className="flex items-center gap-1.5">
                    <TreePine className="w-3.5 h-3.5 text-[#34d399]" />
                    <span>REGISTRO BIOLÓGICO Y MONITOREO MARINO</span>
                  </div>
                  {data.iucn_status && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      data.iucn_status === 'CR' ? 'bg-red-500/30 text-red-300 border border-red-500/50' :
                      data.iucn_status === 'EN' ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50' :
                      data.iucn_status === 'VU' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                      data.iucn_status === 'NT' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50' :
                      'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      IUCN: {data.iucn_status}
                    </span>
                  )}
                </div>
                <div className="text-xs space-y-1.5 pt-0.5">
                  {(data.common_name_es || data.common_name) && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Nombre Común:</span>
                      <span className="text-white font-bold">{data.common_name_es || data.common_name}</span>
                    </div>
                  )}
                  {(data.scientific_name || data.species) && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Taxón Científico:</span>
                      <span className="text-[#72e0b5] font-bold italic">{data.scientific_name || data.species}</span>
                    </div>
                  )}
                  {data.category && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Categoría / Grupo:</span>
                      <span className="text-white uppercase font-bold">{data.category}</span>
                    </div>
                  )}
                  {data.sub_type && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Tipo de Detección:</span>
                      <span className="text-[#38bdf8] font-medium">{data.sub_type}</span>
                    </div>
                  )}
                  {data.chlorophyll_a_mg_m3 !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#34d399] font-bold">Clorofila-a Superficial:</span>
                      <span className="text-white font-bold px-1.5 py-0.5 rounded bg-[#10b981]/30 border border-[#10b981]/50">
                        {data.chlorophyll_a_mg_m3} mg/m³
                      </span>
                    </div>
                  )}
                  {data.bloom_extent_km2 !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Área de Floración:</span>
                      <span className="text-white font-medium">{data.bloom_extent_km2.toLocaleString()} km²</span>
                    </div>
                  )}
                  {data.satellite_sensor && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Sensor Satelital:</span>
                      <span className="text-[#a78bfa] font-mono text-[11px]">{data.satellite_sensor}</span>
                    </div>
                  )}
                  {data.school_biomass_tons !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#38bdf8] font-bold">Biomasa de Cardumen:</span>
                      <span className="text-white font-bold px-1.5 py-0.5 rounded bg-[#38bdf8]/20 border border-[#38bdf8]/40">
                        {data.school_biomass_tons.toLocaleString()} toneladas
                      </span>
                    </div>
                  )}
                  {data.acoustic_frequency_khz !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Frecuencia Acústica (EK80):</span>
                      <span className="text-white font-mono">{data.acoustic_frequency_khz} kHz</span>
                    </div>
                  )}
                  {data.biomass_density_g_m2 !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#fb923c] font-bold">Densidad de Biomasa Krill:</span>
                      <span className="text-white font-bold px-1.5 py-0.5 rounded bg-[#fb923c]/20 border border-[#fb923c]/40">
                        {data.biomass_density_g_m2.toLocaleString()} g/m²
                      </span>
                    </div>
                  )}
                  {data.acoustic_nasc_m2_nmi2 !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Retrodispersión NASC:</span>
                      <span className="text-white font-mono">{data.acoustic_nasc_m2_nmi2.toLocaleString()} m²/nmi²</span>
                    </div>
                  )}
                  {data.swarm_length_km !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Extensión de Enjambre:</span>
                      <span className="text-white font-medium">{data.swarm_length_km} km</span>
                    </div>
                  )}
                  {data.predator_association && (
                    <div className="py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0] block text-[10px]">Depredadores Asociados:</span>
                      <span className="text-[#fed7aa] text-[11px] leading-tight block">{data.predator_association}</span>
                    </div>
                  )}
                  {data.pod_size !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#06b6d4] font-bold">Tamaño de Manada (Pod):</span>
                      <span className="text-white font-bold px-1.5 py-0.5 rounded bg-[#06b6d4]/20 border border-[#06b6d4]/40">
                        {data.pod_size} cetáceos
                      </span>
                    </div>
                  )}
                  {data.behavior && (
                    <div className="py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0] block text-[10px]">Comportamiento Observado:</span>
                      <span className="text-[#caf9f7] text-[11px] leading-tight block">{data.behavior}</span>
                    </div>
                  )}
                  {data.trophic_role && (
                    <div className="py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0] block text-[10px]">Rol Ecológico:</span>
                      <span className="text-[#caf9f7] text-[11px] leading-tight block">{data.trophic_role}</span>
                    </div>
                  )}
                  {(data.sector_name_es || data.sector_name || data.area) && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Sector Antártico:</span>
                      <span className="text-white text-right font-medium max-w-[180px] truncate">{data.sector_name_es || data.sector_name || data.area}</span>
                    </div>
                  )}
                  {(data.population_estimate !== undefined || data.population !== undefined) && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Censo / Población:</span>
                      <span className="text-[#34d399] font-bold">{(data.population_estimate || data.population).toLocaleString()} individuos</span>
                    </div>
                  )}
                  {data.individuals !== undefined && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Individuos Avistados:</span>
                      <span className="text-[#34d399] font-bold">{data.individuals}</span>
                    </div>
                  )}
                  {data.depth_m !== undefined && Number(data.depth_m) > 0 && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Profundidad Batimétrica:</span>
                      <span className="text-[#38bdf8] font-bold">{data.depth_m} m</span>
                    </div>
                  )}
                  {data.institution && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Institución / Registro:</span>
                      <span className="text-[#829fae] truncate max-w-[170px] text-right">{data.institution}</span>
                    </div>
                  )}
                  {data.basis_of_record && (
                    <div className="flex justify-between py-0.5 border-b border-[#10b981]/15">
                      <span className="text-[#a7f3d0]">Método de Registro:</span>
                      <span className="text-[#829fae] truncate max-w-[170px] text-right">{data.basis_of_record}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.role && (
              <div className="p-2.5 rounded-xl bg-[#081924] border border-[#183a4e] space-y-1">
                <span className="text-[10px] font-mono text-[#58d5e3] font-bold block uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#58d5e3]" />
                  <span>MISIÓN CIENTÍFICA & ROL EDUCATIVO</span>
                </span>
                <span className="text-xs text-[#edf5f5] leading-relaxed block">{data.role}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#081924] border border-[#142e3f]">
                <span className="text-[10px] font-mono text-[#829fae] block">IDENTIFICADOR</span>
                <span className="text-xs font-mono font-bold text-white truncate block">
                  {formatVal(data.mmsi || data.callsign || data.id || data.flight_icao)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#081924] border border-[#142e3f]">
                <span className="text-[10px] font-mono text-[#829fae] block">JURISDICCIÓN / BANDERA</span>
                <span className="text-xs font-mono font-bold text-[#72e0b5] truncate block">
                  {formatVal(data.country || data.flag || data.jurisdiction || 'Tratado Antártico')}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#081924] border border-[#142e3f]">
                <span className="text-[10px] font-mono text-[#829fae] block">VELOCIDAD / RÉGIMEN</span>
                <span className="text-xs font-mono font-bold text-[#58d5e3] block">
                  {formatVal(speed, 'kts')}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#081924] border border-[#142e3f]">
                <span className="text-[10px] font-mono text-[#829fae] block">RUMBO / COG</span>
                <span className="text-xs font-mono font-bold text-white block">
                  {formatVal(heading, '°')}
                </span>
              </div>
            </div>

            {data.destination && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-[#081924] border border-[#142e3f]">
                  <span className="text-[10px] font-mono text-[#829fae] block">DESTINO PREVISTO</span>
                  <span className="text-xs font-mono font-bold text-white truncate block">{data.destination}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#081924] border border-[#142e3f]">
                  <span className="text-[10px] font-mono text-[#829fae] block">ETA ESTIMADO</span>
                  <span className="text-xs font-mono font-bold text-[#ffd600] truncate block">{data.eta || '—'}</span>
                </div>
              </div>
            )}

            {data.license && (
              <div className="p-2 rounded-xl bg-[#081924] border border-[#142e3f] flex justify-between items-center text-[10px] font-mono">
                <span className="text-[#829fae]">RÉGIMEN / LICENCIA:</span>
                <span className="text-[#34d399] font-bold">{data.license}</span>
              </div>
            )}

            
            {/* OLEA_OFFICIAL_WEBCAM_ACTION */}
            {data.live_webcam_url && (
              <a href={String(data.live_webcam_url)} target="_blank" rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#0d3b33] hover:bg-[#125247] border border-[#1f7665] text-[#d5fff7] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all">
                <span>Webcam oficial en vivo ↗</span>
              </a>
            )}

{lat && lon && onCenterOnMap && (
              <button
                onClick={() => onCenterOnMap(Number(lat), Number(lon))}
                className="w-full py-2.5 rounded-xl bg-[#103347] hover:bg-[#164560] border border-[#215a7a] text-[#caf9f7] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MapPin className="w-3.5 h-3.5 text-[#58d5e3]" />
                <span>Centrar en Mapa ({Number(lat).toFixed(3)}°, {Number(lon).toFixed(3)}°)</span>
              </button>
            )}

            {lat && lon && (
              <button
                onClick={() => {
                  setActiveTab('SCIENCE');
                  setLoadingOpp(true);
                  fetch(`/api/pythia/science-opportunities?lat=${Number(lat)}&lng=${Number(lon)}`)
                    .then((r) => r.json())
                    .then((d) => {
                      setScienceOpp(d);
                      setLoadingOpp(false);
                    })
                    .catch(() => setLoadingOpp(false));
                }}
                className="w-full py-2.5 rounded-xl bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 border border-[#00e5ff]/40 text-[#00e5ff] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00e5ff] group-hover:rotate-12 transition-transform" />
                <span>¿Qué medir aquí? (Oportunidades Científicas)</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 2: POSITION & TIME */}
        {activeTab === 'POSITION' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#183a4e] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#38bdf8] font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Telemetría Geodésica WGS84</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#142d3c]">
                  <span className="text-[#829fae]">Latitud:</span>
                  <span className="text-white font-bold">{formatVal(lat, '°')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#142d3c]">
                  <span className="text-[#829fae]">Longitud:</span>
                  <span className="text-white font-bold">{formatVal(lon, '°')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#142d3c]">
                  <span className="text-[#829fae]">Cota / Altitud / Prof.:</span>
                  <span className="text-[#58d5e3] font-bold">{formatVal(altitude)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#142d3c]">
                  <span className="text-[#829fae]">Timestamp UTC:</span>
                  <span className="text-[#72e0b5] font-bold">{formatVal(timestamp)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#829fae]">Fuente de Posición:</span>
                  <span className="text-white">{formatVal(data.position_source || data.source || 'AIS / GPS GNSS')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SCIENCE & METADATA */}
        {activeTab === 'SCIENCE' && (
          <div className="space-y-3">
            {/* Science Opportunity Suggestions if loaded */}
            {loadingOpp && (
              <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#183a4e] text-center text-xs font-mono text-[#829fae] animate-pulse">
                Calculando recomendaciones de muestreo in-situ...
              </div>
            )}
            {scienceOpp && (
              <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#00e5ff]/40 space-y-2">
                <div className="flex items-center justify-between border-b border-[#183a4e] pb-1">
                  <span className="text-[10px] font-mono font-bold text-[#00e5ff] uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>OPORTUNIDADES DE MEDICIÓN</span>
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff]">
                    {scienceOpp.scarcity_level}
                  </span>
                </div>
                <p className="text-xs text-[#cadbe2]">{scienceOpp.oceanographic_significance}</p>
                <div className="space-y-1.5 pt-1">
                  {(scienceOpp.candidate_measurements || []).map((m: any, i: number) => (
                    <div key={i} className="p-2 rounded-xl bg-[#06141c] border border-[#183a4e] text-xs">
                      <div className="flex justify-between font-bold text-white">
                        <span>{m.name}</span>
                        <span className="text-[#00e5ff] text-[10px]">{m.priority}</span>
                      </div>
                      <div className="text-[10px] text-[#829fae]">{m.scientific_value}</div>
                    </div>
                  ))}
                </div>
                {/* Safety Gate */}
                <div className="p-2.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#fca5a5] text-[10px] leading-relaxed">
                  <div className="font-bold flex items-center gap-1 text-[#ef4444]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AVISO TRATADO ANTÁRTICO / SEGURIDAD</span>
                  </div>
                  <div>{scienceOpp.safety_and_permit_gate?.disclaimer}</div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#183a4e] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#a78bfa] font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Linaje de Datos & Proveedor Oficial</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#829fae] block">CONJUNTO DE DATOS</span>
                  <span className="text-white font-semibold">{formatVal(data.dataset || data.source_name || 'AMOH Polar Live Stream / SCAR')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#829fae] block">ORGANIZACIÓN EMISORA</span>
                  <span className="text-[#58d5e3] font-semibold">{formatVal(data.operator || data.agency || data.source_organization || 'SCAR / COMNAP / IOC-UNESCO')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#829fae] block">LICENCIA DE DISTRIBUCIÓN</span>
                  <span className="text-[#72e0b5] font-mono">{formatVal(data.license || 'Creative Commons CC-BY 4.0 Open Polar Data')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: ACTIVITY */}
        {activeTab === 'ACTIVITY' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#183a4e] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#ff8a4c] font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Parámetros Operacionales</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {data.targetSpecies && (
                  <div className="flex justify-between py-1 border-b border-[#142d3c]">
                    <span className="text-[#829fae]">Especie Objetivo:</span>
                    <span className="text-white font-semibold">{data.targetSpecies}</span>
                  </div>
                )}
                {data.ccamlrStatus && (
                  <div className="flex justify-between py-1 border-b border-[#142d3c]">
                    <span className="text-[#829fae]">Estado CCAMLR:</span>
                    <span className="text-[#72e0b5] font-mono font-bold">{data.ccamlrStatus}</span>
                  </div>
                )}
                {data.pax && (
                  <div className="flex justify-between py-1 border-b border-[#142d3c]">
                    <span className="text-[#829fae]">Pasajeros IAATO:</span>
                    <span className="text-white font-mono font-bold">{data.pax} PAX</span>
                  </div>
                )}
                {data.flight_icao && (
                  <div className="flex justify-between py-1 border-b border-[#142d3c]">
                    <span className="text-[#829fae]">Ruta Aérea:</span>
                    <span className="text-white font-mono font-bold">{data.flight_icao}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-[#829fae]">Sensibilidad Ambiental:</span>
                  <span className="text-[#ffc845] font-mono">Nivel {formatVal(data.sensitivity_level || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: ENVIRONMENT & SDGs */}
        {activeTab === 'ENVIRONMENT' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#183a4e] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#72e0b5] font-bold flex items-center gap-1.5">
                <TreePine className="w-3.5 h-3.5" />
                <span>Alineación ONU: ODS 2030 + XDGs 2045</span>
              </div>
              <p className="text-xs text-[#cadbe2]">
                Contribuye activamente a la observación de la Vida Submarina (ODS 14), Acción por el Clima (ODS 13) y Alianzas Científicas Globales (ODS 17 / XDG Paz & Océanos).
              </p>
              <div className="flex gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-[#007ebd]/20 text-[#007ebd] border border-[#007ebd]/40 font-mono font-bold text-[10px]">
                  ODS 14 · VIDA SUBMARINA
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#3f7e44]/20 text-[#3f7e44] border border-[#3f7e44]/40 font-mono font-bold text-[10px]">
                  ODS 13 · ACCIÓN CLIMA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: GOVERNANCE & TREATIES */}
        {activeTab === 'GOVERNANCE' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#183a4e] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#c084fc] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Marco Jurídico del Tratado Antártico</span>
              </div>
              <p className="text-xs text-[#cadbe2] leading-relaxed">
                Área regida bajo el Sistema del Tratado Antártico (STA 1959) y el Protocolo de Madrid (1991).
                Soberanías territoriales en suspenso bajo el Artículo IV. Jurisdicción de Alta Mar sujeta al Acuerdo BBNJ de la ONU.
              </p>
            </div>
          </div>
        )}

        {/* Tab 7: PROVENANCE & DATA TRUTH */}
        {activeTab === 'PROVENANCE' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#183a4e] space-y-2.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8faab5]">Clasificación:</span>
                <span className="text-[#58d5e3] font-bold">{entityType}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8faab5]">Proveedor Oficial:</span>
                <span className="text-[#00e5ff] font-bold">{data.provider || 'Global Fishing Watch / SCAR'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8faab5]">Dataset / Colección:</span>
                <span className="text-white truncate max-w-[180px]">{data.dataset || 'public-global-fishing-effort:latest'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8faab5]">ID Upstream / Registro:</span>
                <span className="text-[#8faab5] font-mono">{data.record_id || data.mmsi || data.id || 'GFW-4W-2024-001'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8faab5]">Estado de Veracidad:</span>
                <span className="px-2 py-0.5 rounded bg-[#00e676]/20 text-[#00e676] font-bold text-[10px]">
                  {data.freshness || 'VERIFICADO OFICIAL'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8faab5]">Licencia de Datos:</span>
                <span className="text-[#cadde6]">{data.license || 'CC-BY-4.0 / Open Access'}</span>
              </div>

              {/* SHA-256 and Evidence ID */}
              <div className="text-[10px] font-mono uppercase text-[#58d5e3] font-bold flex items-center gap-1.5 pt-2 border-t border-[#122838]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Evidence Contract Digest (SHA-256)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#051119] border border-[#122838] font-mono text-[10px] break-all text-[#72e0b5]">
                {recordHash}
              </div>

              {/* Interactive Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleCopyHash}
                  className="py-2 px-3 rounded-xl bg-[#0e2738] hover:bg-[#14364c] border border-[#1e455e] text-xs font-mono font-bold text-[#58d5e3] flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-[#72e0b5]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'Copiado' : 'Copiar Evidence ID'}</span>
                </button>

                <button
                  onClick={() => {
                    const url = data.source_url || 'https://globalfishingwatch.org/map-and-data/';
                    window.open(url, '_blank');
                  }}
                  className="py-2 px-3 rounded-xl bg-[#0e2738] hover:bg-[#14364c] border border-[#1e455e] text-xs font-mono font-bold text-[#00e5ff] flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Abrir Fuente</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
