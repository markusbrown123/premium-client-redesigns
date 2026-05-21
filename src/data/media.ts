import type { ClientGroup, ClientId, MediaItem, MediaType } from './media-types'
import manifestRaw from '../../content-audit/site-data.json'
import downloadedRaw from '../../content-audit/downloaded-media.json'

export type { MediaItem } from './media-types'

type RawManifestItem = {
  id?: string
  client?: string
  clientName?: string
  title?: string
  category?: string
  categoryGuess?: string
  projectGuess?: string | null
  description?: string
  src: string
  remoteUrl?: string
  videoSrc?: string
  poster?: string
  alt?: string
  pageUrl?: string
  filename?: string
  extension?: string
  width?: number
  height?: number
  aspectRatio?: number | null
  mediaType: MediaType
  priority?: number
  priorityScore?: number
  embed?: 'vimeo' | 'youtube' | null
  embedId?: string | null
  source?: MediaItem['source']
}

type RawClient = {
  client: string
  name: string
  base: string
  pagesScanned?: Array<{ url: string; title?: string }>
  items?: RawManifestItem[]
}

type RawManifest = {
  generatedAt: string | null
  clients?: RawClient[]
  summary?: Array<{
    client: string
    pages: number
    images: number
    videos: number
    embeds?: number
  }>
}

type RawDownloadedEntry = {
  id?: string
  client: string
  title?: string
  category?: string
  alt?: string
  mediaType: MediaType
  width?: number
  height?: number
  filename?: string
  pageUrl?: string
  remoteUrl: string
  localPath: string
  poster?: string | null
  remotePoster?: string | null
  priority?: number
}

type RawDownloaded = {
  generatedAt: string | null
  perClient?: Record<string, RawDownloadedEntry[]>
}

const manifest = manifestRaw as RawManifest
const downloaded = downloadedRaw as RawDownloaded

const CLIENT_META: Record<ClientId, { name: string; category: string }> = {
  platinum: {
    name: 'Platinum FMD',
    category: 'Fashion · Model management',
  },
  'steve-giralt': {
    name: 'Steve Giralt',
    category: 'Director · Creative technology',
  },
  deliverables: {
    name: 'The Deliverables',
    category: 'AI imagery · Campaign deliverables',
  },
}

const CLIENT_IDS = Object.keys(CLIENT_META) as ClientId[]

function asClientId(id: string): ClientId | null {
  return (CLIENT_IDS as string[]).includes(id) ? (id as ClientId) : null
}

// =========================================================================
// Public loaders — used by tests, scripts, or any callsite that wants the
// raw manifest + downloaded-map data without going through normalisation.
// =========================================================================

export function loadManifestMedia(): RawManifestItem[] {
  const out: RawManifestItem[] = []
  for (const c of manifest.clients || []) {
    for (const it of c.items || []) out.push(it)
  }
  return out
}

export function loadDownloadedMediaMap(): Map<string, RawDownloadedEntry> {
  const map = new Map<string, RawDownloadedEntry>()
  for (const list of Object.values(downloaded?.perClient || {})) {
    for (const e of list) {
      if (e.remoteUrl && e.localPath) map.set(e.remoteUrl, e)
    }
  }
  return map
}

const downloadedByRemote = loadDownloadedMediaMap()

// Index every downloaded file by its local basename (without dir) so we can
// look up auto-generated companion files — most notably Wix `*f000.jpg`
// poster frames that share a hash prefix with their `.mp4` siblings.
const downloadedByLocalBasename = (() => {
  const map = new Map<string, RawDownloadedEntry>()
  for (const list of Object.values(downloaded?.perClient || {})) {
    for (const e of list) {
      const base = (e.localPath || '').split('/').pop()?.toLowerCase()
      if (base) map.set(base, e)
    }
  }
  return map
})()

function fileBasename(u: string): string {
  if (!u) return ''
  const p = u.split('?')[0].split('#')[0]
  return (p.split('/').pop() || '').toLowerCase()
}

