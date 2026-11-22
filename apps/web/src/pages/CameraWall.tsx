// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Juan Sebastián Huertas Olea. All rights reserved.
// Antarctic Maritime Observation Hub (AMOH) - 1980s Ocean Surveillance Matrix

import { useState, useEffect, useMemo } from 'react';
import { 
  Globe, ShieldAlert, X, Tv, Grid3X3, 
  Volume2, VolumeX, Radio, Zap, Compass, 
  ExternalLink, Activity, Eye, 
  Sliders, Maximize2, Disc,
  Search, RotateCcw, Check, Link, SlidersHorizontal
} from 'lucide-react';
import { api } from '../lib/api';

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export interface Camera {
  camera_id: string;
  title: string;
  short_briefing?: string;
  description?: string;
  operator?: string;
  source_organization?: string;
  platform_type?: string;
  latitude: number;
  longitude: number;
  status: string;
  protocol?: string;
  public_page_url?: string;
  stream_url: string;
  thumbnail_url?: string;
  license: string;
  ocean_region?: string;
  channel_num?: number;
  frequency?: string;
  is_custom?: boolean;
  telemetry?: {
    waterTemp?: string;
    windKnots?: string;
    iceCover?: string;
    depthMeters?: string;
    signalDb?: number;
  };
}

