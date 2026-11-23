import { X } from 'lucide-react';

import { MARINE_GEOPHYSICS_LAYERS } from '../lib/marine-geophysics-layers';

interface Props {
  activeLayers: Record<string, boolean>;
  onToggle: (id: string) => void;
  onClose: () => void;
}

export default function MarineGeophysicsPanel({ activeLayers, onToggle, onClose }: Props) {
  return (
    <section
      id="marine-geophysics-panel"
      aria-labelledby="marine-geophysics-heading"
      className="absolute bottom-[136px] md:bottom-[78px] left-1/2 -translate-x-1/2 z-[221] w-[min(92vw,26rem)] max-h-[48vh] overflow-y-auto rounded-2xl border border-[#1e455e] bg-[#061522] p-3 text-sm text-[#d9edf2] shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2 pb-2">
        <h2 id="marine-geophysics-heading" className="font-semibold">Geofísica marina · OLEA × Khalifa</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar geofísica" className="rounded p-1 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {MARINE_GEOPHYSICS_LAYERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={!!activeLayers[id]}
            onClick={() => onToggle(id)}
            className={`min-h-10 rounded-lg border px-2 py-1.5 text-left text-xs transition-colors ${activeLayers[id] ? 'border-cyan-300/70 bg-cyan-300/15 text-cyan-100' : 'border-[#1a384b] hover:bg-white/10'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#adc5d0]">Lindeque es una compilación interpolada. Validación sísmica independiente pendiente.</p>
      <p className="mt-2 text-xs text-[#adc5d0]">
        Bosque exploratorio en CPU. Prueba cuML en GPU pendiente.{' '}
        <a className="text-cyan-200 underline" href="/data/web/geophysics/khalifa_ml_cpu_summary.json" target="_blank" rel="noreferrer">
          Informe de la corrida
        </a>
      </p>
    </section>
  );
}
