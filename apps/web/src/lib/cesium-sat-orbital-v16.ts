// SPDX-License-Identifier: AGPL-3.0-or-later
// Cesium renders the Antarctic globe and elevated traffic from the Observatory.
// The 2D and bathymetry views remain in MapLibre.

import type { GeoJSONSource, Map as MlMap } from 'maplibre-gl';
import { SpatialCameraStore, type MapMode } from './spatial-camera-store';
import { WorkspaceStore } from './workspace-store';
import { MARINE_GEOPHYSICS_LAYERS } from './marine-geophysics-layers';
import 'cesium/Build/Cesium/Widgets/widgets.css';

type Mode = MapMode | 'SURTE' | 'UNKNOWN';

const POLAR_ORBIT_HIGHLIGHTS = new Set([25994, 27424, 37849, 43613, 49260, 60989, 62261]);
// SAT uses the native flat MapLibre canvas so imagery is never draped over a globe.
const isImmersive = (value: Mode) => value === 'GLOBE' || value === 'SURTE';

type Controller = {
  refresh: () => void;
  navigate: (action: GlobeNavigation) => boolean;
  destroy: () => void;
};

type OrbitalPoint = {
  row: any;
  satrec: any;
  point: any | null;
  symbol?: TrafficSymbol;
};

type TrafficSymbol = {
  marker: any;
  model?: any;
  transform: any;
  removed?: boolean;
};

type AircraftHistory = {
  lon: number;
  lat: number;
  altM: number;
  time: number;
};

const controllers = new WeakMap<MlMap, Controller>();
type GlobeNavigation = 'in' | 'out' | 'north' | 'home';

export function navigateCesiumGlobe(map: MlMap | null, action: GlobeNavigation): boolean {
  return map ? controllers.get(map)?.navigate(action) ?? false : false;
}

const ASSET_BASE = '/amoh/orbital_v15';
const CESIUM_BASE = '/cesium/';

const ACTIVE_URL =
  `${ASSET_BASE}/orbital/celestrak/active_omm.json`;

const DEBRIS_URL =
  `${ASSET_BASE}/orbital/celestrak/debris_combined_omm.json`;

const BLUE_MARBLE_URL =
  `${ASSET_BASE}/imagery/nasa_blue_marble/blue_marble_globe.jpg`;

const AIRPORT_LOOKUP_URL =
  `${ASSET_BASE}/aviation/airport_lookup.json`;

const HERO_MODEL_BASE =
  '/amoh/models/v18';

const POLAR_TWIN_MODEL_URL =
  `${HERO_MODEL_BASE}/amoh_polar_twin_utility_v18.glb`;

const POLAR_TRANSPORT_MODEL_URL =
  `${HERO_MODEL_BASE}/amoh_polar_transport_v18.glb`;

const AIS_VESSEL_MODEL_URL = `${HERO_MODEL_BASE}/amoh_ais_vessel.glb`;

const POLAR_SATELLITE_MODEL_URL =
  `${HERO_MODEL_BASE}/amoh_polar_science_satellite_v18.glb`;

const HEAT_SOURCE_CANDIDATES = [
  'gfw_fishing_effort',
  'fisheries_effort',
  'polar_heat',
  'heat_points',
  'fishing_effort',
  'polar_fishing_effort',
  'gfw_heat',
];

const OVERLAY_ID = 'amoh-cesium-sat-v16';
const HUD_ID = 'amoh-cesium-sat-v16-hud';
const MODE_CLASS = 'amoh-cesium-sat-v16-active';

function makeOverlay(
  map: MlMap,
): HTMLDivElement {
  const container =
    map.getContainer();

  const style =
    window.getComputedStyle(container);

  if (style.position === 'static') {
    container.style.position = 'relative';
  }

  let overlay =
    container.querySelector(
      `#${OVERLAY_ID}`,
    ) as HTMLDivElement | null;

  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  Object.assign(
    overlay.style,
    {
      position: 'absolute',
      inset: '0',
      zIndex: '8',
      display: 'none',
      overflow: 'hidden',
      background: '#01050b',
      pointerEvents: 'auto',
    },
  );

  container.appendChild(overlay);
  return overlay;
}

function makeHud(
  overlay: HTMLDivElement,
): HTMLDivElement {
  let hud =
    overlay.querySelector(
      `#${HUD_ID}`,
    ) as HTMLDivElement | null;

  if (hud) return hud;

  hud = document.createElement('div');
  hud.id = HUD_ID;

  Object.assign(
    hud.style,
    {
      position: 'absolute',
      top: '18px',
      right: '18px',
      zIndex: '12',
      minWidth: '250px',
      maxWidth: '340px',
      padding: '12px 14px',
      border:
        '1px solid rgba(73,231,247,.28)',
      borderRadius: '14px',
      background:
        'linear-gradient(160deg,rgba(2,20,30,.88),rgba(1,9,16,.84))',
      backdropFilter: 'blur(14px)',
      boxShadow:
        '0 18px 50px rgba(0,0,0,.35)',
      color: '#dbfbff',
      fontFamily:
        'Inter,system-ui,sans-serif',
      fontSize: '12px',
      lineHeight: '1.45',
      pointerEvents: 'none',
      display: 'none',
    },
  );

  hud.innerHTML =
    '<b style="letter-spacing:.08em;color:#66f4ff">SAT · ORBITAL VIEW</b><br>' +
    '<span style="color:#8fb7c1">CelesTrak OMM + SGP4</span>';

  overlay.appendChild(hud);
  return hud;
}

function showHud(
  hud: HTMLDivElement,
  data: Record<string, unknown>,
): void {
  hud.style.display = 'block';

  const title =
    String(
      data.name ??
      data.OBJECT_NAME ??
      data.callsign ??
      'Orbital object',
    );

  const rows: Array<[string, unknown]> = [
    [
      'Tipo',
      data.type ??
      data.kind ??
      'SAT',
    ],
    [
      data.mmsi ? 'MMSI' : 'NORAD',
      data.mmsi ?? data.NORAD_CAT_ID ??
      data.norad ??
      '—',
    ],
    [
      'Altitud',
      data.altitudeKm != null
        ? `${Number(data.altitudeKm).toFixed(0)} km`
        : data.altitudeM != null
          ? `${Math.round(Number(data.altitudeM))} m`
          : '—',
    ],
    [
      'Rumbo',
      data.heading != null
        ? `${Math.round(Number(data.heading))}°`
        : '—',
    ],
    [
      'Ruta',
      data.route ??
      data.routeStatus ??
      '—',
    ],
    [
      'Velocidad',
      data.speedKts != null &&
      Number(data.speedKts) > 0
        ? `${Math.round(Number(data.speedKts))} kt`
        : '—',
    ],
  ];

  const escapeText = (value: unknown) => String(value).replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
  hud.innerHTML =
    `<div style="font-size:15px;font-weight:800;color:#f3feff">${escapeText(title)}</div>` +
    `<div style="margin-top:7px;display:grid;grid-template-columns:auto 1fr;gap:4px 10px">` +
    rows
      .map(
        ([k, v]) =>
          `<span style="color:#789eaa">${k}</span>` +
          `<b style="color:#ccf8ff">${escapeText(v)}</b>`,
      )
      .join('') +
    `</div>`;
}

function setOverlayVisible(
  map: MlMap,
  overlay: HTMLDivElement,
  visible: boolean,
): void {
  overlay.style.display =
    visible ? 'block' : 'none';

  map
    .getContainer()
    .classList.toggle(
      MODE_CLASS,
      visible,
    );

  document.documentElement.classList.toggle(
    'amoh-cinematic-v19-active',
    visible,
  );

  const canvases =
    map
      .getContainer()
      .querySelectorAll(
        '.maplibregl-canvas',
      );

  canvases.forEach((canvas) => {
    (canvas as HTMLElement).style.opacity =
      visible ? '0' : '';
  });

  const controls =
    map
      .getContainer()
      .querySelectorAll(
        '.maplibregl-control-container',
      );

  controls.forEach((ctrl) => {
    (ctrl as HTMLElement).style.opacity =
      visible ? '0' : '';
    (ctrl as HTMLElement).style.pointerEvents =
      visible ? 'none' : '';
  });
}

