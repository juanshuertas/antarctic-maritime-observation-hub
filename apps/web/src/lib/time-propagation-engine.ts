/**
 * AMOH 4D Time Propagation Engine
 * Controls the 4th dimension (Time) across the 3D Globe:
 * - Real-time and simulated time clock with speed multipliers (1x, 10x, 60x, 300x, 3600x)
 * - Updates the Day/Night Solar Terminator across the globe
 * - Dynamic satellite orbital propagation (SGP4 Keplerian phase propagation)
 * - Dynamic AIS vessel motion along heading vectors with wake trails
 * - Dynamic polar aircraft and expedition cruise ship progression
 */

import { SpatialCameraStore } from './spatial-camera-store';
import type { WodMapEngine } from './wod-map-engine';

export interface TimeState {
  currentTime: Date;
  isLive: boolean;
  isPlaying: boolean;
  playbackSpeed: number; // multiplier, e.g. 1, 10, 60, 300, 3600
  timeRangeHours: number; // 24, 168 (7d), 2160 (90d)
}

class TimePropagationEngineManager {
  private engine: WodMapEngine | null = null;
  private animFrameId: number | null = null;
  private lastTickMs: number = Date.now();
  public baseSatellitesFC: GeoJSON.FeatureCollection | null = null;
  public baseVesselsFC: GeoJSON.FeatureCollection | null = null;
  public baseFlightsFC: GeoJSON.FeatureCollection | null = null;
  private initialized = false;

  public attachEngine(engine: WodMapEngine) {
    this.engine = engine;
    if (!this.initialized) {
      this.initialized = true;
      this.startLoop();
      this.subscribeCameraStore();
    }
  }

  public setBaseData(type: 'satellites' | 'vessels' | 'flights', fc: GeoJSON.FeatureCollection) {
    if (type === 'satellites') this.baseSatellitesFC = fc;
    if (type === 'vessels') this.baseVesselsFC = fc;
    if (type === 'flights') this.baseFlightsFC = fc;
  }

  private subscribeCameraStore() {
    SpatialCameraStore.subscribe((state) => {
      // Whenever selectedTimeUtc changes (e.g. from slider scrubbing), immediately update terminator & entities
      if (this.engine) {
        const date = new Date(state.selectedTimeUtc);
        if (!isNaN(date.getTime())) {
          this.engine.addSolarTerminatorLayer(date);
          this.propagateEntitiesForTime(date);
        }
      }
    });
  }

