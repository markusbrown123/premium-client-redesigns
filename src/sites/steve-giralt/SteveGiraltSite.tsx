import { useMemo, useState } from 'react'
import { SiteShell } from '../../components/SiteShell'
import { Hero } from '../../components/Hero'
import { Marquee } from '../../components/Marquee'
import { CinematicReel } from '../../components/CinematicReel'
import { ContactCTA } from '../../components/ContactCTA'
import { Placeholder } from '../../components/Placeholder'
import { Lightbox } from '../../components/Lightbox'
import { buildSteveGiraltData } from './steveGiraltData'
import type { MediaItem } from '../../data/media-types'

export function SteveGiraltSite() {
  const d = useMemo(() => buildSteveGiraltData(), [])
  const [openLab, setOpenLab] = useState<number | null>(null)
  const labMedia: MediaItem[] = d.lab
    .map((l) => l.media)
    .filter((m): m is MediaItem => !!m)

  return (
    <SiteShell
      className="steve"
      brand={d.brand}
      navLinks={d.navLinks}
      navCta={d.navCta}
      footer={d.footer}
    >
      <Hero
        variant="steve"
        horizontalPan
        pointerLight
        showNowPlaying={false}
        transitionStyle="slide"
        progressStyle="timeline"
        masthead="STUDIO · 01 — CREATIVE TECHNOLOGY"
        chapters={[
          { num: '01', label: 'Liquid' },
          { num: '02', label: 'Tabletop' },
          { num: '03', label: 'Geometry' },
          { num: '04', label: 'Rigs' },
        ]}
        eyebrow={d.hero.eyebrow}
        location={d.hero.location}
        title={[
          <span key={0}>Creative technology for</span>,
          <span key={1}>
            <em>impossible</em> food,
          </span>,
          <span key={2}>beverage &amp; product visuals.</span>,
        ]}
        lede={d.hero.lede}
        ctas={d.hero.ctas}
        rotation={d.hero.rotation}
        overlay={
          <div className="sg-hud" aria-hidden="true">
            <span className="sg-hud__light" />
            <span className="sg-hud__bracket sg-hud__bracket--tl" />
            <span className="sg-hud__bracket sg-hud__bracket--tr" />
            <span className="sg-hud__bracket sg-hud__bracket--bl" />
            <span className="sg-hud__bracket sg-hud__bracket--br" />
            <div className="sg-hud__readout">
              {d.hero.hud.map((h) => (
                <span key={h.label} className="sg-hud__cell">
                  <span className="sg-hud__lbl">{h.label}</span>
                  <span className="sg-hud__val">{h.value}</span>
                </span>
              ))}
            </div>
            <div className="sg-hud__frame">
              <span className="sg-hud__frame-dot" aria-hidden="true" />
              <span className="sg-hud__frame-id">F · 042 / 187</span>
              <span className="sg-hud__frame-spec">SCENE 02 · TAKE 17</span>
            </div>
          </div>
        }
        pillars={
          <div className="sg-pillars" aria-label="Studio disciplines">
            <span className="sg-pillars__rule" aria-hidden="true" />
            <ul className="sg-pillars__list">
              {d.hero.pillars.map((p, i) => (
                <li className="sg-pillars__item" key={p}>
                  <span className="sg-pillars__idx">{`0${i + 1}`}</span>
                  <span className="sg-pillars__lbl">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {/* 2 — Editorial creative-technology statement */}
      <section className="sg-statement" id="statement">
        <span className="sg-cross sg-cross--tl" aria-hidden="true" />
        <span className="sg-cross sg-cross--tr" aria-hidden="true" />
        <span className="sg-cross sg-cross--bl" aria-hidden="true" />
        <span className="sg-cross sg-cross--br" aria-hidden="true" />
        <div className="container sg-statement__inner">
          <span className="eyebrow reveal">{d.statement.eyebrow}</span>
          <h2 className="display sg-statement__title reveal" data-scroll-fade>
            {splitStatement(d.statement.body)}
          </h2>
          <div className="sg-statement__tags reveal reveal-delay-1">
            {d.statement.tags.map((t) => (
              <span key={t} className="sg-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Marquee items={d.marquee} />

      {/* 3 — Invent · Build · Shoot · Deliver */}
      <section className="sg-process" id="process">
        <div className="container">
          <header className="sg-process__head reveal">
            <span className="sg-process__index">01 — Process</span>
            <div className="sg-process__head-text">
              <span className="eyebrow">How the studio works</span>
              <h2 className="h-lg sg-process__title">
                Invent · Build · Shoot · <em>Deliver.</em>
              </h2>
              <p className="lede sg-process__lede">
                Four rooms, one director, one continuous workflow — every campaign begins as an
                engineering problem and ends as a finished spot.
              </p>
            </div>
          </header>
          <ol className="sg-process__list" data-scroll-fade>
            <span className="sg-process__rail" aria-hidden="true">
              <span className="sg-process__rail-fill" />
            </span>
            {d.invent.map((s, i) => (
              <li
                className="sg-process__row reveal"
                key={s.num}
                style={{ transitionDelay: `${(i % 4) * 0.06}s` }}
                data-scroll-fade
              >
                <span className="sg-process__num">{s.num}</span>
                <div className="sg-process__body">
                  <span className="sg-process__label">{s.label}</span>
                  <h3 className="sg-process__rtitle">{s.title}</h3>
                  <p className="sg-process__rbody">{s.body}</p>
                </div>
                <span className="sg-process__marker">
                  <span className="sg-process__marker-dot" aria-hidden="true" />
                  {s.marker}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 — Selected work reel */}
      <CinematicReel
        index="02 — Selected work"
        eyebrow="Motion-control reel"
        title={
          <>
            Spots that <em>broke</em> the rig — then taught us the next one.
          </>
        }
        intro="Five chapters across beverage, food, product, motion control and creative technology — each built around a single shot no off-the-shelf rig could deliver."
        chapters={d.reel.map((ch) => ({
          num: ch.num,
          category: ch.category,
          title: renderReelTitle(ch.title),
          body: `${ch.body} ${ch.note}`,
          client: ch.client,
          year: ch.year,
          media: ch.media!,
        }))}
      />

      {/* 5 — Lab Wall */}
      <section className="sg-lab" id="lab">
        <div className="container sg-lab__head reveal">
          <span className="sg-lab__index">03 — Lab</span>
          <div className="sg-lab__head-text">
            <span className="eyebrow">From the workshop floor</span>
            <h2 className="h-lg sg-lab__title">
              Experiments, prototypes &amp; <em>finished frames.</em>
            </h2>
            <p className="lede sg-lab__lede">
              A growing wall of bench tests, on-set rigs and final-grade stills. Every campaign
              leaves a documented trail of how the work was made.
            </p>
          </div>
        </div>
        <div className="sg-lab__shell">
          <div className="sg-lab__grid">
            {d.lab.map((card, i) => {
              if (!card.media) return null
              const idx = labMedia.indexOf(card.media)
              const speed = (i % 3 === 0 ? -0.5 : i % 3 === 1 ? 0.4 : -0.25).toFixed(2)
              const frameId = `F · ${String(i + 1).padStart(3, '0')} / ${String(d.lab.length).padStart(3, '0')}`
              return (
                <button
                  type="button"
                  key={card.media.id}
                  className={`sg-lab__cell sg-lab__cell--${card.span}`}
                  onClick={() => setOpenLab(idx)}
                  aria-label={`Open ${card.title}`}
                  data-parallax
                  data-parallax-speed={speed}
                  data-tag={card.tag}
                >
                  <Placeholder
                    src={card.media.mediaType === 'image' ? card.media.src : undefined}
                    videoSrc={
                      card.media.mediaType === 'video' ? card.media.videoSrc : undefined
                    }
                    poster={card.media.poster}
                    alt={card.media.alt || card.title}
                    ratio="16 / 10"
                    label={card.title}
                  />
                  <span className="sg-lab__cross sg-lab__cross--tl" aria-hidden="true" />
                  <span className="sg-lab__cross sg-lab__cross--tr" aria-hidden="true" />
                  <span className="sg-lab__cross sg-lab__cross--bl" aria-hidden="true" />
                  <span className="sg-lab__cross sg-lab__cross--br" aria-hidden="true" />
                  <span className="sg-lab__frameid" aria-hidden="true">{frameId}</span>
                  <div className="sg-lab__annot">
                    <span className="sg-lab__tag">{card.tag}</span>
                    <span className="sg-lab__caption">{card.caption}</span>
                    <span className="sg-lab__spec">{card.spec}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        {openLab !== null && (
          <Lightbox
            items={labMedia}
            index={openLab}
            onClose={() => setOpenLab(null)}
            onIndex={(i) => setOpenLab(i)}
          />
        )}
      </section>

      {/* 6 — Speaking · About · Credibility */}
      <section className="sg-about" id="about">
        <div className="container sg-about__inner">
          <header className="sg-about__head reveal">
            <span className="sg-about__index">04 — About</span>
            <div className="sg-about__head-text">
              <span className="eyebrow">{d.about.eyebrow}</span>
              <h2 className="h-lg sg-about__title">{d.about.title}</h2>
            </div>
          </header>
          <div className="sg-about__body reveal reveal-delay-1">
            {d.about.body.map((p, i) => (
              <p className="sg-about__p" key={i}>
                {p}
              </p>
            ))}
            <dl className="sg-about__facts">
              {d.about.facts.map((f) => (
                <div className="sg-about__fact" key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="sg-about__rails reveal reveal-delay-2">
            <div className="sg-about__rail">
              <span className="eyebrow">Speaking &amp; festivals</span>
              <ul className="sg-about__rail-list">
                {d.about.speaking.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="sg-about__rail">
              <span className="eyebrow">Brands &amp; agencies</span>
              <ul className="sg-about__rail-list">
                {d.about.brands.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ContactCTA
        eyebrow={`05 — ${d.contact.eyebrow}`}
        title={
          <>
            Book a
            <br />
            <em>creative tech consult.</em>
          </>
        }
        lede={d.contact.lede}
        services={d.contact.services}
        direct={d.contact.direct}
        submitLabel="Start a production conversation"
      />
    </SiteShell>
  )
}

// Split a long statement sentence at the em-dash so we can emphasise the second
// clause with the italic accent.
function splitStatement(text: string) {
  const [a, b] = text.split(' — ')
  if (!b) return text
  return (
    <>
      {a} <em>— {b}</em>
    </>
  )
}

function renderReelTitle(title: string) {
  const [a, b] = title.split(' — ')
  if (!b) return title
  return (
    <>
      {a} <em>— {b}</em>
    </>
  )
}
