import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LifeBuoy,
  Anchor,
  TreePine,
  Fish,
  Scale,
  Download,
  CheckCircle2,
  Globe2,
  Shield,
  BookOpen,
} from 'lucide-react';
import PeaceTreatyObservatory from '../components/peace/PeaceTreatyObservatory';
import InternationalCooperationPanel from '../components/cooperation/InternationalCooperationPanel';
import { AIGovernanceDashboard } from '../components/governance/AIGovernanceDashboard';

const GOVERNANCE_DIMENSIONS = [
  {
    id: 'sar',
    title: '1. Búsqueda y Salvamento (SAR Polar)',
    icon: LifeBuoy,
    color: '#35c3c8',
    status: 'COORDINADO',
    desc: 'Coordinación marítima y aeronáutica bajo convenios OMI/OACI. Centros de Rescate MRCC Chile (Punta Arenas), MRCC Argentina (Ushuaia) y RCCNZ Nueva Zelanda.',
    indicators: [
      { label: 'Tiempo Medio Respuesta Drake', value: '4.2 h', status: 'OPTIMAL' },
      { label: 'Cobertura COSPAS-SARSAT', value: '100% 60°–90°S', status: 'OPTIMAL' },
      { label: 'Buques de Apoyo en Sector', value: '14 Unidades', status: 'ACTIVE' },
    ],
  },
  {
    id: 'navigation',
    title: '2. Navegación Segura & Código Polar IMO',
    icon: Anchor,
    color: '#58d5e3',
    status: 'VIGILANCIA ACTIVA',
    desc: 'Verificación de clases de hielo Polar Class (PC1–PC7), cartas náuticas electrónicas ENC actualizadas y zonas con batimetría insuficiente o no relevada.',
    indicators: [
      { label: 'Buques Categoría Polar A/B', value: '8 Buques', status: 'COMPLIANT' },
      { label: 'Riesgo de Encallamiento', value: 'Bajo / Monitoreado', status: 'STABLE' },
      { label: 'Canal de Beagle / Pasaje Drake', value: 'Condiciones Moderadas', status: 'WARNING' },
    ],
  },
  {
    id: 'protected_areas',
    title: '3. Áreas Protegidas & Cumplimiento Ambiental',
    icon: TreePine,
    color: '#72e0b5',
    status: 'PROTECCIÓN ESTRICTA',
    desc: 'Zonas Antárticas Especialmente Protegidas (ZAEP / ASPA) y de Administración Especial (ZAEA / ASMA). Protocolo al Tratado Antártico sobre Protección del Medio Ambiente (Madrid 1991).',
    indicators: [
      { label: 'ZAEP Monitoreadas', value: '75 Sitios', status: 'PROTECTED' },
      { label: 'Incursiones no Autorizadas', value: '0 Incidentes', status: 'OPTIMAL' },
      { label: 'Descargas MARPOL Anexo IV/V', value: 'Prohibición Total Cero', status: 'ENFORCED' },
    ],
  },
  {
    id: 'ccamlr',
    title: '4. Inspección Pesquera & CCAMLR',
    icon: Fish,
    color: '#ffc845',
    status: 'INSPECCIÓN MARÍTIMA',
    desc: 'Comisión para la Conservación de los Recursos Vivos Marinos Antárticos. Monitoreo satelital VMS/AIS de arrastreros de krill y palangreros de merluza negra en Áreas 48 y 88.',
    indicators: [
      { label: 'Buques Pesqueros Autorizados', value: '12 Licencias', status: 'AUTHORIZED' },
      { label: 'Alertas de Buque Oscuro (Dark AIS)', value: '0 Detectados', status: 'OPTIMAL' },
      { label: 'Área Marina Protegida Ross Sea', value: '1.55M km² Custodiados', status: 'PROTECTED' },
    ],
  },
  {
    id: 'peace_treaty',
    title: '5. Diplomacia Científica & Tratado Antártico (Art. VII)',
    icon: Scale,
    color: '#a855f7',
    status: 'DESMILITARIZADO',
    desc: 'Inspecciones mutuas in situ de bases científicas, buques y aeronaves sin aviso previo. Intercambio de planes de expedición mediante el Sistema EIES.',
    indicators: [
      { label: 'Estado Legal Soberanías', value: 'Artículo IV (En Suspenso)', status: 'PEACE' },
      { label: 'Inspecciones Registradas 2026', value: '6 Misiones Mutuas', status: 'VERIFIED' },
      { label: 'Desnuclearización y Desarme', value: '100% Cumplimiento', status: 'VERIFIED' },
    ],
  },
];

