import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 相对路径让 dist/index.html 也能直接以文件方式打开
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
