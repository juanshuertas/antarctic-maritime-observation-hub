import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import MenuSheet from '../components/MenuSheet';
import CommandPalette from '../components/CommandPalette';
import ExploreSDGs from './explore/ExploreSDGs';
import ExploreDiplomacy from './explore/ExploreDiplomacy';
import ExploreSensors from './explore/ExploreSensors';
import ExploreNuclear from './explore/ExploreNuclear';
import ExploreSCAR from './explore/ExploreSCAR';
import ExploreOceanopolitics from './explore/ExploreOceanopolitics';
import ExploreOpportunities from './explore/ExploreOpportunities';
import { BookOpen, Radio, Shield, Radiation, Globe2, Landmark, Compass, Film } from 'lucide-react';

export type ExploreTab =
  | 'scar'
  | 'sensors'
  | 'diplomacy'
  | 'sdgs'
  | 'nuclear'
  | 'oceanopolitics'
  | 'opportunities';

export default function Explore() {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (path: string): ExploreTab => {
    if (path.includes('sensors')) return 'sensors';
    if (path.includes('diplomacy')) return 'diplomacy';
    if (path.includes('sdgs')) return 'sdgs';
    if (path.includes('nuclear')) return 'nuclear';
    if (path.includes('oceanopolitics')) return 'oceanopolitics';
    if (path.includes('opportunities')) return 'opportunities';
    if (path.includes('scar')) return 'scar';
    return 'scar';
  };

  // Determine active tab from URL hash or default to 'scar'
  const [activeTab, setActiveTab] = useState<ExploreTab>(() => getTabFromPath(location.pathname));
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen bg-[#050e14] text-[#edf5f5] flex flex-col select-none"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* 1. Header with updated primary nav */}
      <Header
        activeView="explore"
        onToggleMenu={() => setMenuSheetOpen(true)}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onViewChange={(view) => {
          if (view === 'map') navigate('/observatory');
          else if (view === 'briefing') navigate('/briefing');
          else if (view === 'expeditions') navigate('/expeditions');
          else if (view === 'passport') navigate('/passport');
          else if (view === 'explore') navigate('/explore');
        }}
        region="Península Antártica & Océano Austral"
        period="Atlas Científico AMOH V4"
      />

      {/* 2. Main Explore Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title & Domain Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1c2940]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#35c3c8] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#58d5e3] font-bold">
                KNOWLEDGE HUB · CIENCIA & DIPLOMACIA POLAR
              </span>
            </div>
            <h1
              className="text-3xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Exploración de Dominios Científicos
            </h1>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#080e19] border border-[#1c2940] rounded-2xl font-mono text-xs">
            {[
              { id: 'scar', label: 'SCAR Research', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'sensors', label: 'Atlas de Sensores', icon: <Radio className="w-3.5 h-3.5" /> },
              { id: 'diplomacy', label: 'Diplomacia & Paz', icon: <Shield className="w-3.5 h-3.5" /> },
              { id: 'sdgs', label: 'ODS / SDGs', icon: <Globe2 className="w-3.5 h-3.5" /> },
              { id: 'nuclear', label: 'Océanos Nucleares', icon: <Radiation className="w-3.5 h-3.5" /> },
              { id: 'oceanopolitics', label: 'Oceanopolítica', icon: <Landmark className="w-3.5 h-3.5" /> },
              { id: 'opportunities', label: 'Oportunidades AI', icon: <Compass className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ExploreTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    isActive
                      ? 'bg-[#24344d] text-white shadow-md'
                      : 'text-[#8fa3bd] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => navigate('/stories')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-[#35c3c8] hover:text-white hover:bg-[#35c3c8]/20 transition-all border border-[#35c3c8]/40"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Historias & Documentales ↗</span>
            </button>
          </div>
        </div>

        {/* 3. Sub-page View */}
        <div className="pt-2 animate-in fade-in duration-200">
          {activeTab === 'scar' && <ExploreSCAR />}
          {activeTab === 'sensors' && <ExploreSensors />}
          {activeTab === 'diplomacy' && <ExploreDiplomacy />}
          {activeTab === 'sdgs' && <ExploreSDGs />}
          {activeTab === 'nuclear' && <ExploreNuclear />}
          {activeTab === 'oceanopolitics' && <ExploreOceanopolitics />}
          {activeTab === 'opportunities' && <ExploreOpportunities />}
        </div>
      </main>

      <MenuSheet
        isOpen={menuSheetOpen}
        onClose={() => setMenuSheetOpen(false)}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
