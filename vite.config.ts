import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
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
})
