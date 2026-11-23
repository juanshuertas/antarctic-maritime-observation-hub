import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import QRCode from 'qrcode';
import {
  Compass,
  Radio,
  Wind,
  Thermometer,
  Waves,
  Maximize2,
  Minimize2,
  Activity,
  Eye,
  Globe2,
  Volume2,
  VolumeX,
  Smartphone,
  Wifi,
} from 'lucide-react';

interface LiveSighting {
  id: string;
  category: 'whale' | 'iceberg' | 'penguin' | 'ship';
  speciesOrType: string;
  locationName: string;
  count: string;
  details: string;
  timeAgo: string;
  lat: number;
  lng: number;
  reporter: string;
  isNew?: boolean;
  photo_base64?: string | null;
  pitch_deg?: number | null;
  roll_deg?: number | null;
}

export default function ScienceHubWallPage() {
  const [vessel, setVessel] = useState<'National Geographic Resolution' | 'ARC Simón Bolívar'>('National Geographic Resolution');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'ICE' | 'FAUNA' | 'RADAR'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Ship Wi-Fi & LAN IP auto-discovery
  const [lanIp, setLanIp] = useState('127.0.0.1');
  const [shipWifiSsid, setShipWifiSsid] = useState('Ship-WiFi-5GHz (AMOH Intranet)');
  const [activeMobileDevices, setActiveMobileDevices] = useState(2);
  const [crowdsourcedMotion, setCrowdsourcedMotion] = useState({
    avg_roll_deg: 1.4,
    avg_pitch_deg: -0.6,
    total_nodes: 2,
    sea_slamming_risk: 'BAJO (Mar en Calma)',
  });

  // QR for cellphones
  const [qrUrl, setQrUrl] = useState<string>('');

  // Clocks
  const [utcTime, setUtcTime] = useState('');
  const [shipTime, setShipTime] = useState('');

  // Live sightings stream (simulated real-time WebSocket or local store)
  const [sightings, setSightings] = useState<LiveSighting[]>([
    {
      id: 's-1',
      category: 'whale',
      speciesOrType: 'Ballenas Jorobadas (Megaptera)',
      locationName: 'Estrecho de Gerlache · Babor 200m',
      count: '3 individuos (madre y ballenato)',
      details: 'Soplos visibles constantes y saltos con aleta pectoral blanca.',
      timeAgo: 'Hace 3 min',
      lat: -64.835,
      lng: -62.53,
      reporter: 'Cubierta de Observación 7 (Pasajero)',
      isNew: true,
    },
    {
      id: 's-2',
      category: 'iceberg',
      speciesOrType: 'Témpano Tabular Azul (A-23A frg.)',
      locationName: 'Canal Schollaert',
      count: '1 tabular mayor (~450m)',
      details: 'Paredes verticales de 40m de altura libre y cuevas marinas basales.',
      timeAgo: 'Hace 18 min',
      lat: -64.4,
      lng: -62.75,
      reporter: 'Oficial de Guardia (Puente)',
    },
    {
      id: 's-3',
      category: 'penguin',
      speciesOrType: 'Pingüino Papúa (Pygoscelis papua)',
      locationName: 'Punta Portal / Neko',
      count: 'Colonia ~120 nidos',
      details: 'Alimentación activa en aguas someras con saltos sincronizados.',
      timeAgo: 'Hace 42 min',
      lat: -64.84,
      lng: -62.55,
      reporter: 'Equipo de Expedición Zodiac 3',
    },
    {
      id: 's-4',
      category: 'ship',
      speciesOrType: 'ARC Simón Bolívar (Colombia)',
      locationName: 'Bahía Fildes / King George',
      count: 'Buque Polar de Investigación',
      details: 'Coincidencia visual 100% con transpondedor AIS. Maniobra CTD.',
      timeAgo: 'Hace 1 hora',
      lat: -62.2,
      lng: -58.96,
      reporter: 'Juan Sebastian Huertas (Visiting Scientist)',
    },
  ]);

  // Telemetry stream
  const [telemetry, setTelemetry] = useState({
    sog: 12.4, // Speed Over Ground in knots
    cog: 184, // Course Over Ground degrees
    heading: 183.5,
    depth: 482, // meters
    sst: -1.15, // Sea Surface Temp °C
    salinity: 34.08, // PSU
    windSpd: 21.2, // knots
    windDir: 'SW',
    airTemp: -2.4, // °C
    baro: 994.2, // hPa
    iceConc: '3/10',
    waveHgt: '1.2m (Moderada)',
  });

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Clocks Effect
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + ' UTC');
      const shipD = new Date(now.getTime() - 3 * 3600 * 1000);
      setShipTime(shipD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (UTC-3)');
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Telemetry jitter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        sog: +(prev.sog + (Math.random() * 0.4 - 0.2)).toFixed(1),
        depth: Math.max(80, Math.round(prev.depth + (Math.random() * 6 - 3))),
        sst: +(-1.1 + (Math.random() * 0.1 - 0.05)).toFixed(2),
        salinity: +(34.08 + (Math.random() * 0.04 - 0.02)).toFixed(2),
        windSpd: +(prev.windSpd + (Math.random() * 0.6 - 0.3)).toFixed(1),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 1. Ingest Network Info & Dynamic Wi-Fi LAN QR (Rule 22 Compliant)
  useEffect(() => {
    const fetchNet = () => {
      fetch('http://127.0.0.1:8000/api/shipboard/ingest/network-info')
        .then((r) => r.json())
        .then((data) => {
          if (data.lan_ip) {
            setLanIp(data.lan_ip);
            setShipWifiSsid(data.ship_wifi_ssid || 'Ship-WiFi-5GHz');
            if (data.active_devices_count !== undefined) {
              setActiveMobileDevices(data.active_devices_count);
            }
            const port = window.location.port || '5174';
            const mobileUrl = `http://${data.lan_ip}:${port}/onboard`;
            QRCode.toDataURL(mobileUrl, {
              margin: 1,
              width: 180,
              color: { dark: '#0A2A4A', light: '#FFFFFF' },
            })
              .then((url) => setQrUrl(url))
              .catch((err) => console.warn('QR error:', err));
          }
        })
        .catch(() => {
          const fallback = `${window.location.origin}/onboard`;
          QRCode.toDataURL(fallback, {
            margin: 1,
            width: 180,
            color: { dark: '#0A2A4A', light: '#FFFFFF' },
          }).then((url) => setQrUrl(url));
        });
    };

    fetchNet();
    const interval = setInterval(fetchNet, 8000);
    return () => clearInterval(interval);
  }, []);

  // 2. Poll Crowdsourced Inclinometer Motion & Live Mobile Sightings
  useEffect(() => {
    const pollMobileData = () => {
      // Inclinometer motion aggregation
      fetch('http://127.0.0.1:8000/api/shipboard/ingest/crowdsourced-motion')
        .then((r) => r.json())
        .then((data) => {
          if (data && data.status === 'ok') {
            setCrowdsourcedMotion({
              avg_roll_deg: data.avg_roll_deg,
              avg_pitch_deg: data.avg_pitch_deg,
              total_nodes: data.total_nodes,
              sea_slamming_risk: data.sea_slamming_risk,
            });
            if (data.total_nodes > 0) {
              setActiveMobileDevices(data.total_nodes);
            }
          }
        })
        .catch(() => {});

      // Ingested mobile sightings feed
      fetch('http://127.0.0.1:8000/api/shipboard/ingest/sightings')
        .then((r) => r.json())
        .then((items: any[]) => {
          if (Array.isArray(items) && items.length > 0) {
            setSightings((prev) => {
              const prevIds = new Set(prev.map((p) => p.id));
              const newIncoming: LiveSighting[] = [];
              items.forEach((item) => {
                if (!prevIds.has(item.id)) {
                  newIncoming.push({
                    id: item.id,
                    category: item.category || 'whale',
                    speciesOrType: item.species_or_type || item.title,
                    locationName: `Lat ${item.latitude.toFixed(2)}° · Lng ${item.longitude.toFixed(2)}°`,
                    count: item.quantity || '1',
                    details: item.notes || item.activity,
                    timeAgo: 'Justo ahora (Móvil)',
                    lat: item.latitude,
                    lng: item.longitude,
                    reporter: item.observer_name || item.observer || 'Pasajero Wi-Fi',
                    isNew: true,
                    photo_base64: item.photo_base64 || item.photo,
                    pitch_deg: item.pitch_deg ?? item.pitch,
                    roll_deg: item.roll_deg ?? item.roll,
                  });
                }
              });
              if (newIncoming.length > 0) {
                return [...newIncoming, ...prev];
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    };

    pollMobileData();
    const interval = setInterval(pollMobileData, 3500);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Map Initialization
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
        center: [-62.53, -64.835],
        zoom: 6.8,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      mapRef.current = map;

      // Add vessel pin
      const vesselEl = document.createElement('div');
      vesselEl.className = 'science-hub-vessel-marker';
      vesselEl.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;background:#ffcc00;border:3px solid #000;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px #ffcc00;font-size:18px;animation:pulse 2s infinite;">
          🚢
        </div>
      `;
      new maplibregl.Marker({ element: vesselEl })
        .setLngLat([-62.53, -64.835])
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setHTML(`
            <div style="color:#000;font-family:sans-serif;padding:6px;font-size:12px;">
              <strong style="color:#0284c7;">${vessel}</strong><br/>
              <span>Rumbo: 184° · Velocidad: 12.4 kts</span><br/>
              <span style="color:#64748b;font-size:10px;">Estrecho de Gerlache · Antártida</span>
            </div>
          `)
        )
        .addTo(map);

      // Add sighting markers
      sightings.forEach((s) => {
        const el = document.createElement('div');
        el.className = 'science-hub-sighting-marker';
        const bg = s.category === 'whale' ? '#0284c7' : s.category === 'iceberg' ? '#06b6d4' : s.category === 'penguin' ? '#10b981' : '#f59e0b';
        const icon = s.category === 'whale' ? '🐋' : s.category === 'iceberg' ? '🧊' : s.category === 'penguin' ? '🐧' : '🚢';
        el.innerHTML = `
          <div style="width:32px;height:32px;border-radius:50%;background:${bg};border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px ${bg};font-size:16px;cursor:pointer;">
            ${icon}
          </div>
        `;
        const m = new maplibregl.Marker({ element: el })
          .setLngLat([s.lng, s.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 16 }).setHTML(`
              <div style="color:#000;font-family:sans-serif;padding:6px;font-size:12px;line-height:1.4;">
                <strong style="color:${bg};">${s.speciesOrType}</strong><br/>
                <span>${s.locationName}</span><br/>
                <em>"${s.details}"</em><br/>
                <span style="color:#64748b;font-size:10px;">Reportado por: ${s.reporter} (${s.timeAgo})</span>
              </div>
            `)
          )
          .addTo(map);
        markersRef.current.push(m);
      });

      // Add route LineString from Ushuaia to Antarctica on map load
      map.on('load', () => {
        if (!map.getSource('expedition-route-ushuaia')) {
          map.addSource('expedition-route-ushuaia', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                title: 'Ruta Oficial: Zarpe Ushuaia - Pasaje de Drake - Península Antártica',
              },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-68.303, -54.807], // 1. Puerto de Ushuaia (Zarpe)
                  [-67.500, -54.950], // 2. Canal Beagle / Paso Mackinlay
                  [-67.270, -55.980], // 3. Cabo de Hornos
                  [-64.000, -58.500], // 4. Drake Central / Convergencia Polar
                  [-58.960, -62.200], // 5. Islas Shetland del Sur
                  [-60.570, -62.970], // 6. Estrecho de Bransfield
                  [-62.530, -64.400], // 7. Estrecho de Gerlache
                  [-62.530, -64.835], // 8. Posición actual buque
                  [-62.550, -64.840], // 9. Neko Harbour
                ],
              },
            },
          });

          // Glow effect under line
          map.addLayer({
            id: 'expedition-route-glow',
            type: 'line',
            source: 'expedition-route-ushuaia',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffcc00',
              'line-width': 8,
              'line-opacity': 0.35,
              'line-blur': 4,
            },
          });

          // Main route line
          map.addLayer({
            id: 'expedition-route-line',
            type: 'line',
            source: 'expedition-route-ushuaia',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffcc00',
              'line-width': 3,
              'line-opacity': 0.95,
              'line-dasharray': [3, 1],
            },
          });
        }
      });

      // Add Ushuaia Gateway Marker
      const ushuaiaEl = document.createElement('div');
      ushuaiaEl.className = 'science-hub-ushuaia-marker';
      ushuaiaEl.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;background:#091b2c;border:2.5px solid #ffcc00;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(255,204,0,0.8);font-size:16px;cursor:pointer;">
          🇦🇷
        </div>
      `;
      const ushuaiaMarker = new maplibregl.Marker({ element: ushuaiaEl })
        .setLngLat([-68.303, -54.807])
        .setPopup(
          new maplibregl.Popup({ offset: 16 }).setHTML(`
            <div style="color:#000;font-family:sans-serif;padding:6px;font-size:12px;line-height:1.4;">
              <strong style="color:#091b2c;">🇦🇷 Puerto de Ushuaia</strong><br/>
              <span style="color:#d97706;font-weight:700;">Punto de Zarpe & Base de Operaciones</span><br/>
              <span style="color:#64748b;font-size:10px;">Canal Beagle · Tierra del Fuego · [-54.807°S, -68.303°W]</span><br/>
              <em>Zarpe de la expedición hacia el Pasaje de Drake y la Península Antártica.</em>
            </div>
          `)
        )
        .addTo(map);
      markersRef.current.push(ushuaiaMarker);

      // Add Cape Horn Marker
      const capeHornEl = document.createElement('div');
      capeHornEl.className = 'science-hub-capehorn-marker';
      capeHornEl.innerHTML = `
        <div style="width:30px;height:30px;border-radius:50%;background:#0e2942;border:2px solid #38bdf8;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(56,189,248,0.6);font-size:14px;cursor:pointer;">
          🧭
        </div>
      `;
      const capeHornMarker = new maplibregl.Marker({ element: capeHornEl })
        .setLngLat([-67.270, -55.980])
        .setPopup(
          new maplibregl.Popup({ offset: 16 }).setHTML(`
            <div style="color:#000;font-family:sans-serif;padding:6px;font-size:12px;line-height:1.4;">
              <strong style="color:#0f172a;">Cabo de Hornos</strong><br/>
              <span style="color:#0284c7;font-weight:600;">Entrada al Pasaje de Drake</span><br/>
              <span style="color:#64748b;font-size:10px;">Paso mítico hacia aguas antárticas</span>
            </div>
          `)
        )
        .addTo(map);
      markersRef.current.push(capeHornMarker);
    } catch (e) {
      console.warn('MapLibre init notice:', e);
    }
  }, [vessel]);

  return (
    <div className="min-h-screen bg-[#050e17] text-[#e2e8f0] font-sans antialiased select-none flex flex-col justify-between overflow-x-hidden">
      {/* 1. TOP SCIENCE HUB WALL BANNER (4K KIOSK READY) */}
      <header className="border-b border-[#1b344d] bg-gradient-to-r from-[#091b2c] via-[#0b243b] to-[#071625] px-6 py-3.5 flex items-center justify-between shadow-xl">
        {/* Left: Branding & Vessel Identity */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffcc00] text-black font-serif font-black text-2xl flex items-center justify-center shadow-lg shadow-[#ffcc00]/20">
            NG
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#ffcc00]">
                SCIENCE HUB · SALA DE OBSERVACIÓN INTERACTIVA
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-semibold">
                ● LIVE BRIDGE TELEMETRY
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight font-serif">
                {vessel}
              </h1>

              {/* Vessel switch button for demo */}
              <button
                onClick={() =>
                  setVessel(
                    vessel === 'National Geographic Resolution'
                      ? 'ARC Simón Bolívar'
                      : 'National Geographic Resolution'
                  )
                }
                className="text-[10px] font-mono px-2 py-1 rounded bg-[#132c45] hover:bg-[#1a3d61] text-[#93b6d9] border border-[#234b73] transition-colors"
                title="Alternar Buque"
              >
                Alternar Buque (PAC / NG-LEX)
              </button>
            </div>
          </div>
        </div>

        {/* Center: Live Bridge Telemetry Ticker */}
        <div className="hidden xl:flex items-center gap-6 px-4 py-2 rounded-2xl bg-[#071726]/80 border border-[#183552] text-xs font-mono">
          <div>
            <div className="text-[10px] text-[#7192b0] uppercase">Rumbo (COG)</div>
            <div className="text-[#ffcc00] font-bold text-sm">{telemetry.cog}° S</div>
          </div>
          <div className="h-8 w-px bg-[#183552]" />
          <div>
            <div className="text-[10px] text-[#7192b0] uppercase">Velocidad (SOG)</div>
            <div className="text-white font-bold text-sm">{telemetry.sog} kts</div>
          </div>
          <div className="h-8 w-px bg-[#183552]" />
          <div>
            <div className="text-[10px] text-[#7192b0] uppercase">Sonda / Quilla</div>
            <div className="text-[#00e5ff] font-bold text-sm">{telemetry.depth} m</div>
          </div>
          <div className="h-8 w-px bg-[#183552]" />
          <div>
            <div className="text-[10px] text-[#7192b0] uppercase">Agua (SST)</div>
            <div className="text-[#38bdf8] font-bold text-sm">{telemetry.sst} °C</div>
          </div>
          <div className="h-8 w-px bg-[#183552]" />
          <div>
            <div className="text-[10px] text-[#7192b0] uppercase">Hielo Marino</div>
            <div className="text-emerald-400 font-bold text-sm">{telemetry.iceConc}</div>
          </div>
        </div>

        {/* Right: Dual Clocks & Wall Controls */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#0c1f33] border border-[#1b3b5e] text-right">
            <div className="text-[10px] text-[#ffcc00] font-bold">{utcTime}</div>
            <div className="text-[10px] text-[#8faab5]">{shipTime}</div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-[#0c1f33] hover:bg-[#142e4a] border border-[#1b3b5e] text-[#8faab5] hover:text-white transition-all"
            title={soundEnabled ? 'Silenciar Alertas' : 'Activar Alertas Sonoras'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#ffcc00]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Kiosk Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-[#ffcc00] hover:bg-[#e6b800] text-black font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            title="Pantalla Completa Kiosk (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 stroke-[2.5]" /> : <Maximize2 className="w-4 h-4 stroke-[2.5]" />}
            <span className="hidden sm:inline text-xs uppercase">Kiosk</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN WALL GRID */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ========================================================
            LEFT COLUMN (3 COLS): LAB OCEANOGRÁFICO & VISITING SCIENTIST
            ======================================================== */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          {/* Visiting Scientist Station */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-[#091b2c] to-[#071524] border border-[#1d3c5e] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#1b334e] pb-2.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ffcc00] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Investigador a Bordo
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#ffcc00]/15 text-[#ffcc00] border border-[#ffcc00]/30 font-mono">
                Visiting Scientist
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-serif">
                Juan Sebastian Huertas Olea
              </h3>
              <p className="text-xs text-[#8faab5] mt-0.5">
                Programa Visiting Scientist (NG-LEX 2027-2028) & PAC Colombia (ARC Simón Bolívar).
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#05111d] border border-[#142a42] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#7192b0]">Misión Principal:</span>
                <span className="text-white font-medium">Match-ups Satelitales SAR & AIS</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#7192b0]">Próxima Charla:</span>
                <span className="text-[#ffcc00] font-semibold">Hoy 11:30 · Main Lounge</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#7192b0]">Nodo de Datos:</span>
                <span className="text-emerald-400 font-mono">MacBook Pro M5 Max (Edge)</span>
              </div>
            </div>
          </div>

          {/* Live CTD & Oceanographic Lab Sensors */}
          <div className="p-4 rounded-3xl bg-[#091a2a] border border-[#1d3a5a] shadow-xl space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1a334d] pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00e5ff] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Sensores Oceanográficos en Casco
                </span>
                <span className="text-[9px] font-mono text-emerald-400">100 Hz RT</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#06121e] border border-[#142a42]">
                  <div className="text-[10px] text-[#7192b0] flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-[#38bdf8]" /> SST Casco
                  </div>
                  <div className="text-base font-bold text-white mt-1">{telemetry.sst} °C</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#06121e] border border-[#142a42]">
                  <div className="text-[10px] text-[#7192b0] flex items-center gap-1">
                    <Waves className="w-3 h-3 text-[#00e5ff]" /> Salinidad
                  </div>
                  <div className="text-base font-bold text-white mt-1">{telemetry.salinity} PSU</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#06121e] border border-[#142a42]">
                  <div className="text-[10px] text-[#7192b0] flex items-center gap-1">
                    <Wind className="w-3 h-3 text-[#ffcc00]" /> Viento Real
                  </div>
                  <div className="text-base font-bold text-white mt-1">{telemetry.windSpd} kts</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#06121e] border border-[#142a42]">
                  <div className="text-[10px] text-[#7192b0] flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#a855f7]" /> Presión Baro
                  </div>
                  <div className="text-base font-bold text-white mt-1">{telemetry.baro} hPa</div>
                </div>
              </div>
            </div>

            {/* Crowdsourced Mobile Nodes & Inclinometer Mesh Card */}
            <div className="p-3.5 rounded-2xl bg-[#081827] border border-[#1b3e66] space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Smartphone className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>Malla de Celulares Wi-Fi</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activeMobileDevices} Móviles Activos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-[#05111c] border border-[#13283f] text-center">
                  <div className="text-[9px] text-[#7192b0]">Rolido Promedio</div>
                  <div className="text-sm font-bold text-[#00e5ff]">
                    {crowdsourcedMotion.avg_roll_deg > 0 ? `+${crowdsourcedMotion.avg_roll_deg}°` : `${crowdsourcedMotion.avg_roll_deg}°`}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#05111c] border border-[#13283f] text-center">
                  <div className="text-[9px] text-[#7192b0]">Cabeceo Promedio</div>
                  <div className="text-sm font-bold text-[#ffcc00]">
                    {crowdsourcedMotion.avg_pitch_deg > 0 ? `+${crowdsourcedMotion.avg_pitch_deg}°` : `${crowdsourcedMotion.avg_pitch_deg}°`}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#8fa7be] border-t border-[#13283f] pt-1">
                <span>Riesgo Slamming:</span>
                <span className="text-emerald-400 font-bold">{crowdsourcedMotion.sea_slamming_risk}</span>
              </div>
            </div>

            {/* Mobile QR Invitation Card (Rule 22 Compliant) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0c243b] to-[#081827] border border-[#224870] flex items-center gap-3 mt-2">
              {qrUrl ? (
                <div className="p-1.5 bg-white rounded-xl shrink-0 shadow-md">
                  <img src={qrUrl} alt="QR Onboard" className="w-16 h-16" />
                </div>
              ) : null}

              <div className="text-xs space-y-0.5">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>Participa desde tu Celular</span>
                </div>
                <p className="text-[10px] text-[#93b3d2] leading-tight">
                  Conéctate al Wi-Fi del buque ({shipWifiSsid}). Tus fotos y avistamientos se proyectan en vivo.
                </p>
                <div className="text-[9px] font-mono text-[#ffcc00]">
                  http://{lanIp}:5174/onboard
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            CENTER COLUMN (6 COLS): INTERACTIVE POLAR MAP WALL
            ======================================================== */}
        <section className="lg:col-span-6 flex flex-col gap-3">
          {/* Map Layer Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#081726] border border-[#17334f] rounded-2xl px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-[#00e5ff]" />
                <span>Carta Náutica Polar</span>
              </span>
              <span className="text-[10px] text-[#ffcc00] font-mono hidden xl:inline">
                Derrota: Ushuaia ➔ Drake ➔ Gerlache
              </span>
            </div>

            {/* Quick Waypoint Navigation Controls */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <button
                onClick={() => mapRef.current?.flyTo({ center: [-68.303, -54.807], zoom: 7.2 })}
                className="px-2 py-1 rounded-lg bg-[#0e2238] border border-[#ffcc00]/40 text-[#ffcc00] hover:bg-[#183556] transition-all flex items-center gap-1"
                title="Enfocar Puerto de Ushuaia (Zarpe)"
              >
                🇦🇷 Ushuaia
              </button>
              <button
                onClick={() => mapRef.current?.flyTo({ center: [-64.5, -60.0], zoom: 4.8 })}
                className="px-2 py-1 rounded-lg bg-[#0e2238] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#183556] transition-all flex items-center gap-1 font-bold"
                title="Ver Ruta Completa Ushuaia - Drake - Antártida"
              >
                📍 Ver Ruta Completa
              </button>
              <button
                onClick={() => mapRef.current?.flyTo({ center: [-62.53, -64.835], zoom: 7.2 })}
                className="px-2 py-1 rounded-lg bg-[#0e2238] border border-emerald-500/40 text-emerald-400 hover:bg-[#183556] transition-all flex items-center gap-1"
                title="Enfocar Posición Actual del Buque"
              >
                🚢 Buque
              </button>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              {(['ALL', 'ICE', 'FAUNA', 'RADAR'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLayer(l)}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    activeLayer === l
                      ? 'bg-[#ffcc00] text-black border-[#ffcc00] font-bold shadow'
                      : 'bg-[#0f2338] text-[#8faab5] border-[#1a3857] hover:text-white'
                  }`}
                >
                  {l === 'ALL' ? 'Todas' : l === 'ICE' ? '🧊 Hielo' : l === 'FAUNA' ? '🐋 Fauna' : '🛰️ SAR'}
                </button>
              ))}
            </div>
          </div>

          {/* Big Interactive Map Container */}
          <div className="relative flex-1 min-h-[500px] rounded-3xl overflow-hidden border border-[#1f3f63] bg-[#050e17] shadow-2xl">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* In-Map HUD Overlay (Bottom-Left) */}
            <div className="absolute bottom-4 left-4 z-10 p-3 rounded-2xl bg-[#071624]/90 backdrop-blur-md border border-[#1b3857] text-xs font-mono space-y-1 shadow-xl">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00] animate-ping" />
                <span>{vessel.split(' ')[0]} en Posición</span>
              </div>
              <div className="text-[11px] text-[#8faab5]">
                Lat: -64.8350° · Lng: -62.5300° · Rumbo 184°
              </div>
              <div className="text-[10px] text-[#00e5ff]">
                Profundidad batimétrica: 482m · Cuenca Gerlache
              </div>
            </div>

            {/* In-Map Satellite Sentinel-1 Alert Overlay (Top-Left) */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-[#091b2c]/90 backdrop-blur-md border border-[#1f4268] text-[11px] font-mono flex items-center gap-2 text-[#38bdf8] shadow-lg">
              <Radio className="w-3.5 h-3.5 text-[#38bdf8] animate-pulse" />
              <span>Sentinel-1 SAR Match-up: Cobertura activa en 38 min</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            RIGHT COLUMN (3 COLS): LIVE CROWDSOURCED SIGHTINGS WALL
            ======================================================== */}
        <section className="lg:col-span-3 flex flex-col gap-3">
          {/* Header Card */}
          <div className="p-3.5 rounded-2xl bg-[#091b2c] border border-[#1c3957] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#ffcc00]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Muro de Avistamientos
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40">
              {sightings.length} en Vivo
            </span>
          </div>

          {/* Sighting Feed Scrollable Container */}
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
            {sightings.map((s) => {
              const bg =
                s.category === 'whale'
                  ? 'border-sky-500/40 bg-[#091f33]'
                  : s.category === 'iceberg'
                  ? 'border-cyan-500/40 bg-[#07212e]'
                  : s.category === 'penguin'
                  ? 'border-emerald-500/40 bg-[#07241f]'
                  : 'border-amber-500/40 bg-[#241e0b]';

              const icon =
                s.category === 'whale' ? '🐋' : s.category === 'iceberg' ? '🧊' : s.category === 'penguin' ? '🐧' : '🚢';

              return (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-2xl border ${bg} shadow-lg space-y-1.5 transition-all hover:scale-[1.02] cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">
                          {s.speciesOrType}
                        </div>
                        <div className="text-[10px] text-[#8faab5] font-mono">
                          {s.locationName}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#ffcc00] px-1.5 py-0.5 rounded bg-black/40">
                      {s.timeAgo}
                    </span>
                  </div>

                  {/* Photo thumbnail if captured via mobile */}
                  {s.photo_base64 && (
                    <div className="rounded-xl overflow-hidden border border-white/10 max-h-36 bg-black/40">
                      <img src={s.photo_base64} alt={s.speciesOrType} className="w-full h-32 object-cover" />
                    </div>
                  )}

                  <p className="text-[11px] text-[#cbd5e1] leading-relaxed italic bg-black/20 p-2 rounded-xl">
                    "{s.details}"
                  </p>

                  {/* Mobile Inclinometer reading at time of observation */}
                  {s.pitch_deg !== undefined && s.pitch_deg !== null && (
                    <div className="text-[9px] font-mono text-[#00e5ff] flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5 text-[#ffcc00]" />
                      <span>
                        Inclinómetro: Rolido {s.roll_deg && s.roll_deg > 0 ? `+${s.roll_deg}°` : `${s.roll_deg}°`} · Cabeceo {s.pitch_deg && s.pitch_deg > 0 ? `+${s.pitch_deg}°` : `${s.pitch_deg}°`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#7192b0] font-mono pt-0.5">
                    <span>{s.count}</span>
                    <span className="text-[#38bdf8] truncate max-w-[150px]">{s.reporter}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action Button for Kiosk Touchscreen */}
          <Link
            to="/onboard"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ffcc00] to-[#ffa600] text-black font-bold text-xs uppercase tracking-wider text-center shadow-lg shadow-[#ffcc00]/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>➕ Toca Aquí para Registrar Avistamiento</span>
          </Link>
        </section>
      </main>

      {/* 3. BOTTOM KIOSK MARQUEE STATUS */}
      <footer className="border-t border-[#13273b] bg-[#06121d] px-6 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#7192b0]">
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            NODO EDGE ACTIVO EN NAVEGACIÓN
          </span>
          <span>Red local: {shipWifiSsid} (100% Offline)</span>
          <span>Servidor LAN: http://{lanIp}:5174</span>
          <span>Investigador: Juan Sebastian Huertas Olea</span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/observatory" className="hover:text-white underline">
            Observatorio Cartográfico
          </Link>
          <span>·</span>
          <Link to="/field-logger" className="hover:text-white underline">
            Bitácora de Puente
          </Link>
          <span>·</span>
          <Link to="/onboard" className="text-[#ffcc00] font-bold hover:underline">
            App Celular
          </Link>
        </div>
      </footer>
    </div>
  );
}
