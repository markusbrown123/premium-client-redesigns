import { useEffect } from 'react'

/**
 * Drives a CSS variable `--enter` (0 → 1 → 0) on elements matching `selector`
 * based on their progress through the viewport. Used by cinematic captions
 * that should fade in as a section enters and fade out as it leaves.
 */
export function useScrollFade(selector = '[data-scroll-fade]'): void {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      document
        .querySelectorAll<HTMLElement>(selector)
        .forEach((n) => n.style.setProperty('--enter', '1'))
      return
    }

    let raf = 0
    let pending = false

    const update = () => {
      pending = false
      const vh = window.innerHeight || 800
      document.querySelectorAll<HTMLElement>(selector).forEach((n) => {
        const rect = n.getBoundingClientRect()
        // Map progress: 0 when below the fold, 1 when centered, 0 when above.
        const center = rect.top + rect.height / 2
        const dist = Math.abs(center - vh / 2)
        const span = vh / 2 + rect.height / 2
        const v = 1 - Math.min(1, dist / span)
        n.style.setProperty('--enter', v.toFixed(3))
      })
    }

    const onScroll = () => {
      if (pending) return
      pending = true
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [selector])
}
