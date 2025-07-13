import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable source maps in production to hide source code
    sourcemap: mode === 'development',
    
    // Minify and obfuscate code
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
      mangle: {
        // Mangle variable names to make them unreadable
        toplevel: true,
        safari10: true,
      },
      format: {
        // Remove comments
        comments: false,
      },
    },
    
    // Split chunks to make code harder to trace
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['clsx', 'class-variance-authority'],
        },
      },
    },
  },
}));
