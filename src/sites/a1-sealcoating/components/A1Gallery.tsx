import { useMemo, useState, useCallback, useEffect } from 'react'
import { PHOTOS, CATEGORIES, srcset, type A1Photo } from '../a1Data'
import { Close, ChevLeft, ChevRight } from './A1Icons'

type Filter = (typeof CATEGORIES)[number]['id']

// Photo-led tile sizing: the first item anchors as a feature; landscape shots
// always take a wide tile so they read as landscape; everything else stays as
// the default portrait. We dropped the i%6==2 "tall" promotion — with the
// fixed grid-auto-rows model it was reshuffling row gaps on every filter
// change. Tall is still available for hand-curated standout shots if we want
// to re-introduce it later.
function tileClass(p: A1Photo, i: number): string {
  if (i === 0) return 'a1-gallery__item a1-gallery__item--feature'
  if (p.orientation === 'landscape') return 'a1-gallery__item a1-gallery__item--wide'
  return 'a1-gallery__item'
}

export function A1Gallery() {
  const [filter, setFilter] = useState<Filter>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)

  const { filtered, fellBack } = useMemo(() => {
    let base = filter === 'all' ? PHOTOS : PHOTOS.filter((p) => p.category === filter)
    // Safety net: if a future data edit ever leaves a category empty, fall back
    // to All Work rather than rendering a blank grid.
    let didFallBack = false
    if (base.length === 0) {
      base = PHOTOS
      didFallBack = true
    }
    if (base.length < 2) return { filtered: base, fellBack: didFallBack }
    // Sort for the 12-col + row-span grid. Anchor stays first (becomes the
    // span-8/row-span-3 feature). Landscapes follow because their wide+short
    // cells (span 6/row-span 2) pair into clean 2-up rows. Portraits trail and
    // pack 3-per-row (span 4/row-span 3). With grid-auto-flow: dense, the
    // earliest portrait drops into the 4-col gap next to the feature so the
    // first row reads as feature + portrait with no hole.
    const [anchor, ...rest] = base
    const landscapes = rest.filter((p) => p.orientation === 'landscape')
    const portraits = rest.filter((p) => p.orientation === 'portrait')
    return { filtered: [anchor, ...landscapes, ...portraits], fellBack: didFallBack }
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
      <div className="a1-container a1-container--media">
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

        {fellBack ? (
          <p className="a1-gallery__fallback" role="status">
            No photos in that category yet — showing all work instead.
          </p>
        ) : null}

        <div className="a1-gallery__grid">
          {filtered.map((p, i) => {
            const s = srcset(p.slug)
            return (
              <button
                key={p.slug}
                type="button"
                className={tileClass(p, i)}
                onClick={() => setLightbox(i)}
                aria-label={`Open larger: ${p.alt}`}
              >
                <picture>
                  <source type="image/webp" srcSet={`${s.webp640} 640w, ${s.webp1280} 1280w`} sizes="(max-width: 880px) 50vw, 33vw" />
                  <img
                    src={s.jpg640}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    style={p.focal?.card ? { objectPosition: p.focal.card } : undefined}
                  />
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
