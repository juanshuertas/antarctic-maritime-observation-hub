import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  Activity,
  MapPin,
  RefreshCw,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  FileDown,
  Info,
  TrendingUp,
  Radio,
  GripHorizontal,
} from 'lucide-react';

export type PizzaCrisisLevel = 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

interface PizzaOutlet {
  id: string;
  name: string;
  chain: 'Domino\'s' | 'Papa John\'s' | 'Pizza Hut' | 'Local OSINT';
  distanceToPentagonKm: number;
  area: string;
  baselineHourlyOrders: number;
  currentMultiplier: number; // 1.0 = normal, 2.5 = 250%
  busyStatus: 'Normal' | 'Moderado' | 'Mucho más concurrido' | 'Pico Crítico (Surge)';
  popularTimesPercent: number; // 0 - 100
  estimatedDeliveryWaitMin: number;
  lastOrderRecorded: string;
}

const OUTLETS_DATA: Record<PizzaCrisisLevel, PizzaOutlet[]> = {
  NOMINAL: [
    {
      id: 'dominos-crystal-city',
      name: 'Domino\'s Pizza — Crystal City',
      chain: 'Domino\'s',
      distanceToPentagonKm: 1.2,
      area: 'Arlington, VA (S Eads St)',
      baselineHourlyOrders: 14,
      currentMultiplier: 0.95,
      busyStatus: 'Normal',
      popularTimesPercent: 22,
      estimatedDeliveryWaitMin: 20,
      lastOrderRecorded: 'Hace 8 min',
    },
    {
      id: 'papajohns-columbia-pike',
      name: 'Papa John\'s — Columbia Pike',
      chain: 'Papa John\'s',
      distanceToPentagonKm: 1.9,
      area: 'Arlington, VA (Corredor DoD)',
      baselineHourlyOrders: 11,
      currentMultiplier: 1.05,
      busyStatus: 'Normal',
      popularTimesPercent: 28,
      estimatedDeliveryWaitMin: 25,
      lastOrderRecorded: 'Hace 14 min',
    },
    {
      id: 'pizzahut-pentagon-row',
      name: 'Pizza Hut Express — Pentagon Row',
      chain: 'Pizza Hut',
      distanceToPentagonKm: 1.5,
      area: 'Arlington, VA (Army Navy Dr)',
      baselineHourlyOrders: 9,
      currentMultiplier: 1.0,
      busyStatus: 'Normal',
      popularTimesPercent: 18,
      estimatedDeliveryWaitMin: 20,
      lastOrderRecorded: 'Hace 22 min',
    },
    {
      id: 'district-pizza-langley',
      name: 'District Crust & Deli — McLean',
      chain: 'Local OSINT',
      distanceToPentagonKm: 9.4,
      area: 'Perímetro CIA Langley, VA',
      baselineHourlyOrders: 8,
      currentMultiplier: 0.9,
      busyStatus: 'Normal',
      popularTimesPercent: 15,
      estimatedDeliveryWaitMin: 18,
      lastOrderRecorded: 'Hace 30 min',
    },
  ],
  ELEVATED: [
    {
      id: 'dominos-crystal-city',
      name: 'Domino\'s Pizza — Crystal City',
      chain: 'Domino\'s',
      distanceToPentagonKm: 1.2,
      area: 'Arlington, VA (S Eads St)',
      baselineHourlyOrders: 14,
      currentMultiplier: 1.45,
      busyStatus: 'Moderado',
      popularTimesPercent: 55,
      estimatedDeliveryWaitMin: 35,
      lastOrderRecorded: 'Hace 3 min',
    },
    {
      id: 'papajohns-columbia-pike',
      name: 'Papa John\'s — Columbia Pike',
      chain: 'Papa John\'s',
      distanceToPentagonKm: 1.9,
      area: 'Arlington, VA (Corredor DoD)',
      baselineHourlyOrders: 11,
      currentMultiplier: 1.38,
      busyStatus: 'Moderado',
      popularTimesPercent: 48,
      estimatedDeliveryWaitMin: 32,
      lastOrderRecorded: 'Hace 5 min',
    },
    {
      id: 'pizzahut-pentagon-row',
      name: 'Pizza Hut Express — Pentagon Row',
      chain: 'Pizza Hut',
      distanceToPentagonKm: 1.5,
      area: 'Arlington, VA (Army Navy Dr)',
      baselineHourlyOrders: 9,
      currentMultiplier: 1.5,
      busyStatus: 'Moderado',
      popularTimesPercent: 50,
      estimatedDeliveryWaitMin: 30,
      lastOrderRecorded: 'Hace 7 min',
    },
    {
      id: 'district-pizza-langley',
      name: 'District Crust & Deli — McLean',
      chain: 'Local OSINT',
      distanceToPentagonKm: 9.4,
      area: 'Perímetro CIA Langley, VA',
      baselineHourlyOrders: 8,
      currentMultiplier: 1.3,
      busyStatus: 'Moderado',
      popularTimesPercent: 42,
      estimatedDeliveryWaitMin: 28,
      lastOrderRecorded: 'Hace 9 min',
    },
  ],
  HIGH: [
    {
      id: 'dominos-crystal-city',
      name: 'Domino\'s Pizza — Crystal City',
      chain: 'Domino\'s',
      distanceToPentagonKm: 1.2,
      area: 'Arlington, VA (S Eads St)',
      baselineHourlyOrders: 14,
      currentMultiplier: 2.1,
      busyStatus: 'Mucho más concurrido',
      popularTimesPercent: 82,
      estimatedDeliveryWaitMin: 55,
      lastOrderRecorded: 'Hace 1 min',
    },
    {
      id: 'papajohns-columbia-pike',
      name: 'Papa John\'s — Columbia Pike',
      chain: 'Papa John\'s',
      distanceToPentagonKm: 1.9,
      area: 'Arlington, VA (Corredor DoD)',
      baselineHourlyOrders: 11,
      currentMultiplier: 1.95,
      busyStatus: 'Mucho más concurrido',
      popularTimesPercent: 78,
      estimatedDeliveryWaitMin: 50,
      lastOrderRecorded: 'Hace 2 min',
    },
    {
      id: 'pizzahut-pentagon-row',
      name: 'Pizza Hut Express — Pentagon Row',
      chain: 'Pizza Hut',
      distanceToPentagonKm: 1.5,
      area: 'Arlington, VA (Army Navy Dr)',
      baselineHourlyOrders: 9,
      currentMultiplier: 2.2,
      busyStatus: 'Mucho más concurrido',
      popularTimesPercent: 86,
      estimatedDeliveryWaitMin: 60,
      lastOrderRecorded: 'Hace 1 min',
    },
    {
      id: 'district-pizza-langley',
      name: 'District Crust & Deli — McLean',
      chain: 'Local OSINT',
      distanceToPentagonKm: 9.4,
      area: 'Perímetro CIA Langley, VA',
      baselineHourlyOrders: 8,
      currentMultiplier: 1.85,
      busyStatus: 'Mucho más concurrido',
      popularTimesPercent: 74,
      estimatedDeliveryWaitMin: 45,
      lastOrderRecorded: 'Hace 3 min',
    },
  ],
  CRITICAL: [
    {
      id: 'dominos-crystal-city',
      name: 'Domino\'s Pizza — Crystal City',
      chain: 'Domino\'s',
      distanceToPentagonKm: 1.2,
      area: 'Arlington, VA (S Eads St)',
      baselineHourlyOrders: 14,
      currentMultiplier: 3.4,
      busyStatus: 'Pico Crítico (Surge)',
      popularTimesPercent: 99,
      estimatedDeliveryWaitMin: 95,
      lastOrderRecorded: 'Hace 30 seg (Lote x12)',
    },
    {
      id: 'papajohns-columbia-pike',
      name: 'Papa John\'s — Columbia Pike',
      chain: 'Papa John\'s',
      distanceToPentagonKm: 1.9,
      area: 'Arlington, VA (Corredor DoD)',
      baselineHourlyOrders: 11,
      currentMultiplier: 2.9,
      busyStatus: 'Pico Crítico (Surge)',
      popularTimesPercent: 95,
      estimatedDeliveryWaitMin: 80,
      lastOrderRecorded: 'Hace 1 min (Lote x8)',
    },
    {
      id: 'pizzahut-pentagon-row',
      name: 'Pizza Hut Express — Pentagon Row',
      chain: 'Pizza Hut',
      distanceToPentagonKm: 1.5,
      area: 'Arlington, VA (Army Navy Dr)',
      baselineHourlyOrders: 9,
      currentMultiplier: 3.6,
      busyStatus: 'Pico Crítico (Surge)',
      popularTimesPercent: 100,
      estimatedDeliveryWaitMin: 110,
      lastOrderRecorded: 'Hace 45 seg (Lote x15)',
    },
    {
      id: 'district-pizza-langley',
      name: 'District Crust & Deli — McLean',
      chain: 'Local OSINT',
      distanceToPentagonKm: 9.4,
      area: 'Perímetro CIA Langley, VA',
      baselineHourlyOrders: 8,
      currentMultiplier: 3.1,
      busyStatus: 'Pico Crítico (Surge)',
      popularTimesPercent: 92,
      estimatedDeliveryWaitMin: 85,
      lastOrderRecorded: 'Hace 2 min (Lote x6)',
    },
  ],
};

