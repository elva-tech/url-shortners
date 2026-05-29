import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget =
  process.env.VITE_DEV_BACKEND || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '^/[a-z0-9]{6}$': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
