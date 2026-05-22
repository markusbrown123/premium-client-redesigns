import { PHOTOS, srcset, COMPANY, OWNER } from '../a1Data'

// Wider, more legible branded shot — truck + trailer with the A-1 logo and
// phone number both clearly readable, full property context behind.
const SLUG = 'trailer-truck-at-estate'

export function A1Equipment() {
  const p = PHOTOS.find((x) => x.slug === SLUG)!
  const s = srcset(p.slug)

  return (
    <section className="a1-section a1-equipment" aria-label="A-1 Sealcoating equipment and crew">
      <div className="a1-container a1-container--wide">
        <div className="a1-equipment__grid">
          <div className="a1-equipment__media a1-reveal">
            <picture>
              <source type="image/webp" srcSet={`${s.webp1280} 1280w, ${s.webp1920} 1920w`} sizes="(max-width: 880px) 100vw, 50vw" />
              <img
                src={s.jpg1920}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                style={p.focal?.wide ? { objectPosition: p.focal.wide } : undefined}
              />
            </picture>
          </div>
          <div className="a1-equipment__copy a1-reveal a1-reveal--right">
            <span className="a1-eyebrow">08 — On the job</span>
            <h2 className="a1-h2">
              Real crew. <em>Real equipment.</em> Branded truck.
            </h2>
            <p className="a1-lede">
              Our branded sealcoat trailer and pickup show up on every job — A-1 Sealcoating, Asphalt Services, {COMPANY.phone}.
              You will know who is on the property and how to reach us.
            </p>
            <p className="a1-lede">
              Twenty-five-plus years of doing this with the same standards. The phone goes straight to the people doing the work.
            </p>

            <figure className="a1-owner-card">
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${OWNER.srcset.webp320} 320w, ${OWNER.srcset.webp640} 640w`}
                  sizes="(max-width: 880px) 96px, 112px"
                />
                <img
                  src={OWNER.srcset.jpg320}
                  alt={OWNER.alt}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: OWNER.focal }}
                />
              </picture>
              <figcaption>
                <span className="a1-owner-card__name">{OWNER.name}</span>
                <span className="a1-owner-card__title">{OWNER.title} · {COMPANY.legalName}</span>
                <span className="a1-owner-card__line">{OWNER.line}</span>
              </figcaption>
            </figure>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
              <a className="a1-btn a1-btn--primary" href={COMPANY.phoneHref}>
                Call {COMPANY.phone}
              </a>
              <a className="a1-btn a1-btn--ghost" href="#contact">
                Request an estimate
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
