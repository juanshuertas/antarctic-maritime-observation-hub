import { useState } from 'react';
import { Bird, X, Compass, Download, ChevronDown } from 'lucide-react';

export interface FaunaSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: 'penguins' | 'cetaceans' | 'pinnipeds' | 'seabirds' | 'krill' | 'fish' | 'benthos' | 'phytoplankton';
  sectorName: string;
  conservation: string;
  iucn: string;
  coordinates: [number, number]; // [lon, lat]
  svgPath: string;
  color: string;
}

export const POLAR_SPECIES: FaunaSpecies[] = [
  // 1. PENGUINS
  {
    id: 'emperor_penguin',
    commonName: 'Pingüino Emperador',
    scientificName: 'Aptenodytes forsteri',
    category: 'penguins',
    sectorName: 'Mar de Ross / McMurdo (Cabo Crozier)',
    conservation: 'NT · Colonia Cabo Crozier',
    iucn: 'NT',
    coordinates: [169.32, -77.46],
    color: '#fbbf24',
    svgPath: 'M16 4C17 4 18 5 18 8C19 12 21 16 21 22C21 25 19 27 17 27C15 27 13 25 13 22C13 16 15 12 16 8C16 5 15 4 16 4ZM18 9L23 11L19 13ZM14 27L12 29M18 27L20 29',
  },
  {
    id: 'adelie_penguin',
    commonName: 'Pingüino de Adelia',
    scientificName: 'Pygoscelis adeliae',
    category: 'penguins',
    sectorName: 'Costa Adelia / Dumont d\'Urville',
    conservation: 'LC · Colonia Archipiélago Pointe Géologie',
    iucn: 'LC',
    coordinates: [140.01, -66.66],
    color: '#fbbf24',
    svgPath: 'M16 6C17 6 18 7 18 9C19 12 21 16 21 21C21 24 19 26 17 26C15 26 13 24 13 21C13 16 15 12 16 9C16 7 15 6 16 6ZM18 10L23 12L19 14ZM14 26L12 28M18 26L20 28',
  },
  {
    id: 'chinstrap_penguin',
    commonName: 'Pingüino Barbijo',
    scientificName: 'Pygoscelis antarcticus',
    category: 'penguins',
    sectorName: 'Islas Shetland del Sur (Isla Decepción)',
    conservation: 'LC · Baily Head / Fumarolas',
    iucn: 'LC',
    coordinates: [-60.51, -62.96],
    color: '#fbbf24',
    svgPath: 'M16 6C17 6 18 7 18 9C19 12 21 16 21 21C21 24 19 26 17 26C15 26 13 24 13 21C13 16 15 12 16 9C16 7 15 6 16 6ZM15 11L21 11',
  },
  {
    id: 'gentoo_penguin',
    commonName: 'Pingüino Papúa',
    scientificName: 'Pygoscelis papua',
    category: 'penguins',
    sectorName: 'Península Antártica / Puerto Lockroy',
    conservation: 'LC · Indicador cambio climático',
    iucn: 'LC',
    coordinates: [-63.50, -64.83],
    color: '#fbbf24',
    svgPath: 'M16 6C17 6 18 7 18 9C19 12 21 16 21 21C21 24 19 26 17 26C15 26 13 24 13 21C13 16 15 12 16 9C16 7 15 6 16 6ZM17 7L20 7',
  },

  // 2. CETACEANS
  {
    id: 'blue_whale',
    commonName: 'Ballena Azul Antártica',
    scientificName: 'Balaenoptera musculus intermedia',
    category: 'cetaceans',
    sectorName: 'Tierra de Wilkes / Bahía Prydz',
    conservation: 'CR · Megafauna filtradora',
    iucn: 'CR',
    coordinates: [112.50, -64.20],
    color: '#38bdf8',
    svgPath: 'M3 17C7 13 17 12 24 14C28 12 31 10 33 8C32 13 32 17 33 22C31 20 28 18 24 17C17 19 8 19 3 17ZM12 18C14 22 15 25 14 25C13 25 11 22 10 18',
  },
  {
    id: 'humpback_whale',
    commonName: 'Ballena Jorobada',
    scientificName: 'Megaptera novaeangliae',
    category: 'cetaceans',
    sectorName: 'Estrecho de Gerlache / Península',
    conservation: 'LC · Alimentación masiva estival',
    iucn: 'LC',
    coordinates: [-62.50, -64.60],
    color: '#38bdf8',
    svgPath: 'M3 17C7 13 17 12 24 14C28 12 31 10 33 8C32 13 32 17 33 22C31 20 28 18 24 17C17 19 8 19 3 17ZM15 18L10 26',
  },
  {
    id: 'antarctic_orca',
    commonName: 'Orca Antártica (Ecotipo B/C)',
    scientificName: 'Orcinus orca',
    category: 'cetaceans',
    sectorName: 'Mar de Ross / Polinia de McMurdo',
    conservation: 'DD · Depredador ápice cooperativo',
    iucn: 'DD',
    coordinates: [168.50, -76.80],
    color: '#38bdf8',
    svgPath: 'M3 18C8 14 16 13 22 15C26 13 29 11 32 10C31 13 31 18 32 21C29 19 26 17 22 17C16 18 8 19 3 18ZM15 14L18 6L19 14Z',
  },

  // 3. PINNIPEDS
  {
    id: 'weddell_seal',
    commonName: 'Foca de Weddell',
    scientificName: 'Leptonychotes weddellii',
    category: 'pinnipeds',
    sectorName: 'Mar de Ross / Bahía Erebus',
    conservation: 'LC · Buceador polar extremo (>600m)',
    iucn: 'LC',
    coordinates: [166.66, -77.85],
    color: '#2dd4bf',
    svgPath: 'M5 20C8 16 14 13 20 14C24 15 27 18 30 18C31 16 30 13 28 12C29 11 31 12 31 14C30 19 25 22 18 22C12 22 7 21 5 20ZM11 20C10 22 9 23 8 23',
  },
  {
    id: 'leopard_seal',
    commonName: 'Foca Leopardo',
    scientificName: 'Hydrurga leptonyx',
    category: 'pinnipeds',
    sectorName: 'Península Antártica / Pasaje de Drake',
    conservation: 'LC · Depredador costero de pingüinos',
    iucn: 'LC',
    coordinates: [-60.80, -63.50],
    color: '#2dd4bf',
    svgPath: 'M4 19C7 14 15 12 22 14C26 15 29 18 32 18C31 14 29 11 27 11C29 10 31 11 31 13C30 18 25 21 19 21C13 21 7 20 4 19Z',
  },
  {
    id: 'crabeater_seal',
    commonName: 'Foca Cangrejera',
    scientificName: 'Lobodon carcinophaga',
    category: 'pinnipeds',
    sectorName: 'Mar de Bellingshausen / Amundsen',
    conservation: 'LC · Mayor biomasa de focas del planeta',
    iucn: 'LC',
    coordinates: [-95.00, -71.20],
    color: '#2dd4bf',
    svgPath: 'M5 19C8 15 15 13 21 14C25 15 28 18 31 18C30 14 28 12 26 12C28 11 30 12 30 14C29 18 24 21 18 21C12 21 7 20 5 19Z',
  },
  {
    id: 'ross_seal',
    commonName: 'Foca de Ross',
    scientificName: 'Ommatophoca rossii',
    category: 'pinnipeds',
    sectorName: 'Tierra de la Reina Maud / Mar de Lázarev',
    conservation: 'LC · Especie pelágica críptica de banquisa',
    iucn: 'LC',
    coordinates: [12.00, -68.40],
    color: '#2dd4bf',
    svgPath: 'M6 19C9 15 16 13 22 14C25 15 28 18 31 18C29 15 26 12 24 12C26 11 28 12 28 14C27 18 23 21 17 21C12 21 7 20 6 19Z',
  },

  // 4. SEABIRDS
  {
    id: 'wandering_albatross',
    commonName: 'Albatros Viajero',
    scientificName: 'Diomedea exulans',
    category: 'seabirds',
    sectorName: 'Meseta de Kerguelen / Isla Heard',
    conservation: 'VU · Envergadura 3.5m circumpolar',
    iucn: 'VU',
    coordinates: [73.50, -53.10],
    color: '#a78bfa',
    svgPath: 'M3 14C9 12 14 13 18 16C22 13 27 12 33 14C27 16 22 18 18 19C14 18 9 16 3 14ZM18 16L18 21',
  },
  {
    id: 'snow_petrel',
    commonName: 'Petrel de las Nieves',
    scientificName: 'Pagodroma nivea',
    category: 'seabirds',
    sectorName: 'Polo Sur / Nunataks de Reina Maud',
    conservation: 'LC · Anida hasta 400 km tierra adentro',
    iucn: 'LC',
    coordinates: [-10.50, -71.80],
    color: '#a78bfa',
    svgPath: 'M5 15C10 13 14 14 18 17C22 14 26 13 31 15C26 17 22 19 18 20C14 19 10 17 5 15ZM18 17L18 22',
  },
  {
    id: 'south_polar_skua',
    commonName: 'Págalo Polar Antártico',
    scientificName: 'Stercorarius maccormicki',
    category: 'seabirds',
    sectorName: 'Tierra de Jorge V / Glaciar Mertz',
    conservation: 'LC · Ave más meridional observada',
    iucn: 'LC',
    coordinates: [145.00, -67.10],
    color: '#a78bfa',
    svgPath: 'M4 14C9 12 14 13 18 16C22 13 27 12 32 14C26 16 22 18 18 19C14 18 9 16 4 14ZM18 16L18 21',
  },

  // 5. KRILL & CRUSTACEANS
  {
    id: 'antarctic_krill',
    commonName: 'Krill Antártico',
    scientificName: 'Euphausia superba',
    category: 'krill',
    sectorName: 'Estrecho de Bransfield / Scotia Arc',
    conservation: 'LC · Pilar trófico global (400Mt biomasa)',
    iucn: 'LC',
    coordinates: [-60.80, -63.50],
    color: '#fb923c',
    svgPath: 'M4 14C7 11 14 10 20 12C24 13 28 16 30 14C28 18 22 20 16 19C10 18 6 16 4 14ZM8 10L6 7M12 9L11 6M16 10L17 6',
  },
  {
    id: 'ice_krill',
    commonName: 'Krill Costero de Hielo',
    scientificName: 'Euphausia crystallorophias',
    category: 'krill',
    sectorName: 'Barrera de Ronne-Filchner / Weddell',
    conservation: 'LC · Endémico de aguas subglaciares',
    iucn: 'LC',
    coordinates: [-52.00, -76.50],
    color: '#fb923c',
    svgPath: 'M4 14C7 11 14 10 20 12C24 13 28 16 30 14C28 18 22 20 16 19C10 18 6 16 4 14Z',
  },

  // 6. FISH & SCHOOLS
  {
    id: 'antarctic_toothfish',
    commonName: 'Austromerluza Antártica',
    scientificName: 'Dissostichus mawsoni',
    category: 'fish',
    sectorName: 'Talud Continental de Ross (AMP)',
    conservation: 'NT · Regulación CCAMLR estricta',
    iucn: 'NT',
    coordinates: [176.00, -74.50],
    color: '#93c5fd',
    svgPath: 'M3 16C8 12 18 10 26 13C30 10 32 8 33 9C32 12 32 18 33 21C30 20 28 17 26 18C18 20 8 18 3 16ZM20 11L18 8M15 20L13 23',
  },
  {
    id: 'antarctic_silverfish',
    commonName: 'Arenque Antártico (Cardúmenes)',
    scientificName: 'Pleuragramma antarcticum',
    category: 'fish',
    sectorName: 'Mar de Weddell / Plataforma Filchner',
    conservation: 'LC · Clave trófica nerítica (Simrad EK80)',
    iucn: 'LC',
    coordinates: [-48.50, -75.80],
    color: '#38bdf8',
    svgPath: 'M3 16C8 12 18 10 26 13C30 10 32 8 33 9C32 12 32 18 33 21C30 20 28 17 26 18C18 20 8 18 3 16Z',
  },
  {
    id: 'blackfin_icefish',
    commonName: 'Pez de Hielo Antártico',
    scientificName: 'Chaenocephalus aceratus',
    category: 'fish',
    sectorName: 'Arco de Scotia / Georgias del Sur',
    conservation: 'LC · Sangre transparente sin hemoglobina',
    iucn: 'LC',
    coordinates: [-36.50, -54.30],
    color: '#93c5fd',
    svgPath: 'M3 16C8 12 18 10 26 13C30 10 32 8 33 9C32 12 32 18 33 21C30 20 28 17 26 18C18 20 8 18 3 16Z',
  },

  // 7. BENTHOS & CEPHALOPODS
  {
    id: 'colossal_squid',
    commonName: 'Calamar Colosal Antártico',
    scientificName: 'Mesonychoteuthis hamiltoni',
    category: 'benthos',
    sectorName: 'Mar de Ross / Cañones Abisales',
    conservation: 'LC · Mayor invertebrado (profundidad >1200m)',
    iucn: 'LC',
    coordinates: [178.20, -72.50],
    color: '#f472b6',
    svgPath: 'M16 3 C12 7 11 14 12 19 C13 22 19 22 20 19 C21 14 20 7 16 3 Z M13 21 L9 30 M17 21 L19 31',
  },
  {
    id: 'deep_vme_octocoral',
    commonName: 'Octocoral Antártico (VME)',
    scientificName: 'Thouarella sp.',
    category: 'benthos',
    sectorName: 'Barrera de Ronne-Filchner / Talud',
    conservation: 'VU · Ecosistema Marino Vulnerable (CCAMLR)',
    iucn: 'VU',
    coordinates: [-54.20, -75.80],
    color: '#f472b6',
    svgPath: 'M16 28 L16 12 M16 20 L10 14 M16 16 L22 10 M16 12 L12 8 M16 8 L20 4',
  },

  // 8. PHYTOPLANKTON & DIATOMS
  {
    id: 'fragilariopsis_diatom',
    commonName: 'Diatomea Antártica (Floración Clorofila)',
    scientificName: 'Fragilariopsis kerguelensis',
    category: 'phytoplankton',
    sectorName: 'Polinia del Mar de Ross / Terra Nova',
    conservation: 'LC · Producción primaria récord (Sentinel-3 OLCI)',
    iucn: 'LC',
    coordinates: [168.00, -74.80],
    color: '#10b981',
    svgPath: 'M16 2L16 30M2 16L30 16M6 6L26 26M6 26L26 6M16 6L18 10L22 10L19 13L20 17L16 14L12 17L13 13L10 10L14 10Z',
  },
  {
    id: 'phaeocystis_bloom',
    commonName: 'Alga colonial de Polinia',
    scientificName: 'Phaeocystis antarctica',
    category: 'phytoplankton',
    sectorName: 'Bahía Prydz / Polinia de Amery',
    conservation: 'LC · Sumidero de CO2 masivo (MODIS-Aqua)',
    iucn: 'LC',
    coordinates: [76.50, -68.40],
    color: '#10b981',
    svgPath: 'M16 4C9 4 4 9 4 16C4 23 9 28 16 28C23 28 28 23 28 16C28 9 23 4 16 4ZM16 10C19 10 22 13 22 16C22 19 19 22 16 22C13 22 10 19 10 16C10 13 13 10 16 10Z',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'Todos', color: '#58d5e3' },
  { id: 'penguins', label: 'Pingüinos', color: '#fbbf24' },
  { id: 'cetaceans', label: 'Cetáceos', color: '#38bdf8' },
  { id: 'pinnipeds', label: 'Focas', color: '#2dd4bf' },
  { id: 'seabirds', label: 'Aves', color: '#a78bfa' },
  { id: 'krill', label: 'Krill', color: '#fb923c' },
  { id: 'fish', label: 'Peces / Cardúmenes', color: '#93c5fd' },
  { id: 'phytoplankton', label: 'Fitoplancton', color: '#10b981' },
  { id: 'benthos', label: 'Bentos & Abisal', color: '#f472b6' },
] as const;

