/**
 * AMOH Spatial Camera Store & Multi-Renderer State
 * Rules 2, 3, 4, 13: Shared camera coordinates across renderers.
 */

export type MapMode = 'MAP' | 'GLOBE' | 'SAT' | 'BATHYMETRY';

export interface SpatialCameraState {
  latitude: number;
  longitude: number;
  altitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  roll: number;
  activeMode: MapMode;
  selectedEntityId: string | null;
  selectedRegion: string;
  selectedTimeUtc: string;
  isPlaying?: boolean;
  playbackSpeed?: number;
  timeRangeHours?: number;
  isLive?: boolean;
}

export interface SectorPreset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export const SECTOR_PRESETS: SectorPreset[] = [
  { id: 'HOME', name: 'Antártida Total (Digital Earth 4D)', lat: -82.0, lng: -50.0, zoom: 1.85, pitch: 45, bearing: 0 },
  { id: 'WEDDELL', name: 'Mar de Weddell & Filchner', lat: -73.0, lng: -45.0, zoom: 3.8, pitch: 40, bearing: 0 },
  { id: 'ROSS', name: 'Mar de Ross & McMurdo', lat: -75.0, lng: 175.0, zoom: 3.8, pitch: 40, bearing: 180 },
  { id: 'EAST', name: 'Antártida Oriental (Prydz / Davis)', lat: -68.5, lng: 80.0, zoom: 3.5, pitch: 35, bearing: 90 },
  { id: 'PENINSULA', name: 'Península & Paso Drake', lat: -64.8, lng: -63.5, zoom: 4.5, pitch: 45, bearing: 330 },
  { id: 'AMUNDSEN', name: 'Mar de Amundsen & Thwaites', lat: -73.0, lng: -105.0, zoom: 3.8, pitch: 40, bearing: 270 },
];

// Antarctica Home default viewpoint — Fast & lightweight satellite map
export const DEFAULT_ANTARCTIC_CAMERA: SpatialCameraState = {
  latitude: -75.0,
  longitude: 0.0,
  altitude: 800000,
  zoom: 2.2,
  bearing: 0,
  pitch: 0,
  roll: 0,
  activeMode: 'MAP',
  selectedEntityId: null,
  selectedRegion: 'Antártida Total (Digital Earth 4D)',
  selectedTimeUtc: new Date().toISOString(),
  isPlaying: false,
  playbackSpeed: 1,
  timeRangeHours: 24,
  isLive: true,
};

type Listener = (state: SpatialCameraState) => void;

class SpatialCameraStoreManager {
  private state: SpatialCameraState = { ...DEFAULT_ANTARCTIC_CAMERA };
  private listeners: Set<Listener> = new Set();

  getState(): SpatialCameraState {
    return { ...this.state };
  }

  setState(partial: Partial<SpatialCameraState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  setMode(mode: MapMode) {
    this.setState({ activeMode: mode });
  }

  setTime(iso: string) {
    this.setState({ selectedTimeUtc: iso, isLive: false });
  }

  setLive() {
    this.setState({ selectedTimeUtc: new Date().toISOString(), isLive: true, isPlaying: false });
  }

  setPlaying(isPlaying: boolean) {
    this.setState({ isPlaying, isLive: false });
  }

  setPlaybackSpeed(playbackSpeed: number) {
    this.setState({ playbackSpeed });
  }

  setTimeRangeHours(timeRangeHours: number) {
    this.setState({ timeRangeHours });
  }

  setCoordinates(lat: number, lng: number, zoom?: number, bearing?: number, pitch?: number) {
    this.setState({
      latitude: lat,
      longitude: lng,
      ...(zoom !== undefined ? { zoom } : {}),
      ...(bearing !== undefined ? { bearing } : {}),
      ...(pitch !== undefined ? { pitch } : {}),
    });
  }

  flyToSector(sectorId: string) {
    const preset = SECTOR_PRESETS.find((p) => p.id === sectorId) || SECTOR_PRESETS[0];
    this.setState({
      latitude: preset.lat,
      longitude: preset.lng,
      zoom: preset.zoom,
      pitch: preset.pitch,
      bearing: preset.bearing,
      selectedRegion: preset.name,
    });
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((cb) => cb(s));
  }
}

export const SpatialCameraStore = new SpatialCameraStoreManager();

