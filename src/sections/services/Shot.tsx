import type { CSSProperties } from 'react'
import { frameSets } from '@/scene/sequence/frameSets'

const { desktop, mobile } = frameSets
/** Same camera position in the portrait set (fewer frames over the same path). */
const toMobile = (frame: number) => Math.round((frame * (mobile.count - 1)) / (desktop.count - 1))

interface ShotProps {
  frame: number
  className?: string
  /** object-position, e.g. '30% 60%' */
  focus?: string
  eager?: boolean
  /** Portrait screens get the portrait-framed render (full-screen shots only). */
  portrait?: boolean
  style?: CSSProperties
}

/** A still from the homepage render sequence (TEMPORARY imagery, see config/servicesPage.ts). */
export function Shot({ frame, className, focus, eager, portrait = true, style }: ShotProps) {
  return (
    <picture className={className} style={style}>
      {portrait && (
        <source media="(max-aspect-ratio: 4/5)" srcSet={mobile.url(toMobile(frame))} type="image/webp" />
      )}
      <img
        src={desktop.url(frame)}
        alt=""
        width={desktop.width}
        height={desktop.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={focus ? { objectPosition: focus } : undefined}
      />
    </picture>
  )
}
