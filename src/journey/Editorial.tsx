import { images, type ImageId } from '@/images/registry'
import j from './Journey.module.css'

interface Fig {
  id: string
  image: ImageId
  alt: string
  kind: 'card' | 'bleed'
  pos?: 'a' | 'b'
}

const FIGS: Fig[] = [
  { id: 'ed1', image: 'porsche', alt: 'Red Porsche Cayman S by the coast', kind: 'card' },
  { id: 'ed2a', image: 'miataRed', alt: 'Red first-generation Mazda Miata', kind: 'card', pos: 'a' },
  { id: 'ed2b', image: 'corvetteClassic', alt: 'Red and white classic Chevrolet Corvette convertible', kind: 'card', pos: 'b' },
  { id: 'ed3', image: 'mercedes', alt: 'Dark blue Mercedes-Benz E-Class sedan', kind: 'card' },
  { id: 'ed4', image: 'garageBay', alt: 'Blue Mazda Miata parked inside the Markov Auto workshop', kind: 'bleed' },
]

/** Authentic photographs as a restrained editorial layer: revealed with a clip, drifting slowly (see timeline.ts). */
export function Editorial() {
  return (
    <div className={j.edLayer} aria-hidden="false">
      {FIGS.map((f) => (
        <figure key={f.id} className={j.ed} data-ed={f.id} data-kind={f.kind} data-pos={f.pos}>
          <div className={j.edInner} data-ed-inner>
            <img
              src={images[f.image].small}
              srcSet={images[f.image].srcSet}
              sizes="(max-width: 900px) 90vw, 48vw"
              width={images[f.image].width}
              height={images[f.image].height}
              alt={f.alt}
              loading="lazy"
              decoding="async"
            />
          </div>
        </figure>
      ))}
    </div>
  )
}
