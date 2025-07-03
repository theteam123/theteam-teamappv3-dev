import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'

// Get current timestamp for cache busting
const timestamp = new Date().getTime()

export default defineConfig({
  base: '/',
  plugins: [vue()],
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    port: 3000, // or any port you prefer
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Generate manifest.json in outDir
    manifest: true,
    // Customize the output directory
    outDir: 'dist',
    // Configure rollup options
    rollupOptions: {
      output: {
        // Add timestamp to entry file names
        entryFileNames: `assets/[name].${timestamp}.[hash].js`,
        // Add timestamp to chunk file names
        chunkFileNames: `assets/[name].${timestamp}.[hash].js`,
        // Add timestamp to asset file names
        assetFileNames: `assets/[name].${timestamp}.[hash].[ext]`
      }
    }
  }
}) 