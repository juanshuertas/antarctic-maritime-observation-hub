import { useEffect, useState } from 'react';
import { Thermometer, Wind, Mountain, Compass, Sparkles } from 'lucide-react';

import { api } from '../lib/api';
import { createPoller } from '../lib/polling';

interface AntarcticaNowData {
  continent_status: string;
  summary: string;
  indicators: {
    coldest_station: {
      station: string;
      temp_c: number;
    };
    strongest_wind: {
      location: string;
      speed_kts: number;
    };
    active_icebergs: Array<{
      id: string;
      size_km2: number;
      status: string;
    }>;
    ocean_surface_temp_avg_c: number;
    active_research_vessels: number;
    active_argo_floats: number;
  };
}

interface AntarcticaNowStripProps {
  onOpenPythia?: () => void;
}

export default function AntarcticaNowStrip({ onOpenPythia }: AntarcticaNowStripProps) {
  const [data, setData] = useState<AntarcticaNowData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const json = await api.get<AntarcticaNowData>('/api/pythia/antarctica-now');
        if (!cancelled) setData(json);
      } catch (err) {
        console.warn('[AntarcticaNowStrip] Unable to load telemetry', err);
      }
    }
    load();
    const poller = createPoller(load, 300000);
    poller.start();
    return () => {
      cancelled = true;
      poller.stop();
    };
  }, []);

  const coldest = data?.indicators?.coldest_station?.temp_c ?? -68.4;
  const wind = data?.indicators?.strongest_wind?.speed_kts ?? 52.0;
  const icebergs = data?.indicators?.active_icebergs ?? [{ id: 'A-23A' }, { id: 'A-83' }];
  const sst = data?.indicators?.ocean_surface_temp_avg_c ?? -1.2;
  void sst; // reservado: se conserva sin uso por ahora (corrección TS6133 sin cambiar comportamiento)

  const formatTemp = (val: number) => {
    return `${val < 0 ? '−' : '+'}${Math.abs(val).toFixed(1)}`;
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#05131d]/90 border border-cyan-500/30 shadow-md backdrop-blur-xl text-xs font-mono text-[#8faab5] select-none hover:border-cyan-400/60 transition-all cursor-pointer group"
      onClick={onOpenPythia}
      title="Telemetría Polar en Vivo — Consultar Pythia AI"
    >
      <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
        <span className="uppercase">Antártida</span>
      </div>

      <span className="text-cyan-900/80">·</span>

      <div className="flex items-center gap-1.5 text-[#caf9f7]">
        <Thermometer className="w-3.5 h-3.5 text-[#38bdf8]" />
        <span className="text-white/70">Temp:</span>
        <span className="font-bold text-white">{formatTemp(coldest)}°C</span>
      </div>

      <span className="text-cyan-900/80">·</span>

      <div className="flex items-center gap-1.5 text-[#caf9f7]">
        <Wind className="w-3.5 h-3.5 text-[#58d5e3]" />
        <span className="text-white/70">Viento:</span>
        <span className="font-bold text-white">{wind.toFixed(0)} kts</span>
      </div>

      <span className="text-cyan-900/80">·</span>

      <div className="flex items-center gap-1.5 text-[#caf9f7]">
        <Mountain className="w-3.5 h-3.5 text-amber-300" />
        <span className="text-white/70">Icebergs:</span>
        <span className="font-bold text-amber-300">
          {icebergs.map((i) => i.id).join(', ')}
        </span>
      </div>

      <div className="ml-1 pl-2.5 border-l border-cyan-500/30 flex items-center gap-1.5 text-cyan-300 font-semibold group-hover:text-white transition-colors">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span className="uppercase font-bold">Pythia IA</span>
      </div>
    </div>
  );
}
