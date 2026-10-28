import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { inspection } from '@/config/servicesPage'
import styles from './Services.module.css'

const ZOOM = 1.9
const points = inspection.points

/**
 * Section 4: an inspection lens over the car. The car sits in shadow; a lens
 * shows it lit and magnified. Scrolling walks the lens front-to-rear through
 * four points, each tied to a real service (on phones the car also pans so the
 * point stays centred). On desktop, moving the mouse over the car takes the
 * lens over; leaving hands it back to the scroll position.
 *
 * Cost: the lens and the magnified image only move by transform, written once
 * per frame from a smoothed position; nothing is drawn while it is still.
 */
export function InspectionLens() {
  const root = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      if (reduced) return
      const q = gsap.utils.selector(root)
      const stage = q('[data-stage]')[0] as HTMLElement
      const pan = q('[data-pan]')[0] as HTMLElement
      const lens = q('[data-lens]')[0] as HTMLElement
      const zoomed = q('[data-zoomed]')[0] as HTMLElement

      // Lens position in image fractions: target (scroll or pointer) and a
      // smoothed current value.
      const scrollPos = { x: points[0]!.x, y: points[0]!.y }
      const target = { ...scrollPos }
      const cur = { ...scrollPos }
      let pointer = false
      let lastActive = 0
      let size = { w: 1, h: 1, lens: 1 }

      const measure = () => {
        size = { w: stage.offsetWidth, h: stage.offsetHeight, lens: lens.offsetWidth }
        gsap.set(zoomed, { width: size.w * ZOOM, height: size.h * ZOOM })
      }
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(stage)

      const setLensX = gsap.quickSetter(lens, 'x', 'px')
      const setLensY = gsap.quickSetter(lens, 'y', 'px')
      const setImgX = gsap.quickSetter(zoomed, 'x', 'px')
      const setImgY = gsap.quickSetter(zoomed, 'y', 'px')

      const tick = () => {
        const tx = pointer ? target.x : scrollPos.x
        const ty = pointer ? target.y : scrollPos.y
        const dx = tx - cur.x
        const dy = ty - cur.y
        if (Math.abs(dx) < 0.0002 && Math.abs(dy) < 0.0002) return
        cur.x += dx * 0.16
        cur.y += dy * 0.16
        const px = cur.x * size.w
        const py = cur.y * size.h
        const r = size.lens / 2
        setLensX(px - r)
        setLensY(py - r)
        setImgX(-(px * ZOOM - r))
        setImgY(-(py * ZOOM - r))

        // Nearest point within reach is the active one.
        let best = -1
        let bestD = 0.09
        points.forEach((p, i) => {
          const d = Math.hypot((p.x - cur.x) * 1.6, p.y - cur.y)
          if (d < bestD) {
            bestD = d
            best = i
          }
        })
        if (best !== -1 && best !== lastActive) {
          lastActive = best
          setActive(best)
        }
      }
      // Force the first write.
      cur.x += 0.001
      gsap.ticker.add(tick)

      // Scroll tour: hold on each point, travel between them.
      const mm = gsap.matchMedia()
      mm.add({ phone: '(max-width: 720px)', fine: '(hover: hover) and (pointer: fine)' }, (ctx) => {
        const { phone, fine } = ctx.conditions!
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * 2.6}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
        tl.fromTo(q('[data-dim]'), { opacity: 0.25 }, { opacity: 1, duration: 0.6, ease: 'none' }, 0)
          .fromTo(lens, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.2)
        const panTo = (x: number) => {
          // Phones: pan the (wider than screen) car so the point sits mid-screen.
          const overflow = pan.scrollWidth - window.innerWidth
          return gsap.utils.clamp(-overflow, 0, window.innerWidth / 2 - x * pan.scrollWidth)
        }
        if (phone) tl.set(pan, { x: () => panTo(points[0]!.x) }, 0)
        points.forEach((p, i) => {
          if (i === 0) return
          const at = 0.8 + (i - 1) * 1.1
          tl.to(scrollPos, { x: p.x, y: p.y, duration: 0.5 }, at)
          if (phone) tl.to(pan, { x: () => panTo(p.x), duration: 0.5 }, at)
        })
        tl.to({}, { duration: 0.6 }) // hold on the last point

        if (!fine) return
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect()
          target.x = gsap.utils.clamp(0, 1, (e.clientX - r.left) / r.width)
          target.y = gsap.utils.clamp(0, 1, (e.clientY - r.top) / r.height)
          pointer = true
        }
        const leave = () => {
          pointer = false
        }
        stage.addEventListener('pointermove', move)
        stage.addEventListener('pointerleave', leave)
        return () => {
          stage.removeEventListener('pointermove', move)
          stage.removeEventListener('pointerleave', leave)
        }
      })

      return () => {
        gsap.ticker.remove(tick)
        ro.disconnect()
      }
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  const { src, alt, width, height } = inspection.image
  const point = points[active]!

  return (
    <section ref={root} className={styles.inspect} data-static={reduced || undefined} aria-labelledby="inspect-title">
      <header className={styles.inspectHead}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          {inspection.kicker}
        </p>
        <h2 id="inspect-title" className={styles.inspectTitle}>
          {inspection.title}
        </h2>
      </header>

      <div className={styles.inspectViewport}>
        <div className={styles.inspectPan} data-pan>
          <div className={styles.inspectStage} data-stage>
            <img className={styles.inspectBase} src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
            <div className={styles.inspectDim} data-dim aria-hidden="true" />
            {points.map((p, i) => (
              <span
                key={p.label}
                className={styles.hotspot}
                data-active={i === active || undefined}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                aria-hidden="true"
              />
            ))}
            <div className={styles.lens} data-lens aria-hidden="true">
              <img className={styles.lensImage} data-zoomed src={src} alt="" decoding="async" />
              <span className={styles.lensRing} />
              <span className={styles.lensZoom}>×{ZOOM}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.inspectInfo} aria-live="polite">
        <p className={styles.inspectStep}>
          {String(active + 1).padStart(2, '0')} <span>/ {String(points.length).padStart(2, '0')}</span>
        </p>
        <div key={active} className={styles.inspectCard}>
          <h3>{point.label}</h3>
          <p>{point.copy}</p>
          <span className={styles.inspectService}>{point.service}</span>
        </div>
      </div>

      {/* Reduced motion: every point listed, no lens */}
      <ol className={styles.inspectList}>
        {points.map((p) => (
          <li key={p.label}>
            <h3>{p.label}</h3>
            <p>{p.copy}</p>
            <span className={styles.inspectService}>{p.service}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
