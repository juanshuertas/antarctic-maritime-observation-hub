import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import PeaceBoatOverview from './PeaceBoatOverview';
import {
  Compass,
  MapPin,
  Layers,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Radio,
  Cpu,
  ExternalLink,
  ChevronRight,
  FileText,
  HeartPulse,
  GraduationCap,
  ShieldAlert,
  TreePine,
  Sparkles,
} from 'lucide-react';
import {
  getExpedition,
  SEED_SCIENTIFIC_MATCHUPS,
  INITIAL_SYNC_STATE,
  SEED_PAC_READINESS,
} from './expeditions-data';

export default function ExpeditionOverview(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const isPac = expedition.programType === 'PAC' || expeditionId.startsWith('exp-pac');
  const isPeaceBoat = expedition.programType === 'PEACE_BOAT' || expeditionId === 'PB124-OLEA-2026';

  const [selectedNode, setSelectedNode] = useState('gerlache');

  if (isPeaceBoat) return <PeaceBoatOverview expedition={expedition} />;

  // Illustrative PAC corridor nodes only. NG-LEX has no fixed stations and no field data yet.
  const NODES = !isPac ? [] : [
    { id: 'gerlache', name: 'Estrecho de Gerlache', lat: -64.502, lon: -61.765, density: 'Alta', vessels: 8 },
    { id: 'lemaire', name: 'Canal Lemaire', lat: -65.092, lon: -64.020, density: 'Crítica / Estrecha', vessels: 4 },
    { id: 'deception', name: 'Isla Decepción', lat: -62.980, lon: -60.550, density: 'Fondeadero Seguro', vessels: 5 },
    { id: 'margarita', name: 'Bahía Margarita', lat: -67.720, lon: -67.280, density: 'Baja / Hielo Pack', vessels: 2 },
  ];

  const expMatchups = SEED_SCIENTIFIC_MATCHUPS.filter((m) => m.expeditionId === expeditionId);
  const matchedCount = expMatchups.filter((m) => m.status === 'MATCH').length;
  const conflictCount = expMatchups.filter((m) => m.status === 'CONFLICT').length;
  const dataGapCount = expMatchups.filter((m) => m.status === 'DATA_GAP').length;

  const completedReadinessCount = SEED_PAC_READINESS.filter((r) => r.state === 'COMPLETE').length;

  return (
    <div className="space-y-6 font-mono">
      {/* 1. TOP BANNER: RESEARCH QUESTION & NON-INTERFERENCE PRINCIPLE */}
      <div className="rounded-3xl border border-[#1b3543] bg-gradient-to-r from-[#071622] via-[#091b29] to-[#06131c] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-[#72e0b5] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isPac
                  ? 'Gobernanza & Principio Rector de la Expedición Colombiana'
                  : 'Principio Central de Investigación AMOH'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-sans">
              &quot;{expedition.projectPrinciple}&quot;
            </h2>
            <p className="text-xs text-[#8faab5] font-sans leading-relaxed">
              {expedition.principleDetails}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b2130] border border-[#1c3a4d] flex flex-col justify-center min-w-[240px]">
            <span className="text-[10px] uppercase font-bold text-[#8faab5]">
              {isPac ? 'Alistamiento de Pilares PAC' : 'Meta de Campo (propuesta)'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#00e5ff]">
                {isPac ? completedReadinessCount : 0}
              </span>
              <span className="text-xs text-[#8faab5]">
                / {isPac ? `${SEED_PAC_READINESS.length} requerimientos` : `${expedition.successCriteria.minimum} sesiones mín. · ${expedition.successCriteria.worthwhile} deseable · ${expedition.successCriteria.ideal} ideal`}
              </span>
            </div>
            <div className="w-full bg-[#142836] h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00e5ff] to-[#72e0b5] h-full rounded-full transition-all"
                style={{
                  width: `${
                    isPac
                      ? (completedReadinessCount / SEED_PAC_READINESS.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="text-[10px] text-[#72e0b5] mt-1.5 font-bold">
              {isPac
                ? 'Auditoría cualitativa independiente activa'
                : 'Sin datos de campo: propuesta en preparación'}
            </span>
          </div>
        </div>
      </div>

      {/* PAC ACTION SHORTCUTS BAR (ONLY FOR PAC) */}
      {isPac && (
        <div className="p-4 rounded-2xl bg-[#081824] border border-[#173042] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse" />
            <span className="text-white font-bold font-sans">
              Módulos de Planificación y Gestión Antártica PAC:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/expeditions/${expeditionId}/readiness`}
              className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Matriz de Alistamiento</span>
            </Link>
            <Link
              to={`/expeditions/${expeditionId}/documents`}
              className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Documentos</span>
            </Link>
            <Link
              to={`/expeditions/${expeditionId}/training`}
              className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#a855f7]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Curso Pre-Antártico</span>
            </Link>
            <Link
              to={`/expeditions/${expeditionId}/health`}
              className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#ef4444]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>Salud</span>
            </Link>
            <Link
              to={`/expeditions/${expeditionId}/safety`}
              className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#ef4444]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>Seguridad & SOS</span>
            </Link>
            <Link
              to={`/expeditions/${expeditionId}/environment`}
              className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#22c55e]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <TreePine className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Bioseguridad & ASPA</span>
            </Link>
            <Link
              to={`/expeditions/${expeditionId}/lessons`}
              className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#f59e0b]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Lecciones Aprendidas</span>
            </Link>
          </div>
        </div>
      )}

      {/* 2. THREE-COLUMN MISSION CONTROL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMN A: RESEARCH QUESTION & SCIENTIFIC METHOD (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Research Question Card */}
          <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
            <div className="flex items-center gap-2 text-[#00e5ff] text-xs font-bold uppercase">
              <Compass className="w-4 h-4" />
              <span>Pregunta de Investigación Principal</span>
            </div>
            <p className="text-xs sm:text-sm text-white font-sans italic leading-relaxed border-l-2 border-[#00e5ff] pl-3 py-1">
              &quot;{expedition.researchQuestion}&quot;
            </p>
            <div className="text-[11px] text-[#8faab5] font-sans space-y-2">
              {isPac ? (
                <>
                  <p>
                    <strong>Tesis de Campo:</strong> La Península Antártica y el Estrecho de Bransfield son corredores de alto valor ecológico y tráfico marítimo creciente.
                  </p>
                  <p>
                    AMOH conecta la sensorización local embarcada (sensores BLE, Android Field Node, CTD) con pasadas satelitales Sentinel y registros de buques en tránsito sin interferir con las operaciones navales.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Tesis metodológica:</strong> Ninguna fuente describe por sí sola la actividad marítima. OLEA enlaza registros AIS, observación satelital (Sentinel) y observaciones de campo georreferenciadas, conservando procedencia, incertidumbre y revisión humana.
                  </p>
                  <p>
                    <strong>Observación ≠ causalidad.</strong> Acuerdo, desacuerdo y vacío de datos son resultados científicos válidos. La ausencia de AIS no implica ausencia de buque.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Scientific Methodology Summary */}
          <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-3">
            <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#72e0b5]" />
              <span>Metodología de Campo No-Invasiva</span>
            </h3>
            {!isPac ? (
            <ul className="text-xs text-[#8faab5] font-sans space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Sesiones breves de observación:</strong> registro UTC, GNSS con precisión, foto/video y notas desde ubicaciones permitidas, sin alterar la operación de huéspedes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#72e0b5] mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Contexto AIS licenciado/abierto:</strong> sin antena propia ni conexión a sistemas del buque.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Contexto satelital Sentinel-1/2/3:</strong> escenas asociadas al periodo de observación; si no hay escena compatible se registra «sin coincidencia».
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Preservación del desacuerdo:</strong> acuerdo, acuerdo parcial, desacuerdo, vacío de datos o evidencia insuficiente se documentan como resultado.
                </span>
              </li>
            </ul>
            ) : (
            <ul className="text-xs text-[#8faab5] font-sans space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Observación Óptica de Cubierta:</strong> Turnos de 30-60 min durante navegación en canales estrechos con binoculares náuticos de retícula.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#72e0b5] mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Auditoría AIS en Tiempo Real:</strong> Receptor VHF pasivo en laboratorio para capturar paquetes NMEA de buques circundantes sin alterar el puente.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Cruce de Pasadas Sentinel-1:</strong> Verificación de coordenadas de buque contra escenas de radar SAR de apertura sintética con latencia de horas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Preservación del Conflicto:</strong> Si el satélite detecta y el AIS no emite, o viceversa, se documenta como señal científica (discrepancia).
                </span>
              </li>
            </ul>
            )}
          </div>
        </div>

        {/* COLUMN B: INTERACTIVE WAP CORRIDOR & SPATIAL DENSITY (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-[#142938] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <MapPin className="w-4 h-4 text-[#00e5ff]" />
                <span>Corredor de la Península Antártica Occidental</span>
              </div>
              <Link
                to="/map"
                className="text-[11px] text-[#00e5ff] hover:underline flex items-center gap-1"
              >
                <span>Abrir en Live Lens</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* SVG Corridor Canvas Representation */}
            <div className="relative w-full aspect-[4/3] bg-[#040c12] rounded-2xl border border-[#142836] p-4 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-overview" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00e5ff" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-overview)" />
                </svg>
              </div>

              {/* Peninsula Coastline Schematic Vector */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                <path
                  d="M 320 20 Q 280 80 230 130 T 170 190 T 120 250 L 90 290"
                  fill="none"
                  stroke="#35c3c8"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  opacity="0.8"
                />
                <path
                  d="M 335 15 Q 295 75 245 125 T 185 185 T 135 245 L 105 285"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="12"
                  opacity="0.12"
                />
                <circle cx="310" cy="45" r="5" fill="#f59e0b" />
                <circle cx="240" cy="120" r="6" fill="#00e5ff" />
                <circle cx="210" cy="150" r="6" fill="#72e0b5" />
                <circle cx="140" cy="230" r="5" fill="#38bdf8" />
              </svg>

              <div className="relative z-10 flex items-center justify-between text-[10px] text-[#8faab5]">
                <span className="px-2 py-0.5 rounded bg-[#091b26] border border-[#1b3543]">
                  62°S · Islas Shetland del Sur
                </span>
                <span className="px-2 py-0.5 rounded bg-[#091b26] border border-[#1b3543] text-[#72e0b5]">
                  {isPac ? 'GPS Activo: -65.09°, -64.02°' : 'Sin posición: propuesta'}
                </span>
              </div>

              {!isPac && (
                <p className="relative z-10 text-[11px] text-[#8faab5] font-sans pt-2">
                  Área de estudio: Western Antarctic Peninsula. Sin estaciones fijas: los sitios dependen del itinerario NG-LEX, que aún no está seleccionado. El esquema es ilustrativo.
                </p>
              )}
              {/* Interactive Node Selector Pills */}
              <div className="relative z-10 grid grid-cols-2 gap-2 pt-2">
                {NODES.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-2 rounded-xl text-left transition-all border text-xs ${
                      selectedNode === node.id
                        ? 'bg-[#0b2538] border-[#00e5ff] text-white shadow-lg'
                        : 'bg-[#071722]/80 border-[#152e3e] text-[#8faab5] hover:text-white'
                    }`}
                  >
                    <div className="font-bold truncate">{node.name}</div>
                    <div className="text-[10px] flex items-center justify-between mt-0.5 text-[#6e8b99]">
                      <span>{node.density}</span>
                      <span className="text-[#00e5ff] font-bold">{node.vessels} buques</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative z-10 flex items-center justify-between text-[10px] text-[#8faab5] pt-1">
                <span>68°S · Bahía Margarita</span>
                <span>Proyección Estereográfica Polar WGS84</span>
              </div>
            </div>

            {/* Quick Metrics Footer */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#0b1e2c] border border-[#183547]">
                <span className="text-[10px] text-[#8faab5] block">Coincidencias</span>
                <span className="text-base font-bold text-[#00e5ff]">{matchedCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1e2c] border border-[#183547]">
                <span className="text-[10px] text-[#8faab5] block">Discrepancias</span>
                <span className="text-base font-bold text-[#f59e0b]">{conflictCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b1e2c] border border-[#183547]">
                <span className="text-[10px] text-[#8faab5] block">Vacíos Datos</span>
                <span className="text-base font-bold text-[#38bdf8]">{dataGapCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN C: PROPOSAL STATUS, EQUIPMENT & READINESS (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status Box */}
          <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isPac
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40'
                    : 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40'
                }`}
              >
                {isPac ? 'ESTADO: PLANNING' : 'PROPOSAL / DRAFT'}
              </span>
              <span className="text-xs text-[#8faab5]">{expedition.season || '2026–2027'}</span>
            </div>
            <div className="text-xs text-[#c4d7e0] font-sans">
              <p className="font-bold text-white mb-1">{expedition.program}</p>
              {expedition.proposalReference && (
                <p className="text-[11px] text-[#8faab5] leading-relaxed">
                  Referencia: <code className="text-[#00e5ff]">{expedition.proposalReference}</code>
                </p>
              )}
              {expedition.shipPlatform && (
                <p className="text-[11px] text-[#72e0b5] mt-1">
                  Plataforma: <strong className="text-white">{expedition.shipPlatform}</strong>
                </p>
              )}
              <p className="text-[10px] text-[#f59e0b] mt-2 italic border-t border-[#152a38] pt-2">
                {expedition.disclaimer}
              </p>
            </div>
          </div>

          {/* Equipment Profile Checklist */}
          <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-3">
            <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#38bdf8]" />
              <span>{isPac ? 'Equipamiento Ligero Requerido' : 'Equipamiento propuesto'}</span>
            </h3>
            <ul className="text-[11px] text-[#8faab5] font-sans space-y-2">
              {expedition.equipmentProfile.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#72e0b5] mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Offline Readiness & Edge Sync */}
          <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#72e0b5]" />
                <span>Nodo Buque Edge</span>
              </h3>
              <span className={`w-2 h-2 rounded-full ${isPac ? 'bg-[#72e0b5] animate-ping' : 'bg-[#8faab5]'}`} />
            </div>

            <div className="p-3 rounded-xl bg-[#050f16] border border-[#142836] text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8faab5]">IP Local:</span>
                <span className="text-[#00e5ff] font-bold">{INITIAL_SYNC_STATE.shipEdgeIp || 'sin configurar'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8faab5]">Registros Locales:</span>
                <span className="text-white font-bold">{INITIAL_SYNC_STATE.localRecordsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8faab5]">Cola de Sinc:</span>
                <span className="text-[#f59e0b] font-bold">{INITIAL_SYNC_STATE.queuedCount} eventos</span>
              </div>
            </div>

            <Link
              to={`/expeditions/${expedition.expeditionId}/sync`}
              className="w-full py-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#00e5ff] hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Administrar Sincronización</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM WORKFLOW PIPELINE: AIS + SENTINEL + FIELD -> MATCH -> REVIEW -> OUTPUT */}
      <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8faab5] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00e5ff]" />
          <span>Canal de Datos Científico Multifuente</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="p-4 rounded-2xl bg-[#06121b] border border-[#142836] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#00e5ff] font-bold">01. CAPTURA</span>
              <span className="text-[10px] text-[#8faab5]">3 Canales</span>
            </div>
            <p className="text-xs text-white font-bold">AIS + Sentinel + Campo</p>
            <p className="text-[11px] text-[#8faab5] font-sans">
              {isPac ? 'Recepción NMEA local, pasadas de radar SAR Sentinel-1 y notas ópticas con Android Field Node.' : 'Registros AIS licenciados/abiertos, escenas Sentinel y observaciones de campo capturadas en el iPhone dedicado.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#06121b] border border-[#142836] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#72e0b5] font-bold">02. MATCHUP</span>
              <span className="text-[10px] text-[#8faab5]">Motor Espaciotemporal</span>
            </div>
            <p className="text-xs text-white font-bold">Correlación & Delta</p>
            <p className="text-[11px] text-[#8faab5] font-sans">
              Búsqueda de candidatos por tiempo y distancia según el protocolo. No se fuerzan coincidencias; se preservan las discrepancias.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#06121b] border border-[#142836] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#38bdf8] font-bold">03. REVISIÓN</span>
              <span className="text-[10px] text-[#8faab5]">Par Humano</span>
            </div>
            <p className="text-xs text-white font-bold">{isPac ? 'Cola Editorial SCAR' : 'Revisión científica humana'}</p>
            <p className="text-[11px] text-[#8faab5] font-sans">
              Validación cualificada sin automatismos de un solo clic. Registro de incertidumbre y procedencia.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#06121b] border border-[#142836] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#f59e0b] font-bold">04. RESULTADOS</span>
              <span className="text-[10px] text-[#8faab5]">Open Science</span>
            </div>
            <p className="text-xs text-white font-bold">KDE & Prioridades</p>
            <p className="text-[11px] text-[#8faab5] font-sans">
              {isPac ? 'Exportación en Parquet, GeoPackage y replay temporal del crucero para la toma de decisiones ambientales.' : 'Mapas de actividad y cobertura, tabla de coincidencias/desacuerdos/vacíos, protocolo reproducible y registro de incertidumbre.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
