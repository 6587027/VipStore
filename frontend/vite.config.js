// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import inspector from 'vite-plugin-react-inspector'


process.env.REACT_EDITOR = 'agy -g' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    inspector(), 
  ],
})