import { useState, type ReactNode } from 'react';
import {
  Smartphone,
  Cpu,
  Radio,
  Battery,
  Plus,
  Trash2,
  CheckCircle2,
  QrCode,
  X,
} from 'lucide-react';
import {
  SEED_EXPEDITION_DEVICES,
  type ExpeditionDevice,
  type SamplingProfile,
} from './expeditions-data';

export default function ExpeditionDevices(): ReactNode {
  const [devices, setDevices] = useState<ExpeditionDevice[]>(SEED_EXPEDITION_DEVICES);
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleProfileChange = (deviceId: string, profile: SamplingProfile) => {
    setDevices((prev) =>
      prev.map((d) => (d.deviceId === deviceId ? { ...d, samplingProfile: profile } : d))
    );
    setFeedback(`Perfil de muestreo actualizado a ${profile} para el dispositivo seleccionado.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleRevokeDevice = (deviceId: string) => {
    if (confirm('¿Deseas revocar el certificado de este dispositivo? Los registros previos se preservarán en la pista de auditoría.')) {
      setDevices((prev) =>
        prev.map((d) => (d.deviceId === deviceId ? { ...d, trustState: 'REVOKED' } : d))
      );
      setFeedback('Dispositivo revocado. Su clave criptográfica ha sido invalidada para nuevos registros.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#00e5ff]" />
            <span>Centro de Dispositivos & Sensores de Campo</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Gestión de terminales Level 1 (PWA), Level 2 (Field Node móvil) y Level 3 (nodo edge / sensores externos opcionales).
          </p>
        </div>

        <button
          onClick={() => setPairingModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Emparejar Nuevo Dispositivo</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-[#72e0b5]/15 border border-[#72e0b5]/40 text-[#72e0b5] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Device Architecture Tier Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-[#081724] border border-[#1b3543] space-y-1">
          <div className="text-[10px] font-bold uppercase text-[#00e5ff]">Level 1: Web PWA</div>
          <p className="text-white font-bold">Navegador Móvil / Offline Cache</p>
          <p className="text-[11px] text-[#8faab5] font-sans">
            Captura fotográfica manual, GPS esporádico y notas. Cero instalación requerida.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#081724] border border-[#1b3543] space-y-1">
          <div className="text-[10px] font-bold uppercase text-[#72e0b5]">Level 2: Field Node móvil</div>
          <p className="text-white font-bold">Teléfono dedicado al proyecto</p>
          <p className="text-[11px] text-[#8faab5] font-sans">
            GNSS con precisión, marca de tiempo UTC, fotografía y registro estructurado con cola local offline.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#081724] border border-[#1b3543] space-y-1">
          <div className="text-[10px] font-bold uppercase text-[#38bdf8]">Level 3: Sensores Externos</div>
          <p className="text-white font-bold">Nodo edge / sensores opcionales</p>
          <p className="text-[11px] text-[#8faab5] font-sans">
            Cómputo y respaldo locales. NG-LEX no se conecta a sistemas del buque (sin NMEA, AIS interno ni telemetría de puente).
          </p>
        </div>
      </div>

      {/* Devices List */}
      <div className="space-y-4">
        <span className="text-[10px] uppercase font-bold text-[#8faab5] block">
          Dispositivos Activos en la Campaña ({devices.length})
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map((dev) => (
            <div
              key={dev.deviceId}
              className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                dev.trustState === 'PAIRED'
                  ? 'bg-[#081724] border-[#183140]'
                  : dev.trustState === 'REVOKED'
                  ? 'bg-[#150a0a] border-[#3d1a1a] opacity-60'
                  : 'bg-[#081724] border-[#183140] opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#142836] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#00e5ff]">
                      {dev.deviceClass === 'LEVEL_2_ANDROID_FIELD_NODE' || dev.deviceClass === 'LEVEL_2_IOS_FIELD_NODE' ? (
                        <Cpu className="w-4 h-4 text-[#72e0b5]" />
                      ) : dev.deviceClass === 'LEVEL_1_WEB_PWA' ? (
                        <Smartphone className="w-4 h-4 text-[#00e5ff]" />
                      ) : (
                        <Radio className="w-4 h-4 text-[#38bdf8]" />
                      )}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white font-sans">
                        {dev.displayName}
                      </h3>
                      <span className="text-[10px] text-[#8faab5] font-mono">
                        {dev.deviceClass} · {dev.ownerName}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dev.trustState === 'PAIRED'
                        ? 'bg-[#72e0b5]/15 text-[#72e0b5]'
                        : dev.trustState === 'REVOKED'
                        ? 'bg-[#ef4444]/15 text-[#ef4444]'
                        : 'bg-[#f59e0b]/15 text-[#f59e0b]'
                    }`}
                  >
                    {dev.trustState}
                  </span>
                </div>

                {/* Battery & Health */}
                {dev.batteryPct !== undefined && (
                  <div className="pt-3 flex items-center justify-between text-xs text-[#8faab5]">
                    <div className="flex items-center gap-1.5">
                      <Battery className="w-4 h-4 text-[#72e0b5]" />
                      <span className="text-white font-bold">{dev.batteryPct}%</span>
                    </div>
                    <span>{dev.pendingRecordsCount} en cola</span>
                  </div>
                )}

                {/* Sampling Profile Picker */}
                <div className="pt-3 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#8faab5] block">
                    Perfil de Batería & Muestreo
                  </label>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {(['ECO', 'SURVEY', 'BURST'] as SamplingProfile[]).map((prof) => (
                      <button
                        key={prof}
                        disabled={dev.trustState === 'REVOKED'}
                        onClick={() => handleProfileChange(dev.deviceId, prof)}
                        className={`py-1.5 rounded-lg font-bold transition-all ${
                          dev.samplingProfile === prof
                            ? prof === 'BURST'
                              ? 'bg-[#f59e0b] text-[#050e14]'
                              : 'bg-[#00e5ff] text-[#050e14]'
                            : 'bg-[#050f16] border border-[#132734] text-[#8faab5] hover:text-white'
                        }`}
                      >
                        {prof}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granted Permissions Chips */}
                <div className="pt-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8faab5] block">
                    Permisos Otorgados
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(dev.permissions)
                      .filter(([, allowed]) => allowed)
                      .map(([permKey]) => (
                        <span
                          key={permKey}
                          className="px-2 py-0.5 rounded bg-[#050e14] border border-[#142836] text-[9px] text-[#38bdf8]"
                        >
                          {permKey}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Footer / Revoke */}
              <div className="pt-3 border-t border-[#142836] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#6b8896]">
                  {dev.publicKey ? `${dev.publicKey.slice(0, 16)}...` : 'sin emparejar'}
                </span>
                {dev.trustState !== 'REVOKED' && (
                  <button
                    onClick={() => handleRevokeDevice(dev.deviceId)}
                    className="text-[#ef4444] hover:underline text-[11px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revocar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pairing Modal */}
      {pairingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
          <div className="bg-[#091824] border border-[#213f4f] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1b3543] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#00e5ff]" />
                <h3 className="text-sm font-bold text-white">
                  EMPAREJAR NODO DE CAMPO
                </h3>
              </div>
              <button
                onClick={() => setPairingModalOpen(false)}
                className="text-[#8faab5] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#040e16] border border-[#142836] flex flex-col items-center text-center space-y-3">
              <span className="text-[11px] text-[#72e0b5] font-bold">
                Reto Criptográfico Temporal (Válido por 10 min)
              </span>
              <div className="p-3 bg-white rounded-xl">
                <QrCode className="w-36 h-36 text-black" />
              </div>
              <span className="text-[10px] text-[#8faab5] font-mono break-all">
                TOKEN: challenge-ed25519-amoh-exp-2027-ship-edge
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-white block">
                Consentimientos y Permisos Obligatorios:
              </span>
              <ul className="text-[11px] text-[#8faab5] space-y-1 font-sans">
                <li>&bull; Acceso GPS de alta precisión en cubierta</li>
                <li>&bull; Almacenamiento local SQLite / Room offline</li>
                <li>&bull; Sincronización en red LAN del buque</li>
                <li className="text-[#f59e0b]">&bull; Datos biométricos/salud: DESACTIVADOS POR DEFECTO</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setPairingModalOpen(false);
                setFeedback('¡Nuevo dispositivo Field Node registrado y enlazado!');
                setTimeout(() => setFeedback(null), 3000);
              }}
              className="w-full py-2.5 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all"
            >
              Confirmar Emparejamiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
