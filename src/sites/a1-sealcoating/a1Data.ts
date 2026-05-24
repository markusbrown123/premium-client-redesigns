// A-1 Sealcoating LLC — site data.
// Every fact here is provided by the client or directly observable from the
// uploaded media. No invented testimonials, awards, prices, locations, or licenses.

export const COMPANY = {
  legalName: 'A-1 Sealcoating LLC',
  shortName: 'A-1 Sealcoating',
  tagline: 'Asphalt Services',
  experience: 'Over 25 Years Experience',
  insurance: 'Fully Insured',
  scope: 'Commercial & Residential',
  ceo: 'Louis Carlesimo',
  phone: '732-822-5652',
  phoneHref: 'tel:+17328225652',
  email: '', // not provided
  address: '', // not provided
}

export type A1Photo = {
  slug: string
  alt: string
  category: 'residential' | 'sealcoating' | 'equipment' | 'premium-homes'
  orientation: 'portrait' | 'landscape'
  heroEligible: boolean
  featured: boolean
  // Per-image art direction. CSS object-position string applied when the image
  // is forced into a different aspect than its native (i.e. hero 16/9 cover of a
  // portrait shot). Vertical % is what matters: lower keeps house in frame,
  // higher pushes toward the driveway/foreground.
  focal: { hero?: string; card?: string; wide?: string }
}

const base = '/media/a1-sealcoating/optimized'