// 16 Authentic Ocean & Polar Surveillance Feeds with real video streams
export const DEFAULT_OCEAN_CAMERAS: Camera[] = [
  {
    camera_id: 'cam_rothera_01',
    title: 'BAS Rothera Station — North Wharf & Hangar',
    short_briefing: 'Pista polar sobre hielo, témpanos flotantes a la deriva y operaciones logísticas en Marguerite Bay.',
    description: 'Estación de investigación británica en la Península Antártica. Monitorea desprendimiento de hielo marino, témpanos y operaciones aéreas Dash-7.',
    operator: 'British Antarctic Survey',
    source_organization: 'BAS / NERC (Reino Unido)',
    platform_type: 'station',
    latitude: -67.5700,
    longitude: -68.1250,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.bas.ac.uk/polar-operations/sites-and-facilities/facility/rothera/',
    stream_url: 'https://www.youtube-nocookie.com/embed/FLsz9iWll4c?autoplay=1&mute=1&controls=0&loop=1&playlist=FLsz9iWll4c&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop&q=80',
    license: 'Open Scientific Data / BAS',
    ocean_region: 'Antártida',
    channel_num: 1,
    frequency: '142.85 MHz VHF',
    telemetry: { waterTemp: '-1.8°C', windKnots: '28 kts SSW', iceCover: '65% Drift', depthMeters: '42m', signalDb: 96 }
  },
  {
    camera_id: 'cam_palmer_02',
    title: 'Palmer Station — Arthur Harbor & Marr Glacier',
    short_briefing: 'Frente glaciar Marr, caída de hielo serac en la bahía Arthur y navegación de botes científicos Zodiac.',
    description: 'Observatorio costero del Programa Antártico de EE.UU. (NSF) en Isla Anvers. Registra la dinámica glaciar y colonias locales de pingüinos.',
    operator: 'US Antarctic Program',
    source_organization: 'National Science Foundation (NSF)',
    platform_type: 'station',
    latitude: -64.7742,
    longitude: -64.0531,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.usap.gov/videoclipsandmaps/',
    stream_url: 'https://www.youtube-nocookie.com/embed/EqOht47LAMw?autoplay=1&mute=1&controls=0&loop=1&playlist=EqOht47LAMw&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?w=800&auto=format&fit=crop&q=80',
    license: 'US Government Public Domain',
    ocean_region: 'Antártida',
    channel_num: 2,
    frequency: '156.80 MHz Ch16',
    telemetry: { waterTemp: '-0.9°C', windKnots: '19 kts W', iceCover: '40% Fast Ice', depthMeters: '18m', signalDb: 98 }
  },
  {
    camera_id: 'cam_nautilus_03',
    title: 'E/V Nautilus — Deep Ocean ROV Hercules',
    short_briefing: 'Inmersión profunda en cañones y fosas abisales a más de 2.800 metros con brazos robóticos y bioluminiscencia.',
    description: 'Buque de exploración oceánica de Ocean Exploration Trust. Transmisión continua de fondos marinos inexplorados y respiraderos volcánicos.',
    operator: 'Ocean Exploration Trust',
    source_organization: 'OET / Dr. Robert Ballard',
    platform_type: 'vessel',
    latitude: 19.8968,
    longitude: -155.5828,
    status: 'LIVE',
    protocol: 'YouTube / WebRTC',
    public_page_url: 'https://nautiluslive.org/',
    stream_url: 'https://www.youtube-nocookie.com/embed/7t2KoQu5nUA?autoplay=1&mute=1&controls=0&loop=1&playlist=7t2KoQu5nUA&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    license: 'Creative Commons CC-BY 4.0',
    ocean_region: 'Abisal & ROV',
    channel_num: 3,
    frequency: '433.92 MHz UHF',
    telemetry: { waterTemp: '2.1°C', windKnots: '12 kts NE', iceCover: '0% Open Deep', depthMeters: '2840m', signalDb: 92 }
  },
  {
    camera_id: 'cam_monterey_04',
    title: 'Monterey Bay Sanctuary — Pelagic Ocean Cam',
    short_briefing: 'Mar abierto pelágico: Paso de grandes depredadores marinos, bancos de atunes, rayas y tiburones.',
    description: 'Cámara marina del Monterey Bay Aquarium orientada al hábitat pelágico del Santuario Marino Nacional.',
    operator: 'Monterey Bay Aquarium',
    source_organization: 'Monterey Bay Aquarium / MBARI',
    platform_type: 'buoy',
    latitude: 36.6183,
    longitude: -121.9015,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.montereybayaquarium.org/animals/live-cams',
    stream_url: 'https://www.youtube-nocookie.com/embed/n_GpVsz4nHU?autoplay=1&mute=1&controls=0&loop=1&playlist=n_GpVsz4nHU&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop&q=80',
    license: 'Open Access / Educational',
    ocean_region: 'Pelágico',
    channel_num: 4,
    frequency: '161.975 MHz AIS-1',
    telemetry: { waterTemp: '13.4°C', windKnots: '14 kts NW', iceCover: '0%', depthMeters: '120m', signalDb: 99 }
  },
  {
    camera_id: 'cam_kelp_05',
    title: 'Monterey Bay — Giant Kelp Forest Underwater',
    short_briefing: 'Ecosistema sumergido de bosque de macroalgas gigantes, rayas toro y peces de roca en aguas templadas.',
    description: 'Sensor óptico submarino continuo dentro del dosel de kelp Macrocystis pyrifera con alta biodiversidad marina.',
    operator: 'Monterey Bay Aquarium',
    source_organization: 'Explore.org / MBA',
    platform_type: 'underwater_pod',
    latitude: 36.6210,
    longitude: -121.9040,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://explore.org/livecams/oceans/kelp-forest-cam',
    stream_url: 'https://www.youtube-nocookie.com/embed/w3LjpFhySTg?autoplay=1&mute=1&controls=0&loop=1&playlist=w3LjpFhySTg&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    license: 'Explore.org / MBA Open',
    ocean_region: 'Arrecifes & Kelp',
    channel_num: 5,
    frequency: '162.025 MHz AIS-2',
    telemetry: { waterTemp: '12.8°C', windKnots: '8 kts WSW', iceCover: '0%', depthMeters: '11m', signalDb: 97 }
  },
  {
    camera_id: 'cam_lockroy_06',
    title: 'Port Lockroy — Gentoo Colony Watch',
    short_briefing: 'Comportamiento de colonia de pingüinos papúa (Pygoscelis papua) y témpanos varados en Isla Goudier.',
    description: 'Sitio Histórico y Monumento N° 61 en Puerto Lockroy. Monitorea el impacto biológico y reproductivo estacional.',
    operator: 'UK Antarctic Heritage Trust',
    source_organization: 'UKAHT / British Antarctic Survey',
    platform_type: 'station',
    latitude: -64.8256,
    longitude: -63.4939,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.ukaht.org/our-work/port-lockroy/',
    stream_url: 'https://www.youtube-nocookie.com/embed/o5QZz6KksvE?autoplay=1&mute=1&controls=0&loop=1&playlist=o5QZz6KksvE&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800&auto=format&fit=crop&q=80',
    license: 'Open Access / UKAHT Heritage',
    ocean_region: 'Antártida',
    channel_num: 6,
    frequency: '156.30 MHz Ch06',
    telemetry: { waterTemp: '-1.2°C', windKnots: '32 kts S', iceCover: '55% Pack', depthMeters: '14m', signalDb: 94 }
  },
  {
    camera_id: 'cam_ushuaia_07',
    title: 'Puerto de Ushuaia & Canal Beagle',
    short_briefing: 'Tráfico de cruceros de expedición polar, pesqueros australes y frente montañoso de los Andes Fueguinos.',
    description: 'Puesto de vigilancia portuaria en la Bahía de Ushuaia. Control del tráfico de buques hacia la Península Antártica.',
    operator: 'Prefectura Naval Argentina',
    source_organization: 'Administración Portuaria Ushuaia / Turismo',
    platform_type: 'coastal_tower',
    latitude: -54.8110,
    longitude: -68.3030,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://turismoushuaia.com/',
    stream_url: 'https://www.youtube-nocookie.com/embed/WCHsSfctpwg?autoplay=1&mute=1&controls=0&loop=1&playlist=WCHsSfctpwg&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    license: 'Servicio Público Prefectura',
    ocean_region: 'Estrechos & Puertos',
    channel_num: 7,
    frequency: '156.45 MHz Ch09',
    telemetry: { waterTemp: '6.5°C', windKnots: '24 kts WNW', iceCover: '0%', depthMeters: '35m', signalDb: 99 }
  },
  {
    camera_id: 'cam_magellan_08',
    title: 'Estrecho de Magallanes — Paso Marítimo VTS',
    short_briefing: 'Canal interoceánico austral: Paso de cargueros transoceánicos, marejadas y faros patagónicos.',
    description: 'Centro de Monitoreo y Tráfico Marítimo (VTS) de la Armada de Chile. Monitorea el cruce entre el Atlántico y el Pacífico.',
    operator: 'Directemar Armada de Chile',
    source_organization: 'DIRECTEMAR / Gobernación Marítima',
    platform_type: 'vts_tower',
    latitude: -53.1638,
    longitude: -70.9171,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.directemar.cl/',
    stream_url: 'https://www.youtube-nocookie.com/embed/TOOKr8Y2xsM?autoplay=1&mute=1&controls=0&loop=1&playlist=TOOKr8Y2xsM&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80',
    license: 'Dominio Público Gubernamental',
    ocean_region: 'Estrechos & Puertos',
    channel_num: 8,
    frequency: '156.65 MHz Ch13',
    telemetry: { waterTemp: '7.1°C', windKnots: '38 kts SW', iceCover: '0%', depthMeters: '180m', signalDb: 97 }
  },
  {
    camera_id: 'cam_neumayer_09',
    title: 'Neumayer-Station III — Plataforma Ekström',
    short_briefing: 'Meseta de hielo flotante a -25°C, torres meteorológicas y estación geofísica sobre la barrera de hielo.',
    description: 'Observatorio polar permanente del Instituto Alfred Wegener (AWI) en la Costa de la Princesa Marta.',
    operator: 'Alfred Wegener Institute (AWI)',
    source_organization: 'AWI Helmholtz Association (Alemania)',
    platform_type: 'station',
    latitude: -70.6744,
    longitude: -8.2742,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.awi.de/en/expedition/stations/neumayer-station-iii.html',
    stream_url: 'https://www.youtube-nocookie.com/embed/_RXkCW10868?autoplay=1&mute=1&controls=0&loop=1&playlist=_RXkCW10868&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop&q=80',
    license: 'Open Research Data / AWI',
    ocean_region: 'Antártida',
    channel_num: 9,
    frequency: '8.4 GHz SATCOM X-Band',
    telemetry: { waterTemp: '-1.9°C', windKnots: '26 kts E', iceCover: '90% Shelf', depthMeters: '260m', signalDb: 93 }
  },
  {
    camera_id: 'cam_southpole_10',
    title: 'Estación Polo Sur Amundsen-Scott — 90°S',
    short_briefing: 'Observatorio a 90° Sur en la meseta polar antártica a 2.835m de altitud, con vientos secos y telescopios submilimétricos.',
    description: 'Punto más austral del planeta operado por la NSF. Mide la atmósfera polar pura, astrofísica y sismología global.',
    operator: 'National Science Foundation (NSF)',
    source_organization: 'United States Antarctic Program (USAP)',
    platform_type: 'station',
    latitude: -90.0000,
    longitude: 0.0000,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.usap.gov/videoclipsandmaps/',
    stream_url: 'https://www.youtube-nocookie.com/embed/gQ3_gZ3ZS_4?autoplay=1&mute=1&controls=0&loop=1&playlist=gQ3_gZ3ZS_4&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    license: 'US Government Public Domain',
    ocean_region: 'Antártida',
    channel_num: 10,
    frequency: '7.2 GHz TDRSS Satellite',
    telemetry: { waterTemp: '-58.0°C Aire', windKnots: '15 kts Grid N', iceCover: '100% Continental', depthMeters: '2835m Alt', signalDb: 91 }
  },
  {
    camera_id: 'cam_explore_reef_11',
    title: 'Pacific Coral Reef & Sharks — Tropical Sanctuary',
    short_briefing: 'Arrecife de coral vivo: Cardúmenes de peces tropicales, tiburones punta negra y pólipos coralinos.',
    description: 'Transmisión submarina continua de arrecife tropical de alta resolución para monitoreo de salud coralina.',
    operator: 'Explore Oceans Network',
    source_organization: 'Explore.org / Aquarium of the Pacific',
    platform_type: 'underwater_pod',
    latitude: 13.4443,
    longitude: 144.7937,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://explore.org/livecams/oceans/pacific-aquarium-tropical-reef-cam',
    stream_url: 'https://www.youtube-nocookie.com/embed/xCLTpcx9aO8?autoplay=1&mute=1&controls=0&loop=1&playlist=xCLTpcx9aO8&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    license: 'Explore.org Open Video',
    ocean_region: 'Arrecifes & Kelp',
    channel_num: 11,
    frequency: '446.0 MHz Marine FM',
    telemetry: { waterTemp: '27.5°C', windKnots: '6 kts ESE', iceCover: '0%', depthMeters: '8m', signalDb: 98 }
  },
  {
    camera_id: 'cam_polarstern_12',
    title: 'R/V Polarstern — Proa & Pasaje de Drake',
    short_briefing: 'Navegación de rompehielos polar: Grandes marejadas en el Mar de Scotia y cruce de altas latitudes.',
    description: 'Cámara de proa del buque insignia polar de investigación alemán operado por el Instituto Alfred Wegener.',
    operator: 'Alfred Wegener Institute',
    source_organization: 'AWI / Polarstern Expeditions',
    platform_type: 'vessel',
    latitude: -59.2300,
    longitude: -63.4500,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://follow-polarstern.awi.de/',
    stream_url: 'https://www.youtube-nocookie.com/embed/SSez2_4nGXw?autoplay=1&mute=1&controls=0&loop=1&playlist=SSez2_4nGXw&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    license: 'Open Expedition Data / AWI',
    ocean_region: 'Océano Austral',
    channel_num: 12,
    frequency: '1.6 GHz Iridium Certus',
    telemetry: { waterTemp: '1.4°C', windKnots: '44 kts WSW', iceCover: '15% Growlers', depthMeters: '3800m', signalDb: 89 }
  },
  {
    camera_id: 'cam_davis_13',
    title: 'Davis Research Station — Vestfold Hills',
    short_briefing: 'Costa oriental antártica: Playas rocosas libres de hielo estacional, bahía Heidemann e islas costeras.',
    description: 'Estación antártica australiana en la Tierra de la Princesa Isabel. Monitoreo de pingüineras Adelia y microclima.',
    operator: 'Australian Antarctic Division (AAD)',
    source_organization: 'Department of Climate Change, Energy and Environment (Australia)',
    platform_type: 'station',
    latitude: -68.5766,
    longitude: 77.9674,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.antarctica.gov.au/antarctic-operations/webcams/',
    stream_url: 'https://www.youtube-nocookie.com/embed/YHvvQGfROVk?autoplay=1&mute=1&controls=0&loop=1&playlist=YHvvQGfROVk&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop&q=80',
    license: 'Commonwealth of Australia Open Access',
    ocean_region: 'Antártida',
    channel_num: 13,
    frequency: '148.125 MHz VHF',
    telemetry: { waterTemp: '-1.7°C', windKnots: '21 kts NE', iceCover: '50% Fast Ice', depthMeters: '22m', signalDb: 95 }
  },
  {
    camera_id: 'cam_okeanos_14',
    title: 'NOAA Okeanos Explorer — Deep Seamount ROV',
    short_briefing: 'Bioluminiscencia abisal, esponjas de cristal gigantes y respiradores hidrotermales a más de 3.000m.',
    description: 'Buque federal de exploración de fondos marinos de la NOAA. Misiones de cartografía y telepresencia en vivo.',
    operator: 'NOAA Ocean Exploration',
    source_organization: 'National Oceanic and Atmospheric Administration (NOAA)',
    platform_type: 'vessel',
    latitude: 24.5500,
    longitude: -81.7800,
    status: 'LIVE',
    protocol: 'YouTube / WebRTC',
    public_page_url: 'https://oceanexplorer.noaa.gov/livestreams/welcome.html',
    stream_url: 'https://www.youtube-nocookie.com/embed/sUQbqOz8OvA?autoplay=1&mute=1&controls=0&loop=1&playlist=sUQbqOz8OvA&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    license: 'US Government Public Domain',
    ocean_region: 'Abisal & ROV',
    channel_num: 14,
    frequency: '2.4 GHz High-Gain Ku-Band',
    telemetry: { waterTemp: '2.8°C', windKnots: '10 kts E', iceCover: '0%', depthMeters: '3120m', signalDb: 96 }
  },
  {
    camera_id: 'cam_svalbard_15',
    title: 'Ny-Ålesund Marine Lab — 79°N Svalbard',
    short_briefing: 'Ártico profundo en Kongsfjorden: Atardecer polar, témpanos glaciares a la deriva y fiordo ártico.',
    description: 'Comunidad científica más septentrional del planeta en el archipiélago de Svalbard. Monitoreo del calentamiento ártico.',
    operator: 'Kings Bay AS / AWI',
    source_organization: 'Svalbard Integrated Arctic Earth Observing System (SIOS)',
    platform_type: 'station',
    latitude: 78.9235,
    longitude: 11.9099,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://kingsbay.no/',
    stream_url: 'https://www.youtube-nocookie.com/embed/WNrrOoT18O0?autoplay=1&mute=1&controls=0&loop=1&playlist=WNrrOoT18O0&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop&q=80',
    license: 'Open SIOS Research License',
    ocean_region: 'Ártico & Norte',
    channel_num: 15,
    frequency: '156.80 MHz Marine Ch16',
    telemetry: { waterTemp: '1.2°C', windKnots: '17 kts N', iceCover: '35% Ice Floes', depthMeters: '65m', signalDb: 97 }
  },
  {
    camera_id: 'cam_voyager_16',
    title: 'Georgia Aquarium — Ocean Voyager Whale Sharks',
    short_briefing: 'Hábitat pelágico de 24 millones de litros: Tiburones ballena gigantes, mantas y cardúmenes de peces plateados.',
    description: 'Monitoreo etológico continuo de los mayores elasmobranquios del planeta en colaboración científica con biólogos marinos.',
    operator: 'Georgia Aquarium',
    source_organization: 'Georgia Aquarium Research Center',
    platform_type: 'aquarium_pod',
    latitude: 33.7634,
    longitude: -84.3951,
    status: 'LIVE',
    protocol: 'YouTube / HLS',
    public_page_url: 'https://www.georgiaaquarium.org/webcam/ocean-voyager/',
    stream_url: 'https://www.youtube-nocookie.com/embed/yNkls89s1KY?autoplay=1&mute=1&controls=0&loop=1&playlist=yNkls89s1KY&playsinline=1&modestbranding=1',
    thumbnail_url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop&q=80',
    license: 'Educational Live Access',
    ocean_region: 'Pelágico',
    channel_num: 16,
    frequency: '156.55 MHz Ch11',
    telemetry: { waterTemp: '22.0°C', windKnots: '0 kts Enclosed', iceCover: '0%', depthMeters: '10m', signalDb: 99 }
  }
];

