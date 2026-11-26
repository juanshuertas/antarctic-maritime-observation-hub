import * as maplibregl from 'maplibre-gl';
import type { Map as MlMap, StyleSpecification, LayerSpecification, GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { applyMapProjection } from './map-projection';
import { createMapCameraControls } from './map-camera-controls';
import { attachTerrain, type TerrainStatus } from './map-terrain';
import { installTerrainTileProtocol } from './terrain-tiles';
import { readMapPalette, MAP_DEFAULTS } from './wod-map-palette';
import type { LocalAntarcticCartography } from './antarctic-cartography';
import { isSafeMode } from './safe-mode';
import { registerAmohIcons } from './map-icon-atlas';
import { resolveLayerId } from './layer-registry';
import { INACH_CHILEAN_TERRITORY_FC, INACH_TOPONYMY_FC } from './inach-cartography';

/** Mode-controlled ocean basemap with local GEBCO/IBCSO relief and Esri imagery. */
const BATHYMETRY_BASE_LAYERS = [
  'esri-ocean-base',
  'gebco-2025-relief',
  'antarctic-bathymetry-base',
] as const;

export const OSIRIS_BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'esri-ocean-base': {
      type: 'raster',
      tiles: ['https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 16,
      attribution: 'Esri, Garmin, GEBCO, NOAA NGDC, and other contributors',
    },
    'antarctic-bathymetry-base': {
      type: 'raster',
      tiles: ['/data/web/tiles/ibcso_v2_relief/{z}/{x}/{y}.webp'],
      tileSize: 256,
      maxzoom: 7,
      bounds: [-180, -85.0511, 180, -50],
      attribution: 'IBCSO v2 · Dorschel et al. (2022) · CC BY 4.0',
    },
    'gebco-2025-relief': {
      type: 'raster',
      tiles: ['/data/web/tiles/gebco_2025_relief/{z}/{x}/{y}.webp'],
      tileSize: 256,
      maxzoom: 6,
      bounds: [-180, -85.0511, 180, -40],
      attribution: 'GEBCO Compilation Group (2025) · via Quantarctica 4 (NPI)',
    },
    'satellite-world': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri World Imagery, Maxar',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'ocean-background',
      type: 'background',
      paint: {
        'background-color': '#030b14',
      },
    },
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-world',
      minzoom: 0,
      maxzoom: 20,
      layout: {
        visibility: 'visible',
      },
      paint: {
        'raster-opacity': 1.0,
      },
    },
    ...BATHYMETRY_BASE_LAYERS.map((id): LayerSpecification => ({
      id,
      type: 'raster',
      source: id,
      layout: { visibility: 'none' },
    })),
  ],
};

export interface WodMapEngineOptions {
  container: HTMLElement | string;
  style?: StyleSpecification | string;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  projection?: 'mercator' | 'globe';
  terrain?: boolean;
}

export class WodMapEngine {
  readonly map: MlMap;
  public projectionMode: '2D' | '3D' = '2D';
  private disposeCamera?: () => void;
  private disposeTerrain?: () => void;
  private readonly ready: Promise<void>;