// Enhanced premium driveway imagery leads the photo set. These are high-res
// portrait shots used to anchor the hero, featured spread, and gallery so the
// site reads premium at first scroll. Real A-1 originals follow so the work,
// crew, and equipment proof are still represented further down.
export const PHOTOS: A1Photo[] = [
  {
    slug: 'enhanced-driveway-01',
    alt: 'Freshly sealcoated jet-black driveway curving up to a large tan stucco luxury home under a clear blue sky.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
    // Portrait → 16/9 hero needs ~38% Y to keep both the home and the curved drive in frame.
    focal: { hero: 'center 38%', card: 'center 45%', wide: 'center 42%' },
  },
  {
    slug: 'enhanced-driveway-02',
    alt: 'Curved freshly sealed driveway leading toward a stone-faced premium home with manicured lawn and bright sky.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
    focal: { hero: 'center 45%', card: 'center 48%', wide: 'center 44%' },
  },
  {
    slug: 'enhanced-driveway-05',
    alt: 'Long fresh-sealed driveway running toward a luxury brick estate framed by mature trees and clipped shrubs.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
    focal: { hero: 'center 50%', card: 'center 50%', wide: 'center 48%' },
  },
  {
    slug: 'enhanced-driveway-04',
    alt: 'Curved jet-black driveway sweeping across a green lawn toward a modern white estate.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
    focal: { hero: 'center 45%', card: 'center 48%', wide: 'center 44%' },
  },
  {
    slug: 'enhanced-driveway-03',
    alt: 'Wide freshly sealed driveway leading straight to a gray gambrel coastal mansion with a wraparound porch.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
    focal: { hero: 'center 48%', card: 'center 50%', wide: 'center 46%' },
  },
  {
    slug: 'enhanced-driveway-06',
    alt: 'Curved smooth blacktop driveway with paver border running toward a gray gambrel-style home.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 50%', card: 'center 52%', wide: 'center 48%' },
  },
  {
    slug: 'enhanced-driveway-07',
    alt: 'Straight fresh-sealed residential driveway meeting a concrete apron in front of a modern white home.',
    category: 'residential',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 40%', card: 'center 42%', wide: 'center 40%' },
  },
  {
    slug: 'enhanced-driveway-08',
    alt: 'Curved residential driveway with a fresh sealcoat finish leading toward a modern white home.',
    category: 'residential',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 45%', card: 'center 48%', wide: 'center 44%' },
  },
  {
    slug: 'enhanced-driveway-10',
    alt: 'Curved freshly sealed driveway leading toward a light blue coastal-style home framed by clear sky.',
    category: 'residential',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 48%', card: 'center 50%', wide: 'center 46%' },
  },
  // Real A-1 original landscape lands here so the Sealcoating filter still
  // anchors to a strong landscape and a real job shot.
  {
    slug: 'brick-colonial-jet-black-wide',
    alt: 'Wide view of a freshly sealcoated jet-black driveway alongside a brick colonial home with A-1 caution tape across the entry.',
    category: 'sealcoating',
    orientation: 'landscape',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 60%', card: 'center 55%', wide: 'center 58%' },
  },
  {
    slug: 'enhanced-driveway-09',
    alt: 'Freshly sealed driveway with smooth black finish bordered by blooming crepe myrtle trees at warm sunset.',
    category: 'sealcoating',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 55%', card: 'center 52%', wide: 'center 50%' },
  },
  {
    slug: 'modern-estate-curved-drive',
    alt: 'Modern white estate with a freshly sealcoated curved driveway, A-1 caution tape across the apron.',
    category: 'premium-homes',
    orientation: 'landscape',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 55%', card: 'center 55%', wide: 'center 55%' },
  },
  {
    slug: 'stucco-mansion-fresh-seal',
    alt: 'Freshly sealcoated jet-black driveway in front of a large stucco home, finished by A-1 Sealcoating LLC.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 62%', card: 'center 58%', wide: 'center 60%' },
  },
  {
    slug: 'coastal-mansion-finished',
    alt: 'Freshly sealcoated driveway in front of a large coastal mansion under a bright blue sky.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 55%', card: 'center 50%', wide: 'center 48%' },
  },
  {
    slug: 'estate-cobblestone-apron',
    alt: 'Sealcoated driveway leading to an estate home with cobblestone apron and A-1 Sealcoating branded caution tape.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 50%', card: 'center 45%', wide: 'center 40%' },
  },
  {
    slug: 'hilltop-estate-pillared-entry',
    alt: 'Long sealcoated driveway leading up to a hilltop estate with pillared entrance posts.',
    category: 'premium-homes',
    orientation: 'landscape',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 50%', card: 'center 50%', wide: 'center 50%' },
  },
  {
    slug: 'gray-colonial-curved-drive',
    alt: 'Curved residential driveway with paver border, freshly sealcoated by A-1 Sealcoating, with A-1 caution tape across the apron.',
    category: 'residential',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 45%', card: 'center 45%', wide: 'center 42%' },
  },
  {
    slug: 'blue-colonial-long-drive',
    alt: 'Long curved residential driveway leading up to a blue colonial home, freshly sealcoated.',
    category: 'residential',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 45%', card: 'center 40%', wide: 'center 40%' },
  },
  {
    slug: 'dusk-fresh-seal-crepe-myrtle',
    alt: 'Freshly sealcoated jet-black driveway at dusk, framed by blooming crepe myrtle trees.',
    category: 'sealcoating',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 55%', card: 'center 50%', wide: 'center 48%' },
  },
  {
    slug: 'trailer-truck-at-estate',
    alt: 'A-1 Sealcoating branded trailer hitched to the company pickup truck at a residential estate job site.',
    category: 'equipment',
    orientation: 'landscape',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 50%', card: 'center 50%', wide: 'center 50%' },
  },
  {
    slug: 'coastal-mansion-equipment',
    alt: 'A-1 Sealcoating branded equipment trailer parked at the curb of a coastal mansion job site.',
    category: 'equipment',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 55%', card: 'center 50%', wide: 'center 45%' },
  },
  {
    slug: 'crew-on-the-job-residential',
    alt: 'A-1 Sealcoating crew working on a residential driveway with the branded equipment trailer behind them.',
    category: 'equipment',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
    focal: { hero: 'center 35%', card: 'center 32%', wide: 'center 30%' },
  },
]

export function srcset(slug: string): { webp1920: string; webp1280: string; webp640: string; jpg1920: string; jpg640: string } {
  return {
    webp1920: `${base}/${slug}-1920.webp`,
    webp1280: `${base}/${slug}-1280.webp`,
    webp640:  `${base}/${slug}-640.webp`,
    jpg1920:  `${base}/${slug}-1920.jpg`,
    jpg640:   `${base}/${slug}-640.jpg`,
  }
}