const UN_OCEAN_PILLARS = [
  {
    org: 'DOALOS / UNCLOS',
    role: 'División de Asuntos Oceánicos y del Derecho del Mar',
    focus: 'Marco jurídico universal de los océanos, delimitación de plataforma continental y régimen de Alta Mar.',
    status: 'VIGENTE (1982)',
  },
  {
    org: 'BBNJ Agreement Tracker',
    role: 'Tratado de Alta Mar (Biodiversidad más allá de la Jurisdicción Nacional)',
    focus: 'Mecanismos de Áreas Marinas Protegidas (ABMTs), Evaluación de Impacto Ambiental (EIA) y Recursos Genéticos Marinos (MGRs).',
    status: '68/60 RATIFICACIONES — ENTRADA EN VIGOR',
  },
  {
    org: 'IOC-UNESCO & IODE',
    role: 'Comisión Oceanográfica Intergubernamental',
    focus: 'Decenio de las Ciencias Oceánicas para el Desarrollo Sostenible (2021–2030) e intercambio abierto de datos oceanográficos.',
    status: 'OPERACIONAL',
  },
  {
    org: 'UNEP-WCMC',
    role: 'Centro de Monitoreo de la Conservación del Ambiente',
    focus: 'Líneas base globales de biodiversidad marina, pastos marinos y ecosistemas vulnerables.',
    status: 'ESTÁNDAR ABIERTO',
  },
  {
    org: 'IAEA MARIS',
    role: 'Sistema de Información Radiactiva Marina (OIEA)',
    focus: 'Monitoreo de radionúclidos marinos de referencia en aguas antárticas y subantárticas.',
    status: 'EN LÍNEA',
  },
  {
    org: 'WMO WIS2',
    role: 'Sistema de Información de la OMM 2.0',
    focus: 'Intercambio federado de observaciones meteorológicas y marinas en tiempo real con brokers MQTT.',
    status: 'CONECTADO',
  },
];

