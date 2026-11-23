import { useEffect, useRef } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { isContinuousHeatVisible } from '../lib/continuous-heatmap-runtime';
import { LAYER_REGISTRY, resolveLayerId } from '../lib/layer-registry';
import {
  OLEA_RESEARCH_LAYER_REGISTRY,
  describePangaeaFeature,
  describeCopernicusFeature,
  describeGebcoFeature,
} from '../lib/olea-research-layer-registry';
import { describeSarFeature } from '../lib/olea-sar-layers';
import { registerAmohIcons, getIconForLayer } from '../lib/map-icon-atlas';
import { OfflineManager } from '../lib/offline-manager';

interface UseMapLayersProps {
  map: MapLibreMap | null;
  activeLayers: string[];
  layerOpacities?: Record<string, number>;
}

/**
 * Determina el ID de la capa antes de la cual insertar la nueva capa en el stack de MapLibre
 * para garantizar que polígonos o rásteres nunca tapen líneas, mapas de calor, fauna o símbolos.
 */
function getInsertionBeforeId(map: MapLibreMap, layerType: string): string | undefined {
  const layers = map.getStyle()?.layers || [];
  if (layerType === 'raster') {
    const firstNonRaster = layers.find((l) => l.type !== 'raster' && l.type !== 'background');
    return firstNonRaster?.id;
  }
  if (layerType === 'fill') {
    const firstLineOrPoint = layers.find(
      (l) => l.id.startsWith('amoh-layer-') && ['line', 'heatmap', 'circle', 'symbol'].includes(l.type)
    );
    return firstLineOrPoint?.id;
  }
  if (layerType === 'line') {
    const firstPoint = layers.find(
      (l) => l.id.startsWith('amoh-layer-') && ['circle', 'symbol'].includes(l.type)
    );
    return firstPoint?.id;
  }
  if (layerType === 'heatmap') {
    const firstPoint = layers.find(
      (l) => l.id.startsWith('amoh-layer-') && ['circle', 'symbol'].includes(l.type)
    );
    return firstPoint?.id;
  }
  // Capas tipo 'circle' o 'symbol' (fauna, buques, aeronaves, satélites, boyas) van en la cima
  return undefined;
}

function paintForLayerType(
  paint: Record<string, any> | undefined,
  layerType: string,
  opacity: number
) {
  const sourcePaint = paint || {};
  const prefix =
    layerType === 'fill' ? 'fill-' :
    layerType === 'line' ? 'line-' :
    layerType === 'circle' ? 'circle-' :
    layerType === 'heatmap' ? 'heatmap-' :
    layerType === 'raster' ? 'raster-' :
    '';

  const filtered = Object.fromEntries(
    Object.entries(sourcePaint).filter(([key]) => !prefix || key.startsWith(prefix))
  );

  if (layerType === 'raster') filtered['raster-opacity'] = opacity;
  if (layerType === 'fill') filtered['fill-opacity'] = opacity;
  if (layerType === 'line') filtered['line-opacity'] = opacity;
  if (layerType === 'circle') {
    filtered['circle-opacity'] = opacity;
    filtered['circle-radius'] = filtered['circle-radius'] ?? 5;
    // `??` y no `||`: un borde de 0 es una decision deliberada de la capa, y con
    // `||` se reemplazaba por 1,8 px blancos. En un campo denso (miles de puntos
    // separados por menos de su propio diametro) esos bordes se funden y la capa
    // entera se ve como un rectangulo blanco solido.
    filtered['circle-stroke-width'] = filtered['circle-stroke-width'] ?? 1.8;
    filtered['circle-stroke-color'] = filtered['circle-stroke-color'] ?? '#ffffff';
  }
  if (layerType === 'heatmap') filtered['heatmap-opacity'] = opacity;

  return filtered;
}

const SYMBOL_ONLY_LAYERS = new Set([
  'maritime_vessels',
  'polar_aircraft',
  'polar_satellites',
  'antarctic_fauna',
  'fauna_krill_swarms',
  'fauna_whale_pods',
  'fauna_penguins',
  'quantarctica_stations',
  'comnap_facilities',
  'iaato_landing_sites',
  'iaato_deep_field_camps',
  'nuclear_sites',
  'maris_measurements',
  'olea_antarctic_hexacorals',
  'olea_antarctic_stylasteridae',
]);

