import { useState } from 'react'
import { Placeholder } from './Placeholder'
import { Lightbox } from './Lightbox'
import type { MediaItem } from '../data/media-types'

type Project = {
  title: string
  client: string
  tag: string
  year: string
  tone?: 'graphite' | 'sand' | 'plum' | 'forest' | 'noir' | 'ember'
  ratio?: string
  span?: 'wide' | 'tall' | 'square' | 'feature'
  media?: MediaItem
}

type Props = {
  index: string
  eyebrow: string
  title: React.ReactNode
  projects: Project[]
}

export function ProjectGrid({ index, eyebrow, title, projects }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const mediaItems = projects
    .map((p) => p.media)
    .filter((m): m is MediaItem => !!m)

  return (
    <section className="pgrid">
      <div className="container">
        <header className="pgrid__head reveal">
          <span className="pgrid__index">{index}</span>
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="h-lg pgrid__title">{title}</h2>
          </div>
        </header>

        <div className="pgrid__list">
          {projects.map((p, i) => {
            const m = p.media
            return (
              <article
                key={i}
                className={`pcard pcard--${p.span ?? 'wide'} reveal`}
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              >
                <button
                  type="button"
                  className="pcard__media"
                  onClick={() => {
                    if (m) {
                      const idx = mediaItems.indexOf(m)
                      if (idx >= 0) setOpen(idx)
                    }
                  }}
                  aria-label={`Open ${p.title}`}
                >
                  <Placeholder
                    tone={p.tone}
                    label={p.title}
                    alt={m?.alt || p.title}
                    ratio={p.ratio ?? '4 / 3'}
                    index={String(i + 1).padStart(2, '0')}
                    src={m?.mediaType === 'image' ? m.src : undefined}
                    videoSrc={m?.mediaType === 'video' ? m.videoSrc : undefined}
                    poster={m?.poster}
                  />
                  <div className="pcard__overlay">
                    <span className="pcard__view">View case →</span>
                  </div>
                </button>
                <div className="pcard__meta">
                  <div>
                    <span className="pcard__client">{p.client}</span>
                    <h3 className="h-md pcard__name">{p.title}</h3>
                  </div>
                  <div className="pcard__tags">
                    <span>{p.tag}</span>
                    <span>·</span>
                    <span>{p.year}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
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
