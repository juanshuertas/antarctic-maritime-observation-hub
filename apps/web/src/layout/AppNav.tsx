import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import ConnectivityIndicator from '../ds/ConnectivityIndicator';

const MODULES: { to: string; label: string }[] = [
  { to: '/observatory', label: '← Observatorio' },
  { to: '/briefing', label: 'Sala SITREP' },
  { to: '/science', label: 'Ciencia Polar' },
  { to: '/atlas', label: 'Atlas de Campo' },
  { to: '/cameras', label: 'Cámaras en Vivo' },
  { to: '/scenarios', label: 'Lab MiroFish' },
  { to: '/intelligence', label: 'Inteligencia' },
  { to: '/expeditions', label: 'Expediciones' },
  { to: '/passport', label: 'Pasaporte Polar' },
  { to: '/explore', label: 'Explorar Dominios' },
  { to: '/observations', label: 'Observaciones' },
  { to: '/review', label: 'Revisión & Match' },
  { to: '/governance', label: 'Gobernanza' },
  { to: '/reports', label: 'Reportes NPDC' },
  { to: '/stories', label: 'Historias & Kit Social' },
  { to: '/sources', label: 'Fuentes de Verdad' },
];

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `block px-4 py-2.5 text-sm border-l-2 transition-colors ${isActive ? 'font-semibold' : ''}`
      }
      style={({ isActive }) => ({
        borderColor: isActive ? 'var(--accent-yellow)' : 'transparent',
        background: isActive ? 'var(--surface-subtle)' : 'transparent',
        color: 'var(--text-primary)',
      })}
    >
      {label}
    </NavLink>
  );
}

export default function AppNav({ online }: { online: boolean }): ReactNode {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 flex items-center gap-2.5 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <img src="/olea-symbol.svg" alt="OLEA" className="w-7 h-7 object-contain" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-extrabold tracking-wide" style={{ color: 'var(--ocean-950)', fontFamily: 'var(--font-interface)' }}>OLEA</span>
          <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>Ecosystem Workspace</span>
        </div>
      </div>
      <nav className="flex-1 py-2">
        {MODULES.map((m) => <NavItem key={m.to} {...m} />)}
        <a
          href="https://github.com/juanshuertas/world-oceans-day-colombia-2027"
          target="_blank"
          rel="noopener noreferrer"
          className="block border-t mt-2 px-4 py-2.5 text-sm transition-colors"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        >
          Programa oceánico Colombia 2027 ↗
        </a>
      </nav>
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
        <ConnectivityIndicator online={online} />
      </div>
    </div>
  );
}
