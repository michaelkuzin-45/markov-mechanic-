import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ScrollTrigger } from '@/lib/gsap'
import { site } from '@/config/site'
import { heroCaptions } from '@/config/services'
import { destinations } from '@/config/destinations'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { FrameSequencePlayer } from '@/scene/sequence/FrameSequencePlayer'
import { frameSets, isConstrainedDevice, pickFrameSet, type FrameSet } from '@/scene/sequence/frameSets'
import { FloatingNavCards } from '@/components/FloatingNavCards/FloatingNavCards'
import styles from './Hero.module.css'

const EASE = [0.16, 1, 0.3, 1] as const
const headline = ['Markov', 'Automotive']

/**
 * Scroll map (progress p of the pinned section, 0..1):
 *   0.00-0.84  camera move: front, front three-quarter, side, overhead, rear
 *   0.84-1.00  holds on the rear view while the navigation cards float in
 */
const CAMERA_END = 0.84
const CARDS_AT = 0.865

/** Overlay beats as [fade in start, fully in, fade out start, fully out]. */
const INTRO_BEAT = '0,0,0.035,0.1'
const CAPTION_BEATS = ['0.17,0.22,0.3,0.35', '0.42,0.47,0.56,0.61', '0.68,0.72,0.79,0.83']
const DIM_BEAT = '0.82,0.88,2,2'

function beatValue(p: number, [a, b, c, d]: number[]) {
  if (p <= a) return a === b ? 1 : 0
  if (p < b) return (p - a) / (b - a)
  if (p <= c) return 1
  if (p < d) return 1 - (p - c) / (d - c)
  return 0
}

