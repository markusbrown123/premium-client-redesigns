import { useMemo } from 'react'
import { SiteShell } from '../../components/SiteShell'
import { Marquee } from '../../components/Marquee'
import { Process } from '../../components/Process'
import { Services } from '../../components/Services'
import { ContactCTA } from '../../components/ContactCTA'
import { DeliverablesHero } from './components/DeliverablesHero'
import { OneToMany } from './components/OneToMany'
import { AssetMatrix } from './components/AssetMatrix'
import { buildDeliverablesData } from './deliverablesData'

export function DeliverablesSite() {
  const d = useMemo(() => buildDeliverablesData(), [])

  // Derived from the gallery — keep the OneToMany fan compact and editorial
  // (one row of six) rather than crowding the page with redundant copy.
  const oneManyVariants = [
    { label: 'Social',  ratio: '1:1',  channel: 'Instagram feed',  focal: '50% 40%' },
    { label: 'Story',   ratio: '9:16', channel: 'Stories · Reels', focal: '50% 50%' },
    { label: 'Display', ratio: '16:9', channel: 'YouTube · CTV',   focal: '55% 50%' },
    { label: 'Email',   ratio: '3:1',  channel: 'CRM header',      focal: '50% 50%' },
    { label: 'Ecomm',   ratio: '4:5',  channel: 'PDP tile',        focal: '55% 55%' },
    { label: 'OOH',     ratio: '21:9', channel: 'Out-of-home',     focal: '55% 45%' },
  ]

  return (
    <SiteShell
      className="deliverables"
      brand={d.brand}
      navLinks={d.navLinks}
      navCta={d.navCta}
      footer={d.footer}
    >
      <DeliverablesHero
        eyebrow={d.hero.eyebrow}
        statementLead={d.hero.statementLead}
        statementTail={d.hero.statementTail}
        intro={d.hero.intro}
        ctas={d.hero.ctas}
        rotation={d.hero.rotation}
      />

      <Marquee items={d.marquee} />

      <OneToMany
        master={d.master}
        poster={
          d.master?.poster ||
          (d.master?.mediaType === 'image' ? d.master.src : undefined)
        }
        variants={oneManyVariants}
      />

      <AssetMatrix
        master={d.master}
        secondary={d.secondary}
        cards={d.matrix}
        tabs={d.galleryTabs}
      />

      <Services
        index="03 — What we deliver"
        eyebrow="The deliverables"
        title={
          <>
            A campaign-asset <em>system,</em> not a one-off render.
          </>
        }
        services={d.whatWeDeliver}
      />

      <Process
        index="04 — Process"
        eyebrow="Brief to delivery"
        title={
          <>
            Brief · Master · Asset map · Review · <em>Delivery.</em>
          </>
        }
        steps={d.process}
      />

      <ContactCTA
        eyebrow={`05 — ${d.contact.eyebrow}`}
        title={
          <>
            A whole launch, <em>delivered.</em>
          </>
        }
        lede={d.contact.lede}
        services={d.contact.services}
        direct={d.contact.direct}
        submitLabel="Send launch brief"
      />
    </SiteShell>
  )
}
