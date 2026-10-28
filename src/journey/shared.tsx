import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useTexture, MeshReflectorMaterial, Html } from '@react-three/drei'
import * as THREE from 'three'
import { QualityContext, useQuality } from './quality'

export { QualityContext }

/** sRGB photo texture with decent anisotropy. */
export function usePhoto(src: string) {
  const tex = useTexture(src)
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
  }, [tex])
  return tex
}

/** A photograph hung in space, lit by its room: brightness follows `level()`. */
export function PhotoPlane({
  src,
  width,
  height,
  level,
  crop,
  ...rest
}: { src: string; width: number; height: number; level: () => number; crop?: [number, number, number, number] } & ThreeElements['mesh']) {
  const base = usePhoto(src)
  const tex = useMemo(() => {
    if (!crop) return base
    const t = base.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.repeat.set(crop[2] - crop[0], crop[3] - crop[1])
    t.offset.set(crop[0], 1 - crop[3])
    t.needsUpdate = true
    return t
  }, [base, crop])
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(() => {
    mat.current?.color.setScalar(level())
  })
  return (
    <mesh {...rest}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={mat} map={tex} toneMapped={false} />
    </mesh>
  )
}

export interface StackPanel {
  src: string
  /** u0, v0, u1, v1 of the photograph (0..1, v from the top): a detail crop */
  crop?: [number, number, number, number]
  w: number
  h: number
  pos: [number, number, number]
  /** where the panel travels at amount = 1 (relative to pos) */
  spread: [number, number, number]
  yaw?: number
  /** short caption anchored under the panel */
  label?: string
}

const underline = new THREE.MeshBasicMaterial({ color: '#cfd6e6', toneMapped: false, transparent: true, opacity: 0.7 })
const frameMat = new THREE.MeshStandardMaterial({ color: '#0c0c0f', roughness: 0.4, metalness: 0.8 })

/**
 * Real photographs hung in space as framed panels. As amount rises the panels
 * separate along their own offsets (an exploded view of the photographs) and
 * come back together at 0.
 */
export function PhotoStack({ panels, amount, level, ...rest }: { panels: StackPanel[]; amount: () => number; level: () => number } & ThreeElements['group']) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])
  useFrame(() => {
    const on = level() > 0.6 && window.innerWidth > 720
    labels.current.forEach((el) => el && (el.style.visibility = on ? 'visible' : 'hidden'))
    const a = amount()
    panels.forEach((p, i) => refs.current[i]?.position.set(p.pos[0] + p.spread[0] * a, p.pos[1] + p.spread[1] * a, p.pos[2] + p.spread[2] * a))
  })
  return (
    <group {...rest}>
      {panels.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          rotation-y={p.yaw ?? 0}
        >
          <mesh position={[0, 0, -0.07]} material={frameMat}>
            <boxGeometry args={[p.w + 0.1, p.h + 0.1, 0.08]} />
          </mesh>
          <PhotoPlane src={p.src} crop={p.crop} width={p.w} height={p.h} level={level} />
          {p.label && (
            <Html position={[0, -p.h / 2 - 0.4, 0]} center style={{ pointerEvents: 'none' }}>
              <div
                ref={(el) => {
                  labels.current[i] = el
                }}
                style={{ visibility: 'hidden', whiteSpace: 'nowrap', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f2f0ed', textShadow: '0 1px 12px #000' }}>{p.label}</div>
            </Html>
          )}
          <mesh position={[0, -p.h / 2 - 0.16, 0]} material={underline}>
            <boxGeometry args={[p.w * 0.9, 0.012, 0.01]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Mirror-polished floor on desktop; plain glossy standard material on phones. */
export function GlossFloor({ width, depth, position, color = '#09090b' }: { width: number; depth: number; position: [number, number, number]; color?: string }) {
  const q = useQuality()
  return (
    <mesh rotation-x={-Math.PI / 2} position={position}>
      <planeGeometry args={[width, depth]} />
      {q.reflections ? (
        <MeshReflectorMaterial
          resolution={q.reflectionRes}
          blur={[300, 90]}
          mixBlur={1}
          mixStrength={22}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          roughness={1}
          metalness={0.55}
          color={color}
          mirror={0.3}
        />
      ) : (
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      )}
    </mesh>
  )
}

/** Calls `apply` every frame; keeps scene components free of per-frame React work. */
export function useJourneyFrame(apply: (dt: number) => void) {
  const ref = useRef(apply)
  ref.current = apply
  useFrame((_, dt) => ref.current(dt))
}

export function useDispose(obj: THREE.Object3D | null) {
  useEffect(() => () => obj?.traverse((o) => {
    const m = o as THREE.Mesh
    m.geometry?.dispose?.()
  }), [obj])
}

/** A spotlight aimed at a world point (three.js spot lights aim at their target object). */
export function Spot({ target, ...p }: { target: [number, number, number] } & Omit<ThreeElements['spotLight'], 'target'>) {
  const t = useMemo(() => new THREE.Object3D(), [])
  t.position.set(target[0], target[1], target[2])
  return (
    <>
      <primitive object={t} />
      <spotLight target={t} {...p} />
    </>
  )
}

/**
 * Draws a room's geometry only while the camera is near it (the room itself,
 * and the one on either side). Lights must stay OUTSIDE this wrapper: toggling
 * a light's visibility changes the light count and recompiles every material.
 */
export function Room({ z0, z1, reach = 11, children }: { z0: number; z1: number; reach?: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const [mounted, setMounted] = useState(false)
  useFrame(({ camera }) => {
    const z = camera.position.z
    const on = z < z0 + reach && z > z1 - reach
    if (ref.current && ref.current.visible !== on) ref.current.visible = on
    // Mount (and so load the photographs of) a room only when the camera is getting close.
    if (!mounted && z < z0 + reach + 16 && z > z1 - reach - 16) setMounted(true)
  })
  return <group ref={ref}>{mounted && <Suspense fallback={null}>{children}</Suspense>}</group>
}