function firstText(
  ...values: any[]
): string {
  for (const value of values) {
    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return '';
}

function cleanAirportCode(
  value: unknown,
): string {
  const code =
    firstText(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

  if (
    code.length === 3 ||
    code.length === 4
  ) {
    return code;
  }

  return '';
}

function lonLatAltFromFeature(
  feature: any,
): {
  lon: number;
  lat: number;
  altitudeM: number;
  heading: number;
  id: string;
  callsign: string;
  aircraftType: string;
  originCode: string;
  destinationCode: string;
  speedKts: number;
  route: string;
  routeStatus: string;
} | null {
  const g =
    feature?.geometry;

  if (
    g?.type !== 'Point' ||
    !Array.isArray(g.coordinates)
  ) {
    return null;
  }

  const lon =
    Number(g.coordinates[0]);

  const lat =
    Number(g.coordinates[1]);

  if (
    !Number.isFinite(lon) ||
    !Number.isFinite(lat)
  ) {
    return null;
  }

  const p =
    feature.properties ?? {};

  const altitudeM =
    Number(
      p.altitude_m ??
      p.geo_altitude ??
      p.baro_altitude ??
      (
        Number.isFinite(
          Number(p.altitude_ft),
        )
          ? Number(p.altitude_ft) *
            0.3048
          : 0
      ),
    ) || 0;

  const heading =
    Number(
      p.true_track ??
      p.track ??
      p.heading ??
      p.course ??
      0,
    ) || 0;

  const id =
    String(
      p.icao24 ??
      p.callsign ??
      p.id ??
      feature.id ??
      `${lon}:${lat}`,
    );

  const callsign =
    firstText(
      p.callsign,
      p.flight,
      p.flight_number,
      id,
    ).trim();

  const aircraftType =
    firstText(
      p.aircraft_type,
      p.aircraft_model,
      p.model,
      p.type_code,
      p.type,
    ).toUpperCase();

  const originCode =
    cleanAirportCode(
      p.origin_icao ??
      p.origin_iata ??
      p.departure_icao ??
      p.departure_iata ??
      p.dep_icao ??
      p.dep_iata ??
      p.origin ??
      p.from,
    );

  const destinationCode =
    cleanAirportCode(
      p.destination_icao ??
      p.destination_iata ??
      p.arrival_icao ??
      p.arrival_iata ??
      p.arr_icao ??
      p.arr_iata ??
      p.destination ??
      p.to,
    );

  const speedKts =
    Number(
      p.speed_kts ??
      p.ground_speed_kts ??
      p.ground_speed ??
      p.velocity_kts ??
      (
        Number.isFinite(
          Number(p.velocity_ms),
        )
          ? Number(p.velocity_ms) *
            1.943844
          : 0
      ),
    ) || 0;

  const route =
    originCode ||
    destinationCode
      ? `${originCode || '?'} → ${destinationCode || '?'}`
      : '';

  return {
    lon,
    lat,
    altitudeM,
    heading,
    id,
    callsign,
    aircraftType,
    originCode,
    destinationCode,
    speedKts,
    route,
    routeStatus:
      route ||
      'Rastro observado → rumbo proyectado',
  };
}

function projectPoint(
  lon: number,
  lat: number,
  bearingDeg: number,
  distanceKm: number,
): [number, number] {
  const R = 6371;
  const toRad =
    (x: number) =>
      (x * Math.PI) / 180;
  const toDeg =
    (x: number) =>
      (x * 180) / Math.PI;

  const bearing =
    toRad(bearingDeg);
  const lat1 =
    toRad(lat);
  const lon1 =
    toRad(lon);
  const d =
    distanceKm / R;

  const lat2 =
    Math.asin(
      Math.sin(lat1) *
        Math.cos(d) +
      Math.cos(lat1) *
        Math.sin(d) *
        Math.cos(bearing),
    );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) *
        Math.sin(d) *
        Math.cos(lat1),
      Math.cos(d) -
        Math.sin(lat1) *
        Math.sin(lat2),
    );

  let outLon =
    toDeg(lon2);

  while (outLon > 180) outLon -= 360;
  while (outLon < -180) outLon += 360;

  return [
    outLon,
    toDeg(lat2),
  ];
}

