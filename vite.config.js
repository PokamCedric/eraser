import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8000,
    open: true, // Automatically open browser
    hmr: true, // Enable Hot Module Replacement
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: [], // Add any dependencies that need pre-bundling here
  },
});
