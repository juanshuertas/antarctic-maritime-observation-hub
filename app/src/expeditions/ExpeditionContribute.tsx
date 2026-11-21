import { useState, useEffect, type ReactNode } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Send,
} from 'lucide-react';
import { SEED_NATGEO_EXPEDITION } from './expeditions-data';

export default function ExpeditionContribute(): ReactNode {
  const [searchParams] = useSearchParams();
  const expeditionId = searchParams.get('expedition') || 'exp-natgeo-2027';

  const [utcTime, setUtcTime] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number; acc: number } | null>({
    lat: -65.092,
    lon: -64.020,
    acc: 5.2,
  });
  const [locating, setLocating] = useState(false);
  const [observerName, setObserverName] = useState('');
  const [role, setRole] = useState('GUEST OBSERVER');
  const [category, setCategory] = useState('MARITIME_VESSEL');
  const [vesselName, setVesselName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setUtcTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGetGps = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lon: Number(pos.coords.longitude.toFixed(5)),
            acc: Math.round(pos.coords.accuracy),
          });
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const observation = {
      id: 'obs-contrib-' + Date.now(),
      expeditionId,
      observerName: observerName || 'Observador Invitado',
      role,
      category,
      vesselName,
      notes,
      coords,
      utcTime,
      realityLabel: role === 'RESEARCHER' ? 'FIELD SENSOR' : 'COMMUNITY OBSERVATION',
      reviewStatus: 'UNREVIEWED',
      createdAt: new Date().toISOString(),
    };

    try {
      const queue = JSON.parse(localStorage.getItem('amoh_offline_contributions') || '[]');
      queue.unshift(observation);
      localStorage.setItem('amoh_offline_contributions', JSON.stringify(queue));
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving observation:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050e14] text-[#edf5f5] font-mono p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-[#081724] border border-[#1b3543] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Glow Decor */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00e5ff]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Brand & Disclosure Header */}
        <div className="space-y-3 border-b border-[#152e3e] pb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00e5ff] flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>AMOH Field Connect · Móvil</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
              PROPOSAL
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-white font-sans leading-snug">
            {SEED_NATGEO_EXPEDITION.title}
          </h1>

          <div className="p-2.5 rounded-xl bg-[#050f16] border border-[#142836] text-[10px] text-[#f59e0b] italic flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{SEED_NATGEO_EXPEDITION.disclaimer}</span>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-[#72e0b5]/15 border border-[#72e0b5]/40 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-[#72e0b5] mx-auto" />
            <h2 className="text-base font-bold text-white font-sans">
              ¡Observación Registrada con Éxito!
            </h2>
            <p className="text-xs text-[#d5e8e3] font-sans leading-relaxed">
              Tu reporte ha sido guardado de forma segura en la base de datos local de tu teléfono y se sincronizará automáticamente con el nodo del buque (DuckDB).
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setVesselName('');
                  setNotes('');
                }}
                className="px-4 py-2 rounded-xl bg-[#72e0b5] text-[#050e14] font-bold text-xs hover:bg-[#5cd4a5] transition-all"
              >
                Registrar Otra Observación
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Live Ticker */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#040e16] border border-[#142836] text-[11px]">
              <div className="flex items-center gap-1.5 text-[#72e0b5]">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-bold truncate">{utcTime || 'Obteniendo hora...'}</span>
              </div>
              <div className="flex items-center justify-between text-[#38bdf8]">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {coords ? `${coords.lat}, ${coords.lon}` : 'GPS...'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGetGps}
                  className="text-[10px] underline hover:text-white"
                >
                  {locating ? '...' : 'Fix'}
                </button>
              </div>
            </div>

            {/* Observer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                  Tu Nombre o Pseudónimo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre del observador"
                  value={observerName}
                  onChange={(e) => setObserverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#152a38] text-white focus:border-[#00e5ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                  Rol a Bordo
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#152a38] text-white focus:border-[#00e5ff] focus:outline-none"
                >
                  <option value="GUEST OBSERVER">Observador Invitado / Pasajero</option>
                  <option value="NATURALIST">Guía Naturalista / Staff</option>
                  <option value="RESEARCHER">Investigador Científico</option>
                </select>
              </div>
            </div>

            {/* Observation Category */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                Tipo de Avistamiento
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#152a38] text-white focus:border-[#00e5ff] focus:outline-none"
              >
                <option value="MARITIME_VESSEL">Buque / Embarcación en Tránsito o Fondeada</option>
                <option value="ZODIAC_OPERATION">Operación de Botes Zodiac Costera</option>
                <option value="CETACEAN_SIGHTING">Avistamiento de Cetáceos (Riesgo de Colisión)</option>
                <option value="SEA_ICE_BARRIER">Barrera de Hielo / Témpano Gigante</option>
                <option value="RADAR_TARGET">Blanco Radar Sin Traza Visual o AIS</option>
              </select>
            </div>

            {category === 'MARITIME_VESSEL' && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                  Nombre del Buque Observado (o Distintivo)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Silver Wind, B/I Hespérides, Velero desconocido..."
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#152a38] text-white focus:border-[#00e5ff] focus:outline-none"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                Descripción / Notas de Campo
              </label>
              <textarea
                rows={3}
                placeholder="Rumbo aparente, velocidad estimada, estado del mar, visibilidad, presencia de témpanos..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#152a38] text-white focus:border-[#00e5ff] focus:outline-none"
              />
            </div>

            {/* Local-First Notice */}
            <div className="p-3 rounded-xl bg-[#040e16] border border-[#132734] flex items-center justify-between text-[11px] text-[#8faab5]">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#72e0b5]" />
                <span>Almacenamiento Local Offline Activo</span>
              </div>
              <span className="text-[#72e0b5] font-bold">100% FUNCIONAL</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00e5ff]/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>ENVIAR OBSERVACIÓN AL NODO DEL BUQUE</span>
            </button>
          </form>
        )}

        {/* Footer Link back to Expeditions */}
        <div className="border-t border-[#142836] pt-4 text-center">
          <Link
            to="/expeditions/exp-natgeo-2027/overview"
            className="text-xs text-[#8faab5] hover:text-[#00e5ff] transition-colors"
          >
            ← Volver al Centro de Misión de la Expedición
          </Link>
        </div>
      </div>
    </div>
  );
}
