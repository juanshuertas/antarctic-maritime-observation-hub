import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

// OLEA i18n V20: route the automatic JSX runtime of app sources through a thin
// wrapper that translates display strings at render time (no DOM observer).
const OLEA_JSX_DIR = fileURLToPath(new URL('./src/i18n/jsx/', import.meta.url)).replace(/\\/g, '/')
function oleaI18nJsx(): Plugin {
  return {
    name: 'olea-i18n-jsx',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id !== 'react/jsx-runtime' && id !== 'react/jsx-dev-runtime') return null
      if (!importer) return null
      const from = importer.replace(/\\/g, '/')
      if (!from.includes('/src/') || from.includes('/node_modules/')) return null
      if (from.startsWith(OLEA_JSX_DIR) || from.includes('/src/i18n/')) return null
      if (process.env.OLEA_I18N_DISABLE === '1') return null
      return OLEA_JSX_DIR + (id === 'react/jsx-runtime' ? 'jsx-runtime.ts' : 'jsx-dev-runtime.ts')
    },
  }
}

// MapLibre 6 resuelve su worker en tiempo de ejecucion con
//   new URL("./maplibre-gl-worker.mjs", import.meta.url)
// Al construirse el nombre dinamicamente, el bundler no lo detecta y el archivo
// nunca se emite: el fetch da 404, el worker no arranca y NINGUNA fuente GeoJSON
// llega a cargar (el mapa solo muestra el raster). En dev no pasa porque Vite
// sirve el archivo desde node_modules, asi que el bug solo aparece al construir.
// Lo emitimos a mano junto al chunk de maplibre, que es contra quien resuelve
// ese import.meta.url. Mismo plugin que en vite.pages.config.ts: sin esto,
// `npm run build` genera un dist/ con el mapa vacio.
function maplibreWorkerAssets(): Plugin {
  const DIST = fileURLToPath(new URL('./node_modules/maplibre-gl/dist/', import.meta.url))
  const FILES = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']
  return {
    name: 'olea-maplibre-worker-assets',
    apply: 'build',
    generateBundle() {
      for (const name of FILES) {
        this.emitFile({ type: 'asset', fileName: `assets/${name}`, source: readFileSync(DIST + name) })
      }
      this.info(`olea-maplibre-worker-assets: emitidos ${FILES.join(', ')}`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_PUBLIC_BASE || '/',
  plugins: [oleaI18nJsx(), maplibreWorkerAssets(), react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-react-core';
          }
          if (id.includes('maplibre-gl')) return 'vendor-maplibre';
          if (id.includes('@turf')) return 'vendor-turf';
          if (id.includes('lightweight-charts')) return 'vendor-charts';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('qrcode') || id.includes('canvas-confetti')) return 'vendor-utils';
        },
      },
    },
  },
  // Bind to the LAN, not just localhost, so phones on the expedition network
  // can open the app via the edge node's IP (see QrJoinPanel.tsx).
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})

