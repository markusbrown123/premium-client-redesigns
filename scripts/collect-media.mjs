/**
 * Media scanner — crawls each client site, deeply harvests every public
 * image and video reference it can find, and writes a normalized manifest
 * to content-audit/media-manifest.json (full data) plus a trimmed
 * content-audit/site-data.json that the Vite app imports.
 *
 * Run:  node scripts/collect-media.mjs
 */

import { chromium } from 'playwright'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'content-audit', 'media-manifest.json')
const SITE_OUT = path.join(ROOT, 'content-audit', 'site-data.json')

const ITEMS_PER_CLIENT_FOR_SITE = 240
const MAX_PAGES_PER_SITE = 40
const NAV_TIMEOUT = 45_000
const SETTLE_MS = 1400

// Deep-mode constants — used when --deep is passed or for Framer-style
// single-page sites that hide most assets behind animation states.
const DEEP_SCROLL_STEP = 320
const DEEP_SCROLL_DELAY = 320
const DEEP_SETTLE_MS = 2600
const DEEP_VIEWPORTS = [
  { width: 390, height: 844, label: 'mobile' },
  { width: 820, height: 1180, label: 'tablet' },
  { width: 1440, height: 900, label: 'laptop' },
  { width: 1920, height: 1080, label: 'desktop' },
]

const CLIENTS = [
  {
    id: 'platinum',
    name: 'Platinum FMD',
    base: 'https://www.platinumfmd.com.br/',
    allowHosts: ['platinumfmd.com.br', 'www.platinumfmd.com.br'],
    category: 'Studio · Image, film, AI, craft, classics',
    deep: true,
    // Wix sites don't change media between viewport breakpoints the way Framer
    // does, so we skip the multi-viewport rescroll pass — saves ~5x scan time.
    skipMultiViewport: true,
    // Hint pages — Wix sites have anchor-only routes the crawler can't see.
    seeds: [
      'https://www.platinumfmd.com.br/',
      'https://www.platinumfmd.com.br/flavioalbino',
      'https://www.platinumfmd.com.br/miltonmontenegro',
      'https://www.platinumfmd.com.br/lucianohonorato',
      'https://www.platinumfmd.com.br/rafaeldiniz',
      'https://www.platinumfmd.com.br/leonardoescobar',
      'https://www.platinumfmd.com.br/livia',
      'https://www.platinumfmd.com.br/andrewnishida',
      'https://www.platinumfmd.com.br/felipetorquato',
      'https://www.platinumfmd.com.br/about',
    ],
  },
  {
    id: 'steve-giralt',
    name: 'Steve Giralt',
    base: 'https://www.stevegiralt.com/creative-technology',
    allowHosts: ['stevegiralt.com', 'www.stevegiralt.com'],
    category: 'Director · Creative technology',
    seeds: [
      'https://www.stevegiralt.com/',
      'https://www.stevegiralt.com/creative-technology',
    ],
  },
  {
    id: 'deliverables',
    name: 'The Deliverables',
    base: 'https://thedeliverables.ai/',
    allowHosts: ['thedeliverables.ai', 'www.thedeliverables.ai'],
    category: 'AI imagery · Campaign deliverables',
    // Deliverables is a one-page Framer site — extra effort to dig the few
    // real assets out of animation states, scroll-triggered reveals, and the
    // hydration payload pays off.
    deep: true,
  },
]

