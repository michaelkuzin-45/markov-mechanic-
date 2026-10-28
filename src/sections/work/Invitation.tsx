import { useRef } from 'react'
import { booking } from '@/config/booking'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { fromSite, pending } from '@/work/content'
import styles from './Invitation.module.css'

/**
 * The way in. The button reads the one shared destination in config/booking.ts; while the shop has not supplied one,
 * the section says so plainly instead of showing a button that goes nowhere.
 */
export function Invitation() {
  const root = useRef<HTMLElement>(null)
  const { destination } = booking

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('[data-rise]', { yPercent: 105 })
        gsap.set('[data-fade]', { opacity: 0, y: 18 })
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 65%',
          once: true,
          onEnter: () => {
            gsap.to('[data-rise]', { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12 })
            gsap.to('[data-fade]', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.4, stagger: 0.1 })
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className={styles.invitation} aria-labelledby="invitation-title">
      <div className={styles.inner}>
        <h2 id="invitation-title" className={styles.title}>
          <span className={styles.line}>
            <span className={styles.word} data-rise>
              {pending.closing.first}
            </span>
          </span>
          <span className={styles.line}>
            <span className={`${styles.word} ${styles.accent}`} data-rise>
              {pending.closing.second}
            </span>
          </span>
        </h2>

        <div className={styles.side}>
          <p className={styles.question} data-fade>
            {fromSite.closingQuestion}
          </p>
          <p className={styles.body} data-fade>
            {fromSite.closingBody}
          </p>
          <div data-fade>
            {destination ? (
              <a className={styles.action} href={destination.href}>
                {destination.label}
              </a>
            ) : (
              <div className={styles.state} role="note">
                <p className={styles.stateTitle}>{pending.closing.stateTitle}</p>
                <p className={styles.stateCopy}>{pending.closing.stateCopy}</p>
                <button type="button" className={styles.disabled} disabled>
                  {pending.closing.stateButton}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
