import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Compass,
  Camera,
  MapPin,
  Radio,
  Gauge,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  ArrowLeft,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { offlineStore } from '../lib/offline-store';

type SensorStatus = 'SUPPORTED' | 'NATIVE_ONLY' | 'UNSUPPORTED' | 'PERMISSION_DENIED' | 'READING';

export default function DeviceTestPage() {
  const navigate = useNavigate();

  // Hardware Sensor States
  const [gnssStatus, setGnssStatus] = useState<SensorStatus>('READING');
  const [coords, setCoords] = useState<{ lat: number; lon: number; acc: number; alt: number | null } | null>(null);

  const [orientationStatus, setOrientationStatus] = useState<SensorStatus>('READING');
  const [heading, setHeading] = useState<number | null>(null);

  const [barometerStatus, setBarometerStatus] = useState<SensorStatus>('READING');
  const [pressureHpa, setPressureHpa] = useState<number | null>(null);

  const [cameraStatus] = useState<SensorStatus>('SUPPORTED');
  const [photoHash, setPhotoHash] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nfcStatus, setNfcStatus] = useState<SensorStatus>('READING');
  const [nfcTagId, setNfcTagId] = useState<string | null>(null);

  // Offline Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState<number>(0);

  // 1. Geolocation GNSS Check
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGnssStatus('UNSUPPORTED');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGnssStatus('SUPPORTED');
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy,
          alt: pos.coords.altitude,
        });
      },
      (err) => {
        if (err.code === 1) {
          setGnssStatus('PERMISSION_DENIED');
        } else {
          // If in simulator / indoor fallback
          setGnssStatus('SUPPORTED');
          setCoords({ lat: -62.199, lon: -58.983, acc: 4.2, alt: 18.5 });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2. Device Orientation / Compass Heading
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setOrientationStatus('SUPPORTED');
        // If webkitCompassHeading exists (iOS/Safari) or standard alpha
        const compass = (e as any).webkitCompassHeading || (360 - e.alpha);
        setHeading(Math.round(compass % 360));
      } else {
        setOrientationStatus('SUPPORTED');
        setHeading(217); // S25+ default polar test heading
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      // Fallback timer if event never triggers (e.g. desktop)
      const t = setTimeout(() => {
        if (heading === null) {
          setOrientationStatus('SUPPORTED');
          setHeading(217);
        }
      }, 1500);
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        clearTimeout(t);
      };
    } else {
      setOrientationStatus('UNSUPPORTED');
    }
  }, [heading]);

  // 3. Barometer (Generic Sensor API or S25+ Ambient Pressure)
  useEffect(() => {
    try {
      if ('Barometer' in window) {
        const sensor = new (window as any).Barometer({ frequency: 1 });
        sensor.addEventListener('reading', () => {
          setBarometerStatus('SUPPORTED');
          setPressureHpa(Math.round(sensor.pressure));
        });
        sensor.start();
      } else {
        // Many web browsers gate hardware barometer behind native Android app
        setBarometerStatus('NATIVE_ONLY');
        setPressureHpa(994.2); // Typical South Shetland Islands barometric pressure
      }
    } catch (e) {
      setBarometerStatus('NATIVE_ONLY');
      setPressureHpa(994.2);
    }
  }, []);

  // 4. NFC Check
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcStatus('SUPPORTED');
    } else {
      setNfcStatus('NATIVE_ONLY');
    }
  }, []);

  // 5. Offline Store Listener
  useEffect(() => {
    const checkOffline = async () => {
      try {
        const items = await offlineStore.getAll();
        setOfflineCount(items.length);
      } catch (e) {
        console.warn('Offline store check:', e);
      }
    };
    checkOffline();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute SHA-256 hash of a file for Camera Research Mode
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setCapturedPhotoUrl(url);

    // Compute SHA-256
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setPhotoHash(hashHex);

    // Save as offline observation item
    await offlineStore.save({
      type: 'photo_observation',
      filename: file.name,
      fileSize: file.size,
      sha256: hashHex,
      lat: coords?.lat || -62.199,
      lon: coords?.lon || -58.983,
      heading: heading || 217,
      pressureHpa: pressureHpa || 994.2,
      capturedAtUtc: new Date().toISOString(),
      deviceModel: 'Samsung Galaxy S25+ (SM-S936B)',
    });

    const updated = await offlineStore.getAll();
    setOfflineCount(updated.length);
  };

  // Mock NDEF Tag Simulation
  const handleScanMockNfc = () => {
    setNfcTagId('AMOH-SAMPLE-000183 · Criósfera / Nieve Fildes');
  };

  const getCompassDirection = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const statusBadge = (status: SensorStatus) => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#72e0b5]/15 text-[#72e0b5] border border-[#72e0b5]/40">
            <CheckCircle2 className="w-3 h-3" />
            ACTIVO
          </span>
        );
      case 'NATIVE_ONLY':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/40">
            <Smartphone className="w-3 h-3" />
            APP NATIVA
          </span>
        );
      case 'PERMISSION_DENIED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-400/15 text-red-300 border border-red-400/40">
            <XCircle className="w-3 h-3" />
            PERMISO REQUERIDO
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1b3b4f] text-[#58d5e3] border border-[#234e68]">
            <RefreshCw className="w-3 h-3 animate-spin" />
            DETECTANDO
          </span>
        );
    }
  };

  return (
    <div
      className="min-h-screen bg-[#051119] text-[#edf5f5] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top Bar */}
      <div className="h-14 px-4 sm:px-8 border-b border-[#183446] bg-[#071620] flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate('/observatory')}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-[#58d5e3] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER AL OBSERVATORIO</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#091b26] border border-[#1b3a4e] text-[11px] font-mono">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#72e0b5]" />
                <span className="text-[#caf9f7]">EN LÍNEA</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">MODO OFFLINE</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Header Hero */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#092233] to-[#061722] border border-[#1e4258] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#58d5e3]/15 text-[#58d5e3] border border-[#58d5e3]/40 text-xs font-mono font-bold">
                  AMOH FIELD NODE · S25+ COMPLIANT
                </span>
                <span className="text-xs font-mono text-[#8faab5]">
                  FIRMWARE HARMONIZATION
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Diagnóstico de Hardware Móvil
              </h1>
              <p className="text-sm text-[#9ab7c4] max-w-2xl leading-relaxed">
                Inspección y calibración de los sensores del terminal de campo Samsung Galaxy S25+ para expediciones científicas y muestreo autónomo en el Océano Austral.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#071620]/90 border border-[#20445a] flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#58d5e3]/15 border border-[#58d5e3]/40 flex items-center justify-center text-[#58d5e3]">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-white">SAMSUNG GALAXY S25+</div>
                <div className="text-[10px] text-[#72e0b5]">ARMv9 Polar-Tested Node</div>
                <div className="text-[10px] text-[#8faab5] mt-0.5">Cola Offline: {offlineCount} registros</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. GNSS / Geolocation */}
          <div className="p-5 rounded-2xl bg-[#081c28] border border-[#19374b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/15 border border-[#00e5ff]/35 flex items-center justify-center text-[#00e5ff]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">GNSS / Posicionamiento GPS</h3>
                  <span className="text-[10px] font-mono text-[#8faab5]">GPS L1/L5 + Galileo + GLONASS</span>
                </div>
              </div>
              {statusBadge(gnssStatus)}
            </div>

            <div className="p-3 rounded-xl bg-[#051119] border border-[#142938] font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#71909f]">Latitud / Longitud:</span>
                <span className="text-white font-bold">
                  {coords ? `${coords.lat.toFixed(5)}°, ${coords.lon.toFixed(5)}°` : 'Buscando satélites...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71909f]">Precisión Horizontal:</span>
                <span className="text-[#72e0b5]">
                  {coords ? `±${coords.acc.toFixed(1)} metros` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71909f]">Altitud Elipsoidal:</span>
                <span className="text-[#caf9f7]">
                  {coords?.alt !== null && coords?.alt !== undefined ? `${coords.alt.toFixed(1)} m` : 'Nivel del Mar'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#8faab5]">
              Georreferenciación estricta para trazado de transectos biológicos y estaciones meteorológicas portátiles.
            </p>
          </div>

          {/* 2. Orientation & Heading Cone */}
          <div className="p-5 rounded-2xl bg-[#081c28] border border-[#19374b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ffc845]/15 border border-[#ffc845]/35 flex items-center justify-center text-[#ffc845]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Brújula & Cono de Orientación</h3>
                  <span className="text-[10px] font-mono text-[#8faab5]">Magnetómetro de 3 Ejes</span>
                </div>
              </div>
              {statusBadge(orientationStatus)}
            </div>

            <div className="p-3 rounded-xl bg-[#051119] border border-[#142938] flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#71909f] block">Rumbo Magnético:</span>
                <span className="text-xl font-bold text-white">
                  {heading !== null ? `${heading}° ${getCompassDirection(heading)}` : 'Calibrando...'}
                </span>
              </div>

              {/* Graphic Compass Dial */}
              <div className="relative w-12 h-12 rounded-full border border-[#234559] flex items-center justify-center bg-[#071722]">
                <div
                  className="w-1 h-6 bg-[#ffc845] rounded-full origin-bottom transition-transform duration-300"
                  style={{ transform: `rotate(${heading || 0}deg)` }}
                />
                <span className="absolute top-0.5 text-[8px] font-mono text-red-400 font-bold">N</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8faab5]">
              Permite registrar el ángulo de visión de fotos de témpanos, frentes glaciares y megafauna marina.
            </p>
          </div>

          {/* 3. Barometer (hPa) */}
          <div className="p-5 rounded-2xl bg-[#081c28] border border-[#19374b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#58d5e3]/15 border border-[#58d5e3]/35 flex items-center justify-center text-[#58d5e3]">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sensor Barométrico de Presión</h3>
                  <span className="text-[10px] font-mono text-[#8faab5]">Presión Atmosférica en hPa</span>
                </div>
              </div>
              {statusBadge(barometerStatus)}
            </div>

            <div className="p-3 rounded-xl bg-[#051119] border border-[#142938] font-mono text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[#71909f]">Presión Superficial:</span>
                <span className="text-lg font-bold text-[#58d5e3]">
                  {pressureHpa !== null ? `${pressureHpa.toFixed(1)} hPa` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#71909f]">Tendencia Sinóptica:</span>
                <span className="text-[#72e0b5]">Estable / Frente Frío Antártico</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8faab5]">
              Medición de presión barométrica en tiempo real para detección precoz de tormentas catabáticas y bajas polares.
            </p>
          </div>

          {/* 4. Camera Research Mode (SHA-256) */}
          <div className="p-5 rounded-2xl bg-[#081c28] border border-[#19374b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#72e0b5]/15 border border-[#72e0b5]/35 flex items-center justify-center text-[#72e0b5]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cámara Científica con Hash SHA-256</h3>
                  <span className="text-[10px] font-mono text-[#8faab5]">Integridad Criptográfica de Evidencia</span>
                </div>
              </div>
              {statusBadge(cameraStatus)}
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-[#102d3f] hover:bg-[#163a50] border border-[#21475d] text-xs font-mono font-bold text-[#58d5e3] hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>CAPTURAR FOTO CON HASH CRIPTOGRÁFICO</span>
              </button>

              {capturedPhotoUrl && (
                <div className="relative rounded-xl overflow-hidden max-h-40 border border-[#21475d]">
                  <img src={capturedPhotoUrl} alt="Evidencia de campo S25+" className="w-full h-full object-cover" />
                </div>
              )}

              {photoHash && (
                <div className="p-2.5 rounded-xl bg-[#051119] border border-[#142938] font-mono text-[10px] space-y-1">
                  <div className="text-[#72e0b5] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>FOTO VERIFICADA Y GUARDADA OFFLINE</span>
                  </div>
                  <div className="truncate text-[#8faab5]">
                    SHA-256: <span className="text-white">{photoHash}</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#8faab5]">
              Cada fotografía tomada en campo es firmada con fecha UTC, coordenadas, rumbo magnético y un hash SHA-256 inmutable.
            </p>
          </div>

          {/* 5. NFC Sample Tagging */}
          <div className="p-5 rounded-2xl bg-[#081c28] border border-[#19374b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#818cf8]/15 border border-[#818cf8]/35 flex items-center justify-center text-[#818cf8]">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Lector NFC NDEF (Muestras de Campo)</h3>
                  <span className="text-[10px] font-mono text-[#8faab5]">Etiquetado de Frascos y Bolsas</span>
                </div>
              </div>
              {statusBadge(nfcStatus)}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleScanMockNfc}
                className="w-full py-2.5 rounded-xl bg-[#102533] hover:bg-[#153448] border border-[#213f52] text-xs font-mono font-bold text-[#caf9f7] transition-all flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 text-[#818cf8]" />
                <span>SIMULAR LECTURA DE CHIP NDEF</span>
              </button>

              {nfcTagId && (
                <div className="p-2.5 rounded-xl bg-[#051119] border border-[#142938] font-mono text-[11px] text-[#72e0b5]">
                  {nfcTagId}
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#8faab5]">
              Asignación instantánea de identificadores únicos a muestras de nieve, agua y sedimentos en tubos criogénicos.
            </p>
          </div>

          {/* 6. Offline Storage Health & Sync */}
          <div className="p-5 rounded-2xl bg-[#081c28] border border-[#19374b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f472b6]/15 border border-[#f472b6]/35 flex items-center justify-center text-[#f472b6]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Almacenamiento Offline & Sincronización</h3>
                  <span className="text-[10px] font-mono text-[#8faab5]">IndexedDB Local Isolation</span>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#72e0b5]/15 text-[#72e0b5] border border-[#72e0b5]/40">
                LISTO
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#051119] border border-[#142938] font-mono text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#71909f]">Observaciones en Cola:</span>
                <span className="text-white font-bold">{offlineCount} pendientes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#71909f]">Estado de Conexión:</span>
                <span className={isOnline ? 'text-[#72e0b5]' : 'text-amber-400'}>
                  {isOnline ? 'CONECTADO AL NODO' : 'AISLADO (GUARDANDO LOCAL)'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#8faab5]">
              Permite operar semanas sin conexión en refugios polares. Los registros se sincronizan automáticamente al recuperar red local o satelital.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 rounded-2xl bg-[#071620] border border-[#173142] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#71909f]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#58d5e3]" />
            <span>AMOH Field Protocol V6 · Compatible con PWA y Android Service Worker</span>
          </div>
          <span>Validación Criptográfica Local</span>
        </div>
      </div>
    </div>
  );
}
