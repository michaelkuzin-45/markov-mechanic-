/**
 * Which experience this visitor gets.
 *
 *   full   live 3D, high-detail model, pixel ratio up to 1.5
 *   lite   live 3D, lighter model, pixel ratio up to 1.25 (phones and touch devices)
 *   static pre-rendered stills with the same controls (no WebGL2, reduced motion, save-data,
 *          `?flat`, a lost GL context, or a device that cannot hold the frame rate)
 *
 * `?tier=full|lite|static` forces a tier for testing.
 */
export type Tier = 'full' | 'lite' | 'static'

export type TierReason =
  | 'forced'
  | 'flat'
  | 'no-webgl2'
  | 'reduced-motion'
  | 'save-data'
  | 'touch-or-small'
  | 'capable'

export interface TierDecision {
  tier: Tier
  reason: TierReason
}

let webgl2: boolean | undefined
export function hasWebGL2(): boolean {
  if (webgl2 !== undefined) return webgl2
  try {
    webgl2 = Boolean(document.createElement('canvas').getContext('webgl2'))
  } catch {
    webgl2 = false
  }
  return webgl2
}

/** The live tier this device should get if it runs 3D at all: phones and touch screens get the lighter one. */
export function preferredLiveTier(): 'full' | 'lite' {
  const small = window.matchMedia('(max-width: 720px)').matches
  const touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  return small || touch ? 'lite' : 'full'
}

export function decideTier(): TierDecision {
  const params = new URLSearchParams(window.location.search)
  const forced = params.get('tier')
  if (forced === 'full' || forced === 'lite' || forced === 'static') return { tier: forced, reason: 'forced' }
  if (params.has('flat')) return { tier: 'static', reason: 'flat' }
  if (!hasWebGL2()) return { tier: 'static', reason: 'no-webgl2' }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return { tier: 'static', reason: 'reduced-motion' }
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData) return { tier: 'static', reason: 'save-data' }
  const live = preferredLiveTier()
  return { tier: live, reason: live === 'lite' ? 'touch-or-small' : 'capable' }
}

/** Largest device pixel ratio each live tier may use. Measured on an Intel HD 630: 1.5 costs about 19 ms, 2 about 30 ms. */
export const dprCap: Record<Exclude<Tier, 'static'>, number> = { full: 1.5, lite: 1.25 }

export const modelUrl: Record<Exclude<Tier, 'static'>, string> = {
  full: '/models/gallardo/gallardo-lod0.glb',
  lite: '/models/gallardo/gallardo-lod1.glb',
}
