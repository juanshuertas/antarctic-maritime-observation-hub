import { useState, useEffect } from 'react';
import { SpatialCameraStore, type MapMode } from '../lib/spatial-camera-store';
import { Radio, QrCode, ShieldCheck } from 'lucide-react';

interface TopHudProps {
  onOpenQr: () => void;
  onOpenPassport: () => void;
  vesselCount?: number;
  satelliteCount?: number;
  aircraftCount?: number;
  aisStatus?: 'LIVE' | 'CACHED' | 'OFFLINE';
}

export default function TopHud({
  onOpenQr,
  onOpenPassport,
  vesselCount = 12,
  satelliteCount = 23,
  aircraftCount = 6,
  aisStatus = 'CACHED',
}: TopHudProps) {
  const [utcTime, setUtcTime] = useState('');
  const [currentMode, setCurrentMode] = useState<MapMode>(() => SpatialCameraStore.getState().activeMode);
  const [region, setRegion] = useState(SpatialCameraStore.getState().selectedRegion);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    const unsub = SpatialCameraStore.subscribe((s) => {
      setCurrentMode(s.activeMode);
      setRegion(s.selectedRegion || 'Antártida & Océano Austral');
    });
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  const handleModeChange = (mode: MapMode) => {
    SpatialCameraStore.setMode(mode);
    setCurrentMode(mode);
  };

  return (
    <header className="relative w-full h-14 bg-[#050e14]/95 border-b border-[#1b3543] backdrop-blur-md px-4 flex items-center justify-between z-[300] select-none text-[#edf5f5]">
      {/* Brand & Mission Statement with Official AMOH Emblem */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#030d14] border border-[#58d5e3]/60 shadow-[0_0_12px_rgba(88,213,227,0.3)] shrink-0 flex items-center justify-center p-1">
            <img
              src="/brand/amoh-logo.png"
              alt="AMOH"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-[0.25em] text-[#58d5e3] font-mono drop-shadow-[0_0_8px_rgba(88,213,227,0.4)]">
              AMOH
            </span>
            <span className="text-[10px] uppercase tracking-[1.5px] text-[#caf9f7] font-semibold">
              WORLD OCEANS LIVING OBSERVATORY
            </span>
          </div>
          <div className="text-[10px] text-[#8faab5] font-mono flex items-center gap-2">
            <span className="text-[#caf9f7] font-semibold">{region}</span>
            <span>·</span>
            <span className="text-[#72e0b5]">{utcTime}</span>
          </div>
        </div>
      </div>

      {/* Center: Multi-Renderer Mode Switcher (GLOBE | MAP | SAT) */}
      <div className="hidden md:flex items-center gap-1 bg-[#091b24] p-1 rounded-xl border border-[#213f4f] shadow-inner">
        {(['GLOBE', 'MAP', 'SAT'] as MapMode[]).map((mode) => {
          const isActive = currentMode === mode;
          const activeStyle =
            mode === 'SAT'
              ? 'bg-[#00e676]/20 border border-[#00e676]/60 text-[#00e676] shadow-[0_0_12px_rgba(0,230,118,0.3)]'
              : 'bg-[#58d5e3]/20 border border-[#58d5e3]/60 text-[#caf9f7] shadow-[0_0_12px_rgba(88,213,227,0.3)]';

          return (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-3 py-1 text-[10px] font-mono rounded-lg font-semibold tracking-wider transition-all duration-200 ${
                isActive
                  ? activeStyle
                  : 'text-[#8aa5af] hover:text-white hover:bg-[#122b38]'
              }`}
            >
              {mode}
            </button>
          );
        })}
      </div>

      {/* Right Telemetry & Quick Action Icons */}
      <div className="flex items-center gap-3">
        {/* Real Honest Live/Cached Counters */}
        <div className="hidden lg:flex items-center gap-2 bg-[#091b24]/80 px-2.5 py-1 rounded border border-[#213f4f] text-[11px] font-mono">
          <span className={`flex items-center gap-1 ${aisStatus === 'LIVE' ? 'text-[#00e676]' : 'text-[#f59e0b]'}`}>
            <Radio className="w-3 h-3 animate-pulse" />
            <span>{aisStatus === 'LIVE' ? `${vesselCount} Buques (Live)` : `AIS: CACHED ${vesselCount}`}</span>
          </span>
          <span className="text-[#3b5969]">|</span>
          <span className="text-[#00e5ff]">🛰 {satelliteCount} Sats</span>
          <span className="text-[#3b5969]">|</span>
          <span className="text-[#38bdf8]">✈ {aircraftCount} Vuelos</span>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#091b24] border border-[#00e676]/30 text-[10px] font-mono text-[#00e676]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-ping" />
          <span className="hidden sm:inline">EXPEDITION LAN</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-l border-[#1b3543] pl-2">
          <button
            onClick={onOpenQr}
            title="Conectar Dispositivo / QR Join"
            className="p-1.5 rounded hover:bg-[#122b38] text-[#8aa5af] hover:text-[#00e5ff] transition-all"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenPassport}
            title="Pasaporte Científico AMOH"
            className="p-1.5 rounded hover:bg-[#122b38] text-[#8aa5af] hover:text-[#8de8cd] transition-all flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
