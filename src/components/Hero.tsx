import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import type { MediaItem } from '../data/media-types'

/** Default hold for image slides. */
const ROTATION_MS = 7000
/** Videos hold longer so the loop feels cinematic, not jumpy. */
const VIDEO_ROTATION_MS = 11000

export type HeroCta = { label: string; href: string; variant?: 'primary' | 'ghost' }

export type HeroChapter = { num: string; label: string }

type Props = {
  eyebrow: string
  location?: string
  title: ReactNode
  lede: ReactNode
  ctas: HeroCta[]
  /** Cinematic background rotation pulled from this site's media only. */
  rotation: MediaItem[]
  /** Caption beneath the hero (now-playing-style metadata). */
  showNowPlaying?: boolean
  /** Optional kinetic overlay rendered above the media (HUD readouts etc). */
  overlay?: ReactNode
  /** Optional kinetic strip placed inside the hero (annotations / pillars). */
  pillars?: ReactNode
  /** Optional CSS class added to the section for site-specific styling hooks. */
  variant?: string
  /** Enable mechanical horizontal pan on the media stage as the user scrolls. */
  horizontalPan?: boolean
  /** Track the pointer with a CSS `--mx/--my` light variable on the stage. */
  pointerLight?: boolean
  /** Slide transition style. `slide` adds lateral drift; default `fade`. */
  transitionStyle?: 'fade' | 'slide'
  /** Progress bar style. `timeline` shows numbered chapter labels. */
  progressStyle?: 'dots' | 'timeline'
  /** Chapter labels for timeline progress (one per slide; trailing labels are ignored if too long). */
  chapters?: HeroChapter[]
  /** Small caption above the title — like a print masthead. */
  masthead?: string
}

