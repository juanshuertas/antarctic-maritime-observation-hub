/**
 * AMOH — Central Provider Registry
 * Authoritative catalogue of all upstream scientific, maritime,
 * atmospheric, and space data providers. NO SECRETS OR PRIVATE KEYS.
 */

export type ProviderDomain =
  | 'maritime'
  | 'aviation'
  | 'space'
  | 'fisheries'
  | 'atmosphere'
  | 'ocean'
  | 'cryosphere'
  | 'biodiversity'
  | 'radioactivity'
  | 'seismology'
  | 'infrastructure'
  | 'governance';

export type ProviderFreshness =
  | 'LIVE'
  | 'RECENT'
  | 'DELAYED'
  | 'FORECAST'
  | 'MODELLED'
  | 'REANALYSIS'
  | 'PROPAGATED'
  | 'HISTORICAL'
  | 'MEASURED'
  | 'OFFLINE';

export interface ProviderDefinition {
  id: string;
  name: string;
  domain: ProviderDomain;
  website: string;
  documentation: string;
  dataset: string;
  freshness: ProviderFreshness;
  authType: 'API_KEY' | 'BEARER_TOKEN' | 'OPEN_ACCESS' | 'NONE';
  backendOnly: boolean;
  supportsBBox: boolean;
  supportsTime: boolean;
  attribution: string;
  license: string;
  citationNotes: string;
  description: string;
}

