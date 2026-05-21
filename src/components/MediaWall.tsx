import { useMemo, useState } from 'react'
import { Placeholder } from './Placeholder'
import { Lightbox } from './Lightbox'
import type { MediaItem } from '../data/media-types'

type Props = {
  index: string
  eyebrow: string
  title: React.ReactNode
  items: MediaItem[]
}

// Bento span pattern — chosen so a 12-col grid with `grid-auto-flow: dense`
// fills holes naturally and varies card sizes for editorial rhythm. All
// aspect ratios are landscape because the available large images in the
// real libraries (Platinum especially) are uniformly landscape — portrait
// ratios on landscape source images letterbox visibly at small sizes.
const SPAN_PATTERN: Array<{ col: number; row: number; ratio: string }> = [
  { col: 7, row: 2, ratio: '16 / 10' },
  { col: 5, row: 1, ratio: '16 / 9' },
  { col: 5, row: 1, ratio: '4 / 3' },
  { col: 6, row: 1, ratio: '16 / 9' },
  { col: 6, row: 1, ratio: '16 / 10' },
  { col: 4, row: 1, ratio: '4 / 3' },
  { col: 4, row: 1, ratio: '4 / 3' },
  { col: 12, row: 1, ratio: '21 / 9' },
]

function fileBase(u?: string): string {
  if (!u) return ''
  return (u.split('?')[0].split('#')[0].split('/').pop() || '').toLowerCase()
}

export function MediaWall({ index, eyebrow, title, items }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  // Dedupe by src + videoSrc + basename + title-with-dims so CDN-variant
  // duplicates (same image served from multiple Wix transform URLs) are
  // collapsed. Without the title+dims key the wall repeats the same shot.
  const deduped = useMemo(() => {
    const seen = new Set<string>()
    const out: MediaItem[] = []
    for (const it of items) {
      const titleKey =
        it.title && it.width && it.height
          ? `t:${it.title.toLowerCase()}|${it.width}x${it.height}`
          : ''
      const keys = [
        it.src,
        it.videoSrc || '',
        fileBase(it.src),
        fileBase(it.videoSrc),
        titleKey,
      ].filter(Boolean)
      if (keys.some((k) => seen.has(k))) continue
      keys.forEach((k) => seen.add(k))
      out.push(it)
    }
    return out
  }, [items])

  if (!deduped.length) return null

  return (
    <section className="mwall">
      <div className="container mwall__head reveal">
        <span className="hgallery__index">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="h-lg">{title}</h2>
      </div>
      <div className="mwall__shell">
        <div className="mwall__bento">
          {deduped.map((it, i) => {
            const span = SPAN_PATTERN[i % SPAN_PATTERN.length]
            // Alternate drift direction so adjacent cells move against each other.
            const speed = (i % 3 === 0 ? -0.45 : i % 3 === 1 ? 0.35 : -0.25).toFixed(2)
            return (
              <button
                type="button"
                key={`${it.id}-${i}`}
                className="mwall__cell"
                style={{
                  gridColumn: `span ${span.col}`,
                  gridRow: `span ${span.row}`,
                }}
                onClick={() => setOpen(i)}
                aria-label={`Open ${it.title}`}
                data-parallax
                data-parallax-speed={speed}
              >
                <Placeholder
                  src={it.mediaType === 'image' ? it.src : undefined}
                  videoSrc={it.mediaType === 'video' ? it.videoSrc : undefined}
                  poster={it.poster}
                  alt={it.alt || it.title}
                  ratio={span.ratio}
                  label={it.title}
                />
              </button>
            )
          })}
        </div>
      </div>
      {open !== null && (
        <Lightbox
          items={deduped}
          index={open}
          onClose={() => setOpen(null)}
          onIndex={(i) => setOpen(i)}
        />
      )}
    </section>
  )
}
