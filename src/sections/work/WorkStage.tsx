import { useCallback, useEffect, useRef, useState, type ComponentType, type PointerEvent as ReactPointerEvent } from 'react'
import type * as THREE from 'three'
import { dprCap, decideTier, preferredLiveTier } from '@/workshop/capability'
import { pending } from '@/work/content'
import { featured, imageOf } from '@/work/projects'
import type { CinemaProps } from './cinema/CinemaCanvas'
import type { CinemaWorld, TargetRect } from './cinema/world'
import { Picture } from './Picture'
import styles from './WorkStage.module.css'

const pad = (n: number) => String(n).padStart(2, '0')
const last = featured.length - 1
/** If the 3D scene is not ready by then (slow network, weak GPU), the page shows the plain presentation instead. */
const READY_TIMEOUT_MS = 12000

type Phase = 'loading' | 'intro' | 'gallery'

function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/**
 * The featured builds. With WebGL and motion allowed, the page opens with a flight through the word WORK and down
 * to the first build, then moves between builds by swinging the camera round a ring of exhibits. Without them
 * (reduced motion, no WebGL, a slow device, a lost context) the same builds, text and controls are a plain, fully
 * working presentation. The text and controls are always real HTML.
 */
export function WorkStage() {
  const [tier] = useState(() => decideTier())
  const [cinema, setCinema] = useState(tier.tier !== 'static')
  const [phase, setPhase] = useState<Phase>(cinema ? 'loading' : 'gallery')
  const [introDone, setIntroDone] = useState(!cinema)
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [loaded, setLoaded] = useState<{ Canvas: ComponentType<CinemaProps> } | null>(null)

  /** One texture slot per build. The first gates the opening; the rest fill in while the camera is in the dark. */
  const textures = useRef<(THREE.Texture | null)[]>(featured.map(() => null))
  const stage = useRef<HTMLElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const world = useRef<CinemaWorld | null>(null)
  const indexRef = useRef(0)
  const busy = useRef(false)
  const queued = useRef<number | null>(null)
  const inView = useRef(false)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const sway = useRef(0)
  const mobile = useRef(preferredLiveTier() === 'lite')
  const phaseRef = useRef<Phase>(phase)
  phaseRef.current = phase

  /** Give up on 3D and show the plain presentation. Nothing is lost: same builds, text and controls. */
  const fall = useCallback(() => {
    world.current?.stop()
    lockScroll(false)
    setCinema(false)
    setPhase('gallery')
    setIntroDone(true)
    textures.current.forEach((t) => t?.dispose())
    textures.current = featured.map(() => null)
    setLoaded(null)
    setIndex(indexRef.current)
    setShown(indexRef.current)
    setLeaving(false)
    busy.current = false
    queued.current = null
  }, [])

  const getTarget = useCallback((): TargetRect => {
    const s = stage.current!.getBoundingClientRect()
    const m = media.current!.getBoundingClientRect()
    return {
      cx: (m.left + m.width / 2 - s.left) / s.width,
      cy: (m.top + m.height / 2 - s.top) / s.height,
      w: (m.width / s.width) * 0.96,
      h: (m.height / s.height) * 0.96,
    }
  }, [])

  // Load the 3D chunk and the photographs together. Nothing starts until both are here.
  useEffect(() => {
    if (!cinema) return
    let dead = false
    const timer = window.setTimeout(() => {
      if (!dead && phaseRef.current === 'loading') fall()
    }, READY_TIMEOUT_MS)
    void Promise.all([import('./cinema/CinemaCanvas'), import('./cinema/textures')])
      .then(async ([canvas, tex]) => {
        const small = mobile.current
        const anisotropy = small ? 4 : 8
        const first = await tex.loadPhotoTexture(featured[0]!, small, anisotropy)
        if (dead) {
          first.dispose()
          return
        }
        textures.current[0] = first
        setLoaded({ Canvas: canvas.default })
        // The other builds load in the background; each appears on its exhibit as it arrives.
        featured.slice(1).forEach((project, k) => {
          const i = k + 1
          tex
            .loadPhotoTexture(project, small, anisotropy)
            .then((t) => {
              if (dead) {
                t.dispose()
                return
              }
              textures.current[i] = t
              world.current?.setTexture(i, t)
            })
            .catch(() => {
              if (!dead) fall()
            })
        })
      })
      .catch(() => {
        if (!dead) fall()
      })
    return () => {
      dead = true
      window.clearTimeout(timer)
    }
    // Runs once for the initial attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => lockScroll(false), [])

  const onProgress = useCallback((u: number) => {
    stage.current?.style.setProperty('--u', u.toFixed(4))
    if (u > 0.9 && phaseRef.current !== 'gallery') setPhase('gallery')
  }, [])

  const playIntro = useCallback(() => {
    const w = world.current
    if (!w) return
    window.scrollTo(0, 0)
    lockScroll(true)
    setPhase('intro')
    setIntroDone(false)
    w.play({
      onProgress,
      onDone: () => {
        lockScroll(false)
        setIntroDone(true)
      },
      // A forced tier (?tier=full) is for testing, e.g. on software rendering: never fall back from it.
      onSlow: tier.reason === 'forced' ? undefined : fall,
    })
  }, [fall, onProgress, tier.reason])

  const onReady = useCallback(() => {
    playIntro()
  }, [playIntro])

  const skip = () => {
    world.current?.skip({
      onProgress,
      onDone: () => {
        lockScroll(false)
        setIntroDone(true)
      },
    })
  }

  const replay = () => {
    if (busy.current || !world.current) return
    indexRef.current = 0
    setIndex(0)
    setShown(0)
    stage.current?.style.setProperty('--u', '0')
    playIntro()
  }

  const step = useCallback((to: number) => {
    const w = world.current
    if (!w) return
    busy.current = true
    const from = indexRef.current
    indexRef.current = to
    setIndex(to)
    setLeaving(true)
    w.goTo(from, to, {
      onMid: () => {
        setShown(to)
        setLeaving(false)
      },
      onDone: () => {
        busy.current = false
        const q = queued.current
        queued.current = null
        if (q !== null && q !== indexRef.current) step(q)
      },
    })
  }, [])

  const go = useCallback(
    (raw: number) => {
      const to = Math.min(last, Math.max(0, raw))
      if (cinema) {
        if (!introDone || !world.current) return
        // Rapid clicks never overlap: one move at a time, and only the latest request waits its turn.
        if (busy.current) {
          queued.current = to
          return
        }
        if (to !== indexRef.current) step(to)
      } else if (to !== indexRef.current) {
        indexRef.current = to
        setIndex(to)
        setShown(to)
      }
    },
    [cinema, introDone, step],
  )

  // Arrow keys move between builds while the stage is on screen.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      inView.current = Boolean(entry?.isIntersecting)
    })
    io.observe(el)
    const onKey = (e: KeyboardEvent) => {
      if (!inView.current || e.altKey || e.ctrlKey || e.metaKey) return
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      const from = queued.current ?? indexRef.current
      if (e.key === 'ArrowRight') go(from + 1)
      else if (e.key === 'ArrowLeft') go(from - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      io.disconnect()
      window.removeEventListener('keydown', onKey)
    }
  }, [go])

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') return
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: ReactPointerEvent) => {
    const start = swipe.current
    swipe.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go((queued.current ?? indexRef.current) + (dx < 0 ? 1 : -1))
  }

  // A slight camera parallax with the mouse, only once the camera has landed.
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!cinema || !introDone || e.pointerType !== 'mouse') return
    const now = performance.now()
    if (now - sway.current < 40) return
    sway.current = now
    const r = stage.current!.getBoundingClientRect()
    world.current?.pointer(((e.clientX - r.left) / r.width - 0.5) * 2, -((e.clientY - r.top) / r.height - 0.5) * 2)
  }

  const current = featured[shown]!
  const Canvas = loaded?.Canvas
  const panelReady = phase === 'gallery'

  return (
    <section
      ref={stage}
      className={styles.stage}
      data-cinema={cinema ? '' : undefined}
      data-phase={phase}
      aria-roledescription="carousel"
      aria-label={pending.stage.label}
      onPointerMove={onPointerMove}
    >
      <h1 className="visually-hidden">
        {pending.arrival.first} {pending.arrival.second}. {pending.arrival.line}
      </h1>

      {cinema && Canvas && loaded && (
        <div className={styles.canvasWrap} data-ready={phase !== 'loading' ? '' : undefined}>
          <Canvas
            textures={textures.current}
            photos={featured.map((p) => ({ width: imageOf(p).width, height: imageOf(p).height }))}
            mobile={mobile.current}
            dpr={dprCap[mobile.current ? 'lite' : 'full']}
            getTarget={getTarget}
            controller={world}
            onReady={onReady}
            onFail={fall}
          />
        </div>
      )}

      <div ref={media} className={styles.media} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
        {!cinema &&
          featured.map((p, i) => {
            const photo = imageOf(p)
            return (
              <figure
                key={p.id}
                className={styles.slide}
                data-pos={i < index ? 'before' : i > index ? 'after' : 'current'}
                aria-hidden={i !== index}
              >
                <div className={styles.frame} style={{ ['--ar' as string]: photo.width / photo.height }}>
                  <Picture photo={photo} sizes="(max-width: 959px) 94vw, 72vw" eager={i === 0} className={styles.image} />
                </div>
              </figure>
            )
          })}
      </div>

      {cinema && (
        <div className={styles.hint} aria-hidden={phase === 'gallery'}>
          <p className={styles.tagline}>{pending.arrival.line}</p>
          <p className={styles.note}>
            {pending.arrival.note}
            {phase === 'loading' && <span className={styles.loading}> {pending.stage.loading}…</span>}
          </p>
        </div>
      )}

      {cinema && phase !== 'gallery' && (
        <button type="button" className={styles.skip} onClick={skip} disabled={phase === 'loading'}>
          {pending.stage.skip}
        </button>
      )}

      <div className={styles.panel} data-ready={panelReady ? '' : undefined}>
        <div className={styles.info} key={current.id} data-leaving={leaving ? '' : undefined} aria-live="polite">
          <p className={styles.counter} aria-label={pending.stage.counter(shown + 1, featured.length)}>
            <span className={styles.current} aria-hidden="true">
              {pad(shown + 1)}
            </span>
            <span className={styles.total} aria-hidden="true">
              / {pad(featured.length)}
            </span>
          </p>
          <h2 className={styles.name}>{current.title}</h2>
          <p className={styles.description}>{current.caption}</p>
          {cinema && <p className="visually-hidden">{imageOf(current).alt}</p>}
        </div>

        <div className={styles.controls}>
          {cinema && introDone && (
            <button type="button" className={styles.replay} onClick={replay}>
              {pending.stage.replay}
            </button>
          )}
          <button
            type="button"
            className={styles.step}
            aria-label={pending.stage.previous}
            aria-disabled={index === 0 || !introDone}
            onClick={() => go((queued.current ?? indexRef.current) - 1)}
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <button
            type="button"
            className={styles.step}
            aria-label={pending.stage.next}
            aria-disabled={index === last || !introDone}
            onClick={() => go((queued.current ?? indexRef.current) + 1)}
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </section>
  )
}