// Curated rotation for the hero. Five strongest premium driveway shots —
// luxury home + clean blacktop + clear sky. Enhanced photos lead so the first
// impression is the most polished work.
export const HERO_ROTATION = [
  'enhanced-driveway-01',
  'enhanced-driveway-05',
  'enhanced-driveway-02',
  'enhanced-driveway-04',
  'enhanced-driveway-03',
]

// Featured Work — magazine spread: one lead + two tiles.
// Lead is the single most premium driveway. Tiles balance a long-drive estate
// shot and a curved coastal mansion drive.
export const FEATURED_PICKS = {
  lead: 'enhanced-driveway-01',
  tiles: ['enhanced-driveway-05', 'enhanced-driveway-03'],
}

// Project reel — enhanced premium driveways front-load, then real A-1
// originals (jobs, equipment, crew) round out the scrub.
export const REEL_ORDER = [
  'enhanced-driveway-01',
  'enhanced-driveway-05',
  'enhanced-driveway-02',
  'enhanced-driveway-04',
  'enhanced-driveway-03',
  'enhanced-driveway-07',
  'enhanced-driveway-06',
  'enhanced-driveway-08',
  'enhanced-driveway-10',
  'enhanced-driveway-09',
  'brick-colonial-jet-black-wide',
  'modern-estate-curved-drive',
  'stucco-mansion-fresh-seal',
  'gray-colonial-curved-drive',
  'coastal-mansion-finished',
  'hilltop-estate-pillared-entry',
  'estate-cobblestone-apron',
  'dusk-fresh-seal-crepe-myrtle',
  'blue-colonial-long-drive',
  'trailer-truck-at-estate',
  'coastal-mansion-equipment',
  'crew-on-the-job-residential',
]

export type Service = {
  id: string
  name: string
  short: string
  detail: string
}

export const SERVICES: Service[] = [
  {
    id: 'sealcoating',
    name: 'Sealcoating',
    short: 'Protect asphalt from sun, water, salt and fuel.',
    detail:
      'A premium sealcoat layer seals fine cracks, restores the deep-black finish and adds years of life. Hand-cut edges, masked walks, branded caution tape so the work area stays safe while it cures.',
  },
  {
    id: 'asphalt-paving',
    name: 'Asphalt Paving',
    short: 'New driveways, new lots, dependable surface.',
    detail:
      'Fresh asphalt installation for driveways, parking lots and pads — proper base prep, compacted lifts, clean transitions where the new asphalt meets concrete or pavers.',
  },
  {
    id: 'crack-filling',
    name: 'Crack Filling',
    short: 'Stop small cracks before they become big problems.',
    detail:
      'Hot-applied crack filler keeps water out of the base. Doing this on a regular cycle is the single highest-leverage thing a property owner can do to extend an asphalt surface.',
  },
  {
    id: 'line-striping',
    name: 'Line Striping',
    short: 'Crisp parking lines, ADA stalls, directional markings.',
    detail:
      'Fresh paint over freshly sealed asphalt — straight lines, clean stops, ADA-spec accessible stalls. The lot reads as cared-for the moment customers pull in.',
  },
  {
    id: 'residential-driveways',
    name: 'Residential Driveways',
    short: 'The driveway is the first thing guests see.',
    detail:
      'Driveway resurfacing, sealcoating and crack repair for premium homes. Careful handwork along walks, pavers and lawns — we leave the property cleaner than we found it.',
  },
  {
    id: 'commercial-asphalt-maintenance',
    name: 'Commercial Asphalt Maintenance',
    short: 'Lot maintenance plans that keep tenants happy.',
    detail:
      'Sealcoating, crack filling, striping and patching for parking lots, multi-family properties and commercial buildings. Scheduled to minimize disruption to your operation.',
  },
]

