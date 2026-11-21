import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoDir = fileURLToPath(new URL('../../', import.meta.url))
const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
const publishedCommit = 'cb55bb4f27b25ecfc72948d83d69dc4eeb6950e8'
const assets = [
  'amoh', 'amoh-i18n', 'brand', 'cesium', 'fonts', 'sdg-icons', 'vendor',
  'data/catalog', 'data/web/geojson', 'data/web/geophysics',
  'data/ne_antarctic_ice.json', 'data/ne_land.json', 'data/submarine-cables.json',
  'data/colombia_pac_scientific_publications.json', 'data/gistemp-southern-hemisphere-trend.json',
  'amoh-logo.png', 'amoh-logo.webp', 'amoh-master-emblem.svg', 'amoh-symbol.svg',
  'favicon.svg', 'icons.svg', 'olea-crest.svg', 'olea-logo.svg', 'olea-symbol.svg',
  'polar-icons.svg',
]

const temp = mkdtempSync(join(tmpdir(), 'olea-public-assets-'))
try {
  const archive = join(temp, 'assets.tar')
  execFileSync('git', [
    'archive', '--format=tar', '-o', archive, publishedCommit, '--',
    ...assets.map((asset) => 'olea/' + asset),
  ], { cwd: repoDir, stdio: 'inherit' })
  mkdirSync(publicDir, { recursive: true })
  execFileSync('tar', ['-xf', archive, '-C', publicDir, '--strip-components', '1'], { stdio: 'inherit' })
} catch (error) {
  console.error('Comprueba que Git y tar estén disponibles y ejecuta git fetch origin pb124-pages.')
  throw error
} finally {
  rmSync(temp, { recursive: true, force: true })
}
