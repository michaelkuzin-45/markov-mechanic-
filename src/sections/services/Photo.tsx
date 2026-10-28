import type { CSSProperties } from 'react'
import type { Photo as PhotoData } from '@/config/servicesPage'

interface PhotoProps {
  photo: PhotoData
  className?: string
  /** Overrides the photo's own object-position. */
  focus?: string
  eager?: boolean
  style?: CSSProperties
}

/** A real photograph from the Markov Automotive site (see config/servicesPage.ts). */
export function Photo({ photo, className, focus, eager, style }: PhotoProps) {
  return (
    <picture className={className} style={style}>
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes="(max-width: 900px) 100vw, 60vw"
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={{ objectPosition: `var(--op, ${focus ?? photo.focus})` }}
      />
    </picture>
  )
}
