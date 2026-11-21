import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Ship,
  Satellite,
  Snowflake,
  Fish,
  Thermometer,
  Landmark,
  MapPin,
  Clock,
  Save,
  Download,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Compass,
  HardDrive,
  Copy,
  ArrowRight,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import { api } from '../lib/api';
import { offlineStore } from '../lib/offline-store';

export interface FieldLogEntry {
  id: string;
  utc: string;
  localTime: string;
  expeditionId: string;
  category: 'vessel_sighting' | 'satellite_overpass' | 'sea_ice' | 'polar_fauna' | 'oceanography_ctd' | 'iaato_landing';
  latitude: number;
  longitude: number;
  accuracyM: number;
  positionSource: string;
  observerName: string;
  observerType: string;
  notes: string;
  synced: boolean;
  metadata: Record<string, any>;
}

const PRESET_LOCATIONS = [
  { name: 'Pasaje de Drake (Cruce Central)', lat: -58.5, lng: -64.2 },
  { name: 'Islas Shetland del Sur (King George)', lat: -62.15, lng: -58.4 },
  { name: 'Isla Decepción (Bahía Balleneros)', lat: -62.98, lng: -60.65 },
  { name: 'Estrecho de Gerlache', lat: -64.3, lng: -62.4 },
  { name: 'Neko Harbour (Bahía Andvord)', lat: -64.835, lng: -62.53 },
  { name: 'Port Lockroy (Isla Goudier)', lat: -64.825, lng: -63.495 },
  { name: 'Canal Lemaire', lat: -65.12, lng: -64.0 },
];

const LOCAL_STORAGE_KEY = 'amoh_edge_field_logs_v1';

