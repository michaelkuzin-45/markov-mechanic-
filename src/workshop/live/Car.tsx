import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import { modelUrl } from '../capability'
import type { Pose } from './types'

/**
 * Only these materials sample the reflection map. Seats, dash, plastics and rubber are lit by the direct
 * lights alone: on an Intel HD 630 the environment lookup was most of the frame cost, and those surfaces
 * barely reflect anything.
 */
const REFLECTIVE: Record<string, number> = {
  Paint: 1.25,
  Glass: 1,
  Rim: 1.3,
  Chrome: 1,
  MirrorChrome: 1,
  MetalSatin: 0.8,
  BrakeDisc: 0.9,
  Caliper: 0.8,
  LampLens: 1,
  LampChrome: 1,
  LampLED: 0.6,
  LampTail: 0.8,
  LampAmber: 0.6,
  Grille: 0.5,
}
const LAMPS = ['LampLED', 'LampAmber', 'LampTail']
const rad = THREE.MathUtils.degToRad

interface CarProps {
  tier: 'full' | 'lite'
  env: THREE.Texture
  pose: Pose
  motion: boolean
  onReady: () => void
}

export function Car({ tier, env, pose, motion, onReady }: CarProps) {
  const gltf = useGLTF(modelUrl[tier], '/draco/')
  const invalidate = useThree((s) => s.invalidate)
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy())

  const parts = useMemo(() => {
    const get = (name: string) => gltf.scene.getObjectByName(name)
    return {
      doorL: get('Door_L'),
      doorR: get('Door_R'),
      steer: ['Corner_FL', 'Corner_FR'].map(get),
      spin: ['Spin_FL', 'Spin_FR', 'Spin_RL', 'Spin_RR'].map(get),
    }
  }, [gltf])
  const lamps = useRef<{ material: THREE.MeshStandardMaterial; base: number }[]>([])
  const state = useRef({ doorL: 0, doorR: 0, steer: 0, light: 1 })

  const apply = () => {
    const s = state.current
    if (parts.doorL) parts.doorL.rotation.y = -rad(s.doorL)
    if (parts.doorR) parts.doorR.rotation.y = rad(s.doorR)
    for (const c of parts.steer) if (c) c.rotation.y = rad(s.steer)
    // Rolling the wheels a little as they are steered keeps the wheel from feeling pinned to the ground.
    for (const w of parts.spin) if (w) w.rotation.z = -rad(s.steer * 9)
    for (const l of lamps.current) l.material.emissiveIntensity = l.base * s.light
    invalidate()
  }

  // Materials: reflection map on the hero surfaces only, textures filtered for oblique views.
  useLayoutEffect(() => {
    const seen = new Set<THREE.Material>()
    const found: typeof lamps.current = []
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        if (seen.has(m)) continue
        seen.add(m)
        const mat = m as THREE.MeshStandardMaterial
        const k = REFLECTIVE[mat.name]
        if (k !== undefined) {
          mat.envMap = env
          mat.envMapIntensity = k
        } else {
          mat.envMap = null
        }
        if (mat.map) mat.map.anisotropy = Math.min(8, maxAniso)
        if (LAMPS.includes(mat.name)) found.push({ material: mat, base: mat.emissiveIntensity })
        mat.needsUpdate = true
      }
    })
    lamps.current = found
    state.current = { doorL: pose.doors[0], doorR: pose.doors[1], steer: pose.steer, light: pose.lights ? 1 : 0 }
    apply()
    onReady()
    // Runs once per loaded model; later pose changes are tweened below.
  }, [gltf, env])

  useEffect(() => {
    const tween = gsap.to(state.current, {
      doorL: pose.doors[0],
      doorR: pose.doors[1],
      steer: pose.steer,
      light: pose.lights ? 1 : 0,
      duration: motion ? 0.9 : 0,
      ease: 'power2.inOut',
      overwrite: true,
      onUpdate: apply,
    })
    return () => {
      tween.kill()
    }
  }, [pose, motion])

  return <primitive object={gltf.scene} />
}
