import type { ReactNode } from 'react'
import { useLenis } from '../hooks/useLenis'
import { useReveal } from '../hooks/useReveal'
import { useParallax } from '../hooks/useParallax'
import { useScrollFade } from '../hooks/useScrollFade'
import { Nav } from './Nav'
import { Footer } from './Footer'

export type NavLink = { href: string; label: string }

export type SiteShellProps = {
  brand: {
    name: string
    italic?: string
    tagline?: string
  }
  navLinks: NavLink[]
  navCta: { label: string; href: string }
  footer: {
    intro: string
    sections: Array<{ title: string; links: Array<{ label: string; href?: string }> }>
    legalName: string
    bigWords?: string[]
  }
  className?: string
  children: ReactNode
}

export function SiteShell({ brand, navLinks, navCta, footer, className, children }: SiteShellProps) {
  useLenis()
  useReveal()
  // Platinum's library is dominated by sub-1500px images; aggressive parallax
  // amplifies the resolution weakness. 64 reads as premium drift without blur.
  useParallax({ range: className === 'platinum' ? 64 : 70 })
  useScrollFade()

  return (
    <div className={className ? `site site--${className}` : 'site'}>
      <Nav brand={brand} links={navLinks} cta={navCta} />
      <main>{children}</main>
      <Footer brand={brand} navLinks={navLinks} footer={footer} />
    </div>
  )
}
