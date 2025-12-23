
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 如果你的 GitHub 仓库名是 christmas-tree，请确保这里一致
  // 如果是部署到 用户名.github.io 根目录，则设为 '/'
  base: '/christmas-tree/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-tf': ['@tensorflow/tfjs', '@tensorflow-models/handpose']
        }
      }
    }
  }
});
