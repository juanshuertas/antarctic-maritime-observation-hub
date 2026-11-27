import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const base = process.env.OLEA_URL || 'https://juanshuertas.github.io/antarctic-maritime-observation-hub/olea/';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1195, height: 626 } });
  const read = async (path) => {
    const response = await page.request.get(new URL(path, base).href);
    assert.equal(response.status(), 200, path);
    return response;
  };
  const manifest = await (await read('data/heatmaps/index.json')).json();
  for (const [id, row] of Object.entries(manifest)) {
    const response = await read('data/heatmaps/' + id + '.json');
    assert.equal(createHash('sha256').update(await response.body()).digest('hex'), row.sha256, id);
  }
  const response = await page.goto(new URL('observatory/?z=2.2&c=-69.558%2C-35.947', base).href,
    { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => !!window.__amohHeatRuntimeMap);
  const card = page.locator('section[aria-label="Pronóstico oceánico del punto seleccionado"]');
  await page.waitForFunction(() => window.__amohHeatRuntimeMap.isStyleLoaded());
  await page.evaluate(() => {
    const map = window.__amohHeatRuntimeMap;
    const lngLat = { lng: -35.947, lat: -69.558 };
    map.fire('click', { lngLat, point: map.project(lngLat) });
  });
  await card.getByText(/IBCSO v2.*100 km/).waitFor();
  const info = await card.innerText();
  assert.match(info, /69.558°S 35.947°W/);
  assert.match(info, /-4[., ]?336 m/);
  assert.doesNotMatch(info, /doctype|<html/i);
  const layers = {
    fauna_density_heatmap: 'krill_density_heatmap',
    penguin_heatmap: 'penguin_colonies_heatmap',
    whales_heatmap: 'cetaceans_heatmap',
    seismic_heatmap: 'seismic_concentration_heatmap',
    species_migration_heatmap: 'species_migration_heatmap',
  };
  for (const [id, file] of Object.entries(layers)) {
    const status = await page.evaluate(id => window.__amohHeatRuntimeForce(id, true), id);
    assert.equal(status.error, null, id);
    assert.equal(status.layerExists, true, id);
    assert.equal(status.rawFeatures, manifest[file].cells, id);
  }
  console.log(info, '\nVerified five map layers and public SHA-256 hashes.');
} finally {
  await browser.close();
}
