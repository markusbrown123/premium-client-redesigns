import {
  getClientHeroRotation,
  getClient,
  getClientSectionMedia,
  resetSectionUsage,
} from '../../data/media'
import type { MediaItem } from '../../data/media-types'
import type { ReelChapter } from '../../components/CinematicReel'
import type { HeroChapter } from '../../components/Hero'
import type {
  PlatinumCategory,
  PlatinumCategoryKey,
} from '../../components/PlatinumGallery'

export type PlatinumSiteData = {
  brand: { name: string; italic?: string; tagline?: string }
  navLinks: Array<{ href: string; label: string }>
  navCta: { label: string; href: string }
  hero: {
    eyebrow: string
    location: string
    title: string[]
    italicWord: string
    lede: string
    masthead: string
    chapters: HeroChapter[]
    ctas: Array<{ label: string; href: string; variant?: 'primary' | 'ghost' }>
    rotation: MediaItem[]
  }
  marquee: string[]
  pillars: Array<{ num: string; tag: string; title: string; body: string }>
  wall: MediaItem[]
  gallery: MediaItem[]
  galleryCategories: PlatinumCategory[]
  reel: ReelChapter[]
  projects: Array<{
    client: string
    title: string
    tag: string
    year: string
    span: 'wide' | 'tall' | 'square' | 'feature'
    ratio: string
    media?: MediaItem
  }>
  awards: string[]
  process: Array<{ num: string; title: string; body: string; duration: string }>
  services: Array<{ num: string; title: string; body: string; bullets: string[] }>
  quote: { text: string; person: string; org: string }
  clients: string[]
  contact: {
    eyebrow: string
    title: string
    lede: string
    services: string[]
    direct: Array<{ label: string; value: string; href?: string }>
  }
  footer: {
    intro: string
    sections: Array<{ title: string; links: Array<{ label: string; href?: string }> }>
    legalName: string
    bigWords?: string[]
  }
}

/* Reel templates. `bleed: true` is set dynamically based on whether the
   resolved media is a video — full-bleed on stills exposes the resolution
   ceiling of the current Platinum library. */
const REEL_TEMPLATE: Array<Omit<ReelChapter, 'media' | 'bleed'>> = [
  {
    num: '01',
    category: 'Films',
    title: 'Motion that breathes between cuts.',
    body:
      'Director-led films, finished in-house. Story, edit, sound and grade live in one room so the spot leaves the studio with the same intention it arrived with.',
    client: 'Havaianas',
    year: '2024',
  },
  {
    num: '02',
    category: 'Images',
    title: 'Editorial stills, composed with print rigor.',
    body:
      'Direction, casting and finishing for editorial, lookbook and brand-led photography. Each frame is treated as a print sheet — not a content unit.',
    client: 'Vogue Brasil',
    year: '2025',
  },
  {
    num: '03',
    category: 'AI',
    title: 'Generative imagery that still respects the brand.',
    body:
      'Hybrid AI pipelines built around the craft of the studio. We extend one shoot across the whole campaign matrix without breaking the visual contract.',
    client: 'Osklen Atelier',
    year: '2025',
  },
  {
    num: '04',
    category: 'Craft',
    title: 'Compositing, CGI and retouch.',
    body:
      'Quiet finishing rooms behind the work. CGI, beauty retouch, colour and compositing — protecting the soul of the image at every step.',
    client: 'Farm Rio',
    year: '2025',
  },
  {
    num: '05',
    category: 'Classics',
    title: 'A back catalogue, ready to license.',
    body:
      'A library of archival and rights-managed work. Ready to re-cut, re-licence and roll out across new placements and territories.',
    client: 'Studio Library',
    year: '2010 – 2025',
  },
]

/* Six-bucket distribution for the gallery. We can't trust title strings
   (most are Wix hash filenames), so we hash the id and modulo across the
   six categories — yields a stable but mixed assignment per render. A few
   string hints take precedence so obvious matches land where they belong. */
const GALLERY_LABELS: Array<{ key: PlatinumCategoryKey; label: string }> = [
  { key: 'ai', label: 'AI' },
  { key: 'images', label: 'Images' },
  { key: 'films', label: 'Films' },
  { key: 'craft', label: 'Craft' },
  { key: 'artistic', label: 'Artistic' },
  { key: 'classics', label: 'Classics' },
]

function strHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function hintCategory(item: MediaItem): PlatinumCategoryKey | null {
  const text = `${item.title || ''} ${item.filename || ''}`.toLowerCase()
  if (/\b(cgi|render|robot|3d)\b/.test(text)) return 'craft'
  if (/\b(ai|generative|sdxl|midjourney)\b/.test(text)) return 'ai'
  if (/\b(film|reel|spot|trailer|video)\b/.test(text) || item.mediaType === 'video') return 'films'
  if (/\b(wild west|greed day|american idiot|archive|classic)\b/.test(text)) return 'classics'
  if (/\b(flamingo|editorial|portrait|fashion)\b/.test(text)) return 'images'
  if (/\b(paint|illustration|art|sketch|atelier)\b/.test(text)) return 'artistic'
  return null
}

function buildGalleryCategories(
  pool: MediaItem[],
  perBucketCap = 5,
): PlatinumCategory[] {
  const buckets: Record<PlatinumCategoryKey, MediaItem[]> = {
    ai: [],
    images: [],
    films: [],
    craft: [],
    artistic: [],
    classics: [],
  }

  // First pass: place hinted items where they obviously belong.
  const remaining: MediaItem[] = []
  for (const it of pool) {
    const h = hintCategory(it)
    if (h && buckets[h].length < perBucketCap) buckets[h].push(it)
    else remaining.push(it)
  }

  // Second pass: distribute remaining items round-robin by id-hash so the
  // shortest buckets get filled first, but the order is deterministic.
  const order: PlatinumCategoryKey[] = ['ai', 'images', 'films', 'craft', 'artistic', 'classics']
  remaining.sort((a, b) => strHash(a.id) - strHash(b.id))
  for (const it of remaining) {
    const target = order
      .slice()
      .sort((x, y) => buckets[x].length - buckets[y].length)[0]
    if (buckets[target].length < perBucketCap) buckets[target].push(it)
  }

  return GALLERY_LABELS.map(({ key, label }) => ({
    key,
    label,
    items: buckets[key],
  }))
}

