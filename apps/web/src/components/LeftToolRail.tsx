import React from 'react';
import {
  Layers,
  Ship,
  Fish,
  Satellite,
  Compass,
  Waves,
  Activity,
  Atom,
  Video,
  Award,
  Settings,
  Eye,
  Radio,
} from 'lucide-react';

export type LeftToolId =
  | 'LIVE'
  | 'LAYERS'
  | 'VESSELS'
  | 'FISHERIES'
  | 'SATELLITES'
  | 'ICE'
  | 'OCEAN'
  | 'TOURISM'
  | 'SCIENCE'
  | 'NUCLEAR'
  | 'CAMERAS'
  | 'PASSPORT'
  | 'SETTINGS'
  | null;

interface LeftToolRailProps {
  activeTool: LeftToolId;
  onSelectTool: (tool: LeftToolId) => void;
}

export default function LeftToolRail({ activeTool, onSelectTool }: LeftToolRailProps) {
  const tools: { id: LeftToolId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'LIVE', label: 'Telemetría en Vivo (Pythia)', icon: <Radio className="w-5 h-5 text-[#00e676]" />, badge: 'LIVE' },
    { id: 'LAYERS', label: 'Capas OSIRIS (14)', icon: <Layers className="w-5 h-5" />, badge: '14' },
    { id: 'VESSELS', label: 'Flota AIS Polar', icon: <Ship className="w-5 h-5" /> },
    { id: 'FISHERIES', label: 'Pesquerías GFW & CCAMLR', icon: <Fish className="w-5 h-5" />, badge: 'GFW' },
    { id: 'SATELLITES', label: 'Satélites Polares (23)', icon: <Satellite className="w-5 h-5" />, badge: '23' },
    { id: 'ICE', label: 'Banquisa e Hielo Marino', icon: <Compass className="w-5 h-5" /> },
    { id: 'OCEAN', label: 'Pulso Oceánico (Argo CTD)', icon: <Waves className="w-5 h-5" /> },
    { id: 'TOURISM', label: 'Rutas IAATO 2026–2030', icon: <Activity className="w-5 h-5" /> },
    { id: 'SCIENCE', label: 'Catálogo Quantarctica 3', icon: <Eye className="w-5 h-5" />, badge: 'Q3' },
    { id: 'NUCLEAR', label: 'Legado Nuclear & MARIS', icon: <Atom className="w-5 h-5" /> },
    { id: 'CAMERAS', label: 'Cámaras de Expedición', icon: <Video className="w-5 h-5" /> },
    { id: 'PASSPORT', label: 'Pasaporte Científico', icon: <Award className="w-5 h-5" /> },
    { id: 'SETTINGS', label: 'Configuración & Proyección', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-14 h-full bg-[#050e14]/95 border-r border-[#1b3543] flex flex-col items-center py-2 z-[250] select-none text-[#8aa5af]">
      <div className="flex-1 flex flex-col gap-1 w-full px-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id || 'none'}
              onClick={() => onSelectTool(isActive ? null : t.id)}
              title={t.label}
              className={`relative w-full h-10 rounded-lg flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/60 shadow-lg'
                  : 'hover:bg-[#0c202c] hover:text-[#edf5f5]'
              }`}
            >
              {t.icon}
              {t.badge && (
                <span className="absolute top-1 right-1 px-1 text-[8px] font-mono rounded bg-[#091b24] text-[#8de8cd] border border-[#213f4f]">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
