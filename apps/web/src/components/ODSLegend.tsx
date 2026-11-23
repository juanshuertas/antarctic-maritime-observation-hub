import React, { useState } from 'react';
import { SDG_REGISTRY, SDG_COLORS, getLayerSDGNumber, OFFICIAL_UN_SDG_DISCLAIMER, getLocalizedSDG } from '../lib/sdg-registry';
import { useI18nStore } from '../lib/i18n';
import { ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';

interface ODSLegendProps {
  activeLayerIds: string[];
  onSelectSdg?: (sdgNumber: number) => void;
  onOpenSdgLens?: () => void;
}

export const ODSLegend: React.FC<ODSLegendProps> = ({
  activeLayerIds,
  onSelectSdg,
  onOpenSdgLens,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { language, t } = useI18nStore();

  // Group active layers by SDG number
  const sdgCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    activeLayerIds.forEach((id) => {
      const sdgNum = getLayerSDGNumber(id);
      if (sdgNum) {
        counts[sdgNum] = (counts[sdgNum] || 0) + 1;
      }
    });
    return counts;
  }, [activeLayerIds]);

  const activeSdgNumbers = Object.keys(sdgCounts).map(Number).sort((a, b) => a - b);

  if (activeSdgNumbers.length === 0) {
    return null;
  }

  const activeTitle = t('sdg_active_title') || 'RADAR ODS POLAR';
  const disclaimerTitle = t('sdg_un_disclaimer') || 'ONU Disclaimer';

  return (
    <div
      className="fixed bottom-24 right-4 z-20 flex flex-col items-end pointer-events-auto select-none"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="amoh-glass rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden max-w-xs transition-all duration-300 border border-cyan-500/30">
        {/* Youthful Header with glowing pulse */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/20"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-extrabold tracking-wider text-white uppercase font-mono flex items-center gap-1.5">
              <span>{activeTitle}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[9px]">
                {activeSdgNumbers.length}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1.5">
              {activeSdgNumbers.slice(0, 4).map((num) => {
                const loc = getLocalizedSDG(num, language === 'zh-Hans' ? 'zh' : language);
                return (
                  <div
                    key={num}
                    className="w-4 h-4 rounded-full border border-black/60 text-[8px] font-black text-white flex items-center justify-center shadow-md transform hover:scale-125 transition-transform"
                    style={{ backgroundColor: SDG_COLORS[num] }}
                    title={`ODS ${num}: ${loc.name}`}
                  >
                    {num}
                  </div>
                );
              })}
              {activeSdgNumbers.length > 4 && (
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-black/60 text-[7px] text-cyan-300 font-bold flex items-center justify-center font-mono shadow-md">
                  +{activeSdgNumbers.length - 4}
                </div>
              )}
            </div>
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            )}
          </div>
        </div>

        {/* Expanded body with interactive ODS pills */}
        {!isCollapsed && (
          <div className="p-2.5 space-y-1.5 max-h-64 overflow-y-auto">
            {activeSdgNumbers.map((num) => {
              const sdg = SDG_REGISTRY[num];
              const loc = getLocalizedSDG(num, language === 'zh-Hans' ? 'zh' : language);
              const count = sdgCounts[num];
              if (!sdg) return null;

              return (
                <div
                  key={num}
                  onClick={() => onSelectSdg?.(num)}
                  className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-[#091b2c]/70 border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#0c263e]/90 transition-all cursor-pointer group amoh-pill-interactive shadow-sm"
                  title={`Haz clic para filtrar por ODS ${num}: ${loc.name}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md border border-white/20"
                      style={{ backgroundColor: sdg.color }}
                    >
                      {num}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {loc.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate flex items-center gap-1">
                        <span className="text-cyan-400 font-semibold">{count}</span>
                        <span>{count > 1 ? 'capas activas' : 'capa activa'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `${sdg.color}30`,
                      color: sdg.color,
                      border: `1px solid ${sdg.color}60`,
                    }}
                  >
                    ODS {num}
                  </span>
                </div>
              );
            })}

            {/* Bottom tools in legend */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-cyan-500/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDisclaimer(!showDisclaimer);
                }}
                className="flex items-center gap-1 hover:text-cyan-300 transition-colors font-mono text-[9px]"
              >
                <Info className="w-3 h-3 text-cyan-400" />
                <span>{disclaimerTitle}</span>
              </button>

              {onOpenSdgLens && (
                <button
                  onClick={onOpenSdgLens}
                  className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Explorar 17 ODS</span>
                </button>
              )}
            </div>

            {showDisclaimer && (
              <div className="mt-1.5 p-2 rounded-xl bg-[#040e16]/95 text-[9px] text-slate-300 leading-tight border border-cyan-500/20 font-sans shadow-inner">
                {OFFICIAL_UN_SDG_DISCLAIMER}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ODSLegend;
