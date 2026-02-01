import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'a/[hash].js',
        chunkFileNames: 'a/[hash].js',
        assetFileNames: 'a/[hash][extname]'
      }
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  }
});