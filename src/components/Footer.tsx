type Brand = { name: string; italic?: string; tagline?: string }
type Link = { href: string; label: string }
type FooterSection = { title: string; links: Array<{ label: string; href?: string }> }

type Props = {
  brand: Brand
  navLinks: Link[]
  footer: {
    intro: string
    sections: FooterSection[]
    legalName: string
    bigWords?: string[]
  }
}

export function Footer({ brand, navLinks, footer }: Props) {
  const year = new Date().getFullYear()
  const big = footer.bigWords && footer.bigWords.length ? footer.bigWords : [brand.name, '—', brand.italic || 'Studio']

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__monogram" aria-hidden="true">
          <span className="footer__monogram-rule" />
          <span className="footer__monogram-mark">
            <span className="footer__monogram-dot" />
            <span>Est. São Paulo</span>
            <span>·</span>
            <span>Image studio in five rooms</span>
          </span>
          <span className="footer__monogram-rule" />
        </div>

        <div className="footer__big" aria-hidden="true">
          {big.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <span className="eyebrow">{brand.name}</span>
            <p>{footer.intro}</p>
          </div>
          <div className="footer__col">
            <span className="eyebrow">Index</span>
            <ul>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          {footer.sections.map((s) => (
            <div className="footer__col" key={s.title}>
              <span className="eyebrow">{s.title}</span>
              <ul>
                {s.links.map((l, i) => (
                  <li key={i}>
                    {l.href ? <a href={l.href}>{l.label}</a> : l.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__legal">
          <span>© {year} {footer.legalName}. All rights reserved.</span>
          <span>
            <a href="#">Privacy</a> · <a href="#">Terms</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
