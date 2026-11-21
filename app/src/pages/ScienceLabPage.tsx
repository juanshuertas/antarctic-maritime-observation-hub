import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EarthTrendPanel from '../components/EarthTrendPanel';
import {
  ArrowLeft,
  Waves,
  Wind,
  Mountain,
  Dna,
  Radiation,
  Network,
  GitFork,
  FlaskConical,
  Database,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  Thermometer,
  Compass,
  BookOpen,
  Search,
  TrendingUp,
} from 'lucide-react';

interface PacPublication {
  id: string;
  year: number;
  title: string;
  keywords: string[];
  theme: string;
  source: string;
}

interface ScienceDomain {
  id: string;
  name: string;
  icon: any;
  color: string;
  datasets: string[];
  description: string;
}

function parsePublications(payload: unknown): PacPublication[] {
  if (typeof payload !== 'object' || payload === null || !('publications' in payload)) {
    throw new Error('El catálogo de publicaciones no contiene la lista esperada.');
  }
  const { publications } = payload;
  if (!Array.isArray(publications)) {
    throw new Error('La lista de publicaciones tiene un formato no válido.');
  }

  return publications.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`El registro de publicación ${index + 1} no es válido.`);
    }
    const record = entry as Record<string, unknown>;
    if (
      typeof record.id !== 'string' ||
      typeof record.title !== 'string' ||
      typeof record.year !== 'number' ||
      !Number.isInteger(record.year)
    ) {
      throw new Error(`Faltan campos requeridos en la publicación ${index + 1}.`);
    }

    let keywords: string[];
    if (typeof record.keywords === 'string') {
      keywords = record.keywords.split(';').map((keyword) => keyword.trim()).filter(Boolean);
    } else if (Array.isArray(record.keywords) && record.keywords.every((keyword) => typeof keyword === 'string')) {
      keywords = record.keywords;
    } else {
      throw new Error(`Las palabras clave de la publicación ${index + 1} no son válidas.`);
    }

    return {
      id: record.id,
      title: record.title,
      year: record.year,
      keywords,
      theme: typeof record.category === 'string' ? record.category : '',
      source: typeof record.institution_framework === 'string' ? record.institution_framework : '',
    };
  });
}

const DOMAINS: ScienceDomain[] = [
  {
    id: 'ocean',
    name: 'Oceanografía Física & Dinámica',
    icon: Waves,
    color: '#00A6A6',
    datasets: ['Copernicus Marine (SST, Salinidad, Corrientes)', 'Boyas Argo (Perfiles CTD 0–2000m)', 'SOOS Observaciones Australes'],
    description: 'Circulación antártica, Frente Polar, corrientes de fondo y balance de calor del Océano Austral.',
  },
  {
    id: 'atmosphere',
    name: 'Meteorología & Clima Polar',
    icon: Wind,
    color: '#58D5E3',
    datasets: ['ERA5 Reanálisis Horario', 'Copernicus CDS Climatología', 'Estaciones Automáticas AWS'],
    description: 'Vientos catabáticos, borrascas polares, presión atmosférica y gradientes térmicos troposféricos.',
  },
  {
    id: 'ice',
    name: 'Criosfera & Hielo Marino',
    icon: Mountain,
    color: '#CAF9F7',
    datasets: ['NASA GIBS Reflectancia VIIRS', 'NSIDC Concentración de Banquisa', 'BedMachine Topografía Subglaciar'],
    description: 'Extensión estacional de hielo marino, deriva de témpanos gigantes y dinámica de plataformas glaciares.',
  },
  {
    id: 'biodiversity',
    name: 'Biodiversidad Marina & Ecosistemas',
    icon: Dna,
    color: '#72E0B5',
    datasets: ['OBIS Océano Austral', 'GBIF Registros Taxonómicos', 'CCAMLR Biomasa de Krill'],
    description: 'Redes tróficas antárticas, poblaciones de krill (Euphausia superba) y monitoreo de predadores tope.',
  },
  {
    id: 'radioactivity',
    name: 'Radiactividad Marina (OIEA MARIS)',
    icon: Radiation,
    color: '#FF5E8A',
    datasets: ['OIEA MARIS Cesio-137 / Estroncio-90', 'Líneas Base Radionucleares', 'Vigilancia Atmosférica CTBTO'],
    description: 'Monitoreo de radionúclidos antropogénicos y naturales en la columna de agua y sedimentos bentónicos.',
  },
  {
    id: 'infrastructure',
    name: 'Infraestructura Científica & Cables',
    icon: Network,
    color: '#FFC845',
    datasets: ['Bases Permanentes y de Verano (COMNAP)', 'Iniciativa Cables SMART', 'Sistemas de Conectividad Polar'],
    description: 'Georreferenciación de estaciones científicas, sensores autónomos y rutas de cables submarinos.',
  },
];

