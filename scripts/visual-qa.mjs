/**
 * Visual QA — fires up a Playwright Chromium against a Vite preview of a
 * single client site, captures five viewports, and reports horizontal
 * overflow, hero media dimensions, fallback-gradient visibility and console
 * errors per viewport so we can spot tiny-hero / overflow issues without
 * staring at every shot.
 *
 * Usage:
 *   node scripts/visual-qa.mjs --site=platinum
 *   node scripts/visual-qa.mjs --site=steve-giralt
 *   node scripts/visual-qa.mjs --site=deliverables
 *
 * Default: --site=platinum
 *
 * The script will:
 *   1. Build the requested site (`npm run build:<site>`) if `dist/<site>` is missing
 *      or stale, unless SKIP_BUILD=1 is set.
 *   2. Spawn `vite preview` against the built `dist/<site>` on a per-site port.
 *   3. Drive Chromium across five viewports and save shots under
 *      `content-audit/visual-qa/<site>/`.
 */

import { chromium } from 'playwright'
import { promises as fs } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const SITES = {
  platinum: { outDir: 'dist/platinum', port: 4173, label: 'Platinum FMD' },
  'steve-giralt': { outDir: 'dist/steve-giralt', port: 4174, label: 'Steve Giralt' },
  deliverables: { outDir: 'dist/deliverables', port: 4175, label: 'The Deliverables' },
  'a1-sealcoating': { outDir: 'dist/a1-sealcoating', port: 4176, label: 'A-1 Sealcoating' },
}

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large-desktop', width: 1920, height: 1080 },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function parseSite() {
  const argv = process.argv.slice(2)
  for (const a of argv) {
    if (a.startsWith('--site=')) return a.slice('--site='.length)
    if (a === '--site') {
      const i = argv.indexOf(a)
      if (i >= 0 && argv[i + 1]) return argv[i + 1]
    }
  }
  return process.env.QA_SITE || 'platinum'
}

async function waitForServer(url, timeoutMs = 30_000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (res.ok) return true
    } catch {
      /* not up yet */
    }
    await sleep(400)
  }
  return false
}

function spawnPreview(outDir, port) {
  console.log(`   • spawning \`vite preview\` (${outDir}) on :${port}`)
  const child = spawn(
    'npx',
    ['vite', 'preview', '--outDir', outDir, '--port', String(port), '--strictPort'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  child.stdout.on('data', (b) => process.stdout.write(`     [preview] ${b}`))
  child.stderr.on('data', (b) => process.stderr.write(`     [preview!] ${b}`))
  return child
}

function spawnBuild(site) {
  const scriptName = { platinum: 'build:platinum', 'steve-giralt': 'build:steve', deliverables: 'build:deliverables' }[site]
  console.log(`   • running \`npm run ${scriptName}\``)
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', scriptName], { cwd: ROOT, stdio: 'inherit' })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`build exited ${code}`))))
  })
}

async function shootViewport(browser, vp, url, outDir) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  })
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`console.error: ${m.text()}`)
  })

  await page.goto(url, { waitUntil: 'load', timeout: 45_000 })
  await sleep(2200)

  const aboveFoldPath = path.join(outDir, `${vp.name}-fold.png`)
  await page.screenshot({ path: aboveFoldPath, fullPage: false })

  await page.evaluate(async () => {
    const step = 800
    const max = document.documentElement.scrollHeight
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 350))
  })

  const fullPath = path.join(outDir, `${vp.name}-full.png`)
  await page.screenshot({ path: fullPath, fullPage: true })

  const stats = await page.evaluate(() => {
    const docW = document.documentElement.scrollWidth
    const viewW = window.innerWidth
    const overflowingEls = []
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.right > viewW + 1) {
        const tag = el.tagName.toLowerCase()
        const cls = (el.className || '').toString().slice(0, 60)
        overflowingEls.push(`${tag}.${cls} (right=${Math.round(r.right)})`)
      }
    })
    const hero =
      document.querySelector('.hero') || document.querySelector('.d-hero')
    const heroMedia =
      document.querySelector('.hero__media') ||
      document.querySelector('.d-hero__mediaEl') ||
      document.querySelector('.d-hero__media')
    const heroSlide =
      document.querySelector('.hero__slide.is-active') ||
      document.querySelector('.d-hero__media')
    const heroRect = hero ? hero.getBoundingClientRect() : null
    const heroMediaRect = heroMedia ? heroMedia.getBoundingClientRect() : null
    return {
      docWidth: docW,
      viewportWidth: viewW,
      horizontalOverflow: docW > viewW,
      overflowAmount: docW - viewW,
      overflowingExamples: overflowingEls.slice(0, 6),
      hero: heroRect && { w: Math.round(heroRect.width), h: Math.round(heroRect.height) },
      heroMedia:
        heroMediaRect && {
          w: Math.round(heroMediaRect.width),
          h: Math.round(heroMediaRect.height),
        },
      heroHasMedia: !!heroSlide,
      hasFallbackPlaceholder:
        !!document.querySelector('.placeholder--fallback') &&
        !!Array.from(document.querySelectorAll('.placeholder--fallback')).find((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 200 && r.height > 200
        }),
      hasContact: !!document.querySelector('#contact'),
    }
  })

  await ctx.close()
  return { viewport: vp, stats, consoleErrors, files: [aboveFoldPath, fullPath] }
}

