import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // ✅ CORREÇÃO: Alterado de './' para '/' para usar caminhos absolutos.
  // Isso garante que seus arquivos CSS e JS sejam carregados corretamente
  // em qualquer rota da sua aplicação (ex: /payment/success).
  base: '/',
  plugins: [react()],
  build: {
    // ESTA LINHA GARANTE QUE O SITE SEJA GERADO NA PASTA 'dist'
    outDir: 'dist/client',
    target: 'esnext',
    emptyOutDir: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'leaflet-vendor': ['leaflet', 'leaflet-minimap'],
          'router-vendor': ['react-router-dom'],
          'google-vendor': ['@react-oauth/google', 'google-auth-library'],
          'map-features': [
            './src/hooks/useMapTiles.ts',
            './src/hooks/useMapMarkers.ts',
            './src/hooks/useMapEventListeners.ts',
          ],
          'admin-features': [
            './src/components/AdminPanel.tsx',
            './src/hooks/useAdminActions.ts',
          ],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/newsapi': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'leaflet',
      'react-router-dom',
    ],
    exclude: [],
  },
});