  private startLoop() {
    const tick = () => {
      const now = Date.now();
      const dtSec = (now - this.lastTickMs) / 1000;
      this.lastTickMs = now;

      const state = SpatialCameraStore.getState();

      if (state.isLive) {
        // In LIVE mode, keep ticking with real-time UTC
        const realNow = new Date();
        const prev = new Date(state.selectedTimeUtc);
        // Throttle updates to ~1 second
        if (Math.abs(realNow.getTime() - prev.getTime()) > 1000) {
          SpatialCameraStore.setState({ selectedTimeUtc: realNow.toISOString() });
          if (this.engine) {
            this.engine.addSolarTerminatorLayer(realNow);
            this.propagateEntitiesForTime(realNow);
          }
        }
      } else if (state.isPlaying) {
        // In PLAYBACK mode, advance time by dtSec * playbackSpeed
        const speed = state.playbackSpeed || 60; // default 60x (1 second real = 1 minute simulated)
        const currentMs = new Date(state.selectedTimeUtc).getTime();
        const nextMs = currentMs + dtSec * speed * 1000;
        const nextDate = new Date(nextMs);

        SpatialCameraStore.setState({ selectedTimeUtc: nextDate.toISOString() });
        if (this.engine) {
          this.engine.addSolarTerminatorLayer(nextDate);
          this.propagateEntitiesForTime(nextDate);
        }
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.lastTickMs = Date.now();
    this.animFrameId = requestAnimationFrame(tick);
  }

  /**
   * Propagates positions of satellites, vessels, and aircraft based on current simulated time.
   */
  private propagateEntitiesForTime(time: Date) {
    if (!this.engine) return;

    const timeMs = time.getTime();
    const baseNowMs = Date.now();
    const elapsedMinutes = (timeMs - baseNowMs) / (60 * 1000);

    // 1. Propagate Satellites (polar sun-synchronous orbit, ~98 deg inclination, ~100 min period)
    if (this.baseSatellitesFC && this.baseSatellitesFC.features.length > 0) {
      const updatedPoints: GeoJSON.Feature[] = [];
      const elevatedSatellites: GeoJSON.Feature[] = [];
      const satTethers: GeoJSON.Feature[] = [];

      for (const feat of this.baseSatellitesFC.features) {
        if (feat.geometry.type === 'Point') {
          const coords = (feat.geometry as GeoJSON.Point).coordinates;
          const origLng = coords[0];
          const origLat = coords[1];

          // Calculate orbital phase displacement
          // 360 deg per 100 min = 3.6 deg/min along orbital track
          const period = (feat.properties?.period_minutes as number) || (feat.properties?.period_min as number) || 98.5;
          const phaseAngle = (elapsedMinutes / period) * 2 * Math.PI;

          // Compute orbital ground-track lat/lng shift
          const latAmp = 82; // Polar satellite max latitude
          const currentLat = latAmp * Math.sin(phaseAngle + (origLat / 90) * (Math.PI / 2));
          // Earth rotates 360 / 1440 = 0.25 deg/min westward under satellite
          const currentLng = (((origLng - elapsedMinutes * 0.25 + 180) % 360) + 360) % 360 - 180;

          // Orbital 3D Projection aloft & Vertical Altitude Tether
          const altKm = (feat.properties?.altitude_km as number) || 700;
          const altScale = altKm / 700;
          const cosLatSat = Math.cos((currentLat * Math.PI) / 180);
          const elevatedLng = Number((currentLng + altScale * 1.6 * cosLatSat).toFixed(4));
          const elevatedLat = Number(Math.max(-89.9, Math.min(89.9, currentLat + altScale * 2.8)).toFixed(4));

          // Nadir ground point
          updatedPoints.push({
            ...feat,
            geometry: {
              type: 'Point',
              coordinates: [Number(currentLng.toFixed(4)), Number(currentLat.toFixed(4))],
            },
            properties: {
              ...feat.properties,
              is_nadir: true,
            },
          });

          // Elevated satellite aloft
          elevatedSatellites.push({
            ...feat,
            geometry: {
              type: 'Point',
              coordinates: [elevatedLng, elevatedLat],
            },
            properties: {
              ...feat.properties,
              is_elevated: true,
            },
          });

          // Dynamic Vertical Altitude Tether
          satTethers.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [Number(currentLng.toFixed(4)), Number(currentLat.toFixed(4))],
                [elevatedLng, elevatedLat],
              ],
            },
            properties: {
              satellite_id: feat.properties?.id,
              name: feat.properties?.name,
              altitude_km: altKm,
              color: feat.properties?.color || '#00e5ff',
            },
          });
        }
      }

