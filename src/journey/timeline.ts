import { gsap } from '@/lib/gsap'
import { keyIndex } from './cameraPath'
import { J, resetJourney } from './state'

/**
 * The master timeline: one scrubbed GSAP timeline that owns the camera, every
 * architectural transformation, every room's lighting and every caption.
 * Units are arbitrary; the scroll length is `duration * vhPerUnit`.
 *
 *   intro        0 - 5.4   real Markov workshop photograph, camera pulls back, story lines
 *   2 workshop   5.4 - 6.2 Maintenance (slats then turn edge-on)
 *   3 chamber    6.2 - 14.4 engine photo, inspection points, portal
 *   4 brakes    14.4 - 21.2 photographs of the brake master cylinder and strut mount
 *   5 turbo     21.2 - 28.2 engine photo wall with interactive turbo / intake markers
 *   6 performance 28.2 - 36.2 Corvette photograph, pivot doors
 *   7 gallery   36.2 - 40  Porsche photograph, closing call to action
 *
 * `t()` converts the original scene times to the current ones (the old
 * showroom opening was removed, which shifted everything earlier).
 */
const K = keyIndex
const O = -1.9
const t = (x: number) => +(x + O).toFixed(2)

type Ease = string

export interface Built {
  tl: gsap.core.Timeline
  duration: number
}

