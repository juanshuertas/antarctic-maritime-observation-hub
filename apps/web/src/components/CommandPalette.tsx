import { useState, useEffect } from 'react';
import {
  Search,
  Ship,
  Fish,
  Plane,
  Satellite,
  Activity,
  Wind,
  Waves,
  Snowflake,
  Shield,
  Layers,
  Sparkles,
  Clock,
  Film,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (actionKey: string) => void;
}

interface CommandItem {
  key: string;
  shortcut: string;
  label: string;
  category: string;
  icon: any;
  actionKey: string;
}

const COMMAND_LIST: CommandItem[] = [
  { key: 'd', shortcut: 'D', label: '🎬 Modo Director Fílmico NatGeo 4K (Visor Cine, Vuelo Drone & Sonido)', category: 'Experiencia', icon: Film, actionKey: 'OPEN_NATGEO_DIRECTOR' },
  { key: 'f', shortcut: 'F', label: 'Pesquerías & GFW (Apparent Fishing Effort)', category: 'Capas', icon: Fish, actionKey: 'TOGGLE_GFW' },
  { key: 'v', shortcut: 'V', label: 'Flota Marítima & Buques AIS', category: 'Capas', icon: Ship, actionKey: 'TOGGLE_AIS' },
  { key: 'a', shortcut: 'A', label: 'Aviación Polar & Rutas Intercontinentales', category: 'Capas', icon: Plane, actionKey: 'TOGGLE_AVIATION' },
  { key: 's', shortcut: 'S', label: 'Constelaciones Satelitales (SGP4/TLE)', category: 'Capas', icon: Satellite, actionKey: 'TOGGLE_SATELLITES' },
  { key: 'e', shortcut: 'E', label: 'Sismicidad & Volcanismo (USGS)', category: 'Capas', icon: Activity, actionKey: 'TOGGLE_SEISMIC' },
  { key: 'w', shortcut: 'W', label: 'Vientos Sinópticos a 10m (ECMWF)', category: 'Capas', icon: Wind, actionKey: 'TOGGLE_WIND' },
  { key: 'c', shortcut: 'C', label: 'Corrientes Circumpolares (Copernicus)', category: 'Capas', icon: Waves, actionKey: 'TOGGLE_CURRENTS' },
  { key: 'i', shortcut: 'I', label: 'Criósfera & Hielo Marino (OSI-SAF)', category: 'Capas', icon: Snowflake, actionKey: 'TOGGLE_ICE' },
  { key: 'b', shortcut: 'B', label: 'Biodiversidad Marina & Fauna (OBIS)', category: 'Capas', icon: Fish, actionKey: 'TOGGLE_BIODIVERSITY' },
  { key: 'g', shortcut: 'G', label: 'Gobernanza & Tratado Antártico (ATS)', category: 'Capas', icon: Shield, actionKey: 'TOGGLE_GOVERNANCE' },
  { key: 'u', shortcut: 'U', label: 'Naciones Unidas & BBNJ Treaty', category: 'Capas', icon: Shield, actionKey: 'TOGGLE_UN' },
  { key: 'p', shortcut: 'P', label: 'Consultar Pythia Science Lead', category: 'Análisis', icon: Sparkles, actionKey: 'OPEN_PYTHIA' },
  { key: 'l', shortcut: 'L', label: 'Biblioteca Jerárquica de Capas', category: 'Navegación', icon: Layers, actionKey: 'OPEN_LAYERS' },
  { key: 't', shortcut: 'T', label: 'Línea de Tiempo & Rango Temporal', category: 'Navegación', icon: Clock, actionKey: 'OPEN_TIMELINE' },
];

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectAction,
}: CommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = COMMAND_LIST.filter(
    (c) =>
      c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shortcut.toLowerCase() === searchTerm.toLowerCase()
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global hotkeys when not in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') onClose();
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectAction?.('OPEN_COMMAND_PALETTE');
        return;
      }

      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filtered[selectedIndex]) {
            onSelectAction?.(filtered[selectedIndex].actionKey);
            onClose();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      } else {
        // Fast direct hotkeys
        const match = COMMAND_LIST.find((c) => c.key === key);
        if (match) {
          onSelectAction?.(match.actionKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, onSelectAction]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Paleta de Comandos Rápidos OSIRIS"
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 px-4 select-none animate-in fade-in duration-150"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="bg-[#061522] border border-[#1f3947] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-[#edf5f5]">
        {/* Search Input */}
        <div className="p-4 border-b border-[#1f3947] flex items-center gap-3 bg-[#030c14]">
          <Search className="w-5 h-5 text-[#00e5ff]" />
          <input
            type="text"
            placeholder="Escribe un comando o presiona una tecla (F, V, A, S, E, W, C, I, B, G, U, P, L)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#5d7a8c] font-medium"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#102535] text-[#8faab5] border border-[#1f3947]">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-[#607c8d]">
              No se encontraron comandos para "{searchTerm}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.key}
                  onClick={() => {
                    onSelectAction?.(cmd.actionKey);
                    onClose();
                  }}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-white'
                      : 'hover:bg-[#0a202e] text-[#cadde6]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#00e5ff] text-black' : 'bg-[#102738] text-[#00e5ff]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{cmd.label}</div>
                      <div className="text-[10px] font-mono text-[#8faab5]">{cmd.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <kbd className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0e2434] text-[#00e5ff] border border-[#1d3d52] font-bold">
                      {cmd.shortcut}
                    </kbd>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#030c14] border-t border-[#1f3947] flex items-center justify-between text-[11px] font-mono text-[#8faab5]">
          <span>Modelo de Interacción Rápida OSIRIS</span>
          <span>Navega con ↑ ↓ · Enter para ejecutar</span>
        </div>
      </div>
    </div>
  );
}