export const PROVIDER_REGISTRY: ProviderDefinition[] = [
  {
    id: 'aisstream',
    name: 'AISStream',
    domain: 'maritime',
    website: 'https://aisstream.io',
    documentation: 'https://aisstream.io/documentation',
    dataset: 'Real-Time Global Automatic Identification System (Class A/B)',
    freshness: 'LIVE',
    authType: 'API_KEY',
    backendOnly: true,
    supportsBBox: true,
    supportsTime: false,
    attribution: 'AISStream.io / Coastal Transponders & Satellite AIS',
    license: 'AISStream Terms of Service',
    citationNotes: 'Near-real-time polar vessel telemetry aggregated by AMOH server backend.',
    description: 'Live broadcast transponder feed for maritime traffic south of 50°S.',
  },
  {
    id: 'gfw',
    name: 'Global Fishing Watch',
    domain: 'fisheries',
    website: 'https://globalfishingwatch.org',
    documentation: 'https://globalfishingwatch.org/our-apis/documentation-v3',
    dataset: 'Apparent Fishing Effort & Vessel Identity (v3 Gateway)',
    freshness: 'DELAYED',
    authType: 'BEARER_TOKEN',
    backendOnly: true,
    supportsBBox: true,
    supportsTime: true,
    attribution: 'Global Fishing Watch / CCAMLR Validated Data',
    license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    citationNotes: 'Delayed analytical fishing effort and encounter events in the Southern Ocean.',
    description: 'Machine-learning detected fishing vessel activities, long-term effort grids, and loitering events.',
  },
  {
    id: 'copernicus_cds',
    name: 'Copernicus Climate Data Store (CDS)',
    domain: 'atmosphere',
    website: 'https://cds.climate.copernicus.eu',
    documentation: 'https://cds.climate.copernicus.eu/api-how-to',
    dataset: 'ERA5 Global Reanalysis & Seasonal Climate Projections',
    freshness: 'REANALYSIS',
    authType: 'API_KEY',
    backendOnly: true,
    supportsBBox: true,
    supportsTime: true,
    attribution: 'ECMWF / Copernicus Climate Change Service (C3S)',
    license: 'Copernicus Open Access Licence',
    citationNotes: 'Hersbach et al. (2020) ERA5 global reanalysis hourly/monthly surface fields.',
    description: 'High-resolution atmospheric reanalysis including 10m wind, 2m temperature, mean sea level pressure.',
  },
  {
    id: 'aviationstack',
    name: 'Aviationstack',
    domain: 'aviation',
    website: 'https://aviationstack.com',
    documentation: 'https://aviationstack.com/documentation',
    dataset: 'Global Flight Radar & Commercial Tracking Telemetry',
    freshness: 'RECENT',
    authType: 'API_KEY',
    backendOnly: true,
    supportsBBox: true,
    supportsTime: false,
    attribution: 'Aviationstack / ADS-B Gateway Networks',
    license: 'Commercial API Licence',
    citationNotes: 'Monitors polar gateway airports (USH, PUQ, CHC, HBA, CPT) and intercontinental Antarctic logistics.',
    description: 'Live and recent flights connecting South American and Austral polar gateways to Antarctica.',
  },
  {
    id: 'nasa_gibs',
    name: 'NASA GIBS',
    domain: 'cryosphere',
    website: 'https://gibs.earthdata.nasa.gov',
    documentation: 'https://wiki.earthdata.nasa.gov/display/GIBS',
    dataset: 'VIIRS SNPP & MODIS Terra Corrected Reflectance (EPSG:3857)',
    freshness: 'RECENT',
    authType: 'OPEN_ACCESS',
    backendOnly: false,
    supportsBBox: true,
    supportsTime: true,
    attribution: 'NASA EOSDIS Global Imagery Browse Services (GIBS)',
    license: 'NASA Open Data Policy (Free & Open)',
    citationNotes: 'Near-daily 250m true-color remote-sensing satellite imagery over Antarctica.',
    description: 'Near-real-time optical imagery from polar-orbiting satellites showing sea ice and weather fronts.',
  },
  {
    id: 'celestrak',
    name: 'CelesTrak / Space-Track',
    domain: 'space',
    website: 'https://celestrak.org',
    documentation: 'https://celestrak.org/NORAD/documentation',
    dataset: 'General Perturbations (GP) Two-Line Element (TLE) Sets',
    freshness: 'PROPAGATED',
    authType: 'OPEN_ACCESS',
    backendOnly: true,
    supportsBBox: false,
    supportsTime: true,
    attribution: 'CelesTrak / Dr. T.S. Kelso & US Space Command',
    license: 'Public Domain / Free Research Access',
    citationNotes: 'SGP4 orbital propagation calculated server-side for polar scientific and weather satellites.',
    description: 'Real-time orbital tracking for Sentinel, Landsat, NOAA, MetOp, and ICESat-2 overflights.',
  },
  {
    id: 'iaea_maris',
    name: 'IAEA MARIS',
    domain: 'radioactivity',
    website: 'https://maris.iaea.org',
    documentation: 'https://maris.iaea.org/explore',
    dataset: 'Marine Radioactivity Information System (Seawater, Biota, Sediment)',
    freshness: 'MEASURED',
    authType: 'OPEN_ACCESS',
    backendOnly: true,
    supportsBBox: true,
    supportsTime: true,
    attribution: 'International Atomic Energy Agency (IAEA) Marine Environment Laboratories',
    license: 'IAEA Open Access Terms of Use',
    citationNotes: 'Harmonized radionuclides: Cs-137, Sr-90, Pu-239/240, H-3 baseline and nuclear legacy monitoring.',
    description: 'Global benchmark repository of marine radioactivity observations in Southern and Antarctic waters.',
  },
  {
    id: 'obis',
    name: 'OBIS (Ocean Biodiversity Information System)',
    domain: 'biodiversity',
    website: 'https://obis.org',
    documentation: 'https://api.obis.org',
    dataset: 'Southern Ocean Marine Biodiversity Occurrences & Taxa Records',
    freshness: 'HISTORICAL',
    authType: 'OPEN_ACCESS',
    backendOnly: true,
    supportsBBox: true,
    supportsTime: true,
    attribution: 'IOC-UNESCO Ocean Biodiversity Information System (OBIS)',
    license: 'Creative Commons Attribution (CC BY) / CC0',
    citationNotes: 'Taxonomic occurrences for Euphausia superba, Dissostichus mawsoni, and marine mammals.',
    description: 'Comprehensive global marine species distribution records in the Southern Ocean.',
  },
  {
    id: 'usgs_fdsn',
    name: 'USGS Earthquake Hazards Program',
    domain: 'seismology',
    website: 'https://earthquake.usgs.gov',
    documentation: 'https://earthquake.usgs.gov/fdsnws/event/1',
    dataset: 'ANSS Comprehensive Earthquake Catalog (ComCat) FDSNWS Event Feed',
    freshness: 'RECENT',
    authType: 'OPEN_ACCESS',
    backendOnly: true,
    supportsBBox: true,
    supportsTime: true,
    attribution: 'U.S. Geological Survey (USGS)',
    license: 'Public Domain (U.S. Government Work)',
    citationNotes: 'Real-time seismic events filtered for the Scotia Arc, South Sandwich Trench, and Antarctic Ridge.',
    description: 'Automated and reviewed seismic events with magnitude, hypocenter depth, and review state.',
  },
  {
    id: 'surie',
    name: 'SURIE / DIMAR',
    domain: 'governance',
    website: 'https://surie.maps.arcgis.com',
    documentation: 'https://surie.maps.arcgis.com/apps/mapviewer/index.html?webmap=de8bb6821bf148649f1e7b9154592a97',
    dataset: 'Sistema Unificado de Registro de Información Estratégica (WebMap de8bb6821bf148649f1e7b9154592a97)',
    freshness: 'RECENT',
    authType: 'OPEN_ACCESS',
    backendOnly: false,
    supportsBBox: false,
    supportsTime: false,
    attribution: 'Dirección General Marítima (DIMAR) / SURIE Colombia',
    license: 'Institutional Access / ArcIMS Service Terms',
    citationNotes: 'Strategic maritime situational registry and Antarctic geopolitical monitoring cartography.',
    description: 'ArcGIS Online WebMap integration for strategic and operational maritime analysis.',
  },
  // ── Radar de apertura sintética (SAR) · integrados 2026-11-14 ──
  // Lo que entra al mapa son METADATOS DE ADQUISICIÓN: dónde miró el radar,
  // cuándo, en qué banda y cómo pedir la escena. No entra lo que el radar
  // midió; eso exige descargar y procesar. Límites de la cosecha y recuento
  // completo: src/lib/olea-sar-layers.ts
  {
    id: 'asf_daac',
    name: 'NASA ASF DAAC — Vertex',
    domain: 'space',
    website: 'https://search.asf.alaska.edu/',
    documentation: 'https://docs.asf.alaska.edu/api/basics/',
    dataset: 'ASF Search API — catálogo de gránulos SAR (NISAR, Sentinel-1, ALOS PALSAR)',
    freshness: 'RECENT',
    authType: 'OPEN_ACCESS',
    backendOnly: false,
    supportsBBox: true,
    supportsTime: true,
    attribution: 'Alaska Satellite Facility DAAC — NASA EOSDIS, proyecto ESDIS',
    license: 'Metadatos de acceso abierto; descargar escenas exige cuenta Earthdata, gratuita',
    citationNotes:
      'Origen de las cinco capas sar_* del observatorio. Cosecha 2026-11-14 sobre 70–55° O, 68–54° S. ' +
      'El API no tiene paginación por desplazamiento: se recorre partiendo el rango temporal.',
    description:
      'Archivo de la NASA para datos de radar. Devuelve huella, fecha, órbita y polarización sin credenciales.',
  },
  {
    id: 'nisar',
    name: 'NISAR (NASA / ISRO)',
    domain: 'space',
    website: 'https://nisar.jpl.nasa.gov/',
    documentation: 'https://nisar-docs.asf.alaska.edu/',
    dataset: 'NISAR L2 GCOV — 1.423 adquisiciones sobre la Península y el Drake (18-oct-2025 a 5-nov-2026)',
    freshness: 'RECENT',
    authType: 'OPEN_ACCESS',
    backendOnly: false,
    supportsBBox: true,
    supportsTime: true,
    attribution: 'NISAR (NASA-ISRO SAR Mission) — NASA/JPL-Caltech e ISRO, distribuido por el ASF DAAC',
    license: 'Datos NASA de uso libre — citar la misión y el DAAC',
    citationNotes:
      'Banda L, 24 trazas orbitales. Solo 89 de las 1.423 son producto validado: 1.084 son provisionales ' +
      'y 250 beta, y la madurez va en la ficha de cada huella. 269 son observación conjunta con el S-SAR de ISRO.',
    description:
      'Primer año operativo del radar de banda L de NASA e ISRO. Cubre el 74 % de las celdas de la caja.',
  },
  {
    id: 'sentinel1_asf',
    name: 'Copernicus Sentinel-1',
    domain: 'space',
    website: 'https://sentiwiki.copernicus.eu/web/s1-mission',
    documentation: 'https://docs.asf.alaska.edu/datasets/Sentinel-1/',
    dataset: 'Sentinel-1 GRD alta resolución — 3.212 escenas (1-nov-2014 a 11-nov-2026)',
    freshness: 'RECENT',
    authType: 'OPEN_ACCESS',
    backendOnly: false,
    supportsBBox: true,
    supportsTime: true,
    attribution:
      'Datos Copernicus modificados 2014-2026, propiedad de la Unión Europea / ESA. Distribuidos por el ASF DAAC',
    license: 'Copernicus — libre y abierto, con la cláusula de «datos modificados»',
    citationNotes:
      'Banda C, cuatro satélites (S1A, S1B, S1C, S1D). HH+HV corresponde al modo EW de barrido ancho sobre ' +
      'hielo marino; VV+VH a las franjas IW sobre tierra y costa. Doce años continuos: el único de los tres ' +
      'archivos que permite seguir un ciclo estacional repetido.',
    description: 'Serie C-band más larga de la zona, y la que sostiene el seguimiento operativo del hielo.',
  },
  {
    id: 'alos_palsar',
    name: 'ALOS PALSAR (JAXA / METI)',
    domain: 'space',
    website: 'https://www.eorc.jaxa.jp/ALOS/en/about/palsar.htm',
    documentation: 'https://docs.asf.alaska.edu/datasets/ALOS_PALSAR/',
    dataset: 'ALOS PALSAR L1.5 — 10.565 escenas (17-may-2006 a 20-abr-2011)',
    freshness: 'HISTORICAL',
    authType: 'OPEN_ACCESS',
    backendOnly: false,
    supportsBBox: true,
    supportsTime: true,
    attribution: '(c) JAXA / METI. Distribuido por el ASF DAAC bajo acuerdo con JAXA',
    license: 'JAXA/METI vía ASF — citar a ambos; restricciones de redistribución del producto original',
    citationNotes:
      'Banda L, como NISAR, lo que lo convierte en la línea base de quince años atrás para comparar. ' +
      'Es el único de los tres archivos que cubre TODAS las celdas de la caja, con un mínimo de 15 pasadas.',
    description: 'Archivo histórico de banda L, 2006-2011. Solo alimenta la rejilla de cobertura, no una capa propia.',
  },
  {
    id: 'csa_rcm',
    name: 'RADARSAT Constellation Mission (CSA)',
    domain: 'space',
    website: 'https://donnees-data.asc-csa.gc.ca/en/dataset/rcm',
    documentation: 'https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial',
    dataset: 'RCM3_OK1050586_PK1050588_3_SC30MCPB_20200124_083635_CH_CV (GRD, SLC y MLC)',
    freshness: 'HISTORICAL',
    authType: 'OPEN_ACCESS',
    backendOnly: false,
    supportsBBox: false,
    supportsTime: false,
    attribution:
      '(c) Gobierno de Canadá / Agencia Espacial Canadiense (ASC-CSA) 2020 — Open Government Licence Canada',
    license: 'Open Government Licence - Canada',
    citationNotes:
      'Constelación de tres satélites en banda C para vigilancia marítima, gestión de desastres y ecosistemas. ' +
      'La CSA publica en abierto UNA sola adquisición sobre la Antártida, la del 24-ene-2020; el resto del ' +
      'archivo pasa por EODMS con cuenta y restricciones de distribución.',
    description:
      'Escena de polarimetría compacta CH+CV, ScanSAR 30 m, 148 × 132 km sobre la costa oeste de la Península.',
  },
  {
    id: 'conae_saocom',
    name: 'SAOCOM (CONAE, Argentina)',
    domain: 'space',
    website: 'https://catalogos.conae.gov.ar/catalogo/catalogoSatSaocomInfo.html',
    documentation: 'https://www.argentina.gob.ar/noticias/la-informacion-saocom-cada-vez-mas-accesible',
    dataset: 'Catálogo SAOCOM 1A / 1B — NO integrado',
    freshness: 'OFFLINE',
    authType: 'NONE',
    backendOnly: false,
    supportsBBox: false,
    supportsTime: false,
    attribution: 'CONAE — Comisión Nacional de Actividades Espaciales, Argentina',
    license: 'Requiere alta de perfil ONE CLICK en el catálogo de CONAE',
    citationNotes:
      'Los únicos SAR de banda L operados desde Latinoamérica, y la referencia regional más cercana a NISAR. ' +
      'El catálogo exige registro y no expone un API público, así que SAOCOM NO está contado en la rejilla ' +
      'de cobertura: una celda marcada «sin pasadas» puede tener escenas de SAOCOM que este mapa no ve.',
    description: 'Pendiente de integrar. Figura aquí para que el hueco quede declarado, no escondido.',
  },
];
