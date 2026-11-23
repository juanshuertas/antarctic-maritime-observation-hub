import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

const workerFiles = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']

// MapLibre resolves these modules relative to its runtime chunk.
export function maplibreWorkerAssets(): Plugin {
  return {
    name: 'olea-maplibre-worker-assets',
    apply: 'build',
    generateBundle() {
      for (const name of workerFiles) {
        const source = readFileSync(new URL('../node_modules/maplibre-gl/dist/' + name, import.meta.url))
        this.emitFile({ type: 'asset', fileName: 'assets/' + name, source })
      }
    },
  }
}
