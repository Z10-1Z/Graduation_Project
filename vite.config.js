import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-dom') || /\/react\//.test(id)) return 'vendor-react'
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('@reduxjs') || id.includes('react-redux')) return 'vendor-redux'
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n'
          if (id.includes('axios')) return 'vendor-axios'
          if (id.includes('lucide-react')) return 'vendor-icons'
        },
      },
    },
  },
  server: {
    port: 5173,
    /** يوجّه طلبات `/api` إلى Laravel على الجهاز المحلي أثناء `npm run dev` (مع VITE_API_BASE_URL=/api). */
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/playwright-report/**', '**/.{idea,git,cache,output,temp}/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    pool: 'threads',
    testTimeout: 10000,
    hookTimeout: 10000,
  },
})
