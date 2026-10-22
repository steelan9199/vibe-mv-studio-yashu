import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const ROOT = import.meta.dirname;

export default defineConfig({
  root: path.resolve(ROOT, 'web'),
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(ROOT, 'web/src') },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    /* 开发时把接口与媒体流代理给 Hono（8791），前端不用关心跨域 */
    proxy: {
      '/api': 'http://127.0.0.1:8791',
      '/media': 'http://127.0.0.1:8791',
    },
  },
});
