import type { FeatureCollection, Point, Polygon } from 'geojson';

/**
 * AMOH V6 — Gateway Offshore Energy Infrastructure (Context Layer)
 *
 * LEGAL COMPLIANCE MANDATE:
 * Under Article 7 of the Protocol on Environmental Protection to the Antarctic Treaty (Madrid Protocol, 1991):
 * "Any activity relating to mineral resources, other than scientific research, shall be prohibited."
 *
 * CONSEQUENTLY:
 * Strictly ZERO commercial oil/gas extraction exists or is rendered south of 60°S.
 * This layer renders verified extraction infrastructure ONLY in adjacent gateway margins:
 * - Austral / Magallanes Basin (Chile / Argentina gateway margin)
 * - Bass Strait / Otway Basin (Australia / Tasmania gateway margin)
 * - Taranaki Basin (New Zealand gateway margin)
 * - South Africa Southern Offshore Margin (Cape Town gateway)
 *
 * Data source: Global Energy Monitor (Global Oil & Gas Extraction Tracker / GOGET)
 */

export interface OffshoreEnergyProperties {
  id: string;
  name: string;
  basin: string;
  country: string;
  gatewayRegion: string;
  fuelType: 'gas' | 'oil' | 'gas_condensate';
  status: 'operating' | 'development' | 'discovered' | 'decommissioned';
  operator: string;
  startYear?: number;
  waterDepthMeters?: number;
  lat: number;
  lon: number;
  treatyComplianceNotice: string;
  source: string;
}

