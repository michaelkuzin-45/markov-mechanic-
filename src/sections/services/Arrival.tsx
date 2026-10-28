import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { StreakField } from '@/scene/streaks/StreakField'
import styles from './Services.module.css'

/**
 * The second half of the homepage card click: the card flew into a tunnel of
 * light and cut to black; here the streaks decelerate past the viewer and the
 * black lifts onto the opening shot. Direct visits just fade in from black.
 */
export function Arrival() {
  const shade = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const launched = Boolean((useLocation().state as { launched?: boolean } | null)?.launched)

  useEffect(() => {
    const el = shade.current
    if (!el) return
    if (reduced) {
      el.style.opacity = '0'
      return
    }
    const fade = gsap.to(el, { opacity: 0, duration: launched ? 1.1 : 0.8, delay: launched ? 0.25 : 0.05, ease: 'power2.out' })

    let raf = 0
    const c = canvas.current
    if (launched && c) {
      const field = new StreakField(c, 30, 11)
      const DURATION = 1300
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION)
        const out = 1 - (1 - t) ** 3 // decelerate: fast at first, easing to a stop
        field.draw({ distance: 2.4 + out * 1.6, velocity: 4.2 * (1 - t), intensity: 1.8 * (1 - t) })
        if (t < 1) raf = requestAnimationFrame(tick)
        else c.style.opacity = '0'
      }
      raf = requestAnimationFrame(tick)
    }
    return () => {
      fade.kill()
      cancelAnimationFrame(raf)
    }
  }, [reduced, launched])

  return (
    <>
      <div ref={shade} className={styles.arrivalShade} aria-hidden="true" />
      {launched && !reduced && <canvas ref={canvas} className={styles.arrivalStreaks} aria-hidden="true" />}
    </>
  )
}
