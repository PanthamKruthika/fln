import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/data/**', '**/db.json'],
      },
      port: 5173,
      proxy: {
        '/api': { target: process.env.VITE_API_TARGET || 'http://localhost:3000', changeOrigin: true },
        '/output': { target: process.env.VITE_API_TARGET || 'http://localhost:3000', changeOrigin: true },
        '/worksheets': { target: process.env.VITE_API_TARGET || 'http://localhost:3000', changeOrigin: true },
      },
    },
  };
});