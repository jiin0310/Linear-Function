import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Linear-Function/',
  plugins: [react()],
  server: {
    port: 9876,
    strictPort: false,
    open: true
  }
})
