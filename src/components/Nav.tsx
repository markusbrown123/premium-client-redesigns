import { useEffect, useState } from 'react'

type Brand = { name: string; italic?: string; tagline?: string }
type Link = { href: string; label: string }
type Cta = { label: string; href: string }

type Props = {
  brand: Brand
  links: Link[]
  cta: Cta
}

export function Nav({ brand, links, cta }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <a href="#top" className="nav__brand" aria-label={`${brand.name}${brand.italic ? ' ' + brand.italic : ''} — home`}>
        <span className="nav__lockup">
          <span className="nav__mark" aria-hidden="true">
            <span className="nav__mark-dot" />
            <span className="nav__mark-rule" />
          </span>
          <span className="nav__name">
            <span className="nav__name-primary">{brand.name}</span>
            {brand.italic ? <span className="nav__name-italic">{brand.italic}</span> : null}
          </span>
        </span>
        {brand.tagline ? (
          <span className="nav__sub">
            <span className="nav__sub-dot" aria-hidden="true" />
            {brand.tagline}
          </span>
        ) : null}
      </a>
      <nav className="nav__links" aria-label="Primary">
        {links.map((l, i) => (
          <a key={l.href} href={l.href}>
            <span className="nav__link-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="nav__link-label">{l.label}</span>
          </a>
        ))}
      </nav>
      <a href={cta.href} className="nav__cta">
        <span className="nav__cta-dot" aria-hidden="true" />
        <span>{cta.label}</span>
        <span className="nav__cta-arrow" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    </header>
  )
}
