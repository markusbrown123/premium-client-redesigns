import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Lightbox } from './Lightbox'
import type { MediaItem } from '../data/media-types'

export type PlatinumCategoryKey =
  | 'ai'
  | 'images'
  | 'films'
  | 'craft'
  | 'artistic'
  | 'classics'

export type PlatinumCategory = {
  key: PlatinumCategoryKey
  label: string
  items: MediaItem[]
}

type Props = {
  index: string
  eyebrow: string
  title: ReactNode
  intro?: string
  categories: PlatinumCategory[]
  /** Optional category key to open by default. Falls back to first non-empty. */
  initialCategory?: PlatinumCategoryKey
}

function cleanTitle(t: string): string {
  if (!t) return 'Untitled'
  const stripped = t.replace(/[\s_-]/g, '')
  if (/^[a-f0-9]{8,}/i.test(stripped)) return 'Untitled frame'
  if (/\.(jpe?g|png|webp|gif|mp4|webm|svg)$/i.test(t)) {
    const base = t.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
    return /^[a-f0-9]{8,}/i.test(base.replace(/\s/g, '')) ? 'Untitled frame' : base
  }
  return t
}

/**
 * Editorial category-switcher gallery. Each tab swaps a curated set of
 * 1 featured frame + up to 3 supporting frames. Opens into the shared
 * Lightbox. Designed for the Platinum site brief: AI / Images / Films /
 * Craft / Artistic / Classics.
 */
export function PlatinumGallery({
  index,
  eyebrow,
  title,
  intro,
  categories,
  initialCategory,
}: Props) {
  const nonEmpty = useMemo(
    () => categories.filter((c) => c.items.length > 0),
    [categories],
  )
  const fallback = nonEmpty[0]?.key ?? categories[0]?.key
  const [active, setActive] = useState<PlatinumCategoryKey>(
    initialCategory && categories.find((c) => c.key === initialCategory && c.items.length > 0)
      ? initialCategory
      : fallback,
  )
  const [open, setOpen] = useState<number | null>(null)

  const activeCat = categories.find((c) => c.key === active) || categories[0]
  const items = activeCat?.items ?? []
  const feature = items[0]
  const support = items.slice(1, 5)
  const activeIdx = categories.findIndex((c) => c.key === active)
  const roomNum = String((activeIdx >= 0 ? activeIdx : 0) + 1).padStart(2, '0')

  if (!categories.length) return null

  return (
    <section className="pgallery" id="gallery" data-active={active}>
      <div className="container">
        <header className="pgallery__head reveal">
          <span className="pgallery__index">{index}</span>
          <div className="pgallery__head-text">
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="pgallery__title">{title}</h2>
            {intro ? <p className="pgallery__intro">{intro}</p> : null}
          </div>
        </header>

        <div
          className="pgallery__tabs"
          role="tablist"
          aria-label="Gallery categories"
        >
          {categories.map((c) => {
            const disabled = c.items.length === 0
            const selected = c.key === active
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`pgallery-panel-${c.key}`}
                className="pgallery__tab"
                disabled={disabled}
                onClick={() => !disabled && setActive(c.key)}
              >
                {c.label}
                {c.items.length > 0 && (
                  <span className="pgallery__tab-count">
                    {String(c.items.length).padStart(2, '0')}
                  </span>
                )}
                <span className="pgallery__tab-rule" aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <div
          key={active}
          className="pgallery__stage is-enter"
          id={`pgallery-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
        >
          {feature ? (
            <button
              type="button"
              className="pgallery__feature"
              onClick={() => setOpen(0)}
              aria-label={`Open ${cleanTitle(feature.title)}`}
            >
              <span className="pgallery__roomtag" aria-hidden="true">
                <span className="pgallery__roomtag-dot" />
                Room {roomNum} — {activeCat.label}
              </span>
              <Frame item={feature} eager />
              <span className="pgallery__tint" aria-hidden="true" />
              <span className="pgallery__cap">
                <span className="pgallery__cap-title">{cleanTitle(feature.title)}</span>
                <span className="pgallery__cap-tag">Feature · {activeCat.label}</span>
              </span>
            </button>
          ) : (
            <div className="pgallery__empty">Library coming soon.</div>
          )}

          {support.length > 0 && (
            <div className="pgallery__support">
              {support.map((it, i) => (
                <button
                  type="button"
                  key={it.id}
                  className="pgallery__cell"
                  onClick={() => setOpen(i + 1)}
                  aria-label={`Open ${cleanTitle(it.title)}`}
                >
                  <Frame item={it} />
                  <span className="pgallery__tint" aria-hidden="true" />
                  <span className="pgallery__cap">
                    <span className="pgallery__cap-title">{cleanTitle(it.title)}</span>
                    <span className="pgallery__cap-tag">{activeCat.label}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {open !== null && items.length > 0 && (
        <Lightbox
          items={items}
          index={open}
          onClose={() => setOpen(null)}
          onIndex={(i) => setOpen(i)}
        />
      )}
    </section>
  )
}

function Frame({ item, eager = false }: { item: MediaItem; eager?: boolean }) {
  if (item.mediaType === 'video' && item.videoSrc) {
    return (
      <video
        src={item.videoSrc}
        poster={item.poster || undefined}
        muted
        loop
        autoPlay
        playsInline
        preload={eager ? 'auto' : 'metadata'}
      />
    )
  }
  return (
    <img
      src={item.src}
      alt={item.alt || item.title}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
    />
  )
}
