import { fromSite, pending } from '@/workshop/content'
import { photos, type WorkshopPhoto } from '@/workshop/photos'
import styles from './Vehicles.module.css'

interface Line {
  name: string
  note?: string
  photo?: { image: WorkshopPhoto; alt: string; caption: string }
}

/**
 * Each line carries a photograph only where the shop's own photographs show that kind of car. "Custom & DIY builds"
 * has no matching photograph, so it stays as type rather than being filled with an unrelated picture.
 * All photographs are pending client approval (docs/image-inventory.md).
 */
const enthusiast: Line[] = [
  {
    name: fromSite.enthusiast[0]!,
    photo: { image: photos.bay, alt: 'A blue Mazda Miata parked in a workshop bay.', caption: pending.vehicles.miataCaption },
  },
  {
    name: fromSite.enthusiast[1]!,
    photo: { image: photos.classic, alt: 'A red and white classic Chevrolet Corvette convertible.', caption: pending.vehicles.classicCaption },
  },
  {
    name: fromSite.enthusiast[2]!,
    photo: { image: photos.engineTall, alt: 'A turbocharged Miata engine bay with a copper-finish valve cover and blue hoses.', caption: pending.vehicles.modifiedCaption },
  },
  { name: fromSite.enthusiast[3]! },
]

const everyday: Line[] = [
  {
    name: fromSite.everyday,
    note: fromSite.everydayNote,
    photo: { image: photos.everyday, alt: 'A dark blue Mercedes-Benz E-Class sedan parked outside a brick building.', caption: pending.vehicles.everydayCaption },
  },
]

function Group({ label, lines }: { label: string; lines: Line[] }) {
  return (
    <section className={styles.group} aria-label={label}>
      <h3 className={styles.groupLabel}>{label}</h3>
      <ul className={styles.lines}>
        {lines.map((l) => (
          <li key={l.name} className={styles.line} data-photo={l.photo ? '' : undefined}>
            <div className={styles.lineText}>
              <p className={styles.name}>{l.name}</p>
              {l.note && <p className={styles.note}>{l.note}</p>}
            </div>
            {l.photo && (
              <figure className={styles.thumb}>
                <img
                  src={l.photo.image.src}
                  srcSet={l.photo.image.srcSet}
                  sizes="(max-width: 720px) 90vw, 40vw"
                  width={l.photo.image.width}
                  height={l.photo.image.height}
                  alt={l.photo.alt}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{l.photo.caption}</figcaption>
              </figure>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Vehicles() {
  return (
    <section className={styles.vehicles} aria-labelledby="vehicles-title">
      <div className={styles.inner}>
        <h2 id="vehicles-title" className={styles.title}>
          {pending.vehicles.heading}
        </h2>
        <p className={styles.lead}>{fromSite.intro[0]}</p>
        <Group label={pending.vehicles.enthusiastLabel} lines={enthusiast} />
        <Group label={pending.vehicles.everydayLabel} lines={everyday} />
      </div>
    </section>
  )
}
