import { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MlMap } from 'maplibre-gl';
import { circle, featureCollection, greatCircle, point } from '@turf/turf';
import {
  AlertTriangle,
  Compass,
  LocateFixed,
  MapPin,
  Navigation,
  Radar,
  Route,
  Ship,
} from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  PB124_OFFICIAL_REFERENCE_URL,
  PB124_WAYPOINTS,
  PB124_ZONES,
  getPB124ScheduleZone,
  type PB124Zone,
} from '../lib/pb124-itinerary';

export type PB124MapPosition = {
  lat: number;
  lng: number;
  accuracy?: number | null;
  status?: string | null;
};

export type PB124ObservationMapPoint = {
  observationId: string;
  lat: number;
  lng: number;
  utc?: string | null;
  accuracy?: number | null;
  status?: string | null;
  label?: string | null;
};

type Variant = 'overview' | 'full' | 'field' | 'review';

type Props = {
  variant?: Variant;
  currentPosition?: PB124MapPosition | null;
  selectedPosition?: PB124MapPosition | null;
  observationPoints?: PB124ObservationMapPoint[];
  selectedObservationId?: string | null;
  onObservationSelect?: (observationId: string) => void;
  className?: string;
};

type ProjectedPB124Zone = {
  id: string;
  code: string;
  index: number;
  pointX: number;
  pointY: number;
  labelX: number;
  labelY: number;
};

type ProjectedPB124Overlay = {
  paths: string[];
  zones: ProjectedPB124Zone[];
};

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

/**
 * OpenFreeMap public vector tiles require no API key.
 * We restyle the loaded Liberty layers client-side so PB124 retains the
 * dark OLEA / observatory identity without depending on a paid map token.
 */
function applyOleaDarkBase(map: MlMap) {
  const layers = map.getStyle()?.layers || [];

  for (const layer of layers) {
    try {
      const id = layer.id.toLowerCase();

      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', '#030b12');
        continue;
      }

      if (layer.type === 'fill') {
        let fill = '#0e1a21';
        let opacity = 0.96;

        if (id.includes('water') || id.includes('ocean') || id.includes('sea')) {
          fill = '#04131d';
          opacity = 1;
        } else if (id.includes('park') || id.includes('wood') || id.includes('forest') || id.includes('grass')) {
          fill = '#10231f';
        } else if (id.includes('building')) {
          fill = '#16252c';
          opacity = 0.78;
        } else if (id.includes('landuse') || id.includes('landcover')) {
          fill = '#0d1c22';
        }

        map.setPaintProperty(layer.id, 'fill-color', fill);
        map.setPaintProperty(layer.id, 'fill-opacity', opacity);
        if (id.includes('boundary')) {
          try { map.setPaintProperty(layer.id, 'fill-outline-color', '#294550'); } catch {}
        }
        continue;
      }

      if (layer.type === 'line') {
        let color = '#29404b';
        let opacity = 0.58;

        if (id.includes('boundary')) {
          color = '#365460';
          opacity = 0.55;
        } else if (id.includes('water')) {
          color = '#0d2d3b';
        } else if (id.includes('road') || id.includes('street') || id.includes('highway')) {
          color = '#263b43';
          opacity = 0.42;
        } else if (id.includes('rail')) {
          color = '#2a3a40';
          opacity = 0.30;
        }

        map.setPaintProperty(layer.id, 'line-color', color);
        map.setPaintProperty(layer.id, 'line-opacity', opacity);
        continue;
      }

      if (layer.type === 'symbol') {
        try { map.setPaintProperty(layer.id, 'text-color', '#7895a2'); } catch {}
        try { map.setPaintProperty(layer.id, 'text-halo-color', '#030b12'); } catch {}
        try { map.setPaintProperty(layer.id, 'text-halo-width', 1.4); } catch {}
        try { map.setPaintProperty(layer.id, 'icon-opacity', 0.48); } catch {}

        if (id.includes('country') || id.includes('state')) {
          try { map.setPaintProperty(layer.id, 'text-color', '#a9c1ca'); } catch {}
        }
        if (id.includes('poi')) {
          try { map.setLayoutProperty(layer.id, 'visibility', 'none'); } catch {}
        }
      }
    } catch {
      // A base style layer may not expose every property; visual fallback is safe.
    }
  }
}


function createZoneRouteFeature(zone: PB124Zone) {
  const segmentFeatures = [];
  for (let i = zone.startWaypointIndex; i < zone.endWaypointIndex; i += 1) {
    const start = PB124_WAYPOINTS[i];
    const end = PB124_WAYPOINTS[i + 1];
    if (!start || !end) continue;
    segmentFeatures.push(
      greatCircle(start.coordinates, end.coordinates, {
        npoints: 48,
        properties: {
          zoneId: zone.id,
          zoneCode: zone.code,
          zoneTitle: zone.title,
          sourceClass: 'OFFICIAL_ITINERARY_REFERENCE',
        },
      }),
    );
  }
  return segmentFeatures;
}

