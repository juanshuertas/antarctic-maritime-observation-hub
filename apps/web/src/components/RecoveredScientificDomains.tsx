import { useMemo, useState } from 'react';
import { HIERARCHICAL_LAYER_TREE } from '../lib/hierarchical-layers';
import { getLayerSvgDataUri } from '../lib/map-icon-atlas';
import {
  BIODIVERSITY_EXTRA_LAYERS,
  POLLUTION_EXTRA_LAYERS,
  BIODIVERSITY_LOCAL_FILES,
  POLLUTION_LOCAL_FILES,
} from '../lib/recovered-scientific-domains.generated';

interface Props {
  activeLayerIds: string[];
  onToggleLayer: (layerId: string) => void;
  onSoloLayer?: (layerId: string) => void;
  onSetOpacity?: (layerId: string, opacity: number) => void;
  layerOpacities?: Record<string, number>;
}

type ExtraLayer = {
  id: string;
  label: string;
  status: string;
  toggleable: boolean;
  domain: 'LIFE' | 'POLLUTION';
};

export default function RecoveredScientificDomains({
  activeLayerIds,
  onToggleLayer,
  onSoloLayer,
  onSetOpacity,
  layerOpacities = {},
}: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ LIFE: true, POLLUTION: true });
  const [localOpen, setLocalOpen] = useState<Record<string, boolean>>({ LIFE: false, POLLUTION: false });

  const domains = useMemo(
    () => HIERARCHICAL_LAYER_TREE.filter((d) => d.id === 'LIFE' || d.id === 'POLLUTION'),
    []
  );

  const extrasFor = (id: string): ExtraLayer[] =>
    id === 'LIFE' ? BIODIVERSITY_EXTRA_LAYERS : POLLUTION_EXTRA_LAYERS;

  const filesFor = (id: string) =>
    id === 'LIFE' ? BIODIVERSITY_LOCAL_FILES : POLLUTION_LOCAL_FILES;

  return (
    <div data-amoh-recovered-scientific-domains="v38" className="space-y-3 mb-3">
      {domains.map((domain) => {
        const leaves = domain.subdomains.flatMap((s) => s.layers);
        const activeLeaves = leaves.filter((l) => activeLayerIds.includes(l.id));
        const allOn = leaves.length > 0 && activeLeaves.length === leaves.length;
        const partial = activeLeaves.length > 0 && !allOn;
        const extras = extrasFor(domain.id);
        const localFiles = filesFor(domain.id);

        return (
          <div
            key={domain.id}
            data-amoh-restored-domain={domain.id}
            className="rounded-xl border border-[#1a3344] bg-[#081722]/90 overflow-hidden shadow-lg"
          >
            <div
              onClick={() => setOpen((p) => ({ ...p, [domain.id]: !p[domain.id] }))}
              className="px-3.5 py-2.5 bg-[#0a1e2d] hover:bg-[#0e273a] cursor-pointer flex items-center justify-between border-b border-[#162d3c]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[#8faab5] text-xs">{open[domain.id] ? '⌄' : '›'}</span>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: domain.color }} />
                <span className="text-xs font-bold tracking-wide text-white truncate">{domain.label}</span>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-[9px] font-mono text-[#8faab5]">
                  {activeLeaves.length}/{leaves.length}
                </span>
                <button
                  type="button"
                  title={allOn ? 'Desactivar todo el dominio' : 'Activar todo el dominio'}
                  onClick={() => {
                    const enable = !allOn;
                    leaves.forEach((leaf) => {
                      const active = activeLayerIds.includes(leaf.id);
                      if ((enable && !active) || (!enable && active)) onToggleLayer(leaf.id);
                    });
                  }}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] border ${
                    allOn
                      ? 'bg-[#00e5ff] border-[#00e5ff] text-black'
                      : partial
                      ? 'bg-[#00e5ff]/25 border-[#00e5ff]/50 text-[#00e5ff]'
                      : 'border-[#2d495b] text-[#6f8994]'
                  }`}
                >
                  {allOn ? '✓' : partial ? '—' : ''}
                </button>
              </div>
            </div>

            {open[domain.id] && (
              <div className="p-2.5 space-y-3 bg-[#06121a]">
                {domain.subdomains.map((sub) => (
                  <div key={sub.id} className="space-y-1.5 pl-2 border-l-2 border-[#193547]">
                    <div className="text-[10px] font-semibold text-[#8faab5] uppercase tracking-wider px-1">
                      {sub.label}
                    </div>

                    <div className="space-y-1">
                      {sub.layers.map((leaf) => {
                        const active = activeLayerIds.includes(leaf.id);
                        const opacity = layerOpacities[leaf.id] ?? leaf.opacity ?? 0.85;
                        const icon = getLayerSvgDataUri(leaf.id);

                        return (
                          <div
                            key={leaf.id}
                            className={`p-2 rounded-lg border ${
                              active
                                ? 'bg-[#0a202e] border-[#00e5ff]/30'
                                : 'bg-[#06141f] border-[#142938]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={icon} alt="" className="w-5 h-5 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-[10px] font-semibold text-white truncate">{leaf.label}</div>
                                  <div className="text-[7px] font-mono text-[#6f8994] truncate">
                                    {leaf.provider} · {leaf.recordCount} {leaf.unit || 'registros'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  title="SOLO"
                                  onClick={() => onSoloLayer?.(leaf.id)}
                                  className="px-1.5 py-1 rounded border border-[#223d4e] text-[6px] font-mono text-[#8faab5]"
                                >
                                  SOLO
                                </button>
                                <button
                                  type="button"
                                  title={active ? 'Desactivar Capa' : 'Activar Capa'}
                                  onClick={() => onToggleLayer(leaf.id)}
                                  className={`w-6 h-6 rounded border text-[10px] ${
                                    active
                                      ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
                                      : 'border-[#223d4e] text-[#526f80]'
                                  }`}
                                >
                                  ◉
                                </button>
                              </div>
                            </div>

                            {active && (
                              <div className="mt-2 pt-1.5 border-t border-[#132938] flex items-center gap-2">
                                <span className="text-[7px] font-mono text-[#8faab5]">{Math.round(opacity * 100)}%</span>
                                <input
                                  type="range"
                                  min="0.1"
                                  max="1"
                                  step="0.05"
                                  value={opacity}
                                  onChange={(e) => onSetOpacity?.(leaf.id, parseFloat(e.target.value))}
                                  className="flex-1 h-1 accent-[#00e5ff]"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {extras.length > 0 && (
                  <div className="rounded-lg border border-[#203645] bg-[#071821] p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-[#9fc1ce]">CAPAS / PRODUCTOS ADICIONALES DETECTADOS</span>
                      <span className="text-[7px] font-mono text-[#607b86]">{extras.length}</span>
                    </div>
                    {extras.map((x) => {
                      const active = activeLayerIds.includes(x.id);
                      return (
                        <div key={x.id} className="flex items-center justify-between gap-2 py-1 border-t border-white/[0.04]">
                          <div className="min-w-0">
                            <div className="text-[8px] text-[#c6d5da] truncate">{x.label}</div>
                            <div className="text-[6px] font-mono text-[#5f7882] truncate">{x.id} · {x.status}</div>
                          </div>
                          {x.toggleable ? (
                            <button
                              type="button"
                              onClick={() => onToggleLayer(x.id)}
                              className={`shrink-0 px-1.5 py-0.5 rounded border text-[6px] font-mono ${
                                active
                                  ? 'border-cyan-300/40 text-cyan-200 bg-cyan-400/10'
                                  : 'border-white/10 text-[#78909b]'
                              }`}
                            >
                              {active ? 'ON' : 'OFF'}
                            </button>
                          ) : (
                            <span className="shrink-0 px-1.5 py-0.5 rounded border border-amber-400/15 text-[6px] font-mono text-amber-200/80">
                              {x.status}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="rounded-lg border border-[#203645] bg-[#071821]">
                  <button
                    type="button"
                    onClick={() => setLocalOpen((p) => ({ ...p, [domain.id]: !p[domain.id] }))}
                    className="w-full px-2 py-1.5 flex items-center justify-between text-left"
                  >
                    <span className="text-[8px] font-bold text-[#9fc1ce]">DATOS LOCALES RELACIONADOS</span>
                    <span className="text-[7px] font-mono text-[#607b86]">{localFiles.length} archivos {localOpen[domain.id] ? '⌃' : '⌄'}</span>
                  </button>

                  {localOpen[domain.id] && (
                    <div className="px-2 pb-2 max-h-52 overflow-y-auto space-y-1">
                      {localFiles.map((f) => (
                        <div key={f.path} className="flex items-center justify-between gap-2 border-t border-white/[0.04] pt-1">
                          <span className="text-[6px] font-mono text-[#607b86] truncate" title={f.path}>{f.path}</span>
                          <span className="text-[6px] font-mono text-[#78909b] shrink-0">
                            {(f.sizeBytes / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
