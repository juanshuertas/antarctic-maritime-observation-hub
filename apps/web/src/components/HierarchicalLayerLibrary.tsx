import { useState, useEffect } from 'react';







import {







  Layers,







  ChevronRight,







  ChevronDown,







  Eye,







  EyeOff,







  X,







  Info,







} from 'lucide-react';







import { type LeafLayerItem } from '../lib/hierarchical-layers';
import { CANONICAL_LAYER_TREE } from '../lib/olea-canonical-layer-tree';







import { getHealthColorHex } from '../lib/data-truth-model';







import { getLayerSDGBadge } from '../lib/sdg-registry';







import { getLayerSemantics } from '../lib/layer-semantics';







import { getLayerSvgDataUri } from '../lib/map-icon-atlas';







import AgencyBadge from './AgencyBadge';







import LayerDetailModal from './LayerDetailModal';

import { scientificSupplementMatches } from '../lib/scientific-domain-supplement.generated';

import ScientificDomainSupplement from './ScientificDomainSupplement';

import LayerDataCoverage from './LayerDataCoverage';















interface HierarchicalLayerLibraryProps {







  isOpen: boolean;







  onClose: () => void;







  activeLayerIds: string[];







  onToggleLayer: (layerId: string) => void;







  onSoloLayer?: (layerId: string) => void;







  onSetOpacity?: (layerId: string, opacity: number) => void;







  layerOpacities?: Record<string, number>;







  embedded?: boolean;







}















