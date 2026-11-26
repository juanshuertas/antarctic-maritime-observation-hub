import { useState, useEffect } from 'react';
import {
  Network,
  Bot,
  Sparkles,
  ShieldCheck,
  X,
  ArrowRight,
  Cpu,
} from 'lucide-react';

interface AgentMeshModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteMapAction?: (action: string, param?: string) => void;
  currentSector?: string;
  activeLayers?: string[];
}

interface MeshAgent {
  id: string;
  name: string;
  role: string;
  status: string;
  port: number;
  domain?: string;
}

interface SpecialistRole {
  number: number;
  id: string;
  name: string;
  type: string;
  category: string;
  focus?: string[];
  priority?: string;
  runtime?: string;
  real_person_participation?: boolean;
}

interface PythiaResponse {
  analysis_id: string;
  question: string;
  synthesized_response: string;
  consulted_mesh_agents: MeshAgent[];
  consulted_specialists?: SpecialistRole[];
  specialist_runtime?: string;
  evidence_contract: {
    evidence_ids: string[];
    sources: string[];
    observed_time: string;
    retrieved_time: string;
    model: string;
    uncertainty: string;
    limitations: string;
    human_review_state: string;
  };
  suggested_actions: Array<{ action: string; layer_id?: string; sector_id?: string; label: string }>;
}