function buildZoneRouteCollection() {
  return featureCollection(PB124_ZONES.flatMap(createZoneRouteFeature));
}

function buildWaypointCollection() {
  const majorLabelIndexes = new Set([0, 3, 6, 11, 12, 14, 15, 17]);

  return featureCollection(
    PB124_WAYPOINTS.map((wp) =>
      point(wp.coordinates, {
        id: wp.id,
        index: wp.index,
        name: wp.name,
        country: wp.country,
        dateLabel: wp.dateLabel,
        majorLabel: majorLabelIndexes.has(wp.index),
        sourceClass: 'OFFICIAL_ITINERARY_REFERENCE',
      }),
    ),
  );
}

function zoneAccent(zone: PB124Zone, scheduleZoneId?: string | null) {
  if (zone.id === scheduleZoneId) return '#f0b35a';
  if (zone.accent === 'green') return '#72e0b5';
  if (zone.accent === 'amber') return '#f0b35a';
  return '#00d1ff';
}

void zoneAccent; // reservado: se conserva sin uso por ahora (corrección TS6133 sin cambiar comportamiento)

function observationStatusColor(status?: string | null) {
  if (status === 'ACCEPTED_FOR_METHOD_TEST') return '#72e0b5';
  if (status === 'EXCLUDED_FROM_METHOD_TEST') return '#ef7777';
  if (status === 'PILOT_METHOD_REVIEWED') return '#4de3ff';
  return '#f0b35a';
}

function heightForVariant(variant: Variant) {
  if (variant === 'field') return '320px';
  if (variant === 'review') return '360px';
  if (variant === 'overview') return '480px';
  return '640px';
}

