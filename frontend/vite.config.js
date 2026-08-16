import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Flask backend runs on :5000. All /api calls are proxied there so the
// frontend can run on its own dev server without CORS worries.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
