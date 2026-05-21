import { useEffect, useRef, useState } from 'react'
import { Placeholder } from './Placeholder'
import { Lightbox } from './Lightbox'
import type { MediaItem } from '../data/media-types'

type Item = {
  label: string
  caption?: string
  tone?: 'graphite' | 'sand' | 'plum' | 'forest' | 'noir' | 'ember'
  ratio?: string
  media?: MediaItem
}

type Props = {
  index: string
  eyebrow: string
  title: React.ReactNode
  items: Item[]
}

export function HorizontalGallery({ index, eyebrow, title, items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)

  const visibleItems = items.filter((it) => !!it.media || it.label)
  const mediaItems = visibleItems
    .map((i) => i.media)
    .filter((m): m is MediaItem => !!m)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth
      setProgress(max > 0 ? el.scrollLeft / max : 0)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [visibleItems.length])

  function scrollByDirection(dir: -1 | 1) {
    const el = trackRef.current
    if (!el) return
    const step = el.clientWidth * 0.85
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section className="hgallery">
      <div className="container hgallery__head reveal">
        <span className="hgallery__index">{index}</span>
        <div className="hgallery__head-text">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="h-lg hgallery__title">{title}</h2>
        </div>
        <div className="hgallery__controls">
          <span className="hgallery__count">
            {visibleItems.length.toString().padStart(2, '0')} items
          </span>
          <div className="hgallery__nav">
            <button
              type="button"
              className="hgallery__navbtn"
              onClick={() => scrollByDirection(-1)}
              aria-label="Scroll gallery left"
            >
              <Arrow dir="left" />
            </button>
            <button
              type="button"
              className="hgallery__navbtn"
              onClick={() => scrollByDirection(1)}
              aria-label="Scroll gallery right"
            >
              <Arrow dir="right" />
            </button>
          </div>
        </div>
      </div>

      <div className="hgallery__viewport">
        <div className="hgallery__track" ref={trackRef}>
          {visibleItems.map((it, i) => {
            const m = it.media
            return (
              <button
                type="button"
                key={i}
                className="hgallery__cellbtn"
                onClick={() => {
                  if (m) {
                    const idx = mediaItems.indexOf(m)
                    if (idx >= 0) setOpen(idx)
                  }
                }}
                aria-label={`Open ${it.label}`}
              >
                <Placeholder
                  tone={it.tone}
                  label={m?.title || it.label}
                  alt={m?.alt || it.label}
                  ratio={it.ratio ?? '4 / 5'}
                  index={String(i + 1).padStart(2, '0')}
                  caption={it.caption || it.label}
                  src={m?.mediaType === 'image' ? m.src : undefined}
                  videoSrc={m?.mediaType === 'video' ? m.videoSrc : undefined}
                  poster={m?.poster}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className="container hgallery__bar">
        <div className="hgallery__progress" aria-hidden="true">
          <span
            className="hgallery__progress-fill"
            style={{ transform: `scaleX(${progress.toFixed(3)})` }}
          />
        </div>
        <span className="hgallery__hint">Drag · scroll · arrows</span>
      </div>

      {open !== null && (
        <Lightbox
          items={mediaItems}
          index={open}
          onClose={() => setOpen(null)}
          onIndex={(i) => setOpen(i)}
        />
      )}
    </section>
  )
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return dir === 'left' ? (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M15 9H3M3 9L8.5 3.5M3 9L8.5 14.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3 9H15M15 9L9.5 3.5M15 9L9.5 14.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
