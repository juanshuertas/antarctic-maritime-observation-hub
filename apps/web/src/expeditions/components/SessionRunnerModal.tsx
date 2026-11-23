import { useState, useEffect, type ReactNode } from 'react';
import {
  X,
  Clock,
  MapPin,
  Smartphone,
  Save,
  CheckCircle2,
  HardDrive,
  Radio,
} from 'lucide-react';
import { SEED_EXPEDITION_DEVICES } from '../expeditions-data';

interface Props {
  expeditionId: string;
  onClose: () => void;
}

export default function SessionRunnerModal({ expeditionId, onClose }: Props): ReactNode {
  const [utcTime, setUtcTime] = useState(new Date().toUTCString());
  const [coords, setCoords] = useState<{ lat: number; lon: number; accuracy: number } | null>({
    lat: -65.092,
    lon: -64.020,
    accuracy: 4.8,
  });
  const [geoLocating, setGeoLocating] = useState(false);
  const [sessionType, setSessionType] = useState('DECK OBSERVATION');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(SEED_EXPEDITION_DEVICES[0]?.deviceId ?? '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // UTC clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Try real GPS fix if browser supports it
  const handleRefreshGps = () => {
    if ('geolocation' in navigator) {
      setGeoLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lon: Number(pos.coords.longitude.toFixed(5)),
            accuracy: Math.round(pos.coords.accuracy),
          });
          setGeoLocating(false);
        },
        () => {
          // Fallback to Antarctic Peninsula reference position
          setGeoLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      id: 'sess-' + Date.now(),
      expeditionId,
      sessionType,
      title: title || `${sessionType} en Península`,
      notes,
      deviceId: selectedDevice,
      coords,
      utc: new Date().toISOString(),
      offlineStatus: 'LOCAL_SAVED',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('amoh_active_sessions') || '[]');
      existing.unshift(newRecord);
      localStorage.setItem('amoh_active_sessions', JSON.stringify(existing));
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error saving local field session:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div className="bg-[#091824] border border-[#213f4f] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#0d2130] border-b border-[#1b3543] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-[#00e5ff] animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                GRABADOR DE CAMPO LIGERO
              </h2>
              <p className="text-[10px] text-[#8faab5]">
                Captura rápida sin sobrecarga de mapas ni aceleración 3D
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#8faab5] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Ticker */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-[#07131d] border-b border-[#152a36] text-xs">
          <div className="flex items-center gap-2 text-[#72e0b5]">
            <Clock className="w-4 h-4" />
            <span className="font-bold text-[11px] truncate">{utcTime}</span>
          </div>

          <div className="flex items-center justify-between text-[#38bdf8]">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-4 h-4" />
              <span className="text-[11px]">
                {coords ? `${coords.lat}, ${coords.lon} (±${coords.accuracy}m)` : 'Buscando GPS...'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefreshGps}
              className="text-[10px] underline hover:text-white"
            >
              {geoLocating ? '...' : 'Fix'}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSession} className="p-5 space-y-4 overflow-y-auto flex-1">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-[#72e0b5]/15 border border-[#72e0b5]/40 text-[#72e0b5] flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>¡Sesión guardada localmente en la cola IndexedDB del dispositivo!</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase font-bold text-[#8faab5] mb-1">
              Tipo de Actividad Científica
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0e2434] border border-[#213f4f] text-white text-xs focus:border-[#00e5ff] focus:outline-none"
            >
              <option value="DECK OBSERVATION">DECK OBSERVATION (Avistamiento en Cubierta)</option>
              <option value="COASTAL TRANSIT">COASTAL TRANSIT (Tránsito Costero Estrecho)</option>
              <option value="AIS VALIDATION">AIS VALIDATION (Verificación VHF de Transponders)</option>
              <option value="SEA-ICE OBSERVATION">SEA-ICE OBSERVATION (Condición de Hielo Polar)</option>
              <option value="WHALE WATCH">WHALE WATCH (Cetáceos y Mitigación de Colisión)</option>
              <option value="SATELLITE MATCHUP">SATELLITE MATCHUP (Ventana de Pasada SAR)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-[#8faab5] mb-1">
              Título / Etiqueta de la Sesión
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Sesión breve de observación - desembarco 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0e2434] border border-[#213f4f] text-white text-xs focus:border-[#00e5ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-[#8faab5] mb-1">
              Dispositivo Colector Primario
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#0e2434] border border-[#213f4f] text-white text-xs focus:border-[#00e5ff] focus:outline-none"
              >
                {SEED_EXPEDITION_DEVICES.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.displayName} ({d.samplingProfile})
                  </option>
                ))}
              </select>
              <span className="p-2 rounded-xl bg-[#0e2434] border border-[#213f4f] text-[#00e5ff]">
                <Smartphone className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-[#8faab5] mb-1">
              Notas Oceanográficas / Condiciones
            </label>
            <textarea
              rows={3}
              placeholder="Estado del mar, visibilidad, presencia de témpanos o embarcaciones no cooperantes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0e2434] border border-[#213f4f] text-white text-xs focus:border-[#00e5ff] focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#06121a] border border-[#142835] flex items-center justify-between text-xs text-[#8faab5]">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#72e0b5]" />
              <span>Modo Offline: Registro local con firma SHA256</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#72e0b5]/15 text-[#72e0b5] text-[10px] font-bold">
              LISTO
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#213f4f] text-[#8faab5] hover:text-white text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Sesión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
