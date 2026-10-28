import { useRef, type CSSProperties } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { opening, photos, storyBeats } from '@/config/servicesPage'
import { Photo } from './Photo'
import styles from './Services.module.css'

/**
 * Sections 1 + 2: the opening shot and the pinned cinematic sequence.
 *
 * One pinned stage, one scrubbed timeline (fully reversible): the opening
 * pushes out, then three shots follow (slit, side wipe, rise), each with a
 * landing, a held composition for reading, and an exit. Each shot carries its
 * own grade: cool -> neutral -> warm. Reduced motion: no pin; they stack.
 */
const TONES = ['cool', 'neutral', 'warm'] as const

export function ServicesStory() {
  const root = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      const q = gsap.utils.selector(root)

      // --- Opening entrance (time-based, plays once on arrival) ---------------
      const split = SplitText.create(q('[data-split]'), { type: 'chars', charsClass: styles.char })
      gsap
        .timeline({ delay: 0.25 })
        .from(q('[data-open-media]'), { scale: 1.22, duration: 2.6, ease: 'expo.out' }, 0)
        .from(split.chars, { yPercent: 115, duration: 1.15, ease: 'expo.out', stagger: 0.028 }, 0.35)
        .from(q('[data-open-accent]'), { yPercent: 115, duration: 1.2, ease: 'expo.out' }, 0.75)
        .from(q('[data-open-fade]'), { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.9)
        .fromTo(q('[data-sweep]'), { xPercent: -120 }, { xPercent: 420, duration: 2.2, ease: 'power2.inOut' }, 0.6)

      // --- Scroll sequence ----------------------------------------------------
      const mm = gsap.matchMedia()
      mm.add('(min-width: 721px)', () => build(5))
      mm.add('(max-width: 720px)', () => build(4.2))

      /**
       * Camera language for the whole page: every shot pushes in slowly and
       * settles (scale only ever decreases toward rest, never rotates), B
       * trucks sideways in the direction it was wiped in from, and shots
       * enter along the same axis the next section moves on (vertical rise
       * for C, which hands over to the service panels rising from below).
       * Text arrives only after the picture has landed, then the picture
       * holds still while it is read.
       */
      function build(screens: number) {
        const layers = q('[data-layer]')
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * screens}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // Opening out: the Gallardo keeps pushing in as the headline lifts away
        tl.to(q('[data-open-camera]'), { scale: 1.16, yPercent: -2, duration: 1.4 }, 0)
          .to(q('[data-open-line]'), { yPercent: -70, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power1.in' }, 0.05)
          .to(q('[data-open-meta]'), { y: -24, opacity: 0, duration: 0.4 }, 0)
          .to(q('[data-open-shade]'), { opacity: 0.75, duration: 0.9 }, 0.2)

        const shot = (i: number) => {
          const layer = layers[i]!
          return {
            layer,
            camera: layer.querySelector('[data-camera]')!,
            beat: layer.querySelector('[data-beat]')!,
            lines: layer.querySelectorAll('[data-beat-line]'),
            meta: layer.querySelectorAll('[data-beat-meta]'),
          }
        }
        const beatIn = (s: ReturnType<typeof shot>, at: number) =>
          tl
            .fromTo(s.lines, { yPercent: 110 }, { yPercent: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out' }, at)
            .fromTo(s.meta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }, at + 0.15)
        const beatOut = (s: ReturnType<typeof shot>, at: number) =>
          tl
            .to(s.lines, { yPercent: -110, duration: 0.4, stagger: 0.06, ease: 'power2.in' }, at)
            .to(s.meta, { opacity: 0, y: -12, duration: 0.3 }, at)
        // The copy drifts a little against the camera while it is on screen (depth).
        const drift = (s: ReturnType<typeof shot>, at: number, len: number) =>
          tl.fromTo(s.beat, { yPercent: 2 }, { yPercent: -2, duration: len }, at)

        // Shot A: a widescreen slit opens out of the dark; slow push-in
        const a = shot(0)
        tl.fromTo(a.layer, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' }, 0.9)
          .fromTo(a.camera, { scale: 1.14 }, { scale: 1.02, duration: 2.6, ease: 'power1.out' }, 0.9)
        beatIn(a, 1.95)
        drift(a, 1.95, 1.6)
        beatOut(a, 3.45)

        // Shot B: wipes in from the right while the camera trucks the same way
        const b = shot(1)
        tl.fromTo(b.layer, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' }, 3.6)
          .fromTo(b.camera, { xPercent: 3.5, scale: 1.1 }, { xPercent: -3.5, scale: 1.1, duration: 2.8, ease: 'power1.out' }, 3.6)
        beatIn(b, 4.65)
        drift(b, 4.65, 1.6)
        beatOut(b, 6.2)

        // Shot C: rises from below (the axis the service panels arrive on) and settles
        const c = shot(2)
        tl.fromTo(c.layer, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' }, 6.35)
          .fromTo(c.camera, { yPercent: 3, scale: 1.1 }, { yPercent: 0, scale: 1.02, duration: 2.4, ease: 'power1.out' }, 6.35)
        beatIn(c, 7.4)
        tl.to({}, { duration: 1 }) // settled hold on the last composition

        tl.fromTo(q('[data-progress]'), { scaleX: 0 }, { scaleX: 1, duration: tl.duration() }, 0)
      }
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <section ref={root} className={styles.story} data-static={reduced || undefined} aria-label="Services introduction">
      {/* Opening */}
      <div className={styles.opening}>
        <div className={styles.fill} data-open-camera>
          <div className={styles.fill} data-open-media>
            <Photo photo={photos.miataWorkshop} eager className={`${styles.fill} ${styles.shot}`} />
          </div>
        </div>
        <div className={styles.openingGrade} aria-hidden="true" />
        <div className={styles.sweep} data-sweep aria-hidden="true" />
        <div className={styles.openingShade} data-open-shade aria-hidden="true" />

        <div className={styles.openingContent}>
          <p className={styles.eyebrow} data-open-meta>
            <span data-open-fade>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              02 · {opening.eyebrow}
            </span>
          </p>
          <h1 className={styles.openingTitle} aria-label={opening.lines.join(' ')}>
            {opening.lines.map((line, i) => {
              const accent = i === opening.lines.length - 1
              return (
                <span key={line} className={styles.mask} data-open-line aria-hidden="true">
                  <span className={accent ? styles.accentLine : styles.lineInner} {...(accent ? { 'data-open-accent': '' } : { 'data-split': '' })}>
                    {line}
                  </span>
                </span>
              )
            })}
          </h1>
          <div className={styles.openingFoot} data-open-meta>
            <p className={styles.lede} data-open-fade>
              {opening.lede}
            </p>
            <p className={styles.scrollCue} data-open-fade aria-hidden="true">
              <span>Scroll</span>
              <i />
            </p>
          </div>
        </div>
      </div>

      {/* Shots */}
      {storyBeats.map((beat, i) => (
        <div key={beat.kicker} className={styles.layer} data-layer>
          <div className={styles.fill} data-camera>
            <Photo photo={beat.photo} className={`${styles.fill} ${styles.shot}`} eager={i === 0} style={{ '--focus-mobile': beat.focusMobile } as CSSProperties} />
          </div>
          <div className={styles.layerGrade} data-tone={TONES[i]} aria-hidden="true" />
          <div className={styles.beat} data-beat data-align={i % 2 ? 'end' : 'start'}>
            <p className={styles.beatKicker} data-beat-meta>
              <span className={styles.beatIndex}>{String(i + 1).padStart(2, '0')}</span>
              {beat.kicker}
            </p>
            <h2 className={styles.beatTitle}>
              {beat.lines.map((line) => (
                <span key={line} className={styles.mask}>
                  <span className={styles.lineInner} data-beat-line>
                    {line}
                  </span>
                </span>
              ))}
            </h2>
            {beat.body && (
              <p className={styles.beatBody} data-beat-meta>
                {beat.body}
              </p>
            )}
          </div>
        </div>
      ))}

      <div className={styles.progress} aria-hidden="true">
        <span data-progress />
      </div>
    </section>
  )
}
