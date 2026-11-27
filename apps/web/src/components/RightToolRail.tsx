import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Award,
  ShieldCheck,
  Ship,
  Satellite,
  Compass,
  Video,
  Settings as SettingsIcon,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Eye,
  Download,
  Layers,
  RefreshCw,
  Check,
} from 'lucide-react';
import { PythiaConsensusEngine, type AnalyticalCard } from '../lib/pythia-analyst';
import { HISTORICAL_NUCLEAR_CONTEXT } from '../lib/maris-service';
import { QUANTARCTICA_THEMES } from '../lib/quantarctica-service';
import { QUANTARCTICA_SCIENTIFIC_LAYERS } from '../lib/quantarctica-layers';
import { WorkspaceStore } from '../lib/workspace-store';
import { CURRENT_GRANTS_RADAR } from '../lib/passport-data-economy';
import { ARGO_WATER_COLUMN_SPEC } from '../lib/metrics-registry';
import { POLAR_VESSELS_FLEET, POLAR_SATELLITES_CONSTELLATION } from '../lib/osiris-live-feeds';
import { getAntarcticWebcams } from '../lib/amoh-vision';

export type RightDrawerId =
  | 'PYTHIA'
  | 'VESSELS'
  | 'FISHERIES'
  | 'SATELLITES'
  | 'ICE'
  | 'CHARTS'
  | 'TOURISM'
  | 'SCIENCE'
  | 'NUCLEAR'
  | 'CAMERAS'
  | 'PASSPORT'
  | 'GRANTS'
  | 'SETTINGS'
  | null;

interface RightToolRailProps {
  activeDrawer: RightDrawerId;
  onClose: () => void;
  onFlyToCoordinates?: (coords: [number, number], zoom?: number) => void;
  onOpenGrants?: () => void;
}

