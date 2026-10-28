import { useRef } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { services } from '@/config/services'
import { site } from '@/config/site'
import styles from './IntroSection.module.css'

/** The workshop and its services, in the shop's own words (markovautomotive.com). */
export function IntroSection() {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set('[data-reveal]', { clearProps: 'all' })
        return
      }
      // fromTo (not from) so end values are explicit — `from` reads the
      // current state as its target, which breaks under StrictMode re-runs.
      gsap.fromTo(
        '[data-reveal]',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        },
      )
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section ref={ref} className={styles.intro} aria-labelledby="intro-title">
      <div className={styles.inner}>
        <div className={styles.lead}>
          <p className={styles.eyebrow} data-reveal>
            Our workshop · {site.location}
          </p>
          <h2 id="intro-title" className={styles.heading} data-reveal>
            Built for <em>enthusiast cars.</em>
          </h2>
          <p className={styles.body} data-reveal>
            We mainly specialize in servicing enthusiast cars, including 1990s Miatas, classic
            Corvettes, modified cars, and custom or DIY builds. We also service and maintain
            regular cars. If your car needs maintenance or repair, we are more than happy to help.
          </p>
          <Link to="/contact" className={styles.cta} data-reveal>
            Tell us what your car needs <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className={styles.pillars} aria-label="Services">
          {services.map((s, i) => (
            <li key={s.title} className={styles.pillar} data-reveal>
              <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
