import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import styles from './FloatingNavCards.module.css'

export interface NavCardItem {
  index: string
  title: string
  copy: string
  path: string
  image?: string
}

interface FloatingNavCardsProps {
  items: readonly NavCardItem[]
  /** Entrance state: cards rise in when true and settle out when false. */
  visible?: boolean
  /** Static grid without floating, entrance or launch animation. */
  still?: boolean
  label?: string
  className?: string
}

const LAUNCH_MS = 720
const MAX_TILT = 9 // degrees

/**
 * Navigation cards suspended in space: each hovers on its own slow cycle,
 * tilts toward the pointer, and on click flies at the viewer through a short
 * tunnel of light streaks before the route changes.
 *
 * Motion is CSS (float, entrance, hover) plus one canvas for the tunnel;
 * pointer tilt writes the card's transform directly (no React re-render).
 * Reduced motion: no float, no tilt, plain navigation.
 */
export function FloatingNavCards({ items, visible = true, still = false, label = 'Explore', className }: FloatingNavCardsProps) {
  const reducedMotion = usePrefersReducedMotion()
  const navigate = useNavigate()
  const [launching, setLaunching] = useState<number | null>(null)
  const timers = useRef<number[]>([])
  const calm = still || reducedMotion

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), [])

  const onTilt = (e: PointerEvent<HTMLAnchorElement>) => {
    if (calm || e.pointerType !== 'mouse' || launching !== null) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateZ(24px)`
    el.style.setProperty('--glare-x', `${((px + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--glare-y', `${((py + 0.5) * 100).toFixed(1)}%`)
  }

  const onLeave = (e: PointerEvent<HTMLAnchorElement>) => {
    if (launching !== null) return
    e.currentTarget.style.transform = ''
  }

  const onClick = (e: MouseEvent<HTMLAnchorElement>, i: number, path: string) => {
    if (calm || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    if (launching !== null) return
    e.currentTarget.style.transform = ''
    setLaunching(i)
    timers.current.push(window.setTimeout(() => navigate(path, { state: { launched: true } }), LAUNCH_MS))
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-still={calm || undefined}>
      <ul
        className={styles.stage}
        aria-label={label}
        data-visible={visible || undefined}
        data-launching={launching !== null || undefined}
      >
        {items.map((item, i) => (
          <li
            key={item.path + item.title}
            className={styles.slot}
            data-selected={launching === i || undefined}
            style={{ '--i': i } as CSSProperties}
          >
            <div className={styles.float}>
              <Link
                to={item.path}
                className={styles.card}
                onPointerMove={onTilt}
                onPointerLeave={onLeave}
                onClick={(e) => onClick(e, i, item.path)}
                tabIndex={visible ? undefined : -1}
              >
                {item.image && (
                  <span className={styles.media} aria-hidden="true">
                    <img src={item.image} alt="" loading="lazy" decoding="async" />
                  </span>
                )}
                <span className={styles.glare} aria-hidden="true" />
                <span className={styles.body}>
                  <span className={styles.index}>{item.index}</span>
                  <span className={styles.title}>{item.title}</span>
                  <span className={styles.copy}>{item.copy}</span>
                  <span className={styles.more} aria-hidden="true">
                    Explore <span className={styles.arrow}>→</span>
                  </span>
                </span>
              </Link>
            </div>
            <span className={styles.shadow} aria-hidden="true" />
          </li>
        ))}
      </ul>
      {!calm && (
        <>
          <div className={styles.blackout} data-active={launching !== null || undefined} aria-hidden="true" />
        </>
      )}
    </div>
  )
}
