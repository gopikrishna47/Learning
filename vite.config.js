import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import portalData from './build/dataPlugin.mjs'

export default defineConfig({
  plugins: [portalData(), react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Keep framework code in its own long-cached chunk. Content is no
        // longer chunked by hand: src/data/index.js loads per-topic and
        // per-category modules on demand (see build/generate-data.mjs).
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
})
