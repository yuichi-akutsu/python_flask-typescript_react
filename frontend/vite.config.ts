import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Dockerコンテナ外（ブラウザ）からアクセス可能にする設定
    host: true,
    strictPort: true,

    watch: {
      usePolling: true,
    },
    
    // APIリクエストをバックエンドに転送するプロキシ設定
    proxy: {
      '/api': {
        // Docker Composeのサービス名「app」を使って内部通信する
        target: 'http://app:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})