const API = 'http://127.0.0.1:8002';
const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
let amohMap = null;

function initializeMap() {
  if (amohMap || !byId('map-layer')) return;

  const mapArgs = {
    container: 'map-layer',
    style: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
    center: [-62.0, -64.6],
    zoom: 3.1,
    maxZoom: 12,
    minZoom: 2,
    attributionControl: true,
  };

  amohMap = new maplibregl.Map(mapArgs);
  amohMap.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
  amohMap.addControl(new maplibregl.ScaleControl({ unit: 'metric' }));

  amohMap.on('load', () => {
    amohMap.addSource('observations-layer', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    amohMap.addLayer({
      id: 'observations-layer',
      type: 'circle',
      source: 'observations-layer',
      paint: {
        'circle-radius': 9,
        'circle-color': '#7ee7da',
        'circle-stroke-color': '#eafcff',
        'circle-stroke-width': 1.5,
      },
    });

    amohMap.addSource('ais-layer', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    amohMap.addLayer({
      id: 'ais-layer',
      type: 'circle',
      source: 'ais-layer',
      paint: {
        'circle-radius': 7,
        'circle-color': '#f6c453',
        'circle-stroke-color': '#fff7d6',
        'circle-stroke-width': 1.3,
      },
    });

    amohMap.addSource('public-routes-layer', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    amohMap.addLayer({
      id: 'public-routes-layer',
      type: 'circle',
      source: 'public-routes-layer',
      paint: {
        'circle-radius': 5.8,
        'circle-color': '#9fe4ff',
        'circle-stroke-color': '#dff7ff',
        'circle-stroke-width': 1.5,
      },
    });

    amohMap.addSource('public-route-trace', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    amohMap.addLayer({
      id: 'public-route-trace',
      type: 'line',
      source: 'public-route-trace',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#74d4ff',
        'line-width': 3,
        'line-opacity': 0.9,
      },
    });

    void loadPublicRouteLayer();
  });
}

async function loadPublicRouteLayer() {
  if (!amohMap) return;
  try {
    const response = await fetch(`${API}/api/public-routes/geojson/PB-128`);
    if (!response.ok) throw new Error('Public route layer unavailable');
    const data = await response.json();
    const ordered = data.features
      .slice()
      .sort((a, b) => Number(a.properties.sequence || 0) - Number(b.properties.sequence || 0));

    const trace = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: ordered.map((feature) => feature.geometry.coordinates),
        },
        properties: {
          route_id: 'PB-128',
          label: 'Peace Boat PB-128 route trace',
          evidence_type: 'published_plan',
        },
      }],
    };

    const source = amohMap.getSource('public-routes-layer');
    const traceSource = amohMap.getSource('public-route-trace');
    if (source) source.setData(data);
    if (traceSource) traceSource.setData(trace);

    const summaryResponse = await fetch(`${API}/api/public-routes/summary/PB-128`);
    const summary = summaryResponse.ok ? await summaryResponse.json() : null;
    if (summary) {
      byId('route-title').textContent = summary.title || 'Public route';
      byId('route-operator').textContent = summary.operator || '—';
      byId('route-id').textContent = summary.route_id || '—';
      byId('route-stages').textContent = String(summary.coordinates_ready || 0);
      byId('route-evidence-type').textContent = summary.evidence_type || 'published_plan';
    }
  } catch (error) {
    console.warn('Public route layer not loaded:', error);
  }
}

function renderObservations(items) {
  const table = byId('observations-table');
  const empty = byId('empty-state');
  table.innerHTML = '';
  empty.hidden = items.length > 0;
  items.forEach((item) => {
    const row = document.createElement('tr');
    const position = `${Number(item.latitude).toFixed(3)}, ${Number(item.longitude).toFixed(3)}`;
    const demo = item.is_demo ? 'Demo' : (item.qa_qc_status || 'Unreviewed');
    row.innerHTML = `<td>${escapeHtml(new Date(item.utc).toISOString().replace('T', ' ').slice(0, 16))}</td><td>${escapeHtml(item.observation_type)}</td><td>${escapeHtml(position)}</td><td><span class="tag">${escapeHtml(demo)}</span></td>`;
    table.appendChild(row);
  });
  byId('observation-count').textContent = items.length;
  byId('review-count').textContent = items.filter((item) => item.qa_qc_status === 'unreviewed').length;
}