// Wix encodes the source video & its poster with the same content hash, e.g.
//   video: .../video/{prefix}_{hash}/1080p/mp4/file.mp4
//   poster: https://static.wixstatic.com/media/{prefix}_{hash}f000.jpg
// If the poster was downloaded alongside the video, return the local path.
function deriveWixPoster(videoUrl?: string): string | undefined {
  if (!videoUrl) return undefined
  const m = videoUrl.match(/\/video\/([0-9a-f_]{6,})\//i)
  if (!m) return undefined
  const stem = m[1].toLowerCase()
  // Try multiple known Wix poster filename variants.
  const candidates = [`${stem}f000.jpg`, `${stem}_f000.jpg`, `${stem}.jpeg`]
  for (const c of candidates) {
    const hit = downloadedByLocalBasename.get(c)
    if (hit) return hit.localPath
  }
  return undefined
}

// Manual remote→local poster overrides for videos whose hosting platform
// doesn't expose a discoverable poster. Keep this list short and explicit.
const MANUAL_POSTERS: Record<string, string> = {
  'https://framerusercontent.com/assets/FbTnyHqi9Onef5qpEdc1gLZJc.mp4':
    '/media/deliverables/5ILRvlYXf72kHSVHqpa3snGzjU.jpg',
}

function titleFromUrl(u: string) {
  try {
    const last = decodeURIComponent(
      (u.split('/').pop() || '').split('?')[0].split('.')[0],
    )
    return (
      last.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
      'Untitled'
    )
  } catch {
    return 'Untitled'
  }
}

function normalize(item: RawManifestItem, fallbackIndex: number): MediaItem | null {
  const client = asClientId(item.client || '')
  if (!client) return null
  const remote = item.remoteUrl || item.src
  if (!remote) return null
  const local = downloadedByRemote.get(remote)
  const src = local?.localPath || remote
  // Prefer an explicit poster (scanner-supplied or downloaded). Fall back to a
  // Wix-derived poster, then a manual override (for Framer / other hosts that
  // don't expose discoverable posters).
  const manualPoster =
    item.mediaType === 'video' ? MANUAL_POSTERS[item.videoSrc || remote] : undefined
  const inferredPoster =
    item.mediaType === 'video' ? deriveWixPoster(item.videoSrc || remote) : undefined
  const poster = item.poster
    ? downloadedByRemote.get(item.poster)?.localPath || item.poster
    : inferredPoster || manualPoster
  const id =
    item.id ||
    `${client}-${fallbackIndex.toString(36)}-${(remote.split('/').pop() || 'item').slice(0, 32).replace(/[^a-z0-9_-]+/gi, '-')}`
  return {
    id,
    client,
    title: item.title || titleFromUrl(remote),
    category: item.category || item.categoryGuess || CLIENT_META[client].category,
    description: item.description,
    src,
    remoteUrl: remote,
    localPath: local?.localPath,
    filename: item.filename || local?.filename || fileBasename(src),
    extension: item.extension,
    videoSrc: item.videoSrc
      ? downloadedByRemote.get(item.videoSrc)?.localPath || item.videoSrc
      : item.mediaType === 'video'
        ? src
        : undefined,
    poster,
    alt: item.alt || '',
    pageUrl: item.pageUrl,
    width: local?.width || item.width || 0,
    height: local?.height || item.height || 0,
    aspectRatio: item.aspectRatio,
    mediaType: item.mediaType,
    priority: item.priorityScore ?? item.priority ?? 0,
    embed: item.embed ?? null,
    embedId: item.embedId ?? null,
    source: item.source,
  }
}

// =========================================================================
// Filters & scoring
// =========================================================================

function looksLikeRealMediaUrl(src: string, kind: 'image' | 'video'): boolean {
  if (!src) return false
  const base = fileBasename(src)
  if (kind === 'video') {
    // Reject HLS playlist/segment files — they aren't playable in a bare
    // <video> tag and would be picked up as "usable" otherwise just because
    // they sit under /media/.
    if (/\.(m3u8|ts)(\?|#|$)/i.test(base)) return false
    if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(base)) return true
    if (src.startsWith('/media/')) return true
    return false
  }
  if (/\.(jpe?g|png|webp|avif|gif|svg)(\?|#|$)/i.test(base)) return true
  if (src.startsWith('/media/')) return true
  // Wix-style image directive URLs.
  if (/\/media\/.+\/v1\/.+\.(jpe?g|png|webp|avif|gif)/i.test(src)) return true
  return false
}

export function isUsableMedia(it: MediaItem): boolean {
  if (!it.src) return false
  if (it.mediaType === 'embed') return !!it.embedId
  const u = it.src.toLowerCase()
  const base = fileBasename(it.src)
  if (/(favicon|sprite|wp-emoji|tracking|pixel|\.ico\b)/i.test(u)) return false
  if (/\.svg(\?|#|$)/i.test(u) && /(logo|icon|mark)/i.test(u)) return false
  if (it.mediaType === 'video') {
    if (!looksLikeRealMediaUrl(it.videoSrc || it.src, 'video')) return false
  } else {
    if (!looksLikeRealMediaUrl(it.src, 'image')) return false
  }
  if (/\.gif(\?|#|$)/i.test(base)) {
    if (it.width && it.width < 700) return false
    if (/logo|icon|animation/i.test(it.title || '') || /logo|icon/i.test(base)) return false
  }
  if (it.mediaType === 'image' && it.width && it.height) {
    if (it.width < 240 || it.height < 240) return false
  }
  return true
}

export function scoreHeroMedia(it: MediaItem): number {
  let s = it.priority || 0
  if (it.mediaType === 'video') s += 6
  if (it.localPath) s += 2
  const w = it.width || 0
  const h = it.height || 0
  if (w >= 1600) s += 2
  else if (w >= 1200) s += 1.2
  else if (w >= 900) s += 0.6
  if (w && h) {
    const ar = w / h
    if (ar > 1.2 && ar < 2.4) s += 0.8 // landscape sweet spot
  }
  if (it.alt) s += 0.3
  return s
}

export function isHeroQuality(it: MediaItem): boolean {
  if (!isUsableMedia(it)) return false
  if (it.embed) return false
  if (it.mediaType === 'video') return !!(it.videoSrc || it.src)
  const w = it.width || 0
  const h = it.height || 0
  // Demand reasonably large media; if dimensions unknown but it's a local
  // downloaded file we trust it.
  if (w && w < 900) return false
  if (h && h < 600) return false
  if (!w && !it.localPath) return false
  return true
}

function isLargeImage(it: MediaItem): boolean {
  if (it.mediaType !== 'image') return false
  const w = it.width || 0
  const h = it.height || 0
  if (w && w < 260) return false
  if (h && h < 260) return false
  return true
}

// =========================================================================
// Dedupe
// =========================================================================

export function dedupeMedia(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>()
  const out: MediaItem[] = []
  for (const it of items) {
    const titleKey =
      it.title && it.width && it.height
        ? `t:${it.title.toLowerCase()}|${it.width}x${it.height}`
        : ''
    const keys = [
      it.src,
      it.remoteUrl || '',
      it.localPath || '',
      it.videoSrc || '',
      fileBasename(it.src),
      fileBasename(it.videoSrc || ''),
      titleKey,
    ].filter(Boolean)
    if (keys.some((k) => seen.has(k))) continue
    keys.forEach((k) => seen.add(k))
    out.push(it)
  }
  return out
}

// =========================================================================
// Client buckets
// =========================================================================

export const clientsManifest: ClientGroup[] = CLIENT_IDS.map((cid) => {
  const raw = manifest.clients?.find((c) => c.client === cid)
  const meta = CLIENT_META[cid]
  const rawItems = raw?.items || []
  const items = dedupeMedia(
    rawItems
      .map((r, i) => normalize(r, i))
      .filter((x): x is MediaItem => !!x)
      .filter(isUsableMedia),
  ).sort((a, b) => b.priority - a.priority)

  return {
    id: cid,
    name: raw?.name || meta.name,
    base: raw?.base || '',
    category: meta.category,
    pages: raw?.pagesScanned?.length ?? 0,
    imagesCount: items.filter((i) => i.mediaType === 'image').length,
    videosCount: items.filter((i) => i.mediaType === 'video').length,
    items,
  }
})

export const totalsByClient = clientsManifest.map((g) => ({
  client: g.id,
  pages: g.pages,
  images: g.imagesCount,
  videos: g.videosCount,
}))

export function getClient(id: ClientId): ClientGroup {
  return (
    clientsManifest.find((c) => c.id === id) || {
      id,
      name: CLIENT_META[id].name,
      base: '',
      category: CLIENT_META[id].category,
      pages: 0,
      imagesCount: 0,
      videosCount: 0,
      items: [],
    }
  )
}

export function getAllClientMedia(): MediaItem[] {
  return clientsManifest.flatMap((c) => c.items)
}

export function getClientMedia(client: ClientId): MediaItem[] {
  return getClient(client).items
}

// =========================================================================
// Hero rotation — round-robin across clients, hero-quality only, no repeats.
// =========================================================================

/**
 * Hero rotation for a single client site. Returns the strongest hero-quality
 * media (videos first, then large landscape images) up to `limit`. Used by
 * the per-site Hero so each site rotates only its own client's media.
 */
export function getClientHeroRotation(client: ClientId, limit = 7): MediaItem[] {
  const c = getClient(client)
  const pool = c.items
    .filter(isHeroQuality)
    .slice()
    .sort((a, b) => scoreHeroMedia(b) - scoreHeroMedia(a))
  const videos = pool.filter((i) => i.mediaType === 'video')
  const images = pool.filter((i) => i.mediaType === 'image')
  // Interleave: video, image, image, image, image, image, video for rhythm.
  const ordered: MediaItem[] = []
  const vQueue = [...videos]
  const iQueue = [...images]
  while (ordered.length < limit && (vQueue.length || iQueue.length)) {
    if (vQueue.length && (ordered.length === 0 || ordered.length % 4 === 0)) {
      ordered.push(vQueue.shift()!)
      continue
    }
    if (iQueue.length) ordered.push(iQueue.shift()!)
    else if (vQueue.length) ordered.push(vQueue.shift()!)
    else break
  }
  return ordered.slice(0, limit)
}

export function getHeroRotation(limit = 8): MediaItem[] {
  const perClient: Record<ClientId, MediaItem[]> = {
    platinum: [],
    'steve-giralt': [],
    deliverables: [],
  }
  for (const c of clientsManifest) {
    const pool = c.items
      .filter(isHeroQuality)
      .slice()
      .sort((a, b) => scoreHeroMedia(b) - scoreHeroMedia(a))
    const videos = pool.filter((i) => i.mediaType === 'video')
    const images = pool.filter((i) => i.mediaType === 'image')
    perClient[c.id] = [...videos.slice(0, 2), ...images.slice(0, 6)]
  }

  const picks: MediaItem[] = []
  const seenKeys = new Set<string>()
  const keyOf = (m: MediaItem) =>
    [m.localPath, m.remoteUrl, fileBasename(m.src), fileBasename(m.videoSrc || '')]
      .filter(Boolean)
      .join('|')

  for (let round = 0; round < limit + 6; round++) {
    for (const c of CLIENT_IDS) {
      const pool = perClient[c]
      const pick = pool.shift()
      if (!pick) continue
      const k = keyOf(pick)
      if (seenKeys.has(k)) continue
      seenKeys.add(k)
      picks.push(pick)
      if (picks.length >= limit) break
    }
    if (picks.length >= limit) break
  }
  return picks
}

// =========================================================================
// Section selection — buckets that never repeat media inside one visible block.
// =========================================================================

type SectionOptions = {
  count?: number
  exclude?: ReadonlySet<string>
  mediaType?: MediaType
  preferVideos?: boolean
}

function exclusionKeys(it: MediaItem): string[] {
  return [
    it.src,
    it.remoteUrl || '',
    it.localPath || '',
    fileBasename(it.src),
    fileBasename(it.videoSrc || ''),
  ].filter(Boolean)
}

export function getSectionMedia(client: ClientId, opts: SectionOptions = {}): MediaItem[] {
  const { count = 8, exclude = new Set<string>(), mediaType, preferVideos } = opts
  const c = getClient(client)
  let pool = c.items.filter((i) => isLargeImage(i) || (i.mediaType === 'video' && !!i.videoSrc))
  if (mediaType) pool = pool.filter((i) => i.mediaType === mediaType)

  const sorted = pool.slice().sort((a, b) => {
    if (preferVideos) {
      const av = a.mediaType === 'video' ? 1 : 0
      const bv = b.mediaType === 'video' ? 1 : 0
      if (av !== bv) return bv - av
    }
    return b.priority - a.priority
  })

  const out: MediaItem[] = []
  const seen = new Set<string>(exclude)
  for (const m of sorted) {
    const keys = exclusionKeys(m)
    if (keys.some((k) => seen.has(k))) continue
    keys.forEach((k) => seen.add(k))
    out.push(m)
    if (out.length >= count) break
  }
  return out
}

export function getGalleryMedia(client: ClientId, count = 12): MediaItem[] {
  return getSectionMedia(client, { count, mediaType: 'image' })
}

export function getMediaWallItems(client: ClientId, count = 14): MediaItem[] {
  return getSectionMedia(client, { count, mediaType: 'image' })
}

// =========================================================================
// Legacy helpers retained for existing section files.
// =========================================================================

export function getFeatured(
  id: ClientId,
  exclude: ReadonlySet<string> = new Set(),
): MediaItem | undefined {
  const c = getClient(id)
  const pool = c.items.filter((i) => !exclude.has(i.src))
  return (
    pool.find((i) => i.mediaType === 'video' && !!i.videoSrc) ||
    pool.find((i) => i.mediaType === 'image' && isLargeImage(i)) ||
    pool[0]
  )
}

export function getGalleryImages(
  id: ClientId,
  count = 8,
  exclude: ReadonlySet<string> = new Set(),
): MediaItem[] {
  const c = getClient(id)
  return c.items
    .filter((i) => i.mediaType === 'image' && isLargeImage(i))
    .filter((i) => !exclude.has(i.src))
    .slice(0, count)
}

export function getProjects(
  id: ClientId,
  count = 6,
  exclude: ReadonlySet<string> = new Set(),
): MediaItem[] {
  const c = getClient(id)
  return c.items
    .filter((i) => isLargeImage(i) || (i.mediaType === 'video' && !!i.videoSrc))
    .filter((i) => !exclude.has(i.src))
    .slice(0, count)
}

// Page-level shared usage tracker — accumulates across calls so the same hero
// image / video never reappears in a section further down the page. Reset by
// calling resetSectionUsage() at the top of a fresh render pass.
const sharedUsed = new Set<string>()

export function resetSectionUsage(): void {
  sharedUsed.clear()
}

export function markUsed(it?: MediaItem): void {
  if (!it) return
  exclusionKeys(it).forEach((k) => sharedUsed.add(k))
}

// Build a curated, non-repeating set of strong assets for a single client section.
// `respectShared` (default true) consults the page-wide used set so that media
// claimed by the hero or a previous section is never reused here.
export function getClientSectionMedia(id: ClientId, respectShared = true) {
  const c = getClient(id)
  const used = new Set<string>(respectShared ? sharedUsed : [])

  const claim = (it?: MediaItem) => {
    if (!it) return undefined
    const keys = exclusionKeys(it)
    keys.forEach((k) => used.add(k))
    if (respectShared) keys.forEach((k) => sharedUsed.add(k))
    return it
  }

  const videos = c.items.filter((i) => i.mediaType === 'video' && !!i.videoSrc)
  const images = c.items.filter((i) => i.mediaType === 'image' && isLargeImage(i))

  // Featured: prefer the highest-scored asset not already claimed by the hero.
  const featureCandidate =
    videos.find((v) => !exclusionKeys(v).some((k) => used.has(k))) ||
    images.find((m) => !exclusionKeys(m).some((k) => used.has(k))) ||
    videos[0] ||
    images[0]
  const featured = claim(featureCandidate)

  const gallery: MediaItem[] = []
  for (const im of images) {
    const keys = exclusionKeys(im)
    if (keys.some((k) => used.has(k))) continue
    gallery.push(im)
    keys.forEach((k) => used.add(k))
    if (respectShared) keys.forEach((k) => sharedUsed.add(k))
    if (gallery.length >= 14) break
  }

  const wall: MediaItem[] = []
  for (const im of images) {
    const keys = exclusionKeys(im)
    if (keys.some((k) => used.has(k))) continue
    wall.push(im)
    keys.forEach((k) => used.add(k))
    if (respectShared) keys.forEach((k) => sharedUsed.add(k))
    if (wall.length >= 24) break
  }
  const fullWall = wall.length >= 6 ? wall : [...wall, ...gallery]

  const projects: MediaItem[] = []
  for (const im of images) {
    if (projects.length >= 4) break
    if (gallery.includes(im)) continue
    projects.push(im)
  }
  if (projects.length < 4) {
    for (const im of gallery) {
      if (projects.includes(im)) continue
      projects.push(im)
      if (projects.length >= 4) break
    }
  }

  return { client: c, featured, gallery, wall: fullWall, projects }
}

// Deliverables: client-approved media only. NEVER cross-pollinate from
// Platinum or Steve Giralt — those are different clients with their own
// licensed media. If Deliverables has fewer images than a section asks
// for, the design must adapt (smaller grid, more crops of one master)
// rather than mix in unrelated work.
export function getDeliverablesSectionMedia() {
  return getClientSectionMedia('deliverables')
}

/**
 * Hero-rotation pool for the Deliverables site. Returns the master video and
 * any large image posters / stills — strictly Deliverables assets only. The
 * hero uses the first item as its centerpiece and rotates through the rest
 * for subtle "many masters, one system" motion. Order: videos first, then
 * images sorted by size; favicons & sub-600px images already filtered out
 * by isUsableMedia / the deliverables data builder.
 */
export function getDeliverablesHeroPool(limit = 6): MediaItem[] {
  const c = getClient('deliverables')
  const videos = c.items.filter((i) => i.mediaType === 'video' && !!i.videoSrc)
  // Allow the OG/brand image (≥1000px wide) and the video poster still — both
  // are real Deliverables assets even though the site is otherwise sparse.
  const images = c.items
    .filter(
      (i) =>
        i.mediaType === 'image' &&
        (i.width ?? 0) >= 600 &&
        // Skip the 64×64 favicon (passes nothing in dims, but does land here).
        !/favicon|^sge1cdq/i.test((i.filename || '').toLowerCase()),
    )
    .sort((a, b) => (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0))
  // Interleave video, image, video, image so a rotating hero alternates
  // between the master video and its still / brand panel rather than playing
  // both videos back-to-back.
  const out: MediaItem[] = []
  const v = [...videos]
  const im = [...images]
  while (out.length < limit && (v.length || im.length)) {
    if (v.length) out.push(v.shift()!)
    if (out.length >= limit) break
    if (im.length) out.push(im.shift()!)
  }
  return out
}

/**
 * Strictly the master/source visuals Deliverables actually has — used by the
 * OneToMany section as the "source of truth" panel.
 */
export function getDeliverablesMaster(): MediaItem | undefined {
  return getDeliverablesHeroPool(1)[0]
}

export const manifestGeneratedAt = manifest.generatedAt
