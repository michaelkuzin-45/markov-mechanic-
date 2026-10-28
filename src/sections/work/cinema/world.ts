import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import { buildWord, type WordGeometry } from './letters'
import { buildFlight, type Flight } from './flight'

/**
 * The 3D world of the Work page: the extruded word, a dark floor, drifting dust, and a ring of exhibits (one per
 * build). One camera, two modes:
 *
 *   flight   `u` along the cinematic path (see flight.ts)
 *   gallery  an orbit around the ring: the camera sits outside the ring looking at one exhibit, and moving to the
 *            next exhibit swings the camera round the ring
 *
 * Rendering is on demand: nothing draws unless the camera, a uniform or the pointer sway has changed.
 */
const BG = '#060607'
const WORD_Y = 14
const WORD_SCALE = 3.6
const END_Z = -52
const EYE_Y = 2.4
const RING_R = 14
const RING_STEP = THREE.MathUtils.degToRad(32)
const BOX_W = 6.8
const BOX_H = 4.6

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export interface PhotoInfo {
  width: number
  height: number
}

/** The area of the canvas the photograph should fill when the camera settles, as fractions of the canvas. */
export interface TargetRect {
  cx: number
  cy: number
  w: number
  h: number
}

export interface WorldOptions {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  /** One per exhibit; null until that photograph has loaded (see setTexture). */
  textures: (THREE.Texture | null)[]
  photos: PhotoInfo[]
  mobile: boolean
  invalidate: () => void
  getTarget: () => TargetRect
}

export interface PlayCallbacks {
  onProgress?: (u: number) => void
  onDone?: () => void
  /** Called once if the first second of frames is too slow to be worth playing. */
  onSlow?: () => void
}

const SHATTER_VERT = /* glsl */ `
  uniform float uBreak;
  uniform vec3 uOrigin;
  attribute vec3 aCenter;
  attribute vec3 aRand;
  varying vec3 vN;
  varying vec3 vWorld;
  varying float vView;

  mat3 rotation(vec3 axis, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0 - c;
    return mat3(
      t * axis.x * axis.x + c,          t * axis.x * axis.y + s * axis.z, t * axis.x * axis.z - s * axis.y,
      t * axis.x * axis.y - s * axis.z, t * axis.y * axis.y + c,          t * axis.y * axis.z + s * axis.x,
      t * axis.x * axis.z + s * axis.y, t * axis.y * axis.z - s * axis.x, t * axis.z * axis.z + c
    );
  }

  void main() {
    float k = uBreak;
    float kk = k * k;
    mat3 R = rotation(normalize(aRand + vec3(0.001)), kk * (5.0 + 9.0 * abs(aRand.x)));
    float shrink = 1.0 - smoothstep(0.55, 1.0, k) * (0.55 + 0.45 * abs(aRand.y));
    vec3 outward = normalize(aCenter - uOrigin + aRand * 0.6);
    vec3 offset = outward * (1.2 + 3.6 * abs(aRand.z)) * kk + vec3(0.0, -0.6 * abs(aRand.y) * kk, (3.0 + 6.0 * abs(aRand.x)) * kk);
    vec3 p = aCenter + R * (position - aCenter) * shrink + offset;
    vN = normalize(mat3(modelMatrix) * (R * normal));
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vView = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const SHATTER_FRAG = /* glsl */ `
  uniform vec3 uFog;
  uniform float uFogDensity;
  varying vec3 vN;
  varying vec3 vWorld;
  varying float vView;

  void main() {
    vec3 n = normalize(vN);
    vec3 key = normalize(vec3(-0.35, 0.55, 0.75));
    vec3 fill = normalize(vec3(0.7, -0.15, 0.5));
    float light = max(dot(n, key), 0.0) * 0.75 + max(dot(n, fill), 0.0) * 0.28;
    vec3 view = normalize(cameraPosition - vWorld);
    float rim = pow(1.0 - max(dot(n, view), 0.0), 3.0);
    // Graphite faces, brighter toward the top of the word, with a thin hot rim on the edges.
    float top = smoothstep(-8.0, 12.0, vWorld.y - ${WORD_Y}.0);
    vec3 base = mix(vec3(0.46, 0.46, 0.47), vec3(0.78, 0.77, 0.76), top);
    vec3 col = base * (0.22 + 0.78 * light) + vec3(1.0, 0.16, 0.08) * pow(rim, 4.0) * 1.1;
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vView * vView);
    gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
  }
