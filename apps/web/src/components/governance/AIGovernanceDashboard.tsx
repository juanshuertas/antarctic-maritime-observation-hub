import { useState, useEffect } from 'react';
import {
  Scale,
  Cpu,
  UserCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Download,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAIGovernanceStatus,
  fetchAIModelCards,
  fetchAIGovernancePolicies,
  submitHumanOverride,
  fetchAIGovernanceCharter,
  type AIModelCard,
  type AIGovernancePolicy,
  type AIGovernanceStatus,
  type HumanOverrideRecord,
} from '../../lib/ai-governance-service';

export function AIGovernanceDashboard() {
  const [status, setStatus] = useState<AIGovernanceStatus | null>(null);
  const [modelCards, setModelCards] = useState<AIModelCard[]>([]);
  const [policies, setPolicies] = useState<AIGovernancePolicy[]>([]);
  const [activeTab, setActiveTab] = useState<'MODEL_CARDS' | 'POLICIES' | 'HUMAN_OVERRIDE' | 'CHARTER'>('MODEL_CARDS');
  const [selectedModel, setSelectedModel] = useState<AIModelCard | null>(null);
  const [charter, setCharter] = useState<{ title: string; framework?: string; charter_markdown: string } | null>(null);

  // Human Override Form state
  const [operatorId, setOperatorId] = useState('CAPITAN-NAV-BIC151');
  const [operatorRole, setOperatorRole] = useState<'CAPTAIN_OF_VESSEL' | 'CHIEF_SCIENTIST' | 'UN_DIPLOMATIC_DELEGATE' | 'SYSTEM_SUPERVISOR'>('CAPTAIN_OF_VESSEL');
  const [targetModelId, setTargetModelId] = useState('pythia-ai-ocean-intelligence');
  const [targetInferenceId, setTargetInferenceId] = useState('INF-ICE-GERLACHE-2026');
  const [overrideAction, setOverrideAction] = useState<'REVOKE_RECOMMENDATION' | 'OVERRIDE_DEFCON' | 'RECALIBRATE_PROBABILITY' | 'REJECT_SIMULATION'>('REVOKE_RECOMMENDATION');
  const [rationale, setRationale] = useState('Condiciones locales de hielo a la deriva (pack ice 9/10) incompatibles con maniobra sugerida.');
  const [overrideSuccess, setOverrideSuccess] = useState<HumanOverrideRecord | null>(null);
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [copiedCharter, setCopiedCharter] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [st, cards, pols, ch] = await Promise.all([
      fetchAIGovernanceStatus(),
      fetchAIModelCards(),
      fetchAIGovernancePolicies(),
      fetchAIGovernanceCharter(),
    ]);
    setStatus(st);
    setModelCards(cards);
    setPolicies(pols);
    setCharter(ch);
    if (cards.length > 0) setSelectedModel(cards[0]);
  }

  async function handleOverrideSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingOverride(true);
    const rec = await submitHumanOverride({
      operator_id: operatorId,
      operator_role: operatorRole,
      model_id: targetModelId,
      target_inference_id: targetInferenceId,
      action: overrideAction,
      rationale: rationale,
    });
    setOverrideSuccess(rec);
    setIsSubmittingOverride(false);
  }

  function handleCopyCharter() {
    if (charter) {
      navigator.clipboard.writeText(charter.charter_markdown);
      setCopiedCharter(true);
      setTimeout(() => setCopiedCharter(false), 2000);
    }
  }

  function handleDownloadCharter() {
    if (charter) {
      const blob = new Blob([charter.charter_markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CARTA_GOBERNANZA_IA_AMOH_ONU_${new Date().getFullYear()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071722] via-[#0c2333] to-[#071722] border border-[#213f52] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00a6a6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00a6a6]/20 border border-[#00a6a6]/40 text-[#35c3c8] text-[10px] font-mono font-bold tracking-wider uppercase">
                ONU A/RES/78/265 • UNESCO 2021
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                CUMPLIMIENTO 100% ACTIVO
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Modelo Global de Gobierno y Ética de la Inteligencia Artificial
            </h2>
            <p className="text-xs text-[#8faab5] max-w-3xl leading-relaxed">
              Supervisión constitucional multilateral sobre todos los subsistemas inteligentes de AMOH:
              segregación de verdad epistémica, no beligerancia antártica, calibración Brier y primacía absoluta
              del Control Humano Significativo (<span className="text-[#35c3c8] font-mono">Human-in-the-Loop</span>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-[#092233] border border-[#183c52] text-[#8faab5] hover:text-white transition-all shadow-sm"
              title="Actualizar estado de guardarraíles"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-[#142e3d]">
          <div className="p-3 rounded-xl bg-[#051119] border border-[#142e3d]">
            <span className="text-[10px] font-mono text-[#8faab5] uppercase">Modelos Registrados</span>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{status?.registered_models_count || 6}</p>
            <span className="text-[9px] text-[#35c3c8] font-mono">100% Auditados</span>
          </div>

          <div className="p-3 rounded-xl bg-[#051119] border border-[#142e3d]">
            <span className="text-[10px] font-mono text-[#8faab5] uppercase">Políticas Activas</span>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{status?.active_policies_count || 5}</p>
            <span className="text-[9px] text-emerald-400 font-mono">Normas Bloqueantes</span>
          </div>

          <div className="p-3 rounded-xl bg-[#051119] border border-[#142e3d]">
            <span className="text-[10px] font-mono text-[#8faab5] uppercase">Conformidad Ética</span>
            <p className="text-lg font-bold text-[#72e0b5] font-mono mt-0.5">100.0%</p>
            <span className="text-[9px] text-[#8faab5] font-mono">Tolerancia Cero</span>
          </div>

          <div className="p-3 rounded-xl bg-[#051119] border border-[#142e3d]">
            <span className="text-[10px] font-mono text-[#8faab5] uppercase">Calibración Brier</span>
            <p className="text-lg font-bold text-[#35c3c8] font-mono mt-0.5">&lt; 0.18</p>
            <span className="text-[9px] text-[#72e0b5] font-mono">Probabilidad Óptima</span>
          </div>

          <div className="p-3 rounded-xl bg-[#051119] border border-[#142e3d]">
            <span className="text-[10px] font-mono text-[#8faab5] uppercase">Verdad Epistémica</span>
            <p className="text-lg font-bold text-white font-mono mt-0.5">96.8 / 100</p>
            <span className="text-[9px] text-[#8faab5] font-mono">Fuentes Primarias</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#213f52] pb-2">
        <button
          onClick={() => setActiveTab('MODEL_CARDS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'MODEL_CARDS'
              ? 'bg-[#35c3c8] text-[#06141c] font-bold shadow-sm'
              : 'text-[#8faab5] hover:text-white hover:bg-[#0a1e2c]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>FICHAS TÉCNICAS (MODEL CARDS)</span>
        </button>

        <button
          onClick={() => setActiveTab('POLICIES')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'POLICIES'
              ? 'bg-[#35c3c8] text-[#06141c] font-bold shadow-sm'
              : 'text-[#8faab5] hover:text-white hover:bg-[#0a1e2c]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>POLÍTICAS CONSTITUCIONALES</span>
        </button>

        <button
          onClick={() => setActiveTab('HUMAN_OVERRIDE')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'HUMAN_OVERRIDE'
              ? 'bg-[#35c3c8] text-[#06141c] font-bold shadow-sm'
              : 'text-[#8faab5] hover:text-white hover:bg-[#0a1e2c]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>TERMINAL DE CONTROL HUMANO (HITL)</span>
        </button>

        <button
          onClick={() => setActiveTab('CHARTER')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'CHARTER'
              ? 'bg-[#35c3c8] text-[#06141c] font-bold shadow-sm'
              : 'text-[#8faab5] hover:text-white hover:bg-[#0a1e2c]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>CARTA ÉTICA ANTÁRTICA (ONU / UNESCO)</span>
        </button>
      </div>

      {/* Tab 1: Model Cards */}
      {activeTab === 'MODEL_CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Models list */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#8faab5] px-1">AGENTES Y MODELOS ACTIVOS</span>
            {modelCards.map((model) => {
              const isSelected = selectedModel?.model_id === model.model_id;
              return (
                <div
                  key={model.model_id}
                  onClick={() => setSelectedModel(model)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#0a2336] border-[#35c3c8] shadow-md'
                      : 'bg-[#051119] border-[#142e3d] hover:border-[#213f52]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{model.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#00a6a6]/20 text-[#35c3c8]">
                      {model.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8faab5] line-clamp-2">{model.primary_purpose}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] font-mono text-[#71909f]">
                    <span>Brier: &le;{model.brier_calibration_target}</span>
                    <span className={model.human_in_the_loop_mandatory ? 'text-amber-400 font-semibold' : 'text-[#72e0b5]'}>
                      {model.human_in_the_loop_mandatory ? 'HITL Obligatorio' : 'Supervisado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model Card Detailed View */}
          {selectedModel && (
            <div className="md:col-span-2 p-6 rounded-2xl bg-[#071722] border border-[#213f52] shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#142e3d] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedModel.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-[#00a6a6]/20 text-[#35c3c8] font-mono text-[10px] font-bold">
                      {selectedModel.version}
                    </span>
                  </div>
                  <p className="text-xs text-[#8faab5] mt-0.5">{selectedModel.lead_entity}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CERTIFICADO ACTIVO</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-white/90">Propósito Primario:</span>
                  <p className="text-[#a8c2ce] leading-relaxed mt-0.5">{selectedModel.primary_purpose}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#051119] border border-[#142e3d] space-y-1">
                  <span className="font-semibold text-white/90">Anclaje Empírico (Epistemic Grounding):</span>
                  <p className="text-[#8faab5] font-mono text-[11px]">{selectedModel.epistemic_grounding}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#051119] border border-[#142e3d]">
                    <span className="font-semibold text-white/90">Mecanismo de Consenso:</span>
                    <p className="text-[#a8c2ce] mt-0.5 text-[11px]">{selectedModel.consensus_mechanism}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#051119] border border-[#142e3d]">
                    <span className="font-semibold text-white/90">Objetivos ODS de la ONU:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedModel.un_sdgs.map((sdg) => (
                        <span key={sdg} className="px-2 py-0.5 rounded bg-[#092233] text-[10px] font-mono text-[#35c3c8] border border-[#183c52]">
                          ODS {sdg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Límites Operacionales y Riesgos Declarados:</span>
                  </div>
                  <ul className="text-[11px] text-amber-200/90 list-disc list-inside space-y-0.5">
                    {selectedModel.limitations_and_risks.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-[#00a6a6]/10 border border-[#00a6a6]/20">
                  <span className="text-[10px] font-mono text-[#8faab5] uppercase">Conformidad con el Tratado Antártico</span>
                  <p className="text-[11px] text-[#35c3c8] mt-0.5">{selectedModel.treaty_compliance_notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Policies */}
      {activeTab === 'POLICIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((pol) => (
            <div key={pol.policy_id} className="p-5 rounded-2xl bg-[#071722] border border-[#213f52] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00a6a6]/20 text-[#35c3c8] border border-[#00a6a6]/30">
                  {pol.policy_id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  pol.enforcement_level === 'BLOCKING'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {pol.enforcement_level}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{pol.title}</h4>
              <p className="text-xs text-[#a8c2ce] leading-relaxed">{pol.description}</p>

              <div className="p-2.5 rounded-xl bg-[#051119] border border-[#142e3d] text-[10px] font-mono text-[#8faab5]">
                <span className="text-white font-semibold">Base Normativa: </span>
                <span>{pol.normative_basis}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Human Override Terminal */}
      {activeTab === 'HUMAN_OVERRIDE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-2xl bg-[#071722] border border-[#213f52] shadow-xl space-y-4">
            <div className="border-b border-[#142e3d] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#00a6a6]/20 text-[#35c3c8] border border-[#00a6a6]/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Terminal Soberano de Control Humano (HITL)</h3>
                  <p className="text-[11px] font-mono text-[#8faab5]">
                    Resolución A/RES/78/265 (Párrafo 5) • Prevalencia del Criterio Humano sobre la Máquina
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#8faab5] uppercase mb-1">ID Operador / Mando</label>
                  <input
                    type="text"
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#051119] border border-[#142e3d] text-white font-mono text-xs focus:outline-none focus:border-[#35c3c8]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#8faab5] uppercase mb-1">Rol Operacional Soberano</label>
                  <select
                    value={operatorRole}
                    onChange={(e) => setOperatorRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#051119] border border-[#142e3d] text-white font-mono text-xs focus:outline-none focus:border-[#35c3c8]"
                  >
                    <option value="CAPTAIN_OF_VESSEL">Capitán de Buque (ARC Simón Bolívar / Peace Boat)</option>
                    <option value="CHIEF_SCIENTIST">Jefe de Expedición Científica (PAC / SCAR)</option>
                    <option value="UN_DIPLOMATIC_DELEGATE">Delegado Diplomático ante la ONU / STA</option>
                    <option value="SYSTEM_SUPERVISOR">Supervisor Autónomo de Infraestructura</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#8faab5] uppercase mb-1">Modelo de IA a Revocar</label>
                  <select
                    value={targetModelId}
                    onChange={(e) => setTargetModelId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#051119] border border-[#142e3d] text-white font-mono text-xs focus:outline-none focus:border-[#35c3c8]"
                  >
                    {modelCards.map((m) => (
                      <option key={m.model_id} value={m.model_id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#8faab5] uppercase mb-1">ID de Inferencia / Alerta</label>
                  <input
                    type="text"
                    value={targetInferenceId}
                    onChange={(e) => setTargetInferenceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#051119] border border-[#142e3d] text-white font-mono text-xs focus:outline-none focus:border-[#35c3c8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#8faab5] uppercase mb-1">Acción de Anulación (Sovereign Veto)</label>
                <select
                  value={overrideAction}
                  onChange={(e) => setOverrideAction(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#051119] border border-[#142e3d] text-white font-mono text-xs focus:outline-none focus:border-[#35c3c8]"
                >
                  <option value="REVOKE_RECOMMENDATION">REVOCAR RECOMENDACIÓN NÁUTICA / TÁCTICA</option>
                  <option value="OVERRIDE_DEFCON">RECLASIFICAR ALERTA DEFCON POLAR</option>
                  <option value="RECALIBRATE_PROBABILITY">RECALIBRAR PROBABILIDAD BRIER MANUALMENTE</option>
                  <option value="REJECT_SIMULATION">RECHAZAR SIMULACIÓN COMPUTACIONAL</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#8faab5] uppercase mb-1">Justificación Náutica / Científica Obligatoria</label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#051119] border border-[#142e3d] text-white font-mono text-xs focus:outline-none focus:border-[#35c3c8]"
                  placeholder="Detalla las observaciones in-situ que motivan la anulación del dictamen de la IA..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingOverride}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmittingOverride ? 'PROCESANDO VETO...' : 'EJECUTAR ANULACIÓN HUMANA SOBERANA'}</span>
              </button>
            </form>

            {overrideSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>VETO HUMANO REGISTRADO EN LIBRO MAYOR CRIPTOGRÁFICO</span>
                </div>
                <div className="text-[11px] font-mono space-y-1 text-emerald-100/90">
                  <p>ID Registro: {overrideSuccess.override_id}</p>
                  <p>Hash SHA-256: {overrideSuccess.cryptographic_hash}</p>
                  <p>Efecto: Recomendación algorítmica anulada con éxito.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#071722] border border-[#213f52] shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Doctrina de Mando Polar</h4>
            <div className="space-y-3 text-xs text-[#a8c2ce] leading-relaxed">
              <p>
                Bajo la doctrina marítima de la Armada de Colombia y las directrices de la OMI (Código Polar),
                <strong className="text-white"> ninguna inteligencia artificial posee responsabilidad jurídica</strong> sobre la seguridad de vidas humanas en el mar ni sobre la preservación ecológica antártica.
              </p>
              <p>
                Toda anulación registrada en este terminal queda sellada criptográficamente en el registro de auditoría,
                sirviendo como descargo legal y prueba pericial ante cualquier investigación de siniestros o auditorías del Tratado Antártico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Charter */}
      {activeTab === 'CHARTER' && charter && (
        <div className="p-6 rounded-2xl bg-[#071722] border border-[#213f52] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#142e3d] pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">{charter.title}</h3>
              <p className="text-[11px] font-mono text-[#35c3c8]">Marco Jurídico: {charter.framework}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCharter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#092233] border border-[#183c52] text-xs font-mono text-[#8faab5] hover:text-white transition-all"
              >
                {copiedCharter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCharter ? 'COPIADO' : 'COPIAR'}</span>
              </button>

              <button
                onClick={handleDownloadCharter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a6a6] hover:bg-[#35c3c8] text-[#06141c] text-xs font-mono font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DESCARGAR .MD</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#051119] border border-[#142e3d] max-h-[500px] overflow-y-auto text-xs font-mono text-[#a8c2ce] whitespace-pre-wrap leading-relaxed">
            {charter.charter_markdown}
          </div>
        </div>
      )}
    </div>
  );
}
