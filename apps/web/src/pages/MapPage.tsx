import SpatialMetricPanel from '../components/SpatialMetricPanel';







import CrossAnalysisPanel from '../components/CrossAnalysisPanel';







import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { fetchOpenVessels } from '../lib/open-vessel-feed';
import { getTrafficSnapshot, subscribeTraffic } from '../lib/observatory-traffic';







import { useNavigate } from 'react-router-dom';







import { api } from '../lib/api';







import { createPoller } from '../lib/polling';







import Header from '../components/Header';







import WodMapPanel, { type WodMapPanelHandle } from '../components/WodMapPanel';







import ControlCenter, { type EntityDetail } from '../components/ControlCenter';







import ActiveLayerChips from '../components/ActiveLayerChips';







import { OdsMissionStrip } from '../components/OdsMissionStrip';







import { getLayerSDGNumber } from '../lib/sdg-registry';







import AutoLegend from '../components/AutoLegend';







import QrJoinPanel from '../components/QrJoinPanel';







import ObservationModal, { type LocalRecord } from '../components/ObservationModal';







import RightToolRail, { type RightDrawerId } from '../components/RightToolRail';







import MenuSheet from '../components/MenuSheet';







import SdgLensDrawer from '../components/SdgLensDrawer';







import ObjectDetailCard from '../components/ObjectDetailCard';







import MobileBottomNav, { type MobileTab } from '../components/MobileBottomNav';







import HierarchicalLayerLibrary from '../components/HierarchicalLayerLibrary';







import CommandPalette from '../components/CommandPalette';







import EventsStreamModal from '../components/EventsStreamModal';







import AgentMeshModal from '../components/AgentMeshModal';







import SystemHealthModal from '../components/SystemHealthModal';







import FaunaStrip from '../components/FaunaStrip';







import GfwPanel from '../components/GfwPanel';







import CoveragePanel from '../components/CoveragePanel';







import SelfHealingPanel from '../components/SelfHealingPanel';







import GeeLayerAnalytics from '../components/GeeLayerAnalytics';







import InachShetlandInset from '../components/InachShetlandInset';







import CryosphereStoryModal from '../components/CryosphereStoryModal';







import MapSwipeComparison from '../components/MapSwipeComparison';







import OsirisTimeline4D from '../components/OsirisTimeline4D';







import PentagonPizzaIndexWidget from '../components/PentagonPizzaIndexWidget';







import NatGeoDirectorSuite from '../components/NatGeoDirectorSuite';







import { NatGeoDirectorStore } from '../lib/natgeo-director-store';







import { WorkspaceStore, type ControlCenterTab, type SavedView } from '../lib/workspace-store';







import { SpatialCameraStore, type MapMode } from '../lib/spatial-camera-store';







import { getGibsRecentDate } from '../lib/wod-map-engine';







import { PanelLeft, Sparkles, Flame, X, ChevronDown, Layers, Film } from 'lucide-react';

// OLEA · modelo SIPSEM: tarjeta de punto y estado del mapa en la URL.
import type { MapMouseEvent } from 'maplibre-gl';
import OceanPointCard from '../components/OceanPointCard';
import {
  applyUrlStateToMap,
  attachUrlSync,
  readMapUrlState,
  type MinimalMap,
} from '../lib/map-url-state';
import MarineGeophysicsPanel from '../components/MarineGeophysicsPanel';















const POLAR_ZONES = [







  { id: 'ZONE_A', name: 'Antártida Core (60°S–90°S)', shortName: 'ANTÁRTIDA', coords: [-64.8, -65.0] as [number, number], zoom: 3.2 },







  { id: 'ZONE_B', name: 'Océano Austral (45°S–60°S)', shortName: 'OCÉANO AUSTRAL', coords: [-55.0, -58.0] as [number, number], zoom: 4.0 },







  { id: 'ZONE_C', name: 'Puertas de Entrada (25°S–45°S)', shortName: 'PUERTAS DE ENTRADA', coords: [-40.0, -68.0] as [number, number], zoom: 4.8 },







];















export default function MapPage() {
  const traffic = useSyncExternalStore(subscribeTraffic, getTrafficSnapshot);







  const navigate = useNavigate();







  const mapHandleRef = useRef<WodMapPanelHandle | null>(null);







  const [workspace, setWorkspace] = useState(() => WorkspaceStore.get());
  useEffect(() => {
    if (Object.values(WorkspaceStore.getState().activeLayers).some(Boolean)) {
      WorkspaceStore.setLayers({});
      setWorkspace(WorkspaceStore.get());
    }
  }, []);

  // ---- OLEA · practicas tomadas del SIPSEM de DIMAR ----------------------
  // 1) Un clic en el mapa abre la tarjeta del punto ("PUNTO DEL MAPA").
  // 2) La URL conserva el encuadre del mapa.
  const [oceanPoint, setOceanPoint] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let boundMap: ReturnType<NonNullable<typeof mapHandleRef.current>['getMap']> | null = null;
    // Un clic sobre un buque, estacion u otro objeto pertenece a su ficha:
    // la tarjeta de punto es para el mar abierto, como en SIPSEM. Sin esta
    // comprobacion se abririan las dos a la vez, solapadas.
    const onMapClick = (event: MapMouseEvent) => {
      const position = event?.lngLat;
      if (!position) return;
      try {
        const hits = event.target?.queryRenderedFeatures(event.point);
        if (hits && hits.length > 0) return;
      } catch {
        // Si la consulta falla, se abre igual: es mejor que no responder.
      }
      setOceanPoint({ lat: position.lat, lon: position.lng });
    };
    // El mapa no existe en el primer render: se reintenta hasta que exista.
    const attach = () => {
      if (cancelled) return;
      const candidate = mapHandleRef.current?.getMap();
      if (!candidate) { window.setTimeout(attach, 400); return; }
      boundMap = candidate;
      candidate.on('click', onMapClick);
    };
    attach();
    return () => {
      cancelled = true;
      if (boundMap) boundMap.off('click', onMapClick);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let detach: (() => void) | null = null;
    const attach = () => {
      if (cancelled) return;
      const candidate = mapHandleRef.current?.getMap();
      if (!candidate) { window.setTimeout(attach, 400); return; }
      // Si la URL traia una vista, manda sobre el encuadre por defecto.
      const urlState = readMapUrlState();
      applyUrlStateToMap(urlState, (coords, zoom) => handleFlyTo(coords, zoom));
      detach = attachUrlSync(candidate as unknown as MinimalMap, { getLayers: () => [] });
    };
    attach();
    return () => { cancelled = true; if (detach) detach(); };
  }, []);








  const activeThematicCount = Object.entries(workspace.activeLayers || {}).filter(







    ([k, v]) => v && !['coastline', 'bathymetry', 'ice-shelves', 'quantarctica_coast', 'quantarctica_ice', 'quantarctica_bathymetry'].includes(k)







  ).length;







  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false); // Clean initial map baseline







  const [activeMapMode, setActiveMapMode] = useState<MapMode>(() => workspace.mapMode);







  const [qrOpen, setQrOpen] = useState(false);







  const [obsFormOpen, setObsFormOpen] = useState(false);







  const [activeRightDrawer, setActiveRightDrawer] = useState<RightDrawerId>(null);















  // V7 Core Interactive States







  const [menuSheetOpen, setMenuSheetOpen] = useState(false);







  const [sdgDrawerOpen, setSdgDrawerOpen] = useState(false);







  const [activeSdgGoal, setActiveSdgGoal] = useState<number | null>(null);
  // Dock inferior (2D / 3D / SAT y controles): se puede minimizar para liberar
  // pantalla, sobre todo en celular donde compite con la barra de navegacion.
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [geophysicsOpen, setGeophysicsOpen] = useState(false);















  // AMOH_OPEN_UNIFIED_CC_SAFE_V3 — only organizes UI. Map/runtime configuration is untouched.







  const openUnifiedControlCenter = (mode: 'CAPAS' | 'ODS' | 'XDG' | 'CRUCE' = 'CAPAS') => {







    setSdgDrawerOpen(false);







    setLayerLibraryOpen(false);







    setIsControlCenterOpen(true);







    WorkspaceStore.setControlCenterTab('EXPLORE');







    window.setTimeout(() => {







      window.dispatchEvent(new CustomEvent('amoh:control-center-mode', { detail: mode }));







    }, 60);







  };















  useEffect(() => {







    (window as any).__amohOpenUnifiedControlCenter = openUnifiedControlCenter;







    return () => {







      if ((window as any).__amohOpenUnifiedControlCenter === openUnifiedControlCenter) {







        delete (window as any).__amohOpenUnifiedControlCenter;







      }







    };







  });







  















  // AMOH_SDG_LENS_OPEN_BRIDGE_V22







  // Stable event bridge so Header, mission strip, menu and automated checks







  // all open the same SdgLensDrawer state.







  useEffect(() => {







    const openSdgLens = () => {







      openUnifiedControlCenter('ODS');







    };















    window.addEventListener('amoh:open-sdg-lens', openSdgLens);







    (window as any).__amohOpenSdgLens = openSdgLens;















    return () => {







      window.removeEventListener('amoh:open-sdg-lens', openSdgLens);















      if ((window as any).__amohOpenSdgLens === openSdgLens) {







        delete (window as any).__amohOpenSdgLens;







      }







    };







  }, []);







