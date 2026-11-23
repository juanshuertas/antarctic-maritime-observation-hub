import React from 'react';
import { getCanonicalLayerMeta } from '../lib/olea-canonical-layer-tree';
import { X, ExternalLink, Database, Activity, Compass, ShieldCheck, Check, Copy } from 'lucide-react';
import { getLayerSemantics, type LayerSemanticMetadata } from '../lib/layer-semantics';
import AgencyBadge from './AgencyBadge';

interface LayerDetailModalProps {
  layerId: string | null;
  onClose: () => void;
  isActive?: boolean;
  onToggleActive?: (layerId: string) => void;
}

export const LayerDetailModal: React.FC<LayerDetailModalProps> = ({
  layerId,
  onClose,
  isActive = false,
  onToggleActive,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!layerId) return null;
  const meta: LayerSemanticMetadata | null = getLayerSemantics(layerId);
  const canonicalMeta = getCanonicalLayerMeta(layerId);

  const handleCopyEndpoint = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fallback if layer is not in the semantics dictionary yet
  const title = meta?.name || layerId;
  const sdgNumber = meta?.sdg || 14;
  const sdgColor = meta?.sdgColor || '#0A97D9';
  const sdgIconUrl = meta?.sdgIconUrl || `/sdg-icons/${sdgNumber}.png`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        className="bg-[#050f18] border border-[#1e384b] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e2edf3]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header with SDG banner and agency logo */}
        <div
          className="p-5 border-b border-[#1b3447] flex items-start justify-between gap-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${sdgColor}18 0%, #050f18 80%)`,
          }}
        >
          {/* Subtle accent border top */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: sdgColor }}
          />

          <div className="flex items-center gap-4 min-w-0">
            {/* UN SDG Official Icon */}
            <div className="relative group shrink-0">
              <img
                src={sdgIconUrl}
                alt={meta?.sdgTitle || `ODS ${sdgNumber}`}
                className="w-14 h-14 rounded-xl shadow-lg border border-white/20 object-cover bg-black/40"
                onError={(e) => {
                  // Fallback to stylized box if image missing
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div
                className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black text-white shadow-md border border-black/40"
                style={{ backgroundColor: sdgColor }}
              >
                ODS {sdgNumber}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {meta?.agency && <AgencyBadge agency={meta.agency} showFullName size="xs" />}
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#7392a4] px-1.5 py-0.5 rounded bg-[#0b1f2e] border border-[#163347]">
                  {meta?.category || 'CAPA TEMÁTICA'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide truncate">{title}</h2>
              <p className="text-xs font-mono text-[#8faab5]">ID: {layerId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0b1f2e] hover:bg-[#163b57] text-[#8faab5] hover:text-white transition-colors shrink-0"
            title="Cerrar Ficha Técnica"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* OLEA_CANONICAL_META_CARD */}
          {canonicalMeta && (
            <section className="bg-[#071521] border border-[#1b4253] rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#67e8f9] mb-2">OLEA · CLASIFICACIÓN CANÓNICA</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-lg bg-[#0a1d2a] border border-[#183748] p-2"><div className="text-[9px] uppercase text-[#6f91a4]">Dominio</div><div className="text-xs font-mono text-white">{canonicalMeta.domain}</div></div>
                <div className="rounded-lg bg-[#0a1d2a] border border-[#183748] p-2"><div className="text-[9px] uppercase text-[#6f91a4]">Grupo</div><div className="text-xs font-mono text-white">{canonicalMeta.group}</div></div>
                <div className="rounded-lg bg-[#0a1d2a] border border-[#183748] p-2"><div className="text-[9px] uppercase text-[#6f91a4]">Rol científico</div><div className="text-xs font-mono text-[#72e0b5]">{canonicalMeta.role}</div></div>
              </div>
            </section>
          )}

          {/* 1. ¿Qué es este dato? */}
          <section className="bg-[#081826] border border-[#173347] rounded-xl p-4 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00e5ff] flex items-center gap-2 font-mono">
              <Compass className="w-4 h-4 text-[#00e5ff]" />
              <span>1. ¿QUÉ ES ESTE DATO?</span>
            </h3>
            <p className="text-xs leading-relaxed text-[#cadde6]">
              {meta?.whatIsIt ||
                'Capa de telemetría e información geográfica georreferenciada para el Océano Austral y la Antártida.'}
            </p>
          </section>

          {/* 2. ¿Para qué sirve? */}
          <section className="bg-[#081826] border border-[#173347] rounded-xl p-4 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#34d399] flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4 text-[#34d399]" />
              <span>2. ¿PARA QUÉ SIRVE EN LA ANTÁRTIDA?</span>
            </h3>
            <p className="text-xs leading-relaxed text-[#cadde6]">
              {meta?.purpose ||
                'Monitoreo ambiental, seguridad de la navegación polar y cumplimiento de los acuerdos del Tratado Antártico.'}
            </p>
          </section>

          {/* 3. Lógica Visual & ODS */}
          <section className="bg-[#081826] border border-[#173347] rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbbf24] flex items-center gap-2 font-mono">
              <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
              <span>3. LÓGICA DE REPRESENTACIÓN & VINCULACIÓN ODS</span>
            </h3>
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#040c14] border border-[#112738]">
              <div
                className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: sdgColor }}
              />
              <span className="text-xs font-semibold text-white">
                {meta?.sdgTitle || `ODS ${sdgNumber}`}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#8faab5]">
              {meta?.visualLogic ||
                'Visualización en el lienzo WebGL de MapLibre con atributos de escala de visualización continua.'}
            </p>
          </section>

          {/* 4. Ficha Técnica */}
          {meta?.techSpecs && (
            <section className="bg-[#081826] border border-[#173347] rounded-xl p-4 space-y-3 font-mono text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#93c5fd] flex items-center gap-2 font-mono">
                <Database className="w-4 h-4 text-[#93c5fd]" />
                <span>4. ESPECIFICACIONES TÉCNICAS & PROCEDENCIA</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#040c14] border border-[#122b3d]">
                  <span className="text-[#648496] block text-[10px]">SENSOR / MÉTODO:</span>
                  <span className="text-white font-medium">{meta.techSpecs.sensorOrMethod}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#040c14] border border-[#122b3d]">
                  <span className="text-[#648496] block text-[10px]">COBERTURA / RESOLUCIÓN:</span>
                  <span className="text-white font-medium">{meta.techSpecs.spatialCoverage}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#040c14] border border-[#122b3d]">
                  <span className="text-[#648496] block text-[10px]">FRECUENCIA DE ACTUALIZACIÓN:</span>
                  <span className="text-white font-medium">{meta.techSpecs.temporalResolution}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#040c14] border border-[#122b3d]">
                  <span className="text-[#648496] block text-[10px]">SISTEMA DE REFERENCIA (CRS):</span>
                  <span className="text-[#00e5ff] font-bold">{meta.techSpecs.originalCrs}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#040c14] border border-[#122b3d] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[#648496] block text-[10px]">ENDPOINT LOCAL / ARCHIVO:</span>
                  <span className="text-white text-[10px] truncate block font-mono">
                    {meta.techSpecs.sourceEndpoint}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyEndpoint(meta.techSpecs.sourceEndpoint)}
                  className="px-2 py-1 rounded bg-[#102d42] hover:bg-[#194566] text-[#00e5ff] flex items-center gap-1 shrink-0 text-[10px]"
                  title="Copiar ruta"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="text-[10px] text-[#648496] pt-1">
                <span className="text-[#8faab5]">Licencia de datos:</span> {meta.techSpecs.license}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1b3447] bg-[#030c14] flex items-center justify-between gap-3">
          {meta?.agency.website && (
            <a
              href={meta.agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#8faab5] hover:text-[#00e5ff] flex items-center gap-1.5 transition-colors"
            >
              <span>Portal {meta.agency.code}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {onToggleActive && (
              <button
                onClick={() => onToggleActive(layerId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-[#00e5ff] text-black font-extrabold hover:bg-[#48edff] shadow-lg shadow-[#00e5ff]/20'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isActive ? 'bg-rose-400' : 'bg-black'}`}
                />
                <span>{isActive ? 'Desactivar Capa' : 'Activar en el Mapa'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0e2436] hover:bg-[#163750] text-[#c0d4df] text-xs font-mono transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerDetailModal;
