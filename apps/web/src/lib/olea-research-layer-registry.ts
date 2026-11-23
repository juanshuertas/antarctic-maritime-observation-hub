// OLEA_RESEARCH_V2 — additive registry overlay for canonical research layers.
import type { LayerDefinition } from './layer-registry';

export const OLEA_RESEARCH_LAYER_REGISTRY: Record<string, LayerDefinition> = {
  khalifa_ml_exploratory_cpu: {
    id: 'khalifa_ml_exploratory_cpu',
    name: 'Espesor sedimentario estimado · Modelo exploratorio en CPU',
    category: 'GEOFÍSICA MARINA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/khalifa_ml_exploratory_cpu.geojson',
      attribution: 'OLEA · Lindeque / AntGG2021 / ADMAP‑2 · Estimación exploratoria en CPU',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 5, 4, 8, 6],
      'circle-color': [
        'interpolate', ['linear'], ['get', 'predicted_m'],
        0, '#440154', 1000, '#3b528b', 2500, '#21918c', 4500, '#5ec962', 8000, '#fde725',
      ],
      'circle-stroke-width': 0.5,
      'circle-stroke-color': '#e2e8f0',
    },
  },
  lindeque_sediment_reference: {
    id: 'lindeque_sediment_reference',
    name: 'Lindeque 2016 · Espesor sedimentario compilado',
    category: 'GEOFÍSICA MARINA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/lindeque_sediment_reference.geojson',
      attribution: 'Lindeque et al. (2016) · doi:10.1594/PANGAEA.864906 · CC-BY-3.0',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 1.5, 5, 3, 8, 5],
      'circle-color': [
        'interpolate', ['linear'], ['get', 'thickness_m'],
        0, '#440154', 1000, '#3b528b', 2500, '#21918c', 4500, '#5ec962', 8000, '#fde725',
      ],
      'circle-opacity': 0.86,
      'circle-stroke-width': 0.4,
      'circle-stroke-color': '#e2e8f0',
    },
  },
  maris_radionuclides: {
    id: 'maris_radionuclides',
    name: 'IAEA MARIS — Mediciones Radiológicas Marinas',
    category: 'AMBIENTE · TRAZADORES',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/maris_antarctic_measurements.geojson',
      attribution: 'IAEA MARIS · OLEA normalized Antarctic extract',
    },
    paint: {
      'circle-radius': 4,
      'circle-color': '#f59e0b',
      'circle-opacity': 0.72,
      'circle-stroke-width': 0.8,
      'circle-stroke-color': '#fff7ed',
    },
  },

  khalifa_sediment_thickness: {
    id: 'khalifa_sediment_thickness',
    name: 'Demostración sintética · Espesor sedimentario ML',
    category: 'TIERRA FISICA & GEOFISICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Keep this published fixture separate from exploratory pipeline runs.
      url: '/data/web/geojson/khalifa_sediment_thickness.geojson',
      attribution: 'OLEA · Datos sintéticos de prueba',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.6, 5, 4.4, 8, 6.4],
      // Rampa secuencial (viridis) sobre metros predichos. Secuencial, no
      // divergente: el espesor es una magnitud sin punto neutro, y una
      // rampa divergente inventaria un cero significativo que no existe.
      // Cortes redondos en metros para que la leyenda se lea sola y no
      // cambien si cambian los datos.
      'circle-color': [
        'interpolate', ['linear'], ['get', 'predicted_m'],
        0, '#440154',
        1000, '#3b528b',
        2500, '#21918c',
        4500, '#5ec962',
        7000, '#fde725',
      ],
      'circle-opacity': 0.88,
      'circle-stroke-width': 0.3,
      'circle-stroke-color': '#e2e8f0',
    },
  },

  antgg_gravity_anomaly: {
    id: 'antgg_gravity_anomaly',
    name: 'AntGG2021 — Anomalía de Gravedad',
    category: 'TIERRA FÍSICA & GEOFÍSICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/antgg_gravity_anomaly.geojson',
      attribution: 'IAG AntGG / PANGAEA · CC-BY-4.0',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.7, 5, 4.3, 8, 6.2],
      'circle-color': ["interpolate", ["linear"], ["get", "gravity_anomaly_mgal"], -68.469061, "#25377f", -22.700624, "#58a9d4", -7.717007, "#f7f7f7", 9.820899, "#e89a7e", 70.338241, "#9d2137"],
      'circle-opacity': 0.90,
      'circle-stroke-width': 0.25,
      'circle-stroke-color': '#ebf4fb',
    },
  },

  antgg_bouguer_anomaly: {
    id: 'antgg_bouguer_anomaly',
    name: 'AntGG2021 — Anomalía de Bouguer',
    category: 'TIERRA FÍSICA & GEOFÍSICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/antgg_bouguer_anomaly.geojson',
      attribution: 'IAG AntGG / PANGAEA · CC-BY-4.0',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.7, 5, 4.3, 8, 6.2],
      'circle-color': ["interpolate", ["linear"], ["get", "bouguer_anomaly_mgal"], -457.337312, "#25377f", -317.85464, "#58a9d4", -117.675659, "#f7f7f7", 19.159877, "#e89a7e", 167.177949, "#9d2137"],
      'circle-opacity': 0.90,
      'circle-stroke-width': 0.25,
      'circle-stroke-color': '#ebf4fb',
    },
  },

  admap2b_magnetic_anomaly: {
    id: 'admap2b_magnetic_anomaly',
    name: 'ADMAP2B — Anomalía Magnética Observada',
    category: 'TIERRA FÍSICA & GEOFÍSICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/admap2b_magnetic_anomaly.geojson',
      attribution: 'SCAR ADMAP / PANGAEA · CC-BY-4.0',
    },
    paint: {
      'circle-radius': 2,
      'circle-color': ['interpolate', ['linear'], ['get', 'magnetic_anomaly_nt'], -500, '#172554', 0, '#f8fafc', 500, '#7f1d1d'],
      'circle-opacity': 0.65,
    },
  },

  admap2s_magnetic_anomaly: {
    id: 'admap2s_magnetic_anomaly',
    name: 'ADMAP2S — Anomalía Magnética + Gap-Fill',
    category: 'TIERRA FÍSICA & GEOFÍSICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/admap2s_magnetic_anomaly.geojson',
      attribution: 'SCAR ADMAP / PANGAEA · CC-BY-4.0',
    },
    paint: {
      'circle-radius': 1.8,
      'circle-color': ['interpolate', ['linear'], ['get', 'magnetic_anomaly_nt'], -500, '#1e1b4b', 0, '#e0f2fe', 500, '#9f1239'],
      'circle-opacity': 0.48,
    },
  },

  live_webcams: {
    id: 'live_webcams',
    name: 'Cámaras Polares y Marítimas en Vivo',
    category: 'OBSERVACIONES & EVIDENCIA',
    sdg: 9,
    sdgColor: '#FD6925',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/live_webcams.geojson',
      attribution: 'Official operators / BAS · Cruising Earth is discovery only',
    },
    paint: {
      'circle-radius': 6,
      'circle-color': '#10b981',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#ffffff',
    },
  },

  research_vessel_webcams: {
    id: 'research_vessel_webcams',
    name: 'Webcams Oficiales de Buques de Investigación',
    category: 'OBSERVACIONES & EVIDENCIA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/research_vessel_webcams.geojson',
      attribution: 'British Antarctic Survey / official vessel operators',
    },
    paint: {
      'circle-radius': 7,
      'circle-color': '#22d3ee',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ecfeff',
    },
  },
  olea_antarctic_hexacorals: {
    id: 'olea_antarctic_hexacorals',
    name: 'Corales antárticos · Hexacorallia',
    category: 'ECOLOGÍA & BIODIVERSIDAD',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: { type: 'geojson', url: '/data/web/geojson/antarctic_hexacorals.geojson', attribution: 'SCAR AntOBIS / OBIS (CC-BY-4.0)' },
    paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3, 7, 6], 'circle-color': '#e8a9dc', 'circle-opacity': 0.85, 'circle-stroke-width': 0.7, 'circle-stroke-color': '#6b255f' },
  },

  olea_antarctic_stylasteridae: {
    id: 'olea_antarctic_stylasteridae',
    name: 'Corales antárticos · Stylasteridae',
    category: 'ECOLOGÍA & BIODIVERSIDAD',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: { type: 'geojson', url: '/data/web/geojson/antarctic_stylasteridae.geojson', attribution: 'SCAR AntOBIS / OBIS (CC-BY-4.0)' },
    paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3, 7, 6], 'circle-color': '#e8a9dc', 'circle-opacity': 0.85, 'circle-stroke-width': 0.7, 'circle-stroke-color': '#6b255f' },
  },

  olea_wap_2024_microphytoplankton: {
    id: 'olea_wap_2024_microphytoplankton',
    name: 'Microfitoplancton · estaciones 2024',
    category: 'OBSERVACIONES & EVIDENCIA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: { type: 'geojson', url: '/data/web/geojson/wap_2024_stations_verified_v3_1.geojson', attribution: 'Calderon-Valderrama et al. 2026 / study DOI 1419' },
    paint: { 'circle-radius': ['interpolate',['linear'],['zoom'],2,3.5,7,7.5], 'circle-color': ['case', ['==', ['get', 'science_role'], 'PILOT_A_GROUND_TRUTH_CANDIDATE'], ['interpolate',['linear'],['get','total_microphytoplankton_density_cells_l'], 0, '#dbeafe', 170, '#38bdf8', 620, '#c026d3'], '#94a3b8'], 'circle-opacity': 0.88, 'circle-stroke-width': 0.6, 'circle-stroke-color': '#eef2ff' },
  },

  olea_obis_icefree_antarctica: {
    id: 'olea_obis_icefree_antarctica',
    name: 'Biodiversidad terrestre · Antártida sin hielo',
    category: 'ECOLOGÍA & BIODIVERSIDAD',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: { type: 'geojson', url: '/data/web/geojson/obis_icefree_antarctica_grid.geojson', attribution: 'ANTABIF / Terauds 2025 CC-BY-4.0' },
    paint: { 'circle-radius': ['interpolate',['linear'],['get','records'],1,2.5,10,5.5,100,11], 'circle-color': '#a3e635', 'circle-opacity': 0.88, 'circle-stroke-width': 0.6, 'circle-stroke-color': '#eef2ff' },
  },


  pangaea_datasets: {
    id: 'pangaea_datasets',
    name: 'PANGAEA — Catálogo de datasets (región OLEA)',
    category: 'OBSERVACIONES & EVIDENCIA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Cosecha completa del indice georreferenciado de PANGAEA acotada a la
      // region OLEA: todo lo que intersecta lat <= -40 S mas la caja colombiana
      // (lon -84..-66 / lat -5..16). 62.356 datasets de los 440.044
      // georreferenciados que publica PANGAEA en total.
      // La posicion es meanPosition, el CENTROIDE del dataset: para los 19.930
      // registros de extension (propiedad b) el punto no es una estacion de
      // muestreo sino el centro de una caja que puede medir miles de km.
      // Dibujarlos como puntos de medicion seria una afirmacion falsa; de ahi
      // que el popup declare la extension cuando existe.
      // Regenerar con data/pangaea/build_pangaea.py
      url: '/data/web/geojson/pangaea_datasets.geojson',
      attribution:
        'PANGAEA Data Publisher for Earth & Environmental Science (AWI/MARUM) · ' +
        'metadatos cosechados 2026-11-03 · la mayoria de datasets CC-BY · ' +
        'los derechos son de los autores originales: citar el DOI del dataset, no esta capa',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 1.4, 5, 2.6, 8, 4.5],
      // Rampa secuencial sobre el anio de publicacion: la lectura principal de
      // esta capa es DONDE hay registro, y el color anade CUANDO se publico.
      // Secuencial de una sola familia (azul profundo -> cian claro) para no
      // competir con las rampas divergentes de geofisica ni con el viridis de
      // espesor sedimentario. Claro = reciente.
      'circle-color': [
        'interpolate', ['linear'], ['coalesce', ['get', 'y'], 2000],
        1950, '#0d2b52',
        1990, '#1d6fa5',
        2005, '#3aafc9',
        2015, '#7fd8d0',
        2026, '#e8fbf5',
      ],
      'circle-opacity': 0.72,
      'circle-stroke-width': 0,
    },
  },

  pangaea_global_density: {
    id: 'pangaea_global_density',
    name: 'PANGAEA — Densidad global del archivo',
    category: 'OBSERVACIONES & EVIDENCIA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Agregado geohash precision 3 (celda ~156 km) sobre los 440.044
      // datasets georreferenciados de PANGAEA, mundo completo. El punto es el
      // CENTROIDE DE LA CELDA, no la posicion de un dataset: sirve para leer
      // cobertura y sesgo de muestreo del archivo, no para localizar nada.
      url: '/data/web/geojson/pangaea_global_density.geojson',
      attribution: 'PANGAEA (AWI/MARUM) · agregado geohash-3 · cosecha 2026-11-03',
    },
    paint: {
      // Area proporcional al conteo (radio ~ sqrt), que es lo que permite
      // comparar celdas a ojo. Interpolar el radio linealmente sobre el conteo
      // exagera las celdas densas por un factor igual al propio conteo.
      'circle-radius': [
        'interpolate', ['linear'], ['sqrt', ['get', 'c']],
        1, 1.6,
        7, 4.5,
        32, 9,
        105, 16,
      ],
      'circle-color': [
        'interpolate', ['linear'], ['sqrt', ['get', 'c']],
        1, '#14304f',
        7, '#2f7ea8',
        32, '#6fc6bd',
        105, '#f2fbf7',
      ],
      'circle-opacity': 0.6,
      'circle-stroke-width': 0,
    },
  },


  copernicus_sst_peninsula: {
    id: 'copernicus_sst_peninsula',
    name: 'CMEMS — Temperatura superficial del mar (Península)',
    category: 'OCEANOGRAFIA & FRENTES',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Subset propio del analisis global de Copernicus Marine recortado a
      // 70-55 W / 68-54 S (Peninsula Antartica + Paso de Drake), nivel 0.49 m,
      // ultimo dia disponible. Rejilla de 1/12 grados submuestreada 1 de cada
      // 2 celdas: 6.720 puntos sobre agua (las celdas de tierra se descartan).
      // Es un ANALISIS DE MODELO, no una medicion satelital ni in situ.
      // Regenerar con Training_Toolbox/olea_antartida_geojson.py
      url: '/data/web/geojson/copernicus_sst_peninsula.geojson',
      attribution:
        'E.U. Copernicus Marine Service Information · GLOBAL_ANALYSISFORECAST_PHY_001_024 ' +
        '(cmems_mod_glo_phy-thetao_anfc_0.083deg_P1D-m) · subset 2026-11-03 · analisis de modelo',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 1.8, 6, 3.6, 9, 6.5],
      // Rampa secuencial frio -> calido sobre grados Celsius. El extremo frio
      // se ancla en -1.9 C, el punto de congelacion del agua de mar a esta
      // salinidad: es un piso fisico, no el minimo que trajo el dataset, asi
      // que la leyenda no cambia cuando cambien los datos.
      'circle-color': [
        'interpolate', ['linear'], ['get', 't'],
        -1.9, '#0b1d51',
        0, '#1f6fb2',
        4, '#49b6c8',
        8, '#f0c86a',
        12.5, '#e05c3a',
      ],
      'circle-opacity': 0.78,
      'circle-stroke-width': 0,
    },
  },

  copernicus_sss_peninsula: {
    id: 'copernicus_sss_peninsula',
    name: 'CMEMS — Salinidad superficial (Península)',
    category: 'OCEANOGRAFIA & FRENTES',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Mismo subset y misma rejilla que la capa de temperatura.
      // Unidades del producto: 1e-3 (equivalente practico a PSU).
      url: '/data/web/geojson/copernicus_sss_peninsula.geojson',
      attribution:
        'E.U. Copernicus Marine Service Information · GLOBAL_ANALYSISFORECAST_PHY_001_024 ' +
        '(cmems_mod_glo_phy-so_anfc_0.083deg_P1D-m) · subset 2026-11-03 · analisis de modelo',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 1.8, 6, 3.6, 9, 6.5],
      // Secuencial de una sola familia (violeta -> rosa palido), deliberadamente
      // distinta de la rampa de temperatura para que dos campos escalares
      // encendidos a la vez no se confundan. Claro = mas salino.
      'circle-color': [
        'interpolate', ['linear'], ['get', 'p'],
        30.4, '#2a115c',
        31.5, '#5b2a8a',
        32.5, '#8f5fb5',
        33.5, '#c49bd6',
        34.5, '#ecdcf5',
      ],
      'circle-opacity': 0.78,
      'circle-stroke-width': 0,
    },
  },

  copernicus_currents_peninsula: {
    id: 'copernicus_currents_peninsula',
    name: 'CMEMS — Corrientes superficiales medidas (Península)',
    category: 'OCEANOGRAFIA & FRENTES',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // uo/vo del mismo analisis, submuestreado 1 de cada 4 celdas (1.719
      // puntos) para que los vectores no se solapen. El COLOR y el TAMANO
      // codifican solo la RAPIDEZ; el rumbo va en la propiedad `d` (grados
      // desde el norte, hacia donde fluye) y se lee en el popup: un circulo
      // no puede mostrar direccion sin mentir sobre ella.
      url: '/data/web/geojson/copernicus_currents_peninsula.geojson',
      attribution:
        'E.U. Copernicus Marine Service Information · GLOBAL_ANALYSISFORECAST_PHY_001_024 ' +
        '(cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m) · subset 2026-11-03 · analisis de modelo',
    },
    paint: {
      // Radio proporcional a la raiz de la rapidez: el area es lo que se
      // compara a ojo, y un radio lineal exagera las celdas rapidas.
      'circle-radius': [
        'interpolate', ['linear'], ['sqrt', ['get', 's']],
        0.06, 1.6,
        0.32, 3.4,
        0.71, 5.6,
        1.23, 8.5,
      ],
      'circle-color': [
        'interpolate', ['linear'], ['get', 's'],
        0, '#04372e',
        0.2, '#0d7a5f',
        0.5, '#4cc38a',
        1.0, '#b6e880',
        1.5, '#f3ffa8',
      ],
      'circle-opacity': 0.8,
      'circle-stroke-width': 0,
    },
  },

  copernicus_sea_ice_edge: {
    id: 'copernicus_sea_ice_edge',
    name: 'CMEMS/OSI SAF — Borde del hielo marino (Península)',
    category: 'CRIOSFERA',
    sdg: 13,
    sdgColor: '#3F7E44',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Contornos de concentracion de hielo al 15 % (definicion estandar de
      // borde de hielo) y al 80 % (hielo compacto), calculados sobre la
      // rejilla AMSR2 de OSI SAF del ultimo dia disponible.
      // Son LINEAS DE CONTORNO de un campo continuo, no un limite observado:
      // entre dos contornos la concentracion varia de forma continua.
      // Las celdas sin dato se tratan como 0 % para el contorno, de modo que
      // el borde dibujado puede seguir el limite del recorte y no el del hielo.
      url: '/data/web/geojson/copernicus_sea_ice_edge.geojson',
      attribution:
        'E.U. Copernicus Marine Service Information · SEAICE_GLO_SEAICE_L4_NRT_OBSERVATIONS_011_001 ' +
        '(osisaf_obs-si_glo_phy-sic-south_nrt_amsr2_l4_P1D-m) · EUMETSAT OSI SAF · subset 2026-11-03',
    },
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'pct'], 15], '#7dd3fc',
        '#f8fafc',
      ],
      'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.1, 6, 2.0, 9, 3.2],
      'line-opacity': 0.9,
    },
  },

  // ───────────────────────── BATIMETRIA ANTARTICA (2026-11-13) ─────────────────────────
  // Teselas XYZ (WebP, Web Mercator) generadas por scripts/bathymetry_tiles.py desde los
  // GeoTIFF de data/bathymetry/. Leyenda y fuente de cada juego en su tiles.json.
  // Web Mercator termina en 85,05 S: el casquete alrededor del polo no se dibuja.

  ibcso_v2_relief: {
    id: 'ibcso_v2_relief',
    name: 'IBCSO v2 — relieve del lecho marino y subglacial (500 m)',
    category: 'TIERRA FISICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'raster',
    source: {
      type: 'raster',
      // Rejilla "bed" de IBCSO v2: fondo marino y, bajo el hielo, la ROCA (no la
      // superficie del hielo). Por eso buena parte de la Antartida Occidental sale en
      // azul: su lecho esta bajo el nivel del mar. Color = elevacion (azules bajo 0 m,
      // pardos sobre 0 m) multiplicado por un sombreado con exageracion vertical x6.
      // Solo el 23,79 % del fondo esta medido; el resto es interpolado o predicho
      // (ver ibcso_v2_tid). Zoom 7 = resolucion nativa.
      url: '/data/web/tiles/ibcso_v2_relief/{z}/{x}/{y}.webp',
      tileSize: 256,
      minzoom: 0,
      maxzoom: 7,
      bounds: [-180, -85.0511, 180, -50],
      attribution: 'IBCSO v2 — Dorschel et al. 2022, doi:10.1594/PANGAEA.937574 (CC-BY-4.0)',
    },
    paint: {
      'raster-opacity': 0.92,
    },
  },

  ibcso_v2_tid: {
    id: 'ibcso_v2_tid',
    name: 'IBCSO v2 — donde el fondo esta realmente medido (TID)',
    category: 'TIERRA FISICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'raster',
    source: {
      type: 'raster',
      // Type Identifier de IBCSO: de donde sale la profundidad de cada celda.
      // Amarillo = multihaz, naranja = monohaz, rojo = sismica, crema = combinacion de
      // metodos directos (bajo el hielo, lineas de radar); violeta = predicho por
      // gravimetria; azul oscuro tenue = interpolado; gris tenue = rejilla previa.
      // Al reducir de 500 m a ~1 km una celda se marca como medida si CONTIENE alguna
      // medicion: las trazas se ven algo mas anchas de lo que son.
      url: '/data/web/tiles/ibcso_v2_tid/{z}/{x}/{y}.webp',
      tileSize: 256,
      minzoom: 0,
      maxzoom: 6,
      bounds: [-180, -85.0511, 180, -50],
      attribution: 'IBCSO v2 TID — Dorschel et al. 2022, doi:10.1594/PANGAEA.937574 (CC-BY-4.0)',
    },
    paint: {
      'raster-opacity': 0.9,
    },
  },

  gebco_2025_relief: {
    id: 'gebco_2025_relief',
    name: 'GEBCO 2025 — relieve 40–50° S (complemento de IBCSO)',
    category: 'TIERRA FISICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'raster',
    source: {
      type: 'raster',
      // El recorte de GEBCO 2025 que trae Quantarctica 4 solo tiene datos al NORTE de
      // donde cubre IBCSO: es la franja 40–50 S. Misma rampa y sombreado que
      // ibcso_v2_relief, para que las dos capas empalmen.
      url: '/data/web/tiles/gebco_2025_relief/{z}/{x}/{y}.webp',
      tileSize: 256,
      minzoom: 0,
      maxzoom: 6,
      bounds: [-180, -85.0511, 180, -40],
      attribution: 'GEBCO Compilation Group (2025) GEBCO 2025 Grid — via Quantarctica 4 (NPI)',
    },
    paint: {
      'raster-opacity': 0.92,
    },
  },

  gsfm_seafloor_geomorphology: {
    id: 'gsfm_seafloor_geomorphology',
    name: 'Geomorfologia del fondo marino (Harris GSFM)',
    category: 'TIERRA FISICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'raster',
    source: {
      type: 'raster',
      // 21 clases de Harris et al. (2014) rasterizadas a 1 km: plataforma, talud, zona
      // abisal y hadal de fondo; encima canones (magenta), montes submarinos (ambar),
      // dorsales de expansion (rojo), artesas glaciares (celeste), abanicos, mesetas...
      // Colores y etiquetas en tiles.json. Es una CLASIFICACION automatica sobre una
      // batimetria global de 2014 (SRTM30_PLUS), no un levantamiento.
      url: '/data/web/tiles/gsfm_seafloor_geomorphology/{z}/{x}/{y}.webp',
      tileSize: 256,
      minzoom: 0,
      maxzoom: 6,
      bounds: [-180, -85.0511, 180, -40],
      attribution: 'Harris et al. 2014, Geomorphology of the oceans, Marine Geology 352 — via Quantarctica 4 (NPI)',
    },
    paint: {
      'raster-opacity': 0.75,
    },
  },

  bedmap3_ice_thickness: {
    id: 'bedmap3_ice_thickness',
    name: 'Bedmap3 — espesor del hielo (500 m)',
    category: 'CRIOSFERA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'raster',
    source: {
      type: 'raster',
      // Espesor del hielo de Bedmap3, de casi blanco (hielo fino, plataformas) a azul
      // violaceo (> 3.500 m). Transparente donde no hay hielo.
      url: '/data/web/tiles/bedmap3_ice_thickness/{z}/{x}/{y}.webp',
      tileSize: 256,
      minzoom: 0,
      maxzoom: 6,
      bounds: [-180, -85.0511, 180, -60],
      attribution: 'Bedmap3 — Pritchard et al. 2025, doi:10.5285/2d0e4791-8e20-46a3-80e4-f5f6716025d2 — via Quantarctica 4 (NPI)',
    },
    paint: {
      'raster-opacity': 0.85,
    },
  },

  gebco_undersea_features: {
    id: 'gebco_undersea_features',
    name: 'GEBCO — nombres de accidentes submarinos (SCUFN)',
    category: 'TIERRA FISICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // 491 accidentes APROBADOS por SCUFN con centro al sur de 45 S (de 5.311 en
      // todo el mundo), bajados del API publico del nomenclator el 2026-11-13.
      // Reconstruir con scripts/gebco_gazetteer_build.py [--fetch].
      url: '/data/web/geojson/gebco_undersea_features.geojson',
      attribution: 'IHO-IOC GEBCO Gazetteer of Undersea Feature Names, www.gebco.net (API NOAA/NCEI)',
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 5, 4, 8, 6],
      'circle-color': [
        'match', ['get', 'type'],
        ['Seamount', 'Seamounts', 'Guyot', 'Knoll', 'Hill', 'Hills', 'Peak', 'Mounds', 'Mud Volcano', 'Caldera'], '#ffb703',
        ['Canyon', 'Canyons', 'Trough', 'Trench', 'Valley', 'Channel', 'Sea Channel', 'Deep', 'Deeps', 'Hole', 'Gap'], '#f72585',
        ['Bank', 'Banks', 'Shoal', 'Plateau', 'Rise', 'Shelf', 'Spur', 'Saddle', 'Borderland'], '#80ed99',
        ['Ridge', 'Ridges', 'Fracture Zone', 'Fracture Zone System', 'Escarpment', 'Discordance'], '#ff6b6b',
        ['Basin', 'Abyssal Plain', 'Fan', 'Slope', 'Province'], '#4cc9f0',
        '#e9ecef',
      ],
      'circle-stroke-color': '#0b132b',
      'circle-stroke-width': 1,
    },
  },

  gebco_undersea_feature_outlines: {
    id: 'gebco_undersea_feature_outlines',
    name: 'GEBCO — trazas de accidentes submarinos (SCUFN)',
    category: 'TIERRA FISICA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Geometria secundaria del nomenclator (ejes de canones y dorsales, contornos
      // de bancos y cuencas) de 291 de los 491 accidentes; los otros 200 solo
      // tienen punto. Los contornos de poligono se dibujan como linea.
      url: '/data/web/geojson/gebco_undersea_feature_outlines.geojson',
      attribution: 'IHO-IOC GEBCO Gazetteer of Undersea Feature Names, www.gebco.net (API NOAA/NCEI)',
    },
    paint: {
      'line-color': '#f1f5f9',
      'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.8, 6, 1.6, 9, 2.4],
      'line-opacity': 0.85,
    },
  },

};

