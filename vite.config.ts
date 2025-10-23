import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Example: Manual chunking for common libraries
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js', '@supabase/auth-ui-react', '@supabase/auth-ui-shared'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'sonner', 'lucide-react'],
          // You can add more custom chunks here based on your project's dependencies
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase the limit to 1000 kB (1 MB)
  },
});