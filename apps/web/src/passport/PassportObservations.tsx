import { useState } from 'react';
import { Layers, Search, MapPin, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { INITIAL_OBSERVATIONS } from './passport-data';

export default function PassportObservations() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = INITIAL_OBSERVATIONS.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b3543] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#72e0b5]" />
            <span>Observaciones Científicas de Campo</span>
          </h1>
          <p className="text-xs text-[#8faab5] mt-1">
            Registros oceanográficos, batimétricos, biológicos y criosféricos certificados con control de calidad (QC).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg border border-[#213f4f] bg-[#0c1824] text-[#00e5ff] font-bold">
            {INITIAL_OBSERVATIONS.length} Registros Activos
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['all', 'oceanography', 'biodiversity', 'cryosphere', 'maritime', 'atmospheric'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg border transition-all uppercase tracking-wider ${
                filter === cat
                  ? "border-[#72e0b5] bg-[#72e0b5]/15 text-[#72e0b5] font-bold shadow-[0_0_12px_rgba(114,224,181,0.2)]"
                  : "border-[#1b3543] bg-[#0c1824] text-[#8faab5] hover:text-white hover:bg-[#122330]"
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8faab5]" />
          <input
            type="text"
            placeholder="Buscar por título o sensor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#1b3543] bg-[#061019] text-white placeholder-[#6e8996] focus:outline-none focus:border-[#72e0b5]"
          />
        </div>
      </div>

      {/* Observation Items Feed */}
      <div className="space-y-4">
        {filtered.map((obs) => (
          <div
            key={obs.id}
            className="p-5 rounded-2xl border border-[#1b3543] bg-[#0a1520] hover:border-[#72e0b5]/50 transition-all space-y-3 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#162734] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30">
                  {obs.category}
                </span>
                <span className="text-sm font-bold text-white">{obs.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#72e0b5]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-bold uppercase">{obs.qcStatus}</span>
              </div>
            </div>

            <p className="text-xs text-[#8faab5] leading-relaxed">
              {obs.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-[#6e8996]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>{obs.lat}° S, {obs.lng}° W</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#72e0b5]" />
                <span>{obs.sensor || 'Sensor de campo'} · {obs.value || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#a995ff]" />
                <span>{new Date(obs.timestamp).toUTCString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