// =========================================================================
// YOUTUBE & OPEN STREAM PARSER HELPERS
// =========================================================================
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  
  const beMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (beMatch) return beMatch[1];

  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  const embedMatch = trimmed.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  return null;
}

export function buildYouTubeEmbedUrl(videoId: string, isMuted: boolean = true): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1`;
}

export function getYouTubeWatchUrl(streamOrEmbedUrl: string): string {
  const yId = extractYouTubeId(streamOrEmbedUrl);
  if (yId) return `https://www.youtube.com/watch?v=${yId}`;
  return streamOrEmbedUrl;
}

// Curated 1-Click Stream Presets for YouTube Explorer
interface CuratedStreamPreset {
  id: string;
  category: 'Antártida' | 'Abisal & ROV' | 'Fauna & Pelágico' | 'Estrechos & Buques';
  title: string;
  operator: string;
  videoId: string;
  region: string;
  briefing: string;
  thumbnail: string;
}

const YOUTUBE_STREAM_PRESETS: CuratedStreamPreset[] = [
  {
    id: 'preset_bas_rothera',
    category: 'Antártida',
    title: 'BAS Rothera Station — Icebergs & Landscape',
    operator: 'British Antarctic Survey',
    videoId: 'FLsz9iWll4c',
    region: 'Antártida',
    briefing: 'Península Antártica: Témpanos a la deriva, frente glaciar y operaciones de aeronaves polares Dash-7.',
    thumbnail: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800'
  },
  {
    id: 'preset_palmer_usap',
    category: 'Antártida',
    title: 'Palmer Station & Arthur Harbor — USAP',
    operator: 'US Antarctic Program',
    videoId: 'EqOht47LAMw',
    region: 'Antártida',
    briefing: 'Estación científica en Isla Anvers con monitoreo continuo de témpanos y fauna polar.',
    thumbnail: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?w=800'
  },
  {
    id: 'preset_south_pole',
    category: 'Antártida',
    title: 'Amundsen-Scott South Pole Station 90°S',
    operator: 'National Science Foundation',
    videoId: 'gQ3_gZ3ZS_4',
    region: 'Antártida',
    briefing: 'Polo Sur geográfico a -58°C: Meseta polar y radiotelescopios astronómicos.',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'
  },
  {
    id: 'preset_gentoo_bbc',
    category: 'Antártida',
    title: 'Port Lockroy Gentoo Penguin Colony',
    operator: 'UK Antarctic Heritage Trust / BBC',
    videoId: 'o5QZz6KksvE',
    region: 'Antártida',
    briefing: 'Monitoreo de anidación, comportamiento y marcha de pingüinos papúa en Port Lockroy.',
    thumbnail: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800'
  },
  {
    id: 'preset_svalbard',
    category: 'Antártida',
    title: 'Ny-Ålesund Arctic Marine Observatory 79°N',
    operator: 'Kings Bay / AWI',
    videoId: 'WNrrOoT18O0',
    region: 'Ártico & Norte',
    briefing: 'Puesto científico más septentrional del mundo en fiordos del archipiélago de Svalbard.',
    thumbnail: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800'
  },
  {
    id: 'preset_nautilus_rov',
    category: 'Abisal & ROV',
    title: 'E/V Nautilus ROV Hercules — Deep Ocean Seafloor',
    operator: 'Ocean Exploration Trust',
    videoId: '7t2KoQu5nUA',
    region: 'Abisal & ROV',
    briefing: 'Inmersión abisal a más de 2.800m con brazos robóticos y muestreo biológico en vivo.',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
  },
  {
    id: 'preset_noaa_okeanos',
    category: 'Abisal & ROV',
    title: 'NOAA Okeanos Explorer — Deep Seamount Dive',
    operator: 'NOAA Ocean Exploration',
    videoId: 'sUQbqOz8OvA',
    region: 'Abisal & ROV',
    briefing: 'Cámaras de alta resolución en cañones submarinos y ventilas hidrotermales.',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
  },
  {
    id: 'preset_monterey_opensea',
    category: 'Fauna & Pelágico',
    title: 'Monterey Bay Open Sea — Pelagic Predators',
    operator: 'Monterey Bay Aquarium',
    videoId: 'n_GpVsz4nHU',
    region: 'Pelágico',
    briefing: 'Tiburones martillo, atunes de aleta azul y peces luna en mar abierto.',
    thumbnail: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800'
  },
  {
    id: 'preset_monterey_kelp',
    category: 'Fauna & Pelágico',
    title: 'Monterey Bay Giant Kelp Forest Underwater',
    operator: 'Monterey Bay Aquarium / Explore.org',
    videoId: 'w3LjpFhySTg',
    region: 'Arrecifes & Kelp',
    briefing: 'Bosques de macroalgas gigantes con nutrias marinas, rayas y peces de roca.',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
  },
  {
    id: 'preset_georgia_whale_shark',
    category: 'Fauna & Pelágico',
    title: 'Georgia Aquarium Ocean Voyager — Whale Sharks',
    operator: 'Georgia Aquarium',
    videoId: 'yNkls89s1KY',
    region: 'Pelágico',
    briefing: 'El hábitat marino más grande del mundo con tiburones ballena y mantarrayas gigantes.',
    thumbnail: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800'
  },
  {
    id: 'preset_tropical_reef',
    category: 'Fauna & Pelágico',
    title: 'Pacific Tropical Coral Reef 4K',
    operator: 'Explore Oceans Network',
    videoId: 'xCLTpcx9aO8',
    region: 'Arrecifes & Kelp',
    briefing: 'Arrecife de coral vivo con peces tropicales, corales duros y fauna bentónica.',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
  },
  {
    id: 'preset_drake_polarstern',
    category: 'Estrechos & Buques',
    title: 'R/V Polarstern — Drake Passage Rough Seas',
    operator: 'Alfred Wegener Institute',
    videoId: 'SSez2_4nGXw',
    region: 'Océano Austral',
    briefing: 'Oleaje extremo y navegación de investigación en el temido Pasaje de Drake.',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
  },
  {
    id: 'preset_magellan_strait',
    category: 'Estrechos & Buques',
    title: 'Strait of Magellan Ship Transit Surveillance',
    operator: 'Directemar Armada de Chile',
    videoId: 'TOOKr8Y2xsM',
    region: 'Estrechos & Puertos',
    briefing: 'Monitoreo de tráfico marítimo VTS y navegación entre el Atlántico y el Pacífico.',
    thumbnail: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'
  },
  {
    id: 'preset_ushuaia_beagle',
    category: 'Estrechos & Buques',
    title: 'Puerto de Ushuaia & Canal Beagle Navigation',
    operator: 'Prefectura Naval / Ushuaia',
    videoId: 'WCHsSfctpwg',
    region: 'Estrechos & Puertos',
    briefing: 'Canal Beagle y muelle turístico de expediciones a la Antártida.',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
  }
];

const YOUTUBE_SEARCH_SHORTCUTS = [
  {
    title: 'Transmisiones en Vivo de la Antártida',
    query: 'antarctica live cam',
    url: 'https://www.youtube.com/results?search_query=antarctica+live+cam&sp=EgJAAQ%253D%253D',
    icon: '❄️',
    description: 'Encuentra todas las cámaras en directo emitiendo desde bases polares y buques antárticos.'
  },
  {
    title: 'Exploración de Fondos Marinos & ROV en Vivo',
    query: 'deep ocean rov live',
    url: 'https://www.youtube.com/results?search_query=deep+ocean+rov+live&sp=EgJAAQ%253D%253D',
    icon: '🌊',
    description: 'Búsqueda en YouTube de expediciones submarinas activas de Nautilus, NOAA y MBARI.'
  },
  {
    title: 'Acuarios, Tiburones y Arrecifes 4K en Vivo',
    query: 'coral reef live cam 4k',
    url: 'https://www.youtube.com/results?search_query=coral+reef+live+cam+4k&sp=EgJAAQ%253D%253D',
    icon: '🐠',
    description: 'Canales en directo de ecosistemas coralinos, bosques de kelp y fauna oceánica.'
  },
  {
    title: 'Cámaras en Vivo de Puertos y Buques Marítimos',
    query: 'port live webcam',
    url: 'https://www.youtube.com/results?search_query=port+live+webcam&sp=EgJAAQ%253D%253D',
    icon: '🚢',
    description: 'Tráfico de buques, puertos patagónicos y cruces marítimos globales.'
  }
];

const LOCAL_STORAGE_CUSTOM_CAMS = 'AMOH_SURVEILLANCE_CUSTOM_CAMS_V1';

// Web Audio API Retro 80s Sound FX Engine
class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playDegauss() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);
      
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // Audio context may be blocked
    }
  }

  playChannelSwitch() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(800, now + 0.04);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignored
    }
  }

  setStaticNoise(enable: boolean) {
    try {
      this.init();
      if (!this.ctx) return;
      
      if (!enable) {
        if (this.noiseNode) {
          this.noiseNode.stop();
          this.noiseNode.disconnect();
          this.noiseNode = null;
        }
        return;
      }

      if (this.noiseNode) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 0.6;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.015, this.ctx.currentTime);

      this.noiseNode.connect(filter);
      filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.noiseNode.start();
    } catch {
      // Audio not permitted
    }
  }
}

const audioFX = new RetroAudioEngine();

// Phosphor Shader Presets
export type PhosphorTheme = 'ntsc-color' | 'p1-green' | 'p3-amber' | 'cyber-cyan' | 'mono-bw';

