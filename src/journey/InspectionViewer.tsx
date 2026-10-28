import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { diagnostics } from '@/config/servicesPage'
import j from './Journey.module.css'

const ZOOM = 1.9
const { image, points } = diagnostics

/**
 * Diagnostics: the real Markov engine-bay photograph as an inspection viewer.
 * Pick a point (click, tap, or arrow keys) and the photograph eases toward it
 * while the panel explains what we check there. It works independently of
 * scrolling; on desktop the card tilts slightly with the pointer for depth.
 */
export function InspectionViewer() {
  const [active, setActive] = useState<number | null>(null)
  const card = useRef<HTMLDivElement>(null)
  const p = active === null ? null : points[active]!

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !card.current) return
    const r = card.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.current.style.setProperty('--ry', `${x * 5}deg`)
    card.current.style.setProperty('--rx', `${-y * 4}deg`)
    card.current.style.setProperty('--px', `${x * -10}px`)
    card.current.style.setProperty('--py', `${y * -8}px`)
  }
  const leave = () => {
    for (const k of ['--ry', '--rx', '--px', '--py']) card.current?.style.setProperty(k, '0')
  }
  const key = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setActive((a) => ((a ?? -1) + 1) % points.length)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setActive((a) => ((a ?? 0) - 1 + points.length) % points.length)
    else if (e.key === 'Escape') setActive(null)
    else return
    e.preventDefault()
  }

  const zoom = p ? ZOOM : 1
  const lim = ((ZOOM - 1) / 2) * 100
  const clamp = (n: number) => Math.max(-lim, Math.min(lim, n))
  const tx = p ? clamp((0.5 - p.x) * ZOOM * 100) : 0
  const ty = p ? clamp((0.5 - p.y) * ZOOM * 100) : 0
  return (
    <div className={j.viewer} data-cap="view1" role="group" aria-label="Diagnostics inspection" onKeyDown={key}>
      <p className={j.viewerHint} data-fade data-seen={active !== null || undefined}>
        <span aria-hidden="true" />
        <b>Diagnostics</b> · Explore the inspection
        <small>Select a point on the engine bay</small>
      </p>
      <div ref={card} className={j.viewerCard} data-fade onPointerMove={move} onPointerLeave={leave}>
        <div className={j.viewerFrame}>
          <div
            className={j.viewerZoom}
            style={{ transform: `translate(${tx}%, ${ty}%) scale(${zoom})` }}
          >
            <img src={image.src} width={image.width} height={image.height} alt={image.alt} className={j.viewerPhoto} draggable={false} />
            {points.map((pt, i) => (
              <button
                key={pt.label}
                type="button"
                className={j.hotspot}
                data-active={i === active || undefined}
                style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%`, ['--inv' as string]: String(1 / zoom) }}
                aria-pressed={i === active}
                aria-label={`${pt.label}: ${pt.checks}`}
                onClick={() => setActive(i === active ? null : i)}
              >
                <i aria-hidden="true" />
                <span>{pt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={j.viewerPanel} aria-live="polite" data-open={p ? true : undefined}>
          {p ? (
            <div key={active} className={j.viewerInfo}>
              <p className={j.viewerStep}>
                {String(active! + 1).padStart(2, '0')} <span>/ {String(points.length).padStart(2, '0')}</span>
              </p>
              <h3>{p.label}</h3>
              <p className={j.viewerChecks}>{p.checks}</p>
              <p>{p.copy}</p>
              <Link to="/contact" className={j.viewerBook}>
                Schedule service <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <p className={j.viewerEmpty}>Select a point to see what we inspect there, or use the arrow keys.</p>
          )}
        </div>
      </div>
    </div>
  )
}
