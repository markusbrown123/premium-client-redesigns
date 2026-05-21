import { useEffect } from 'react'
import type { MediaItem } from '../data/media-types'

const CLIENT_LABEL: Record<string, string> = {
  platinum: 'Platinum FMD',
  'steve-giralt': 'Steve Giralt',
  deliverables: 'The Deliverables',
}

function cleanTitle(t: string): string {
  if (!t) return 'Untitled'
  if (/^[a-f0-9]{4,}/i.test(t.replace(/[\s_-]/g, ''))) return 'Untitled frame'
  if (/\.(jpe?g|png|webp|gif|mp4|webm|svg)$/i.test(t)) return t.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
  return t
}

type Props = {
  items: MediaItem[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
}

export function Lightbox({ items, index, onClose, onIndex }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [index, items.length, onClose, onIndex])

  if (!items.length) return null
  const item = items[index]
  if (!item) return null

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      {items.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Previous"
            onClick={() => onIndex((index - 1 + items.length) % items.length)}
          >
            ←
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label="Next"
            onClick={() => onIndex((index + 1) % items.length)}
          >
            →
          </button>
        </>
      )}
      <div className="lightbox__stage" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div className="lightbox__media">
          {item.mediaType === 'video' && item.videoSrc ? (
            <video
              src={item.videoSrc}
              poster={item.poster || undefined}
              controls
              autoPlay
              playsInline
              loop
              onError={() => {
                // Skip broken media and auto-advance.
                if (items.length > 1) onIndex((index + 1) % items.length)
                else onClose()
              }}
            />
          ) : (
            <img
              src={item.src}
              alt={item.alt || item.title}
              referrerPolicy="no-referrer"
              onError={() => {
                if (items.length > 1) onIndex((index + 1) % items.length)
                else onClose()
              }}
              style={
                item.width && item.width < 1100
                  ? { maxWidth: `min(80vw, ${Math.round(item.width * 1.35)}px)` }
                  : undefined
              }
            />
          )}
        </div>
        <div className="lightbox__caption">
          <span className="lightbox__client">{CLIENT_LABEL[item.client] || item.client}</span>
          <strong>{cleanTitle(item.title)}</strong>
          <span>{item.category}</span>
          {item.width && item.height ? (
            <span>
              {item.width}×{item.height}
            </span>
          ) : null}
          <span>
            {index + 1} / {items.length}
          </span>
        </div>
      </div>
    </div>
  )
}