export const THEME_STYLES: Record<PhosphorTheme, {
  name: string;
  badge: string;
  bodyClass: string;
  borderClass: string;
  textGlow: string;
  phosphorFilter: string;
  osdColor: string;
  bgHex: string;
}> = {
  'ntsc-color': {
    name: 'NTSC FULL COLOR',
    badge: 'NTSC 3.58',
    bodyClass: 'bg-[#060911] text-stone-200',
    borderClass: 'border-[#1e293b]',
    textGlow: 'drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]',
    phosphorFilter: 'contrast(1.15) saturate(1.2) brightness(0.95)',
    osdColor: 'text-[#00ffcc]',
    bgHex: '#060911'
  },
  'p1-green': {
    name: 'P1 PHOSPHOR GREEN',
    badge: 'MIL-SPEC GREEN',
    bodyClass: 'bg-[#031206] text-[#33ff66]',
    borderClass: 'border-[#1b4d24]',
    textGlow: 'drop-shadow-[0_0_8px_rgba(51,255,102,0.8)]',
    phosphorFilter: 'sepia(1) hue-rotate(85deg) saturate(3.5) contrast(1.3) brightness(0.9)',
    osdColor: 'text-[#33ff66]',
    bgHex: '#031206'
  },
  'p3-amber': {
    name: 'P3 AMBER TERMINAL',
    badge: 'AMBER PHOSPHOR',
    bodyClass: 'bg-[#140b02] text-[#ffb034]',
    borderClass: 'border-[#553008]',
    textGlow: 'drop-shadow-[0_0_8px_rgba(255,176,52,0.8)]',
    phosphorFilter: 'sepia(1) hue-rotate(5deg) saturate(4) contrast(1.25) brightness(0.9)',
    osdColor: 'text-[#ffb034]',
    bgHex: '#140b02'
  },
  'cyber-cyan': {
    name: 'FLIR / SONAR CYAN',
    badge: 'FLIR INFRARED',
    bodyClass: 'bg-[#021118] text-[#00f0ff]',
    borderClass: 'border-[#0a4455]',
    textGlow: 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]',
    phosphorFilter: 'sepia(1) hue-rotate(145deg) saturate(3) contrast(1.35) brightness(0.9)',
    osdColor: 'text-[#00f0ff]',
    bgHex: '#021118'
  },
  'mono-bw': {
    name: 'B&W CCTV SURVEILLANCE',
    badge: 'MONOCHROME 525L',
    bodyClass: 'bg-[#0d0d0d] text-[#e6e6e6]',
    borderClass: 'border-[#404040]',
    textGlow: 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]',
    phosphorFilter: 'grayscale(1) contrast(1.4) brightness(0.95)',
    osdColor: 'text-[#ffffff]',
    bgHex: '#0d0d0d'
  }
};

type LayoutMode = '4x4' | '3x3' | '2x2' | 'master-carousel' | 'single-focus';

