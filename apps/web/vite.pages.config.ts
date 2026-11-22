// OLEA — build para GitHub Pages (solo lectura, no toca vite.config.ts).
// Publica el app completo bajo /antarctic-maritime-observation-hub/ (o VITE_PUBLIC_BASE).
// Uso:  VITE_PUBLIC_BASE=/antarctic-maritime-observation-hub/ pnpm --filter @amoh/web build:pages
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { maplibreWorkerAssets } from './scripts/maplibre-worker-assets.ts'

const BASE = process.env.VITE_PUBLIC_BASE || '/antarctic-maritime-observation-hub/'

// --- i18n V20 (idéntico a vite.config.ts) ---
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

// --- Reescritura de rutas absolutas de /public hacia la subruta de Pages ---
// El código fuente referencia '/data/...', '/sdg-icons/...', etc. asumiendo que el app
// vive en la raíz del dominio. En Pages vive en una subcarpeta, así que prefijamos.
const PUBLIC_DIRS = ['amoh-i18n', 'amoh', 'brand', 'cesium', 'data', 'exports', 'fonts', 'sdg-icons', 'vendor']
const PUBLIC_FILES = [
  'amoh-logo.png', 'amoh-logo.webp', 'amoh-master-emblem.svg', 'amoh-symbol.svg',
  'antarctic_marine_monitoring.csv', 'favicon.svg', 'icons.svg',
  'olea-crest.svg', 'olea-logo.svg', 'olea-symbol.svg', 'polar-icons.svg',
  'map_verification_all_active.png', 'map_verification_final.png', 'map_verification_latest.png',
]
const DIR_RE = new RegExp(String.raw`(["'\`(])\/(` + PUBLIC_DIRS.join('|') + String.raw`)\/`, 'g')
const FILE_RE = new RegExp(
  String.raw`(["'\`(])\/(` + PUBLIC_FILES.map((f) => f.replace(/\./g, String.raw`\.`)).join('|') + String.raw`)`,
  'g',
)

function oleaPagesBasePaths(): Plugin {
  let hits = 0
  return {
    name: 'olea-pages-base-paths',
    enforce: 'post',
    apply: 'build',
    transform(code, id) {
      const f = id.replace(/\\/g, '/')
      if (!f.includes('/src/') || f.includes('/node_modules/')) return null
      if (!/\.(tsx?|jsx?|css|mts|cts)($|\?)/.test(f)) return null
      if (!code.includes('/')) return null
      const out = code.replace(DIR_RE, (_m, q, d) => `${q}${BASE}${d}/`).replace(FILE_RE, (_m, q, n) => `${q}${BASE}${n}`)
      if (out === code) return null
      hits += 1
      return { code: out, map: null }
    },
    // El <head> de index.html referencia /olea-symbol.svg y /olea-crest.svg con
    // ruta absoluta; Vite no les aplica el base, asi que lo hacemos aqui.
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string) {
        const fixed = html
          .replace(DIR_RE, (_m: string, q: string, d: string) => `${q}${BASE}${d}/`)
          .replace(FILE_RE, (_m: string, q: string, n: string) => `${q}${BASE}${n}`)
        // Sin backend en Pages: las GET a /api/... se sirven desde las respuestas
        // congeladas del backend local (public/api-static, ver snapshot_api.ps1).
        const shim = `<script>(function(){var B=${JSON.stringify(BASE)};var of=window.fetch.bind(window);window.fetch=function(i,o){try{var m=((o&&o.method)||(i&&i.method)||'GET').toUpperCase();var u=typeof i==='string'?i:(i&&i.url)||'';if(m==='GET'&&u.indexOf('/api/')===0){var q=u.indexOf('?');var p=(q<0?u:u.slice(0,q)).slice(5).replace(/\\/+$/,'');if(p.indexOf('amoh-data/')===0){return of(B+'data/'+p.slice(10),o);}if(p.indexOf('ocean/point')===0){var ma=u.match(/lat=(-?[0-9.]+)/),mo=u.match(/lon=(-?[0-9.]+)/);if(ma&&mo){var la=Math.round(parseFloat(ma[1])/3)*3;if(la>-60)la=-60;if(la< -78)la=-78;var lo=Math.round(parseFloat(mo[1])/10)*10;if(lo>=180)lo-=360;if(lo< -180)lo+=360;return of(B+'api-static/ocean/point/'+la+'_'+lo+'.json',o);}}if(['ais','aviation','satellites'].includes(p.split('/')[0])){var T=${JSON.stringify(process.env.VITE_TRAFFIC_API_URL || process.env.VITE_API_URL || '')};return T?of(new URL(u,T),o):Promise.resolve(new Response(null,{status:503}));}if(p){return of(B+'api-static/'+p+'.json',o).then(function(r){return r.ok?r:new Response('{"detail":"sin backend: dato no incluido en el snapshot"}',{status:404,headers:{'Content-Type':'application/json'}});}).catch(function(){return new Response('{"detail":"sin backend"}',{status:503,headers:{'Content-Type':'application/json'}});});}}}catch(e){}return of(i,o);};})();</script>`
        return fixed.replace('<head>', '<head>\n    ' + shim)
      },
    },
    buildEnd() {
      this.info(`olea-pages-base-paths: ${hits} archivo(s) reescrito(s) con base ${BASE}`)
    },
  }
}

export default defineConfig({
  base: BASE,
  // public/ se puebla con assets:public (sin el raster de 285 MB) + snapshot:api.
  publicDir: 'public',
  plugins: [oleaI18nJsx(), oleaPagesBasePaths(), maplibreWorkerAssets(), react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  build: {
    outDir: 'dist-pages-olea',
    emptyOutDir: true,
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
})
