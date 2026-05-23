import { useEffect } from 'react'
import './a1.css'
import { useLenis } from '../../hooks/useLenis'
import { useReveal } from '../../hooks/useReveal'
import { A1Nav } from './components/A1Nav'
import { A1Hero } from './components/A1Hero'
import { A1TrustStrip } from './components/A1TrustStrip'
import { A1Services } from './components/A1Services'
import { A1FeaturedWork } from './components/A1FeaturedWork'
import { A1Gallery } from './components/A1Gallery'
import { A1ProjectReel } from './components/A1ProjectReel'
import { A1Process } from './components/A1Process'
import { A1Split } from './components/A1Split'
import { A1Equipment } from './components/A1Equipment'
import { A1Faq } from './components/A1Faq'
import { A1Contact } from './components/A1Contact'
import { A1Footer } from './components/A1Footer'
import { A1MobileCall } from './components/A1MobileCall'
import { COMPANY } from './a1Data'

export function A1SealcoatingSite() {
  // Run shared smooth-scroll + reveal hooks. The reveal hook keys off `.a1-reveal`.
  useLenis()
  useReveal('.a1-reveal')

  useEffect(() => {
    const prevTitle = document.title
    document.title = `${COMPANY.legalName} | ${COMPANY.tagline}`
    const setMeta = (name: string, content: string) => {
      let m = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!m) {
        m = document.createElement('meta')
        m.name = name
        document.head.appendChild(m)
      }
      const prev = m.content
      m.content = content
      return () => { if (m) m.content = prev }
    }
    const setLink = (rel: string, href: string) => {
      let l = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
      if (!l) {
        l = document.createElement('link')
        l.rel = rel
        document.head.appendChild(l)
      }
      const prev = l.href
      l.href = href
      return () => { if (l) l.href = prev }
    }
    const restoreDesc = setMeta(
      'description',
      `${COMPANY.legalName} — asphalt sealcoating, paving, line striping, and crack repair for ${COMPANY.scope.toLowerCase()} properties. ${COMPANY.insurance} with ${COMPANY.experience.toLowerCase()}. Call ${COMPANY.phone}.`,
    )
    const restoreTheme = setMeta('theme-color', '#070707')
    const restoreIcon = setLink('icon', '/brand/a1-mark@128w.png')
    return () => {
      document.title = prevTitle
      restoreDesc()
      restoreTheme()
      restoreIcon()
    }
  }, [])

  return (
    <div className="a1-site">
      <A1Nav />
      <main>
        <A1Hero />
        <A1TrustStrip />
        <A1Services />
        <A1FeaturedWork />
        <A1Gallery />
        <A1ProjectReel />
        <A1Process />
        <A1Split />
        <A1Equipment />
        <A1Faq />
        <A1Contact />
      </main>
      <A1Footer />
      <A1MobileCall />
    </div>
  )
}
