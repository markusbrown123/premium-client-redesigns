import { useMemo, useState } from 'react'
import type { MediaItem } from '../../../data/media-types'
import type { AssetCard, GalleryGroup, GalleryTab } from '../deliverablesData'
import { Lightbox } from '../../../components/Lightbox'

type Props = {
  master?: MediaItem
  secondary?: MediaItem
  cards: AssetCard[]
  tabs: GalleryTab[]
}

/**
 * Tabbed Campaign Asset System gallery. Every card is an honestly-labelled
 * crop of one of the two real master visuals — that IS the brand promise.
 * Clicking any card opens the lightbox for a closer look.
 */
export function AssetMatrix({ master, secondary, cards, tabs }: Props) {
  const [active, setActive] = useState<GalleryGroup | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const primarySrc =
    master?.poster || (master?.mediaType === 'image' ? master.src : undefined)
  const secondarySrc =
    secondary?.poster ||
    (secondary?.mediaType === 'image' ? secondary.src : undefined) ||
    primarySrc

  const filtered = useMemo(
    () => (active === 'all' ? cards : cards.filter((c) => c.group === active)),
    [active, cards],
  )

  const lightboxItems: MediaItem[] = useMemo(
    () =>
      filtered
        .map((c, i) => {
          const base = c.source === 'b' ? secondary : master
          if (!base) return null
          return {
            ...base,
            id: `${base.id}-crop-${i}-${c.label}`,
            title: `${c.label} · ${c.ratio}`,
            alt: `${c.label} crop · ${c.channel}`,
            category: `${c.channel} · ${c.note}`,
          } satisfies MediaItem
        })
        .filter((x): x is MediaItem => !!x),
    [filtered, master, secondary],
  )

  const tabCount = (id: GalleryGroup | 'all') =>
    id === 'all' ? cards.length : cards.filter((c) => c.group === id).length

  return (
    <section className="d-matrix" id="gallery">
      <div className="container d-matrix__head reveal">
        <span className="eyebrow">02 — Campaign asset system</span>
        <h2 className="h-lg">
          Every channel. Every ratio. <em>Every region.</em>
        </h2>
        <p className="lede d-matrix__lede">
          One source, transformed into the system a real launch needs — composed by humans,
          accelerated by pipeline. Standardised so nothing is forgotten on launch day, and the same
          matrix scales from a single country rollout to twelve.
        </p>
      </div>

      <div className="container d-matrix__shell">
        <div className="d-matrix__tabs" role="tablist" aria-label="Campaign asset filter">
          <button
            type="button"
            role="tab"
            aria-selected={active === 'all'}
            className={`d-matrix__tab${active === 'all' ? ' is-on' : ''}`}
            onClick={() => setActive('all')}
          >
            <span className="d-matrix__tabLabel">All</span>
            <span className="d-matrix__tabCount">{tabCount('all')}</span>
          </button>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              className={`d-matrix__tab${active === t.id ? ' is-on' : ''}`}
              onClick={() => setActive(t.id)}
              title={t.hint}
            >
              <span className="d-matrix__tabLabel">{t.label}</span>
              <span className="d-matrix__tabCount">{tabCount(t.id)}</span>
            </button>
          ))}
        </div>

        <ol className="d-matrix__grid" key={active}>
          {filtered.map((c, i) => {
            const ratio = c.ratio.replace(':', ' / ')
            const src = c.source === 'b' ? secondarySrc : primarySrc
            const sourceTag = c.source === 'b' ? 'Master · 02' : 'Master · 01'
            return (
              <li
                className="d-matcell reveal"
                key={`${c.label}-${i}`}
                style={{
                  transitionDelay: `${(i % 6) * 0.05}s`,
                }}
              >
                <button
                  type="button"
                  className="d-matcell__media"
                  style={{ aspectRatio: ratio }}
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Open ${c.label} crop, ${c.ratio}`}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={`${c.label} variant`}
                      style={{ objectPosition: c.focal || '50% 50%' }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="d-matcell__empty" />
                  )}
                  <span className="d-matcell__source" aria-hidden="true">{sourceTag}</span>
                  <span className="d-matcell__open">
                    Open crop
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                      <path
                        d="M2 5h6M8 5L5.5 2.5M8 5L5.5 7.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </span>
                </button>
                <div className="d-matcell__body">
                  <div className="d-matcell__top">
                    <span className="d-matcell__ratio">{c.ratio}</span>
                    <span className="d-matcell__ch">{c.channel}</span>
                  </div>
                  <h3 className="d-matcell__title">{c.label}</h3>
                  <p className="d-matcell__note">{c.note}</p>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="d-matrix__legend reveal">
          <div className="d-matrix__legendCell">
            <span className="d-matrix__legendStat">1</span>
            <span className="d-matrix__legendLabel">Master visual</span>
          </div>
          <div className="d-matrix__legendArrow">→</div>
          <div className="d-matrix__legendCell">
            <span className="d-matrix__legendStat">32</span>
            <span className="d-matrix__legendLabel">Standardised ratios</span>
          </div>
          <div className="d-matrix__legendArrow">→</div>
          <div className="d-matrix__legendCell">
            <span className="d-matrix__legendStat">11</span>
            <span className="d-matrix__legendLabel">Regions, native copy</span>
          </div>
          <div className="d-matrix__legendArrow">→</div>
          <div className="d-matrix__legendCell">
            <span className="d-matrix__legendStat">1 kit</span>
            <span className="d-matrix__legendLabel">Delivered to your DAM</span>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && lightboxItems.length > 0 ? (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndex={setLightboxIndex}
        />
      ) : null}
    </section>
  )
}
