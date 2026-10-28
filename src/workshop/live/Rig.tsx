import { useEffect, useRef, type ElementRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import { markers } from '../markers'
import { views, type View, type ViewId } from '../views'

const BASE_ASPECT = 16 / 9
const MAX_FOV = 64
const AUTO_ROTATE_SECONDS = 14
const TEXT_ZONE = 0.37 // fraction of the width the text column covers on wide layouts

/**
 * Vertical fov for the current picture area. Narrower than 16:9 the horizontal coverage of the 16:9 framing is kept,
 * so the car is not cropped. On the stacked (phone and tablet) layout there is no text column to leave room for,
 * so the lens is also tightened until the car fills most of the width (the 16:9 framing has it at ~58 %).
 */
const STACKED_FIT = 0.78
function fovFor(view: View, aspect: number, stacked: boolean): number {
  if (aspect >= BASE_ASPECT && !stacked) return view.fov
  const half = Math.atan(Math.tan(THREE.MathUtils.degToRad(view.fov) / 2) * BASE_ASPECT) // horizontal half-angle at 16:9
  const fit = stacked ? STACKED_FIT : 1
  return Math.min(MAX_FOV, THREE.MathUtils.radToDeg(2 * Math.atan((Math.tan(half) * fit) / aspect)))
}

interface RigProps {
  view: ViewId
  motion: boolean
  autoRotate: boolean
  resetKey: number
  markerEls: MutableRefObject<Map<string, HTMLElement>>
  /** Keyboard and button nudges: azimuth degrees, polar degrees, zoom factor. */
  nudge: MutableRefObject<(az: number, pol: number, zoom: number) => void>
  /** Written every frame: true while the turntable, a camera tween, a drag or damping is producing frames. */
  driving: MutableRefObject<boolean>
  onInteract: () => void
}

/** Camera moves (GSAP), drag-to-orbit, idle turntable and hotspot marker placement. All per-frame work is imperative. */
export function Rig({ view, motion, autoRotate, resetKey, markerEls, nudge, driving, onInteract }: RigProps) {
  const { camera, invalidate, size } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const controls = useRef<ElementRef<typeof OrbitControls>>(null)
  const tween = useRef<gsap.core.Tween | null>(null)
  const lastMove = useRef(0)
  const idle = useRef({ left: AUTO_ROTATE_SECONDS })
  const first = useRef(true)
  const scratch = useRef({ v: new THREE.Vector3(), n: new THREE.Vector3(), a: new THREE.Vector3(), sph: new THREE.Spherical() })

  const wide = size.width >= 960
  const aspect = size.width / Math.max(1, size.height)

  const destination = () => {
    const v = views[view]
    return { v, fov: fovFor(v, aspect, !wide), shift: wide ? v.shift : 0 }
  }

  const place = (p: { px: number; py: number; pz: number; tx: number; ty: number; tz: number; fov: number; shift: number }) => {
    const c = controls.current
    cam.position.set(p.px, p.py, p.pz)
    cam.fov = p.fov
    if (p.shift) cam.setViewOffset(size.width, size.height, -p.shift * size.width, 0, size.width, size.height)
    else cam.clearViewOffset()
    cam.updateProjectionMatrix()
    if (c) {
      c.target.set(p.tx, p.ty, p.tz)
      c.update()
    }
    invalidate()
  }

  const limits = () => {
    const c = controls.current
    if (!c) return
    const { v } = destination()
    const dist = new THREE.Vector3(...v.pos).distanceTo(new THREE.Vector3(...v.target))
    c.minDistance = dist * 0.6
    c.maxDistance = dist * 1.45
  }

  // OrbitControls forces touch-action: none on its canvas, which would trap a phone visitor's scroll.
  useEffect(() => {
    const el = controls.current?.domElement as HTMLElement | undefined
    if (el) el.style.touchAction = 'pan-y'
  })

  // Any camera movement (drag, damping, tween, keys) marks the frames around it as driven.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const moved = () => {
      lastMove.current = performance.now()
    }
    c.addEventListener('change', moved)
    return () => c.removeEventListener('change', moved)
  }, [])

  // Go to a view: tween from wherever the camera is now (the visitor may have orbited away).
  useEffect(() => {
    const c = controls.current
    const { v, fov, shift } = destination()
    const to = { px: v.pos[0], py: v.pos[1], pz: v.pos[2], tx: v.target[0], ty: v.target[1], tz: v.target[2], fov, shift }
    tween.current?.kill()
    limits()
    if (first.current || !motion || !c) {
      first.current = false
      place(to)
      return
    }
    const from = {
      px: cam.position.x, py: cam.position.y, pz: cam.position.z,
      tx: c.target.x, ty: c.target.y, tz: c.target.z,
      fov: cam.fov, shift: shift,
    }
    tween.current = gsap.to(from, { ...to, duration: 1.35, ease: 'power3.inOut', onUpdate: () => place(from) })
    return () => {
      tween.current?.kill()
    }
    // A resize re-frames immediately through the effect below; only view / reset changes tween.
  }, [view, resetKey, motion])

  useEffect(() => {
    const { v, fov, shift } = destination()
    if (tween.current?.isActive()) return
    // Keep the current orbit, only re-fit the lens and the offset to the new size.
    cam.fov = fov
    if (shift) cam.setViewOffset(size.width, size.height, -shift * size.width, 0, size.width, size.height)
    else cam.clearViewOffset()
    cam.updateProjectionMatrix()
    limits()
    invalidate()
    void v
  }, [size.width, size.height])

  // Keyboard / button nudges: rotate or dolly around the current target.
  useEffect(() => {
    nudge.current = (az, pol, zoom) => {
      const c = controls.current
      if (!c) return
      const { sph, v } = scratch.current
      v.copy(cam.position).sub(c.target)
      sph.setFromVector3(v)
      sph.theta -= THREE.MathUtils.degToRad(az)
      sph.phi = THREE.MathUtils.clamp(sph.phi - THREE.MathUtils.degToRad(pol), c.minPolarAngle, c.maxPolarAngle)
      sph.radius = THREE.MathUtils.clamp(sph.radius * zoom, c.minDistance, c.maxDistance)
      v.setFromSpherical(sph)
      cam.position.copy(c.target).add(v)
      c.update()
      invalidate()
      onInteract()
    }
  })

  useEffect(() => {
    idle.current.left = AUTO_ROTATE_SECONDS
  }, [autoRotate])

  useFrame((_, delta) => {
    const c = controls.current
    const auto = autoRotate && idle.current.left > 0
    driving.current = auto || Boolean(tween.current?.isActive()) || performance.now() - lastMove.current < 250
    if (c) {
      c.autoRotate = auto
      if (auto) {
        idle.current.left -= Math.min(delta, 0.1)
        invalidate() // the turntable needs a frame after this one
      }
    }
    // Hotspot markers: project once per rendered frame, write styles directly.
    const { v, n, a } = scratch.current
    for (const m of markers) {
      const el = markerEls.current.get(m.id)
      if (!el) continue
      v.set(...m.anchor)
      a.copy(cam.position).sub(v).normalize()
      n.set(...m.normal)
      const facing = a.dot(n) > 0.18
      v.project(cam)
      const px = (v.x * 0.5 + 0.5) * size.width
      // On wide layouts the left third holds the text column: a marker there would sit on top of the words.
      const visible = facing && v.z < 1 && !(wide && px < size.width * TEXT_ZONE)
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * size.height).toFixed(1)}px, 0)`
      el.dataset.hidden = visible ? '' : 'true'
      el.dataset.flip = px > size.width * 0.7 ? 'true' : '' // label opens to the left near the right edge
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.09}
      rotateSpeed={0.7}
      autoRotateSpeed={0.9}
      minPolarAngle={THREE.MathUtils.degToRad(40)}
      maxPolarAngle={THREE.MathUtils.degToRad(91)}
      onStart={() => {
        tween.current?.kill()
        idle.current.left = 0
        onInteract()
      }}
    />
  )
}
