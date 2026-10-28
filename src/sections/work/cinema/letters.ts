import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * The words "THE" and "WORK" as solid, extruded, geometric capitals (the installed three has no bundled font, and
 * the page's own font cannot be turned into geometry without a new dependency). Each letter is built from straight
 * strokes and arcs on a grid one unit tall.
 *
 * The result is a single non-indexed mesh. Every triangle also carries its own centre and a random vector, which the
 * shatter shader uses to throw the triangles apart without any per-frame simulation.
 */
const STROKE = 0.27
const DEPTH = 0.36

type Pt = [number, number]

const poly = (pts: Pt[]) => {
  const s = new THREE.Shape()
  pts.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)))
  s.closePath()
  return s
}
const rect = (x0: number, y0: number, x1: number, y1: number) =>
  poly([
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ])
/** A stroke between a point on the top edge and a point on the bottom edge, `h` wide measured horizontally. */
const diagonal = (topX: number, bottomX: number, h: number, top = 1, bottom = 0) =>
  poly([
    [topX - h / 2, top],
    [topX + h / 2, top],
    [bottomX + h / 2, bottom],
    [bottomX - h / 2, bottom],
  ])

interface Glyph {
  width: number
  parts: THREE.Shape[]
}

function glyphs(): Record<string, Glyph> {
  const t = STROKE

  const O = (() => {
    const rx = 0.56
    const ry = 0.5
    const shape = new THREE.Shape()
    shape.absellipse(rx, ry, rx, ry, 0, Math.PI * 2, false, 0)
    const hole = new THREE.Path()
    hole.absellipse(rx, ry, rx - t * 1.05, ry - t * 0.95, 0, Math.PI * 2, true, 0)
    shape.holes.push(hole)
    return { width: rx * 2, parts: [shape] }
  })()

  const R = (() => {
    const w = 0.96
    const yBottom = 0.3
    const r = (1 - yBottom) / 2
    const tb = 0.22 // the bowl is thinner than the stem so its counter stays open
    const cy = yBottom + r
    const bowl = new THREE.Shape()
    bowl.moveTo(0, yBottom)
    bowl.lineTo(0, 1)
    bowl.lineTo(w - r, 1)
    bowl.absarc(w - r, cy, r, Math.PI / 2, -Math.PI / 2, true)
    bowl.lineTo(0, yBottom)
    const hole = new THREE.Path()
    hole.moveTo(t, yBottom + tb)
    hole.lineTo(t, 1 - tb)
    hole.lineTo(w - r, 1 - tb)
    hole.absarc(w - r, cy, r - tb, Math.PI / 2, -Math.PI / 2, true)
    hole.lineTo(t, yBottom + tb)
    bowl.holes.push(hole)
    return {
      width: w,
      parts: [rect(0, 0, t, yBottom + 0.02), bowl, diagonal(0.44, w - 0.1, 0.3, yBottom + 0.02, 0)],
    }
  })()

  return {
    T: { width: 0.95, parts: [rect(0, 1 - t, 0.95, 1), rect((0.95 - t) / 2, 0, (0.95 + t) / 2, 1 - t)] },
    H: { width: 0.98, parts: [rect(0, 0, t, 1), rect(0.98 - t, 0, 0.98, 1), rect(t, 0.5 - t / 2, 0.98 - t, 0.5 + t / 2)] },
    E: {
      width: 0.82,
      parts: [rect(0, 0, t, 1), rect(t, 0, 0.82, t), rect(t, 0.5 - t / 2, 0.74, 0.5 + t / 2), rect(t, 1 - t, 0.82, 1)],
    },
    W: {
      width: 1.5,
      parts: [diagonal(0.14, 0.45, 0.3), diagonal(0.75, 0.45, 0.3), diagonal(0.75, 1.05, 0.3), diagonal(1.36, 1.05, 0.3)],
    },
    O,
    R,
    K: {
      width: 0.98,
      parts: [
        rect(0, 0, t, 1),
        poly([
          [t - 0.02, 0.34],
          [t + 0.3, 0.34],
          [0.98, 1],
          [0.66, 1],
        ]),
        poly([
          [t - 0.02, 0.66],
          [t + 0.3, 0.66],
          [0.98, 0],
          [0.66, 0],
        ]),
      ],
    },
  }
}

function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface WordGeometry {
  geometry: THREE.BufferGeometry
  /** Centre of the letter "O" in the geometry's own units (the camera flies through its counter). */
  oCenter: THREE.Vector3
  /** Width of "WORK" in the geometry's own units. */
  workWidth: number
  /** Overall height of THE + WORK. */
  height: number
}

