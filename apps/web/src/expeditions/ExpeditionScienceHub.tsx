import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Radio,
  Wifi,
  ExternalLink,
  ShieldCheck,
  Copy,
  CheckCircle2,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { INITIAL_SYNC_STATE, SEED_NATGEO_EXPEDITION } from './expeditions-data';

export default function ExpeditionScienceHub(): ReactNode {
  const [networkMode, setNetworkMode] = useState<'LAN' | 'CLOUD'>('LAN');
  const [copied, setCopied] = useState(false);
  const [lanIp, setLanIp] = useState(INITIAL_SYNC_STATE.shipEdgeIp);

  const targetUrl =
    networkMode === 'LAN'
      ? `http://${lanIp}:5174/contribute?expedition=${SEED_NATGEO_EXPEDITION.expeditionId}`
      : `https://amoh.antarctica/contribute?expedition=${SEED_NATGEO_EXPEDITION.expeditionId}`;

  // Mathematical SVG QR Code Simulation with distinctive finder patterns
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    targetUrl
  )}&bgcolor=081724&color=00e5ff&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#00e5ff] text-xs font-bold uppercase tracking-widest mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Portal de Despliegue & Onboarding de Campo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
            Science Hub QR · A Bordo del Buque
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Vinculación instantánea de dispositivos móviles para recolección de datos en navegación sin internet.
          </p>
        </div>

        <Link
          to={`/contribute?expedition=${SEED_NATGEO_EXPEDITION.expeditionId}`}
          target="_blank"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#72e0b5] hover:text-white hover:border-[#72e0b5] text-xs flex items-center gap-2 transition-colors"
        >
          <span>Abrir Formulario de Contribución</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Grid: QR Card (5 Cols) & Architectural Context (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: The QR Code Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          {/* Subtle Polar Grid */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#72e0b5] block">
              ESCANEA · OBSERVA · CONTRIBUYE
            </span>
            <h3 className="text-lg font-bold text-white font-sans">
              AMOH Field Connect PWA
            </h3>
          </div>

          {/* Network Target Selector */}
          <div className="flex items-center bg-[#050f16] p-1 rounded-xl border border-[#142836] text-xs w-full max-w-xs">
            <button
              onClick={() => setNetworkMode('LAN')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                networkMode === 'LAN'
                  ? 'bg-[#00e5ff] text-[#050e14] shadow'
                  : 'text-[#8faab5] hover:text-white'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Ship LAN (Local)</span>
            </button>
            <button
              onClick={() => setNetworkMode('CLOUD')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                networkMode === 'CLOUD'
                  ? 'bg-[#00e5ff] text-[#050e14] shadow'
                  : 'text-[#8faab5] hover:text-white'
              }`}
            >
              <span>Nube (Starlink)</span>
            </button>
          </div>

          {/* QR Container */}
          <div className="p-4 rounded-2xl bg-[#040d14] border-2 border-[#183547] shadow-inner relative group">
            <img
              src={qrSvgUrl}
              alt="QR Code Field Join"
              className="w-56 h-56 rounded-xl object-contain"
              onError={(e) => {
                // Fallback graphic if offline or network blocks image
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Fallback decorative container if offline */}
            <div className="w-56 h-56 rounded-xl bg-[#071722] border border-[#1b3543] flex flex-col items-center justify-center text-xs text-[#8faab5] p-4 space-y-2 hidden only:flex">
              <QrCode className="w-12 h-12 text-[#00e5ff]" />
              <span className="text-[11px] text-white font-bold">QR Offline Local</span>
              <span className="text-[10px] break-all">{targetUrl}</span>
            </div>
          </div>

          {/* Target URL String & Copy Button */}
          <div className="w-full space-y-2">
            <div className="p-2.5 rounded-xl bg-[#050e14] border border-[#132734] text-[11px] text-[#38bdf8] break-all flex items-center justify-between gap-2 text-left">
              <span className="truncate">{targetUrl}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-[#0e2536] hover:bg-[#00e5ff] hover:text-[#050e14] text-[#8faab5] transition-colors flex-shrink-0"
                title="Copiar URL"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#72e0b5]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {networkMode === 'LAN' && (
              <div className="flex items-center justify-between text-[10px] text-[#8faab5] px-1">
                <span>IP del Servidor en el Buque:</span>
                <input
                  type="text"
                  value={lanIp}
                  onChange={(e) => setLanIp(e.target.value)}
                  className="bg-[#050e14] border border-[#1b3543] rounded px-2 py-0.5 text-[#72e0b5] text-right font-bold w-28 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Architectural Rules & Contributor Guides (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Critical LAN Architectural Rule */}
          <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-3">
            <div className="flex items-center gap-2 text-[#72e0b5] text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Regla de Red en Altamar: ¿Por qué Ship LAN IP?</span>
            </div>
            <p className="text-xs text-[#c4d7e0] font-sans leading-relaxed">
              Durante la navegación en canales antárticos remotos, el enlace satelital suele ser nulo o intermitente.
            </p>
            <div className="p-3.5 rounded-2xl bg-[#050f16] border border-[#152c3c] text-xs space-y-2">
              <div className="flex items-start gap-2 text-[#f59e0b]">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Prohibido usar localhost o 127.0.0.1:</strong> Los teléfonos de los investigadores y pasajeros están en la red Wi-Fi local del buque. Usar <code>localhost</code> provocaría que busquen el servidor en su propio teléfono móvil.
                </span>
              </div>
              <p className="text-[11px] text-[#8faab5] font-sans">
                El Science Hub genera el código QR apuntando directamente a la IP local del nodo central a bordo (<code>{lanIp}</code>), permitiendo registrar observaciones y sincronizar con DuckDB Spatial sin conexión a internet.
              </p>
            </div>
          </div>

          {/* Contributor Classes Directory */}
          <div className="p-5 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
            <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00e5ff]" />
              <span>Clases de Contribuyentes & Niveles de Acceso</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#06121b] border border-[#142836] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">1. Investigador Principal / Científico Visitante</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#00e5ff]/15 text-[#00e5ff] font-bold">NIVEL 1</span>
                </div>
                <p className="text-[11px] text-[#8faab5] font-sans">
                  Acceso completo al nodo edge, captura de observaciones de campo, revisión de coincidencias y control de calidad con procedencia.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#06121b] border border-[#142836] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">2. Personal de Expedición / Guías Naturalistas</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#72e0b5]/15 text-[#72e0b5] font-bold">NIVEL 2</span>
                </div>
                <p className="text-[11px] text-[#8faab5] font-sans">
                  Registro de cetáceos, condiciones de hielo, interacción de embarcaciones Zodiac y avisos de maniobra del buque.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#06121b] border border-[#142836] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">3. Invitados & Comunidad Científica Pasajera</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#f59e0b]/15 text-[#f59e0b] font-bold">NIVEL 3</span>
                </div>
                <p className="text-[11px] text-[#8faab5] font-sans">
                  Subida pseudonimizada de fotografías de avistamiento con metadatos EXIF. Clasificadas como <code>COMMUNITY OBSERVATION (Unreviewed)</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
