import { PHOTOS, srcset, FEATURED_PICKS } from '../a1Data'

export function A1FeaturedWork() {
  const lead = PHOTOS.find((p) => p.slug === FEATURED_PICKS.lead)
  const side = FEATURED_PICKS.tiles
    .map((slug) => PHOTOS.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  if (!lead) return null
  const ls = srcset(lead.slug)

  return (
    <section className="a1-section a1-featured" id="featured">
      <div className="a1-container a1-container--media">
        <header className="a1-section__head">
          <div className="a1-section__head-title a1-reveal">
            <span className="a1-eyebrow">03 — Featured Work</span>
            <h2 className="a1-h2">
              Premium driveways. <em>Clean finish.</em>
            </h2>
          </div>
          <p className="a1-section__head-meta a1-lede a1-reveal">
            A look at the standard we hold every residential driveway to — smooth jet-black finish, clean edges, premium curb appeal.
          </p>
        </header>

        <div className="a1-featured__stage a1-reveal">
          <a className="a1-featured__lead" href="#work" aria-label="See more work">
            <picture>
              <source type="image/webp" srcSet={`${ls.webp1280} 1280w, ${ls.webp1920} 1920w`} sizes="(max-width: 880px) 100vw, 60vw" />
              <img
                src={ls.jpg1920}
                alt={lead.alt}
                loading="lazy"
                decoding="async"
                style={lead.focal?.wide ? { objectPosition: lead.focal.wide } : undefined}
              />
            </picture>
            <div className="a1-featured__caption">
              <div>
                <div className="a1-featured__caption-meta">Featured · Premium Home</div>
                <div className="a1-featured__caption-title">Premium residential finish</div>
              </div>
            </div>
          </a>
          <div className="a1-featured__side">
            {side.map((p) => {
              const s = srcset(p.slug)
              return (
                <a className="a1-featured__tile" href="#work" key={p.slug} aria-label={p.alt}>
                  <picture>
                    <source type="image/webp" srcSet={`${s.webp640} 640w, ${s.webp1280} 1280w`} sizes="(max-width: 880px) 100vw, 30vw" />
                    <img
                      src={s.jpg1920}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                      style={p.focal?.card ? { objectPosition: p.focal.card } : undefined}
                    />
                  </picture>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
