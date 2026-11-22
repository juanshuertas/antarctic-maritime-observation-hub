import { useSyncExternalStore } from 'react';
import { Plane, Satellite, Ship } from 'lucide-react';
import { getTrafficSnapshot, subscribeTraffic, TRAFFIC_LAYERS, type TrafficFeed } from '../lib/observatory-traffic';

const feeds = [
  { id: 'vessels', label: 'Barcos', source: 'AIS comunitario · al sur de 50° S', icon: Ship },
  { id: 'aircraft', label: 'Aviones', source: 'ADS-B · Drake, Península y mar de Ross', icon: Plane },
  { id: 'satellites', label: 'Satélites', source: 'CelesTrak · órbitas calculadas', icon: Satellite },
] as const;

export default function TrafficControls({ activeLayers, onToggleLayer }: {
  activeLayers: Record<string, boolean>;
  onToggleLayer: (id: string, visible: boolean) => void;
}) {
  const traffic = useSyncExternalStore(subscribeTraffic, getTrafficSnapshot);
  const status = (id: TrafficFeed) => {
    const { count, updated } = traffic[id];
    if (count === null) return 'Sin conexión';
    if (count === 0) return 'Sin posiciones recientes';
    return `${count.toLocaleString()} · ${updated?.slice(11, 16)} UTC`;
  };
  return (
    <section aria-label="Tráfico polar y orbital" className="space-y-2">
      <h3 className="text-sm font-semibold text-white">Tráfico polar y orbital</h3>
      {feeds.map(({ id, label, source, icon: Icon }) => {
        const layer = TRAFFIC_LAYERS[id];
        const visible = !!activeLayers[layer];
        return (
          <button key={id} type="button" aria-pressed={visible}
            onClick={() => onToggleLayer(layer, !visible)}
            className="flex w-full items-center gap-2 rounded-lg border border-[#1c2940] bg-[#101626] p-2 text-left text-xs text-white hover:border-cyan-400">
            <Icon className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <strong className="block">{label}</strong>
              <span className="text-[#a7bad1]">{source}</span>
              {traffic[id].detail && <span className="block text-amber-200">{traffic[id].detail}</span>}
            </span>
            <span className="text-right">
              <span className="block">{status(id)}</span>
              <span className={visible ? 'text-cyan-300' : 'text-[#a7bad1]'}>{visible ? 'Visible' : 'Oculto'}</span>
            </span>
          </button>
        );
      })}
      <p className="text-[10px] text-[#a7bad1]">
        Datos ODbL 1.0 ·{' '}
        <a className="underline" href="https://openwaters.io/ais/#license" target="_blank" rel="noreferrer">Open Waters AIS</a>
        {' · '}
        <a className="underline" href="https://www.adsb.lol/docs/open-data/api" target="_blank" rel="noreferrer">adsb.lol</a>
      </p>
    </section>
  );
}
