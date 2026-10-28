import * as THREE from 'three'

/**
 * The camera's one continuous shot: toward the word, through the counter of the "O", on through the dark,
 * a banking dive toward the floor, then a level, slightly rising settle in front of the first photograph.
 *
 * Everything is a function of one number, `u` from 0 to 1, measured along the length of a single smooth curve.
 * The shot is therefore always continuous: nothing is cut or teleported, and it can be scrubbed, skipped or
 * replayed by moving `u`.
 */
export interface FlightInput {
  /** Camera distance in front of the word at the start. */
  dStart: number
  /** Height of the word's centre (the camera flies level with it, then dives). */
  wordY: number
  /** Horizontal position of the "O"'s counter, in world units. */
  oX: number
  /** Where the camera comes to rest. */
  end: THREE.Vector3
  /** Peak roll in radians. */
  maxRoll: number
}

export interface Flight {
  length: number
  /** `u` at which the camera is 6 units in front of the word, and 6 units past it: the letters shatter between. */
  uBreakStart: number
  uBreakEnd: number
  /** Camera position at `u`. */
  position(u: number, out: THREE.Vector3): THREE.Vector3
  /** Unit direction of travel at `u`. */
  tangent(u: number, out: THREE.Vector3): THREE.Vector3
  /** Roll about the view axis at `u`, radians. */
  roll(u: number): number
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function buildFlight(input: FlightInput): Flight {
  const { dStart, wordY: Y, oX, end, maxRoll } = input
  const pts = [
    new THREE.Vector3(0, Y, dStart),
    // Straight on at first, so the opening frame looks square at the word; the drift toward the O comes late.
    new THREE.Vector3(0, Y, dStart * 0.5),
    new THREE.Vector3(oX * 0.5, Y, dStart * 0.2),
    new THREE.Vector3(oX, Y, 0),
    new THREE.Vector3(oX * 0.6, Y - 0.5, -12),
    new THREE.Vector3(3.4, Y - 4.2, -21),
    new THREE.Vector3(4.6, Y * 0.52, -30),
    new THREE.Vector3(2.4, Y * 0.2, -38),
    new THREE.Vector3(-0.4, 1.5, end.z + 7),
    end.clone(),
  ]
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const length = curve.getLength()

  // Where along the curve the letters shatter, found by sampling.
  const N = 400
  let uBreakStart = 0
  let uBreakEnd = 1
  for (let i = 0; i <= N; i++) {
    const u = i / N
    const z = curve.getPointAt(u).z
    if (z <= 6 && uBreakStart === 0) uBreakStart = u
    if (z <= -6) {
      uBreakEnd = u
      break
    }
  }

  // Roll from how fast the heading turns, smoothed, normalised to the peak and eased to zero at both ends.
  const M = 240
  const heading: number[] = []
  const tan = new THREE.Vector3()
  for (let i = 0; i <= M; i++) {
    curve.getTangentAt(i / M, tan)
    heading.push(Math.atan2(tan.x, -tan.z))
  }
  const rate = heading.map((h, i) => (i === 0 ? 0 : h - heading[i - 1]!))
  const smoothed = rate.map((_, i) => {
    let sum = 0
    let n = 0
    for (let k = -10; k <= 10; k++) {
      const v = rate[Math.min(M, Math.max(0, i + k))]!
      sum += v
      n++
    }
    return sum / n
  })
  const peak = Math.max(...smoothed.map(Math.abs)) || 1
  const rolls = smoothed.map((r, i) => {
    const u = i / M
    const taper = smooth(0, 0.08, u) * (1 - smooth(0.9, 1, u))
    return -(r / peak) * maxRoll * taper
  })

  return {
    length,
    uBreakStart,
    uBreakEnd,
    position: (u, out) => curve.getPointAt(Math.min(1, Math.max(0, u)), out),
    tangent: (u, out) => curve.getTangentAt(Math.min(1, Math.max(0, u)), out),
    roll: (u) => {
      const f = Math.min(M - 1e-6, Math.max(0, u * M))
      const i = Math.floor(f)
      const a = rolls[i]!
      const b = rolls[Math.min(M, i + 1)]!
      return a + (b - a) * (f - i)
    },
  }
}
