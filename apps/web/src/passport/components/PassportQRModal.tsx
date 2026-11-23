import { useState, useEffect } from 'react';
import { X, QrCode, Check, Copy, ExternalLink } from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from '../passport-data';

interface PassportQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PassportQRModal: React.FC<PassportQRModalProps> = ({
  isOpen,
  onClose,
}) => {
  const profile = INITIAL_PASSPORT_PROFILE;

  // Selective disclosure checkboxes (Section 45: DEFAULT: MINIMUM INFORMATION)
  const [discloseName, setDiscloseName] = useState(true);
  const [discloseRole, setDiscloseRole] = useState(true);
  const [discloseExpedition, setDiscloseExpedition] = useState(false);
  const [discloseObservations, setDiscloseObservations] = useState(false);
  const [discloseStamps, setDiscloseStamps] = useState(false);
  const [discloseHumanProof, setDiscloseHumanProof] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build verification URL challenge with selective disclosures
  const claimsParam = [
    discloseName ? 'name' : null,
    discloseRole ? 'role' : null,
    discloseExpedition ? 'exp' : null,
    discloseObservations ? 'obs' : null,
    discloseStamps ? 'stamps' : null,
    discloseHumanProof ? 'human' : null,
  ].filter(Boolean).join(',');

  const verificationUrl = `${window.location.origin}/passport/verify?c=amoh-2026-auth&claims=${encodeURIComponent(claimsParam)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#091824] border border-[#214358] p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-[#e8f0f3] font-mono space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-[#8faab5] hover:text-white hover:bg-[#122b3b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#35c3c8]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#35c3c8]/10 border border-[#35c3c8]/30 text-[#35c3c8] flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 id="qr-modal-title" className="text-sm font-bold text-white tracking-wider uppercase">
              Credencial Criptográfica QR
            </h2>
            <p className="text-[11px] text-[#8faab5]">
              Divulgación selectiva de identidad científica
            </p>
          </div>
        </div>

        {/* QR Code Graphic (SVG based, pointing to verificationUrl) */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#050e17] border border-[#1a384b]">
          <div className="p-3 bg-white rounded-xl shadow-inner">
            {/* Clean SVG QR pattern */}
            <svg viewBox="0 0 140 140" className="w-40 h-40">
              {/* Position Detection Patterns */}
              <rect x="10" y="10" width="35" height="35" fill="#0b2638" rx="4" />
              <rect x="15" y="15" width="25" height="25" fill="#ffffff" />
              <rect x="20" y="20" width="15" height="15" fill="#0b2638" />

              <rect x="95" y="10" width="35" height="35" fill="#0b2638" rx="4" />
              <rect x="100" y="15" width="25" height="25" fill="#ffffff" />
              <rect x="105" y="20" width="15" height="15" fill="#0b2638" />

              <rect x="10" y="95" width="35" height="35" fill="#0b2638" rx="4" />
              <rect x="15" y="100" width="25" height="25" fill="#ffffff" />
              <rect x="20" y="105" width="15" height="15" fill="#0b2638" />

              {/* Data modules */}
              <g fill="#0b2638">
                <rect x="52" y="15" width="6" height="6" />
                <rect x="62" y="15" width="6" height="6" />
                <rect x="75" y="15" width="6" height="6" />
                <rect x="52" y="25" width="6" height="6" />
                <rect x="75" y="25" width="6" height="6" />
                <rect x="52" y="35" width="6" height="6" />
                <rect x="65" y="35" width="6" height="6" />

                <rect x="15" y="52" width="6" height="6" />
                <rect x="25" y="52" width="6" height="6" />
                <rect x="35" y="52" width="6" height="6" />
                <rect x="45" y="52" width="6" height="6" />
                <rect x="55" y="52" width="6" height="6" />
                <rect x="75" y="52" width="6" height="6" />
                <rect x="95" y="52" width="6" height="6" />
                <rect x="115" y="52" width="6" height="6" />

                <rect x="55" y="65" width="30" height="10" rx="2" fill="#35c3c8" />
                <text x="70" y="72" textAnchor="middle" fill="#050e14" fontSize="5" fontWeight="bold">AMOH</text>

                <rect x="15" y="75" width="6" height="6" />
                <rect x="35" y="75" width="6" height="6" />
                <rect x="95" y="75" width="6" height="6" />
                <rect x="115" y="75" width="6" height="6" />

                <rect x="52" y="95" width="6" height="6" />
                <rect x="72" y="95" width="6" height="6" />
                <rect x="85" y="95" width="6" height="6" />
                <rect x="62" y="105" width="6" height="6" />
                <rect x="85" y="105" width="6" height="6" />
                <rect x="52" y="115" width="6" height="6" />
                <rect x="72" y="115" width="6" height="6" />
              </g>
            </svg>
          </div>
          <span className="mt-3 text-[10px] text-[#8faab5]">
            {profile.credentialId} · Vigencia: 5 minutos
          </span>
        </div>

        {/* Selective Disclosure Toggles */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-[#6c8a99]">
            Datos a divulgar en el escaneo:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-xl bg-[#0e2230] border border-[#1c3c50] cursor-pointer hover:bg-[#142e40] transition-colors">
              <input
                type="checkbox"
                checked={discloseName}
                onChange={(e) => setDiscloseName(e.target.checked)}
                className="rounded accent-[#35c3c8]"
              />
              <span className="truncate">Nombre Público</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-[#0e2230] border border-[#1c3c50] cursor-pointer hover:bg-[#142e40] transition-colors">
              <input
                type="checkbox"
                checked={discloseRole}
                onChange={(e) => setDiscloseRole(e.target.checked)}
                className="rounded accent-[#35c3c8]"
              />
              <span className="truncate">Rol Observador</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-[#0e2230] border border-[#1c3c50] cursor-pointer hover:bg-[#142e40] transition-colors">
              <input
                type="checkbox"
                checked={discloseExpedition}
                onChange={(e) => setDiscloseExpedition(e.target.checked)}
                className="rounded accent-[#35c3c8]"
              />
              <span className="truncate">Expedición</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-[#0e2230] border border-[#1c3c50] cursor-pointer hover:bg-[#142e40] transition-colors">
              <input
                type="checkbox"
                checked={discloseObservations}
                onChange={(e) => setDiscloseObservations(e.target.checked)}
                className="rounded accent-[#35c3c8]"
              />
              <span className="truncate">Observaciones</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-[#0e2230] border border-[#1c3c50] cursor-pointer hover:bg-[#142e40] transition-colors">
              <input
                type="checkbox"
                checked={discloseStamps}
                onChange={(e) => setDiscloseStamps(e.target.checked)}
                className="rounded accent-[#35c3c8]"
              />
              <span className="truncate">Sellos (6)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-[#0e2230] border border-[#1c3c50] cursor-pointer hover:bg-[#142e40] transition-colors opacity-75">
              <input
                type="checkbox"
                checked={discloseHumanProof}
                onChange={(e) => setDiscloseHumanProof(e.target.checked)}
                className="rounded accent-[#35c3c8]"
              />
              <span className="truncate">Prueba Humana (Opt)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#214358] bg-[#0c1e2b] hover:bg-[#132c3f] text-[#35c3c8] text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-[#72e0b5]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'URL Copiada' : 'Copiar Enlace'}</span>
          </button>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-[#35c3c8] hover:bg-[#48d2d7] text-[#050e14] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>Verificar</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Security Notice */}
        <div className="text-[9px] text-[#6c8a99] text-center italic">
          {profile.disclaimerEs}
        </div>
      </div>
    </div>
  );
};

export default PassportQRModal;
