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
    // react-markdown + its full unified/remark/rehype/micromark dep tree (~120kB) is
    // only used by NotesTab — split into its own chunk so users who never open a note
    // don't download it, and so it caches independently across deploys.
    if (
      id.includes('react-markdown') ||
      id.includes('remark-')        ||
      id.includes('rehype-')        ||
      id.includes('micromark')      ||
      id.includes('mdast-')         ||
      id.includes('hast-')          ||
      id.includes('/unified/')      ||
      id.includes('vfile')          ||
      id.includes('bail')           ||
      id.includes('trough')         ||
      id.includes('decode-named-character-reference') ||
      id.includes('character-entities') ||
      id.includes('property-information') ||
      id.includes('space-separated-tokens') ||
      id.includes('comma-separated-tokens')
    ) return 'markdown'
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
