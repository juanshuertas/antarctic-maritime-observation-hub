import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  Download,
  Sparkles,
  Lock,
  Award,
} from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from './passport-data';

export default function PassportCredentials() {
  const profile = INITIAL_PASSPORT_PROFILE;
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [credentialData, setCredentialData] = useState<any>(null);

  const fetchCredential = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/peace/credential/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observer_name: profile.displayName,
          orcid: profile.orcid,
          institution: profile.institution,
          role: profile.specialization,
          credential_id: profile.credentialId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCredentialData(data);
      }
    } catch (err) {
      console.error('Error fetching VC:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredential();
  }, []);

  const handleVerify = async () => {
    if (!credentialData) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/peace/credential/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialData }),
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data);
      }
    } catch (err) {
      console.error('Error verifying VC:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadJsonLd = () => {
    if (!credentialData) return;
    const blob = new Blob([JSON.stringify(credentialData, null, 2)], {
      type: 'application/ld+json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NANSEN_CREDENTIAL_${profile.credentialId}.jsonld`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    if (!credentialData) return;
    navigator.clipboard.writeText(JSON.stringify(credentialData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 font-mono animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#1b384c] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/40 font-bold flex items-center gap-1">
              <Award className="w-3 h-3" />
              PROTOCOLO NANSEN DEL SIGLO XXI
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 font-bold">
              ESTÁNDAR W3C VC JSON-LD
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#72e0b5]" />
            <span>Credenciales Verificables de Paz & Soberanía Científica</span>
          </h1>
          <p className="text-xs text-[#8faab5] mt-1 max-w-3xl">
            Identidad criptográfica descentralizada para observadores antárticos bajo el Artículo VII del Tratado Antártico. Certifica inmunidad ética, integridad de datos y soberanía científica global.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying || !credentialData}
            className="px-3 py-2 rounded-xl bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#34d399] border border-[#10b981]/50 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{verifying ? 'Verificando...' : 'Verificar Criptográficamente'}</span>
          </button>
        </div>
      </div>

      {/* Diplomatic Observer Identity Card */}
      <div className="rounded-3xl border border-[#23587a] bg-gradient-to-br from-[#071d2b] to-[#04121b] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-[#58d5e3] font-bold">
              ESTATUTO DEL OBSERVADOR POLAR INTERNACIONAL
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {profile.displayName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#a4c5d6]">
              <div>
                <span className="text-[#6c91a3]">IDENTIFICADOR: </span>
                <strong className="text-white">{profile.credentialId}</strong>
              </div>
              <div>
                <span className="text-[#6c91a3]">ORCID: </span>
                <strong className="text-[#38bdf8]">{profile.orcid}</strong>
              </div>
              <div>
                <span className="text-[#6c91a3]">ROL: </span>
                <strong className="text-white">{profile.specialization}</strong>
              </div>
              <div>
                <span className="text-[#6c91a3]">INSTITUCIÓN: </span>
                <strong className="text-white">{profile.institution}</strong>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2 p-4 rounded-2xl bg-[#061824] border border-[#163e57] text-xs">
            <div className="text-[10px] text-[#7ea3b7] uppercase">Estado Jurídico:</div>
            <div className="text-[#34d399] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>PROTEGIDO (TRATADO ART. VII)</span>
            </div>
            <div className="text-[11px] text-[#8faab5] pt-1 border-t border-[#163e57]">
              Misiones: PAC ARC Simón Bolívar · NG-LEX Resolution
            </div>
          </div>
        </div>

        {/* Verification Success Box */}
        {verificationResult && (
          <div className="p-4 rounded-2xl bg-[#062419] border border-[#10b981]/50 text-xs text-[#34d399] flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold">VERIFICACIÓN CRIPTOGRÁFICA EXITOSA: </span>
                <span>Firma asimétrica Ed25519 e integridad del emisor internacional validadas.</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981]/20 text-[#34d399] shrink-0">
              HASH INTEGRITY CONFIRMED
            </span>
          </div>
        )}
      </div>

      {/* JSON-LD Payload Viewer */}
      <div className="rounded-3xl border border-[#1d3c4e] bg-[#091824] p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-[#35c3c8] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Documento Criptográfico W3C (JSON-LD)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJsonLd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#214358] bg-[#06121c] hover:bg-[#122b3b] text-[#58d5e3] text-xs transition-colors font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .jsonld</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#214358] bg-[#06121c] hover:bg-[#122b3b] text-[#35c3c8] text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#72e0b5]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Credencial'}</span>
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-2xl bg-[#050e18] border border-[#162e3d] text-xs text-[#72e0b5] overflow-x-auto select-all leading-relaxed max-h-96">
          {loading
            ? '// Cargando credencial verificable W3C...'
            : credentialData
            ? JSON.stringify(credentialData, null, 2)
            : '// Error al cargar la credencial.'}
        </pre>
      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