export function buildTimeline(root: HTMLElement): Built {
  resetJourney()
  J.t = K('o0')
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

  // Every state tween is a fromTo with a known start value, so scrubbing in any
  // order (jumps, reverse) always lands on the same pose.
  const last: Record<string, number> = { t: K('o0'), driftX: 0, driftY: 0 }
  const anim = (key: keyof typeof J, to: number, at: number, dur: number, ease: Ease) => {
    const from = last[key] ?? (J[key] as number)
    tl.fromTo(J, { [key]: from } as gsap.TweenVars, { [key]: to, duration: dur, ease, immediateRender: false } as gsap.TweenVars, at)
    last[key] = to
  }

  // --- camera travel ----------------------------------------------------
  const cam = (to: string, at: number, end: number, ease: Ease) => anim('t', K(to), at, end - at, ease)
  cam('mA', 0, 1.4, 'power2.out') // the red Miata photograph, full frame, easing in
  cam('mB', 2.4, 3.8, 'power1.inOut') // arcs around the side of the photograph
  cam('mC', 3.8, 4.9, 'power1.inOut')
  cam('s2Settle', 4.9, 6.4, 'power2.inOut') // into the workshop
  cam('s3Chamber', t(10.7), t(12.6), 'power1.inOut') // through the slats (s3Slats)
  cam('s3Close', t(12.6), t(16.2), 'sine.inOut')
  cam('s4Enter', t(16.4), t(18.6), 'power1.inOut') // through s3Leave and the portal
  cam('s4A', t(18.6), t(19.6), 'power2.out')
  cam('s4B', t(19.8), t(22.4), 'sine.inOut')
  cam('s5Enter', t(23.0), t(25.4), 'power1.inOut') // through s4Pass and the shutter wall
  cam('s5A', t(25.4), t(26.3), 'power2.out')
  cam('s5B', t(26.5), t(29.1), 'sine.inOut')
  cam('s6Enter', t(30.0), t(32.4), 'power1.inOut') // through s5Pass and the slab wall
  cam('s6Close', t(32.4), t(34.2), 'power1.inOut')
  cam('s6Wide', t(34.4), t(36.0), 'power2.inOut')
  cam('s7Enter', t(38.0), t(40.4), 'power1.inOut') // through s6Exit and the pivot doors
  cam('s7Settle', t(40.4), t(41.8), 'power2.out')

  // Idle drift while a composition is held: never snaps, alternates direction.
  let dir = 1
  const drift = (at: number, len: number, d = 0.12) => {
    anim('driftX', d * dir, at, len, 'sine.inOut')
    anim('driftY', 0.03 * dir, at, len, 'sine.inOut')
    dir *= -1
  }
  drift(6.4, 1.0, 0.1)
  drift(t(12.6), 3.6, 0.1)
  drift(t(19.6), 3.2, 0.08)
  drift(t(26.3), 3.4, 0.08)
  drift(t(34.2), 2.2, 0.1)
  drift(t(41.8), 2.2, 0.1)

  // --- architecture -----------------------------------------------------
  anim('scan', 1, t(12.8), 1.0, 'power1.inOut')
  anim('markers', 1, t(12.9), 0.6, 'power2.out')
  ;[1, 2, 3].forEach((m, i) => tl.set(J, { marker: m }, t(13.9) + i * 0.95))
  anim('markers', 0, t(16.1), 0.5, 'power2.in')
  anim('scan', 0, t(16.1), 0.01, 'none')
  anim('photoSlide', 1, t(16.4), 1.2, 'power2.inOut')
  anim('portal', 1, t(17.3), 1.0, 'power2.out')
  anim('brake', 1, t(19.8), 1.3, 'power2.inOut')
  anim('brake', 0, t(22.0), 1.1, 'power2.inOut')
  anim('shutter', 1, t(23.6), 1.3, 'power2.inOut')
  anim('slabs', 1, t(30.0), 1.5, 'power2.inOut')
  anim('pivot', 1, t(38.0), 1.5, 'power2.inOut')

  // --- lighting: each room is lit as the camera arrives, dimmed as it leaves
  const light = (key: keyof typeof J, from: number, to: number, level: number) => anim(key, level, t(from), to - from, 'sine.inOut')
  light('lightShop', 12.0, 13.0, 0)
  light('lightChamber', 11.0, 12.6, 1)
  light('lightVault', 17.4, 18.8, 1)
  light('lightChamber', 18.0, 19.0, 0)
  light('lightTurbo', 24.0, 25.2, 1)
  light('lightVault', 25.0, 26.0, 0)
  light('lightShow2', 30.8, 32.4, 1)
  light('lightTurbo', 32.0, 33.0, 0)
  light('lightGallery', 38.8, 40.4, 1)
  light('lightShow2', 40.0, 41.0, 0)

  // --- captions ----------------------------------------------------------
  const caption = (id: string, inAt: number, outAt: number | null) => {
    const el = q(`[data-cap="${id}"]`)
    if (!el.length) return
    const lines = el[0]!.querySelectorAll('[data-line]')
    const fades = el[0]!.querySelectorAll('[data-fade]')
    tl.set(el, { autoAlpha: 1 }, inAt)
    if (lines.length) tl.fromTo(lines, { yPercent: 112 }, { yPercent: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, inAt)
    if (fades.length) tl
      .fromTo(fades, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power2.out' }, inAt + 0.25)
    if (outAt !== null) {
      if (lines.length) tl.to(lines, { yPercent: -112, duration: 0.45, stagger: 0.05, ease: 'power2.in' }, outAt)
      tl.to(fades, { y: -14, opacity: 0, duration: 0.35, stagger: 0.03, ease: 'power1.in' }, outAt)
        .set(el, { autoAlpha: 0 }, outAt + 0.6)
    }
  }
  tl.set(q('[data-cap], [data-ed]'), { autoAlpha: 0 }, 0)
  caption('open', 0.3, 2.0)
  caption('beat1', 2.7, 3.9)
  caption('beat2', 4.2, 5.4)
  caption('beat3', 5.7, 6.9)
  caption('svc0', 7.4, t(10.5) + 0.4)

  // Editorial photographs: clip reveal, slow parallax drift, clip away.
  const figure = (id: string, inAt: number, outAt: number) => {
    const el = q(`[data-ed="${id}"]`)
    if (!el.length) return
    const inner = el[0]!.querySelector('[data-ed-inner]')
    const bleed = el[0]!.getAttribute('data-kind') === 'bleed'
    tl.set(el, { autoAlpha: 1 }, inAt)
    if (bleed) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, inAt)
    else tl.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power3.out' }, inAt)
    tl.fromTo(inner, { scale: 1.14, yPercent: 5 }, { scale: 1, yPercent: -5, duration: outAt - inAt, ease: 'none' }, inAt)
    if (bleed) tl.to(el, { opacity: 0, duration: 0.6, ease: 'power1.in' }, outAt)
    else tl.to(el, { clipPath: 'inset(100% 0 0% 0)', duration: 0.6, ease: 'power2.in' }, outAt)
    tl.set(el, { autoAlpha: 0 }, outAt + 0.65)
  }
  figure('ed1', 2.8, 4.0)
  figure('ed2a', 4.3, 5.6)
  figure('ed2b', 4.6, 5.6)
  figure('ed3', 5.8, 7.0)
  figure('ed4', 7.2, t(10.5) + 0.5)
  caption('svc1', t(12.9), t(16.2))
  caption('view1', t(12.9), t(16.2))
  caption('svc2', t(19.3), t(23.0))
  caption('svc3', t(26.0), t(29.9))
  caption('svc4', t(34.9), t(37.9))
  caption('closing', t(41.5), null)

  const end = t(41.8) + 2.2
  tl.fromTo(q('[data-progress]'), { scaleX: 0 }, { scaleX: 1, duration: end, ease: 'none' }, 0)
  tl.to({}, { duration: 2.2 }, t(41.8)) // settled finale
  return { tl, duration: tl.duration() }
}
