import {
  getClientHeroRotation,
  getClient,
  resetSectionUsage,
} from '../../data/media'
import type { MediaItem } from '../../data/media-types'

export type ReelChapterData = {
  num: string
  category: string
  client: string
  title: string
  body: string
  note: string
  year: string
  media?: MediaItem
}

export type LabCardData = {
  tag: string
  title: string
  caption: string
  spec: string
  span: 'wide' | 'tall' | 'square' | 'large'
  media?: MediaItem
}

export type SteveGiraltSiteData = {
  brand: { name: string; italic?: string; tagline?: string }
  navLinks: Array<{ href: string; label: string }>
  navCta: { label: string; href: string }
  hero: {
    eyebrow: string
    location: string
    lede: string
    ctas: Array<{ label: string; href: string; variant?: 'primary' | 'ghost' }>
    rotation: MediaItem[]
    annotations: string[]
    pillars: string[]
    hud: Array<{ label: string; value: string }>
  }
  statement: { eyebrow: string; body: string; tags: string[] }
  marquee: string[]
  invent: Array<{ num: string; label: string; title: string; body: string; marker: string }>
  reel: ReelChapterData[]
  lab: LabCardData[]
  about: {
    eyebrow: string
    title: string
    body: string[]
    facts: Array<{ label: string; value: string }>
    speaking: string[]
    brands: string[]
  }
  contact: {
    eyebrow: string
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

export function buildSteveGiraltData(): SteveGiraltSiteData {
  resetSectionUsage()

  // Hero rotation — videos + large landscape images, Steve-only.
  const rotation = getClientHeroRotation('steve-giralt', 7)
  const used = new Set<string>(rotation.map((r) => r.id))

  const c = getClient('steve-giralt')
  const allImages = c.items.filter(
    (i) => i.mediaType === 'image' && (i.width || 0) >= 900,
  )
  const allVideos = c.items.filter((i) => i.mediaType === 'video' && !!i.videoSrc)

  // Skip the first hero frame from immediate sections so the reel never opens
  // on the same media that's still playing in the hero.
  const reelPool: MediaItem[] = [...allVideos, ...allImages].filter((m) => !used.has(m.id))
  const reelMedia: MediaItem[] = []
  for (const m of reelPool) {
    if (reelMedia.find((x) => x.id === m.id)) continue
    reelMedia.push(m)
    if (reelMedia.length >= 5) break
  }
  reelMedia.forEach((m) => used.add(m.id))

  // Lab wall — varied, large, image-first.
  const lab: MediaItem[] = []
  for (const m of allImages) {
    if (used.has(m.id)) continue
    lab.push(m)
    used.add(m.id)
    if (lab.length >= 8) break
  }

  // Helper to pull lab card data with a media slot.
  const labSpans: Array<LabCardData['span']> = [
    'large',
    'tall',
    'wide',
    'square',
    'wide',
    'tall',
    'square',
    'large',
  ]
  const labTags = [
    'Robotics',
    'High-speed',
    'Practical FX',
    'Motion control',
    'Liquid',
    'Macro',
    'Rigging',
    'Prototype',
  ]
  const labCaptions = [
    'Six-axis arm choreographed to a 2,000 fps splash.',
    'Bench prototype — repeatable to the millisecond.',
    'Pour test with mirrored timing on three angles.',
    'Custom programmable rig, frame-accurate playback.',
    'Surface tension study, lit for the hero frame.',
    'Macro pass — product geometry as performance.',
    'On-set rig pre-flight, every variable logged.',
    'R&D prototype — built for one impossible take.',
  ]
  const labSpecs = [
    'RIG · MK-06 · 6-AXIS',
    'CAM · PHANTOM · 2,000 FPS',
    'CTRL · DMX TRIG · 1 KHZ',
    'MOCO · DOLLY · FRAME-LOCK',
    'FX · LIQUID · 8K MACRO',
    'OPTIC · 100 MM PROBE',
    'JIG · CNC · ±0.05 MM',
    'BUILD · DAY-3 PROTO',
  ]
  const labCards: LabCardData[] = lab.map((m, i) => ({
    tag: labTags[i % labTags.length],
    title: cleanFrameLabel(m.title) || `Lab frame ${String(i + 1).padStart(2, '0')}`,
    caption: labCaptions[i % labCaptions.length],
    spec: labSpecs[i % labSpecs.length],
    span: labSpans[i % labSpans.length],
    media: m,
  }))

  return {
    brand: { name: 'Steve', italic: 'Giralt', tagline: 'creative technology' },
    navLinks: [
      { href: '#statement', label: 'Studio' },
      { href: '#process', label: 'Process' },
      { href: '#work', label: 'Work' },
      { href: '#lab', label: 'Lab' },
      { href: '#about', label: 'About' },
      { href: '#contact', label: 'Contact' },
    ],
    navCta: { label: 'Book a creative tech consult', href: '#contact' },
    hero: {
      eyebrow: 'Director · Creative technologist',
      location: 'Brooklyn, NY · Worldwide',
      lede:
        'We design, build, and shoot practical effects, robotic rigs, motion-control systems, and cinematic tabletop visuals for brands that need the shot to be unforgettable.',
      ctas: [
        { label: 'View work', href: '#work', variant: 'primary' },
        { label: 'Book a creative tech consult', href: '#contact', variant: 'ghost' },
      ],
      rotation,
      annotations: [
        'STUDIO · 01',
        'FPS · UP TO 10,000',
        'AXES · 6 + MOTION CONTROL',
        'BUILD → SHOOT → DELIVER',
      ],
      pillars: [
        'Motion control',
        'Robotic rigs',
        'Practical effects',
        'Food / Beverage / Product',
      ],
      hud: [
        { label: 'RIG', value: 'MK-06A' },
        { label: 'FPS', value: '02,000' },
        { label: 'AXIS', value: '06 / 06' },
        { label: 'STATUS', value: 'LIVE' },
      ],
    },
    statement: {
      eyebrow: 'The studio',
      body:
        'A creative technology lab for impossible food, beverage, and product visuals — where the rig is invented for the shot, not the other way around.',
      tags: ['Food', 'Beverage', 'Product', 'Robotics', 'Motion control', 'High-speed', 'R&D'],
    },
    marquee: [
      'Food',
      'Beverage',
      'Product',
      'Robotics',
      'Motion control',
      'High-speed',
      'Practical FX',
      'R&D',
      'Direction',
    ],
    invent: [
      {
        num: '01',
        label: 'Invent',
        title: 'Invent',
        body:
          'We rewrite the impossible-ask as an engineering problem and answer with a working approach inside 48 hours.',
        marker: 'Day 0 — 2',
      },
      {
        num: '02',
        label: 'Build',
        title: 'Build',
        body:
          'In-house engineers fabricate the rig — robotic arms, fluid triggers, programmable motion — bench-tested before set.',
        marker: 'Week 1',
      },
      {
        num: '03',
        label: 'Shoot',
        title: 'Shoot',
        body:
          'Production day is the performance. Robotic moves, practical effects, and product hero shots timed to the millisecond.',
        marker: 'Week 2 — 3',
      },
      {
        num: '04',
        label: 'Deliver',
        title: 'Deliver',
        body:
          'Final spot, every cut-down, masters and a documented rig in the archive — ready to evolve for the next campaign.',
        marker: 'Week 4 →',
      },
    ],
    reel: [
      {
        num: '01',
        category: 'Beverage',
        client: 'Liquid choreography',
        title: 'Pour, splash, hero frame — synced across three cameras.',
        body:
          'Programmable trigger array fires the pour, the macro rig, and the lighting plot from a single clock. Every take is identical.',
        note: 'Phantom · 2,000 fps · 3-axis rig',
        year: '2025',
        media: reelMedia[0],
      },
      {
        num: '02',
        category: 'Food',
        client: 'Practical food FX',
        title: 'Crunch, drip, crumble — engineered for the close-up.',
        body:
          'Tabletop set built around a six-axis arm. Repeatable hero takes, no plate ever goes to waste.',
        note: 'Six-axis · Repeatable · Practical FX',
        year: '2025',
        media: reelMedia[1],
      },
      {
        num: '03',
        category: 'Product',
        client: 'Product launch films',
        title: 'Geometry as performance — the product is the lead actor.',
        body:
          'Programmable motion control on the camera, the product, and the light. Every line of the geometry is honoured in motion.',
        note: 'Motion control · Macro · 8K finishing',
        year: '2024',
        media: reelMedia[2],
      },
      {
        num: '04',
        category: 'Motion control',
        client: 'Custom rigs',
        title: 'Custom rigs for shots no off-the-shelf system can repeat.',
        body:
          'Bench prototype to production-ready rig in three weeks. The rig joins the library and evolves for the next campaign.',
        note: 'Bespoke · Frame-accurate · Logged',
        year: '2024',
        media: reelMedia[3],
      },
      {
        num: '05',
        category: 'Creative technology',
        client: 'R&D partnership',
        title: 'R&D partnerships for studios that need a working proof before the pitch.',
        body:
          'A standalone workshop sprint that delivers a working rig, documentation and a feasibility note. Pitch with a video, not a deck.',
        note: 'Prototype · Feasibility · Licensing',
        year: '2024',
        media: reelMedia[4],
      },
    ].filter((ch) => !!ch.media) as ReelChapterData[],
    lab: labCards,
    about: {
      eyebrow: 'About the studio',
      title:
        'A director, creative technologist, and a workshop. One roof, four rooms, one set of hands at the rig.',
      body: [
        'Steve Giralt directs food, beverage and product films that depend on an engineering trick the camera has never seen before.',
        'The studio is a creative technology lab — a director, a fabrication team and a roster of motion-control specialists who design the rig for each brief and ship the spot end-to-end.',
      ],
      facts: [
        { label: 'Studio', value: 'Brooklyn, NY' },
        { label: 'Founded', value: '2008' },
        { label: 'Disciplines', value: 'Direction · Tech · Build' },
        { label: 'Spec', value: 'Up to 10,000 fps · 6-axis' },
      ],
      speaking: [
        'Cannes Lions · Speaker',
        'OFFF Festival',
        'SXSW · Creative Tech',
        'PRG · Spotlight',
        'Frieze · Stage Talk',
      ],
      brands: [
        'Microsoft',
        'Hershey’s',
        'Diet Coke',
        'Mountain Dew',
        'Frito-Lay',
        'Pepsi',
        'Adobe',
        'Google',
      ],
    },
    contact: {
      eyebrow: 'Start a production conversation',
      lede:
        'We respond within one business day. For pitches and production windows, mention the deadline below and we will fast-track a feasibility note.',
      services: [
        'Direction',
        'Creative technology',
        'Robotics',
        'High-speed',
        'Motion control',
        'R&D consult',
        'Not sure yet',
      ],
      direct: [
        { label: 'Studio', value: 'studio@stevegiralt.com', href: 'mailto:studio@stevegiralt.com' },
        { label: 'Press', value: 'press@stevegiralt.com', href: 'mailto:press@stevegiralt.com' },
        { label: 'Booking', value: 'cal.com/steve-giralt' },
      ],
    },
    footer: {
      intro:
        'Steve Giralt is a Brooklyn-based director and creative-technology studio. We invent the rigs and choreography that turn impossible briefs into finished spots for food, beverage and product brands.',
      sections: [
        {
          title: 'Elsewhere',
          links: [
            { label: 'Instagram', href: '#' },
            { label: 'Vimeo', href: '#' },
            { label: 'YouTube', href: '#' },
            { label: 'LinkedIn', href: '#' },
          ],
        },
        {
          title: 'Studio',
          links: [
            { label: 'studio@stevegiralt.com', href: 'mailto:studio@stevegiralt.com' },
            { label: '+1 (718) 555 — 0142' },
            { label: 'The Garage · Brooklyn, NY' },
          ],
        },
      ],
      legalName: 'Steve Giralt Studio',
      bigWords: ['Steve', '·', 'Giralt'],
    },
  }
}

// The scraped manifest titles are filename hashes (e.g. "Ddc749 C6df7..."). Strip
// them so the lab cards display a clean fallback rather than an opaque hash.
function cleanFrameLabel(t: string | undefined): string {
  if (!t) return ''
  const stripped = t.replace(/[\s_-]/g, '')
  if (/^[A-Fa-f0-9]{8,}/.test(stripped)) return ''
  if (/\.(jpe?g|png|webp|gif|mp4|webm|svg)$/i.test(t)) return ''
  return t
}
