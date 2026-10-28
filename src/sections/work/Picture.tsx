import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { pending } from '@/work/content'
import type { SiteImage } from '@/images/registry'
import styles from './Picture.module.css'

interface PictureProps {
  photo: SiteImage
  /** `sizes` for the responsive srcset. */
  sizes: string
  eager?: boolean
  className?: string
  style?: CSSProperties
  objectPosition?: string
}

/**
 * One photograph with honest states: invisible while it loads (the frame behind it holds the space), faded in when
 * it arrives, and a plain notice if it cannot be fetched, so a broken file never leaves a hole or a broken-image icon.
 */
export function Picture({ photo, sizes, eager, className, style, objectPosition }: PictureProps) {
  const ref = useRef<HTMLImageElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  // A cached image can finish before React attaches onLoad.
  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth > 0) setState('ready')
  }, [])

  if (state === 'error') {
    return (
      <div className={`${styles.error} ${className ?? ''}`} style={style} role="img" aria-label={photo.alt}>
        {pending.unavailable}
      </div>
    )
  }

  return (
    <img
      ref={ref}
      className={`${styles.picture} ${className ?? ''}`}
      style={{ ...style, objectPosition }}
      data-state={state}
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
      onLoad={() => setState('ready')}
      onError={() => setState('error')}
    />
  )
}