const GRAPH_NODES = [
  { id: 'expedition', step: '01. EXPEDICIÓN', label: 'Expedición Polar NGRS-ANTA-2027', meta: 'Campaña Austral de Alta Resolución', icon: Compass },
  { id: 'vessel', step: '02. BUQUE', label: 'R/V Laura Bassi (OGS Italia)', meta: 'Plataforma Polar Ice-Class A1', icon: Layers },
  { id: 'cruise', step: '03. CRUCERO', label: 'Crucero Oceanográfico SOOS-Ross-IV', meta: 'Transepto 60°S - 75°S', icon: Waves },
  { id: 'track', step: '04. DERROTA', label: 'Trayectoria GPS/AIS Calibrada', meta: '1,420 NM recorridas a 10.2 kn', icon: Network },
  { id: 'station', step: '05. ESTACIÓN', label: 'Estación Hidrográfica STN-042', meta: '64°18.4′S, 62°52.1′W (Gerlache)', icon: Mountain },
  { id: 'cast', step: '06. LANCE', label: 'Lance CTD Rosette #14', meta: 'Perfil Batitermógrafo 0 - 650 m', icon: Thermometer },
  { id: 'sample', step: '07. MUESTRA', label: 'Botella Niskin #08 (Agua Subsuperficial)', meta: 'Volumen 10.0 L @ Profundidad 250 m', icon: FlaskConical },
  { id: 'instrument', step: '08. INSTRUMENTO', label: 'Seabird SBE 911plus & Espectrómetro FTIR', meta: 'Calibración trazable NIST/WMO', icon: ShieldCheck },
  { id: 'analysis', step: '09. ANÁLISIS', label: 'Conteo Microplásticos & Radionúclidos Cs-137', meta: 'Micro-FTIR + Espectrometría Gamma', icon: Radiation },
  { id: 'result', step: '10. RESULTADO', label: '0.042 particulas/m³ | 0.18 Bq/m³ Cs-137', meta: 'Incidencias dentro de línea base polar', icon: Award },
  { id: 'dataset', step: '11. CONJUNTO DE DATOS', label: 'AMOH-SOOS-2027-SEAWATER-V1', meta: 'Cloud-Optimized Parquet / Open Data', icon: Database },
  { id: 'doi', step: '12. DOI & CITACIÓN', label: 'doi:10.5281/zenodo.amoh2027.042', meta: 'Registro Inmutable DataCite', icon: ExternalLink },
  { id: 'publication', step: '13. PUBLICACIÓN', label: 'Nature Polar Science & Oceans (2027)', meta: 'Revisión por pares (Peer-Reviewed Open Access)', icon: ExternalLink },
  { id: 'researcher', step: '14. INVESTIGADOR', label: 'Dra. Elena Vasquez & Colaboradores', meta: 'ORCID: 0000-0002-8192-3841', icon: Award },
  { id: 'institution', step: '15. INSTITUCIÓN', label: 'Consorcio SCAR / COMNAP / Invemar / CCO', meta: 'Tratado Antártico — Cooperación Internacional', icon: ShieldCheck },
];

const POLLUTION_MATRICES = [
  {
    matrix: 'Agua de Mar Subsuperficial (Seawater)',
    station: 'Estación Gerlache STN-042',
    lat: -64.306,
    lon: -62.868,
    microplastics: '0.042 part/m³ (Fibras PET)',
    cesium137: '0.18 ± 0.02 Bq/m³ (MARIS)',
    tritium: '< 0.05 TU (Nivel natural)',
    status: 'LÍNEA BASE',
    statusColor: '#72e0b5',
  },
  {
    matrix: 'Nieve Superficial Reciente (Fresh Snow)',
    station: 'Isla Rey Jorge / Base King Sejong',
    lat: -62.224,
    lon: -58.789,
    microplastics: '0.110 part/L (Fibras Poliéster/Poliuretano)',
    cesium137: '0.09 ± 0.01 Bq/kg (MARIS)',
    tritium: 'N/D',
    status: 'TRANSPORTE ATMOSFÉRICO',
    statusColor: '#ffc845',
  },
  {
    matrix: 'Núcleo de Hielo Marino (Sea Ice Core)',
    station: 'Mar de Weddell NW',
    lat: -65.112,
    lon: -54.341,
    microplastics: '0.380 part/L (Atrapamiento en Fraxil)',
    cesium137: '0.12 ± 0.03 Bq/kg (MARIS)',
    tritium: '< 0.02 TU',
    status: 'CONCENTRACIÓN CRIOSFÉRICA',
    statusColor: '#35c3c8',
  },
  {
    matrix: 'Sedimento Bentónico Marino (Marine Sediment)',
    station: 'Bahía Esperanza / Fosa Drake',
    lat: -63.398,
    lon: -56.998,
    microplastics: '1.24 part/g sedimento seco',
    cesium137: '0.45 ± 0.06 Bq/kg sed (MARIS)',
    tritium: 'N/A',
    status: 'SUMIDERO BENTÓNICO',
    statusColor: '#ff5e8a',
  },
  {
    matrix: 'Biota Marina (Euphausia superba)',
    station: 'Sector Bransfield Sur',
    lat: -63.150,
    lon: -59.500,
    microplastics: '0.015 part/individuo',
    cesium137: '< 0.05 Bq/kg masa fresca',
    tritium: 'N/A',
    status: 'BIOINDICADOR TRÓFICO',
    statusColor: '#a855f7',
  },
];