`

const FLOOR_VERT = /* glsl */ `
  varying vec3 vWorld;
  varying float vView;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vView = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FLOOR_FRAG = /* glsl */ `
  uniform vec3 uFog;
  uniform float uFogDensity;
  uniform vec2 uCenter;
  uniform float uRing;
  varying vec3 vWorld;
  varying float vView;

  void main() {
    float d = distance(vWorld.xz, uCenter);
    float pool = exp(-d * d / (2.0 * 15.0 * 15.0));
    vec3 col = vec3(0.016, 0.017, 0.02) + pool * vec3(0.045, 0.05, 0.065);
    float ring = 1.0 - smoothstep(0.0, 0.07, abs(d - uRing));
    col += ring * vec3(0.85, 0.06, 0.05) * (0.4 + pool * 0.9);
    vec2 cell = vWorld.xz / 4.0;
    vec2 g = abs(fract(cell - 0.5) - 0.5) / max(fwidth(cell), vec2(0.0001));
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    col += line * 0.085 * (0.3 + pool);
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vView * vView);
    gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
  }
`

const DUST_VERT = /* glsl */ `
  uniform float uScale;
  attribute float aSize;
  varying float vFade;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * uScale / -mv.z, 1.0, 6.0);
    vFade = smoothstep(90.0, 8.0, -mv.z) * smoothstep(0.4, 2.0, -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const DUST_FRAG = /* glsl */ `
  varying float vFade;
  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(vec3(0.82, 0.8, 0.78), a * vFade * 0.55);
  }
`

/** A faint column of light over the gallery: the first thing visible once the word is gone, and where the flight is heading. */
const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const BEAM_FRAG = /* glsl */ `
  uniform float uAlpha;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    float facing = pow(abs(dot(normalize(vN), normalize(vView))), 1.4);
    float height = pow(1.0 - vUv.y, 1.7);
    vec3 col = mix(vec3(0.45, 0.55, 0.85), vec3(0.9, 0.2, 0.15), pow(1.0 - vUv.y, 6.0) * 0.5);
    gl_FragColor = vec4(col, facing * height * 0.2 * uAlpha);
  }
