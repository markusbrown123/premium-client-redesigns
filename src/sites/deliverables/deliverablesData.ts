import { getClient, getDeliverablesHeroPool } from '../../data/media'
import type { MediaItem } from '../../data/media-types'

export type AssetCard = {
  label: string
  ratio: string
  channel: string
  note: string
  /** Which tab this card belongs to in the gallery. */
  group: GalleryGroup
  /** Crop focal point against the source media. */
  focal?: string
  /** Which master to crop from: 'a' = primary, 'b' = secondary. */
  source?: 'a' | 'b'
}

export type GalleryGroup =
  | 'master'
  | 'social'
  | 'stories'
  | 'banners'
  | 'email'
  | 'ecomm'
  | 'launch'
  | 'localized'

export type GalleryTab = {
  id: GalleryGroup
  label: string
  hint: string
}

export type DeliverDetail = {
  num: string
  title: string
  body: string
  bullets: string[]
}

export type DeliverablesSiteData = {
  brand: { name: string; italic?: string; tagline?: string }
  navLinks: Array<{ href: string; label: string }>
  navCta: { label: string; href: string }
  hero: {
    eyebrow: string
    /** First line of the mono editorial statement. */
    statementLead: string
    /** Second line — rendered in italic for the emphasis turn. */
    statementTail: string
    /** Short studio intro paragraph below the statement. */
    intro: string
    ctas: Array<{ label: string; href: string; variant?: 'primary' | 'ghost' }>
    /** Rotating pool of real Deliverables masters. */
    rotation: MediaItem[]
  }
  marquee: string[]
  /** Master visual used by the OneToMany section. */
  master?: MediaItem
  /** Secondary visual used in matrix variants. */
  secondary?: MediaItem
  /** Tabbed gallery — every card is a real deliverable format from the same masters. */
  galleryTabs: GalleryTab[]
  matrix: AssetCard[]
  /** Number of usable assets discovered (for the footer rail). */
  mediaInventory: { total: number; videos: number; images: number }
  whatWeDeliver: DeliverDetail[]
  process: Array<{ num: string; title: string; body: string; duration: string }>
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

export function buildDeliverablesData(): DeliverablesSiteData {
  const c = getClient('deliverables')

  const videos = c.items.filter((i) => i.mediaType === 'video' && !!i.videoSrc)
  const images = c.items.filter(
    (i) => i.mediaType === 'image' && ((i.width ?? 0) === 0 || (i.width ?? 0) >= 600),
  )
  const rotation = getDeliverablesHeroPool(4)
  const heroMaster = rotation[0] || videos[0] || images[0]
  const secondary = rotation[1] || videos[1] || images[1] || images[0]

  return {
    brand: { name: 'The ', italic: 'Deliverables', tagline: 'campaign asset system' },
    navLinks: [
      { href: '#system', label: 'System' },
      { href: '#gallery', label: 'Gallery' },
      { href: '#deliver', label: 'Deliverables' },
      { href: '#process', label: 'Process' },
      { href: '#contact', label: 'Contact' },
    ],
    navCta: { label: 'Send a launch brief', href: '#contact' },
    hero: {
      eyebrow: 'The campaign asset system',
      statementLead: 'One picture is worth a thousand words.',
      statementTail: 'We turn that picture into a thousand assets.',
      intro:
        'The Deliverables is a campaign asset studio. We take one master visual — a still, a film, an idea — and produce every crop, every ratio, every region and every channel a modern launch needs.',
      ctas: [
        { label: 'Send a launch brief', href: '#contact', variant: 'primary' },
        { label: 'Book a call', href: '#contact', variant: 'ghost' },
      ],
      rotation,
    },
    marquee: [
      'One master visual',
      'Every channel',
      'Every ratio',
      'Every region',
      'Composed by humans · accelerated by pipeline',
      'Email · Display · Social · OOH · CTV · Ecomm',
      'Review-ready delivery',
    ],
    master: heroMaster,
    secondary,
    mediaInventory: {
      total: videos.length + images.length,
      videos: videos.length,
      images: images.length,
    },
    galleryTabs: [
      { id: 'master',    label: 'Master',     hint: 'The source of truth' },
      { id: 'social',    label: 'Social',     hint: 'Feed · Carousel · Tiles' },
      { id: 'stories',   label: 'Stories',    hint: 'Reels · TikTok · Stories' },
      { id: 'banners',   label: 'Banners',    hint: 'Display · OOH · CTV' },
      { id: 'email',     label: 'Email',      hint: 'CRM · Lifecycle' },
      { id: 'ecomm',     label: 'Ecomm',      hint: 'PDP · Retail tiles' },
      { id: 'launch',    label: 'Launch kits',hint: 'DAM-ready delivery' },
      { id: 'localized', label: 'Localized',  hint: '11 regions · native copy' },
    ],
    // Every card is a real crop of one of the two master visuals we hold —
    // labelled clearly as a crop / format, not a separate campaign.
    matrix: [
      { label: 'Master',           ratio: '16:9', channel: 'Source of truth',     note: 'Composed by humans',          group: 'master',    focal: '50% 50%', source: 'a' },
      { label: 'Master · second',  ratio: '16:9', channel: 'Alt master',          note: 'A second source',             group: 'master',    focal: '50% 50%', source: 'b' },
      { label: 'Feed tile',        ratio: '1:1',  channel: 'Instagram · Feed',    note: 'Hero crop, copy safe',        group: 'social',    focal: '50% 40%', source: 'a' },
      { label: 'Square carousel',  ratio: '1:1',  channel: 'Carousel slide 02',   note: 'Continuation crop',           group: 'social',    focal: '40% 60%', source: 'a' },
      { label: 'Square tile',      ratio: '1:1',  channel: 'Paid social tile',    note: 'Wide-safe crop',              group: 'social',    focal: '60% 50%', source: 'b' },
      { label: 'Story',            ratio: '9:16', channel: 'Stories · Reels',     note: 'Vertical, captioned',         group: 'stories',   focal: '50% 50%', source: 'a' },
      { label: 'Reel tall',        ratio: '9:16', channel: 'TikTok · Reels',      note: 'Subject lower-third safe',    group: 'stories',   focal: '50% 60%', source: 'b' },
      { label: 'Reel cutdown',     ratio: '4:5',  channel: 'Paid social',         note: 'Vertical safe-zone',          group: 'stories',   focal: '45% 50%', source: 'a' },
      { label: 'Display landscape',ratio: '16:9', channel: 'YouTube · CTV',       note: '6 / 15 / 30s cutdowns',       group: 'banners',   focal: '55% 50%', source: 'a' },
      { label: 'Hero crop',        ratio: '21:9', channel: 'OOH · CTV',           note: 'Landscape, cinematic',        group: 'banners',   focal: '55% 45%', source: 'a' },
      { label: 'Display wide',     ratio: '21:9', channel: 'Out-of-home',         note: 'Lower-third copy',            group: 'banners',   focal: '45% 50%', source: 'b' },
      { label: 'Email header',     ratio: '3:1',  channel: 'CRM · Lifecycle',     note: 'Light-mode safe',             group: 'email',     focal: '50% 45%', source: 'a' },
      { label: 'Email hero',       ratio: '3:1',  channel: 'Newsletter',          note: 'Padded for retina',           group: 'email',     focal: '50% 55%', source: 'b' },
      { label: 'Ecomm tile',       ratio: '1:1',  channel: 'Retail · PDP',        note: 'On-brand crop',               group: 'ecomm',     focal: '55% 55%', source: 'a' },
      { label: 'Ecomm tall',       ratio: '4:5',  channel: 'PDP gallery',         note: 'Detail-friendly crop',        group: 'ecomm',     focal: '50% 40%', source: 'a' },
      { label: 'Launch kit cover', ratio: '16:9', channel: 'DAM cover',           note: 'Delivery-ready bundle',       group: 'launch',    focal: '50% 50%', source: 'a' },
      { label: 'Launch kit alt',   ratio: '16:9', channel: 'DAM cover · alt',     note: 'Brand-system frame',          group: 'launch',    focal: '50% 50%', source: 'b' },
      { label: 'Localized · EU',   ratio: '1:1',  channel: 'EU rollout',          note: 'Native copy · casting',       group: 'localized', focal: '50% 50%', source: 'a' },
      { label: 'Localized · LATAM',ratio: '4:5',  channel: 'LATAM rollout',       note: 'RTL/typography aware',        group: 'localized', focal: '45% 50%', source: 'a' },
      { label: 'Localized · APAC', ratio: '9:16', channel: 'APAC rollout',        note: 'Vertical · native copy',      group: 'localized', focal: '50% 45%', source: 'b' },
    ],
    whatWeDeliver: [
      {
        num: '01',
        title: 'Master visuals',
        body: 'A single hero shot, film or AI-composed image becomes the source of truth for the whole campaign.',
        bullets: ['Photography', 'Film', 'AI composition', 'Style boards'],
      },
      {
        num: '02',
        title: 'Channel crops',
        body: 'Every ratio for every channel — composed by humans, never auto-cropped. Safe zones respected.',
        bullets: ['1:1 · 4:5 · 9:16', '16:9 · 21:9', '3:1 · 2:1', '32 standard ratios'],
      },
      {
        num: '03',
        title: 'Motion cutdowns',
        body: 'Six, fifteen and thirty-second cutdowns from one master film — captions, end-cards and brand-safe stings.',
        bullets: ['6 · 15 · 30s', 'Captions', 'End cards', 'Brand stings'],
      },
      {
        num: '04',
        title: 'Localized variants',
        body: 'Eleven regions, native copy, native casting, right-to-left aware. Adapted, not just translated.',
        bullets: ['Copy decks', 'Region casting', 'RTL layout', 'Legal compliance'],
      },
      {
        num: '05',
        title: 'Launch kits',
        body: 'A single DAM-ready bundle: every file labelled, every brief documented, every approval logged.',
        bullets: ['DAM-ready ZIP', 'Brief docs', 'Approval log', 'Versioned files'],
      },
      {
        num: '06',
        title: 'Review-ready delivery',
        body: 'Senior art directors sign off every variant before delivery. Nothing leaves the studio half-baked.',
        bullets: ['AD review', 'Brand consistency', 'Versioned QC', 'Rolling updates'],
      },
    ],
    process: [
      { num: '01', title: 'Brief',         body: 'Send the campaign brief, brand kit, launch calendar and channel matrix.', duration: 'Day 0' },
      { num: '02', title: 'Master visual', body: 'We lock the master — yours or one we produce — as the source of truth.', duration: 'Day 1 – 2' },
      { num: '03', title: 'Asset map',     body: 'Every channel, every ratio, every region, every cutdown — mapped on one page.', duration: 'Day 2 – 3' },
      { num: '04', title: 'Review',        body: 'Senior AD review across every variant before anything leaves the studio.', duration: 'Day 4 – 6' },
      { num: '05', title: 'Delivery',      body: 'Final kit lands in your DAM. Rolling updates supported through the campaign life.', duration: 'Day 7 →' },
    ],
    contact: {
      eyebrow: 'Send a launch brief',
      title: 'A whole launch, delivered.',
      lede:
        'Send the campaign brief, brand kit and launch calendar. We respond in 24 hours with a feasibility note and a first asset map.',
      services: [
        'Master visuals',
        'Channel crops',
        'Motion cutdowns',
        'Localization',
        'Launch kits',
        'Not sure yet',
      ],
      direct: [
        { label: 'Studio', value: 'humans@thedeliverables.ai', href: 'mailto:humans@thedeliverables.ai' },
        { label: 'Booking', value: 'cal.com/the-deliverables' },
        { label: 'Press', value: 'press@thedeliverables.ai', href: 'mailto:press@thedeliverables.ai' },
      ],
    },
    footer: {
      intro:
        'The Deliverables turns one master visual into every crop, ratio, region and channel a modern launch needs. Built like an operations system, finished like a campaign.',
      sections: [
        {
          title: 'Elsewhere',
          links: [
            { label: 'LinkedIn', href: '#' },
            { label: 'Instagram', href: '#' },
            { label: 'Substack', href: '#' },
          ],
        },
        {
          title: 'Studio',
          links: [
            { label: 'humans@thedeliverables.ai', href: 'mailto:humans@thedeliverables.ai' },
            { label: 'Remote · NY / LA / EU' },
          ],
        },
      ],
      legalName: 'The Deliverables',
      bigWords: ['One', 'picture', '·', 'A', 'thousand', 'assets'],
    },
  }
}
