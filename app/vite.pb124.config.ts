import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.VITE_PUBLIC_BASE || '/',
  publicDir: false,
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  build: {
    target: 'es2022',
    outDir: 'dist-pb124-public',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: resolve(import.meta.dirname, 'pb124-public.html'),
      output: {
        manualChunks(id: string) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router')
          ) return 'vendor-react-core';
          if (id.includes('maplibre-gl')) return 'vendor-maplibre';
          if (id.includes('@turf')) return 'vendor-turf';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('qrcode') || id.includes('canvas-confetti')) return 'vendor-utils';
        },
      },
    },
  },
});
