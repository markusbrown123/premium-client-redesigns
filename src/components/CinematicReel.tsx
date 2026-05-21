import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Lightbox } from './Lightbox'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import type { MediaItem } from '../data/media-types'

export type ReelChapter = {
  /** Display number, e.g. "01". */
  num: string
  /** Category label — e.g. "Films", "Images", "AI". */
  category: string
  /** Hero line shown beside / over the media. */
  title: ReactNode
  /** Long-form caption shown as the media leaves the viewport. */
  body: string
  /** Optional client / project label. */
  client?: string
  /** Optional year tag. */
  year?: string
  /** Media to display — image or video. */
  media: MediaItem
  /** When true, render media full-bleed instead of contained. */
  bleed?: boolean
  /** Layout side for the text column. Auto-alternates if omitted. */
  side?: 'left' | 'right'
}

type Props = {
  index: string
  eyebrow: string
  title: ReactNode
  intro?: string
  chapters: ReelChapter[]
}

/**
 * Full-bleed cinematic case-study sequence. Each chapter sticks while the
 * caption scrolls past, the media drifts on a slow parallax, and the
 * category/title cross-fade as you arrive. Click-to-open in the lightbox.
 */
export function CinematicReel({ index, eyebrow, title, intro, chapters }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const mediaItems = useMemo(() => chapters.map((c) => c.media), [chapters])

  if (chapters.length === 0) return null

  return (
    <section className="reel" id="work">
      <div className="container reel__head reveal" data-scroll-fade>
        <span className="reel__index">{index}</span>
        <div className="reel__head-text">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="h-lg reel__title">{title}</h2>
          {intro ? <p className="lede reel__intro">{intro}</p> : null}
        </div>
      </div>

      <ol className="reel__list">
        {chapters.map((ch, i) => (
          <ReelChapterCard
            key={i}
            chapter={ch}
            index={i}
            onOpen={() => setOpen(i)}
          />
        ))}
      </ol>

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

function ReelChapterCard({
  chapter,
  index,
  onOpen,
}: {
  chapter: ReelChapter
  index: number
  onOpen: () => void
}) {
  const side = chapter.side ?? (index % 2 === 0 ? 'right' : 'left')
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()
  const isVideo = chapter.media.mediaType === 'video' && !!chapter.media.videoSrc

  useEffect(() => {
    const v = videoRef.current
    if (!v || reduced) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) v.play().catch(() => {})
          else v.pause()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  // Alternate parallax direction so successive chapters move against the scroll
  // rather than all sliding the same way. Magnitude is gentle — small source
  // images blow out their resolution if shifted aggressively.
  const speed = (index % 2 === 0 ? 0.35 : -0.28).toFixed(2)

  return (
    <li
      className={`reel__chapter reel__chapter--${side} ${chapter.bleed ? 'is-bleed' : ''}`}
      data-scroll-fade
    >
      <div className="reel__media-wrap" data-parallax data-parallax-speed={speed}>
        <button
          type="button"
          className="reel__media"
          onClick={onOpen}
          data-frame={`F · ${chapter.num} / ${String(index + 1).padStart(2, '0')}`}
          aria-label={`Open ${chapter.client || chapter.category} ${typeof chapter.title === 'string' ? chapter.title : ''}`}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              className="reel__video"
              src={chapter.media.videoSrc}
              poster={chapter.media.poster || undefined}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              className="reel__img"
              src={chapter.media.src}
              alt={chapter.media.alt || chapter.media.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="reel__tint" aria-hidden="true" />
          <span className="reel__open">View frame ↗</span>
        </button>
      </div>

      <div className="reel__caption">
        <div className="reel__cat">
          <span className="reel__num">{chapter.num}</span>
          <span className="reel__pipe" aria-hidden="true" />
          <span className="reel__category">{chapter.category}</span>
        </div>
        <h3 className="reel__heading">{chapter.title}</h3>
        <p className="reel__body">{chapter.body}</p>
        {(chapter.client || chapter.year) && (
          <div className="reel__meta">
            {chapter.client ? <span>{chapter.client}</span> : null}
            {chapter.client && chapter.year ? <span aria-hidden="true">·</span> : null}
            {chapter.year ? <span>{chapter.year}</span> : null}
          </div>
        )}
      </div>
    </li>
  )
}
