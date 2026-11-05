import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Game art is only fetched when that game is on stage, so never inline
    // it into the bundle as base64.
    assetsInlineLimit: (file) => (file.replace(/\\/g, '/').includes('/assets/games/') ? false : undefined),
  },
})
