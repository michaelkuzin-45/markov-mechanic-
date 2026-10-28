import { Suspense, lazy, useRef, useState } from 'react'
import { images } from '@/images/registry'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { servicePanels } from '@/config/servicesPage'
import { Captions } from './Captions'
import { Editorial } from './Editorial'
import { buildTimeline } from './timeline'
import { HIGH, LOW } from './quality'
import { J } from './state'
import j from './Journey.module.css'

const Journey3D = lazy(() => import('./Journey3D'))

/** Scroll length per timeline unit, as a share of the viewport height. */
const VH_PER_UNIT = 36
const VH_PER_UNIT_PHONE = 42

/**
 * The Services page as one continuous 3D journey. A sticky full-screen canvas
 * (React Three Fiber) is driven by a single scrubbed GSAP timeline (see
 * timeline.ts); the captions are plain HTML above it.
 */
export default function JourneyExperience() {
  const root = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()
  const [ready, setReady] = useState(false)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const { tl, duration } = buildTimeline(el)
      el.style.height = `${100 + duration * (isMobile ? VH_PER_UNIT_PHONE : VH_PER_UNIT)}svh`
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.9,
        invalidateOnRefresh: true,
        animation: tl,
      })
      ScrollTrigger.refresh()
      // Dev/test hook: jump the master timeline to a time (units) without scrolling.
      if (import.meta.env.DEV) (window as unknown as { __journey?: unknown }).__journey = { tl, st, duration, J }
      return () => {
        st.kill()
        tl.kill()
      }
    },
    { scope: root, dependencies: [isMobile] },
  )

  void gsap
  return (
    <section ref={root} className={j.journey} aria-label="Services: a journey through the Markov Automotive workshop">
      <div className={j.stage}>
        <div className={j.poster} style={{ backgroundImage: `url(${images.hoodUp.src})`, opacity: ready ? 0 : 1, transition: "opacity 900ms ease 400ms", pointerEvents: "none" }} aria-hidden="true" />
        <div className={j.canvas}>
          <Suspense fallback={null}>
            <Journey3D quality={isMobile ? LOW : HIGH} onReady={() => setReady(true)} />
          </Suspense>
        </div>
        <div className={j.grade} aria-hidden="true" />
        <Editorial />
        <Captions />
        {/* The animated captions are hidden between scenes; this keeps every service readable for assistive tech. */}
        <ul className="visually-hidden">
          {servicePanels.map((s) => (
            <li key={s.title}>
              {s.title}: {s.copy}
            </li>
          ))}
        </ul>
        <div className={j.progress} aria-hidden="true">
          <span data-progress />
        </div>
              </div>
    </section>
  )
}
