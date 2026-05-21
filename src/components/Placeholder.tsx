import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type Tone = 'graphite' | 'sand' | 'plum' | 'forest' | 'noir' | 'ember'

const palettes: Record<Tone, [string, string, string]> = {
  graphite: ['#1c1c1c', '#2b2b2b', '#3d3d3d'],
  sand: ['#3a3326', '#5b4d36', '#7a684a'],
  plum: ['#1f1722', '#36213d', '#4c2a55'],
  forest: ['#11201a', '#1c3327', '#2a4836'],
  noir: ['#0e0e0e', '#1a1a1a', '#262626'],
  ember: ['#2a1410', '#3e1a14', '#5a2218'],
}

type Props = {
  tone?: Tone
  label?: string
  ratio?: string
  caption?: string
  index?: string
  className?: string
  style?: CSSProperties
  // src/localPath are interchangeable — `localPath` wins when both are present.
  src?: string
  localPath?: string
  videoSrc?: string
  poster?: string
  alt?: string
  eager?: boolean
  priority?: boolean
  cover?: boolean
}

/**
 * MediaFrame — render an <img> when a usable image source exists, a <video>
 * when a usable video source exists, or a styled gradient placeholder only
 * as a last resort. Resets the failed state when the source changes.
 */
export function Placeholder({
  tone = 'graphite',
  label = 'Image',
  ratio = '16 / 10',
  caption,
  index,
  className = '',
  style,
  src,
  localPath,
  videoSrc,
  poster,
  alt,
  eager = false,
  priority = false,
  cover = true,
}: Props) {
  const resolvedSrc = localPath || src
  const [a, b, c] = palettes[tone]
  const bg = `radial-gradient(120% 80% at 20% 10%, ${c} 0%, ${b} 38%, ${a} 100%)`
  const [failed, setFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()

  // Reset failure flag when source changes.
  useEffect(() => {
    setFailed(false)
  }, [resolvedSrc, videoSrc])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (reduced) {
      v.pause()
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) v.play().catch(() => {})
          else v.pause()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced, videoSrc])

  const wantsMedia = !!videoSrc || !!resolvedSrc
  const hasVideo = !!videoSrc && !failed
  const hasImage = !!resolvedSrc && !failed
  const hasMedia = hasVideo || hasImage
  const fit: CSSProperties = cover ? { objectFit: 'cover' } : { objectFit: 'contain' }

  // When media was requested but failed, render a quiet recoverable surface
  // instead of the loud gradient placeholder so production never shows
  // gradient cards while real media exists elsewhere.
  const showPlaceholderArt = !wantsMedia
  const showFallbackTint = wantsMedia && !hasMedia

  // Use a poster (or the image itself) as a background so the frame never
  // appears as a black void while the video is still buffering.
  const bgImage = hasVideo && poster ? `url(${JSON.stringify(poster)})` : ''
  const baseBg = showPlaceholderArt
    ? bg
    : bgImage
      ? `${bgImage} center/cover no-repeat, #0e0e0e`
      : '#0e0e0e'

  return (
    <figure
      className={`placeholder ${hasMedia ? 'placeholder--media' : ''} ${showFallbackTint ? 'placeholder--fallback' : ''} ${className}`}
      style={{
        aspectRatio: ratio,
        background: baseBg,
        ...style,
      }}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          className="placeholder__video"
          src={videoSrc}
          poster={poster || undefined}
          muted
          playsInline
          loop
          autoPlay={!reduced}
          preload={priority || eager ? 'auto' : 'metadata'}
          aria-label={alt || label}
          onError={() => setFailed(true)}
          style={fit}
        />
      ) : hasImage ? (
        <img
          className="placeholder__img"
          src={resolvedSrc}
          alt={alt || label}
          loading={priority || eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          style={fit}
        />
      ) : showPlaceholderArt ? (
        <div className="placeholder__grid" aria-hidden="true" />
      ) : null}

      {showPlaceholderArt && (
        <div className="placeholder__meta">
          {index && <span className="placeholder__index">{index}</span>}
          <span className="placeholder__label">{label}</span>
        </div>
      )}
      {caption && <figcaption className="placeholder__cap">{caption}</figcaption>}
    </figure>
  )
}

// Re-export under the conceptually clearer name without breaking imports.
export { Placeholder as MediaFrame }
