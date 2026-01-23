import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Enable minification
    minify: 'esbuild',
    // Generate source maps for production debugging
    sourcemap: false,
    // Target modern browsers for smaller bundle
    target: 'es2020',
  },
})