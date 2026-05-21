import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'
import type { MediaItem } from '../../../data/media-types'

type Variant = {
  label: string
  ratio: string
  channel: string
  /** object-position for the master crop inside the tile */
  focal?: string
}

type Props = {
  master?: MediaItem
  poster?: string
  variants: Variant[]
}

const DEFAULT_VARIANTS: Variant[] = [
  { label: 'Social',    ratio: '1:1',  channel: 'Instagram feed',  focal: '50% 40%' },
  { label: 'Story',     ratio: '9:16', channel: 'Stories · Reels', focal: '50% 50%' },
  { label: 'Display',   ratio: '16:9', channel: 'YouTube · CTV',   focal: '55% 50%' },
  { label: 'Feed tall', ratio: '4:5',  channel: 'Paid social',     focal: '45% 50%' },
  { label: 'Email',     ratio: '3:1',  channel: 'CRM header',      focal: '50% 50%' },
  { label: 'Ecomm',     ratio: '4:5',  channel: 'PDP tile',        focal: '55% 55%' },
]

export function OneToMany({ master, poster, variants = DEFAULT_VARIANTS }: Props) {
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

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

  const isVideo = master?.mediaType === 'video' && !!master.videoSrc && !failed
  const fallbackPoster = poster || master?.poster || (master?.mediaType === 'image' ? master.src : undefined)
  const tileSrc = fallbackPoster || (master?.mediaType === 'image' ? master.src : undefined)

  return (
    <section className="d-onemany" id="system" ref={sectionRef}>
      <div className="container d-onemany__head reveal">
        <span className="eyebrow">01 — How it works</span>
        <h2 className="d-onemany__statement">
          One picture is worth a thousand words.
          <br />
          <em>We turn that picture into a thousand assets.</em>
        </h2>
        <p className="lede d-onemany__lede">
          A single hero shot, film or AI-composed image is the source of truth. From it we generate
          every channel crop, every ratio, every regional variant — composed by humans, accelerated
          by pipeline.
        </p>
      </div>

      <div className="container d-onemany__stage">
        <div
          className="d-onemany__source reveal"
          data-scroll-fade
          data-parallax
          data-parallax-speed="0.35"
        >
          <span className="d-onemany__sourceTag">
            <span className="d-onemany__sourceDot" />
            Master visual · source of truth
          </span>
          <div className="d-onemany__sourceFrame">
            {isVideo ? (
              <video
                ref={videoRef}
                className="d-onemany__sourceMedia"
                src={master?.videoSrc}
                poster={fallbackPoster}
                muted
                loop
                playsInline
                preload="metadata"
                onError={() => setFailed(true)}
              />
            ) : fallbackPoster ? (
              <img
                className="d-onemany__sourceMedia"
                src={fallbackPoster}
                alt={master?.alt || master?.title || 'Master visual'}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="d-onemany__sourceMedia d-onemany__sourceMedia--empty" />
            )}
            <div className="d-onemany__sourceGrid" aria-hidden="true" />
            <div className="d-onemany__sourceBadge" aria-hidden="true">
              <span className="d-onemany__sourceBadgeNum">01</span>
              <span className="d-onemany__sourceBadgeLabel">Master</span>
            </div>
          </div>
          <div className="d-onemany__sourceFoot">
            <span>1 source</span>
            <span className="d-onemany__sourceFootArrow">→</span>
            <span>{variants.length}+ deliverables</span>
          </div>
        </div>

        <svg className="d-onemany__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="d-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.0" />
              <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {variants.map((_, i) => {
            const t = variants.length === 1 ? 0.5 : i / (variants.length - 1)
            const y = 10 + t * 80
            return (
              <path
                key={i}
                d={`M 0 50 C 30 50, 50 ${y}, 100 ${y}`}
                fill="none"
                stroke="url(#d-line)"
                strokeWidth="0.35"
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        <ol className="d-onemany__fan">
          {variants.map((v, i) => {
            const ratio = v.ratio.replace(':', ' / ')
            return (
              <li
                className="d-onemany__tile reveal"
                key={v.label + i}
                style={{ transitionDelay: `${0.08 + i * 0.06}s` }}
                data-parallax
                data-parallax-speed={(0.25 + (i % 3) * 0.15).toFixed(2)}
              >
                <div className="d-onemany__tileFrame" style={{ aspectRatio: ratio }}>
                  {tileSrc ? (
                    <img
                      src={tileSrc}
                      alt={`${v.label} crop`}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: v.focal || '50% 50%' }}
                    />
                  ) : (
                    <div className="d-onemany__tileEmpty" />
                  )}
                  <span className="d-onemany__tileBadge">{v.ratio}</span>
                  <span className="d-onemany__tileNum">0{i + 2}</span>
                </div>
                <div className="d-onemany__tileMeta">
                  <span className="d-onemany__tileLabel">{v.label}</span>
                  <span className="d-onemany__tileChannel">{v.channel}</span>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
