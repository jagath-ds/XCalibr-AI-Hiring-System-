import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173', // 👈 IMPORTANT: Change 8000 to your backend's port number
        changeOrigin: true,
        secure: false,      
      },
    },
  },
})

