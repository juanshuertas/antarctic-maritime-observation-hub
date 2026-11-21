import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Radio,
  Satellite,
  Copy,
  Check,
  User,
  ArrowLeft,
  Mail,
  Shield,
} from 'lucide-react';
import {
  SEED_PAC_COMMS,
  type CommsContact,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionComms(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [contacts] = useState<CommsContact[]>(SEED_PAC_COMMS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30 flex items-center gap-1">
              <Radio className="w-3 h-3" />
              <span>CANALES VHF & MATRIZ DE ENLACE DE EMERGENCIA</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Comunicaciones Navales, Radio Marina y Directorio Satelital
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Matriz de contacto jerárquica con el puente de mando de buques ARC (Armada de Colombia), estaciones científicas aliadas y el Centro de Operaciones CCO Bogotá.
          </p>
        </div>

        <Link
          to={`/expeditions/${expeditionId}/readiness`}
          className="px-3.5 py-2 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-xs text-[#d8e7ee] flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>Volver a Matriz</span>
        </Link>
      </div>

      {/* VHF Maritime Standard Channels Guide */}
      <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00e5ff]" />
            <span>Frecuencias y Canales Marinos Primarios en Zona de Operaciones</span>
          </h3>
          <span className="text-xs text-[#8faab5]">
            Plan de Radio Frecuencias Aprobado por Oficial de Navegación
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#091b29] border border-[#193345] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white font-mono">VHF CH 16 (156.800 MHz)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ef4444]/20 text-[#ef4444]">
                SOCORRO INTERNACIONAL
              </span>
            </div>
            <p className="text-[#8faab5] text-[11px]">
              Escucha permanente en puente y terminales portátiles de cubierta. Llamada inicial de socorro y seguridad náutica (MAYDAY / PAN-PAN).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#091b29] border border-[#193345] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white font-mono">VHF CH 06 / 14</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b]">
                OPERACIONES BUQUE
              </span>
            </div>
            <p className="text-[#8faab5] text-[11px]">
              Coordinación interbuque y maniobras de embarcaciones menores (zódiacs de desembarco hacia estaciones de muestreo).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#091b29] border border-[#193345] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white font-mono">VHF CH 72 (156.625 MHz)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e5ff]/20 text-[#00e5ff]">
                AMOH CIENTÍFICO
              </span>
            </div>
            <p className="text-[#8faab5] text-[11px]">
              Canal privado no comercial asignado para coordinación científica, verificación de telemetría y sincronización entre equipos.
            </p>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <User className="w-4 h-4 text-[#00e5ff]" />
            <span>Directorio de Jerarquía Operacional ({contacts.length})</span>
          </h3>
          <span className="text-xs text-[#10b981] font-bold">
            Disponible Offline en Memoria Local
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((c, idx) => (
            <div
              key={`${c.role}-${idx}`}
              className="p-4 rounded-xl bg-[#091b29] border border-[#1a3447] hover:border-[#244b63] transition-colors space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] text-[#00e5ff] font-mono font-bold uppercase flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    <span>{c.role}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-sans">{c.name}</h4>
                  <div className="text-[11px] text-[#8faab5] font-mono">Indicativo: {c.callsign}</div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  {c.offlineAvailable ? 'Offline OK' : 'Requiere Sat'}
                </span>
              </div>

              {/* Channels */}
              <div className="space-y-1.5 pt-1 font-mono text-[11px]">
                {c.vhfChannel && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#050f16] border border-[#122432]">
                    <span className="text-[#8faab5] flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#00e5ff]" />
                      <span>{c.vhfChannel}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(`${c.role}-vhf`, c.vhfChannel)}
                      className="text-[#567a8c] hover:text-[#00e5ff] p-1"
                      title="Copiar frecuencia"
                    >
                      {copiedKey === `${c.role}-vhf` ? (
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {c.satPhone && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#050f16] border border-[#122432]">
                    <span className="text-[#8faab5] flex items-center gap-1.5">
                      <Satellite className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>{c.satPhone}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(`${c.role}-sat`, c.satPhone!)}
                      className="text-[#567a8c] hover:text-[#00e5ff] p-1"
                      title="Copiar teléfono satelital"
                    >
                      {copiedKey === `${c.role}-sat` ? (
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {c.email && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#050f16] border border-[#122432]">
                    <span className="text-[#8faab5] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#a855f7]" />
                      <span className="truncate max-w-[200px]">{c.email}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(`${c.role}-email`, c.email)}
                      className="text-[#567a8c] hover:text-[#00e5ff] p-1"
                      title="Copiar email"
                    >
                      {copiedKey === `${c.role}-email` ? (
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
