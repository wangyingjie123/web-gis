import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // for production
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/mixin.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // map '@' to './src'
      '~': path.resolve(__dirname, './node_modules'), // map '~' to './node_modules'
    },
  },
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 3335,
    proxy: {
      '/geoserver': {
        target: 'http://172.16.10.26:8090/', // 内网
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/uav_ai_admim_api/, ''),
      },
    },
  },
});
