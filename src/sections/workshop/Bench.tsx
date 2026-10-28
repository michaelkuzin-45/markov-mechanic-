import { useState } from 'react'
import { fromSite, pending } from '@/workshop/content'
import { photos } from '@/workshop/photos'
import styles from './Bench.module.css'

/**
 * Real photographs of a turbocharged Mazda Miata, annotated. Callout labels describe only what can be seen
 * in the picture (pending Dima's approval); the descriptive paragraph is the shop's own Turbo Systems wording.
 */
export function Bench() {
  const { bench } = pending
  const [active, setActive] = useState<string | null>(null)
  const turbo = fromSite.service.turbo

  return (
    <section className={styles.bench} aria-labelledby="bench-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 id="bench-title" className={styles.title}>
            {bench.heading}
          </h2>
          <p className={styles.lead}>{bench.lead}</p>
        </header>

        <div className={styles.grid}>
          <figure className={styles.main}>
            <div className={styles.frame}>
              <img
                src={photos.engine.src}
                srcSet={photos.engine.srcSet}
                sizes="(max-width: 960px) 94vw, 62vw"
                width={photos.engine.width}
                height={photos.engine.height}
                alt="Engine bay of a turbocharged Mazda Miata: an aluminium radiator on the left, a copper-finish valve cover in the centre, blue silicone hoses and a turbocharger with an intake filter below."
                loading="lazy"
                decoding="async"
              />
              {bench.callouts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={styles.callout}
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  data-active={active === c.id ? '' : undefined}
                  // A pointer nicety only: the legend list beside the photo names every part, so these are hidden from assistive tech.
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={() => setActive((a) => (a === c.id ? null : c.id))}
                  onPointerEnter={() => setActive(c.id)}
                  onPointerLeave={() => setActive(null)}
                >
                  <span className={styles.calloutDot} />
                  <span className={styles.calloutLabel}>{c.label}</span>
                </button>
              ))}
            </div>
            <figcaption className={styles.caption}>{bench.carLabel}</figcaption>
          </figure>

          <div className={styles.side}>
            <h3 className={styles.sideTitle}>{turbo.title}</h3>
            <p className={styles.sideCopy}>{turbo.copy}</p>
            <ul className={styles.legend}>
              {bench.callouts.map((c) => (
                <li key={c.id} data-active={active === c.id ? '' : undefined}>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.strip}>
          <figure>
            <img src={photos.hoodUp.src} srcSet={photos.hoodUp.srcSet} sizes="(max-width: 720px) 94vw, 45vw" width={photos.hoodUp.width} height={photos.hoodUp.height} alt="The Miata parked in the workshop bay with its hood up." loading="lazy" decoding="async" />
            <figcaption className={styles.caption}>{bench.hood}</figcaption>
          </figure>
          <figure>
            <img src={photos.bay.src} srcSet={photos.bay.srcSet} sizes="(max-width: 720px) 94vw, 45vw" width={photos.bay.width} height={photos.bay.height} alt="The Miata parked in a workshop bay with shelving, a floor jack and tires around it." loading="lazy" decoding="async" />
            <figcaption className={styles.caption}>{bench.garage}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