const LEVEL_METRICS = {
  NOMINAL: {
    label: 'NIVEL 1 — NOMINAL (PAZ)',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    pulseColor: 'bg-emerald-500',
    defconProxy: 'DEFCON 5 / Normal',
    surgeFactor: '+4%',
    zScore: '+0.12σ',
    threatSummary: 'Tráfico de pedidos y ocupación en Arlington dentro del intervalo de confianza nocturno estándar.',
    correlatedEvents: [
      'Turnos regulares en Pentágono (DoD) y Langley (CIA).',
      'Sin vuelos extraordinarios de transporte VIP / E-4B Nightwatch.',
      'Tráfico marítimo global en patrones nominales.',
    ],
  },
  ELEVATED: {
    label: 'NIVEL 2 — ELEVADO (PRE-ALERTA)',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    pulseColor: 'bg-yellow-500',
    defconProxy: 'DEFCON 4 / Ejercicios',
    surgeFactor: '+42%',
    zScore: '+1.45σ',
    threatSummary: 'Incremento moderado de pedidos fuera de hora en el corredor Arlington-Langley. Posible sesión extendida.',
    correlatedEvents: [
      'Reuniones de comités interinstitucionales en horario nocturno.',
      'Actividad inusual de mensajería diplomática reportada en canales OSINT.',
      'Tráfico AIS en zonas polares monitoreado por AMOH sin incidentes cinéticos.',
    ],
  },
  HIGH: {
    label: 'NIVEL 3 — ALERTA ALTA (SURGE DETECTADO)',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    pulseColor: 'bg-orange-500',
    defconProxy: 'DEFCON 3 / Alerta Táctica',
    surgeFactor: '+105%',
    zScore: '+2.88σ',
    threatSummary: 'Anomalía estadística severa en múltiples locales simultáneos. Personal de guardia duplicado en salas de crisis.',
    correlatedEvents: [
      'Despacho de vehículos oficiales observado en accesos del Pentágono.',
      'Aumento de radiocomunicaciones militares en frecuencias HF (EAMs).',
      'Múltiples órdenes masivas nocturnas entre las 23:00 y 03:30 EDT.',
    ],
  },
  CRITICAL: {
    label: 'NIVEL 4 — CRISIS INMINENTE (PIZZA SURGE)',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse',
    pulseColor: 'bg-red-500 animate-ping',
    defconProxy: 'DEFCON 2-1 / Crisis Mayor',
    surgeFactor: '+240%',
    zScore: '+4.15σ',
    threatSummary: '🚨 "PENTAGON PIZZA METER DISPARADO": Saturación total de locales de entrega rápida en radio de 5km de DoD/CIA/NSC.',
    correlatedEvents: [
      'Avión Boeing E-4B ("Doomsday Plane") con transpondedor activo en base Andrews.',
      'Gabinete de Crisis Nacional convocado de emergencia en la Situation Room.',
      'Correlación con tensión geopolítica crítica o despliegue naval de choque.',
    ],
  },
};

