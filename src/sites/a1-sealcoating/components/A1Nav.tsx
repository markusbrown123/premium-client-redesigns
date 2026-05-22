import { useEffect, useState } from 'react'
import { COMPANY } from '../a1Data'
import { Phone } from './A1Icons'

const LINKS = [
  { href: '#services',  label: 'Services' },
  { href: '#work',      label: 'Our Work' },
  { href: '#process',   label: 'Process' },
  { href: '#faq',       label: 'FAQ' },
  { href: '#contact',   label: 'Estimate' },
]

export function A1Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`a1-nav ${scrolled ? 'a1-nav--scrolled' : ''}`}>
      <div className="a1-container a1-nav__inner">
        <a href="#top" className="a1-nav__brand" aria-label={`${COMPANY.shortName} — home`}>
          <img
            src="/brand/a1-logo-nav@800w.png"
            srcSet="/brand/a1-logo-nav@480w.png 480w, /brand/a1-logo-nav@800w.png 800w, /brand/a1-logo-nav.png 1200w"
            sizes="(max-width: 880px) 200px, 320px"
            alt={`${COMPANY.legalName} — ${COMPANY.tagline}`}
            className="a1-nav__logo"
            width={320}
            height={75}
          />
        </a>
        <nav className="a1-nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <a className="a1-nav__call" href={COMPANY.phoneHref} aria-label={`Call ${COMPANY.phone}`}>
          <span className="a1-nav__call-icon"><Phone width={16} height={16} /></span>
          <span className="a1-nav__call-label">{COMPANY.phone}</span>
        </a>
      </div>
    </header>
  )
}
