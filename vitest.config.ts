import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'components', replacement: resolve(__dirname, 'src/components') },
      { find: 'app', replacement: resolve(__dirname, 'src/app') },
      { find: 'context', replacement: resolve(__dirname, 'src/context') },
      { find: 'hooks', replacement: resolve(__dirname, 'src/hooks') },
      { find: 'services', replacement: resolve(__dirname, 'src/services') },
      { find: 'utils', replacement: resolve(__dirname, 'src/utils') },
      { find: 'test', replacement: resolve(__dirname, 'src/test') },
      { find: 'types', replacement: resolve(__dirname, 'src/types') },
    ],
  },
  test: {
    isolate: false, // disable isolation to reduce memory overhead
    maxConcurrency: 2, // run tests sequentially to reduce memory pressure
    globals: true,
    environment: 'jsdom',
    restoreMocks: true,
    clearMocks: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads', // use threads instead of workers for better memory management
    poolOptions: {
      threads: {
        singleThread: true, // use single thread to avoid memory fragmentation
      }
    },
    onConsoleLog(log, type) {
    // silence noisy JSDOM warnings
    if (log.includes('ReactDOMTestUtils')) return false
  },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '.eslintrc.cjs',
        'src/main.tsx',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'vite.config.*',
        'vitest.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        'src/setupTests.ts',
        'src/app/*'
      ],
      thresholds: {
        global: {
          statements: 75,
          branches: 60,
          functions: 75,
          lines: 75,
        },
      },
    },
  },
})
