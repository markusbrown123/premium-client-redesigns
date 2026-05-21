import { useMemo } from 'react'
import { SiteShell } from '../../components/SiteShell'
import { Hero } from '../../components/Hero'
import { Marquee } from '../../components/Marquee'
import { CinematicReel } from '../../components/CinematicReel'
import { PlatinumGallery } from '../../components/PlatinumGallery'
import { Process } from '../../components/Process'
import { Services } from '../../components/Services'
import { ContactCTA } from '../../components/ContactCTA'
import { buildPlatinumData } from './platinumData'

export function PlatinumSite() {
  const d = useMemo(() => buildPlatinumData(), [])

  return (
    <SiteShell
      className="platinum"
      brand={d.brand}
      navLinks={d.navLinks}
      navCta={d.navCta}
      footer={d.footer}
    >
      <Hero
        eyebrow={d.hero.eyebrow}
        location={d.hero.location}
        title={d.hero.title.map((line, i) =>
          i === 1 ? (
            <span key={i}>
              AI. <em>{d.hero.italicWord}.</em>
            </span>
          ) : (
            line
          ),
        )}
        lede={d.hero.lede}
        ctas={d.hero.ctas}
        rotation={d.hero.rotation}
        transitionStyle="slide"
        progressStyle="timeline"
        chapters={d.hero.chapters}
        masthead={d.hero.masthead}
        horizontalPan
        showNowPlaying={true}
      />

      <Marquee items={d.marquee} />

      <section className="pillars" id="pillars">
        <div className="container">
          <header className="pillars__head reveal">
            <span className="eyebrow">01 — Disciplines</span>
            <h2 className="h-lg pillars__title">
              Five rooms.
              <br />
              <em>One studio.</em>
            </h2>
            <p className="lede pillars__lede">
              Image, film, AI, craft and classics — each is a discipline with its own room, its own crew and its own
              standard. They share one director, one art board and one quality bar.
            </p>
          </header>
          <ul className="pillars__list">
            {d.pillars.map((p) => (
              <li className="pillar reveal" key={p.num}>
                <span className="pillar__num">{p.num}</span>
                <span className="pillar__tag">{p.tag}</span>
                <h3 className="h-md pillar__title">{p.title}</h3>
                <p className="pillar__body">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CinematicReel
        index="02 — Selected work"
        eyebrow="Studio reel"
        title={
          <>
            Recent <em>chapters</em> from the studio floor.
          </>
        }
        intro="Five disciplines, one quality bar. Selected films, frames and finishing pulled from the last twelve months of campaign work."
        chapters={d.reel}
      />

      <PlatinumGallery
        index="03 — Galleries"
        eyebrow="The studio in five rooms"
        title={
          <>
            Pick a <em>room</em> — see the work.
          </>
        }
        intro="Each discipline keeps its own room. Switch between AI, Images, Films, Craft, Artistic and Classics to see a small, hand-picked frame from that room and a few supporting cuts."
        categories={d.galleryCategories}
      />

      <section className="awards reveal" data-scroll-fade>
        <div className="container awards__inner">
          <span className="eyebrow">04 — Recognition</span>
          <div className="awards__strip">
            {d.awards.map((a) => (
              <span className="awards__item" key={a}>
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Process
        index="05 — Process"
        eyebrow="How we work"
        title={
          <>
            A clear path from <em>brief</em> to delivery.
          </>
        }
        steps={d.process}
      />

      <Services
        index="06 — Capabilities"
        eyebrow="What we offer"
        title={
          <>
            A studio built for <em>craft</em> and <em>scale.</em>
          </>
        }
        services={d.services}
      />

      <section className="rail rail--quote rail--onyx">
        <div className="container rail__inner reveal" data-scroll-fade>
          <span className="eyebrow">07 — Trusted by</span>
          <blockquote className="rail__quote">"{d.quote.text}"</blockquote>
          <div className="rail__attrib">
            <span className="h-md">{d.quote.person}</span>
            <span>{d.quote.org}</span>
          </div>
          <div className="rail__logos">
            {d.clients.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA
        eyebrow={`08 — ${d.contact.eyebrow}`}
        title={
          <>
            Let&apos;s make
            <br />
            <em>something rare.</em>
          </>
        }
        lede={d.contact.lede}
        services={d.contact.services}
        direct={d.contact.direct}
        submitLabel="Send enquiry"
      />
    </SiteShell>
  )
}
