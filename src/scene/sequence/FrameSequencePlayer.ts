import { loadOrder, type FrameSet } from './frameSets'

interface PlayerOptions {
  /** Load every n-th frame only (2 on constrained devices). */
  stride?: number
  /** Blend neighbouring frames for sub-frame smoothness. */
  crossfade?: boolean
  onFirstFrame?: () => void
  onProgress?: (loaded: number, total: number) => void
}

const CONCURRENCY = 4

/**
 * Draws a pre-rendered frame sequence onto a 2D canvas at any progress 0..1.
 *
 * Frames are kept as compressed <img> elements (~16 KB each); the browser's
 * decode cache handles bitmaps, so memory stays small even with 96 frames.
 * Frames stream in coarse-to-fine, and drawing always falls back to the
 * nearest loaded frame, so the sequence is scrubbable before it finishes.
 */
export class FrameSequencePlayer {
  private ctx: CanvasRenderingContext2D
  private images: (HTMLImageElement | null)[]
  private loadedCount = 0
  private totalToLoad: number
  private disposed = false
  private lastDrawn = -1
  private readonly stride: number
  private readonly crossfade: boolean

  constructor(
    private canvas: HTMLCanvasElement,
    private set: FrameSet,
    private options: PlayerOptions = {},
  ) {
    this.ctx = canvas.getContext('2d', { alpha: false })!
    this.stride = options.stride ?? 1
    this.crossfade = options.crossfade ?? true
    this.images = new Array(set.count).fill(null)
    this.totalToLoad = loadOrder(set.count, this.stride).length
    this.resize()
  }

  /** Start streaming frames (frame 0 first, then coarse-to-fine). */
  load() {
    const queue = loadOrder(this.set.count, this.stride)
    const next = () => {
      const index = queue.shift()
      if (index === undefined || this.disposed) return
      const img = new Image()
      img.decoding = 'async'
      img.src = this.set.url(index)
      const done = (ok: boolean) => {
        if (this.disposed) return
        if (ok) {
          this.images[index] = img
          this.loadedCount++
          if (this.loadedCount === 1) this.options.onFirstFrame?.()
          this.options.onProgress?.(this.loadedCount, this.totalToLoad)
          this.lastDrawn = -1          // a better frame may now be available
        }
        next()
      }
      img.decode().then(() => done(true), () => done(img.complete && img.naturalWidth > 0))
    }
    for (let i = 0; i < CONCURRENCY; i++) next()
  }

  /** Match the canvas backing store to its CSS size (capped near source resolution). */
  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cap = Math.max(this.set.width, this.set.height) * 1.25
    const scale = Math.min(dpr, cap / Math.max(rect.width, rect.height, 1))
    this.canvas.width = Math.max(1, Math.round(rect.width * scale))
    this.canvas.height = Math.max(1, Math.round(rect.height * scale))
    this.lastDrawn = -1
  }

  /** Draw the sequence at progress 0..1. Cheap when nothing changed. */
  draw(progress: number) {
    const f = Math.min(Math.max(progress, 0), 1) * (this.set.count - 1)
    const key = Math.round(f * 100)
    if (key === this.lastDrawn) return
    const base = this.nearestLoaded(Math.floor(f))
    if (!base) return
    this.lastDrawn = key
    this.ctx.globalAlpha = 1
    this.cover(base.img)
    const frac = f - Math.floor(f)
    if (this.crossfade && frac > 0.02 && base.index === Math.floor(f)) {
      const nextImg = this.images[base.index + 1]
      if (nextImg) {
        this.ctx.globalAlpha = frac
        this.cover(nextImg)
        this.ctx.globalAlpha = 1
      }
    }
  }

  get loaded() {
    return this.loadedCount
  }

  dispose() {
    this.disposed = true
    this.images = []
  }

  private nearestLoaded(index: number) {
    for (let d = 0; d < this.set.count; d++) {
      const lo = this.images[index - d]
      if (lo) return { img: lo, index: index - d }
      const hi = this.images[index + d]
      if (hi) return { img: hi, index: index + d }
    }
    return null
  }

  /** Cover-fit, centred (the car sits at the centre of every frame). */
  private cover(img: HTMLImageElement) {
    const { width: cw, height: ch } = this.canvas
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * s
    const h = img.naturalHeight * s
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
  }
}
