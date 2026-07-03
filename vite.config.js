import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'robots.txt'],
      manifest: {
        name: 'Citeback — Fight Surveillance',
        short_name: 'Citeback',
        description: 'Document surveillance cameras, fund FOIA requests and lawsuits. C2PA-verified community intelligence.',
        start_url: '/map',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#e63946',
        orientation: 'portrait-primary',
        categories: ['news', 'social', 'utilities'],
        lang: 'en-US',
        scope: '/',
        prefer_related_applications: false,
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/favicon.svg',  sizes: 'any',     type: 'image/svg+xml' },
        ],
        shortcuts: [
          { name: 'Report Camera', short_name: 'Report', url: '/report', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'View Map',      short_name: 'Map',    url: '/map',    icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.basemaps\.cartocdn\.com\/.*$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'map-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 } },
          },
          {
            urlPattern: /^https:\/\/ai\.citeback\.com\/(alpr-us|alpr-by-state|sightings)/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'citeback-api', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 } },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ollama/, ''),
      }
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'vendor-leaflet'
          }
          if (id.includes('node_modules/react-dom') || (id.includes('node_modules/react/') && !id.includes('react-leaflet'))) {
            return 'vendor-react'
          }
        }
      }
    }
  }
})
