import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const VALID_TARGETS = ['platinum', 'steve-giralt', 'deliverables', 'a1-sealcoating'] as const
type Target = (typeof VALID_TARGETS)[number]

// url: the live address (adds robots.txt and sitemap.xml to the build). head: a file whose
// contents go at the end of <head> (canonical, Open Graph image, JSON-LD); body: the same at the
// end of <body> (e.g. a hidden copy of a React form for Netlify to register). ownFonts: the site
// self-hosts its fonts, so the shared Google Fonts block in index.html is left out.
type SiteMeta = { title: string; description: string; themeColor: string; url?: string; head?: string; body?: string; ownFonts?: boolean }

const SITE_META: Record<Target, SiteMeta> = {
  'a1-sealcoating': {
    // From src/sites/a1-sealcoating/business.json via the local-seo skill (`seo.mjs meta`).
    title: 'Asphalt Sealcoating & Paving in New Jersey | A-1 Sealcoating LLC',
    description:
      'Asphalt sealcoating, paving, crack filling and line striping for homes and businesses. Fully insured, over 25 years in business. Call (732) 822-5652.',
    themeColor: '#070707',
    url: 'https://a1sealcoating.llc/',
    head: 'src/sites/a1-sealcoating/head.html',
    body: 'src/sites/a1-sealcoating/body.html',
    ownFonts: true,
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

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
// A site's extra head/body markup; its comments are notes for us, not for the published page.
const part = (file?: string) => (file ? readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->\n?/g, '') : '')

function htmlMetaPlugin(target: Target): Plugin {
  const meta = SITE_META[target]
  return {
    name: 'site-html-meta',
    transformIndexHtml(html) {
      return html
        .replace(/%APP_TITLE%/g, attr(meta.title))
        .replace(/%APP_DESCRIPTION%/g, attr(meta.description))
        .replace(/%APP_THEME_COLOR%/g, meta.themeColor)
        .replace(/[ \t]*<!-- google-fonts -->[\s\S]*?<!-- \/google-fonts -->\n?/, (block) => (meta.ownFonts ? '' : block))
        .replace('</head>', `${part(meta.head)}</head>`)
        .replace('</body>', `${part(meta.body)}</body>`)
    },
    generateBundle() {
      if (!meta.url) return
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${meta.url}sitemap.xml\n` })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${meta.url}</loc></url>\n</urlset>\n`,
      })
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
