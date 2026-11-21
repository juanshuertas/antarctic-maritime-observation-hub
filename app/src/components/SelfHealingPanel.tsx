import { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, CheckCircle, Wifi, Database } from 'lucide-react';
import { SelfHealing } from '../lib/self-healing';

interface SelfHealingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SelfHealingPanel({ isOpen, onClose }: SelfHealingPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [systemState, setSystemState] = useState(() => SelfHealing.getState());
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSystemState(SelfHealing.getState());
      setLastCheckTime(new Date().toLocaleTimeString());
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRunManualDiagnostic = async () => {
    setIsRunning(true);
    try {
      await SelfHealing.runCycle();
      setSystemState(SelfHealing.getState());
      setLastCheckTime(new Date().toLocaleTimeString());
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-label="Panel de Auto-Sanación IA de 3 Anillos"
      className="fixed inset-y-0 right-0 z-[500] w-full sm:w-[480px] bg-[#071620]/95 border-l border-[#193444] shadow-2xl backdrop-blur-2xl flex flex-col text-[#edf5f5] select-none animate-in slide-in-from-right duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#193444] flex items-center justify-between bg-[#051119]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00e676]/20 border border-[#00e676]/40 flex items-center justify-center text-[#00e676]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Auto-Sanación IA (3 Anillos)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30">
                ACTIVO
              </span>
            </h2>
            <p className="text-[10px] font-mono text-[#8faab5]">
              Detección Continua · Diagnóstico · Auto-Reparación
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-white/10 text-[#8faab5] hover:text-white flex items-center justify-center transition-colors"
          aria-label="Cerrar panel de auto-sanación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Rings Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-[#1f3947]">
        {/* Ring 1: Detección */}
        <div className="p-4 rounded-xl bg-[#0d2232]/80 border border-[#1b3a4d] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#58d5e3] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#58d5e3] animate-ping" />
              Anillo 1: Detección Continua
            </span>
            <span className="text-[10px] font-mono text-[#8faab5]">Cada 30s</span>
          </div>
          <p className="text-[11px] text-[#8faab5]">
            Monitorea latencia HTTP, integridad del viewport polar, capas vacías y errores JS.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
            <div className="p-2 rounded bg-[#07131b] border border-[#162f40] flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-[#00e676]" />
              <div>
                <div className="text-[9px] text-[#6d8a98]">Modo Red</div>
                <div className="font-bold text-white uppercase">{systemState.networkMode}</div>
              </div>
            </div>
            <div className="p-2 rounded bg-[#07131b] border border-[#162f40] flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#58d5e3]" />
              <div>
                <div className="text-[9px] text-[#6d8a98]">Caché Offline</div>
                <div className="font-bold text-[#72e0b5]">LISTO (18 Sectores)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ring 2: Diagnóstico IA */}
        <div className="p-4 rounded-xl bg-[#0d2232]/80 border border-[#1b3a4d] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ffd700] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffd700]" />
              Anillo 2: Diagnóstico IA (Pythia)
            </span>
            <span className="text-[10px] font-mono text-[#8faab5]">Activo</span>
          </div>
          <p className="text-[11px] text-[#8faab5]">
            Clasifica la causa raíz de anomalías en 6 categorías: RED, AUTH, QUERY, SCHEMA, UI, VIEWPORT.
          </p>
          <div className="p-2.5 rounded bg-[#07131b] border border-[#162f40] text-xs">
            <div className="text-[10px] font-mono uppercase text-[#6d8a98] mb-1">Último Análisis:</div>
            <div className="text-[#caf9f7] leading-relaxed text-[11px]">
              {systemState.diagnostics.length === 0
                ? 'Todos los proveedores polar circumpolares y el motor MapLibre operan nominalmente. Sin anomalías detectadas.'
                : systemState.diagnostics[systemState.diagnostics.length - 1].explanation}
            </div>
          </div>
        </div>

        {/* Ring 3: Auto-Reparación */}
        <div className="p-4 rounded-xl bg-[#0d2232]/80 border border-[#1b3a4d] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#00e676] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00e676]" />
              Anillo 3: Auto-Reparación Determinista
            </span>
            <span className="text-[10px] font-mono text-[#00e676]">Listo</span>
          </div>
          <p className="text-[11px] text-[#8faab5]">
            Aplica fallback a caché empaquetado, recentrado de cámara o recarga silenciosa sin bloquear al usuario.
          </p>
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-mono uppercase text-[#6d8a98]">Acciones Disponibles:</div>
            {[
              { name: 'OFFLINE_CACHE_FALLBACK', desc: 'Sustituir capas caídas por datos pre-cacheados de 18 sectores' },
              { name: 'CAMERA_RESET', desc: 'Recentrar vista a [-75, 0] si la cámara se desvía fuera del polo' },
              { name: 'PROVIDER_STABILIZE', desc: 'Limitar tasa de sondeo ante errores 429 / 500 aguas arriba' },
            ].map((act) => (
              <div key={act.name} className="flex items-start gap-2 p-2 rounded bg-[#07131b] border border-[#162f40] text-[10px] font-mono">
                <CheckCircle className="w-3 h-3 text-[#00e676] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold">{act.name}</span>
                  <p className="text-[#8faab5] font-sans text-[10px]">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Trigger & Footer */}
      <div className="p-4 border-t border-[#193444] bg-[#051119] flex items-center justify-between gap-3">
        <div className="text-[10px] font-mono text-[#6d8a98]">
          Último ciclo: <span className="text-white">{lastCheckTime}</span>
        </div>
        <button
          onClick={handleRunManualDiagnostic}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00e676] hover:bg-[#00c853] text-[#050e14] font-mono font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Diagnosticando...' : 'Ejecutar Diagnóstico'}</span>
        </button>
      </div>
    </div>
  );
}
