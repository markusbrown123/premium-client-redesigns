import { TRUST_BADGES } from '../a1Data'

export function A1TrustStrip() {
  return (
    <section className="a1-trust" aria-label="Why A-1 Sealcoating">
      <div className="a1-container">
        <div className="a1-trust__grid">
          {TRUST_BADGES.map((b) => (
            <div className="a1-trust__cell a1-reveal" key={b.label}>
              <span className="a1-trust__label">{b.label}</span>
              <span className="a1-trust__sub">{b.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
