import { useEffect, useRef, useState } from 'react'
import { COMPANY, HERO_ROTATION, PHOTOS, srcset } from '../a1Data'
import { ArrowRight, Phone } from './A1Icons'

const SLIDE_MS = 6500

export function A1Hero() {
  const slides = HERO_ROTATION
    .map((slug) => PHOTOS.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const [active, setActive] = useState(0)
  const [drifting, setDrifting] = useState(true)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedRef.current) return
    const id = window.setInterval(() => {
      setDrifting(false)
      // Reset drift so transform animates from 1.0 -> 1.10 each cycle.
      requestAnimationFrame(() => {
        setActive((i) => (i + 1) % slides.length)
        requestAnimationFrame(() => setDrifting(true))
      })
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [slides.length])

  return (
    <section className="a1-hero" id="top">
      <div className="a1-hero__media" aria-hidden="true">
        {slides.map((slide, i) => {
          const s = srcset(slide.slug)
          return (
            <div
              key={slide.slug}
              className={`a1-hero__slide ${i === active ? 'is-active' : ''} ${i === active && drifting ? 'is-drifting' : ''}`}
            >
              <picture>
                <source type="image/webp" srcSet={`${s.webp640} 640w, ${s.webp1280} 1280w, ${s.webp1920} 1920w`} sizes="100vw" />
                <img
                  className="a1-hero__img"
                  src={s.jpg1920}
                  alt={slide.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                  style={slide.focal?.hero ? { objectPosition: slide.focal.hero } : undefined}
                />
              </picture>
            </div>
          )
        })}
        <div className="a1-hero__scrim" />
      </div>

      <div className="a1-hero__content">
        <div className="a1-container">
          <div className="a1-hero__row">
            <span className="a1-eyebrow a1-hero__eyebrow">A-1 Sealcoating · Asphalt Services</span>
            <h1 className="a1-h1 a1-hero__title">
              Protect. <em>Restore.</em> Impress.
            </h1>
            <p className="a1-hero__sub">
              Professional asphalt services for premium homes and businesses, backed by <strong>over 25 years</strong> of experience.
              Fully insured · Commercial &amp; Residential.
            </p>
            <div className="a1-hero__ctas">
              <a className="a1-btn a1-btn--primary" href={COMPANY.phoneHref}>
                <Phone width={16} height={16} />
                <span>Call {COMPANY.phone}</span>
              </a>
              <a className="a1-btn a1-btn--ghost" href="#work">
                <span>View Our Work</span>
                <span className="a1-btn__arrow"><ArrowRight width={16} height={16} /></span>
              </a>
            </div>
            <div className="a1-hero__badges">
              <span className="a1-hero__badge"><span className="a1-hero__badge-dot" /> Over 25 Years</span>
              <span className="a1-hero__badge"><span className="a1-hero__badge-dot" /> Fully Insured</span>
              <span className="a1-hero__badge"><span className="a1-hero__badge-dot" /> Residential &amp; Commercial</span>
            </div>
          </div>
        </div>
      </div>

      <div className="a1-hero__progress" aria-hidden="true">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`a1-hero__progress-bar ${i === active ? 'is-active' : ''} ${i < active ? 'is-complete' : ''}`}
          >
            <div className="a1-hero__progress-fill" />
          </div>
        ))}
      </div>
    </section>
  )
}
