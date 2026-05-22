import { useEffect, useState } from 'react'
import { COMPANY } from '../a1Data'
import { Phone } from './A1Icons'

// Sticky, pulsing call button. Appears only after the user scrolls past the hero.
// Hidden on desktop via CSS (media query) — we still gate via JS so the DOM stays clean.
export function A1MobileCall() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const showAfter = Math.max(320, window.innerHeight * 0.55)
      setVisible(window.scrollY > showAfter)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href={COMPANY.phoneHref}
      className={`a1-mobile-call ${visible ? 'is-visible' : ''}`}
      aria-label={`Call ${COMPANY.phone}`}
    >
      <Phone width={24} height={24} />
    </a>
  )
}
