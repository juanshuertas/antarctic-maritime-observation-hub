import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Flame,
  BarChart3,
  TrendingUp,
  Download,
  X,
  Sparkles,
  Compass,
  GripHorizontal,
} from 'lucide-react';
import { LAYER_REGISTRY, resolveLayerId, getLayerColor } from '../lib/layer-registry';
import { SDG_REGISTRY } from '../lib/sdg-registry';

interface GeeLayerAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayerId: string | null;
  onToggleHeatmap?: (layerId: string) => void;
  isHeatmapActive?: boolean;
}

export default function GeeLayerAnalytics({
  isOpen,
  onClose,
  activeLayerId,
  onToggleHeatmap,
  isHeatmapActive = false,
}: GeeLayerAnalyticsProps) {
  const [metricTab, setMetricTab] = useState<'timeseries' | 'histogram'>('timeseries');

  const resolvedId = activeLayerId ? resolveLayerId(activeLayerId) : null;
  const layerDef = resolvedId ? LAYER_REGISTRY[resolvedId] || LAYER_REGISTRY[activeLayerId!] : null;
  const layerColor = activeLayerId ? getLayerColor(activeLayerId) : '#00f0ff';
  const fallbackDef = {
    id: activeLayerId || 'maritime_vessels',
    name: (activeLayerId || 'Flota Antártica').replace(/_/g, ' ').toUpperCase(),
    category: 'OBSERVACIÓN SATELITAL & GEE',
    sdg: 14,
    sdgColor: '#00f0ff',
    type: 'geojson' as const,
    source: {
      type: 'geojson' as const,
      url: '/data/web/geojson/aspa.geojson',
      attribution: 'Antarctic Maritime Observation Hub',
    },
    paint: {},
  };
  const effectiveDef = layerDef || fallbackDef;
  const sdgInfo = effectiveDef.sdg ? SDG_REGISTRY[effectiveDef.sdg] : null;

  // Generador determinista de serie temporal y distribución estilo Earth Engine
  const { timeSeriesData, stats } = useMemo(() => {
    const targetId = resolvedId || effectiveDef.id;
    const seed = targetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const days = 30;
    const points: { day: string; value: number }[] = [];
    let sum = 0;
    const values: number[] = [];

    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
      const pseudoRand = Math.sin(seed + i * 1.7) * 0.5 + 0.5;
      const baseVal = Math.round(15 + pseudoRand * 45);
      points.push({ day: dayLabel, value: baseVal });
      sum += baseVal;
      values.push(baseVal);
    }

    const mean = Math.round(sum / points.length);
    const max = Math.max(...values);
    const min = Math.min(...values);

    // 5 histogram bins
    const binCount = 5;
    const binWidth = (max - min) / binCount || 1;
    const histogram: { label: string; count: number }[] = Array.from({ length: binCount }, (_, idx) => {
      const bMin = Math.round(min + idx * binWidth);
      const bMax = Math.round(min + (idx + 1) * binWidth);
      const count = values.filter((v) => v >= bMin && (idx === binCount - 1 ? v <= bMax : v < bMax)).length;
      return { label: `${bMin}-${bMax}`, count };
    });

    const sorted = [...values].sort((x, y) => x - y);
    const sampleCount = sorted.length;
    const mid = Math.floor(sampleCount / 2);
    const median = sampleCount % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    const p95 = sorted[Math.min(sampleCount - 1, Math.max(0, Math.ceil(0.95 * sampleCount) - 1))];

    return {
      timeSeriesData: points,
      stats: { mean, max, min, histogram, count: sampleCount, median, p95 },
    };
  }, [resolvedId, effectiveDef.id]);

  if (!isOpen) return null;

  const maxVal = Math.max(...timeSeriesData.map((d) => d.value), 100);

  // Generar path SVG para la serie de tiempo suave estilo GEE
  const svgWidth = 320;
  const svgHeight = 90;
  const svgPoints = timeSeriesData
    .map((pt, idx) => {
      const x = (idx / (timeSeriesData.length - 1)) * svgWidth;
      const y = svgHeight - (pt.value / maxVal) * (svgHeight - 12);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPath = `M 0,${svgHeight} L ${svgPoints} L ${svgWidth},${svgHeight} Z`;

  return (
    <motion.aside
      drag
      dragMomentum={false}
      dragElastic={0.08}
      aria-label="Panel Analítico Google Earth Engine"
      className="absolute top-20 right-4 z-[260] w-[380px] max-w-[calc(100vw-2rem)] bg-[#08151df2] border border-[#1f3947] rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header - Draggable */}
      <div className="px-4 py-3 bg-[#0d2230]/80 border-b border-[#1f3947] flex items-center justify-between cursor-grab active:cursor-grabbing select-none" title="Coge y arrastra para mover el panel analítico">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-[#5e7c8e] hover:text-[#35c3c8] transition-colors">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm"
            style={{ backgroundColor: `${layerColor}20`, borderColor: `${layerColor}60` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: layerColor }} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8faab5] flex items-center gap-1.5">
              <span>GEE ANALYTICS CORE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            </span>
            <h3 className="text-xs font-bold text-white truncate max-w-[210px]">{effectiveDef.name}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          title="Cerrar panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {/* Layer Metadata Pill */}
        <div className="p-3 bg-white/[0.03] border border-[#1f3947] rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#8faab5] uppercase">Categoría SCAR / GFW</div>
            <div className="text-xs font-semibold text-white/90">{effectiveDef.category}</div>
          </div>
          {sdgInfo && (
            <div
              className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border flex items-center gap-1 shadow-sm"
              style={{
                backgroundColor: `${sdgInfo.color}25`,
                color: sdgInfo.color,
                borderColor: `${sdgInfo.color}50`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sdgInfo.color }} />
              ODS {sdgInfo.number}
            </div>
          )}
        </div>

        {/* Heatmap Continuous Surface Toggle Button */}
        <div className="p-3 bg-gradient-to-r from-[#0d2230] to-[#07131b] border border-[#1f3947] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${isHeatmapActive ? 'text-amber-400 animate-pulse' : 'text-[#8faab5]'}`} />
            <div>
              <div className="text-xs font-semibold text-white">Mapa de Calor 4D</div>
              <div className="text-[10px] text-[#8faab5]">Superficie gaussiana continua WebGL</div>
            </div>
          </div>
          <button
            onClick={() => onToggleHeatmap && onToggleHeatmap(resolvedId || effectiveDef.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-md ${
              isHeatmapActive
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-[#1f3947] hover:bg-[#2b4c5e] text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isHeatmapActive ? 'ACTIVO' : 'ACTIVAR'}</span>
          </button>
        </div>

        {/* Analytics Tabs: Timeseries vs Histogram */}
        <div className="flex bg-[#050e14] p-0.5 rounded-xl border border-[#1f3947]">
          <button
            onClick={() => setMetricTab('timeseries')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
              metricTab === 'timeseries'
                ? 'bg-[#1f3947] text-white shadow-sm'
                : 'text-[#8faab5] hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Serie Temporal (30d)</span>
          </button>
          <button
            onClick={() => setMetricTab('histogram')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
              metricTab === 'histogram'
                ? 'bg-[#1f3947] text-white shadow-sm'
                : 'text-[#8faab5] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Distribución</span>
          </button>
        </div>

        {/* Metric Chart Area */}
        <div className="p-3 bg-[#050e14]/90 border border-[#1f3947] rounded-xl">
          {metricTab === 'timeseries' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#8faab5] uppercase">Anomalía / Densidad Diaria</span>
                <span className="text-[10px] font-mono text-[#10b981]">+4.2% vs Media Climatológica</span>
              </div>
              <div className="relative w-full h-[90px]">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="geeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={layerColor} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={layerColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#1f3947" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2={svgWidth} y2="50" stroke="#1f3947" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2={svgWidth} y2="80" stroke="#1f3947" strokeDasharray="3 3" />

                  {/* Shaded Area */}
                  <path d={areaPath} fill="url(#geeAreaGrad)" />

                  {/* Smooth Trend Line */}
                  <polyline
                    fill="none"
                    stroke={layerColor}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={svgPoints}
                  />

                  {/* Last Value Point Halo */}
                  {timeSeriesData.length > 0 && (
                    <circle
                      cx={svgWidth}
                      cy={svgHeight - (timeSeriesData[timeSeriesData.length - 1].value / maxVal) * (svgHeight - 12)}
                      r="4"
                      fill={layerColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  )}
                </svg>
              </div>
              <div className="flex justify-between items-center mt-2 text-[9px] font-mono text-[#8faab5]">
                <span>{timeSeriesData[0]?.day}</span>
                <span>Últimas 24 horas</span>
                <span>Hoy ({timeSeriesData[timeSeriesData.length - 1]?.day})</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#8faab5] uppercase">Histograma de Frecuencia</span>
                <span className="text-[10px] font-mono text-[#00f0ff]">Total Muestras: {stats.count}</span>
              </div>
              <div className="h-[90px] flex items-end gap-1.5 pt-2">
                {[22, 45, 60, 85, 95, 78, 65, 40, 28, 15].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full rounded-t transition-all group-hover:brightness-125"
                      style={{
                        height: `${(val / 95) * 65}px`,
                        backgroundColor: idx > 6 ? '#f59e0b' : layerColor,
                        opacity: 0.85,
                      }}
                    />
                    <span className="text-[8px] font-mono text-[#8faab5]">{idx * 10}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quant Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-white/[0.02] border border-[#1f3947] rounded-xl text-center">
            <div className="text-[9px] font-mono text-[#8faab5] uppercase">Media</div>
            <div className="text-sm font-bold text-white font-mono">{stats.mean}</div>
          </div>
          <div className="p-2.5 bg-white/[0.02] border border-[#1f3947] rounded-xl text-center">
            <div className="text-[9px] font-mono text-[#8faab5] uppercase">Mediana</div>
            <div className="text-sm font-bold text-[#00f0ff] font-mono">{stats.median}</div>
          </div>
          <div className="p-2.5 bg-white/[0.02] border border-[#1f3947] rounded-xl text-center">
            <div className="text-[9px] font-mono text-[#8faab5] uppercase">P95 Pico</div>
            <div className="text-sm font-bold text-amber-400 font-mono">{stats.p95}</div>
          </div>
        </div>

        {/* Source Attribution & Export */}
        <div className="pt-2 border-t border-[#1f3947] flex items-center justify-between text-[10px] text-[#8faab5]">
          <div className="flex items-center gap-1 truncate max-w-[200px]">
            <Compass className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />
            <span className="truncate">{effectiveDef.source.attribution || 'Open Geospatial Hub'}</span>
          </div>
          <a
            href={effectiveDef.source.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white flex items-center gap-1 font-semibold transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>GeoJSON</span>
          </a>
        </div>
      </div>
    </motion.aside>
  );
}
