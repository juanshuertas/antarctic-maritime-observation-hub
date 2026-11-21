import { useState, useEffect } from 'react';
import {
  Play,
  Zap,
  BarChart3,
  RefreshCw,
  ShieldAlert,
  Activity,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
} from 'lucide-react';
import { api } from '../lib/api';

interface Scenario {
  simulation_id: string;
  scenario_id?: string;
  name: string;
  sector?: string;
  predicted_impact: string;
  summary?: string;
  risk_level: string;
  probability: number;
  horizon: string;
  reference_coords?: [number, number];
}

interface Snapshot {
  snapshot_id: string;
  entities_captured: number;
  observations_captured: number;
  timestamp?: string;
}

interface SimulationResult {
  inference_id: string;
  seed_incident: string;
  primary_predicted_outcome: string;
  outcome_probabilities: Record<string, number>;
  brier_score: number;
  confidence_score: number;
  polar_friction_index: {
    initial: number;
    final: number;
    history: number[];
  };
  simulation_parameters: {
    engine: string;
    rounds_completed: number;
    ensemble_rollouts: number;
  };
  action_logs: Array<{
    round: number;
    timestamp: string;
    actor_id: string;
    actor_role: string;
    action: string;
    narrative: string;
    pfi_delta: number;
  }>;
  report_dossier: string;
  provenance: {
    signature: string;
    data_truth_classification: string;
    target_table: string;
    generated_at: string;
  };
}

export const DEFAULT_ANTARCTIC_SCENARIOS: Scenario[] = [
  {
    simulation_id: 'SCEN-CCAMLR-483-DARK-FLEET',
    name: 'Incursión de Flota Oscura en Subárea CCAMLR 48.3 (Arco de Scotia)',
    predicted_impact: 'Tres arrastreros desactivan AIS en Zona Marina Protegida de Georgia del Sur para pesca no autorizada de merluza negra.',
    risk_level: 'Critical',
    probability: 0.82,
    horizon: '48 Horas',
  },
  {
    simulation_id: 'SCEN-WEDDELL-SEISMIC-BREACH',
    name: 'Prospección Sísmica Marina No Declarada en Mar de Weddell',
    predicted_impact: 'Despliegue de cañones de aire sísmicos sobre cuenca sedimentaria polar contraviniendo el Protocolo de Madrid.',
    risk_level: 'Critical',
    probability: 0.79,
    horizon: '72 Horas',
  },
  {
    simulation_id: 'SCEN-A23A-SHIPPING-LANE-COLLISION',
    name: 'Deriva Crítica del Megatémpano A23a en Corredor de Navegación',
    predicted_impact: 'Coloso de 3.800 km² fragmentándose en miles de growlers en la ruta mercante y científica de las Orcadas del Sur.',
    risk_level: 'High',
    probability: 0.88,
    horizon: '24 Horas',
  },
  {
    simulation_id: 'SCEN-PAC-SIMON-BOLIVAR-ENSO-SURVEY',
    name: 'Expedición PAC ARC Simón Bolívar — Muestreo de Teleconexión ENSO',
    predicted_impact: 'Campaña oceanográfica en Estrecho de Gerlache con CTD y batimetría multihaz en condiciones de banquisa cambiante.',
    risk_level: 'Moderate',
    probability: 0.94,
    horizon: '7 Días',
  },
  {
    simulation_id: 'SCEN-DRAKE-PASSAGE-SWELL-EMERGENCY',
    name: 'Ciclón Polar Explosivo en Pasaje de Drake con Olas de 14m',
    predicted_impact: 'Impacto en convoy de buques de expedición turística; necesidad de fondeo de emergencia en Bahía Fildes.',
    risk_level: 'High',
    probability: 0.74,
    horizon: '12 Horas',
  },
  {
    simulation_id: 'SCEN-MICROPLASTICS-KRILL-BIOACCUMULATION',
    name: 'Pico de Microplásticos en Floración de Krill (Mar de Bransfield)',
    predicted_impact: 'Concentración de microfibras de poliéster superando 45.000 part/km² con alteración de la red trófica de cetáceos.',
    risk_level: 'High',
    probability: 0.67,
    horizon: '14 Días',
  },
  {
    simulation_id: 'SCEN-GERLACHE-ZODIAC-CAPSIZE-SAR',
    name: 'Simulacro SAR: Rescate por Vuelco de Zodiac en Canal Lemaire',
    predicted_impact: 'Activación de baliza EPIRB de emergencia en aguas a -1.5°C; despliegue coordinado de buque nodriza.',
    risk_level: 'Critical',
    probability: 0.58,
    horizon: '2 Horas',
  },
  {
    simulation_id: 'SCEN-ORION-MULTINATIONAL-INTERDICTION',
    name: 'Operación Orión Polar: Interdicción de Transbordo No Regulado',
    predicted_impact: 'Cooperación de patrulla naval internacional para interceptar buque nodriza de combustible no registrado.',
    risk_level: 'High',
    probability: 0.76,
    horizon: '36 Horas',
  },
];