export default function RightToolRail({ activeDrawer, onClose, onFlyToCoordinates, onOpenGrants }: RightToolRailProps) {
  const [selectedPythiaTopic, setSelectedPythiaTopic] = useState<'ICE' | 'VESSEL' | 'FAUNA' | 'OPPORTUNITIES'>('ICE');
  const [card, setCard] = useState<AnalyticalCard>(() => PythiaConsensusEngine.generateSampleCard('ICE'));
  const [scienceOppData, setScienceOppData] = useState<any>(null);
  const [loadingOpp, setLoadingOpp] = useState(false);
  const agents = PythiaConsensusEngine.getAgents();

  // Quantarctica 3 Explorer state
  const [activeLayersMap, setActiveLayersMap] = useState<Record<string, boolean>>(() => WorkspaceStore.getState().activeLayers);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [selectedScienceTheme, setSelectedScienceTheme] = useState<string>('ALL');
  const [cacheClearMsg, setCacheClearMsg] = useState<string | null>(null);

  useEffect(() => {
    return WorkspaceStore.subscribe((s) => {
      setActiveLayersMap({ ...s.activeLayers });
    });
  }, []);

  const handleToggleQuantarcticaLayer = (layerId: string) => {
    WorkspaceStore.toggleLayer(layerId);
  };

  const handleExportNpdcZip = async () => {
    setIsExporting(true);
    setExportResult(null);
    try {
      const res = await fetch('/api/quantarctica/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expedition_id: 'AMOH-NPI-2026' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setExportResult(data);
      if (data.download_url) {
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = data.filename || 'amoh_quantarctica_export.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e: any) {
      console.error('[Quantarctica Export Error]:', e);
      setExportResult({ error: e.message || 'Error al exportar paquete NPDC' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearLayerCache = async () => {
    try {
      const res = await fetch('/api/quantarctica/cache/clear', { method: 'POST' });
      if (res.ok) {
        setCacheClearMsg('Caché purgada (RAM libre).');
        setTimeout(() => setCacheClearMsg(null), 3000);
      }
    } catch (e) {
      console.warn('Error clearing cache', e);
    }
  };

  const handleSelectTopic = (t: 'ICE' | 'VESSEL' | 'FAUNA' | 'OPPORTUNITIES') => {
    setSelectedPythiaTopic(t);
    if (t === 'OPPORTUNITIES') {
      if (!scienceOppData) {
        setLoadingOpp(true);
        fetch('/api/pythia/science-opportunities?lat=-64.8&lng=-63.0')
          .then((r) => r.json())
          .then((d) => {
            setScienceOppData(d);
            setLoadingOpp(false);
          })
          .catch(() => setLoadingOpp(false));
      }
    } else {
      setCard(PythiaConsensusEngine.generateSampleCard(t));
    }
  };

  if (!activeDrawer) return null;

  return (
    <aside className="absolute top-0 right-0 h-full w-[380px] sm:w-[450px] bg-[#050e14]/95 border-l border-[#1b3543] backdrop-blur-md shadow-2xl z-[260] flex flex-col text-[#edf5f5] select-none animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="h-14 border-b border-[#1b3543] px-4 flex items-center justify-between bg-[#08151d]">
        <div className="flex items-center gap-2">
          {activeDrawer === 'PYTHIA' && <Sparkles className="w-4 h-4 text-[#00e5ff]" />}
          {activeDrawer === 'PASSPORT' && <Award className="w-4 h-4 text-[#00e676]" />}
          {activeDrawer === 'VESSELS' && <Ship className="w-4 h-4 text-[#00e5ff]" />}
          {activeDrawer === 'SATELLITES' && <Satellite className="w-4 h-4 text-[#00e5ff]" />}
          {activeDrawer === 'ICE' && <Compass className="w-4 h-4 text-[#38bdf8]" />}
          {activeDrawer === 'CAMERAS' && <Video className="w-4 h-4 text-[#e085ff]" />}
          {activeDrawer === 'SETTINGS' && <SettingsIcon className="w-4 h-4 text-[#8de8cd]" />}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            {activeDrawer === 'PYTHIA' && 'PYTHIA LIVE ANALYST (4 AGENTES)'}
            {activeDrawer === 'PASSPORT' && 'PASAPORTE CIENTÍFICO (WORLD ID)'}
            {activeDrawer === 'VESSELS' && 'FLOTA AIS POLAR EN VIVO (14)'}
            {activeDrawer === 'FISHERIES' && 'PESQUERÍAS GFW & CCAMLR'}
            {activeDrawer === 'SATELLITES' && 'SATÉLITES POLARES EN ÓRBITA (23)'}
            {activeDrawer === 'ICE' && 'CRIOSFERA & BANQUISA POLAR'}
            {activeDrawer === 'CHARTS' && 'PERFIL COLUMNA DE AGUA (ARGO)'}
            {activeDrawer === 'TOURISM' && 'IAATO RUTAS 2026–2030'}
            {activeDrawer === 'SCIENCE' && 'CATÁLOGO QUANTARCTICA 3'}
            {activeDrawer === 'NUCLEAR' && 'RADIOACTIVIDAD MARINA (MARIS)'}
            {activeDrawer === 'CAMERAS' && 'CÁMARAS DE EXPEDICIÓN POLAR'}
            {activeDrawer === 'GRANTS' && 'RADAR DE BECAS & GRANTS'}
            {activeDrawer === 'SETTINGS' && 'CONFIGURACIÓN & PROYECCIÓN'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#122b38] text-[#8aa5af] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. PYTHIA LIVE ANALYST */}
        {activeDrawer === 'PYTHIA' && (
          <div className="space-y-4">
            {/* Topic Switcher */}
            <div className="flex gap-1.5 p-1 bg-[#091b24] rounded-lg border border-[#213f4f]">
              {(['ICE', 'FAUNA', 'VESSEL', 'OPPORTUNITIES'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelectTopic(t)}
                  className={`flex-1 py-1 text-[10px] font-mono rounded font-semibold transition-all ${
                    selectedPythiaTopic === t
                      ? 'bg-[#00e5ff] text-[#050e14]'
                      : 'text-[#8aa5af] hover:text-white'
                  }`}
                >
                  {t === 'ICE' ? '🧊 Hielo' : t === 'FAUNA' ? '🐋 Fauna' : t === 'VESSEL' ? '🧭 Buques' : '🔬 Oportunidades'}
                </button>
              ))}
            </div>

            {selectedPythiaTopic === 'OPPORTUNITIES' ? (
              <div className="space-y-3 font-sans text-xs">
                {loadingOpp ? (
                  <div className="p-4 text-center text-[#8aa5af] font-mono animate-pulse">
                    Consultando motor de oportunidades científicas...
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-[#091b24] border border-[#213f4f] space-y-2">
                      <div className="flex items-center justify-between border-b border-[#1b3543] pb-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#00e5ff] uppercase">
                          MOTOR DE OPORTUNIDADES CIENTÍFICAS
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                          {scienceOppData?.scarcity_level || 'ALTA ESCASEZ DE DATOS'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#caf9f7]">
                        {scienceOppData?.oceanographic_significance || 'Zona clave de mezcla turbulenta y ventilación de masas de agua.'}
                      </p>
                      <div className="text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 p-2 rounded border border-[#f59e0b]/30">
                        <span className="font-bold">Brecha estacional: </span>
                        {scienceOppData?.seasonal_gap || 'Invierno/Transición Austral con < 4% de muestreos históricos.'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-[#8aa5af] block font-bold">
                        CANDIDATOS OBSERVACIONALES IN-SITU
                      </span>
                      {(scienceOppData?.candidate_measurements || []).map((m: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#051119] border border-[#1b3543] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">{m.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#00e5ff]/20 text-[#00e5ff]">
                              {m.priority}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8aa5af]">{m.scientific_value}</p>
                          <div className="text-[9px] font-mono text-[#58d5e3]">
                            Sensor: {m.sensor}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* MANDATORY SAFETY & TREATY GATE */}
                    <div className="p-3 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/40 text-[#fca5a5] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ef4444] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>COMPUERTA DE SEGURIDAD & PERMISOS</span>
                      </div>
                      <p className="text-[11px] font-semibold leading-relaxed">
                        {scienceOppData?.safety_and_permit_gate?.disclaimer ||
                          'SCIENTIFIC CANDIDATE — NOT A NAVIGATION INSTRUCTION. Subject to expedition leader, vessel master, safety protocols, and Antarctic Treaty / national permits.'}
                      </p>
                      <p className="text-[9px] font-mono opacity-80">
                        {scienceOppData?.safety_and_permit_gate?.treaty_compliance}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Consensus Agents & Brier Weights */}
                <div className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#00e5ff] font-bold flex justify-between">
                    <span>Ponderación de Consenso (Brier Scoring)</span>
                    <span>W_i = (1 - BS_i)²</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {agents.map((a) => (
                      <div key={a.role} className="p-2 rounded bg-[#050e14] border border-[#1b3543] text-[11px]">
                        <div className="flex items-center justify-between font-semibold">
                          <span>{a.avatar} {a.name.split(' ')[1]}</span>
                          <span className="text-[#8de8cd] font-mono">{(a.consensusWeight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-[9px] text-[#8aa5af] font-mono mt-0.5">
                          Brier: {a.historicalBrierScore}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7-Point Analytical Card */}
                <div className="p-3.5 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-3 font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-[#1b3543] pb-2">
                    <span className="text-[10px] font-mono text-[#f59e0b] font-bold uppercase">
                      TARJETA ANALÍTICA {card.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/30">
                      {card.confidenceScore}% Confianza
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#8aa5af] uppercase block">1. Qué Cambió</span>
                    <p className="font-semibold text-white mt-0.5">{card.whatChanged}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#8aa5af] uppercase block">2. Observación Directa</span>
                    <p className="text-[#d1d5db] mt-0.5">{card.directlyObserved}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#8aa5af] uppercase block">3. Por Qué Importa</span>
                    <p className="text-[#8de8cd] mt-0.5">{card.whyItMatters}</p>
                  </div>

                  <div className="p-2 rounded bg-[#050e14] border border-[#1b3543] text-[10px] font-mono">
                    <span className="text-[#00e5ff] uppercase block">4. Evidencia & Procedencia</span>
                    <span className="text-[#8aa5af]">{card.evidence.source}</span>
                    <div className="text-[9px] text-[#4ade80] mt-0.5">Estado: {card.evidence.qualityFlag}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#f87171] uppercase block">5. Incertidumbre</span>
                    <p className="text-[#d1d5db] mt-0.5">{card.uncertain}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#8aa5af] uppercase block">6. Hipótesis Alternativas</span>
                    <p className="text-[#d1d5db] mt-0.5">{card.alternatives}</p>
                  </div>

                  <div className="p-2 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30">
                    <span className="text-[10px] font-mono text-[#00e5ff] uppercase block font-bold">7. Siguiente Acción Recomendada</span>
                    <p className="text-white font-medium mt-0.5">{card.nextRecommendedAction}</p>
                  </div>

                  {card.isForecastRingSimulated && (
                    <div className="text-[10px] font-mono text-[#c084fc] flex items-center gap-1.5 pt-1">
                      <span className="w-2 h-2 rounded-full border border-[#c084fc] border-dashed animate-spin" />
                      <span>Anillos de pronóstico proyectados (Simulación MiroFish)</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. FISHERIES GFW & CCAMLR */}
        {activeDrawer === 'FISHERIES' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af]">
              Monitoreo satelital de esfuerzo pesquero aparente (GFW API v3) y verificación de licencias de la Comisión para la Conservación de los Recursos Vivos Marinos Antárticos (CCAMLR).
            </div>
            <p className="text-xs text-[#8aa5af]">No hay registros pesqueros verificados cargados.</p>
          </div>
        )}

        {/* 3. TOURISM IAATO */}
        {activeDrawer === 'TOURISM' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af]">
              Rutas de turismo antártico. Se mostrarán cuando exista un archivo con fuente, fecha y licencia verificadas.
            </div>
            <p className="text-xs text-[#8aa5af]">No hay rutas turísticas verificadas cargadas.</p>
          </div>
        )}

        {/* 4. NUCLEAR RADIOACTIVITY (MARIS) */}
        {activeDrawer === 'NUCLEAR' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded bg-[#091b24] border border-[#213f4f] text-[11px] text-[#8aa5af]">
              {HISTORICAL_NUCLEAR_CONTEXT.treatyArticleV}
            </div>
            <div className="text-[10px] font-mono text-[#00e5ff] uppercase font-bold">
              Muestras IAEA MARIS (Océano Austral)
            </div>
            <p className="text-xs text-[#8aa5af]">No hay muestras MARIS verificadas cargadas.</p>
            <div className="p-2.5 rounded bg-[#050e14] border border-[#1b3543] text-[10px] text-[#94a3b8]">
              <span className="font-bold text-white block mb-1">Memoria Histórica McMurdo PM-3A:</span>
              {HISTORICAL_NUCLEAR_CONTEXT.pm3aSummary}
            </div>
          </div>
        )}

        {/* 5. CHARTS: WATER COLUMN ARGO */}
        {activeDrawer === 'CHARTS' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af]">
              {ARGO_WATER_COLUMN_SPEC.description}
            </div>
            <div className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#00e5ff] font-bold">
                {ARGO_WATER_COLUMN_SPEC.title}
              </div>
              <div className="space-y-1.5 pt-2">
                {ARGO_WATER_COLUMN_SPEC.data.map((d) => (
                  <div key={d.timestamp} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8aa5af] w-16">{d.timestamp}</span>
                    <div className="flex-1 mx-2 h-2 rounded bg-[#050e14] overflow-hidden">
                      <div
                        className="h-full bg-[#00e5ff]"
                        style={{ width: `${Math.max(5, ((d.value || 0) + 2) * 20)}%` }}
                      />
                    </div>
                    <span className="text-white w-12 text-right">{d.value} °C</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. GRANTS RADAR */}
        {activeDrawer === 'GRANTS' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af]">
              Oportunidades de financiamiento para ciencia polar y acción de conservación marina.
            </div>
            {CURRENT_GRANTS_RADAR.map((g, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{g.name}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00e676]/20 text-[#00e676]">
                    {g.status}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#8de8cd]">
                  Cierre: {g.deadline} · Micro: {g.microGrantRange}
                </div>
                {g.multiYearRange !== 'N/A' && (
                  <div className="text-[10px] font-mono text-[#38bdf8]">
                    Multianual: {g.multiYearRange}
                  </div>
                )}
                <p className="text-[11px] text-[#94a3b8]">{g.eligibility}</p>
                <a
                  href={g.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-[#00e5ff] hover:underline pt-1"
                >
                  Bases Oficiales <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* 7. QUANTARCTICA 3 & NORWEGIAN POLAR INSTITUTE EXPLORER */}
        {activeDrawer === 'SCIENCE' && (
          <div className="space-y-4">
            {/* Header / NPI Institution Card */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#031d28] to-[#082838] border border-[#00e5ff]/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white tracking-wider">
                    NORSK POLARINSTITUTT
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                  SCAR / NPDC
                </span>
              </div>
              <p className="text-[11px] text-[#9fc1cf] leading-relaxed">
                Visualizador de capas geoespaciales y paquete reproducible Quantarctica 3.0 para la investigación polar circumpolar.
              </p>

              {/* Action Buttons: Export NPDC Package & Clear Cache */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleExportNpdcZip}
                  disabled={isExporting}
                  className="w-full py-2 px-3 rounded bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0096c7] hover:to-[#023e8a] text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Empaquetando datos NPDC...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Paquete Científico (ZIP)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8aa5af]">
                  <button
                    onClick={handleClearLayerCache}
                    className="flex items-center gap-1 text-[#38bdf8] hover:text-[#7dd3fc] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Purgar Caché RAM</span>
                  </button>
                  {cacheClearMsg && <span className="text-[#34d399]">{cacheClearMsg}</span>}
                  <span>EPSG:4326 + 3031</span>
                </div>
              </div>

              {/* Export Success Result Box */}
              {exportResult && (
                <div className={`p-2 rounded text-[10px] font-mono space-y-1 ${exportResult.error ? 'bg-red-950/60 border border-red-500/40 text-red-200' : 'bg-[#062c33] border border-[#00e5ff]/40 text-[#c8f5ff]'}`}>
                  {exportResult.error ? (
                    <div>{exportResult.error}</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 font-bold text-[#00e5ff]">
                        <Check className="w-3 h-3 text-[#00e5ff]" />
                        <span>Paquete Generado con Éxito</span>
                      </div>
                      <div className="text-[9px] text-[#8aa5af] break-all">
                        {exportResult.filename} ({(exportResult.size_bytes / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                      <div className="text-[9px] text-[#5eead4]">
                        Capas empaquetadas: {exportResult.manifest?.total_layers || 20} · Conforme ISO 19115
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Scientific Themes Filter Pills */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-[#8aa5af] uppercase tracking-wider flex items-center justify-between">
                <span>Filtrar Capas por Disciplina:</span>
                <span className="text-[#00e5ff]">{QUANTARCTICA_SCIENTIFIC_LAYERS.length} capas</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {['ALL', 'Oceanography', 'Glaciology', 'Protection', 'Governance', 'Biology', 'SeaIce', 'SocialScience', 'Bathymetry', 'Basemap'].map((thm) => (
                  <button
                    key={thm}
                    onClick={() => setSelectedScienceTheme(thm)}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                      selectedScienceTheme === thm
                        ? 'bg-[#00e5ff] text-[#03151f] font-bold shadow-sm'
                        : 'bg-[#0a202c] text-[#8aa5af] hover:text-white border border-[#1b3b4b]'
                    }`}
                  >
                    {thm}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Layer Switches */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-[#8aa5af] uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#00e5ff]" />
                <span>Capas Científicas Activas en Mapa:</span>
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {QUANTARCTICA_SCIENTIFIC_LAYERS
                  .filter((l) => selectedScienceTheme === 'ALL' || l.theme === selectedScienceTheme)
                  .map((layer) => {
                    const isChecked = !!(activeLayersMap[layer.id] || activeLayersMap[layer.backendName]);
                    return (
                      <div
                        key={layer.id}
                        onClick={() => handleToggleQuantarcticaLayer(layer.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-[#0b2838] border-[#00e5ff]/50 shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                            : 'bg-[#081822]/80 border-[#1a3342] hover:border-[#284f66] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-[#204457] text-[#00e5ff] focus:ring-0 bg-[#06141c] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`font-medium truncate ${isChecked ? 'text-white font-semibold' : 'text-[#c6dfe8]'}`}>
                              {layer.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#031d28] border border-[#1f4b5e] text-[#38bdf8] whitespace-nowrap">
                              ODS {layer.sdg}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#7d9da8] line-clamp-2 leading-relaxed">
                            {layer.description}
                          </p>
                          <div className="flex items-center justify-between text-[9px] font-mono text-[#4e7485] pt-0.5">
                            <span className="truncate">{layer.sourceInstitution}</span>
                            <span className="text-[#38bdf8] uppercase ml-1 shrink-0">{layer.geometryType}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Official Quantarctica 3 Theme Packages Summary */}
            <div className="space-y-2 pt-2 border-t border-[#1a3342]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8aa5af]">
                <span>10 TEMAS ORIGINALES QUANTARCTICA 3 (SCAR)</span>
                <span className="text-[#38bdf8]">10.8 GB</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                {QUANTARCTICA_THEMES.map((theme) => (
                  <div key={theme.id} className="p-2 rounded bg-[#091b24] border border-[#1d3b4b] text-[10px] space-y-0.5">
                    <div className="flex justify-between font-mono font-bold text-white truncate">
                      <span>{theme.icon} {theme.name}</span>
                    </div>
                    <div className="text-[9px] font-mono text-[#8de8cd] flex justify-between">
                      <span>{theme.layerCount} capas</span>
                      <span>{theme.sizeMb} MB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. SCIENTIFIC PASSPORT & WORLD ID */}
        {activeDrawer === 'PASSPORT' && (
          <div className="space-y-4">
            {/* World ID Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0a2330] to-[#041018] border border-[#00e676]/40 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#00e676]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>HUMANIDAD VERIFICADA · WORLD ID</span>
                  </div>
                  <div className="text-[10px] text-[#8aa5af] mt-0.5">Orb Proof · Criptografía ZK-SNARK</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/40">
                  ACTIVO
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#050e14] border border-[#1b3543] flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono uppercase text-[#8aa5af]">Credencial Científica</div>
                  <div className="text-xs font-mono font-bold text-white tracking-wider">NGRS-ANTA-2027-ALPHA</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono uppercase text-[#8aa5af]">Rango</div>
                  <div className="text-xs font-mono font-bold text-[#00e5ff]">Nivel 3 Polar</div>
                </div>
              </div>

              {/* Stats Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-[#091b24] border border-[#213f4f]">
                  <div className="text-[9px] font-mono text-[#8aa5af]">REPUTACIÓN</div>
                  <div className="text-sm font-bold text-white">1,420 XP</div>
                </div>
                <div className="p-2 rounded bg-[#091b24] border border-[#213f4f]">
                  <div className="text-[9px] font-mono text-[#8aa5af]">APORTES</div>
                  <div className="text-sm font-bold text-[#8de8cd]">12 Val.</div>
                </div>
                <div className="p-2 rounded bg-[#091b24] border border-[#213f4f]">
                  <div className="text-[9px] font-mono text-[#8aa5af]">SELLOS</div>
                  <div className="text-sm font-bold text-[#38bdf8]">4 / 4</div>
                </div>
              </div>

              <div className="text-[10px] text-[#94a3b8] leading-relaxed">
                Pasaporte científico soberano interoperable con WLD y tesorería científica AMOH. Los incentivos provienen de subvenciones institucionales verificadas.
              </div>
            </div>

            {/* Expedition Stamps */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold uppercase text-[#8de8cd] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Sellos de Expedición Antártica</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { title: 'Paso Drake (56°S)', desc: 'Cruce marítimo verificado por telemetría AIS', date: '2026-11-14', icon: '🧊' },
                  { title: 'Península Antártica', desc: 'Censo de bioindicadores en Isla Rey Jorge', date: '2026-12-02', icon: '🐧' },
                  { title: 'Calibración Sentinel-2', desc: 'Punto de reflectancia de albedo en nieve', date: '2027-01-18', icon: '🛰' },
                  { title: 'Perfil Argo 2000m', desc: 'Validación de columna CTD en Estrecho Bransfield', date: '2027-02-09', icon: '🌊' },
                ].map((st, i) => (
                  <div key={i} className="p-2.5 rounded bg-[#091b24] border border-[#213f4f] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{st.icon}</span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {st.title}
                          <CheckCircle2 className="w-3 h-3 text-[#00e676]" />
                        </div>
                        <div className="text-[10px] text-[#8aa5af]">{st.desc}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#8de8cd]">{st.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/passport"
                className="w-full py-2.5 px-3 rounded-lg bg-[#00e5ff] hover:bg-[#00cce6] text-[#050e14] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>VER PASAPORTE CIENTÍFICO COMPLETO</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="/contribute?expedition=NGRS-ANTA-2027"
                className="w-full py-2 px-3 rounded-lg bg-[#0c202c] hover:bg-[#122b38] border border-[#213f4f] text-[#8de8cd] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <span>REGISTRAR OBSERVACIÓN DE CAMPO</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {onOpenGrants && (
                <button
                  onClick={onOpenGrants}
                  className="w-full py-2 px-3 rounded-lg bg-[#091b24] hover:bg-[#102430] border border-[#213f4f] text-[#8aa5af] hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Explorar Radar de Becas & Fondos</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 9. POLAR AIS VESSELS FLEET */}
        {activeDrawer === 'VESSELS' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af]">
              14 Buques polares (oceanográficos, rompehielos, patrullas y expediciones IAATO) con posición AIS en tiempo real.
            </div>
            <div className="space-y-2">
              {POLAR_VESSELS_FLEET.map((v) => (
                <div key={v.mmsi} className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#102633] text-[#38bdf8] font-mono font-bold">
                        {v.flag}
                      </span>
                      <span>{v.name}</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff]">
                      {v.speed_kts} kts
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8aa5af]">
                    {v.operator} · <span className="text-[#8de8cd]">{v.vesselType}</span>
                  </div>
                  <div className="text-[11px] text-[#edf5f5]">
                    <span className="text-[#8aa5af]">Destino:</span> {v.destination}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] italic">
                    {v.status}
                  </div>
                  <div className="pt-1 flex justify-between items-center border-t border-[#1a3848]">
                    <span className="text-[9px] font-mono text-[#8aa5af]">
                      {v.lat.toFixed(2)}° S, {Math.abs(v.lng).toFixed(2)}° W
                    </span>
                    <button
                      onClick={() => onFlyToCoordinates?.([v.lng, v.lat], 6)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/30 flex items-center gap-1 transition-all"
                    >
                      <MapPin className="w-3 h-3" /> Centrar en mapa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. POLAR SATELLITES */}
        {activeDrawer === 'SATELLITES' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af]">
              23 Satélites en órbita polar sincrónica al sol y constelación láser Starlink Polar Shell monitoreando la Antártica.
            </div>
            <div className="space-y-2">
              {POLAR_SATELLITES_CONSTELLATION.map((sat) => {
                const isStarlink = sat.category === 'starlink';
                return (
                  <div key={sat.id} className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Satellite className="w-3.5 h-3.5" style={{ color: sat.color || '#00e5ff' }} />
                        {sat.name}
                      </span>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor: `${sat.color || '#00e5ff'}22`,
                          color: sat.color || '#00e5ff',
                        }}
                      >
                        {isStarlink ? 'STARLINK' : sat.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8de8cd] font-mono">
                      {sat.agency} · Alt: {sat.altitude_km} km · Swath: {sat.swath_km} km
                    </div>
                    <div className="text-[10px] text-[#8aa5af]">
                      <span className="text-white font-semibold">Sensor:</span> {sat.sensor}
                    </div>
                    <div className="text-[10px] text-[#94a3b8] italic">
                      {sat.status}
                    </div>
                    <div className="pt-1 flex justify-between items-center border-t border-[#1a3848]">
                      <span className="text-[9px] font-mono text-[#8aa5af]">
                        {sat.lat.toFixed(1)}°, {sat.lng.toFixed(1)}°
                      </span>
                      <button
                        onClick={() => onFlyToCoordinates?.([sat.lng, sat.lat], 5)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/30 flex items-center gap-1 transition-all"
                      >
                        <MapPin className="w-3 h-3" /> Centrar en mapa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 11. CRYOSPHERE & SEA ICE */}
        {activeDrawer === 'ICE' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af]">
              Monitoreo satelital de banquisa, polinias oceánicas, fracturación de plataformas glaciares y deriva de mega-icebergs.
            </div>

            {/* Iceberg A-23a */}
            <div className="p-3 rounded-lg bg-[#091b24] border border-[#38bdf8]/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-1.5">
                  🧊 Témpano Gigante A-23a
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] font-bold">
                  EN DERIVA ACTIVA
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#8de8cd]">
                Área: ~3,800 km² · Espesor: ~400 m · Masa: ~1.1 billones de tons
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                El mayor témpano del planeta, liberado de la Barrera Filchner-Ronne. Actualmente navegando el Mar de Scotia hacia Georgia del Sur impulsado por la Corriente Circumpolar Antártica.
              </p>
              <button
                onClick={() => onFlyToCoordinates?.([-42.5, -59.8], 6)}
                className="w-full text-[10px] font-mono py-1.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] hover:bg-[#38bdf8]/30 flex items-center justify-center gap-1"
              >
                <MapPin className="w-3 h-3" /> Localizar A-23a en el mapa
              </button>
            </div>

            {/* Larsen C Rift */}
            <div className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-1.5">
                  ❄ Barrera de Hielo Larsen C
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff]">
                  SAR SENTINEL-1
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#8de8cd]">
                Península Oriental · Lat: -67.5°, Lng: -62.5°
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                Zona de desprendimiento del iceberg A-68. Monitoreo interferométrico continuo de propagación de grietas y adelgazamiento basal por corrientes cálidas.
              </p>
              <button
                onClick={() => onFlyToCoordinates?.([-62.5, -67.5], 6)}
                className="w-full text-[10px] font-mono py-1.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/30 flex items-center justify-center gap-1"
              >
                <MapPin className="w-3 h-3" /> Volar a Larsen C
              </button>
            </div>

            {/* Weddell Sea Polynya */}
            <div className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-1.5">
                  🌊 Polinia Maud Rise (Mar de Weddell)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8de8cd]/20 text-[#8de8cd]">
                  VENTANA TÉRMICA
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                Apertura recurrente en el hielo marino invernal que libera calor oceánico a la atmósfera e impulsa la ventilación profunda del Océano Austral.
              </p>
              <button
                onClick={() => onFlyToCoordinates?.([2.0, -65.0], 5)}
                className="w-full text-[10px] font-mono py-1.5 rounded bg-[#8de8cd]/20 text-[#8de8cd] hover:bg-[#8de8cd]/30 flex items-center justify-center gap-1"
              >
                <MapPin className="w-3 h-3" /> Volar a Polinia Maud Rise
              </button>
            </div>
          </div>
        )}

        {/* 12. AMOH VISION & PUBLIC ANTARCTIC WEBCAMS */}
        {activeDrawer === 'CAMERAS' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af] leading-relaxed">
              Cámaras públicas autorizadas de investigación científica antártica con detección computacional de eventos visuales (hielo, fauna, buques, visibilidad).
            </div>

            {/* Ethical Notice */}
            <div className="p-2.5 rounded-lg bg-[#0c202c] border border-[#213f4f] text-[10px] text-[#8de8cd] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#35c3c8] shrink-0" />
              <span>Transmisiones públicas de observatorios y bases del Tratado Antártico. Prohibida toda vigilancia no autorizada.</span>
            </div>

            <div className="space-y-3">
              {getAntarcticWebcams().map((cam) => (
                <div key={cam.id} className="p-3 rounded-xl bg-[#091b24] border border-[#213f4f] space-y-2.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{cam.flag}</span>
                        <span>{cam.name}</span>
                      </div>
                      <div className="text-[10px] text-[#8aa5af] mt-0.5">
                        {cam.operator} · {cam.station}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#35c3c8]/20 text-[#35c3c8] font-bold shrink-0">
                      {cam.status}
                    </span>
                  </div>

                  {/* Weather snapshot */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#b7c5d8] bg-[#050e14] px-2.5 py-1.5 rounded-lg border border-[#1b3543]">
                    <span>🌡️ {cam.temperatureC} °C</span>
                    <span>💨 {cam.windSpeedKts} kts</span>
                    <span>🕒 {cam.lastUpdatedUtc}</span>
                  </div>

                  {/* Computer Vision Detections */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[9px] font-mono uppercase text-[#35c3c8] font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Eventos Visuales Detectados por Visión AMOH</span>
                    </div>
                    <div className="space-y-1">
                      {cam.detections.map((det, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-1.5 rounded bg-[#07131d] border border-[#1b3543] text-[10px] space-y-0.5"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-white text-[9px]">{det.label}</span>
                            <span className="text-[8px] font-mono px-1 rounded bg-[#72e0b5]/20 text-[#72e0b5]">
                              {det.confidence}% conf.
                            </span>
                          </div>
                          <p className="text-[9px] text-[#8faab5] leading-tight">{det.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex gap-2 border-t border-[#1a3848]">
                    <button
                      onClick={() => onFlyToCoordinates?.(cam.coordinates, 8)}
                      className="flex-1 text-[10px] font-mono py-1.5 rounded bg-[#35c3c8]/20 text-[#35c3c8] hover:bg-[#35c3c8]/30 flex items-center justify-center gap-1 transition-all"
                    >
                      <MapPin className="w-3 h-3" /> Centrar Estación
                    </button>
                    <a
                      href={cam.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 text-[10px] font-mono py-1.5 rounded bg-[#102430] hover:bg-[#153040] text-[#8faab5] hover:text-white flex items-center justify-center gap-1 transition-all border border-[#1f3947]"
                    >
                      <span>Transmisión</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13. SETTINGS & PROJECTIONS */}
        {activeDrawer === 'SETTINGS' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#8aa5af]">
              Configuración cartográfica, sistema de coordenadas, caché fuera de línea y nodo de telemetría.
            </div>

            <div className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-2">
              <div className="text-xs font-mono font-bold text-white uppercase">Proyección Cartográfica</div>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <div className="p-2 rounded bg-[#0c202c] border border-[#00e5ff]/50 flex justify-between items-center text-[#00e5ff]">
                  <span className="font-bold">Globo 3D WGS84 (MapLibre Engine)</span>
                  <span className="text-[10px] font-mono bg-[#00e5ff]/20 px-1.5 py-0.5 rounded">ACTIVO</span>
                </div>
                <div className="p-2 rounded bg-[#050e14] border border-[#1b3543] flex justify-between items-center text-[#8aa5af]">
                  <span>Polar Estereográfica Sur (EPSG:3031)</span>
                  <span className="text-[10px] font-mono">DISPONIBLE</span>
                </div>
                <div className="p-2 rounded bg-[#050e14] border border-[#1b3543] flex justify-between items-center text-[#8aa5af]">
                  <span>Web Mercator (EPSG:3857)</span>
                  <span className="text-[10px] font-mono">DISPONIBLE</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] space-y-2 text-xs">
              <div className="font-mono font-bold text-white uppercase">Nodo de Campo Local & LAN</div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-[#8aa5af]">
                  <span>IP LAN Detectada:</span>
                  <span className="text-[#8de8cd] font-bold">127.0.0.1</span>
                </div>
                <div className="flex justify-between text-[#8aa5af]">
                  <span>Puerto Interfaz Web:</span>
                  <span className="text-white">5174</span>
                </div>
                <div className="flex justify-between text-[#8aa5af]">
                  <span>Servidor FastAPI Backend:</span>
                  <span className="text-[#00e676]">Activo (:8000)</span>
                </div>
                <div className="flex justify-between text-[#8aa5af]">
                  <span>Caché Offline Mapas:</span>
                  <span className="text-[#38bdf8]">142.4 MB</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#091b24] border border-[#213f4f] text-[11px] text-[#8aa5af] leading-relaxed">
              <span className="font-bold text-white block mb-1">AMOH — World Oceans Living Observatory</span>
              Antarctic Maritime Observation Hub integrado con OSIRIS, Quantarctica 3, Global Fishing Watch y World ID.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
