/**
 * AMOH V9 — Satellite Style with Polar Hole Mitigation
 * Uses NASA GIBS EPSG:4326 / EPSG:3857 Corrected Reflectance with South Pole ice cap infill (#e8f0f5).
 */

import type { StyleSpecification } from 'maplibre-gl';

const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
void yesterday; // reservado: se conserva sin uso por ahora (corrección TS6133 sin cambiar comportamiento)

export const SATELLITE_POLAR_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'satellite-world': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri World Imagery',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'bg-ocean',
      type: 'background',
      paint: {
        'background-color': '#030b14',
      },
    },
    {
      id: 'sat-raster',
      type: 'raster',
      source: 'satellite-world',
      paint: {
        'raster-opacity': 1.0,
      },
    },
  ],
};