  constructor(options: WodMapEngineOptions) {
    if (!isSafeMode()) {
      try {
        installTerrainTileProtocol(maplibregl.addProtocol);
      } catch {
        // ignore
      }
    }
    this.projectionMode = options.projection === 'globe' ? '3D' : '2D';
    this.map = new maplibregl.Map({
      container: options.container,
      style: options.style ?? OSIRIS_BASEMAP_STYLE,
      center: options.center ?? [0.0, -75.0],
      zoom: options.zoom ?? 2.2,
      pitch: options.pitch ?? 0,
      bearing: 0,
      // projection: MapLibre 6 ya no lee esta opción del constructor (se ignoraba); la proyección se aplica con setProjection/applyMapProjection
      attributionControl: false,
    });

    // FASE 4: 2D Static Mode (zero rotation, lock pitch & bearing)
    if (this.projectionMode === '2D') {
      this.map.dragRotate.disable();
      this.map.touchZoomRotate.disableRotation();
      this.map.keyboard.disableRotation();
      this.map.setBearing(0);
      this.map.setPitch(0);
    }

    this.map.on('rotate', () => {
      if (this.projectionMode === '2D' && this.map.getBearing() !== 0) {
        this.map.setBearing(0);
      }
    });

    this.map.on('pitch', () => {
      if (this.projectionMode === '2D' && this.map.getPitch() !== 0) {
        this.map.setPitch(0);
      }
    });

    const controls = createMapCameraControls(this.map);
    this.disposeCamera = controls.dispose;
    this.ready = new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      if (this.map.isStyleLoaded() || this.map.getStyle()?.version) {
        done();
      } else {
        this.map.once('load', done);
        this.map.once('style.load', done);
        this.map.once('idle', done);
        setTimeout(done, 1200);
      }
    });
    this.ready.then(() => {
      registerAmohIcons(this.map).catch((e) => console.warn('[AMOH Atlas]', e));
      if (!isSafeMode() && options.projection === 'globe') {
        applyMapProjection(this.map, 'globe', false);
      }
    });
  }

  /** Runs an action immediately if style is ready, or attaches one-time load/idle listeners. */
  /**
   * Encola la operacion hasta que el estilo este REALMENTE cargado.
   *
   * Antes bastaba con `getStyle()?.version`, pero MapLibre devuelve el objeto
   * de estilo apenas existe, aunque siga cargando: addSource/addLayer lanzaban
   * "Style is not done loading" y la capa se perdia en silencio. Con un build
   * de produccion rapido esto se volvia sistematico y el mapa quedaba vacio.
   * Ahora hay una sola cola FIFO (importa el orden: fuentes antes que capas)
   * y un unico vigilante compartido.
   */
  private pendingStyleOps: Array<() => void> = [];
  private styleWaiterArmed = false;

  private flushPendingStyleOps() {
    if (!this.map.isStyleLoaded()) return;
    const ops = this.pendingStyleOps;
    this.pendingStyleOps = [];
    for (const op of ops) {
      try {
        op();
      } catch (e) {
        console.warn('[AMOH Engine] operacion diferida error:', e);
      }
    }
  }

  private runWhenStyleLoaded(fn: () => void) {
    if (this.map.isStyleLoaded()) {
      try {
        fn();
      } catch (e) {
        console.warn('[AMOH Engine] runWhenStyleLoaded immediate error:', e);
      }
      return;
    }

    this.pendingStyleOps.push(fn);
    if (this.styleWaiterArmed) return;
    this.styleWaiterArmed = true;

    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      this.map.off('styledata', tick);
      this.map.off('style.load', tick);
      this.map.off('load', tick);
      this.map.off('idle', tick);
      if (timer) clearInterval(timer);
      this.styleWaiterArmed = false;
    };
    const tick = () => {
      this.flushPendingStyleOps();
      if (this.pendingStyleOps.length === 0) stop();
    };

    this.map.on('styledata', tick);
    this.map.on('style.load', tick);
    this.map.on('load', tick);
    this.map.on('idle', tick);
    timer = setInterval(tick, 200);
  }

  async whenReady(): Promise<this> {
    await this.ready;
    return this;
  }

  /** Camera step/press controls (see map-camera-controls.ts) for +/- UI buttons. */
  cameraControls() {
    return createMapCameraControls(this.map);
  }

  setSatelliteVisible(visible: boolean) {
    const apply = () => {
      try {
        const layerId = 'satellite-layer';
        if (!this.map.getLayer(layerId)) return;

        this.map.setLayoutProperty(
          layerId,
          'visibility',
          visible ? 'visible' : 'none'
        );

        this.map.setPaintProperty(
          layerId,
          'raster-opacity',
          visible ? 1.0 : 0.0
        );

        if (visible) {
          // Put imagery above opaque geographic fills but below labels.
          const firstSymbol = this.map
            .getStyle()
            .layers
            ?.find((layer) => layer.type === 'symbol')
            ?.id;

          try {
            this.map.moveLayer(layerId, firstSymbol);
          } catch {
            // non-fatal
          }
        }

        console.info(
          '[AMOH MAP MODE] satellite:',
          visible ? 'ON' : 'OFF'
        );

      } catch (err) {
        console.warn('[AMOH] Satellite visibility error:', err);
      }
    };

    if (this.map.getLayer('ocean-background')) {
      apply();
    } else {
      this.map.once('style.load', apply);
    }
  }

  /** Activates true 4K Ultra-HD native device pixel ratio and enables high-resolution hillshade/bathymetry. */
  setUltraHd4KMode(enabled: boolean) {
    this.runWhenStyleLoaded(() => {
      const targetRatio = enabled ? Math.min(window.devicePixelRatio || 1, 3.0) : 1.0;
      this.map.setPixelRatio(targetRatio);
      if (this.map.getLayer('bas-hillshade-layer')) {
        this.map.setLayoutProperty('bas-hillshade-layer', 'visibility', enabled ? 'visible' : 'none');
      }
    });
  }

  /** Sets up and toggles INACH official boundaries (53°W - 90°W) and complete continental toponymy. */
  setupInachLayers() {
    this.runWhenStyleLoaded(() => {
      if (!this.map.getSource('inach-territory-src')) {
        this.map.addSource('inach-territory-src', {
          type: 'geojson',
          data: INACH_CHILEAN_TERRITORY_FC,
        });

        this.map.addLayer({
          id: 'inach-territory-fill',
          type: 'fill',
          source: 'inach-territory-src',
          filter: ['==', '$type', 'Polygon'],
          layout: { visibility: 'none' },
          paint: {
            'fill-color': '#e11d48',
            'fill-opacity': 0.08,
          },
        });

        this.map.addLayer({
          id: 'inach-territory-line',
          type: 'line',
          source: 'inach-territory-src',
          layout: { visibility: 'none' },
          paint: {
            'line-color': '#f43f5e',
            'line-width': 2.5,
            'line-dasharray': [3, 2],
          },
        });
      }

      if (!this.map.getSource('inach-toponymy-src')) {
        this.map.addSource('inach-toponymy-src', {
          type: 'geojson',
          data: INACH_TOPONYMY_FC,
        });

        this.map.addLayer({
          id: 'inach-toponymy-symbol',
          type: 'symbol',
          source: 'inach-toponymy-src',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 11,
            'text-font': ['Open Sans Semibold'],
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            visibility: 'none',
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#071520',
            'text-halo-width': 2,
          },
        });
      }
    });
  }

  setInachLayersVisible(visible: boolean) {
    this.setupInachLayers();
    this.runWhenStyleLoaded(() => {
      const vis = visible ? 'visible' : 'none';
      if (this.map.getLayer('inach-territory-fill')) {
        this.map.setLayoutProperty('inach-territory-fill', 'visibility', vis);
      }
      if (this.map.getLayer('inach-territory-line')) {
        this.map.setLayoutProperty('inach-territory-line', 'visibility', vis);
      }
      if (this.map.getLayer('inach-toponymy-symbol')) {
        this.map.setLayoutProperty('inach-toponymy-symbol', 'visibility', vis);
      }
    });
  }

  isSatelliteVisible(): boolean {
    if (!this.map.isStyleLoaded() || !this.map.getLayer('satellite-layer')) return false;
    return this.map.getLayoutProperty('satellite-layer', 'visibility') === 'visible';
  }

  setProjectionMode(projection: 'globe' | 'mercator', terrain = false) {
    this.projectionMode = projection === 'globe' ? '3D' : '2D';

    const apply = () => {
      try {
        // Antarctica must never show repeated side-by-side world copies.
        this.map.setRenderWorldCopies(false);

        this.map.setProjection({
          type: projection
        });

        if (projection === 'globe') {
          this.map.dragRotate.enable();
          this.map.touchZoomRotate.enableRotation();
          this.map.keyboard.enableRotation();
          this.map.setMaxPitch(75);
        } else {
          this.map.dragRotate.disable();
          this.map.touchZoomRotate.disableRotation();
          this.map.keyboard.disableRotation();
          this.map.setBearing(0);
          this.map.setPitch(0);
        }

        this.setTerrainMode(terrain);

        this.map.resize();

        console.info(
          '[AMOH MAP MODE] projection:',
          this.map.getProjection()?.type,
          'terrain:',
          terrain
        );

      } catch (err) {
        console.warn(
          '[AMOH Engine] setProjectionMode error:',
          err
        );
      }
    };

    if (this.map.getLayer('ocean-background')) {
      apply();
    } else {
      this.map.once('style.load', apply);
    }
  }

  /** Enables or disables the photorealistic orbital atmosphere sky halo effect (Google Earth style). */
  setAtmosphere(enabled: boolean) {
    try {
      if (enabled) {
        this.map.setSky({
          'sky-color': '#020617',
          'sky-horizon-blend': 0.18,
          'horizon-color': '#38bdf8',
          'horizon-fog-blend': 0.12,
          'fog-color': '#040d1a',
          'fog-ground-blend': 0.08,
        });
      } else {
        (this.map as any).setSky?.(undefined);
      }
    } catch {
      // ignore
    }
  }

  setTerrainEnabled(
    enabled: boolean,
    onStatus: (status: TerrainStatus) => void = () => {}
  ) {
    try {
      this.disposeTerrain?.();
      this.disposeTerrain = undefined;
    } catch {
      // non-fatal
    }

    if (!enabled) {
      try {
        if (this.map.getTerrain()) {
          this.map.setTerrain(null);
        }

        if (this.map.getSource('amoh-terrain-dem')) {
          this.map.removeSource('amoh-terrain-dem');
        }

        onStatus('idle');

        console.info('[AMOH 3D] terrain: OFF');

      } catch (err) {
        console.warn('[AMOH 3D] terrain disable error:', err);
      }

      return;
    }

    const enable = () => {
      try {
        const disposer = attachTerrain(
          this.map,
          (status) => {
            onStatus(status);
            console.info('[AMOH 3D] terrain status:', status);
          }
        ) as unknown;

        if (typeof disposer === 'function') {
          this.disposeTerrain = disposer as () => void;
        }

        console.info('[AMOH 3D] terrain: ACTIVATING');

      } catch (err) {
        console.warn('[AMOH 3D] terrain activation error:', err);
        onStatus('error');
      }
    };

    if (this.map.isStyleLoaded()) {
      enable();
    } else {
      this.map.once('style.load', enable);
    }
  }

  setTerrainMode(
    enabled: boolean,
    onStatus: (status: TerrainStatus) => void = () => {}
  ) {
    this.setTerrainEnabled(enabled, onStatus);
  }

  setBathymetryVisible(visible: boolean) {
    for (const id of BATHYMETRY_BASE_LAYERS) {
      if (this.map.getLayer(id)) {
        this.map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    }
  }

  setOceanBaseVisible(visible: boolean) {
    if (this.map.getLayer('esri-ocean-base')) {
      this.map.setLayoutProperty(
        'esri-ocean-base',
        'visibility',
        visible ? 'visible' : 'none'
      );
    }
  }

  setAntarcticReliefVisible(visible: boolean, opacity = 0.92) {
    if (this.map.getLayer('antarctic-bathymetry-base')) {
      this.map.setLayoutProperty(
        'antarctic-bathymetry-base',
        'visibility',
        visible ? 'visible' : 'none'
      );
      if (visible) {
        this.map.setPaintProperty('antarctic-bathymetry-base', 'raster-opacity', opacity);
      }
    }
  }

  setGebcoReliefVisible(visible: boolean, opacity = 0.72) {
    if (this.map.getLayer('gebco-2025-relief')) {
      this.map.setLayoutProperty(
        'gebco-2025-relief',
        'visibility',
        visible ? 'visible' : 'none'
      );
      if (visible) {
        this.map.setPaintProperty('gebco-2025-relief', 'raster-opacity', opacity);
      }
    }
  }

  applyOsirisTheme(mode: string) {
    const apply = () => {
      try {

        console.info('[AMOH MAP MODE] applying:', mode);
        this.setBathymetryVisible(mode === 'BATHYMETRY');
        this.setOceanBaseVisible(mode === 'MAP' || mode === 'BATHYMETRY');
        const showAntarcticRelief = ['MAP', 'GLOBE', 'BATHYMETRY'].includes(mode);
        const reliefOpacity = mode === 'BATHYMETRY' ? 0.92 : mode === 'GLOBE' ? 0.72 : 0.58;
        this.setAntarcticReliefVisible(showAntarcticRelief, reliefOpacity);
        this.setGebcoReliefVisible(showAntarcticRelief, mode === 'BATHYMETRY' ? 0.86 : 0.72);

        switch (mode) {

          case 'GLOBE':
            // AMOH_SMART_ENGINE_GLOBE_V11
            this.projectionMode = '3D';
            this.setOceanBaseVisible(false);
            this.map.setRenderWorldCopies(false);
            this.map.setProjection({ type: 'globe' });

            this.map.dragRotate.enable();
            this.map.touchZoomRotate.enableRotation();
            this.map.keyboard.enableRotation();
            this.map.setMaxPitch(75);

            this.setSatelliteVisible(true);

            try {
              this.map.setSky({
                'sky-color': '#00070d',
                'sky-horizon-blend': 0.055,
                'horizon-color': '#08a8cc',
                'horizon-fog-blend': 0.070,
                'fog-color': '#35d9ee',
                'fog-ground-blend': 0.040,
              });
            } catch {
              // style transition
            }

            this.setTerrainMode(true);

            this.map.easeTo({
              center: [-38.0, -85.6],
              zoom: 1.92,
              pitch: 0,
              bearing: -10,
              
              duration: 950,
              essential: true,
            });
            break;


          case 'SAT':
            // AMOH_SMART_ENGINE_SAT_V11
            this.projectionMode = '3D';
            this.setOceanBaseVisible(false);
            this.map.setRenderWorldCopies(false);
            this.map.setProjection({ type: 'globe' });

            this.map.dragRotate.enable();
            this.map.touchZoomRotate.enableRotation();
            this.map.keyboard.enableRotation();
            this.map.setMaxPitch(75);

            this.setTerrainMode(false);
            this.setSatelliteVisible(true);

            try {
              this.map.setSky({
                'sky-color': '#00070d',
                'sky-horizon-blend': 0.050,
                'horizon-color': '#08a8cc',
                'horizon-fog-blend': 0.065,
                'fog-color': '#35d9ee',
                'fog-ground-blend': 0.035,
              });
            } catch {
              // style transition
            }

            this.map.easeTo({
              center: [-38.0, -85.6],
              zoom: 1.86,
              pitch: 0,
              bearing: -10,
              
              duration: 900,
              essential: true,
            });
            break;


          case 'BATHYMETRY':
            this.setOceanBaseVisible(true);
            this.setSatelliteVisible(false);
            this.setProjectionMode('mercator', false);
            this.setAtmosphere(false);
            this.map.easeTo({ center: [0, -70], zoom: 1.9, pitch: 0, bearing: 0, duration: 600 });
            break;

          case 'MAP':
          case '2D':
          default:
            // Scientific 2D:
            // satellite OFF, terrain OFF, Mercator.
            this.setOceanBaseVisible(true);
            this.setSatelliteVisible(false);
            this.setProjectionMode('mercator', false);
            this.setAtmosphere(false);

            this.map.easeTo({
              center: [0.0, -75.0],
              zoom: 2.2,
              pitch: 0,
              bearing: 0,
              duration: 600
            });
            break;
        }

      } catch (err) {
        console.warn(
          '[AMOH Engine] applyOsirisTheme error:',
          err
        );
      }
    };

    if (this.map.getLayer('ocean-background')) {
      apply();
    } else {
      this.map.once('style.load', apply);
    }
  }


  /** Resolves the current WOD palette from computed styles, falling back to defaults. */
  palette() {
    if (typeof window === 'undefined') return MAP_DEFAULTS;
    const styles = getComputedStyle(document.documentElement);
    return readMapPalette((name) => styles.getPropertyValue(name));
  }

  setGeoJSONSource(sourceId: string, data: FeatureCollection) {
    this.runWhenStyleLoaded(() => {
      try {
        const existing = this.map.getSource(sourceId);
        if (existing && 'setData' in existing) {
          (existing as GeoJSONSource).setData(data);
          return;
        }
        this.map.addSource(sourceId, { type: 'geojson', data });
      } catch (e) {
        console.warn(`[AMOH Engine] setGeoJSONSource ${sourceId} error:`, e);
      }
    });
  }

  ensureLayer(layerDef: LayerSpecification) {
    this.runWhenStyleLoaded(() => {
      try {
        if (!this.map.getLayer(layerDef.id)) this.map.addLayer(layerDef);
      } catch (e) {
        console.warn(`[AMOH Engine] ensureLayer ${layerDef.id} error:`, e);
      }
    });
  }

  removeLayer(layerId: string) {
    this.runWhenStyleLoaded(() => {
      try {
        if (this.map.getLayer(layerId)) this.map.removeLayer(layerId);
      } catch (e) {
        console.warn(`[AMOH Engine] removeLayer ${layerId} error:`, e);
      }
    });
  }

  removeSource(sourceId: string) {
    this.runWhenStyleLoaded(() => {
      try {
        if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
      } catch (e) {
        console.warn(`[AMOH Engine] removeSource ${sourceId} error:`, e);
      }
    });
  }

  /** Shows/hides every layer bound to a source or layer ID (layer toggle for the Layer Panel). */
  setLayerGroupVisible(layerOrSourceId: string, visible: boolean) {
    this.runWhenStyleLoaded(() => {
      try {
        const resolved = resolveLayerId(layerOrSourceId);
        const candidates = [
          layerOrSourceId,
          resolved,
          `amoh-layer-${layerOrSourceId}`,
          `amoh-layer-${resolved}`,
          `amoh-source-${layerOrSourceId}`,
          `amoh-source-${resolved}`,
        ];
        const layers = this.map.getStyle()?.layers ?? [];
        for (const layer of layers) {
          const matchSource =
            'source' in layer &&
            candidates.some(
              c =>
                layer.source === c ||
                layer.source.startsWith(`${c}_`) ||
                layer.source.startsWith(`${c}-`)
            );
          const matchId = candidates.some(
            c =>
              layer.id === c ||
              layer.id.startsWith(`${c}-`) ||
              layer.id.startsWith(`${c}_`)
          );
          if (matchSource || matchId) {
            this.map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none');
          }
        }
      } catch (e) {
        console.warn(`[AMOH Engine] setLayerGroupVisible ${layerOrSourceId} error:`, e);
      }
    });
  }

  /** Antarctic Treaty Territorial Claims (Fronteras / Sectores Históricos - Art. IV). */
  addTreatyClaimsLayer(id: string, data: FeatureCollection) {
    this.setGeoJSONSource(id, data);
    // 1. Semi-transparent polygonal fills
    this.ensureLayer({
      id: `${id}-fill`,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': ['coalesce', ['get', 'color'], '#38bdf8'] as unknown as string,
        'fill-opacity': ['coalesce', ['get', 'fill_opacity'], 0.15] as unknown as number,
      },
    });
    // 2. Sector boundary lines
    this.ensureLayer({
      id: `${id}-line`,
      type: 'line',
      source: id,
      paint: {
        'line-color': ['coalesce', ['get', 'color'], '#38bdf8'] as unknown as string,
        'line-width': 1.8,
        'line-dasharray': [3, 2],
      },
    });
    // 3. Sector Name Labels
    this.ensureLayer({
      id: `${id}-label`,
      type: 'symbol',
      source: id,
      minzoom: 1.5,
      layout: {
        'text-field': ['concat', ['get', 'name'], '\n(', ['get', 'sector'], ')'],
        'text-size': 10,
        'text-font': ['Roboto Regular', 'Arial Unicode MS Regular'],
        'text-anchor': 'center',
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#030712',
        'text-halo-width': 2,
      },
    });
  }

  /** Strategic Maritime Corridors & Waterways (Paso Drake, Estrecho Magallanes, etc.). */
  addMaritimeCorridorsLayer(id: string, data: FeatureCollection, color = '#38bdf8') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-glow`,
      type: 'line',
      source: id,
      paint: {
        'line-color': color,
        'line-width': 6,
        'line-opacity': 0.25,
      },
    });
    this.ensureLayer({
      id: `${id}-line`,
      type: 'line',
      source: id,
      paint: {
        'line-color': color,
        'line-width': 2.2,
        'line-opacity': 0.9,
      },
    });
    this.ensureLayer({
      id: `${id}-label`,
      type: 'symbol',
      source: id,
      minzoom: 2.0,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 10,
        'symbol-placement': 'line',
        'text-font': ['Roboto Regular', 'Arial Unicode MS Regular'],
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#e0f2fe',
        'text-halo-color': '#030712',
        'text-halo-width': 2,
      },
    });
  }

  /** High-fidelity local Antarctic vector basemap, ice shelves, glowing contours, and labels. */
  addAntarcticBasemap(carto: LocalAntarcticCartography) {
    // 1. Global Land Contours
    this.setGeoJSONSource('global_land', carto.globalLand);
    this.ensureLayer({
      id: 'global_land-line',
      type: 'line',
      source: 'global_land',
      paint: {
        'line-color': 'rgba(56, 189, 248, 0.4)',
        'line-width': 1.0,
      },
    });

    // 2. Ice Shelves Contours
    this.setGeoJSONSource('antarctica_ice_shelves', carto.antarcticaIce);
    this.ensureLayer({
      id: 'antarctica_ice_shelves-line',
      type: 'line',
      source: 'antarctica_ice_shelves',
      paint: {
        'line-color': '#38bdf8',
        'line-width': 1.2,
        'line-opacity': 0.6,
      },
    });

    // 3. Antarctica Land Contours & Glow
    this.setGeoJSONSource('antarctica_land', carto.antarcticaLand);
    this.ensureLayer({
      id: 'antarctica_land-glow',
      type: 'line',
      source: 'antarctica_land',
      paint: {
        'line-color': '#00e5ff',
        'line-width': 3,
        'line-opacity': 0.3,
        'line-blur': 3,
      },
    });
    this.ensureLayer({
      id: 'antarctica_land-line',
      type: 'line',
      source: 'antarctica_land',
      paint: {
        'line-color': '#38bdf8',
        'line-width': 1.2,
        'line-opacity': 0.5,
      },
    });

    // 4. Antarctic Labels Layer
    this.setGeoJSONSource('antarctic_labels', carto.labels);
    this.ensureLayer({
      id: 'antarctic_labels-symbol',
      type: 'symbol',
      source: 'antarctic_labels',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': ['get', 'size'],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-letter-spacing': 0.25,
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': '#04121e',
        'text-halo-width': 2.0,
      },
    });
  }

  /** Quantarctica vector layers (coastline, ASPA, bathymetry contours). */
  addCartographicLayer(id: string, data: FeatureCollection, color = this.palette().cartography) {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-fill`, type: 'fill', source: id,
      paint: { 'fill-color': color, 'fill-opacity': 0.15 },
      filter: ['==', ['geometry-type'], 'Polygon'],
    });
    this.ensureLayer({
      id: `${id}-line`, type: 'line', source: id,
      paint: { 'line-color': color, 'line-width': 1 },
    });
  }

  /** AIS vessel points (Tier 1) with Heading-rotated Ship Silhouettes & Coordinate Anchor Dot. */
  addAisLayer(id: string, data: FeatureCollection, _color = this.palette().aisTier1, _radius = 5) {
    this.setGeoJSONSource(id, data);
    // A single silhouette layer is used for monitored AIS positions. Circle
    // halos/dots obscure the geographic signal and are intentionally omitted.
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      minzoom: 1.0,
      layout: {
        'icon-image': [
          'match',
          ['upcase', ['to-string', ['coalesce', ['get', 'ship_type'], ['get', 'vessel_type'], ['get', 'type'], '']]],
          'RESEARCH STATION', 'icon-station',
          'KRILL TRAWLER', 'icon-fishery',
          'RESEARCH VESSEL', 'icon-vessel-research',
          'ICEBREAKER', 'icon-vessel-icebreaker',
          'EXPEDITION CRUISE', 'icon-vessel-luxury',
          'LUXURY YACHT', 'icon-vessel-luxury',
          'icon-vessel',
        ],
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          1.5, 0.65,
          4.0, 0.85,
          7.0, 1.05,
        ],
        'icon-rotate': ['coalesce', ['get', 'heading'], ['get', 'course_deg'], ['get', 'cog'], 0],
        'icon-rotation-alignment': 'map',
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** Scientific Research Stations (COMNAP / Polar Outposts) with Anchor Point & Station Logo. */
  addStationLayer(id: string, data: FeatureCollection, _color = '#35c3c8') {
    this.setGeoJSONSource(id, data);

    // Use the station symbol as the geographic mark; circles obscure the
    // layer identity when many facilities overlap at circumpolar zoom.
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      minzoom: 1.0,
      layout: {
        'icon-image': 'icon-station',
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          2.0, 0.70,
          5.0, 0.90,
          8.0, 1.15,
        ],
        'icon-offset': [0, -15],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });

    // Station name labels
    this.ensureLayer({
      id: `${id}-label`,
      type: 'symbol',
      source: id,
      minzoom: 2.5,
      layout: {
        'text-field': [
          'coalesce',
          ['get', 'name_off'],
          ['get', 'name_eng'],
          ['get', 'station_name'],
          ['get', 'name'],
          ['get', 'facility_name'],
          ['get', 'Station'],
          'Base Polar'
        ],
        'text-size': [
          'interpolate', ['linear'], ['zoom'],
          2.5, 8.5,
          4.0, 10.0,
          7.0, 12.0,
          10.0, 13.5,
        ],
        'text-offset': [0, 1.4],
        'text-anchor': 'top',
        'text-font': ['Roboto Regular'],
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#e2f4f7',
        'text-halo-color': '#03141f',
        'text-halo-width': 1.8,
      },
    });
  }

  /** Polar Field Observations (Cryosphere, Biosphere, Atmosphere, Human Activity) with Anchor Dot & Thematic Logo. */
  addObservationLayer(id: string, data: FeatureCollection, _color = '#58d5e3') {
    this.setGeoJSONSource(id, data);

    // The thematic symbol is the only point marker; duplicate circles made
    // fauna and field observations look like unexplained dots.
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      minzoom: 1.0,
      layout: {
        'icon-image': [
          'case',
          ['in', 'Criosfera', ['coalesce', ['get', 'observation_type'], ['get', 'category'], '']], 'icon-iceberg',
          ['in', 'Biosfera', ['coalesce', ['get', 'observation_type'], ['get', 'category'], '']], 'icon-plant',
          ['in', 'Atmósfera', ['coalesce', ['get', 'observation_type'], ['get', 'category'], '']], 'icon-weather',
          ['in', 'Hidrosfera', ['coalesce', ['get', 'observation_type'], ['get', 'category'], '']], 'icon-sensor',
          ['in', 'Humana', ['coalesce', ['get', 'observation_type'], ['get', 'category'], '']], 'icon-camp-luxury',
          'icon-sensor',
        ],
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          1.5, 0.65,
          4.0, 0.85,
          7.0, 1.05,
        ],
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });

    // Observation title and author label
    this.ensureLayer({
      id: `${id}-label`,
      type: 'symbol',
      source: id,
      minzoom: 4.5,
      layout: {
        'text-field': [
          'concat',
          ['coalesce', ['get', 'title'], ['get', 'observation_type'], 'Observación'],
          '\n',
          ['coalesce', ['get', 'observer'], 'Científico Polar']
        ],
        'text-size': 9.5,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-font': ['Roboto Regular'],
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#caf9f7',
        'text-halo-color': '#03141f',
        'text-halo-width': 1.8,
      },
    });
  }

  /** AIS vessel tracks / historical routes. */
  addTrackLayer(id: string, data: FeatureCollection, color = this.palette().aisTier1, width = 1.5) {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id,
      type: 'line',
      source: id,
      paint: {
        'line-color': color,
        'line-width': width,
        'line-opacity': 0.7,
      },
    });
  }

  /** Density heatmap cells (mirofish_engine.density_heatmap output). */
  addHeatmapLayer(id: string, data: FeatureCollection, maxDensity = 50) {
    const palette = this.palette();
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id, type: 'fill', source: id,
      paint: {
        'fill-color': [
          'interpolate', ['linear'], ['get', 'density'],
          0, 'rgba(0,210,255,0.05)',
          maxDensity / 2, palette.fieldTier3,
          maxDensity, palette.aisAnomaly,
        ],
        'fill-opacity': 0.55,
      },
    });
  }

  /** Trajectory line layer. */
  addTrajectoryLayer(id: string, data: FeatureCollection, color = this.palette().aisTier1, width = 2) {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({ id, type: 'line', source: id, paint: { 'line-color': color, 'line-width': width } });
  }


  /** Live Polar Aircraft (ADS-B Antarctic bridge & logistics flights) with 3D calculated altitude, vertical tethers, corridors & telemetry. */
  addPolarAircraftLayer(
    id: string,
    data: any,
    _color = '#ffd600'
  ) {
    const rawPoints = data?.points || (data?.type === 'FeatureCollection' ? data : { type: 'FeatureCollection', features: [] });
    const tethers = data?.tethers || { type: 'FeatureCollection', features: [] };
    const corridors = data?.corridors || { type: 'FeatureCollection', features: [] };
    const elevated = data?.elevatedPoints || rawPoints;

    // 1. Flight Route Corridors
    if (corridors.features?.length > 0) {
      this.setGeoJSONSource(`${id}_corridors`, corridors);
      this.ensureLayer({
        id: `${id}-corridors`,
        type: 'line',
        source: `${id}_corridors`,
        paint: {
          'line-color': '#ffd600',
          'line-width': 1.2,
          'line-opacity': 0.45,
          'line-dasharray': [3, 2],
        },
      });
    }

    // 2. 3D Vertical Drop Tethers (connecting ground shadow to elevated aircraft)
    if (tethers.features?.length > 0) {
      this.setGeoJSONSource(`${id}_tethers`, tethers);
      this.ensureLayer({
        id: `${id}-tethers`,
        type: 'line',
        source: `${id}_tethers`,
        paint: {
          'line-color': '#ffd600',
          'line-width': 1.6,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1],
        },
      });
    }

    // 3. Ground Shadow & Nadir Radar Target (Point A on the surface)
    this.setGeoJSONSource(id, rawPoints);
    // 4. Elevated Aircraft in the Air (Point B aloft)
    this.setGeoJSONSource(`${id}_elevated`, elevated);

    // Glowing Halo
    // Aircraft Icon (Track-aligned) with Real Calculated Flight Level & Speed
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: `${id}_elevated`,
      layout: {
        'icon-image': 'icon-aircraft',
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          1.5, 0.95,
          4.0, 1.2,
          7.0, 1.45,
        ],
        'icon-rotate': ['coalesce', ['get', 'heading'], ['get', 'true_track'], 0],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'text-field': ['coalesce', ['get', 'callsign'], ['get', 'flight'], 'ADS-B'],
        'text-size': 9.5,
        'text-offset': [0, 1.8],
        'text-anchor': 'top',
        'text-font': ['Roboto Regular'],
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#ffd600',
        'text-halo-color': '#030712',
        'text-halo-width': 2,
      },
    });
  }

  /** Polar Orbiting Satellites with 3D calculated Keplerian orbits, vertical drop tethers, and telemetry. */
  addPolarSatellitesLayer(
    id: string,
    data: {
      points: FeatureCollection;
      tracks: FeatureCollection;
      swaths: FeatureCollection;
      rings?: FeatureCollection;
      tethers?: FeatureCollection;
      elevatedPoints?: FeatureCollection;
    },
    color = '#00e5ff'
  ) {
    // 1. Swaths Footprint
    this.setGeoJSONSource(`${id}_swaths`, data.swaths);
    this.ensureLayer({
      id: `${id}_swaths-fill`,
      type: 'fill',
      source: `${id}_swaths`,
      paint: {
        'fill-color': ['coalesce', ['get', 'color'], color] as unknown as string,
        'fill-opacity': 0.12,
      },
    });
    this.ensureLayer({
      id: `${id}_swaths-line`,
      type: 'line',
      source: `${id}_swaths`,
      paint: {
        'line-color': ['coalesce', ['get', 'color'], color] as unknown as string,
        'line-width': 1,
        'line-opacity': 0.45,
        'line-dasharray': [2, 2],
      },
    });

    // 2. Full 360° Closed Keplerian Orbital Rings
    if (data.rings && data.rings.features?.length > 0) {
      this.setGeoJSONSource(`${id}_orbit_rings`, data.rings);
      this.ensureLayer({
        id: `${id}_orbit_rings-line`,
        type: 'line',
        source: `${id}_orbit_rings`,
        paint: {
          'line-color': ['coalesce', ['get', 'color'], color] as unknown as string,
          'line-width': 1.6,
          'line-opacity': 0.70,
          'line-dasharray': [4, 2],
        },
      });
    }

    // 3. Local Track Passage Line
    this.setGeoJSONSource(`${id}_tracks`, data.tracks);
    this.ensureLayer({
      id: `${id}_tracks-line`,
      type: 'line',
      source: `${id}_tracks`,
      paint: {
        'line-color': ['coalesce', ['get', 'color'], color] as unknown as string,
        'line-width': 2.0,
        'line-opacity': 0.85,
      },
    });

    // 4. Vertical Altitude Drop Tethers (connecting Nadir ground to elevated orbital position)
    const tethers = data.tethers || { type: 'FeatureCollection', features: [] };
    if (tethers.features?.length > 0) {
      this.setGeoJSONSource(`${id}_tethers`, tethers);
      this.ensureLayer({
        id: `${id}_tethers-line`,
        type: 'line',
        source: `${id}_tethers`,
        paint: {
          'line-color': ['coalesce', ['get', 'color'], '#a855f7'] as unknown as string,
          'line-width': 2.0,
          'line-opacity': 0.90,
          'line-dasharray': [3, 1],
        },
      });
    }

    // 5. Sub-Satellite Nadir Target (Point A on Earth surface)
    this.setGeoJSONSource(`${id}_points`, data.points);
    // 6. Elevated In-Orbit Satellite (Point B aloft in space)
    const elevated = data.elevatedPoints || data.points;
    this.setGeoJSONSource(`${id}_elevated`, elevated);

    // Glowing Orbital Aura
    // Satellite Icon and High-Precision Telemetry Badge
    this.ensureLayer({
      id: `${id}_points-symbol`,
      type: 'symbol',
      source: `${id}_elevated`,
      layout: {
        'icon-image': 'icon-satellite',
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          1.5, 0.25,
          4.0, 0.65,
          7.0, 1.15,
        ],
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'text-field': [
          'concat',
          ['coalesce', ['get', 'name'], ['get', 'sat_name'], 'SAT-ORBITAL'],
          ' · ',
          ['to-string', ['coalesce', ['get', 'altitude_km'], 700]],
          'km · ',
          ['to-string', ['coalesce', ['get', 'velocity_kms'], 7.56]],
          ' km/s · i=',
          ['to-string', ['coalesce', ['get', 'inclination_deg'], 98.2]],
          '°'
        ],
        'text-size': ['step', ['zoom'], 0, 4, 9.5],
        'text-offset': [0, 1.8],
        'text-anchor': 'top',
        'text-font': ['Roboto Regular'],
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#c084fc',
        'text-halo-color': '#030712',
        'text-halo-width': 2,
      },
    });
  }

  /** Antarctic Ozone Layer & Polar Vortex Monitoring (Copernicus Sentinel-5P / CAMS Total Column Ozone in DU). */
  addOzoneLayer(
    id: string,
    data: {
      polygons: FeatureCollection;
      thresholdLine: FeatureCollection;
      minPoint?: FeatureCollection;
    },
    initialVisible = false
  ) {
    const visibility = initialVisible ? 'visible' : 'none';
    // 1. Ozone Depletion Polygons with Dobson Units color ramp
    this.setGeoJSONSource(`${id}_polygons`, data.polygons);
    this.ensureLayer({
      id: `${id}-fill`,
      type: 'fill',
      source: `${id}_polygons`,
      layout: {
        visibility,
      },
      paint: {
        'fill-color': ['coalesce', ['get', 'color'], '#06b6d4'],
        'fill-opacity': 0.32,
      },
    });
    this.ensureLayer({
      id: `${id}-contours`,
      type: 'line',
      source: `${id}_polygons`,
      layout: {
        visibility,
      },
      paint: {
        'line-color': ['coalesce', ['get', 'color'], '#00f0ff'],
        'line-width': 1.2,
        'line-opacity': 0.5,
      },
    });

    // 2. Critical 220 DU Ozone Hole Threshold Boundary Line
    this.setGeoJSONSource(`${id}_threshold`, data.thresholdLine);
    this.ensureLayer({
      id: `${id}-threshold-glow`,
      type: 'line',
      source: `${id}_threshold`,
      layout: {
        visibility,
      },
      paint: {
        'line-color': '#00ffff',
        'line-width': 4.5,
        'line-opacity': 0.35,
        'line-blur': 2.0,
      },
    });
    this.ensureLayer({
      id: `${id}-threshold`,
      type: 'line',
      source: `${id}_threshold`,
      layout: {
        visibility,
      },
      paint: {
        'line-color': '#00ffff',
        'line-width': 2.2,
        'line-dasharray': [4, 2],
        'line-opacity': 0.95,
      },
    });
    this.ensureLayer({
      id: `${id}-threshold-label`,
      type: 'symbol',
      source: `${id}_threshold`,
      layout: {
        visibility,
        'symbol-placement': 'line',
        'text-field': 'LÍMITE CIENTÍFICO AGUJERO DE OZONO (220 DU) · Sentinel-5P TROPOMI',
        'text-size': 10,
        'text-letter-spacing': 0.12,
        'text-font': ['Roboto Regular'],
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#00ffff',
        'text-halo-color': '#030712',
        'text-halo-width': 2,
      },
    });

    // 3. Polar Vortex Minimum Observation Point
    if (data.minPoint) {
      this.setGeoJSONSource(`${id}_min`, data.minPoint);
      this.ensureLayer({
        id: `${id}-min-glow`,
        type: 'circle',
        source: `${id}_min`,
        layout: {
          visibility,
        },
        paint: {
          'circle-color': '#a855f7',
          'circle-radius': 14,
          'circle-opacity': 0.35,
        },
      });
      this.ensureLayer({
        id: `${id}-min-dot`,
        type: 'circle',
        source: `${id}_min`,
        layout: {
          visibility,
        },
        paint: {
          'circle-color': '#a855f7',
          'circle-radius': 5,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      this.ensureLayer({
        id: `${id}-min-label`,
        type: 'symbol',
        source: `${id}_min`,
        layout: {
          visibility,
          'icon-image': 'icon-sensor',
          'icon-size': 0.8,
          'text-field': [
            'concat',
            ['get', 'name'],
            ' · ',
            ['to-string', ['get', 'du']],
            ' DU\n[Sentinel-5P · Vórtice Polar]'
          ],
          'text-size': 10,
          'text-offset': [0, 1.8],
          'text-anchor': 'top',
          'text-font': ['Roboto Regular'],
        },
        paint: {
          'text-color': '#c084fc',
          'text-halo-color': '#030712',
          'text-halo-width': 2,
        },
      });
    }
  }

  /** GFW Fishing Effort & Vessel Presence (Gridded Raster / Points). */
  addGfwFishingEffortLayers(
    id: string,
    data: {
      presence?: FeatureCollection;
      effort?: FeatureCollection;
    }
  ) {
    if (data.effort) {
      this.setGeoJSONSource(`${id}_effort`, data.effort);
      this.ensureLayer({
        id: `${id}_effort-heatmap`,
        type: 'heatmap',
        source: `${id}_effort`,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'apparent_fishing_hours'], 0, 0, 100, 1],
          'heatmap-intensity': 1.2,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.2, '#00e5ff22',
            0.4, '#ffd60066',
            0.7, '#ff9100aa',
            1.0, '#ff1744dd',
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.85,
        },
      });
    }

    if (data.presence) {
      this.setGeoJSONSource(`${id}_presence`, data.presence);
      this.ensureLayer({
        id: `${id}_presence-glow`,
        type: 'circle',
        source: `${id}_presence`,
        paint: {
          'circle-color': '#ff9100',
          'circle-radius': 8,
          'circle-opacity': 0.28,
        },
      });
      this.ensureLayer({
        id: `${id}_presence`,
        type: 'circle',
        source: `${id}_presence`,
        paint: {
          'circle-color': '#ff9100',
          'circle-radius': 4.5,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      });
      this.ensureLayer({
        id: `${id}_presence-point`,
        type: 'circle',
        source: `${id}_presence`,
        paint: {
          'circle-color': '#ff9100',
          'circle-radius': 4.5,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      });
      this.ensureLayer({
        id: `${id}_presence-symbol`,
        type: 'symbol',
        source: `${id}_presence`,
        layout: {
          'icon-image': 'icon-fishery',
          'icon-size': 0.75,
          'icon-offset': [0, -14],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }
  }

  /** GFW Sentinel-1 Radar SAR Vessel Detections Layer (V8.2). */
  addGfwSarDetectionsLayer(id: string, data: FeatureCollection, color = '#ffaa00') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-pulse`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'ais_matched'], true], '#00e5ff',
          color,
        ],
        'circle-radius': 11,
        'circle-opacity': 0.28,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': [
          'case',
          ['==', ['get', 'ais_matched'], true], '#00e5ff',
          '#ff1744',
        ],
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'ais_matched'], true], '#00e5ff',
          '#ff1744',
        ],
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'ais_matched'], true], '#00e5ff',
          '#ff1744',
        ],
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-satellite',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** GFW Apparent Fishing Effort & CCAMLR Vessels Layer (Legacy Point Support). */
  addFisheriesLayer(id: string, data: FeatureCollection, color = '#ff754b') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-glow`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 10,
        'circle-opacity': 0.28,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-fishery',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** IAATO Published Tourism Routes 2026–2030 (LineStrings & Waypoints). */
  addTourismRoutesLayer(id: string, data: FeatureCollection, color = '#dda63a') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-line`,
      type: 'line',
      source: id,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': color,
        'line-width': 2,
        'line-opacity': 0.85,
        'line-dasharray': [4, 2],
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      layout: {
        'icon-image': 'icon-tourism',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** IAEA MARIS Marine Radioactivity Monitoring Stations. */
  addMarisNuclearLayer(id: string, data: FeatureCollection, color = '#ff5e8a') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-glow`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 10,
        'circle-opacity': 0.28,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-radiation',
        'icon-size': 0.85,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** Argo CTD Water Column Profiling Floats. */
  addArgoFloatsLayer(id: string, data: FeatureCollection, color = '#58d5e3') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-ring`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': 'transparent',
        'circle-radius': 9,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': color,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-sensor',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** Antarctic Marine Fauna & Biodiversity (Circumpolar OBIS & MAPPPD records across 18 sectors). */
  addFaunaLayer(id: string, data: FeatureCollection, color = '#72e0b5') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-glow`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'category'], 'penguins'], '#fbbf24',
          ['==', ['get', 'category'], 'cetaceans'], '#38bdf8',
          ['==', ['get', 'category'], 'pinnipeds'], '#2dd4bf',
          ['==', ['get', 'category'], 'seabirds'], '#a78bfa',
          ['==', ['get', 'krill'], true], '#fb923c',
          ['==', ['get', 'category'], 'krill'], '#fb923c',
          ['==', ['get', 'category'], 'fish'], '#93c5fd',
          ['==', ['get', 'category'], 'benthos'], '#f472b6',
          ['has', 'color'], ['get', 'color'],
          color,
        ],
        'circle-radius': 10,
        'circle-opacity': 0.3,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'category'], 'penguins'], '#fbbf24',
          ['==', ['get', 'cetaceans'], true], '#38bdf8',
          ['==', ['get', 'category'], 'cetaceans'], '#38bdf8',
          ['==', ['get', 'category'], 'pinnipeds'], '#2dd4bf',
          ['==', ['get', 'seabirds'], true], '#a78bfa',
          ['==', ['get', 'category'], 'seabirds'], '#a78bfa',
          ['==', ['get', 'krill'], true], '#fb923c',
          ['==', ['get', 'category'], 'krill'], '#fb923c',
          ['==', ['get', 'category'], 'fish'], '#93c5fd',
          ['==', ['get', 'category'], 'benthos'], '#f472b6',
          ['has', 'color'], ['get', 'color'],
          color,
        ],
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'category'], 'penguins'], '#fbbf24',
          ['==', ['get', 'cetaceans'], true], '#38bdf8',
          ['==', ['get', 'category'], 'cetaceans'], '#38bdf8',
          ['==', ['get', 'category'], 'pinnipeds'], '#2dd4bf',
          ['==', ['get', 'seabirds'], true], '#a78bfa',
          ['==', ['get', 'category'], 'seabirds'], '#a78bfa',
          ['==', ['get', 'krill'], true], '#fb923c',
          ['==', ['get', 'category'], 'krill'], '#fb923c',
          ['==', ['get', 'category'], 'fish'], '#93c5fd',
          ['==', ['get', 'category'], 'benthos'], '#f472b6',
          ['has', 'color'], ['get', 'color'],
          color,
        ],
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': [
          'case',
          ['has', 'icon'], ['get', 'icon'],
          ['==', ['get', 'category'], 'penguins'], 'icon-penguin',
          ['==', ['get', 'category'], 'pinnipeds'], 'icon-seal',
          ['==', ['get', 'category'], 'seabirds'], 'icon-seabird',
          ['==', ['get', 'category'], 'krill'], 'icon_krill_antarctic',
          ['==', ['get', 'category'], 'fish'], 'icon-fish',
          ['==', ['get', 'category'], 'benthos'], 'icon-squid',
          ['in', 'Orca', ['coalesce', ['get', 'common_name'], '']], 'icon-orca',
          ['==', ['get', 'category'], 'cetaceans'], 'icon-whale',
          ['in', 'Pingüino', ['coalesce', ['get', 'common_name'], '']], 'icon-penguin',
          ['in', 'Ballena', ['coalesce', ['get', 'common_name'], '']], 'icon-whale',
          ['in', 'Foca', ['coalesce', ['get', 'common_name'], '']], 'icon-seal',
          ['in', 'Krill', ['coalesce', ['get', 'common_name'], '']], 'icon_krill_antarctic',
          ['in', 'Albatros', ['coalesce', ['get', 'common_name'], '']], 'icon-seabird',
          ['in', 'Petrel', ['coalesce', ['get', 'common_name'], '']], 'icon-seabird',
          ['==', ['get', 'category'], 'Aves'], 'icon-penguin',
          ['==', ['get', 'category'], 'Mammalia'], 'icon-whale',
          ['==', ['get', 'category'], 'Malacostraca'], 'icon_krill_antarctic',
          'icon-whale',
        ],
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** AMOH V6 Antarctic Life Atlas (Krill, Penguins, Cetaceans, Flora, Kelp). */
  addBiodiversityAtlasLayer(id: string, data: FeatureCollection) {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-glow`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'category'], 'flora_terrestrial'], '#56c02b',
          ['==', ['get', 'category'], 'flora_marine'], '#26bde2',
          ['==', ['get', 'category'], 'krill'], '#ff9f43',
          '#72e0b5',
        ],
        'circle-radius': 10,
        'circle-opacity': 0.35,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#caf9f7',
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'category'], 'flora_terrestrial'], '#56c02b',
          ['==', ['get', 'category'], 'flora_marine'], '#26bde2',
          ['==', ['get', 'category'], 'krill'], '#ff9f43',
          '#72e0b5',
        ],
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'category'], 'flora_terrestrial'], '#56c02b',
          ['==', ['get', 'category'], 'flora_marine'], '#26bde2',
          ['==', ['get', 'category'], 'krill'], '#ff9f43',
          '#72e0b5',
        ],
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': [
          'case',
          ['==', ['get', 'icon'], 'icon-krill'], 'icon_krill_antarctic',
          ['==', ['get', 'icon'], 'icon_krill_antarctic'], 'icon_krill_antarctic',
          ['==', ['get', 'icon'], 'icon-penguin'], 'icon-penguin',
          ['==', ['get', 'icon'], 'icon-whale'], 'icon-whale',
          ['==', ['get', 'icon'], 'icon-seal'], 'icon-seal',
          ['==', ['get', 'icon'], 'icon-orca'], 'icon-orca',
          ['==', ['get', 'icon'], 'icon-plant'], 'icon-plant',
          ['==', ['get', 'icon'], 'icon-moss'], 'icon-plant',
          ['==', ['get', 'icon'], 'icon-macroalgae'], 'icon-plant',
          'icon-whale',
        ],
        'icon-size': 0.85,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** Acoustic Ocean Network: Passive Acoustic Monitoring (PAM) Hydrophones. */
  addHydrophoneLayer(id: string, data: FeatureCollection, color = '#00e5ff') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-ring`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': 'transparent',
        'circle-radius': 9,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': color,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-hydrophone',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** Automatic Weather Stations (AWS) network. */
  addAwsWeatherLayer(id: string, data: FeatureCollection, color = '#58d5e3') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-ring`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': 'transparent',
        'circle-radius': 8,
        'circle-stroke-width': 1.2,
        'circle-stroke-color': color,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-aws',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** Luxury Expedition Camps (White Desert, Ultima, Union Glacier). */
  addLuxuryCampsLayer(id: string, data: FeatureCollection, color = '#ffd700') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-ring`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': 'transparent',
        'circle-radius': 10,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': color,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-camp-luxury',
        'icon-size': 0.85,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** Deep Scientific Boreholes (ANDRILL, EPICA Dome C, Siple Dome). */
  addBoreholesLayer(id: string, data: FeatureCollection, color = '#38bdf8') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-ring`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': 'transparent',
        'circle-radius': 8,
        'circle-stroke-width': 1.4,
        'circle-stroke-color': color,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-borehole',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** AMOH V6 Gateway Offshore Energy Context (Strictly North of 60°S). */
  addOffshoreEnergyLayer(id: string, data: FeatureCollection, color = '#f59e0b') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-glow`,
      type: 'circle',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': color,
        'circle-radius': 9,
        'circle-opacity': 0.3,
        'circle-stroke-width': 1.2,
        'circle-stroke-color': '#fbbf24',
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      layout: {
        'icon-image': 'icon-platform',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** USGS Tectonic & Volcanic Seismic Events across Scotia Arc / Southern Ocean. */
  addSeismicLayer(id: string, data: FeatureCollection, color = '#ff827d') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-pulse`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'magnitude'],
          3.0, 8,
          5.0, 15,
          7.0, 26,
        ],
        'circle-opacity': 0.2,
        'circle-stroke-width': 1,
        'circle-stroke-color': color,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-seismic',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** Transoceanic & Subantarctic Submarine Fiber Optic Cables and Landing Stations. */
  addSubmarineCablesLayer(id: string, data: FeatureCollection, color = '#ffc845') {
    this.setGeoJSONSource(id, data);

    // Zoom-interpolated width rule (Low: 1px, Mid: 1.5px, High: 2px, Max: 3px)
    const cableWidth = [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      1.0,
      5,
      1.4,
      8,
      2.0,
      12,
      2.8,
    ] as unknown as number;

    // 1. Operational Cables (Solid Amber)
    this.ensureLayer({
      id: `${id}-operational-line`,
      type: 'line',
      source: id,
      filter: [
        'all',
        ['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'MultiLineString']],
        ['any', ['!', ['has', 'status_type']], ['==', ['get', 'status_type'], 'operational']],
      ],
      paint: {
        'line-color': ['coalesce', ['get', 'color'], color] as unknown as string,
        'line-width': cableWidth,
        'line-opacity': 0.9,
      },
    });

    // 2. Planned, Feasibility & SMART Cables (Dashed Amber / Teal)
    this.ensureLayer({
      id: `${id}-planned-line`,
      type: 'line',
      source: id,
      filter: [
        'all',
        ['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'MultiLineString']],
        ['in', ['get', 'status_type'], ['literal', ['planned', 'proposed', 'feasibility', 'concept', 'smart_science']]],
      ],
      paint: {
        'line-color': ['coalesce', ['get', 'color'], '#ffb703'] as unknown as string,
        'line-width': cableWidth,
        'line-opacity': 0.85,
        'line-dasharray': [4, 3],
      },
    });

    // 3. Landing Stations Glow
    this.ensureLayer({
      id: `${id}-landing-glow`,
      type: 'circle',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': color,
        'circle-radius': 8,
        'circle-opacity': 0.35,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
      },
    });

    // 3b. Landing Stations Coordinate Anchor Dot (El Punto)
    this.ensureLayer({
      id: `${id}-landing-point`,
      type: 'circle',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': color,
        'circle-radius': 5,
        'circle-stroke-width': 1.8,
        'circle-stroke-color': '#ffffff',
      },
    });

    // 4. Landing Stations Symbol Icon
    this.ensureLayer({
      id: `${id}-landing-symbol`,
      type: 'symbol',
      source: id,
      filter: ['==', ['geometry-type'], 'Point'],
      layout: {
        'icon-image': 'icon-cable',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  addSolarTerminatorLayer(date: Date = new Date()) {
    if (!this.map.isStyleLoaded()) return;
    try {
      const terminatorGeoJSON = computeSolarTerminatorGeoJSON(date);
      const sourceId = 'solar-terminator-source';
      const fillLayerId = 'solar-terminator-fill';
      const lineLayerId = 'solar-terminator-line';

      const source = this.map.getSource(sourceId) as GeoJSONSource | undefined;
      if (source) {
        source.setData(terminatorGeoJSON);
      } else {
        this.map.addSource(sourceId, {
          type: 'geojson',
          data: terminatorGeoJSON,
        });

        this.ensureLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#020914',
            'fill-opacity': 0.35,
          },
        });

        this.ensureLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#58d5e3',
            'line-width': 1.0,
            'line-opacity': 0.25,
            'line-dasharray': [3, 3],
          },
        });
      }
    } catch (e) {
      console.warn('[AMOH Engine] addSolarTerminatorLayer error:', e);
    }
  }

  flyTo(center: [number, number], zoom?: number) {
    this.map.flyTo({ center, zoom });
  }

  setLayerGroupVisibility(layerPrefix: string, isVisible: boolean) {
    if (!this.map.isStyleLoaded()) return;
    const visibility = isVisible ? 'visible' : 'none';
    const style = this.map.getStyle();
    if (!style || !style.layers) return;
    style.layers.forEach((layer) => {
      if (layer.id.startsWith(layerPrefix)) {
        try {
          this.map.setLayoutProperty(layer.id, 'visibility', visibility);
        } catch (_) {}
      }
    });
  }

  setLayerGroupOpacity(layerPrefix: string, opacity: number) {
    if (!this.map.isStyleLoaded()) return;
    const style = this.map.getStyle();
    if (!style || !style.layers) return;
    style.layers.forEach((layer) => {
      if (layer.id.startsWith(layerPrefix)) {
        try {
          if (layer.type === 'fill') {
            this.map.setPaintProperty(layer.id, 'fill-opacity', opacity * 0.6);
          } else if (layer.type === 'line') {
            this.map.setPaintProperty(layer.id, 'line-opacity', opacity);
          } else if (layer.type === 'circle') {
            this.map.setPaintProperty(layer.id, 'circle-opacity', opacity * 0.3);
          } else if (layer.type === 'heatmap') {
            this.map.setPaintProperty(layer.id, 'heatmap-opacity', opacity);
          } else if (layer.type === 'raster') {
            this.map.setPaintProperty(layer.id, 'raster-opacity', opacity);
          }
        } catch (_) {}
      }
    });
  }

  /** Live Antarctic CCTV & Research Station Cameras. */
  addCctvLayer(id: string, data: FeatureCollection, color = '#10b981') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-glow`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 9,
        'circle-opacity': 0.35,
      },
    });
    this.ensureLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 4.5,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': color,
        'circle-radius': 4.5,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
      },
    });
    this.ensureLayer({
      id: `${id}-symbol`,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': 'icon-sensor',
        'icon-size': 0.8,
        'icon-offset': [0, -14],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  /** CCAMLR Convention Statistical & Regulatory Fisheries Boundaries. */
  addCcamlrZonesLayer(id: string, data: FeatureCollection, color = '#06b6d4') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-fill`,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': color,
        'fill-opacity': 0.06,
      },
    });
    this.ensureLayer({
      id: `${id}-line`,
      type: 'line',
      source: id,
      paint: {
        'line-color': color,
        'line-width': 1.8,
        'line-dasharray': [4, 2],
        'line-opacity': 0.85,
      },
    });
  }

  /** Search and Rescue (SAR) Maritime Coordination Regions. */
  addSarRegionsLayer(id: string, data: FeatureCollection, color = '#ef4444') {
    this.setGeoJSONSource(id, data);
    this.ensureLayer({
      id: `${id}-fill`,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': color,
        'fill-opacity': 0.05,
      },
    });
    this.ensureLayer({
      id: `${id}-line`,
      type: 'line',
      source: id,
      paint: {
        'line-color': color,
        'line-width': 1.8,
        'line-dasharray': [3, 2],
        'line-opacity': 0.8,
      },
    });
  }



  destroy() {
    this.disposeCamera?.();
    this.disposeTerrain?.();
    try {
      this.map.remove();
    } catch (e) {
      console.warn('[AMOH Engine] Safe cleanup notice:', e);
    }
  }
}

export function computeSolarTerminatorGeoJSON(date: Date = new Date()): GeoJSON.FeatureCollection {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 0).getTime()) / 86400000);
  const declination = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
  const decRad = (declination * Math.PI) / 180;
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const sunLon = (12 - utcHours) * 15;

  const coords: [number, number][] = [];
  for (let lon = -180; lon <= 180; lon += 3) {
    const lonDeltaRad = ((lon - sunLon) * Math.PI) / 180;
    const tanLat = -Math.cos(lonDeltaRad) / Math.tan(decRad);
    let lat = (Math.atan(tanLat) * 180) / Math.PI;
    lat = Math.max(-88, Math.min(88, lat));
    coords.push([lon, lat]);
  }

  const nightPoleLat = declination > 0 ? -90 : 90;
  const polyCoords: [number, number][] = [
    [-180, nightPoleLat],
    ...coords,
    [180, nightPoleLat],
    [-180, nightPoleLat],
  ];

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polyCoords],
        },
        properties: {
          declination,
          sunLon,
          timestamp: date.toISOString(),
        },
      },
    ],
  };
}
