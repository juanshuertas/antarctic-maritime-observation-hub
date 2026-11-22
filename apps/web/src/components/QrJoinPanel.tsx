import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { api } from '../lib/api';
import { Wifi, AlertTriangle, X } from 'lucide-react';

/**
 * AMOH — QR join panel.
 * Rule 22: QR must not use localhost or 127.0.0.1; must use real local IP.
 * Rule 03: Preserve localhost:5174.
 */
export default function QrJoinPanel({
  expeditionId = 'NGRS-ANTA-2027',
  token = '',
  onClose,
}: {
  expeditionId?: string;
  token?: string;
  onClose?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [host, setHost] = useState(window.location.hostname);
  const [detectedLanIp, setDetectedLanIp] = useState<string | null>(null);

  // Fetch LAN IP from backend so expedition devices on the LAN can connect
  useEffect(() => {
    api.get<{ lan_ip: string }>('/api/field/lan-ip')
      .then((res) => {
        if (res.lan_ip) {
          setDetectedLanIp(res.lan_ip);
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setHost(res.lan_ip);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not auto-fetch LAN IP:', err);
      });
  }, []);

  const targetHost = (host && host !== 'localhost' && host !== '127.0.0.1')
    ? host
    : (detectedLanIp || '127.0.0.1');
  const port = window.location.port ? `:${window.location.port}` : ':5174';
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
  const url = `http://${targetHost}${port}/contribute?expedition=${encodeURIComponent(expeditionId)}${tokenParam}`;

  const isLocalhost = targetHost === 'localhost' || targetHost === '127.0.0.1';

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 148,
        margin: 1,
        color: { dark: '#0a0f1d', light: '#FFFFFF' }
      });
    }
  }, [url]);

  const content = (
    <div
      className="relative rounded-[var(--radius-md)] border p-4 flex gap-4 items-center shadow-2xl bg-[#091b24] border-[#213f4f]"
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-[#8aa5af] hover:text-white rounded hover:bg-[#122b38]"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="relative shrink-0">
        <canvas ref={canvasRef} className="rounded-md border border-white/10" />
        {isLocalhost && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] rounded-md flex flex-col items-center justify-center p-2 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] text-amber-200 font-mono font-bold leading-tight">
              IP Localhost inválida para QR (Regla 22)
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-[#edf5f5]">
        <div className="font-semibold flex items-center gap-2">
          <span>Sumar reportes desde el celular</span>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            En vivo
          </span>
        </div>

        <p className="text-xs text-[#8aa5af]">
          Escanea para abrir el modo de campo en la misma red local. Puedes reportar fauna, hielo o incidentes sin instalar nada.
        </p>

        {detectedLanIp && (
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5" />
            IP de campo detectada: <span className="font-bold">{detectedLanIp}</span>
          </div>
        )}

        <label className="text-[11px] flex items-center gap-2 mt-1 font-mono text-[#8aa5af]">
          IP del edge node:
          <input
            value={host === 'localhost' || host === '127.0.0.1' ? targetHost : host}
            onChange={(e) => setHost(e.target.value)}
            className="rounded border px-2 py-0.5 w-36 font-mono text-xs focus:outline-none focus:border-cyan-400 bg-[#050e14] border-[#213f4f] text-[#00e5ff]"
            placeholder="192.168.x.x"
          />
        </label>

        <div className="flex flex-col gap-0.5 mt-0.5">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] break-all hover:underline font-mono text-[#00e5ff]"
          >
            {url}
          </a>
          {isLocalhost && (
            <span className="text-[10px] text-amber-400 font-sans">
              Ingresa la IP LAN de tu equipo (ej. 192.168.x.x) para que otros dispositivos puedan escanearlo.
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