export default function ScienceLabPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DOMAINS' | 'EXPEDITION_GRAPH' | 'POLLUTION' | 'LITERATURE' | 'EARTH_TRENDS'>('DOMAINS');
  const [activeDomain, setActiveDomain] = useState<string>('ocean');
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(6); // Default on Niskin sample
  const [publications, setPublications] = useState<PacPublication[]>([]);
  const [publicationLoadError, setPublicationLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/colombia_pac_scientific_publications.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} al cargar el catálogo PAC.`);
        return response.json() as Promise<unknown>;
      })
      .then((payload) => setPublications(parsePublications(payload)))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setPublicationLoadError(error instanceof Error ? error.message : 'Error desconocido al cargar el catálogo PAC.');
      });
    return () => controller.abort();
  }, []);

  const filteredPubs = useMemo(() => {
    return publications.filter((p) => {
      const matchYear = selectedYearFilter === 'ALL' || p.year === selectedYearFilter;
      const matchSearch =
        searchTerm === '' ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.theme.toLowerCase().includes(searchTerm.toLowerCase());
      return matchYear && matchSearch;
    });
  }, [publications, searchTerm, selectedYearFilter]);

  const uniqueYears = useMemo(() => {
    const yrs = Array.from(new Set(publications.map((p) => p.year))).sort((a, b) => b - a);
    return yrs;
  }, [publications]);

  const current = DOMAINS.find((d) => d.id === activeDomain) || DOMAINS[0];
  const selectedGraphNode = GRAPH_NODES[selectedNodeIndex];

  return (
    <div className="min-h-screen bg-[#050e14] text-[#edf5f5] font-sans flex flex-col">
      <header className="h-16 border-b border-[#142733] bg-[#071620] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/observatory')}
            className="flex items-center gap-2 text-xs font-mono text-[#8faab5] hover:text-[#58d5e3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Observatorio</span>
          </button>
          <div className="h-4 w-px bg-[#1f3947]" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white tracking-wide">
              Laboratorio de Ciencias Polares & Grafo de Expedición
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00a6a6]/10 text-[#58d5e3] border border-[#00a6a6]/30 font-semibold">
              SCIENCE FABRIC V7
            </span>
          </div>
        </div>
      </header>

      {/* Main Tabs */}
      <div className="border-b border-[#142e3e] bg-[#071722] px-6 sm:px-8 py-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('DOMAINS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'DOMAINS'
              ? 'bg-[#102d3f] border border-[#35c3c8] text-[#58d5e3] shadow-md'
              : 'text-[#8faab5] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Multidominio Polar</span>
        </button>

        <button
          onClick={() => setActiveTab('EXPEDITION_GRAPH')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'EXPEDITION_GRAPH'
              ? 'bg-[#102d3f] border border-[#72e0b5] text-[#72e0b5] shadow-md'
              : 'text-[#8faab5] hover:text-white'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Grafo de Expedición & Muestras</span>
        </button>

        <button
          onClick={() => setActiveTab('POLLUTION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'POLLUTION'
              ? 'bg-[#102d3f] border border-[#ff5e8a] text-[#ff5e8a] shadow-md'
              : 'text-[#8faab5] hover:text-white'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Matrices de Contaminación & MARIS</span>
        </button>

        <button
          onClick={() => setActiveTab('LITERATURE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'LITERATURE'
              ? 'bg-[#102d3f] border border-[#ffc845] text-[#ffc845] shadow-md'
              : 'text-[#8faab5] hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Compendio PAC 1976–2026 ({publications.length || 111})</span>
        </button>

        <button
          onClick={() => setActiveTab('EARTH_TRENDS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
            activeTab === 'EARTH_TRENDS'
              ? 'bg-[#102d3f] border border-[#58d5e3] text-[#58d5e3] shadow-md'
              : 'text-[#8faab5] hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Tendencias NASA</span>
        </button>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 flex flex-col gap-8">
        {activeTab === 'EARTH_TRENDS' && <EarthTrendPanel />}
        {activeTab === 'DOMAINS' && (
          <>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Exploración Multidominio del Océano Austral</h1>
              <p className="text-sm text-[#8faab5] max-w-2xl leading-relaxed">
                Integración de observaciones satelitales, reanálisis numéricos y muestreo in-situ
                bajo el protocolo de subselección espacial y temporal estricta de AMOH.
              </p>
            </div>

            {/* Domain selection cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DOMAINS.map((dom) => {
                const Icon = dom.icon;
                const isSelected = activeDomain === dom.id;
                return (
                  <button
                    key={dom.id}
                    onClick={() => setActiveDomain(dom.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-[#0a2233] border-[#35c3c8] shadow-lg scale-[1.02]'
                        : 'bg-[#071620] border-[#163040] hover:border-[#285068]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${dom.color}20`, color: dom.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white leading-tight">{dom.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Domain View */}
            <div className="p-6 rounded-2xl bg-[#081824] border border-[#1b394b] flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#142e3d] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: `${current.color}20`, color: current.color }}
                  >
                    <current.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{current.name}</h2>
                    <p className="text-xs text-[#8faab5]">{current.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/observatory')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#35c3c8] text-[#050e14] hover:bg-[#52d4d9] transition-all"
                >
                  Cargar en Mapa
                </button>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase text-[#58d5e3] tracking-wider mb-3">
                  Conjuntos de Datos Integrados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {current.datasets.map((ds, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#051119] border border-[#163040] text-xs text-[#caf9f7] font-medium flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: current.color }} />
                      <span>{ds}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'EXPEDITION_GRAPH' && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Grafo de Linaje Científico & Muestras de Agua
              </h1>
              <p className="text-sm text-[#8faab5] max-w-3xl leading-relaxed">
                Trazabilidad inmutable desde la expedición hasta la publicación revisada por pares:
                <span className="font-mono text-xs text-[#58d5e3] block mt-1">
                  EXPEDICIÓN → BUQUE → CRUCERO → DERROTA → ESTACIÓN → LANCE → MUESTRA → INSTRUMENTO → ANÁLISIS → RESULTADO → DATASET → DOI → PUBLICACIÓN → INVESTIGADOR → INSTITUCIÓN
                </span>
              </p>
            </div>

            {/* Horizontal Timeline / Hierarchy Stepper */}
            <div className="p-4 rounded-2xl bg-[#071620] border border-[#163040] overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max py-2">
                {GRAPH_NODES.map((node, idx) => {
                  const isSelected = selectedNodeIndex === idx;
                  const Icon = node.icon;
                  return (
                    <div key={node.id} className="flex items-center">
                      <button
                        onClick={() => setSelectedNodeIndex(idx)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          isSelected
                            ? 'bg-[#0f2e42] border-[#72e0b5] shadow-lg scale-105 ring-1 ring-[#72e0b5]'
                            : 'bg-[#091b26] border-[#18364a] hover:border-[#275370]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#72e0b5]' : 'text-[#8faab5]'}`} />
                          <span className="text-[10px] font-mono font-bold text-[#8faab5]">
                            {node.step}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">
                          {node.label}
                        </span>
                      </button>
                      {idx < GRAPH_NODES.length - 1 && (
                        <div className="w-4 h-0.5 bg-[#1b3d52] shrink-0 mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Node Details */}
            <div className="p-6 rounded-2xl bg-[#081824] border border-[#1b394b] flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-[#72e0b5] px-2 py-0.5 rounded bg-[#72e0b5]/10 border border-[#72e0b5]/30">
                  {selectedGraphNode.step}
                </span>
                <h3 className="text-xl font-bold text-white">{selectedGraphNode.label}</h3>
                <p className="text-sm text-[#8faab5]">{selectedGraphNode.meta}</p>
                <div className="pt-2 text-xs font-mono text-[#58d5e3] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#72e0b5]" />
                  <span>Validado con SHA-256 e interoperabilidad abierta SCAR / SOOS</span>
                </div>
              </div>

              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => navigate('/observatory')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#35c3c8] text-[#050e14] hover:bg-[#52d4d9] transition-all"
                >
                  Localizar Muestra en Mapa
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'POLLUTION' && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Matriz de Contaminación Ambiental & OIEA MARIS
              </h1>
              <p className="text-sm text-[#8faab5] max-w-3xl leading-relaxed">
                Monitoreo multi-matriz de microplásticos, contaminantes emergentes (PFAS) y radionúclidos marinos
                (Cesio-137, Estroncio-90, Tritio) en los tres estratos polares: columna de agua, nieve/hielo y sedimentos bentónicos.
              </p>
            </div>

            {/* Table of matrices */}
            <div className="rounded-2xl border border-[#163040] bg-[#071620] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a202d] text-[#8faab5] font-mono uppercase text-[10px] border-b border-[#142e3e]">
                    <tr>
                      <th className="p-4">Matriz Ambiental</th>
                      <th className="p-4">Estación / Sector</th>
                      <th className="p-4">Microplásticos</th>
                      <th className="p-4">Cesio-137 (MARIS)</th>
                      <th className="p-4">Tritio / Trazadores</th>
                      <th className="p-4">Estado / Dinámica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#132c3c] text-[#edf5f5]">
                    {POLLUTION_MATRICES.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#0c2434] transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-[#58d5e3]" />
                          <span>{item.matrix}</span>
                        </td>
                        <td className="p-4 font-mono text-[#8faab5]">
                          {item.station} ({item.lat}°, {item.lon}°)
                        </td>
                        <td className="p-4 font-mono text-[#72e0b5]">{item.microplastics}</td>
                        <td className="p-4 font-mono text-[#ff5e8a]">{item.cesium137}</td>
                        <td className="p-4 font-mono text-[#caf9f7]">{item.tritium}</td>
                        <td className="p-4">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            style={{
                              backgroundColor: `${item.statusColor}20`,
                              color: item.statusColor,
                              border: `1px solid ${item.statusColor}40`,
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LITERATURE' && (
          <div className="flex flex-col gap-6">
            {publicationLoadError && (
              <div role="alert" className="rounded-xl border border-[#8a3f4f] bg-[#2b1520] p-4 text-sm text-[#ffd8df]">
                No se pudo cargar el catálogo de publicaciones. {publicationLoadError}
              </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Compendio Científico Antártico de Colombia (1976–2026)
                </h1>
                <p className="text-sm text-[#8faab5] max-w-3xl leading-relaxed">
                  Catálogo histórico y contemporáneo de 111 publicaciones científicas del Programa Antártico Colombiano (PAC),
                  Comisión Colombiana del Océano (CCO), Armada Nacional e institutos de investigación (Invemar, UNAL, UniAndes).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#ffc845]/10 border border-[#ffc845]/40 text-[#ffc845] font-bold">
                  {filteredPubs.length} de {publications.length} Artículos
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-[#071620] border border-[#163040] p-4 rounded-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5e7c8e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por título, autor, palabras clave (ej. microplásticos, líquenes, ENSO)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0b1b26] border border-[#1a384b] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#5e7c8e] focus:outline-none focus:border-[#58d5e3]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8faab5]">Año:</span>
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="bg-[#0b1b26] border border-[#1a384b] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#58d5e3]"
                >
                  <option value="ALL">Todos los Años (1976-2026)</option>
                  {uniqueYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Año {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Publications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPubs.map((pub) => (
                <div
                  key={pub.id}
                  className="bg-[#071620] border border-[#163040] hover:border-[#ffc845]/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:bg-[#0c202d] group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ffc845]/15 text-[#ffc845] border border-[#ffc845]/30">
                        {pub.year}
                      </span>
                      <span className="text-[10px] font-mono text-[#71909f] uppercase tracking-wider">
                        {pub.theme || 'Ciencia Polar PAC'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-[#ffc845] transition-colors leading-snug mb-2">
                      {pub.title}
                    </h3>

                    {pub.keywords && pub.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pub.keywords.slice(0, 5).map((kw, kidx) => (
                          <span
                            key={kidx}
                            className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#0e2736] text-[#8faab5] border border-[#183648]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#132c3c] flex items-center justify-between text-[11px] font-mono text-[#6d8a98]">
                    <span>Fuente: {pub.source || 'Comisión Colombiana del Océano (CCO)'}</span>
                    <span className="text-[#58d5e3] group-hover:underline flex items-center gap-1">
                      <span>PAC-SCAR</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