interface FaunaStripProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecies?: (species: FaunaSpecies) => void;
}

export default function FaunaStrip({ isOpen, onClose, onSelectSpecies }: FaunaStripProps) {
  const [activeSpeciesId, setActiveSpeciesId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const handleDownload = (type: 'all_geojson' | 'all_csv' | 'phyto' | 'fish' | 'krill' | 'whales') => {
    let url = '';
    let filename = '';
    if (type === 'all_geojson') {
      url = '/data/web/geojson/antarctic_fauna.geojson';
      filename = 'antarctic_fauna_circumpolar.geojson';
    } else if (type === 'all_csv') {
      url = '/data/web/geojson/antarctic_marine_monitoring.csv';
      filename = 'antarctic_marine_monitoring_all.csv';
    } else if (type === 'phyto') {
      url = '/data/web/geojson/phytoplankton_chlorophyll.geojson';
      filename = 'phytoplankton_chlorophyll_sentinel3.geojson';
    } else if (type === 'fish') {
      url = '/data/web/geojson/fauna_schools_fish.geojson';
      filename = 'fauna_schools_fish_ek80.geojson';
    } else if (type === 'krill') {
      url = '/data/web/geojson/fauna_krill_swarms.geojson';
      filename = 'fauna_krill_swarms_ccamlr.geojson';
    } else if (type === 'whales') {
      url = '/data/web/geojson/fauna_whale_pods.geojson';
      filename = 'fauna_whale_pods_iwc.geojson';
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  const filteredSpecies = selectedCategory === 'all'
    ? POLAR_SPECIES
    : POLAR_SPECIES.filter((s) => s.category === selectedCategory);

  return (
    <div
      aria-label="Franja de fauna polar antártica"
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[240] w-[96%] max-w-[1240px] bg-[#07131df4] border border-[#1f3947] rounded-2xl px-3.5 py-2.5 flex flex-col gap-2 shadow-2xl backdrop-blur-md select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top Header + Category Filter Chips */}
      <div className="flex items-center justify-between gap-2 border-b border-[#1f3947]/70 pb-1.5">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#58d5e3]/15 border border-[#58d5e3]/30 flex items-center justify-center text-[#58d5e3]">
            <Bird className="w-4 h-4" />
          </div>
          <div className="leading-tight text-left">
            <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>CATÁLOGO DE FAUNA ANTÁRTICA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#58d5e3] animate-pulse" />
              <span className="text-[10px] font-mono text-[#72e0b5] font-normal hidden sm:inline">
                (18 Sectores Circumpolares · OBIS & MAPPPD)
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#163647] text-white border border-[#58d5e3] shadow-sm'
                    : 'text-[#8faab5] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                style={isActive ? { borderColor: tab.color } : {}}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                  style={{ backgroundColor: tab.color }}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Actions Group: Download + Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Download Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDownloadMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#10b981]/50 text-[#34d399] hover:text-white text-[10.5px] font-mono font-medium transition-all shadow-sm"
              title="Descargar datasets de fauna y monitoreo marino"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar Datos</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isDownloadMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#0a1e2b] border border-[#1e455e] rounded-xl p-1.5 shadow-2xl z-[300] font-mono text-[11px] space-y-1 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] text-[#8faab5] border-b border-[#142e3f] font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>Formatos de Descarga</span>
                  <span className="text-[#34d399] font-mono font-bold">1,136 reg.</span>
                </div>
                <button
                  onClick={() => {
                    handleDownload('all_geojson');
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 text-white flex items-center justify-between group transition-colors"
                >
                  <span>🌍 GeoJSON Fauna Completo</span>
                  <span className="text-[9px] text-[#58d5e3] font-semibold group-hover:underline">.geojson</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload('all_csv');
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 text-white flex items-center justify-between group transition-colors"
                >
                  <span>📊 CSV Monitoreo Marino</span>
                  <span className="text-[9px] text-[#34d399] font-semibold group-hover:underline">.csv</span>
                </button>
                <div className="border-t border-[#142e3f] my-1 pt-1 px-2 text-[9px] text-[#8faab5] uppercase">
                  Subcapas Específicas
                </div>
                <button
                  onClick={() => {
                    handleDownload('phyto');
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded-lg hover:bg-white/10 text-[#a7f3d0] flex items-center justify-between text-[10px]"
                >
                  <span>🌱 Fitoplancton (Sentinel-3)</span>
                  <span className="text-[8px] text-[#8faab5]">GeoJSON</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload('fish');
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded-lg hover:bg-white/10 text-[#93c5fd] flex items-center justify-between text-[10px]"
                >
                  <span>🐟 Cardúmenes Peces (EK80)</span>
                  <span className="text-[8px] text-[#8faab5]">GeoJSON</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload('krill');
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded-lg hover:bg-white/10 text-[#fed7aa] flex items-center justify-between text-[10px]"
                >
                  <span>🦐 Krill Swarms (CCAMLR)</span>
                  <span className="text-[8px] text-[#8faab5]">GeoJSON</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload('whales');
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded-lg hover:bg-white/10 text-[#7dd3fc] flex items-center justify-between text-[10px]"
                >
                  <span>🐋 Manadas Ballenas (IWC)</span>
                  <span className="text-[8px] text-[#8faab5]">GeoJSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-white/10 text-[#8faab5] hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Cerrar catálogo de fauna"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Species Horizontal Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        {filteredSpecies.map((spec) => {
          const isSelected = activeSpeciesId === spec.id;

          return (
            <button
              key={spec.id}
              onClick={() => {
                const nextId = isSelected ? null : spec.id;
                setActiveSpeciesId(nextId);
                if (nextId) onSelectSpecies?.(spec);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-150 group relative shrink-0 text-left ${
                isSelected
                  ? 'bg-[#122b38] border shadow-[0_0_12px_rgba(88,213,227,0.3)]'
                  : 'hover:bg-white/5 border border-[#142938]'
              }`}
              style={{
                borderColor: isSelected ? spec.color : undefined,
              }}
              title={`${spec.commonName} (${spec.scientificName}) — ${spec.sectorName} [${spec.conservation}]`}
            >
              {/* Species Vector Icon Container */}
              <div
                className="w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                style={{ color: spec.color }}
              >
                <svg viewBox="0 0 36 32" fill="none" className="w-5 h-5">
                  <path
                    d={spec.svgPath}
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={isSelected ? `${spec.color}25` : 'none'}
                  />
                </svg>
              </div>

              {/* Species Information */}
              <div className="leading-tight shrink-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-semibold transition-colors ${
                      isSelected ? 'text-white' : 'text-[#cbe4ec] group-hover:text-white'
                    }`}
                  >
                    {spec.commonName}
                  </span>
                  <span
                    className={`text-[8px] font-mono px-1 rounded font-bold ${
                      spec.iucn === 'CR'
                        ? 'bg-red-500/30 text-red-300'
                        : spec.iucn === 'VU'
                        ? 'bg-amber-500/30 text-amber-300'
                        : spec.iucn === 'NT'
                        ? 'bg-yellow-500/30 text-yellow-300'
                        : 'bg-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {spec.iucn}
                  </span>
                </div>
                <div className="text-[8.5px] font-mono text-[#7e9ba6] italic truncate max-w-[130px]">
                  {spec.scientificName}
                </div>
                <div className="text-[7.5px] font-mono text-[#58d5e3]/80 truncate max-w-[130px] flex items-center gap-1 mt-0.5">
                  <Compass className="w-2.5 h-2.5 shrink-0" />
                  <span>{spec.sectorName.split('/')[0]}</span>
                </div>
              </div>

              {/* Active Selection Indicator */}
              {isSelected && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 animate-ping"
                  style={{ backgroundColor: spec.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
