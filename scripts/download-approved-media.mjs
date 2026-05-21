/**
 * Downloader — reads content-audit/media-manifest.json and saves each
 * remote asset under public/media/<client>/. Skips Garrigosa (which is
 * never in the manifest anyway), tracking pixels, and duplicates.
 *
 * Flags:
 *   --limit=120                  hard cap per client (default 120)
 *   --client=platinum            only this client (repeatable)
 *   --no-video                   skip videos entirely
 *
 * Run:  node scripts/download-approved-media.mjs --limit=120
 */

import { promises as fs, createWriteStream } from 'node:fs'
import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MANIFEST = path.join(ROOT, 'content-audit', 'media-manifest.json')
const OUT_LOG = path.join(ROOT, 'content-audit', 'downloaded-media.json')

const CLIENT_DIRS = {
  platinum: 'public/media/platinum',
  'steve-giralt': 'public/media/steve-giralt',
  deliverables: 'public/media/deliverables',
}

// Hard-block Garrigosa under all circumstances.
const BLOCKED_HOSTS = ['garrigosastudio.com', 'www.garrigosastudio.com']

function parseArgs() {
  const a = { clients: [] }
  for (const raw of process.argv.slice(2)) {
    if (!raw.startsWith('--')) continue
    const [k, v] = raw.slice(2).split('=')
    if (k === 'client') {
      if (v) a.clients.push(v)
      continue
    }
    a[k] = v === undefined ? true : v
  }
  return a
}

function cleanFilename(srcUrl, fallback, mediaType) {
  try {
    const u = new URL(srcUrl)
    let name = decodeURIComponent(path.basename(u.pathname) || '')
    name = name.split('?')[0].split('#')[0]
    name = name
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    if (!name || !path.extname(name)) {
      // Framer publishes bare-id image URLs (no extension). Give them a
      // sensible extension based on the declared media type so the runtime
      // can serve them as real images.
      const ext =
        guessExt(srcUrl) ||
        (mediaType === 'video' ? '.mp4' : mediaType === 'image' ? '.jpg' : '.bin')
      name = name ? `${name}${ext}` : (fallback || 'asset') + ext
    }
    return name.slice(0, 96)
  } catch {
    return (
      (fallback || 'asset') +
      (guessExt(srcUrl) ||
        (mediaType === 'video' ? '.mp4' : mediaType === 'image' ? '.jpg' : '.bin'))
    )
  }
}

function guessExt(url) {
  const m = url.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif|gif|svg|mp4|webm|mov|m4v|ogv)(\?|#|$)/)
  return m ? '.' + m[1] : null
}

