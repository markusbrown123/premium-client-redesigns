import { PHOTOS, srcset } from '../a1Data'

const RES_SLUG = 'gray-colonial-curved-drive'
const COM_SLUG = 'trailer-truck-at-estate'

export function A1Split() {
  const res = PHOTOS.find((p) => p.slug === RES_SLUG)!
  const com = PHOTOS.find((p) => p.slug === COM_SLUG)!
  const rs = srcset(res.slug)
  const cs = srcset(com.slug)

  return (
    <section className="a1-section a1-split" aria-label="Residential and commercial asphalt">
      <div className="a1-container">
        <header className="a1-section__head">
          <div className="a1-section__head-title a1-reveal">
            <span className="a1-eyebrow">07 — Who we work for</span>
            <h2 className="a1-h2">Residential <em>and</em> commercial.</h2>
          </div>
          <p className="a1-section__head-meta a1-lede a1-reveal">
            Premium homes and businesses both depend on the same fundamentals: prep, hand-cut edges, clean cure.
          </p>
        </header>
        <div className="a1-split__grid">
          <article className="a1-split__card a1-reveal">
            <picture>
              <source type="image/webp" srcSet={`${rs.webp1280} 1280w, ${rs.webp1920} 1920w`} sizes="(max-width: 880px) 100vw, 50vw" />
              <img src={rs.jpg1920} alt={res.alt} loading="lazy" decoding="async" />
            </picture>
            <div className="a1-split__content">
              <h3 className="a1-split__title">Residential</h3>
              <p className="a1-split__body">
                The driveway is the first thing your guests see. We sealcoat, crack-fill and resurface premium home driveways with the same crew, every time.
              </p>
              <ul className="a1-split__bullets">
                <li>Hand-cut edges along walks &amp; pavers</li>
                <li>Branded caution tape protects the cure</li>
                <li>Property left cleaner than we found it</li>
              </ul>
            </div>
          </article>

          <article className="a1-split__card a1-reveal a1-reveal--right">
            <picture>
              <source type="image/webp" srcSet={`${cs.webp1280} 1280w, ${cs.webp1920} 1920w`} sizes="(max-width: 880px) 100vw, 50vw" />
              <img src={cs.jpg1920} alt={com.alt} loading="lazy" decoding="async" />
            </picture>
            <div className="a1-split__content">
              <h3 className="a1-split__title">Commercial</h3>
              <p className="a1-split__body">
                Parking lots, multi-family properties and commercial buildings. We schedule around your operation so the lot is back in service when your customers arrive.
              </p>
              <ul className="a1-split__bullets">
                <li>Sealcoat · crack fill · line striping · patching</li>
                <li>ADA-spec accessible stalls</li>
                <li>Off-hours scheduling available</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