function aircraftCanvas(): HTMLCanvasElement {
  const canvas =
    document.createElement('canvas');

  canvas.width = 96;
  canvas.height = 96;

  const ctx =
    canvas.getContext('2d')!;

  ctx.translate(48, 48);
  ctx.shadowColor =
    'rgba(112,238,255,1)';
  ctx.shadowBlur = 9;
  ctx.fillStyle = '#ffffff';

  ctx.beginPath();
  ctx.moveTo(0, -39);
  ctx.lineTo(6, -12);
  ctx.lineTo(34, -1);
  ctx.lineTo(35, 7);
  ctx.lineTo(8, 5);
  ctx.lineTo(6, 26);
  ctx.lineTo(17, 35);
  ctx.lineTo(17, 39);
  ctx.lineTo(0, 34);
  ctx.lineTo(-17, 39);
  ctx.lineTo(-17, 35);
  ctx.lineTo(-6, 26);
  ctx.lineTo(-8, 5);
  ctx.lineTo(-35, 7);
  ctx.lineTo(-34, -1);
  ctx.lineTo(-6, -12);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

function trafficCanvas(type: 'vessel' | 'satellite'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 72;
  canvas.height = 72;
  const ctx = canvas.getContext('2d')!;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = type === 'vessel' ? '#92ffe2' : '#d4bcff';
  ctx.fillStyle = '#113444';
  if (type === 'vessel') {
    ctx.beginPath();
    ctx.moveTo(7, 39);
    ctx.lineTo(65, 39);
    ctx.lineTo(53, 56);
    ctx.lineTo(17, 56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeRect(21, 26, 27, 13);
    ctx.strokeRect(29, 16, 11, 10);
  } else {
    ctx.fillRect(5, 26, 20, 20);
    ctx.strokeRect(5, 26, 20, 20);
    ctx.fillRect(47, 26, 20, 20);
    ctx.strokeRect(47, 26, 20, 20);
    ctx.fillRect(25, 20, 22, 32);
    ctx.strokeRect(25, 20, 22, 32);
  }
  return canvas;
}

// V19 unifies GLOBE/SAT/SURTE into the Cesium cinematic renderer.
 // MAP stays native OLEA/MapLibre. Legacy V10-style symbols remain hidden in immersive modes.
export function installCesiumSatOrbitalV16(
  map: MlMap,
): Controller {
  const existing =
    controllers.get(map);

  if (existing) return existing;

  const overlay =
    makeOverlay(map);

  const hud =
    makeHud(overlay);

  let destroyed = false;
  let mode: Mode =
    'UNKNOWN';

  let cesiumReady = false;
  let Cesium: any = null;
  let satellite: any = null;
  let widget: any = null;

  let activeCollection: any = null;
  let debrisCollection: any = null;
  let aircraftBillboards: any = null;
  let vesselSymbols: any = null;
  let satelliteSymbols: any = null;
  const vessels = new Map<string, TrafficSymbol>();
  const shipImage = trafficCanvas('vessel');
  const satelliteImage = trafficCanvas('satellite');
  let aircraftTrails: any = null;
  let aircraftEndpoints: any = null;
  let aircraftLabels: any = null;
  let heatBillboards: any = null;
  let selectionLines: any = null;
  let referenceOrbits: any = null;
  let pendingInitialization: Promise<void> | null = null;
  let pickHandler: any = null;

  let airportLookup =
    new Map<string, any>();

  const aircraftModels =
    new Map<string, {
      model: any;
      url: string;
      lastSeen: number;
    }>();

  const aircraftModelPending =
    new Set<string>();

  let selectedSatelliteHero: any = null;

  let selectedSatelliteState: {
    row: any;
    satrec: any;
  } | null = null;

  const activeObjects:
    OrbitalPoint[] = [];

  const debrisObjects:
    OrbitalPoint[] = [];

  const aircraftHistory =
    new Map<string, AircraftHistory[]>();

  let activeCursor = 0;
  let activeTimer = 0;
  let debrisTimer = 0;
  let aircraftTimer = 0;
  let heatTimer = 0;
  let lastHeatSuccess = 0;
  let lastCameraMode: Mode = 'UNKNOWN';

  const heatSpriteCache =
    new Map<number, HTMLCanvasElement>();

  const orbitRows =
    new Map<number, any>();

  const aircraftModelUrl = (
    aircraftType: string,
  ): string => {
    const type =
      aircraftType.toUpperCase();

    if (
      /(^|[^A-Z0-9])(LC-?130|C-?130|HERCULES)([^A-Z0-9]|$)/.test(
        type,
      )
    ) {
      return POLAR_TRANSPORT_MODEL_URL;
    }

    return POLAR_TWIN_MODEL_URL;
  };

  const headingModelMatrix = (
    position: any,
    headingDeg: number,
  ): any => {
    const heading =
      Cesium.Math.toRadians(
        90 - headingDeg,
      );

    return Cesium.Transforms.headingPitchRollToFixedFrame(
      position,
      new Cesium.HeadingPitchRoll(
        heading,
        0,
        0,
      ),
    );
  };

  const routeArcPositions = (
    aLon: number,
    aLat: number,
    bLon: number,
    bLat: number,
    cruiseAltitudeM: number,
  ): any[] => {
    try {
      const start =
        Cesium.Cartographic.fromDegrees(
          aLon,
          aLat,
        );

      const end =
        Cesium.Cartographic.fromDegrees(
          bLon,
          bLat,
        );

      const geodesic =
        new Cesium.EllipsoidGeodesic(
          start,
          end,
        );

      const positions: any[] = [];

      for (
        let i = 0;
        i <= 36;
        i++
      ) {
        const t =
          i / 36;

        const carto =
          geodesic.interpolateUsingFraction(
            t,
          );

        const altitude =
          Math.max(
            0,
            Math.sin(
              Math.PI * t,
            ) *
              Math.max(
                3500,
                cruiseAltitudeM,
              ),
          );

        positions.push(
          Cesium.Cartesian3.fromRadians(
            carto.longitude,
            carto.latitude,
            altitude,
          ),
        );
      }

      return positions;
    } catch {
      return [
        Cesium.Cartesian3.fromDegrees(
          aLon,
          aLat,
          0,
        ),
        Cesium.Cartesian3.fromDegrees(
          bLon,
          bLat,
          Math.max(
            0,
            cruiseAltitudeM,
          ),
        ),
      ];
    }
  };

  const addTrafficSymbol = (
    type: 'vessel' | 'satellite', position: any, transform: any, id: Record<string, unknown>,
  ): TrafficSymbol => {
    const ship = type === 'vessel';
    const collection = ship ? vesselSymbols : satelliteSymbols;
    const layer = ship ? 'maritime_vessels' : 'polar_satellites';
    const marker = collection.add({
      position, id, image: ship ? shipImage : satelliteImage, width: 28, height: 28,
    });
    const symbol: TrafficSymbol = { marker, transform };
    void Cesium.Model.fromGltfAsync({
      url: ship ? AIS_VESSEL_MODEL_URL : POLAR_SATELLITE_MODEL_URL,
      modelMatrix: transform,
      minimumPixelSize: 28,
      maximumScale: ship ? 30000 : 2500000,
      silhouetteColor: Cesium.Color.fromCssColorString(ship ? '#68ffd8' : '#d1b1ff'),
      silhouetteSize: 0.8,
    }).then((model: any) => {
      if (destroyed || symbol.removed || !widget || widget.isDestroyed()) {
        model.destroy();
        return;
      }
      model.id = symbol.marker.id;
      model.modelMatrix = symbol.transform;
      model.show = !!WorkspaceStore.getState().activeLayers[layer];
      symbol.model = widget.scene.primitives.add(model);
      const hideFallback = () => {
        if (destroyed || symbol.removed || widget.isDestroyed()) return;
        marker.show = false;
        widget.scene.requestRender();
      };
      if (model.ready) hideFallback();
      else model.readyEvent.addEventListener(hideFallback);
      widget.scene.requestRender();
    }).catch(() => {
      // The matching pictogram remains available if a device cannot load the model.
    });
    return symbol;
  };

  const updateVessels = async () => {
    if (!cesiumReady || destroyed || !isImmersive(mode)) return;
    const source = map.getSource<GeoJSONSource>('maritime_vessels');
    const reports = await source?.getData().catch(() => undefined);
    if (destroyed || !isImmersive(mode)) return;
    const visible = !!WorkspaceStore.getState().activeLayers.maritime_vessels;
    vesselSymbols.show = visible;
    const seen = new Set<string>();
    if (visible && reports && 'features' in reports) {
      for (const report of reports.features) {
        const properties = report.properties;
        if (report.geometry?.type !== 'Point' || !properties?.mmsi) continue;
        const age = Date.now() - Date.parse(properties.timestamp ?? '');
        if (!Number.isFinite(age) || age < -60_000 || age > 900_000) continue;
        const [longitude, latitude] = report.geometry.coordinates;
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue;
        const key = String(properties.mmsi);
        seen.add(key);
        const heading = Number(properties.heading ?? properties.cog ?? 0);
        const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
        const transform = headingModelMatrix(position, Number.isFinite(heading) ? heading : 0);
        const id = {
          amohType: 'vessel', name: properties.name || `MMSI ${key}`, mmsi: key,
          heading, speedKts: properties.sog, source: properties.source,
        };
        const symbol = vessels.get(key);
        if (!symbol) vessels.set(key, addTrafficSymbol('vessel', position, transform, id));
        else {
          symbol.marker.position = position;
          symbol.marker.id = id;
          symbol.transform = transform;
          if (symbol.model) {
            symbol.model.modelMatrix = transform;
            symbol.model.id = id;
          }
        }
      }
    }
    for (const [key, symbol] of vessels) {
      if (seen.has(key)) continue;
      symbol.removed = true;
      vesselSymbols.remove(symbol.marker);
      if (symbol.model) widget.scene.primitives.remove(symbol.model);
      vessels.delete(key);
    }
    widget.scene.requestRender();
  };

  const ensureAircraftHero =
    async (
      f: ReturnType<
        typeof lonLatAltFromFeature
      > extends infer R
        ? Exclude<R, null>
        : never,
      position: any,
      now: number,
    ) => {
      const url =
        aircraftModelUrl(
          f.aircraftType,
        );

      let entry =
        aircraftModels.get(
          f.id,
        );

      if (
        entry &&
        entry.url !== url
      ) {
        try {
          widget.scene.primitives.remove(
            entry.model,
          );
        } catch {}

        aircraftModels.delete(
          f.id,
        );

        entry = undefined;
      }

      if (entry) {
        entry.lastSeen = now;
        entry.model.modelMatrix =
          headingModelMatrix(
            position,
            f.heading,
          );

        entry.model.id = {
          amohType: 'aircraft',
          ...f,
        };

        return;
      }

      if (
        aircraftModelPending.has(
          f.id,
        )
      ) {
        return;
      }

      aircraftModelPending.add(
        f.id,
      );

      try {
        const model =
          await Cesium.Model.fromGltfAsync({
            url,
            modelMatrix:
              headingModelMatrix(
                position,
                f.heading,
              ),
            minimumPixelSize: 24,
            maximumScale: 150000,
            scale: 1,
            shadows:
              Cesium.ShadowMode.ENABLED,
            silhouetteColor:
              Cesium.Color.fromCssColorString(
                '#7ef6ff',
              ),
            silhouetteSize: 0.5,
          });

        if (destroyed || !isImmersive(mode) || !WorkspaceStore.getState().activeLayers.polar_aircraft) {
          model.destroy();
          return;
        }
        model.id = {
          amohType: 'aircraft',
          ...f,
        };

        widget.scene.primitives.add(
          model,
        );

        aircraftModels.set(
          f.id,
          {
            model,
            url,
            lastSeen: now,
          },
        );

        const hideAircraftFallback = () => {
          if (destroyed || widget.isDestroyed()) return;
          for (let i = 0; i < aircraftBillboards.length; i++) {
            const billboard = aircraftBillboards.get(i);
            if (billboard.id.id === f.id) billboard.show = false;
          }
          widget.scene.requestRender();
        };
        if (model.ready) hideAircraftFallback();
        else model.readyEvent.addEventListener(hideAircraftFallback);
        widget.scene.requestRender();
      } catch (error) {
        console.warn(
          'AMOH V18 aircraft hero model failed; billboard fallback remains.',
          error,
        );
      } finally {
        aircraftModelPending.delete(
          f.id,
        );
      }
    };

  const updateSelectedSatelliteHero =
    () => {
      if (
        !selectedSatelliteState ||
        !selectedSatelliteHero
      ) {
        return;
      }

      const current =
        propagateOne(
          {
            row:
              selectedSatelliteState.row,
            satrec:
              selectedSatelliteState.satrec,
            point: null,
          },
          new Date(),
        );

      if (!current) return;

      selectedSatelliteHero.modelMatrix =
        Cesium.Transforms.eastNorthUpToFixedFrame(
          current.position,
        );
    };

  const showSelectedSatelliteHero =
    async (
      satrec: any,
      row: any,
      position: any | null,
    ) => {
      selectedSatelliteState = {
        row,
        satrec,
      };

      if (
        selectedSatelliteHero
      ) {
        try {
          widget.scene.primitives.remove(
            selectedSatelliteHero,
          );
        } catch {}

        selectedSatelliteHero =
          null;
      }

      if (!position) return;

      try {
        const model =
          await Cesium.Model.fromGltfAsync({
            url:
              POLAR_SATELLITE_MODEL_URL,
            modelMatrix:
              Cesium.Transforms.eastNorthUpToFixedFrame(
                position,
              ),
            minimumPixelSize: 38,
            maximumScale: 2500000,
            scale: 1,
            shadows:
              Cesium.ShadowMode.ENABLED,
            silhouetteColor:
              Cesium.Color.fromCssColorString(
                '#69f4ff',
              ),
            silhouetteSize: 0.7,
          });

        model.id = {
          amohType: 'satellite',
          row,
          satrec,
        };

        selectedSatelliteHero =
          widget.scene.primitives.add(
            model,
          );
      } catch (error) {
        console.warn(
          'AMOH V18 selected satellite hero model failed.',
          error,
        );
      }
    };

  const propagateOne = (
    item: OrbitalPoint,
    date: Date,
  ) => {
    try {
      const pv =
        satellite.propagate(
          item.satrec,
          date,
        );

      if (!pv.position) return null;

      const gmst =
        satellite.gstime(date);

      const gd =
        satellite.eciToGeodetic(
          pv.position,
          gmst,
        );

      const altitudeKm =
        Number(gd.height);

      if (
        !Number.isFinite(
          altitudeKm,
        )
      ) {
        return null;
      }

      return {
        lon: gd.longitude,
        lat: gd.latitude,
        altitudeKm,
        position:
          Cesium.Cartesian3.fromRadians(
            gd.longitude,
            gd.latitude,
            Math.max(
              0,
              altitudeKm * 1000,
            ),
          ),
      };
    } catch {
      return null;
    }
  };


  const heatNumber = (
    props: any,
  ): number => {
    const candidates = [
      props?.value,
      props?.weight,
      props?.effort,
      props?.fishing_effort,
      props?.fishing_hours,
      props?.hours,
      props?.intensity,
      props?.score,
      props?.density,
    ];

    for (const value of candidates) {
      const n = Number(value);

      if (
        Number.isFinite(n) &&
        n > 0
      ) {
        return n;
      }
    }

    return 1;
  };

  const heatPointFromFeature = (
    feature: any,
  ): {
    lon: number;
    lat: number;
    weight: number;
  } | null => {
    const g = feature?.geometry;

    if (
      g?.type !== 'Point' ||
      !Array.isArray(g.coordinates)
    ) {
      return null;
    }

    const lon = Number(g.coordinates[0]);
    const lat = Number(g.coordinates[1]);

    if (
      !Number.isFinite(lon) ||
      !Number.isFinite(lat) ||
      lat > -42
    ) {
      return null;
    }

    return {
      lon,
      lat,
      weight:
        heatNumber(
          feature.properties ?? {},
        ),
    };
  };

  const heatSprite = (
    tier: number,
  ): HTMLCanvasElement => {
    const cached =
      heatSpriteCache.get(tier);

    if (cached) return cached;

    const canvas =
      document.createElement('canvas');

    canvas.width = 128;
    canvas.height = 128;

    const ctx =
      canvas.getContext('2d')!;

    const gradient =
      ctx.createRadialGradient(
        64,
        64,
        2,
        64,
        64,
        61,
      );

    const palettes = [
      ['rgba(58,229,255,.82)', 'rgba(58,229,255,0)'],
      ['rgba(84,255,151,.86)', 'rgba(84,255,151,0)'],
      ['rgba(255,229,70,.90)', 'rgba(255,229,70,0)'],
      ['rgba(255,148,43,.94)', 'rgba(255,148,43,0)'],
      ['rgba(255,63,46,.97)', 'rgba(255,63,46,0)'],
    ];

    const palette =
      palettes[
        Math.max(
          0,
          Math.min(
            4,
            tier,
          ),
        )
      ];

    gradient.addColorStop(
      0,
      palette[0],
    );

    gradient.addColorStop(
      0.22,
      palette[0],
    );

    gradient.addColorStop(
      0.74,
      palette[0]
        .replace(
          /,\.\d+\)$/,
          ',.12)',
        ),
    );

    gradient.addColorStop(
      1,
      palette[1],
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    heatSpriteCache.set(
      tier,
      canvas,
    );

    return canvas;
  };

  const updateHeat = () => {
    if (
      destroyed ||
      !cesiumReady ||
      !heatBillboards
    ) {
      return;
    }

    const raw: Array<{
      lon: number;
      lat: number;
      weight: number;
    }> = [];

    for (
      const sourceId of HEAT_SOURCE_CANDIDATES
    ) {
      try {
        const features =
          map.querySourceFeatures(
            sourceId,
          ) as any[];

        for (
          const feature of features
        ) {
          const point =
            heatPointFromFeature(
              feature,
            );

          if (point) {
            raw.push(point);
          }
        }
      } catch {
        // optional source is not present
      }
    }

    if (!raw.length) {
      if (
        Date.now() -
          lastHeatSuccess <
        15000
      ) {
        return;
      }

      heatBillboards.removeAll();
      return;
    }

    lastHeatSuccess = Date.now();

    const grid =
      new Map<
        string,
        {
          lon: number;
          lat: number;
          weight: number;
          count: number;
        }
      >();

    const cellSize = 1.35;

    for (
      const point of raw
    ) {
      const gx =
        Math.round(
          point.lon /
            cellSize,
        );

      const gy =
        Math.round(
          point.lat /
            cellSize,
        );

      const key =
        `${gx}:${gy}`;

      const current =
        grid.get(key);

      if (current) {
        current.lon += point.lon;
        current.lat += point.lat;
        current.weight += point.weight;
        current.count += 1;
      } else {
        grid.set(
          key,
          {
            lon: point.lon,
            lat: point.lat,
            weight: point.weight,
            count: 1,
          },
        );
      }
    }

    const cells =
      [...grid.values()]
        .map(
          (cell) => ({
            lon:
              cell.lon /
              cell.count,
            lat:
              cell.lat /
              cell.count,
            weight:
              cell.weight,
            count:
              cell.count,
          }),
        )
        .sort(
          (a, b) =>
            b.weight -
            a.weight,
        )
        .slice(0, 260);

    const maxWeight =
      Math.max(
        1,
        ...cells.map(
          (cell) =>
            cell.weight,
        ),
      );

    heatBillboards.removeAll();

    for (
      const cell of cells
    ) {
      const normalized =
        Math.max(
          0,
          Math.min(
            1,
            Math.log1p(
              cell.weight,
            ) /
              Math.log1p(
                maxWeight,
              ),
          ),
        );

      const tier =
        Math.min(
          4,
          Math.floor(
            normalized * 5,
          ),
        );

      const size =
        36 +
        normalized * 86 +
        Math.min(
          24,
          cell.count * 1.5,
        );

      heatBillboards.add({
        position:
          Cesium.Cartesian3.fromDegrees(
            cell.lon,
            cell.lat,
            900,
          ),
        image:
          heatSprite(
            tier,
          ),
        width: size,
        height: size,
        color:
          Cesium.Color.WHITE.withAlpha(
            mode === 'SAT'
              ? 0.54
              : 0.78,
          ),
        scaleByDistance:
          new Cesium.NearFarScalar(
            7e5,
            1.15,
            2.6e7,
            0.62,
          ),
        id: {
          amohType: 'heat',
          weight:
            cell.weight,
          count:
            cell.count,
        },
      });
    }
  };

  const applyOrbitalVisualMode =
    (next: Mode) => {
      if (!cesiumReady) return;

      const satMode =
        next === 'SAT';

      const globeMode =
        next === 'GLOBE';

      const surteMode =
        next === 'SURTE';

      if (activeCollection) {
        activeCollection.show = WorkspaceStore.getState().activeLayers.polar_satellites;

        for (
          let i = 0;
          i <
          activeCollection.length;
          i++
        ) {
          const point =
            activeCollection.get(i);

          point.pixelSize =
            POLAR_ORBIT_HIGHLIGHTS.has(Number(point.id?.row?.NORAD_CAT_ID))
              ? 5
              : satMode
              ? 2.25
              : globeMode
                ? 1.3
                : 1.55;

          point.color =
            Cesium.Color.fromCssColorString(
              '#80efff',
            ).withAlpha(
              satMode
                ? 0.84
                : 0.44,
            );
        }
      }

      if (debrisCollection) {
        debrisCollection.show =
          satMode;
      }

      if (heatBillboards) {
        heatBillboards.show =
          globeMode ||
          satMode ||
          surteMode;
      }

      if (
        lastCameraMode === next
      ) {
        return;
      }

      lastCameraMode = next;

      if (next === 'GLOBE') {
        widget.camera.flyTo({
          destination:
            Cesium.Cartesian3.fromDegrees(
              -48,
              -85,
              11_400_000,
            ),
          orientation: {
            heading:
              Cesium.Math.toRadians(
                -8,
              ),
            pitch:
              Cesium.Math.toRadians(
                -88.5,
              ),
            roll: 0,
          },
          duration: 1.25,
        });
      } else if (
        next === 'SAT'
      ) {
        widget.camera.flyTo({
          destination:
            Cesium.Cartesian3.fromDegrees(
              -26,
              -82.5,
              17_800_000,
            ),
          orientation: {
            heading:
              Cesium.Math.toRadians(
                -13,
              ),
            pitch:
              Cesium.Math.toRadians(
                -76,
              ),
            roll: 0,
          },
          duration: 1.35,
        });
      } else if (
        next === 'SURTE'
      ) {
        widget.camera.flyTo({
          destination:
            Cesium.Cartesian3.fromDegrees(
              -44,
              -77.5,
              5_700_000,
            ),
          orientation: {
            heading:
              Cesium.Math.toRadians(
                -22,
              ),
            pitch:
              Cesium.Math.toRadians(
                -64,
              ),
            roll: 0,
          },
          duration: 1.1,
        });
      }
    };

  const createOrbitalCollection = (
    rows: any[],
    collection: any,
    target: OrbitalPoint[],
    type: 'satellite' | 'debris',
  ) => {
    let index = 0;

    const chunk = () => {
      if (destroyed) return;

      const end =
        Math.min(
          rows.length,
          index + 500,
        );

      const date =
        new Date();

      for (; index < end; index++) {
        const row =
          rows[index];

        let satrec: any;

        try {
          satrec =
            satellite.json2satrec(row);
        } catch {
          continue;
        }

        const item: OrbitalPoint = {
          row,
          satrec,
          point: null,
        };

        const pos =
          propagateOne(
            item,
            date,
          );

        if (!pos) continue;

        const norad =
          Number(
            row.NORAD_CAT_ID,
          );

        if (
          Number.isFinite(norad)
        ) {
          orbitRows.set(
            norad,
            row,
          );
        }

        item.point =
          collection.add({
            position:
              pos.position,
            pixelSize:
              type === 'satellite'
                ? POLAR_ORBIT_HIGHLIGHTS.has(norad) ? 5 : 1.65
                : 1.35,
            color:
              type === 'satellite'
                ? Cesium.Color.fromCssColorString(
                    '#8df8ff',
                  ).withAlpha(0.88)
                : Cesium.Color.fromCssColorString(
                    row.AMOH_DEBRIS_CLOUD ===
                      'FENGYUN-1C'
                      ? '#ff9d5c'
                      : row.AMOH_DEBRIS_CLOUD ===
                          'IRIDIUM-33'
                        ? '#ef72ff'
                        : '#93a7ff',
                  ).withAlpha(0.56),
            outlineColor:
              Cesium.Color.WHITE.withAlpha(
                type === 'satellite'
                  ? 0.35
                  : 0.10,
              ),
            outlineWidth:
              type === 'satellite'
                ? 0.55
                : 0.2,
            scaleByDistance:
              new Cesium.NearFarScalar(
                1.5e6,
                1.65,
                3.5e7,
                0.62,
              ),
            id: {
              amohType: type,
              row,
              satrec,
            },
          });

        if (type === 'satellite' && POLAR_ORBIT_HIGHLIGHTS.has(norad)) {
          item.symbol = addTrafficSymbol(
            'satellite', pos.position, Cesium.Transforms.eastNorthUpToFixedFrame(pos.position),
            { amohType: type, row, satrec },
          );
          item.point.show = false;
        }

        target.push(item);
      }

      widget?.scene.requestRender();
      if (index < rows.length) {
        window.setTimeout(
          chunk,
          0,
        );
      }
    };

    chunk();
  };

  const updateActiveChunk =
    () => {
      if (
        !isImmersive(mode) ||
        destroyed ||
        !cesiumReady ||
        !activeObjects.length
      ) {
        return;
      }

      const date =
        new Date();

      const count =
        Math.max(
          1,
          Math.ceil(
            activeObjects.length / 4,
          ),
        );

      const end =
        Math.min(
          activeObjects.length,
          activeCursor + count,
        );

      for (
        let i = activeCursor;
        i < end;
        i++
      ) {
        const item =
          activeObjects[i];

        const pos =
          propagateOne(
            item,
            date,
          );

        if (
          pos &&
          item.point
        ) {
          item.point.position = pos.position;
          if (item.symbol) {
            item.symbol.marker.position = pos.position;
            item.symbol.transform = Cesium.Transforms.eastNorthUpToFixedFrame(pos.position);
            if (item.symbol.model) item.symbol.model.modelMatrix = item.symbol.transform;
          }
        }
      }

      activeCursor =
        end >= activeObjects.length
          ? 0
          : end;

      updateSelectedSatelliteHero();
      widget.scene.requestRender();
    };

  const updateDebris =
    () => {
      if (
        mode !== 'SAT' ||
        destroyed ||
        !cesiumReady
      ) {
        return;
      }

      const date =
        new Date();

      for (
        const item of debrisObjects
      ) {
        const pos =
          propagateOne(
            item,
            date,
          );

        if (
          pos &&
          item.point
        ) {
          item.point.position =
            pos.position;
        }
      }
      widget.scene.requestRender();
    };

  const updateAircraft = async () => {
      if (destroyed || !cesiumReady || !isImmersive(mode)) return;
      let features: any[] = [];
      if (WorkspaceStore.getState().activeLayers.polar_aircraft) {
        const source = map.getSource<GeoJSONSource>('polar_aircraft');
        try {
          const data = await source?.getData();
          if (data && 'features' in data) features = data.features;
        } catch {
          // An empty collection clears aircraft when the source is unavailable.
        }
      }
      if (destroyed || !isImmersive(mode)) return;

      aircraftBillboards.removeAll();
      aircraftTrails.removeAll();
      aircraftEndpoints.removeAll();

      if (
        aircraftLabels
      ) {
        aircraftLabels.removeAll();
      }

      const now =
        Date.now();

      const seen =
        new Set<string>();

      for (
        const feature of features
      ) {
        const observed = Date.parse(feature.properties?.observed_at ?? '');
        if (!Number.isFinite(observed) || now - observed > 300_000) continue;
        const f =
          lonLatAltFromFeature(
            feature,
          );

        if (!f || seen.has(f.id)) continue;

        seen.add(
          f.id,
        );

        const position =
          Cesium.Cartesian3.fromDegrees(
            f.lon,
            f.lat,
            Math.max(
              0,
              f.altitudeM,
            ),
          );

        aircraftBillboards.add({
          position,
          show: !aircraftModels.get(f.id)?.model.ready,
          image:
            aircraftCanvas(),
          width: 28,
          height: 28,
          rotation:
            -Cesium.Math.toRadians(
              f.heading,
            ),
          alignedAxis:
            Cesium.Cartesian3.ZERO,
          scaleByDistance:
            new Cesium.NearFarScalar(
              1e5,
              1.35,
              2.2e7,
              0.72,
            ),
          id: {
            amohType:
              'aircraft',
            ...f,
          },
        });

        if (
          aircraftLabels
        ) {
          aircraftLabels.add({
            position,
            text:
              f.route
                ? `${f.callsign}  ${f.route}`
                : f.callsign,
            font:
              '600 11px Inter, system-ui, sans-serif',
            fillColor:
              Cesium.Color.fromCssColorString(
                '#e8fcff',
              ),
            outlineColor:
              Cesium.Color.fromCssColorString(
                '#041018',
              ).withAlpha(
                0.92,
              ),
            outlineWidth: 3,
            style:
              Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset:
              new Cesium.Cartesian2(
                0,
                -20,
              ),
            scaleByDistance:
              new Cesium.NearFarScalar(
                5e5,
                1,
                1.8e7,
                0.45,
              ),
            translucencyByDistance:
              new Cesium.NearFarScalar(
                1e6,
                1,
                2.2e7,
                0,
              ),
            id: {
              amohType:
                'aircraft',
              ...f,
            },
          });
        }

        void ensureAircraftHero(
          f,
          position,
          now,
        );

        const history =
          aircraftHistory.get(
            f.id,
          ) ?? [];

        const last =
          history[
            history.length - 1
          ];

        if (
          !last ||
          Math.abs(last.lon - f.lon) +
            Math.abs(last.lat - f.lat) >
            0.01 ||
          now - last.time >
            12_000
        ) {
          history.push({
            lon: f.lon,
            lat: f.lat,
            altM:
              f.altitudeM,
            time: now,
          });
        }

        while (
          history.length > 18
        ) {
          history.shift();
        }

        while (
          history.length &&
          now - history[0].time >
            60 * 60 * 1000
        ) {
          history.shift();
        }

        aircraftHistory.set(
          f.id,
          history,
        );

        if (
          history.length >= 2
        ) {
          aircraftTrails.add({
            positions:
              history.map(
                (h) =>
                  Cesium.Cartesian3.fromDegrees(
                    h.lon,
                    h.lat,
                    Math.max(
                      0,
                      h.altM,
                    ),
                  ),
              ),
            width: 2.0,
            material:
              Cesium.Material.fromType(
                'Color',
                {
                  color:
                    Cesium.Color.fromCssColorString(
                      '#b7fbff',
                    ).withAlpha(
                      0.82,
                    ),
                },
              ),
          });
        }

        const origin =
          f.originCode
            ? airportLookup.get(
                f.originCode,
              )
            : null;

        const destination =
          f.destinationCode
            ? airportLookup.get(
                f.destinationCode,
              )
            : null;

        if (
          origin &&
          Number.isFinite(
            Number(origin.lon),
          ) &&
          Number.isFinite(
            Number(origin.lat),
          )
        ) {
          aircraftEndpoints.add({
            position:
              Cesium.Cartesian3.fromDegrees(
                Number(origin.lon),
                Number(origin.lat),
                50,
              ),
            pixelSize: 8,
            color:
              Cesium.Color.fromCssColorString(
                '#6ff5ff',
              ).withAlpha(
                0.95,
              ),
            outlineColor:
              Cesium.Color.WHITE.withAlpha(
                0.7,
              ),
            outlineWidth: 1.5,
            id: {
              amohType:
                'aircraft-origin',
              callsign:
                f.callsign,
              code:
                f.originCode,
              airport:
                origin,
            },
          });

          aircraftTrails.add({
            positions:
              routeArcPositions(
                Number(origin.lon),
                Number(origin.lat),
                f.lon,
                f.lat,
                f.altitudeM,
              ),
            width: 1.65,
            material:
              Cesium.Material.fromType(
                'Color',
                {
                  color:
                    Cesium.Color.fromCssColorString(
                      '#57e8ff',
                    ).withAlpha(
                      0.46,
                    ),
                },
              ),
          });
        }

        if (
          destination &&
          Number.isFinite(
            Number(destination.lon),
          ) &&
          Number.isFinite(
            Number(destination.lat),
          )
        ) {
          aircraftEndpoints.add({
            position:
              Cesium.Cartesian3.fromDegrees(
                Number(destination.lon),
                Number(destination.lat),
                50,
              ),
            pixelSize: 9,
            color:
              Cesium.Color.fromCssColorString(
                '#ffb35a',
              ).withAlpha(
                0.98,
              ),
            outlineColor:
              Cesium.Color.WHITE.withAlpha(
                0.75,
              ),
            outlineWidth: 1.5,
            id: {
              amohType:
                'aircraft-destination',
              callsign:
                f.callsign,
              code:
                f.destinationCode,
              airport:
                destination,
            },
          });

          aircraftTrails.add({
            positions:
              routeArcPositions(
                f.lon,
                f.lat,
                Number(destination.lon),
                Number(destination.lat),
                f.altitudeM,
              ),
            width: 1.8,
            material:
              Cesium.Material.fromType(
                'PolylineDash',
                {
                  color:
                    Cesium.Color.fromCssColorString(
                      '#ffb35a',
                    ).withAlpha(
                      0.72,
                    ),
                  dashLength: 16,
                },
              ),
          });
        }

        if (
          !destination
        ) {
          const ahead =
            projectPoint(
              f.lon,
              f.lat,
              f.heading,
              260,
            );

          aircraftTrails.add({
            positions: [
              position,
              Cesium.Cartesian3.fromDegrees(
                ahead[0],
                ahead[1],
                Math.max(
                  0,
                  f.altitudeM,
                ),
              ),
            ],
            width: 1.6,
            material:
              Cesium.Material.fromType(
                'PolylineDash',
                {
                  color:
                    Cesium.Color.fromCssColorString(
                      '#a48aff',
                    ).withAlpha(
                      0.88,
                    ),
                  dashLength: 14,
                },
              ),
          });
        }
      }

      for (
        const [
          id,
          entry,
        ] of aircraftModels
      ) {
        if (!seen.has(id)) {
          try {
            widget.scene.primitives.remove(
              entry.model,
            );
          } catch {}

          aircraftModels.delete(
            id,
          );
        }
      }

      if (
        aircraftModels.size === 0
      ) {
        aircraftBillboards.show =
          true;
      }
      widget.scene.requestRender();
    };

  const drawSelectedOrbit =
    (
      satrec: any,
      row: any,
    ) => {
      if (
        !selectionLines
      ) {
        return;
      }

      selectionLines.removeAll();

      const now =
        new Date();

      const past: any[] = [];
      const future: any[] = [];

      for (
        let minutes = -45;
        minutes <= 45;
        minutes += 2
      ) {
        const date =
          new Date(
            now.getTime() +
              minutes *
                60_000,
          );

        const temp: OrbitalPoint = {
          row,
          satrec,
          point: null,
        };

        const p =
          propagateOne(
            temp,
            date,
          );

        if (!p) continue;

        if (minutes <= 0) {
          past.push(
            p.position,
          );
        }

        if (minutes >= 0) {
          future.push(
            p.position,
          );
        }
      }

      if (past.length >= 2) {
        selectionLines.add({
          positions: past,
          width: 2.0,
          material:
            Cesium.Material.fromType(
              'Color',
              {
                color:
                  Cesium.Color.fromCssColorString(
                    '#74efff',
                  ).withAlpha(
                    0.88,
                  ),
              },
            ),
        });
      }

      if (future.length >= 2) {
        selectionLines.add({
          positions: future,
          width: 2.0,
          material:
            Cesium.Material.fromType(
              'PolylineDash',
              {
                color:
                  Cesium.Color.fromCssColorString(
                    '#a884ff',
                  ).withAlpha(
                    0.92,
                  ),
                dashLength: 18,
              },
            ),
        });
      }
    };

  const initialize =
    async () => {
      if (
        destroyed ||
        cesiumReady
      ) {
        return;
      }

      (window as any)
        .CESIUM_BASE_URL =
        CESIUM_BASE;

      [
        Cesium,
        satellite,
      ] = await Promise.all([
        import('cesium'),
        import('satellite.js'),
      ]);

      if (destroyed) return;
      widget =
        new Cesium.CesiumWidget(
          overlay,
          {
            baseLayer: false,
            shouldAnimate: true,
            sceneMode:
              Cesium.SceneMode.SCENE3D,
            requestRenderMode: true,
            maximumRenderTimeChange: 60,
          },
        );

      widget.resolutionScale =
        Math.min(
          1.25,
          window.devicePixelRatio ||
            1,
        );

      widget.scene.backgroundColor =
        Cesium.Color.fromCssColorString(
          '#01050c',
        );

      widget.scene.globe.baseColor =
        Cesium.Color.fromCssColorString(
          '#061629',
        );

      widget.scene.globe.showGroundAtmosphere =
        true;

      widget.scene.skyAtmosphere.show =
        true;

      widget.scene.skyAtmosphere.atmosphereLightIntensity =
        2.8;

      widget.scene.skyAtmosphere.hueShift =
        -0.03;

      widget.scene.skyAtmosphere.saturationShift =
        0.12;

      widget.scene.skyAtmosphere.brightnessShift =
        -0.08;

      widget.scene.globe.enableLighting =
        true;

      widget.scene.globe.dynamicAtmosphereLighting =
        Cesium.DynamicAtmosphereLightingType.SUNLIGHT;

      widget.scene.highDynamicRange =
        true;

      try {
        widget.scene.postProcessStages.fxaa.enabled =
          true;
      } catch {}

      try {
        widget.scene.postProcessStages.bloom.enabled =
          false;

        widget.scene.postProcessStages.bloom.uniforms.glowOnly =
          false;

        widget.scene.postProcessStages.bloom.uniforms.contrast =
          88;

        widget.scene.postProcessStages.bloom.uniforms.brightness =
          -0.18;

        widget.scene.postProcessStages.bloom.uniforms.delta =
          0.9;

        widget.scene.postProcessStages.bloom.uniforms.sigma =
          2.4;

        widget.scene.postProcessStages.bloom.uniforms.stepSize =
          1.0;
      } catch {}

      try {
        if (
          widget.scene.skyBox
        ) {
          widget.scene.skyBox.show =
            true;
        }
      } catch {}

      try {
        const providerPromise =
          Cesium.SingleTileImageryProvider.fromUrl(
            BLUE_MARBLE_URL,
            {
              credit:
                'NASA Blue Marble',
            },
          );

        const layer =
          Cesium.ImageryLayer.fromProviderAsync(
            providerPromise,
          );

        layer.saturation =
          0.96;

        layer.contrast =
          1.18;

        layer.brightness =
          0.88;

        layer.gamma =
          0.92;

        widget.imageryLayers.add(
          layer,
        );
      } catch {
        // dark globe fallback
      }

      activeCollection =
        widget.scene.primitives.add(
          new Cesium.PointPrimitiveCollection(),
        );

      debrisCollection =
        widget.scene.primitives.add(
          new Cesium.PointPrimitiveCollection(),
        );

      vesselSymbols = widget.scene.primitives.add(new Cesium.BillboardCollection());
      satelliteSymbols = widget.scene.primitives.add(new Cesium.BillboardCollection());
      aircraftBillboards =
        widget.scene.primitives.add(
          new Cesium.BillboardCollection(),
        );

      aircraftTrails =
        widget.scene.primitives.add(
          new Cesium.PolylineCollection(),
        );

      aircraftEndpoints =
        widget.scene.primitives.add(
          new Cesium.PointPrimitiveCollection(),
        );

      aircraftLabels =
        widget.scene.primitives.add(
          new Cesium.LabelCollection(),
        );

      heatBillboards =
        widget.scene.primitives.add(
          new Cesium.BillboardCollection(),
        );

      referenceOrbits = widget.scene.primitives.add(new Cesium.PolylineCollection());
      selectionLines =
        widget.scene.primitives.add(
          new Cesium.PolylineCollection(),
        );

      widget.camera.setView({
        destination:
          Cesium.Cartesian3.fromDegrees(
            -32,
            -88.25,
            10_900_000,
          ),
        orientation: {
          heading:
            Cesium.Math.toRadians(
              -8,
            ),
          pitch:
            Cesium.Math.toRadians(
              -89.5,
            ),
          roll: 0,
        },
      });

      const [
        activeRows,
        debrisRows,
        airportRows,
      ] =
        await Promise.all([
          fetch(ACTIVE_URL)
            .then(
              (r) => {
                if (!r.ok) {
                  throw new Error(
                    `Active OMM ${r.status}`,
                  );
                }

                return r.json();
              },
            ),
          fetch(DEBRIS_URL).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(AIRPORT_LOOKUP_URL)
            .then(
              (r) =>
                r.ok
                  ? r.json()
                  : {},
            )
            .catch(
              () => ({}),
            ),
        ]);

      if (
        airportRows &&
        typeof airportRows === 'object'
      ) {
        airportLookup =
          new Map(
            Object.entries(
              airportRows,
            ),
          );
      }

      if (destroyed) return;
      // A small set of real polar trajectories keeps the overview readable.
      const orbitTime = Date.now();
      for (const row of Array.isArray(activeRows) ? activeRows : []) {
        if (!POLAR_ORBIT_HIGHLIGHTS.has(Number(row.NORAD_CAT_ID))) continue;
        const satrec = satellite.json2satrec(row);
        const period = 1440 / Number(row.MEAN_MOTION);
        if (!Number.isFinite(period) || period <= 0) continue;
        const positions = [];
        for (let step = 0; step <= 90; step++) {
          const time = new Date(orbitTime + (step / 90 - 0.5) * period * 60_000);
          const sample = propagateOne({ row, satrec, point: null }, time);
          if (sample) positions.push(sample.position);
        }
        if (positions.length < 2) continue;
        referenceOrbits.add({
          positions, width: 1.5,
          material: Cesium.Material.fromType('PolylineDash', {
            color: Cesium.Color.fromCssColorString('#65e6ff').withAlpha(0.64),
            dashLength: 15,
          }),
        });
      }

      const catalogRows: any[] = Array.isArray(activeRows) ? activeRows : [];
      const isHighlighted = (row: any) => POLAR_ORBIT_HIGHLIGHTS.has(Number(row.NORAD_CAT_ID));
      createOrbitalCollection(
        [...catalogRows.filter(isHighlighted), ...catalogRows.filter(row => !isHighlighted(row))],
        activeCollection,
        activeObjects,
        'satellite',
      );

      createOrbitalCollection(
        Array.isArray(debrisRows)
          ? debrisRows
          : [],
        debrisCollection,
        debrisObjects,
        'debris',
      );

      pickHandler =
        new Cesium.ScreenSpaceEventHandler(
          widget.scene.canvas,
        );

      pickHandler.setInputAction(
        (movement: any) => {
          const picked =
            widget.scene.pick(
              movement.position,
            );

          const data =
            picked?.id;

          if (!data) {
            hud.style.display =
              'none';

            selectionLines.removeAll();
            return;
          }

          if (
            data.amohType ===
            'heat'
          ) {
            showHud(
              hud,
              {
                name:
                  'Actividad polar',
                type:
                  'HEAT ANALYTICS',
                routeStatus:
                  `${Math.round(Number(data.count ?? 0))} observaciones agregadas`,
              },
            );

            return;
          }

          if (
            data.amohType ===
              'satellite' ||
            data.amohType ===
              'debris'
          ) {
            const row =
              data.row ?? {};

            const temp: OrbitalPoint = {
              row,
              satrec:
                data.satrec,
              point: null,
            };

            const current =
              propagateOne(
                temp,
                new Date(),
              );

            showHud(
              hud,
              {
                ...row,
                type:
                  data.amohType === 'debris' ? 'Desecho orbital' : 'Satélite',
                altitudeKm:
                  current?.altitudeKm,
              },
            );

            drawSelectedOrbit(
              data.satrec,
              row,
            );

            void showSelectedSatelliteHero(
              data.satrec,
              row,
              current?.position ??
                null,
            );

            return;
          }

          if (
            data.amohType ===
              'aircraft-origin' ||
            data.amohType ===
              'aircraft-destination'
          ) {
            const airport =
              data.airport ?? {};

            showHud(
              hud,
              {
                name:
                  airport.name ??
                  data.code ??
                  'Airport',
                type:
                  data.amohType ===
                    'aircraft-origin'
                    ? 'ORIGEN'
                    : 'DESTINO',
                route:
                  `${data.callsign ?? ''} · ${data.code ?? ''}`.trim(),
              },
            );

            return;
          }

          if (data.amohType === 'vessel') {
            showHud(hud, { ...data, type: 'Buque AIS' });
            return;
          }

          if (
            data.amohType ===
            'aircraft'
          ) {
            showHud(
              hud,
              {
                name:
                  data.callsign,
                type:
                  data.aircraftType
                    ? `Avión · ${data.aircraftType}`
                    : 'Avión · ADS-B',
                altitudeM:
                  data.altitudeM,
                heading:
                  data.heading,
                speedKts:
                  data.speedKts,
                route:
                  data.route,
                routeStatus:
                  data.routeStatus,
              },
            );

            selectionLines.removeAll();
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      );

      activeTimer =
        window.setInterval(
          updateActiveChunk,
          1100,
        );

      debrisTimer =
        window.setInterval(
          updateDebris,
          4200,
        );

      aircraftTimer =
        window.setInterval(
          () => { void updateAircraft(); void updateVessels(); },
          4500,
        );

      heatTimer =
        window.setInterval(
          updateHeat,
          6000,
        );

      cesiumReady = true;

      updateAircraft();
      updateHeat();

      applyOrbitalVisualMode(
        mode,
      );

      (window as any)
        .__amohCesiumV16 = {
        widget,
        counts: {
          active:
            activeRows.length ??
            0,
          debris:
            debrisRows.length ??
            0,
        },
        refreshAircraft:
          updateAircraft,
        mode:
          () => mode,
        v18: {
          hero3d: true,
          integratedV19: true,
          immersiveModes: [
            'GLOBE',
            'SURTE',
          ],
          heatCells:
            () =>
              heatBillboards?.length ??
              0,
          vesselModels: () => [...vessels.values()].filter(symbol => symbol.model?.ready).length,
          satelliteModels: () => activeObjects.filter(item => item.symbol?.model?.ready).length,
          aircraftModels:
            () =>
              aircraftModels.size,
          airportLookup:
            () =>
              airportLookup.size,
          selectedSatelliteHero:
            () =>
              Boolean(
                selectedSatelliteHero,
              ),
          modelUrls: {
            twin:
              POLAR_TWIN_MODEL_URL,
            transport:
              POLAR_TRANSPORT_MODEL_URL,
            satellite:
              POLAR_SATELLITE_MODEL_URL,
          },
        },
      };

      (window as any)
        .__amohCinematicV19 =
        (window as any)
          .__amohCesiumV16;
    };

  const syncTrafficVisibility = () => {
    if (!cesiumReady) return;
    const layers = WorkspaceStore.getState().activeLayers;
    const showSatellites = !!layers.polar_satellites;
    activeCollection.show = showSatellites;
    satelliteSymbols.show = showSatellites;
    for (const item of activeObjects) {
      if (item.symbol?.model) item.symbol.model.show = showSatellites;
    }
    vesselSymbols.show = !!layers.maritime_vessels;
    for (const symbol of vessels.values()) {
      if (symbol.model) symbol.model.show = vesselSymbols.show;
    }
    void updateVessels();
    referenceOrbits.show = showSatellites;
    selectionLines.show = showSatellites;
    if (selectedSatelliteHero) selectedSatelliteHero.show = showSatellites;
    widget.scene.requestRender();
    void updateAircraft();
  };

  let geophysicsVisible = false;
  let modeRequest = 0;
  const applyMode = async (next: Mode, nextGeophysics = geophysicsVisible) => {
    if (mode === next && geophysicsVisible === nextGeophysics) return;
    const request = ++modeRequest;
    mode = next;
    geophysicsVisible = nextGeophysics;
    // MapLibre owns the geophysics layers in both flat and globe projections.
    if (!isImmersive(next) || geophysicsVisible) {
      if (widget) widget.useDefaultRenderLoop = false;
      hud.style.display = 'none';
      setOverlayVisible(map, overlay, false);
      return;
    }

    try {
      pendingInitialization ??= initialize();
      await pendingInitialization;
      if (destroyed || request !== modeRequest) return;
      setOverlayVisible(map, overlay, true);
      widget.useDefaultRenderLoop = true;
      widget.resize();
      widget.scene.requestRender();
      applyOrbitalVisualMode(next);
      syncTrafficVisibility();
      updateHeat();
    } catch (error) {
      if (destroyed) return;
      console.warn('OLEA Globe 3D could not initialize', error);
      widget?.destroy();
      widget = null;
      pendingInitialization = null;
      setOverlayVisible(map, overlay, false);
    }
  };

  const stopTracking = SpatialCameraStore.subscribe(state => { void applyMode(state.activeMode); });
  let previousTraffic = '';
  const stopWorkspace = WorkspaceStore.subscribe(state => {
    const hasGeophysics = MARINE_GEOPHYSICS_LAYERS.some(({ id }) => state.activeLayers[id]);
    if (hasGeophysics !== geophysicsVisible) {
      void applyMode(SpatialCameraStore.getState().activeMode, hasGeophysics);
    }
    const traffic = `${!!state.activeLayers.maritime_vessels}:${!!state.activeLayers.polar_aircraft}:${!!state.activeLayers.polar_satellites}`;
    if (traffic === previousTraffic) return;
    previousTraffic = traffic;
    syncTrafficVisibility();
  });
  const refresh = () => { void applyMode(SpatialCameraStore.getState().activeMode); };
  const controller: Controller = {
    refresh,
    navigate: (action) => {
      if (!cesiumReady || !isImmersive(mode) || overlay.style.display === 'none') return false;
      const camera = widget.camera;
      if (action === 'home') {
        lastCameraMode = 'UNKNOWN';
        applyOrbitalVisualMode(mode);
      } else if (action === 'north') {
        camera.setView({ orientation: { heading: 0, pitch: camera.pitch, roll: 0 } });
      } else {
        const distance = Math.max(500, camera.positionCartographic.height * 0.18);
        if (action === 'in') camera.zoomIn(distance);
        else camera.zoomOut(distance);
      }
      widget.scene.requestRender();
      return true;
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;

      stopTracking();
      stopWorkspace();

      window.clearInterval(
        activeTimer,
      );

      window.clearInterval(
        debrisTimer,
      );

      window.clearInterval(
        aircraftTimer,
      );

      window.clearInterval(
        heatTimer,
      );

      try {
        pickHandler?.destroy();
      } catch {}

      try {
        widget?.destroy();
      } catch {}

      setOverlayVisible(
        map,
        overlay,
        false,
      );

      overlay.remove();

      controllers.delete(map);
    },
  };

  controllers.set(
    map,
    controller,
  );

  return controller;
}
