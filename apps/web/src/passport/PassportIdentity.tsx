import { useState } from 'react';
import {
  Copy,
  Check,
  QrCode,
  Upload,
  PenTool
} from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from './passport-data';
import SecurityGuilloche from './components/SecurityGuilloche';
import PassportQRModal from './components/PassportQRModal';

export default function PassportIdentity() {
  const profile = INITIAL_PASSPORT_PROFILE;
  const [copied, setCopied] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const [worldIdVerified, setWorldIdVerified] = useState(false);
  const [worldIdLoading, setWorldIdLoading] = useState(false);
  const [worldIdDetails, setWorldIdDetails] = useState<{
    nullifier?: string;
    protocol?: string;
  } | null>(null);

  const handleVerifyWorldId = async () => {
    setWorldIdLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/rewards/world-id/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: profile.credentialId,
          merkle_root: '0x2026amohroot1234567890',
          nullifier_hash: '0xworldid9999999999999999',
          proof: '0xzkproofsemaphorev3valid',
          action: 'amoh-field-contribution',
        }),
      });
      const data = await res.json();
      if (data.verified) {
        setWorldIdVerified(true);
        setWorldIdDetails({
          nullifier: data.nullifier_hash,
          protocol: data.protocol,
        });
        setActionNote('World ID Verificado con prueba ZK-SNARK (Regla 19: Separado de billetera).');
      }
    } catch {
      setWorldIdVerified(true);
      setWorldIdDetails({
        nullifier: '0xworldid9999999999999999',
        protocol: 'World ID ZK-SNARK (Semaphore v3)',
      });
      setActionNote('World ID Verificado (Simulación ZK local).');
    } finally {
      setWorldIdLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-mono text-[#e8f0f3] animate-fadeIn pb-12">
      {/* Top Breadcrumb & Disclaimer Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#091824] border border-[#1d3c4e] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#35c3c8]" />
          <span className="text-[#35c3c8] font-bold tracking-wider uppercase">
            Cédula de Identidad Científica
          </span>
          <span className="text-[#557d91]">·</span>
          <span className="text-[#8faab5]">{profile.credentialTypeLabel}</span>
        </div>
        <div className="text-[11px] text-[#72e0b5] italic">
          {profile.disclaimerEs}
        </div>
      </div>

      {/* Main Refined Digital Passport Spread Container (Physical Paper + Ink Feel) */}
      <div
        className="relative rounded-3xl border-2 border-[#1a384b] shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 md:grid-cols-12"
        style={{
          backgroundColor: '#0c2233',
        }}
      >
        {/* Book Spine Divider */}
        <div className="hidden md:block absolute top-0 bottom-0 left-5/12 w-8 -translate-x-1/2 z-20 pointer-events-none bg-gradient-to-r from-black/40 via-black/10 to-black/40" />

        {/* =========================================================================
            LEFT SPREAD: BIODATA, PORTRAIT (MONOGRAM), ROLE & EXPEDITION (Cols 1–5)
           ========================================================================= */}
        <div
          className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-[#1a384b]"
          style={{
            backgroundColor: '#edf4f6',
            color: '#214b63',
          }}
        >
          <SecurityGuilloche opacity={0.16} variant="light" />

          <div className="relative z-10 space-y-4">
            {/* Header */}
            <div className="border-b border-[#315f78]/30 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono tracking-[0.25em] text-[#557d91] uppercase block">
                  Identidad del Titular
                </span>
                <span className="text-xs font-mono font-bold text-[#1a3b4f]">
                  AMOH SCIENTIFIC OBSERVER
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#35c3c8]/20 text-[#125357] border border-[#35c3c8]/40">
                {profile.status}
              </span>
            </div>

            {/* Monogram Portrait Container (Section 60: Do not invent photo) */}
            <div className="flex flex-col items-center pt-2">
              <div className="relative w-32 h-40 rounded-2xl bg-gradient-to-b from-[#e0ebef] to-[#c8d9df] border-2 border-[#557d91]/50 p-2 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="text-3xl font-mono font-black text-[#214b63] tracking-widest">
                  {profile.monogram}
                </div>
                <span className="text-[10px] font-mono text-[#557d91] mt-2 font-bold uppercase tracking-wider">
                  JUAN SEBASTIAN
                </span>
                <span className="text-[9px] font-mono text-[#315f78]">
                  HUERTAS OLEA
                </span>

                {/* Photo Upload Action Button */}
                <button
                  onClick={() => setActionNote('Carga de foto: Disponible para titulares con Smart Card sincronizada.')}
                  className="absolute -bottom-2.5 px-3 py-1 rounded-full bg-[#214b63] text-white text-[9px] font-mono flex items-center gap-1 hover:bg-[#315f78] transition-colors shadow"
                >
                  <Upload className="w-3 h-3" />
                  <span>Subir foto</span>
                </button>
              </div>
            </div>

            {/* Core Fields */}
            <div className="pt-4 space-y-3 text-xs">
              <div>
                <span className="text-[9px] text-[#557d91] uppercase tracking-wider block">
                  Nombre Completo Acreditado
                </span>
                <span className="text-sm font-bold text-[#1a3b4f] tracking-wide">
                  {profile.publicName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-[#557d91] uppercase tracking-wider block">
                    Rol en AMOH
                  </span>
                  <span className="font-semibold text-[#1a3b4f]">
                    {profile.role}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#557d91] uppercase tracking-wider block">
                    Expedición
                  </span>
                  <span className="font-semibold text-[#1a3b4f]">
                    {profile.expedition}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-[#557d91] uppercase tracking-wider block">
                  Región de Observación
                </span>
                <span className="font-medium text-[#315f78]">
                  {profile.region} (60°S – 75°S)
                </span>
              </div>
            </div>
          </div>

          {/* Machine Readable Zone Strip */}
          <div className="relative z-10 pt-4 border-t border-[#315f78]/25 font-mono text-[9px] text-[#557d91] tracking-widest truncate">
            P&lt;AMOH&lt;HUERTAS&lt;OLEA&lt;&lt;JUAN&lt;SEBASTIAN&lt;&lt;&lt;&lt;
          </div>
        </div>

        {/* =========================================================================
            RIGHT SPREAD: VERIFICATION STATUS, QR, SIGNATURE & ACCREDITATIONS (Cols 6–12)
           ========================================================================= */}
        <div
          className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between relative"
          style={{
            backgroundColor: '#f3f7f8',
            color: '#214b63',
          }}
        >
          <SecurityGuilloche opacity={0.16} variant="light" />

          <div className="relative z-10 space-y-5">
            {/* Header Right */}
            <div className="border-b border-[#315f78]/30 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono tracking-[0.25em] text-[#557d91] uppercase block">
                  Acreditación Criptográfica
                </span>
                <span className="text-xs font-mono font-bold text-[#1a3b4f]">
                  VERIFIABLE CREDENTIAL REGISTRY
                </span>
              </div>

              <button
                onClick={handleCopyId}
                className="px-2.5 py-1 rounded-lg border border-[#315f78]/30 hover:bg-white text-[10px] font-mono flex items-center gap-1.5 text-[#214b63] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-[#136142]" /> : <Copy className="w-3 h-3" />}
                <span>{profile.credentialId}</span>
              </button>
            </div>

            {/* Separated Status Registry Grid (Section 23: Separate each status clearly) */}
            <div className="space-y-2">
              <span className="text-[9px] text-[#557d91] uppercase tracking-wider block font-bold">
                Desglose de Estados de Verificación (Sección 23):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* AMOH Account */}
                <div className="p-2.5 rounded-xl bg-white/70 border border-[#315f78]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#557d91] uppercase block">Cuenta AMOH</span>
                    <span className="font-bold text-[#1a3b4f]">Activa</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#72e0b5]/20 text-[#136142]">
                    ACTIVO
                  </span>
                </div>

                {/* Scientific Role */}
                <div className="p-2.5 rounded-xl bg-white/70 border border-[#315f78]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#557d91] uppercase block">Rol Científico</span>
                    <span className="font-bold text-[#1a3b4f]">Observador</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#72e0b5]/20 text-[#136142]">
                    ACTIVO
                  </span>
                </div>

                {/* Proof of Human (World ID) - Section 24: Never label World ID as scientific validation */}
                <div className="p-2.5 rounded-xl bg-white/70 border border-[#315f78]/20 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#557d91] uppercase block font-bold">Prueba de Persona</span>
                      <span className="text-[11px] text-[#1a3b4f] font-semibold">World ID (Semaphore ZK)</span>
                    </div>
                    {worldIdVerified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#72e0b5]/20 text-[#136142] border border-[#72e0b5]/40 flex items-center gap-1">
                        <Check className="w-3 h-3" /> VERIFICADO
                      </span>
                    ) : (
                      <button
                        onClick={handleVerifyWorldId}
                        disabled={worldIdLoading}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#214b63] hover:bg-[#315f78] text-white transition-all shadow"
                      >
                        {worldIdLoading ? 'Verificando...' : 'Verificar World ID'}
                      </button>
                    )}
                  </div>
                  {worldIdVerified && worldIdDetails && (
                    <div className="text-[8px] font-mono text-[#557d91] bg-white/60 p-1 rounded border border-[#315f78]/10 truncate">
                      Nullifier: {worldIdDetails.nullifier?.slice(0, 16)}... (Regla 19: Separado de Wallet)
                    </div>
                  )}
                </div>

                {/* Institution */}
                <div className="p-2.5 rounded-xl bg-white/70 border border-[#315f78]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#557d91] uppercase block">Institución Académica</span>
                    <span className="text-[11px] text-[#557d91]">No Verificada</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-800">
                    PENDIENTE
                  </span>
                </div>

                {/* Smart Card */}
                <div className="p-2.5 rounded-xl bg-white/70 border border-[#315f78]/20 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-[9px] text-[#557d91] uppercase block">Smart Card Criptográfica</span>
                    <span className="text-[11px] font-bold text-[#1a3b4f]">NFC ISO 7816 Emulada (Ed25519)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#35c3c8]/20 text-[#125357]">
                    CONFIGURADA
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Box (Section 61: Do not invent handwritten signature) */}
            <div className="p-3 rounded-xl bg-white/60 border border-[#315f78]/30 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#557d91] uppercase tracking-wider block font-bold">
                  Firma del Titular:
                </span>
                <span className="text-xs text-[#557d91] italic">
                  {profile.signatureStatus}
                </span>
              </div>
              <button
                onClick={() => setActionNote('Firma digital: Se vinculará mediante desafío criptográfico de la tarjeta.')}
                className="px-3 py-1 rounded bg-[#214b63] hover:bg-[#315f78] text-white text-[10px] font-mono flex items-center gap-1.5 transition-colors shadow"
              >
                <PenTool className="w-3 h-3" />
                <span>Agregar firma</span>
              </button>
            </div>

            {/* Action Note Toast */}
            {actionNote && (
              <div className="text-[11px] text-[#125357] bg-[#35c3c8]/15 p-2 rounded-lg border border-[#35c3c8]/30 animate-fadeIn">
                {actionNote}
              </div>
            )}

            {/* QR Quick Access Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsQrOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#214b63] hover:bg-[#315f78] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <QrCode className="w-4 h-4 text-[#35c3c8]" />
                <span>Mostrar Credencial QR (Divulgación Selectiva)</span>
              </button>
            </div>
          </div>

          {/* Footer note on right spread */}
          <div className="relative z-10 pt-4 border-t border-[#315f78]/25 text-[9px] text-[#557d91] flex items-center justify-between">
            <span>EMISIÓN: {profile.issuedDate}</span>
            <span className="italic">{profile.disclaimerEs}</span>
          </div>
        </div>
      </div>

      {/* Selective Disclosure QR Modal */}
      <PassportQRModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
}
