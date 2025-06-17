import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'resources/js/index.js',
      name: 'LaravelClientValidation',
      formats: ['es', 'umd', 'iife'],
      fileName: (format) => `client-validation.${format}.js`
    },
    outDir: 'resources/js/dist',
    rollupOptions: {
      external: ['alpinejs'],
      output: {
        globals: {
          alpinejs: 'Alpine'
        }
      }
    }
  },
  server: {
    open: true
  }
});
