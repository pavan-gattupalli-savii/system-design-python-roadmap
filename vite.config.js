import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Manual chunk policy: split heavy stable deps so the browser caches them
// across deploys. App code lives in index.js and is the only chunk that
// changes on most releases — react/router/query stay cached.
function manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react-dom') || id.includes('/react/'))   return 'react'
    if (id.includes('react-router'))                          return 'router'
    if (id.includes('@tanstack/react-query'))                 return 'query'
    if (id.includes('zod'))                                   return 'schemas'
  }
  return undefined
}

export default defineConfig({
  plugins: [react()],
  base: '/system-design-python-roadmap/',
  build: {
    rollupOptions: {
      output: { manualChunks },
    },
  },
})