export type FaqItem = { q: string; a: string }
export const FAQ: FaqItem[] = [
  {
    q: 'How long does a fresh sealcoat take to dry?',
    a: 'Foot traffic is usually safe after 4 – 6 hours in dry weather; vehicles should stay off for 24 – 48 hours depending on temperature and humidity. We block the surface with branded caution tape so it stays protected.',
  },
  {
    q: 'How often should a driveway be sealcoated?',
    a: 'Most residential driveways do well on a 2 – 3 year cycle. Heavy-use commercial lots benefit from more frequent inspection. We can take a look and tell you honestly when it actually needs the next coat.',
  },
  {
    q: 'Do you do both residential driveways and commercial parking lots?',
    a: 'Yes. We work on both — premium home driveways and commercial / multi-family lots. Same crew, same standards.',
  },
  {
    q: 'Are you insured?',
    a: 'Yes — A-1 Sealcoating LLC is fully insured.',
  },
  {
    q: 'How long has A-1 Sealcoating been in business?',
    a: 'Over 25 years. Same family-run operation, same standards.',
  },
  {
    q: 'Can you repair cracks before sealcoating?',
    a: 'Yes. We hot-fill any visible cracks first so they’re stabilized before the new sealcoat goes down. That’s how the work actually lasts.',
  },
  {
    q: 'What about edges along walkways and pavers?',
    a: 'We hand-cut the edges along walks, pavers and concrete aprons. Nothing splashed, nothing dragged onto adjacent surfaces.',
  },
  {
    q: 'How do I get an estimate?',
    a: `Call ${COMPANY.phone} or send the contact form below. We’ll set up a time to come look at the property and quote it on the spot.`,
  },
]

export const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Site walk',
    body: 'We come out, look at the surface, listen to what you actually need. No high-pressure sales pitch — just an honest read on what the asphalt needs and what it does not.',
  },
  {
    n: '02',
    title: 'Clear estimate',
    body: 'You get a written quote with the scope spelled out. Sealcoat, crack fill, striping, paving — what is included and what is not.',
  },
  {
    n: '03',
    title: 'Prep & protect',
    body: 'Blow out the surface, mask the edges, protect walks, lawns and pavers. The job site stays clean while we work.',
  },
  {
    n: '04',
    title: 'Apply',
    body: 'Hand-cut edges, even coverage, no shortcuts. Sealcoating, crack filling or new asphalt — done so it lasts.',
  },
  {
    n: '05',
    title: 'Protect the cure',
    body: 'Branded A-1 caution tape goes up so the fresh surface stays protected through the cure window. Clear instructions on when the surface is ready for foot traffic and for vehicles.',
  },
]

// Owner portrait — small trust card asset. Image is medium-res casual portrait;
// display small and never as hero. Optimized 320/640 jpg+webp variants live in
// /media/a1-sealcoating/optimized/owner-{320,640}.{webp,jpg}.
export const OWNER = {
  name: 'Louis Carlesimo',
  title: 'CEO',
  line: 'Owner-led service. 25+ years on the job.',
  alt: `Louis Carlesimo, CEO of ${'A-1 Sealcoating LLC'}.`,
  // Subject sits in the upper-middle of the frame; nudge crop up so the face
  // anchors any square/portrait crop instead of the boat wheel below.
  focal: 'center 32%',
  srcset: {
    webp320: '/media/a1-sealcoating/optimized/owner-320.webp',
    webp640: '/media/a1-sealcoating/optimized/owner-640.webp',
    jpg320:  '/media/a1-sealcoating/optimized/owner-320.jpg',
    jpg640:  '/media/a1-sealcoating/optimized/owner-640.jpg',
  },
}

export const TRUST_BADGES = [
  { label: 'Over 25 Years', sub: 'In Business' },
  { label: 'Fully Insured', sub: 'LLC' },
  { label: 'Residential', sub: '& Commercial' },
  { label: 'Family Operated', sub: `CEO Louis Carlesimo` },
]

export const CATEGORIES: { id: A1Photo['category'] | 'all'; label: string }[] = [
  { id: 'all',            label: 'All Work' },
  { id: 'premium-homes',  label: 'Premium Homes' },
  { id: 'residential',    label: 'Residential Driveways' },
  { id: 'sealcoating',    label: 'Sealcoating' },
  { id: 'equipment',      label: 'Equipment & Crew' },
]
