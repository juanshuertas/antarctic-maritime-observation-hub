import { installContinuousHeatRuntime, syncContinuousHeatLayers } from '../lib/continuous-heatmap-runtime';
import { lazyFetch, whenActive } from '../lib/lazy-layer-fetch';

import { installHeatmapStyleSystem } from '../lib/heatmap-style-system';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

import * as maplibregl from 'maplibre-gl';

import type { Map as MlMap } from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';

import { WodMapEngine, OSIRIS_BASEMAP_STYLE } from '../lib/wod-map-engine';
import type { MapMode } from '../lib/spatial-camera-store';

import { SpatialCameraStore } from '../lib/spatial-camera-store';

import { TimePropagationEngine } from '../lib/time-propagation-engine';

import { api } from '../lib/api';

import { createPoller } from '../lib/polling';
import { fetchOpenVessels } from '../lib/open-vessel-feed';
import { fetchOpenAircraft, TRAFFIC_LAYERS, updateTraffic, type TrafficFeed } from '../lib/observatory-traffic';

import { fetchSubmarineCables } from '../lib/osiris-live-feeds';

import { buildAntarcticOzoneData } from '../lib/ozone-data';




import ScaleBar from './ScaleBar';

import MapControls from './MapControls';

import { fetchLocalAntarcticCartography } from '../lib/antarctic-cartography';

import { isSafeMode } from '../lib/safe-mode';

import CircumpolarFlowCanvas from './CircumpolarFlowCanvas';

import { ANTARCTIC_LIFE_ATLAS } from '../lib/biodiversity-service';

import { GATEWAY_OFFSHORE_ENERGY } from '../lib/offshore-energy';

import { getLayerSDGColor, getLayerSDG } from '../lib/sdg-registry';

import { getLayerSemantics } from '../lib/layer-semantics';

import { getLayerSvgDataUri } from '../lib/map-icon-atlas';

import { ODSLegend } from './ODSLegend';

import { applyQuantarcticaLayersToMap } from '../lib/quantarctica-layers';

import { useMapLayers } from '../hooks/useMapLayers';



import { AmohCameraController } from '../motion/cameraController';

import { AmohEntityTracker } from '../motion/entityTracking';



import { syncDirectDataLayers } from '../lib/direct-data-runtime';
import { installReferenceLockV9 } from '../lib/reference-lock-v9';
import { installCinematicOrbitGodsEyeV12 } from '../lib/cinematic-orbit-gods-eye-v12';
import { installCesiumSatOrbitalV16, navigateCesiumGlobe } from '../lib/cesium-sat-orbital-v16';
const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };



export interface WodMapPanelHandle {

  flyTo: (coords: [number, number], zoom?: number) => void;

  flyToSector: (sectorKey: string) => void;

  trackEntity: (coords: [number, number], entityId: string, zoom?: number) => void;

  clearTrack: () => void;

  setLayerVisible: (id: string, visible: boolean) => void;

  zoomIn: () => void;

  zoomOut: () => void;

  resetNorth: () => void;

  resetAntarctica: () => void;

  getMap: () => MlMap | null;

  setUltraHd4KMode: (enabled: boolean) => void;

  setInachLayersVisible: (visible: boolean) => void;

}



interface WodMapPanelProps {

  className?: string;

  height?: string;

  fullBleed?: boolean;

  onSelectCoords?: (coords: { lat: number; lng: number }) => void;

  onSelectObject?: (obj: any) => void;

  activeLayers?: Record<string, boolean>;

}



const ALL_THEMATIC_LAYERS = [

  'maritime_vessels',

  'polar_aircraft',

  'polar_satellites',

  'fisheries_effort',

  'gfw_fishing_effort',

  'gfw_sar_detections',

  'iaato_routes',

  'tourism_routes',

  'maris_nuclear',

  'argo_floats',

  'antarctic_fauna',

  'biodiversity_atlas',

  'offshore_energy',

  'seismic_events',

  'field_observations',

  'submarine_cables',

  'aspa',

  'quantarctica_stations',

  'ocean_currents',

  'wind_particles',

  'cctv_cams',

  'mirofish_heatmap',

  'mirofish_trajectories',

  'maritime_corridors',

  'strategic_waterways',

  'treaty_claims',

  'ccamlr_zones',

  'sar_regions',

];



