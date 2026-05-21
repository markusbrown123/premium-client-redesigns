import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'
import type { MediaItem } from '../../../data/media-types'

type Cta = { label: string; href: string; variant?: 'primary' | 'ghost' }

type Props = {
  eyebrow: string
  /** Big editorial mono statement, broken into two lines. */
  statementLead: string
  statementTail: string
  /** Single sentence describing the studio. */
  intro: string
  ctas: Cta[]
  /** Real Deliverables media. Index 0 fills the left panel, index 1 the right. */
  rotation: MediaItem[]
}

export function DeliverablesHero({
  eyebrow,
  statementLead,
  statementTail,
  intro,
  ctas,
  rotation,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const [idx, setIdx] = useState(0)
  // Split the pool into videos and stills. The left panel rotates through the
  // motion masters, the right panel through the still masters — so the two
  // sides are always content-different (campaign film | brand identity) even
  // when the inventory is small.
  const videos = rotation.filter((m) => m.mediaType === 'video' && !!m.videoSrc)
  // Prefer brand / OG-style stills first on the right panel so the split hero
  // feels like "campaign film | brand identity" rather than two sea panels.
  const stills = rotation
    .filter((m) => m.mediaType !== 'video')
    .slice()
    .sort((a, b) => {
      const aOg = /og|brand|wordmark|logo/i.test((a.alt || '') + (a.title || '')) ? -1 : 0
      const bOg = /og|brand|wordmark|logo/i.test((b.alt || '') + (b.title || '')) ? -1 : 0
      return aOg - bOg
    })
  const leftPool = videos.length ? videos : rotation
  const rightPool = stills.length ? stills : rotation

  useEffect(() => {
    if (reduced) return
    const longest = Math.max(leftPool.length, rightPool.length)
    if (longest < 2) return
    const id = window.setInterval(() => setIdx((i) => (i + 1) % longest), 6800)
    return () => window.clearInterval(id)
  }, [reduced, leftPool.length, rightPool.length])

  const front = leftPool[idx % Math.max(leftPool.length, 1)]
  const back = rightPool[idx % Math.max(rightPool.length, 1)]

  return (
    <section className="d-hero" id="top">
      <div className="container d-hero__inner">
        <header className="d-hero__head">
          <span className="eyebrow d-hero__eyebrow">{eyebrow}</span>
        </header>

        <div className="d-hero__split" data-parallax data-parallax-speed="0.3">
          <Panel item={front} side="left" reduced={reduced} />
          <Panel item={back} side="right" reduced={reduced} />
          <div className="d-hero__splitRule" aria-hidden="true" />
        </div>

        <div className="d-hero__statement reveal">
          <h1 className="d-hero__statementLine">
            <span>{statementLead}</span>
          </h1>
          <h1 className="d-hero__statementLine d-hero__statementLine--em">
            <em>{statementTail}</em>
          </h1>
        </div>

        <div className="d-hero__below">
          <p className="d-hero__intro reveal">{intro}</p>
          <div className="d-hero__actions reveal reveal-delay-1">
            {ctas.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className={`btn d-btn ${c.variant === 'ghost' ? 'btn--ghost d-btn--ghost' : 'btn--primary d-btn--primary'}`}
              >
                <span className="d-btn__label">{c.label}</span>
                <span className="d-btn__arrow" aria-hidden="true"><ArrowRight /></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Panel({
  item,
  side,
  reduced,
}: {
  item?: MediaItem
  side: 'left' | 'right'
  reduced: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [item?.id])

  useEffect(() => {
    const v = videoRef.current
    if (!v || reduced) return
    v.play().catch(() => {})
  }, [reduced, item?.id])

  const isVideo = item?.mediaType === 'video' && !!item.videoSrc && !failed
  const poster = item?.poster || (item?.mediaType === 'image' ? item.src : undefined)
  const imgSrc = item?.mediaType === 'image' ? item.src : poster

  return (
    <figure className={`d-hero__panel d-hero__panel--${side}`}>
      <div className="d-hero__panelMedia">
        {isVideo ? (
          <video
            key={item?.id}
            ref={videoRef}
            className="d-hero__media d-hero__media--fade"
            src={item?.videoSrc}
            poster={poster}
            autoPlay={!reduced}
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
          />
        ) : imgSrc ? (
          <img
            key={item?.id}
            className="d-hero__media d-hero__media--fade"
            src={imgSrc}
            alt={item?.alt || item?.title || 'Campaign visual'}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="d-hero__mediaFallback" />
        )}
      </div>
      <figcaption className="d-hero__panelMeta" aria-hidden="true">
        <span className="d-hero__panelTag">
          {side === 'left' ? '01 · Source' : '02 · System'}
        </span>
        <span className="d-hero__panelType">
          {item?.mediaType === 'video' ? 'Master · Video' : 'Master · Still'}
        </span>
      </figcaption>
    </figure>
  )
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
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