interface PentagonPizzaIndexWidgetProps {
  onClose?: () => void;
  onFlyToPentagon?: () => void;
}

export default function PentagonPizzaIndexWidget({
  onClose,
  onFlyToPentagon,
}: PentagonPizzaIndexWidgetProps) {
  const [level, setLevel] = useState<PizzaCrisisLevel>('HIGH');
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'HISTORY' | 'CORRELATION'>('TELEMETRY');
  const [dcTime, setDcTime] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Update Washington DC clock in real time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dcTimeString = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setDcTime(`${dcTimeString} EDT (UTC-4)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentOutlets = useMemo(() => OUTLETS_DATA[level], [level]);
  const metrics = LEVEL_METRICS[level];

  // 24h Telemetry simulated curve
  const hourlyData = useMemo(() => {
    const hours = ['18:00', '20:00', '22:00', '00:00', '02:00', '04:00', '06:00', '08:00', '12:00', '16:00'];
    const multipliers = {
      NOMINAL: [45, 60, 30, 15, 8, 5, 12, 35, 75, 55],
      ELEVATED: [55, 75, 60, 40, 25, 18, 22, 45, 80, 60],
      HIGH: [65, 85, 90, 80, 75, 65, 45, 55, 90, 70],
      CRITICAL: [80, 95, 100, 100, 98, 92, 70, 75, 100, 85],
    };
    return hours.map((h, i) => ({
      hour: h,
      baseline: [40, 65, 35, 18, 10, 5, 15, 40, 75, 55][i],
      realtime: multipliers[level][i],
    }));
  }, [level]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMsg('Telemetría Google Popular Times & OSINT sincronizada');
      setTimeout(() => setToastMsg(null), 3000);
    }, 600);
  };

  const handleExportOsintReport = () => {
    const reportText = `# REPORTE OSINT — ÍNDICE DE PIZZA DEL PENTÁGONO
Fecha: ${new Date().toISOString()}
Hora Washington D.C.: ${dcTime}
Nivel Activo: ${metrics.label}
DEFCON Proxy: ${metrics.defconProxy}
Desviación Estadística (Z-Score): ${metrics.zScore}
Incremento de Volumen: ${metrics.surgeFactor}

Resumen Táctico:
${metrics.threatSummary}

Locales Monitoreados (Radio 5km Arlington/Langley):
${currentOutlets
  .map(
    (o) =>
      `- ${o.name} (${o.chain}): Ocupación ${o.popularTimesPercent}% (${o.busyStatus}), Espera: ${o.estimatedDeliveryWaitMin} min, Multiplicador: ${o.currentMultiplier}x`
  )
  .join('\n')}

Eventos de Inteligencia Correlacionados:
${metrics.correlatedEvents.map((e) => `- ${e}`).join('\n')}

Generado por: AMOH (Antarctic Maritime Observation Hub) OSINT Telemetry Layer`;

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AMOH_OSINT_Pentagon_Pizza_Index_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMsg('Informe descargado como Markdown');
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (minimized) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.08}
        className="fixed bottom-20 right-4 z-[250] bg-[#071724]/95 border border-[#1e455e] rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-xl font-mono text-xs flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-[#35c3c8] transition-all"
        onClick={() => setMinimized(false)}
        title="Arrastrar / Abrir Widget Índice de Pizza del Pentágono"
      >
        <GripHorizontal className="w-3.5 h-3.5 text-[#5e7c8e]" />
        <div className="flex items-center gap-2">
          <span className="text-xl">🍕</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${metrics.pulseColor}`} />
              <span className="font-bold text-white text-[11px]">PIZZA INDEX</span>
            </div>
            <span className="text-[10px] text-[#35c3c8] font-semibold">{metrics.surgeFactor} ({level})</span>
          </div>
        </div>
        <Maximize2 className="w-4 h-4 text-[#8faab5] hover:text-white" />
      </motion.div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      className="fixed bottom-16 right-4 sm:right-6 z-[250] w-[95vw] sm:w-[460px] max-h-[85vh] bg-[#05111bee] border border-[#1b3d54] rounded-3xl shadow-2xl backdrop-blur-2xl font-mono text-xs flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[300] bg-[#35c3c8] text-[#050e14] px-3 py-1 rounded-full font-bold text-[10px] shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar - Draggable */}
      <div className="px-4 py-3 border-b border-[#142e3f] bg-[#091a27]/80 flex items-center justify-between cursor-grab active:cursor-grabbing select-none" title="Coge y arrastra para mover el widget">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-[#5e7c8e] hover:text-[#35c3c8] transition-colors">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-lg shadow-inner">
            🍕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">Pentagon Pizza Index</span>
              <span className="text-[9px] bg-[#142e3f] text-[#35c3c8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                OSINT LIVE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#71909f] mt-0.5">
              <Clock className="w-3 h-3 text-[#35c3c8]" />
              <span>D.C. Time: {dcTime || '22:15:00 EDT'}</span>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1.5" onPointerDownCapture={(e) => e.stopPropagation()}>
          <button
            onClick={handleManualRefresh}
            className="p-1.5 rounded-lg text-[#8faab5] hover:text-white hover:bg-white/10 transition-colors"
            title="Sincronizar telemetría"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#35c3c8]' : ''}`} />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded-lg text-[#8faab5] hover:text-white hover:bg-white/10 transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8faab5] hover:text-white hover:bg-red-500/20 transition-colors"
              title="Cerrar widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Threat Status Banner */}
      <div className="p-4 border-b border-[#142e3f] bg-gradient-to-r from-[#071a28] to-[#040e17]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${metrics.pulseColor}`} />
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${metrics.badgeColor}`}>
              {metrics.label}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#71909f]">DEFCON Proxy:</span>
            <span className="ml-1 text-[11px] font-bold text-white">{metrics.defconProxy}</span>
          </div>
        </div>

        {/* Summary Gauge Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-[#091b29] border border-[#16354b] rounded-xl p-2">
            <span className="text-[9px] text-[#71909f] block uppercase">Volumen Surge</span>
            <span className="text-base font-bold text-[#35c3c8]">{metrics.surgeFactor}</span>
          </div>
          <div className="bg-[#091b29] border border-[#16354b] rounded-xl p-2">
            <span className="text-[9px] text-[#71909f] block uppercase">Desviación (Z)</span>
            <span className="text-base font-bold text-amber-400">{metrics.zScore}</span>
          </div>
          <div className="bg-[#091b29] border border-[#16354b] rounded-xl p-2">
            <span className="text-[9px] text-[#71909f] block uppercase">Radio Target</span>
            <span className="text-base font-bold text-white">5.0 km DoD</span>
          </div>
        </div>

        <p className="mt-2.5 text-[11px] text-[#9bb5c2] leading-relaxed">
          {metrics.threatSummary}
        </p>

        {/* Interactive Scenario Selector (Test/Simulate different threat stages) */}
        <div className="mt-3 pt-2.5 border-t border-[#122e40] flex items-center justify-between gap-1">
          <span className="text-[9px] text-[#71909f] uppercase tracking-wider">Simular:</span>
          {(['NOMINAL', 'ELEVATED', 'HIGH', 'CRITICAL'] as PizzaCrisisLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                level === lvl
                  ? 'bg-[#35c3c8] text-[#050e14] shadow-md shadow-[#35c3c8]/30 scale-105'
                  : 'bg-[#0b2131] text-[#71909f] hover:text-white hover:bg-[#123147]'
              }`}
            >
              {lvl === 'NOMINAL' ? 'Paz' : lvl === 'ELEVATED' ? 'Tensión' : lvl === 'HIGH' ? 'Alerta' : 'CRISIS'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#142e3f] bg-[#071724]">
        <button
          onClick={() => setActiveTab('TELEMETRY')}
          className={`flex-1 py-2 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'TELEMETRY'
              ? 'text-[#35c3c8] border-b-2 border-[#35c3c8] bg-[#35c3c8]/5'
              : 'text-[#71909f] hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Telemetría Locales</span>
        </button>
        <button
          onClick={() => setActiveTab('CORRELATION')}
          className={`flex-1 py-2 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'CORRELATION'
              ? 'text-[#35c3c8] border-b-2 border-[#35c3c8] bg-[#35c3c8]/5'
              : 'text-[#71909f] hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Correlación Geopolítica</span>
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'HISTORY'
              ? 'text-[#35c3c8] border-b-2 border-[#35c3c8] bg-[#35c3c8]/5'
              : 'text-[#71909f] hover:text-white'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Concepto & Historia</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 overflow-y-auto flex-1 max-h-[360px] space-y-3">
        {activeTab === 'TELEMETRY' && (
          <>
            {/* 24-Hour Sparkline / Bar comparison */}
            <div className="bg-[#091c2b] border border-[#16364d] rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#71909f] uppercase font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#35c3c8]" />
                  <span>Curva 24h: Baseline vs. Surge en Vivo</span>
                </span>
                <span className="text-[9px] text-[#35c3c8] font-semibold">Pico nocturno (02:00 EDT)</span>
              </div>
              <div className="flex items-end justify-between h-20 pt-2 gap-1.5">
                {hourlyData.map((item, idx) => {
                  const isNightSurge = idx >= 3 && idx <= 5;
                  return (
                    <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-0.5 h-16">
                        {/* Baseline bar */}
                        <div
                          className="w-1.5 bg-[#1a3d54] rounded-t transition-all"
                          style={{ height: `${item.baseline}%` }}
                          title={`Base normal: ${item.baseline}%`}
                        />
                        {/* Real-time bar */}
                        <div
                          className={`w-2 rounded-t transition-all ${
                            isNightSurge && level !== 'NOMINAL'
                              ? 'bg-gradient-to-t from-amber-500 to-red-500 shadow-sm'
                              : 'bg-[#35c3c8]'
                          }`}
                          style={{ height: `${item.realtime}%` }}
                          title={`Real-time: ${item.realtime}%`}
                        />
                      </div>
                      <span className="text-[8px] text-[#5b7a8c]">{item.hour.slice(0, 2)}h</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Monitored Outlets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#71909f] px-1">
                <span>ESTABLECIMIENTO (PERÍMETRO PENTÁGONO)</span>
                <span>OCUPACIÓN / ESPERA</span>
              </div>
              {currentOutlets.map((outlet) => {
                const isSurging = outlet.popularTimesPercent > 70;
                return (
                  <div
                    key={outlet.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isSurging
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-[#081b29] border-[#15344a] hover:border-[#204966]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-[11px]">{outlet.name}</span>
                        </div>
                        <p className="text-[10px] text-[#71909f] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#35c3c8]" />
                          <span>{outlet.area} &middot; {outlet.distanceToPentagonKm} km del Pentágono</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSurging ? 'bg-red-500/20 text-red-400' : 'bg-[#142e3f] text-[#35c3c8]'
                          }`}
                        >
                          {outlet.busyStatus}
                        </span>
                        <span className="block text-[10px] text-[#8faab5] mt-1">
                          Espera: ~{outlet.estimatedDeliveryWaitMin} min
                        </span>
                      </div>
                    </div>

                    {/* Busyness progress bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[9px] text-[#71909f] mb-1">
                        <span>Ocupación Live Busyness: {outlet.popularTimesPercent}%</span>
                        <span className="font-bold text-white">
                          {outlet.currentMultiplier > 1 ? `+${Math.round((outlet.currentMultiplier - 1) * 100)}%` : 'Nominal'}
                        </span>
                      </div>
                      <div className="w-full bg-[#102738] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSurging ? 'bg-gradient-to-r from-amber-400 to-red-500' : 'bg-[#35c3c8]'
                          }`}
                          style={{ width: `${outlet.popularTimesPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[9px] text-[#5e7c8e] pt-1.5 border-t border-white/5">
                      <span>Última entrega masiva: {outlet.lastOrderRecorded}</span>
                      <span className="text-[#35c3c8] hover:underline cursor-pointer">
                        Ver sensor Google Places &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'CORRELATION' && (
          <div className="space-y-3">
            <div className="bg-[#091c2b] border border-[#16364d] rounded-2xl p-3">
              <span className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5 mb-2">
                <Radio className="w-3.5 h-3.5 text-[#35c3c8]" />
                <span>Eventos Geopolíticos & OSINT Sincronizados</span>
              </span>
              <div className="space-y-2">
                {metrics.correlatedEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-[#9bb5c2] leading-snug">
                    <span className="text-[#35c3c8] font-bold">&bull;</span>
                    <span>{event}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#081824] border border-[#143247] rounded-2xl p-3">
              <span className="text-[10px] font-bold text-[#f59e0b] uppercase flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Correlación con Tráfico Marítimo Polar (AMOH)</span>
              </span>
              <p className="text-[11px] text-[#8faab5] leading-relaxed">
                Cuando el Índice de Pizza del Pentágono supera el Nivel 3, AMOH activa automáticamente el rastreo
                prioritario de buques nodriza, rompehielos de bandera estratégica y transpondedores AIS en zonas de
                fricción oceánica (Paso Drake, Mar de Ross y Estrecho de Magallanes).
              </p>
            </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="space-y-3 text-[11px] text-[#9bb5c2] leading-relaxed">
            <div className="bg-[#081b29] border border-[#15344a] rounded-2xl p-3">
              <span className="font-bold text-white block mb-1">¿Qué es el "Pizza Meter"?</span>
              <p>
                Es un indicador de inteligencia no oficial acuñado durante la Guerra Fría. Ante una crisis inminente,
                el personal del Pentágono, CIA y Casa Blanca permanece en sus puestos durante la noche trabajando turnos
                extendidos, lo que provoca una oleada atípica de pedidos de pizza y comida rápida en las sucursales
                cercanas.
              </p>
            </div>

            <div className="bg-[#081b29] border border-[#15344a] rounded-2xl p-3">
              <span className="font-bold text-white block mb-1">Precedentes Históricos Famosos</span>
              <ul className="list-disc pl-4 space-y-1 text-[#8faab5]">
                <li><strong className="text-white">Guerra del Golfo (1990):</strong> Frank Meeks (Domino's) reportó más de 100 entregas de madrugada al Pentágono horas antes de la invasión de Kuwait.</li>
                <li><strong className="text-white">Invasión de Panamá (1989):</strong> Récord de pedidos nocturnos en Washington D.C. antes de la operación armada.</li>
                <li><strong className="text-white">OSINT Moderno:</strong> Bots y analistas rastrean en vivo la concurrencia de Google Maps Popular Times en Arlington y Langley.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="p-3 border-t border-[#142e3f] bg-[#071724] flex items-center justify-between gap-2">
        {onFlyToPentagon ? (
          <button
            onClick={onFlyToPentagon}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e273a] hover:bg-[#15364d] text-[#35c3c8] border border-[#1a405c] transition-all text-[11px] font-bold"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ver Pentágono en Mapa</span>
          </button>
        ) : (
          <div className="text-[10px] text-[#5e7c8e] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#35c3c8]" />
            <span>Monitoreo 24/7 Activo</span>
          </div>
        )}

        <button
          onClick={handleExportOsintReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#35c3c8] hover:from-[#35c3c8] hover:to-[#5eead4] text-[#050e14] font-bold text-[11px] transition-all shadow-md shadow-[#00e5ff]/20 active:scale-95"
          title="Descargar informe completo en formato Markdown"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Exportar Informe OSINT</span>
        </button>
      </div>
    </motion.div>
  );
}
