import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const VALID_TARGETS = ['platinum', 'steve-giralt', 'deliverables', 'a1-sealcoating'] as const
type Target = (typeof VALID_TARGETS)[number]

type SiteMeta = { title: string; description: string; themeColor: string }

const SITE_META: Record<Target, SiteMeta> = {
  'a1-sealcoating': {
    title: 'A-1 Sealcoating LLC | Asphalt Services',
    description:
      'A-1 Sealcoating Asphalt Services LLC — professional asphalt sealcoating, paving, line striping, and crack repair for residential and commercial properties. Fully insured with over 25 years experience.',
    themeColor: '#070707',
  },
  platinum: {
    title: 'Platinum — Production & Creative Technology',
    description:
      'Production, AI imagery, creative technology and high-volume campaign deliverables for global brands.',
    themeColor: '#0a0a0a',
  },
  'steve-giralt': {
    title: 'Steve Giralt — Director & Cinematographer',
    description:
      'Director and cinematographer specializing in high-craft food, beverage, and product films.',
    themeColor: '#0a0a0a',
  },
  deliverables: {
    title: 'Deliverables — Campaign Production at Scale',
    description:
      'High-volume creative deliverables, hybrid AI pipelines, and campaign production built around the craft of the studio.',
    themeColor: '#0a0a0a',
  },
}

function htmlMetaPlugin(target: Target): Plugin {
  const meta = SITE_META[target]
  return {
    name: 'site-html-meta',
    transformIndexHtml(html) {
      return html
        .replace(/%APP_TITLE%/g, meta.title)
        .replace(/%APP_DESCRIPTION%/g, meta.description)
        .replace(/%APP_THEME_COLOR%/g, meta.themeColor)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const raw = (process.env.VITE_SITE_TARGET || env.VITE_SITE_TARGET || 'platinum').trim()
  const target = ((VALID_TARGETS as readonly string[]).includes(raw) ? raw : 'platinum') as Target

  return {
    plugins: [react(), htmlMetaPlugin(target)],
    define: {
      __SITE_TARGET__: JSON.stringify(target),
    },
  }
})
