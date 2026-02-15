import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  worker: { format: 'es' },
  optimizeDeps: {
    exclude: ['@jsquash/avif', '@jsquash/webp']
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    commonjsOptions: { transformMixedEsModules: true }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    }
  }
});