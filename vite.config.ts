import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // critical for Cloudflare Pages (fixes broken images)
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [tailwindcss(), react()],
  // No client-side env injection needed — all AI calls go through the
  // secure Cloudflare Pages Functions (/api/trivia, /api/chat).
  // API keys and USE_OPENAI are read server-side by Wrangler / Pages.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for production — prevents exposing source code
  },
})
