import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    force: true,
    include: ['lucide-react', 'framer-motion', 'recharts', 'axios'],
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
})
