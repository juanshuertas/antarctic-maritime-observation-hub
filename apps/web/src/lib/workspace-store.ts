/**
 * AMOH Workspace Persistence Store (Master Consolidated V4)
 * Storage key: amoh:workspace:v3
 *
 * Persists:
 * - mapMode: 'MAP' | 'GLOBE' | 'SAT' | 'SURIE'
 * - camera: latitude, longitude, zoom, bearing, pitch
 * - activeLayers: Record<string, boolean>
 * - controlCenterTab: 'NOW' | 'EXPLORE' | 'SEARCH' | 'SAVED'
 * - depth: number (0 - 4000m)
 * - savedViews: custom spatial bookmarks
 * - favorites: user-bookmarked entity IDs
 *
 * Rule: NEVER store API tokens, secrets, or passwords.
 */

import type { MapMode } from './spatial-camera-store';
export type { MapMode } from './spatial-camera-store';
export type ControlCenterTab = 'NOW' | 'EXPLORE' | 'EXPEDITION' | 'SEARCH' | 'SAVED';

export interface SavedView {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  mode: MapMode;
  layers: string[];
}

export interface WorkspaceV3State {
  version: number;
  mapMode: MapMode;
  camera: {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
  };
  activeLayers: Record<string, boolean>;
  controlCenterTab: ControlCenterTab;
  depthMeters: number;
  selectedEntity: {
    id: string;
    type: 'vessel' | 'aircraft' | 'satellite' | 'fauna' | 'seismic' | 'station' | 'sensor' | 'cable';
    title: string;
    subtitle?: string;
    data?: any;
  } | null;
  savedViews: SavedView[];
  favorites: string[];
  environmentVariable: 'wind' | 'temp' | 'pressure' | 'waves' | 'ice' | 'currents';
  commercialMode: boolean; // Commercial/Enterprise license gate
}

export const STORAGE_KEY_V19 = 'amoh:workspace:v21';
export const STORAGE_KEY_V18 = STORAGE_KEY_V19;
export const STORAGE_KEY_V17 = STORAGE_KEY_V19;
export const STORAGE_KEY_V16 = STORAGE_KEY_V19;
export const STORAGE_KEY_V15 = STORAGE_KEY_V19;
export const STORAGE_KEY_V14 = STORAGE_KEY_V19;
export const STORAGE_KEY_V13 = STORAGE_KEY_V19;
export const STORAGE_KEY_V12 = STORAGE_KEY_V19;
export const STORAGE_KEY_V11 = STORAGE_KEY_V19;
export const STORAGE_KEY_V10 = STORAGE_KEY_V19;
export const STORAGE_KEY_V7 = STORAGE_KEY_V19;

// Estado inicial: NINGUNA capa activa. El mapa arranca limpio y es la persona
// quien enciende lo que necesita desde el catalogo de capas.
export const DEFAULT_WORKSPACE_V7: WorkspaceV3State = {
  version: 21,
  mapMode: 'MAP',
  camera: {
    latitude: -75.0,
    longitude: 0.0,
    zoom: 2.2,
    bearing: 0,
    pitch: 0,
  },
  activeLayers: {
    quantarctica_coast: false,
    quantarctica_ice: false,
    quantarctica_bathymetry: false,
    quantarctica_glaciers: false,
    quantarctica_stations: false,
    comnap_facilities: false,
    maritime_vessels: false,
    polar_aircraft: false,
    maritime_corridors: false,
    strategic_waterways: false,
    treaty_claims: false,
    iaato_routes: false,
    iaato_landing_sites: false,
    iaato_deep_field_camps: false,
    tourism_routes: false,
    ccamlr_zones: false,
    sar_regions: false,
    aspa: false,
    fisheries_effort: false,
    gfw_fishing_effort: false,
    gfw_sar_detections: false,
    polar_satellites: false,
    antarctic_fauna: false,
    fauna_krill_swarms: false,
    fauna_whale_pods: false,
    fauna_penguins: false,
    fauna_pinnipeds: false,
    fauna_seabirds: false,
    fauna_benthos: false,
    fauna_cetaceans: false,
    fauna_fish: false,
    fauna_krill: false,
    olea_antarctic_hexacorals: false,
    olea_antarctic_stylasteridae: false,
    seismic_events: false,
    submarine_cables: false,
    cctv_cams: false,
    mirofish_heatmap: false,
    ocean_currents: false,
    wind_particles: false,
    maris_nuclear: false,
    maris_measurements: false,
    argo_floats: false,
    biodiversity_atlas: false,
    offshore_energy: false,
    offshore_wells: false,
    deepsea_mining: false,
    field_observations: false,
    expedition_cruises: false,
    sea_ice_concentration: false,
    ozone_layer: false,
    grey_zones_defense_heatmap: false,
    polar_friction_sectors: false,
  },
  controlCenterTab: 'NOW',
  depthMeters: 0,
  selectedEntity: null,
  savedViews: [
    {
      id: 'peninsula-maritime',
      name: 'Península Antártica — Marítimo',
      description: 'Estrecho de Bransfield, Canal Gerlache y flota AIS activa',
      latitude: -64.8,
      longitude: -63.0,
      zoom: 5.2,
      bearing: 15,
      pitch: 35,
      mode: 'GLOBE',
      layers: ['quantarctica_coast', 'quantarctica_ice', 'maritime_vessels', 'quantarctica_stations'],
    },
    {
      id: 'weddell-ice',
      name: 'Mar de Weddell — Criósfera',
      description: 'Barrera de hielo Larsen C y circulación ciclónica',
      latitude: -71.5,
      longitude: -45.0,
      zoom: 4.2,
      bearing: 0,
      pitch: 20,
      mode: 'MAP',
      layers: ['quantarctica_coast', 'quantarctica_ice'],
    },
    {
      id: 'scotia-seismic',
      name: 'Arco de Scotia — Tectónica',
      description: 'Fosa de las Sandwich del Sur y actividad sísmica activa',
      latitude: -58.0,
      longitude: -35.0,
      zoom: 4.0,
      bearing: 0,
      pitch: 15,
      mode: 'MAP',
      layers: ['quantarctica_coast', 'seismic_events', 'submarine_cables'],
    },
    {
      id: 'south-shetland-fauna',
      name: 'Islas Shetland del Sur — Biodiversidad',
      description: 'Avistamientos de cetáceos, pingüineras y registros OBIS',
      latitude: -62.2,
      longitude: -58.6,
      zoom: 6.8,
      bearing: 0,
      pitch: 0,
      mode: 'GLOBE',
      layers: ['quantarctica_coast', 'antarctic_fauna', 'aspa'],
    },
  ],
  favorites: [],
  environmentVariable: 'wind',
  commercialMode: false,
};