export default function HierarchicalLayerLibrary({







  isOpen,







  onClose,







  activeLayerIds,







  onToggleLayer,







  onSoloLayer,







  onSetOpacity,







  layerOpacities = {},







  embedded = false,







}: HierarchicalLayerLibraryProps) {







  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({







    QUANTARCTICA: false,







    ACTIVITY: false,







    ENVIRONMENT: false,







    OCEAN: false,







    ICE: false,







    LIFE: false,







    SENSORS: false,







    INFRASTRUCTURE: false,







    POLLUTION: false,







    GOVERNANCE: false,







    FIELD: false,







    SPACE_GEOPHYSICS: false,







  });







  const [searchQuery, setSearchQuery] = useState('');







  const [selectedLeafForInfo, setSelectedLeafForInfo] = useState<LeafLayerItem | null>(null);







  const [activeTab, setActiveTab] = useState<'tree' | 'active_stack'>('tree');







  const [soloedLayerId, setSoloedLayerId] = useState<string | null>(null);







  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');



  const focusDomain = (domainId: string) => {

    setActiveTab('tree');

    setSelectedDomainFilter(domainId);

    setExpandedDomains((prev) => ({ ...prev, [domainId]: true }));

  };



  const focusLayerInLibrary = (layerId: string) => {

    const domain = CANONICAL_LAYER_TREE.find((d) =>

      d.subdomains.some((s) => s.layers.some((l) => l.id === layerId))

    );

    if (domain) focusDomain(domain.id);

  };



  useEffect(() => {

    (window as any).__amohFocusLayerDomain = focusDomain;

    (window as any).__amohFocusLayer = focusLayerInLibrary;

    return () => {

      delete (window as any).__amohFocusLayerDomain;

      delete (window as any).__amohFocusLayer;

    };

  }, []);

















  const PRESET_PACKS = [







    {







      id: 'quantarctica',







      label: '🏔️ Quantarctica NPI',







      color: '#00e5ff',







      layers: [







        'quantarctica_coastline',







        'quantarctica_ice_shelf',







        'rock_outcrops',







        'glacier_velocity',







        'southern_ocean_fronts',







        'acbrs',







        'emperor_penguin_colonies',







        'comnap_facilities',







      ],







    },







    {







      id: 'defense',







      label: '🛡️ Fricción & Defensa',







      color: '#ef4444',







      layers: [







        'grey_zones_defense',







        'polar_friction_sectors',







        'grey_zones_buffers',







        'subsurface_nuclear',







      ],







    },







    {







      id: 'ecology',







      label: '🐧 Biodiversidad Polar',







      color: '#10b981',







      layers: [







        'emperor_penguin_colonies',







        'important_bird_areas',







        'fauna_benthos',







        'fauna_cetaceans',







        'fauna_fish',







        'fauna_krill',







        'ccamlr_mpas',







      ],







    },







    {







      id: 'ocean_argo',







      label: '🌊 Océano & Argo',







      color: '#38bdf8',







      layers: [







        'ocean_currents',







        'southern_ocean_fronts',







        'quantarctica_bathymetry',







        'argo_floats',







      ],







    },







  ];















  const applyPreset = (presetLayers: string[], presetLabel = '', presetId = '') => {

    presetLayers.forEach((id) => {

      if (!activeLayerIds.includes(id)) onToggleLayer(id);

    });

    const key = `${presetId} ${presetLabel}`.toLowerCase();

    if (key.includes('biodivers')) focusDomain('LIFE');

  };















  const clearAllNonBase = () => {







    activeLayerIds.forEach((id) => {







      onToggleLayer(id);







    });







  };















  if (!isOpen && !embedded) return null;















  const toggleDomain = (domainId: string) => {







    setExpandedDomains((prev) => ({ ...prev, [domainId]: !prev[domainId] }));







  };















  const handleSolo = (layerId: string) => {







    if (soloedLayerId === layerId) {







      setSoloedLayerId(null);







    } else {







      setSoloedLayerId(layerId);







      onSoloLayer?.(layerId);







    }







  };















  // Find all leaf layers







  const allLeafLayers: LeafLayerItem[] = [];







  CANONICAL_LAYER_TREE.forEach((dom) => {







    dom.subdomains.forEach((sub) => {







      sub.layers.forEach((l) => allLeafLayers.push(l));







    });







  });















  const activeLeaves = allLeafLayers.filter((l) => activeLayerIds.includes(l.id));















  return (







    <div







      role="dialog"







      aria-label="Biblioteca Jerárquica de Capas Antárticas"







      className={embedded







        ? "relative w-full min-h-[520px] bg-transparent text-[#edf5f5] flex flex-col select-none"







        : "fixed inset-y-0 right-0 z-[250] w-[440px] max-w-full bg-[#05111b]/95 backdrop-blur-xl border-l border-[#1f3947] text-[#edf5f5] shadow-2xl flex flex-col select-none animate-in slide-in-from-right-5 duration-200"}







      style={{ fontFamily: "'DM Sans', sans-serif" }}







    >







      {/* Header */}







      <div className="px-5 py-4 border-b border-[#1f3947] bg-[#030c14] flex items-center justify-between">







        <div className="flex items-center gap-2.5">







          <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/15 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">







            <Layers className="w-4 h-4" />







          </div>







          <div>







            <h2 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">







              <span>Biblioteca de Capas V8.5</span>







              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 font-bold">







                {CANONICAL_LAYER_TREE.length} Dominios







              </span>







            </h2>







            <p className="text-[11px] font-mono text-[#8faab5]">







              Quantarctica 3 · Defensa · Fauna · GFW · Control de Capas







            </p>







          </div>







        </div>







        {!embedded && (







        <button







          onClick={onClose}







          className="p-1.5 rounded-lg bg-[#0d2232] hover:bg-[#1a384f] text-[#8faab5] hover:text-white transition-colors"







          title="Cerrar Biblioteca"







        >







          <X className="w-4 h-4" />







        </button>







        )}







      </div>















      {/* Tabs */}







      <div className="px-5 py-2 border-b border-[#1f3947] bg-[#071724] flex items-center gap-3">







        <button







          onClick={() => setActiveTab('tree')}







          className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${







            activeTab === 'tree'







              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 shadow-sm'







              : 'text-[#8faab5] hover:text-white'







          }`}







        >







          Árbol de Dominios ({allLeafLayers.length})







        </button>







        <button







          onClick={() => setActiveTab('active_stack')}







          className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${







            activeTab === 'active_stack'







              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 shadow-sm'







              : 'text-[#8faab5] hover:text-white'







          }`}







        >







          <span>Pila Activa</span>







          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-[#00e5ff] text-black font-bold">







            {activeLayerIds.length}







          </span>







        </button>







      </div>















      {/* Search Bar */}







      <div className="px-4 py-2 border-b border-[#1f3947] bg-[#040e16]">







        <input







          type="text"







          value={searchQuery}







          onChange={(e) => setSearchQuery(e.target.value)}







          placeholder="Buscar capas (ej. Quantarctica, ASPA, pingüinos, InSAR, radar, boyas)..."







          className="w-full bg-[#091b29] border border-[#1d3a4d] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#5a7d91] focus:outline-none focus:border-[#00e5ff]/60 font-mono"







        />







      </div>















      {/* 1-Click Quick Preset Packs */}







      <div className="px-4 py-2 border-b border-[#1f3947] bg-[#020b12] flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scrollbar-none text-[11px]">







        <span className="text-[10px] font-mono text-[#5a7d91] uppercase tracking-wider flex-shrink-0 mr-1">







          Packs:







        </span>







        {PRESET_PACKS.map((pack) => (







          <button







            key={pack.id}







            onClick={() => applyPreset(pack.layers)}







            className="px-2 py-1 rounded-md bg-[#0b2131] hover:bg-[#123147] border border-[#1a384f] hover:border-[#00e5ff]/60 text-white font-medium flex-shrink-0 transition-all flex items-center gap-1 shadow-sm active:scale-95"







            title={`Activar pack temático ${pack.label}`}







          >







            <span>{pack.label}</span>







          </button>







        ))}







        <button







          onClick={clearAllNonBase}







          className="px-2 py-1 rounded-md bg-[#1e131d] hover:bg-[#34162a] border border-[#ef4444]/30 hover:border-[#ef4444]/60 text-[#fca5a5] flex-shrink-0 transition-all active:scale-95"







          title="Desactivar todas las capas temáticas"







        >







          🧹 Limpiar







        </button>







      </div>















      {/* Domain Category Filter Pills */}







      <div className="px-4 py-2 border-b border-[#1f3947] bg-[#051420] flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scrollbar-none text-xs">







        <button







          onClick={() => setSelectedDomainFilter('ALL')}







          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 transition-all ${







            selectedDomainFilter === 'ALL'







              ? 'bg-[#00e5ff] text-black font-bold shadow-sm'







              : 'bg-[#091b29] text-[#8faab5] hover:text-white border border-[#1a3547]'







          }`}







        >







          Todas ({allLeafLayers.length})







        </button>







        {CANONICAL_LAYER_TREE.map((domain) => {







          const isSelected = selectedDomainFilter === domain.id;







          const count = domain.subdomains.flatMap((s) => s.layers).length;







          const shortName = domain.label.split('(')[0].replace(/^[0-9]+\.\s*/, '').trim();







          return (







            <button







              key={domain.id}







              onClick={() => focusDomain(domain.id)}







              className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0 transition-all flex items-center gap-1.5 ${







                isSelected







                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff] font-bold'







                  : 'bg-[#091b29] text-[#8faab5] hover:text-white border border-[#1a3547]'







              }`}







            >







              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: domain.color }} />







              <span>{shortName}</span>







              <span className="text-[10px] opacity-75">({count})</span>







            </button>







          );







        })}







      </div>















      {/* Main Content Area */}







      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">







        {activeTab === 'tree' ? (







          <div className="space-y-3">







            {CANONICAL_LAYER_TREE.map((domain) => {







              if (selectedDomainFilter !== 'ALL' && domain.id !== selectedDomainFilter) {







                return null;







              }















              const q = searchQuery.toLowerCase().trim();







              const domainLeaves = domain.subdomains.flatMap((s) => s.layers);







              const filteredDomainLeaves = q







                ? domainLeaves.filter((l) => l.label.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.provider.toLowerCase().includes(q))







                : domainLeaves;















              if (q && filteredDomainLeaves.length === 0 && !scientificSupplementMatches(domain.id, q)) return null;















              const isDomainExpanded = q ? true : !!expandedDomains[domain.id];







              const activeDomainLeaves = domainLeaves.filter((l) => activeLayerIds.includes(l.id));







              const isPartial = activeDomainLeaves.length > 0 && activeDomainLeaves.length < domainLeaves.length;







              const isAllOn = domainLeaves.length > 0 && activeDomainLeaves.length === domainLeaves.length;















              return (







                <div







                  key={domain.id}







                  className="rounded-xl border border-[#1a3344] bg-[#081722]/80 overflow-hidden"







                >







                  {/* Domain Header */}







                  <div







                    onClick={() => toggleDomain(domain.id)}







                    className="px-3.5 py-2.5 bg-[#0a1e2d] hover:bg-[#0e273a] cursor-pointer flex items-center justify-between border-b border-[#162d3c] transition-colors"







                  >







                    <div className="flex items-center gap-2">







                      <span className="text-[#8faab5]">







                        {isDomainExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}







                      </span>







                      <span







                        className="w-2.5 h-2.5 rounded-full"







                        style={{ backgroundColor: domain.color }}







                      />







                      <span className="text-xs font-bold tracking-wide text-white">







                        {domain.label}







                      </span>







                    </div>















                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>







                      <span className="text-[10px] font-mono text-[#8faab5]">







                        {activeDomainLeaves.length}/{domainLeaves.length}







                      </span>







                      {/* Tri-state bulk toggle */}







                      <button







                        onClick={() => {







                          const shouldEnable = !isAllOn;







                          domainLeaves.forEach((leaf) => {







                            if (shouldEnable && !activeLayerIds.includes(leaf.id)) {







                              onToggleLayer(leaf.id);







                            } else if (!shouldEnable && activeLayerIds.includes(leaf.id)) {







                              onToggleLayer(leaf.id);







                            }







                          });







                        }}







                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] border transition-colors ${







                          isAllOn







                            ? 'bg-[#00e5ff] border-[#00e5ff] text-black font-bold'







                            : isPartial







                            ? 'bg-[#00e5ff]/30 border-[#00e5ff]/60 text-[#00e5ff]'







                            : 'border-[#2d495b] text-transparent hover:border-[#8faab5]'







                        }`}







                        title={isAllOn ? 'Desactivar todo el dominio' : 'Activar todo el dominio'}







                      >







                        {isAllOn ? '✓' : isPartial ? '—' : ''}







                      </button>







                    </div>







                  </div>















                  {/* Subdomains and Leaf Layers */}







                  {isDomainExpanded && (







                    <div className="p-2.5 space-y-3 bg-[#06121a]">







                      <ScientificDomainSupplement domainId={domain.id} searchQuery={searchQuery} />

                      {domain.subdomains.map((sub) => (







                        <div key={sub.id} className="space-y-1.5 pl-2 border-l-2 border-[#193547]">







                          <div className="text-[11px] font-semibold text-[#8faab5] uppercase tracking-wider px-1">







                            {sub.label}







                          </div>















                          <div className="space-y-1">







                            {sub.layers.map((leaf) => {







                              const isActive = activeLayerIds.includes(leaf.id);







                              const isSolo = soloedLayerId === leaf.id;







                              const currentOpacity = layerOpacities[leaf.id] ?? leaf.opacity;















                              return (







                                <div







                                  key={leaf.id}







                                  className={`p-2.5 rounded-lg border transition-all ${







                                    isActive







                                      ? 'bg-[#0a202e] border-[#00e5ff]/30 shadow-sm'







                                      : 'bg-[#06141f] border-[#142938] opacity-75 hover:opacity-100'







                                  }`}







                                >







                                  <div className="flex items-center justify-between gap-2">







                                    <div className="flex items-center gap-2 flex-1 min-w-0">







                                      {/* Health indicator dot */}







                                      <span







                                        className="w-2 h-2 rounded-full flex-shrink-0"







                                        style={{ backgroundColor: getHealthColorHex(leaf.health) }}







                                        title={`Estado de Veracidad: ${leaf.healthLabel}`}







                                      />







                                      <img







                                        src={getLayerSvgDataUri(leaf.id)}







                                        alt=""







                                        className="w-4 h-4 rounded shrink-0 object-contain p-0.5 bg-[#030e17] border border-[#1b3b4f]"







                                        onError={(e) => {







                                          (e.target as HTMLElement).style.display = 'none';







                                        }}







                                      />







                                      <span className="text-[11px] font-semibold text-white leading-tight whitespace-normal break-words">







                                        {leaf.label}







                                      </span>







                                      {(() => {







                                        const sdg = getLayerSDGBadge(leaf.id);







                                        const semantics = getLayerSemantics(leaf.id);







                                        return (







                                          <div className="flex items-center gap-1.5 shrink-0">







                                            <img







                                              src={`/sdg-icons/${sdg.number}.png`}







                                              alt={`ODS ${sdg.number}`}







                                              className="w-4 h-4 rounded object-cover shrink-0 border border-white/20"







                                              onError={(e) => {







                                                (e.target as HTMLElement).style.display = 'none';







                                              }}







                                              title={`ODS ${sdg.number}: ${sdg.name}`}







                                            />







                                            <span







                                              className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold shrink-0 shadow-sm"







                                              style={{ backgroundColor: sdg.color, color: sdg.textColor }}







                                              title={`ODS ${sdg.number}: ${sdg.name}`}







                                            >







                                              ODS {sdg.number}







                                            </span>







                                            {semantics?.agency && (







                                              <AgencyBadge agency={semantics.agency} size="xs" />







                                            )}







                                          </div>







                                        );







                                      })()}







                                    </div>















                                    {/* Action buttons */}







                                    <div className="flex items-center gap-1.5 flex-shrink-0">







                                      {/* Solo button */}







                                      <button







                                        onClick={() => handleSolo(leaf.id)}







                                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-colors ${







                                          isSolo







                                            ? 'bg-[#ff754b] border-[#ff754b] text-black font-bold'







                                            : 'border-[#203a4b] text-[#8faab5] hover:text-white hover:border-[#8faab5]'







                                        }`}







                                        title="Solo Mode: Ocultar temporalmente todas las demás capas"







                                      >







                                        SOLO







                                      </button>















                                      {/* Info Drawer Button */}







                                      <button







                                        onClick={() => setSelectedLeafForInfo(leaf)}







                                        className="p-1 rounded text-[#8faab5] hover:text-white hover:bg-[#132c3f]"







                                        title="Detalles de Procedencia & Metadatos"







                                      >







                                        <Info className="w-3.5 h-3.5" />







                                      </button>















                                      {/* On/Off Toggle Button */}







                                      <button







                                        onClick={() => onToggleLayer(leaf.id)}







                                        className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${







                                          isActive







                                            ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'







                                            : 'border-[#223d4e] text-[#526f80] hover:text-[#8faab5]'







                                        }`}







                                        title={isActive ? 'Desactivar Capa' : 'Activar Capa'}







                                      >







                                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}







                                      </button>







                                    </div>







                                  </div>















                                  <LayerDataCoverage

                                    layerId={leaf.id}

                                    label={leaf.label}

                                    provider={leaf.provider}

                                    recordCount={leaf.recordCount}

                                    unit={leaf.unit}

                                  />



                                  {/* Sub-row: Data counter and opacity if active */}







                                  {isActive && (







                                    <div className="mt-2 pt-1.5 border-t border-[#132938] flex items-center justify-between text-[10px] font-mono text-[#8faab5]">







                                      <div className="flex items-center gap-1.5">







                                        <span className="text-[#00e676] font-semibold">







                                          {leaf.recordCount} {leaf.unit || 'registros'}







                                        </span>







                                        <span>·</span>







                                        <span className="truncate max-w-[140px]">{leaf.provider}</span>







                                      </div>















                                      {/* Opacity slider */}







                                      <div className="flex items-center gap-1.5">







                                        <span>{Math.round(currentOpacity * 100)}%</span>







                                        <input







                                          type="range"







                                          min="0.1"







                                          max="1.0"







                                          step="0.05"







                                          value={currentOpacity}







                                          onChange={(e) => onSetOpacity?.(leaf.id, parseFloat(e.target.value))}







                                          className="w-14 h-1 bg-[#1a384f] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"







                                        />







                                      </div>







                                    </div>







                                  )}







                                </div>







                              );







                            })}







                          </div>







                        </div>







                      ))}







                    </div>







                  )}







                </div>







              );







            })}







          </div>







        ) : (







          /* Active Layer Stack */







          <div className="space-y-2.5">







            <div className="flex items-center justify-between text-xs text-[#8faab5] px-1 font-mono">







              <span>ORDEN DE RENDERIZADO (GPU TOP → BOTTOM)</span>







              <span>{activeLeaves.length} ACTIVAS</span>







            </div>















            {activeLeaves.length === 0 ? (







              <div className="p-8 text-center text-xs font-mono text-[#627d8e] border border-dashed border-[#1f3947] rounded-xl">







                No hay capas temáticas activas en este momento.







              </div>







            ) : (







              activeLeaves.map((leaf, idx) => (







                <div







                  key={leaf.id}







                  className="p-3 rounded-lg border border-[#00e5ff]/30 bg-[#0a202e] flex items-center justify-between gap-3 shadow-md"







                >







                  <div className="flex items-center gap-2.5 flex-1 min-w-0">







                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#102a3d] text-[#8faab5]">







                      #{idx + 1}







                    </span>







                    <span







                      className="w-2 h-2 rounded-full flex-shrink-0"







                      style={{ backgroundColor: getHealthColorHex(leaf.health) }}







                    />







                    <div className="truncate">







                      <div className="text-xs font-bold text-white truncate">{leaf.label}</div>







                      <div className="text-[10px] font-mono text-[#8faab5]">{leaf.provider}</div>







                    </div>







                  </div>















                  <div className="flex items-center gap-2">







                    <button







                      onClick={() => onToggleLayer(leaf.id)}







                      className="p-1 rounded bg-[#1a384f] hover:bg-[#ef4444]/20 hover:text-[#ef4444] text-[#8faab5] transition-colors"







                      title="Quitar de la pila activa"







                    >







                      <X className="w-3.5 h-3.5" />







                    </button>







                  </div>







                </div>







              ))







            )}







          </div>







        )}







      </div>















      {/* Comprehensive Layer Detail Modal (Logos, What it is, Purpose, Specs) */}







      <LayerDetailModal







        layerId={selectedLeafForInfo?.id || null}







        onClose={() => setSelectedLeafForInfo(null)}







        isActive={selectedLeafForInfo ? activeLayerIds.includes(selectedLeafForInfo.id) : false}







        onToggleActive={onToggleLayer}







      />







    </div>







  );







}







