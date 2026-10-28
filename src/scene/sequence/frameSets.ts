/**
 * Pre-rendered hero frame sequences (Blender EEVEE, see blender/scripts/
 * render_sequence.py). Frames are evenly spaced along the camera path:
 * frame i of N sits at scroll progress i / (N - 1).
 */
export interface FrameSet {
  id: 'desktop' | 'mobile'
  count: number
  width: number
  height: number
  url: (index: number) => string
}

const pad = (i: number) => String(i).padStart(3, '0')

export const frameSets: Record<FrameSet['id'], FrameSet> = {
  desktop: {
    id: 'desktop',
    count: 96,
    width: 1600,
    height: 900,
    url: (i) => `/hero/desktop/frame_${pad(i)}.webp`,
  },
  mobile: {
    id: 'mobile',
    count: 72,
    width: 720,
    height: 1280,
    url: (i) => `/hero/mobile/frame_${pad(i)}.webp`,
  },
}

/** Portrait screens get the portrait-framed set. */
export function pickFrameSet(width: number, height: number): FrameSet {
  return width / height < 0.8 ? frameSets.mobile : frameSets.desktop
}

/**
 * Loading order: a coarse pass first (every 8th, then every 4th, ...), so the
 * whole path is scrubbable early and fills in progressively.
 */
export function loadOrder(count: number, stride = 1): number[] {
  const order: number[] = []
  const seen = new Set<number>()
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step * stride) {
      if (!seen.has(i)) {
        seen.add(i)
        order.push(i)
      }
    }
  }
  const last = count - 1
  if (!seen.has(last)) order.splice(1, 0, last)
  return order
}

/** Data-saver / low-memory devices load every second frame and skip cross-fades. */
export function isConstrainedDevice(): boolean {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
  }
  return Boolean(
    nav.connection?.saveData ||
      nav.connection?.effectiveType === '2g' ||
      nav.connection?.effectiveType === 'slow-2g' ||
      (nav.deviceMemory !== undefined && nav.deviceMemory < 4),
  )
}
