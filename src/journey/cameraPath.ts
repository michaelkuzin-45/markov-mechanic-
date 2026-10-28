import * as THREE from 'three'

/**
 * One continuous camera path through seven connected spaces laid out along -Z:
 *
 *   z +12..-8     1 white showroom (photo plate)         -8: back wall, two sliding panels
 *   z  -8..-24    2 workshop                     -24: photo installation of turning slats
 *   z -24..-41    3 diagnostic chamber           -41: portal wall with a circular opening
 *   z -41..-56    4 vault with the brake display -56: shutter wall (splits up / down)
 *   z -56..-72    5 turbo exhibition room         -72: wall of four photo slabs
 *   z -72..-92    6 performance showroom          -92: pivot doors
 *   z -92..-108   7 gallery (Porsche photograph)
 *
 * Each key is {pos, look}. The master timeline tweens a fractional key index
 * (J.t) with a different ease per leg: slow and decelerating into a settled
 * composition, continuous through openings.
 */
export interface Key {
  pos: [number, number, number]
  look: [number, number, number]
}

export const KEYS: Record<string, Key> = {
  // opening: one full photograph, then an arc around it
  o0: { pos: [-2.4, 1.9, 18.5], look: [0.4, 2.4, 6] },
  mA: { pos: [-0.9, 2.0, 14.8], look: [0.2, 2.4, 6] },
  mB: { pos: [8.2, 1.9, 10.5], look: [1.5, 2.2, 3] },
  mC: { pos: [7.0, 1.8, -1.5], look: [1.0, 1.9, -10] },
  // 1 showroom
  s1Start: { pos: [5.6, 1.45, 11.2], look: [-1.2, 0.8, 0] },
  s1Settle: { pos: [4.0, 1.05, 5.6], look: [-1.7, 0.7, 0] },
  s1Side: { pos: [4.7, 1.45, 0.6], look: [0, 0.8, -3.5] },
  s1Door: { pos: [1.4, 1.6, -5.2], look: [0, 1.7, -11] },
  // 2 workshop
  s2Enter: { pos: [0.15, 1.75, -8.0], look: [0, 1.9, -22] },
  s2Settle: { pos: [0, 1.75, -12.6], look: [0, 2.1, -24] },
  // 3 chamber
  s3Slats: { pos: [0, 1.9, -22.6], look: [0, 2.2, -30] },
  s3Chamber: { pos: [0, 2.15, -27.3], look: [0.7, 2.2, -35] },
  s3Close: { pos: [0.6, 2.2, -29.6], look: [1.1, 2.25, -35.5] },
  s3Leave: { pos: [0, 2.0, -37.5], look: [0, 1.9, -45] },
  // 4 vault + brake (brake assembly at z -49.5)
  s4Enter: { pos: [-0.5, 1.9, -43.5], look: [1.2, 1.7, -49.5] },
  s4A: { pos: [-0.9, 1.95, -45.8], look: [1.3, 1.7, -49.5] },
  s4B: { pos: [3.1, 2.05, -45.6], look: [1.3, 1.7, -49.5] },
  s4Pass: { pos: [4.0, 1.9, -50.5], look: [0, 1.8, -57] },
  // 5 turbo room (turbo at z -63)
  s5Enter: { pos: [0.4, 2.3, -58.6], look: [0, 2.8, -72] },
  s5A: { pos: [-0.9, 2.4, -62.6], look: [0, 2.8, -72] },
  s5B: { pos: [0.9, 2.4, -62.8], look: [0, 2.8, -72] },
  s5Pass: { pos: [0, 2.4, -69], look: [0, 2.2, -78] },
  // 6 performance showroom (car at z -85)
  s6Enter: { pos: [2.0, 1.7, -73.5], look: [-1.0, 1.9, -83] },
  s6Close: { pos: [3.4, 1.7, -78.8], look: [-1.8, 1.9, -85] },
  s6Wide: { pos: [5.8, 2.3, -75.8], look: [-4.4, 1.9, -85] },
  s6Exit: { pos: [3.6, 1.8, -88.5], look: [0, 2, -96] },
  // 7 gallery
  s7Enter: { pos: [0.5, 1.9, -93.3], look: [0, 2.5, -104] },
  s7Settle: { pos: [0, 1.95, -95.2], look: [0, 2.6, -107] },
}

export const KEY_ORDER = Object.keys(KEYS)
export const keyIndex = (name: keyof typeof KEYS | string) => {
  const i = KEY_ORDER.indexOf(name)
  if (i < 0) throw new Error(`unknown camera key ${name}`)
  return i
}

const posCurve = new THREE.CatmullRomCurve3(KEY_ORDER.map((k) => new THREE.Vector3(...KEYS[k]!.pos)), false, 'centripetal')
const lookCurve = new THREE.CatmullRomCurve3(KEY_ORDER.map((k) => new THREE.Vector3(...KEYS[k]!.look)), false, 'centripetal')
const LAST = KEY_ORDER.length - 1

export function samplePath(t: number, pos: THREE.Vector3, look: THREE.Vector3) {
  const u = THREE.MathUtils.clamp(t / LAST, 0, 1)
  posCurve.getPoint(u, pos)
  lookCurve.getPoint(u, look)
}
