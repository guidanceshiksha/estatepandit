import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(['/api', '/uploads', '/sitemap.xml', '/robots.txt'].map((p) => [p, 'http://localhost:3001'])),
  },
})
