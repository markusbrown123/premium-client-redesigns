import { useEffect } from 'react'

export function useReveal(selector = '.reveal'): void {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    )

    if (prefersReduced) {
      elements.forEach((el) => el.classList.add('is-in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    )

    elements.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [selector])
}