async function mediaSummary(site) {
  /* Reads the content-audit manifest and prints a per-site media inventory:
     usable images / videos / hero-quality items / CDN-variant duplicates.
     Surfaces "is the library actually rich enough for the design ambition"
     without having to eyeball the gallery. */
  try {
    const raw = await fs.readFile(path.join(ROOT, 'content-audit', 'site-data.json'), 'utf8')
    const data = JSON.parse(raw)
    const client = data.clients?.find((c) => c.client === site)
    if (!client) return
    const items = client.items || []
    const images = items.filter((i) => i.mediaType === 'image')
    const videos = items.filter((i) => i.mediaType === 'video')
    const heroQualityImages = images.filter((i) => (i.width || 0) >= 900 && (i.height || 0) >= 600)
    const tinyImages = images.filter((i) => (i.width || 0) < 600 && (i.height || 0) < 600)
    /* Dedupe by title+dims — collapses Wix CDN-variant duplicates. */
    const seen = new Set()
    let cdnDuplicates = 0
    for (const it of items) {
      const key = `${(it.title || '').toLowerCase()}|${it.width || 0}x${it.height || 0}`
      if (key !== '|0x0' && seen.has(key)) cdnDuplicates++
      seen.add(key)
    }
    console.log('\n── Media inventory ──')
    console.log(`  total items:        ${items.length}`)
    console.log(`  usable images:      ${images.length}`)
    console.log(`  usable videos:      ${videos.length}`)
    console.log(`  hero-quality:       ${heroQualityImages.length + videos.length} (${videos.length} video + ${heroQualityImages.length} ≥900px)`)
    console.log(`  tiny images <600px: ${tinyImages.length}`)
    console.log(`  CDN-variant dupes:  ${cdnDuplicates}`)
    if (heroQualityImages.length + videos.length < 5) {
      console.log(`  ⚠ thin hero pool — design must lean on curation, not rotation.`)
    }
  } catch (e) {
    console.log(`  (media summary skipped: ${e.message})`)
  }
}

async function main() {
  const site = parseSite()
  const cfg = SITES[site]
  if (!cfg) {
    console.error(`✗ Unknown --site=${site}. Valid: ${Object.keys(SITES).join(', ')}`)
    process.exit(2)
  }

  const OUT_DIR = path.join(ROOT, 'content-audit', 'visual-qa', site)
  await fs.mkdir(OUT_DIR, { recursive: true })

  await mediaSummary(site)

  // Build first if needed.
  const outDirAbs = path.join(ROOT, cfg.outDir)
  const indexExists = await fs.access(path.join(outDirAbs, 'index.html')).then(() => true, () => false)
  if (!indexExists && process.env.SKIP_BUILD !== '1') {
    await spawnBuild(site)
  } else if (!indexExists) {
    console.error(`✗ ${cfg.outDir}/index.html missing and SKIP_BUILD=1. Build the site first.`)
    process.exit(2)
  }

  const url = `http://localhost:${cfg.port}/`
  console.log(`Visual QA → ${cfg.label} (${url})`)

  let previewChild = null
  if (process.env.NO_PREVIEW !== '1') {
    previewChild = spawnPreview(cfg.outDir, cfg.port)
  }

  const up = await waitForServer(url, 30_000)
  if (!up) {
    if (previewChild) previewChild.kill()
    console.error(`✗ No server reachable at ${url}.`)
    process.exit(2)
  }

  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    for (const vp of VIEWPORTS) {
      console.log(`   • ${vp.name} (${vp.width}×${vp.height})`)
      const r = await shootViewport(browser, vp, url, OUT_DIR)
      results.push(r)
    }
  } finally {
    await browser.close()
    if (previewChild) previewChild.kill()
  }

  const summary = {
    site,
    label: cfg.label,
    generatedAt: new Date().toISOString(),
    previewUrl: url,
    viewports: results.map((r) => ({
      name: r.viewport.name,
      width: r.viewport.width,
      height: r.viewport.height,
      stats: r.stats,
      consoleErrors: r.consoleErrors,
      files: r.files.map((f) => path.relative(ROOT, f)),
    })),
  }

  await fs.writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(summary, null, 2))

  console.log('\n── Summary ──')
  for (const v of summary.viewports) {
    const s = v.stats
    const flags = []
    if (s.horizontalOverflow) flags.push(`OVERFLOW(+${s.overflowAmount}px)`)
    if (!s.heroHasMedia) flags.push('NO HERO MEDIA')
    if (s.hasFallbackPlaceholder) flags.push('FALLBACK GRADIENT VISIBLE')
    if (!s.hasContact) flags.push('NO CONTACT SECTION')
    if (v.consoleErrors.length) flags.push(`${v.consoleErrors.length} console errors`)
    console.log(
      `  ${v.name.padEnd(14)} hero=${s.hero ? `${s.hero.w}×${s.hero.h}` : '—'} ` +
        `media=${s.heroMedia ? `${s.heroMedia.w}×${s.heroMedia.h}` : '—'} ` +
        `${flags.join(' · ') || 'ok'}`,
    )
  }
  console.log(`\n✓ Screenshots in ${path.relative(ROOT, OUT_DIR)}`)
  console.log(`✓ Report: ${path.relative(ROOT, path.join(OUT_DIR, 'report.json'))}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