export function buildPlatinumData(): PlatinumSiteData {
  resetSectionUsage()
  /* 4 hero slides is the curation ceiling — the Platinum library has only
     ~5 unique strong assets after CDN-variant dedupe, so requesting 7 just
     resurfaces duplicates. */
  const rotation = getClientHeroRotation('platinum', 4)
  const used = new Set<string>()
  rotation.forEach((r) => used.add(r.id))

  const section = getClientSectionMedia('platinum', false)
  const c = getClient('platinum')

  // Cinematic reel: pick the strongest non-hero media we haven't used elsewhere.
  // Prefer videos for chapter 01, then alternate between landscape and portrait
  // image candidates.
  const allUsable = c.items.filter(
    (i) =>
      (i.mediaType === 'image' && (i.width || 0) >= 700) ||
      (i.mediaType === 'video' && !!i.videoSrc),
  )
  const reelPool: MediaItem[] = []
  const reelUsed = new Set<string>()
  // Prefer one video first so the reel opens cinematically.
  const firstVideo = allUsable.find((i) => i.mediaType === 'video' && !used.has(i.id))
  if (firstVideo) {
    reelPool.push(firstVideo)
    reelUsed.add(firstVideo.id)
    used.add(firstVideo.id)
  }
  // Then pull strong large landscape & portrait images.
  for (const it of allUsable) {
    if (reelPool.length >= REEL_TEMPLATE.length) break
    if (used.has(it.id) || reelUsed.has(it.id)) continue
    if (it.mediaType !== 'image') continue
    reelPool.push(it)
    reelUsed.add(it.id)
    used.add(it.id)
  }
  // Fallback fill if Platinum library is unusually thin.
  while (reelPool.length < REEL_TEMPLATE.length) {
    const fill = allUsable.find((i) => !reelUsed.has(i.id))
    if (!fill) break
    reelPool.push(fill)
    reelUsed.add(fill.id)
  }

  const reel: ReelChapter[] = REEL_TEMPLATE.map((tpl, i) => {
    const media = reelPool[i] || allUsable[i] || allUsable[0]
    return {
      ...tpl,
      media,
      bleed: media?.mediaType === 'video',
    }
  }).filter((ch) => !!ch.media)

  /* 8 wall cells (down from 12) — matches the SPAN_PATTERN landscape-only
     bento and the "8–12 excellent over volume" curation principle. */
  const allImages = c.items.filter((i) => i.mediaType === 'image' && (i.width || 0) >= 600)
  const wall = allImages.filter((i) => !used.has(i.id)).slice(0, 8)
  wall.forEach((i) => used.add(i.id))

  const gallery = allImages.filter((i) => !used.has(i.id)).slice(0, 6)
  gallery.forEach((i) => used.add(i.id))

  // Six-bucket category gallery. Threshold is 500px — the Platinum library
  // has only ~18 images >= 700px, so a stricter cut leaves multiple buckets
  // showing a single feature with no supporting frames. 500px is still
  // sharp enough for the small support tiles. Hero rotation + reel are
  // excluded so the gallery never repeats media that's already visible.
  const reelIds = new Set(reel.map((r) => r.media?.id).filter(Boolean) as string[])
  const galleryPool = c.items.filter(
    (i) =>
      ((i.mediaType === 'image' && (i.width || 0) >= 500) ||
        (i.mediaType === 'video' && !!i.videoSrc)) &&
      !rotation.some((r) => r.id === i.id) &&
      !reelIds.has(i.id),
  )
  const galleryCategories = buildGalleryCategories(galleryPool, 5)

  const projectPool = allImages.filter((i) => !used.has(i.id)).slice(0, 4)
  const sectionProjects = section.projects

  return {
    brand: { name: 'Platinum', italic: 'FMD', tagline: 'image studio' },
    navLinks: [
      { href: '#work', label: 'Work' },
      { href: '#pillars', label: 'Disciplines' },
      { href: '#process', label: 'Process' },
      { href: '#services', label: 'Services' },
      { href: '#contact', label: 'Contact' },
    ],
    navCta: { label: 'Start a project', href: '#contact' },
    hero: {
      eyebrow: '01 — Image studio · São Paulo',
      location: 'São Paulo · Rio · Remote',
      title: [
        'Image. Film.',
        'AI. Craft.',
        'For the chapters',
        'that matter.',
      ],
      italicWord: 'Craft',
      lede:
        'Platinum FMD is a São Paulo image studio working at the edge of production, AI imagery and post-finishing. Stills, films, CGI and craft for fashion, beauty, lifestyle and the brands that brief them.',
      masthead: 'Platinum FMD · Studio in five rooms · Est. São Paulo',
      chapters: [
        { num: '01', label: 'Films' },
        { num: '02', label: 'Images' },
        { num: '03', label: 'AI' },
        { num: '04', label: 'Craft' },
      ].slice(0, rotation.length),
      ctas: [
        { label: 'View work', href: '#work', variant: 'primary' },
        { label: 'Start a project', href: '#contact', variant: 'ghost' },
      ],
      rotation,
    },
    marquee: [
      'Image',
      'Film',
      'AI imagery',
      'CGI',
      'Post & craft',
      'Classics',
      'Direction',
      'Editorial',
    ],
    pillars: [
      {
        num: '01',
        tag: 'AI imagery',
        title: 'AI',
        body:
          'Hybrid pipelines that pair generative imagery with brand-safe craft — extending one shoot across the whole campaign matrix.',
      },
      {
        num: '02',
        tag: 'Stills & editorial',
        title: 'Images',
        body:
          'Direction, casting and finishing for editorial, lookbook and brand-led photography — composed with print rigor.',
      },
      {
        num: '03',
        tag: 'Motion & film',
        title: 'Films',
        body:
          'Story-led films and brand spots from concept to delivery — directed and finished in-house, ready for any channel.',
      },
      {
        num: '04',
        tag: 'CGI & craft',
        title: 'Craft',
        body:
          'CGI, compositing, colour and retouch — finishing rooms that protect the soul of the image at every step.',
      },
      {
        num: '05',
        tag: 'Library & licensing',
        title: 'Classics',
        body:
          'A library of archival and rights-managed work, ready to license or re-cut for new placements and territories.',
      },
    ],
    wall,
    gallery,
    galleryCategories,
    reel,
    projects: [
      {
        client: 'Vogue Brasil',
        title: 'September Issue · Editorial',
        tag: 'Editorial',
        year: '2025',
        span: 'feature',
        ratio: '16 / 10',
        media: projectPool[0] || sectionProjects[0],
      },
      {
        client: 'Osklen',
        title: 'SS26 Lookbook',
        tag: 'Campaign',
        year: '2025',
        span: 'tall',
        ratio: '4 / 5',
        media: projectPool[1] || sectionProjects[1],
      },
      {
        client: 'Farm Rio',
        title: 'Resort Capsule',
        tag: 'Lookbook',
        year: '2025',
        span: 'tall',
        ratio: '4 / 5',
        media: projectPool[2] || sectionProjects[2],
      },
      {
        client: 'Havaianas',
        title: 'Global Summer Spot',
        tag: 'Film',
        year: '2024',
        span: 'wide',
        ratio: '16 / 10',
        media: projectPool[3] || sectionProjects[3],
      },
    ],
    awards: [
      'Cannes Lions Shortlist',
      'D&AD Wood Pencil',
      'Lürzer’s Archive 200 Best',
      'Communication Arts',
      'ADC Brasil — Gold',
      'Brazilian Press Photo',
    ],
    process: [
      {
        num: '01',
        title: 'Brief & mood',
        body: 'A first call frames the work — campaign, region, ratio, talent. We respond with a reference deck within 48 hours.',
        duration: 'Day 0 – 2',
      },
      {
        num: '02',
        title: 'Treatment & casting',
        body: 'Director-led treatment, casting decks, location scouts. Every choice tied back to the brand world.',
        duration: 'Week 1 – 2',
      },
      {
        num: '03',
        title: 'Production',
        body: 'On-set production with the smallest excellent crew. Stills, motion and post captured in lockstep.',
        duration: 'Week 3 – 4',
      },
      {
        num: '04',
        title: 'Post & finishing',
        body: 'Retouching, CGI, edit, colour, sound — all in-house rooms. No surprises, no outsourced quality drop.',
        duration: 'Week 4 – 6',
      },
      {
        num: '05',
        title: 'Delivery & licensing',
        body: 'Final files, motion masters and a clean licensing matrix delivered to your DAM. Updates supported.',
        duration: 'Week 6 →',
      },
    ],
    services: [
      {
        num: '01',
        title: 'Image',
        body: 'Direction, casting and finishing for editorial and brand campaigns — composed with print rigor.',
        bullets: ['Direction', 'Casting', 'Stills', 'Post & retouch'],
      },
      {
        num: '02',
        title: 'Film',
        body: 'Story-led films and brand spots — concept to delivery, finished in-house.',
        bullets: ['Direction', 'Producers', 'Edit', 'Sound & colour'],
      },
      {
        num: '03',
        title: 'AI & CGI',
        body: 'Hybrid pipelines that extend one shoot across the full campaign matrix — without losing the craft.',
        bullets: ['Generative', 'CGI', 'Compositing', 'Brand-safe craft'],
      },
      {
        num: '04',
        title: 'Library & licensing',
        body: 'Archival craft, rights-managed work and a back catalogue ready to license, cut or re-purpose.',
        bullets: ['Archive', 'Licensing', 'Re-cuts', 'Territory rollouts'],
      },
    ],
    quote: {
      text:
        'Platinum take a hand-drawn idea to a finished, on-air spot without the work losing any of its soul.',
      person: 'Marcela Duarte',
      org: 'VP, Brand · Osklen',
    },
    clients: [
      'Vogue Brasil',
      'Osklen',
      'Farm Rio',
      'Havaianas',
      'L’Oréal',
      'Natura',
      'Reserva',
      'Itaú',
    ],
    contact: {
      eyebrow: 'Start a project',
      title: 'Let’s make something rare.',
      lede:
        'We respond within one business day. For urgent briefs and live productions, mention it below and we will fast-track.',
      services: ['Image', 'Film', 'AI imagery', 'CGI & craft', 'Library / licensing', 'Not sure yet'],
      direct: [
        { label: 'Email', value: 'studio@platinumfmd.com.br', href: 'mailto:studio@platinumfmd.com.br' },
        { label: 'Booking', value: 'cal.com/platinum-fmd' },
        { label: 'Press', value: 'press@platinumfmd.com.br', href: 'mailto:press@platinumfmd.com.br' },
      ],
    },
    footer: {
      intro:
        'Platinum FMD is a São Paulo–born image studio working at the edge of production, AI and craft. We build the visual systems great campaigns travel on.',
      sections: [
        {
          title: 'Elsewhere',
          links: [
            { label: 'Instagram', href: '#' },
            { label: 'Vimeo', href: '#' },
            { label: 'Behance', href: '#' },
            { label: 'LinkedIn', href: '#' },
          ],
        },
        {
          title: 'Contact',
          links: [
            { label: 'studio@platinumfmd.com.br', href: 'mailto:studio@platinumfmd.com.br' },
            { label: '+55 11 4040 — 0117' },
            { label: 'R. Aspicuelta, 525 · Vila Madalena' },
          ],
        },
      ],
      legalName: 'Platinum FMD',
      bigWords: ['Platinum', '·', 'FMD'],
    },
  }
}
