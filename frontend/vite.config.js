import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Define the global variable
    // NOTE: You must JSON.stringify strings so they are treated as code values
    // '__FRONTEND_URL__': JSON.stringify('http://localhost:5173'),
    // '__BACKEND_URL__': JSON.stringify('http://localhost:5000') 
    '__FRONTEND_URL__': JSON.stringify('https://holi.navjeevan.ac.in'),
    '__BACKEND_URL__': JSON.stringify('https://holi.navjeevan.ac.in/api') 
  }
})
