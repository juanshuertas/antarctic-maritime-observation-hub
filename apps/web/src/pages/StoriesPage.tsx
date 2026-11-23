import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MenuSheet from '../components/MenuSheet';
import CommandPalette from '../components/CommandPalette';
import { useI18nStore } from '../lib/i18n';
import {
  Film,
  Compass,
  Share2,
  ShieldCheck,
  Eye,
  Layers,
  Sparkles,
  ExternalLink,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface Documentary {
  id: string;
  title: string;
  director: string;
  year: number;
  runtime: string;
  institution: string;
  theme: string;
  synopsis: string;
  watchUrl: string;
  imageUrl: string;
  tags: string[];
}

interface FieldStory {
  id: string;
  title: string;
  author: string;
  institution: string;
  expedition: string;
  location: string;
  date: string;
  discipline: string;
  content: string;
  ethicalConsent: boolean;
  privacyBlurApplied: boolean;
  imageUrl: string;
}

const DOCUMENTARIES: Documentary[] = [
  {
    id: 'doc-natgeo-pristine',
    title: 'National Geographic: Pristine Seas — Antarctica’s Secret Sanctuaries',
    director: 'Dr. Enric Sala & Paul Nicklen',
    year: 2026,
    runtime: '88 min',
    institution: 'National Geographic Society / Lindblad Expeditions',
    theme: 'Exploración Polar & Conservación Marina',
    synopsis: 'Expedición de aguas profundas y buceo bajo el hielo en la Península Antártica documentando ecosistemas bentónicos vírgenes y proponiendo santuarios marinos de máxima protección.',
    watchUrl: 'https://www.nationalgeographic.org/projects/pristine-seas/',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    tags: ['NatGeo', 'Pristine Seas', 'Lindblad', 'Áreas Marinas Protegidas'],
  },
  {
    id: 'doc-1',
    title: 'The Frozen Continent: Circumpolar Dynamics',
    director: 'Dr. Lars Lindqvist & SCAR Media Collective',
    year: 2025,
    runtime: '58 min',
    institution: 'Alfred Wegener Institute / British Antarctic Survey',
    theme: 'Oceanografía Física & Criosfera',
    synopsis: 'Exploración de alta resolución de la Corriente Circumpolar Antártica (ACC) y cómo el flujo de agua profunda de fondo impulsa la bomba biológica del carbono global.',
    watchUrl: 'https://www.scar.org',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    tags: ['ACC', 'Hielo Marino', 'Clima Global'],
  },
  {
    id: 'doc-2',
    title: 'Bajo el Hielo: Secretos de la Plataforma de Ross',
    director: 'Antarctic Science Platform & NIWA',
    year: 2024,
    runtime: '74 min',
    institution: 'National Science Foundation (NSF) / NIWA NZ',
    theme: 'Glaciología Submarina',
    synopsis: 'Perforaciones de agua caliente a través de 800 metros de hielo sólido en la Plataforma de Ross revelan ecosistemas bentónicos previamente insospechados y corrientes subglaciares.',
    watchUrl: 'https://www.antarcticscienceplatform.org.nz',
    imageUrl: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?auto=format&fit=crop&w=800&q=80',
    tags: ['Ross Shelf', 'Biotopos Subglaciares', 'Hot-Water Drilling'],
  },
  {
    id: 'doc-3',
    title: 'Centinelas del Drake: Expedición Almirante Campos',
    director: 'Dirección General Marítima (DIMAR) & CCO',
    year: 2026,
    runtime: '45 min',
    institution: 'Programa Antártico Colombiano (PAC)',
    theme: 'Cooperación Científica & Oceanopolítica',
    synopsis: 'Registro cinematográfico a bordo del ARC Simón Bolívar cruzando el Mar de Hoces (Drake), instalando boyas oceanográficas y mapeando el talud de la Península Antártica.',
    watchUrl: 'https://cco.gov.co',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    tags: ['PAC', 'ARC Simón Bolívar', 'Paso Drake'],
  },
  {
    id: 'doc-4',
    title: 'Voices of the Benthos: Southern Ocean Bioacoustics',
    director: 'Ocean Alliance & CNRS Polar Units',
    year: 2025,
    runtime: '52 min',
    institution: 'Institut Polaire Français Paul-Émile Victor (IPEV)',
    theme: 'Bioacústica Marina & Fauna',
    synopsis: 'Grabaciones hidrofónicas ultra-sensibles que capturan las vocalizaciones de ballenas azules antárticas, focas de Weddell bajo el hielo y el estruendo de calving en glaciares marinos.',
    watchUrl: 'https://institut-polaire.fr',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    tags: ['Cetáceos', 'Hidrófonos', 'Sonidos Glaciares'],
  },
];

const FIELD_STORIES: FieldStory[] = [
  {
    id: 'story-natgeo-pilot',
    title: 'Despacho NGS-Lindblad: Telemetría de Presión Naviera en el Estrecho de Gerlache',
    author: 'Juan S. Huertas Olea',
    institution: 'National Geographic Explorer Community / AMOH',
    expedition: 'NGS-Lindblad Visiting Scientist 2027',
    location: 'Estrecho de Gerlache (64°30′ S, 62°20′ W)',
    date: '2026-03-12',
    discipline: 'Inteligencia Marítima & IA Satelital',
    content: 'Validación del modelo AMOH a bordo de embarcaciones de turismo expedicionario Lindblad / National Geographic. Correlación en tiempo real entre posiciones AIS de cruceros y el paso de rorcuales jorobados mediante hidroacústica pasiva y visión artificial.',
    ethicalConsent: true,
    privacyBlurApplied: true,
    imageUrl: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'story-1',
    title: '24 Horas en el Campamento Glaciar Collins: Muestreo de Microplásticos',
    author: 'Dra. Elena Vargas',
    institution: 'Instituto Antártico Chileno (INACH)',
    expedition: 'ECA 62',
    location: 'Isla Rey Jorge (62°12′ S, 58°57′ W)',
    date: '2026-02-18',
    discipline: 'Química Ambiental & Criosfera',
    content: 'Completamos la recolección de testigos de nieve superficial a 3 km de Base Escudero. Las muestras confirman bajas concentraciones pero persistentes partículas de polímeros sintéticos arrastrados por vientos estratosféricos circumpolares.',
    ethicalConsent: true,
    privacyBlurApplied: true,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'story-2',
    title: 'Lanzamiento de Boya BGC-Argo en el Vórtice de Weddell',
    author: 'Ing. Carlos Mendoza',
    institution: 'DIMAR / Universidad Jorge Tadeo Lozano',
    expedition: 'PAC XI',
    location: 'Mar de Weddell Noroccidental (63°40′ S, 55°10′ W)',
    date: '2026-01-29',
    discipline: 'Oceanografía Operacional',
    content: 'Con mar 6 y vientos de 38 nudos, desplegamos exitosamente el perfilador biogeoquímico calibrado para pH y oxígeno disuelto. Sus datos ya están transmitiendo al hub AMOH vía satélite Iridium.',
    ethicalConsent: true,
    privacyBlurApplied: true,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'story-3',
    title: 'Monitoreo Reproductivo No Invasivo con Drones Térmicos en Pingüinera Hannah Point',
    author: 'Biol. Astrid Lindholm',
    institution: 'Norsk Polarinstitutt (NPI)',
    expedition: 'Troll-Peninsula Survey',
    location: 'Isla Livingston (62°39′ S, 60°36′ W)',
    date: '2026-03-04',
    discipline: 'Ecología Sensorial Polar',
    content: 'Utilizando sensores FLIR a más de 45 metros de altura barométrica para evitar cualquier alteración acústica o visual a las aves, censamos 1.840 nidos de Pygoscelis papua con un éxito reproductivo del 88%.',
    ethicalConsent: true,
    privacyBlurApplied: true,
    imageUrl: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?auto=format&fit=crop&w=800&q=80',
  },
];

export default function StoriesPage() {
  const navigate = useNavigate();
  const { t } = useI18nStore();
  const [activeTab, setActiveTab] = useState<'DOCS' | 'FIELD' | 'SOCIAL_KIT'>('DOCS');

  // Social Story Kit State
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [storyTitle, setStoryTitle] = useState('DESPACHO CIENTÍFICO POLAR');
  const [storySubtitle, setStorySubtitle] = useState('Península Antártica · Base Fildes');
  const [storyCoordinates, setStoryCoordinates] = useState('62°12′ S, 58°57′ W');
  const [showUtcStamp, setShowUtcStamp] = useState(true);
  const [showTelemetryBadge, setShowTelemetryBadge] = useState(true);
  const [bgPreset, setBgPreset] = useState<'drake' | 'ice' | 'glacier' | 'natgeo'>('natgeo');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const now = new Date();
  const sitrepId = `SITREP ${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const utcDateString = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const bgStyles = {
    drake: 'from-[#0b1d2e] via-[#07131e] to-[#04090d]',
    ice: 'from-[#0c2f42] via-[#091e2b] to-[#050e14]',
    glacier: 'from-[#143d4f] via-[#0c2330] to-[#061219]',
    natgeo: 'from-[#211b03] via-[#0e0c01] to-[#000000]',
  };

  const handleCopyCaption = () => {
    const caption = `📍 ${storySubtitle} (${storyCoordinates})\n🕒 ${utcDateString} | ${sitrepId}\n🔬 ${storyTitle}\n📡 Observatorio Marítimo Antártico (AMOH) — Divulgación & Diplomacia Científica\n#Antarctica #Oceanography #ScienceDiplomacy #AMOH`;
    navigator.clipboard.writeText(caption);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#050e14] text-[#edf5f5] flex flex-col select-none"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Header
        activeView="stories"
        onToggleMenu={() => setMenuSheetOpen(true)}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onViewChange={(view) => {
          if (view === 'map') navigate('/observatory');
          else if (view === 'briefing') navigate('/briefing');
          else if (view === 'expeditions') navigate('/expeditions');
          else if (view === 'passport') navigate('/passport');
          else if (view === 'explore') navigate('/explore');
          else if (view === 'stories') navigate('/stories');
        }}
        region="Divulgación & Relatos Polares"
        period={sitrepId}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* NGS-Lindblad Featured Proposal Spotlight */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#211a00] via-[#0a1420] to-[#08121a] border-2 border-[#f9d71c]/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f9d71c] text-black font-black flex flex-col items-center justify-center font-mono text-xs shadow-lg shadow-[#f9d71c]/25 shrink-0 border border-white/20">
              <span className="font-bold tracking-tighter text-sm">NGS</span>
              <span className="text-[8px] -mt-1 font-semibold">2027</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#f9d71c] uppercase tracking-wider">
                  Alianza Científica & Propuesta Polar
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f9d71c]/20 text-[#f9d71c] border border-[#f9d71c]/40 font-mono font-semibold">
                  NATGEO PILOT
                </span>
              </div>
              <h2 className="text-base font-bold text-white">
                NGS-Lindblad Visiting Scientist: Monitoreo AI & Presión Naviera
              </h2>
              <p className="text-xs text-[#8faab5]">
                Expedición Antártica 2027 a bordo de la flota polar Lindblad Expeditions / National Geographic.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/expeditions/exp-natgeo-2027/overview')}
            className="px-4 py-2.5 rounded-xl bg-[#f9d71c] hover:bg-[#ffe343] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-lg hover:shadow-[#f9d71c]/30"
          >
            <span>VER EXPEDICIÓN NATGEO</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Editorial Title Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1c2940] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#35c3c8]">
              <Film className="w-4 h-4" />
              <span className="uppercase tracking-widest font-bold">
                {t('nav_stories') || 'Historias & Documentales'}
              </span>
              <span className="text-[#8faab5]">·</span>
              <span className="text-[#b7c5d8]">Memoria Colectiva & Difusión Antártica</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Narrativas Científicas & Cine Documental Polar
            </h1>
            <p className="text-sm text-[#8faab5] max-w-3xl leading-relaxed">
              Catálogo curado de producciones documentales sobre el Océano Austral, despachos de investigadores de campo verificados con protocolos éticos SCAR, y kit de divulgación social para científicos.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#091522] rounded-xl border border-[#1c2940]">
            <button
              onClick={() => setActiveTab('DOCS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'DOCS'
                  ? 'bg-[#35c3c8] text-[#050e14] font-bold shadow-lg shadow-[#35c3c8]/20'
                  : 'text-[#8faab5] hover:text-white hover:bg-[#122234]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>DOCUMENTALES</span>
            </button>
            <button
              onClick={() => setActiveTab('FIELD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'FIELD'
                  ? 'bg-[#35c3c8] text-[#050e14] font-bold shadow-lg shadow-[#35c3c8]/20'
                  : 'text-[#8faab5] hover:text-white hover:bg-[#122234]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>RELATOS DE CAMPO</span>
            </button>
            <button
              onClick={() => setActiveTab('SOCIAL_KIT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'SOCIAL_KIT'
                  ? 'bg-[#35c3c8] text-[#050e14] font-bold shadow-lg shadow-[#35c3c8]/20'
                  : 'text-[#8faab5] hover:text-white hover:bg-[#122234]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>SOCIAL STORY KIT</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DOCUMENTALES CIENTÍFICOS */}
        {activeTab === 'DOCS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-[#8faab5]">
              <span>4 Documentales Curados · Conexión a Repositorios Abiertos</span>
              <span className="font-mono text-[#35c3c8]">SCAR Media Approved</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DOCUMENTARIES.map((doc) => (
                <article
                  key={doc.id}
                  className="rounded-2xl bg-[#091522] border border-[#1c2940] hover:border-[#35c3c8]/50 transition-all p-6 flex flex-col justify-between space-y-4 group overflow-hidden relative shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#35c3c8]/10 text-[#35c3c8] border border-[#35c3c8]/30 font-semibold">
                        {doc.theme}
                      </span>
                      <div className="flex items-center gap-3 text-[#8faab5]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {doc.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {doc.runtime}
                        </span>
                      </div>
                    </div>

                    <h2
                      className="text-xl font-bold text-white group-hover:text-[#35c3c8] transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {doc.title}
                    </h2>

                    <p className="text-xs text-[#8faab5]">
                      <span className="text-[#edf5f5] font-semibold">{doc.director}</span> · {doc.institution}
                    </p>

                    <p className="text-xs text-[#b7c5d8] leading-relaxed">
                      {doc.synopsis}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-[#122234] text-[10px] font-mono text-[#72e0b5] border border-[#1a3848]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1c2940] flex items-center justify-between text-xs">
                    <span className="text-[#8faab5] font-mono text-[11px]">Acceso Abierto / Open Access</span>
                    <a
                      href={doc.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#35c3c8]/20 hover:bg-[#35c3c8] text-[#35c3c8] hover:text-[#050e14] font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>Ver Ficha / Streaming</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: RELATOS DE CAMPO & COMUNIDAD */}
        {activeTab === 'FIELD' && (
          <div className="space-y-6">
            {/* Ethical Banner */}
            <div className="p-4 rounded-xl bg-[#091e2b] border border-[#35c3c8]/30 flex items-start gap-3 text-xs text-[#b7c5d8]">
              <ShieldCheck className="w-5 h-5 text-[#35c3c8] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white">Protocolo Ético de Difusión de Campo AMOH</span>
                <p>
                  Todos los relatos son remitidos por expedicionarios con consentimiento explícito. Se aplica filtro automático de desenfoque facial para personal en operaciones sensibles y anonimización de coordenadas exactas en colonias protegidas por el Tratado Antártico.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {FIELD_STORIES.map((story) => (
                <article
                  key={story.id}
                  className="rounded-2xl bg-[#091522] border border-[#1c2940] hover:border-[#72e0b5]/50 transition-all p-6 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c2940] pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#72e0b5]/10 text-[#72e0b5] border border-[#72e0b5]/30 font-semibold font-mono">
                        {story.discipline}
                      </span>
                      <span className="text-[#8faab5] font-mono">{story.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {story.ethicalConsent && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-[#72e0b5]">
                          <UserCheck className="w-3.5 h-3.5" /> Consentimiento Verificado
                        </span>
                      )}
                      {story.privacyBlurApplied && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-[#35c3c8]">
                          <Eye className="w-3.5 h-3.5" /> Privacidad Protegida
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {story.title}
                    </h2>
                    <p className="text-xs text-[#35c3c8] font-mono">
                      {story.author} · {story.institution} ({story.expedition}) · {story.date}
                    </p>
                    <p className="text-sm text-[#b7c5d8] leading-relaxed pt-1">
                      {story.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SOCIAL STORY KIT GENERATOR */}
        {activeTab === 'SOCIAL_KIT' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls Form (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-[#091522] border border-[#1c2940] p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#35c3c8]">
                <Sparkles className="w-4 h-4" />
                <span className="uppercase font-bold">Generador Social de Campo</span>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#8faab5] uppercase tracking-wider block">
                  Formato de Salida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['9:16', '1:1', '16:9'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all border ${
                        aspectRatio === ratio
                          ? 'bg-[#35c3c8] text-[#050e14] border-[#35c3c8]'
                          : 'bg-[#122234] text-[#8faab5] border-[#1c2940] hover:border-[#35c3c8]'
                      }`}
                    >
                      {ratio} {ratio === '9:16' ? '(Story)' : ratio === '1:1' ? '(Post)' : '(Wide)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Preset */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#8faab5] uppercase tracking-wider block">
                  Gradiente Térmico & Estilo Editorial
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['natgeo', 'ice', 'drake', 'glacier'] as const).map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setBgPreset(bg)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-mono transition-all border text-center ${
                        bgPreset === bg
                          ? bg === 'natgeo'
                            ? 'bg-[#f9d71c]/20 text-[#f9d71c] border-[#f9d71c] font-bold'
                            : 'bg-[#72e0b5]/20 text-[#72e0b5] border-[#72e0b5] font-bold'
                          : 'bg-[#122234] text-[#8faab5] border-[#1c2940]'
                      }`}
                    >
                      {bg === 'natgeo' ? 'NatGeo Gold' : bg === 'ice' ? 'Hielo Marino' : bg === 'drake' ? 'Tormenta Drake' : 'Glaciar Azul'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-[#8faab5] block mb-1">Título del Despacho</label>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="w-full bg-[#050e14] border border-[#1c2940] focus:border-[#35c3c8] rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#8faab5] block mb-1">Ubicación / Campamento</label>
                  <input
                    type="text"
                    value={storySubtitle}
                    onChange={(e) => setStorySubtitle(e.target.value)}
                    className="w-full bg-[#050e14] border border-[#1c2940] focus:border-[#35c3c8] rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#8faab5] block mb-1">Coordenadas GPS</label>
                  <input
                    type="text"
                    value={storyCoordinates}
                    onChange={(e) => setStoryCoordinates(e.target.value)}
                    className="w-full bg-[#050e14] border border-[#1c2940] focus:border-[#35c3c8] rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Toggle Stamps */}
              <div className="space-y-2 pt-2 border-t border-[#1c2940]">
                <label className="flex items-center gap-2 text-xs text-[#b7c5d8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUtcStamp}
                    onChange={(e) => setShowUtcStamp(e.target.checked)}
                    className="rounded bg-[#050e14] border-[#1c2940] text-[#35c3c8] focus:ring-0"
                  />
                  <span>Sello Dinámico de Tiempo UTC</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#b7c5d8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTelemetryBadge}
                    onChange={(e) => setShowTelemetryBadge(e.target.checked)}
                    className="rounded bg-[#050e14] border-[#1c2940] text-[#35c3c8] focus:ring-0"
                  />
                  <span>Distintivo Oficial AMOH SITREP</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleCopyCaption}
                  className="w-full py-2.5 rounded-lg bg-[#35c3c8] hover:bg-[#2bb0b5] text-[#050e14] font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {copiedNotification ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#050e14]" />
                      <span>¡TEXTO Y METADATOS COPIADOS!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPIAR TEXTO CIENTÍFICO</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Canvas Preview (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-[#07131e] rounded-2xl border border-[#1c2940] min-h-[520px]">
              <div className="text-xs font-mono text-[#8faab5] mb-4 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#35c3c8]" />
                <span>VISTA PREVIA EN TIEMPO REAL ({aspectRatio})</span>
              </div>

              {/* Preview Frame */}
              <div
                className={`relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b ${bgStyles[bgPreset]} flex flex-col justify-between p-6 transition-all duration-300 ${
                  bgPreset === 'natgeo'
                    ? 'border-4 border-[#f9d71c] shadow-[0_0_40px_rgba(249,215,28,0.3)]'
                    : 'border-2 border-[#35c3c8]/40'
                }`}
                style={{
                  width: aspectRatio === '9:16' ? '280px' : aspectRatio === '1:1' ? '360px' : '460px',
                  height: aspectRatio === '9:16' ? '498px' : aspectRatio === '1:1' ? '360px' : '260px',
                }}
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#35c3c8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Top Overlay */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono tracking-widest font-bold uppercase ${
                        bgPreset === 'natgeo' ? 'text-[#f9d71c]' : 'text-[#35c3c8]'
                      }`}
                    >
                      {bgPreset === 'natgeo' ? 'NATGEO EXPLORER · AMOH' : 'AMOH · ANTARCTIC HUB'}
                    </span>
                    {showTelemetryBadge && (
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                          bgPreset === 'natgeo'
                            ? 'bg-[#f9d71c]/20 border border-[#f9d71c]/40 text-[#f9d71c]'
                            : 'bg-[#35c3c8]/20 border border-[#35c3c8]/40 text-[#35c3c8]'
                        }`}
                      >
                        {sitrepId}
                      </span>
                    )}
                  </div>
                  {showUtcStamp && (
                    <div className="text-[9px] font-mono text-[#8faab5]">
                      {utcDateString}
                    </div>
                  )}
                </div>

                {/* Center Content */}
                <div className="relative z-10 space-y-2 my-auto">
                  <h3
                    className="text-lg sm:text-xl font-black text-white leading-tight uppercase tracking-tight drop-shadow-md"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {storyTitle}
                  </h3>
                  <p
                    className={`text-xs font-semibold drop-shadow ${
                      bgPreset === 'natgeo' ? 'text-[#f9d71c]' : 'text-[#72e0b5]'
                    }`}
                  >
                    {storySubtitle}
                  </p>
                </div>

                {/* Bottom Overlay */}
                <div className="relative z-10 pt-3 border-t border-[#1c2940]/80 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-mono text-[#8faab5] uppercase">POSICIÓN DE CAMPO</div>
                    <div className="text-[11px] font-mono text-white font-bold">{storyCoordinates}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded bg-[#050e14]/60 border ${
                        bgPreset === 'natgeo'
                          ? 'border-[#f9d71c]/40 text-[#f9d71c]'
                          : 'border-[#1a3848] text-[#35c3c8]'
                      }`}
                    >
                      {bgPreset === 'natgeo' ? 'NGS CERTIFIED' : 'SCAR COMPLIANT'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