/**
 * Ficha de un accidente submarino del nomenclator GEBCO: nombre con su termino
 * generico y un resumen legible de lo que el registro trae (no todos traen todo).
 */
export function describeGebcoFeature(
  props: Record<string, any> | null | undefined
): { name: string; description: string } | null {
  if (!props || !props.name) return null;
  const parts: string[] = [];
  if (props.tipo) parts.push(String(props.tipo));
  if (props.prof_min_m != null || props.prof_max_m != null) {
    const a = props.prof_min_m != null ? `${props.prof_min_m} m` : '?';
    const b = props.prof_max_m != null ? `${props.prof_max_m} m` : '?';
    parts.push(`profundidad ${a} a ${b}`);
  }
  if (props.relieve_m != null) parts.push(`relieve total ${props.relieve_m} m`);
  if (props.descubridor) parts.push(`descubierto por ${props.descubridor}${props.descubierto ? ` (${props.descubierto})` : ''}`);
  if (props.proponente) parts.push(`propuesto por ${props.proponente}${props.propuesto ? ` (${props.propuesto})` : ''}`);
  const historia = props.historia ? ` ${props.historia}` : '';
  return {
    name: String(props.name),
    description:
      `${parts.join(' · ')}.${historia} Nombre aprobado por el Subcomite de Nombres de Accidentes ` +
      `Submarinos de GEBCO (SCUFN); la posicion es la del nomenclator, no un levantamiento.`,
  };
}

