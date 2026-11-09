import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ВАШ ПУБЛИЧНЫЙ URL БЭКЕНДА (из вкладки Ports, порт 8000)
const BACKEND_URL = 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
})