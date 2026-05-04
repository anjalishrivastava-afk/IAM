import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3333', changeOrigin: true },
    },
  },
  resolve: {
    // Avoid duplicate React / MUI instances (breaks context + styled engines).
    dedupe: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
  },
  optimizeDeps: {
    // MUI X is bundled inside Signal DS; a separate pre-bundle caused
    // "Could not find the Data Grid context" when custom toolbar hooks resolved differently.
    exclude: ['@mui/x-data-grid-pro'],
  },
})
