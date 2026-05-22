import type { ClientId } from './data/media-types'

declare const __SITE_TARGET__: string | undefined

const VALID: readonly ClientId[] = ['platinum', 'steve-giralt', 'deliverables', 'a1-sealcoating']

function pick(): ClientId {
  // Build-time define from vite.config.ts.
  if (typeof __SITE_TARGET__ === 'string' && (VALID as readonly string[]).includes(__SITE_TARGET__)) {
    return __SITE_TARGET__ as ClientId
  }
  // Runtime env (dev with import.meta.env).
  const envTarget =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SITE_TARGET) || ''
  if ((VALID as readonly string[]).includes(envTarget)) return envTarget as ClientId
  // URL override for ad-hoc preview, e.g. ?site=steve-giralt
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('site') || ''
    if ((VALID as readonly string[]).includes(q)) return q as ClientId
  }
  return 'platinum'
}

export const SITE_TARGET: ClientId = pick()