export default function FieldLoggerPage() {
  // Current time
  const [utcTime, setUtcTime] = useState(new Date().toUTCString());
  const [shipTime, setShipTime] = useState('');

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
      // Vessel time: UTC-3 (Punta Arenas / Ushuaia maritime standard)
      const shipDate = new Date(now.getTime() - 3 * 3600 * 1000);
      setShipTime(shipDate.toISOString().replace('T', ' ').slice(0, 19) + ' (Ship UTC-3)');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Form State
  const [expeditionId, setExpeditionId] = useState<'NG-LEX-2027-2028' | 'PAC-2027-2028' | 'DRAKE-TRANSIT'>('NG-LEX-2027-2028');
  const [category, setCategory] = useState<FieldLogEntry['category']>('vessel_sighting');
  const [latitude, setLatitude] = useState<string>('-64.8350');
  const [longitude, setLongitude] = useState<string>('-62.5300');
  const [accuracyM, setAccuracyM] = useState<number>(10);
  const [positionSource, setPositionSource] = useState<string>('GNSS Edge / Buque');
  const [observerName] = useState<string>('Juan Sebastian Huertas Olea');
  const [notes, setNotes] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Category Specific Fields
  const [vesselName, setVesselName] = useState<string>('');
  const [vesselType, setVesselType] = useState<string>('Crucero IAATO');
  const [vesselMmsi] = useState<string>('');
  const [vesselAisMatch, setVesselAisMatch] = useState<string>('Match Visual OK');
  const [vesselBearing, setVesselBearing] = useState<string>('180° / 2.5 MN');

  const [satelliteMission, setSatelliteMission] = useState<string>('Sentinel-1 SAR');
  const [cloudCover, setCloudCover] = useState<string>('2/8 (Parcialmente despejado)');
  const [seaState, setSeaState] = useState<string>('Marejadilla (0.5 - 1.25m)');

  const [iceConcentration, setIceConcentration] = useState<string>('3/10 (Hielo muy abierto)');
  const [iceType, setIceType] = useState<string>('Pack ice / Trozos sueltos');
  const [icebergNotable, setIcebergNotable] = useState<string>('Fragmentos de témpano tabular A-23A');

  const [faunaSpecies, setFaunaSpecies] = useState<string>('Ballena Jorobada (Megaptera novaeangliae)');
  const [faunaCount, setFaunaCount] = useState<string>('3-5 individuos');
  const [faunaBehavior, setFaunaBehavior] = useState<string>('Alimentación / Breaching');

  const [sst, setSst] = useState<string>('-1.1 °C');
  const [airTemp, setAirTemp] = useState<string>('0.4 °C');
  const [windKts, setWindKts] = useState<string>('18 kts (SW)');
  const [baroHpa, setBaroHpa] = useState<string>('992 hPa');

  const [landingSite, setLandingSite] = useState<string>('Neko Harbour');
  const [paxCount, setPaxCount] = useState<string>('45 pasajeros');
  const [aspaCompliance, setAspaCompliance] = useState<string>('Conforme directrices IAATO & ASPA');

  // Stored Logs State
  const [logs, setLogs] = useState<FieldLogEntry[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [
      {
        id: 'seed-01',
        utc: new Date(Date.now() - 3600000 * 2).toISOString(),
        localTime: 'Hora Buque 14:30',
        expeditionId: 'NG-LEX-2027-2028',
        category: 'vessel_sighting',
        latitude: -64.835,
        longitude: -62.53,
        accuracyM: 5,
        positionSource: 'GNSS Puente NatGeo Resolution',
        observerName: 'Juan Sebastian Huertas Olea',
        observerType: 'Visiting Scientist',
        notes: 'Avistamiento de buque científico a 2.4 MN. Validación con capa AIS coincidente.',
        synced: true,
        metadata: {
          vesselName: 'ARC Simón Bolívar',
          vesselType: 'Buque Polar Científico',
          vesselAisMatch: 'Match Visual OK',
        },
      },
      {
        id: 'seed-02',
        utc: new Date(Date.now() - 3600000).toISOString(),
        localTime: 'Hora Buque 15:30',
        expeditionId: 'NG-LEX-2027-2028',
        category: 'sea_ice',
        latitude: -64.3,
        longitude: -62.4,
        accuracyM: 8,
        positionSource: 'GNSS Puente NatGeo Resolution',
        observerName: 'Juan Sebastian Huertas Olea',
        observerType: 'Visiting Scientist',
        notes: 'Presencia de growlers y hielo flotante suelto. Agua abierta al oeste.',
        synced: true,
        metadata: {
          iceConcentration: '3/10 (Hielo muy abierto)',
          iceType: 'Pack ice / Trozos sueltos',
        },
      },
    ];
  });

  const [, setSyncCount] = useState<number>(0);
  const [backendAlive, setBackendAlive] = useState<boolean>(true);

  // Map Container Ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Check Backend Status
  useEffect(() => {
    api
      .get('/api/expeditions/status')
      .then(() => setBackendAlive(true))
      .catch(() => setBackendAlive(false));
  }, []);

  // Save logs to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [logs]);

  // Init Mini Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'esri-ocean': {
              type: 'raster',
              tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: '© Esri, GEBCO, NOAA',
            },
          },
          layers: [
            {
              id: 'esri-ocean-layer',
              type: 'raster',
              source: 'esri-ocean',
              minzoom: 0,
              maxzoom: 16,
            },
          ],
        },
        center: [-63.5, -64.0],
        zoom: 4.8,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;
    } catch (e) {
      console.error('Map init error:', e);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Map Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add marker for each log
    logs.forEach((log) => {
      if (typeof log.latitude !== 'number' || typeof log.longitude !== 'number') return;

      const el = document.createElement('div');
      el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125';
      const color =
        log.category === 'sea_ice'
          ? '#38BDF8'
          : log.category === 'polar_fauna'
          ? '#4ADE80'
          : log.category === 'satellite_overpass'
          ? '#C084FC'
          : '#FB7185';
      el.style.backgroundColor = color;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([log.longitude, log.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(`
            <div style="color:#0f172a;font-family:sans-serif;font-size:12px;line-height:1.4;">
              <strong style="color:#0284c7;text-transform:uppercase;">${log.category}</strong><br/>
              <span>${log.utc.slice(0, 19)}</span><br/>
              <span>[${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}]</span><br/>
              <em>${log.notes.slice(0, 60)}...</em>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [logs]);

  // Capture Live GPS
  const handleCaptureGps = () => {
    if (!('geolocation' in navigator)) {
      setFeedback({ text: 'Geolocalización no disponible en este dispositivo.', type: 'error' });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setAccuracyM(Math.round(pos.coords.accuracy || 10));
        setPositionSource('GNSS Dispositivo (Live)');
        setFeedback({ text: `Coordenadas capturadas con precisión ±${Math.round(pos.coords.accuracy || 10)}m`, type: 'success' });
        setTimeout(() => setFeedback(null), 4000);

        if (mapRef.current) {
          mapRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 7 });
        }
      },
      (err) => {
        setIsLocating(false);
        setFeedback({ text: `No se pudo obtener GNSS (${err.message}). Usando coordenadas manuales.`, type: 'info' });
        setTimeout(() => setFeedback(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );
  };

  // Save Log Handler
  const handleSaveLog = async () => {
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setFeedback({ text: 'Por favor, ingresa coordenadas de latitud y longitud válidas.', type: 'error' });
      return;
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setFeedback({ text: 'Coordenadas fuera del rango permitido (-90..90, -180..180).', type: 'error' });
      return;
    }

    // Build specific metadata
    let metadata: Record<string, any> = {};
    if (category === 'vessel_sighting') {
      metadata = { vesselName, vesselType, vesselMmsi, vesselAisMatch, vesselBearing };
    } else if (category === 'satellite_overpass') {
      metadata = { satelliteMission, cloudCover, seaState };
    } else if (category === 'sea_ice') {
      metadata = { iceConcentration, iceType, icebergNotable };
    } else if (category === 'polar_fauna') {
      metadata = { faunaSpecies, faunaCount, faunaBehavior };
    } else if (category === 'oceanography_ctd') {
      metadata = { sst, airTemp, windKts, baroHpa };
    } else if (category === 'iaato_landing') {
      metadata = { landingSite, paxCount, aspaCompliance };
    }

    const now = new Date();
    const newEntry: FieldLogEntry = {
      id: crypto.randomUUID(),
      utc: now.toISOString(),
      localTime: shipTime || now.toLocaleTimeString(),
      expeditionId,
      category,
      latitude: latNum,
      longitude: lngNum,
      accuracyM,
      positionSource,
      observerName,
      observerType: 'Visiting Scientist',
      notes: notes.trim() || `Observación de campo tipo ${category}`,
      synced: false,
      metadata,
    };

    // 1. Save in local state & IndexedDB
    setLogs((prev) => [newEntry, ...prev]);

    try {
      await offlineStore.save({
        observation_type: category,
        evidence_class: 'field',
        utc: newEntry.utc,
        latitude: latNum,
        longitude: lngNum,
        position_source: positionSource,
        accuracy_m: accuracyM,
        observer_type: 'visiting_scientist',
        source_name: observerName,
        notes: JSON.stringify({ notes: newEntry.notes, metadata, expeditionId }),
      });
    } catch (e) {
      console.warn('IndexedDB write notice:', e);
    }

    // 2. Attempt sync with local backend
    try {
      await api.post('/api/observations', {
        observation_type: category,
        evidence_class: 'field',
        utc: newEntry.utc,
        latitude: latNum,
        longitude: lngNum,
        position_source: positionSource,
        accuracy_m: accuracyM,
        observer_type: 'visiting_scientist',
        source_name: observerName,
        notes: `[${expeditionId}] ${newEntry.notes} | ${JSON.stringify(metadata)}`,
      });
      newEntry.synced = true;
      setLogs((prev) => prev.map((l) => (l.id === newEntry.id ? { ...l, synced: true } : l)));
      setFeedback({ text: '✅ Registro guardado en IndexedDB y sincronizado con SQLite local.', type: 'success' });
    } catch {
      setFeedback({ text: '💾 Registro guardado en nodo local IndexedDB (Pendiente sync con SQLite).', type: 'info' });
    }

    // Clear notes for next observation
    setNotes('');
    setTimeout(() => setFeedback(null), 5000);

    // Pan map to new entry
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lngNum, latNum], zoom: 6 });
    }
  };

  // Keyboard shortcut Ctrl+Enter to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSaveLog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    category,
    latitude,
    longitude,
    notes,
    expeditionId,
    vesselName,
    vesselType,
    vesselMmsi,
    vesselAisMatch,
    satelliteMission,
    cloudCover,
    seaState,
    iceConcentration,
    iceType,
    icebergNotable,
    faunaSpecies,
    faunaCount,
    faunaBehavior,
    sst,
    airTemp,
    windKts,
    landingSite,
    paxCount,
  ]);

  // Sync Pending Logs
  const handleSyncAll = async () => {
    setFeedback({ text: 'Sincronizando observaciones con el backend local...', type: 'info' });
    const newlySyncedIds = new Set<string>();

    for (const log of logs) {
      if (!log.synced) {
        try {
          await api.post('/api/observations', {
            observation_type: log.category,
            evidence_class: 'field',
            utc: log.utc,
            latitude: log.latitude,
            longitude: log.longitude,
            position_source: log.positionSource,
            accuracy_m: log.accuracyM,
            observer_type: log.observerType,
            source_name: log.observerName,
            notes: `[${log.expeditionId}] ${log.notes} | ${JSON.stringify(log.metadata)}`,
          });
          newlySyncedIds.add(log.id);
        } catch {
          // keep un-synced
        }
      }
    }

    if (newlySyncedIds.size > 0) {
      setLogs((prev) => prev.map((l) => (newlySyncedIds.has(l.id) ? { ...l, synced: true } : l)));
      setSyncCount((prev) => prev + newlySyncedIds.size);
      setFeedback({ text: `✅ Sincronizados ${newlySyncedIds.size} registros exitosamente.`, type: 'success' });
    } else {
      setFeedback({ text: 'No había registros pendientes de sincronizar.', type: 'info' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Export to GeoJSON
  const handleExportGeoJson = () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: logs.map((l) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [l.longitude, l.latitude],
        },
        properties: {
          id: l.id,
          utc: l.utc,
          expeditionId: l.expeditionId,
          category: l.category,
          observer: l.observerName,
          notes: l.notes,
          ...l.metadata,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amoh_bitacora_${expeditionId.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['id', 'utc', 'expedition_id', 'category', 'latitude', 'longitude', 'accuracy_m', 'observer', 'notes', 'metadata_json'];
    const rows = logs.map((l) => [
      l.id,
      l.utc,
      l.expeditionId,
      l.category,
      l.latitude,
      l.longitude,
      l.accuracyM,
      `"${l.observerName.replace(/"/g, '""')}"`,
      `"${l.notes.replace(/"/g, '""')}"`,
      `"${JSON.stringify(l.metadata).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amoh_bitacora_${expeditionId.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to Markdown Report
  const handleExportMarkdown = () => {
    const lines = [
      `# Bitácora Científica Polar — AMOH Edge Field Logger`,
      `*Expedición:* ${expeditionId}`,
      `*Investigador:* ${observerName}`,
      `*Fecha de Exportación:* ${utcTime}`,
      `*Total de Registros:* ${logs.length}`,
      ``,
      `---`,
      ``,
      `| UTC | Tipo | Coordenadas | Notas / Metadatos | Sync |`,
      `|---|---|---|---|---|`,
      ...logs.map(
        (l) =>
          `| ${l.utc.slice(0, 19)} | \`${l.category}\` | ${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)} | ${l.notes} (${Object.entries(l.metadata).map(([k, v]) => `${k}: ${v}`).join('; ')}) | ${l.synced ? '✅' : '💾'} |`
      ),
      ``,
      `*Generado automáticamente por el Nodo Edge Local de AMOH en alta mar.*`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amoh_informe_campo_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#070d14] text-[#cfd9e5] font-sans antialiased selection:bg-[#ffcc00] selection:text-black">
      {/* 1. TOP BRIDGE HUD BAR */}
      <header className="border-b border-[#1b2a3d] bg-[#09121d]/90 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/observatory"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#142030] hover:bg-[#1e2f44] text-[#8faab5] hover:text-white text-xs border border-[#23354b] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Observatorio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00] animate-pulse" />
            <h1 className="text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2">
              <span>AMOH Edge Field Logger</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/40 font-mono">
                V10 PROPOSAL
              </span>
            </h1>
          </div>
        </div>

        {/* Real-time Maritime Clocks */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0e1927] border border-[#1d2d42] text-[#ffcc00]">
            <Clock className="w-3.5 h-3.5 text-[#ffcc00]" />
            <span>{utcTime}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[#8faab5]">
            <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{shipTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${backendAlive ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-amber-950/40 text-amber-400 border-amber-500/30'}`}>
              <HardDrive className="w-3 h-3" />
              {backendAlive ? '127.0.0.1 SQLite' : 'Offline PWA'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BANNER: MOBILE COMPANION APP */}
        <div className="lg:col-span-12 p-3 rounded-2xl bg-gradient-to-r from-[#0c2a47] via-[#103254] to-[#0c253e] border border-[#234b75] shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffcc00] text-black flex items-center justify-center font-bold text-lg shadow-md">
              📱
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>AMOH Onboard: App Móvil para Celulares (Estilo Royal Caribbean)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] font-mono border border-[#00e5ff]/40">
                  Táctil 1-Toque
                </span>
              </div>
              <p className="text-[11px] text-[#93b4d4]">
                Diseñada con botones grandes e intuitivos para que pasajeros, científicos y tripulantes puedan registrar avistamientos en 5 segundos desde sus teléfonos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/onboard"
              className="px-3.5 py-2 rounded-xl bg-[#ffcc00] hover:bg-[#e6b800] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>Abrir App Celular</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* LEFT COLUMN: LOGGING CONSOLE (7 cols) */}
        <section className="lg:col-span-7 space-y-5">
          {/* CAMPAIGN CONTEXT & DISCLAIMER */}
          <div className="p-3.5 rounded-xl bg-[#0b1624] border border-[#1f3148] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#8faab5] uppercase tracking-wider">Contexto de Campaña:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpeditionId('NG-LEX-2027-2028')}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${expeditionId === 'NG-LEX-2027-2028' ? 'bg-[#ffcc00] text-black border-[#ffcc00] shadow' : 'bg-[#122031] text-[#b0c2d4] border-[#22354c] hover:bg-[#192b42]'}`}
                >
                  NG-LEX 2027-2028
                </button>
                <button
                  onClick={() => setExpeditionId('PAC-2027-2028')}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${expeditionId === 'PAC-2027-2028' ? 'bg-[#00e5ff] text-black border-[#00e5ff] shadow' : 'bg-[#122031] text-[#b0c2d4] border-[#22354c] hover:bg-[#192b42]'}`}
                >
                  PAC Simón Bolívar
                </button>
                <button
                  onClick={() => setExpeditionId('DRAKE-TRANSIT')}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${expeditionId === 'DRAKE-TRANSIT' ? 'bg-[#38bdf8] text-black border-[#38bdf8] shadow' : 'bg-[#122031] text-[#b0c2d4] border-[#22354c] hover:bg-[#192b42]'}`}
                >
                  Tránsito Drake
                </button>
              </div>
            </div>

            <div className="text-[11px] text-[#ffcc00]/90 bg-[#ffcc00]/10 border border-[#ffcc00]/30 rounded-lg p-2 leading-relaxed">
              <strong>Aviso Oficial de Propuesta:</strong> No se implica respaldo de National Geographic ni Lindblad Expeditions. Datos registrados con fines de investigación científica preliminar e integración Edge a bordo.
            </div>
          </div>

          {/* GEOLOCATION FIX HUD */}
          <div className="p-4 rounded-xl bg-[#0d1827] border border-[#233852] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" /> Posición Geográfica (GNSS)
              </span>

              <button
                onClick={handleCaptureGps}
                disabled={isLocating}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'Obteniendo GPS...' : 'Fijar GNSS Actual'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Latitud (°)</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-[#08101a] border border-[#203248] rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-[#38bdf8]"
                  placeholder="-64.8350"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Longitud (°)</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-[#08101a] border border-[#203248] rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-[#38bdf8]"
                  placeholder="-62.5300"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Precisión (m)</label>
                <input
                  type="number"
                  value={accuracyM}
                  onChange={(e) => setAccuracyM(parseInt(e.target.value) || 10)}
                  className="w-full bg-[#08101a] border border-[#203248] rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Fuente</label>
                <select
                  value={positionSource}
                  onChange={(e) => setPositionSource(e.target.value)}
                  className="w-full bg-[#08101a] border border-[#203248] rounded-md px-2 py-1.5 text-[#b0c2d4] focus:outline-none focus:border-[#38bdf8]"
                >
                  <option value="GNSS Edge / Buque">GNSS Buque (NMEA)</option>
                  <option value="GNSS Dispositivo (Live)">GPS Dispositivo</option>
                  <option value="Estimación Cartográfica">Estimación Manual</option>
                </select>
              </div>
            </div>

            {/* Quick Antarctic Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#6d889b] uppercase mr-1">Hitos Rápidos:</span>
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setLatitude(preset.lat.toFixed(4));
                    setLongitude(preset.lng.toFixed(4));
                    setPositionSource('Preset Geográfico');
                    if (mapRef.current) mapRef.current.flyTo({ center: [preset.lng, preset.lat], zoom: 6 });
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#132233] hover:bg-[#1c324c] text-[#a0b8cc] border border-[#21354d] transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 6 SCIENTIFIC TEMPLATE SELECTOR */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8faab5] block">
              Tipo de Observación Polar:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setCategory('vessel_sighting')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${category === 'vessel_sighting' ? 'bg-[#ffcc00]/10 border-[#ffcc00] text-white shadow-lg' : 'bg-[#0d1826] border-[#1e2f42] text-[#93a7bc] hover:bg-[#132235]'}`}
              >
                <Ship className={`w-5 h-5 shrink-0 ${category === 'vessel_sighting' ? 'text-[#ffcc00]' : 'text-[#8faab5]'}`} />
                <div>
                  <div className="text-xs font-semibold">Buques / AIS</div>
                  <div className="text-[10px] text-[#6e879c]">Validación visual</div>
                </div>
              </button>

              <button
                onClick={() => setCategory('satellite_overpass')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${category === 'satellite_overpass' ? 'bg-[#c084fc]/10 border-[#c084fc] text-white shadow-lg' : 'bg-[#0d1826] border-[#1e2f42] text-[#93a7bc] hover:bg-[#132235]'}`}
              >
                <Satellite className={`w-5 h-5 shrink-0 ${category === 'satellite_overpass' ? 'text-[#c084fc]' : 'text-[#8faab5]'}`} />
                <div>
                  <div className="text-xs font-semibold">Pase Satelital</div>
                  <div className="text-[10px] text-[#6e879c]">SAR / Ground-truth</div>
                </div>
              </button>

              <button
                onClick={() => setCategory('sea_ice')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${category === 'sea_ice' ? 'bg-[#38bdf8]/10 border-[#38bdf8] text-white shadow-lg' : 'bg-[#0d1826] border-[#1e2f42] text-[#93a7bc] hover:bg-[#132235]'}`}
              >
                <Snowflake className={`w-5 h-5 shrink-0 ${category === 'sea_ice' ? 'text-[#38bdf8]' : 'text-[#8faab5]'}`} />
                <div>
                  <div className="text-xs font-semibold">Hielo & Témpanos</div>
                  <div className="text-[10px] text-[#6e879c]">Concentración & A-23A</div>
                </div>
              </button>

              <button
                onClick={() => setCategory('polar_fauna')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${category === 'polar_fauna' ? 'bg-[#4ade80]/10 border-[#4ade80] text-white shadow-lg' : 'bg-[#0d1826] border-[#1e2f42] text-[#93a7bc] hover:bg-[#132235]'}`}
              >
                <Fish className={`w-5 h-5 shrink-0 ${category === 'polar_fauna' ? 'text-[#4ade80]' : 'text-[#8faab5]'}`} />
                <div>
                  <div className="text-xs font-semibold">Fauna Polar</div>
                  <div className="text-[10px] text-[#6e879c]">Cetáceos, focas, aves</div>
                </div>
              </button>

              <button
                onClick={() => setCategory('oceanography_ctd')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${category === 'oceanography_ctd' ? 'bg-[#fb7185]/10 border-[#fb7185] text-white shadow-lg' : 'bg-[#0d1826] border-[#1e2f42] text-[#93a7bc] hover:bg-[#132235]'}`}
              >
                <Thermometer className={`w-5 h-5 shrink-0 ${category === 'oceanography_ctd' ? 'text-[#fb7185]' : 'text-[#8faab5]'}`} />
                <div>
                  <div className="text-xs font-semibold">Oceanografía & Met</div>
                  <div className="text-[10px] text-[#6e879c]">SST, viento, estado mar</div>
                </div>
              </button>

              <button
                onClick={() => setCategory('iaato_landing')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${category === 'iaato_landing' ? 'bg-[#fb923c]/10 border-[#fb923c] text-white shadow-lg' : 'bg-[#0d1826] border-[#1e2f42] text-[#93a7bc] hover:bg-[#132235]'}`}
              >
                <Landmark className={`w-5 h-5 shrink-0 ${category === 'iaato_landing' ? 'text-[#fb923c]' : 'text-[#8faab5]'}`} />
                <div>
                  <div className="text-xs font-semibold">Desembarco IAATO</div>
                  <div className="text-[10px] text-[#6e879c]">Sitios & Zonas ASPA</div>
                </div>
              </button>
            </div>
          </div>

          {/* DYNAMIC FORM PER CATEGORY */}
          <div className="p-4 rounded-xl bg-[#0b1522] border border-[#20334a] space-y-3">
            {category === 'vessel_sighting' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Nombre del Buque / Distintivo</label>
                  <input
                    type="text"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    placeholder="Ej. National Geographic Resolution"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#ffcc00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Tipo de Embarcación</label>
                  <select
                    value={vesselType}
                    onChange={(e) => setVesselType(e.target.value)}
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#ffcc00]"
                  >
                    <option value="Crucero IAATO">Crucero IAATO (Expedición)</option>
                    <option value="Buque Polar Científico">Buque Polar Científico</option>
                    <option value="Pesquero Factoría (CCAMLR)">Pesquero Factoría (Krill/Merluza)</option>
                    <option value="Buque Militar / Patrulla Antártica">Patrulla Naval / Apoyo Logístico</option>
                    <option value="Yate Privado">Yate Privado</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Marcación / Distancia Visual</label>
                  <input
                    type="text"
                    value={vesselBearing}
                    onChange={(e) => setVesselBearing(e.target.value)}
                    placeholder="Ej. 180° / 3.2 Millas Náuticas"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#ffcc00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Coincidencia con Pantalla AIS</label>
                  <select
                    value={vesselAisMatch}
                    onChange={(e) => setVesselAisMatch(e.target.value)}
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#ffcc00]"
                  >
                    <option value="Match Visual OK">Match Visual Coincidente con AIS</option>
                    <option value="Buque Obscuro (Sin AIS)">Sin Transmisión AIS (Buque Oscuro / Silencioso)</option>
                    <option value="Discrepancia Posición">Discrepancia Posición / Rumbo vs AIS</option>
                  </select>
                </div>
              </div>
            )}

            {category === 'satellite_overpass' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Misión Satelital</label>
                  <select
                    value={satelliteMission}
                    onChange={(e) => setSatelliteMission(e.target.value)}
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#c084fc]"
                  >
                    <option value="Sentinel-1 SAR">Sentinel-1 (Radar SAR C-Band)</option>
                    <option value="Sentinel-2 MSI">Sentinel-2 (Multiespectral Óptico)</option>
                    <option value="MODIS Aqua/Terra">MODIS Aqua / Terra (NASA)</option>
                    <option value="Landsat-8/9">Landsat 8 / 9 (OLI/TIRS)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Nubosidad (Octas)</label>
                  <select
                    value={cloudCover}
                    onChange={(e) => setCloudCover(e.target.value)}
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#c084fc]"
                  >
                    <option value="0/8 (Completamente Despejado)">0/8 (Completamente Despejado)</option>
                    <option value="2/8 (Parcialmente Despejado)">2/8 (Parcialmente Despejado)</option>
                    <option value="4/8 (Medio Nublado)">4/8 (Medio Nublado)</option>
                    <option value="6/8 (Muy Nublado)">6/8 (Muy Nublado)</option>
                    <option value="8/8 (Cubierto Total / Niebla)">8/8 (Cubierto Total / Niebla)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Estado de la Superficie del Mar</label>
                  <input
                    type="text"
                    value={seaState}
                    onChange={(e) => setSeaState(e.target.value)}
                    placeholder="Ej. Ondulación suave, rugosidad capilar"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#c084fc]"
                  />
                </div>
              </div>
            )}

            {category === 'sea_ice' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Concentración de Hielo (Décimas)</label>
                  <select
                    value={iceConcentration}
                    onChange={(e) => setIceConcentration(e.target.value)}
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#38bdf8]"
                  >
                    <option value="1/10 - 2/10 (Agua abierta con hielo disperso)">1-2/10 (Agua abierta con hielo disperso)</option>
                    <option value="3/10 (Hielo muy abierto)">3/10 (Hielo muy abierto)</option>
                    <option value="5/10 (Hielo abierto intermedio)">5/10 (Hielo abierto intermedio)</option>
                    <option value="7/10 - 8/10 (Hielo cerrado)">7-8/10 (Hielo cerrado / Navegación atenta)</option>
                    <option value="9/10 - 10/10 (Hielo compacto consolidado)">9-10/10 (Hielo compacto / Banquisa)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Tipo de Hielo Marino</label>
                  <input
                    type="text"
                    value={iceType}
                    onChange={(e) => setIceType(e.target.value)}
                    placeholder="Ej. Brash ice, Nilas, Pack ice"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Témpanos / Fragmentos Relevantes</label>
                  <input
                    type="text"
                    value={icebergNotable}
                    onChange={(e) => setIcebergNotable(e.target.value)}
                    placeholder="Ej. Fragmentos de témpano tabular A-23A"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>
            )}

            {category === 'polar_fauna' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Especie Observada</label>
                  <select
                    value={faunaSpecies}
                    onChange={(e) => setFaunaSpecies(e.target.value)}
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#4ade80]"
                  >
                    <option value="Ballena Jorobada (Megaptera novaeangliae)">Ballena Jorobada</option>
                    <option value="Orca (Orcinus orca)">Orca (Orcinus orca)</option>
                    <option value="Rorcual Aliblanco / Minke">Rorcual Minke</option>
                    <option value="Foca Leopardo (Hydrurga leptonyx)">Foca Leopardo</option>
                    <option value="Foca de Weddell (Leptonychotes weddellii)">Foca de Weddell</option>
                    <option value="Pingüino Papúa (Pygoscelis papua)">Pingüino Papúa (Gentoo)</option>
                    <option value="Pingüino Barbijo (Pygoscelis antarcticus)">Pingüino Barbijo</option>
                    <option value="Albatros Errante / Petrel Gigante">Albatros / Petrel Polar</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Cantidad Estimada</label>
                  <input
                    type="text"
                    value={faunaCount}
                    onChange={(e) => setFaunaCount(e.target.value)}
                    placeholder="Ej. 2 adultos y 1 cría"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Comportamiento</label>
                  <input
                    type="text"
                    value={faunaBehavior}
                    onChange={(e) => setFaunaBehavior(e.target.value)}
                    placeholder="Ej. Alimentación en cardumen de krill"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
              </div>
            )}

            {category === 'oceanography_ctd' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">SST (Temp. Mar)</label>
                  <input
                    type="text"
                    value={sst}
                    onChange={(e) => setSst(e.target.value)}
                    placeholder="-1.2 °C"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#fb7185]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Temp. Aire</label>
                  <input
                    type="text"
                    value={airTemp}
                    onChange={(e) => setAirTemp(e.target.value)}
                    placeholder="0.5 °C"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#fb7185]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Viento (kts / Dir)</label>
                  <input
                    type="text"
                    value={windKts}
                    onChange={(e) => setWindKts(e.target.value)}
                    placeholder="25 kts (WNW)"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#fb7185]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Presión (hPa)</label>
                  <input
                    type="text"
                    value={baroHpa}
                    onChange={(e) => setBaroHpa(e.target.value)}
                    placeholder="988 hPa"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#fb7185]"
                  />
                </div>
              </div>
            )}

            {category === 'iaato_landing' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Sitio de Desembarco</label>
                  <input
                    type="text"
                    value={landingSite}
                    onChange={(e) => setLandingSite(e.target.value)}
                    placeholder="Ej. Neko Harbour / Port Lockroy"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#fb923c]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Pasajeros en Tierra</label>
                  <input
                    type="text"
                    value={paxCount}
                    onChange={(e) => setPaxCount(e.target.value)}
                    placeholder="Ej. 65 pax (2 tandas de Zodiac)"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#fb923c]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8faab5] uppercase block mb-1">Conformidad ASPA / Bioseguridad</label>
                  <input
                    type="text"
                    value={aspaCompliance}
                    onChange={(e) => setAspaCompliance(e.target.value)}
                    placeholder="Ej. Lavado de botas y distanciamiento 5m"
                    className="w-full bg-[#08101a] border border-[#203248] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#fb923c]"
                  />
                </div>
              </div>
            )}

            {/* QUALITATIVE FIELD NOTES */}
            <div>
              <label className="text-[10px] text-[#8faab5] uppercase block mb-1">
                Notas Cualitativas & Observaciones Científicas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe detalles de la observación de campo, condiciones visuales, calibración con sensores a bordo..."
                className="w-full bg-[#08101a] border border-[#203248] rounded-md p-2.5 text-xs text-white focus:outline-none focus:border-[#ffcc00] leading-relaxed resize-none font-mono"
              />
            </div>

            {/* OBSERVER DETAILS & SAVE BUTTON */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#8faab5]">
                <span className="text-[10px] block uppercase text-[#617b91]">Investigador:</span>
                <span className="font-semibold text-white">{observerName}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6d889b] font-mono hidden sm:inline">
                  Atajo: <kbd className="px-1.5 py-0.5 rounded bg-[#162334] border border-[#253950] text-[#a5bed3]">Ctrl+Enter</kbd>
                </span>

                <button
                  onClick={handleSaveLog}
                  className="px-5 py-2.5 rounded-xl bg-[#ffcc00] hover:bg-[#e6b800] text-black font-semibold text-xs tracking-wide uppercase flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar en Bitácora Edge
                </button>
              </div>
            </div>

            {/* FEEDBACK BANNER */}
            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 font-mono transition-all ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : feedback.type === 'error'
                    ? 'bg-red-950/60 text-red-300 border border-red-500/40'
                    : 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: MAP & RECORD HISTORY (5 cols) */}
        <section className="lg:col-span-5 space-y-4 flex flex-col">
          {/* MINI-MAP VIEWER */}
          <div className="rounded-xl overflow-hidden border border-[#1d2f44] bg-[#0b1420] shadow-md flex flex-col h-64 sm:h-72">
            <div className="px-3 py-2 bg-[#0d1826] border-b border-[#1d2f44] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#8faab5] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ffcc00]" /> Deriva y Puntos de Bitácora
              </span>
              <span className="text-[10px] font-mono text-[#627d94]">{logs.length} marcas</span>
            </div>
            <div ref={mapContainerRef} className="w-full flex-1 relative bg-[#04080e]" />
          </div>

          {/* EXPORT & SYNC TOOLBAR */}
          <div className="p-3 rounded-xl bg-[#0b1624] border border-[#1e3046] flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-[#8faab5]">
              <span className="font-bold text-white text-sm">{logs.length}</span> registros en nodo local
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSyncAll}
                title="Sincronizar con backend local"
                className="p-1.5 rounded-lg bg-[#122031] hover:bg-[#1a2c42] text-[#8faab5] hover:text-white border border-[#21354d] text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExportGeoJson}
                title="Descargar GeoJSON para QGIS o MapLibre"
                className="px-2 py-1 rounded-lg bg-[#142336] hover:bg-[#1d324d] text-[#ffcc00] border border-[#ffcc00]/30 text-xs font-mono font-medium flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> GeoJSON
              </button>

              <button
                onClick={handleExportCsv}
                title="Descargar CSV para Python / Pandas / R"
                className="px-2 py-1 rounded-lg bg-[#142336] hover:bg-[#1d324d] text-[#38bdf8] border border-[#38bdf8]/30 text-xs font-mono font-medium flex items-center gap-1"
              >
                <FileText className="w-3 h-3" /> CSV
              </button>

              <button
                onClick={handleExportMarkdown}
                title="Descargar Reporte en Markdown"
                className="px-2 py-1 rounded-lg bg-[#142336] hover:bg-[#1d324d] text-[#4ade80] border border-[#4ade80]/30 text-xs font-mono font-medium flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> MD
              </button>
            </div>
          </div>

          {/* CRUISE TIMELINE ENTRIES */}
          <div className="flex-1 rounded-xl bg-[#0b1522] border border-[#1d2f44] p-3 flex flex-col min-h-[300px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8faab5] mb-2 block">
              Historial de Observaciones a Bordo
            </span>

            {logs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-[#526d83] font-mono py-8">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <span>No hay observaciones registradas aún.</span>
                <span className="text-[10px]">Usa el formulario para crear el primer registro.</span>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-[#070e17] border border-[#1b2a3d] hover:border-[#2a405a] transition-all space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            log.category === 'vessel_sighting'
                              ? 'bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/40'
                              : log.category === 'sea_ice'
                              ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40'
                              : log.category === 'polar_fauna'
                              ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40'
                              : log.category === 'satellite_overpass'
                              ? 'bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/40'
                              : 'bg-[#fb7185]/20 text-[#fb7185] border border-[#fb7185]/40'
                          }`}
                        >
                          {log.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-[#6d889c]">
                          {log.utc.slice(11, 19)} UTC
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          title={log.synced ? 'Sincronizado con SQLite local' : 'Guardado solo en IndexedDB'}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${log.synced ? 'text-emerald-400 bg-emerald-950/40' : 'text-amber-400 bg-amber-950/40'}`}
                        >
                          {log.synced ? 'SYNC' : 'LOCAL'}
                        </span>
                        <button
                          onClick={() => deleteLog(log.id)}
                          className="text-[#516b7f] hover:text-red-400 p-0.5 transition-colors"
                          title="Eliminar observación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="font-mono text-[11px] text-[#38bdf8]">
                      [{log.latitude.toFixed(4)}°, {log.longitude.toFixed(4)}°] ±{log.accuracyM}m
                    </div>

                    <p className="text-[#b2c4d6] leading-relaxed line-clamp-2">{log.notes}</p>

                    {/* Metadata tags */}
                    {Object.keys(log.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 text-[10px] text-[#718c9f] font-mono">
                        {Object.entries(log.metadata).map(([k, v]) => (
                          <span key={k} className="px-1.5 py-0.5 rounded bg-[#101b2a] border border-[#1b2b3f]">
                            {k}: <span className="text-white">{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
