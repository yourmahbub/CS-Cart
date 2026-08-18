import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  // NOTE: nothing secret may be added to `define` — everything here is compiled
  // into the JavaScript that ships to every visitor. Server-only keys belong in
  // the API process (see server/) and must be read from process.env there.

  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },

  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        // Split vendor code so a content change doesn't invalidate the whole bundle.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) return 'react';
          if (id.includes('motion') || id.includes('framer')) return 'motion';
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor';
        },
      },
    },
  },

  server: {
    port: 3000,
    // The API runs as a separate process in development. Both paths it owns
    // must be proxied — without /uploads, image requests fall through to the
    // SPA catch-all and the browser receives index.html instead of the file.
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:4000',
        changeOrigin: false,
      },
      '/uploads': {
        target: process.env.API_URL || 'http://localhost:4000',
        changeOrigin: false,
      },
    },
  },
}));