function isBlockedHost(url) {
  try {
    const h = new URL(url).hostname
    return BLOCKED_HOSTS.some((b) => h === b || h.endsWith('.' + b))
  } catch {
    return true
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function fileExists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

// Framer's bare-id image URLs sometimes 404 without a scale-down hint.
// Build a list of candidate URLs to try in order — the first success wins.
function urlCandidates(url, mediaType) {
  const list = [url]
  if (mediaType === 'image' && /framerusercontent\.com\/images\/[^./?]+$/.test(url)) {
    list.push(`${url}?scale-down-to=2048`)
    list.push(`${url}?scale-down-to=1024`)
    list.push(`${url}?scale-down-to=512`)
  }
  return list
}

// For Wix CDN images, try a series of high-quality "fit" variants and keep
// whichever returns the largest pixel-count. The bare URL alone often serves
// the original upload — which on a Wix portfolio is frequently a sub-1000px
// JPG. Asking for fit/w_2560 (or 3840) lets Wix render the largest variant
// the source actually supports without upscaling — perfect for a premium
// gallery.
function wixHiResCandidates(url) {
  if (!/static\.wixstatic\.com\/media\/[A-Za-z0-9_~.]+/.test(url)) return null
  const noQuery = url.split('?')[0]
  const v1Idx = noQuery.toLowerCase().indexOf('/v1/')
  const base = v1Idx === -1 ? noQuery : noQuery.slice(0, v1Idx)
  // Determine extension off the base; default jpg.
  const extMatch = base.match(/\.([a-z0-9]+)$/i)
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg'
  // `fit` keeps aspect ratio; `enc_auto/quality_auto` lets Wix pick best codec.
  const tail = (w, h) => `/v1/fit/w_${w},h_${h},al_c,q_92,enc_auto/file.${ext}`
  return [
    `${base}${tail(3840, 3840)}`,
    `${base}${tail(2560, 2560)}`,
    `${base}${tail(1920, 1920)}`,
    base,
  ]
}

async function downloadOne(url, destDir, fallbackName, mediaType, opts = {}) {
  const filename = cleanFilename(url, fallbackName, mediaType)
  const dest = path.join(destDir, filename)
  const { force = false } = opts
  if (!force && (await fileExists(dest))) {
    const stat = await fs.stat(dest)
    return { url, dest, skipped: 'exists', filename, bytes: stat.size }
  }
  // For Wix images, try several high-res "fit" variants and keep the one
  // with the most pixels. For Framer, fall through to scale-down candidates.
  if (mediaType === 'image') {
    const wixVariants = wixHiResCandidates(url)
    if (wixVariants) {
      const tmp = dest + '.dl-tmp'
      let best = null
      for (const candidate of wixVariants) {
        try {
          const res = await fetch(candidate, {
            headers: {
              'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
              referer: 'https://' + new URL(candidate).hostname + '/',
            },
          })
          if (!res.ok || !res.body) continue
          await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp))
          let pixels = 0
          let bytes = 0
          try {
            const meta = await sharp(tmp).metadata()
            pixels = (meta.width || 0) * (meta.height || 0)
          } catch {
            /* not a probe-able image — skip */
            continue
          }
          try {
            const stat = await fs.stat(tmp)
            bytes = stat.size
          } catch {
            /* ignore */
          }
          if (pixels > (best?.pixels || 0)) {
            // Promote this variant to be the canonical file.
            await fs.rename(tmp, dest)
            best = { url: candidate, pixels, bytes }
            // If we hit a substantial result (>=2.5 MP) keep it and stop —
            // additional larger variants will likely be upscales.
            if (pixels >= 2_500_000) break
          } else {
            await fs.unlink(tmp).catch(() => {})
          }
        } catch {
          await fs.unlink(tmp).catch(() => {})
        }
      }
      if (best) {
        return { url: best.url, dest, filename, bytes: best.bytes }
      }
      // fall through to the regular path so we still get *something*
    }
  }
  const candidates = urlCandidates(url, mediaType)
  let lastErr
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          referer: 'https://' + new URL(candidate).hostname + '/',
        },
      })
      if (!res.ok || !res.body) {
        lastErr = new Error(`HTTP ${res.status} ${res.statusText}`)
        continue
      }
      await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
      const stat = await fs.stat(dest)
      return { url: candidate, dest, filename, bytes: stat.size }
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr || new Error('No download candidate succeeded')
}

