import { COMPANY } from '../a1Data'

export function A1Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="a1-footer">
      <div className="a1-container">
        <div className="a1-footer__grid">
          <div className="a1-footer__brand">
            <img
              src="/brand/a1-logo-clean@1200w.png"
              alt={`${COMPANY.legalName} — ${COMPANY.tagline}`}
              width={360}
              height={156}
            />
            <p>
              {COMPANY.legalName} · {COMPANY.tagline}. {COMPANY.experience}. {COMPANY.insurance}. {COMPANY.scope}.
            </p>
          </div>

          <div className="a1-footer__col">
            <h4>Services</h4>
            <ul>
              <li><a href="#services">Sealcoating</a></li>
              <li><a href="#services">Asphalt Paving</a></li>
              <li><a href="#services">Crack Filling</a></li>
              <li><a href="#services">Line Striping</a></li>
              <li><a href="#services">Residential Driveways</a></li>
              <li><a href="#services">Commercial Maintenance</a></li>
            </ul>
          </div>

          <div className="a1-footer__col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a className="a1-footer__phone" href={COMPANY.phoneHref}>{COMPANY.phone}</a>
              </li>
              <li>CEO · {COMPANY.ceo}</li>
              <li><a href="#contact">Request an estimate</a></li>
              <li><a href="#work">See finished work</a></li>
              <li><a href="#faq">Common questions</a></li>
            </ul>
          </div>
        </div>

        <div className="a1-footer__legal">
          <span>© {year} {COMPANY.legalName}. All rights reserved.</span>
          <span>{COMPANY.experience} · {COMPANY.insurance} · {COMPANY.scope}</span>
        </div>
      </div>
    </footer>
  )
}
