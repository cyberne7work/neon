import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://builder.nethos.xyz',
        secure: true,
        changeOrigin: true
      },
      '/ws': {
        target: 'wss://builder.nethos.xyz',
        secure: true,
        ws: true
      },
      '/static': {
        target: 'https://builder.nethos.xyz',
        secure: true,
        changeOrigin: true
      }
    }
  }
});