type WorkspaceListener = (state: WorkspaceV3State) => void;

class WorkspaceStoreManager {
  private state: WorkspaceV3State;
  private listeners: Set<WorkspaceListener> = new Set();

  constructor() {
    this.state = this.load();
  }

  private load(): WorkspaceV3State {
    try {
      localStorage.removeItem('amoh:workspace:v17');
      localStorage.removeItem('amoh:workspace:v16');
      localStorage.removeItem('amoh:workspace:v15');
      localStorage.removeItem('amoh:workspace:v14');
      localStorage.removeItem('amoh:workspace:v13');
      localStorage.removeItem('amoh:workspace:v12');
      localStorage.removeItem('amoh:workspace:v11');
      localStorage.removeItem('amoh:workspace:v10');
      localStorage.removeItem('amoh:workspace:v8_3');
      localStorage.removeItem('amoh:workspace:v8');
      localStorage.removeItem('amoh:workspace:v5');
      localStorage.removeItem('amoh:workspace:v3');

      const raw = localStorage.getItem(STORAGE_KEY_V18);
      if (!raw) return { ...DEFAULT_WORKSPACE_V7 };
      const parsed = JSON.parse(raw);
      if (parsed.version !== 21) {
        return { ...DEFAULT_WORKSPACE_V7 };
      }
      // Se respeta exactamente lo que la persona dejo encendido, incluso si es
      // nada. La regla anterior (menos de 2 capas -> restaurar las de por
      // defecto) hacia imposible arrancar con el mapa limpio.
      // El mapa SIEMPRE arranca limpio: ninguna capa encendida. No se restaura
      // lo que quedo activo en la sesion anterior, para no descargar datos que
      // nadie pidio al abrir. La persona enciende lo que necesita.
      const activeLayers = { ...DEFAULT_WORKSPACE_V7.activeLayers };
      // AMOH_SATELLITE_LAYER_CANONICAL_MIGRATION_V2
      // AMOH_SATELLITE_LAYER_CANONICAL_MIGRATION_V4
      // AMOH_SATELLITE_LAYER_CANONICAL_MIGRATION_V3
      if ((activeLayers as any).satellite_tracking === true) {
        (activeLayers as any).polar_satellites = true;
      }
      delete (activeLayers as any).satellite_tracking;


      // Directiva de usuario: Ninguna capa de mapa de calor debe quedar activa al inicio
      const HEATMAP_LAYER_KEYS = [
        'grey_zones_defense_heatmap',
        'polar_friction_sectors',
        'grey_zones_buffers',
        'mirofish_heatmap',
        'fauna_density_heatmap',
        'species_migration_heatmap',
        'penguin_heatmap',
        'whales_heatmap',
        'gfw_fishing_effort_heatmap',
        'nuclear_contamination_heatmap',
        'seismic_heatmap',
      ];
      HEATMAP_LAYER_KEYS.forEach((k) => {
        (activeLayers as any)[k] = false;
      });

      // Directiva de usuario: Capas atmosféricas inactivas por defecto
      const ATMOSPHERE_LAYER_KEYS = [
        'ozone_layer',
        'antarctic_ozone',
        'atmosphere',
        'atmosphere_temp',
        'wind_particles',
        'cloud_cover',
      ];
      ATMOSPHERE_LAYER_KEYS.forEach((k) => {
        (activeLayers as any)[k] = false;
      });

      // Keep one semantic layer per dataset family at circumpolar scale.
      // Detailed taxon layers supersede the aggregate fauna layer, and
      // COMNAP is the canonical source for station symbols.
      if ((activeLayers as any).comnap_facilities) {
        (activeLayers as any).quantarctica_stations = false;
      }
      const detailedFaunaLayers = [
        'fauna_krill_swarms',
        'fauna_whale_pods',
        'fauna_penguins',
        'fauna_pinnipeds',
        'fauna_seabirds',
        'fauna_benthos',
        'fauna_cetaceans',
        'fauna_fish',
        'fauna_krill',
      ];
      if (detailedFaunaLayers.some((key) => (activeLayers as any)[key])) {
        (activeLayers as any).antarctic_fauna = false;
      }

      return {
        ...DEFAULT_WORKSPACE_V7,
        ...parsed,
        camera: { ...DEFAULT_WORKSPACE_V7.camera, ...(parsed.camera || {}) },
        activeLayers,
        savedViews: Array.isArray(parsed.savedViews) && parsed.savedViews.length > 0 ? parsed.savedViews : DEFAULT_WORKSPACE_V7.savedViews,
      };
    } catch {
      return { ...DEFAULT_WORKSPACE_V7 };
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY_V17, JSON.stringify(this.state));
    } catch (e) {
      console.warn('[AMOH Workspace] Failed to persist workspace state:', e);
    }
    this.notify();
  }

  getState(): WorkspaceV3State {
    return { ...this.state };
  }

  get(): WorkspaceV3State {
    return this.getState();
  }

  setState(partial: Partial<WorkspaceV3State>) {
    this.state = { ...this.state, ...partial };
    this.save();
  }

  setMapMode(mapMode: MapMode) {
    this.setState({ mapMode });
  }

  setCamera(camera: Partial<WorkspaceV3State['camera']>) {
    this.state.camera = { ...this.state.camera, ...camera };
    this.save();
  }

  setLayer(layerId: string, enabled: boolean) {
    this.state.activeLayers = {
      ...this.state.activeLayers,
      [layerId]: enabled,
    };
    this.save();
  }

  toggleLayer(layerId: string, enabled?: boolean) {
    const nextVal = enabled !== undefined ? enabled : !this.state.activeLayers[layerId];
    this.setLayer(layerId, nextVal);
  }

  loadSavedView(view: SavedView) {
    const newLayers = { ...this.state.activeLayers };
    if (view.layers && view.layers.length > 0) {
      Object.keys(newLayers).forEach((k) => {
        newLayers[k] = view.layers.includes(k);
      });
    }
    this.state.mapMode = view.mode;
    this.state.camera = {
      latitude: view.latitude,
      longitude: view.longitude,
      zoom: view.zoom,
      bearing: view.bearing,
      pitch: view.pitch,
    };
    this.state.activeLayers = newLayers;
    this.save();
  }

  setLayers(layers: Record<string, boolean>) {
    this.state.activeLayers = { ...layers };
    this.save();
  }

  setControlCenterTab(tab: ControlCenterTab) {
    this.setState({ controlCenterTab: tab });
  }

  setSelectedEntity(entity: WorkspaceV3State['selectedEntity']) {
    this.setState({ selectedEntity: entity });
  }

  clearSelectedEntity() {
    this.setState({ selectedEntity: null });
  }

  addSavedView(view: Omit<SavedView, 'id'>) {
    const newView: SavedView = {
      ...view,
      id: `view-${Date.now()}`,
    };
    this.setState({ savedViews: [newView, ...this.state.savedViews] });
  }

  removeSavedView(id: string) {
    this.setState({
      savedViews: this.state.savedViews.filter((v) => v.id !== id),
    });
  }

  toggleFavorite(id: string) {
    const favs = new Set(this.state.favorites);
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);
    this.setState({ favorites: Array.from(favs) });
  }

  setCommercialMode(enabled: boolean) {
    this.setState({ commercialMode: enabled });
  }

  subscribe(listener: WorkspaceListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((cb) => cb(s));
  }
}

export const WorkspaceStore = new WorkspaceStoreManager();

if (typeof window !== 'undefined') {
  (window as any).__workspaceStore = WorkspaceStore;
}