// Garrigosa is design-reference only — never scan/host their assets.
const HARD_BLOCK_HOSTS = ['garrigosastudio.com', 'www.garrigosastudio.com']

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|avif|gif|bmp|tiff?)(\?|#|$)/i
const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i
const SVG_EXT_RE = /\.svg(\?|#|$)/i

const SKIP_HINTS = [
  'favicon',
  'sprite',
  'icon-',
  'icons-',
  'logo-mark',
  'wp-emoji',
  'twemoji',
  'google-analytics',
  'googletagmanager',
  'doubleclick',
  'facebook.com/tr',
  'connect.facebook.net',
  'hotjar',
  'segment.io',
  'sentry',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function isHttp(u) {
  return /^https?:\/\//i.test(u)
}

function resolveUrl(base, ref) {
  try {
    return new URL(ref, base).toString().split('#')[0]
  } catch {
    return null
  }
}

function hostOf(u) {
  try {
    return new URL(u).hostname
  } catch {
    return ''
  }
}

function pathOf(u) {
  try {
    return new URL(u).pathname
  } catch {
    return ''
  }
}

function looksLikeImage(url) {
  return IMAGE_EXT_RE.test(url) || SVG_EXT_RE.test(url)
}

function looksLikeVideo(url) {
  return VIDEO_EXT_RE.test(url)
}

function isBlocked(url) {
  const h = hostOf(url)
  if (HARD_BLOCK_HOSTS.includes(h)) return true
  return false
}

function isSkippable(url) {
  if (isBlocked(url)) return true
  if (isJunkPlatinumUrl(url)) return true
  const u = url.toLowerCase()
  if (SKIP_HINTS.some((h) => u.includes(h))) return true
  if (u.endsWith('.ico')) return true
  return false
}

function extOf(url) {
  const m = url.toLowerCase().split('?')[0].split('#')[0].match(/\.([a-z0-9]{2,5})$/)
  return m ? m[1] : ''
}

function fileNameOf(url) {
  try {
    const p = new URL(url).pathname
    return decodeURIComponent(p.split('/').pop() || '')
  } catch {
    return ''
  }
}

function guessCategory(pathname) {
  const p = pathname.toLowerCase()
  if (/(work|projects?|portfolio|case)/.test(p)) return 'Work'
  if (/(film|video|reel|motion|broadcast)/.test(p)) return 'Film & motion'
  if (/(editorial|press|journal|news)/.test(p)) return 'Editorial'
  if (/(talent|models?|roster|board)/.test(p)) return 'Talent'
  if (/(about|studio|team)/.test(p)) return 'Studio'
  if (/(service|capabilit)/.test(p)) return 'Capabilities'
  return null
}

function guessProject(pathname, title) {
  const slug = pathname.replace(/^\/|\/$/g, '').split('/').pop() || ''
  const cleaned = slug.replace(/[-_]+/g, ' ').trim()
  if (cleaned && cleaned.length > 1) return cleaned
  if (title) return title.split(/[|·\-—]/)[0].trim()
  return null
}

function isLikelyTrackingPixel(w, h) {
  if (!w || !h) return false
  return w <= 3 || h <= 3
}

// Wix encodes the poster JPG for a video as
//   https://static.wixstatic.com/media/{prefix}_{hash}f000.jpg
// given a source video like
//   https://video.wixstatic.com/video/{prefix}_{hash}/1080p/mp4/file.mp4
// Returns the inferred poster URL if `videoUrl` matches the Wix pattern.
function inferWixPoster(videoUrl) {
  if (!videoUrl) return ''
  const m = videoUrl.match(/video\.wixstatic\.com\/video\/([0-9a-f_]{6,})\//i)
  if (!m) return ''
  return `https://static.wixstatic.com/media/${m[1]}f000.jpg`
}

// Wix static CDN URLs have the form:
//   https://static.wixstatic.com/media/{prefix}_{hash}~mv2.jpg/v1/fill/w_287,h_323,al_c,q_80,...
// (with optional ~mv2). The path *before* `/v1/...` is the source asset. We
// can request a much higher-resolution variant by replacing the resize block
// with a larger width. We also emit the bare source path (no /v1/) so
// downstream sees the original.
function isWixStaticImage(url) {
  return /static\.wixstatic\.com\/media\//i.test(url)
}

// Parse a Wix image URL and return { base, filename, hasResize }.
// base = "https://static.wixstatic.com/media/{prefix}_{hash}~mv2.jpg"
// Note: do NOT trust the trailing filename after /v1/.../ since Wix re-encodes
// to a different name for SEO. The pre-/v1/ part is canonical.
function parseWixStatic(url) {
  if (!isWixStaticImage(url)) return null
  const noQuery = url.split('?')[0]
  // The base is everything before "/v1/"
  const v1Idx = noQuery.toLowerCase().indexOf('/v1/')
  if (v1Idx === -1) {
    return { base: noQuery, hasResize: false }
  }
  return { base: noQuery.slice(0, v1Idx), hasResize: true }
}

// Build an upgraded Wix URL. If the original has a /v1/fill/... block we
// rebuild it with a bigger width target; otherwise return the bare base
// (which Wix serves as the original).
function upgradeWixImageUrl(url, width = 2560) {
  const parsed = parseWixStatic(url)
  if (!parsed) return null
  if (!parsed.hasResize) return parsed.base
  // Use srz to request a clean larger render. The `enc_auto/quality_auto`
  // tail lets Wix pick the best variant.
  return `${parsed.base}/v1/fill/w_${width},h_${Math.round(width * 0.6667)},al_c,q_90,usm_0.66_1.00_0.01,enc_auto,quality_auto/file.jpg`
}

// Yield up to three candidate URLs for one Wix asset: the bare original,
// a high-res 2560 variant, and a 3840 variant. The downloader will try each
// in order and keep the largest one that actually downloads.
function wixUpgradeCandidates(url) {
  const parsed = parseWixStatic(url)
  if (!parsed) return null
  return {
    bare: parsed.base,
    hi: upgradeWixImageUrl(url, 2560),
    ultra: upgradeWixImageUrl(url, 3840),
  }
}

// Filter out scanner artefacts: the regex sniffer in extractFromDom sometimes
// picks up fragments of Wix CSS resize directives that look like URLs but
// actually 404. e.g.  https://www.platinumfmd.com.br/al_c
function isJunkPlatinumUrl(url) {
  if (/platinumfmd\.com\.br\/(al_c|q_[\d_]+|usm_|enc_|quality_|h_|w_)/i.test(url)) return true
  // Wix HLS repackager — emits `/seg-N-...` segments that are NOT playable in a
  // bare <video> tag. They balloon the network capture and crowd out real assets.
  if (/repackager\.wixmp\.com\//i.test(url)) return true
  // Wix HLS playlist files are also not directly playable.
  if (/video\.wixstatic\.com\/.+\.(m3u8|ts)(\?|$)/i.test(url)) return true
  // Vimeo CDN signed HLS / DRM-protected streams — they LOOK like videos but
  // aren't playable in a bare <video> tag. The Vimeo iframe embed handles the
  // licensing. We keep the iframe embed (handled separately) and drop these.
  if (/vimeocdn\.com\//i.test(url)) return true
  if (/skyfire\.vimeocdn\.com\//i.test(url)) return true
  if (/vod-adaptive(-ak)?\.vimeocdn\.com\//i.test(url)) return true
  return false
}

function makeId(client, src) {
  const h = crypto.createHash('sha1').update(src).digest('hex').slice(0, 10)
  return `${client}-${h}`
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const distance = 600
    const delay = 220
    const max = document.body.scrollHeight + 4000
    let y = 0
    while (y < max) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, delay))
      y += distance
      if (y >= document.body.scrollHeight) break
    }
    window.scrollTo(0, document.body.scrollHeight)
    await new Promise((r) => setTimeout(r, 400))
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 200))
  })
}

// Slow, exhaustive scroll for animation-heavy single-page sites. Walks the
// page forward in small increments with pauses between steps so lazy-loaded
// and scroll-triggered media has time to mount, then walks back to the top.
async function deepAutoScroll(page, { step = DEEP_SCROLL_STEP, delay = DEEP_SCROLL_DELAY } = {}) {
  await page.evaluate(
    async ({ step, delay }) => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms))
      let lastHeight = 0
      // Multiple passes — page height grows as content loads.
      for (let pass = 0; pass < 3; pass++) {
        const max = document.body.scrollHeight + 6000
        let y = 0
        while (y < max) {
          window.scrollTo(0, y)
          await wait(delay)
          y += step
          if (y >= document.body.scrollHeight + 200) break
        }
        if (document.body.scrollHeight === lastHeight) break
        lastHeight = document.body.scrollHeight
      }
      window.scrollTo(0, document.body.scrollHeight)
      await wait(500)
      // Back to top so the hero is visible & playing for any final capture.
      window.scrollTo(0, 0)
      await wait(400)
    },
    { step, delay },
  )
}

