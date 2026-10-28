import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { PlaceholderCar } from './models/PlaceholderCar'

/** Base yaw: a classic front three-quarter view. */
const BASE_YAW = -0.55

/**
 * Wrapper that owns the car's idle motion. When the Corvette model arrives,
 * replace <PlaceholderCar /> with it; the motion and staging stay the same.
 */
export function HeroCar({ animate }: { animate: boolean }) {
  const ref = useRef<Group>(null)

  useFrame((state) => {
    if (!ref.current || !animate) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = BASE_YAW + Math.sin(t * 0.18) * 0.32
  })

  return (
    <group ref={ref} rotation={[0, BASE_YAW, 0]}>
      <PlaceholderCar />
      {/* Underglow spill onto the floor */}
      <pointLight position={[0, 0.12, 0]} color="#ff1a0a" intensity={6} distance={4} decay={2} />
    </group>
  )
}
