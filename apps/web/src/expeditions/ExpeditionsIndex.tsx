import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Sparkles,
  Plus,
  GitBranch,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import {
  SEED_NATGEO_EXPEDITION,
  SEED_PAC13_EXPEDITION,
  SEED_PEACEBOAT_EXPEDITION,
  createPacExpedition,
} from './expeditions-data';
import { WorkspaceStore } from '../lib/workspace-store';

export default function ExpeditionsIndex(): ReactNode {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PAC' | 'PROPOSALS' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNumber, setNewNumber] = useState(14);
  const [newSeason, setNewSeason] = useState('2027–2028');
  const [newTitle, setNewTitle] = useState('XIV Expedición Científica de Colombia a la Antártica');

  const handleCreatePac = (e: FormEvent) => {
    e.preventDefault();
    const yStart = parseInt(newSeason.split('–')[0], 10) || 2027;
    const yEnd = parseInt(newSeason.split('–')[1], 10) || 2028;
    const created = createPacExpedition(newNumber, newSeason, yStart, yEnd, {
      title: newTitle,
      leadName: 'Juan Sebastian Huertas Olea',
    });
    setShowCreateModal(false);
    navigate(`/expeditions/${created.expeditionId}/overview`);
  };

  return (
    <div className="min-h-screen bg-[#050e14] text-[#edf5f5] font-mono p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#1b3543] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-[#00e5ff] text-xs font-bold uppercase tracking-widest mb-1.5">
              <Compass className="w-4 h-4" />
              <span>World Oceans Living Observatory · Expeditions Master Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-sans">
              Portafolio de Expediciones Científicas
            </h1>
            <p className="text-xs text-[#8faab5] mt-1 max-w-2xl font-sans leading-relaxed">
              Portafolio científico OLEA: <strong>NatGeo / NGS-Lindblad</strong> como propuesta futura, <strong>Programa Antártico Colombiano (PAC)</strong> como ruta de planificación y <strong>Peace Boat 124</strong> como piloto metodológico real a bordo de Pacific World.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00e5ff] hover:bg-[#38bdf8] text-[#050e14] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#00e5ff]/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Expedición PAC</span>
            </button>

            <Link
              to="/map"
              className="px-4 py-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#38bdf8] hover:text-white hover:border-[#38bdf8] text-xs transition-colors flex items-center gap-2"
            >
              <span>← Mapa Central</span>
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'ALL', label: 'Ver Todas' },
            { id: 'PAC', label: '🇨🇴 Programa Antártico Colombiano (PAC)' },
            { id: 'PROPOSALS', label: 'NatGeo / NGS-Lindblad' },
            { id: 'ACTIVE', label: 'Peace Boat 124 · Piloto Real' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-[#00e5ff] text-[#050e14] shadow-md shadow-[#00e5ff]/20'
                  : 'bg-[#091b26] border border-[#1b3543] text-[#8faab5] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 1. PAC 13ª EXPEDICIÓN CARD (COLOMBIAN ANTARCTIC EXPEDITION) */}
        {(activeFilter === 'ALL' || activeFilter === 'PAC') && (
          <div className="relative rounded-3xl border-2 border-[#00e5ff]/70 bg-gradient-to-br from-[#091f2e] via-[#061724] to-[#030e17] p-6 sm:p-8 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badges & Disclaimer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#183a4f] pb-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>🇨🇴 PAC EXPEDITION WORKSPACE PROTOTYPE</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-bold text-[11px]">
                  PROTOTIPO · SIN CONVOCATORIA CONFIRMADA
                </span>
                <span className="px-3 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 font-bold text-[11px]">
                  DATOS DE EJEMPLO
                </span>
              </div>

              <div className="text-[11px] text-[#f59e0b] italic flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Prototipo con datos de ejemplo. El proponente no participa en una expedición PAC confirmada; no implica aval de la CCO.</span>
              </div>
            </div>

            {/* Title & Research Question */}
            <div className="space-y-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-sans group-hover:text-[#00e5ff] transition-colors">
                {SEED_PAC13_EXPEDITION.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#c4d7e0] font-sans leading-relaxed">
                <strong className="text-[#00e5ff]">Programa:</strong> {SEED_PAC13_EXPEDITION.program} · Comisión Colombiana del Océano (CCO) · Armada Nacional
              </p>

              <div className="p-4 rounded-2xl bg-[#092233] border border-[#1d4157] space-y-2">
                <div className="text-[11px] font-bold text-[#72e0b5] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pregunta de Investigación & Tesis Operacional</span>
                </div>
                <p className="text-xs sm:text-sm text-white italic font-sans leading-relaxed">
                  &quot;{SEED_PAC13_EXPEDITION.researchQuestion}&quot;
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#061722] border border-[#143245] text-xs text-[#8faab5]">
                <strong className="text-white">Principio Operacional:</strong> &quot;{SEED_PAC13_EXPEDITION.projectPrinciple}&quot;
                <p className="text-[11px] text-[#6b8896] mt-1 font-sans">
                  {SEED_PAC13_EXPEDITION.principleDetails}
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[#183a4f] text-xs mb-6">
              <div>
                <span className="text-[10px] text-[#8faab5] uppercase block">Investigador Líder</span>
                <span className="text-white font-bold">{SEED_PAC13_EXPEDITION.leadName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8faab5] uppercase block">Plataforma Naval</span>
                <span className="text-[#00e5ff] font-bold">{SEED_PAC13_EXPEDITION.shipPlatform}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8faab5] uppercase block">Soporte Aéreo</span>
                <span className="text-[#72e0b5] font-bold">{SEED_PAC13_EXPEDITION.airSupport}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8faab5] uppercase block">Versión de Método</span>
                <span className="text-[#38bdf8] font-bold font-mono">{SEED_PAC13_EXPEDITION.methodVersion}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link
                  to={`/expeditions/${SEED_PAC13_EXPEDITION.expeditionId}/readiness`}
                  className="px-3 py-1.5 rounded-xl bg-[#0d2639] border border-[#1e445e] hover:border-[#00e5ff]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Matriz de Alistamiento</span>
                </Link>
                <Link
                  to={`/expeditions/${SEED_PAC13_EXPEDITION.expeditionId}/training`}
                  className="px-3 py-1.5 rounded-xl bg-[#0d2639] border border-[#1e445e] hover:border-[#a855f7]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Curso Pre-Antártico</span>
                </Link>
                <Link
                  to={`/expeditions/${SEED_PAC13_EXPEDITION.expeditionId}/lessons`}
                  className="px-3 py-1.5 rounded-xl bg-[#0d2639] border border-[#1e445e] hover:border-[#f59e0b]/50 text-[#8faab5] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Lecciones Aprendidas</span>
                </Link>
              </div>

              <Link
                to={`/expeditions/${SEED_PAC13_EXPEDITION.expeditionId}/overview`}
                className="px-5 py-2.5 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all shadow-lg shadow-[#00e5ff]/20 flex items-center gap-2"
              >
                <span>ABRIR CENTRO DE MISIÓN PAC</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 2. NATGEO PILOT PROPOSAL CARD */}
        {(activeFilter === 'ALL' || activeFilter === 'PROPOSALS') && (
          <div className="relative rounded-3xl border-2 border-[#FFCC00]/70 bg-gradient-to-br from-[#0a2a4a]/40 via-[#07192b] to-[#040c13] p-6 sm:p-8 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFCC00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FFCC00]/20 pb-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-7 h-7 rounded bg-[#FFCC00] text-[#0A2A4A] font-bold text-xs flex items-center justify-center font-sans">
                  NG
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FFCC00]/20 text-[#FFCC00] border border-[#FFCC00]/40 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PROPUESTA EN PREPARACIÓN · VISITING SCIENTIST</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 font-bold text-[11px]">
                  TEMPORADA AUSTRAL 2027–2028
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-[#FFCC00] border border-[#FFCC00]/30 font-bold text-[11px]">
                  ESTADO: PROPUESTA
                </span>
              </div>

              <div className="text-[11px] text-[#FFCC00] italic flex items-center gap-1.5 bg-[#FFCC00]/10 px-3 py-1 rounded-lg border border-[#FFCC00]/30">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>No se implica respaldo de National Geographic ni Lindblad Expeditions.</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-wide group-hover:text-[#FFCC00] transition-colors">
                Expedición NG-LEX 2027-2028: {SEED_NATGEO_EXPEDITION.title}
              </h2>

              <p className="text-xs text-[#c4d7e0] font-sans leading-relaxed">
                <strong className="text-[#FFCC00]">Programa:</strong> NGS-Lindblad Expeditions Visiting Scientist Program · Southern Ocean 2027-2028
              </p>

              {/* Research Question */}
              <div className="p-4 rounded-2xl bg-[#0A2A4A]/40 border border-[#FFCC00]/30 space-y-1.5">
                <div className="text-[10px] font-bold text-[#FFCC00] uppercase tracking-wider">
                  Pregunta de Investigación
                </div>
                <p className="text-xs sm:text-sm text-white italic font-serif leading-relaxed">
                  &quot;¿Dónde y cuándo se concentra la actividad marítima a lo largo de la Península Antártica Occidental, y dónde coinciden, discrepan o dejan vacíos de observación el AIS, la observación satelital y los registros directos de campo?&quot;
                </p>
              </div>

              {/* Safety Gate Banner */}
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-[11px] text-red-200">
                🔒 <strong>SAFETY GATE:</strong> SCIENTIFIC CANDIDATE — NOT A NAVIGATION INSTRUCTION. Subject to expedition leader, vessel master, safety protocols, and Antarctic Treaty / national permits.
              </div>

              <div className="p-3 rounded-xl bg-[#071722] border border-[#163040] text-xs text-[#8faab5]">
                <strong className="text-[#FFCC00]">Principio Operativo:</strong> &quot;El buque no se adapta a la investigación; la investigación se adapta al buque.&quot;
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#FFCC00]/20">
              <div className="text-xs text-[#8faab5]">
                Buque: <strong>NG Endurance o NG Resolution</strong> (Lindblad) · viaje no seleccionado
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  to="/map"
                  onClick={() => WorkspaceStore.setControlCenterTab('EXPEDITION')}
                  className="px-4 py-2 rounded-xl bg-[#0c1f2d] border border-[#FFCC00]/40 text-[#FFCC00] hover:bg-[#FFCC00]/20 text-xs flex items-center gap-2 transition-colors font-bold"
                >
                  <Compass className="w-4 h-4" />
                  <span>Ver en Mapa</span>
                </Link>

                <Link
                  to={`/expeditions/${SEED_NATGEO_EXPEDITION.expeditionId}/science-hub`}
                  className="px-4 py-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#72e0b5] hover:text-white hover:border-[#72e0b5] text-xs flex items-center gap-2 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Science Hub QR</span>
                </Link>

                <Link
                  to={`/expeditions/${SEED_NATGEO_EXPEDITION.expeditionId}/overview`}
                  className="px-5 py-2 rounded-xl bg-[#FFCC00] text-[#0A2A4A] font-bold text-xs hover:bg-[#ffe066] transition-all flex items-center gap-2 shadow-lg shadow-[#FFCC00]/20"
                >
                  <span>ABRIR PROPUESTA NATGEO</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3. PEACE BOAT 124 — REAL-VESSEL METHOD PILOT */}
        {(activeFilter === 'ALL' || activeFilter === 'ACTIVE') && (
          <div className="relative rounded-3xl border-2 border-[#00B4D8]/70 bg-gradient-to-br from-[#003B46]/30 via-[#07192b] to-[#040c13] p-6 sm:p-8 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00B4D8]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#00B4D8]/20 pb-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-7 h-7 rounded bg-[#00B4D8] text-[#050e14] font-bold text-xs flex items-center justify-center font-sans">PB</span>
                <span className="px-3 py-1 rounded-full bg-[#00B4D8]/20 text-[#00E5FF] border border-[#00B4D8]/40 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PEACE BOAT 124 · REAL-VESSEL METHOD PILOT</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#72e0b5]/15 text-[#72e0b5] border border-[#72e0b5]/30 font-bold text-[11px]">
                  ACTIVE · PB124-OLEA-2026
                </span>
              </div>

              <div className="text-[11px] text-[#9edee7] italic flex items-center gap-1.5 bg-[#00B4D8]/10 px-3 py-1 rounded-lg border border-[#00B4D8]/30">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Independent OLEA method pilot · no sponsorship or endorsement implied</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-wide group-hover:text-[#00E5FF] transition-colors">
                {SEED_PEACEBOAT_EXPEDITION.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#081b27] border border-[#142836]">
                  <span className="text-[10px] uppercase text-[#8faab5] block">Platform</span>
                  <strong className="text-[#00E5FF]">Pacific World</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#081b27] border border-[#142836]">
                  <span className="text-[10px] uppercase text-[#8faab5] block">Field contributor</span>
                  <strong className="text-white">Meri Joyce</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#081b27] border border-[#142836]">
                  <span className="text-[10px] uppercase text-[#8faab5] block">Research admin</span>
                  <strong className="text-white">Juan Sebastian Huertas Olea</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#003B46]/20 border border-[#00B4D8]/30 space-y-1.5">
                <div className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider">Method question</div>
                <p className="text-xs sm:text-sm text-white italic font-sans leading-relaxed">
                  &quot;{SEED_PEACEBOAT_EXPEDITION.researchQuestion}&quot;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#8faab5]">
                <div className="p-3 rounded-xl bg-[#081b27] border border-[#142836]">
                  <strong className="text-white block mb-1">Phone-only / offline-first</strong>
                  <span>Device GNSS, optional original photo, app metadata and local persistence before network synchronization.</span>
                </div>
                <div className="p-3 rounded-xl bg-[#081b27] border border-[#142836]">
                  <strong className="text-white block mb-1">No vessel-system dependency</strong>
                  <span>No NMEA, internal AIS, bridge telemetry, ship laboratory, antenna installation or route modification.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#00B4D8]/20">
              <div className="text-[11px] text-[#8faab5]">
                Official itinerary = reference layer · observed track = device GNSS only · Passport integration follows reviewable evidence
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={SEED_PEACEBOAT_EXPEDITION.officialReferenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#0c2e3d] border border-[#00B4D8]/50 text-[#9edee7] hover:text-white hover:border-[#00E5FF] text-xs transition-colors"
                >
                  Official voyage reference
                </a>
                <Link
                  to={`/expeditions/${SEED_PEACEBOAT_EXPEDITION.expeditionId}/overview`}
                  className="px-5 py-2 rounded-xl bg-[#00B4D8] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all flex items-center gap-2 shadow-lg shadow-[#00B4D8]/20"
                >
                  <span>ABRIR PILOTO PEACE BOAT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Crear Nueva Expedición PAC (Post-NatGeo Continuity) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#091b29] border border-[#00e5ff]/50 rounded-2xl p-6 space-y-4 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                  INSTANCIAR CAMPAÑA PAC
                </span>
                <span className="text-[#8faab5] text-[11px]">Continuidad Metodológica</span>
              </div>
              <h3 className="text-base font-bold text-white font-sans">
                Crear Nueva Expedición Antártica Colombiana
              </h3>
              <p className="text-[#8faab5] mt-1">
                Herencia de método: Incorpora los aprendizajes de la expedición anterior (v1.0 NatGeo Pilot) hacia la nueva campaña nacional.
              </p>
            </div>

            <form onSubmit={handleCreatePac} className="space-y-3">
              <div>
                <label className="block text-[#8faab5] mb-1">Número de Expedición PAC</label>
                <input
                  type="number"
                  value={newNumber}
                  onChange={(e) => setNewNumber(parseInt(e.target.value, 10))}
                  min={13}
                  max={25}
                  className="w-full p-2.5 rounded-xl bg-[#06141f] border border-[#1b3543] text-white focus:outline-none focus:border-[#00e5ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8faab5] mb-1">Temporada Austral (Año–Año)</label>
                <input
                  type="text"
                  value={newSeason}
                  onChange={(e) => setNewSeason(e.target.value)}
                  placeholder="2027–2028"
                  className="w-full p-2.5 rounded-xl bg-[#06141f] border border-[#1b3543] text-white focus:outline-none focus:border-[#00e5ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8faab5] mb-1">Título de la Campaña</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#06141f] border border-[#1b3543] text-white focus:outline-none focus:border-[#00e5ff]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#06141f] border border-[#152e3d] text-[11px] text-[#72e0b5]">
                <strong className="text-white">Estado Inicial:</strong> Se creará en estado <code>REFERENCE / PLANNING</code> y fase <code>PREPARATION</code> conforme a los estándares de no sobreafirmación institucional.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0e2738] text-[#8faab5] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold hover:bg-[#38bdf8]"
                >
                  Instanciar Expedición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
