import { useState, useEffect } from 'react';
import {
  DollarSign,
  ExternalLink,
  FileCheck2,
  Download,
  Copy,
  Check,
  Search,
  Sparkles,
  RefreshCw,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  fetchCooperationResources,
  matchCooperationResources,
  generateConceptNote,
  type CooperationResource,
  type MatchedResourceItem,
  type ConceptNoteResponse,
} from '../../lib/cooperation-service';
import { AIGovernanceBadge } from '../ai/AIGovernanceBadge';

interface Props {
  initialSdgFilter?: number | null;
  className?: string;
}

export default function InternationalCooperationPanel({ initialSdgFilter, className = '' }: Props) {
  const [resources, setResources] = useState<CooperationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSdg, setSelectedSdg] = useState<number | null>(initialSdgFilter ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Matcher State
  const [showMatcher, setShowMatcher] = useState(false);
  const [projectTitle, setProjectTitle] = useState('Monitoreo Oceanográfico y Acústico Polar en el Estrecho de Gerlache');
  const [expeditionType, setExpeditionType] = useState('PAC');
  const [budgetUsd, setBudgetUsd] = useState(250000);
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchedResourceItem[] | null>(null);

  // Concept Note Generator State
  const [activeConceptResource, setActiveConceptResource] = useState<CooperationResource | null>(null);
  const [leadInvestigator, setLeadInvestigator] = useState('Dr. Juan Sebastian Huertas Olea');
  const [leadInstitution, setLeadInstitution] = useState('Comisión Colombiana del Océano / AMOH');
  const [generatingNote, setGeneratingNote] = useState(false);
  const [conceptNoteResult, setConceptNoteResult] = useState<ConceptNoteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedSdg, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCooperationResources(
        selectedSdg || undefined,
        selectedCategory === 'ALL' ? undefined : selectedCategory
      );
      setResources(data);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatch = async () => {
    setMatching(true);
    try {
      const res = await matchCooperationResources({
        title: projectTitle,
        sdgs: selectedSdg ? [selectedSdg, 14, 13, 17] : [14, 13, 9, 17],
        expedition_type: expeditionType,
        estimated_budget_usd: budgetUsd,
        partner_countries: ['COLOMBIA', 'CHILE', 'SPAIN'],
      });
      setMatchResults(res.matches);
    } finally {
      setMatching(false);
    }
  };

  const handleGenerateNote = async () => {
    if (!activeConceptResource) return;
    setGeneratingNote(true);
    try {
      const note = await generateConceptNote({
        resource_id: activeConceptResource.id,
        project_title: projectTitle,
        lead_investigator: leadInvestigator,
        lead_institution: leadInstitution,
        partner_institutions: ['Instituto Antártico Chileno (INACH)', 'Comité Polar Español (CSIC)'],
        selected_sdgs: activeConceptResource.sdgs,
        requested_budget_usd: Math.min(budgetUsd, activeConceptResource.amount_max_usd),
        sector_description: 'Península Antártica, Estrecho de Bransfield y Gerlache',
      });
      setConceptNoteResult(note);
    } finally {
      setGeneratingNote(false);
    }
  };

  const handleDownloadNote = () => {
    if (!conceptNoteResult) return;
    const blob = new Blob([conceptNoteResult.markdown_content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${conceptNoteResult.document_code}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyNote = () => {
    if (!conceptNoteResult) return;
    navigator.clipboard.writeText(conceptNoteResult.markdown_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredResources = resources.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.entity.toLowerCase().includes(q) ||
      r.focus_areas.some((f) => f.toLowerCase().includes(q))
    );
  });

  return (
    <div className={`space-y-6 text-[#edf5f5] ${className}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top Banner KPI */}
      <div className="p-5 rounded-2xl bg-[#081a26] border border-[#1a3f55] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a6a6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#58d5e3] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[2px] text-[#58d5e3] font-bold">
                MECANISMOS MULTILATERALES & FINANCIACIÓN ODS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Recursos de Cooperación Internacional Polar & Marina
            </h2>
            <p className="text-xs text-[#8faab5] mt-1 max-w-2xl">
              Catálogo federado de instrumentos de financiamiento, becas científicas y convenios bilaterales para el Océano Austral bajo el Sistema del Tratado Antártico (Art. III), el Decenio del Océano (COI-UNESCO) y la Agenda 2030.
            </p>
          </div>

          <button
            onClick={() => {
              setShowMatcher(!showMatcher);
              if (!showMatcher && !matchResults) handleRunMatch();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00a6a6] to-[#0284c7] hover:from-[#35c3c8] hover:to-[#38bdf8] text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>{showMatcher ? 'Ver Catálogo Completo' : 'Emparejar mi Proyecto (CCI)'}</span>
          </button>
        </div>

        {/* Global Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#133042]">
          <div className="bg-[#05111a] p-3 rounded-xl border border-[#16364a]">
            <div className="text-[10px] font-mono text-[#8faab5] uppercase">Fondos Disponibles</div>
            <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">$54.3M+ USD</div>
          </div>
          <div className="bg-[#05111a] p-3 rounded-xl border border-[#16364a]">
            <div className="text-[10px] font-mono text-[#8faab5] uppercase">Instrumentos Activos</div>
            <div className="text-base sm:text-lg font-black text-[#72e0b5] font-mono mt-0.5">10 Convocatorias</div>
          </div>
          <div className="bg-[#05111a] p-3 rounded-xl border border-[#16364a]">
            <div className="text-[10px] font-mono text-[#8faab5] uppercase">Enfoque ODS</div>
            <div className="text-base sm:text-lg font-black text-[#58d5e3] font-mono mt-0.5">14, 13, 9, 17, 4</div>
          </div>
          <div className="bg-[#05111a] p-3 rounded-xl border border-[#16364a]">
            <div className="text-[10px] font-mono text-[#8faab5] uppercase">Elegibilidad Global</div>
            <div className="text-base sm:text-lg font-black text-[#facc15] font-mono mt-0.5">Sur Global / BBNJ</div>
          </div>
        </div>
      </div>

      {/* Matcher Drawer Section */}
      {showMatcher && (
        <div className="p-5 rounded-2xl bg-[#091f2c] border border-[#235877] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b435c] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#58d5e3]" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Simulador de Emparejamiento & Compatibilidad CCI (Cooperation Compatibility Index)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00a6a6]/20 text-[#58d5e3] border border-[#00a6a6]/40">
              ALGORITMO MULTILATERAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[#8faab5] font-mono mb-1">Título de la Propuesta / Expedición</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-[#05121b] border border-[#1e4860] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#58d5e3]"
              />
            </div>
            <div>
              <label className="block text-[#8faab5] font-mono mb-1">Tipo de Expedición</label>
              <select
                value={expeditionType}
                onChange={(e) => setExpeditionType(e.target.value)}
                className="w-full bg-[#05121b] border border-[#1e4860] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#58d5e3]"
              >
                <option value="PAC">Programa Antártico Nacional (ej. PAC Colombia / INACH)</option>
                <option value="INTERNATIONAL">Consorcio Multilateral Internacional (Horizonte Europa / BBNJ)</option>
                <option value="CIVIL_SOCIETY">Ciencia Ciudadana / Academia (Peace Boat / UNESCO)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#8faab5] font-mono mb-1">Presupuesto Estimado (USD)</label>
              <input
                type="number"
                value={budgetUsd}
                onChange={(e) => setBudgetUsd(Number(e.target.value))}
                className="w-full bg-[#05121b] border border-[#1e4860] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#58d5e3]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunMatch}
              disabled={matching}
              className="px-4 py-2 rounded-xl bg-[#00a6a6] hover:bg-[#35c3c8] text-white font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${matching ? 'animate-spin' : ''}`} />
              <span>{matching ? 'Evaluando Compatibilidad...' : 'Recalcular Emparejamiento'}</span>
            </button>
          </div>

          {/* Match Results */}
          {matchResults && (
            <div className="mt-4 space-y-2 pt-3 border-t border-[#1b435c]">
              <div className="text-xs font-mono text-[#8faab5]">
                {matchResults.length} Fondos Evaluados · Top Coincidencias:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchResults.slice(0, 4).map((m) => (
                  <div
                    key={m.resource_id}
                    className="p-3.5 rounded-xl bg-[#061622] border border-[#1b455e] flex flex-col justify-between hover:border-[#38bdf8] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#102d3f] text-[#58d5e3] border border-[#215a7a]">
                          CCI: {m.compatibility_score}%
                        </span>
                        <div className="flex items-center gap-1.5">
                          <AIGovernanceBadge modelName="Motor Cooperación ODS" brierScore={0.15} />
                          <span className="text-[10px] font-mono text-[#facc15] font-bold">{m.tier}</span>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-tight">{m.resource_name}</h4>
                      <p className="text-[11px] text-[#8faab5] mt-1">{m.entity}</p>
                      <ul className="mt-2 space-y-1">
                        {m.key_reasons.map((r, idx) => (
                          <li key={idx} className="text-[10px] text-[#72e0b5] font-mono flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#72e0b5]" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#142e3f] flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#8faab5]">Límite: {m.next_deadline}</span>
                      <button
                        onClick={() => {
                          const found = resources.find((r) => r.id === m.resource_id);
                          if (found) setActiveConceptResource(found);
                        }}
                        className="text-[#58d5e3] hover:underline font-bold"
                      >
                        Generar Nota Conceptual →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#06141e] p-3 rounded-2xl border border-[#152e3e]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8faab5]" />
          <input
            type="text"
            placeholder="Buscar por fondo, entidad o área temática..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#091e2b] border border-[#19394d] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8faab5] focus:outline-none focus:border-[#58d5e3]"
          />
        </div>

        {/* SDG Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono text-[#8faab5] shrink-0 mr-1">ODS:</span>
          {[
            { num: null, label: 'TODOS' },
            { num: 14, label: 'ODS 14 🌊' },
            { num: 13, label: 'ODS 13 ❄️' },
            { num: 9, label: 'ODS 9 🔬' },
            { num: 17, label: 'ODS 17 🤝' },
            { num: 4, label: 'ODS 4 🎓' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setSelectedSdg(item.num)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all shrink-0 font-bold ${
                selectedSdg === item.num
                  ? 'bg-[#00a6a6] text-white shadow-md'
                  : 'bg-[#0a2130] text-[#8faab5] hover:text-white border border-[#1c3e52]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#091e2b] border border-[#19394d] text-xs font-mono rounded-xl px-2.5 py-1.5 text-[#58d5e3] focus:outline-none focus:border-[#58d5e3]"
        >
          <option value="ALL">Todas las Categorías</option>
          <option value="MULTILATERAL_FUND">Fondos Multilaterales (GEF/PNUD)</option>
          <option value="CLIMATE_FINANCE">Finanzas del Clima (GCF)</option>
          <option value="FELLOWSHIP">Becas Científicas (CCAMLR/SCAR)</option>
          <option value="DECADE_ACTION">Acciones del Decenio (UNESCO)</option>
          <option value="TREATY_MECHANISM">Mecanismos de Tratado (BBNJ)</option>
          <option value="RESEARCH_CONSORTIUM">Consorcios (Horizonte Europa)</option>
          <option value="BILATERAL_PARTNERSHIP">Cooperación Bilateral (AECID/Chile)</option>
          <option value="TECHNICAL_ASSISTANCE">Asistencia Técnica (OMI)</option>
        </select>
      </div>

      {/* Catalog Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#8faab5] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#58d5e3]" />
          <span>Cargando catálogo federado de cooperación internacional...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-[#061622] border border-[#16364a] hover:border-[#2b6585] transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#102d3f] text-[#58d5e3] border border-[#215a7a]">
                      {res.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#122e20] text-[#72e0b5] border border-[#1d5236] font-bold">
                      {res.funding_type}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-[#72e0b5] flex items-center gap-1 justify-end">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>
                        Hasta {res.amount_max_usd >= 1000000 ? `${(res.amount_max_usd / 1000000).toFixed(1)}M` : `${(res.amount_max_usd / 1000).toFixed(0)}k`} {res.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & Entity */}
                <h3 className="text-sm font-bold text-white group-hover:text-[#58d5e3] transition-colors leading-snug">
                  {res.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#8faab5] mt-1 font-mono">
                  <Building2 className="w-3.5 h-3.5 text-[#58d5e3]" />
                  <span>{res.entity}</span>
                </div>

                {/* SDG Targets Pills */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {res.sdgs.map((s) => (
                    <span
                      key={s}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#091f2c] text-[#72e0b5] border border-[#1a4a63] font-bold"
                    >
                      ODS {s}
                    </span>
                  ))}
                  <span className="text-[9px] font-mono text-[#8faab5] ml-1 self-center">
                    Metas: {res.sdg_targets.join(', ')}
                  </span>
                </div>

                {/* Focus Areas */}
                <div className="mt-3 space-y-1">
                  <div className="text-[10px] font-mono text-[#8faab5] uppercase">Áreas Prioritarias:</div>
                  <ul className="space-y-0.5">
                    {res.focus_areas.slice(0, 2).map((fa, idx) => (
                      <li key={idx} className="text-xs text-[#c6dbdb] flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#58d5e3] mt-1 shrink-0" />
                        <span>{fa}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Treaty Relevance */}
                <div className="mt-3 p-2.5 rounded-xl bg-[#040e16] border border-[#132d3f] text-[11px] text-[#8faab5]">
                  <span className="font-mono text-[#58d5e3] font-bold">STA / Tratado Antártico: </span>
                  {res.antarctic_treaty_relevance}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-[#122836] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#8faab5]">
                  <Calendar className="w-3 h-3 text-[#facc15]" />
                  <span>Cierre: {res.next_deadline}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={res.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-[#0a2130] hover:bg-[#123145] text-[#8faab5] hover:text-white border border-[#1a3f55] transition-all"
                    title="Ver Portal Oficial del Fondo"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setActiveConceptResource(res)}
                    className="px-3 py-1.5 rounded-lg bg-[#00a6a6]/20 hover:bg-[#00a6a6] text-[#58d5e3] hover:text-white border border-[#00a6a6]/50 font-mono text-[11px] font-bold transition-all flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Postular / Nota Conceptual</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diplomatic Concept Note Modal */}
      {activeConceptResource && (
        <div className="fixed inset-0 z-[600] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#071622] border border-[#1f4860] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-[#edf5f5] overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#18394c] flex items-center justify-between bg-[#0a1e2c]">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-[#58d5e3]" />
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Generador de Nota Conceptual Diplomática (ONU / STA)
                  </h3>
                  <p className="text-xs text-[#8faab5]">
                    Mecanismo Receptor: {activeConceptResource.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveConceptResource(null);
                  setConceptNoteResult(null);
                }}
                className="w-8 h-8 rounded-full bg-[#102533] hover:bg-[#1a384c] border border-[#234357] flex items-center justify-center text-[#8faab5] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {!conceptNoteResult ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[#8faab5] mb-1">Título del Proyecto</label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full bg-[#05111a] border border-[#1b435a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#58d5e3]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#8faab5] mb-1">Investigador Principal</label>
                      <input
                        type="text"
                        value={leadInvestigator}
                        onChange={(e) => setLeadInvestigator(e.target.value)}
                        className="w-full bg-[#05111a] border border-[#1b435a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#58d5e3]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8faab5] mb-1">Institución Líder</label>
                      <input
                        type="text"
                        value={leadInstitution}
                        onChange={(e) => setLeadInstitution(e.target.value)}
                        className="w-full bg-[#05111a] border border-[#1b435a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#58d5e3]"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#05111a] border border-[#183a4f] text-[11px] text-[#8faab5] space-y-1">
                    <div className="text-white font-bold">Salvaguardas Multilaterales Integradas:</div>
                    <div>• Artículo III del Tratado Antártico (intercambio y ciencia abierta).</div>
                    <div>• Protocolo de Madrid (EIA y huella mínima).</div>
                    <div>• Decenio de las Ciencias Oceánicas (COI-UNESCO).</div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleGenerateNote}
                      disabled={generatingNote}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00a6a6] to-[#0284c7] hover:from-[#35c3c8] hover:to-[#38bdf8] text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{generatingNote ? 'Estructurando Nota Diplomática...' : 'Generar Documento con Sello SHA-256'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#0d2a3a] border border-[#1b5577] flex items-center justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-[10px] text-[#72e0b5] font-bold">DOCUMENTO VALIDADO Y CERTIFICADO</div>
                        <AIGovernanceBadge
                          modelName="Motor de Emparejamiento Cooperación ODS"
                          brierScore={0.15}
                          sha256Hash={conceptNoteResult.sha256_verification_hash}
                        />
                      </div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {conceptNoteResult.document_code}
                      </div>
                      <div className="text-[10px] text-[#8faab5] mt-0.5">
                        Firma Digital SHA-256: {conceptNoteResult.sha256_verification_hash}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyNote}
                        className="p-2 rounded-lg bg-[#102f43] hover:bg-[#1a4a6b] text-[#58d5e3] border border-[#235d82] flex items-center gap-1.5 transition-all text-xs"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#72e0b5]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copiado' : 'Copiar'}</span>
                      </button>
                      <button
                        onClick={handleDownloadNote}
                        className="px-3 py-2 rounded-lg bg-[#00a6a6] hover:bg-[#35c3c8] text-white font-bold flex items-center gap-1.5 transition-all text-xs shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Markdown</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#030a10] p-4 rounded-xl border border-[#142d3d] text-xs font-mono text-[#c6dbdb] max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {conceptNoteResult.markdown_content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