/**
 * Las capas copernicus_* guardan claves de una letra (`t`, `p`, `s`, `d`) para
 * no inflar archivos de miles de puntos. Aqui se traducen a texto legible con
 * sus unidades, y se declara que son ANALISIS DE MODELO: la ficha generica
 * rotula la velocidad en nudos y no tiene casilla para un campo escalar, asi
 * que el valor viaja en `description`, que es lo que la ficha sí muestra.
 */
export function describeCopernicusFeature(
  layerId: string,
  props: Record<string, any> | null | undefined
): { name: string; description: string } | null {
  if (!props) return null;
  const num = (x: any) => (typeof x === 'number' ? x : Number(x));

  if (layerId === 'copernicus_sst_peninsula' && props.t != null) {
    const t = num(props.t);
    return {
      name: `Temperatura superficial ${t.toFixed(2)} °C`,
      description:
        `Temperatura potencial del agua a 0,49 m de profundidad: ${t.toFixed(2)} °C. ` +
        `Analisis del modelo global de Copernicus Marine a 1/12 de grado — es un modelo, ` +
        `no una medicion in situ ni satelital. El punto de congelacion del agua de mar ` +
        `a esta salinidad ronda -1,9 °C.`,
    };
  }

  if (layerId === 'copernicus_sss_peninsula' && props.p != null) {
    const p = num(props.p);
    return {
      name: `Salinidad superficial ${p.toFixed(2)}`,
      description:
        `Salinidad practica en superficie: ${p.toFixed(2)} (unidades 1e-3, equivalente practico a PSU). ` +
        `Analisis del modelo global de Copernicus Marine a 1/12 de grado. Los valores bajos ` +
        `cerca de la costa corresponden a aporte de deshielo.`,
    };
  }

  if (layerId === 'copernicus_currents_peninsula' && props.s != null) {
    const v = num(props.s);
    const d = props.d != null ? num(props.d) : null;
    return {
      name: `Corriente ${v.toFixed(3)} m/s`,
      description:
        `Rapidez de la corriente superficial: ${v.toFixed(3)} m/s` +
        (d != null ? ` · rumbo ${d.toFixed(0)}° desde el norte, HACIA donde fluye el agua` : '') +
        `. Analisis del modelo global de Copernicus Marine (uo, vo) a 1/12 de grado. ` +
        `El simbolo codifica solo la rapidez: la direccion esta en este texto, no en el mapa.`,
    };
  }

  if (layerId === 'copernicus_sea_ice_edge' && props.pct != null) {
    const pct = num(props.pct);
    const fecha = props.fecha ? ` (${props.fecha})` : '';
    return {
      name: String(props.etiqueta || `Contorno de hielo ${pct}%`),
      description:
        `Contorno de concentracion de hielo marino al ${pct} %${fecha}, sobre la rejilla AMSR2 de ` +
        `EUMETSAT OSI SAF. El 15 % es la definicion estandar de borde de hielo. Es una LINEA DE ` +
        `CONTORNO de un campo continuo, no un limite observado: entre contornos la concentracion ` +
        `varia de forma gradual. Donde el contorno sigue el borde del recorte, lo que marca es el ` +
        `limite de los datos, no el del hielo.`,
    };
  }

  return null;
}