// Campos escalares densos: miles de puntos en rejilla regular que representan
// un campo continuo (temperatura, salinidad, corrientes), no entidades
// localizadas. El halo luminoso y el pin con logotipo que se anaden a toda
// capa de puntos convierten la rejilla en "miles de cosas situadas aqui", que
// es una lectura falsa del dato, ademas de 6.720 simbolos superpuestos.
// Estas capas se dibujan como circulos planos y nada mas.
const DENSE_FIELD_LAYERS = new Set([
  'khalifa_ml_exploratory_cpu',
  'lindeque_sediment_reference',
  'antgg_gravity_anomaly',
  'antgg_bouguer_anomaly',
  'admap2b_magnetic_anomaly',
  'admap2s_magnetic_anomaly',
  'copernicus_sst_peninsula',
  'copernicus_sss_peninsula',
  'copernicus_currents_peninsula',
]);

export function useMapLayers({ map, activeLayers, layerOpacities = {} }: UseMapLayersProps) {
  const loadedSources = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!map) return;

    let isDisposed = false;

    const syncLayers = async () => {
      if (isDisposed) return;

      // Asegurar que todos los iconos vectoriales SVG estén registrados en el mapa
      await registerAmohIcons(map);
      if (isDisposed) return;

      // 1. Remover capas desactivadas
      const currentLayers = map.getStyle()?.layers || [];
      currentLayers.forEach((layer) => {
        if (layer.id.startsWith('amoh-layer-')) {
          const rawId = layer.id
            .replace('amoh-layer-', '')
            .replace('-symbol', '')
            .replace('-glow', '')
            .replace('-3d-ambient', '')
            .replace('-3d-mid', '')
            .replace('-3d-core', '')
            .replace('-3d-pin', '');
          const isStillActive = activeLayers.some(
            (activeId) => activeId === rawId || resolveLayerId(activeId) === rawId
          );
          if (!isStillActive) {
            if (map.getLayer(layer.id)) {
              map.removeLayer(layer.id);
            }
            const sourceId = `amoh-source-${rawId}`;
            // Remover fuente solo si ninguna otra subcapa (ej. circle y symbol) la está usando
            const anyOtherUsingSource = (map.getStyle()?.layers || []).some(
              (l) => (l as any).source === sourceId
            );
            if (!anyOtherUsingSource && map.getSource(sourceId)) {
              map.removeSource(sourceId);
              loadedSources.current.delete(sourceId);
            }
          }
        }
      });

      // 2. Agregar capas activas
      for (const layerId of activeLayers) {
        if (isDisposed) break;
        const resolvedId = resolveLayerId(layerId);
        const def = OLEA_RESEARCH_LAYER_REGISTRY[resolvedId] || OLEA_RESEARCH_LAYER_REGISTRY[layerId] || LAYER_REGISTRY[resolvedId] || LAYER_REGISTRY[layerId];
        if (!def) continue;

        const canonicalId = def.id || resolvedId;
        const sourceId = `amoh-source-${canonicalId}`;
        const mapLayerId = `amoh-layer-${canonicalId}`;

        // Añadir fuente si no existe
        if (!map.getSource(sourceId)) {
          if (def.type === 'geojson' || def.type === 'heatmap') {
            const isLocalUrl = typeof def.source.url === 'string' && (def.source.url.startsWith('/') || def.source.url.startsWith('http'));
            if (isLocalUrl) {
              const res = await OfflineManager.query((def as typeof def & { providerId?: string }).providerId || 'amoh', canonicalId, async () => {
                const r = await fetch(def.source.url);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
              });
              if (isDisposed || !map.getStyle()?.version) break;
              if (!map.getSource(sourceId)) {
                map.addSource(sourceId, {
                  type: 'geojson',
                  data: res.data || def.source.url,
                });
              }
            } else {
              map.addSource(sourceId, {
                type: 'geojson',
                data: def.source.url,
              });
            }
          } else if (def.type === 'raster') {
            // Las plantillas XYZ locales ('/data/web/tiles/...') se vuelven absolutas:
            // MapLibre puede pedir teselas desde un worker, donde una ruta relativa
            // a la raiz no resuelve contra la pagina.
            const tileUrl = def.source.url.startsWith('/')
              ? `${window.location.origin}${def.source.url}`
              : def.source.url;
            map.addSource(sourceId, {
              type: 'raster',
              tiles: [tileUrl],
              tileSize: def.source.tileSize || 256,
              ...(def.source.minzoom != null ? { minzoom: def.source.minzoom } : {}),
              ...(def.source.maxzoom != null ? { maxzoom: def.source.maxzoom } : {}),
              ...(def.source.bounds ? { bounds: def.source.bounds } : {}),
              ...(def.source.attribution ? { attribution: def.source.attribution } : {}),
            });
          }
          loadedSources.current.add(sourceId);
        }

        // Añadir capa al mapa si no existe
        if (!map.getLayer(mapLayerId)) {
          const isHeatmap =
            def.type === 'heatmap' || layerId.includes('heatmap') || canonicalId.includes('heatmap');
          const layerType = isHeatmap
            ? 'heatmap'
            : def.type === 'raster'
            ? 'raster'
            : def.paint['fill-color']
            ? 'fill'
            : def.paint['line-color']
            ? 'line'
            : 'circle';

          const beforeId = getInsertionBeforeId(map, layerType);

          const symbolOnly = SYMBOL_ONLY_LAYERS.has(canonicalId);
          const isDenseField = DENSE_FIELD_LAYERS.has(canonicalId);
          const hideNativeHeat = isHeatmap && isContinuousHeatVisible(map, canonicalId);
          map.addLayer(
            {
              id: mapLayerId,
              type: layerType as any,
              source: sourceId,
              paint: paintForLayerType(
                def.paint,
                layerType,
                layerOpacities[layerId] ??
                  (layerType === 'fill' ? 0.45 :
                    layerType === 'line' ? 0.85 :
                      layerType === 'heatmap' ? 0.88 : 0.95)
              ),
              layout: {
                visibility: symbolOnly ? 'none' : 'visible',
                ...def.layout,
                ...(hideNativeHeat ? { visibility: 'none' } : {}),
              },
              minzoom: def.minzoom,
              maxzoom: def.maxzoom,
            },
            beforeId
          );

          // Si es una capa de puntos, agregar un halo luminoso y la capa SYMBOL con su
          // logotipo correspondiente. Los campos escalares densos quedan fuera (DENSE_FIELD_LAYERS).
          if (layerType === 'circle' && !isDenseField) {
            if (!symbolOnly) {
              const glowLayerId = `${mapLayerId}-glow`;
              if (!map.getLayer(glowLayerId)) {
                map.addLayer(
                  {
                    id: glowLayerId,
                    type: 'circle',
                    source: sourceId,
                    paint: {
                      'circle-color': def.paint?.['circle-color'] || '#00e5ff',
                      'circle-radius': ((def.paint?.['circle-radius'] as number) || 5) + 4,
                      'circle-opacity': 0.28,
                    },
                    layout: { visibility: 'visible' },
                  },
                  mapLayerId
                );
              }
            }

            const symbolLayerId = `${mapLayerId}-symbol`;
            if (!map.getLayer(symbolLayerId)) {
              let iconExpression: any = getIconForLayer(canonicalId);

              // Para fauna y monitoreo marino, aplicar asignación dinámica por taxón/categoría
              if (
                [
                  'krill_occurrences',
                  'whales',
                  'quantarctica_penguins',
                  'quantarctica_seals',
                  'antarctic_fauna',
                  'phytoplankton_chlorophyll',
                  'fauna_schools_fish',
                  'fauna_krill_swarms',
                  'fauna_whale_pods',
                  'fauna_penguins',
                  'fauna_pinnipeds',
                  'fauna_seabirds',
                  'fauna_fish',
                  'fauna_krill',
                  'fauna_cetaceans',
                  'fauna_benthos',
                ].includes(canonicalId)
              ) {
                iconExpression = [
                  'case',
                  ['in', 'orca', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-orca',
                  ['in', 'whale', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-whale',
                  ['in', 'balaenoptera', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-whale',
                  ['in', 'megaptera', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-whale',
                  ['in', 'ballena', ['downcase', ['coalesce', ['get', 'common_name_es'], ['get', 'name'], '']]],
                  'icon-whale',
                  ['in', 'phyto', ['downcase', ['coalesce', ['get', 'category'], ['get', 'species'], ['get', 'name'], '']]],
                  'icon-phytoplankton',
                  ['in', 'clorofila', ['downcase', ['coalesce', ['get', 'name'], ['get', 'sub_type'], '']]],
                  'icon-phytoplankton',
                  ['in', 'seal', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-seal',
                  ['in', 'foca', ['downcase', ['coalesce', ['get', 'common_name_es'], ['get', 'name'], '']]],
                  'icon-seal',
                  ['in', 'mirounga', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-seal',
                  ['in', 'leptonychotes', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-seal',
                  ['in', 'penguin', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-penguin',
                  ['in', 'pinguino', ['downcase', ['coalesce', ['get', 'common_name_es'], ['get', 'name'], '']]],
                  'icon-penguin',
                  ['in', 'aptenodytes', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-penguin',
                  ['in', 'pygoscelis', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-penguin',
                  ['in', 'krill', ['downcase', ['coalesce', ['get', 'species'], ['get', 'category'], ['get', 'name'], '']]],
                  'icon-krill',
                  ['in', 'superba', ['downcase', ['coalesce', ['get', 'species'], ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-krill',
                  ['in', 'pez', ['downcase', ['coalesce', ['get', 'common_name_es'], ['get', 'name'], '']]],
                  'icon-fish',
                  ['in', 'fish', ['downcase', ['coalesce', ['get', 'species'], ['get', 'category'], ['get', 'name'], '']]],
                  'icon-fish',
                  ['in', 'pleuragramma', ['downcase', ['coalesce', ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-fish',
                  ['in', 'dissostichus', ['downcase', ['coalesce', ['get', 'scientific_name'], ['get', 'name'], '']]],
                  'icon-fish',
                  ['in', 'albatros', ['downcase', ['coalesce', ['get', 'common_name_es'], ['get', 'name'], '']]],
                  'icon-seabird',
                  ['in', 'seabird', ['downcase', ['coalesce', ['get', 'category'], ['get', 'name'], '']]],
                  'icon-seabird',
                  ['in', 'petrel', ['downcase', ['coalesce', ['get', 'common_name_es'], ['get', 'name'], '']]],
                  'icon-seabird',
                  ['in', 'squid', ['downcase', ['coalesce', ['get', 'species'], ['get', 'name'], '']]],
                  'icon-squid',
                  ['in', 'calamar', ['downcase', ['coalesce', ['get', 'common_name_es'], ['get', 'name'], '']]],
                  'icon-squid',
                  ['in', 'benthos', ['downcase', ['coalesce', ['get', 'category'], ['get', 'name'], '']]],
                  'icon-squid',
                  getIconForLayer(canonicalId),
                ];
              }

              map.addLayer({
                id: symbolLayerId,
                type: 'symbol',
                source: sourceId,
                layout: {
                  'icon-image': iconExpression,
                  'icon-size': 0.8,
                  'icon-offset': [0, -14],
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                  visibility: 'visible',
                },
              });
            }
          }
        } else {
          // Actualizar opacidad en caliente si la capa ya existe
          const opacity = layerOpacities[layerId];
          if (opacity !== undefined) {
            const l = map.getLayer(mapLayerId);
            if (l?.type === 'raster') map.setPaintProperty(mapLayerId, 'raster-opacity', opacity);
            if (l?.type === 'fill') map.setPaintProperty(mapLayerId, 'fill-opacity', opacity);
            if (l?.type === 'line') map.setPaintProperty(mapLayerId, 'line-opacity', opacity);
            if (l?.type === 'circle') map.setPaintProperty(mapLayerId, 'circle-opacity', opacity);
            if (l?.type === 'heatmap') map.setPaintProperty(mapLayerId, 'heatmap-opacity', opacity);
          }
        }
      }
    };

    if (map.getStyle()?.version) {
      syncLayers();
    } else {
      map.once('load', syncLayers);
    }

    // Handlers interactivos para click y cambio de cursor al pasar sobre entidades
    const handleMapClick = (e: any) => {
      const allLayers = map.getStyle()?.layers || [];
      const amohLayerIds = allLayers
        .filter((l) => l.id.startsWith('amoh-layer-'))
        .map((l) => l.id);

      if (amohLayerIds.length === 0) return;

      const bbox: [[number, number], [number, number]] = [
        [e.point.x - 14, e.point.y - 14],
        [e.point.x + 14, e.point.y + 14],
      ];

      const features = map.queryRenderedFeatures(bbox, { layers: amohLayerIds });
      if (features && features.length > 0) {
        const feature = features[0];
        const props = { ...feature.properties };
        const geom = feature.geometry as any;
        let lon = e.lngLat.lng;
        let lat = e.lngLat.lat;
        if (geom && geom.type === 'Point' && Array.isArray(geom.coordinates)) {
          lon = geom.coordinates[0];
          lat = geom.coordinates[1];
        }

        const rawLayerId = feature.layer.id
          .replace('amoh-layer-', '')
          .replace('-symbol', '')
          .replace('-glow', '')
          .replace('-3d-ambient', '')
          .replace('-3d-mid', '')
          .replace('-3d-core', '')
          .replace('-3d-pin', '');
        const def = OLEA_RESEARCH_LAYER_REGISTRY[rawLayerId] || LAYER_REGISTRY[rawLayerId];

        // Las capas PANGAEA guardan claves de una letra para no inflar un archivo
        // de 62.356 features; el nombre legible y el DOI se derivan del id aqui.
        const pangaeaInfo = rawLayerId.startsWith('pangaea')
          ? describePangaeaFeature(props)
          : null;

        // Las capas copernicus_* traen claves de una letra con unidades que la
        // ficha generica no sabe rotular; se traducen aqui.
        const copernicusInfo = rawLayerId.startsWith('copernicus_')
          ? describeCopernicusFeature(rawLayerId, props)
          : null;

        const gebcoInfo = rawLayerId.startsWith('gebco_undersea')
          ? describeGebcoFeature(props)
          : null;

        // Las capas sar_* guardan claves cortas y NO guardan las URL de
        // descarga: son deterministas a partir del nombre del gránulo y
        // almacenarlas triplicaba el peso del archivo. Se reconstruyen aquí.
        const sarInfo = rawLayerId.startsWith('sar_')
          ? describeSarFeature(rawLayerId, props)
          : null;

        const payload = {
          ...props,
          ...(pangaeaInfo ?? {}),
          ...(copernicusInfo ?? {}),
          ...(gebcoInfo ?? {}),
          ...(sarInfo ?? {}),
          id: props.id || props.FID || props.name || `${rawLayerId}-${Date.now()}`,
          name:
            pangaeaInfo?.name ||
            copernicusInfo?.name ||
            gebcoInfo?.name ||
            sarInfo?.name ||
            props.common_name_es ||
            props.name ||
            props.common_name ||
            props.scientific_name ||
            props.species ||
            props.facility ||
            props.title ||
            props.station ||
            props.Polluting_Country ||
            def?.name ||
            'Entidad Cartográfica AMOH',
          entityType: rawLayerId.toUpperCase(),
          latitude: lat,
          longitude: lon,
          lat,
          lon,
          layerId: rawLayerId,
          source: def?.source?.attribution || 'AMOH Polar Observatory',
        };

        window.dispatchEvent(new CustomEvent('amoh:select-object', { detail: payload }));
      }
    };

    let mouseMoveRaf: number | null = null;
    const handleMouseMove = (e: any) => {
      if (mouseMoveRaf) cancelAnimationFrame(mouseMoveRaf);
      mouseMoveRaf = requestAnimationFrame(() => {
        if (!map || isDisposed) return;
        const allLayers = map.getStyle()?.layers || [];
        const amohLayerIds = allLayers
          .filter((l) => l.id.startsWith('amoh-layer-'))
          .map((l) => l.id);
        if (amohLayerIds.length === 0) {
          map.getCanvas().style.cursor = '';
          return;
        }

        const bbox: [[number, number], [number, number]] = [
          [e.point.x - 8, e.point.y - 8],
          [e.point.x + 8, e.point.y + 8],
        ];
        const features = map.queryRenderedFeatures(bbox, { layers: amohLayerIds });
        map.getCanvas().style.cursor = features && features.length > 0 ? 'pointer' : '';
      });
    };

    map.on('click', handleMapClick);
    map.on('mousemove', handleMouseMove);

    return () => {
      isDisposed = true;
      map.off('load', syncLayers);
      if (mouseMoveRaf) cancelAnimationFrame(mouseMoveRaf);
      map.off('click', handleMapClick);
      map.off('mousemove', handleMouseMove);
    };
  }, [map, activeLayers, layerOpacities]);
}