export default function PB124RouteMap({
  variant = 'overview',
  currentPosition,
  selectedPosition,
  observationPoints = [],
  selectedObservationId,
  onObservationSelect,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const alertMarkersRef = useRef<maplibregl.Marker[]>([]);
  const methodWindowMarkersRef = useRef<maplibregl.Marker[]>([]);
  const currentMarkerRef = useRef<maplibregl.Marker | null>(null);
  const selectedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const scheduleShipMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routePulseFrameRef = useRef<number | null>(null);
  const observationMarkersRef = useRef<maplibregl.Marker[]>([]);

  const scheduleZone = useMemo(() => getPB124ScheduleZone(new Date()), []);
  const [selectedZone, setSelectedZone] = useState<PB124Zone>(
    scheduleZone || PB124_ZONES[0],
  );

  const routeCollection = useMemo(() => buildZoneRouteCollection(), []);
  const waypointCollection = useMemo(() => buildWaypointCollection(), []);
  const [projectedOverlay, setProjectedOverlay] = useState<ProjectedPB124Overlay>({
    paths: [],
    zones: [],
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: [0, 12],
      zoom: variant === 'field' || variant === 'review' ? -0.45 : -0.15,
      minZoom: -1.15,
      maxZoom: 11,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      renderWorldCopies: false,
    });
    mapRef.current = map;

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    const updateProjectedReferenceOverlay = () => {
      const host = containerRef.current;
      if (!host) return;

      const width = Math.max(1, host.clientWidth);
      const paths: string[] = [];

      for (const feature of routeCollection.features) {
        const geometry: any = feature.geometry;
        const lines: [number, number][][] = geometry.type === 'MultiLineString'
          ? geometry.coordinates
          : [geometry.coordinates];

        for (const line of lines) {
          let d = '';
          let previousX: number | null = null;

          for (const coord of line) {
            const projected = map.project(coord as [number, number]);
            if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y)) continue;

            // Split visual paths across the antimeridian/world edge so mobile
            // browsers never draw one long false line across the viewport.
            const discontinuity = previousX != null
              && Math.abs(projected.x - previousX) > Math.max(180, width * 0.45);

            d += `${!d || discontinuity ? 'M' : 'L'}${projected.x.toFixed(1)},${projected.y.toFixed(1)} `;
            previousX = projected.x;
          }

          if (d.trim()) paths.push(d.trim());
        }
      }

      const height = Math.max(1, host.clientHeight);
      const edgeX = Math.min(34, Math.max(24, width * 0.085));
      const topY = Math.max(68, height * 0.20);
      const bottomY = Math.min(height - 58, height * 0.80);
      const stepY = Math.max(36, (bottomY - topY) / 4);

      // Collision-proof callouts: 1–5 on the left edge and 6–10 on the right.
      // Each callout is connected by a leader line to the true geographic point.
      // This guarantees all 10 remain visually distinct on a narrow phone screen.
      const zones = PB124_ZONES.map((zone, index) => {
        const projected = map.project(zone.marker);
        const leftSide = index < 5;
        const slot = index % 5;

        return {
          id: zone.id,
          code: zone.code,
          index,
          pointX: projected.x,
          pointY: projected.y,
          labelX: leftSide ? edgeX : width - edgeX,
          labelY: topY + slot * stepY,
        };
      }).filter((zone) =>
        Number.isFinite(zone.pointX)
        && Number.isFinite(zone.pointY)
        && Number.isFinite(zone.labelX)
        && Number.isFinite(zone.labelY)
      );

      setProjectedOverlay({ paths, zones });
    };

    // Register the reference overlay BEFORE the style-layer setup below.
    // It depends only on map projection, not on custom MapLibre sources/layers.
    map.on('load', updateProjectedReferenceOverlay);
    map.on('move', updateProjectedReferenceOverlay);
    map.on('resize', updateProjectedReferenceOverlay);
    window.setTimeout(updateProjectedReferenceOverlay, 50);

    // Always-on DOM markers for all 10 PB124 method windows. These markers do not
    // depend on style load, custom MapLibre layers, glyphs, or WebGL source setup.
    // This makes the numbered sampling windows reliable on mobile browsers.
    methodWindowMarkersRef.current = PB124_ZONES.map((zone, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.pb124WindowMarker = String(index + 1);
      button.setAttribute('aria-label', `Method window ${index + 1}: ${zone.title}`);
      button.title = `${index + 1}. ${zone.code} · ${zone.title}`;
      button.style.width = '30px';
      button.style.height = '30px';
      button.style.borderRadius = '999px';
      button.style.border = '2px solid #4de3ff';
      button.style.background = 'rgba(3,19,27,0.97)';
      button.style.color = '#ffffff';
      button.style.fontFamily = 'monospace';
      button.style.fontSize = '11px';
      button.style.fontWeight = '900';
      button.style.cursor = 'pointer';
      button.style.display = 'grid';
      button.style.placeItems = 'center';
      button.style.boxShadow = '0 0 0 5px rgba(0,209,255,0.12), 0 0 20px rgba(0,209,255,0.34)';
      button.style.zIndex = '20';
      button.textContent = String(index + 1);
      button.addEventListener('click', () => {
        setSelectedZone(zone);
        map.flyTo({
          center: zone.marker,
          zoom: variant === 'field' ? 2.4 : 2.2,
          duration: 850,
        });
      });

      return new maplibregl.Marker({ element: button, anchor: 'center' })
        .setLngLat(zone.marker)
        .addTo(map);
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
      'top-right',
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right',
    );

    map.on('load', () => {
      applyOleaDarkBase(map);

      // Field/mobile starts in a genuine global overview so all 10 numbered
      // method windows are on-screen together. Users can then tap any marker.
      if (variant === 'field' || variant === 'review') {
        map.jumpTo({
          center: [0, 10],
          zoom: -0.55,
        });
      }

      map.addSource('pb124-zone-routes', {
        type: 'geojson',
        data: routeCollection as any,
      });
      map.addLayer({
        id: 'pb124-route-glow',
        type: 'line',
        source: 'pb124-zone-routes',
        paint: {
          'line-color': '#00d1ff',
          'line-width': 8,
          'line-opacity': 0.10,
          'line-blur': 5,
        },
      });
      map.addLayer({
        id: 'pb124-route-main',
        type: 'line',
        source: 'pb124-zone-routes',
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'zoneId'], scheduleZone?.id || ''],
            '#f0b35a',
            '#00d1ff',
          ],
          'line-width': [
            'case',
            ['==', ['get', 'zoneId'], scheduleZone?.id || ''],
            3.2,
            2.1,
          ],
          'line-opacity': [
            'case',
            ['==', ['get', 'zoneId'], scheduleZone?.id || ''],
            0.98,
            0.70,
          ],
        },
      });

      if (scheduleZone) {
        map.addLayer({
          id: 'pb124-route-schedule-pulse',
          type: 'line',
          source: 'pb124-zone-routes',
          filter: ['==', ['get', 'zoneId'], scheduleZone.id],
          paint: {
            'line-color': '#ffd07a',
            'line-width': 6.4,
            'line-opacity': 0.18,
            'line-blur': 2.5,
          },
        });

        const animatePulse = (time: number) => {
          if (!map.getLayer('pb124-route-schedule-pulse')) return;
          const wave = (Math.sin(time / 620) + 1) / 2;
          map.setPaintProperty(
            'pb124-route-schedule-pulse',
            'line-opacity',
            0.10 + wave * 0.22,
          );
          map.setPaintProperty(
            'pb124-route-schedule-pulse',
            'line-width',
            5.4 + wave * 2.8,
          );
          routePulseFrameRef.current = requestAnimationFrame(animatePulse);
        };
        routePulseFrameRef.current = requestAnimationFrame(animatePulse);
      }

      map.addSource('pb124-waypoints', {
        type: 'geojson',
        data: waypointCollection as any,
      });
      map.addLayer({
        id: 'pb124-waypoints-halo',
        type: 'circle',
        source: 'pb124-waypoints',
        paint: {
          'circle-radius': 7,
          'circle-color': '#00d1ff',
          'circle-opacity': 0.12,
        },
      });
      map.addLayer({
        id: 'pb124-waypoints-dot',
        type: 'circle',
        source: 'pb124-waypoints',
        paint: {
          'circle-radius': 3.2,
          'circle-color': '#dffbff',
          'circle-stroke-color': '#00d1ff',
          'circle-stroke-width': 1.2,
          'circle-opacity': 0.95,
        },
      });

      map.addLayer({
        id: 'pb124-waypoints-label-major',
        type: 'symbol',
        source: 'pb124-waypoints',
        filter: ['==', ['get', 'majorLabel'], true],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 10,
          'text-font': ['Noto Sans Regular'],
          'text-offset': [0, 1.15],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': '#d8eef4',
          'text-halo-color': '#030b12',
          'text-halo-width': 1.6,
          'text-opacity': 0.92,
        },
      });

      map.addLayer({
        id: 'pb124-waypoints-label-all',
        type: 'symbol',
        source: 'pb124-waypoints',
        minzoom: 2.7,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 9,
          'text-font': ['Noto Sans Regular'],
          'text-offset': [0, 1.15],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': '#9fc2ce',
          'text-halo-color': '#030b12',
          'text-halo-width': 1.4,
          'text-opacity': 0.82,
        },
      });

      map.on('mouseenter', 'pb124-waypoints-dot', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'pb124-waypoints-dot', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('click', 'pb124-waypoints-dot', (evt) => {
        const feature = evt.features?.[0];
        if (!feature?.properties) return;
        const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        new maplibregl.Popup({
          closeButton: false,
          offset: 12,
          className: 'pb124-map-popup',
        })
          .setLngLat(coords)
          .setHTML(
            `<div style="font-family:monospace;padding:2px 0">
              <div style="font-size:10px;color:#00d1ff;font-weight:700">OFFICIAL ITINERARY REFERENCE</div>
              <div style="font-size:12px;color:#fff;font-weight:700;margin-top:3px">${feature.properties.name}</div>
              <div style="font-size:10px;color:#a6bdc8;margin-top:2px">${feature.properties.country} · ${feature.properties.dateLabel}</div>
              <div style="font-size:9px;color:#f0b35a;margin-top:5px">Published itinerary ≠ observed GNSS track</div>
            </div>`,
          )
          .addTo(map);
      });

      if (scheduleZone) {
        const shipWrap = document.createElement('div');
        shipWrap.style.display = 'flex';
        shipWrap.style.alignItems = 'center';
        shipWrap.style.gap = '5px';
        shipWrap.style.pointerEvents = 'none';
        shipWrap.title = 'Published schedule window — not live vessel telemetry';

        const shipIcon = document.createElement('div');
        shipIcon.style.width = '34px';
        shipIcon.style.height = '34px';
        shipIcon.style.borderRadius = '12px';
        shipIcon.style.display = 'grid';
        shipIcon.style.placeItems = 'center';
        shipIcon.style.background = 'rgba(240,179,90,0.96)';
        shipIcon.style.border = '2px solid rgba(255,225,164,0.9)';
        shipIcon.style.boxShadow = '0 0 0 7px rgba(240,179,90,0.12), 0 0 26px rgba(240,179,90,0.38)';
        shipIcon.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="#071018" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <path d="M12 2v6"/>
            <path d="M5 8h14l-1.5 8H6.5L5 8Z"/>
            <path d="M3 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/>
          </svg>`;

        const shipLabel = document.createElement('div');
        shipLabel.style.whiteSpace = 'nowrap';
        shipLabel.style.border = '1px solid rgba(240,179,90,0.42)';
        shipLabel.style.background = 'rgba(31,23,10,0.94)';
        shipLabel.style.borderRadius = '9px';
        shipLabel.style.padding = '5px 7px';
        shipLabel.style.color = '#f0c46b';
        shipLabel.style.fontFamily = 'monospace';
        shipLabel.style.fontSize = '8px';
        shipLabel.style.fontWeight = '800';
        shipLabel.style.letterSpacing = '0.08em';
        shipLabel.textContent = 'SCHEDULE WINDOW · NOT LIVE';

        shipWrap.appendChild(shipIcon);
        if (variant !== 'field') shipWrap.appendChild(shipLabel);

        shipIcon.animate(
          [
            { transform: 'translateY(0px) scale(1)', boxShadow: '0 0 0 6px rgba(240,179,90,0.10), 0 0 18px rgba(240,179,90,0.28)' },
            { transform: 'translateY(-2px) scale(1.04)', boxShadow: '0 0 0 9px rgba(240,179,90,0.15), 0 0 30px rgba(240,179,90,0.46)' },
            { transform: 'translateY(0px) scale(1)', boxShadow: '0 0 0 6px rgba(240,179,90,0.10), 0 0 18px rgba(240,179,90,0.28)' },
          ],
          { duration: 2200, iterations: Infinity, easing: 'ease-in-out' },
        );

        scheduleShipMarkerRef.current = new maplibregl.Marker({
          element: shipWrap,
          anchor: 'center',
          offset: [0, -20],
        })
          .setLngLat(scheduleZone.marker)
          .addTo(map);
      }

      // Persistent method-window DOM markers are installed before style load.
    });

    return () => {
      map.off('load', updateProjectedReferenceOverlay);
      map.off('move', updateProjectedReferenceOverlay);
      map.off('resize', updateProjectedReferenceOverlay);
      alertMarkersRef.current.forEach((m) => m.remove());
      alertMarkersRef.current = [];
      methodWindowMarkersRef.current.forEach((m) => m.remove());
      methodWindowMarkersRef.current = [];
      currentMarkerRef.current?.remove();
      selectedMarkerRef.current?.remove();
      scheduleShipMarkerRef.current?.remove();
      scheduleShipMarkerRef.current = null;
      if (routePulseFrameRef.current != null) {
        cancelAnimationFrame(routePulseFrameRef.current);
        routePulseFrameRef.current = null;
      }
      observationMarkersRef.current.forEach((marker) => marker.remove());
      observationMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [routeCollection, waypointCollection, scheduleZone?.id, variant]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer('pb124-route-main')) return;
    map.setPaintProperty('pb124-route-main', 'line-color', [
      'case',
      ['==', ['get', 'zoneId'], selectedZone.id],
      '#f0b35a',
      ['==', ['get', 'zoneId'], scheduleZone?.id || ''],
      '#72e0b5',
      '#00d1ff',
    ]);
    map.setPaintProperty('pb124-route-main', 'line-width', [
      'case',
      ['==', ['get', 'zoneId'], selectedZone.id],
      3.8,
      2.1,
    ]);
  }, [selectedZone.id, scheduleZone?.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    currentMarkerRef.current?.remove();
    currentMarkerRef.current = null;

    if (!currentPosition) return;

    const el = document.createElement('div');
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.background = '#4de3ff';
    el.style.border = '3px solid #03131b';
    el.style.boxShadow = '0 0 0 7px rgba(77,227,255,0.16), 0 0 28px rgba(77,227,255,0.58)';
    el.title = 'Device GNSS position';

    currentMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([currentPosition.lng, currentPosition.lat])
      .addTo(map);

    const updateAccuracy = () => {
      if (!map.isStyleLoaded()) return;
      const accuracy = Math.max(1, currentPosition.accuracy || 1);
      const accuracyPolygon = circle(
        [currentPosition.lng, currentPosition.lat],
        accuracy / 1000,
        { steps: 48, units: 'kilometers' },
      );

      const source = map.getSource('pb124-current-accuracy') as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData(accuracyPolygon as any);
      } else {
        map.addSource('pb124-current-accuracy', {
          type: 'geojson',
          data: accuracyPolygon as any,
        });
        map.addLayer({
          id: 'pb124-current-accuracy-fill',
          type: 'fill',
          source: 'pb124-current-accuracy',
          paint: {
            'fill-color': '#4de3ff',
            'fill-opacity': 0.12,
          },
        });
        map.addLayer({
          id: 'pb124-current-accuracy-line',
          type: 'line',
          source: 'pb124-current-accuracy',
          paint: {
            'line-color': '#4de3ff',
            'line-width': 1,
            'line-opacity': 0.45,
          },
        });
      }
    };

    if (map.isStyleLoaded()) updateAccuracy();
    else map.once('load', updateAccuracy);
  }, [currentPosition?.lat, currentPosition?.lng, currentPosition?.accuracy]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    selectedMarkerRef.current?.remove();
    selectedMarkerRef.current = null;

    if (!selectedPosition) return;

    const el = document.createElement('div');
    el.style.width = '22px';
    el.style.height = '22px';
    el.style.transform = 'rotate(45deg)';
    el.style.background = '#72e0b5';
    el.style.border = '3px solid #03131b';
    el.style.boxShadow = '0 0 0 6px rgba(114,224,181,0.13), 0 0 22px rgba(114,224,181,0.36)';
    el.title = selectedPosition.status || 'Selected PB124 observation';

    selectedMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([selectedPosition.lng, selectedPosition.lat])
      .addTo(map);

    if (variant === 'review') {
      const focus = () => map.flyTo({
        center: [selectedPosition.lng, selectedPosition.lat],
        zoom: 4.3,
        duration: 900,
      });
      if (map.loaded()) focus();
      else map.once('load', focus);
    }
  }, [selectedPosition?.lat, selectedPosition?.lng, selectedPosition?.status, variant]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    observationMarkersRef.current.forEach((marker) => marker.remove());
    observationMarkersRef.current = [];

    if (!observationPoints.length) return;

    const addMarkers = () => {
      observationMarkersRef.current.forEach((marker) => marker.remove());
      observationMarkersRef.current = observationPoints.map((obs) => {
        const selected = obs.observationId === selectedObservationId;
        const color = observationStatusColor(obs.status);

        const button = document.createElement('button');
        button.type = 'button';
        button.title = `${obs.label || 'PB124 observation'} · ${obs.status || 'PILOT_FIELD_OBSERVATION'}`;
        button.style.width = selected ? '30px' : '24px';
        button.style.height = selected ? '30px' : '24px';
        button.style.borderRadius = '10px';
        button.style.border = `2px solid ${selected ? '#ffffff' : color}`;
        button.style.background = selected ? color : 'rgba(3,16,24,0.96)';
        button.style.boxShadow = selected
          ? `0 0 0 7px ${color}22, 0 0 24px ${color}77`
          : `0 0 0 4px ${color}18, 0 0 14px ${color}44`;
        button.style.cursor = onObservationSelect ? 'pointer' : 'default';
        button.style.display = 'grid';
        button.style.placeItems = 'center';
        button.style.color = selected ? '#041018' : color;
        button.style.fontFamily = 'monospace';
        button.style.fontSize = '9px';
        button.style.fontWeight = '900';
        button.textContent = 'OBS';

        if (onObservationSelect) {
          button.addEventListener('click', () => onObservationSelect(obs.observationId));
        }

        const marker = new maplibregl.Marker({ element: button, anchor: 'center' })
          .setLngLat([obs.lng, obs.lat])
          .addTo(map);

        const popupHtml = `
          <div style="font-family:monospace;min-width:190px">
            <div style="font-size:9px;color:${color};font-weight:800">REAL PB124 FIELD OBSERVATION</div>
            <div style="margin-top:4px;color:#fff;font-size:11px;font-weight:700">${obs.label || obs.observationId.slice(0, 8)}</div>
            <div style="margin-top:3px;color:#89a4ae;font-size:9px">${obs.utc || 'UTC not available'}</div>
            <div style="margin-top:2px;color:#89a4ae;font-size:9px">Accuracy ${obs.accuracy == null ? '—' : `±${Math.round(obs.accuracy)} m`}</div>
            <div style="margin-top:5px;color:${color};font-size:9px;font-weight:800">${obs.status || 'PILOT_FIELD_OBSERVATION'}</div>
          </div>`;

        marker.setPopup(new maplibregl.Popup({
          closeButton: false,
          offset: 16,
          className: 'pb124-map-popup',
        }).setHTML(popupHtml));

        return marker;
      });
    };

    if (map.loaded()) addMarkers();
    else map.once('load', addMarkers);

    return () => {
      observationMarkersRef.current.forEach((marker) => marker.remove());
      observationMarkersRef.current = [];
    };
  }, [observationPoints, selectedObservationId, onObservationSelect]);

  const fitRoute = () => {
    mapRef.current?.easeTo({
      center: [0, 10],
      zoom: variant === 'field' ? -0.55 : -0.35,
      duration: 900,
    });
  };

  const locate = () => {
    if (!currentPosition || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [currentPosition.lng, currentPosition.lat],
      zoom: 5,
      duration: 900,
    });
  };

  const panel = variant === 'full' ? (
    <div className="rounded-2xl border border-[#1b4050] bg-[#071722]/95 p-3 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-[#7ea0ad]">
            Zone {selectedZone.code} · method guidance
          </div>
          <div className="mt-1 text-xs font-bold text-white">{selectedZone.title}</div>
          <div className="text-[10px] text-[#8faab5]">{selectedZone.subtitle}</div>
        </div>
        <Radar className="w-4 h-4 text-[#f0b35a] flex-shrink-0" />
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#664b20] bg-[#2a1d0b]/85 px-2.5 py-2">
        <AlertTriangle className="mt-0.5 w-3.5 h-3.5 text-[#f0b35a] flex-shrink-0" />
        <div>
          <div className="text-[9px] font-bold text-[#f0b35a]">{selectedZone.alertTitle}</div>
          <div className="mt-0.5 text-[9px] leading-relaxed text-[#cdbf9f]">{selectedZone.alertDetail}</div>
        </div>
      </div>

      <div className="mt-2 text-[8px] leading-relaxed text-[#688895]">
        Sampling guidance only · not environmental hazard · not live ship telemetry.
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#1b4050] bg-[#071722]/95 px-3 py-2.5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7ea0ad]">
            Zone {selectedZone.code}
          </span>
          <span className="truncate text-[10px] font-bold text-white">{selectedZone.title}</span>
        </div>
        <div className="mt-1 truncate text-[9px] text-[#7895a2]">{selectedZone.subtitle}</div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-[#664b20] bg-[#2a1d0b]/75 px-2.5 py-1.5">
        <Radar className="w-3 h-3 text-[#f0b35a]" />
        <span className="text-[9px] font-bold text-[#f0b35a]">{selectedZone.alertTitle}</span>
      </div>
    </div>
  );

  return (
    <div className={`font-mono ${className}`}>
      <div
        className={`relative overflow-hidden rounded-3xl border border-[#173746] bg-[#030b12] ${
          variant === 'full' ? 'shadow-[0_24px_90px_rgba(0,209,255,0.09)]' : ''
        }`}
      >
        <div
          ref={containerRef}
          style={{ height: heightForVariant(variant) }}
          className="w-full"
        />

        {/* Projection-based PB124 reference overlay.
            It is intentionally independent of MapLibre custom style layers so the
            official route and 10 sampling windows remain visible on mobile even
            if a browser/GL implementation fails to render the native route source. */}
        <svg
          aria-label="PB124 official itinerary reference and sampling windows"
          className="pointer-events-none absolute inset-0 z-[6] h-full w-full overflow-hidden"
        >
          <g fill="none">
            {projectedOverlay.paths.map((d, index) => (
              <g key={`pb124-overlay-route-${index}`}>
                <path
                  d={d}
                  stroke="#00d1ff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.13"
                />
                <path
                  d={d}
                  stroke="#4de3ff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.94"
                />
              </g>
            ))}
          </g>

          {projectedOverlay.zones.map((projected) => {
            const zone = PB124_ZONES.find((candidate) => candidate.id === projected.id);
            if (!zone) return null;
            const active = zone.id === selectedZone.id;
            const schedule = zone.id === scheduleZone?.id;
            const accent = schedule ? '#f0b35a' : active ? '#72e0b5' : '#00d1ff';

            return (
              <g key={`pb124-overlay-zone-${zone.id}`}>
                <line
                  x1={projected.labelX}
                  y1={projected.labelY}
                  x2={projected.pointX}
                  y2={projected.pointY}
                  stroke={accent}
                  strokeWidth={active || schedule ? 1.8 : 1.2}
                  strokeDasharray={active || schedule ? '4 3' : '3 4'}
                  opacity={active || schedule ? 0.78 : 0.5}
                />
                <circle
                  cx={projected.pointX}
                  cy={projected.pointY}
                  r={active || schedule ? 6.5 : 4.8}
                  fill={schedule ? '#f0b35a' : '#061722'}
                  stroke={accent}
                  strokeWidth={active || schedule ? 2.2 : 1.6}
                  opacity="0.98"
                />
                <circle
                  cx={projected.pointX}
                  cy={projected.pointY}
                  r={active || schedule ? 12 : 9}
                  fill={accent}
                  opacity={active || schedule ? 0.12 : 0.07}
                />
              </g>
            );
          })}
        </svg>

        {/* Collision-proof numbered callouts: all 10 are always visible on the
            phone map perimeter. Leader lines point to the true geographic
            method-window coordinates. */}
        {projectedOverlay.zones.map((projected) => {
          const zone = PB124_ZONES.find((candidate) => candidate.id === projected.id);
          if (!zone) return null;
          const active = zone.id === selectedZone.id;
          const schedule = zone.id === scheduleZone?.id;

          return (
            <button
              key={`pb124-callout-${zone.id}`}
              type="button"
              aria-label={`Method window ${projected.index + 1}: ${zone.title}`}
              title={`${projected.index + 1}. ${zone.code} · ${zone.title}`}
              onClick={() => {
                setSelectedZone(zone);
                mapRef.current?.flyTo({
                  center: zone.marker,
                  zoom: variant === 'field' ? 2.4 : 2.2,
                  duration: 850,
                });
              }}
              className={`absolute z-[12] grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 font-mono text-[11px] font-black shadow-[0_0_0_4px_rgba(0,209,255,0.12),0_0_16px_rgba(0,209,255,0.28)] ${
                schedule
                  ? 'border-[#f0b35a] bg-[#f0b35a] text-[#071018]'
                  : active
                    ? 'border-[#72e0b5] bg-[#0b2a25] text-white'
                    : 'border-[#4de3ff] bg-[#03131b] text-white'
              }`}
              style={{ left: projected.labelX, top: projected.labelY }}
            >
              {projected.index + 1}
            </button>
          );
        })}

        <div className="pointer-events-none absolute bottom-3 right-3 z-[8] rounded-xl border border-[#00d1ff]/35 bg-[#03131b]/90 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-[#bceaf3] backdrop-blur-md">
          10 METHOD WINDOWS · GUIDANCE ONLY · NO QUOTA
        </div>

        <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[72%]">
          <div className="pointer-events-auto rounded-2xl border border-[#173746] bg-[#04131c]/90 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[10px] font-bold text-white">
              <Ship className="w-3.5 h-3.5 text-[#00d1ff]" />
              PEACE BOAT 124 · OFFICIAL ITINERARY REFERENCE
            </div>
            <div className="mt-0.5 text-[9px] text-[#7393a0]">
              Published schedule layer · NOT A LIVE VESSEL TRACK
            </div>
            {observationPoints.length > 0 && (
              <div className="mt-1 text-[8px] font-bold text-[#72e0b5]">
                REAL FIELD OBSERVATIONS · {observationPoints.length}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fitRoute}
            className="flex items-center gap-1.5 rounded-xl border border-[#1f4b5f] bg-[#061722]/92 px-2.5 py-2 text-[10px] font-bold text-[#bceaf3] backdrop-blur-md"
          >
            <Route className="w-3.5 h-3.5 text-[#00d1ff]" />
            SHOW ALL 10
          </button>
          {currentPosition && (
            <button
              type="button"
              onClick={locate}
              className="flex items-center gap-1.5 rounded-xl border border-[#315f63] bg-[#09201d]/92 px-2.5 py-2 text-[10px] font-bold text-[#bff6dd] backdrop-blur-md"
            >
              <LocateFixed className="w-3.5 h-3.5 text-[#72e0b5]" />
              MY GNSS
            </button>
          )}
        </div>

        {scheduleZone && (
          <div className="absolute right-3 top-3 z-10 hidden sm:block">
            <div className="rounded-2xl border border-[#6b5226] bg-[#2a1d0b]/90 px-3 py-2 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#f0b35a]">
                <Navigation className="w-3 h-3" />
                ACTIVE PUBLISHED SCHEDULE LEG
              </div>
              <div className="mt-1 text-[10px] text-white">
                Zone {scheduleZone.code} · {scheduleZone.title}
              </div>
              <div className="mt-0.5 text-[8px] text-[#aa9163]">
                Reference window only · not live ship telemetry
              </div>
            </div>
          </div>
        )}
      </div>

      {variant !== 'full' && (
        <div className="mt-3 rounded-2xl border border-[#173746] bg-[#061722]/95 p-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#bceaf3]">
              10 METHOD WINDOWS · GUIDANCE ONLY · MAP CALLOUTS 1–10
            </div>
            <button
              type="button"
              onClick={fitRoute}
              className="rounded-lg border border-[#24566a] bg-[#08202b] px-2 py-1 text-[8px] font-bold text-[#4de3ff]"
            >
              SHOW ALL 10
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {PB124_ZONES.map((zone, index) => {
              const active = zone.id === selectedZone.id;
              return (
                <button
                  key={`pb124-mobile-window-${zone.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedZone(zone);
                    mapRef.current?.flyTo({ center: zone.marker, zoom: 2.4, duration: 850 });
                  }}
                  className={`flex min-h-[42px] flex-col items-center justify-center rounded-xl border px-1 py-1.5 ${
                    active
                      ? 'border-[#72e0b5] bg-[#0b2a25] text-white'
                      : 'border-[#1b4658] bg-[#04131c] text-[#bceaf3]'
                  }`}
                  title={`${index + 1}. ${zone.title}`}
                >
                  <span className="text-[12px] font-black leading-none text-[#4de3ff]">{index + 1}</span>
                  <span className="mt-1 text-[7px] font-bold uppercase tracking-[0.08em]">{zone.code}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-[8px] leading-relaxed text-[#688895]">
            Sampling guidance only · these are method windows, not hazard or pollution claims.
          </div>
        </div>
      )}

      {variant === 'full' ? (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-4">{panel}</div>
          <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[330px] overflow-y-auto pr-1">
            {PB124_ZONES.map((zone) => {
              const active = zone.id === selectedZone.id;
              const schedule = zone.id === scheduleZone?.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    setSelectedZone(zone);
                    mapRef.current?.flyTo({ center: zone.marker, zoom: 2.3, duration: 850 });
                  }}
                  className={`rounded-2xl border p-3 text-left transition-all ${
                    active
                      ? 'border-[#f0b35a] bg-[#2a1d0b]'
                      : 'border-[#173746] bg-[#071722] hover:border-[#286178]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-[#7ea0ad]">ZONE {zone.code}</span>
                    {schedule && (
                      <span className="rounded-full bg-[#f0b35a]/15 px-2 py-0.5 text-[8px] font-bold text-[#f0b35a]">
                        SCHEDULE WINDOW
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-white">{zone.title}</div>
                  <div className="mt-1 text-[9px] text-[#7393a0]">{zone.subtitle}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-[#f0b35a]">
                    <AlertTriangle className="w-3 h-3" />
                    {zone.alertTitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-3">{panel}</div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[8px] uppercase tracking-[0.13em] text-[#5f7d89]">
        <span className="flex items-center gap-1.5">
          <Compass className="w-3 h-3" />
          OpenFreeMap / OpenStreetMap base · approximate port centroids
        </span>
        <a
          href={PB124_OFFICIAL_REFERENCE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[#7fbec8] hover:text-white"
        >
          <MapPin className="w-3 h-3" />
          Peace Boat published itinerary
        </a>
      </div>
    </div>
  );
}
