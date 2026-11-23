import { useState } from 'react';
import type { MapMode } from '../lib/spatial-camera-store';
import { useNavigate } from 'react-router-dom';
import { NatGeoDirectorStore } from '../lib/natgeo-director-store';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Compass,
  FlaskConical,
  Radio,
  Users,
  ExternalLink,
} from 'lucide-react';

interface MenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeView?: string;
  activeMode?: string;
  onSelectMapMode?: (mode: MapMode) => void;
  onOpenSdgLens?: () => void;
  onOpenLayers?: () => void;
  onOpenCatalog?: () => void;
  onOpenObservationModal?: () => void;
  onOpenConnectPhone?: () => void;
  onOpenPairing?: () => void;
  onOpenSystemHealth?: () => void;
}

type MenuSectionId = 'observatorio' | 'campo' | 'pasaporte' | 'ciencia' | 'gobernanza' | 'externos';

interface MenuItem {
  id: MenuSectionId;
  label: string;
  title: string;
  tagline: string;
  icon: typeof Compass;
  badge?: string;
  color: string;
  subItems: Array<{
    label: string;
    desc: string;
    action: () => void;
    isExternal?: boolean;
    badge?: string;
  }>;
}

export default function MenuSheet({
  isOpen,
  onClose,
  onSelectMapMode,
  onOpenSdgLens,
  onOpenObservationModal,
  onOpenConnectPhone,
  onOpenSystemHealth,
}: MenuSheetProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<MenuSectionId | null>(null);

  if (!isOpen) return null;

  const sections: MenuItem[] = [
    {
      id: 'observatorio',
      label: 'EN VIVO',
      title: 'El Gran Mapa Polar & Visores',
      tagline: 'Satélites, barcos, 3D Globe y cámaras en tiempo real',
      icon: Compass,
      badge: 'MAPA 4D',
      color: '#00e5ff',
      subItems: [
        {
          label: '🌐 Modo Globo 3D Polar (Google Earth Style)',
          desc: 'Vista esférica 3D interactiva con atmósfera orbital y rotación libre',
          action: () => {
            onSelectMapMode?.('GLOBE');
            onClose();
          },
          badge: '3D GLOBE',
        },
        {
          label: '🎬 Modo Director Fílmico NatGeo 4K',
          desc: 'Experiencia cinematográfica con dron, LUTs 35mm y paisajes sonoros',
          action: () => {
            NatGeoDirectorStore.set({ isDirectorMode: true });
            onClose();
          },
          badge: 'NATGEO 4K',
        },
        {
          label: 'Observatorio Polar Principal',
          desc: 'Mapa interactivo circumpolar en proyección EPSG:3031',
          action: () => {
            navigate('/observatory');
            onClose();
          },
        },
        {
          label: '🛰️ Modo Satélite de Alta Resolución (Copernicus)',
          desc: 'Mosaico satelital óptico y térmico MODIS / Sentinel',
          action: () => {
            onSelectMapMode?.('SAT');
            onClose();
          },
          badge: 'SAT',
        },
        {
          label: 'Batimetría antártica',
          desc: 'Relieve del lecho marino y subglacial de IBCSO v2 sobre el mapa oceánico de Esri',
          action: () => {
            onSelectMapMode?.('BATHYMETRY');
            onClose();
          },
        },
        {
          label: '📹 Cámaras Webcams en Vivo',
          desc: 'Vistas directas en Troll, Rothera, Fildes y Neumayer III',
          action: () => {
            navigate('/cameras');
            onClose();
          },
          badge: 'CAMS',
        },
        {
          label: '📋 Sala de Situación (SITREP Polar)',
          desc: 'Reporte consolidado de meteorología, hielos y tráfico marítimo',
          action: () => {
            navigate('/briefing');
            onClose();
          },
          badge: 'SITREP',
        },
        {
          label: '🎯 Lente de Objetivos ODS 2030 (ONU)',
          desc: 'Filtrar por metas globales de conservación marina y ODS 14',
          action: () => {
            onOpenSdgLens?.();
            
            // AMOH_SDG_MENU_BRIDGE_V22
            window.dispatchEvent(new CustomEvent('amoh:open-sdg-lens'));
            onClose();
          },
          badge: 'ODS',
        },
      ],
    },
    {
      id: 'campo',
      label: 'REGISTRO',
      title: 'Registro de Campo & Dispositivos',
      tagline: 'Anotar fauna, hielo, boyas y conectar Samsung / Apple',
      icon: Radio,
      badge: 'GPS UTC',
      color: '#ffc845',
      subItems: [
        {
          label: '➕ Nueva Observación de Campo',
          desc: 'Registrar avistamiento georreferenciado con foto y sellado local',
          action: () => {
            onOpenObservationModal?.();
            onClose();
          },
          badge: 'RÁPIDO',
        },
        {
          label: '📲 Conectar Celular / Tablet (Samsung S25+ & Apple)',
          desc: 'Emparejar tu teléfono con código QR para trabajar sin conexión',
          action: () => {
            onOpenConnectPhone?.();
            onClose();
          },
          badge: 'QR / PWA',
        },
        {
          label: '📖 Atlas & Historial de Notas',
          desc: 'Registro unificado de observaciones y bitácora de terreno',
          action: () => {
            navigate('/atlas');
            onClose();
          },
        },
        {
          label: '🧭 Logger de Campo Autónomo',
          desc: 'Interfaz táctil de alta visibilidad para zodiacs y puentes',
          action: () => {
            navigate('/field/logger');
            onClose();
          },
          badge: 'EDGE',
        },
        {
          label: '⚡ Diagnóstico de Sensores Móviles',
          desc: 'Prueba de compás magnético, barómetro y precisión GPS',
          action: () => {
            navigate('/field/device-test');
            onClose();
          },
        },
      ],
    },
    {
      id: 'pasaporte',
      label: 'COMUNIDAD',
      title: 'Pasaporte Polar, Cine & Historias',
      tagline: 'Tu carnet polar científico, sellos y documentales',
      icon: Users,
      badge: 'EXPLORADOR',
      color: '#35c3c8',
      subItems: [
        {
          label: '📘 Pasaporte Polar Científico Digital',
          desc: 'Tu carnet oficial, sellos antárticos, identidad NFC y medallas',
          action: () => {
            navigate('/passport');
            onClose();
          },
          badge: 'PASAPORTE',
        },
        {
          label: '🎬 Cine Polar & Relatos Audiovisuales',
          desc: 'Historias y expediciones en calidad cinematográfica 4K',
          action: () => {
            navigate('/stories');
            onClose();
          },
          badge: 'CINE',
        },
        {
          label: '👥 Directorio de Investigadores & Bases Polares',
          desc: 'Científicos, estaciones y proyectos del Programa Antártico',
          action: () => {
            navigate('/context');
            onClose();
          },
        },
        {
          label: '🎓 Oportunidades & Becas Visiting Scientist',
          desc: 'Convocatorias internacionales, pasantías y cruceros científicos',
          action: () => {
            navigate('/opportunities');
            onClose();
          },
        },
      ],
    },
    {
      id: 'ciencia',
      label: 'CIENCIA & IA',
      title: 'Zona Científica, Swarm IA & Datos',
      tagline: 'Laboratorio oceanográfico WOD, simulación y 100 agentes',
      icon: FlaskConical,
      badge: 'AVANZADO',
      color: '#a78bfa',
      subItems: [
        {
          label: '🚢 Portal de Expediciones & Campañas (PAC / ARC Simón Bolívar)',
          desc: 'Gestión de derrota, bitácora de muestreo y operaciones polares',
          action: () => {
            navigate('/expeditions');
            onClose();
          },
          badge: 'PAC',
        },
        {
          label: '🧪 Laboratorio de Ciencia Polar (WOD & CTD)',
          desc: 'Explorador oceanográfico de temperatura, salinidad y oxígeno',
          action: () => {
            navigate('/science');
            onClose();
          },
        },
        {
          label: '⚡ Simulador MiroFish (Swarm Intelligence)',
          desc: 'Modelado estocástico de escenarios de flota oscura y deriva de hielos',
          action: () => {
            navigate('/scenarios');
            onClose();
          },
          badge: 'SIM',
        },
        {
          label: '🛡️ Inteligencia & Diplomacia para la Defensa',
          desc: 'Estrategia Orión, Tratado Antártico, CCAMLR y talasocracia',
          action: () => {
            navigate('/intelligence');
            onClose();
          },
        },
        {
          label: '📡 Fuentes de Verdad & Procedencia Criptográfica',
          desc: 'Catálogo de APIs verificadas, firmas SHA-256 y linaje de datos',
          action: () => {
            navigate('/sources');
            onClose();
          },
        },
        {
          label: '⚙️ Salud, Diagnóstico & Auto-Sanación',
          desc: 'Monitoreo de latencia de red, DuckDB y fallback offline',
          action: () => {
            onOpenSystemHealth?.();
            onClose();
          },
          badge: 'AUTO-FIX',
        },
      ],
    },
    {
      id: 'gobernanza',
      label: 'DOCTRINA',
      title: 'Gobernanza Polar & Tratados',
      tagline: 'Sistema del Tratado Antártico, Protocolo de Madrid y ONU',
      icon: Users,
      badge: 'ONU / ATCM',
      color: '#34d399',
      subItems: [
        {
          label: '🏛️ Portal de Gobernanza Antártica & CCAMLR',
          desc: 'Marco institucional, ZEPAs, ZEMAs y áreas marinas protegidas',
          action: () => {
            navigate('/governance');
            onClose();
          },
        },
        {
          label: '📜 Resolución ONU A/RES/79/325 — Panel de IA',
          desc: 'Marco internacional de ciencia abierta, datos compartidos y soberanía',
          action: () => {
            navigate('/sources');
            onClose();
          },
          badge: 'ONU 2025',
        },
      ],
    },
    {
      id: 'externos',
      label: 'ALIANZAS',
      title: 'Portales Internacionales de Referencia',
      tagline: 'Enlaces a NASA, British Antarctic Survey y SCAR',
      icon: ExternalLink,
      badge: 'GLOBAL',
      color: '#f472b6',
      subItems: [
        {
          label: '🚀 Convocatorias de Investigación NASA NSPIRES',
          desc: 'Portal oficial de financiamiento de ciencia polar NASA',
          action: () => window.open('https://nspires.nasaprs.com/external/', '_blank'),
          isExternal: true,
          badge: 'NASA',
        },
        {
          label: '🗺️ Visor Cartográfico BAS Antarctic Digital Database',
          desc: 'Portal cartográfico interactivo del British Antarctic Survey',
          action: () => window.open('https://bas.maps.arcgis.com/apps/instant/sidebar/index.html?appid=3e8a7b43c0e8495bb423c0ee16ae115e', '_blank'),
          isExternal: true,
          badge: 'BAS ADD',
        },
        {
          label: '🐟 Global Fishing Watch Map',
          desc: 'Monitoreo satelital abierto de la flota pesquera industrial mundial',
          action: () => window.open('https://globalfishingwatch.org/map', '_blank'),
          isExternal: true,
          badge: 'GFW',
        },
        {
          label: '🇦🇶 Portal del Tratado Antártico (ATS Secretariat)',
          desc: 'Base de datos oficial de medidas, inspecciones y resoluciones',
          action: () => window.open('https://www.ats.aq/devAS/Ats/Index?lang=e', '_blank'),
          isExternal: true,
          badge: 'ATS',
        },
      ],
    },
  ];

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Floating Glass Sheet */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[510] w-full sm:w-[420px] bg-[#071622f6] border-l border-[#203c4f] shadow-2xl backdrop-blur-xl flex flex-col text-[#edf5f5] transition-transform duration-300"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="h-16 px-5 border-b border-[#1b3445] flex items-center justify-between shrink-0 bg-[#091b28]">
          {activeSection ? (
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-xs font-mono font-semibold text-[#58d5e3] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>VOLVER AL MENÚ</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-[2px] text-[#caf9f7]">
                MENÚ AMOH
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#102d3f] text-[#58d5e3] border border-[#20465c]">
                V6
              </span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#102533] hover:bg-[#1a384c] border border-[#234357] flex items-center justify-center text-[#8faab5] hover:text-white transition-all"
            aria-label="Cerrar Menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {!activeSection ? (
            // Top Level: The 8 Large Visual Rows
            sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full text-left p-4 rounded-2xl bg-[#091e2b]/90 hover:bg-[#102a3c] border border-[#1b384c] hover:border-[#35c3c8]/50 transition-all flex items-center justify-between group shadow-md min-h-[64px]"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-inner"
                      style={{
                        backgroundColor: `${section.color}18`,
                        borderColor: `${section.color}45`,
                        color: section.color,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                          {section.title}
                        </span>
                        {section.badge && (
                          <span
                            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0"
                            style={{
                              backgroundColor: `${section.color}20`,
                              borderColor: `${section.color}50`,
                              color: section.color,
                            }}
                          >
                            {section.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9bb5c2] line-clamp-1 mt-0.5 leading-snug">
                        {section.tagline}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-[#406579] group-hover:text-[#58d5e3] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </button>
              );
            })
          ) : (
            // Second Level: Curated Action Sub-items
            currentSection && (
              <div className="space-y-3">
                {/* Section Hero Banner */}
                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: `${currentSection.color}10`,
                    borderColor: `${currentSection.color}35`,
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <currentSection.icon
                      className="w-5 h-5"
                      style={{ color: currentSection.color }}
                    />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      {currentSection.label} — {currentSection.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#8faab5]">
                    {currentSection.tagline}
                  </p>
                </div>

                {/* Sub-item Links */}
                <div className="space-y-2 pt-1">
                  {currentSection.subItems.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={sub.action}
                      className="w-full text-left p-3.5 rounded-xl bg-[#091e2b]/90 hover:bg-[#112d40] border border-[#1c3a4f] hover:border-[#58d5e3]/50 transition-all flex items-center justify-between group min-h-[50px]"
                    >
                      <div className="min-w-0 pr-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white group-hover:text-[#58d5e3] transition-colors">
                            {sub.label}
                          </span>
                          {sub.badge && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#102d3f] text-[#58d5e3] border border-[#20465c] font-bold">
                              {sub.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9bb5c2] mt-0.5 line-clamp-1">
                          {sub.desc}
                        </p>
                      </div>

                      {sub.isExternal ? (
                        <ExternalLink className="w-4 h-4 text-[#406579] group-hover:text-[#58d5e3] shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#406579] group-hover:text-[#58d5e3] group-hover:translate-x-0.5 transition-all shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer: Quick System Info */}
        <div className="p-4 border-t border-[#1b3445] bg-[#091b28] flex items-center justify-between text-[11px] font-mono text-[#71909f]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#72e0b5]" />
            <span>Nodo Polar Activo</span>
          </div>
          <span>EPSG:3031 Circumpolar</span>
        </div>
      </div>
    </>
  );
}

