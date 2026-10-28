import { useMemo, useRef } from 'react'
import { images } from '@/images/registry'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import j from '../Journey.module.css'
import { mat } from '../materials'
import { J } from '../state'
import { GlossFloor, usePhoto, useJourneyFrame, Room } from '../shared'

/**
 * Scene 5 world: x +-6, z -56.4 .. -72, ceiling 5.6. A lighter, steel
 * exhibition room: the turbo floats at z -63; behind it the real Markov turbo
 * engine-bay photograph is built into the end wall as four horizontal slabs
 * that slide away alternately left and right to open the next room.
 */
const W = 6
const H = 5.6
const Z0 = -56.4
const Z1 = -72
const SLABS = 4
const SLAB_H = H / SLABS
const PHOTO_W = H * (1411 / 1115)
const PHOTO = images.turboEngine.src

function Slabs() {
  const tex = usePhoto(PHOTO)
  const refs = useRef<(THREE.Group | null)[]>([])
  const slabs = useMemo(
    () =>
      Array.from({ length: SLABS }, (_, i) => {
        const t = tex.clone()
        t.colorSpace = THREE.SRGBColorSpace
        t.repeat.set(1, 1 / SLABS)
        t.offset.set(0, 1 - (i + 1) / SLABS)
        t.needsUpdate = true
        return new THREE.MeshBasicMaterial({ map: t, toneMapped: false })
      }),
    [tex],
  )
  useJourneyFrame(() => {
    refs.current.forEach((g, i) => {
      if (!g) return
      const p = THREE.MathUtils.clamp(J.slabs * 1.5 - i * 0.12, 0, 1)
      const e = p * p * (3 - 2 * p)
      g.position.x = (i % 2 ? -1 : 1) * 13 * e
    })
    slabs.forEach((m) => m.color.setScalar(0.08 + 0.38 * J.lightTurbo))
  })
  return (
    <>
      {slabs.map((m, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[0, H - SLAB_H * (i + 0.5), Z1 - 0.15]}
        >
          <mesh material={mat.panel}>
            <boxGeometry args={[2 * W, SLAB_H - 0.03, 0.3]} />
          </mesh>
          <mesh position={[0, 0, 0.16]} material={m}>
            <planeGeometry args={[PHOTO_W, SLAB_H - 0.03]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** Real service wording; positions are fractions of the engine-bay photograph (u from left, v from top). */
const TURBO_POINTS = [
  { label: 'Turbo compressor housing', note: 'The turbocharger itself: custom turbo systems.', u: 0.49, v: 0.71 },
  { label: 'Intake air filter', note: 'Where the intake routing starts.', u: 0.39, v: 0.7 },
  { label: 'Turbine housing', note: 'The hot side of the turbo, where heat management matters.', u: 0.59, v: 0.69 },
  { label: 'Aluminium radiator', note: 'Cooling and heat management.', u: 0.16, v: 0.57 },
]

function TurboMarkers() {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  useJourneyFrame(() => {
    const on = THREE.MathUtils.clamp((J.lightTurbo - 0.85) * 6.6, 0, 1) * (1 - THREE.MathUtils.clamp(J.slabs * 8, 0, 1))
    refs.current.forEach((el, i) => {
      if (!el) return
      el.style.opacity = String(on)
      el.style.visibility = on > 0.2 ? 'visible' : 'hidden'
      el.dataset.active = i === J.marker2 ? 'true' : 'false'
    })
  })
  return (
    <>
      {TURBO_POINTS.map((p, i) => (
        <Html key={p.label} position={[(p.u - 0.5) * PHOTO_W, (1 - p.v) * H, Z1 + 0.25]} style={{ pointerEvents: 'auto' }}>
          <button
            type="button"
            className={j.pin}
            style={{ transform: 'translate(-13px, -50%)', visibility: 'hidden' }}
            aria-label={`${p.label}: ${p.note}`}
            ref={(el) => {
              refs.current[i] = el
            }}
            onClick={() => {
              J.marker2 = i
            }}
            onFocus={() => {
              J.marker2 = i
            }}
          >
            <i />
            <span>{p.label}</span>
            <small>{p.note}</small>
          </button>
        </Html>
      ))}
    </>
  )
}

export function TurboRoom() {
  const depth = Z0 - Z1
  const cz = (Z0 + Z1) / 2
  const key = useRef<THREE.PointLight>(null)
  const sweep = useRef<THREE.PointLight>(null)

  useJourneyFrame(() => {
    const l = J.lightTurbo
    // a light that travels across the turbo as it separates: reveals the geometry
    const a = J.t * 1.3
    if (sweep.current) {
      sweep.current.position.set(1.0 + Math.sin(a) * 2.4, 2.4 + J.turbo * 0.5, -62.8)
      sweep.current.intensity = 70 * l * (0.6 + 0.4 * J.turbo)
    }
    if (key.current) key.current.intensity = 120 * l
  })

  return (
    <group>
      <Room z0={-56.4} z1={-72.3}>
      <GlossFloor width={2 * W} depth={depth} position={[0, 0, cz]} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (W + 0.15), H / 2, cz]} material={mat.panel}>
            <boxGeometry args={[0.3, H, depth]} />
          </mesh>
          {[-59, -62, -65, -68, -71].map((z) => (
            <mesh key={z} position={[s * (W - 0.02), 3.0, z]} material={mat.lineWhite}>
              <boxGeometry args={[0.012, 0.012, 1.6]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, H + 0.15, cz]} material={mat.wall}>
        <boxGeometry args={[2 * W + 0.6, 0.3, depth]} />
      </mesh>
      <mesh position={[1.0, H - 0.03, -65]} material={mat.lightWhite}>
        <boxGeometry args={[3.6, 0.04, 0.18]} />
      </mesh>

      {/* floor ring under the turbo */}
      <mesh position={[1.0, 0.012, -65]} rotation-x={-Math.PI / 2} material={mat.lightRed}>
        <ringGeometry args={[2.35, 2.38, 96]} />
      </mesh>

      <Slabs />
      <TurboMarkers />      </Room>


      <pointLight ref={key} position={[1.0, 4.4, -62.5]} color="#fff2e0" distance={13} decay={1.3} />
      <pointLight ref={sweep} color="#ffd2a0" distance={7} decay={1.5} />
    </group>
  )
}
