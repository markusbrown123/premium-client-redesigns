import { useMemo, useState, useCallback, useEffect } from 'react'
import { PHOTOS, CATEGORIES, srcset, type A1Photo } from '../a1Data'
import { Close, ChevLeft, ChevRight } from './A1Icons'

type Filter = (typeof CATEGORIES)[number]['id']

// Decide a tile size based on the photo + index, so the masonry layout
// stays photo-led (landscapes get wider tiles, portraits stay tall).
function tileClass(p: A1Photo, i: number): string {
  if (p.orientation === 'landscape') return 'a1-gallery__item a1-gallery__item--wide'
  if (i % 5 === 0) return 'a1-gallery__item a1-gallery__item--tall'
  return 'a1-gallery__item'
}

export function A1Gallery() {
  const [filter, setFilter] = useState<Filter>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return PHOTOS
    return PHOTOS.filter((p) => p.category === filter)
  }, [filter])

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox((i) => (i === null ? null : (i + filtered.length - 1) % filtered.length)), [filtered.length])
  const next = useCallback(() => setLightbox((i) => (i === null ? null : (i + 1) % filtered.length)), [filtered.length])

  // Keyboard nav for lightbox.
  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, close, prev, next])

  return (
    <section className="a1-section a1-gallery" id="work">
      <div className="a1-container">
        <header className="a1-section__head">
          <div className="a1-section__head-title a1-reveal">
            <span className="a1-eyebrow">04 — The Gallery</span>
            <h2 className="a1-h2">Finished work, <em>up close.</em></h2>
          </div>
          <p className="a1-section__head-meta a1-lede a1-reveal">
            Filter by surface type or property style. Click any image to see it full-size.
          </p>
        </header>

        <div className="a1-gallery__filters a1-reveal" role="tablist" aria-label="Gallery filters">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={filter === c.id}
              className={`a1-gallery__filter ${filter === c.id ? 'is-active' : ''}`}
              onClick={() => setFilter(c.id as Filter)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="a1-gallery__grid">
          {filtered.map((p, i) => {
            const s = srcset(p.slug)
            return (
              <button
                key={p.slug}
                type="button"
                className={`${tileClass(p, i)} a1-reveal`}
                onClick={() => setLightbox(i)}
                aria-label={`Open larger: ${p.alt}`}
              >
                <picture>
                  <source type="image/webp" srcSet={`${s.webp640} 640w, ${s.webp1280} 1280w`} sizes="(max-width: 880px) 50vw, 33vw" />
                  <img src={s.jpg640} alt={p.alt} loading="lazy" decoding="async" />
                </picture>
                <div className="a1-gallery__item-caption">
                  {CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {lightbox !== null && filtered[lightbox] ? (
        <div className="a1-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
          <div className="a1-lightbox__img-wrap" onClick={(e) => e.stopPropagation()}>
            <picture>
              <source
                type="image/webp"
                srcSet={`${srcset(filtered[lightbox].slug).webp1280} 1280w, ${srcset(filtered[lightbox].slug).webp1920} 1920w`}
                sizes="92vw"
              />
              <img src={srcset(filtered[lightbox].slug).jpg1920} alt={filtered[lightbox].alt} />
            </picture>
            <div className="a1-lightbox__caption">{filtered[lightbox].alt}</div>
            <button type="button" className="a1-lightbox__close" onClick={close} aria-label="Close">
              <Close />
            </button>
            <button type="button" className="a1-lightbox__nav a1-lightbox__nav--prev" onClick={prev} aria-label="Previous photo">
              <ChevLeft />
            </button>
            <button type="button" className="a1-lightbox__nav a1-lightbox__nav--next" onClick={next} aria-label="Next photo">
              <ChevRight />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
