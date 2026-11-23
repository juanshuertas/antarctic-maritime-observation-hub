import { useState, useEffect } from 'react';
import {
  Shield,
  Atom,
  Eye,
  Pickaxe,
  Fish,
  FileCheck2,
  Download,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface PeacePillar {
  article: string;
  title: string;
  status: string;
  score: number;
  findings: string[];
  legal_basis: string;
  [key: string]: any;
}

interface PeaceAuditData {
  system: string;
  version: string;
  generated_utc: string;
  overall_status: string;
  composite_peace_score: number;
  lead_architect: {
    name: string;
    role: string;
    orcid: string;
    missions: string[];
  };
  pillars: {
    article_1_demilitarization: PeacePillar;
    article_5_nuclear_prohibition: PeacePillar;
    article_7_open_inspections: PeacePillar;
    madrid_article_7_mining_ban: PeacePillar;
    ccamlr_marine_sanctuaries: PeacePillar;
  };
  truth_planes_hash: string;
  un_ocean_decade_alignment: {
    challenge: string;
    sdg_targets: string[];
    sovereignty_principle: string;
  };
}

export default function PeaceTreatyObservatory() {
  const [audit, setAudit] = useState<PeaceAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingDossier, setGeneratingDossier] = useState(false);
  const [dossierMarkdown, setDossierMarkdown] = useState<string | null>(null);
  const [dossierId, setDossierId] = useState<string | null>(null);
  const [dossierHash, setDossierHash] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeDossierModal, setActiveDossierModal] = useState(false);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/peace/audit');
      if (res.ok) {
        const data = await res.json();
        setAudit(data);
      }
    } catch (err) {
      console.error('Error fetching peace audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const handleGenerateDossier = async () => {
    setGeneratingDossier(true);
    try {
      const res = await fetch('/api/peace/dossier/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expedition_id: 'EXP-AMOH-PEACE-2026',
          sector: 'ALL_CIRCUMPOLAR_18_SECTORS',
          requester_name: 'Juan Sebastian Huertas Olea',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDossierMarkdown(data.markdown);
        setDossierId(data.dossier_id);
        setDossierHash(data.sha256_fingerprint);
        setActiveDossierModal(true);
      }
    } catch (err) {
      console.error('Error generating dossier:', err);
    } finally {
      setGeneratingDossier(false);
    }
  };

  const handleDownloadDossier = () => {
    if (!dossierMarkdown) return;
    const blob = new Blob([dossierMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dossierId || 'ATCM_PEACE_DOSSIER'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyHashToClipboard = () => {
    if (!dossierHash && !audit?.truth_planes_hash) return;
    const text = dossierHash || audit?.truth_planes_hash || '';
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const pillarsList = audit
    ? [
        {
          key: 'art_1',
          data: audit.pillars.article_1_demilitarization,
          icon: Shield,
          color: '#38bdf8',
          tag: 'ARTÍCULO I',
        },
        {
          key: 'art_5',
          data: audit.pillars.article_5_nuclear_prohibition,
          icon: Atom,
          color: '#a855f7',
          tag: 'ARTÍCULO V (IAEA)',
        },
        {
          key: 'art_7',
          data: audit.pillars.article_7_open_inspections,
          icon: Eye,
          color: '#34d399',
          tag: 'ARTÍCULO VII',
        },
        {
          key: 'madrid_7',
          data: audit.pillars.madrid_article_7_mining_ban,
          icon: Pickaxe,
          color: '#f59e0b',
          tag: 'MADRID ART. 7 (2048)',
        },
        {
          key: 'ccamlr',
          data: audit.pillars.ccamlr_marine_sanctuaries,
          icon: Fish,
          color: '#06b6d4',
          tag: 'CCAMLR / MPAs',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Peace Framework & Nobel Vision */}
      <div className="rounded-3xl bg-gradient-to-br from-[#071d2b] via-[#09263a] to-[#04131d] border border-[#1b4e6d] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a6a6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#00a6a6]/20 text-[#58d5e3] border border-[#00a6a6]/40 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                DIPLOMACIA CIENTÍFICA & TRATADO ANTÁRTICO
              </span>
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 font-bold">
                ESTÁNDAR NANSEN DEL SIGLO XXI
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Observatorio de Paz Polar, Desarme & Verificación Inmutable
            </h2>

            <p className="text-sm text-[#a4c5d6] leading-relaxed">
              Herramienta soberana de arbitraje neutral desarrollada por el oceanógrafo polar y arquitecto de sistemas{' '}
              <strong className="text-white">Juan Sebastián Huertas Olea</strong>. Audita de manera continua y abierta el cumplimiento de los mandatos de desmilitarización, desnuclearización (IAEA MARIS) y protección ecológica del Océano Austral, blindando el horizonte 2048 frente a la explotación extractiva.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#7ea3b7] pt-1">
              <span>ORCID: <strong className="text-white">0009-0004-8842-1820</strong></span>
              <span>·</span>
              <span>Plataformas: <strong className="text-white">B.I.C. ARC Simón Bolívar (PAC)</strong> / <strong className="text-white">NatGeo Resolution (NG-LEX)</strong></span>
            </div>
          </div>

          {/* Peace Composite Score Gauge */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 shrink-0 bg-[#051622]/80 border border-[#18435c] p-6 rounded-2xl shadow-inner text-center">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8faab5] font-bold">
                Índice de Paz Polar
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#34d399] to-[#a855f7] mt-1">
                {audit ? `${audit.composite_peace_score}%` : '---'}
              </div>
              <div className="text-[11px] font-mono text-[#34d399] font-bold mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {audit?.overall_status || 'VERIFICANDO...'}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full pt-2 border-t border-[#18435c]">
              <button
                onClick={handleGenerateDossier}
                disabled={generatingDossier}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00a6a6] to-[#0284c7] hover:from-[#35c3c8] hover:to-[#38bdf8] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{generatingDossier ? 'Generando...' : 'Generar Dossier ATCM'}</span>
              </button>

              <button
                onClick={fetchAudit}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg border border-[#214358] hover:bg-[#122b3b] text-[#8faab5] hover:text-white transition-colors text-[11px] font-mono flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar Auditoría</span>
              </button>
            </div>
          </div>
        </div>

        {/* SHA-256 Sello de la Verdad */}
        {audit && (
          <div className="mt-6 pt-4 border-t border-[#13384f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#8faab5]">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[#38bdf8] font-bold">SELLO DE LOS 3 PLANOS (SHA-256):</span>
              <span className="truncate text-white bg-[#061926] px-2 py-0.5 rounded border border-[#1b3d52]">
                {audit.truth_planes_hash}
              </span>
            </div>
            <button
              onClick={copyHashToClipboard}
              className="flex items-center gap-1.5 text-[#58d5e3] hover:text-white transition-colors shrink-0"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHash ? 'Copiado' : 'Copiar Hash'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 5 ATS Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pillarsList.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.key}
              className="rounded-2xl bg-[#061824] border border-[#173e57] p-5 flex flex-col justify-between hover:border-[#2b6585] transition-all shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${pillar.color}15`,
                      borderColor: `${pillar.color}40`,
                      color: pillar.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: `${pillar.color}15`,
                        borderColor: `${pillar.color}40`,
                        color: pillar.color,
                      }}
                    >
                      {pillar.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-[#0d2a3d] px-2 py-0.5 rounded border border-[#1a4968]">
                      {pillar.data.score}%
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#58d5e3] transition-colors mb-1">
                  {pillar.data.title}
                </h3>

                <p className="text-[11px] font-mono text-[#7ea3b7] mb-3">
                  {pillar.data.legal_basis}
                </p>

                <div className="space-y-2 mb-4">
                  {pillar.data.findings.map((f: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#c2d7e3]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#122e40] flex items-center justify-between text-[10px] font-mono text-[#8faab5]">
                <span>ESTADO OFICIAL:</span>
                <span className="text-[#34d399] font-bold">{pillar.data.status}</span>
              </div>
            </div>
          );
        })}

        {/* 6th Card: Nansen Digital Protocol */}
        <div className="rounded-2xl bg-gradient-to-br from-[#071f30] to-[#0c2a40] border border-[#23587a] p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#a855f7]/40 bg-[#a855f7]/15 text-[#c084fc]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#a855f7]/40 bg-[#a855f7]/15 text-[#c084fc]">
                W3C CREDENTIAL
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Protocolo Nansen Digital del Siglo XXI
            </h3>

            <p className="text-xs text-[#a4c5d6] mb-3 leading-relaxed">
              Credencial Verificable W3C descentralizada para observadores científicos. Garantiza soberanía e inmunidad de investigación en cualquier base o buque del continente antártico.
            </p>

            <div className="p-3 rounded-xl bg-[#051624] border border-[#163c54] space-y-1.5 text-xs font-mono text-[#8faab5] mb-4">
              <div className="flex justify-between">
                <span>ESTÁNDAR:</span>
                <strong className="text-white">W3C VC JSON-LD</strong>
              </div>
              <div className="flex justify-between">
                <span>FIRMA:</span>
                <strong className="text-[#38bdf8]">Ed25519Signature2020</strong>
              </div>
              <div className="flex justify-between">
                <span>INMUNIDAD:</span>
                <strong className="text-[#34d399]">Tratado Art. VII</strong>
              </div>
            </div>
          </div>

          <a
            href="/passport/credentials"
            className="w-full px-4 py-2 rounded-xl bg-[#13374f] hover:bg-[#1d4d6e] text-[#58d5e3] hover:text-white border border-[#2b6585] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors text-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Gestionar Pasaporte & Credencial</span>
          </a>
        </div>
      </div>

      {/* Diplomatic Dossier Modal Preview */}
      {activeDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#071d2b] border border-[#1c4d6c] rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#14374d] flex items-center justify-between bg-[#051622]">
              <div>
                <div className="text-[10px] font-mono text-[#38bdf8] font-bold uppercase tracking-wider">
                  Documento Diplomático Oficial ATCM / ONU
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Expediente de Cumplimiento de Paz:</span>
                  <span className="text-[#58d5e3] font-mono text-sm">{dossierId}</span>
                </h3>
              </div>
              <button
                onClick={() => setActiveDossierModal(false)}
                className="p-2 rounded-xl border border-[#20455c] hover:bg-[#122b3b] text-[#8faab5] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Markdown Viewer */}
            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-[#c2d7e3] bg-[#030e17] leading-relaxed select-text">
              <pre className="whitespace-pre-wrap font-mono">{dossierMarkdown}</pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#14374d] flex flex-wrap items-center justify-between gap-3 bg-[#051622]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8faab5]">
                <span>Sello SHA-256:</span>
                <span className="text-white truncate max-w-xs">{dossierHash}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDossier}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a6a6] to-[#0284c7] hover:from-[#35c3c8] hover:to-[#38bdf8] text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Expediente (.md)</span>
                </button>
                <button
                  onClick={() => setActiveDossierModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#20455c] hover:bg-[#122b3b] text-[#8faab5] hover:text-white text-xs font-mono transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
