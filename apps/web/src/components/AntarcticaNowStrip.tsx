import { useEffect, useState } from 'react';
import { Thermometer, Wind, Mountain, Compass, Sparkles } from 'lucide-react';

import { createPoller } from '../lib/polling';
import { fetchOpenPolarWeather, type PolarWeatherPoint } from '../lib/open-polar-weather';

interface AntarcticaNowStripProps {
  onOpenPythia?: () => void;
}

export default function AntarcticaNowStrip({ onOpenPythia }: AntarcticaNowStripProps) {
  const [weather, setWeather] = useState<PolarWeatherPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const points = await fetchOpenPolarWeather();
        if (!cancelled) setWeather(points);
      } catch (err) {
        console.warn('[AntarcticaNowStrip] Unable to load telemetry', err);
        if (!cancelled) setWeather([]);
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

  const coldest = weather.filter(point => point.temperatureC !== null)
    .sort((a, b) => (a.temperatureC ?? Infinity) - (b.temperatureC ?? Infinity))[0];
  const strongestWind = weather.filter(point => point.windKts !== null)
    .sort((a, b) => (b.windKts ?? -Infinity) - (a.windKts ?? -Infinity))[0];
  const validAt = weather[0]?.validAt;

  const formatTemp = (val: number) => {
    return `${val < 0 ? '−' : '+'}${Math.abs(val).toFixed(1)}`;
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#05131d]/90 border border-cyan-500/30 shadow-md backdrop-blur-xl text-xs font-mono text-[#8faab5] select-none hover:border-cyan-400/60 transition-all cursor-pointer group"
      onClick={onOpenPythia}
      title={validAt ? `Pronóstico Open-Meteo ${weather[0]?.delivery === 'snapshot' ? '· copia fechada' : '· consulta directa'}, válido ${validAt} · modelo, no observación in situ` : 'Pronóstico polar no disponible · consultar Pythia'}
    >
      <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
        <span className="uppercase">Open-Meteo · modelo{weather[0]?.delivery === 'snapshot' ? ' (copia)' : ''}</span>
      </div>

      <span className="text-cyan-900/80">·</span>

      <div className="flex items-center gap-1.5 text-[#caf9f7]">
        <Thermometer className="w-3.5 h-3.5 text-[#38bdf8]" />
        <span className="text-white/70">Temp:</span>
        <span className="font-bold text-white" title={coldest ? `${coldest.station} · ${coldest.validAt} · Open-Meteo` : undefined}>{coldest?.temperatureC == null ? '—' : `${formatTemp(coldest.temperatureC)}°C · ${coldest.station}`}</span>
      </div>

      <span className="text-cyan-900/80">·</span>

      <div className="flex items-center gap-1.5 text-[#caf9f7]">
        <Wind className="w-3.5 h-3.5 text-[#58d5e3]" />
        <span className="text-white/70">Viento:</span>
        <span className="font-bold text-white" title={strongestWind ? `${strongestWind.station} · ${strongestWind.validAt} · Open-Meteo` : undefined}>{strongestWind?.windKts == null ? '—' : `${strongestWind.windKts.toFixed(0)} kts · ${strongestWind.station}`}</span>
      </div>

      <span className="text-cyan-900/80">·</span>

      <div className="flex items-center gap-1.5 text-[#caf9f7]">
        <Mountain className="w-3.5 h-3.5 text-amber-300" />
        <span className="text-white/70">Icebergs:</span>
        <span className="font-bold text-amber-300">
          —
        </span>
      </div>

      <div className="ml-1 pl-2.5 border-l border-cyan-500/30 flex items-center gap-1.5 text-cyan-300 font-semibold group-hover:text-white transition-colors">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span className="uppercase font-bold">Pythia IA</span>
      </div>
    </div>
  );
}
