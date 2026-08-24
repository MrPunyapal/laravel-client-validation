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
          'core': resolve(__dirname, 'packages/js/core/src/index.js'),
          'alpine': resolve(__dirname, 'packages/js/alpine/src/index.js'),
          'vanilla': resolve(__dirname, 'packages/js/vanilla/src/index.js'),
          'livewire': resolve(__dirname, 'packages/js/livewire/src/index.js'),
          'react': resolve(__dirname, 'packages/js/react/src/index.js'),
          'vue': resolve(__dirname, 'packages/js/vue/src/index.js'),
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