const DEFAULT_MESH_AGENTS: MeshAgent[] = [
  { id: 'agent-ocean-dynamics', name: 'Ocean Dynamics & Currents Agent', role: 'Copernicus CMEMS circulation, eddies & ACC fronts', domain: 'Oceanography', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-cryosphere', name: 'Sea Ice & Cryosphere Agent', role: 'OSI-SAF / NSIDC concentration, thickness & drift', domain: 'Cryosphere', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-fisheries', name: 'Southern Ocean Fisheries Agent', role: 'GFW 4Wings apparent fishing effort & CCAMLR compliance', domain: 'Fisheries', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-biodiversity', name: 'Polar Marine Biodiversity Agent', role: 'OBIS / GBIF taxa occurrences, benthic & pelagic fauna', domain: 'Biodiversity', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-maritime-traffic', name: 'AIS & Maritime Traffic Agent', role: 'Live circumpolar AIS tracking, spoofing detection & dead reckoning', domain: 'Maritime', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-polar-aviation', name: 'Antarctic Aviation & Airspace Agent', role: 'OpenSky Network polar flight corridors & logistic airbridges', domain: 'Aviation', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-satellite-tracking', name: 'Satellite & Space Situational Awareness Agent', role: 'CelesTrak SGP4 orbit propagation & polar footprint coverage', domain: 'Space', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-seismology', name: 'Seismology & Tectonics Agent', role: 'USGS global earthquake feed & Scotia Arc subduction dynamics', domain: 'Geophysics', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-antarctic-governance', name: 'Antarctic Treaty & ASPA Governance Agent', role: 'Secretariat of the Antarctic Treaty ASPA/ASMA legal boundaries', domain: 'Governance', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-expeditions-stations', name: 'Scientific Expeditions & Stations Agent', role: 'COMNAP national Antarctic programs & permanent year-round bases', domain: 'Operations', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-polar-tourism', name: 'Tourism & IAATO Monitoring Agent', role: 'IAATO expedition cruise routing, landing sites & passenger volumes', domain: 'Tourism', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-meteorology', name: 'Atmospheric & Meteorology Agent', role: 'ECMWF Integrated Forecasting System polar surface winds & pressure', domain: 'Meteorology', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-submarine-infra', name: 'Submarine Infrastructure & Comms Agent', role: 'TeleGeography fiber cables & SMART polar sensor repeaters', domain: 'Infrastructure', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-greyzone-defense', name: 'Polar Grey Zone & Strategic Defense Agent', role: 'Dual-use surveillance, Madrid Protocol Art. 7 violations & AIS dark fleet tracking', domain: 'Defense & Security', status: 'NO VERIFICADO', port: 8000 },
  { id: 'agent-data-truth-auditor', name: 'Provenance & Feature Coherence Auditor', role: 'Continuous cross-provider validation, truth level certification & audit hash generation', domain: 'Auditing', status: 'NO VERIFICADO', port: 8000 },
];

export default function AgentMeshModal({
  isOpen,
  onClose,
  onExecuteMapAction,
  currentSector = 'Weddell Sea Sector',
  activeLayers = [],
}: AgentMeshModalProps) {
  const [agents, setAgents] = useState<MeshAgent[]>(DEFAULT_MESH_AGENTS);
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [pythiaResult, setPythiaResult] = useState<PythiaResponse | null>(null);

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
    const base = import.meta.env.VITE_API_URL || window.location.origin;
    fetch(new URL('/api/v8_2/agent-mesh/agents', base))
      .then((res) => { if (!res.ok) throw new Error('Backend Pythia no disponible'); return res.json(); })
      .then((data) => {
        if (Array.isArray(data)) { setAgents(data); setConnectionError(null); }
        else setConnectionError('El backend Pythia no devolvió una lista válida de agentes.');
      })
      .catch(() => setConnectionError('Pythia no está conectado a un backend público.'));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAskPythia = (qText?: string) => {
    const q = qText || queryInput;
    if (!q.trim()) return;

    setIsLoading(true);
    setConnectionError(null);
    setPythiaResult(null);
    const base = import.meta.env.VITE_API_URL || window.location.origin;
    fetch(new URL('/api/v8_2/agent-mesh/query', base), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: q,
        context: {
          selected_sector: currentSector,
          active_layers: activeLayers,
        },
      }),
    })
      .then((res) => { if (!res.ok) throw new Error('Pythia no disponible'); return res.json(); })
      .then((data) => {
        if (data?.synthesized_response) setPythiaResult(data);
        else setConnectionError('Pythia devolvió una respuesta inválida.');
      })
      .catch(() => setConnectionError('No se pudo consultar Pythia. Requiere un backend conectado.'))
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      role="dialog"
      aria-label="Malla de Agentes Locales y Enrutador Contextual Pythia"
      className="fixed inset-0 z-[270] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="bg-[#05131f] border border-[#1f3947] rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl overflow-hidden text-[#edf5f5] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1f3947] bg-[#030c14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c084fc]/20 border border-[#c084fc]/40 flex items-center justify-center text-[#c084fc]">
              <Network className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Malla de Agentes Locales & Pythia Everywhere</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/30">
                  {connectionError ? 'SIN CONEXIÓN' : 'ESTADO POR VERIFICAR'}
                </span>
              </h2>
              <p className="text-[11px] font-mono text-[#8faab5]">
                Catálogo de especialistas · Estado sujeto a verificación del backend
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

        {/* Query Input */}
        <div className="p-4 bg-[#081a28] border-b border-[#162f40] space-y-2">
          {connectionError && <p role="status" className="text-xs text-amber-200">{connectionError}</p>}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Pregunta a Pythia (ej: '¿Qué buques operan en el Mar de Weddell y cuál es su esfuerzo?')..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskPythia()}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#040e16] border border-[#1e3e54] text-xs text-white placeholder-[#5d7d90] outline-none focus:border-[#00e5ff]"
            />
            <button
              onClick={() => handleAskPythia()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#00e5ff] hover:bg-[#33ebff] text-black font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Consultando...' : 'Consultar'}</span>
            </button>
          </div>

          {/* Preset Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1">
            <span className="text-[#8faab5] font-mono text-[10px]">Sugerencias:</span>
            {[
              '¿Qué esfuerzo pesquero se observa?',
              'Explicar condiciones oceanográficas y corrientes',
              'Verificar procedencia de estaciones científicas',
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setQueryInput(p);
                  handleAskPythia(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0c2333] hover:bg-[#13354c] text-[#8faab5] hover:text-white truncate max-w-[220px] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {pythiaResult ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Synthesized Response */}
              <div className="p-4 rounded-xl border border-[#00e5ff]/30 bg-[#071d2b] space-y-3">
                <div className="flex items-center justify-between border-b border-[#14344a] pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00e5ff]" />
                    <span className="text-xs font-bold text-white">
                      Síntesis Multi-Agente Pythia ({pythiaResult.analysis_id})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff]">
                    EVIDENCE CONTRACT BOUND
                  </span>
                </div>

                <p className="text-xs text-[#cadde6] whitespace-pre-line leading-relaxed">
                  {pythiaResult.synthesized_response}
                </p>

                {/* Consulted Agents */}
                <div className="pt-2 border-t border-[#14344a] space-y-1.5">
                  <div className="text-[10px] font-mono text-[#8faab5] uppercase">
                    Agentes Especialistas Consultados en Malla Local:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pythiaResult.consulted_mesh_agents.map((ag) => (
                      <span
                        key={ag.id}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b283b] text-[#38bdf8] border border-[#1b435f] flex items-center gap-1"
                      >
                        <Bot className="w-3 h-3 text-[#00e5ff]" />
                        <span>{ag.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pythia Specialist Lenses */}
                {pythiaResult.consulted_specialists &&
                  pythiaResult.consulted_specialists.length > 0 && (
                  <div className="pt-2 border-t border-[#14344a] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[10px] font-mono text-[#c084fc] uppercase">
                        Pythia Specialist Lenses:
                      </div>
                      <div className="text-[9px] font-mono text-[#708c9b]">
                        {pythiaResult.consulted_specialists.length} / 56 seleccionados
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {pythiaResult.consulted_specialists.map((role) => (
                        <span
                          key={role.id}
                          title={role.focus?.join(' · ')}
                          className="text-[10px] font-mono px-2 py-1 rounded bg-[#1a1230] text-[#d8b4fe] border border-[#6d3ba3]/50 flex items-center gap-1.5"
                        >
                          <Bot className="w-3 h-3 text-[#c084fc]" />
                          <span>{role.name}</span>
                          <span className="text-[8px] text-[#9f7aea]">
                            {role.type === 'named_lens'
                              ? 'LENTE SIMULADO'
                              : role.category}
                          </span>
                        </span>
                      ))}
                    </div>

                    {pythiaResult.consulted_specialists.some(
                      (role) => role.type === 'named_lens'
                    ) && (
                      <div className="text-[9px] leading-relaxed text-[#718b99] border-l-2 border-[#6d3ba3] pl-2">
                        Los nombres personales se utilizan únicamente como lentes
                        analíticos simulados. No implican participación, aval,
                        revisión, aprobación ni autoría real de estas personas.
                      </div>
                    )}
                  </div>
                )}

                {/* Evidence Contract Box */}
                <div className="p-3 rounded-lg bg-[#040e16] border border-[#142d3d] space-y-1.5 text-[11px] font-mono text-[#8faab5]">
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00e676]" />
                    <span>Contrato de Evidencia Científica</span>
                  </div>
                  <div><span className="text-[#cadde6]">Fuentes:</span> {pythiaResult.evidence_contract.sources.join(', ')}</div>
                  <div><span className="text-[#cadde6]">Incertidumbre:</span> {pythiaResult.evidence_contract.uncertainty}</div>
                  <div><span className="text-[#cadde6]">Limitaciones:</span> {pythiaResult.evidence_contract.limitations}</div>
                  <div><span className="text-[#cadde6]">Estado:</span> {pythiaResult.evidence_contract.human_review_state}</div>
                </div>

                {/* Suggested Map Actions */}
                {pythiaResult.suggested_actions && pythiaResult.suggested_actions.length > 0 && (
                  <div className="pt-2 border-t border-[#14344a] space-y-2">
                    <div className="text-[10px] font-mono text-[#8faab5] uppercase">
                      Acciones Cartográficas Sugeridas (Requiere Confirmación):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pythiaResult.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (act.action === 'TOGGLE_LAYER' && act.layer_id) {
                              onExecuteMapAction?.('TOGGLE_LAYER', act.layer_id);
                            } else if (act.action === 'FLY_TO_SECTOR' && act.sector_id) {
                              onExecuteMapAction?.('FLY_TO_SECTOR', act.sector_id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0e2c40] hover:bg-[#00e5ff] hover:text-black text-[#00e5ff] border border-[#00e5ff]/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Mesh Overview */
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#cadde6]">
                Especialistas configurados · el estado se consulta al backend:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {agents.map((ag) => (
                  <div
                    key={ag.id}
                    className="p-3 rounded-xl border border-[#142e3f] bg-[#071824] flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#112a3d] flex items-center justify-center text-[#00e5ff]">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{ag.name}</div>
                      <div className="text-[10px] text-[#8faab5] truncate">{ag.role}</div>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1c3540] text-[#a8c5d2] border border-[#365565]">
                      {ag.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#030c14] border-t border-[#1f3947] flex items-center justify-between text-[11px] font-mono text-[#8faab5]">
          <span>Pythia · Verificar conexión y fuentes antes de usar resultados</span>
          <span>Contexto Actual: {currentSector}</span>
        </div>
      </div>
    </div>
  );
}
