import { PHOTOS, srcset } from '../a1Data'

// Pick 3 distinct featured shots for the editorial "magazine spread" layout.
const PICKS = ['brick-colonial-jet-black-wide', 'estate-cobblestone-apron', 'coastal-mansion-finished']

export function A1FeaturedWork() {
  const [lead, ...side] = PICKS.map((slug) => PHOTOS.find((p) => p.slug === slug)!).filter(Boolean)
  if (!lead) return null
  const ls = srcset(lead.slug)

  return (
    <section className="a1-section a1-featured" id="featured">
      <div className="a1-container a1-container--wide">
        <header className="a1-section__head">
          <div className="a1-section__head-title a1-reveal">
            <span className="a1-eyebrow">03 — Featured Work</span>
            <h2 className="a1-h2">
              Recent driveways. <em>Real properties.</em>
            </h2>
          </div>
          <p className="a1-section__head-meta a1-lede a1-reveal">
            A small sample of recent A-1 jobs. Every photo here is one of our finished surfaces — branded caution tape included.
          </p>
        </header>

        <div className="a1-featured__stage a1-reveal">
          <a className="a1-featured__lead" href="#work" aria-label="See more work">
            <picture>
              <source type="image/webp" srcSet={`${ls.webp1280} 1280w, ${ls.webp1920} 1920w`} sizes="(max-width: 880px) 100vw, 60vw" />
              <img src={ls.jpg1920} alt={lead.alt} loading="lazy" decoding="async" />
            </picture>
            <div className="a1-featured__caption">
              <div>
                <div className="a1-featured__caption-meta">Featured · Premium Home</div>
                <div className="a1-featured__caption-title">Fresh sealcoat — driveway restored</div>
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
                    <img src={s.jpg1920} alt={p.alt} loading="lazy" decoding="async" />
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
