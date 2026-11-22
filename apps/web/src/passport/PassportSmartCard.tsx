import { useState } from 'react';
import { CreditCard, Wifi, CheckCircle2, Shield, Cpu, Key } from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from './passport-data';
import SmartCardVisual from './components/SmartCardVisual';

export default function PassportSmartCard() {
  const profile = INITIAL_PASSPORT_PROFILE;
  const [tapped, setTapped] = useState(false);
  const [tapLog, setTapLog] = useState<{
    time: string;
    challenge: string;
    signature: string;
    isoStatus: string;
  } | null>(null);

  const handleSimulateTap = () => {
    setTapped(true);
    setTapLog({
      time: new Date().toLocaleTimeString(),
      challenge: '0x8f4c...91b2 (AMOH-CHALLENGE-NONCE)',
      signature: 'ed25519_sig_7e20...a41c',
      isoStatus: 'ISO/IEC 7816-4 APDU 9000 OK',
    });
    setTimeout(() => setTapped(false), 4000);
  };

  return (
    <div className="space-y-8 font-mono animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#1b384c] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#35c3c8] font-bold tracking-wider uppercase mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Hardware Criptográfico de Campo</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Smart Card NFC — Identidad Táctil Polar
          </h1>
          <p className="text-xs text-[#8faab5] mt-1 max-w-2xl">
            Tarjeta física de grafito/azul polar con chip de contacto ISO 7816 y antena NFC. No es un medio de pago, sino una credencial científica inmutable para buques y bases polares.
          </p>
        </div>

        <button
          onClick={handleSimulateTap}
          className="px-5 py-3 rounded-2xl border border-[#35c3c8] bg-[#35c3c8]/15 hover:bg-[#35c3c8]/25 text-[#35c3c8] text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(53,195,200,0.25)] hover:scale-105"
        >
          <Wifi className="w-4 h-4 animate-pulse" />
          <span>Simular Toque NFC (Tap)</span>
        </button>
      </div>

      {/* Main Interactive Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Smart Card Render (Cols 1–6) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-[#091824] border border-[#1d3c4e] shadow-2xl relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-[#8faab5] mb-6">
            <span className="flex items-center gap-1.5 text-[#35c3c8] font-bold">
              <Cpu className="w-4 h-4" />
              <span>EMULADOR DE CHIP CRIPTOGRÁFICO</span>
            </span>
            <span className="text-[10px] text-[#72e0b5]">ISO 7816 / ISO 14443 Type A</span>
          </div>

          {/* Realistic Smart Card Visual */}
          <SmartCardVisual
            interactive
            onClick={handleSimulateTap}
            className={`transition-all duration-300 ${
              tapped ? 'scale-105 shadow-[0_0_50px_rgba(53,195,200,0.4)] border-[#35c3c8]' : ''
            }`}
          />

          <span className="text-[10px] text-[#6c8a99] mt-4 text-center">
            Haz clic en la tarjeta o en el botón superior para simular lectura por proximidad NFC.
          </span>

          {/* Tap Feedback Badge */}
          {tapped && (
            <div className="mt-4 p-3 rounded-xl border border-[#72e0b5]/50 bg-[#72e0b5]/15 text-[#72e0b5] text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>NFC Tap Exitoso · Desafío Ed25519 Firmado Localmente</span>
            </div>
          )}
        </div>

        {/* Right Column: Technical Security Architecture (Cols 7–12) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#091824] border border-[#1d3c4e] space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#35c3c8]" />
              <span>Especificación Técnica de Seguridad</span>
            </h3>

            <div className="space-y-3 text-xs text-[#8faab5]">
              <div className="p-3 rounded-xl bg-[#06121c] border border-[#162d3d] space-y-1">
                <span className="text-[#35c3c8] font-bold block uppercase text-[10px]">
                  Cero Datos Bancarios / Cero Pasarelas Financieras
                </span>
                <p className="text-[#cbd9df] text-[11px] leading-relaxed">
                  Esta credencial nunca mostrará números de cuenta, CVV ni logotipos de pagos. Está diseñada exclusivamente bajo los estándares de investigación antártica internacional.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#06121c] border border-[#162d3d]">
                  <span className="text-[9px] text-[#6c8a99] uppercase block">Criptografía</span>
                  <span className="font-bold text-white">Ed25519 + SHA-512</span>
                </div>

                <div className="p-3 rounded-xl bg-[#06121c] border border-[#162d3d]">
                  <span className="text-[9px] text-[#6c8a99] uppercase block">Protocolo Chip</span>
                  <span className="font-bold text-white">ISO/IEC 7816 Contact</span>
                </div>

                <div className="p-3 rounded-xl bg-[#06121c] border border-[#162d3d]">
                  <span className="text-[9px] text-[#6c8a99] uppercase block">Radioenlace NFC</span>
                  <span className="font-bold text-white">13.56 MHz (NFC-A)</span>
                </div>

                <div className="p-3 rounded-xl bg-[#06121c] border border-[#162d3d]">
                  <span className="text-[9px] text-[#6c8a99] uppercase block">Autenticación</span>
                  <span className="font-bold text-[#72e0b5]">Desafío / Respuesta</span>
                </div>
              </div>

              {tapLog && (
                <div className="p-3.5 rounded-xl bg-[#071926] border border-[#35c3c8]/40 space-y-1.5 font-mono text-[10px] animate-fadeIn">
                  <div className="flex items-center justify-between text-[#35c3c8] font-bold">
                    <span>TELEMETRÍA DE APDU NFC ({tapLog.time})</span>
                    <span className="text-[#72e0b5]">{tapLog.isoStatus}</span>
                  </div>
                  <div className="text-[#8faab5] truncate">
                    <span className="text-[#6c8a99]">Challenge:</span> {tapLog.challenge}
                  </div>
                  <div className="text-[#8faab5] truncate">
                    <span className="text-[#6c8a99]">Firma:</span> {tapLog.signature}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b2230] border border-[#1e465e] flex items-center justify-between text-xs text-[#8faab5]">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#72e0b5]" />
              <span>Titular: <strong className="text-white">{profile.publicName}</strong></span>
            </div>
            <span className="text-[10px] text-[#35c3c8]">{profile.credentialId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
