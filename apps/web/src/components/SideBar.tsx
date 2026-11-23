import {
  Globe,
  Layers,
  Telescope,
  BarChart3,
  Eye,
  Camera,
  Zap,
  Settings,
  HelpCircle,
  Database,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'map', label: 'Mapa', icon: Globe, to: '/', active: true },
  { id: 'layers', label: 'Capas', icon: Layers, to: '/layers' },
  { id: 'satellites', label: 'Satélites', icon: Telescope, to: '/?panel=gee' },
  { id: 'analytics', label: 'Gráficas', icon: BarChart3, to: '/analytics' },
  { id: 'observations', label: 'Observaciones', icon: Eye, to: '/observations' },
  { id: 'review', label: 'Revisión', icon: ShieldAlert, to: '/review' },
  { id: 'cameras', label: 'Cámaras', icon: Camera, to: '/cameras' },
  { id: 'scenarios', label: 'Escenarios', icon: Zap, to: '/scenarios' },
];

export default function SideBar() {
  return (
    <aside
      className="absolute top-[64px] left-0 w-[60px] h-[calc(100dvh-64px)] z-[300] flex flex-col items-center py-3 gap-2"
      style={{ backgroundColor: 'var(--amoh-bg-ocean)' }}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          className={({ isActive }) => `
            p-2.5 rounded-xl transition-all group relative
            ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5'}
          `}
          style={({ isActive }) => ({
            color: isActive ? 'var(--amoh-science)' : 'var(--amoh-text-secondary)',
            backgroundColor: isActive ? 'var(--amoh-surface-raised)' : 'transparent',
          })}
        >
          <item.icon className="w-5 h-5" />
          {/* Tooltip */}
          <span className="absolute left-full ml-3 px-2 py-1 rounded bg-black text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border"
            style={{ borderColor: 'var(--amoh-border)' }}>
            {item.label}
          </span>
        </NavLink>
      ))}

      <div className="mt-auto flex flex-col gap-2 pb-4">
        <NavLink
          to="/credits"
          className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all relative group"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded bg-black text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border"
            style={{ borderColor: 'var(--amoh-border)' }}>
            Créditos y Licencias
          </span>
        </NavLink>
        <button className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all relative group">
          <Database className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded bg-black text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border"
            style={{ borderColor: 'var(--amoh-border)' }}>
            Fuentes
          </span>
        </button>
        <button className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all relative group">
          <HelpCircle className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded bg-black text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border"
            style={{ borderColor: 'var(--amoh-border)' }}>
            Ayuda
          </span>
        </button>
        <button className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all relative group">
          <Settings className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded bg-black text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border"
            style={{ borderColor: 'var(--amoh-border)' }}>
            Ajustes
          </span>
        </button>
      </div>
    </aside>
  );
}
