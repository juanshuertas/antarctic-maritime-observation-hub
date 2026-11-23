import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import {
  Compass,
  Map as MapIcon,
  Plus,
  BookOpen,
  Ship,
  Sparkles,
  Camera,
  MapPin,
  Check,
  X,
  Share2,
  Trash2,
  ArrowRight,
  Calendar,
  Wifi,
  Activity,
  Copy,
} from 'lucide-react';
import { offlineStore } from '../lib/offline-store';

export interface QuickSighting {
  id: string;
  category: 'whale' | 'iceberg' | 'penguin' | 'ship' | 'weather';
  title: string;
  speciesOrType: string;
  quantity: string;
  activity: string;
  notes: string;
  timestamp: string;
  timeDisplay: string;
  latitude: number;
  longitude: number;
  synced: boolean;
  vessel: string;
  photo?: string | null;
  pitch?: number | null;
  roll?: number | null;
}

const STORAGE_KEY = 'amoh_onboard_sightings_v1';

export default function OnboardAppPage() {
  // Navigation Tabs: 'HOY' (Home), 'RUTA' (Map), 'BITACORA' (My Logs), 'BUQUE' (Ship info & QR)
  const [activeTab, setActiveTab] = useState<'HOY' | 'RUTA' | 'BITACORA' | 'BUQUE'>('HOY');

  // Vessel Selection
  const [vessel, setVessel] = useState<'National Geographic Resolution' | 'ARC Simón Bolívar'>('National Geographic Resolution');

  // Quick Action Modal (Bottom Sheet)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuickSighting['category']>('whale');
  const [selectedSubtype, setSelectedSubtype] = useState('Ballena Jorobada');
  const [selectedQty, setSelectedQty] = useState('1 o 2');
  const [selectedActivity, setSelectedActivity] = useState('Navegando en superficie');
  const [customNotes, setCustomNotes] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: -64.835, lng: -62.53 });
  const [locating, setLocating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Ship Wi-Fi & LAN IP auto-discovery
  const [lanIp, setLanIp] = useState(window.location.hostname);
  const [shipWifiSsid, setShipWifiSsid] = useState('Ship-WiFi-5GHz (AMOH Offline Intranet)');
  const [onboardLanUrl, setOnboardLanUrl] = useState(new URL(`${import.meta.env.BASE_URL}onboard`, window.location.origin).href);
  const [activeDevicesCount, setActiveDevicesCount] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Inclinometer and device motion sensors (Passive Data Harvesting)
  const [sharingSensors, setSharingSensors] = useState<boolean>(() => {
    return localStorage.getItem('amoh_sensor_sharing') !== 'false';
  });
  const [pitch, setPitch] = useState<number>(-0.4);
  const [roll, setRoll] = useState<number>(1.2);
  const [heading, setHeading] = useState<number>(184);

  // Photo Capture & Client Compression
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistent Device ID for telemetry tracking
  const deviceId = useRef<() => string>(() => {
    let id = localStorage.getItem('amoh_device_id');
    if (!id) {
      id = 'dev-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('amoh_device_id', id);
    }
    return id;
  }).current();

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Clocks
  const [, setUtcTime] = useState('');
  const [shipTime, setShipTime] = useState('');

  // Sightings state
  const [sightings, setSightings] = useState<QuickSighting[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'init-1',
        category: 'whale',
        title: 'Ballenas Jorobadas en canal',
        speciesOrType: 'Ballena Jorobada (Megaptera)',
        quantity: '3 individuos (madre y cría)',
        activity: 'Alimentación y soplos visibles',
        notes: 'Avistadas a babor cerca de los acantilados de hielo.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        timeDisplay: 'Hace 2 horas',
        latitude: -64.835,
        longitude: -62.53,
        synced: true,
        vessel: 'National Geographic Resolution',
      },
      {
        id: 'init-2',
        category: 'iceberg',
        title: 'Témpano Tabular Azul',
        speciesOrType: 'Fragmento tabular de A-23A',
        quantity: '1 témpano mayor',
        activity: 'A la deriva con cuevas de erosión',
        notes: 'Color azul cobalto intenso en la línea de flotación.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        timeDisplay: 'Hace 4 horas',
        latitude: -64.4,
        longitude: -62.7,
        synced: true,
        vessel: 'National Geographic Resolution',
      },
    ];
  });

  // Map Ref for 'RUTA' tab
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Ticker for Clocks
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + ' UTC');
      const shipD = new Date(now.getTime() - 3 * 3600 * 1000);
      setShipTime(shipD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Buque');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sightings));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [sightings]);

  // Persist sensor sharing preference
  useEffect(() => {
    localStorage.setItem('amoh_sensor_sharing', sharingSensors ? 'true' : 'false');
  }, [sharingSensors]);

  // 1. Fetch Shipboard Wi-Fi Network Info & Generate Real LAN QR Code
  useEffect(() => {
    const fetchNetInfo = () => {
      fetch('http://127.0.0.1:8000/api/shipboard/ingest/network-info')
        .then((r) => r.json())
        .then((data) => {
          if (data.lan_ip) {
            setLanIp(data.lan_ip);
            setShipWifiSsid(data.ship_wifi_ssid || 'Ship-WiFi-5GHz');
            const port = window.location.port || '5174';
            const realUrl = `http://${data.lan_ip}:${port}/onboard`;
            setOnboardLanUrl(realUrl);
            setActiveDevicesCount(data.active_devices_count || 1);

            // Generate QR with real Wi-Fi IP
            QRCode.toDataURL(realUrl, {
              margin: 1.5,
              width: 260,
              color: { dark: '#0A2A4A', light: '#FFFFFF' },
            })
              .then((url) => setQrDataUrl(url))
              .catch((e) => console.warn('QR error:', e));
          }
        })
        .catch(() => {
          // Fallback if backend offline
          const fallback = `${window.location.origin}/onboard`;
          QRCode.toDataURL(fallback, {
            margin: 1.5,
            width: 260,
            color: { dark: '#0A2A4A', light: '#FFFFFF' },
          }).then((url) => setQrDataUrl(url));
        });
    };

    fetchNetInfo();
    const interval = setInterval(fetchNetInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Hardware Inclinometer & Orientation Sensors Listener (with Polar Swell Fallback)
  useEffect(() => {
    let hasHardware = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null || e.gamma !== null) {
        hasHardware = true;
        if (e.beta !== null) setPitch(+e.beta.toFixed(1));
        if (e.gamma !== null) setRoll(+e.gamma.toFixed(1));
        if (e.alpha !== null) setHeading(+e.alpha.toFixed(1));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Realistic polar swell drift for desktop/laptops without accelerometer
    const swellInterval = setInterval(() => {
      if (!hasHardware) {
        setPitch((p) => +(p + (Math.random() * 0.4 - 0.2)).toFixed(1));
        setRoll((r) => +(r + (Math.random() * 0.6 - 0.3)).toFixed(1));
        setHeading((h) => +((h + (Math.random() * 0.6 - 0.3) + 360) % 360).toFixed(1));
      }
    }, 2500);

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      clearInterval(swellInterval);
    };
  }, []);

  // 3. Batch Mobile Sensor Telemetry to Shipboard Edge Node
  useEffect(() => {
    if (!sharingSensors) return;

    const interval = setInterval(() => {
      const sample = {
        device_id: deviceId,
        timestamp: Date.now() / 1000,
        pitch_deg: pitch,
        roll_deg: roll,
        heading: heading,
        latitude: userCoords.lat,
        longitude: userCoords.lng,
      };

      fetch('http://127.0.0.1:8000/api/shipboard/ingest/telemetry-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          client_time: Date.now() / 1000,
          samples: [sample],
        }),
      }).catch(() => {
        // buffered offline
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [sharingSensors, pitch, roll, heading, userCoords, deviceId]);

  // Detect GPS on load or when modal opens
  const refreshLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        // Default polar cruise location in Gerlache Strait
        setUserCoords({ lat: -64.835, lng: -62.53 });
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  // Open Quick Log Modal
  const openQuickLog = (cat: QuickSighting['category']) => {
    setSelectedCategory(cat);
    if (cat === 'whale') {
      setSelectedSubtype('Ballena Jorobada');
      setSelectedActivity('Navegando en superficie');
    } else if (cat === 'iceberg') {
      setSelectedSubtype('Témpano Tabular Azul');
      setSelectedActivity('A la deriva con growlers');
    } else if (cat === 'penguin') {
      setSelectedSubtype('Pingüino Papúa (Gentoo)');
      setSelectedActivity('Nadando / Porpoising');
    } else if (cat === 'ship') {
      setSelectedSubtype('Buque de Expedición / Científico');
      setSelectedActivity('Navegando rumbo sur');
    } else {
      setSelectedSubtype('Cielo Despejado Polar');
      setSelectedActivity('Mar calma / Ventolera');
    }
    setSelectedQty('1 o 2');
    setCustomNotes('');
    setPhotoBase64(null);
    refreshLocation();
    setModalOpen(true);
  };

  // Client-Side Canvas Image Downsampling (Max 1000px, JPEG 0.72) for Shipboard Wi-Fi
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          setPhotoBase64(compressed);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Sighting Action
  const handleSaveSighting = async () => {
    const titlesMap: Record<QuickSighting['category'], string> = {
      whale: `Avistamiento de ${selectedSubtype}`,
      iceberg: `Iceberg: ${selectedSubtype}`,
      penguin: `Pingüinos: ${selectedSubtype}`,
      ship: `Buque a la vista: ${selectedSubtype}`,
      weather: `Condición Polar: ${selectedSubtype}`,
    };

    const newSighting: QuickSighting = {
      id: crypto.randomUUID(),
      category: selectedCategory,
      title: titlesMap[selectedCategory],
      speciesOrType: selectedSubtype,
      quantity: selectedQty,
      activity: selectedActivity,
      notes: customNotes.trim() || `${selectedSubtype} observado en navegación.`,
      timestamp: new Date().toISOString(),
      timeDisplay: 'Justo ahora',
      latitude: userCoords.lat,
      longitude: userCoords.lng,
      synced: false,
      vessel,
      photo: photoBase64,
      pitch,
      roll,
    };

    // Update state immediately
    setSightings((prev) => [newSighting, ...prev]);
    setModalOpen(false);

    // Confetti celebration!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FFCC00', '#00E5FF', '#FFFFFF', '#38BDF8'],
      });
    } catch {
      // ignore
    }

    // 1. Post to High-Speed Shipboard Mobile Ingestion Endpoint (Wi-Fi Local)
    try {
      await fetch('http://127.0.0.1:8000/api/shipboard/ingest/sighting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          title: newSighting.title,
          species_or_type: selectedSubtype,
          quantity: selectedQty,
          activity: selectedActivity,
          notes: newSighting.notes,
          latitude: userCoords.lat,
          longitude: userCoords.lng,
          vessel,
          observer_name: 'Pasajero a Bordo (Cubierta)',
          photo_base64: photoBase64,
          pitch_deg: pitch,
          roll_deg: roll,
        }),
      });
      newSighting.synced = true;
      setSightings((prev) => prev.map((s) => (s.id === newSighting.id ? { ...s, synced: true } : s)));
    } catch {
      // Offline fallback
    }

    // 2. Save in IndexedDB offline store (zero data loss guarantee)
    try {
      await offlineStore.save({
        observation_type: selectedCategory === 'whale' ? 'polar_fauna' : selectedCategory === 'iceberg' ? 'sea_ice' : selectedCategory === 'ship' ? 'vessel_sighting' : 'general_field',
        evidence_class: 'onboard_app',
        utc: newSighting.timestamp,
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        position_source: 'smartphone_gps',
        accuracy_m: 10,
        observer_type: 'onboard_passenger',
        source_name: `App a Bordo (${vessel})`,
        notes: JSON.stringify(newSighting),
      });
    } catch (e) {
      console.warn('OfflineStore save notice:', e);
    }

    // Reset draft photo
    setPhotoBase64(null);

    setSuccessToast(`¡Avistamiento registrado en la bitácora del barco! 🚢`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Initialize Map in 'RUTA' tab
  useEffect(() => {
    if (activeTab !== 'RUTA' || !mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'esri-ocean': {
              type: 'raster',
              tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: '© Esri Ocean Base',
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
        center: [-64.5, -60.0],
        zoom: 4.5,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;

      map.on('load', () => {
        if (!map.getSource('route-ushuaia-drake')) {
          map.addSource('route-ushuaia-drake', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-68.303, -54.807], // Ushuaia
                  [-67.500, -54.950], // Canal Beagle
                  [-67.270, -55.980], // Cabo de Hornos
                  [-64.000, -58.500], // Drake Central
                  [-58.960, -62.200], // Shetland del Sur
                  [-60.570, -62.970], // Bransfield
                  [-62.530, -64.400], // Gerlache
                  [-62.550, -64.840], // Neko Harbour
                ],
              },
            },
          });
          map.addLayer({
            id: 'route-ushuaia-drake-line',
            type: 'line',
            source: 'route-ushuaia-drake',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffcc00',
              'line-width': 3,
              'line-dasharray': [3, 1],
            },
          });
        }
      });
    }

    // Refresh markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add Ushuaia marker
    const ushEl = document.createElement('div');
    ushEl.className = 'w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-xl border-2 border-[#ffcc00] bg-[#0c1e30] cursor-pointer';
    ushEl.innerText = '🇦🇷';
    const ushMarker = new maplibregl.Marker({ element: ushEl })
      .setLngLat([-68.303, -54.807])
      .setPopup(
        new maplibregl.Popup({ offset: 16 }).setHTML(`
          <div style="font-family:sans-serif;color:#0f172a;padding:4px;font-size:12px;line-height:1.4;">
            <strong style="color:#0f172a;">🇦🇷 Puerto de Ushuaia</strong><br/>
            <span style="color:#d97706;font-size:10px;">Punto de Zarpe</span>
          </div>
        `)
      )
      .addTo(mapRef.current!);
    markersRef.current.push(ushMarker);

    sightings.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-xl border-2 border-white cursor-pointer transition-transform hover:scale-125';
      const bg =
        s.category === 'whale'
          ? '#0284c7'
          : s.category === 'iceberg'
          ? '#06b6d4'
          : s.category === 'penguin'
          ? '#10b981'
          : s.category === 'ship'
          ? '#f59e0b'
          : '#8b5cf6';
      el.style.backgroundColor = bg;
      el.innerText =
        s.category === 'whale'
          ? '🐋'
          : s.category === 'iceberg'
          ? '🧊'
          : s.category === 'penguin'
          ? '🐧'
          : s.category === 'ship'
          ? '🚢'
          : '⛅';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([s.longitude, s.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 16 }).setHTML(`
            <div style="font-family:sans-serif;color:#0f172a;padding:4px;font-size:12px;line-height:1.4;">
              <strong style="color:#0284c7;">${s.title}</strong><br/>
              <span>${s.quantity}</span><br/>
              <em>"${s.notes}"</em><br/>
              <span style="font-size:10px;color:#64748b;">${new Date(s.timestamp).toLocaleTimeString()}</span>
            </div>
          `)
        )
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    return () => {
      // keep instance alive or cleanup on unmount
    };
  }, [activeTab, sightings]);

  const removeSighting = (id: string) => {
    setSightings((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#07131e] text-[#f1f5f9] flex flex-col items-center justify-start select-none font-sans antialiased pb-20">
      {/* PHONE-WIDTH FRAME CONTAINER (MAX 440PX) */}
      <div className="w-full max-w-md min-h-screen bg-[#0a1827] flex flex-col shadow-2xl relative border-x border-[#1a2c3f]/50">
        {/* 1. CRUISE TOP APP BAR (Royal Caribbean Style) */}
        <header className="bg-gradient-to-b from-[#0e2238] to-[#0a1827] border-b border-[#1b2f44] px-4 pt-3 pb-3 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00] animate-pulse" />
              <div>
                <div className="text-[10px] tracking-widest uppercase font-mono text-[#ffcc00] font-semibold">
                  AMOH COMPANION
                </div>
                <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>{vessel.split(' ')[0]}</span>
                  <span className="text-xs font-normal text-[#94a9be]">
                    {vessel.includes('Resolution') ? 'Resolution' : 'Bolívar'}
                  </span>
                </h1>
              </div>
            </div>

            {/* Quick Share / QR Button */}
            <button
              onClick={() => setQrModalOpen(true)}
              className="p-2 rounded-xl bg-[#14263b] hover:bg-[#1d3552] border border-[#233f61] text-[#93b3d2] hover:text-white transition-all flex items-center gap-1.5 text-xs"
              title="Compartir por QR para abrir en celular"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ffcc00]" />
              <span className="text-[11px] font-mono">QR</span>
            </button>
          </div>

          {/* Cruise Leg Status Bar */}
          <div className="mt-2.5 p-2 rounded-xl bg-[#0e1d2e] border border-[#1b2d42] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#e2e8f0]">
              <Compass className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span className="font-medium text-[11px]">Día 3 · Zarpe Ushuaia ➔ Estrecho de Gerlache</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px] text-[#8fa7be]">
              <span className="text-[#ffcc00] font-semibold">-1.2°C ⛅</span>
              <span>18 kts SW</span>
              <span>{shipTime}</span>
            </div>
          </div>
        </header>

        {/* 2. BODY CONTENT PER TAB */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* TAB 1: HOY (HOME / CRUISE FEED) */}
          {activeTab === 'HOY' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Shipboard Wi-Fi & Live Sensor Mesh Badge */}
              <div className="p-3 rounded-2xl bg-[#081827] border border-[#1b3b5c] flex items-center justify-between text-xs font-mono shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-[#00e5ff]" />
                      <span>{shipWifiSsid}</span>
                    </div>
                    <div className="text-[10px] text-[#8fa7be]">
                      IP Buque: {lanIp} · {activeDevicesCount} Móviles en Red
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    100% Offline
                  </span>
                </div>
              </div>

              {/* Hero Banner: Mi Día en la Antártida */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c2e4e] via-[#0a233b] to-[#071728] p-4 border border-[#204369] shadow-lg">
                <div className="relative z-10 space-y-1.5">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffcc00]/20 text-[#ffcc00] text-[10px] font-semibold tracking-wider uppercase border border-[#ffcc00]/40">
                    <Sparkles className="w-3 h-3" /> Antártida Hoy
                  </div>
                  <h2 className="text-base font-bold text-white leading-snug">
                    ¿Qué ves desde la cubierta?
                  </h2>
                  <p className="text-xs text-[#b3c9de] leading-relaxed">
                    Registra cualquier avistamiento en 1 toque. Tu reporte se sincroniza con los científicos a bordo.
                  </p>
                </div>
              </div>

              {/* 1-TAP QUICK SIGHTING BUTTONS (BIG TACTILE CARDS) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#8fa5bb] uppercase tracking-wider">
                    Registrar en 1 Toque
                  </span>
                  <span className="text-[10px] font-mono text-[#00e5ff]">5 Segundos</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Whales */}
                  <button
                    onClick={() => openQuickLog('whale')}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-[#112940] to-[#0d1e30] border border-[#203f62] hover:border-[#38bdf8] text-left transition-all active:scale-95 shadow-md group flex flex-col justify-between h-24"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl group-hover:scale-110 transition-transform">🐋</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] font-mono">Fauna</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Ballena o Foca</div>
                      <div className="text-[10px] text-[#8fa7be]">Soplos, colas, saltos</div>
                    </div>
                  </button>

                  {/* Iceberg */}
                  <button
                    onClick={() => openQuickLog('iceberg')}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-[#0f2c3b] to-[#0c202d] border border-[#1d475c] hover:border-[#00e5ff] text-left transition-all active:scale-95 shadow-md group flex flex-col justify-between h-24"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl group-hover:scale-110 transition-transform">🧊</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] font-mono">Hielo</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Iceberg o Hielo</div>
                      <div className="text-[10px] text-[#8fa7be]">Témpanos, growlers</div>
                    </div>
                  </button>

                  {/* Penguins */}
                  <button
                    onClick={() => openQuickLog('penguin')}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-[#122e2b] to-[#0c2220] border border-[#1d4f48] hover:border-[#34d399] text-left transition-all active:scale-95 shadow-md group flex flex-col justify-between h-24"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl group-hover:scale-110 transition-transform">🐧</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#34d399]/20 text-[#34d399] font-mono">Colonias</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Pingüinos</div>
                      <div className="text-[10px] text-[#8fa7be]">Papúa, barbijo, hielo</div>
                    </div>
                  </button>

                  {/* Other Ship */}
                  <button
                    onClick={() => openQuickLog('ship')}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-[#2e2614] to-[#20190c] border border-[#5c491b] hover:border-[#ffcc00] text-left transition-all active:scale-95 shadow-md group flex flex-col justify-between h-24"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl group-hover:scale-110 transition-transform">🚢</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffcc00]/20 text-[#ffcc00] font-mono">Naves</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Otro Barco</div>
                      <div className="text-[10px] text-[#8fa7be]">Crucero, pesquero</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Crowdsourced Sensor Telemetry Card (Inclinometer & Wave-Motion) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0c243b] to-[#091b2c] border border-[#1e4268] space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#ffcc00] animate-pulse" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Inclinómetro & Sensores del Móvil
                      </h3>
                      <p className="text-[10px] text-[#8fa7be]">Aporte colectivo a la ciencia de a bordo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSharingSensors(!sharingSensors)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                      sharingSensors
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {sharingSensors ? '✓ Compartiendo' : 'Pausado'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 rounded-xl bg-[#061422] border border-[#142e47]">
                    <div className="text-[9px] text-[#8fa7be] uppercase">Rolido (Roll)</div>
                    <div className="text-xs font-bold text-[#00e5ff] mt-0.5">
                      {roll > 0 ? `+${roll}°` : `${roll}°`}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#061422] border border-[#142e47]">
                    <div className="text-[9px] text-[#8fa7be] uppercase">Cabeceo (Pitch)</div>
                    <div className="text-xs font-bold text-[#ffcc00] mt-0.5">
                      {pitch > 0 ? `+${pitch}°` : `${pitch}°`}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#061422] border border-[#142e47]">
                    <div className="text-[9px] text-[#8fa7be] uppercase">Brújula / Proa</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {Math.round(heading)}° {heading > 150 && heading < 210 ? 'S' : 'SW'}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-[#7192b0] leading-tight">
                  Tu teléfono mide el balanceo y oleaje del buque de forma anónima, alimentando el modelo hidrodinámico en el Science Hub.
                </p>
              </div>

              {/* ACTIVIDADES CIENTÍFICAS DE HOY (Royal Caribbean Cruise Compass) */}
              <div className="p-3.5 rounded-2xl bg-[#0c1a29] border border-[#1d3148] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5 text-[#ffcc00]" />
                    <span>Agenda a Bordo</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8fa3b7]">Hoy</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#112338] border border-[#1d3856] flex items-start gap-2.5">
                    <span className="font-mono text-[11px] text-[#00e5ff] font-semibold shrink-0">11:30</span>
                    <div>
                      <div className="font-semibold text-white">Charla: Match-up Satelital & Radar SAR</div>
                      <div className="text-[11px] text-[#8fa7be]">
                        Por Juan Sebastian Huertas (Visiting Scientist) en Lounge Principal.
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#112338] border border-[#1d3856] flex items-start gap-2.5">
                    <span className="font-mono text-[11px] text-[#ffcc00] font-semibold shrink-0">14:00</span>
                    <div>
                      <div className="font-semibold text-white">Desembarco en Zodiac — Neko Harbour</div>
                      <div className="text-[11px] text-[#8fa7be]">
                        Operación en tierra y avistamiento de colonias de pingüinos papúa.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ÚLTIMOS AVISTAMIENTOS COMPARTIDOS */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#8fa5bb] uppercase tracking-wider">
                    Avistamientos Recientes a Bordo
                  </span>
                  <button
                    onClick={() => setActiveTab('BITACORA')}
                    className="text-[10px] text-[#38bdf8] flex items-center gap-0.5 hover:underline"
                  >
                    Ver todos ({sightings.length}) <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {sightings.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#0c1a29] border border-[#1c3046] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">
                          {item.category === 'whale'
                            ? '🐋'
                            : item.category === 'iceberg'
                            ? '🧊'
                            : item.category === 'penguin'
                            ? '🐧'
                            : item.category === 'ship'
                            ? '🚢'
                            : '⛅'}
                        </span>
                        <div>
                          <div className="font-semibold text-white text-[11px]">{item.title}</div>
                          <div className="text-[10px] text-[#8fa5bb]">{item.quantity} · {item.timeDisplay}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        {item.synced ? 'GUARDADO' : 'LOCAL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RUTA (INTERACTIVE MOBILE MAP) */}
          {activeTab === 'RUTA' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Derrota del Buque</h2>
                  <p className="text-[11px] text-[#8fa5bb]">Posición y avistamientos en el mapa polar</p>
                </div>
                <div className="text-[10px] font-mono text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                  {sightings.length} Puntos
                </div>
              </div>

              {/* Map Container */}
              <div className="rounded-2xl overflow-hidden border border-[#223b57] bg-[#08121d] h-96 relative shadow-inner">
                <div ref={mapContainerRef} className="w-full h-full" />
                <div className="absolute bottom-2 left-2 right-2 bg-[#0c1a29]/90 backdrop-blur-md rounded-xl p-2 border border-[#1d3148] flex items-center justify-between text-[10px] font-mono text-[#94a9be]">
                  <span>📍 Zarpe Ushuaia ➔ Drake ➔ Gerlache</span>
                  <span className="text-[#ffcc00] font-semibold">Ruta Completa</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0c1a29] border border-[#1d3148] text-xs text-[#94a9be] space-y-1">
                <div className="font-semibold text-white">ℹ️ Leyenda de Avistamientos y Ruta:</div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span>🇦🇷 Zarpe Ushuaia</span>
                  <span>🐋 Ballena</span>
                  <span>🧊 Iceberg</span>
                  <span>🐧 Pingüinos</span>
                  <span>🚢 Buque</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BITÁCORA (MY LOGS LIST) */}
          {activeTab === 'BITACORA' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Mi Bitácora Polar</h2>
                  <p className="text-[11px] text-[#8fa5bb]">{sightings.length} registros guardados en tu teléfono</p>
                </div>

                <button
                  onClick={() => openQuickLog('whale')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#ffcc00] text-black font-semibold text-xs flex items-center gap-1 shadow-md active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuevo
                </button>
              </div>

              {sightings.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#6e859b] space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto opacity-40" />
                  <p>Aún no tienes registros guardados.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sightings.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-[#0c1a29] border border-[#1c3046] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {s.category === 'whale'
                              ? '🐋'
                              : s.category === 'iceberg'
                              ? '🧊'
                              : s.category === 'penguin'
                              ? '🐧'
                              : s.category === 'ship'
                              ? '🚢'
                              : '⛅'}
                          </span>
                          <div>
                            <div className="font-semibold text-white">{s.title}</div>
                            <div className="text-[10px] text-[#8fa5bb] font-mono">
                              {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · [{s.latitude.toFixed(2)}°, {s.longitude.toFixed(2)}°]
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeSighting(s.id)}
                          className="text-[#64748b] hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Photo Thumbnail if captured */}
                      {s.photo && (
                        <div className="rounded-xl overflow-hidden border border-[#1b344d] max-h-48 bg-black/40">
                          <img src={s.photo} alt={s.title} className="w-full h-36 object-cover" />
                        </div>
                      )}

                      <div className="p-2 rounded-lg bg-[#07131e] text-[11px] text-[#cbd5e1] leading-relaxed">
                        "{s.notes}"
                      </div>

                      {/* Inclinometer readings at time of sighting */}
                      {s.pitch !== undefined && s.pitch !== null && (
                        <div className="text-[10px] font-mono text-[#00e5ff] flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-[#ffcc00]" />
                          <span>
                            Inclinómetro: Rolido {s.roll && s.roll > 0 ? `+${s.roll}°` : `${s.roll}°`} · Cabeceo {s.pitch && s.pitch > 0 ? `+${s.pitch}°` : `${s.pitch}°`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-[#7893a7]">
                        <span>Cantidad: <strong className="text-white">{s.quantity}</strong></span>
                        <span className="font-mono text-emerald-400">
                          {s.synced ? '✓ En nodo de a bordo' : '💾 Guardado local'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BUQUE (SHIP INFO & QR SHARING) */}
          {activeTab === 'BUQUE' && (
            <div className="space-y-3.5 animate-in fade-in duration-200 text-xs">
              <div>
                <h2 className="text-sm font-bold text-white">El Buque & Red Local</h2>
                <p className="text-[11px] text-[#8fa5bb]">Configuración del nodo local de la expedición y red Wi-Fi</p>
              </div>

              {/* Vessel Switcher */}
              <div className="p-3.5 rounded-2xl bg-[#0c1a29] border border-[#1d3148] space-y-2">
                <span className="text-[10px] font-bold text-[#8fa5bb] uppercase tracking-wider block">
                  Plataforma Activa:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVessel('National Geographic Resolution')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      vessel === 'National Geographic Resolution'
                        ? 'bg-[#ffcc00]/15 border-[#ffcc00] text-white'
                        : 'bg-[#102235] border-[#1d354f] text-[#8fa5bb]'
                    }`}
                  >
                    <div className="font-semibold text-xs">NG Resolution</div>
                    <div className="text-[9px] text-[#ffcc00]">Visiting Scientist</div>
                  </button>

                  <button
                    onClick={() => setVessel('ARC Simón Bolívar')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      vessel === 'ARC Simón Bolívar'
                        ? 'bg-[#00e5ff]/15 border-[#00e5ff] text-white'
                        : 'bg-[#102235] border-[#1d354f] text-[#8fa5bb]'
                    }`}
                  >
                    <div className="font-semibold text-xs">ARC Simón Bolívar</div>
                    <div className="text-[9px] text-[#00e5ff]">PAC Colombia</div>
                  </button>
                </div>
              </div>

              {/* Wi-Fi & LAN Network Status Card */}
              <div className="p-3.5 rounded-2xl bg-[#0c1a29] border border-[#1d3148] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-[#00e5ff]" />
                    <span className="font-bold text-white text-xs">Red Wi-Fi del Buque</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                    100% Offline
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] text-[#8fa5bb] bg-[#07131e] p-2.5 rounded-xl border border-[#162a3f]">
                  <div className="flex justify-between">
                    <span>SSID Wi-Fi:</span>
                    <strong className="text-white">{shipWifiSsid}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>IP Servidor LAN:</span>
                    <strong className="text-[#ffcc00]">{lanIp}:5174</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Móviles Conectados:</span>
                    <strong className="text-emerald-400">{activeDevicesCount} dispositivo(s)</strong>
                  </div>
                </div>
              </div>

              {/* QR Code Share Card (Rule 22 Compliant LAN IP) */}
              <div className="p-4 rounded-2xl bg-[#0c1a29] border border-[#1d3148] text-center space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Escanea para unirte desde tu celular
                </div>
                <p className="text-[11px] text-[#8fa5bb]">
                  Cualquier persona conectada a la red Wi-Fi local del barco puede usar esta app sin necesidad de internet satelital.
                </p>

                {qrDataUrl && (
                  <div className="inline-block p-3 bg-white rounded-2xl shadow-xl">
                    <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 mx-auto" />
                  </div>
                )}

                <div className="flex items-center justify-center gap-2">
                  <div className="font-mono text-[11px] text-[#ffcc00] bg-[#112338] py-1.5 px-3 rounded-lg border border-[#1d3856] truncate max-w-[220px]">
                    {onboardLanUrl}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(onboardLanUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-[#14263b] hover:bg-[#1f3856] text-[#8fa5bb] hover:text-white border border-[#234368] transition-colors"
                    title="Copiar enlace"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Edge Node & Scientist Provenance */}
              <div className="p-3 rounded-xl bg-[#0c1a29] border border-[#1d3148] space-y-1.5 text-[11px] text-[#8fa5bb]">
                <div className="flex items-center justify-between">
                  <span>Modo Edge Node:</span>
                  <span className="text-emerald-400 font-mono font-bold">100% Offline Activo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Base de datos:</span>
                  <span className="text-white font-mono">DuckDB + IndexedDB + SQLite</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Investigador:</span>
                  <span className="text-white">Juan Sebastian Huertas Olea</span>
                </div>
              </div>

              {/* Link to Science Hub Wall & Full Desktop Observatory */}
              <div className="pt-2 space-y-2">
                <Link
                  to="/science-hub"
                  className="block w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ffcc00] to-[#ffa600] text-center text-xs font-bold text-black border border-[#ffcc00] shadow-md transition-all active:scale-98"
                >
                  🖥️ Ver Science Hub Wall (Pantalla Gigante del Barco)
                </Link>
                <Link
                  to="/observatory"
                  className="block w-full py-2.5 px-4 rounded-xl bg-[#14263b] hover:bg-[#1f3856] text-center text-xs font-semibold text-[#38bdf8] border border-[#234368] transition-colors"
                >
                  Ir al Observatorio Cartográfico Completo
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 3. TACTILE BOTTOM SHEET MODAL (5-SECOND SIGHTING REGISTRATION) */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-[#0a1b2d] border-t sm:border border-[#1e3a5a] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#1b2f44] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {selectedCategory === 'whale'
                      ? '🐋'
                      : selectedCategory === 'iceberg'
                      ? '🧊'
                      : selectedCategory === 'penguin'
                      ? '🐧'
                      : selectedCategory === 'ship'
                      ? '🚢'
                      : '⛅'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                      Registrar Avistamiento
                    </h3>
                    <p className="text-[10px] text-[#8fa5bb] font-mono">Detección automática de posición</p>
                  </div>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full bg-[#132336] text-[#8fa5bb] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Subtype selector pills */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#8fa5bb] tracking-wider block">
                  ¿Qué estás viendo?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedCategory === 'whale'
                    ? ['Ballena Jorobada', 'Orca', 'Ballena Minke', 'Foca Leopardo', 'Foca de Weddell']
                    : selectedCategory === 'iceberg'
                    ? ['Témpano Tabular Azul', 'Fragmento A-23A', 'Growlers flotantes', 'Banquisa cerrada']
                    : selectedCategory === 'penguin'
                    ? ['Pingüino Papúa (Gentoo)', 'Pingüino Barbijo', 'Pingüino Adelia', 'Albatros Errante']
                    : selectedCategory === 'ship'
                    ? ['Crucero de Expedición', 'Buque Polar Científico', 'Pesquero Factoría', 'Patrulla Naval']
                    : ['Cielo Despejado', 'Niebla Polar Cerrada', 'Nevada Intensa', 'Viento Fuerte']
                  ).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedSubtype(option)}
                      className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                        selectedSubtype === option
                          ? 'bg-[#ffcc00] text-black border-[#ffcc00] font-semibold'
                          : 'bg-[#102338] text-[#cbd5e1] border-[#1d3856] hover:bg-[#162d47]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity selector pills */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#8fa5bb] tracking-wider block">
                  ¿Cuántos observas?
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['1 solo', '2 a 5', '6 a 15', 'Manada / Muchos'].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setSelectedQty(qty)}
                      className={`text-xs py-1.5 rounded-xl border text-center transition-all ${
                        selectedQty === qty
                          ? 'bg-[#00e5ff] text-black border-[#00e5ff] font-semibold'
                          : 'bg-[#102338] text-[#cbd5e1] border-[#1d3856]'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & Inclinometer Badge */}
              <div className="p-2.5 rounded-xl bg-[#091522] border border-[#1b2f46] space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#38bdf8]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>[{userCoords.lat.toFixed(3)}°, {userCoords.lng.toFixed(3)}°]</span>
                  </div>
                  <button
                    onClick={refreshLocation}
                    disabled={locating}
                    className="text-[10px] text-[#ffcc00] hover:underline"
                  >
                    {locating ? 'GPS...' : 'Actualizar GPS'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#8fa7be] border-t border-[#13283f] pt-1">
                  <span>📐 Inclinómetro Móvil:</span>
                  <span className="text-[#00e5ff]">
                    Rolido {roll > 0 ? `+${roll}°` : `${roll}°`} · Cabeceo {pitch > 0 ? `+${pitch}°` : `${pitch}°`}
                  </span>
                </div>
              </div>

              {/* Photo Attachment (Optimized for Mobile Camera & Local Shipboard Wi-Fi) */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#8fa5bb] tracking-wider block">
                  Foto / Evidencia Visual (Cámara del Celular):
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                {photoBase64 ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#1e446d] bg-black/40 group">
                    <img src={photoBase64} alt="Evidencia capturada" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoBase64(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 shadow-lg flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] text-emerald-400 font-mono">
                      ✓ Comprimida en dispositivo para Wi-Fi del buque
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#1e446d] bg-[#0c1f33]/60 hover:bg-[#122b46] text-[#38bdf8] hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#ffcc00]" />
                    <span>Tomar Foto con Cámara o Adjuntar Archivo</span>
                  </button>
                )}
              </div>

              {/* Optional Field Note */}
              <div>
                <label className="text-[10px] uppercase font-bold text-[#8fa5bb] tracking-wider block mb-1">
                  Nota rápida o detalle (opcional):
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Ej. Visto a babor a unos 200 metros..."
                  className="w-full bg-[#08121d] border border-[#1d3856] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffcc00]"
                />
              </div>

              {/* Big Action Save Button */}
              <button
                onClick={handleSaveSighting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ffcc00] to-[#ffa600] text-black font-bold text-sm tracking-wide uppercase shadow-lg shadow-[#ffcc00]/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                Guardar en la Bitácora del Barco
              </button>
            </div>
          </div>
        )}

        {/* 4. SUCCESS TOAST ALERT */}
        {successToast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{successToast}</span>
          </div>
        )}

        {/* 5. SHARE QR MODAL */}
        {qrModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-[#0b1c2e] border border-[#1d3b5c] rounded-3xl p-5 text-center space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Compartir con Celulares
                </span>
                <button
                  onClick={() => setQrModalOpen(false)}
                  className="p-1 rounded-full bg-[#13263b] text-[#8fa5bb] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-[#8fa5bb]">
                Abre la cámara de tu smartphone para usar la app mientras caminas por la cubierta:
              </p>

              {qrDataUrl && (
                <div className="p-3 bg-white rounded-2xl inline-block shadow-md">
                  <img src={qrDataUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
                </div>
              )}

              <div className="flex items-center justify-center gap-2">
                <div className="text-[10px] font-mono text-[#ffcc00] bg-[#07131e] py-1 px-2.5 rounded-lg border border-[#1a3450] truncate max-w-[200px]">
                  {onboardLanUrl}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(onboardLanUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="p-1 rounded-lg bg-[#14263b] text-[#8fa5bb] hover:text-white border border-[#234368]"
                  title="Copiar"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. CRUISE BOTTOM NAVIGATION BAR (ROYAL CARIBBEAN STYLE) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 h-16 bg-[#081523]/95 backdrop-blur-xl border-t border-[#1b3149] flex items-center justify-around px-2 select-none shadow-2xl">
          {/* Tab Hoy */}
          <button
            onClick={() => setActiveTab('HOY')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'HOY' ? 'text-[#ffcc00]' : 'text-[#8fa3ba] hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium mt-0.5">Hoy</span>
          </button>

          {/* Tab Ruta */}
          <button
            onClick={() => setActiveTab('RUTA')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'RUTA' ? 'text-[#00e5ff]' : 'text-[#8fa3ba] hover:text-white'
            }`}
          >
            <MapIcon className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium mt-0.5">Ruta</span>
          </button>

          {/* Center Prominent Float Button: 1-Tap Log */}
          <button
            onClick={() => openQuickLog('whale')}
            className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
            aria-label="Registrar Avistamiento"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#ffcc00] to-[#ff9900] text-black flex items-center justify-center shadow-lg shadow-[#ffcc00]/30 group-hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-7 h-7 stroke-[2.8]" />
            </div>
            <span className="text-[10px] font-bold text-[#ffcc00] mt-1 tracking-tight">
              Registrar
            </span>
          </button>

          {/* Tab Bitácora */}
          <button
            onClick={() => setActiveTab('BITACORA')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'BITACORA' ? 'text-[#34d399]' : 'text-[#8fa3ba] hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium mt-0.5">Bitácora</span>
          </button>

          {/* Tab Buque */}
          <button
            onClick={() => setActiveTab('BUQUE')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'BUQUE' ? 'text-[#c084fc]' : 'text-[#8fa3ba] hover:text-white'
            }`}
          >
            <Ship className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium mt-0.5">Buque</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
