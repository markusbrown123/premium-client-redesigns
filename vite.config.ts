import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const VALID_TARGETS = ['platinum', 'steve-giralt', 'deliverables', 'a1-sealcoating'] as const

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const raw = (process.env.VITE_SITE_TARGET || env.VITE_SITE_TARGET || 'platinum').trim()
  const target = (VALID_TARGETS as readonly string[]).includes(raw) ? raw : 'platinum'

  return {
    plugins: [react()],
    define: {
      __SITE_TARGET__: JSON.stringify(target),
    },
  }
})
