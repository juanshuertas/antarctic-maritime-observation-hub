import { Map, PlusCircle, Compass, Menu } from 'lucide-react';

export type MobileTab = 'MAP' | 'OBSERVE' | 'MISSION' | 'MENU';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
}

export default function MobileBottomNav({
  activeTab,
  onSelectTab,
}: MobileBottomNavProps) {
  const items: Array<{
    id: MobileTab;
    label: string;
    icon: typeof Map;
    isPrimary?: boolean;
  }> = [
    { id: 'MAP', label: 'MAPA', icon: Map },
    { id: 'OBSERVE', label: 'OBSERVAR', icon: PlusCircle, isPrimary: true },
    { id: 'MISSION', label: 'MISIÓN', icon: Compass },
    { id: 'MENU', label: 'MENÚ', icon: Menu },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[450] h-16 bg-[#071622f6] border-t border-[#1b384c] backdrop-blur-xl flex items-center justify-around px-2 select-none"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.isPrimary) {
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center -mt-5 group"
              aria-label="Registrar Nueva Observación"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#35c3c8] to-[#72e0b5] text-[#06141c] flex items-center justify-center shadow-lg shadow-[#35c3c8]/30 group-hover:scale-105 active:scale-95 transition-all">
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#58d5e3] mt-1">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-w-[64px] ${
              isActive
                ? 'text-[#58d5e3]'
                : 'text-[#8faab5] hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span
              className={`text-[10px] font-mono tracking-wider ${
                isActive ? 'font-bold text-white' : 'font-medium'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