export const GATEWAY_OFFSHORE_ENERGY: FeatureCollection<Point | Polygon, OffshoreEnergyProperties> = {
  type: 'FeatureCollection',
  features: [
    // ----------------------------------------------------
    // 1. AUSTRAL / MAGALLANES BASIN (CHILE / ARGENTINA)
    // ----------------------------------------------------
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-68.25, -52.65] }, // Magallanes Mouth
      properties: {
        id: 'platform-poseidon-magallanes',
        name: 'Plataforma Poseidón (Cuenca Austral)',
        basin: 'Cuenca Austral / Magallanes',
        country: 'Argentina / Chile Gateway Margin',
        gatewayRegion: 'Puerta Austral (Punta Arenas / Río Grande)',
        fuelType: 'gas',
        status: 'operating',
        operator: 'TotalEnergies / Wintershall Dea',
        startYear: 2016,
        waterDepthMeters: 45,
        lat: -52.65,
        lon: -68.25,
        treatyComplianceNotice: 'Ubicada al norte del paralelo 60°S (52°39′ S). Cumple plenamente con el Art. 7 del Protocolo de Madrid.',
        source: 'Global Oil and Gas Extraction Tracker (GEM GOGET)',
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-67.9, -53.4] }, // Fénix Project
      properties: {
        id: 'platform-fenix-austral',
        name: 'Proyecto Gasífero Offshore Fénix',
        basin: 'Cuenca Marina Austral 1 (CMA-1)',
        country: 'Argentina Gateway Margin',
        gatewayRegion: 'Tierra del Fuego (60 km offshore)',
        fuelType: 'gas',
        status: 'development',
        operator: 'TotalEnergies Austral',
        startYear: 2025,
        waterDepthMeters: 70,
        lat: -53.4,
        lon: -67.9,
        treatyComplianceNotice: 'Margen continental subantártico (53°24′ S). Fuera del área de aplicación del Tratado Antártico (60°S).',
        source: 'Secretaría de Energía / GEM GOGET',
      },
    },

    // ----------------------------------------------------
    // 2. BASS STRAIT & OTWAY BASIN (AUSTRALIA / HOBART GATEWAY)
    // ----------------------------------------------------
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [147.8, -38.4] }, // Gippsland Basin
      properties: {
        id: 'platform-marlin-bass-strait',
        name: 'Complejo Offshore Marlin & Barracouta',
        basin: 'Gippsland Basin / Bass Strait',
        country: 'Australia Gateway Margin',
        gatewayRegion: 'Estrecho de Bass (Ruta logística hacia Hobart)',
        fuelType: 'oil',
        status: 'operating',
        operator: 'Esso Australia / Woodside Energy',
        startYear: 1969,
        waterDepthMeters: 52,
        lat: -38.4,
        lon: 147.8,
        treatyComplianceNotice: 'Nodo de hidrocarburos de Australia continental (38°24′ S). Contexto logístico de la flota polar australiana.',
        source: 'NOPTA / Global Oil and Gas Extraction Tracker',
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [142.9, -38.9] }, // Otway Basin
      properties: {
        id: 'platform-thylacine-otway',
        name: 'Plataforma No Tripulada Thylacine',
        basin: 'Otway Basin',
        country: 'Australia Gateway Margin',
        gatewayRegion: 'Margen Sur de Victoria',
        fuelType: 'gas',
        status: 'operating',
        operator: 'Beach Energy',
        startYear: 2006,
        waterDepthMeters: 100,
        lat: -38.9,
        lon: 142.9,
        treatyComplianceNotice: 'Infraestructura de gas del margen continental suraustraliano (38°54′ S).',
        source: 'NOPSEMA Offshore Registry',
      },
    },

    // ----------------------------------------------------
    // 3. TARANAKI BASIN (NEW ZEALAND / CHRISTCHURCH GATEWAY)
    // ----------------------------------------------------
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [173.35, -39.6] }, // Maui Field
      properties: {
        id: 'platform-maui-a-taranaki',
        name: 'Plataforma Offshore Māui-A',
        basin: 'Taranaki Basin',
        country: 'Nueva Zelanda Gateway Margin',
        gatewayRegion: 'Costa Oeste NZ (Gateway Mar de Ross)',
        fuelType: 'gas_condensate',
        status: 'operating',
        operator: 'OMV New Zealand',
        startYear: 1979,
        waterDepthMeters: 110,
        lat: -39.6,
        lon: 173.35,
        treatyComplianceNotice: 'Plataforma continental neozelandesa (39°36′ S). No hay exploración al sur del paralelo 60°S.',
        source: 'New Zealand Petroleum & Minerals (NZP&M)',
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [173.8, -40.1] }, // Pohokura Field
      properties: {
        id: 'platform-pohokura-nz',
        name: 'Campo Gasífero Pohokura Offshore',
        basin: 'Taranaki Basin',
        country: 'Nueva Zelanda Gateway Margin',
        gatewayRegion: 'Margen Neozelandés',
        fuelType: 'gas',
        status: 'operating',
        operator: 'OMV New Zealand',
        startYear: 2006,
        waterDepthMeters: 35,
        lat: -40.1,
        lon: 173.8,
        treatyComplianceNotice: 'Zona económica exclusiva de Nueva Zelanda (40°06′ S).',
        source: 'GEM Global Oil & Gas Extraction Tracker',
      },
    },

    // ----------------------------------------------------
    // 4. SOUTH AFRICA SOUTHERN MARGIN (CAPE TOWN GATEWAY)
    // ----------------------------------------------------
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [22.4, -34.9] }, // Bredasdorp Basin
      properties: {
        id: 'platform-fa-mossel-bay',
        name: 'Plataforma Offshore F-A (Mossel Bay)',
        basin: 'Bredasdorp Basin / Agulhas Margin',
        country: 'Sudáfrica Gateway Margin',
        gatewayRegion: 'Margen Sur de Sudáfrica (Gateway Ciudad del Cabo)',
        fuelType: 'gas',
        status: 'operating',
        operator: 'PetroSA',
        startYear: 1992,
        waterDepthMeters: 105,
        lat: -34.9,
        lon: 22.4,
        treatyComplianceNotice: 'Aguas del Océano Índico/Atlántico sudafricano (34°54′ S). Hub de abastecimiento hacia bases Dronning Maud Land.',
        source: 'Petroleum Agency SA (PASA)',
      },
    },
  ],
};
