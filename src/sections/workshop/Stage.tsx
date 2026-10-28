import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { decideTier, hasWebGL2, preferredLiveTier, type Tier } from '@/workshop/capability'
import { fromSite, pending } from '@/workshop/content'
import { hotspotById, hotspots, type HotspotId } from '@/workshop/hotspots'
import { markers } from '@/workshop/markers'
import { photos } from '@/workshop/photos'
import type { FailReason, Pose } from '@/workshop/live/types'
import type { ViewId } from '@/workshop/views'
import { LiveBoundary } from '@/workshop/live/LiveBoundary'
import { StillView, stillFor, type StillId } from './StillView'
import styles from './Stage.module.css'

const LiveView = lazy(() => import('@/workshop/live/LiveView'))

const DOOR_OPEN = 62
const DEFAULT_STEER = 14

/**
 * The first screen: arrival and inspection in one place, so the car is on screen immediately and there is
 * a single WebGL context. Every tier shows the same hotspots; only the picture differs (live 3D, or stills).
 */
export function Stage() {
  const reduced = usePrefersReducedMotion()
  const [decision] = useState(decideTier)
  const [choice, setChoice] = useState<Tier | null>(null) // a visitor's explicit choice beats detection
  const [failure, setFailure] = useState<FailReason | null>(null)
  const tier: Tier = failure ? 'static' : (choice ?? decision.tier)
  const live = tier !== 'static'

  const [hotspotId, setHotspotId] = useState<HotspotId | null>(null)
  const [brakeDetail, setBrakeDetail] = useState(false)
  const [doorOpen, setDoorOpen] = useState(true)
  const [steer, setSteer] = useState(DEFAULT_STEER)
  const [lights, setLights] = useState(true)
  const [resetKey, setResetKey] = useState(0)
  const [touched, setTouched] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const [liveWanted, setLiveWanted] = useState(false)
  const [attempt, setAttempt] = useState(0) // remounts the error boundary when a visitor retries 3D
  const [warm, setWarm] = useState<ReadonlySet<StillId>>(() => new Set<StillId>(['overview']))

  const rootRef = useRef<HTMLElement>(null)
  const markerEls = useRef(new Map<string, HTMLElement>())

  const hotspot = hotspotById(hotspotId)
  const view: ViewId = hotspotId === 'wheels' && brakeDetail ? 'brake' : (hotspot?.view ?? 'overview')
  const pose = useMemo<Pose>(
    () => ({
      doors: [hotspotId === 'cabin' && doorOpen ? DOOR_OPEN : 0, 0],
      steer: hotspotId === 'wheels' && !brakeDetail ? steer : 0,
      lights,
    }),
    [hotspotId, doorOpen, steer, lights, brakeDetail],
  )

  // In the Static tier the picture follows the hotspot; lights only change the overview.
  const stillId = stillFor(view, lights)

  const choose = useCallback(
    (id: HotspotId | null) => {
      setHotspotId(id)
      setBrakeDetail(false)
      setDoorOpen(true)
      setSteer(DEFAULT_STEER)
      setTouched(true)
      // The stills only have a lights-off version of the overview, so don't carry that hidden state elsewhere.
      if (!live) setLights(true)
    },
    [live],
  )

  const warmUp = useCallback((id: HotspotId) => {
    const next = hotspotById(id)?.view
    if (next) setWarm((s) => (s.has(next) ? s : new Set(s).add(next)))
  }, [])

  // Only draw while the stage is on screen.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActive(Boolean(e?.isIntersecting)), { threshold: 0.02 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The first paint is the still. The 3D chunk and model load afterwards, when the browser is idle.
  useEffect(() => {
    if (!live || liveWanted) return
    const start = () => {
      performance.mark('workshop:live-requested')
      // Start the model download and Draco decode as soon as the chunk arrives, in parallel with the viewer
      // building its reflection map, instead of after it.
      void import('@/workshop/live/LiveView').then((m) => m.preloadModel(tier as 'full' | 'lite'))
      setLiveWanted(true)
    }
    // Safari has no requestIdleCallback.
    const w = window as Window & { requestIdleCallback?: typeof requestIdleCallback; cancelIdleCallback?: typeof cancelIdleCallback }
    if (w.requestIdleCallback && w.cancelIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 1500 })
      return () => w.cancelIdleCallback!(id)
    }
    const id = window.setTimeout(start, 600)
    return () => window.clearTimeout(id)
  }, [live, liveWanted, tier])

  // Escape closes the open hotspot.
  useEffect(() => {
    if (!hotspotId) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && choose(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hotspotId, choose])

  const onFail = useCallback((reason: FailReason) => {
    // The first reason wins: tearing the canvas down fires a context-loss event of its own.
    setFailure((previous) => previous ?? reason)
    setReady(false)
  }, [])

  const canGoLive = !live && hasWebGL2()
  const resumeLive = () => {
    setFailure(null)
    setChoice(preferredLiveTier())
    setReady(false)
    setLiveWanted(false)
    setAttempt((n) => n + 1)
  }

  const lightsAvailable = live || view === 'overview'

  // Once the live car has faded in, the stills are unmounted so they stop costing memory and requests.
  const stillVisible = !(live && ready)
  const [stillMounted, setStillMounted] = useState(true)
  useEffect(() => {
    if (stillVisible) {
      setStillMounted(true)
      return
    }
    const t = window.setTimeout(() => setStillMounted(false), 1000)
    return () => window.clearTimeout(t)
  }, [stillVisible])

  return (
    <section ref={rootRef} className={styles.stage} aria-labelledby="workshop-title" data-tier={tier} data-compact={hotspotId ? '' : undefined}>
      <div className={styles.media} data-live={live && ready ? '' : undefined}>
        {stillMounted && (
          <div className={styles.stillLayer} data-hidden={stillVisible ? undefined : ''}>
            <StillView id={live && !ready ? 'overview' : stillId} warm={warm} hero />
          </div>
        )}
        {live && liveWanted && (
          <LiveBoundary key={attempt} onError={() => onFail('error')}>
            <Suspense fallback={null}>
              <div className={styles.canvasLayer} data-ready={ready ? '' : undefined}>
                <LiveView
                  tier={tier as 'full' | 'lite'}
                  view={view}
                  pose={pose}
                  active={active}
                  motion={!reduced}
                  autoRotate={tier === 'full' && !reduced && !touched}
                  resetKey={resetKey}
                  markerEls={markerEls}
                  onReady={() => {
                    performance.mark('workshop:live-ready')
                    setReady(true)
                  }}
                  onFail={onFail}
                  onInteract={() => setTouched(true)}
                />
              </div>
            </Suspense>
          </LiveBoundary>
        )}
        {live && ready && (
          <div className={styles.markers}>
            {markers.map((m) => (
              <button
                key={m.id}
                type="button"
                className={styles.marker}
                data-active={m.hotspot === hotspotId ? '' : undefined}
                tabIndex={-1}
                aria-hidden="true"
                ref={(el) => {
                  if (el) markerEls.current.set(m.id, el)
                  else markerEls.current.delete(m.id)
                }}
                onClick={() => choose(m.hotspot === hotspotId ? null : m.hotspot)}
              >
                <span className={styles.markerDot} />
                <span className={styles.markerLabel}>{hotspotById(m.hotspot)?.title}</span>
              </button>
            ))}
          </div>
        )}
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      <div className={styles.copy}>
        <header className={styles.head}>
          <h1 id="workshop-title" className={styles.title}>
            {fromSite.title}
          </h1>
          <p className={styles.place}>{fromSite.place}</p>
        </header>

        <div className={styles.intro} data-collapsed={hotspotId ? '' : undefined}>
          <div className={styles.introInner}>
            <p className={styles.statement}>{pending.statement}</p>
            {fromSite.intro.map((p) => (
              <p key={p} className={styles.body}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <h2 className={styles.listTitle}>{pending.stageHeading}</h2>
        <ul className={styles.list}>
          {hotspots.map((h) => {
            const open = h.id === hotspotId
            return (
              <li key={h.id} className={styles.row} data-open={open ? '' : undefined}>
                <button
                  type="button"
                  className={styles.rowButton}
                  aria-expanded={open}
                  aria-controls={`panel-${h.id}`}
                  onClick={() => choose(open ? null : h.id)}
                  onPointerEnter={() => warmUp(h.id)}
                  onFocus={() => warmUp(h.id)}
                >
                  <span className={styles.rowTitle}>{h.title}</span>
                  <span className={styles.rowService}>{h.service.title}</span>
                </button>
                <div id={`panel-${h.id}`} className={styles.panel} role="region" aria-label={h.title} hidden={!open}>
                  <div className={styles.panelInner}>
                    <p className={styles.body}>{h.service.copy}</p>

                    {h.id === 'wheels' && (
                      <div className={styles.tools}>
                        {live && (
                          <label className={styles.slider}>
                            <span>{pending.hotspots.wheels.cue}</span>
                            <input
                              type="range"
                              min={-25}
                              max={25}
                              step={1}
                              value={steer}
                              disabled={brakeDetail}
                              onChange={(e) => {
                                setSteer(Number(e.target.value))
                                setTouched(true)
                              }}
                            />
                          </label>
                        )}
                        <button type="button" className={styles.toolButton} data-on={brakeDetail ? '' : undefined} onClick={() => setBrakeDetail((v) => !v)}>
                          {brakeDetail ? 'Back to the wheel' : 'Closer look at the brake'}
                        </button>
                      </div>
                    )}

                    {h.id === 'cabin' && live && (
                      <div className={styles.tools}>
                        <button type="button" className={styles.toolButton} data-on={doorOpen ? '' : undefined} onClick={() => setDoorOpen((v) => !v)}>
                          {doorOpen ? 'Close the door' : 'Open the door'}
                        </button>
                      </div>
                    )}

                    {h.id === 'engine' && (
                      <figure className={styles.photoCard}>
                        <img src={photos.engine.src} srcSet={photos.engine.srcSet} sizes="(max-width: 960px) 94vw, 50vw" width={photos.engine.width} height={photos.engine.height} alt="Engine bay of a turbocharged Mazda Miata with a copper-finish valve cover, blue silicone hoses, an aluminium radiator and a turbocharger." loading="lazy" decoding="async" />
                        <figcaption>{pending.engine.lead}</figcaption>
                      </figure>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <p className={styles.note}>{pending.modelNote}</p>
      </div>

      <div className={styles.controls}>
        <p className={styles.hint}>{live ? pending.stageHint : ''}</p>
        <div className={styles.buttons}>
          {lightsAvailable && (
            <button type="button" className={styles.control} aria-pressed={lights} onClick={() => setLights((v) => !v)}>
              {pending.controls.lights}
            </button>
          )}
          {live && (
            <button type="button" className={styles.control} onClick={() => setResetKey((k) => k + 1)}>
              {pending.controls.reset}
            </button>
          )}
          {live ? (
            <button type="button" className={styles.control} onClick={() => setChoice('static')}>
              {pending.controls.stills}
            </button>
          ) : (
            canGoLive && (
              <button type="button" className={styles.control} onClick={resumeLive}>
                {pending.controls.live}
              </button>
            )
          )}
        </div>
        <p className={styles.status} role="status">
          {failure === 'slow' ? pending.controls.degraded : failure === 'context-lost' ? pending.controls.contextLost : ''}
        </p>
      </div>
    </section>
  )
}
