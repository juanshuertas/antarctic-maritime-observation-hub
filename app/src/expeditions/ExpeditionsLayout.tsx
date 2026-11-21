import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  Layers,
  Activity,
  QrCode,
  CheckCircle2,
  GitCompare,
  Download,
  RefreshCw,
  Users,
  Settings,
  Smartphone,
  Play,
  ArrowLeft,
  Wifi,
  ShieldCheck,
  Radio,
  FileText,
  HeartPulse,
  GraduationCap,
  Truck,
  Wrench,
  Microscope,
  ShieldAlert,
  TreePine,
  AlertTriangle,
  FileCheck,
  Lightbulb,
  Bot,
} from 'lucide-react';
import {
  getExpedition,
  INITIAL_SYNC_STATE,
} from './expeditions-data';
import SessionRunnerModal from './components/SessionRunnerModal';
import ExpeditionPythiaModal from './components/ExpeditionPythiaModal';

export default function ExpeditionsLayout(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [pythiaModalOpen, setPythiaModalOpen] = useState(false);

  const expedition = getExpedition(expeditionId);
  const isPac = expedition.programType === 'PAC' || expeditionId.startsWith('exp-pac');
  const isPeaceBoat = expedition.programType === 'PEACE_BOAT' || expeditionId === 'PB124-OLEA-2026';

  const NATGEO_TABS = [
    { to: `/expeditions/${expeditionId}/overview`, label: 'Resumen', icon: Compass },
    { to: `/expeditions/${expeditionId}/map`, label: 'Área de Estudio', icon: MapPin },
    { to: `/expeditions/${expeditionId}/sessions`, label: 'Protocolo de Sesiones', icon: Activity },
    { to: `/expeditions/${expeditionId}/observations`, label: 'Observaciones', icon: Layers },
    { to: `/expeditions/${expeditionId}/devices`, label: 'Equipo Planificado', icon: Smartphone },
    { to: `/expeditions/${expeditionId}/science-hub`, label: 'Science Hub QR', icon: QrCode },
    { to: `/expeditions/${expeditionId}/review`, label: 'Revisión Científica', icon: CheckCircle2 },
    { to: `/expeditions/${expeditionId}/matchups`, label: 'Coincidencias AIS–Satélite–Campo', icon: GitCompare },
    { to: `/expeditions/${expeditionId}/outputs`, label: 'Resultados Esperados', icon: Play },
    { to: `/expeditions/${expeditionId}/reports`, label: 'Informes & Quantarctica', icon: FileText },
    { to: `/expeditions/${expeditionId}/data`, label: 'Datos & Exportación', icon: Download },
    { to: `/expeditions/${expeditionId}/sync`, label: 'Sincronización Offline', icon: RefreshCw },
    { to: `/expeditions/${expeditionId}/team`, label: 'Equipo & Roles', icon: Users },
    { to: `/expeditions/${expeditionId}/settings`, label: 'Ajustes & Offline', icon: Settings },
  ];

  const PEACE_BOAT_TABS = [
    { to: `/expeditions/${expeditionId}/overview`, label: 'Overview', icon: Compass },
    { to: `/expeditions/${expeditionId}/sessions`, label: 'Field Sessions', icon: Activity },
    { to: `/expeditions/${expeditionId}/observations`, label: 'Observations', icon: Layers },
    { to: `/expeditions/${expeditionId}/review`, label: 'Method Review', icon: CheckCircle2 },
    { to: `/expeditions/${expeditionId}/matchups`, label: 'Post-hoc Matchups', icon: GitCompare },
  ];

  const PAC_TABS = [
    { to: `/expeditions/${expeditionId}/overview`, label: 'Resumen', icon: Compass },
    { to: `/expeditions/${expeditionId}/reports`, label: 'Informes & Quantarctica', icon: FileText },
    { to: `/expeditions/${expeditionId}/readiness`, label: 'Preparación & Checklist', icon: CheckCircle2 },
    { to: `/expeditions/${expeditionId}/documents`, label: 'Documentos & Privacidad', icon: FileText },
    { to: `/expeditions/${expeditionId}/training`, label: 'Curso Pre-Antártico', icon: GraduationCap },
    { to: `/expeditions/${expeditionId}/health`, label: 'Aptitud Médica / Salud', icon: HeartPulse },
    { to: `/expeditions/${expeditionId}/logistics`, label: 'Logística & Vuelos', icon: Truck },
    { to: `/expeditions/${expeditionId}/equipment`, label: 'Equipos & Indumentaria', icon: Wrench },
    { to: `/expeditions/${expeditionId}/science`, label: 'Proyectos de Ciencia PAC', icon: Microscope },
    { to: `/expeditions/${expeditionId}/sessions`, label: 'Sesiones de Campo', icon: Activity },
    { to: `/expeditions/${expeditionId}/devices`, label: 'Dispositivos & Sensores', icon: Smartphone },
    { to: `/expeditions/${expeditionId}/safety`, label: 'Seguridad & Abort Switch', icon: ShieldAlert },
    { to: `/expeditions/${expeditionId}/comms`, label: 'Comunicaciones & VHF', icon: Radio },
    { to: `/expeditions/${expeditionId}/incidents`, label: 'Registro de Novedades', icon: AlertTriangle },
    { to: `/expeditions/${expeditionId}/environment`, label: 'Bioseguridad & ASPA', icon: TreePine },
    { to: `/expeditions/${expeditionId}/sync`, label: 'Sincronización Edge', icon: RefreshCw },
    { to: `/expeditions/${expeditionId}/return`, label: 'Retorno & Cierre', icon: FileCheck },
    { to: `/expeditions/${expeditionId}/lessons`, label: 'Lecciones Aprendidas', icon: Lightbulb },
  ];

  const activeTabs = isPac ? PAC_TABS : isPeaceBoat ? PEACE_BOAT_TABS : NATGEO_TABS;

  return (
    <div className="min-h-screen bg-[#050e14] text-[#edf5f5] font-mono flex flex-col selection:bg-[#00e5ff]/30 selection:text-white">
      {/* 1. TOP MISSION BAR & DISCLAIMER HEADER */}
      <header className="border-b border-[#1b3543] bg-[#071520] sticky top-0 z-40">
        {/* Absolute Disclosure Bar */}
        <div className="bg-[#0b1e2c] border-b border-[#183140] px-4 py-1.5 flex items-center justify-between text-[11px] text-[#8faab5]">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded border font-bold uppercase tracking-wider text-[10px] ${
                isPac
                  ? 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/30'
                  : isPeaceBoat
                  ? 'bg-[#72e0b5]/15 text-[#72e0b5] border-[#72e0b5]/30'
                  : 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40'
              }`}
            >
              {isPac ? 'PAC WORKSPACE PROTOTYPE' : isPeaceBoat ? 'REAL-VESSEL METHOD PILOT' : 'PROPOSAL / APPLICATION'}
            </span>
            <span className="text-[#dbe6ec] font-sans font-medium">
              Programa: <strong className="text-white">{expedition.program}</strong>
            </span>
            <span className="hidden md:inline text-[#8faab5] italic">
              · {expedition.disclaimer}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isPeaceBoat ? (
              <>
                <div className="flex items-center gap-1.5 text-[#72e0b5]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NO VESSEL-SYSTEM ACCESS</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[#8faab5]">
                  <Smartphone className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>PHONE · OFFLINE-FIRST</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-[#72e0b5]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Nodo Buque: {INITIAL_SYNC_STATE.shipEdgeIp || 'sin configurar'}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[#8faab5]">
                  <Wifi className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>SHIP LAN (Offline Ready)</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mission Control Nav Header */}
        <div className="px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/expeditions"
              className="p-2 rounded-xl bg-[#0d212d] border border-[#213f4f] text-[#8faab5] hover:text-white hover:border-[#00e5ff]/50 transition-colors"
              title="Volver al portafolio de expediciones"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide truncate max-w-xl font-sans">
                  {expedition.title}
                </h1>
                {isPac ? (
                  <span className="px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 text-[10px] font-bold flex items-center gap-1">
                    <span>🇨🇴 PAC</span>
                    <span>· {expedition.season}</span>
                  </span>
                ) : isPeaceBoat ? (
                  <span className="px-2 py-0.5 rounded bg-[#72e0b5]/15 text-[#72e0b5] border border-[#72e0b5]/30 text-[10px] font-bold">
                    PB124 · ACTIVE METHOD PILOT
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 text-[10px] font-bold">
                    {expedition.region}
                  </span>
                )}
                {expedition.lifecycleStage && (
                  <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-bold">
                    FASE: {expedition.lifecycleStage}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8faab5] mt-0.5">
                <span>Líder: <strong className="text-white">{expedition.leadName}</strong></span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#72e0b5]" />
                  {expedition.plannedStart} al {expedition.plannedEnd}
                </span>
                {expedition.shipPlatform && (
                  <>
                    <span>·</span>
                    <span className="text-[#38bdf8]">Plataforma: {expedition.shipPlatform}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            {isPeaceBoat ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d2334] border border-[#72e0b5]/30 text-[#72e0b5] text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Truth-first registry active · Field Connect wiring in Phase 2</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setPythiaModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d2334] border border-[#00e5ff]/40 text-[#00e5ff] text-xs hover:bg-[#00e5ff]/10 transition-colors font-bold shadow-sm"
                  title="Consultar al asistente Pythia PAC"
                >
                  <Bot className="w-4 h-4 animate-pulse" />
                  <span className="hidden sm:inline">PYTHIA PAC</span>
                </button>

                <button
                  onClick={() => setSessionModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all shadow-lg shadow-[#00e5ff]/20 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>INICIAR SESIÓN</span>
                </button>

                <Link
                  to={`/expeditions/${expeditionId}/science-hub`}
                  className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#72e0b5] text-xs hover:border-[#72e0b5]/50 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR A Bordo</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className="flex items-center gap-1 px-4 sm:px-6 overflow-x-auto no-scrollbar border-t border-[#142936] bg-[#06121b]">
          {activeTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                    isActive
                      ? 'border-[#00e5ff] text-white font-bold bg-[#0d2230]'
                      : 'border-transparent text-[#8faab5] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </header>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* 3. SCIENTIFIC RESTRAINT & INTEGRITY FOOTER */}
      <footer className="border-t border-[#183140] bg-[#071520] px-6 py-4 text-[11px] text-[#6e8996]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#72e0b5]" />
            <span>
              <strong>{isPeaceBoat ? 'PB124 operational rule:' : 'Máxima Operacional Polar:'}</strong>{' '}
              &quot;{isPeaceBoat ? 'The vessel does not adapt to the research; the research adapts to the vessel.' : 'La expedición no se adapta a la investigación; la investigación se adapta a la logística polar.'}&quot;
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#8faab5]">
            <span>SAFETY OVERRIDES SCIENTIFIC SCHEDULE</span>
            <span>·</span>
            <span>{isPeaceBoat ? 'NO VESSEL-SYSTEM DEPENDENCY' : 'Ubicación perdida ≠ persona desaparecida'}</span>
            <span>·</span>
            <span>AMOH Scientific Engine</span>
          </div>
        </div>
      </footer>

      {/* Lightweight Session Runner Modal */}
      {sessionModalOpen && (
        <SessionRunnerModal
          expeditionId={expeditionId}
          onClose={() => setSessionModalOpen(false)}
        />
      )}

      {/* Pythia PAC Assistant Modal */}
      <ExpeditionPythiaModal
        isOpen={pythiaModalOpen}
        onClose={() => setPythiaModalOpen(false)}
        expeditionTitle={expedition.title}
      />
    </div>
  );
}