`

function gradientTexture() {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 64)
  grad.addColorStop(0, '#000')
  grad.addColorStop(1, '#fff')
  g.fillStyle = grad
  g.fillRect(0, 0, 4, 64)
  return new THREE.CanvasTexture(c)
}

interface Exhibit {
  group: THREE.Group
  reflection: THREE.Mesh
  photo: THREE.MeshBasicMaterial
  reflect: THREE.MeshBasicMaterial
  angle: number
  /** False until the photograph's texture has arrived: the exhibit stays hidden rather than show a blank card. */
  ready: boolean
}

export class CinemaWorld {
  private o: WorldOptions
  private word: WordGeometry
  private wordMesh: THREE.Mesh
  private wordMat: THREE.ShaderMaterial
  private floor: THREE.Mesh
  private floorMat: THREE.ShaderMaterial
  private dust: THREE.Points
  private beam: THREE.Mesh
  private beamMat: THREE.ShaderMaterial
  private exhibits: Exhibit[] = []
  private gallery = new THREE.Group()
  private fade = gradientTexture()
  private disposables: { dispose(): void }[] = []

  private flight!: Flight
  private u = 0
  private mode: 'flight' | 'gallery' = 'flight'
  private tween: gsap.core.Tween | null = null
  private navTween: gsap.core.Tween | null = null
  private size = { w: 1, h: 1 }
  private fov = 50
  private depth = 10
  private offset = { x: 0, y: 0 }
  private endPos = new THREE.Vector3(0, EYE_Y, END_Z)
  private center = new THREE.Vector3()
  private nav = { phi: 0, pull: 0, roll: 0 }
  private sway = { x: 0, y: 0 }
  private swayTween: gsap.core.Tween | null = null
  private frameTimes: number[] = []
  private disposed = false

  constructor(options: WorldOptions) {
    this.o = options
    const { scene, mobile } = options
    scene.background = new THREE.Color(BG)

    this.word = buildWord(mobile ? 10 : 20, mobile ? 1 : 2)
    this.wordMat = new THREE.ShaderMaterial({
      vertexShader: SHATTER_VERT,
      fragmentShader: SHATTER_FRAG,
      uniforms: {
        uBreak: { value: 0 },
        uOrigin: { value: this.word.oCenter.clone() },
        uFog: { value: new THREE.Color(6 / 255, 6 / 255, 7 / 255) },
        uFogDensity: { value: 0.0125 },
      },
    })
    this.wordMesh = new THREE.Mesh(this.word.geometry, this.wordMat)
    this.wordMesh.scale.setScalar(WORD_SCALE)
    this.wordMesh.position.set(0, WORD_Y, 0)
    this.wordMesh.frustumCulled = false
    scene.add(this.wordMesh)

    this.floorMat = new THREE.ShaderMaterial({
      vertexShader: FLOOR_VERT,
      fragmentShader: FLOOR_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uFog: { value: new THREE.Color(6 / 255, 6 / 255, 7 / 255) },
        uFogDensity: { value: 0.016 },
        uCenter: { value: new THREE.Vector2() },
        uRing: { value: RING_R },
      },
    })
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), this.floorMat)
    this.floor.frustumCulled = false
    scene.add(this.floor)

    this.dust = this.makeDust(mobile ? 340 : 700)
    scene.add(this.dust)

    this.beamMat = new THREE.ShaderMaterial({
      vertexShader: BEAM_VERT,
      fragmentShader: BEAM_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uAlpha: { value: 0 } },
    })
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(RING_R * 0.9, RING_R * 0.9, 44, 40, 1, true), this.beamMat)
    this.beam.frustumCulled = false
    this.beam.renderOrder = 3
    scene.add(this.beam)

    scene.add(this.gallery)
    options.photos.forEach((p, i) => this.makeExhibit(p, options.textures[i] ?? null, i))

    this.disposables.push(this.word.geometry, this.wordMat, this.floor.geometry, this.floorMat, this.fade, this.beam.geometry, this.beamMat)
  }

  private makeDust(count: number) {
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70
      pos[i * 3 + 1] = 0.4 + Math.random() * 24
      pos[i * 3 + 2] = 46 - Math.random() * 190
      size[i] = 0.5 + Math.random() * 1.5
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    const mat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: { uScale: { value: 60 * Math.min(window.devicePixelRatio, 1.5) } },
    })
    this.disposables.push(geo, mat)
    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    points.renderOrder = 2
    return points
  }

  private makeExhibit(p: PhotoInfo, texture: THREE.Texture | null, i: number) {
    const fit = Math.min(BOX_W / p.width, BOX_H / p.height)
    const w = p.width * fit
    const h = p.height * fit
    const angle = i * RING_STEP
    const group = new THREE.Group()

    const photo = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, fog: false })
    photo.name = `photo-${i}`
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), photo)
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.18, h + 0.18, 0.1),
      new THREE.MeshBasicMaterial({ color: '#0b0b0d', fog: false }),
    )
    slab.position.z = -0.07
    group.add(slab, plane)

    const reflect = new THREE.MeshBasicMaterial({
      map: texture,
      alphaMap: this.fade,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide,
    })
    const reflection = new THREE.Mesh(new THREE.PlaneGeometry(w, h), reflect)
    reflection.scale.y = -1
    reflection.renderOrder = 1

    group.add(reflection)
    group.userData = { h }
    this.gallery.add(group)
    this.exhibits.push({ group, reflection, photo, reflect, angle, ready: texture !== null })
    this.disposables.push(plane.geometry, reflection.geometry, photo, reflect, slab.geometry, slab.material as THREE.Material)
  }

  /** Lay the world out for the current canvas and rest the camera at the start of the flight. */
  prepare(size?: { w: number; h: number }) {
    if (size) this.size = size
    const { w: W, h: H } = this.size
    const aspect = W / H
    const portrait = aspect < 1
    this.fov = portrait ? 62 : 50
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.fov) / 2)

    // Start: the word fills most of the width.
    const wordW = this.word.workWidth * WORD_SCALE
    const frac = portrait ? 0.86 : 0.74
    const dStart = THREE.MathUtils.clamp(wordW / (frac * 2 * tanHalf * aspect), 12, 46)

    // End: the photograph fills the area the page has set aside for it.
    const t = this.o.getTarget()
    const dH = BOX_H / (Math.max(0.1, t.h) * 2 * tanHalf)
    const dW = BOX_W / (Math.max(0.1, t.w) * 2 * tanHalf * aspect)
    this.depth = Math.max(dH, dW)
    this.offset = { x: (0.5 - t.cx) * W, y: (0.5 - t.cy) * H }

    this.endPos.set(0, EYE_Y, END_Z)
    this.center.set(0, 0, END_Z - this.depth - RING_R)
    this.gallery.position.copy(this.center)
    this.exhibits.forEach((e) => {
      e.group.position.set(Math.sin(e.angle) * RING_R, EYE_Y, Math.cos(e.angle) * RING_R)
      e.group.rotation.y = e.angle
      // The reflection sits at the mirror image of the photograph about the floor (y = 0 in world space).
      e.reflection.position.y = -EYE_Y * 2
    })
    this.floor.position.set(this.center.x, 0, this.center.z)
    this.beam.position.set(this.center.x, 22, this.center.z)
    this.floorMat.uniforms['uCenter']!.value.set(this.center.x, this.center.z)

    const maxRoll = portrait ? 0.13 : 0.2
    this.flight = buildFlight({
      dStart,
      wordY: WORD_Y,
      oX: this.word.oCenter.x * WORD_SCALE,
      end: this.endPos,
      maxRoll,
    })
    this.wordMat.uniforms['uBreak']!.value = 0
    this.wordMesh.visible = true
    this.nav = { phi: 0, pull: 0, roll: 0 }
    this.u = this.mode === 'gallery' ? 1 : 0
    this.apply()
  }

  resize(w: number, h: number) {
    this.size = { w, h }
    // Mid-flight the path is left alone; it is rebuilt for the new shape once the camera has landed.
    if (this.tween && this.tween.isActive()) {
      this.applyProjection(this.u)
      return
    }
    this.prepare()
  }

  private applyProjection(u: number) {
    const { w: W, h: H } = this.size
    const cam = this.o.camera
    const boost = 6 * Math.exp(-Math.pow((u - 0.34) / 0.16, 2))
    cam.aspect = W / H
    cam.fov = this.fov + (this.mode === 'flight' ? boost : 0)
    const k = this.mode === 'gallery' ? 1 : smooth(0.68, 1, u)
    cam.setViewOffset(W, H, this.offset.x * k, this.offset.y * k, W, H)
    cam.updateProjectionMatrix()
  }

  private tmpPos = new THREE.Vector3()
  private tmpTan = new THREE.Vector3()
  private tmpTarget = new THREE.Vector3()
  private tmpEnd = new THREE.Vector3()

  private focus(phi: number, out: THREE.Vector3) {
    return out.set(this.center.x + Math.sin(phi) * RING_R, EYE_Y, this.center.z + Math.cos(phi) * RING_R)
  }

  /** Put the camera where the current mode says it should be, and ask for a frame. */
  private apply() {
    const cam = this.o.camera
    const flight = this.flight
    let roll = 0
    if (this.mode === 'flight') {
      const u = this.u
      flight.position(u, this.tmpPos)
      flight.tangent(u, this.tmpTan)
      this.focus(0, this.tmpEnd)
      const ahead = this.tmpTan.multiplyScalar(14).add(this.tmpPos)
      const w = smooth(0.58, 0.98, u)
      this.tmpTarget.copy(ahead).lerp(this.tmpEnd, w)
      roll = flight.roll(u)
      this.wordMat.uniforms['uBreak']!.value = smooth(flight.uBreakStart, flight.uBreakEnd, u)
      this.wordMesh.visible = u < flight.uBreakEnd + 0.03
    } else {
      const { phi, pull } = this.nav
      const dist = RING_R + this.depth + pull
      this.tmpPos.set(this.center.x + Math.sin(phi) * dist, EYE_Y + this.sway.y * 0.3, this.center.z + Math.cos(phi) * dist)
      this.tmpPos.x += Math.cos(phi) * this.sway.x * 0.6
      this.tmpPos.z -= Math.sin(phi) * this.sway.x * 0.6
      this.focus(phi, this.tmpTarget)
      roll = this.nav.roll
    }
    cam.position.copy(this.tmpPos)
    cam.up.set(0, 1, 0)
    cam.lookAt(this.tmpTarget)
    cam.rotateZ(roll)
    this.applyProjection(this.mode === 'flight' ? this.u : 1)

    // The exhibits emerge from the dark only once the camera has gone through the word and started to dive.
    const reveal = this.mode === 'flight' ? smooth(0.5, 0.82, this.u) : 1
    this.gallery.visible = reveal > 0.005
    // The light column blooms as the word breaks, and settles to a quiet glow once the camera has landed.
    const bloom = this.mode === 'flight' ? smooth(0.14, 0.34, this.u) * (1 - 0.55 * smooth(0.8, 1, this.u)) : 0.45
    this.beamMat.uniforms['uAlpha']!.value = bloom
    // The exhibit being looked at is bright, the others recede.
    for (const e of this.exhibits) {
      e.group.visible = e.ready
      const near = 1 - smooth(0, RING_STEP * 0.9, Math.abs(this.nav.phi - e.angle))
      const b = reveal * (this.mode === 'flight' ? (e.angle === 0 ? 1 : 0.28) : 0.26 + 0.74 * near)
      e.photo.color.setScalar(b)
      e.reflect.opacity = 0.2 * b
    }
    this.o.invalidate()
  }

  /** Upload textures and compile shaders ahead of the first visible frame so the opening never hitches. */
  async warm() {
    for (const t of this.o.textures) if (t) this.o.renderer.initTexture(t)
    this.o.renderer.compile(this.o.scene, this.o.camera)
    this.o.invalidate()
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
  }

  /** A photograph that finished loading after the world was built: put it on its exhibit and show the exhibit. */
  setTexture(i: number, texture: THREE.Texture) {
    const e = this.exhibits[i]
    if (!e || this.disposed) return
    this.o.renderer.initTexture(texture)
    e.photo.map = texture
    e.reflect.map = texture
    e.photo.needsUpdate = true
    e.reflect.needsUpdate = true
    e.ready = true
    this.apply()
  }

  /** The whole opening shot. `u` is eased so the camera starts slowly, hurries through the word, and settles. */
  play(cb: PlayCallbacks = {}) {
    this.stop()
    this.mode = 'flight'
    this.prepare()
    this.frameTimes = []
    let last = 0
    let warned = false
    const state = { u: 0 }
    this.tween = gsap.to(state, {
      u: 1,
      duration: this.o.mobile ? 8.4 : 9.6,
      delay: 0.7,
      ease: 'sine.inOut',
      onUpdate: () => {
        this.u = state.u
        this.apply()
        cb.onProgress?.(this.u)
        const now = performance.now()
        if (last) {
          this.frameTimes.push(now - last)
          if (!warned && this.frameTimes.length === 60) {
            const sorted = [...this.frameTimes.slice(8)].sort((a, b) => a - b)
            const median = sorted[Math.floor(sorted.length / 2)]!
            if (median > 55) {
              warned = true
              cb.onSlow?.()
            }
          }
        }
        last = now
      },
      onComplete: () => this.land(cb),
    })
  }

  /** Fast-forward the shot to its end (the same path, quickly) rather than cutting. */
  skip(cb: PlayCallbacks = {}) {
    if (this.mode === 'gallery') return
    const from = this.u
    this.tween?.kill()
    const state = { u: from }
    this.tween = gsap.to(state, {
      u: 1,
      duration: from > 0.8 ? 0.4 : 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.u = state.u
        this.apply()
        cb.onProgress?.(this.u)
      },
      onComplete: () => this.land(cb),
    })
  }

  private land(cb: PlayCallbacks) {
    this.u = 1
    this.mode = 'gallery'
    this.nav = { phi: 0, pull: 0, roll: 0 }
    this.wordMesh.visible = false
    this.apply()
    cb.onProgress?.(1)
    cb.onDone?.()
  }

  /** Jump (no animation) to the settled gallery view of exhibit `i`. */
  settleAt(i: number) {
    this.stop()
    this.mode = 'gallery'
    this.nav = { phi: i * RING_STEP, pull: 0, roll: 0 }
    this.wordMesh.visible = false
    this.apply()
  }

  /** Swing the camera round the ring to exhibit `to`, pulling back a little and banking into the turn. */
  goTo(from: number, to: number, cb: { onMid?: () => void; onDone?: () => void } = {}) {
    this.navTween?.kill()
    this.mode = 'gallery'
    const a = from * RING_STEP
    const b = to * RING_STEP
    const dir = Math.sign(b - a) || 1
    const state = { p: 0 }
    let mid = false
    this.navTween = gsap.to(state, {
      p: 1,
      duration: 1.7,
      ease: 'none',
      onUpdate: () => {
        const e = gsap.parseEase('power3.inOut')(state.p)
        this.nav.phi = a + (b - a) * e
        this.nav.pull = 3.2 * Math.sin(Math.PI * state.p)
        this.nav.roll = -dir * 0.055 * Math.sin(Math.PI * e)
        if (!mid && state.p > 0.5) {
          mid = true
          cb.onMid?.()
        }
        this.apply()
      },
      onComplete: () => {
        this.nav = { phi: b, pull: 0, roll: 0 }
        this.apply()
        cb.onDone?.()
      },
    })
  }

  /** Mouse parallax in the gallery: a slight shift of the camera, eased, rendering only while it moves. */
  pointer(nx: number, ny: number) {
    if (this.mode !== 'gallery') return
    this.swayTween?.kill()
    this.swayTween = gsap.to(this.sway, {
      x: nx,
      y: ny,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => this.apply(),
    })
  }

  /** Development only (see CinemaCanvas): freeze the shot at `u` so any moment can be inspected. */
  debugAt(u: number) {
    this.stop()
    this.mode = 'flight'
    this.u = u
    this.apply()
  }

  get inGallery() {
    return this.mode === 'gallery'
  }

  stop() {
    this.tween?.kill()
    this.navTween?.kill()
    this.swayTween?.kill()
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.stop()
    this.o.scene.remove(this.wordMesh, this.floor, this.dust, this.beam, this.gallery)
    this.disposables.forEach((d) => d.dispose())
  }
}
