import { useRef, useEffect } from 'react'
import { PHOTOS, REEL_ORDER, srcset, CATEGORIES } from '../a1Data'

export function A1ProjectReel() {
  const trackRef = useRef<HTMLDivElement | null>(null)

  // Click-drag scroll for desktop (touch already works natively).
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let isDown = false
    let startX = 0
    let scrollLeft = 0

    const onDown = (e: PointerEvent) => {
      // Only respond to mouse drags; let touch scrolling stay native.
      if (e.pointerType !== 'mouse') return
      isDown = true
      el.classList.add('is-dragging')
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }
    const onLeave = () => { isDown = false; el.classList.remove('is-dragging') }
    const onMove = (e: PointerEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 1.2
      el.scrollLeft = scrollLeft - walk
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointerup', onLeave)
    el.addEventListener('pointermove', onMove)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerup', onLeave)
      el.removeEventListener('pointermove', onMove)
    }
  }, [])

  const cards = REEL_ORDER
    .map((slug) => PHOTOS.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <section className="a1-reel" aria-label="Project reel">
      <div className="a1-container a1-container--media">
        <header className="a1-reel__head">
          <div className="a1-reveal">
            <span className="a1-eyebrow">05 — Project Reel</span>
            <h2 className="a1-h2" style={{ marginTop: 14 }}>
              <em className="a1-script-accent">Drag</em> to scrub the work.
            </h2>
          </div>
          <p className="a1-lede a1-reveal" style={{ maxWidth: '38ch' }}>
            A horizontal pass through our recent driveway finishes. Drag on desktop, swipe on mobile.
          </p>
        </header>
      </div>

      <div className="a1-reel__track" ref={trackRef}>
        {cards.map((p) => {
          const s = srcset(p.slug)
          const label = CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category.replace('-', ' ')
          return (
            <div
              className={`a1-reel__card a1-reel__card--${p.orientation}`}
              key={p.slug}
            >
              <picture>
                <source type="image/webp" srcSet={`${s.webp640} 640w, ${s.webp1280} 1280w`} sizes="(max-width: 640px) 80vw, 380px" />
                <img
                  src={s.jpg640}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                  style={p.focal?.card ? { objectPosition: p.focal.card } : undefined}
                />
              </picture>
              <span className="a1-reel__card-caption">{label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
