import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Inside Docker the API is reachable at the compose service name; running
// Vite directly on the host it's localhost. One config covers both.
const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind 0.0.0.0 so the container is reachable from your Mac
    port: 5173,
    proxy: {
      '/api': apiTarget,
    },
  },
})