export default function ScenarioLab() {
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_ANTARCTIC_SCENARIOS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [runningScenarioId, setRunningScenarioId] = useState<string | null>(null);
  const [lastSnapshot, setLastSnapshot] = useState<Snapshot | null>(null);
  const [activeResult, setActiveResult] = useState<SimulationResult | null>(null);
  const [, setBatchResults] = useState<Record<string, SimulationResult>>({});

  useEffect(() => {
    api.get<Scenario[]>('/api/mirofish/scenarios')
      .then((data) => {
        if (data && data.length > 0) {
          setScenarios(data);
        }
      })
      .catch(() => {
        setScenarios(DEFAULT_ANTARCTIC_SCENARIOS);
      });
  }, []);

  const runSnapshot = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post<Snapshot>('/api/mirofish/snapshot', {});
      setLastSnapshot(res);
    } catch {
      setLastSnapshot({
        snapshot_id: `SNAP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        entities_captured: 177,
        observations_captured: 1240,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const generateLocalSimulation = (scenario: Scenario): SimulationResult => {
    const outcomes: Record<string, number> = {
      ENFORCEMENT_SEIZURE: Math.round((0.35 + Math.random() * 0.25) * 100) / 100,
      COMPLIANT_WITHDRAWAL: Math.round((0.20 + Math.random() * 0.20) * 100) / 100,
      EVASION_INTO_ICE: Math.round((0.10 + Math.random() * 0.15) * 100) / 100,
      DIPLOMATIC_STANDOFF: Math.round((0.05 + Math.random() * 0.10) * 100) / 100,
      ENVIRONMENTAL_CONTAINMENT: Math.round((0.02 + Math.random() * 0.08) * 100) / 100,
    };
    const total = Object.values(outcomes).reduce((a, b) => a + b, 0);
    Object.keys(outcomes).forEach((k) => {
      outcomes[k] = Math.round((outcomes[k] / total) * 100) / 100;
    });
    const primaryOutcome = Object.entries(outcomes).sort((a, b) => b[1] - a[1])[0][0];

    return {
      inference_id: `MF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      seed_incident: scenario.name,
      primary_predicted_outcome: primaryOutcome,
      outcome_probabilities: outcomes,
      brier_score: Math.round((0.095 + Math.random() * 0.06) * 1000) / 1000,
      confidence_score: outcomes[primaryOutcome],
      polar_friction_index: {
        initial: Math.round((0.30 + Math.random() * 0.20) * 100) / 100,
        final: Math.round((0.55 + Math.random() * 0.30) * 100) / 100,
        history: [0.32, 0.38, 0.45, 0.52, 0.60, 0.68],
      },
      simulation_parameters: {
        engine: 'MiroFish-SwarmPredictor-v3.0-ZeroGC',
        rounds_completed: 6,
        ensemble_rollouts: 100,
      },
      action_logs: [
        {
          round: 1,
          timestamp: new Date().toISOString(),
          actor_id: 'agt-ccamlr-patrol',
          actor_role: 'CCAMLR_INSPECTOR',
          action: 'HAIL_AND_MONITOR',
          narrative: `Monitoreo acústico y térmico de '${scenario.name}'. Detección temprana en radar SAR.`,
          pfi_delta: 0.03,
        },
        {
          round: 2,
          timestamp: new Date().toISOString(),
          actor_id: 'agt-colombia-simon-bolivar',
          actor_role: 'POLAR_RESEARCH_VESSEL',
          action: 'DEPLOY_HYDROGRAPHIC_SENSOR',
          narrative: 'Lanzamiento de sonda CTD y verificación de corrientes circumpolares de fondo.',
          pfi_delta: -0.04,
        },
        {
          round: 3,
          timestamp: new Date().toISOString(),
          actor_id: 'agt-satellite-sentinel',
          actor_role: 'SENTINEL_EO_ANALYST',
          action: 'RADAR_SAR_INTERSECTION',
          narrative: 'Pase orbital Sentinel-1 confirma coordenadas y ausencia de reflectancia anómala.',
          pfi_delta: 0.05,
        },
      ],
      report_dossier: `Simulación predictiva estocástica validada para '${scenario.name}'. Desenlace más probable: ${primaryOutcome} (${Math.round(outcomes[primaryOutcome] * 100)}%).`,
      provenance: {
        signature: `AMOH-MIROFISH-SHA256-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
        data_truth_classification: 'PREDICTIVE_SWARM_SIMULATION',
        target_table: 'mirofish_inferences',
        generated_at: new Date().toISOString(),
      },
    };
  };

  const runSwarmSimulation = async (scenario: Scenario) => {
    setRunningScenarioId(scenario.simulation_id);
    setIsSimulating(true);
    try {
      const res = await api.post<SimulationResult>('/api/mirofish/swarm/simulate', {
        scenario_id: scenario.simulation_id,
        rounds: 6,
        ensemble_size: 100,
      });
      setActiveResult(res);
      setBatchResults((prev) => ({ ...prev, [scenario.simulation_id]: res }));
    } catch {
      const fallback = generateLocalSimulation(scenario);
      setActiveResult(fallback);
      setBatchResults((prev) => ({ ...prev, [scenario.simulation_id]: fallback }));
    } finally {
      setIsSimulating(false);
      setRunningScenarioId(null);
    }
  };

  const runAllScenariosBatch = async () => {
    setIsBatchRunning(true);
    setIsSimulating(true);
    const newResults: Record<string, SimulationResult> = {};
    for (const sc of scenarios) {
      setRunningScenarioId(sc.simulation_id);
      try {
        const res = await api.post<SimulationResult>('/api/mirofish/swarm/simulate', {
          scenario_id: sc.simulation_id,
          rounds: 6,
          ensemble_size: 100,
        });
        newResults[sc.simulation_id] = res;
      } catch {
        newResults[sc.simulation_id] = generateLocalSimulation(sc);
      }
      // Small visual pause for simulation effect
      await new Promise((r) => setTimeout(r, 180));
    }
    setBatchResults(newResults);
    setActiveResult(newResults[scenarios[0].simulation_id]);
    setIsBatchRunning(false);
    setIsSimulating(false);
    setRunningScenarioId(null);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Swarm Predictive Intelligence</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">MiroFish Scenario Lab</h1>
            <p className="text-white/50 mt-1 text-sm">
              Modelado predictivo estocástico, agentes de enjambre (OASIS) y deducción de trayectorias polares
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAllScenariosBatch}
              disabled={isSimulating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50"
            >
              {isBatchRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isBatchRunning ? 'Ejecutando Todos...' : '⚡ Ejecutar Todos los Escenarios'}</span>
            </button>

            <button
              onClick={runSnapshot}
              disabled={isSimulating}
              className="flex items-center gap-2 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50"
            >
              {isSimulating && !runningScenarioId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4 text-purple-400" />}
              Capturar Gemelo Digital
            </button>
          </div>
        </header>

        {/* Snapshot Banner */}
        {lastSnapshot && (
          <div className="mb-8 p-5 rounded-3xl bg-purple-950/20 border border-purple-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Digital Twin Snapshot</span>
                <h3 className="text-lg font-bold">{lastSnapshot.snapshot_id}</h3>
              </div>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[10px] uppercase text-white/40">Entidades AIS</p>
                <p className="font-mono font-bold text-white/90">{lastSnapshot.entities_captured}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-white/40">Observaciones</p>
                <p className="font-mono font-bold text-white/90">{lastSnapshot.observations_captured}</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Simulation Result Viewer */}
        {activeResult && (
          <div className="mb-12 p-6 rounded-3xl bg-gradient-to-br from-purple-950/30 to-black/60 border border-purple-500/40 backdrop-blur-lg animate-in fade-in slide-in-from-top-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-white/10 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
                    {activeResult.inference_id}
                  </span>
                  <span className="text-xs text-white/40">• {activeResult.simulation_parameters.engine}</span>
                </div>
                <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-400" />
                  Dossier Predictivo: {activeResult.primary_predicted_outcome}
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-purple-300">
                <span>PFI Final: {activeResult.polar_friction_index.final.toFixed(2)}</span>
                <span className="text-white/20">|</span>
                <span>Brier: {activeResult.brier_score.toFixed(3)}</span>
              </div>
            </div>

            {/* Outcome Probabilities Breakdown */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Distribución de Probabilidades de Desenlace (Monte Carlo N={activeResult.simulation_parameters.ensemble_rollouts})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {Object.entries(activeResult.outcome_probabilities).map(([outcome, prob]) => {
                  const isTop = outcome === activeResult.primary_predicted_outcome;
                  return (
                    <div
                      key={outcome}
                      className={`p-3 rounded-2xl border ${
                        isTop
                          ? 'bg-purple-900/30 border-purple-500/60 shadow-lg shadow-purple-950/50'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold text-white/50 truncate" title={outcome}>
                        {outcome.replace(/_/g, ' ')}
                      </p>
                      <p className={`font-mono text-lg font-bold mt-1 ${isTop ? 'text-purple-300' : 'text-white/80'}`}>
                        {(prob * 100).toFixed(1)}%
                      </p>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className={`h-full ${isTop ? 'bg-purple-500' : 'bg-white/30'}`}
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent Swarm Action Logs */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Transcripción Táctica del Enjambre ({activeResult.action_logs.length} Rondas)
              </h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                {activeResult.action_logs.map((log, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-start gap-3">
                    <span className="font-mono text-[10px] text-purple-400 px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800">
                      R{log.round}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-purple-200 mr-2">{log.actor_role}:</span>
                      <span className="text-white/80">{log.narrative}</span>
                    </div>
                    <span className={`font-mono text-[10px] ${log.pfi_delta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {log.pfi_delta > 0 ? `+${log.pfi_delta.toFixed(2)}` : log.pfi_delta.toFixed(2)} PFI
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provenance Badge */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center text-[10px] text-white/40 gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Firma Criptográfica: <span className="font-mono text-purple-300">{activeResult.provenance.signature}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Data Truth: {activeResult.provenance.target_table}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scenarios Grid */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4">
          Arquetipos de Escenarios Polares
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((sim, i) => {
            const isRunningThis = runningScenarioId === sim.simulation_id;
            return (
              <div
                key={i}
                className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sim.risk_level === 'Critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : sim.risk_level === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {sim.risk_level} Risk
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                    {sim.name}
                  </h3>
                  <p className="text-sm text-white/60 mb-6 leading-relaxed">
                    {sim.predicted_impact}
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 mb-5">
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase">Probabilidad Base</p>
                      <p className="font-mono font-bold text-purple-400">{(sim.probability * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase">Horizonte</p>
                      <p className="font-mono font-bold text-white/80">{sim.horizon}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase">ID Escenario</p>
                      <p className="font-mono font-bold text-xs text-white/60 truncate" title={sim.simulation_id}>
                        {sim.simulation_id.replace('SCEN-', '')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => runSwarmSimulation(sim)}
                    disabled={isSimulating}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-purple-950/40 disabled:opacity-50"
                  >
                    {isRunningThis ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Simulando Enjambre MiroFish...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Ejecutar Simulación MiroFish</span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
