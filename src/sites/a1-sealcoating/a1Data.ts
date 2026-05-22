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
}

const base = '/media/a1-sealcoating/optimized'

export const PHOTOS: A1Photo[] = [
  {
    slug: 'stucco-mansion-fresh-seal',
    alt: 'Freshly sealcoated jet-black driveway in front of a large stucco home, finished by A-1 Sealcoating LLC.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
  },
  {
    slug: 'gray-colonial-curved-drive',
    alt: 'Curved residential driveway with paver border, freshly sealcoated by A-1 Sealcoating, with A-1 caution tape across the apron.',
    category: 'residential',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
  },
  {
    slug: 'estate-cobblestone-apron',
    alt: 'Sealcoated driveway leading to an estate home with cobblestone apron and A-1 Sealcoating branded caution tape.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
  },
  {
    slug: 'blue-colonial-long-drive',
    alt: 'Long curved residential driveway leading up to a blue colonial home, freshly sealcoated.',
    category: 'residential',
    orientation: 'portrait',
    heroEligible: true,
    featured: false,
  },
  {
    slug: 'coastal-mansion-equipment',
    alt: 'A-1 Sealcoating branded equipment trailer parked at the curb of a coastal mansion job site.',
    category: 'equipment',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
  },
  {
    slug: 'coastal-mansion-finished',
    alt: 'Freshly sealcoated driveway in front of a large coastal mansion under a bright blue sky.',
    category: 'premium-homes',
    orientation: 'portrait',
    heroEligible: true,
    featured: true,
  },
  {
    slug: 'brick-colonial-jet-black-wide',
    alt: 'Wide view of a freshly sealcoated jet-black driveway alongside a brick colonial home with A-1 caution tape across the entry.',
    category: 'sealcoating',
    orientation: 'landscape',
    heroEligible: true,
    featured: true,
  },
  {
    slug: 'modern-estate-curved-drive',
    alt: 'Modern white estate with a freshly sealcoated curved driveway, A-1 caution tape across the apron.',
    category: 'premium-homes',
    orientation: 'landscape',
    heroEligible: true,
    featured: true,
  },
  {
    slug: 'trailer-truck-at-estate',
    alt: 'A-1 Sealcoating branded trailer hitched to the company pickup truck at a residential estate job site.',
    category: 'equipment',
    orientation: 'landscape',
    heroEligible: false,
    featured: false,
  },
  {
    slug: 'dusk-fresh-seal-crepe-myrtle',
    alt: 'Freshly sealcoated jet-black driveway at dusk, framed by blooming crepe myrtle trees.',
    category: 'sealcoating',
    orientation: 'portrait',
    heroEligible: true,
    featured: false,
  },
  {
    slug: 'hilltop-estate-pillared-entry',
    alt: 'Long sealcoated driveway leading up to a hilltop estate with pillared entrance posts.',
    category: 'premium-homes',
    orientation: 'landscape',
    heroEligible: true,
    featured: false,
  },
  {
    slug: 'crew-on-the-job-residential',
    alt: 'A-1 Sealcoating crew working on a residential driveway with the branded equipment trailer behind them.',
    category: 'equipment',
    orientation: 'portrait',
    heroEligible: false,
    featured: false,
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

// Curated rotation for the hero. Prioritizes landscape + premium variety.
export const HERO_ROTATION = [
  'brick-colonial-jet-black-wide',
  'modern-estate-curved-drive',
  'hilltop-estate-pillared-entry',
  'stucco-mansion-fresh-seal',
  'coastal-mansion-finished',
  'gray-colonial-curved-drive',
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