/**
 * Vocabulario de temas de PANGAEA. La propiedad `t` de cada feature de
 * pangaea_datasets es una MASCARA DE BITS sobre este arreglo: el bit i
 * encendido significa PANGAEA_TOPIC_VOCAB[i]. Un dataset puede tener varios
 * temas, y 36.539 de los 62.356 no traen ninguno — ausencia de tema NO es
 * ausencia de contenido, es metadato no clasificado en origen.
 * El orden es parte del formato del archivo: no reordenar sin regenerar
 * el GeoJSON con data/pangaea/build_pangaea.py.
 */
export const PANGAEA_TOPIC_VOCAB = [
  'Chemistry', 'Geophysics', 'Atmosphere', 'Oceans', 'Cryosphere', 'Lithosphere',
  'Land Surface', 'Biosphere', 'Ecology', 'Biological Classification',
  'Paleontology', 'Fisheries', 'Lakes & Rivers', 'Human Dimensions', 'Agriculture',
] as const;

export interface PangaeaFeatureInfo {
  name: string;
  doi: string;
  doiUrl: string;
  pangaeaId: number;
  year?: number;
  topics?: string;
  dataPoints?: number;
  extent?: string;
  temporalCoverage?: string;
  positionKind: string;
}

/**
 * Enriquece las propiedades compactas del GeoJSON para el panel de objeto.
 * El archivo guarda claves de una letra porque 62.356 features con nombres
 * largos pesarian varios MB mas sin aportar informacion; el nombre legible y
 * el DOI se derivan aqui del id.
 */
