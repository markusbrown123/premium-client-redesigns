import { useRef, useEffect } from 'react'
import { PHOTOS, srcset } from '../a1Data'

// Order: alternate landscapes and portraits for visual variety, no repeats.
const REEL_ORDER = [
  'modern-estate-curved-drive',
  'stucco-mansion-fresh-seal',
  'brick-colonial-jet-black-wide',
  'gray-colonial-curved-drive',
  'hilltop-estate-pillared-entry',
  'coastal-mansion-finished',
  'dusk-fresh-seal-crepe-myrtle',
  'estate-cobblestone-apron',
  'trailer-truck-at-estate',
  'blue-colonial-long-drive',
  'coastal-mansion-equipment',
  'crew-on-the-job-residential',
]

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
      <div className="a1-container a1-container--wide">
        <header className="a1-reel__head">
          <div className="a1-reveal">
            <span className="a1-eyebrow">05 — Project Reel</span>
            <h2 className="a1-h2" style={{ marginTop: 14 }}>
              <em className="a1-script-accent">Drag</em> to scrub the work.
            </h2>
          </div>
          <p className="a1-lede a1-reveal" style={{ maxWidth: 36 + 'ch' }}>
            A horizontal pass through twelve recent A-1 jobs. Drag on desktop, swipe on mobile.
          </p>
        </header>
      </div>

      <div className="a1-reel__track" ref={trackRef}>
        {cards.map((p) => {
          const s = srcset(p.slug)
          return (
            <div className="a1-reel__card" key={p.slug}>
              <picture>
                <source type="image/webp" srcSet={`${s.webp640} 640w, ${s.webp1280} 1280w`} sizes="320px" />
                <img src={s.jpg640} alt={p.alt} loading="lazy" decoding="async" />
              </picture>
              <span className="a1-reel__card-caption">
                {p.category.replace('-', ' ')}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
