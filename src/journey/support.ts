/** WebGL2 available? (cached; creating a context is not free). */
let cached: boolean | undefined
export function webglAvailable(): boolean {
  if (cached !== undefined) return cached
  try {
    const c = document.createElement('canvas')
    cached = Boolean(c.getContext('webgl2'))
  } catch {
    cached = false
  }
  return cached
}

/** `?flat` forces the photographic fallback (useful for testing it). */
export function flatRequested(): boolean {
  return new URLSearchParams(window.location.search).has('flat')
}