export function describePangaeaFeature(
  props: Record<string, unknown> | null | undefined,
): PangaeaFeatureInfo | null {
  const raw = props?.i ?? props?.pangaeaId;
  const id = typeof raw === 'string' ? Number(raw) : (raw as number | undefined);
  if (!id || !Number.isFinite(id)) return null;

  const mask = Number(props?.t ?? 0);
  const topics = Number.isFinite(mask) && mask > 0
    ? PANGAEA_TOPIC_VOCAB.filter((_, i) => (mask >> i) & 1).join(', ')
    : undefined;

  const bbox = typeof props?.b === 'string' ? props.b : undefined;
  const year = Number(props?.y) || undefined;
  const npts = Number(props?.n) || undefined;

  return {
    name: `PANGAEA.${id}`,
    doi: `10.1594/PANGAEA.${id}`,
    doiUrl: `https://doi.org/10.1594/PANGAEA.${id}`,
    pangaeaId: id,
    year,
    topics,
    dataPoints: npts,
    // Declarado explicitamente: sin esto un dataset cuya caja abarca medio
    // oceano se lee como una estacion puntual.
    extent: bbox ? `caja N/S/W/E: ${bbox}` : undefined,
    temporalCoverage: typeof props?.d === 'string' ? props.d : undefined,
    positionKind: bbox ? 'centroide de extension' : 'posicion media del dataset',
  };
}
