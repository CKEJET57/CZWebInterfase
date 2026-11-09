import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ВАШ ПУБЛИЧНЫЙ URL БЭКЕНДА (из вкладки Ports, порт 8000)
const BACKEND_URL = 'https://ominous-guide-4955467969j27jx6-8000.app.github.dev/'

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
        secure: false, // Важно для Codespace (там свои сертификаты)
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
        secure: false,
      },
    },
  },
})