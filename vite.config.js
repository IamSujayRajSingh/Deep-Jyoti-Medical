import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
  server: {
    watch: {
      ignored: ['**/.wrangler/**', '**/.original-export-backup/**'],
    },
  },
  plugins: [
    react(),
    // Runs the backend (server/worker.js) inside the dev server using a local
    // copy of Cloudflare's runtime, with a local database and file store kept
    // in .wrangler/. Settings come from wrangler.jsonc.
    cloudflare(),
  ]
});