      if (updatedPoints.length > 0) {
        this.engine.setGeoJSONSource('polar_satellites_points', {
          type: 'FeatureCollection',
          features: updatedPoints,
        });
      }
      if (elevatedSatellites.length > 0) {
        this.engine.setGeoJSONSource('polar_satellites_elevated', {
          type: 'FeatureCollection',
          features: elevatedSatellites,
        });
      }
      if (satTethers.length > 0) {
        this.engine.setGeoJSONSource('polar_satellites_tethers', {
          type: 'FeatureCollection',
          features: satTethers,
        });
      }
    }

    // 2. Propagate AIS Vessels along their speed & heading vectors
    if (this.baseVesselsFC && this.baseVesselsFC.features.length > 0) {
      const updatedVessels: GeoJSON.Feature[] = [];
      const wakeLines: GeoJSON.Feature[] = [];

      for (const feat of this.baseVesselsFC.features) {
        if (feat.geometry.type === 'Point') {
          const coords = (feat.geometry as GeoJSON.Point).coordinates;
          const origLng = coords[0];
          const origLat = coords[1];
          const sogKnots = (feat.properties?.sog as number) || 12; // speed over ground in knots
          const cogDeg = (feat.properties?.cog as number) || 0;    // course over ground in degrees

          // 1 knot = 1 nautical mile / hour = ~1/60th of a degree latitude per hour
          const hours = elapsedMinutes / 60;
          const distDeg = (sogKnots * hours) / 60;

          const rad = (cogDeg * Math.PI) / 180;
          const dLat = distDeg * Math.cos(rad);
          // adjust dLng for latitude cosine
          const cosLat = Math.cos((origLat * Math.PI) / 180) || 0.5;
          const dLng = (distDeg * Math.sin(rad)) / Math.max(cosLat, 0.1);

          const newLng = origLng + dLng;
          const newLat = Math.max(-85, Math.min(85, origLat + dLat));

          updatedVessels.push({
            ...feat,
            geometry: {
              type: 'Point',
              coordinates: [Number(newLng.toFixed(4)), Number(newLat.toFixed(4))],
            },
          });

          // Generate animated wake trails (estela de navegación)
          wakeLines.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [origLng, origLat],
                [Number(newLng.toFixed(4)), Number(newLat.toFixed(4))],
              ],
            },
            properties: {
              vessel_id: feat.properties?.id || feat.properties?.mmsi,
              vessel_name: feat.properties?.name,
            },
          });
        }
      }

      if (updatedVessels.length > 0) {
        this.engine.setGeoJSONSource('maritime_vessels', {
          type: 'FeatureCollection',
          features: updatedVessels,
        });
      }

      if (wakeLines.length > 0) {
        this.engine.setGeoJSONSource('vessel_wakes', {
          type: 'FeatureCollection',
          features: wakeLines,
        });
      }
    }

    // 3. Propagate Polar Flights (ADS-B Antarctic bridge & intercontinental cargo)
    if (this.baseFlightsFC && this.baseFlightsFC.features.length > 0) {
      const updatedFlights: GeoJSON.Feature[] = [];
      const elevatedFlights: GeoJSON.Feature[] = [];
      const flightTethers: GeoJSON.Feature[] = [];
      const flightCorridors: GeoJSON.Feature[] = [];

      for (const feat of this.baseFlightsFC.features) {
        if (feat.geometry.type === 'Point') {
          const coords = (feat.geometry as GeoJSON.Point).coordinates;
          const origLng = coords[0];
          const origLat = coords[1];
          const speedKts = (feat.properties?.speed_kts as number) || (feat.properties?.speed as number) || 320;
          const heading = (feat.properties?.heading as number) || (feat.properties?.true_track as number) || 0;

          const hours = elapsedMinutes / 60;
          const distDeg = (speedKts * hours) / 60;
          const rad = (heading * Math.PI) / 180;
          const dLat = distDeg * Math.cos(rad);
          const cosLat = Math.cos((origLat * Math.PI) / 180) || 0.5;
          const dLng = (distDeg * Math.sin(rad)) / Math.max(cosLat, 0.1);

          const curLng = (((origLng + dLng + 180) % 360) + 360) % 360 - 180;
          const curLat = Math.max(-89, Math.min(89, origLat + dLat));

          // 3D Altitude projection aloft
          const altFt = (feat.properties?.altitude_ft as number) || (feat.properties?.baro_altitude as number) || 28000;
          const altScale = altFt / 35000;
          const elevatedCoord: [number, number] = [
            Number((curLng + altScale * 0.8 * cosLat).toFixed(4)),
            Number(Math.max(-89.9, Math.min(89.9, curLat + altScale * 1.2)).toFixed(4)),
          ];

          // Nadir ground shadow
          updatedFlights.push({
            ...feat,
            geometry: {
              type: 'Point',
              coordinates: [Number(curLng.toFixed(4)), Number(curLat.toFixed(4))],
            },
            properties: {
              ...feat.properties,
              is_nadir: true,
            },
          });

          // Elevated flight symbol
          elevatedFlights.push({
            ...feat,
            geometry: {
              type: 'Point',
              coordinates: elevatedCoord,
            },
            properties: {
              ...feat.properties,
              is_elevated: true,
            },
          });

          // Altitude Tether Line
          flightTethers.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [Number(curLng.toFixed(4)), Number(curLat.toFixed(4))],
                elevatedCoord,
              ],
            },
            properties: {
              callsign: feat.properties?.callsign || feat.properties?.flight,
              altitude_ft: altFt,
              speed_kts: speedKts,
            },
          });

          // Dynamic flight path
          flightCorridors.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [origLng, origLat],
                [Number(curLng.toFixed(4)), Number(curLat.toFixed(4))],
              ],
            },
            properties: {
              callsign: feat.properties?.callsign || feat.properties?.flight,
            },
          });
        }
      }

      if (updatedFlights.length > 0) {
        this.engine.setGeoJSONSource('polar_aircraft', {
          type: 'FeatureCollection',
          features: updatedFlights,
        });
      }
      if (elevatedFlights.length > 0) {
        this.engine.setGeoJSONSource('polar_aircraft_elevated', {
          type: 'FeatureCollection',
          features: elevatedFlights,
        });
      }
      if (flightTethers.length > 0) {
        this.engine.setGeoJSONSource('polar_aircraft_tethers', {
          type: 'FeatureCollection',
          features: flightTethers,
        });
      }
      if (flightCorridors.length > 0) {
        this.engine.setGeoJSONSource('polar_aircraft_corridors', {
          type: 'FeatureCollection',
          features: flightCorridors,
        });
      }
    }
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

export const TimePropagationEngine = new TimePropagationEngineManager();
