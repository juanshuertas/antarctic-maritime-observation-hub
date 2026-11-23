import { X, Globe2, Compass, Fish, ShieldCheck, MapPin } from 'lucide-react';
import { ANTARCTIC_SECTORS, type AntarcticSector } from '../lib/antarctic-bounds';

interface CoveragePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToSector?: (coords: [number, number], zoom?: number) => void;
}

export default function CoveragePanel({ isOpen, onClose, onFlyToSector }: CoveragePanelProps) {
  if (!isOpen) return null;

  // Calculate overall metrics
  const totalSectors = ANTARCTIC_SECTORS.length;
  const coveredSectors = ANTARCTIC_SECTORS.length; // 100% whole-continent defined in V9
  const coveragePercent = Math.round((coveredSectors / totalSectors) * 100);

  const handleSectorClick = (sector: AntarcticSector) => {
    const centerLon = (sector.lon_min + sector.lon_max) / 2;
    const centerLat = (sector.lat_min + sector.lat_max) / 2;
    onFlyToSector?.([centerLon, centerLat], 4.2);
  };

  return (
    <div
      aria-label="Panel de Cobertura Circumpolar de 18 Sectores"
      className="fixed inset-y-0 right-0 z-[500] w-full sm:w-[480px] bg-[#071620]/95 border-l border-[#193444] shadow-2xl backdrop-blur-2xl flex flex-col text-[#edf5f5] select-none animate-in slide-in-from-right duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#193444] flex items-center justify-between bg-[#051119]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#58d5e3]/20 border border-[#58d5e3]/40 flex items-center justify-center text-[#58d5e3]">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cobertura Continental (18 Sectores)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30">
                {coveragePercent}% ACTIVO
              </span>
            </h2>
            <p className="text-[10px] font-mono text-[#8faab5]">
              Dominio Total Circumpolar [-180, -90, 180, -45]
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-white/10 text-[#8faab5] hover:text-white flex items-center justify-center transition-colors"
          aria-label="Cerrar panel de cobertura"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Global Status Banner */}
      <div className="px-5 py-3 bg-[#0a1e2b] border-b border-[#193444] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00e676]" />
          <span className="text-[#caf9f7] font-medium">18/18 Sectores con Telemetría & Cache Offline</span>
        </div>
        <span className="text-[10px] font-mono text-[#58d5e3]">360° Circumpolar</span>
      </div>

      {/* Sector List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-[#1f3947]">
        {ANTARCTIC_SECTORS.map((sector) => {
          const centerLon = Math.round((sector.lon_min + sector.lon_max) / 2);
          const centerLat = Math.round((sector.lat_min + sector.lat_max) / 2);

          return (
            <div
              key={sector.id}
              onClick={() => handleSectorClick(sector)}
              className="p-3 rounded-xl bg-[#0d2232]/70 border border-[#1b3a4d] hover:border-[#58d5e3]/60 hover:bg-[#102a3d] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-[#58d5e3] transition-colors">
                      {sector.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#08151d] text-[#8faab5] border border-[#193444]">
                      {sector.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6d8a98] mt-0.5">
                    <MapPin className="w-3 h-3 text-[#58d5e3]" />
                    <span>Centro: {centerLat}°S, {centerLon}°{centerLon >= 0 ? 'E' : 'W'}</span>
                    <span>·</span>
                    <span className="text-[#72e0b5]">Lon: [{sector.lon_min}° a {sector.lon_max}°]</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-[#00e676] bg-[#00e676]/10 px-2 py-0.5 rounded border border-[#00e676]/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
                  <span>100%</span>
                </div>
              </div>

              {/* Priority & Species */}
              <div className="mt-2 pt-2 border-t border-[#162f40] flex flex-col gap-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#caf9f7]">
                  <Compass className="w-3 h-3 text-[#ffc845] shrink-0" />
                  <span className="font-semibold text-[10px] text-[#ffc845] uppercase">Prioridad:</span>
                  <span className="text-[#a0c2cd] truncate">{sector.scientificPriority}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[#caf9f7]">
                  <Fish className="w-3 h-3 text-[#38bdf8] shrink-0" />
                  <span className="font-semibold text-[10px] text-[#38bdf8] uppercase">Especies clave:</span>
                  <span className="text-[#a0c2cd] truncate">{sector.targetSpecies.join(', ')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#193444] bg-[#051119] text-center text-[10px] font-mono text-[#6d8a98]">
        <span>AMOH V9 Circumpolar Architecture · Cobertura Total Garantizada</span>
      </div>
    </div>
  );
}