/**
 * Homepage hero: a pre-rendered Blender camera move around the car, scrubbed
 * by scroll and fully reversible, with the three captions and the
 * floating navigation cards at the end. (The light streaks that used to fly
 * past were removed on request; everything else is unchanged.) The section is several screens tall;
 * its sticky inner frame holds the canvas and overlays.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const railRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [ready, setReady] = useState(false)
  const [cardsVisible, setCardsVisible] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    const constrained = isConstrainedDevice()
    let set: FrameSet = pickFrameSet(window.innerWidth, window.innerHeight)
    const makePlayer = (s: FrameSet) => {
      const p = new FrameSequencePlayer(canvas, s, {
        stride: constrained ? 2 : 1,
        crossfade: !constrained,
        onFirstFrame: () => setReady(true),
      })
      p.load()
      return p
    }
    let player = makePlayer(set)
    let target = 0
    let current = 0
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        target = self.progress
      },
    })
    target = current = trigger.progress

    const beats = Array.from(section.querySelectorAll<HTMLElement>('[data-beat]')).map((el) => ({
      el,
      window: el.dataset.beat!.split(',').map(Number),
      lift: Number(el.dataset.lift ?? 28),
      last: -1,
    }))

    let raf = 0
    let last = performance.now()
    let display = current
    let still = 0
    let cardsOn = false
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      // Ease toward the scroll position: smooth, never lags far behind.
      current += (target - current) * (1 - Math.exp(-8 * dt))
      if (Math.abs(target - current) < 1e-4) current = target

      const cam = Math.min(1, current / CAMERA_END)
      // While moving, neighbouring frames cross-fade (soft motion). Once the
      // scroll rests, glide onto the nearest exact frame so stills are crisp.
      still = current === target ? still + dt : 0
      if (still > 0.12) {
        const n = set.count - 1
        const snap = Math.round(cam * n) / n
        display += (snap - display) * (1 - Math.exp(-10 * dt))
        if (Math.abs(snap - display) < 1e-4) display = snap
      } else {
        display = cam
      }
      player.draw(display)

      if (railRef.current) railRef.current.style.transform = `scaleY(${current.toFixed(4)})`
      for (const beat of beats) {
        const v = Math.round(beatValue(current, beat.window) * 100) / 100
        if (v === beat.last) continue
        beat.last = v
        beat.el.style.opacity = String(v)
        if (beat.lift) beat.el.style.transform = `translate3d(0, ${((1 - v) * beat.lift).toFixed(1)}px, 0)`
        beat.el.style.visibility = v > 0 ? 'visible' : 'hidden'
        beat.el.inert = v < 0.5
      }
      const on = current >= CARDS_AT
      if (on !== cardsOn) {
        cardsOn = on
        setCardsVisible(on)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onResize = () => {
      const next = pickFrameSet(window.innerWidth, window.innerHeight)
      if (next.id !== set.id) {
        player.dispose()
        set = next
        player = makePlayer(set)
      } else {
        player.resize()
      }
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      trigger.kill()
      player.dispose()
    }
  }, [reducedMotion])

  const staticMode = reducedMotion

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      data-static={staticMode || undefined}
      aria-labelledby="hero-title"
    >
      <div className={styles.sticky}>
        <picture className={styles.poster} data-hidden={(ready && !staticMode) || undefined}>
          <source media="(max-aspect-ratio: 4/5)" srcSet={frameSets.mobile.url(0)} />
          <img src={frameSets.desktop.url(0)} alt="" fetchPriority="high" decoding="async" />
        </picture>
        {!staticMode && (
          <canvas ref={canvasRef} className={styles.canvas} data-ready={ready || undefined} aria-hidden="true" />
        )}

        <div className={styles.vignette} aria-hidden="true" />
        {!staticMode && <div className={styles.dim} data-beat={DIM_BEAT} data-lift="0" aria-hidden="true" />}

        <div className={styles.content} data-beat={staticMode ? undefined : INTRO_BEAT}>
          <div className={styles.titleBlock}>
            <motion.p
              className={styles.eyebrow}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            >
              <span className={styles.eyebrowLine} />
              {site.tagline} <span className={styles.eyebrowDot}>·</span> {site.location}
            </motion.p>

            <h1 id="hero-title" className={styles.title}>
              {headline.map((line, i) => (
                <span key={line} className={styles.lineMask}>
                  <motion.span
                    className={i === headline.length - 1 ? styles.lineAccent : styles.line}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.2, delay: 0.35 + i * 0.12, ease: EASE }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>

          <motion.div
            className={styles.footer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: EASE }}
          >
            <p className={styles.lede}>
              Maintenance, diagnostics and performance work for enthusiast cars, and the
              everyday ones too.
            </p>
            <div className={styles.actions}>
              <Link to="/services" className={styles.primary}>
                Explore Services
              </Link>
              <Link to="/contact" className={styles.secondary}>
                Schedule Service
              </Link>
            </div>
          </motion.div>
        </div>

        {!staticMode &&
          heroCaptions.map((c, i) => (
            <div
              key={c.title}
              className={styles.caption}
              data-side={i % 2 ? 'right' : 'left'}
              data-beat={CAPTION_BEATS[i]}
            >
              <span className={styles.captionIndex}>{c.index}</span>
              <p className={styles.captionTitle}>{c.title}</p>
              <p className={styles.captionCopy}>{c.copy}</p>
            </div>
          ))}

        <div className={styles.cardsLayer} data-on={cardsVisible || staticMode || undefined}>
          <div className={styles.cardsHead}>
            <p className={styles.cardsEyebrow}>Markov Auto · {site.location}</p>
            <h2 className={styles.cardsTitle}>Where to next?</h2>
          </div>
          <FloatingNavCards
            items={destinations}
            visible={cardsVisible || staticMode}
            still={staticMode}
            label="Explore Markov Automotive"
          />
        </div>

        {!staticMode && (
          <div className={styles.rail} aria-hidden="true">
            <span ref={railRef} className={styles.railFill} />
          </div>
        )}

        {!staticMode && (
          // Outer element fades with scroll; inner element owns the entrance animation.
          <div className={styles.scrollCue} data-beat={INTRO_BEAT} aria-hidden="true">
            <motion.div
              className={styles.scrollCueInner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              <span>Scroll</span>
              <span className={styles.scrollTrack}>
                <span className={styles.scrollThumb} />
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