async function main() {
  const flags = parseArgs()
  const limit = parseInt(flags.limit || '120', 10)
  const onlyClients = flags.clients.length ? new Set(flags.clients) : null
  const skipVideos = flags['no-video'] === true || flags['no-video'] === 'true'
  const force = flags['force'] === true || flags['force'] === 'true'

  if (!(await fileExists(MANIFEST))) {
    console.error('No manifest found at', MANIFEST)
    console.error('Run `npm run audit:media` first.')
    process.exit(1)
  }
  const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'))

  // When a --client filter is used, preserve previously logged entries for
  // the other clients so we don't accidentally orphan their local media.
  let priorLog = { perClient: {} }
  if (onlyClients && (await fileExists(OUT_LOG))) {
    try {
      priorLog = JSON.parse(await fs.readFile(OUT_LOG, 'utf8'))
    } catch {
      /* fresh log */
    }
  }
  const log = {
    generatedAt: new Date().toISOString(),
    flags: { limit, clients: [...(onlyClients || [])], noVideo: skipVideos },
    perClient: { ...(priorLog.perClient || {}) },
    failed: [],
  }

  for (const c of manifest.clients) {
    if (onlyClients && !onlyClients.has(c.client)) continue
    const destDir = path.join(ROOT, CLIENT_DIRS[c.client] || `public/media/${c.client}`)
    await ensureDir(destDir)

    const list = (c.items || [])
      .filter((it) => {
        const u = it.remoteUrl || it.src
        if (!u) return false
        if (isBlockedHost(u)) return false
        if (it.mediaType === 'embed') return false
        if (skipVideos && it.mediaType === 'video') return false
        return true
      })
      // Strong dedupe across filename + url to avoid wasted bytes.
      .filter((it, i, arr) => {
        const fn = cleanFilename(it.remoteUrl || it.src, `dup-${i}`, it.mediaType)
        return arr.findIndex((o) => cleanFilename(o.remoteUrl || o.src, `dup-${i}`) === fn) === i
      })
      .slice(0, limit)

    console.log(
      `\n→ ${c.name} (${c.client}) — downloading up to ${list.length} items into ${path.relative(ROOT, destDir)}`,
    )

    const entries = []
    for (const [i, it] of list.entries()) {
      const url = it.remoteUrl || it.src
      const fallback = `${c.client}-${i.toString().padStart(3, '0')}`
      try {
        const r = await downloadOne(url, destDir, fallback, it.mediaType, { force })
        const localPath = path.posix.join(
          '/',
          path.relative(path.join(ROOT, 'public'), r.dest).split(path.sep).join('/'),
        )

        // Also localise the poster if there is one (best-effort, ignore failures).
        let localPoster = null
        if (it.poster && !skipVideos && !isBlockedHost(it.poster)) {
          try {
            const pr = await downloadOne(it.poster, destDir, fallback + '-poster', 'image', { force })
            localPoster = path.posix.join(
              '/',
              path.relative(path.join(ROOT, 'public'), pr.dest).split(path.sep).join('/'),
            )
          } catch {
            /* ignore poster failure */
          }
        }

        // Inspect downloaded images to backfill width/height — the scanner
        // often misses these (lazy loads, text-body sniffs, etc.) and the
        // runtime relies on them for hero-quality / "is large enough"
        // filters.
        let probedW = it.width || 0
        let probedH = it.height || 0
        if (it.mediaType === 'image' && (!probedW || !probedH)) {
          try {
            const meta = await sharp(r.dest).metadata()
            probedW = meta.width || probedW
            probedH = meta.height || probedH
          } catch {
            /* non-image (svg, broken) — keep zeroes */
          }
        }
        const probedAR = probedW && probedH ? probedW / probedH : it.aspectRatio

        entries.push({
          id: it.id,
          client: it.client,
          title: it.title,
          category: it.category || it.categoryGuess,
          alt: it.alt,
          mediaType: it.mediaType,
          width: probedW,
          height: probedH,
          aspectRatio: probedAR,
          filename: r.filename,
          pageUrl: it.pageUrl,
          remoteUrl: url,
          localPath,
          poster: localPoster || it.poster || null,
          remotePoster: it.poster || null,
          priority: it.priority ?? it.priorityScore ?? 0,
          source: it.source,
          skipped: r.skipped || null,
          bytes: r.bytes || null,
        })
        process.stdout.write('.')
      } catch (err) {
        log.failed.push({ url, client: c.client, error: err.message })
        process.stdout.write('x')
      }
    }
    console.log('')
    log.perClient[c.client] = entries
  }

  await fs.writeFile(OUT_LOG, JSON.stringify(log, null, 2))
  console.log(`\n✓ Download log: ${path.relative(ROOT, OUT_LOG)}`)
  for (const [client, entries] of Object.entries(log.perClient)) {
    console.log(`  ${client}: ${entries.length} files`)
  }
  if (log.failed.length) console.log(`  failures: ${log.failed.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