const activeSdgCount = useMemo(() => {







    const goals = new Set<number>();







    Object.entries(workspace.activeLayers || {}).forEach(([layerId, isEnabled]) => {







      if (!isEnabled) return;







      const sdg = getLayerSDGNumber(layerId);







      if (sdg) goals.add(sdg);







    });







    return goals.size;







  }, [workspace.activeLayers]);







  const [selectedObject, setSelectedObject] = useState<any | null>(null);







  const [activeZone] = useState(POLAR_ZONES[0]);







  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('MAP');















  // V8.2, V8.4 & V8.5 Truth, Health, 4K & Cryosphere States







  const [isUltraHd, setIsUltraHd] = useState(false);
  void isUltraHd; void setIsUltraHd; // reservado: modo 4K aún sin cablear a la UI







  const [inachInsetOpen, setInachInsetOpen] = useState(false);







  const [storyModalOpen, setStoryModalOpen] = useState(false);







  const [swipeOpen, setSwipeOpen] = useState(false);







  const [layerLibraryOpen, setLayerLibraryOpen] = useState(false);







  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);







  const [eventsStreamOpen, setEventsStreamOpen] = useState(false);







  const [agentMeshOpen, setAgentMeshOpen] = useState(false);







  const [systemHealthOpen, setSystemHealthOpen] = useState(false);







  const [faunaStripOpen, setFaunaStripOpen] = useState(false);







  const [gfwPanelOpen, setGfwPanelOpen] = useState(false);







  const [coveragePanelOpen, setCoveragePanelOpen] = useState(false);







  const [selfHealingPanelOpen, setSelfHealingPanelOpen] = useState(false);







  const [geeAnalyticsOpen, setGeeAnalyticsOpen] = useState(false);







  const [selectedAnalyticsLayerId, setSelectedAnalyticsLayerId] = useState<string | null>(null);







  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({});







  const [heatmapMenuOpen, setHeatmapMenuOpen] = useState(false);







  const [legendOpen, setLegendOpen] = useState(true);







  const [legendKey, setLegendKey] = useState(0);







  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);







  const [pizzaWidgetOpen, setPizzaWidgetOpen] = useState(false);







  const [isDirectorMode, setIsDirectorMode] = useState(() => NatGeoDirectorStore.get().isDirectorMode);















  // Subscribe to NatGeoDirectorStore







  useEffect(() => {







    return NatGeoDirectorStore.subscribe((next) => {







      setIsDirectorMode(next.isDirectorMode);







    });







  }, []);















  const handleToggleHierarchicalLayer = (layerId: string) => {







    WorkspaceStore.toggleLayer(layerId as any);







  };















  const handleSetLayerOpacity = (layerId: string, opacity: number) => {







    setLayerOpacities((prev) => ({ ...prev, [layerId]: opacity }));







  };















  const handleExecuteCommandAction = (actionKey: string) => {







    switch (actionKey) {







      case 'TOGGLE_GFW':







        WorkspaceStore.toggleLayer('gfw_fishing_effort' as any);







        break;







      case 'TOGGLE_AIS':







        WorkspaceStore.toggleLayer('ais_vessels' as any);







        break;







      case 'TOGGLE_AVIATION':







        WorkspaceStore.toggleLayer('polar_aviation' as any);







        break;







      case 'TOGGLE_SATELLITES':







        WorkspaceStore.toggleLayer('polar_satellites' as any);







        break;







      case 'TOGGLE_SEISMIC':







        WorkspaceStore.toggleLayer('seismic_events' as any);







        break;







      case 'TOGGLE_WIND':







        WorkspaceStore.toggleLayer('wind_particles' as any);







        break;







      case 'TOGGLE_CURRENTS':







        WorkspaceStore.toggleLayer('ocean_currents' as any);







        break;







      case 'TOGGLE_ICE':







        WorkspaceStore.toggleLayer('sea_ice_concentration' as any);







        break;







      case 'TOGGLE_BIODIVERSITY':







        WorkspaceStore.toggleLayer('obis_biodiversity' as any);







        break;







      case 'TOGGLE_GOVERNANCE':







        WorkspaceStore.toggleLayer('aspa_protected_areas' as any);







        break;







      case 'TOGGLE_UN':







        WorkspaceStore.toggleLayer('bbnj_high_seas' as any);







        break;







      case 'OPEN_PYTHIA':







        setAgentMeshOpen(true);







        break;







      case 'OPEN_LAYERS':







        openUnifiedControlCenter('CAPAS');







        break;







      case 'OPEN_COMMAND_PALETTE':







        setCommandPaletteOpen(true);







        break;







      case 'OPEN_PIZZA_INDEX':







        setPizzaWidgetOpen(true);







        break;







      case 'OPEN_NATGEO_DIRECTOR':







        NatGeoDirectorStore.set({ isDirectorMode: true });







        break;







      default:







        break;







    }







  };















  // Expose test hook for automation







  useEffect(() => {







    (window as any).__AMOH_SELECT_OBJECT__ = (obj: any) => setSelectedObject(obj);







    return () => {







      delete (window as any).__AMOH_SELECT_OBJECT__;







    };







  }, []);















  // Shortcut ⌘L / Ctrl+L to toggle Control Center







  useEffect(() => {







    const handleKeyDown = (e: KeyboardEvent) => {







      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {







        e.preventDefault();







        setIsControlCenterOpen((prev) => !prev);







      }







    };







    window.addEventListener('keydown', handleKeyDown);







    return () => window.removeEventListener('keydown', handleKeyDown);







  }, []);















  // Subscribe to WorkspaceStore changes







  useEffect(() => {







    return WorkspaceStore.subscribe((nextWs) => {







      setWorkspace(nextWs);







      setActiveMapMode(nextWs.mapMode);







    });







  }, []);















  // Sync mode changes with SpatialCameraStore







  useEffect(() => {







    const unsub = SpatialCameraStore.subscribe((s) => {







      setActiveMapMode(s.activeMode);







    });







    return () => unsub();







  }, []);























  // Canonical bridge: React UI mode -> active MapLibre engine.







  // activeMapMode is the source of truth for MAP / GLOBE / SAT.







  useEffect(() => {















    let retryTimer: number | undefined;







    let stopTimer: number | undefined;















    const applyMode = () => {















      const engine = (window as any).__wodEngine;















      if (!engine?.map || !engine?.applyOsirisTheme) {







        return false;







      }















      console.info(







        '[AMOH MAP BRIDGE] React -> MapLibre:',







        activeMapMode







      );















      engine.applyOsirisTheme(activeMapMode);















      return true;







    };















    if (!applyMode()) {















      retryTimer = window.setInterval(() => {















        if (applyMode() && retryTimer !== undefined) {







          window.clearInterval(retryTimer);







          retryTimer = undefined;







        }















      }, 100);















      stopTimer = window.setTimeout(() => {















        if (retryTimer !== undefined) {







          window.clearInterval(retryTimer);







          retryTimer = undefined;







        }















      }, 5000);







    }















    return () => {















      if (retryTimer !== undefined) {







        window.clearInterval(retryTimer);







      }















      if (stopTimer !== undefined) {







        window.clearTimeout(stopTimer);







      }







    };















  }, [activeMapMode]);







  const [telemetry, setTelemetry] = useState<{







    vessels_count: number | null;







    satellites_count: number | null;







    aircraft_count: number | null;







    ais_connected?: boolean;
    ais_freshness?: string;
    aviation_freshness?: string;







    gfw_configured?: boolean;







  }>({







    vessels_count: null,







    satellites_count: null,







    aircraft_count: null,







  });
  const [monitoredVessels, setMonitoredVessels] = useState<EntityDetail[]>([]);















  useEffect(() => {







    let isMounted = true;







    const fetchTelemetry = async () => {







      try {







        const res = await api.get<{







          vessels_count?: number;







          satellites_count?: number;







          aircraft_count?: number;







          ais_connected?: boolean;







          gfw_configured?: boolean;
          ais_freshness?: string;
          aviation_freshness?: string;







        }>('/api/telemetry/summary');







        if (isMounted && res) {







          setTelemetry({







            vessels_count: typeof res.vessels_count === 'number' ? res.vessels_count : null,







            satellites_count: typeof res.satellites_count === 'number' ? res.satellites_count : null,







            aircraft_count: typeof res.aircraft_count === 'number' ? res.aircraft_count : null,







            ais_connected: res.ais_connected,







            gfw_configured: res.gfw_configured,
            ais_freshness: res.ais_freshness,
            aviation_freshness: res.aviation_freshness,







          });







        }







      } catch {







        // Fallback demo numbers handled by API or default







      }







    };

    const fetchMonitoredVessels = async () => {
      try {
        const { data: feed } = await fetchOpenVessels();
        if (!isMounted || !feed?.features) return;
        setMonitoredVessels(
          feed.features
            .filter((feature) => feature.geometry?.type === 'Point')
            .map((feature, index) => {
              const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
              const p = feature.properties || {};
              return {
                id: String(p.mmsi || p.MMSI || `ais-${index}`),
                type: 'vessel',
                title: String(p.ship_name || p.name || p.vessel_name || 'Buque AIS'),
                subtitle: `${p.ship_type || p.vessel_type || 'Tipo no informado'} · ${p.freshness || 'SIN FRESCURA'}`,
                coordinates: [lng, lat],
                data: {
                  MMSI: p.mmsi || p.MMSI || '—',
                  Velocidad: `${p.sog ?? p.speed_kts ?? '—'} nudos`,
                  Rumbo: `${p.cog ?? p.course_deg ?? '—'}°`,
                  Fuente: p.source || 'AIS',
                  Frescura: p.freshness || '—',
                },
              } satisfies EntityDetail;
            })
        );
      } catch {
        if (isMounted) setMonitoredVessels([]);
      }
    };

    fetchTelemetry();
    fetchMonitoredVessels();
    const monitoredVesselTimer = window.setInterval(fetchMonitoredVessels, 60000);







    const poller = createPoller(fetchTelemetry, 60000);







    poller.start();















    const onSelectCustomObj = (e: any) => {







      if (e.detail) setSelectedObject(e.detail);







    };







    window.addEventListener('amoh:select-object', onSelectCustomObj);







    const unsubWorkspace = WorkspaceStore.subscribe((ws) => {







      setWorkspace(ws);







    });















    return () => {
      isMounted = false;
      window.clearInterval(monitoredVesselTimer);







      poller.stop();







      window.removeEventListener('amoh:select-object', onSelectCustomObj);







      unsubWorkspace();







    };







  }, []);















  const handleToggleLayer = (layerId: string) => {







    WorkspaceStore.toggleLayer(layerId);







  };















  const hasOpenedTrafficGlobe = useRef(false);
  const handleSelectMapMode = (mode: MapMode) => {
    if ((mode === 'GLOBE' || mode === 'SAT') && !hasOpenedTrafficGlobe.current) {
      hasOpenedTrafficGlobe.current = true;
      const { activeLayers } = WorkspaceStore.getState();
      WorkspaceStore.setState({
        activeLayers: { ...activeLayers, maritime_vessels: true, polar_satellites: true, polar_aircraft: true },
      });
    }















    console.info(







      '[AMOH UI] MODE CLICK:',







      mode







    );















    // UI/store state first.







    setActiveMapMode(mode);







    WorkspaceStore.setMapMode(mode);







    SpatialCameraStore.setMode(mode);















    // Then command the real MapLibre instance directly.







    // This is intentionally the LAST operation.







    const direct =







      (window as any).__amohApplyMapMode;















    if (typeof direct === 'function') {















      direct(mode);















    } else {















      console.error(







        '[AMOH UI] Direct map controller is not ready'







      );







    }







  };















  const handleFlyTo = (coords: [number, number], zoom = 5) => {







    mapHandleRef.current?.flyTo(coords, zoom);







  };















  const handleSelectSavedView = (view: SavedView) => {







    WorkspaceStore.loadSavedView(view);







    mapHandleRef.current?.flyTo([view.longitude, view.latitude], view.zoom);







  };















  // Local observations







  const [, setRecords] = useState<LocalRecord[]>(() => {







    try {







      const stored = localStorage.getItem('amoh-field-v1');







      return stored ? JSON.parse(stored) : [];







    } catch {







      return [];







    }







  });















  const handleSaveObservation = (newRecord: LocalRecord) => {







    setRecords((prev) => [newRecord, ...prev]);







    if (newRecord.latitude !== null && newRecord.longitude !== null) {







      handleFlyTo([newRecord.longitude, newRecord.latitude], 6);







    }







  };















  const isAnyHeatmapActive = [







    'grey_zones_defense_heatmap',







    'polar_friction_sectors',







    'grey_zones_buffers',







    'fauna_density_heatmap',







    'penguin_heatmap',







    'whales_heatmap',







    'gfw_fishing_effort_heatmap',







    'nuclear_contamination_heatmap',







    'seismic_heatmap',







  ].some((k) => !!(workspace.activeLayers as any)[k]);















  const hasOpenOverlays =







    isControlCenterOpen ||







    qrOpen ||







    obsFormOpen ||







    activeRightDrawer !== null ||







    menuSheetOpen ||







    sdgDrawerOpen ||







    selectedObject !== null ||







    inachInsetOpen ||







    storyModalOpen ||







    swipeOpen ||







    layerLibraryOpen ||







    commandPaletteOpen ||







    eventsStreamOpen ||







    agentMeshOpen ||







    systemHealthOpen ||







    faunaStripOpen ||







    gfwPanelOpen ||







    coveragePanelOpen ||







    selfHealingPanelOpen ||







    geeAnalyticsOpen ||







    toolsMenuOpen ||







    pizzaWidgetOpen ||







    isDirectorMode;















  const closeAllOverlays = () => {







    setIsControlCenterOpen(false);







    setQrOpen(false);







    setObsFormOpen(false);







    setActiveRightDrawer(null);







    setMenuSheetOpen(false);







    setSdgDrawerOpen(false);







    setActiveSdgGoal(null);







    setSelectedObject(null);







    setInachInsetOpen(false);







    setStoryModalOpen(false);







    setSwipeOpen(false);







    setLayerLibraryOpen(false);







    setCommandPaletteOpen(false);







    setEventsStreamOpen(false);







    setAgentMeshOpen(false);







    setSystemHealthOpen(false);







    setFaunaStripOpen(false);







    setGfwPanelOpen(false);







    setCoveragePanelOpen(false);







    setSelfHealingPanelOpen(false);







    setGeeAnalyticsOpen(false);







    setToolsMenuOpen(false);







    setPizzaWidgetOpen(false);







    setHeatmapMenuOpen(false);







    NatGeoDirectorStore.set({ isDirectorMode: false });







  };















  const handleFitScreen = () => {







    if (mapHandleRef.current) {







      mapHandleRef.current.resetAntarctica();







      const map = mapHandleRef.current.getMap();







      if (map) {







        map.resize();







      }







    }







    try {







      if (document.fullscreenElement) {







        document.exitFullscreen().catch(() => {});







      } else if (document.documentElement.requestFullscreen) {







        document.documentElement.requestFullscreen().catch(() => {});







      }







    } catch (_) {}







  };















  useEffect(() => {







    const handleKeyDown = (e: KeyboardEvent) => {







      const target = e.target as HTMLElement | null;







      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);















      if (e.key === 'Escape') {







        closeAllOverlays();







      } else if ((e.key === 'f' || e.key === 'F') && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {







        handleFitScreen();







      } else if ((e.key === 'd' || e.key === 'D') && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {







        NatGeoDirectorStore.toggleDirectorMode();







      }







    };















    window.addEventListener('keydown', handleKeyDown);







    return () => window.removeEventListener('keydown', handleKeyDown);







  }, []);















  return (







    <div







      className="relative w-screen h-[100dvh] overflow-hidden flex flex-col select-none bg-[#050e14] text-[#edf5f5]"







      style={{ fontFamily: "'DM Sans', sans-serif" }}







    >







      {/* 1. TOP 5-ELEMENT APPLE HEADER (Hosts AntarcticaNowStrip circumpolar telemetry) */}







      <Header







        onToggleMenu={() => setMenuSheetOpen((prev) => !prev)}







        onOpenSearch={() => setCommandPaletteOpen(true)}







        onOpenPythia={() => setActiveRightDrawer('PYTHIA')}







        onOpenSdgLens={() => openUnifiedControlCenter('ODS')}







        onOpenDirectorMode={() => NatGeoDirectorStore.set({ isDirectorMode: true })}







        onCloseAll={closeAllOverlays}







        onFitScreen={handleFitScreen}







        hasOpenOverlays={hasOpenOverlays}







        activeSdgCount={activeSdgCount}







      />















      {/* 2. MAIN MAP OBSERVATORY CANVAS */}







      <main className="relative flex-1 w-full h-full overflow-hidden">







        {/* MapLibre Canvas with MapControls and Object detail inspection */}







        <WodMapPanel







          ref={mapHandleRef}







          activeLayers={workspace.activeLayers}







          onSelectObject={(obj) => setSelectedObject(obj)}







          className="w-full h-full"







        />















        {/* SAT Mode Metadata Chip */}







        {activeMapMode === 'SAT' && (







          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[220] flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#051119ee] border border-[#35c3c8]/40 shadow-xl backdrop-blur-md text-[10px] font-mono text-[#caf9f7]">







            <span className="w-1.5 h-1.5 rounded-full bg-[#35c3c8] animate-pulse" />







            <span className="font-bold text-[#58d5e3]">NASA GIBS</span>







            <span className="opacity-40">·</span>







            <span>VIIRS SNPP Corrected Reflectance</span>







            <span className="opacity-40">·</span>







            <span className="text-[#8faab5]">{getGibsRecentDate()}</span>







          </div>







        )}















        {/* Floating Quick Close Pill when overlays are active */}







        {hasOpenOverlays && (







          <div className="absolute top-20 right-6 z-[300] hidden sm:flex items-center animate-in fade-in zoom-in-95 duration-150">







            <button







              onClick={closeAllOverlays}







              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#08192bdd]/90 border border-rose-500/40 text-[11px] font-semibold text-rose-200 hover:text-white hover:bg-rose-600/30 shadow-2xl backdrop-blur-xl transition-all active:scale-95 group"







              title="Cerrar todas las ventanas y paneles emergentes (Esc)"







            >







              <X className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-90 transition-transform" />







              <span>Cerrar todo</span>







              <kbd className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-black/40 border border-rose-500/30 text-rose-300">







                Esc







              </kbd>







            </button>







          </div>







        )}















        {/* Floating Active Layer Chips (Solo visible si hay capas activas o filtro ODS) */}







        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[210] pointer-events-auto flex flex-col items-center gap-2 max-w-[94vw] w-fit">







          {activeSdgGoal !== null && (







            <OdsMissionStrip







              activeLayers={workspace.activeLayers}







              activeSdgGoal={activeSdgGoal}







              onSelectSdgGoal={(goal) => {







                setActiveSdgGoal((prev) => (prev === goal ? null : goal));







              }}







              onOpenSdgLens={() => openUnifiedControlCenter('ODS')}







            />







          )}







          <ActiveLayerChips







            activeLayers={workspace.activeLayers}







            onToggleLayer={handleToggleLayer}







            telemetry={telemetry}







            onOpenLibrary={() => openUnifiedControlCenter('CAPAS')}







          />







        </div>















        {/* Left Side: Single Unified Control Center Sidebar */}







        <ControlCenter







          currentTab={workspace.controlCenterTab}







          onTabChange={(tab: ControlCenterTab) => WorkspaceStore.setControlCenterTab(tab)}







          activeLayers={workspace.activeLayers}







          onToggleLayer={handleToggleLayer}







          telemetry={telemetry}
          monitoredVessels={monitoredVessels}







          selectedEntity={workspace.selectedEntity as EntityDetail | null}







          onSelectEntity={(ent) => WorkspaceStore.setSelectedEntity(ent)}







          onFlyTo={handleFlyTo}







          savedViews={workspace.savedViews}







          onSelectSavedView={handleSelectSavedView}







          isOpen={isControlCenterOpen}







          onToggleOpen={() => setIsControlCenterOpen(!isControlCenterOpen)}







          onOpenLayers={() => openUnifiedControlCenter('CAPAS')}







          onOpenFauna={() => {

            (window as any).__amohOpenUnifiedControlCenter?.('CAPAS');

            window.setTimeout(() => (window as any).__amohFocusLayerDomain?.('LIFE'), 100);

          }}







          onOpenGfw={() => {

            (window as any).__amohOpenUnifiedControlCenter?.('CAPAS');

            window.setTimeout(() => (window as any).__amohFocusLayer?.('gfw_fishing_effort'), 100);

          }}







          onOpenCoverage={() => setCoveragePanelOpen(true)}







          onOpenSelfHealing={() => setSelfHealingPanelOpen(true)}







          onOpenPythia={() => setActiveRightDrawer('PYTHIA')}







          onOpenObservation={() => setObsFormOpen(true)}







          onSetLayerOpacity={handleSetLayerOpacity}







          layerOpacities={layerOpacities}







          activeSdgGoal={activeSdgGoal}







          onSelectSdgGoal={(goal) => setActiveSdgGoal(goal)}







        />















        {/* Sidebar Toggle Button (if closed) */}







        {!isControlCenterOpen && (







          <button







            onClick={() => setIsControlCenterOpen(true)}







            className="absolute top-4 left-4 z-[235] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#080e19ee] border border-cyan-500/30 text-[#b7c5d8] hover:text-white hover:bg-[#101c2e] hover:border-cyan-400/60 shadow-xl backdrop-blur-md transition-all group"







            title="Abrir Catálogo de Capas"







          >







            <PanelLeft className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />







            <span className="hidden sm:inline text-xs font-mono font-bold text-cyan-200">Capas</span>







          </button>







        )}















        {/* 4D Temporal Timeline Controller (Osiris 4D) */}







        <OsirisTimeline4D />















        {/* Dock minimizado: deja solo una pastilla para volver a abrirlo. */}
        {dockCollapsed && (
          <button
            onClick={() => setDockCollapsed(false)}
            className="absolute bottom-[76px] md:bottom-5 left-1/2 -translate-x-1/2 z-[220] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#061522f2] border border-[#1e4258] shadow-2xl backdrop-blur-xl pointer-events-auto text-[11px] font-mono text-[#8fd7e8] hover:text-white hover:border-[#38bdf8]/60 transition-all"
            title="Mostrar los controles del mapa"
          >
            <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            <span>CONTROLES</span>
          </button>
        )}

        {activeMapMode === 'BATHYMETRY' && (
          <aside aria-label="Leyenda de batimetría antártica" className="absolute right-3 bottom-[132px] md:bottom-[82px] z-[220] max-w-[calc(100vw-1.5rem)] rounded-lg border border-[#1e4258] bg-[#061522f2] px-3 py-2 text-xs text-[#edf5f5]">
            <p>Elevación del lecho respecto al nivel del mar</p>
            <div aria-hidden="true" className="my-1.5 h-2 rounded" style={{ background: 'linear-gradient(to right, #050b2e, #144f9e, #3f93d3, #e6f5fb)' }} />
            <div className="flex justify-between"><span>−8.000 m</span><span>0 m</span></div>
            <p className="mt-1">Pardos y grises · lecho por encima de 0 m</p>
            <p className="mt-1 text-[#adc5d0]">
              <a className="underline" href="https://doi.org/10.1594/PANGAEA.937574" target="_blank" rel="noreferrer">IBCSO v2 · CC BY 4.0</a>
              {' · '}
              <a className="underline" href="https://www.arcgis.com/home/item.html?id=048c8a152b764f61b626feff253b763e" target="_blank" rel="noreferrer">Esri Ocean</a>
            </p>
          </aside>
        )}
        {geophysicsOpen && !dockCollapsed && (
          <MarineGeophysicsPanel
            activeLayers={workspace.activeLayers}
            onClose={() => setGeophysicsOpen(false)}
            onToggle={(id) => {
              handleToggleHierarchicalLayer(id);
              if (!workspace.activeLayers[id] && id === 'lindeque_sediment_reference') {
                handleFlyTo([-104, -69], 3.2);
              }
            }}
          />
        )}
        {/* UNIFIED RADICAL SIMPLICITY BOTTOM DOCK */}







        <div className={`absolute bottom-[76px] md:bottom-5 left-1/2 -translate-x-1/2 z-[220] flex items-center gap-2.5 bg-[#061522f2] border border-[#1e4258] px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-xl pointer-events-auto max-w-[95vw] overflow-x-auto scrollbar-none ${dockCollapsed ? 'hidden' : ''}`}>







          <button
            onClick={() => setDockCollapsed(true)}
            className="shrink-0 p-1 rounded-full text-[#6f8ba0] hover:text-white hover:bg-white/10 transition-colors"
            title="Minimizar los controles del mapa"
            aria-label="Minimizar los controles del mapa"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {/* Map Modes Switcher: 2D | 3D EARTH | Satélite */}







          <div className="flex items-center gap-1 p-1 rounded-full bg-[#040e16] border border-[#152e3e]">







            {(['MAP', 'GLOBE', 'SAT', 'BATHYMETRY'] as const).map((mode) => (







              <button







                key={mode}







                onClick={() => handleSelectMapMode(mode)}
                aria-pressed={activeMapMode === mode}







                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all min-h-[34px] flex items-center gap-1.5 ${







                  activeMapMode === mode







                    ? 'bg-[#00e5ff] text-[#050e14] shadow-md font-bold'







                    : 'text-[#8faab5] hover:text-white hover:bg-white/5'







                }`}







              >







                <span className="whitespace-nowrap">{mode === 'BATHYMETRY' ? 'Batimetría antártica' : mode === 'MAP' ? 'MAP (2D)' : mode === 'GLOBE' ? '3D EARTH' : 'SAT'}</span>







              </button>







            ))}
            <button
              type="button"
              aria-expanded={geophysicsOpen}
              aria-controls="marine-geophysics-panel"
              onClick={() => setGeophysicsOpen((open) => !open)}
              className={`min-h-[34px] shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors ${geophysicsOpen ? 'bg-cyan-300/20 text-cyan-100' : 'text-[#8faab5] hover:bg-white/5 hover:text-white'}`}
            >
              Geofísica
            </button>
            <a
              href="https://build.nvidia.com/skills"
              target="_blank"
              rel="noreferrer"
              aria-label="Catálogo NVIDIA Skills"
              title="Catálogo NVIDIA Skills"
              className="flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-full px-1.5 text-xs font-medium text-[#d9edf2] hover:bg-white/10"
            >
              <img src="/brand/nvidia-skills.png" alt="" width={28} height={28} className="rounded-md bg-white" />
              <span className="hidden whitespace-nowrap lg:inline">NVIDIA Skills</span>
            </a>
          </div>















          <span className="w-px h-5 bg-[#1a384b] hidden sm:block" />















          <button type="button" aria-label="Abrir tráfico polar y orbital"
            onClick={() => { WorkspaceStore.setControlCenterTab('NOW'); setIsControlCenterOpen(true); }}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-[#adc5d0] hover:bg-white/10 hover:text-white">
            Tráfico
            <span className="ml-2 hidden font-mono lg:inline">
              Barcos {traffic.vessels.count ?? '—'} · Aviones {traffic.aircraft.count ?? '—'} · Satélites {traffic.satellites.count ?? '—'}
            </span>
          </button>















          <span className="w-px h-5 bg-[#1a384b]" />















          {/* Direct Layer Library Button in Dock */}







          <button







            onClick={() => openUnifiedControlCenter('CAPAS')}







            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all min-h-[34px] border shadow-sm ${







              layerLibraryOpen || activeThematicCount > 0







                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/60'







                : 'bg-[#091b29] text-[#8faab5] border-[#1d3d52] hover:bg-[#112d42] hover:text-white'







            }`}







            title="Abrir Catálogo de Capas"







          >







            <Layers className="w-3.5 h-3.5 text-[#00e5ff]" />







            <span className="hidden sm:inline">Capas</span>







            {activeThematicCount > 0 && (







              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-[#00e5ff] text-black">







                {activeThematicCount}







              </span>







            )}







          </button>















          {/* Dedicated Heatmap Button in Dock */}







          <button







            onClick={() => setHeatmapMenuOpen((prev) => !prev)}







            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all min-h-[34px] border shadow-sm ${







              isAnyHeatmapActive







                ? 'bg-[#ff9100] text-[#050e14] border-[#ffb049]'







                : heatmapMenuOpen







                ? 'bg-[#ff9100]/25 text-[#ffb049] border-[#ff9100]'







                : 'bg-[#181109] text-[#ffd699] border-[#6b3a0e] hover:bg-[#281b0f] hover:border-[#ff9100]'







            }`}







            title="Mapas de Calor"







          >







            <Flame className="w-3.5 h-3.5" />







            <span className="hidden sm:inline">Calor</span>







          </button>















          {/* Unified Tools Popover Trigger */}







          <div className="relative">







            <button







              onClick={() => setToolsMenuOpen((prev) => !prev)}







              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all min-h-[34px] border ${







                toolsMenuOpen







                  ? 'bg-[#35c3c8] text-[#050e14] border-[#35c3c8]'







                  : 'bg-[#081a26] text-[#caf9f7] border-[#22475e] hover:bg-[#102d3f] hover:text-white'







              }`}







              title="Herramientas y analítica"







            >







              <Sparkles className="w-3.5 h-3.5" />







              <span>Herramientas</span>







              <ChevronDown className={`w-3 h-3 transition-transform ${toolsMenuOpen ? 'rotate-180' : ''}`} />







            </button>















            {/* Floating Unified Tools Palette */}







            {toolsMenuOpen && (







              <div className="absolute bottom-[48px] right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-80 rounded-2xl bg-[#061522f8] border border-[#204961] shadow-2xl p-3 z-[300] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">







                <div className="px-2 py-1 mb-2 text-xs font-mono uppercase tracking-wider text-[#72a1b5] border-b border-[#142e3f] font-bold flex items-center justify-between">







                  <span>Herramientas</span>







                  <button onClick={() => setToolsMenuOpen(false)} className="text-[#72a1b5] hover:text-white">✕</button>







                </div>















                <div className="grid grid-cols-2 gap-2 text-xs font-mono">







                  {/* Modo Director NatGeo */}







                  <button







                    onClick={() => {







                      NatGeoDirectorStore.set({ isDirectorMode: true });







                      setToolsMenuOpen(false);







                    }}







                    className="col-span-2 p-2.5 rounded-xl border bg-[#1a1505] border-[#FFCC00]/50 text-[#FFCC00] hover:bg-[#282007] flex items-center justify-between text-left transition-all"







                  >







                    <div className="flex items-center gap-2">







                      <Film className="w-4 h-4 text-[#FFCC00]" />







                      <span className="font-bold text-white text-xs">Modo Director 4K</span>







                    </div>







                    <span className="text-xs text-[#FFCC00] font-semibold">Activar →</span>







                  </button>















                  {/* Fauna */}







                  <button







                    onClick={() => {

                      setToolsMenuOpen(false);

                      (window as any).__amohOpenUnifiedControlCenter?.('CAPAS');

                      window.setTimeout(() => (window as any).__amohFocusLayerDomain?.('LIFE'), 100);

                    }}







                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${







                      faunaStripOpen ? 'bg-[#58d5e3]/20 border-[#58d5e3] text-[#58d5e3]' : 'bg-[#0a1e2d] border-[#183649] text-[#9bb5c2] hover:bg-[#102a3d] hover:text-white'







                    }`}







                  >







                    <span>🐧</span>







                    <span className="font-semibold text-white text-xs">Fauna Polar</span>







                  </button>















                  {/* Analítica GEE */}







                  <button







                    onClick={() => {







                      const firstActive = Object.keys(workspace.activeLayers).find((k) => workspace.activeLayers[k]);







                      setSelectedAnalyticsLayerId(firstActive || 'maritime_vessels');







                      setGeeAnalyticsOpen((prev) => !prev);







                      setToolsMenuOpen(false);







                    }}







                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${







                      geeAnalyticsOpen ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]' : 'bg-[#0a1e2d] border-[#183649] text-[#9bb5c2] hover:bg-[#102a3d] hover:text-white'







                    }`}







                  >







                    <span>✨</span>







                    <span className="font-semibold text-white text-xs">Analítica GEE</span>







                  </button>















                  {/* Pythia IA */}







                  <button







                    onClick={() => { setAgentMeshOpen(true); setToolsMenuOpen(false); }}







                    className="p-2.5 rounded-xl border bg-[#0a1e2d] border-[#183649] text-[#9bb5c2] hover:bg-[#102a3d] hover:text-white flex items-center gap-2 text-left transition-all"







                  >







                    <span>🤖</span>







                    <span className="font-semibold text-white text-xs">Pythia IA</span>







                  </button>















                  {/* Eventos */}







                  <button







                    onClick={() => { setEventsStreamOpen(true); setToolsMenuOpen(false); }}







                    className="p-2.5 rounded-xl border bg-[#0a1e2d] border-[#183649] text-[#9bb5c2] hover:bg-[#102a3d] hover:text-white flex items-center gap-2 text-left transition-all"







                  >







                    <span>📡</span>







                    <span className="font-semibold text-white text-xs">Eventos</span>







                  </button>















                  {/* Leyenda */}







                  <button







                    onClick={() => {







                      setLegendOpen((prev) => !prev);







                      setLegendKey((k) => k + 1);







                      setToolsMenuOpen(false);







                    }}







                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${







                      legendOpen ? 'bg-[#35c3c8]/20 border-[#35c3c8] text-[#35c3c8]' : 'bg-[#0a1e2d] border-[#183649] text-[#9bb5c2] hover:bg-[#102a3d] hover:text-white'







                    }`}







                  >







                    <span>🗺️</span>







                    <span className="font-semibold text-white text-xs">Leyenda</span>







                  </button>















                  {/* Criósfera */}







                  <button







                    onClick={() => { setStoryModalOpen(true); setToolsMenuOpen(false); }}







                    className="p-2.5 rounded-xl border bg-[#0a1e2d] border-[#183649] text-[#9bb5c2] hover:bg-[#102a3d] hover:text-white flex items-center gap-2 text-left transition-all"







                  >







                    <span>❄️</span>







                    <span className="font-semibold text-white text-xs">Criósfera</span>







                  </button>







                </div>







              </div>







            )}







          </div>















          <span className="w-px h-5 bg-[#1a384b]" />















          {/* Big Quick Action: + Observar */}







          <button







            onClick={() => setObsFormOpen(true)}







            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#35c3c8] hover:from-[#35c3c8] hover:to-[#5eead4] text-[#050e14] font-mono font-bold text-xs shadow-md transition-all min-h-[34px] active:scale-95 shrink-0"







            title="Registrar observación de campo"







          >







            <span>➕</span>







            <span>Observar</span>







          </button>







        </div>















        {/* Heatmaps Quick Selector Popover */}







        {heatmapMenuOpen && (







          <div className="absolute bottom-16 right-4 sm:right-28 z-[300] bg-[#06141fee] border border-[#1e455e] rounded-2xl p-3 shadow-2xl backdrop-blur-xl font-mono text-xs w-72 animate-in fade-in slide-in-from-bottom-2 duration-150">







            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#163040]">







              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#ff9100] uppercase">







                <Flame className="w-4 h-4 text-[#ff9100]" />







                <span>Mapas de calor</span>







              </div>







              <button







                onClick={() => setHeatmapMenuOpen(false)}







                className="p-1 rounded text-[#8faab5] hover:text-white hover:bg-white/10"







              >







                <X className="w-3.5 h-3.5" />







              </button>







            </div>







            <div className="space-y-1.5">







              {[







                { id: 'grey_zones_defense_heatmap', label: 'Fricción & Zonas Grises', icon: '🛡️' },







                { id: 'polar_friction_sectors', label: 'Sectores Fricción Polar (PFI)', icon: '🌐' },







                { id: 'grey_zones_buffers', label: 'Radios & Buffers SIGINT', icon: '📡' },







                { id: 'fauna_density_heatmap', label: 'Fauna Marina (Krill)', icon: '🦐' },







                { id: 'penguin_heatmap', label: 'Colonias de Pingüinos', icon: '🐧' },







                { id: 'whales_heatmap', label: 'Cetáceos / Ballenas', icon: '🐋' },







                { id: 'gfw_fishing_effort_heatmap', label: 'Esfuerzo Pesquero GFW', icon: '🐟' },







                { id: 'nuclear_contamination_heatmap', label: 'Residuos Nucleares', icon: '☢️' },







                { id: 'seismic_heatmap', label: 'Concentración Sísmica', icon: '🌋' },







              ].map((hm) => {







                const isActive = !!(workspace.activeLayers as any)[hm.id];







                return (







                  <button







                    key={hm.id}







                    onClick={() => handleToggleHierarchicalLayer(hm.id)}







                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-all text-left ${







                      isActive







                        ? 'bg-[#123348] border-[#38bdf8] text-white shadow-sm'







                        : 'bg-[#081b27]/70 border-[#142e3f] text-[#8faab5] hover:bg-[#0c2434] hover:text-white'







                    }`}







                  >







                    <div className="flex items-center gap-2">







                      <span>{hm.icon}</span>







                      <span className="font-semibold text-[11px]">{hm.label}</span>







                    </div>







                    <span







                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${







                        isActive ? 'bg-[#38bdf8] text-[#050e14]' : 'bg-[#142b3b] text-[#5a7788]'







                      }`}







                    >







                      {isActive ? 'ACTIVO' : 'OFF'}







                    </span>







                  </button>







                );







              })}







            </div>







          </div>







        )}















        {/* Bottom Left: Automatic Dynamic Legend (Generated from active layers only) */}







        {legendOpen && (







          <div className="absolute bottom-16 left-6 z-[200]">







            <AutoLegend







              key={legendKey}







              activeLayers={workspace.activeLayers}







              onClose={() => setLegendOpen(false)}







            />







          </div>







        )}















        {/* Progressive Disclosure Object Detail Card */}







        {selectedObject && (







          <ObjectDetailCard







            data={selectedObject}







            onClose={() => setSelectedObject(null)}







            onCenterOnMap={(lat, lon) => handleFlyTo([lon, lat], 6.5)}







          />







        )}

        {oceanPoint && (
          <div className="fixed left-3 top-24 z-[60] pointer-events-auto">
            <OceanPointCard
              lat={oceanPoint.lat}
              lon={oceanPoint.lon}
              onClose={() => setOceanPoint(null)}
              onFlyTo={(coords) => handleFlyTo(coords, 6.5)}
            />
          </div>
        )}
















        {/* V8.2 Modals */}







        <HierarchicalLayerLibrary







          isOpen={layerLibraryOpen}







          onClose={() => setLayerLibraryOpen(false)}







          activeLayerIds={Object.keys(workspace.activeLayers).filter((k) => (workspace.activeLayers as any)[k])}







          onToggleLayer={handleToggleHierarchicalLayer}







          onSetOpacity={handleSetLayerOpacity}







          layerOpacities={layerOpacities}







        />















        <CommandPalette







          isOpen={commandPaletteOpen}







          onClose={() => setCommandPaletteOpen(false)}







          onSelectAction={handleExecuteCommandAction}







        />















        <EventsStreamModal







          isOpen={eventsStreamOpen}







          onClose={() => setEventsStreamOpen(false)}







          onSelectEvent={(coords, reqLayer, entity) => {







            if (reqLayer) {







              WorkspaceStore.toggleLayer(reqLayer as any);







            }







            if (mapHandleRef.current) {







              mapHandleRef.current.flyTo(coords, 5.5);







            }







            if (entity) {







              setSelectedObject(entity);







            }







          }}







        />















        <AgentMeshModal







          isOpen={agentMeshOpen}







          onClose={() => setAgentMeshOpen(false)}







          onExecuteMapAction={(act, p) => {







            if (act === 'TOGGLE_LAYER' && p) WorkspaceStore.toggleLayer(p as any);







            if (act === 'FLY_TO_SECTOR') handleFlyTo([-45.0, -75.0], 4.0);







          }}







          currentSector={activeZone.name}







          activeLayers={Object.keys(workspace.activeLayers).filter((k) => (workspace.activeLayers as any)[k])}







        />















        {/* Right Tool Rail Drawer (PYTHIA, VESSELS, SATELLITES, CAMERAS) */}







        <RightToolRail







          activeDrawer={activeRightDrawer}







          onClose={() => setActiveRightDrawer(null)}







          onFlyToCoordinates={handleFlyTo}







        />















        {/* Polar Fauna Circumpolar Strip */}







        <FaunaStrip







          isOpen={faunaStripOpen}







          onClose={() => setFaunaStripOpen(false)}







          onSelectSpecies={(species) => {







            if (species.coordinates) {







              handleFlyTo(species.coordinates, 5.2);







            }







          }}







        />















        {/* GFW Whole-Continent Fisheries Panel */}







        <GfwPanel







          isOpen={gfwPanelOpen}







          onClose={() => setGfwPanelOpen(false)}







          onSelectVessel={(vessel) => {







            console.log('Selected vessel:', vessel);







          }}







          onFlyToCoords={(coords, zoom) => handleFlyTo(coords, zoom || 8)}







        />















        {/* 18-Sector Whole-Continent Coverage Panel */}







        <CoveragePanel







          isOpen={coveragePanelOpen}







          onClose={() => setCoveragePanelOpen(false)}







          onFlyToSector={handleFlyTo}







        />















        {/* 3-Ring Self-Healing Status & Diagnostics Panel */}







        <SelfHealingPanel







          isOpen={selfHealingPanelOpen}







          onClose={() => setSelfHealingPanelOpen(false)}







        />















        {/* Google Earth Engine Style Layer Analytics & Heatmaps */}







        <GeeLayerAnalytics







          isOpen={geeAnalyticsOpen}







          onClose={() => setGeeAnalyticsOpen(false)}







          activeLayerId={selectedAnalyticsLayerId || Object.keys(workspace.activeLayers).find((k) => workspace.activeLayers[k]) || 'maritime_vessels'}







          onToggleHeatmap={(layerId) => {







            const heatmapAlias = `${layerId}_heatmap`;







            WorkspaceStore.toggleLayer(heatmapAlias as any);







          }}







          isHeatmapActive={Object.keys(workspace.activeLayers).some((l) => l.includes('heatmap') && workspace.activeLayers[l])}







        />















        {/* INACH Shetland del Sur 23 Bases Inset Panel */}







        <InachShetlandInset







          isOpen={inachInsetOpen}







          onClose={() => setInachInsetOpen(false)}







          onFlyToStation={(coords, zoom) => handleFlyTo(coords, zoom || 11)}







        />















        {/* Cryosphere SatSchool StoryMap ("La Antártida desde el Espacio") */}







        <CryosphereStoryModal







          isOpen={storyModalOpen}







          onClose={() => setStoryModalOpen(false)}







          onFlyToPreset={(preset) => {







            const m = mapHandleRef.current?.getMap();







            if (m) {







              m.easeTo({







                center: preset.center,







                zoom: preset.zoom,







                pitch: preset.pitch,







                bearing: preset.bearing,







                duration: 1500,







              });







            }







          }}







          onActivateLayer={(layerId) => WorkspaceStore.toggleLayer(layerId as any)}







          onOpenSwipe={() => {







            setStoryModalOpen(false);







            setSwipeOpen(true);







          }}







        />















        {/* Map Swipe Comparison Mode */}







        <MapSwipeComparison







          isOpen={swipeOpen}







          onClose={() => setSwipeOpen(false)}







        />















        {/* Pentagon Pizza Index OSINT Widget */}







        {pizzaWidgetOpen && (







          <PentagonPizzaIndexWidget







            onClose={() => setPizzaWidgetOpen(false)}







            onFlyToPentagon={() => handleFlyTo([38.8719, -77.0563], 13)}







          />







        )}















        {/* NatGeo Expedition 4K Cinematic Director Suite */}







        {isDirectorMode && (







          <NatGeoDirectorSuite







            mapHandle={mapHandleRef.current}







            onClose={() => NatGeoDirectorStore.set({ isDirectorMode: false })}







          />







        )}







      </main>















      {/* 4. MOBILE BOTTOM NAV (4 items only: MAP | OBSERVE | MISSION | MENU) */}







      <MobileBottomNav







        activeTab={activeMobileTab}







        onSelectTab={(tab) => {







          setActiveMobileTab(tab);







          if (tab === 'MAP') {







            setIsControlCenterOpen(false);







            setMenuSheetOpen(false);







            setSdgDrawerOpen(false);







            setSelectedObject(null);







          } else if (tab === 'OBSERVE') {







            setObsFormOpen(true);







          } else if (tab === 'MISSION') {







            navigate('/briefing');







          } else if (tab === 'MENU') {







            setMenuSheetOpen(true);







          }







        }}







      />















      {false && <CrossAnalysisPanel />}







      {false && <SpatialMetricPanel />}















      {/* 5. IPHONE-LIKE FLOATING MENÚ SHEET */}







      <MenuSheet







        isOpen={menuSheetOpen}







        onClose={() => setMenuSheetOpen(false)}







        activeMode={activeMapMode}







        onSelectMapMode={handleSelectMapMode}







        onOpenSdgLens={() => {







          setMenuSheetOpen(false);







          openUnifiedControlCenter('ODS');







        }}







        onOpenCatalog={() => {







          setMenuSheetOpen(false);







          setIsControlCenterOpen(true);







        }}







        onOpenObservationModal={() => {







          setMenuSheetOpen(false);







          setObsFormOpen(true);







        }}







        onOpenPairing={() => {







          setMenuSheetOpen(false);







          setQrOpen(true);







        }}







        onOpenSystemHealth={() => {







          setMenuSheetOpen(false);







          setSystemHealthOpen(true);







        }}







      />















      {/* 6. SDG LENS DRAWER */}







      <SdgLensDrawer







        isOpen={sdgDrawerOpen}







        onClose={() => setSdgDrawerOpen(false)}







        activeGoalNumber={activeSdgGoal}







        onSelectGoal={(goalNum) => setActiveSdgGoal(goalNum)}







      />















      {/* Observation Modal */}







      {obsFormOpen && (







        <ObservationModal







          isOpen={obsFormOpen}







          onClose={() => setObsFormOpen(false)}







          onSave={handleSaveObservation}







        />







      )}















      {/* QR Join Panel */}







      {qrOpen && <QrJoinPanel onClose={() => setQrOpen(false)} />}















      {/* V8.4 Continuous Self-Audit & Self-Healing Health Dashboard */}







      <SystemHealthModal







        isOpen={systemHealthOpen}







        onClose={() => setSystemHealthOpen(false)}







      />







    </div>







  );







}


















































