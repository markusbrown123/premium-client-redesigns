import { useEffect } from 'react'

type Options = {
  /** Vertical translate range in pixels at the extremes of the viewport. */
  range?: number
  /** Class applied to descendants — receives data-parallax="0..1" style. */
  selector?: string
  /** Optional root override; defaults to document. */
  root?: () => HTMLElement | Document | null
}

/**
 * Lightweight scroll-driven parallax that nudges any element matching
 * `selector` by up to ±range px as it travels through the viewport. Uses a
 * single shared scroll listener and rAF batching so a page with dozens of
 * parallaxed children stays cheap. Respects prefers-reduced-motion.
 *
 * Also installs a global pointer listener that drives --mx / --my (0..1)
 * on any element opted-in via `[data-pointer-light]` — used by the Steve
 * hero so the warm light spot tracks the cursor.
 */
export function useParallax({ range = 60, selector = '[data-parallax]', root }: Options = {}): void {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    // ---- Pointer-light (opt-in via [data-pointer-light]) -----------------
    // Lightweight: one listener, rAF batched, only writes CSS vars on matched
    // nodes. Each node receives --mx / --my in 0..1 viewport-relative coords.
    let lightRaf = 0
    let lightPending = false
    let lastX = 0.5
    let lastY = 0.5
    const onPointer = (e: PointerEvent) => {
      const vw = window.innerWidth || 1
      const vh = window.innerHeight || 1
      lastX = Math.max(0, Math.min(1, e.clientX / vw))
      lastY = Math.max(0, Math.min(1, e.clientY / vh))
      if (lightPending) return
      lightPending = true
      lightRaf = requestAnimationFrame(() => {
        lightPending = false
        document
          .querySelectorAll<HTMLElement>('[data-pointer-light]')
          .forEach((n) => {
            n.style.setProperty('--mx', lastX.toFixed(3))
            n.style.setProperty('--my', lastY.toFixed(3))
          })
      })
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const getNodes = () => {
      const r = root?.() || document
      return Array.from(
        (r as Document | HTMLElement).querySelectorAll<HTMLElement>(selector),
      )
    }

    let nodes = getNodes()
    let raf = 0
    let pending = false

    const update = () => {
      pending = false
      const vh = window.innerHeight || 800
      for (const n of nodes) {
        const rect = n.getBoundingClientRect()
        // Center of element relative to viewport center, normalised to [-1, 1]
        // when the element is fully on-screen.
        const center = rect.top + rect.height / 2
        const t = (center - vh / 2) / (vh / 2 + rect.height / 2)
        const clamped = Math.max(-1.2, Math.min(1.2, t))
        const speed = Number(n.dataset.parallaxSpeed ?? '1')
        const offset = -clamped * range * speed
        n.style.setProperty('--py', `${offset.toFixed(2)}px`)
        // Optional horizontal track — opt-in via data-parallax-x. Used by
        // sections that should feel mechanical (motion-control rig pan).
        const xSpeed = n.dataset.parallaxX
        if (xSpeed != null) {
          const xs = Number(xSpeed || '1')
          const xOffset = clamped * range * xs
          n.style.setProperty('--px', `${xOffset.toFixed(2)}px`)
        }
      }
    }

    const onScroll = () => {
      if (pending) return
      pending = true
      raf = requestAnimationFrame(update)
    }

    const onResize = () => {
      nodes = getNodes()
      onScroll()
    }

    // Refresh node list when the DOM mutates (new sections animate in).
    const observer = new MutationObserver(() => {
      nodes = getNodes()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    update()

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(lightRaf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      observer.disconnect()
    }
  }, [range, selector, root])
}
