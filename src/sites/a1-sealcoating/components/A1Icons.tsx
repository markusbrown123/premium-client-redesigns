// Lightweight inline SVG icons for A-1 services and chrome.
// Kept inline so we never load an extra font/icon-set request.

import type { SVGProps, ReactElement } from 'react'

const base = (extra?: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...extra,
})

export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
)

export const Phone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5.6 3.3a2 2 0 0 1 2.83.18l1.84 2.1a2 2 0 0 1-.21 2.83L8.7 9.7a14 14 0 0 0 5.6 5.6l1.3-1.36a2 2 0 0 1 2.83-.21l2.1 1.84a2 2 0 0 1 .18 2.83l-1.07 1.2a3 3 0 0 1-2.8.9 18 18 0 0 1-13-13 3 3 0 0 1 .9-2.8l1.1-1Z" />
  </svg>
)

export const Close = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const ChevLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

export const ChevRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const Plus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

// Service icons — bespoke 24px line marks.

export const IconSealcoat = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 17c3-2 6-2 9 0s6 2 9 0" />
    <path d="M3 12c3-2 6-2 9 0s6 2 9 0" />
    <path d="M3 7c3-2 6-2 9 0s6 2 9 0" />
  </svg>
)
export const IconPave = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="14" width="18" height="6" rx="1" />
    <path d="M6 14V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6" />
    <path d="M7 17h2M11 17h2M15 17h2" />
  </svg>
)
export const IconCrack = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 4l3 5-2 3 4 3-1 5 4-2 2 2" />
    <path d="M14 4l2 4 4 1-3 3 2 4" />
  </svg>
)
export const IconLines = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5 4v16M12 4v16M19 4v16" />
    <path d="M5 8h2M12 12h2M19 6h-2" />
  </svg>
)
export const IconHome = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 11l9-7 9 7" />
    <path d="M5 10v9h14v-9" />
    <path d="M10 19v-5h4v5" />
  </svg>
)
export const IconBuilding = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="8" height="16" />
    <rect x="13" y="9" width="8" height="11" />
    <path d="M5 8h4M5 12h4M5 16h4M15 12h4M15 16h4" />
  </svg>
)

export const SERVICE_ICONS: Record<string, (p: SVGProps<SVGSVGElement>) => ReactElement> = {
  'sealcoating': IconSealcoat,
  'asphalt-paving': IconPave,
  'crack-filling': IconCrack,
  'line-striping': IconLines,
  'residential-driveways': IconHome,
  'commercial-asphalt-maintenance': IconBuilding,
}
