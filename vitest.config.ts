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
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
    },
  },
})
