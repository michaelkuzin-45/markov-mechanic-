import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'

interface MonitorProps {
  dpr: number
  minDpr: number
  maxDpr: number
  onDpr: (next: number) => void
  /** Even at the lowest pixel ratio the frame rate is unusable. */
  onSlow: () => void
  /** True while something is driving frames (turntable, camera tween, drag or damping). Other frames are idle. */
  driving: MutableRefObject<boolean>
}

const STEP = 0.25
// A frame rate locked at 30 fps (iOS Low Power Mode, a throttled compositor, an emulated 3x screen) is 33 ms and
// is NOT a sign the scene is too heavy: lowering the canvas resolution would not help it. Only treat clearly
// worse than that as trouble.
const SLOW_MS = 40 // under ~25 fps
const FAST_MS = 22 // over ~45 fps: room to raise the pixel ratio again
const UNUSABLE_MS = 70 // under ~14 fps at the lowest pixel ratio
const DROP_AFTER_MS = 1500
const RAISE_AFTER_MS = 3000
const GIVE_UP_AFTER_MS = 3000
const FIRST_FRAMES = 8 // shader compilation and first uploads make the very first frames slow
const BURST_SKIP = 6 // every camera move starts with a hitch (React commit, first tween frame): don't judge it
const HITCH_CAP_MS = 250 // one long hitch must not decide anything on its own

/**
 * Adaptive pixel ratio and last-resort fallback.
 *
 * The scene renders on demand, so most of the time there are no frames at all. Only frames that something is
 * driving are judged (an idle gap is not a slow frame, and a slow frame is not an idle gap), after skipping the
 * first few of each burst. Evidence is measured in elapsed time, so a device at 5 fps is caught as surely as one at
 * 30, and it accumulates across bursts: good frames pay down the bad ones instead of resetting them, so a single
 * rough moment cannot ratchet quality down for the whole visit, and quality can come back.
 *
 * On an Intel HD 630 the same scene costs ~9 ms at DPR 1, ~16 ms at 1.5 and ~30 ms at 2. Frame spacing is only a proxy
 * for GPU cost (GPU timer queries are not available everywhere), which is why the thresholds are deliberately lenient.
 */
export function Monitor({ dpr, minDpr, maxDpr, onDpr, onSlow, driving }: MonitorProps) {
  const s = useRef({ ema: 16, seen: 0, burst: 0, slowMs: 0, fastMs: 0, hopelessMs: 0 })

  useFrame((_, delta) => {
    const m = s.current
    if (!driving.current) {
      m.burst = 0
      return
    }
    m.seen++
    m.burst++
    if (m.seen <= FIRST_FRAMES || m.burst <= BURST_SKIP) return

    const ms = Math.min(delta * 1000, HITCH_CAP_MS)
    m.ema += (ms - m.ema) * 0.15
    m.slowMs = m.ema > SLOW_MS ? m.slowMs + ms : Math.max(0, m.slowMs - ms)
    m.fastMs = m.ema < FAST_MS ? m.fastMs + ms : Math.max(0, m.fastMs - ms * 0.5)
    m.hopelessMs = m.ema > UNUSABLE_MS && dpr <= minDpr ? m.hopelessMs + ms : Math.max(0, m.hopelessMs - ms)

    const settle = () => {
      // The frames right after a resize are slow for reasons that say nothing about the device.
      m.ema = 16
      m.slowMs = m.fastMs = m.hopelessMs = 0
      m.burst = 0
    }
    if (m.hopelessMs > GIVE_UP_AFTER_MS) {
      settle()
      onSlow()
    } else if (m.slowMs > DROP_AFTER_MS && dpr > minDpr) {
      settle()
      onDpr(Math.max(minDpr, dpr - STEP))
    } else if (m.fastMs > RAISE_AFTER_MS && dpr < maxDpr) {
      settle()
      onDpr(Math.min(maxDpr, dpr + STEP))
    }
  })
  return null
}
