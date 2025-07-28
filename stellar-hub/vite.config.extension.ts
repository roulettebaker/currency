import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ],
  root: resolve(__dirname, 'extension'),
  build: {
    outDir: resolve(__dirname, 'extension-dist'),
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'extension/popup.html'),
        background: resolve(__dirname, 'extension/background.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep background.js as background.js
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return '[name].js';
        },
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup.html') {
            return 'popup.html';
          }
          if (assetInfo.name?.endsWith('.css')) {
            return '[name].[ext]';
          }
          return 'assets/[name].[ext]';
        }
      }
    },
    emptyOutDir: true,
    copyPublicDir: false,
    minify: false,
    target: 'es2020',
    sourcemap: 'inline'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client'),
      '@shared': resolve(__dirname, './shared'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
    'process.env.VITE_NODE_ENV': '"production"'
  },
  esbuild: {
    jsx: 'automatic',
    jsxDev: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});