const WodMapPanel = forwardRef<WodMapPanelHandle, WodMapPanelProps>(function WodMapPanel(

  { className = '', height, fullBleed: _fullBleed, onSelectCoords, onSelectObject, activeLayers },

  ref

) {

  const containerRef = useRef<HTMLDivElement>(null);

  const engineRef = useRef<WodMapEngine | null>(null);

  const cameraControllerRef = useRef<AmohCameraController | null>(null);

  const entityTrackerRef = useRef<AmohEntityTracker | null>(null);

  const mapRef = useRef<MlMap | null>(null);

  const [readout, setReadout] = useState({ lat: -84.0, lng: 0.0, zoom: 1.65 });

  const [currentMap, setCurrentMap] = useState<MlMap | null>(null);



  const activeLayerIds = Object.entries(activeLayers || {})
    .filter(([_, v]) => v)
    .map(([k]) => k);
  const activeLayerSignature = activeLayerIds.slice().sort().join('|');



  useMapLayers({

    map: currentMap,

    activeLayers: activeLayerIds,

  });

  // AMOH_OLEA_NATIVE_LAYER_BRIDGE_V13B
  // Existing OLEA activeLayers is the only user-facing layer control system.
  useEffect(() => {
    (window as any).__amohOleaNativeLayers = activeLayers ?? {};
    return () => {
      try {
        delete (window as any).__amohOleaNativeLayers;
      } catch {}
    };
  }, [activeLayers]);




  useImperativeHandle(ref, () => ({

    flyTo: (coords: [number, number], zoom = 5.5) => {

      engineRef.current?.flyTo(coords, zoom);

    },

    flyToSector: (sectorKey: string) => {

      cameraControllerRef.current?.flyToSector(sectorKey);

    },

    trackEntity: (coords: [number, number], entityId: string, zoom = 6.5) => {

      cameraControllerRef.current?.trackEntity(coords, entityId, zoom);

    },

    clearTrack: () => {

      entityTrackerRef.current?.clearActiveEntity();

      cameraControllerRef.current?.stopTracking();

    },

    setLayerVisible: (id: string, visible: boolean) => {

      engineRef.current?.setLayerGroupVisible(id, visible);

    },

    zoomIn: () => {

      if (!navigateCesiumGlobe(mapRef.current, 'in')) engineRef.current?.map.zoomIn({ duration: 250 });

    },

    zoomOut: () => {

      if (!navigateCesiumGlobe(mapRef.current, 'out')) engineRef.current?.map.zoomOut({ duration: 250 });

    },

    resetNorth: () => {

      if (!navigateCesiumGlobe(mapRef.current, 'north')) engineRef.current?.map.resetNorth({ duration: 300 });

    },

    resetAntarctica: () => {
      if (navigateCesiumGlobe(mapRef.current, 'home')) return;

      if (cameraControllerRef.current) {

        cameraControllerRef.current.resetToOrbitalHome();

      } else {

        engineRef.current?.map.flyTo({

          center: [0.0, -84.0],

          zoom: 1.65,

          pitch: 48,

          bearing: 0,

          duration: 1000,

        });

      }

    },

    getMap: () => mapRef.current,

    setUltraHd4KMode: (enabled: boolean) => {

      engineRef.current?.setUltraHd4KMode(enabled);

    },

    setInachLayersVisible: (visible: boolean) => {

      engineRef.current?.setInachLayersVisible(visible);

    },

  }));



  const activeLayersRef = useRef<Record<string, boolean> | undefined>(activeLayers);
  const prevLayersRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    activeLayersRef.current = activeLayers;
  }, [activeLayers]);

  // Sync external layer visibility changes safely

  useEffect(() => {

    const engine = engineRef.current;

    if (!engine || !activeLayers) return;

    const applyVis = () => {

      const prev = prevLayersRef.current;

      const allKeys = new Set([...Object.keys(activeLayers), ...Object.keys(prev)]);

      allKeys.forEach((layerId) => {

        const visible = !!activeLayers[layerId];

        if (prev[layerId] !== visible) {

          engine.setLayerGroupVisible(layerId, visible);

          prev[layerId] = visible;

        }

      });

      // Quantarctica high-resolution layers synchronization

      applyQuantarcticaLayersToMap(

        engine.map,

        new Set(Object.keys(activeLayers).filter((k) => activeLayers[k]))

      );

    

      

      // AMOH_DIRECT_DATA_V6

      // Native renderer remains first. This only renders local DATA when

      // the logical layer has no native visual implementation.

      void syncDirectDataLayers(

        engine.map,

        activeLayers as Record<string, boolean>

      );

// AMOH_ALL_HEATMAPS_V4

      // Guaranteed renderer for the nine Heat panel products.

      // AMOH_V41_ACTIVE_SYNC



      installContinuousHeatRuntime(engine.map);
      // AMOH_REFERENCE_LOCK_V9
      installReferenceLockV9(engine.map);
      // AMOH_CINEMATIC_ORBIT_GODS_EYE_V12
      installCinematicOrbitGodsEyeV12(engine.map);
      // AMOH_CESIUM_SAT_ORBITAL_MASTER_V16

      // AMOH_SMART_CINEMATIC_RUNTIME_V11
      
      // AMOH_CINEMATIC_GRAPHICS_V10_FULL
      
      // AMOH_DEEP_REFERENCE_PARITY_V8
      



      void syncContinuousHeatLayers(



        engine.map,

        activeLayers as Record<string, boolean>

      );

    };



    if (engine.map.getStyle()?.version) {

      applyVis();

    } else {

      engine.whenReady().then(applyVis);

    }

  }, [activeLayerSignature]);



  // Main Map & OSIRIS Map Engine Initialization

  useEffect(() => {

    if (!containerRef.current) return;



    const isSafe = isSafeMode();

    const initialMode = SpatialCameraStore.getState().activeMode;



    // Initialize with OSIRIS basemap centered on Whole Antarctica

    const engine = new WodMapEngine({

      container: containerRef.current,

      style: OSIRIS_BASEMAP_STYLE,

      center: initialMode === 'GLOBE' ? [-50.0, -82.0] : [0.0, -75.0],

      zoom: initialMode === 'GLOBE' ? 1.85 : 2.5,

      pitch: initialMode === 'GLOBE' ? 45 : 0,

      projection: initialMode === 'GLOBE' ? 'globe' : 'mercator',

      terrain: false,

    });

    engineRef.current = engine;

    mapRef.current = engine.map;

    setCurrentMap(engine.map);

    cameraControllerRef.current = new AmohCameraController(engine.map);

    entityTrackerRef.current = new AmohEntityTracker(engine.map);

    (window as any).__wodEngine = engine;

    installHeatmapStyleSystem(engine.map);

    (window as any).__cameraController = cameraControllerRef.current;

    (window as any).__entityTracker = entityTrackerRef.current;

    const cesiumGlobe = installCesiumSatOrbitalV16(engine.map);
    TimePropagationEngine.attachEngine(engine);

    // ========================================================

    // AMOH_DIRECT_MAP_CONTROLLER

    // MAP / GLOBE / SAT operate directly on the ONE MapLibre

    // instance. No store/style-load wrapper controls projection.

    // ========================================================



    const directMap = engine.map;



    const satelliteFillVisibility =

      new Map<string, string | undefined>();





    let satelliteHomeBeforeId: string | null | undefined = undefined;



    const rememberSatelliteHome = () => {

      if (satelliteHomeBeforeId !== undefined) return;



      try {

        const layers = directMap.getStyle()?.layers || [];

        const index = layers.findIndex(

          (layer) => layer.id === 'satellite-layer'

        );



        satelliteHomeBeforeId =

          index >= 0 && index + 1 < layers.length

            ? layers[index + 1].id

            : null;

      } catch {

        satelliteHomeBeforeId = null;

      }

    };



    const setSatelliteDirect = (

      visible: boolean,

      promoteForSat = true

    ) => {

      try {

        const layerId = 'satellite-layer';



        if (!directMap.getLayer(layerId)) {

          console.warn('[AMOH DIRECT] satellite-layer not found');

          return;

        }



        rememberSatelliteHome();



        directMap.setLayoutProperty(

          layerId,

          'visibility',

          visible ? 'visible' : 'none'

        );



        directMap.setPaintProperty(

          layerId,

          'raster-opacity',

          visible ? 1 : 0

        );



        if (visible && promoteForSat) {

          const firstSymbol = directMap

            .getStyle()

            ?.layers

            ?.find((layer) => layer.type === 'symbol')

            ?.id;



          try {

            directMap.moveLayer(layerId, firstSymbol);

          } catch {

            // non-fatal

          }

        }



        if (

          visible &&

          !promoteForSat &&

          satelliteHomeBeforeId &&

          directMap.getLayer(satelliteHomeBeforeId)

        ) {

          try {

            directMap.moveLayer(

              layerId,

              satelliteHomeBeforeId

            );

          } catch {

            // non-fatal

          }

        }



        console.info(

          '[AMOH DIRECT] raster base:',

          visible ? 'ON' : 'OFF',

          promoteForSat ? 'SAT-STACK' : 'MAP-STACK'

        );



      } catch (err) {

        console.warn('[AMOH] Satellite visibility error:', err);

      }

    };





    const setSatelliteFillMode = (satellite: boolean) => {

      try {

        const layers = directMap.getStyle()?.layers || [];



        for (const layer of layers) {



          if (!layer.id.startsWith('quantarctica')) {

            continue;

          }



          // Keep scientific labels/lines visible.

          // Hide opaque polygon/raster coverage in SAT.

          if (

            layer.type !== 'fill' &&

            layer.type !== 'raster'

          ) {

            continue;

          }



          if (satellite) {



            if (!satelliteFillVisibility.has(layer.id)) {

              satelliteFillVisibility.set(

                layer.id,

                directMap.getLayoutProperty(

                  layer.id,

                  'visibility'

                ) as string | undefined

              );

            }



            directMap.setLayoutProperty(

              layer.id,

              'visibility',

              'none'

            );



          } else if (

            satelliteFillVisibility.has(layer.id)

          ) {



            const previous =

              satelliteFillVisibility.get(layer.id);



            directMap.setLayoutProperty(

              layer.id,

              'visibility',

              (previous ?? 'visible') as 'visible' | 'none'

            );

          }

        }



        if (!satellite) {

          satelliteFillVisibility.clear();

        }



      } catch (err) {

        console.warn(

          '[AMOH DIRECT] thematic visibility:',

          err

        );

      }

    };





    const disableTerrainDirect = () => {

      try {



        if (directMap.getTerrain()) {

          directMap.setTerrain(null);

        }



        // Terrain source can only be removed after terrain

        // itself has been detached.

        queueMicrotask(() => {

          try {

            if (

              !directMap.getTerrain() &&

              directMap.getSource('amoh-terrain-dem')

            ) {

              directMap.removeSource('amoh-terrain-dem');

            }

          } catch {

            // non-fatal

          }

        });



      } catch (err) {

        console.warn(

          '[AMOH DIRECT] terrain OFF error:',

          err

        );

      }

    };





    const enableTerrainDirect = () => {

      try {



        if (!directMap.getSource('amoh-terrain-dem')) {



          directMap.addSource(

            'amoh-terrain-dem',

            {

              type: 'raster-dem',

              tiles: [

                'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'

              ],

              encoding: 'terrarium',

              tileSize: 256,

              maxzoom: 10,

              attribution:

                'AWS Terrarium / Mapzen DEM'

            }

          );

        }



        directMap.setTerrain({

          source: 'amoh-terrain-dem',

          exaggeration: 1.7

        });



        console.info(

          '[AMOH DIRECT] terrain ON'

        );



      } catch (err) {

        console.warn(

          '[AMOH DIRECT] terrain ON error:',

          err

        );

      }

    };





    let requestedMapMode: MapMode = 'MAP';
    const applyMapModeDirect = (mode: MapMode) => {
      requestedMapMode = mode;
      if (mode === 'BATHYMETRY') {
        setSatelliteFillMode(false);
        disableTerrainDirect();
        engine.applyOsirisTheme(mode);
        return;
      }
      engine.setBathymetryVisible(false);
      engine.setAntarcticReliefVisible(
        mode === 'MAP' || mode === 'GLOBE',
        mode === 'MAP' ? 0.58 : 0.72
      );
      engine.setGebcoReliefVisible(
        mode === 'MAP' || mode === 'GLOBE',
        0.72
      );



      console.info(

        '[AMOH DIRECT] APPLY MODE:',

        mode

      );



      const map = directMap;

      try {

        map.stop();

        map.setRenderWorldCopies(false);

      } catch {

        // non-fatal

      }





      // ------------------------------------------------------

      // MAP 2D

      // ------------------------------------------------------



      if (mode === 'MAP') {
        // AMOH_V8 restore thematic fills in scientific 2D.
        setSatelliteFillMode(false);
        engine.setOceanBaseVisible(true);

        engine.projectionMode = '2D';



        disableTerrainDirect();



        setSatelliteFillMode(false);

        setSatelliteDirect(true, false);



        map.setProjection({

          type: 'mercator'

        });



        map.jumpTo({

          center: [0, -75],

          zoom: 2.2,

          pitch: 0,

          bearing: 0

        });



        map.dragRotate.disable();

        map.touchZoomRotate.disableRotation();



        map.resize();



        console.info(

          '[AMOH DIRECT] MAP READY',

          map.getCenter().toArray(),

          map.getZoom(),

          map.getProjection()

        );



        return;

      }





      // ------------------------------------------------------

      // GLOBE 3D

      // ------------------------------------------------------
      // 3D EARTH — AMOH_GOOGLE_EARTH_SCALE_V4
      // AMOH_CINEMATIC_GLOBE_FRAMING_V7
      // Curved globe + physical terrain + physical satellite altitude.
      // Internal mode remains GLOBE for store compatibility.
      // ------------------------------------------------------

      if (mode === 'GLOBE') {
        // AMOH_SMART_GLOBE_V11
        engine.projectionMode = '3D';
        engine.setOceanBaseVisible(false);

        map.setRenderWorldCopies(false);
        map.setProjection({ type: 'globe' });
        map.dragRotate.enable();
        map.touchZoomRotate.enableRotation();
        map.keyboard.enableRotation();
        map.setMaxPitch(75);

        try {
          map.setSky({
            'sky-color': '#00070d',
            'sky-horizon-blend': 0.055,
            'horizon-color': '#08a8cc',
            'horizon-fog-blend': 0.070,
            'fog-color': '#35d9ee',
            'fog-ground-blend': 0.040,
          });
        } catch {
          // style can be transitioning
        }

        setSatelliteFillMode(true);
        setSatelliteDirect(true, true);

        map.easeTo({
          center: [-38.0, -85.6],
          zoom: 1.92,
          pitch: 0,
          bearing: -10,
          
          duration: 950,
          essential: true,
        });

        map.resize();

        window.setTimeout(() => {
          if (requestedMapMode !== 'GLOBE') return;
          enableTerrainDirect();
          try {
            (window as any).__amohReferenceV8?.controller?.refresh?.();
          } catch {
            // non-fatal
          }
        }, 260);

        console.info(
          '[AMOH V8] GLOBE REFERENCE READY',
          map.getCenter().toArray(),
          map.getZoom(),
          map.getPitch(),
          map.getProjection(),
        );

        return;
      }


      // ------------------------------------------------------
      // SATELLITE

      // ------------------------------------------------------



      if (mode === 'SAT') {
        // AMOH_SMART_SAT_V11
        engine.projectionMode = '3D';
        engine.setOceanBaseVisible(false);

        map.setRenderWorldCopies(false);
        map.setProjection({ type: 'globe' });
        map.dragRotate.enable();
        map.touchZoomRotate.enableRotation();
        map.keyboard.enableRotation();

        disableTerrainDirect();

        try {
          map.setSky({
            'sky-color': '#00070d',
            'sky-horizon-blend': 0.050,
            'horizon-color': '#08a8cc',
            'horizon-fog-blend': 0.065,
            'fog-color': '#35d9ee',
            'fog-ground-blend': 0.035,
          });
        } catch {
          // style can be transitioning
        }

        setSatelliteFillMode(true);
        setSatelliteDirect(true, true);

        map.easeTo({
          center: [-38.0, -85.6],
          zoom: 1.86,
          pitch: 0,
          bearing: -10,
          
          duration: 900,
          essential: true,
        });

        map.resize();

        console.info(
          '[AMOH V8] SAT REFERENCE READY',
          map.getCenter().toArray(),
          map.getZoom(),
          map.getPitch(),
          map.getProjection(),
        );

        return;
      }

    };





    // Expose exactly ONE direct controller for the existing map.

    (window as any).__amohApplyMapMode =

      applyMapModeDirect;





    const unsubCamera = SpatialCameraStore.subscribe((s) => {

      // AMOH_FLIGHT_SATELLITE_VISUALS_V1
      
      // AMOH_ORBITAL_HEATMAP_VISUAL_PARITY_V6
      
      if (engine.map.isStyleLoaded()) {

        engine.applyOsirisTheme(s.activeMode);

      }

    });



    const updateReadout = () => {

      const center = engine.map.getCenter();

      setReadout({ lat: center.lat, lng: center.lng, zoom: engine.map.getZoom() });

    };

    engine.map.on('moveend', updateReadout);



    const interactiveLayers = [

      'quantarctica_coast-fill',

      'quantarctica_coast-line',

      'quantarctica-bathymetry-lines',

      'quantarctica-glaciers-lines',

      'quantarctica-stations-points',

      'quantarctica-stations-symbol',

      'quantarctica-stations-labels',

      'quantarctica-aspa-fill',

      'quantarctica-aspa-line',

      'aspa-fill',

      'aspa-line',

      'quantarctica_stations',

      'quantarctica_stations-point',

      'quantarctica_stations-symbol',

      'field_observations',

      'field_observations-point',

      'field_observations-symbol',

      'polar_aircraft',

      'polar_aircraft-point',

      'polar_aircraft-dot',

      'polar_aircraft-ping',

      'polar_aircraft-symbol',

      'polar_satellites',

      'polar_satellites_points',

      'polar_satellites_points-point',

      'polar_satellites_points-inner',

      'polar_satellites_points-outer',

      'polar_satellites_points-symbol',

      'polar_satellites_swaths-fill',

      'submarine_cables-operational-line',

      'submarine_cables-planned-line',

      'submarine_cables-landing-point',

      'submarine_cables-landing-symbol',

      'submarine_cables-landing-glow',

      'maritime_vessels',

      'maritime_vessels-point',

      'maritime_vessels-symbol',

      'fisheries_effort',

      'fisheries_effort-point',

      'fisheries_effort-symbol',

      'gfw_fishing_effort_presence',

      'gfw_fishing_effort_presence-point',

      'gfw_fishing_effort_presence-symbol',

      'gfw_fishing_effort-grid-fill',

      'gfw_fishing_effort-grid-line',

      'gfw_fishing_effort-heatmap',

      'gfw_sar_detections',

      'gfw_sar_detections-point',

      'gfw_sar_detections-symbol',

      'gfw_sar_detections',

      'gfw_sar_detections-symbol',

      'iaato_routes',

      'iaato_routes-line',

      'iaato_routes-point',

      'iaato_routes-symbol',

      'maris_nuclear',

      'maris_nuclear-point',

      'maris_nuclear-symbol',

      'argo_floats',

      'argo_floats-point',

      'argo_floats-symbol',

      'antarctic_fauna',

      'antarctic_fauna-point',

      'antarctic_fauna-symbol',

      'biodiversity_atlas',

      'biodiversity_atlas-point',

      'biodiversity_atlas-symbol',

      'biodiversity_atlas-glow',

      'offshore_energy',

      'offshore_energy-point',

      'offshore_energy-symbol',

      'offshore_energy-glow',

      'seismic_events',

      'seismic_events-point',

      'seismic_events-pulse',

      'seismic_events-symbol',

      'hydrophone_network-point',

      'hydrophone_network-symbol',

      'aws_weather-point',

      'aws_weather-symbol',

      'luxury_camps-point',

      'luxury_camps-symbol',

      'boreholes-point',

      'boreholes-symbol',

    ];



    const onClick = (e: maplibregl.MapMouseEvent) => {

      onSelectCoords?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });

      const styleLayers = engine.map.getStyle()?.layers || [];

      const amohLayers = styleLayers

        .filter((l) => l.id.startsWith('amoh-layer-'))

        .map((l) => l.id);

      const queryLayers = Array.from(new Set([...interactiveLayers, ...amohLayers])).filter((id) =>

        engine.map.getLayer(id)

      );

      const features = engine.map.queryRenderedFeatures(e.point, {

        layers: queryLayers,

      });

      if (!features.length) return;

      const feat = features[0];

      const props: any = { ...feat.properties, layerId: feat.layer.id, lat: e.lngLat.lat, lng: e.lngLat.lng };



      // Single Entity Inspector dispatch & 3D breadcrumb tracking

      if (props.lat && props.lng && entityTrackerRef.current) {

        const entityId = props.mmsi || props.id || props.name || props.callsign || 'target';

        const entityType = feat.layer.id.includes('vessel')

          ? 'vessel'

          : feat.layer.id.includes('aircraft')

          ? 'aircraft'

          : feat.layer.id.includes('satellite')

          ? 'satellite'

          : feat.layer.id.includes('fauna')

          ? 'fauna'

          : feat.layer.id.includes('seismic')

          ? 'seismic'

          : 'station';

        entityTrackerRef.current.selectEntity({

          id: String(entityId),

          name: props.common_name_es || props.common_name || props.scientific_name || props.name || props.callsign || props.mmsi || 'Object',

          type: entityType as any,

          coordinates: [props.lng, props.lat],

          heading: props.heading || props.course || 0,

          speedKnots: props.speed || props.speed_knots || 0,

        });

      }



      if (onSelectObject) {

        onSelectObject(props);

      }

    };

    engine.map.on('click', onClick);



    // FASE 3: Hover Tooltip with Entity SVG Logo, Identity ("Qué es"), Agency & UN SDG Badge

    const tooltipPopup = new maplibregl.Popup({

      closeButton: false,

      closeOnClick: false,

      offset: 14,

      className: 'amoh-sdg-hover-popup',

    });



    const onMouseMove = (e: maplibregl.MapMouseEvent) => {

      const styleLayers = engine.map.getStyle()?.layers || [];

      const amohLayers = styleLayers

        .filter((l) => l.id.startsWith('amoh-layer-'))

        .map((l) => l.id);

      const activeInteractive = Array.from(new Set([...interactiveLayers, ...amohLayers])).filter((id) =>

        engine.map.getLayer(id)

      );

      const features = engine.map.queryRenderedFeatures(e.point, { layers: activeInteractive });

      if (features.length > 0) {

        engine.map.getCanvas().style.cursor = 'pointer';

        const feat = features[0];

        let layerBaseId = (feat.layer.id || '').split('-')[0].split('_symbol')[0];

        if (feat.layer.id.startsWith('amoh-layer-')) {

          layerBaseId = feat.layer.id.replace('amoh-layer-', '').replace('-symbol', '');

        }

        if (feat.layer.id.startsWith('quantarctica-bathymetry')) layerBaseId = 'quantarctica_bathymetry';

        if (feat.layer.id.startsWith('quantarctica-glaciers')) layerBaseId = 'quantarctica_glaciers';

        if (feat.layer.id.startsWith('quantarctica-stations')) layerBaseId = 'quantarctica_stations';

        if (feat.layer.id.startsWith('quantarctica-aspa')) layerBaseId = 'quantarctica_aspa';

        

        const sdg = getLayerSDG(layerBaseId);

        const semantics = getLayerSemantics(layerBaseId);

        const iconSvgUri = getLayerSvgDataUri(layerBaseId);



        const name =

          feat.properties?.feature ||

          feat.properties?.glacier_name ||

          feat.properties?.name ||

          feat.properties?.common_name ||

          feat.properties?.callsign ||

          feat.properties?.mmsi ||

          feat.properties?.scientific_name ||

          feat.properties?.title ||

          semantics?.name ||

          layerBaseId;



        const whatIsItSnippet = semantics?.whatIsIt

          ? semantics.whatIsIt.length > 90

            ? semantics.whatIsIt.slice(0, 87) + '...'

            : semantics.whatIsIt

          : feat.properties?.category || feat.properties?.observation_type || 'Elemento Cartográfico Polar';



        const agencyName = semantics?.agency || feat.properties?.operator || feat.properties?.country || null;



        tooltipPopup

          .setLngLat(e.lngLat)

          .setHTML(`

            <div style="background:rgba(5,17,27,0.96);border:1px solid #1f3947;border-radius:8px;padding:8px 12px;color:#edf5f5;font-family:'DM Sans',sans-serif;font-size:11px;min-width:180px;max-width:280px;box-shadow:0 12px 28px rgba(0,0,0,0.75);backdrop-filter:blur(8px);">

              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">

                <div style="width:26px;height:26px;border-radius:6px;background:#030c14;border:1px solid #00e5ff33;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:3px;">

                  <img src="${iconSvgUri}" alt="" style="width:100%;height:100%;object-fit:contain;" />

                </div>

                <div style="font-weight:700;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.2;">

                  ${name}

                </div>

              </div>

              <div style="color:#94a3b8;font-size:10px;line-height:1.35;margin-bottom:6px;border-left:2px solid #00e5ff88;padding-left:6px;">

                ${whatIsItSnippet}

              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding-top:4px;border-top:1px solid #142938;">

                <div style="display:flex;align-items:center;gap:4px;font-family:monospace;font-size:9.5px;color:#38bdf8;">

                  <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#00e5ff;box-shadow:0 0 6px #00e5ff;"></span>

                  <span>${e.lngLat.lat.toFixed(2)}°, ${e.lngLat.lng.toFixed(2)}°</span>

                </div>

                <div style="display:flex;align-items:center;gap:4px;">

                  ${agencyName ? `<span style="background:#132c3f;color:#caf9f7;padding:1px 5px;border-radius:3px;font-size:8.5px;font-weight:700;border:1px solid #1f3947;">${agencyName}</span>` : ''}

                  <span style="background:${sdg.color};color:${sdg.contrastTextColor};padding:1px 5px;border-radius:3px;font-size:8.5px;font-weight:700;">

                    ODS ${sdg.number}

                  </span>

                </div>

              </div>

            </div>

          `)

          .addTo(engine.map);

      } else {

        engine.map.getCanvas().style.cursor = '';

        tooltipPopup.remove();

      }

    };



    const onMouseLeave = () => {

      engine.map.getCanvas().style.cursor = '';

      tooltipPopup.remove();

    };



    engine.map.on('mousemove', onMouseMove);

    engine.map.getCanvas().addEventListener('mouseleave', onMouseLeave);



    const terminatorInterval = setInterval(() => {

      if (engine.map.isStyleLoaded() && !isSafe) {

        try {

          engine.addSolarTerminatorLayer(new Date());

        } catch (_) {}

      }

    }, 60000);





    let cancelled = false;

    const refreshLayers = async () => {

      try {

        // Safe Mode: Load only Antarctic continental land & ice cartography

        if (isSafeMode()) {

          try {

            const localCarto = await fetchLocalAntarcticCartography();

            if (!cancelled && localCarto) {

              engine.addAntarcticBasemap(localCarto);

            }

          } catch (e) {

            console.warn('[AMOH SafeMode] fetchLocalAntarcticCartography error:', e);

          }

          return;

        }



        // 1. Guaranteed immediate local Antarctic vector basemap, ice shelves, labels & fishing heatmap

        try {

          const localCarto = await fetchLocalAntarcticCartography();

          if (!cancelled && localCarto) {

            engine.addAntarcticBasemap(localCarto);

          }

        } catch (e) {

          console.warn('[AMOH] fetchLocalAntarcticCartography error:', e);

        }



        if (cancelled) return;



        // Live fleets are loaded only from provider endpoints below. No static
        // positions are rendered as current telemetry.

        // Antarctic Ozone Layer (Sentinel-5P TROPOMI & NASA OMPS)

        try {

          const ozoneData = buildAntarcticOzoneData();

          engine.addOzoneLayer('ozone_layer', ozoneData, false);

          engine.setLayerGroupVisible('ozone_layer', !!activeLayersRef.current?.['ozone_layer']);

        } catch (e) {

          console.warn('[AMOH] addOzoneLayer error:', e);

        }



        // Guaranteed immediate COMNAP / Quantarctica scientific stations

        lazyFetch('quantarctica_stations', '/data/web/geojson/comnap_stations.geojson')

          .then((r) => r.json())

          .then((stData) => {

            if (!cancelled && stData && stData.features && stData.features.length > 0) {

              engine.addStationLayer('quantarctica_stations', stData, '#8de8cd');

              engine.setLayerGroupVisible('quantarctica_stations', !!activeLayersRef.current?.['quantarctica_stations']);

            }

          })

          .catch((e) => console.warn('[AMOH] comnap_stations seed error:', e));



        engine.addFisheriesLayer('fisheries_effort', EMPTY_FC, getLayerSDGColor('fisheries_effort'));



        // Keep the tourism layer available until a verified route feed is configured.

        engine.addTourismRoutesLayer('iaato_routes', EMPTY_FC, getLayerSDGColor('tourism_routes'));



        // Add Antarctic Scientific Research Bases (COMNAP - Over 100 permanent & summer bases)

        lazyFetch('quantarctica_stations', '/data/web/geojson/comnap_stations.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features) {

              engine.addStationLayer('quantarctica_stations', data, getLayerSDGColor('quantarctica_stations'));

            }

          })

          .catch((e) => console.warn('[AMOH] comnap_stations seed error:', e));



        // Add Antarctic Treaty Territorial Claims (Fronteras / Sectores Históricos - Art. IV)

        lazyFetch('treaty_claims', '/data/web/geojson/treaty_claims.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features) {

              engine.addTreatyClaimsLayer('treaty_claims', data);

            }

          })

          .catch((e) => console.warn('[AMOH] treaty_claims seed error:', e));



        // Add CCAMLR Statistical Fisheries Boundaries

        lazyFetch('ccamlr_zones', '/data/web/geojson/ccamlr_zones.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features) {

              engine.addCcamlrZonesLayer('ccamlr_zones', data, getLayerSDGColor('ccamlr_zones'));

            }

          })

          .catch((e) => console.warn('[AMOH] ccamlr_zones seed error:', e));



        // Add Search and Rescue (SAR) Maritime Coordination Regions

        lazyFetch('sar_regions', '/data/web/geojson/sar_regions.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features) {

              engine.addSarRegionsLayer('sar_regions', data, getLayerSDGColor('sar_regions'));

            }

          })

          .catch((e) => console.warn('[AMOH] sar_regions seed error:', e));



        // Add Live Antarctic Station CCTV Webcams

        lazyFetch('cctv_cams', '/data/web/geojson/live_webcams.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features) {

              engine.addCctvLayer('cctv_cams', data, '#10b981');

            }

          })

          .catch((e) => console.warn('[AMOH] live_webcams seed error:', e));



        // Add Strategic Maritime Corridors & Waterways (Paso de Drake, Estrechos, Rutas)

        lazyFetch('maritime_corridors', '/data/web/geojson/strategic_waterways.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features) {

              engine.addMaritimeCorridorsLayer('maritime_corridors', data, getLayerSDGColor('maritime_corridors'));

            }

          })

          .catch((e) => console.warn('[AMOH] strategic_waterways seed error:', e));



        // Add Sentinel-1 Synthetic Aperture Radar (SAR) Vessel Detections

        lazyFetch('gfw_sar_detections', '/data/web/geojson/gfw_sar_detections.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features) {

              engine.addGfwSarDetectionsLayer('gfw_sar_detections', data, '#ffaa00');

            }

          })

          .catch((e) => console.warn('[AMOH] gfw_sar_detections seed error:', e));



        // Keep the MARIS layer available until verified samples are configured.

        engine.addMarisNuclearLayer('maris_nuclear', EMPTY_FC, getLayerSDGColor('maris_nuclear'));



        // Load historical Argo profiles from the bundled GeoJSON.

        engine.addArgoFloatsLayer('argo_floats', EMPTY_FC, getLayerSDGColor('argo_floats'));

        lazyFetch('argo_floats', '/data/web/geojson/argo_floats.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features && data.features.length > 0) {

              engine.addArgoFloatsLayer('argo_floats', data, getLayerSDGColor('argo_floats'));

            }

          })

          .catch(() => {});



        // Initial Marine Biodiversity Fauna (OBIS Circumpolar)

        const faunaSeed: GeoJSON.FeatureCollection = {

          type: 'FeatureCollection',

          features: [

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [166.17, -77.53] }, properties: { scientific_name: 'Pygoscelis adeliae', common_name: 'Pingüino de Adelia (Colonia Cape Royds)', category: 'Aves', sector: 'Mar de Ross', source: 'OBIS', freshness: 'MEASURED' } },

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [175.50, -74.20] }, properties: { scientific_name: 'Dissostichus mawsoni', common_name: 'Austromerluza Antártica', category: 'Actinopterygii', sector: 'Talud Continental de Ross', source: 'OBIS / CCAMLR', freshness: 'MEASURED' } },

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [-26.80, -75.50] }, properties: { scientific_name: 'Aptenodytes forsteri', common_name: 'Pingüino Emperador (Colonia Halley Bay)', category: 'Aves', sector: 'Mar de Weddell', source: 'OBIS / BAS', freshness: 'MEASURED' } },

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [-12.40, -71.30] }, properties: { scientific_name: 'Thouarella sp.', common_name: 'Octocoral Antártico Profundo (VME)', category: 'Anthozoa', sector: 'Talud de Filchner', source: 'OBIS', freshness: 'MEASURED' } },

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [77.96, -68.58] }, properties: { scientific_name: 'Pygoscelis adeliae', common_name: 'Pingüino de Adelia (Vestfold Hills)', category: 'Aves', sector: 'Bahía Prydz / Davis', source: 'OBIS / AAD', freshness: 'MEASURED' } },

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [-100.20, -70.40] }, properties: { scientific_name: 'Balaenoptera musculus intermedia', common_name: 'Ballena Azul Antártica', category: 'Mammalia', sector: 'Mar de Amundsen', source: 'OBIS', freshness: 'MEASURED' } },

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [-64.05, -64.77] }, properties: { scientific_name: 'Pygoscelis papua', common_name: 'Pingüino Papúa', category: 'Aves', sector: 'Península Antártica', source: 'OBIS', freshness: 'MEASURED' } },

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [-58.40, -62.10] }, properties: { scientific_name: 'Megaptera novaeangliae', common_name: 'Ballena Jorobada', category: 'Mammalia', sector: 'Estrecho de Bransfield', source: 'OBIS', freshness: 'MEASURED' } },

            { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [-63.50, -65.10] }, properties: { scientific_name: 'Hydrurga leptonyx', common_name: 'Foca Leopardo', category: 'Mammalia', sector: 'Estrecho de Gerlache', source: 'OBIS', freshness: 'MEASURED' } },

          ],

        };

        engine.addFaunaLayer('antarctic_fauna', faunaSeed, getLayerSDGColor('antarctic_fauna'));



        // AMOH V6 Antarctic Life Atlas (Krill, Penguins, Marine Mammals, Flora)

        engine.addBiodiversityAtlasLayer('biodiversity_atlas', ANTARCTIC_LIFE_ATLAS as any);



        // AMOH V6 Gateway Offshore Energy Context (Strictly North of 60°S)

        engine.addOffshoreEnergyLayer('offshore_energy', GATEWAY_OFFSHORE_ENERGY as any);



        // Load USGS seismic events from the bundled GeoJSON.

        engine.addSeismicLayer('seismic_events', EMPTY_FC, getLayerSDGColor('seismic_events'));

        lazyFetch('seismic_events', '/data/web/geojson/seismic_events.geojson')

          .then((r) => r.json())

          .then((data) => {

            if (!cancelled && data && data.features && data.features.length > 0) {

              engine.addSeismicLayer('seismic_events', data, getLayerSDGColor('seismic_events'));

            }

          })

          .catch(() => {});



        // Field observations are populated only from the API below.

        engine.addObservationLayer('field_observations', EMPTY_FC, getLayerSDGColor('field_observations'));



        // Apply active layer filters immediately — all unselected thematic layers default to hidden

        ALL_THEMATIC_LAYERS.forEach((k) => {

          engine.setLayerGroupVisible(k, !!activeLayersRef.current?.[k]);

        });

        if (activeLayersRef.current) {

          Object.entries(activeLayersRef.current).forEach(([k, v]) => {

            engine.setLayerGroupVisible(k, !!v);

          });

        }



        // Set up official INACH Chilean Antarctic Territory (53°W-90°W) & 23 Shetland bases cartography

        try {

          engine.setupInachLayers();

        } catch (e) {

          console.warn('[AMOH] setupInachLayers error:', e);

        }



        // 3. Connect real live remote endpoints

        Promise.all([

          whenActive('aspa', () => api.get<GeoJSON.FeatureCollection & { available: boolean }>('/api/quantarctica/layers/aspa').catch(() => ({ available: false })), { available: false } as any),

          whenActive('quantarctica_stations', () => api.get<GeoJSON.FeatureCollection & { available: boolean }>('/api/quantarctica/layers/stations').catch(() => ({ available: false })), { available: false } as any),

          whenActive('treaty_claims', () => api.get<GeoJSON.FeatureCollection & { available: boolean }>('/api/quantarctica/layers/treaty_claims').catch(() => ({ available: false })), { available: false } as any),

          whenActive('ccamlr_zones', () => api.get<GeoJSON.FeatureCollection & { available: boolean }>('/api/quantarctica/layers/ccamlr_zones').catch(() => ({ available: false })), { available: false } as any),

          whenActive('antarctic_fauna', () => api.get<GeoJSON.FeatureCollection>('/api/fauna/occurrences').catch(() => EMPTY_FC), EMPTY_FC),

          whenActive('seismic_events', () => api.get<GeoJSON.FeatureCollection>('/api/seismic/events').catch(() => EMPTY_FC), EMPTY_FC),

          api.get<{ polar_entries?: Array<{ vessel: string; flag: string; lat: number; lon: number; hours: number }> }>('/api/gfw/fishing-effort').catch(() => ({})),

          whenActive<any>('gfw_fishing_effort', () => api.get<any>('/api/gfw/fishing-effort-heatmap').catch(() => null), null),

          whenActive('gfw_sar_detections', () => api.get<GeoJSON.FeatureCollection>('/api/gfw/sar-detections').catch(() => EMPTY_FC), EMPTY_FC),

          whenActive('mirofish_heatmap', () => api.get<GeoJSON.FeatureCollection>('/api/mirofish/heatmap').catch(() => EMPTY_FC), EMPTY_FC),

          whenActive('mirofish_heatmap', () => api.get<GeoJSON.FeatureCollection>('/api/mirofish/trajectories').catch(() => EMPTY_FC), EMPTY_FC),

          api.get<Array<{ latitude: number; longitude: number; observation_type: string; notes: string | null; utc: string }>>('/api/observations').catch(() => []),

          fetchSubmarineCables().catch(() => EMPTY_FC),

        ]).then(([aspa, stations, treatyClaims, ccamlrZones, liveFauna, liveSeismic, gfwEffort, gfwHeatmap, gfwSar, heatmap, trajectories, observations, cables]) => {

          if (cancelled) return;



          // 1. Quantarctica Cartography

          const aspaData = ('features' in aspa && aspa.available) ? (aspa as GeoJSON.FeatureCollection) : EMPTY_FC;

          const stationsData = ('features' in stations && stations.available) ? (stations as GeoJSON.FeatureCollection) : EMPTY_FC;

          if (aspaData.features && aspaData.features.length > 0) {

            engine.addCartographicLayer('aspa', aspaData, '#ff754b');

          }

          if (stationsData.features && stationsData.features.length > 0) {

            engine.addStationLayer('quantarctica_stations', stationsData, '#8de8cd');

          } else {

            lazyFetch('quantarctica_stations', '/data/web/geojson/comnap_stations.geojson')

              .then((r) => r.json())

              .then((geo) => {

                if (geo && geo.features && geo.features.length > 0) {

                  engine.addStationLayer('quantarctica_stations', geo, '#8de8cd');

                }

              })

              .catch(() => {});

          }

          if (treatyClaims && 'features' in treatyClaims && (treatyClaims as any).available !== false && treatyClaims.features.length > 0) {

            engine.setGeoJSONSource('treaty_claims', treatyClaims);

          }

          if (ccamlrZones && 'features' in ccamlrZones && (ccamlrZones as any).available !== false && ccamlrZones.features.length > 0) {

            engine.setGeoJSONSource('ccamlr_zones', ccamlrZones);

          }



          // 5. Marine Fauna (Circumpolar OBIS, SCAR & MAPPPD records across 18 sectors)

          if (liveFauna && liveFauna.features && liveFauna.features.length > 0) {

            engine.setGeoJSONSource('antarctic_fauna', liveFauna);

          } else {

            lazyFetch('antarctic_fauna', '/data/web/geojson/antarctic_fauna.geojson')

              .then((r) => r.json())

              .then((geo) => {

                if (geo && geo.features && geo.features.length > 0) {

                  engine.setGeoJSONSource('antarctic_fauna', geo);

                }

              })

              .catch(() => {});

          }



          // 6. Seismic Events (USGS)

          if (liveSeismic && liveSeismic.features && liveSeismic.features.length > 0) {

            engine.setGeoJSONSource('seismic_events', liveSeismic);

          }



          // 7. GFW 4Wings Apparent Fishing Effort Continuous Heatmap & Grid

          const gfwGrid = (gfwHeatmap && (gfwHeatmap.grid_cells || (gfwHeatmap.type === 'FeatureCollection' ? gfwHeatmap : null))) || null;

          if (gfwGrid) {

            engine.addGfwFishingEffortLayers(
              'gfw_fishing_effort',
              { effort: gfwGrid },
            );

          }



          // 7b. GFW SAR Radar Vessel Detections

          if (gfwSar && gfwSar.features && gfwSar.features.length > 0) {

            engine.addGfwSarDetectionsLayer('gfw_sar_detections', gfwSar);

          }



          // 7. GFW Apparent Fishing Effort

          const gfwData = gfwEffort as { polar_entries?: Array<{ vessel: string; flag: string; lat: number; lon: number; hours: number }> };

          if (gfwData && gfwData.polar_entries && gfwData.polar_entries.length > 0) {

            const gfwFC: GeoJSON.FeatureCollection = {

              type: 'FeatureCollection',

              features: gfwData.polar_entries.map((p: { vessel: string; flag: string; lat: number; lon: number; hours: number }) => ({

                type: 'Feature' as const,

                geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },

                properties: {

                  name: p.vessel,

                  flag: p.flag,

                  effort: `${p.hours} h`,

                  targetSpecies: 'Krill / Merluza Negra',

                  ccamlrStatus: 'Monitoreado GFW',

                },

              })),

            };

            engine.setGeoJSONSource('fisheries_effort', gfwFC);

          }



          // 8. Submarine Cables

          if (cables && cables.features && cables.features.length > 0) {

            engine.addSubmarineCablesLayer('submarine_cables', cables, '#ffc845');

          }



          // 9. Simulation & Observations

          if (heatmap && heatmap.features && heatmap.features.length > 0) {

            engine.addHeatmapLayer('mirofish_heatmap', heatmap);

          }

          if (trajectories && trajectories.features && trajectories.features.length > 0) {

            engine.addTrajectoryLayer('mirofish_trajectories', trajectories);

          }

          if (observations && observations.length > 0) {

            const apiObs = observations

              .filter((o) => o.latitude != null && o.longitude != null)

              .map((o) => ({

                type: 'Feature' as const,

                geometry: { type: 'Point' as const, coordinates: [o.longitude, o.latitude] },

                properties: { observation_type: o.observation_type, utc: o.utc, notes: o.notes },

              }));

            engine.addObservationLayer('field_observations', {

              type: 'FeatureCollection',

              features: apiObs,

            }, getLayerSDGColor('field_observations'));

          }



          ALL_THEMATIC_LAYERS.forEach((k) => {

            engine.setLayerGroupVisible(k, !!activeLayersRef.current?.[k]);

          });

          if (activeLayersRef.current) {

            Object.entries(activeLayersRef.current).forEach(([k, v]) => {

              engine.setLayerGroupVisible(k, !!v);

            });

          }

        }).catch(() => {});

      } catch (err) {

        console.warn('[WOD] Layer loading notice:', err);

      }

    };



    const onVisibilityChange = () => {

      if (document.hidden) {

        // Tab backgrounded — conserve GPU and network resources

      }

    };

    document.addEventListener('visibilitychange', onVisibilityChange);



    engine.whenReady().then(() => {

      updateReadout();

      engine.applyOsirisTheme(SpatialCameraStore.getState().activeMode);

      if (!isSafe) {

        try {

          engine.addSolarTerminatorLayer(new Date());

        } catch (e) {

          console.warn('[AMOH] Solar terminator layer init:', e);

        }

      }

      refreshLayers();

      if (activeLayersRef.current) {

        applyQuantarcticaLayersToMap(

          engine.map,

          new Set(Object.keys(activeLayersRef.current).filter((k) => activeLayersRef.current![k]))

        );

      }

    });



    // Background pollers with backoff and visibility pause (AMOH V10 Intelligent Polling)

    const pollTraffic = async (feed: TrafficFeed) => {
      if (cancelled) return;
      let data: GeoJSON.FeatureCollection;
      let satelliteTracks: GeoJSON.FeatureCollection = EMPTY_FC;
      let count: number | null;
      let detail: string | undefined;
      let observedAt: string | undefined;
      try {
        if (feed === 'satellites') {
          const orbits = await (await import('../lib/observatory-orbits')).getActiveSatellitePositions();
          data = orbits.data;
          satelliteTracks = orbits.tracks;
          detail = `${orbits.bundled ? 'Instantánea pública' : 'CelesTrak directo'} · época TLE ${orbits.catalogDate ?? 'desconocida'} · posición calculada SGP4`;
        } else {
          const reports = feed === 'vessels' ? await fetchOpenVessels() : await fetchOpenAircraft();
          data = reports.data;
          if (reports.partial) detail = 'Respuesta parcial del proveedor';
          if (feed === 'aircraft') {
            const aircraftReport = reports as Awaited<ReturnType<typeof fetchOpenAircraft>>;
            detail = [detail, aircraftReport.detail].filter(Boolean).join(' · ') || undefined;
            observedAt = aircraftReport.observedAt;
          }
        }
        count = data.features.length;
      } catch (error) {
        data = EMPTY_FC;
        count = null;
        detail = error instanceof Error ? error.message : 'Fuente de tráfico no disponible';
      }
      if (cancelled) return;
      const layer = TRAFFIC_LAYERS[feed];
      if (feed === 'vessels') {
        engine.addAisLayer(layer, data);
      } else if (feed === 'aircraft') {
        engine.addPolarAircraftLayer(layer, {
          points: data, elevatedPoints: data, tethers: EMPTY_FC, corridors: EMPTY_FC,
        });
      } else {
        engine.addPolarSatellitesLayer(layer, {
          points: data, elevatedPoints: data, tracks: satelliteTracks, swaths: EMPTY_FC, rings: EMPTY_FC, tethers: EMPTY_FC,
        }, getLayerSDGColor(layer));
      }
      engine.setLayerGroupVisible(layer, !!activeLayersRef.current?.[layer]);
      updateTraffic(feed, count, detail, observedAt);
      if (count === null) throw new Error('Fuente de tráfico no disponible');
    };
    const trafficFeeds: TrafficFeed[] = ['vessels', 'aircraft', 'satellites'];
    const trafficPollers = trafficFeeds.map(feed => createPoller(
      () => pollTraffic(feed), 60000,
    ));
    trafficFeeds.forEach(feed => { void pollTraffic(feed).catch(() => {}); });
    trafficPollers.forEach(poller => poller.start());

    const pollGfw = async () => {
      if (cancelled) return;
      const [effort, sar] = await Promise.all([
        api.get<any>('/api/gfw/fishing-effort-heatmap'),
        api.get<GeoJSON.FeatureCollection>('/api/gfw/sar-detections'),
      ]);
      const grid = effort?.grid_cells || (effort?.type === 'FeatureCollection' ? effort : null);
      if (grid) {
        engine.addGfwFishingEffortLayers('gfw_fishing_effort', { effort: grid });
      }
      if (sar?.features?.length) {
        engine.addGfwSarDetectionsLayer('gfw_sar_detections', sar);
      }
      (window as any).__amohFeedStatus = {
        ...((window as any).__amohFeedStatus || {}),
        gfw: {
          connected: Boolean(grid || sar?.features?.length),
          lastUpdate: new Date().toISOString(),
          effortCells: grid?.features?.length || 0,
          sarDetections: sar?.features?.length || 0,
        },
      };
    };
    const gfwPoller = createPoller(pollGfw, 300000);
    gfwPoller.start();

    return () => {
      cancelled = true;

      trafficPollers.forEach(poller => poller.stop());
      gfwPoller.stop();

      clearInterval(terminatorInterval);

      document.removeEventListener('visibilitychange', onVisibilityChange);

      unsubCamera();

      engine.map.off('moveend', updateReadout);

      engine.map.off('click', onClick);

      engine.map.off('mousemove', onMouseMove);

      engine.map.getCanvas()?.removeEventListener('mouseleave', onMouseLeave);

      tooltipPopup.remove();

      cesiumGlobe.destroy();
      engine.destroy();

      engineRef.current = null;

      mapRef.current = null;

      setCurrentMap(null);

    };

  }, [onSelectCoords]);





  return (

    <div

      style={{ height: height ?? '100%' }}

      className={`relative w-full overflow-hidden ${className}`}

    >

      {/* MapLibre WebGL Canvas */}

      <div ref={containerRef} className="absolute inset-0 w-full h-full" />



      {/* Windy-Style Circumpolar Flow Particle Engine (Wind & Ocean Currents) */}

      <CircumpolarFlowCanvas

        map={currentMap}

        enabled={!!(activeLayers?.['ocean_currents'] || activeLayers?.['wind_particles'])}

        activeLayers={activeLayers}

      />



      {/* ScaleBar & Coordinates (Bottom Left Anchor) */}

      <div className="absolute bottom-6 left-6 z-[200] flex items-center gap-3 pointer-events-none select-none">

        <ScaleBar zoom={readout.zoom} latitude={readout.lat} />

        <div

          className="px-2.5 py-1 rounded-lg border text-[11px] font-mono shadow-lg backdrop-blur-md"

          style={{

            backgroundColor: '#061017dd',

            borderColor: '#213f4f',

            color: '#58d5e3',

          }}

        >

          {Math.abs(readout.lat).toFixed(2)}° S · {Math.abs(readout.lng).toFixed(2)}° W · Z{readout.zoom.toFixed(1)}

        </div>

      </div>



      {/* UN Sustainable Development Goals (ODS) Interactive Legend (FASE 3) */}

      <div className="absolute bottom-20 right-6 z-[200]">

        <ODSLegend

          activeLayerIds={Object.entries(activeLayers || {})

            .filter(([k, v]) => v && !['quantarctica_coast', 'quantarctica_ice', 'quantarctica_bathymetry', 'coastline', 'bathymetry', 'ice-shelves', 'inach-territory-fill', 'inach-territory-line', 'inach-toponymy-symbol'].includes(k))

            .map(([k]) => k)}

        />

      </div>



      {/* Floating Map Navigation Controls on right edge */}

      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[220]">

        <MapControls

          onZoomIn={() => {
            if (!navigateCesiumGlobe(mapRef.current, 'in')) engineRef.current?.map.zoomIn({ duration: 250 });
          }}

          onZoomOut={() => {
            if (!navigateCesiumGlobe(mapRef.current, 'out')) engineRef.current?.map.zoomOut({ duration: 250 });
          }}

          onResetNorth={() => {
            if (!navigateCesiumGlobe(mapRef.current, 'north')) engineRef.current?.map.resetNorth({ duration: 300 });
          }}

          onResetAntarctica={() =>

            engineRef.current?.map.flyTo({

              center: [-50.0, -82.0],

              zoom: 1.85,

              pitch: 25,

              bearing: 0,

              duration: 900,

            })

          }

          onToggleFullscreen={() => {

            if (document.fullscreenElement) {

              document.exitFullscreen();

            } else {

              document.documentElement.requestFullscreen();

            }

          }}

        />

      </div>

    </div>

  );

});



export default WodMapPanel;







