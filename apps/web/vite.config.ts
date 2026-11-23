import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { maplibreWorkerAssets } from './scripts/maplibre-worker-assets.ts'

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

