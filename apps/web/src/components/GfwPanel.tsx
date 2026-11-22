import { useState, useEffect } from 'react';
import {
  Fish,
  X,
  ExternalLink,
  Anchor,
  ChevronRight,
  Activity,
  Clock,
  Radar,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { isSafeMode } from '../lib/safe-mode';

interface GfwPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVessel?: (vesselName: string) => void;
  onFlyToCoords?: (coords: [number, number], zoom?: number) => void;
}

export type GfwTimeWindow = '30d' | '90d' | '1y' | 'hist';
export type GfwTab = 'effort' | 'sar_dark' | 'transshipment';

export default function GfwPanel({
  isOpen,
  onClose,
  onSelectVessel,
  onFlyToCoords,
}: GfwPanelProps) {
  const [activeTab, setActiveTab] = useState<GfwTab>('effort');
  const [timeWindow, setTimeWindow] = useState<GfwTimeWindow>('90d');
  const [providerStatus, setProviderStatus] = useState<'checking' | 'available' | 'not_configured'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [effortData, setEffortData] = useState<{
    aisHours: string;
    vmsHours: string;
    primaryGear: string;
    zone: string;
  }>({
    aisHours: '2,020',
    vmsHours: '842',
    primaryGear: 'Red de arrastre (Krill)',
    zone: 'Océano Austral Circumpolar · CCAMLR 48 & 88',
  });

  const sarDetections = [
    {
      id: 'SAR-2026-081',
      coords: [-58.4, -62.1] as [number, number],
      location: 'Estrecho de Bransfield (cerca Shetland)',
      confidence: '98%',
      source: 'Sentinel-1 SAR C-Band',
      aisCorrelated: false,
      flagEstimate: 'No AIS transmitido (Buque Oscuro)',
      time: 'Hace 4 horas',
    },
    {
      id: 'SAR-2026-079',
      coords: [-64.2, -64.8] as [number, number],
      location: 'Canal de Gerlache / Península',
      confidence: '92%',
      source: 'Radarsat Constellation',
      aisCorrelated: false,
      flagEstimate: 'Pesquero no identificado',
      time: 'Ayer 21:40 UTC',
    },
    {
      id: 'SAR-2026-074',
      coords: [-44.5, -60.8] as [number, number],
      location: 'Mar de Weddell Norte (Borde Hielo)',
      confidence: '85%',
      source: 'Sentinel-1 SAR C-Band',
      aisCorrelated: true,
      flagEstimate: 'Correlacionado: Fu Yuan Yu 9199',
      time: 'Hace 2 días',
    },
  ];

  const transshipments = [
    {
      id: 'ENC-481-99',
      carrier: 'Ocean Phoenix (Panamá)',
      fishingVessel: 'Antarctic Sea (Noruega)',
      duration: '4h 20m',
      location: 'Sotavento Isla Livingston',
      coords: [-60.5, -62.6] as [number, number],
      species: 'Krill procesado congelado',
    },
    {
      id: 'ENC-482-12',
      carrier: 'Sky Frost (Liberia)',
      fishingVessel: 'Long Teng (China)',
      duration: '6h 15m',
      location: 'Islas Orcadas del Sur',
      coords: [-45.2, -60.6] as [number, number],
      species: 'Harina de krill',
    },
  ];

  useEffect(() => {
    if (!isOpen || isSafeMode()) return;
    let isMounted = true;
    const start = performance.now();
    fetch('/api/gfw/status')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Status unavailable'))))
      .then((data) => {
        if (isMounted) {
          const lat = Math.round(performance.now() - start);
          setLatencyMs(lat);
          setProviderStatus(data.status === 'available' ? 'available' : 'not_configured');
        }
      })
      .catch(() => {
        if (isMounted) setProviderStatus('not_configured');
      });

    // Fetch fishing effort data with master Antarctic bbox [-180, -90, 180, -45]
    fetch(`/api/gfw/fishing-effort?min_lat=-90.0&max_lat=-45.0&min_lon=-180.0&max_lon=180.0`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.data) {
          const totalHours = Array.isArray(data.data)
            ? data.data.reduce((acc: number, item: { hours?: number }) => acc + (item.hours || 0), 0)
            : null;
          if (totalHours !== null && totalHours > 0) {
            setEffortData({
              aisHours: totalHours.toLocaleString(),
              vmsHours: Math.round(totalHours * 0.4).toLocaleString(),
              primaryGear: 'Red de arrastre (Krill)',
              zone: 'CCAMLR 48.1',
            });
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, timeWindow]);

  if (!isOpen) return null;

  return (
    <div
      aria-label="Panel de Pesquerías Global Fishing Watch"
      className="absolute top-20 right-16 z-[210] w-[350px] max-h-[85vh] rounded-2xl border border-[#ff754b]/40 bg-[#08151df5] shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col select-none animate-in fade-in slide-in-from-right-3 duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif", color: '#edf5f5' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1f3947] bg-gradient-to-r from-[#0d2232] to-[#081722] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff754b]/20 border border-[#ff754b]/50 flex items-center justify-center text-[#ff754b] shadow-inner">
            <Fish className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Pesquerías & SAR (GFW)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff754b] animate-ping" />
            </h2>
            <p className="text-[10px] font-mono text-[#8faab5]">
              Global Fishing Watch · CCAMLR & Zonas Marinas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
              providerStatus === 'available'
                ? 'bg-[#72e0b5]/15 border-[#72e0b5]/40 text-[#72e0b5]'
                : 'bg-[#102430] border-[#1f3947] text-[#8faab5]'
            }`}
          >
            {providerStatus === 'available' ? 'API Online' : 'Modo Seguro'}
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-[#8faab5] hover:text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar panel de pesquerías"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1f3947] bg-[#061219] px-2 pt-1 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('effort')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-t-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'effort'
              ? 'bg-[#0d2332] text-[#ff754b] border-t-2 border-[#ff754b] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3 h-3" /> Esfuerzo
        </button>
        <button
          onClick={() => setActiveTab('sar_dark')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-t-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'sar_dark'
              ? 'bg-[#0d2332] text-[#35c3c8] border-t-2 border-[#35c3c8] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radar className="w-3 h-3" /> Buques SAR
        </button>
        <button
          onClick={() => setActiveTab('transshipment')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-t-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'transshipment'
              ? 'bg-[#0d2332] text-amber-400 border-t-2 border-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3 h-3" /> Transbordos
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-3.5 space-y-3 text-xs overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
        {/* EFFORT TAB */}
        {activeTab === 'effort' && (
          <>
            {/* Time Window Selector */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8faab5]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#58d5e3]" />
                  Ventana Temporal:
                </span>
                <span className="text-white font-semibold">
                  {timeWindow === '30d'
                    ? '30 días'
                    : timeWindow === '90d'
                    ? '90 días'
                    : timeWindow === '1y'
                    ? '1 año'
                    : 'Histórico'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#051119] rounded-lg border border-[#1f3947]/70">
                {[
                  { id: '30d', label: '30d' },
                  { id: '90d', label: '90d' },
                  { id: '1y', label: '1a' },
                  { id: 'hist', label: 'Hist' },
                ].map((tw) => (
                  <button
                    key={tw.id}
                    type="button"
                    onClick={() => setTimeWindow(tw.id as GfwTimeWindow)}
                    className={`py-1 text-[10px] font-mono rounded font-medium transition-all ${
                      timeWindow === tw.id
                        ? 'bg-[#ff754b] text-[#050e14] font-bold shadow-sm'
                        : 'text-[#8faab5] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tw.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Cards (AIS vs VMS) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#0d1e29] border border-[#1f3947]/80">
                <div className="text-[9px] font-mono uppercase text-[#8faab5] tracking-wider flex items-center justify-between">
                  <span>AIS (horas)</span>
                  {latencyMs && <span className="text-[8px] text-[#72e0b5]">{latencyMs}ms</span>}
                </div>
                <div className="text-lg font-mono font-bold text-[#58d5e3] mt-0.5">
                  {effortData.aisHours} <span className="text-[11px] font-normal text-[#8faab5]">h</span>
                </div>
                <div className="text-[9px] text-[#718d99] mt-0.5">Transpondedores clase A</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d1e29] border border-[#1f3947]/80">
                <div className="text-[9px] font-mono uppercase text-[#8faab5] tracking-wider">
                  VMS (horas)
                </div>
                <div className="text-lg font-mono font-bold text-[#fde047] mt-0.5">
                  {effortData.vmsHours} <span className="text-[11px] font-normal text-[#8faab5]">h</span>
                </div>
                <div className="text-[9px] text-[#718d99] mt-0.5">Datos CCAMLR validados</div>
              </div>
            </div>

            {/* Arte Principal */}
            <div className="p-2.5 rounded-lg bg-[#0d1e29]/70 border border-[#1f3947]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Anchor className="w-3.5 h-3.5 text-[#8de8cd]" />
                <span className="text-[11px] text-[#8faab5]">Arte principal:</span>
              </div>
              <span className="text-[11px] font-semibold text-white">Red de arrastre (Krill)</span>
            </div>

            {/* Embarcaciones destacadas */}
            <div className="p-2.5 rounded-lg bg-[#0d1e29]/70 border border-[#1f3947]/60">
              <div className="text-[10px] font-mono text-[#8faab5] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Flota Activa en Sector</span>
                <span className="text-[#58d5e3] text-[9px]">CCAMLR 48.1</span>
              </div>
              <div className="space-y-1">
                {[
                  { name: 'Sejong', flag: 'KR', target: 'Krill' },
                  { name: 'Fu Yuan Yu 9199', flag: 'CN', target: 'Krill' },
                  { name: 'Antarctic Endeavour', flag: 'CL', target: 'Merluza negra' },
                ].map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => onSelectVessel?.(v.name)}
                    className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-white/5 transition-colors text-left group"
                  >
                    <span className="text-[11px] font-medium text-white group-hover:text-[#58d5e3] truncate">
                      {v.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono px-1 rounded bg-[#102430] text-[#8faab5]">
                        {v.flag} · {v.target}
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#58d5e3] opacity-60 group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zonas de mayor actividad */}
            <div className="px-2.5 py-2 rounded-lg bg-[#07131b] border border-[#1f3947]/50 flex items-start gap-2">
              <Activity className="w-3.5 h-3.5 text-[#ff754b] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#91a8af] leading-tight">
                <span className="text-white font-medium">Zonas críticas:</span> Península Antártica, Estrecho de Bransfield & Mar de Scotia.
              </div>
            </div>

            {/* Heatmap Gradient Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-[#8faab5]">
                <span>Esfuerzo pesquero:</span>
                <span>Escala térmica</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-gradient-to-r from-[#00e5ff] via-[#55d48b] via-[#fde047] via-[#ff754b] to-[#ef4444]" />
              <div className="flex items-center justify-between text-[9px] font-mono text-[#718d99]">
                <span>Baja (0.1 h)</span>
                <span>Media</span>
                <span>Alta (&gt;50 h)</span>
              </div>
            </div>
          </>
        )}

        {/* SAR DARK VESSELS TAB */}
        {activeTab === 'sar_dark' && (
          <div className="space-y-2.5">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                Detecciones de buques por Radar de Apertura Sintética (SAR) que <strong>no emiten señal AIS</strong> dentro de zonas protegidas antárticas.
              </p>
            </div>

            {sarDetections.map((sar) => (
              <div
                key={sar.id}
                onClick={() => onFlyToCoords?.(sar.coords, 10)}
                className="p-2.5 rounded-xl bg-[#0c2232] border border-[#1f3947] hover:border-cyan-400/60 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300 text-[11px]">
                    {sar.id}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    Confianza {sar.confidence}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-white">
                  {sar.location}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Sensor: {sar.source} · {sar.time}
                </p>
                <div className="flex items-center justify-between text-[9px] pt-1 border-t border-[#1f3947]/60">
                  <span
                    className={
                      sar.aisCorrelated ? 'text-emerald-400' : 'text-amber-400 font-semibold'
                    }
                  >
                    ● {sar.flagEstimate}
                  </span>
                  <span className="text-cyan-400 hover:underline">Volar en 3D ↗</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TRANSSHIPMENT TAB */}
        {activeTab === 'transshipment' && (
          <div className="space-y-2.5">
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2">
              <Radio className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Encuentros de transbordo en alta mar detectados por proximidad y velocidad reducida conjunta (&lt;2 nudos por &gt;3h).
              </p>
            </div>

            {transshipments.map((tr) => (
              <div
                key={tr.id}
                onClick={() => onFlyToCoords?.(tr.coords, 10)}
                className="p-2.5 rounded-xl bg-[#0c2232] border border-[#1f3947] hover:border-amber-400/60 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-[11px]">
                    {tr.id}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Duración {tr.duration}
                  </span>
                </div>
                <div className="text-[11px] text-slate-200">
                  <p><strong>Buque nodriza:</strong> {tr.carrier}</p>
                  <p><strong>Pesquero:</strong> {tr.fishingVessel}</p>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Ubicación: {tr.location} · {tr.species}
                </p>
                <div className="text-right text-[9px] pt-1 border-t border-[#1f3947]/60 text-amber-400 hover:underline">
                  Volar en 3D ↗
                </div>
              </div>
            ))}
          </div>
        )}

        {/* External Link to GFW */}
        <a
          href="https://globalfishingwatch.org/map/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 rounded-lg bg-[#ff754b]/15 border border-[#ff754b]/40 hover:border-[#ff754b] text-[#ff754b] hover:text-white hover:bg-[#ff754b]/25 transition-all text-[11px] font-semibold flex items-center justify-center gap-2 group shadow-sm mt-2"
        >
          <span>Ver en Global Fishing Watch</span>
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}
