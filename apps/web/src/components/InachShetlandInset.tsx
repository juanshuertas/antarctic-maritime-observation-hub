import { useState } from 'react';
import { motion } from 'framer-motion';
import { INACH_SHETLAND_23_BASES, type InachStation } from '../lib/inach-cartography';
import { MapPin, Navigation, X, Shield, ExternalLink, Search, GripHorizontal } from 'lucide-react';

interface InachShetlandInsetProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToStation: (coords: [number, number], zoom?: number) => void;
}

export default function InachShetlandInset({
  isOpen,
  onClose,
  onFlyToStation,
}: InachShetlandInsetProps) {
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<InachStation | null>(null);

  if (!isOpen) return null;

  const countries = ['ALL', ...Array.from(new Set(INACH_SHETLAND_23_BASES.map((b) => b.country)))];

  const filteredBases = INACH_SHETLAND_23_BASES.filter((b) => {
    const matchesCountry = filterCountry === 'ALL' || b.country === filterCountry;
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.officialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.islandSector.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      className="absolute top-20 left-16 z-[210] w-[380px] max-h-[82vh] rounded-2xl border border-[#35c3c8]/40 bg-[#07131df0] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-left-4 duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header with INACH branding - Draggable */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-[#0d2232] to-[#081722] border-b border-[#1f3947] flex items-center justify-between cursor-grab active:cursor-grabbing select-none" title="Coge y arrastra para mover el recuadro INACH">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-[#5e7c8e] hover:text-[#35c3c8] transition-colors">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#35c3c8]/20 border border-[#35c3c8]/40 flex items-center justify-center text-[#35c3c8] font-bold text-xs shadow-inner">
            23
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                Islas Shetland del Sur
              </h2>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#35c3c8]/20 text-[#35c3c8] font-mono border border-[#35c3c8]/30">
                INACH
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Recuadro Oficial INACH · 23 Bases & Refugios
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Cerrar inset INACH"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Info Banner on Chilean Antarctic Territory */}
      <div className="px-4 py-2 bg-[#0a1e2c]/80 border-b border-[#1f3947]/60 flex items-center gap-2 text-[11px] text-slate-300">
        <Shield className="w-3.5 h-3.5 text-[#35c3c8] shrink-0" />
        <span className="line-clamp-2 text-[10px]">
          DIFROL Res. Exenta Nº 43 / 2021 · Sector 53°O – 90°O
        </span>
      </div>

      {/* Search & Country Filter */}
      <div className="p-3 border-b border-[#1f3947] bg-[#071520] space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por base, isla o sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0d2232] border border-[#1f3947] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#35c3c8]"
          />
        </div>

        {/* Country Filter Chips */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCountry(c)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors ${
                filterCountry === c
                  ? 'bg-[#35c3c8] text-[#07131d] font-bold'
                  : 'bg-[#0f283a] text-slate-400 hover:text-white border border-[#1f3947]'
              }`}
            >
              {c === 'ALL' ? 'Todas (23)' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Bases List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[46vh] scrollbar-thin scrollbar-thumb-slate-700">
        {filteredBases.map((station) => {
          const isSelected = selectedStation?.index === station.index;
          return (
            <div
              key={station.index}
              onClick={() => {
                setSelectedStation(station);
                onFlyToStation(station.coordinates, 12);
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                isSelected
                  ? 'bg-[#0e2c40] border-[#35c3c8] shadow-lg shadow-[#35c3c8]/10'
                  : 'bg-[#0a1b26]/70 border-[#1f3947] hover:border-[#35c3c8]/50 hover:bg-[#0c2230]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#133347] border border-[#1f3947] flex items-center justify-center font-mono text-[11px] font-bold text-[#35c3c8] shrink-0 mt-0.5">
                  {station.index}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-white">
                      {station.name}
                    </span>
                    <span className="text-xs">{station.flag}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                    <MapPin className="w-2.5 h-2.5 text-[#35c3c8]" />
                    {station.islandSector}
                  </p>
                  <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">
                    {station.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1">
                <span
                  className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    station.status === 'permanent'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : station.status === 'seasonal'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}
                >
                  {station.status === 'permanent'
                    ? 'Permanente'
                    : station.status === 'seasonal'
                    ? 'Verano'
                    : 'Refugio'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFlyToStation(station.coordinates, 12);
                  }}
                  className="p-1 rounded bg-[#133347] hover:bg-[#35c3c8] hover:text-black text-[#35c3c8] transition-colors"
                  title="Volar a la base en 3D"
                >
                  <Navigation className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Station Quick Detail Footer */}
      {selectedStation && (
        <div className="p-3 bg-[#0a1e2c] border-t border-[#1f3947] text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#35c3c8] text-[11px]">
              #{selectedStation.index} · {selectedStation.officialName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Fundada en {selectedStation.foundedYear || '—'}
            </span>
          </div>
          <p className="text-[10px] text-slate-300">
            {selectedStation.description}
          </p>
          <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-slate-400">
            <span>
              {selectedStation.coordinates[1].toFixed(4)}°S,{' '}
              {Math.abs(selectedStation.coordinates[0]).toFixed(4)}°W
            </span>
            <button
              onClick={() => onFlyToStation(selectedStation.coordinates, 14)}
              className="text-[#35c3c8] hover:underline flex items-center gap-0.5"
            >
              Zoom Alta Resolución 4K <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
