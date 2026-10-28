import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { servicePanels } from '@/config/servicesPage'
import { Photo } from './Photo'
import styles from './Services.module.css'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/**
 * Section 3: the five services as full-screen panels that stack. Each one
 * slides up over the last; the panel underneath sinks back and dims. On
 * entry the image settles out of a zoom and the title, copy and detail chips
 * rise in, all scrubbed so scrolling back plays it in reverse.
 * Desktop pointer: the photo drifts toward the cursor, the button leans in.
 */
export function ServicePanels() {
  const root = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', root.current)
      const last = panels[panels.length - 1]!

      panels.forEach((panel, i) => {
        const inner = panel.querySelector('[data-panel-inner]')!
        // Pin each panel until the last one arrives, so the next slides over it.
        if (i < panels.length - 1) {
          ScrollTrigger.create({ trigger: panel, start: 'top top', endTrigger: last, end: 'top top', pin: true, pinSpacing: false })
          gsap.to(inner, {
            scale: 0.94,
            yPercent: -3,
            ease: 'none',
            scrollTrigger: { trigger: panels[i + 1], start: 'top bottom', end: 'top top', scrub: true },
          })
          gsap.to(panel.querySelector('[data-panel-dim]'), {
            opacity: 0.85,
            ease: 'none',
            scrollTrigger: { trigger: panels[i + 1], start: 'top bottom', end: 'top top', scrub: true },
          })
        }

        // Entry: image settles out of a zoom, text rises (the first panel's
        // entry happens as it scrolls up over the story section).
        gsap.fromTo(
          panel.querySelector('[data-panel-zoom]'),
          { scale: 1.12, yPercent: 4 },
          { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'top top', scrub: true } },
        )
        gsap
          .timeline({ scrollTrigger: { trigger: panel, start: 'top 55%', end: 'top -5%', scrub: 0.6 } })
          .fromTo(panel.querySelectorAll('[data-panel-line]'), { yPercent: 110 }, { yPercent: 0, stagger: 0.12, ease: 'power3.out' }, 0)
          .fromTo(
            panel.querySelectorAll('[data-panel-fade]'),
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.08, ease: 'power2.out' },
            0.25,
          )
          .fromTo(
            panel.querySelectorAll('[data-chip]'),
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.04, ease: 'power2.out' },
            0.45,
          )
      })

      // Pointer: photo drifts toward the cursor, CTA is magnetic.
      const mm = gsap.matchMedia()
      mm.add(FINE_POINTER, () => {
        const cleanups = panels.map((panel) => {
          const pan = panel.querySelector('[data-panel-pan]')!
          const cta = panel.querySelector<HTMLElement>('[data-cta]')!
          const ease = { duration: 0.9, ease: 'power3.out' }
          const px = gsap.quickTo(pan, 'x', ease)
          const py = gsap.quickTo(pan, 'y', ease)
          const cx = gsap.quickTo(cta, 'x', { duration: 0.5, ease: 'power3.out' })
          const cy = gsap.quickTo(cta, 'y', { duration: 0.5, ease: 'power3.out' })
          const move = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5
            const ny = e.clientY / window.innerHeight - 0.5
            px(nx * -22)
            py(ny * -14)
            const r = cta.getBoundingClientRect()
            const dx = e.clientX - (r.left + r.width / 2)
            const dy = e.clientY - (r.top + r.height / 2)
            const near = Math.hypot(dx, dy) < 120
            cx(near ? dx * 0.3 : 0)
            cy(near ? dy * 0.3 : 0)
          }
          const leave = () => {
            px(0)
            py(0)
            cx(0)
            cy(0)
          }
          panel.addEventListener('pointermove', move)
          panel.addEventListener('pointerleave', leave)
          return () => {
            panel.removeEventListener('pointermove', move)
            panel.removeEventListener('pointerleave', leave)
          }
        })
        return () => cleanups.forEach((c) => c())
      })
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <section ref={root} className={styles.panels} data-static={reduced || undefined} aria-labelledby="services-title">
      <h2 id="services-title" className="visually-hidden">
        Our services
      </h2>
      {servicePanels.map((s, i) => (
        <article key={s.title} className={styles.panel} data-panel aria-labelledby={`service-${i}`}>
          <div className={styles.panelInner} data-panel-inner>
            <div className={styles.panelMedia}>
              <div className={styles.panelPan} data-panel-pan>
                <div className={styles.fill} data-panel-zoom>
                  <Photo
                    photo={s.photo}
                    focus={s.focus}
                    className={`${styles.fill} ${styles.shot}`}
                    style={{ transform: `scale(${s.zoom})`, transformOrigin: s.focus, '--op-m': s.focusMobile } as CSSProperties}
                  />
                </div>
              </div>
              <div className={styles.panelGrade} aria-hidden="true" />
            </div>

            <div className={styles.panelContent}>
              <p className={styles.panelIndex} data-panel-fade>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.panelCount}>/ {String(servicePanels.length).padStart(2, '0')}</span>
              </p>
              <h3 id={`service-${i}`} className={styles.panelTitle}>
                {s.title.split(' + ').map((part, k, all) => (
                  <span key={part} className={styles.mask}>
                    <span className={styles.lineInner} data-panel-line>
                      {part}
                      {k < all.length - 1 && <span className={styles.plus}> +</span>}
                    </span>
                  </span>
                ))}
              </h3>
              <p className={styles.panelCopy} data-panel-fade>
                {s.copy}
              </p>
              <ul className={styles.chips} aria-label={`${s.title} includes`}>
                {s.details.map((d) => (
                  <li key={d} data-chip>
                    {d}
                  </li>
                ))}
              </ul>
              <div data-panel-fade>
                <Link to="/contact" className={styles.panelCta} data-cta>
                  Schedule service
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
          <div className={styles.panelDim} data-panel-dim aria-hidden="true" />
        </article>
      ))}
    </section>
  )
}
