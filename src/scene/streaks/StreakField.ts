/**
 * Colourful light streaks flying past the camera, drawn on a 2D canvas.
 *
 * Each streak lives on a ring around the view axis and travels toward the
 * viewer as `distance` grows; its screen position is a perspective projection,
 * so streaks start near the centre, accelerate outward and leave past the
 * edges - the feeling of speed. Position comes only from `distance` (a pure
 * function of scroll), so scrolling back reverses every streak exactly.
 * Trail length (motion blur) and brightness follow the current speed.
 *
 * Cost per frame: one clear plus two strokes per visible streak, composited
 * with 'lighter'. Nothing is drawn while the input is unchanged.
 */

type Palette = readonly (readonly [number, string])[]

const BLUE: Palette = [[0, 'rgba(40,110,255,0)'], [1, 'rgba(90,160,255,1)']]
const RED: Palette = [[0, 'rgba(255,30,20,0)'], [1, 'rgba(255,70,50,1)']]
const VIOLET: Palette = [[0, 'rgba(140,60,255,0)'], [1, 'rgba(185,120,255,1)']]
const RAINBOW: Palette = [
  [0, 'rgba(255,40,40,0)'],
  [0.3, 'rgba(255,170,40,0.75)'],
  [0.5, 'rgba(80,230,150,0.85)'],
  [0.72, 'rgba(70,130,255,0.95)'],
  [1, 'rgba(190,90,255,1)'],
]

interface Streak {
  angle: number   // around the view axis
  radius: number  // distance from the axis (world units)
  phase: number   // offset along the travel loop, 0..1
  speed: number   // loop cycles per unit distance
  width: number
  palette: Palette
}

export interface StreakFrame {
  /** Monotonic travel distance (e.g. scroll progress x some factor). */
  distance: number
  /** Signed speed, distance units per second. Drives trail length and glow. */
  velocity: number
  /** 0..1+ overall strength (scene-dependent). */
  intensity: number
}

/** Deterministic pseudo-random, so the layout is identical on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

export class StreakField {
  private ctx: CanvasRenderingContext2D
  private streaks: Streak[] = []
  private w = 1
  private h = 1
  private lastKey = ''

  constructor(
    private canvas: HTMLCanvasElement,
    count = 28,
    seed = 7,
  ) {
    this.ctx = canvas.getContext('2d')!
    const rand = rng(seed)
    const palettes = [BLUE, RED, VIOLET, BLUE, VIOLET, RED]
    for (let i = 0; i < count; i++) {
      // Keep the band through the middle (where the car sits) mostly clear:
      // favour angles toward the upper and lower thirds and larger radii.
      const a = rand() * Math.PI * 2
      const angle = a + Math.sin(a * 2) * 0.35
      this.streaks.push({
        angle,
        radius: 0.9 + rand() * 1.6,
        phase: rand(),
        speed: 0.55 + rand() * 0.9,
        width: 0.8 + rand() * 1.6,
        palette: i % 7 === 3 ? RAINBOW : palettes[i % palettes.length],
      })
    }
    this.resize()
  }

  resize() {
    // DPR capped at 1: the streaks are soft light, sharpness buys nothing and
    // a full-screen canvas at 2x is four times the fill cost on integrated GPUs.
    const rect = this.canvas.getBoundingClientRect()
    // Wide screens draw at 60% and let CSS upscale: soft light loses nothing,
    // and the additive fill cost drops by ~2.8x.
    const scale = rect.width > 900 ? 0.6 : 1
    this.w = Math.max(1, Math.round(rect.width * scale))
    this.h = Math.max(1, Math.round(rect.height * scale))
    this.canvas.width = this.w
    this.canvas.height = this.h
    this.lastKey = ''
  }

  draw({ distance, velocity, intensity }: StreakFrame) {
    const speed = Math.min(Math.abs(velocity), 3)
    // Brightness: faint at rest, full while moving.
    const strength = intensity * (0.18 + 0.82 * Math.min(1, speed / 0.6))
    const key = `${distance.toFixed(4)}|${strength.toFixed(3)}|${speed.toFixed(2)}`
    if (key === this.lastKey) return
    this.lastKey = key

    const { ctx, w, h } = this
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, w, h)
    if (strength < 0.01) return
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'

    const cx = w / 2
    const cy = h * 0.48
    const focal = Math.max(w, h) * 0.32
    const aspect = w > h ? 1.45 : 0.9          // stretch the tunnel horizontally on wide screens
    const trail = 0.08 + speed * 0.34           // depth span of the trail (motion blur)
    const dir = velocity < 0 ? -1 : 1
    const sizeScale = Math.min(1, Math.max(0.55, w / 1400))   // thinner on phones

    for (const s of this.streaks) {
      // Depth z runs 1 (far) -> 0.06 (passing the camera), looping.
      const t = (((s.phase + distance * s.speed) % 1) + 1) % 1
      const z = 1 - t * 0.94
      const zTail = Math.min(1.2, z + trail * s.speed * dir)
      const ux = Math.cos(s.angle) * s.radius * aspect
      const uy = Math.sin(s.angle) * s.radius
      const hx = cx + (ux / z) * focal * 0.25
      const hy = cy + (uy / z) * focal * 0.25
      const tx = cx + (ux / zTail) * focal * 0.25
      const ty = cy + (uy / zTail) * focal * 0.25
      // Fade in from the distance and out as it leaves the frame.
      const life = Math.min(1, t * 4) * Math.min(1, (1 - t) * 6)
      // Keep the middle of the frame (the car) clear: fade heads near the centre.
      const r = Math.hypot((hx - cx) / w, (hy - cy) / h)
      const clearance = Math.min(1, Math.max(0, (r - 0.16) / 0.2))
      const alpha = strength * life * clearance
      if (alpha < 0.02) continue

      const g = ctx.createLinearGradient(tx, ty, hx, hy)
      for (const [o, c] of s.palette) g.addColorStop(o, c)
      const width = s.width * (0.6 + 1.2 / z) * 0.8 * sizeScale

      ctx.strokeStyle = g
      // Halo: wide and faint
      ctx.globalAlpha = alpha * 0.22
      ctx.lineWidth = width * 6
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(hx, hy)
      ctx.stroke()
      // Core: thin and bright
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.lineWidth = width
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h)
    this.lastKey = ''
  }
}
