/**
 * OSIRIS-Grade Centralized Camera & Motion Controller for AMOH V8.3
 * 
 * Supports 4 explicit camera classes:
 * 1. ORBITAL_HOME: Centered at South Pole [0, -84], Earth curvature, horizon, Southern Ocean ring framing Antarctica.
 * 2. SECTOR_FLYTO: Smooth 3D easing to any Antarctic sector preserving orientation and pitch.
 * 3. ENTITY_TRACK: Locked tracking on moving vessels, aircraft, satellites, icebergs, or stations.
 * 4. CLOSE_INSPECTION: High-detail terrain and close inspection mode.
 */
import type { Map as MlMap } from 'maplibre-gl';

export type CameraClass = 'ORBITAL_HOME' | 'SECTOR_FLYTO' | 'ENTITY_TRACK' | 'CLOSE_INSPECTION';

export interface SectorViewTarget {
  id: string;
  name: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
}

export const ANTARCTIC_SECTOR_TARGETS: Record<string, SectorViewTarget> = {
  HOME: {
    id: 'HOME',
    name: 'Antarctica Orbital Home (South Pole)',
    center: [0.0, -84.0],
    zoom: 1.65,
    pitch: 48,
    bearing: 0,
  },
  PENINSULA: {
    id: 'PENINSULA',
    name: 'Antarctic Peninsula & Drake Passage',
    center: [-63.5, -65.0],
    zoom: 4.8,
    pitch: 42,
    bearing: -15,
  },
  WEDDELL: {
    id: 'WEDDELL',
    name: 'Weddell Sea & Ronne-Filchner Shelf',
    center: [-42.0, -73.5],
    zoom: 4.2,
    pitch: 45,
    bearing: 20,
  },
  ROSS: {
    id: 'ROSS',
    name: 'Ross Sea & McMurdo Sound',
    center: [175.0, -76.0],
    zoom: 4.3,
    pitch: 46,
    bearing: -160,
  },
  AMUNDSEN: {
    id: 'AMUNDSEN',
    name: 'Amundsen Sea & Thwaites Glacier',
    center: [-105.0, -73.0],
    zoom: 4.4,
    pitch: 44,
    bearing: -85,
  },
  BELLINGSHAUSEN: {
    id: 'BELLINGSHAUSEN',
    name: 'Bellingshausen Sea Sector',
    center: [-80.0, -71.0],
    zoom: 4.5,
    pitch: 40,
    bearing: -50,
  },
  EAST_ANTARCTICA: {
    id: 'EAST_ANTARCTICA',
    name: 'East Antarctic Plateau & Dome C',
    center: [120.0, -75.0],
    zoom: 3.8,
    pitch: 42,
    bearing: 120,
  },
  PRYDZ: {
    id: 'PRYDZ',
    name: 'Prydz Bay & Amery Ice Shelf',
    center: [75.0, -68.5],
    zoom: 4.6,
    pitch: 45,
    bearing: 75,
  },
  QUEEN_MAUD: {
    id: 'QUEEN_MAUD',
    name: 'Queen Maud Land (Dronning Maud)',
    center: [10.0, -72.0],
    zoom: 4.2,
    pitch: 42,
    bearing: 15,
  },
  WILKES: {
    id: 'WILKES',
    name: 'Wilkes Land & Terre Adélie',
    center: [140.0, -66.5],
    zoom: 4.5,
    pitch: 40,
    bearing: 145,
  },
  SCOTIA: {
    id: 'SCOTIA',
    name: 'Scotia Arc & South Georgia',
    center: [-40.0, -56.5],
    zoom: 4.9,
    pitch: 38,
    bearing: -25,
  },
  KERGUELEN: {
    id: 'KERGUELEN',
    name: 'Kerguelen Plateau & Heard Island',
    center: [70.0, -50.0],
    zoom: 5.0,
    pitch: 35,
    bearing: 60,
  },
};

export class AmohCameraController {
  private map: MlMap;
  private currentClass: CameraClass = 'ORBITAL_HOME';
  private trackingEntityId: string | null = null;
  private trackingInterval: number | null = null;

  constructor(map: MlMap) {
    this.map = map;
  }

  getCurrentClass(): CameraClass {
    return this.currentClass;
  }

  getTrackingEntityId(): string | null {
    return this.trackingEntityId;
  }

  /**
   * Orbital Home Camera Reset
   * Centers the South Pole with Earth curvature, atmospheric horizon and zero Peninsula bias.
   */
  resetToOrbitalHome(duration = 1200) {
    this.stopTracking();
    this.currentClass = 'ORBITAL_HOME';
    const target = ANTARCTIC_SECTOR_TARGETS.HOME;
    this.map.flyTo({
      center: target.center,
      zoom: target.zoom,
      pitch: target.pitch,
      bearing: target.bearing,
      duration,
      essential: true,
      curve: 1.42,
      easing: (t) => t * (2 - t),
    });
  }

  /**
   * Sector 3D FlyTo
   * Smoothly transitions to any Antarctic sector while keeping 3D oblique perspective.
   */
  flyToSector(sectorKey: string, duration = 1400) {
    this.stopTracking();
    this.currentClass = 'SECTOR_FLYTO';
    const target = ANTARCTIC_SECTOR_TARGETS[sectorKey.toUpperCase()] || ANTARCTIC_SECTOR_TARGETS.HOME;
    this.map.flyTo({
      center: target.center,
      zoom: target.zoom,
      pitch: target.pitch,
      bearing: target.bearing,
      duration,
      essential: true,
      curve: 1.35,
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    });
  }

  /**
   * Entity Track Mode
   * Locks onto a target entity and follows its position smoothly.
   */
  trackEntity(
    coords: [number, number],
    entityId: string,
    zoom = 6.8,
    pitch = 52,
    bearing?: number
  ) {
    this.currentClass = 'ENTITY_TRACK';
    this.trackingEntityId = entityId;

    const currentBearing = this.map.getBearing();
    this.map.flyTo({
      center: coords,
      zoom,
      pitch,
      bearing: bearing !== undefined ? bearing : currentBearing,
      duration: 1000,
      essential: true,
    });
  }

  /**
   * Close Inspection Mode
   */
  inspectClose(coords: [number, number], zoom = 9.5, pitch = 60) {
    this.currentClass = 'CLOSE_INSPECTION';
    this.map.flyTo({
      center: coords,
      zoom,
      pitch,
      duration: 800,
      essential: true,
    });
  }

  stopTracking() {
    this.trackingEntityId = null;
    if (this.trackingInterval) {
      window.clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  dispose() {
    this.stopTracking();
  }
}
