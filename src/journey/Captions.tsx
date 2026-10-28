import { Link } from 'react-router'
import { opening, storyBeats, servicePanels, closing } from '@/config/servicesPage'
import styles from '@/sections/services/Services.module.css'
import { InspectionViewer } from './InspectionViewer'
import j from './Journey.module.css'

/** Every caption of the journey. The master timeline shows and hides them by data-cap id. */
export function Captions() {
  return (
    <div className={j.caps}>
      <div className={j.cap} data-cap="open" data-pos="start">
        <p className={styles.eyebrow} data-fade>
          <span>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            02 · {opening.eyebrow}
          </span>
        </p>
        <h1 className={styles.openingTitle} aria-label={opening.lines.join(' ')}>
          {opening.lines.map((line, i) => (
            <span key={line} className={styles.mask} aria-hidden="true">
              <span className={i === opening.lines.length - 1 ? styles.accentLine : styles.lineInner} data-line>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p className={styles.lede} data-fade>
          {opening.lede}
        </p>
      </div>

      {storyBeats.map((beat, i) => (
        <div key={beat.kicker} className={j.cap} data-cap={`beat${i + 1}`} data-pos="start">
          <p className={styles.beatKicker} data-fade>
            <span className={styles.beatIndex}>{String(i + 1).padStart(2, '0')}</span>
            {beat.kicker}
          </p>
          <h2 className={styles.beatTitle}>
            {beat.lines.map((line) => (
              <span key={line} className={styles.mask}>
                <span className={styles.lineInner} data-line>
                  {line}
                </span>
              </span>
            ))}
          </h2>
          {beat.body && (
            <p className={styles.beatBody} data-fade>
              {beat.body}
            </p>
          )}
        </div>
      ))}

      {servicePanels.map((s, i) => (
        <div key={s.title} className={j.cap} data-cap={`svc${i}`} data-pos="start" role="group" aria-label={s.title}>
          <p className={styles.panelIndex} data-fade>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.panelCount}>/ {String(servicePanels.length).padStart(2, '0')}</span>
          </p>
          <h3 className={styles.panelTitle}>
            {s.title.split(' + ').map((part, k, all) => (
              <span key={part} className={styles.mask}>
                <span className={styles.lineInner} data-line>
                  {part}
                  {k < all.length - 1 && <span className={styles.plus}> +</span>}
                </span>
              </span>
            ))}
          </h3>
          <p className={styles.panelCopy} data-fade>
            {s.copy}
          </p>
          <ul className={styles.chips} aria-label={`${s.title} includes`} data-fade>
            {s.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <div data-fade>
            <Link to="/contact" className={styles.panelCta}>
              Schedule service
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ))}

      <InspectionViewer />

      <div className={j.cap} data-cap="closing" data-pos="start">
        <p className={styles.eyebrow} data-fade>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          {closing.kicker}
        </p>
        <h2 className={styles.closingTitle}>
          {closing.lines.map((line, i) => (
            <span key={line} className={styles.mask}>
              <span className={i === closing.lines.length - 1 ? styles.accentLine : styles.lineInner} data-line>
                {line}
              </span>
            </span>
          ))}
        </h2>
        <div className={styles.closingActions} data-fade>
          <Link to="/contact" className={styles.primary}>
            Schedule Service <span aria-hidden="true">→</span>
          </Link>
          <Link to="/" className={styles.secondary}>
            Back to the showroom
          </Link>
        </div>
      </div>
    </div>
  )
}