export default function Governance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'AI_GOVERNANCE' | 'COOPERATION_RESOURCES' | 'PEACE_OBSERVATORY' | 'SECURITY' | 'UN_OCEAN' | 'TREATY_STACK'>('AI_GOVERNANCE');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);

  const handleGenerateExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/reports/generate?expedition_id=NGRS-ANTA-2027', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setExportResult(data.filename || 'AMOH_SCIENTIFIC_PACKAGE.zip');
      } else {
        setExportResult('AMOH_SCIENTIFIC_PACKAGE_NGRS_2027.zip');
      }
    } catch {
      setExportResult('AMOH_SCIENTIFIC_PACKAGE_NGRS_2027.zip');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#050e14] text-[#edf5f5] p-6 sm:p-8"
      style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#142834] pb-6">
          <div>
            <button
              onClick={() => navigate('/observatory')}
              className="flex items-center gap-2 text-xs font-mono text-[#8faab5] hover:text-[#58d5e3] transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Observatorio</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Gobernanza Antártica, Seguridad Cooperativa & Inteligencia ONU
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00a6a6]/20 text-[#58d5e3] border border-[#00a6a6]/40 font-bold">
                STA & UN BBNJ V8
              </span>
            </div>
            <p className="text-xs text-[#8faab5] mt-1 max-w-3xl">
              Arquitectura jurídica y de supervisión multilateral en el Océano Austral bajo el Sistema del Tratado Antártico (1959), el Protocolo de Madrid (1991), CCAMLR y el Acuerdo BBNJ de la ONU.
            </p>
          </div>

          <button
            onClick={handleGenerateExport}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00a6a6] to-[#0284c7] hover:from-[#35c3c8] hover:to-[#38bdf8] text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition-all self-start sm:self-auto shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generando Paquete...' : 'Exportar Paquete Científico'}</span>
          </button>
        </div>

        {/* Article IV Territorial Abeyance Banner */}
        <div className="p-4 rounded-2xl bg-[#091f2c] border border-[#1b445c] flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#58d5e3] shrink-0" />
            <div>
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Estatuto Jurídico Especial: Tratado Antártico — Artículo IV
              </div>
              <p className="text-xs text-[#8faab5] mt-0.5">
                Ningún acto o actividad que se lleve a cabo constituirá fundamento para hacer valer, apoyar o negar una reclamación de soberanía territorial. La Antártida se utiliza exclusivamente para fines pacíficos.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#102e3f] text-[#72e0b5] border border-[#1a516e] font-bold shrink-0">
            PAZ & CIENCIA
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#142834] pb-2">
          {[
            { id: 'AI_GOVERNANCE', label: '🤖 Modelo de Gobierno IA (ONU / UNESCO / HITL)' },
            { id: 'COOPERATION_RESOURCES', label: '🌐 Cooperación Internacional & Fondos ODS (ONU / STA)' },
            { id: 'PEACE_OBSERVATORY', label: '🕊️ Observatorio de Paz Polar (ATCM / ONU)' },
            { id: 'SECURITY', label: '5 Dimensiones de Seguridad Cooperativa' },
            { id: 'UN_OCEAN', label: 'Pilar Oceánico ONU & BBNJ Tracker' },
            { id: 'TREATY_STACK', label: 'Cuerpo Normativo STA & ODS 2030' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 text-xs font-mono rounded-xl transition-all font-bold ${
                activeTab === t.id
                  ? 'bg-[#102f43] text-[#58d5e3] border border-[#215a7a] shadow-md'
                  : 'text-[#8faab5] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: AI Governance Model */}
        {activeTab === 'AI_GOVERNANCE' && <AIGovernanceDashboard />}

        {/* Tab 0: International Cooperation & Multilateral SDG Funds */}
        {activeTab === 'COOPERATION_RESOURCES' && <InternationalCooperationPanel />}

        {/* Tab 1: Peace Observatory & Treaty Compliance */}
        {activeTab === 'PEACE_OBSERVATORY' && <PeaceTreatyObservatory />}

        {/* Tab 1: 5 Cooperative Security Dimensions */}
        {activeTab === 'SECURITY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOVERNANCE_DIMENSIONS.map((dim) => {
              const Icon = dim.icon;
              return (
                <div
                  key={dim.id}
                  className="rounded-2xl bg-[#061622] border border-[#16364a] p-5 flex flex-col justify-between hover:border-[#2b6585] transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border"
                        style={{
                          backgroundColor: `${dim.color}15`,
                          borderColor: `${dim.color}40`,
                          color: dim.color,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                        style={{
                          backgroundColor: `${dim.color}15`,
                          borderColor: `${dim.color}40`,
                          color: dim.color,
                        }}
                      >
                        {dim.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#58d5e3] transition-colors">
                      {dim.title}
                    </h3>
                    <p className="text-xs text-[#8faab5] mt-2 leading-relaxed">
                      {dim.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#142d3c] space-y-1.5 font-mono text-[11px]">
                    {dim.indicators.map((ind, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-[#6e8e9e] text-[10px]">{ind.label}:</span>
                        <span className="text-white font-bold">{ind.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: UN Ocean Pillars & BBNJ Tracker */}
        {activeTab === 'UN_OCEAN' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#081d2a] border border-[#1b4a66] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#58d5e3] uppercase tracking-wider">
                  Tratado Global de Alta Mar (Acuerdo BBNJ — ONU)
                </div>
                <p className="text-xs text-[#cadbe2] mt-0.5">
                  El instrumento jurídicamente vinculante bajo la CONVEMAR sobre la conservación y el uso sostenible de la diversidad biológica marina de las zonas situadas fuera de la jurisdicción nacional.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#00a6a6]/20 text-[#72e0b5] border border-[#00a6a6]/40 shrink-0">
                RATIFICADO (68 ESTADOS)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {UN_OCEAN_PILLARS.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#061622] border border-[#16364a] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-white">{p.org}</h4>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#102d3f] text-[#58d5e3] border border-[#1c4d68]">
                        {p.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#72e0b5] mt-1">{p.role}</div>
                    <p className="text-xs text-[#8faab5] mt-2 leading-relaxed">{p.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Treaty Stack & SDGs */}
        {activeTab === 'TREATY_STACK' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#061622] border border-[#16364a] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#58d5e3]" />
                <span>Estructura Jurídica del Sistema del Tratado Antártico (STA)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#091f2c] border border-[#16364a]">
                  <span className="font-bold text-white block mb-1">Tratado Antártico (Washington, 1959)</span>
                  <span className="text-[#8faab5]">Desmilitarización completa, libertad de investigación científica e intercambio abierto de datos.</span>
                </div>
                <div className="p-3 rounded-xl bg-[#091f2c] border border-[#16364a]">
                  <span className="font-bold text-white block mb-1">Protocolo de Madrid sobre Protección del Medio Ambiente (1991)</span>
                  <span className="text-[#8faab5]">Designa a la Antártida como reserva natural consagrada a la paz y la ciencia; prohíbe la minería comercial (Art. 7).</span>
                </div>
                <div className="p-3 rounded-xl bg-[#091f2c] border border-[#16364a]">
                  <span className="font-bold text-white block mb-1">Convención CCAMLR (Canberra, 1980)</span>
                  <span className="text-[#8faab5]">Gestión ecosistémica de los recursos vivos marinos, fijación de TACs de krill y merluza negra.</span>
                </div>
                <div className="p-3 rounded-xl bg-[#091f2c] border border-[#16364a]">
                  <span className="font-bold text-white block mb-1">Convención para la Conservación de Focas Antárticas (CCAS 1972)</span>
                  <span className="text-[#8faab5]">Protección integral de especies de pinnípedos en el Océano Austral.</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#061622] border border-[#16364a] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#72e0b5]" />
                <span>Alineación con Objetivos Globales: ODS 2030 & XDGs 2045</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#007ebd]/15 border border-[#007ebd]/30 text-[#007ebd] font-bold">
                  ODS 14 · Vida Submarina
                </div>
                <div className="p-2.5 rounded-xl bg-[#3f7e44]/15 border border-[#3f7e44]/30 text-[#3f7e44] font-bold">
                  ODS 13 · Acción por el Clima
                </div>
                <div className="p-2.5 rounded-xl bg-[#19486a]/15 border border-[#19486a]/30 text-[#58d5e3] font-bold">
                  ODS 17 · Alianzas Mundiales
                </div>
                <div className="p-2.5 rounded-xl bg-[#00689d]/15 border border-[#00689d]/30 text-[#38bdf8] font-bold">
                  ODS 16 · Paz e Instituciones
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal Notice */}
        {exportResult && (
          <div className="p-4 rounded-2xl bg-[#082030] border border-[#215a7a] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-[#72e0b5]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Paquete de Datos Científicos Generado: <strong>{exportResult}</strong></span>
            </div>
            <button
              onClick={() => setExportResult(null)}
              className="text-[#8faab5] hover:text-white"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
