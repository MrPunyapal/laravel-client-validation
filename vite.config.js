import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isBundleBuild = process.env.BUILD_BUNDLE === 'true';

  if (isBundleBuild) {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'resources/js/index.js'),
          name: 'LaravelClientValidation',
          formats: ['umd', 'iife'],
          fileName: (format) => `client-validation.${format}.js`,
        },
        outDir: 'resources/js/dist',
        emptyOutDir: false,
        rollupOptions: {
          external: ['alpinejs'],
          output: {
            exports: 'named',
            globals: {
              alpinejs: 'Alpine',
            },
          },
        },
      },
    };
  }

  return {
    build: {
      lib: {
        entry: {
          'client-validation': resolve(__dirname, 'resources/js/index.js'),
          'core': resolve(__dirname, 'resources/js/core/index.js'),
          'alpine': resolve(__dirname, 'resources/js/adapters/alpine.js'),
          'vanilla': resolve(__dirname, 'resources/js/adapters/vanilla.js'),
          'livewire': resolve(__dirname, 'resources/js/adapters/livewire.js'),
          'react': resolve(__dirname, 'resources/js/adapters/react.js'),
          'vue': resolve(__dirname, 'resources/js/adapters/vue.js'),
        },
        name: 'LaravelClientValidation',
        formats: ['es'],
      },
      outDir: 'resources/js/dist',
      rollupOptions: {
        external: ['alpinejs'],
        output: {
          exports: 'named',
          globals: {
            alpinejs: 'Alpine',
          },
          entryFileNames: '[name].es.js',
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['tests/js/**/*.test.js'],
      exclude: [
        '**/node_modules/**',
        '**/vendor/**',
        '**/demo/**',
      ],
    },
    server: {
      open: true,
    },
  };
});