export default function CameraWall() {
  const [cameras, setCameras] = useState<Camera[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CUSTOM_CAMS);
      if (stored) {
        const customMap: Record<number, Partial<Camera>> = JSON.parse(stored);
        return DEFAULT_OCEAN_CAMERAS.map((def, idx) => {
          const ch = idx + 1;
          if (customMap[ch]) {
            return { ...def, ...customMap[ch], is_custom: true };
          }
          return def;
        });
      }
    } catch {
      // Fallback
    }
    return DEFAULT_OCEAN_CAMERAS;
  });

  const [selectedCam, setSelectedCam] = useState<Camera | null>(null);
  const [activeChannel, setActiveChannel] = useState<number>(1);
  const [theme, setTheme] = useState<PhosphorTheme>('ntsc-color');
  const [layout, setLayout] = useState<LayoutMode>('4x4');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  
  // 80s Hardware Toggles
  const [scanlinesActive, setScanlinesActive] = useState<boolean>(true);
  const [showOsd, setShowOsd] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [autoScanActive, setAutoScanActive] = useState<boolean>(false);
  const [isDegaussing, setIsDegaussing] = useState<boolean>(false);
  const [vcrRecording] = useState<boolean>(true);
  const [showDirectory, setShowDirectory] = useState<boolean>(false);
  
  // YouTube Free Tuner & Explorer Modal State
  const [showTunerModal, setShowTunerModal] = useState<boolean>(false);
  const [tunerTab, setTunerTab] = useState<'custom' | 'presets' | 'search'>('custom');
  const [tunerTargetChannel, setTunerTargetChannel] = useState<number>(1);
  const [tunerUrlInput, setTunerUrlInput] = useState<string>('');
  const [tunerTitleInput, setTunerTitleInput] = useState<string>('');
  const [tunerRegionInput, setTunerRegionInput] = useState<string>('Personalizado');
  const [tunerBriefingInput, setTunerBriefingInput] = useState<string>('');
  const [tunerFeedbackMsg, setTunerFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live 80s VCR OSD Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [tapeCounter, setTapeCounter] = useState<number>(1420);

  // Fetch backend cameras if available, merge with default seeds & localStorage custom overrides
  useEffect(() => {
    api.get<Camera[]>('/api/cameras')
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          let customMap: Record<number, Partial<Camera>> = {};
          try {
            const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_CAMS);
            if (raw) customMap = JSON.parse(raw);
          } catch {
            // Ignore
          }

          const merged = DEFAULT_OCEAN_CAMERAS.map((def, idx) => {
            const ch = idx + 1;
            const found = data.find(d => d.camera_id === def.camera_id || d.title === def.title);
            const base = found ? { ...def, ...found, channel_num: ch } : { ...def, channel_num: ch };
            if (customMap[ch]) {
              return { ...base, ...customMap[ch], is_custom: true };
            }
            return base;
          });
          setCameras(merged);
        }
      })
      .catch(() => {
        // Safe fallback
      });
  }, []);

  // Update clock & VCR tape counter
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const yr = now.getUTCFullYear();
      const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
      const da = String(now.getUTCDate()).padStart(2, '0');
      const hr = String(now.getUTCHours()).padStart(2, '0');
      const mi = String(now.getUTCMinutes()).padStart(2, '0');
      const se = String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentTime(`${yr}-${mo}-${da}  ${hr}:${mi}:${se} UTC`);
      setTapeCounter(prev => (prev + 1) % 99999);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scan / patrol mode (cycles cameras every 6s)
  useEffect(() => {
    if (!autoScanActive || cameras.length === 0) return;
    const interval = setInterval(() => {
      setActiveChannel(prev => {
        const next = prev >= cameras.length ? 1 : prev + 1;
        if (soundEnabled) audioFX.playChannelSwitch();
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [autoScanActive, cameras.length, soundEnabled]);

  // Handle Degauss Action
  const triggerDegauss = () => {
    setIsDegaussing(true);
    if (soundEnabled) audioFX.playDegauss();
    setTimeout(() => {
      setIsDegaussing(false);
    }, 1200);
  };

  // Sound master switch
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) audioFX.playChannelSwitch();
  };

  // Switch channel manually
  const switchChannel = (chNum: number) => {
    setActiveChannel(chNum);
    if (soundEnabled) audioFX.playChannelSwitch();
  };

  // Open Tuner with specific channel
  const openTunerForChannel = (chNum: number) => {
    const cam = cameras.find(c => c.channel_num === chNum) || cameras[0];
    setTunerTargetChannel(chNum);
    setTunerUrlInput(getYouTubeWatchUrl(cam.stream_url));
    setTunerTitleInput(cam.title);
    setTunerRegionInput(cam.ocean_region || 'Personalizado');
    setTunerBriefingInput(cam.short_briefing || cam.description || '');
    setTunerFeedbackMsg(null);
    setShowTunerModal(true);
    if (soundEnabled) audioFX.playChannelSwitch();
  };

  // Apply custom stream tuning to target channel
  const handleApplyCustomStream = () => {
    if (!tunerUrlInput.trim()) {
      setTunerFeedbackMsg({ type: 'error', text: 'Por favor ingresa una URL de YouTube o enlace de stream válido.' });
      return;
    }

    const yId = extractYouTubeId(tunerUrlInput);
    let finalStreamUrl = tunerUrlInput.trim();
    let finalThumbnail = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800';

    if (yId) {
      finalStreamUrl = buildYouTubeEmbedUrl(yId);
      finalThumbnail = `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
    }

    const customUpdate: Partial<Camera> = {
      title: tunerTitleInput.trim() || `Canal ${tunerTargetChannel.toString().padStart(2, '0')} // Custom Live Feed`,
      short_briefing: tunerBriefingInput.trim() || 'Transmisión personalizada configurada libremente por el operador.',
      stream_url: finalStreamUrl,
      thumbnail_url: finalThumbnail,
      ocean_region: tunerRegionInput.trim() || 'Personalizado',
      operator: 'Operador AMOH Libre',
      status: 'LIVE',
      is_custom: true
    };

    // Save to local storage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_CAMS);
      const customMap = raw ? JSON.parse(raw) : {};
      customMap[tunerTargetChannel] = customUpdate;
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_CAMS, JSON.stringify(customMap));
    } catch {
      // Ignore
    }

    // Update in memory state
    setCameras(prev => prev.map(c => {
      if (c.channel_num === tunerTargetChannel) {
        return { ...c, ...customUpdate };
      }
      return c;
    }));

    if (soundEnabled) audioFX.playChannelSwitch();
    setTunerFeedbackMsg({ type: 'success', text: `¡Canal CH-${tunerTargetChannel.toString().padStart(2, '0')} sintonizado con éxito!` });
    setActiveChannel(tunerTargetChannel);
  };

  // Tune a preset directly into target channel
  const handleTunePreset = (preset: CuratedStreamPreset) => {
    const embedUrl = buildYouTubeEmbedUrl(preset.videoId);
    const customUpdate: Partial<Camera> = {
      title: preset.title,
      short_briefing: preset.briefing,
      operator: preset.operator,
      stream_url: embedUrl,
      thumbnail_url: preset.thumbnail || `https://img.youtube.com/vi/${preset.videoId}/hqdefault.jpg`,
      ocean_region: preset.region,
      status: 'LIVE',
      is_custom: true
    };

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_CAMS);
      const customMap = raw ? JSON.parse(raw) : {};
      customMap[tunerTargetChannel] = customUpdate;
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_CAMS, JSON.stringify(customMap));
    } catch {
      // Ignore
    }

    setCameras(prev => prev.map(c => {
      if (c.channel_num === tunerTargetChannel) {
        return { ...c, ...customUpdate };
      }
      return c;
    }));

    if (soundEnabled) audioFX.playChannelSwitch();
    setTunerFeedbackMsg({ type: 'success', text: `¡Preset "${preset.title}" asignado al CH-${tunerTargetChannel.toString().padStart(2, '0')}!` });
    setActiveChannel(tunerTargetChannel);
  };

  // Reset all channels to factory default feeds
  const handleResetToDefaults = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_CUSTOM_CAMS);
    } catch {
      // Ignore
    }
    setCameras(DEFAULT_OCEAN_CAMERAS);
    if (soundEnabled) audioFX.playDegauss();
    setTunerFeedbackMsg({ type: 'success', text: '¡Todas las cámaras han sido restauradas a sus transmisiones verificadas de fábrica!' });
  };

  // Regions list
  const regions = useMemo(() => {
    const set = new Set<string>();
    cameras.forEach(c => {
      if (c.ocean_region) set.add(c.ocean_region);
    });
    return ['ALL', ...Array.from(set)];
  }, [cameras]);

  // Filtered cameras based on region
  const filteredCameras = useMemo(() => {
    if (selectedRegion === 'ALL') return cameras;
    return cameras.filter(c => c.ocean_region === selectedRegion);
  }, [cameras, selectedRegion]);

  const activeMasterCamera = useMemo(() => {
    return cameras.find(c => (c.channel_num || 1) === activeChannel) || cameras[0] || DEFAULT_OCEAN_CAMERAS[0];
  }, [cameras, activeChannel]);

  const currentThemeConfig = THEME_STYLES[theme];

  return (
    <div className={`min-h-screen ${currentThemeConfig.bodyClass} p-3 md:p-6 font-mono select-none overflow-x-hidden transition-colors duration-500 relative`}>
      
      {/* CRT Screen Degaussing / Vibration Flash Effect */}
      {isDegaussing && (
        <div className="fixed inset-0 z-[9999] pointer-events-none animate-pulse bg-gradient-to-r from-cyan-500/30 via-magenta-500/40 to-yellow-500/30 backdrop-invert mix-blend-color-dodge transition-all duration-300" />
      )}

      {/* Global CRT Scanlines Overlay */}
      {scanlinesActive && (
        <div 
          className="pointer-events-none fixed inset-0 z-[9000] opacity-40 mix-blend-overlay"
          style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.75) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))',
            backgroundSize: '100% 4px, 6px 100%'
          }}
        />
      )}

      {/* CRT Screen Vignette & Tube Curvature */}
      <div 
        className="pointer-events-none fixed inset-0 z-[8999] shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] opacity-90"
      />

      {/* =========================================================================
          80s CONTROL ROOM MASTER HEADER / SYSTEM BADGES
          ========================================================================= */}
      <div className="mb-4 border-2 border-stone-800 bg-stone-950/90 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Main Title & Military Retro Specs */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-stone-900 border-2 border-stone-700 flex items-center justify-center relative shadow-inner">
              <Tv className="w-7 h-7 text-cyan-400 animate-pulse" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                  AMOH-84 <span className="text-cyan-400">SURVEILLANCE MATRIX</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-red-950 text-red-400 border border-red-700 uppercase animate-pulse">
                  ● 16-CH LIVE NTSC
                </span>
              </div>
              <p className="text-xs text-stone-400 tracking-wider">
                Ocean Camera Network — Federated Polar & Maritime Intelligence Feeds [CRT-WALL V8.4]
              </p>
            </div>
          </div>

          {/* OSD Status Bar & Live UTC Clock */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-black/70 px-4 py-2 rounded-lg border border-stone-800">
            <div className="flex items-center gap-2">
              <Disc className={`w-4 h-4 ${vcrRecording ? 'text-red-500 animate-spin' : 'text-stone-500'}`} />
              <span className="text-red-400 font-bold tracking-wider">
                {vcrRecording ? 'REC [SP]' : 'STANDBY'}
              </span>
            </div>
            <div className="h-4 w-px bg-stone-700" />
            <div className="text-stone-300 font-mono tracking-widest">
              TRK: <span className="text-yellow-400 font-bold">{tapeCounter.toString().padStart(4, '0')}</span>
            </div>
            <div className="h-4 w-px bg-stone-700" />
            <div className="text-stone-300 font-mono tracking-widest font-bold text-cyan-300">
              {currentTime || '1986-09-23 00:00:00 UTC'}
            </div>
          </div>
        </div>

        {/* =========================================================================
            80s VINTAGE HARDWARE CONSOLE SWITCHER BAR
            ========================================================================= */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Hardware Theme Switcher (Phosphor Colors) */}
          <div className="flex items-center gap-1 bg-stone-900/90 p-1.5 rounded-lg border border-stone-700">
            <span className="text-[10px] uppercase font-bold text-stone-400 px-2 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" /> CRT:
            </span>
            {(['ntsc-color', 'p1-green', 'p3-amber', 'cyber-cyan', 'mono-bw'] as PhosphorTheme[]).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  if (soundEnabled) audioFX.playChannelSwitch();
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                  theme === t
                    ? 'bg-stone-100 text-stone-950 shadow-md font-bold'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {t === 'ntsc-color' ? '🎨 COLOR' : t === 'p1-green' ? '🟢 P1 GREEN' : t === 'p3-amber' ? '🟠 P3 AMBER' : t === 'cyber-cyan' ? '🔵 FLIR' : '⚪ B&W'}
              </button>
            ))}
          </div>

          {/* Grid Layout Switcher */}
          <div className="flex items-center gap-1 bg-stone-900/90 p-1.5 rounded-lg border border-stone-700">
            <span className="text-[10px] uppercase font-bold text-stone-400 px-2 flex items-center gap-1">
              <Grid3X3 className="w-3 h-3 text-cyan-400" /> MATRIX:
            </span>
            <button
              onClick={() => { setLayout('4x4'); if (soundEnabled) audioFX.playChannelSwitch(); }}
              className={`px-2 py-1 rounded text-[10px] font-bold ${layout === '4x4' ? 'bg-cyan-500 text-black' : 'text-stone-400 hover:bg-stone-800'}`}
              title="16-Monitor Full Wall"
            >
              4x4 WALL (16)
            </button>
            <button
              onClick={() => { setLayout('3x3'); if (soundEnabled) audioFX.playChannelSwitch(); }}
              className={`px-2 py-1 rounded text-[10px] font-bold ${layout === '3x3' ? 'bg-cyan-500 text-black' : 'text-stone-400 hover:bg-stone-800'}`}
              title="9-Monitor Grid"
            >
              3x3 GRID (9)
            </button>
            <button
              onClick={() => { setLayout('2x2'); if (soundEnabled) audioFX.playChannelSwitch(); }}
              className={`px-2 py-1 rounded text-[10px] font-bold ${layout === '2x2' ? 'bg-cyan-500 text-black' : 'text-stone-400 hover:bg-stone-800'}`}
              title="4-Monitor Quad"
            >
              2x2 QUAD (4)
            </button>
            <button
              onClick={() => { setLayout('master-carousel'); if (soundEnabled) audioFX.playChannelSwitch(); }}
              className={`px-2 py-1 rounded text-[10px] font-bold ${layout === 'master-carousel' ? 'bg-cyan-500 text-black' : 'text-stone-400 hover:bg-stone-800'}`}
              title="1 Master + Side Monitors"
            >
              MASTER+SIDE
            </button>
            <button
              onClick={() => { setLayout('single-focus'); if (soundEnabled) audioFX.playChannelSwitch(); }}
              className={`px-2 py-1 rounded text-[10px] font-bold ${layout === 'single-focus' ? 'bg-cyan-500 text-black' : 'text-stone-400 hover:bg-stone-800'}`}
              title="Single Master Monitor"
            >
              SOLO CH
            </button>
          </div>

          {/* Physical Function Pushbuttons & Free Tuner Launcher */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Auto-Scan / Patrol Mode */}
            <button
              onClick={() => {
                const next = !autoScanActive;
                setAutoScanActive(next);
                if (soundEnabled) audioFX.playChannelSwitch();
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                autoScanActive 
                  ? 'bg-amber-600 border-amber-400 text-white animate-pulse' 
                  : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {autoScanActive ? 'PATROL [ON]' : 'AUTO-SCAN'}
            </button>

            {/* DEGAUSS Magnetic Button */}
            <button
              onClick={triggerDegauss}
              disabled={isDegaussing}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white border border-red-500 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
              title="Degauss CRT monitors with magnetic discharge"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              DE-GAUSS
            </button>

            {/* Scanlines Toggle */}
            <button
              onClick={() => setScanlinesActive(!scanlinesActive)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                scanlinesActive ? 'bg-cyan-900/40 border-cyan-500 text-cyan-300' : 'bg-stone-900 border-stone-700 text-stone-400'
              }`}
              title="Toggle CRT raster lines"
            >
              SCANLINES
            </button>

            {/* OSD Toggle */}
            <button
              onClick={() => setShowOsd(!showOsd)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                showOsd ? 'bg-green-900/40 border-green-500 text-green-300' : 'bg-stone-900 border-stone-700 text-stone-400'
              }`}
              title="Toggle VCR On-Screen Display"
            >
              OSD HUD
            </button>

            {/* Sound FX Switch */}
            <button
              onClick={toggleSound}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                soundEnabled ? 'bg-purple-900/50 border-purple-400 text-purple-200' : 'bg-stone-900 border-stone-700 text-stone-400'
              }`}
              title="Retro Audio Sound Effects"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {soundEnabled ? 'SFX ON' : 'SFX OFF'}
            </button>

            {/* DIRECT CHANNEL DIRECTORY */}
            <button
              onClick={() => {
                setShowDirectory(true);
                if (soundEnabled) audioFX.playChannelSwitch();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-300 hover:bg-cyan-900 font-bold text-xs flex items-center gap-1.5 shadow"
              title="Abrir Directorio Completo de Cámaras Web"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              GUÍA CÁMARAS (16)
            </button>

            {/* SINTONIZADOR LIBRE & YOUTUBE EXPLORER */}
            <button
              onClick={() => {
                setShowTunerModal(true);
                if (soundEnabled) audioFX.playChannelSwitch();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border-2 border-red-500 text-red-200 hover:text-white font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse transition-all active:scale-95"
              title="Sintonizador Libre de YouTube y Portales Abiertos"
            >
              <YouTubeIcon className="w-4 h-4 text-red-400" />
              <span>SINTONIZADOR LIBRE / YOUTUBE</span>
            </button>

          </div>
        </div>

        {/* Region Filter Bar & Channel Quick Select Keypad */}
        <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex flex-wrap items-center justify-between gap-2">
          
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-stone-500 uppercase font-bold text-[10px] mr-1">REGIONES:</span>
            {regions.map(r => (
              <button
                key={r}
                onClick={() => {
                  setSelectedRegion(r);
                  if (soundEnabled) audioFX.playChannelSwitch();
                }}
                className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-bold border transition-colors ${
                  selectedRegion === r
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* 16-Channel Selector Switcher Keypad */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-[10px] text-stone-500 font-bold uppercase mr-1">CH:</span>
            {cameras.slice(0, 16).map(c => (
              <button
                key={c.camera_id}
                onClick={() => switchChannel(c.channel_num || 1)}
                className={`w-7 h-6 rounded flex items-center justify-center text-[10px] font-black tracking-tight border transition-all relative ${
                  activeChannel === c.channel_num
                    ? 'bg-red-600 text-white border-red-400 shadow-[0_0_10px_rgba(255,0,0,0.8)] scale-110'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white hover:border-stone-600'
                }`}
                title={`Canal ${(c.channel_num || 1).toString().padStart(2, '0')}: ${c.title}`}
              >
                {c.channel_num?.toString().padStart(2, '0')}
                {c.is_custom && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-1 ring-black" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          80s RETRO CRT MOSAIC VIDEO WALL
          ========================================================================= */}
      
      {/* 1. MASTER + CAROUSEL LAYOUT */}
      {layout === 'master-carousel' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Main Big Master CRT Monitor */}
          <div className="lg:col-span-3">
            <CrtMonitorCard 
              camera={activeMasterCamera}
              theme={theme}
              themeConfig={currentThemeConfig}
              showOsd={showOsd}
              isMaster={true}
              isActive={true}
              currentTime={currentTime}
              onClick={() => setSelectedCam(activeMasterCamera)}
              onTune={() => openTunerForChannel(activeMasterCamera.channel_num || 1)}
            />
          </div>

          {/* Side Carousel CRT Stack */}
          <div className="flex flex-col gap-3 max-h-[85vh] overflow-y-auto pr-1">
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-widest bg-stone-900/80 p-2 rounded border border-stone-800 flex justify-between">
              <span>FEED CAROUSEL</span>
              <span className="text-cyan-400">{filteredCameras.length} CH</span>
            </div>
            {filteredCameras.map(cam => (
              <div 
                key={cam.camera_id} 
                onClick={() => switchChannel(cam.channel_num || 1)}
                className={`cursor-pointer transition-all ${
                  activeChannel === cam.channel_num ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'opacity-75 hover:opacity-100'
                }`}
              >
                <CrtMonitorCard 
                  camera={cam}
                  theme={theme}
                  themeConfig={currentThemeConfig}
                  showOsd={showOsd}
                  isMaster={false}
                  isActive={activeChannel === cam.channel_num}
                  currentTime={currentTime}
                  onClick={() => switchChannel(cam.channel_num || 1)}
                  onTune={() => openTunerForChannel(cam.channel_num || 1)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SINGLE FOCUS LAYOUT */}
      {layout === 'single-focus' && (
        <div className="max-w-5xl mx-auto">
          <CrtMonitorCard 
            camera={activeMasterCamera}
            theme={theme}
            themeConfig={currentThemeConfig}
            showOsd={showOsd}
            isMaster={true}
            isActive={true}
            currentTime={currentTime}
            onClick={() => setSelectedCam(activeMasterCamera)}
            onTune={() => openTunerForChannel(activeMasterCamera.channel_num || 1)}
          />
        </div>
      )}

      {/* 3. MULTI-MONITOR WALL (4x4, 3x3, 2x2) */}
      {(layout === '4x4' || layout === '3x3' || layout === '2x2') && (
        <div className={`grid gap-4 ${
          layout === '4x4' 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4' 
            : layout === '3x3'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {filteredCameras.slice(0, layout === '4x4' ? 16 : layout === '3x3' ? 9 : 4).map(cam => (
            <div 
              key={cam.camera_id}
              onClick={() => {
                setActiveChannel(cam.channel_num || 1);
                if (soundEnabled) audioFX.playChannelSwitch();
              }}
            >
              <CrtMonitorCard 
                camera={cam}
                theme={theme}
                themeConfig={currentThemeConfig}
                showOsd={showOsd}
                isMaster={false}
                isActive={activeChannel === cam.channel_num}
                currentTime={currentTime}
                onClick={() => setSelectedCam(cam)}
                onTune={() => openTunerForChannel(cam.channel_num || 1)}
              />
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          SINTONIZADOR LIBRE & EXPLORADOR DE YOUTUBE / PORTALES MODAL
          ========================================================================= */}
      {showTunerModal && (
        <div className="fixed inset-0 z-[9700] flex items-center justify-center p-3 md:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-stone-950 rounded-2xl overflow-hidden border-4 border-red-600 shadow-[0_0_90px_rgba(239,68,68,0.35)] flex flex-col font-mono">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-stone-900 px-5 py-3 border-b-2 border-red-700 text-stone-200">
              <div className="flex items-center gap-3">
                <YouTubeIcon className="w-6 h-6 text-red-500 animate-pulse" />
                <div>
                  <h2 className="font-black text-sm md:text-base tracking-widest uppercase text-white flex items-center gap-2">
                    SINTONIZADOR LIBRE & EXPLORADOR DE YOUTUBE // V8.4
                  </h2>
                  <p className="text-[10px] text-stone-400">
                    Sintoniza cualquier transmisión en vivo, enlace o ID de YouTube directamente en la matriz CRT.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowTunerModal(false)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-stone-800 bg-stone-900/60 px-4 pt-2 gap-2 text-xs">
              <button
                onClick={() => setTunerTab('custom')}
                className={`px-4 py-2 font-bold uppercase rounded-t-lg transition-all border-t-2 border-x-2 ${
                  tunerTab === 'custom'
                    ? 'bg-stone-950 border-red-500 text-red-400 shadow'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                📺 Sintonizador de URL Libre
              </button>
              <button
                onClick={() => setTunerTab('presets')}
                className={`px-4 py-2 font-bold uppercase rounded-t-lg transition-all border-t-2 border-x-2 ${
                  tunerTab === 'presets'
                    ? 'bg-stone-950 border-cyan-500 text-cyan-400 shadow'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                🌐 Presets en Vivo (1-Click)
              </button>
              <button
                onClick={() => setTunerTab('search')}
                className={`px-4 py-2 font-bold uppercase rounded-t-lg transition-all border-t-2 border-x-2 ${
                  tunerTab === 'search'
                    ? 'bg-stone-950 border-yellow-500 text-yellow-400 shadow'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                🔍 Búsquedas en YouTube Live
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 md:p-6 overflow-y-auto space-y-4">
              
              {/* Feedback Alert */}
              {tunerFeedbackMsg && (
                <div className={`p-3 rounded-lg text-xs font-bold flex items-center justify-between border ${
                  tunerFeedbackMsg.type === 'success' 
                    ? 'bg-green-950/80 border-green-500 text-green-300' 
                    : 'bg-red-950/80 border-red-500 text-red-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {tunerFeedbackMsg.type === 'success' ? <Check className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    <span>{tunerFeedbackMsg.text}</span>
                  </div>
                  <button onClick={() => setTunerFeedbackMsg(null)} className="text-stone-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* TAB 1: CUSTOM TUNER */}
              {tunerTab === 'custom' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Controls Form */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    {/* Target Channel Selector */}
                    <div>
                      <label className="block text-xs font-bold text-stone-300 uppercase mb-1 flex items-center gap-2">
                        <Tv className="w-3.5 h-3.5 text-red-400" />
                        1. Seleccionar Monitor / Canal Destino:
                      </label>
                      <div className="grid grid-cols-8 sm:grid-cols-8 gap-1.5">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const ch = i + 1;
                          const cam = cameras.find(c => c.channel_num === ch);
                          const isCustom = cam?.is_custom;
                          return (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => {
                                setTunerTargetChannel(ch);
                                if (cam) {
                                  setTunerUrlInput(getYouTubeWatchUrl(cam.stream_url));
                                  setTunerTitleInput(cam.title);
                                  setTunerRegionInput(cam.ocean_region || 'Personalizado');
                                  setTunerBriefingInput(cam.short_briefing || cam.description || '');
                                }
                              }}
                              className={`p-1.5 rounded text-center text-xs font-black transition-all border relative ${
                                tunerTargetChannel === ch
                                  ? 'bg-red-600 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)] scale-105'
                                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-600'
                              }`}
                            >
                              CH-{ch.toString().padStart(2, '0')}
                              {isCustom && <span className="block text-[8px] text-cyan-300 font-normal">CUST</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* YouTube URL or Stream Link Input */}
                    <div>
                      <label className="block text-xs font-bold text-stone-300 uppercase mb-1 flex items-center gap-2">
                        <Link className="w-3.5 h-3.5 text-cyan-400" />
                        2. Enlace de YouTube, ID de Video o Stream:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tunerUrlInput}
                          onChange={e => setTunerUrlInput(e.target.value)}
                          placeholder="Ej: https://www.youtube.com/watch?v=EqOht47LAMw o EqOht47LAMw"
                          className="flex-1 bg-black border-2 border-stone-700 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-600 outline-none font-mono"
                        />
                        {tunerUrlInput && (
                          <a
                            href={getYouTubeWatchUrl(tunerUrlInput)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1 border border-stone-700 shrink-0"
                            title="Abrir en YouTube libremente en nueva pestaña"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                            <span>Ver en YouTube</span>
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        Soporta enlaces de YouTube completos, enlaces cortos (youtu.be), directos (/live), transmisiones HLS o IDs de 11 caracteres.
                      </p>
                    </div>

                    {/* Custom Title & Region */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1">
                          Título de la Estación / Transmisión:
                        </label>
                        <input
                          type="text"
                          value={tunerTitleInput}
                          onChange={e => setTunerTitleInput(e.target.value)}
                          placeholder="Ej: Base Esperanza — Península Antártica"
                          className="w-full bg-black border border-stone-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1">
                          Región Geográfica:
                        </label>
                        <input
                          type="text"
                          value={tunerRegionInput}
                          onChange={e => setTunerRegionInput(e.target.value)}
                          placeholder="Ej: Antártida, Pelágico, Ártico"
                          className="w-full bg-black border border-stone-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Short Description */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1">
                        Resumen Táctico en Vivo ("Qué se observa cortamente"):
                      </label>
                      <textarea
                        value={tunerBriefingInput}
                        onChange={e => setTunerBriefingInput(e.target.value)}
                        placeholder="Descripción concisa que aparecerá al pasar el cursor sobre la pantalla CRT..."
                        rows={2}
                        className="w-full bg-black border border-stone-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none resize-none"
                      />
                    </div>

                    {/* Action Pushbuttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={handleResetToDefaults}
                        className="px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition-colors"
                        title="Restaurar las 16 cámaras originales de fábrica"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restaurar Todo de Fábrica
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyCustomStream}
                        className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-95 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Sintonizar Canal CH-{tunerTargetChannel.toString().padStart(2, '0')}
                      </button>
                    </div>

                  </div>

                  {/* Right Live CRT Preview Box */}
                  <div className="bg-stone-900/90 rounded-xl p-4 border-2 border-stone-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-stone-800 text-xs font-bold text-stone-400 uppercase">
                        <span>Monitor de Prueba CH-{tunerTargetChannel.toString().padStart(2, '0')}</span>
                        <span className="text-red-400 animate-pulse font-mono">● PREVIEW</span>
                      </div>

                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-stone-700 shadow-inner">
                        {extractYouTubeId(tunerUrlInput) ? (
                          <iframe
                            src={buildYouTubeEmbedUrl(extractYouTubeId(tunerUrlInput)!)}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title="Preview"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 text-xs text-center p-3">
                            <Tv className="w-8 h-8 mb-2 opacity-50" />
                            <span>Pega un enlace de YouTube para previsualizar</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 p-2 bg-black/60 rounded border border-stone-800 text-[11px] space-y-1">
                        <div className="text-white font-bold truncate">
                          {tunerTitleInput || `Canal ${tunerTargetChannel.toString().padStart(2, '0')}`}
                        </div>
                        <div className="text-stone-400 text-[10px] line-clamp-2">
                          {tunerBriefingInput || 'Sin descripción asignada.'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-500">
                      <span>Formato: NTSC 525L</span>
                      <span className="text-cyan-400 font-bold">READY</span>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: CURATED PRESETS */}
              {tunerTab === 'presets' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-stone-900/70 p-3 rounded-lg border border-stone-800 text-xs">
                    <span className="text-stone-300">
                      Selecciona cualquier transmisión oficial y asígnala al <strong>CH-{tunerTargetChannel.toString().padStart(2, '0')}</strong> o ábrela directamente en YouTube:
                    </span>
                    <span className="text-cyan-400 font-bold font-mono">
                      Canal Destino: CH-{tunerTargetChannel.toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {YOUTUBE_STREAM_PRESETS.map(p => (
                      <div 
                        key={p.id}
                        className="bg-stone-900/90 rounded-xl p-3 border-2 border-stone-800 hover:border-cyan-500 transition-all flex flex-col justify-between shadow group"
                      >
                        <div>
                          <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-black">
                            <img
                              src={`https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-85 group-hover:opacity-100"
                            />
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-[9px] font-black text-cyan-300 border border-cyan-800 font-mono">
                              {p.category}
                            </div>
                            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-red-950 text-[8px] font-black text-red-400 border border-red-700 flex items-center gap-1">
                              <YouTubeIcon className="w-2.5 h-2.5" /> YT
                            </div>
                          </div>

                          <h3 className="text-xs font-bold text-white leading-tight line-clamp-1">{p.title}</h3>
                          <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">{p.operator}</p>
                          <p className="text-[11px] text-stone-300 mt-1 line-clamp-2 leading-relaxed font-sans">{p.briefing}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-stone-800 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTunePreset(p)}
                            className="flex-1 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                          >
                            <Tv className="w-3 h-3" />
                            Sintonizar CH-{tunerTargetChannel.toString().padStart(2, '0')}
                          </button>
                          
                          <a
                            href={`https://www.youtube.com/watch?v=${p.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-red-400 hover:text-white border border-stone-700"
                            title="Abrir en YouTube Libre"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: YOUTUBE SEARCH SHORTCUTS */}
              {tunerTab === 'search' && (
                <div className="space-y-4">
                  <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                      <Search className="w-4 h-4 text-yellow-400" />
                      Explorador de Transmisiones Libres en YouTube
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Haz clic en cualquiera de estas búsquedas especializadas para abrir directamente en YouTube las transmisiones en vivo más recientes de expediciones polares y oceanográficas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {YOUTUBE_SEARCH_SHORTCUTS.map((s, idx) => (
                      <div 
                        key={idx}
                        className="bg-stone-900 p-4 rounded-xl border-2 border-stone-800 hover:border-yellow-500 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{s.icon}</span>
                            <div>
                              <h4 className="text-xs font-bold text-white">{s.title}</h4>
                              <span className="text-[10px] text-stone-400 font-mono">Búsqueda: "{s.query}"</span>
                            </div>
                          </div>
                          <p className="text-xs text-stone-300 leading-relaxed font-sans">{s.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-800 flex justify-between items-center">
                          <span className="text-[10px] text-stone-500 font-mono">Filtro: En Vivo / 4K</span>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Abrir en YouTube
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-3 bg-stone-900 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
              <span className="text-[11px]">Control de sintonización federado NTSC / AMOH Matrix</span>
              <button
                onClick={() => setShowTunerModal(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase"
              >
                Cerrar Sintonizador
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          DIRECTORY MODAL (TODAS LAS CÁMARAS DISPONIBLES)
          ========================================================================= */}
      {showDirectory && (
        <div className="fixed inset-0 z-[9600] flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-stone-950 rounded-2xl overflow-hidden border-4 border-cyan-700 shadow-[0_0_90px_rgba(0,255,255,0.3)] flex flex-col">
            
            {/* Directory Header */}
            <div className="flex justify-between items-center bg-stone-900 px-5 py-3 border-b-2 border-cyan-800 text-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <h2 className="font-bold text-base tracking-widest uppercase text-cyan-300">
                  GUÍA Y DIRECTORIO GLOBAL DE CÁMARAS OCEÁNICAS // 16 CANALES
                </h2>
              </div>
              
              <button 
                onClick={() => setShowDirectory(false)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Directory Grid */}
            <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-stone-950/80">
              {cameras.map(cam => (
                <div 
                  key={cam.camera_id}
                  onClick={() => {
                    setActiveChannel(cam.channel_num || 1);
                    setSelectedCam(cam);
                    setShowDirectory(false);
                    if (soundEnabled) audioFX.playChannelSwitch();
                  }}
                  className="group bg-stone-900/90 hover:bg-stone-850 rounded-xl p-3 border-2 border-stone-800 hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between shadow hover:shadow-cyan-500/20"
                >
                  <div>
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-black">
                      <img 
                        src={cam.thumbnail_url || 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800'}
                        alt={cam.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-black text-cyan-300 border border-cyan-800 font-mono">
                        CH-{(cam.channel_num || 1).toString().padStart(2, '0')}
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-green-950 text-[8px] font-black text-green-400 border border-green-700">
                        {cam.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-bold uppercase mb-0.5">
                      <Globe className="w-3 h-3" /> {cam.ocean_region}
                    </div>

                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                      {cam.title}
                    </h3>

                    <p className="text-[11px] text-stone-300 mt-1 line-clamp-2 leading-relaxed font-sans">
                      {cam.short_briefing || cam.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-800 flex justify-between items-center text-[9px] font-mono text-stone-400">
                    <span>{cam.telemetry?.waterTemp || '-1.2°C'}</span>
                    <span className="text-cyan-400 group-hover:underline flex items-center gap-1 font-bold">
                      SINTONIZAR ▶
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-stone-900 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
              <span>Transmisiones científicas federadas polar y oceánica continua.</span>
              <button
                onClick={() => setShowDirectory(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs uppercase"
              >
                Cerrar Directorio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VINTAGE MASTER CRT INSPECTION MODAL (FULL TELEMETRY & CONTROLS)
          ========================================================================= */}
      {selectedCam && (
        <div className="fixed inset-0 z-[9500] flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-stone-950 rounded-2xl overflow-hidden border-4 border-stone-700 shadow-[0_0_80px_rgba(0,0,0,0.95)]">
            
            {/* Modal Header Bar */}
            <div className="flex justify-between items-center bg-stone-900 px-4 py-2.5 border-b-2 border-stone-700 text-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-sm tracking-widest uppercase text-cyan-300">
                  MASTER SURVEILLANCE CONSOLE // CH-{(selectedCam.channel_num || 1).toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-stone-400">[{selectedCam.frequency || 'VHF 156.8 MHz'}]</span>
              </div>
              
              <button 
                onClick={() => setSelectedCam(null)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                title="Close console"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
              
              {/* Main CRT Video Player */}
              <div className="lg:col-span-2 aspect-video bg-black relative border-r-2 border-stone-800 overflow-hidden flex items-center justify-center">
                
                {/* Active Live Video Stream */}
                {selectedCam.stream_url.includes('youtube') || selectedCam.stream_url.includes('embed') ? (
                  <iframe
                    src={selectedCam.stream_url.replace('mute=1', 'mute=0')}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedCam.title}
                    style={{ filter: currentThemeConfig.phosphorFilter }}
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={selectedCam.thumbnail_url || 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800'}
                      alt={selectedCam.title}
                      className="w-full h-full object-cover opacity-80"
                      style={{ filter: currentThemeConfig.phosphorFilter }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs text-cyan-300 font-mono text-xs p-4 text-center">
                      <Radio className="w-8 h-8 mb-2 animate-spin text-cyan-400" />
                      <p className="font-bold tracking-widest uppercase">ENCRYPTED POLAR STREAM</p>
                      <p className="opacity-80 text-[10px] mt-1">{selectedCam.stream_url}</p>
                    </div>
                  </div>
                )}

                {/* VCR OSD Overlay in Modal */}
                <div className="absolute top-3 left-3 z-30 pointer-events-none text-xs text-green-400 font-black drop-shadow-[0_0_6px_rgba(0,255,0,0.8)]">
                  <div>● REC  SP 0:02:15</div>
                  <div className="text-[10px] text-cyan-300">{currentTime}</div>
                </div>
                
                <div className="absolute bottom-3 right-3 z-30 pointer-events-none text-[10px] text-yellow-300 font-black">
                  LAT: {selectedCam.latitude.toFixed(4)}° | LNG: {selectedCam.longitude.toFixed(4)}°
                </div>
              </div>

              {/* Station Telemetry & Details Panel */}
              <div className="p-5 flex flex-col justify-between bg-stone-900/95 text-stone-200">
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-cyan-950 border border-cyan-500 text-cyan-300 uppercase">
                        {selectedCam.platform_type || 'OBSERVATORY'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-green-950 border border-green-500 text-green-300 uppercase">
                        {selectedCam.status}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white tracking-wide">{selectedCam.title}</h2>
                    <p className="text-xs text-cyan-200 mt-1 font-bold leading-relaxed font-sans">
                      {selectedCam.short_briefing}
                    </p>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed font-sans">
                      {selectedCam.description || 'Federated continuous optical observation post.'}
                    </p>
                  </div>

                  {/* Scientific Telemetry Box */}
                  <div className="p-3 bg-black/60 rounded-xl border border-stone-800 space-y-2 text-xs">
                    <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase flex items-center gap-1 border-b border-stone-800 pb-1">
                      <Activity className="w-3 h-3 text-cyan-400" /> Real-Time Telemetry:
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-stone-500 block text-[9px]">WATER TEMP:</span>
                        <span className="text-cyan-300 font-bold">{selectedCam.telemetry?.waterTemp || '-1.2°C'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px]">WIND VECTOR:</span>
                        <span className="text-yellow-300 font-bold">{selectedCam.telemetry?.windKnots || '24 kts W'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px]">ICE COVER:</span>
                        <span className="text-stone-200 font-bold">{selectedCam.telemetry?.iceCover || '45% Pack'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px]">SIGNAL LOCK:</span>
                        <span className="text-green-400 font-bold">{selectedCam.telemetry?.signalDb || 98}% [LOCK]</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata List */}
                  <div className="space-y-2 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate"><strong>Region:</strong> {selectedCam.ocean_region || 'Antarctica'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Coordinates:</strong> {selectedCam.latitude.toFixed(4)}°, {selectedCam.longitude.toFixed(4)}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span className="truncate"><strong>Operator:</strong> {selectedCam.operator || 'Polar Agency'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-stone-800 space-y-2">
                  
                  {/* Open in YouTube Direct */}
                  <a
                    href={getYouTubeWatchUrl(selectedCam.stream_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-red-700"
                  >
                    <YouTubeIcon className="w-4 h-4 text-red-400" />
                    Abrir Transmisión Libre en YouTube
                  </a>

                  {/* Switch/Tune Stream */}
                  <button
                    onClick={() => {
                      setSelectedCam(null);
                      openTunerForChannel(selectedCam.channel_num || 1);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-stone-700"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    Sintonizar / Cambiar Stream de este Canal
                  </button>

                  {selectedCam.public_page_url && (
                    <a
                      href={selectedCam.public_page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-stone-800"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Portal Web Oficial del Operador
                    </a>
                  )}

                  <button 
                    onClick={() => setSelectedCam(null)}
                    className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs uppercase tracking-wider transition-colors shadow-lg"
                  >
                    Cerrar Consola
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// RETRO 80s CRT SURVEILLANCE MONITOR COMPONENT
// =========================================================================
interface CrtMonitorCardProps {
  camera: Camera;
  theme: PhosphorTheme;
  themeConfig: typeof THEME_STYLES[PhosphorTheme];
  showOsd: boolean;
  isMaster: boolean;
  isActive: boolean;
  currentTime: string;
  onClick: () => void;
  onTune?: () => void;
}

function CrtMonitorCard({
  camera,
  themeConfig,
  showOsd,
  isMaster,
  isActive,
  currentTime,
  onClick,
  onTune
}: CrtMonitorCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isPlayingLive, setIsPlayingLive] = useState(isActive || isMaster);

  useEffect(() => {
    if (isActive || isMaster) {
      setIsPlayingLive(true);
    }
  }, [isActive, isMaster]);

  const isYouTubeEmbed = camera.stream_url.includes('youtube') || camera.stream_url.includes('embed');
  const timeOnly = currentTime ? currentTime.split('  ')[1] || currentTime : '00:00:00 UTC';

  return (
    <div 
      onClick={onClick}
      className={`group relative rounded-2xl bg-stone-900 border-4 ${
        isActive ? 'border-cyan-400 shadow-[0_0_30px_rgba(0,229,255,0.5)]' : 'border-stone-800 hover:border-stone-600'
      } p-2 transition-all duration-300 cursor-pointer flex flex-col justify-between`}
      style={{
        boxShadow: isActive ? 'inset 0 0 20px rgba(0,255,255,0.25), 0 8px 30px rgba(0,0,0,0.9)' : 'inset 0 0 10px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)'
      }}
    >
      {/* Vintage CRT Top Casing Label & Chassis Screws */}
      <div className="flex justify-between items-center px-2 py-1 mb-1 text-[9px] font-black tracking-widest text-stone-400 uppercase">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]' : 'bg-red-900'}`} />
          <span className={isActive ? 'text-green-400 font-bold' : 'text-stone-300'}>
            CH-{(camera.channel_num || 1).toString().padStart(2, '0')}
          </span>
          <span className="text-stone-600">//</span>
          <span className="text-cyan-300 truncate max-w-[140px] font-bold">{camera.title.split('—')[0]}</span>
          {camera.is_custom && (
            <span className="px-1 py-0.2 rounded bg-red-950 text-red-300 border border-red-700 text-[7px] font-bold">
              CUSTOM
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-[8px] font-mono">{camera.frequency || '156.80 MHz'}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-stone-700" />
        </div>
      </div>

      {/* Curved CRT Glass Tube Frame */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border-2 border-stone-800 shadow-inner">
        
        {/* Background Visual Feed Poster */}
        <img
          src={imgError ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800' : (camera.thumbnail_url || 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800')}
          alt={camera.title}
          onError={() => setImgError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isActive && isYouTubeEmbed ? 'opacity-20' : 'opacity-85 group-hover:opacity-100'
          }`}
          style={{ filter: themeConfig.phosphorFilter }}
        />

        {/* Live Active YouTube Embed for Focused / Active Monitor */}
        {isActive && isYouTubeEmbed && isPlayingLive && (
          <iframe
            src={camera.stream_url}
            className="absolute inset-0 w-full h-full border-0 z-10 pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            tabIndex={-1}
            title={camera.title}
            style={{ filter: themeConfig.phosphorFilter }}
          />
        )}

        {/* CRT Glass Reflection & Inner Shadow */}
        <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_35px_rgba(0,0,0,0.9)] rounded-xl" />
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent z-20 rounded-t-xl" />

        {/* 1980s VCR OSD Overlay */}
        {showOsd && (
          <>
            {/* Top OSD Bar */}
            <div className="absolute top-2 left-2 right-2 z-30 pointer-events-none flex justify-between items-start text-[10px] font-black tracking-widest drop-shadow-[0_0_6px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-1.5 text-red-400 bg-black/65 px-2 py-0.5 rounded border border-red-900/60 backdrop-blur-xs">
                <span className="animate-ping inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>REC</span>
                <span className="text-white">SP</span>
              </div>
              <div className="text-yellow-300 font-mono bg-black/65 px-2 py-0.5 rounded border border-yellow-900/60 text-[9px] font-bold">
                CH-{(camera.channel_num || 1).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Bottom OSD Bar */}
            <div className="absolute bottom-2 left-2 right-2 z-30 pointer-events-none flex justify-between items-end text-[9px] font-mono font-bold tracking-wider text-cyan-300 drop-shadow-[0_0_6px_rgba(0,0,0,1)]">
              <div className="bg-black/70 px-2 py-0.5 rounded border border-cyan-950">
                <div className="text-[9px] text-cyan-200">{timeOnly}</div>
                <div className="text-[8px] text-stone-300 uppercase">{camera.ocean_region || 'ANTARCTIC'}</div>
              </div>
              <div className="bg-black/70 px-2 py-0.5 rounded text-right text-[8px] text-green-400 border border-green-950">
                <div>TEMP: {camera.telemetry?.waterTemp || '-1.2°C'}</div>
                <div className="text-stone-300">{camera.latitude.toFixed(2)}°, {camera.longitude.toFixed(2)}°</div>
              </div>
            </div>
          </>
        )}

        {/* =========================================================================
            80s CRT TACTICAL HOVER HUD BRIEFING OVERLAY ("QUÉ HAY CORTAMENTE")
            ========================================================================= */}
        <div className="absolute inset-0 bg-stone-950/92 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 p-2.5 md:p-3 flex flex-col justify-between border-2 border-cyan-400 rounded-xl shadow-[0_0_30px_rgba(0,229,255,0.45)]">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-cyan-900/80 pb-1.5">
            <div className="pr-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest font-mono">
                  CH-{(camera.channel_num || 1).toString().padStart(2, '0')} // {camera.platform_type?.toUpperCase() || 'OPTICAL'}
                </span>
              </div>
              <h3 className="text-xs font-black text-white leading-tight mt-0.5 line-clamp-1">{camera.title}</h3>
            </div>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase font-bold shrink-0">
              {camera.ocean_region}
            </span>
          </div>

          {/* Short Briefing */}
          <div className="my-1 bg-black/70 p-2 rounded-lg border border-stone-800">
            <div className="text-[9px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1 font-mono">
              <Eye className="w-3 h-3 text-amber-400" /> ¿QUÉ SE OBSERVA EN VIVO?
            </div>
            <p className="text-[11px] text-stone-200 font-sans leading-snug line-clamp-3">
              {camera.short_briefing || camera.description}
            </p>
          </div>

          {/* Micro Telemetry & Actions */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1 text-[8px] font-mono bg-stone-900/90 px-2 py-0.5 rounded border border-stone-700 text-stone-300">
              <div>🌡️ <span className="text-cyan-300 font-bold">{camera.telemetry?.waterTemp || '-1.2°C'}</span></div>
              <div>💨 <span className="text-yellow-300 font-bold">{camera.telemetry?.windKnots || '18 kts'}</span></div>
              <div>🧊 <span className="text-stone-200 font-bold">{camera.telemetry?.iceCover || '0%'}</span></div>
              <div>📍 <span className="text-green-400 font-bold">{camera.latitude.toFixed(1)}°, {camera.longitude.toFixed(1)}°</span></div>
            </div>

            <div className="flex items-center gap-1">
              <div 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="flex-1 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-black tracking-widest uppercase flex items-center justify-center gap-1 shadow transition-transform active:scale-95"
              >
                <Maximize2 className="w-3 h-3" />
                AMPLIAR
              </div>
              
              {onTune && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onTune(); }}
                  className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow transition-colors"
                  title="Sintonizar otro stream en este monitor"
                >
                  <YouTubeIcon className="w-3 h-3 text-red-400" />
                  SINTONIZAR
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Vintage CRT Bottom Controls Bezel */}
      <div className="mt-2 px-2 py-1 flex justify-between items-center text-[10px] text-stone-400">
        <div className="truncate font-bold text-stone-300 text-[10px]">
          {camera.operator || 'POLAR STATION'}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
            camera.status === 'LIVE' ? 'bg-green-950 text-green-400 border border-green-700 shadow-[0_0_6px_rgba(34,197,94,0.3)]' : 'bg-stone-800 text-stone-400'
          }`}>
            {camera.status}
          </span>
          <div className="w-2.5 h-2.5 rounded-full bg-stone-800 border border-stone-600 shadow-inner" title="Manual Potentiometer" />
        </div>
      </div>
    </div>
  );
}