export function Hero({
  eyebrow,
  location,
  title,
  lede,
  ctas,
  rotation,
  showNowPlaying = true,
  overlay,
  pillars,
  variant,
  horizontalPan = false,
  pointerLight = false,
  transitionStyle = 'fade',
  progressStyle = 'dots',
  chapters,
  masthead,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const wordsRef = useRef<HTMLHeadingElement>(null)

  /* Cap at 4 unique slides — premium portfolios reward curation, and
     pulling further into the manifest just resurfaces CDN duplicates. */
  const initial = useMemo(() => rotation.slice(0, 4), [rotation])
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const slides = useMemo(() => initial.filter((s) => !failed.has(s.id)), [initial, failed])

  const [index, setIndex] = useState(0)
  // Track which slide we just left + direction so CSS can drive a directional
  // lateral slide animation (only meaningful when transitionStyle='slide').
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false)

  function goTo(next: number) {
    setPrevIndex((p) => (p === index ? p : index))
    setDirection(next > index || (index === slides.length - 1 && next === 0) ? 1 : -1)
    setIndex(next)
  }

  useEffect(() => {
    if (slides.length === 0) return
    if (index >= slides.length) setIndex(0)
  }, [slides.length, index])

  useEffect(() => {
    if (slides.length <= 1 || reduced || paused) return
    const current = slides[index]
    const hold = current?.mediaType === 'video' ? VIDEO_ROTATION_MS : ROTATION_MS
    const t = window.setTimeout(() => {
      const nextIdx = (index + 1) % slides.length
      setPrevIndex(index)
      setDirection(1)
      setIndex(nextIdx)
    }, hold)
    return () => window.clearTimeout(t)
  }, [slides, index, reduced, paused])

  // Initial entrance for the headline — cascade with a slight blur lift
  useEffect(() => {
    if (reduced || !wordsRef.current) return
    const lines = wordsRef.current.querySelectorAll<HTMLElement>('.hero__line')
    lines.forEach((line, i) => {
      line.style.opacity = '0'
      line.style.transform = 'translateY(48px)'
      line.style.filter = 'blur(6px)'
      line.style.transition = `opacity 1.4s var(--ease-out) ${0.22 + i * 0.14}s, transform 1.4s var(--ease-out) ${0.22 + i * 0.14}s, filter 1.2s var(--ease-out) ${0.22 + i * 0.14}s`
      requestAnimationFrame(() => {
        line.style.opacity = '1'
        line.style.transform = 'translateY(0)'
        line.style.filter = 'blur(0px)'
      })
    })
  }, [reduced])

  // Now-playing fade-flicker between slide changes for a cinematic feel.
  const npRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const n = npRef.current
    if (!n || reduced) return
    n.style.transition = 'none'
    n.style.opacity = '0'
    n.style.transform = 'translateY(14px)'
    n.style.filter = 'blur(4px)'
    requestAnimationFrame(() => {
      n.style.transition = 'opacity 1.1s var(--ease-out), transform 1.2s var(--ease-out), filter 1s var(--ease-out)'
      n.style.opacity = '1'
      n.style.transform = 'translateY(0)'
      n.style.filter = 'blur(0px)'
    })
  }, [index, reduced])

  function next() {
    if (slides.length === 0) return
    goTo((index + 1) % slides.length)
  }
  function prev() {
    if (slides.length === 0) return
    goTo((index - 1 + slides.length) % slides.length)
  }

  function reportFailed(id: string) {
    setFailed((prev) => {
      if (prev.has(id)) return prev
      const n = new Set(prev)
      n.add(id)
      return n
    })
  }

  const current = slides[index]

  return (
    <section
      className={`hero hero--cinematic${variant ? ` hero--${variant}` : ''}`}
      id="top"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`hero__stage hero__stage--${transitionStyle}`}
        aria-hidden="true"
        data-direction={direction === 1 ? 'forward' : 'backward'}
        {...(horizontalPan
          ? { 'data-parallax': '', 'data-parallax-speed': '0', 'data-parallax-x': '0.55' }
          : {})}
        {...(pointerLight ? { 'data-pointer-light': '' } : {})}
      >
        {slides.map((s, i) => (
          <HeroSlide
            key={s.id}
            item={s}
            active={i === index}
            isPrev={i === prevIndex && i !== index}
            direction={direction}
            reduced={reduced}
            onFail={() => reportFailed(s.id)}
          />
        ))}
        <div className="hero__stage-veil" />
        {overlay}
      </div>

      <div className="container hero__inner">
        <div className="hero__topline">
          <span className="eyebrow">{eyebrow}</span>
          {location ? <span className="hero__loc">{location}</span> : null}
        </div>

        {masthead ? (
          <div className="hero__masthead reveal" aria-hidden="true">
            <span className="hero__masthead-rule" />
            <span className="hero__masthead-label">{masthead}</span>
          </div>
        ) : null}

        <h1 className="display hero__title" ref={wordsRef}>
          {Array.isArray(title)
            ? title.map((line, i) => (
                <span className="hero__line" key={i}>
                  {line}
                </span>
              ))
            : <span className="hero__line">{title}</span>}
        </h1>

        <div className="hero__foot">
          <p className="lede reveal">{lede}</p>
          <div className="hero__actions reveal reveal-delay-1">
            {ctas.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className={`btn btn--cinema ${c.variant === 'ghost' ? 'btn--ghost' : 'btn--primary'}`}
              >
                <span className="btn__label">{c.label}</span>
                {c.variant === 'ghost' ? null : (
                  <span className="btn__icon" aria-hidden="true">
                    <ArrowRight />
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>

        {pillars}

        {showNowPlaying && current && (
          <div className="hero__nowplaying" aria-live="polite" ref={npRef}>
            <div className="hero__np-meta">
              <span className="hero__np-client">{current.category}</span>
              <span className="hero__np-sep">·</span>
              <span className="hero__np-count">
                {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
            <div className="hero__np-title">{cleanHeroTitle(current.title)}</div>
          </div>
        )}

        {slides.length > 1 && (
          <div className={`hero__controls hero__controls--${progressStyle}`}>
            {progressStyle === 'timeline' ? (
              <div className="hero__timeline" role="tablist" aria-label="Hero chapters">
                {slides.map((s, i) => {
                  const chap = chapters?.[i]
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      className={`hero__tlbtn ${i === index ? 'is-active' : ''}`}
                      onClick={() => goTo(i)}
                      aria-label={`Show chapter ${i + 1}: ${chap?.label || s.title}`}
                    >
                      <span className="hero__tlnum">{chap?.num || String(i + 1).padStart(2, '0')}</span>
                      <span className="hero__tllabel">{chap?.label || cleanHeroTitle(s.title)}</span>
                      <span className="hero__tlbar" aria-hidden="true">
                        <span className="hero__tlbar-fill" />
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="hero__progress" role="tablist" aria-label="Hero slides">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    className={`hero__dot ${i === index ? 'is-active' : ''}`}
                    onClick={() => goTo(i)}
                    aria-label={`Show slide ${i + 1}: ${s.title}`}
                  >
                    <span className="hero__dot-fill" />
                  </button>
                ))}
              </div>
            )}
            <div className="hero__nav">
              <button type="button" className="hero__navbtn" onClick={prev} aria-label="Previous slide">
                <ArrowLeft />
              </button>
              <button type="button" className="hero__navbtn" onClick={next} aria-label="Next slide">
                <ArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hero__rail" aria-hidden="true">
        <span>Scroll</span>
        <span className="hero__rail-line" />
      </div>
    </section>
  )
}

function cleanHeroTitle(t: string): string {
  if (!t) return 'Selected work'
  const stripped = t.replace(/[\s_-]/g, '')
  if (/^[a-f0-9]{8,}/i.test(stripped)) return 'Selected work'
  if (/\.(jpe?g|png|webp|gif|mp4|webm|svg)$/i.test(t)) {
    const base = t.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
    return /^[a-f0-9]{8,}/i.test(base.replace(/\s/g, '')) ? 'Selected work' : base
  }
  return t
}

function HeroSlide({
  item,
  active,
  isPrev,
  direction,
  reduced,
  onFail,
}: {
  item: MediaItem
  active: boolean
  isPrev: boolean
  direction: 1 | -1
  reduced: boolean
  onFail: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (active && !reduced) {
      v.currentTime = 0
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [active, reduced])

  const isVideo = item.mediaType === 'video' && !!item.videoSrc && !failed

  function handleFail() {
    setFailed(true)
    onFail()
  }

  const stateClass = active ? 'is-active' : isPrev ? 'is-prev' : ''
  const dirClass = direction === 1 ? 'is-fwd' : 'is-bwd'

  return (
    <div
      className={`hero__slide ${stateClass} ${dirClass}`.trim()}
      aria-hidden={!active}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          className="hero__media"
          src={item.videoSrc}
          poster={item.poster || undefined}
          muted
          loop
          playsInline
          preload={active ? 'auto' : 'metadata'}
          onError={handleFail}
        />
      ) : (
        <img
          className="hero__media"
          src={item.src}
          alt={item.alt || item.title}
          loading={active ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleFail}
        />
      )}
      <div className="hero__slide-tint" aria-hidden="true" />
    </div>
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

function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M15 9H3M3 9L8.5 3.5M3 9L8.5 14.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
