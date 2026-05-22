import { SERVICES } from '../a1Data'
import { SERVICE_ICONS } from './A1Icons'

export function A1Services() {
  return (
    <section className="a1-section a1-services" id="services">
      <div className="a1-container">
        <header className="a1-section__head">
          <div className="a1-section__head-title a1-reveal">
            <span className="a1-eyebrow">02 — Services</span>
            <h2 className="a1-h2">
              What we <em className="a1-script-accent">actually</em> do.
            </h2>
          </div>
          <p className="a1-section__head-meta a1-lede a1-reveal">
            Six core asphalt services for premium homes and commercial properties.
            Same crew, same standards, same phone — {' '}
            <a href="tel:+17328225652" style={{ textDecoration: 'underline' }}>732-822-5652</a>.
          </p>
        </header>

        <div className="a1-services__grid">
          {SERVICES.map((s, i) => {
            const Icon = SERVICE_ICONS[s.id]
            return (
              <article className="a1-service a1-reveal" key={s.id} style={{ ['--i' as never]: i }}>
                <span className="a1-service__num">0{i + 1}</span>
                <span className="a1-service__icon">{Icon ? <Icon width={22} height={22} /> : null}</span>
                <h3 className="a1-service__title">{s.name}</h3>
                <p className="a1-service__short">{s.short}</p>
                <p className="a1-service__detail">{s.detail}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