function word(text: string, set: Record<string, Glyph>, tracking: number, segments: number) {
  const pieces: THREE.BufferGeometry[] = []
  const centers: Record<string, number> = {}
  let x = 0
  for (const ch of text) {
    const g = set[ch]!
    const parts = g.parts.map((shape) => {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.018,
        bevelSegments: 1,
        curveSegments: segments,
      })
      geo.translate(x, 0, -DEPTH / 2)
      return geo
    })
    centers[ch] = x + g.width / 2
    pieces.push(...parts)
    x += g.width + tracking
  }
  return { pieces, width: x - tracking, centers }
}

/**
 * Split every triangle into four, `levels` times. The big flat faces of the letters are only a few triangles each,
 * which would shatter into long slivers; this turns them into many small shards.
 */
function subdivide(source: THREE.BufferGeometry, levels: number): THREE.BufferGeometry {
  let pos = source.getAttribute('position').array as Float32Array
  let nor = source.getAttribute('normal').array as Float32Array
  const mid = (src: Float32Array, i: number, j: number, out: Float32Array, o: number, normalise: boolean) => {
    let x = (src[i]! + src[j]!) / 2
    let y = (src[i + 1]! + src[j + 1]!) / 2
    let z = (src[i + 2]! + src[j + 2]!) / 2
    if (normalise) {
      const l = Math.hypot(x, y, z) || 1
      x /= l
      y /= l
      z /= l
    }
    out[o] = x
    out[o + 1] = y
    out[o + 2] = z
  }
  for (let level = 0; level < levels; level++) {
    const triangles = pos.length / 9
    const np = new Float32Array(triangles * 4 * 9)
    const nn = new Float32Array(triangles * 4 * 9)
    const emit = (src: Float32Array, dst: Float32Array, normalise: boolean) => {
      const m = new Float32Array(9) // ab, bc, ca
      for (let t = 0; t < triangles; t++) {
        const a = t * 9
        const b = a + 3
        const c = a + 6
        mid(src, a, b, m, 0, normalise)
        mid(src, b, c, m, 3, normalise)
        mid(src, c, a, m, 6, normalise)
        const corners = [
          [src.subarray(a, a + 3), m.subarray(0, 3), m.subarray(6, 9)],
          [m.subarray(0, 3), src.subarray(b, b + 3), m.subarray(3, 6)],
          [m.subarray(6, 9), m.subarray(3, 6), src.subarray(c, c + 3)],
          [m.subarray(0, 3), m.subarray(3, 6), m.subarray(6, 9)],
        ] as const
        corners.forEach((tri, k) => {
          tri.forEach((v, n) => dst.set(v, (t * 4 + k) * 9 + n * 3))
        })
      }
    }
    emit(pos, np, false)
    emit(nor, nn, true)
    pos = np
    nor = nn
  }
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  return out
}

export function buildWord(curveSegments: number, subdivisions: number): WordGeometry {
  const set = glyphs()
  const work = word('WORK', set, 0.15, curveSegments)
  const the = word('THE', set, 0.15, curveSegments)

  // WORK centred on x = 0 and y = 0.5 (its middle) at the origin; THE small, above its left edge.
  const workGeo = work.pieces
  workGeo.forEach((g) => g.translate(-work.width / 2, -0.5, 0))
  const theScale = 0.34
  const theGap = 0.2
  the.pieces.forEach((g) => {
    g.scale(theScale, theScale, theScale)
    g.translate(-work.width / 2, 0.5 + theGap, 0)
  })

  // ExtrudeGeometry is already non-indexed, which is what the per-triangle shatter needs.
  const geometry = subdivide(mergeGeometries([...workGeo, ...the.pieces], false), subdivisions)

  // Per-triangle data for the shatter.
  const pos = geometry.getAttribute('position')
  const triangles = pos.count / 3
  const aCenter = new Float32Array(pos.count * 3)
  const aRand = new Float32Array(pos.count * 3)
  const rnd = seeded(7)
  for (let t = 0; t < triangles; t++) {
    let cx = 0
    let cy = 0
    let cz = 0
    for (let v = 0; v < 3; v++) {
      cx += pos.getX(t * 3 + v) / 3
      cy += pos.getY(t * 3 + v) / 3
      cz += pos.getZ(t * 3 + v) / 3
    }
    const rx = rnd() * 2 - 1
    const ry = rnd() * 2 - 1
    const rz = rnd() * 2 - 1
    for (let v = 0; v < 3; v++) {
      const i = (t * 3 + v) * 3
      aCenter[i] = cx
      aCenter[i + 1] = cy
      aCenter[i + 2] = cz
      aRand[i] = rx
      aRand[i + 1] = ry
      aRand[i + 2] = rz
    }
  }
  geometry.setAttribute('aCenter', new THREE.BufferAttribute(aCenter, 3))
  geometry.setAttribute('aRand', new THREE.BufferAttribute(aRand, 3))
  geometry.computeBoundingSphere()

  return {
    geometry,
    oCenter: new THREE.Vector3(work.centers['O']! - work.width / 2, 0, 0),
    workWidth: work.width,
    height: 1 + theGap + theScale,
  }
}
