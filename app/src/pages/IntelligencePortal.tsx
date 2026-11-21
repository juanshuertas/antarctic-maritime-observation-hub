import { useState, useEffect } from 'react';
import { Scale, Users, FileText, AlertTriangle, Map as MapIcon } from 'lucide-react';
import { api } from '../lib/api';
import PentagonPizzaIndexWidget from '../components/PentagonPizzaIndexWidget';

interface JurisdictionItem {
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  legal_framework?: string;
}

interface ActorNode {
  id?: string;
  label?: string;
  type?: string;
}

export default function IntelligencePortal() {
  const [activeTab, setActiveTab] = useState<'jurisdictions' | 'actors' | 'dossier' | 'pizza_meter'>('jurisdictions');
  const [jurisdictions, setJurisdictions] = useState<JurisdictionItem[]>([]);
  const [actors, setActors] = useState<{ nodes?: ActorNode[] }>({ nodes: [] });

  useEffect(() => {
    if (activeTab === 'jurisdictions') {
      api.get<JurisdictionItem[]>('/api/intelligence/jurisdictions')
        .then(res => setJurisdictions(res))
        .catch(() => {});
    } else if (activeTab === 'actors') {
      api.get<{ nodes?: ActorNode[] }>('/api/intelligence/actors')
        .then(res => setActors(res))
        .catch(() => {});
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#02050a] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight">Oceanopolitics Intelligence</h1>
          <p className="text-blue-400 opacity-70">Analysis of Power, Territory, and International Law</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">
          {([
            { id: 'jurisdictions', label: 'Jurisdictions', icon: <Scale className="w-4 h-4" /> },
            { id: 'actors', label: 'Actor Graph', icon: <Users className="w-4 h-4" /> },
            { id: 'dossier', label: 'Evidence Dossiers', icon: <FileText className="w-4 h-4" /> },
            { id: 'pizza_meter', label: 'Pizza Meter (Pentagon OSINT)', icon: <span className="text-base leading-none">🍕</span> },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-white/50 hover:bg-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            {activeTab === 'jurisdictions' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-blue-400" /> Active Maritime Zones
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {jurisdictions.map((z, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
                      <div>
                        <p className="font-bold">{z.name}</p>
                        <p className="text-xs opacity-50">{z.type} &middot; {z.legal_framework}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${z.status === 'Disputed' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {z.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'actors' && (
              <div className="flex items-center justify-center h-64 bg-black/20 rounded-2xl border border-dashed border-white/20">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm opacity-50">Interactive Actor Graph Loading...</p>
                  <p className="text-xs opacity-30">Analyzing relations between States and Platforms</p>
                </div>
              </div>
            )}

            {activeTab === 'dossier' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-sm text-red-200">Priority Alert: Unauthorized vessel detected in ASPA Region 4.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="font-bold mb-4">Case #882-B: Illegal Fishing Detection</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <p className="opacity-50 mb-1">Evidence Class</p>
                      <p className="font-mono text-blue-400">automated_detection</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <p className="opacity-50 mb-1">Provenance</p>
                      <p className="font-mono text-green-400">Verified by Human Review</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pizza_meter' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-xl">🍕</span> Pentagon Pizza Index &middot; OSINT Realtime Monitor
                  </h2>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-mono font-bold">
                    DEFCON Proxy Telemetry
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-mono">
                  Indicador de inteligencia de fuentes abiertas (OSINT) basado en la concurrencia y volumen de
                  pedidos nocturnos en pizzerías y locales 24h en el perímetro del Pentágono (Arlington, VA) y Langley (CIA).
                </p>
                <PentagonPizzaIndexWidget />
              </div>
            )}
          </div>

          {/* Side Intelligence Panel */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20 backdrop-blur-md">
              <h3 className="text-sm font-bold mb-3 text-blue-400 uppercase tracking-widest">Legal Context</h3>
              <p className="text-xs leading-relaxed opacity-70">
                The current region is subject to the <strong>Antarctic Treaty System</strong>. 
                Any military activity is prohibited under Article I.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md">
              <h3 className="text-sm font-bold mb-3 opacity-50 uppercase tracking-widest">Active Actors</h3>
              <div className="flex flex-col gap-2">
                {actors.nodes?.map((n, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    {n.label} <span className="opacity-40 ml-auto">{n.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