function plotMapRecords(observations, vessels) {
  const empty = byId('map-empty');
  const records = [
    ...observations.map((item) => ({ latitude: item.latitude, longitude: item.longitude, type: 'field' })),
    ...vessels.map((item) => ({ latitude: item.latitude, longitude: item.longitude, type: 'ais' })),
  ].filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)));

  if (amohMap && amohMap.isStyleLoaded()) {
    const featureCollection = {
      type: 'FeatureCollection',
      features: records.map((item) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(item.longitude), Number(item.latitude)],
        },
        properties: { type: item.type },
      })),
    };
    const observationsSource = amohMap.getSource('observations-layer');
    const aisSource = amohMap.getSource('ais-layer');
    if (observationsSource) observationsSource.setData({
      type: 'FeatureCollection',
      features: featureCollection.features.filter((feature) => feature.properties.type === 'field'),
    });
    if (aisSource) aisSource.setData({
      type: 'FeatureCollection',
      features: featureCollection.features.filter((feature) => feature.properties.type === 'ais'),
    });

    byId('map-record-count').textContent = String(records.length);
    empty.hidden = records.length > 0;
    return;
  }

  const layer = byId('map-layer');
  layer.innerHTML = records.map((item) => {
    const x = ((Number(item.longitude) + 75) / 30) * 1000;
    const y = ((-55 - Number(item.latitude)) / 20) * 520;
    if (x < 0 || x > 1000 || y < 0 || y > 520) return '';
    const color = item.type === 'ais' ? '#f2c500' : '#83d8d0';
    const shape = item.type === 'ais' ? `<path d="M ${x} ${y - 9} l 8 15 h -16 z" fill="${color}" />` : `<circle cx="${x}" cy="${y}" r="7" fill="${color}" />`;
    return `${shape}<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${color}" stroke-opacity=".35" />`;
  }).join('');
  empty.hidden = records.length > 0;
  byId('map-record-count').textContent = records.length;
}

async function refreshMap() {
  try {
    const [observationsResponse, vesselsResponse] = await Promise.all([
      fetch(`${API}/observations/?limit=100`), fetch(`${API}/ais/vessels?limit=100`)
    ]);
    if (!observationsResponse.ok || !vesselsResponse.ok) throw new Error('Map data unavailable');
    const observations = await observationsResponse.json();
    const vessels = await vesselsResponse.json();
    plotMapRecords(observations.observations, vessels.vessels);
    byId('map-live-status').textContent = 'LIVE LOCAL DATA';
    byId('map-last-refresh').textContent = `${new Date().toISOString().slice(11, 16)} UTC`;
  } catch (error) {
    byId('map-live-status').textContent = 'OFFLINE';
  }
}

async function loadWorkspace() {
  try {
    const [healthResponse, observationsResponse, vesselsResponse] = await Promise.all([
      fetch(`${API}/health`), fetch(`${API}/observations/?limit=100`), fetch(`${API}/ais/vessels?limit=100`)
    ]);
    if (!healthResponse.ok || !observationsResponse.ok || !vesselsResponse.ok) throw new Error('Local API unavailable');
    const health = await healthResponse.json();
    const observations = await observationsResponse.json();
    const vessels = await vesselsResponse.json();
    byId('server-status').textContent = 'Local server online';
    byId('server-status').previousElementSibling.style.background = '#62c29b';
    byId('expedition').textContent = health.expedition;
    byId('last-check').textContent = new Date().toISOString().slice(11, 16) + ' UTC';
    byId('ais-count').textContent = vessels.count;
    renderObservations(observations.observations);
  } catch (error) {
    byId('server-status').textContent = 'Local server unavailable';
    console.error('AMOH workspace load failed', error);
    byId('form-message').textContent = `Start FastAPI to capture records. (${error.message})`;
  }
}

async function loadGeeTile() {
  const status = byId('gee-status');
  const message = byId('gee-message');
  const result = byId('gee-result');
  status.textContent = 'REQUESTING';
  message.textContent = 'Contacting Earth Engine through the local backend...';
  try {
    const response = await fetch(`${API}/api/gee/sar-tile`);
    const body = await response.json();
    if (!response.ok) throw new Error(body.detail || 'Earth Engine request failed');
    status.textContent = 'AVAILABLE';
    byId('gee-count').textContent = `${body.image_count} scenes`;
    result.hidden = false;
    message.textContent = 'Tile metadata received. Add a map renderer to display the remote tile URL.';
  } catch (error) {
    status.textContent = 'UNAVAILABLE';
    message.textContent = error.message;
  }
}

byId('observation-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());
  payload.latitude = Number(payload.latitude);
  payload.longitude = Number(payload.longitude);
  payload.accuracy_m = payload.accuracy_m ? Number(payload.accuracy_m) : null;
  payload.is_demo = form.has('is_demo');
  try {
    const response = await fetch(`${API}/observations/`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error('Save failed');
    event.currentTarget.reset();
    byId('form-message').textContent = 'Saved locally. Awaiting review.';
    await loadWorkspace();
  } catch (error) {
    byId('form-message').textContent = 'Could not save. Check the local server.';
  }
});

byId('gee-load').addEventListener('click', loadGeeTile);
byId('map-refresh').addEventListener('click', refreshMap);

initializeMap();
loadWorkspace().then(refreshMap);
setInterval(refreshMap, 15000);