// Some Framer/animated sites only mount media when an element is hovered or
// scrolled into view. Best-effort: trigger hover on every visible video/img
// container so reveal-on-hover assets enter the DOM.
async function triggerHoverReveals(page) {
  try {
    const handles = await page.$$(
      'video, [data-framer-component-type], [class*="media"], [class*="card"], [class*="gallery"], img',
    )
    for (const h of handles.slice(0, 40)) {
      try {
        await h.scrollIntoViewIfNeeded({ timeout: 1000 })
        await h.hover({ timeout: 1000 })
      } catch {
        /* swallow */
      }
    }
  } catch {
    /* swallow */
  }
}

async function extractFromDom(page) {
  return await page.evaluate(() => {
    const out = {
      images: [],
      videos: [],
      embeds: [],
      links: [],
      title: document.title || '',
      url: location.href,
    }

    const pushImage = (src, meta = {}) => {
      if (!src) return
      out.images.push({ src, source: meta.source || 'dom', ...meta })
    }

    document.querySelectorAll('img').forEach((img) => {
      const alt = img.getAttribute('alt') || ''
      const w = img.naturalWidth || img.width || 0
      const h = img.naturalHeight || img.height || 0
      if (img.currentSrc) pushImage(img.currentSrc, { alt, w, h, source: 'dom' })
      if (img.src && img.src !== img.currentSrc) pushImage(img.src, { alt, w, h, source: 'dom' })
      const srcset = img.getAttribute('srcset')
      if (srcset) {
        srcset
          .split(',')
          .map((s) => s.trim().split(/\s+/)[0])
          .filter(Boolean)
          .forEach((s) => pushImage(s, { alt, w, h, source: 'dom' }))
      }
      const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-lazy-src')
      if (dataSrc) pushImage(dataSrc, { alt, w, h, source: 'dom' })
      // Framer: when an <img> uses a `srcset` we want the largest variant
      // explicitly recorded so the bare-id fallback can compare against it.
      try {
        const cs = getComputedStyle(img)
        const bgi = cs.backgroundImage
        if (bgi && bgi !== 'none') {
          const re = /url\((['"]?)(.*?)\1\)/gi
          let m
          while ((m = re.exec(bgi))) {
            if (m[2] && !m[2].startsWith('data:'))
              pushImage(m[2], { alt, w, h, source: 'css' })
          }
        }
      } catch {
        /* swallow */
      }
    })

    // OG / Twitter card images — these are commonly the highest-quality
    // brand visuals on a marketing one-pager.
    document
      .querySelectorAll(
        'meta[property="og:image"], meta[property="og:image:secure_url"], meta[name="twitter:image"], meta[name="twitter:image:src"]',
      )
      .forEach((m) => {
        const c = m.getAttribute('content')
        if (c) pushImage(c, { alt: 'OG image', source: 'meta' })
      })

    document.querySelectorAll('picture source').forEach((s) => {
      const srcset = s.getAttribute('srcset')
      if (srcset) {
        srcset
          .split(',')
          .map((x) => x.trim().split(/\s+/)[0])
          .filter(Boolean)
          .forEach((x) => pushImage(x, { source: 'dom' }))
      }
    })

    document.querySelectorAll('link[rel="preload"][as="image"]').forEach((l) => {
      const href = l.getAttribute('href')
      if (href) pushImage(href, { source: 'link' })
    })

    document.querySelectorAll('video').forEach((v) => {
      const poster = v.getAttribute('poster') || ''
      const src = v.getAttribute('src') || v.currentSrc || ''
      const w = v.videoWidth || 0
      const h = v.videoHeight || 0
      if (src) out.videos.push({ src, poster, w, h, source: 'dom' })
      v.querySelectorAll('source').forEach((s) => {
        const ssrc = s.getAttribute('src')
        if (ssrc) out.videos.push({ src: ssrc, poster, w, h, source: 'dom' })
      })
      if (poster) pushImage(poster, { alt: 'Video poster', source: 'dom' })
    })

    document.querySelectorAll('iframe').forEach((f) => {
      const src = f.getAttribute('src') || ''
      if (!src) return
      const vimeo = src.match(/vimeo\.com\/video\/(\d+)/)
      const yt = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([\w-]{6,})/)
      if (vimeo) {
        out.embeds.push({
          src,
          poster: '',
          embed: 'vimeo',
          embedId: vimeo[1],
          source: 'iframe',
        })
      } else if (yt) {
        const poster = `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg`
        out.embeds.push({
          src,
          poster,
          embed: 'youtube',
          embedId: yt[1],
          source: 'iframe',
        })
        pushImage(poster, { alt: 'YouTube thumbnail', source: 'iframe' })
      }
    })

    document.querySelectorAll('*').forEach((el) => {
      const inline = el.getAttribute && el.getAttribute('style')
      if (inline && /background/i.test(inline)) {
        const re = /url\((['"]?)(.*?)\1\)/gi
        let m
        while ((m = re.exec(inline))) {
          const u = m[2]
          if (u && !u.startsWith('data:')) pushImage(u, { source: 'css' })
        }
      }
      try {
        const cs = getComputedStyle(el)
        const bg = cs.backgroundImage
        if (bg && bg !== 'none') {
          const re = /url\((['"]?)(.*?)\1\)/gi
          let m
          while ((m = re.exec(bg))) {
            const u = m[2]
            if (u && !u.startsWith('data:')) pushImage(u, { source: 'css' })
          }
        }
      } catch {
        /* swallow */
      }
    })

    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href')
      if (!href) return
      out.links.push(href)
    })

    return out
  })
}

async function discoverInternalLinks(page, client) {
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map((a) => a.href),
  )
  const seen = new Set()
  const result = []
  for (const h of hrefs) {
    if (!isHttp(h)) continue
    const host = hostOf(h)
    if (!client.allowHosts.includes(host)) continue
    const url = h.split('#')[0]
    if (seen.has(url)) continue
    if (/\.(pdf|zip|rar|dmg|exe|jpg|jpeg|png|webp|svg|gif|mp4|webm|mov)(\?|$)/i.test(url)) continue
    seen.add(url)
    result.push(url)
  }
  return result
}

async function scanClient(browser, client) {
  console.log(`\n→ Scanning ${client.name} (${client.id})${client.deep ? ' [deep]' : ''}`)
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()

  // Network-level capture catches lazy/JS-injected assets that never appear in the DOM.
  const networkMedia = new Map()
  // Stash JSON/JS bodies so we can scrape image/video URLs from client-rendered
  // sites (Framer, Next.js, etc.) that ship assets inside data payloads or
  // hydration bundles rather than the served HTML.
  const textBodies = []
  page.on('response', async (resp) => {
    try {
      const url = resp.url()
      if (isBlocked(url)) return
      const ct = (resp.headers()['content-type'] || '').toLowerCase()
      let type = null
      if (ct.startsWith('image/')) type = 'image'
      else if (ct.startsWith('video/')) type = 'video'
      else if (looksLikeImage(url)) type = 'image'
      else if (looksLikeVideo(url)) type = 'video'
      if (!type) {
        if (
          /\b(application\/json|text\/javascript|application\/javascript|text\/html)\b/.test(ct) &&
          /(framerusercontent|cdn|static|assets)/i.test(url)
        ) {
          try {
            const body = await resp.text()
            if (body && body.length < 600_000) textBodies.push({ url, body })
          } catch {
            /* swallow */
          }
        }
        return
      }
      if (isSkippable(url)) return
      const cl = parseInt(resp.headers()['content-length'] || '0', 10) || 0
      if (!networkMedia.has(url)) networkMedia.set(url, { type, contentLength: cl })
    } catch {
      /* swallow */
    }
  })

  const queue = []
  const visited = new Set()
  const seeds = client.seeds || [client.base]
  seeds.forEach((s) => queue.push(s))

  const pages = []

  while (queue.length && pages.length < MAX_PAGES_PER_SITE) {
    const url = queue.shift()
    if (visited.has(url)) continue
    visited.add(url)
    try {
      console.log(`   • [${pages.length + 1}/${MAX_PAGES_PER_SITE}] ${url}`)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT })
      await sleep(client.deep ? DEEP_SETTLE_MS : SETTLE_MS)
      if (client.deep) {
        // First viewport (current laptop default) — slow exhaustive scroll +
        // hover reveals.
        await deepAutoScroll(page)
        await sleep(DEEP_SETTLE_MS)
        await triggerHoverReveals(page)
        await sleep(900)
        await deepAutoScroll(page)
        // Multi-viewport pass — only for clients that change art per breakpoint
        // (Framer-style sites). Most CMS-driven sites do not, so this is a
        // costly no-op there.
        if (!client.skipMultiViewport) {
          for (const vp of DEEP_VIEWPORTS) {
            if (vp.width === 1440) continue
            try {
              await page.setViewportSize({ width: vp.width, height: vp.height })
              await sleep(700)
              await deepAutoScroll(page, { step: 260, delay: 280 })
              await sleep(700)
            } catch {
              /* swallow viewport errors */
            }
          }
          await page.setViewportSize({ width: 1440, height: 900 })
          await sleep(500)
        }
      } else {
        await autoScroll(page)
        await sleep(SETTLE_MS)
      }
      const dom = await extractFromDom(page)
      pages.push({ url, title: dom.title, dom })

      if (pages.length < MAX_PAGES_PER_SITE) {
        const internal = await discoverInternalLinks(page, client)
        for (const link of internal) {
          if (!visited.has(link) && !queue.includes(link)) {
            queue.push(link)
          }
          if (queue.length + pages.length > MAX_PAGES_PER_SITE * 2) break
        }
      }
    } catch (err) {
      console.log(`     ! failed: ${err.message}`)
    }
  }

  await context.close()

  // Merge per-page DOM media + network media into a unified list, keyed by absolute URL.
  const byUrl = new Map()
  const discoveredAt = new Date().toISOString()

  const addItem = (item) => {
    const key = item.remoteUrl
    if (!key) return
    if (isBlocked(key)) return
    const prev = byUrl.get(key)
    if (!prev) {
      byUrl.set(key, item)
      return
    }
    if (!prev.alt && item.alt) prev.alt = item.alt
    if (!prev.title && item.title) prev.title = item.title
    if (!prev.width && item.width) prev.width = item.width
    if (!prev.height && item.height) prev.height = item.height
    if (!prev.poster && item.poster) prev.poster = item.poster
    if (!prev.pageUrl && item.pageUrl) prev.pageUrl = item.pageUrl
    if (!prev.pageTitle && item.pageTitle) prev.pageTitle = item.pageTitle
  }

  for (const p of pages) {
    const pageCategory = guessCategory(pathOf(p.url))
    const projectGuess = guessProject(pathOf(p.url), p.dom.title)

    for (const img of p.dom.images) {
      const abs = resolveUrl(p.url, img.src)
      if (!abs || !isHttp(abs)) continue
      if (isSkippable(abs)) continue
      if (SVG_EXT_RE.test(abs) && /(logo|icon|sprite|mark)/i.test(abs)) continue
      if (isLikelyTrackingPixel(img.w, img.h)) continue
      // For Wix CDN URLs, prefer the bare original (no resize) as the canonical
      // remoteUrl so the downloader pulls full quality. Keep the displayed
      // width/height — they're a real measurement of the variant on the page,
      // and we'll re-probe with sharp after download to get the true
      // resolution of the bare original.
      const upgraded = wixUpgradeCandidates(abs)
      const remote = upgraded?.bare || abs
      addItem({
        client: client.id,
        clientName: client.name,
        mediaType: 'image',
        remoteUrl: remote,
        src: remote,
        pageUrl: p.url,
        pageTitle: p.dom.title || '',
        alt: img.alt || '',
        title: '',
        filename: fileNameOf(remote),
        extension: extOf(remote),
        width: img.w || 0,
        height: img.h || 0,
        aspectRatio: img.w && img.h ? img.w / img.h : null,
        poster: '',
        source: img.source || 'dom',
        discoveredAt,
        categoryGuess: pageCategory || client.category,
        projectGuess,
      })
    }

    for (const v of p.dom.videos) {
      const abs = resolveUrl(p.url, v.src)
      let posterAbs = v.poster ? resolveUrl(p.url, v.poster) : ''
      if (!posterAbs) posterAbs = inferWixPoster(abs || '')
      if (!abs || !isHttp(abs)) continue
      if (isSkippable(abs)) continue
      addItem({
        client: client.id,
        clientName: client.name,
        mediaType: 'video',
        remoteUrl: abs,
        src: abs,
        videoSrc: abs,
        pageUrl: p.url,
        pageTitle: p.dom.title || '',
        alt: '',
        title: '',
        filename: fileNameOf(abs),
        extension: extOf(abs),
        width: v.w || 0,
        height: v.h || 0,
        aspectRatio: v.w && v.h ? v.w / v.h : null,
        poster: posterAbs || '',
        source: v.source || 'dom',
        discoveredAt,
        categoryGuess: pageCategory || client.category,
        projectGuess,
      })
    }

    for (const e of p.dom.embeds) {
      if (!e.src) continue
      addItem({
        client: client.id,
        clientName: client.name,
        mediaType: 'embed',
        remoteUrl: e.src,
        src: e.src,
        pageUrl: p.url,
        pageTitle: p.dom.title || '',
        alt: e.embed === 'vimeo' ? 'Vimeo embed' : 'YouTube embed',
        title: '',
        filename: '',
        extension: '',
        width: 0,
        height: 0,
        aspectRatio: 16 / 9,
        poster: e.poster || '',
        embed: e.embed,
        embedId: e.embedId,
        source: 'iframe',
        discoveredAt,
        categoryGuess: pageCategory || client.category,
        projectGuess,
      })
    }
  }

  // Scrape JSON / JS / HTML bodies for asset URLs that never load as their
  // own response (lazy modules, hover-only images, framer asset manifests).
  const URL_RE = /https?:\/\/[A-Za-z0-9._\-~:/?#@!$&'()*+,;=%]+\.(?:jpe?g|png|webp|avif|gif|mp4|webm|mov)(?:\?[^\s"'`<>]*)?/gi
  const sniffedAssetUrls = new Set()
  for (const { body } of textBodies) {
    let m
    while ((m = URL_RE.exec(body))) {
      const u = m[0].replace(/[\\"',]+$/, '')
      sniffedAssetUrls.add(u)
    }
  }

  // Framer publishes assets under `framerusercontent.com/images/{id}` and
  // `framerusercontent.com/assets/{id}.{ext}`. The bare-id form auto-resolves
  // to whatever variant Framer chooses; we want the canonical highest-res URL
  // so we ALSO emit the bare form for downstream resolution.
  const FRAMER_BARE_RE = /framerusercontent\.com\/(?:images|assets)\/[A-Za-z0-9_-]+/gi
  for (const { body } of textBodies) {
    let m
    while ((m = FRAMER_BARE_RE.exec(body))) {
      const u = 'https://' + m[0]
      // Skip woff/woff2 (fonts) and css.
      if (/\.(woff2?|css|js|json)$/i.test(u)) continue
      sniffedAssetUrls.add(u)
    }
  }
  for (const url of sniffedAssetUrls) {
    if (isSkippable(url) || isBlocked(url)) continue
    if (networkMedia.has(url)) continue
    let type = looksLikeVideo(url) ? 'video' : looksLikeImage(url) ? 'image' : null
    if (!type) {
      // Framer bare-id image URLs have no extension — treat them as images.
      if (/framerusercontent\.com\/images\//.test(url)) type = 'image'
    }
    if (!type) continue
    networkMedia.set(url, { type, contentLength: 0 })
  }

  // Fold network-discovered URLs in (often lazy assets).
  for (const [url, info] of networkMedia.entries()) {
    if (isSkippable(url)) continue
    // Upgrade Wix CDN images to bare originals.
    const upgraded = info.type === 'image' ? wixUpgradeCandidates(url) : null
    const remote = upgraded?.bare || url
    if (byUrl.has(remote)) {
      const cur = byUrl.get(remote)
      cur.contentLength = cur.contentLength || info.contentLength
      continue
    }
    if (info.type === 'image' && SVG_EXT_RE.test(remote) && /(logo|icon|sprite|mark)/i.test(remote)) continue
    const networkPoster = info.type === 'video' ? inferWixPoster(remote) : ''
    addItem({
      client: client.id,
      clientName: client.name,
      mediaType: info.type,
      remoteUrl: remote,
      src: remote,
      ...(info.type === 'video' ? { videoSrc: remote } : {}),
      alt: '',
      title: '',
      filename: fileNameOf(remote),
      extension: extOf(remote),
      width: 0,
      height: 0,
      aspectRatio: null,
      poster: networkPoster || '',
      pageUrl: client.base,
      pageTitle: '',
      contentLength: info.contentLength,
      source: 'network',
      discoveredAt,
      categoryGuess: client.category,
      projectGuess: null,
    })
  }

  let items = Array.from(byUrl.values())

  // Collapse Wix video resolution variants — same content hash, different
  // bitrate ladder rungs. Prefer the highest available (1080p > 720p > 480p).
  // Without this the manifest is dominated by 3+ copies of every video.
  const VID_WIX_RE = /video\.wixstatic\.com\/video\/([0-9a-f_]{6,})\/(\d+)p\/mp4\//i
  const wixVidGroups = new Map()
  const wixVidIgnore = new Set()
  for (const it of items) {
    if (it.mediaType !== 'video') continue
    const m = (it.videoSrc || it.remoteUrl || '').match(VID_WIX_RE)
    if (!m) continue
    const hash = m[1]
    const res = parseInt(m[2], 10) || 0
    const existing = wixVidGroups.get(hash)
    if (!existing || res > existing.res) {
      if (existing) wixVidIgnore.add(existing.url)
      wixVidGroups.set(hash, { res, url: it.videoSrc || it.remoteUrl })
    } else {
      wixVidIgnore.add(it.videoSrc || it.remoteUrl)
    }
  }
  if (wixVidIgnore.size) {
    items = items.filter((it) => {
      if (it.mediaType !== 'video') return true
      const u = it.videoSrc || it.remoteUrl || ''
      return !wixVidIgnore.has(u)
    })
  }

  // Filter junk: tiny images, sub-8KB images, gibberish.
  items = items.filter((it) => {
    if (it.mediaType === 'image' && (it.width || it.height)) {
      if (it.width > 0 && it.width < 240) return false
      if (it.height > 0 && it.height < 240) return false
    }
    if (
      it.contentLength &&
      it.contentLength > 0 &&
      it.contentLength < 8 * 1024 &&
      it.mediaType === 'image'
    ) {
      return false
    }
    return true
  })

  // Score for hero-quality and general priority.
  items.forEach((it, i) => {
    const sizeScore = ((it.width || 0) * (it.height || 0)) / 1_000_000
    const altBonus = it.alt ? 0.5 : 0
    const videoBonus = it.mediaType === 'video' ? 1.5 : 0
    const galleryBonus = /(gallery|work|project|portfolio|reel|feature)/i.test(it.pageUrl || '')
      ? 0.4
      : 0
    const wideBonus = it.width && it.width >= 1200 ? 0.4 : 0
    const score = sizeScore + altBonus + videoBonus + galleryBonus + wideBonus + 1 / (i + 30)
    it.priorityScore = +score.toFixed(3)
    it.priority = it.priorityScore // legacy alias
    if (!it.id) it.id = makeId(client.id, it.remoteUrl)
    if (!it.title) {
      const last = decodeURIComponent((it.filename || '').split('.')[0])
      it.title =
        it.alt ||
        last.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
        'Untitled'
    }
  })

  items.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))

  console.log(
    `   ↳ ${pages.length} pages · ${items.filter((i) => i.mediaType === 'image').length} images · ${items.filter((i) => i.mediaType === 'video').length} videos · ${items.filter((i) => i.mediaType === 'embed').length} embeds`,
  )

  return {
    client: client.id,
    name: client.name,
    base: client.base,
    pagesScanned: pages.map((p) => ({ url: p.url, title: p.dom.title })),
    items,
  }
}

async function main() {
  const t0 = Date.now()
  await fs.mkdir(path.dirname(OUT), { recursive: true })

  // Allow `--client=foo` (repeatable) to scope a re-scan to a single client
  // while preserving previously scanned data for the others (read from the
  // existing manifest, if any). Useful when iterating on scanner heuristics
  // for a sparse client without re-pulling 1k images for the rich ones.
  const onlyClients = new Set()
  for (const raw of process.argv.slice(2)) {
    if (!raw.startsWith('--client=')) continue
    onlyClients.add(raw.slice('--client='.length))
  }
  let priorClients = []
  if (onlyClients.size) {
    try {
      const prior = JSON.parse(await fs.readFile(OUT, 'utf8'))
      priorClients = prior.clients || []
    } catch {
      /* no prior manifest, that's fine */
    }
  }

  const browser = await chromium.launch({ headless: true })
  const results = []
  for (const client of CLIENTS) {
    if (onlyClients.size && !onlyClients.has(client.id)) {
      const prev = priorClients.find((c) => c.client === client.id)
      if (prev) {
        results.push(prev)
        console.log(`   → ${client.name}: preserved (skipped by --client filter)`)
      }
      continue
    }
    try {
      const r = await scanClient(browser, client)
      results.push(r)
    } catch (err) {
      console.error(`Failed scanning ${client.id}:`, err)
      results.push({
        client: client.id,
        name: client.name,
        base: client.base,
        error: err.message,
        pagesScanned: [],
        items: [],
      })
    }
  }
  await browser.close()

  const manifest = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    clients: results,
    summary: results.map((r) => ({
      client: r.client,
      pages: r.pagesScanned.length,
      images: r.items.filter((i) => i.mediaType === 'image').length,
      videos: r.items.filter((i) => i.mediaType === 'video').length,
      embeds: r.items.filter((i) => i.mediaType === 'embed').length,
    })),
  }

  await fs.writeFile(OUT, JSON.stringify(manifest, null, 2))
  console.log(`\n✓ Manifest written: ${path.relative(ROOT, OUT)}`)

  // Compact site-data for the React bundle — keeps the JS payload small.
  const siteData = {
    generatedAt: manifest.generatedAt,
    summary: manifest.summary,
    clients: results.map((r) => ({
      client: r.client,
      name: r.name,
      base: r.base,
      pagesScanned: r.pagesScanned,
      items: (r.items || []).slice(0, ITEMS_PER_CLIENT_FOR_SITE).map((it) => ({
        id: it.id,
        client: it.client,
        title: it.title,
        category: it.categoryGuess,
        categoryGuess: it.categoryGuess,
        projectGuess: it.projectGuess,
        src: it.src,
        remoteUrl: it.remoteUrl,
        videoSrc: it.videoSrc,
        poster: it.poster,
        alt: it.alt,
        filename: it.filename,
        extension: it.extension,
        width: it.width,
        height: it.height,
        aspectRatio: it.aspectRatio,
        mediaType: it.mediaType,
        priority: it.priorityScore,
        priorityScore: it.priorityScore,
        source: it.source,
        pageUrl: it.pageUrl,
        embed: it.embed || null,
        embedId: it.embedId || null,
      })),
    })),
  }
  await fs.writeFile(SITE_OUT, JSON.stringify(siteData))
  console.log(`✓ Compact site data: ${path.relative(ROOT, SITE_OUT)}`)
  console.log(manifest.summary)

  // Platinum-only audit — same idea as the Deliverables audit below; makes
  // the per-client inventory easy to inspect after a deep Wix scan.
  const plt = results.find((r) => r.client === 'platinum')
  if (plt) {
    const PLT_AUDIT = path.join(ROOT, 'content-audit', 'platinum-media-audit.json')
    const items = plt.items || []
    const audit = {
      generatedAt: manifest.generatedAt,
      base: plt.base,
      pagesScanned: plt.pagesScanned,
      counts: {
        total: items.length,
        images: items.filter((i) => i.mediaType === 'image').length,
        videos: items.filter((i) => i.mediaType === 'video').length,
        embeds: items.filter((i) => i.mediaType === 'embed').length,
        bySource: items.reduce((acc, it) => {
          const k = it.source || 'unknown'
          acc[k] = (acc[k] || 0) + 1
          return acc
        }, {}),
        byCategoryGuess: items.reduce((acc, it) => {
          const k = it.categoryGuess || 'Studio'
          acc[k] = (acc[k] || 0) + 1
          return acc
        }, {}),
      },
      items: items.map((it) => ({
        id: it.id,
        mediaType: it.mediaType,
        remoteUrl: it.remoteUrl,
        pageUrl: it.pageUrl,
        source: it.source,
        width: it.width,
        height: it.height,
        aspectRatio: it.aspectRatio,
        filename: it.filename,
        extension: it.extension,
        alt: it.alt,
        title: it.title,
        poster: it.poster,
        contentLength: it.contentLength || 0,
        priority: it.priorityScore,
        projectGuess: it.projectGuess,
        categoryGuess: it.categoryGuess,
      })),
    }
    await fs.writeFile(PLT_AUDIT, JSON.stringify(audit, null, 2))
    console.log(`✓ Platinum audit: ${path.relative(ROOT, PLT_AUDIT)} (${items.length} items)`)
  }

  // Deliverables-only audit — separate file makes it easy for the user (and
  // future Claude sessions) to see what got found on thedeliverables.ai
  // without scrolling past the rich Wix/Platinum manifests.
  const dlv = results.find((r) => r.client === 'deliverables')
  if (dlv) {
    const DLV_AUDIT = path.join(ROOT, 'content-audit', 'deliverables-media-audit.json')
    const items = dlv.items || []
    const audit = {
      generatedAt: manifest.generatedAt,
      base: dlv.base,
      pagesScanned: dlv.pagesScanned,
      counts: {
        total: items.length,
        images: items.filter((i) => i.mediaType === 'image').length,
        videos: items.filter((i) => i.mediaType === 'video').length,
        embeds: items.filter((i) => i.mediaType === 'embed').length,
        bySource: items.reduce((acc, it) => {
          const k = it.source || 'unknown'
          acc[k] = (acc[k] || 0) + 1
          return acc
        }, {}),
      },
      items: items.map((it) => ({
        id: it.id,
        mediaType: it.mediaType,
        remoteUrl: it.remoteUrl,
        pageUrl: it.pageUrl,
        source: it.source,
        width: it.width,
        height: it.height,
        aspectRatio: it.aspectRatio,
        filename: it.filename,
        extension: it.extension,
        alt: it.alt,
        title: it.title,
        poster: it.poster,
        contentLength: it.contentLength || 0,
        priority: it.priorityScore,
        projectGuess: it.projectGuess,
        categoryGuess: it.categoryGuess,
      })),
    }
    await fs.writeFile(DLV_AUDIT, JSON.stringify(audit, null, 2))
    console.log(`✓ Deliverables audit: ${path.relative(ROOT, DLV_AUDIT)} (${items.length} items)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
