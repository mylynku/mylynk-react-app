import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'lucide-react',
      'lint',
      'fingerprint-js'
    ],
  },
  build: {
    rollupOptions: {
      external: [
        /lint\.js$/,
        /fingerprint\.js$/,
      ]
    }
  }
});
