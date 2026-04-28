import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    base: '/', // ✅ critical for Cloudflare Pages (fixes broken images)
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Only non-sensitive config flags are injected into the client bundle.
      // API keys are NEVER exposed to the frontend — all AI calls go through
      // the secure Cloudflare Pages Functions (/api/trivia, /api/chat).
      'process.env.USE_OPENAI': JSON.stringify(env.USE_OPENAI),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'), // still fine
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
