import { booking } from '@/config/booking'
import { fromSite, pending } from '@/workshop/content'
import styles from './Process.module.css'

/**
 * The shop's three steps, then the way in. Until the shop supplies a real destination (config/booking.ts)
 * the booking area says plainly that nothing is connected, rather than offering a button that goes nowhere.
 */
export function Process() {
  const { destination } = booking
  return (
    <section className={styles.process} aria-labelledby="process-title">
      <div className={styles.inner}>
        <h2 id="process-title" className={styles.title}>
          {fromSite.stepsTitle}
        </h2>
        {/* The only numbered list on the page, because this one really is a sequence. */}
        <ol className={styles.steps}>
          {fromSite.steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepCopy}>{s.copy}</p>
            </li>
          ))}
        </ol>

        <div className={styles.cta}>
          <div>
            <h2 className={styles.ctaTitle}>{fromSite.cta.title}</h2>
            <p className={styles.ctaCopy}>{fromSite.cta.copy}</p>
          </div>
          {destination ? (
            <a className={styles.action} href={destination.href}>
              {destination.label}
            </a>
          ) : (
            <div className={styles.state} role="note">
              <p className={styles.stateTitle}>{pending.booking.stateTitle}</p>
              <p className={styles.stateCopy}>{pending.booking.stateCopy}</p>
              <button type="button" className={styles.disabled} disabled>
                {pending.booking.stateButton}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
