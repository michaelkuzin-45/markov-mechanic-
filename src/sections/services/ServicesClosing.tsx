import { useRef } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { closing } from '@/config/servicesPage'
import { Photo } from './Photo'
import styles from './Services.module.css'

/**
 * Section 5: the rear of the car, tail lights on, pulled into frame as the
 * section arrives; the call to action rises in over it.
 */
export function ServicesClosing() {
  const root = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      const q = gsap.utils.selector(root)
      gsap.fromTo(
        q('[data-close-camera]'),
        { scale: 1.1, yPercent: 4 },
        { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true } },
      )
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top 35%', end: 'top -10%', scrub: 0.6 } })
        .fromTo(q('[data-close-line]'), { yPercent: 110 }, { yPercent: 0, stagger: 0.15, ease: 'power3.out' }, 0)
        .fromTo(q('[data-close-fade]'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, ease: 'power2.out' }, 0.3)
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <section ref={root} className={styles.closing} aria-labelledby="closing-title">
      <div className={styles.closingMedia}>
        <div className={styles.fill} data-close-camera>
          <Photo photo={closing.photo} className={`${styles.fill} ${styles.shot}`} />
        </div>
        <div className={styles.closingGrade} aria-hidden="true" />
      </div>
      <div className={styles.closingContent}>
        <p className={styles.eyebrow} data-close-fade>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          {closing.kicker}
        </p>
        <h2 id="closing-title" className={styles.closingTitle}>
          {closing.lines.map((line, i) => (
            <span key={line} className={styles.mask}>
              <span className={i === closing.lines.length - 1 ? styles.accentLine : styles.lineInner} data-close-line>
                {line}
              </span>
            </span>
          ))}
        </h2>
        <div className={styles.closingActions} data-close-fade>
          <Link to="/contact" className={styles.primary}>
            Schedule Service <span aria-hidden="true">→</span>
          </Link>
          <Link to="/" className={styles.secondary}>
            Back to the showroom
          </Link>
        </div>
      </div>
    </section>
  )
}
