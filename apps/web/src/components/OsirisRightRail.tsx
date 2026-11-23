import React from 'react';
import { Ship, Plane, Satellite, Fish, Bird, Network } from 'lucide-react';

export interface OsirisRailProps {
  activeLayers: {
    vessels: boolean;
    aircraft: boolean;
    satellites: boolean;
    fisheries?: boolean;
    fauna?: boolean;
    cables: boolean;
  };
  onToggleLayer: (key: 'vessels' | 'aircraft' | 'satellites' | 'fisheries' | 'fauna' | 'cables') => void;
}

interface RailItem {
  key: 'vessels' | 'aircraft' | 'satellites' | 'fisheries' | 'fauna' | 'cables';
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const RAIL_ITEMS: RailItem[] = [
  { key: 'vessels', label: 'BUQUES', sublabel: 'Flota AIS Polar', icon: Ship, color: '#00e5ff' },
  { key: 'aircraft', label: 'VUELOS', sublabel: 'ADS-B Polar', icon: Plane, color: '#38bdf8' },
  { key: 'satellites', label: 'SATÉLITES', sublabel: 'Constelación LEO', icon: Satellite, color: '#00e676' },
  { key: 'fisheries', label: 'PESCA', sublabel: 'Global Fishing Watch', icon: Fish, color: '#ff754b' },
  { key: 'fauna', label: 'FAUNA', sublabel: 'Especies Antárticas', icon: Bird, color: '#72e0b5' },
  { key: 'cables', label: 'CABLES', sublabel: 'Infraestructura Submarina', icon: Network, color: '#8de8cd' },
];

export default function OsirisRightRail({ activeLayers, onToggleLayer }: OsirisRailProps) {
  return (
    <aside
      aria-label="Filtro rápido de capas OSIRIS"
      className="absolute top-20 right-4 z-[210] flex flex-col items-center bg-[#07141deb] border border-[#1b3645] rounded-xl py-2 px-1 shadow-2xl backdrop-blur-md gap-2 select-none pointer-events-auto"
      style={{ width: '48px' }}
    >
      {RAIL_ITEMS.map((item) => {
        const isActive = activeLayers[item.key];
        const Icon = item.icon;

        return (
          <div key={item.key} className="relative group flex flex-col items-center">
            <button
              type="button"
              onClick={() => onToggleLayer(item.key)}
              aria-label={`${item.label}: ${item.sublabel}`}
              className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-150 relative ${
                isActive
                  ? 'bg-[#102735] border border-[#58d5e3]/70 text-[#58d5e3] shadow-[0_0_12px_rgba(88,213,227,0.2)]'
                  : 'text-[#7e9ba6] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[1.8]" />
              <span className="text-[7.5px] font-mono tracking-tighter mt-0.5 leading-none font-bold">
                {item.label}
              </span>
              {isActive && (
                <span
                  className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
            </button>

            {/* Hover Tooltip (to left) */}
            <div className="absolute right-full mr-2.5 top-1 px-2.5 py-1 rounded-md bg-[#06141fee] border border-[#1f3947] shadow-xl text-right pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[220] whitespace-nowrap">
              <div className="text-[11px] font-bold text-white tracking-wide">{item.label}</div>
              <div className="text-[9px] font-mono text-[#8faab5]">{item.sublabel}</div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
