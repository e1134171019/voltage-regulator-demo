import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoRoot = fileURLToPath(new URL('../', import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
})
