import { useRef } from 'react'
import * as THREE from 'three'
import { mat } from '../materials'
import { J } from '../state'
import { useJourneyFrame, Room } from '../shared'

/**
 * Scene 3 world: x +-6, z -24.2 .. -41, ceiling 6. A dark chamber the camera
 * passes through while the (DOM) inspection viewer is on screen; its far wall
 * is the portal wall in Vault.tsx.
 */
const W = 6
const H = 6
const Z0 = -24.2
const Z1 = -41

export function Chamber() {
  const depth = Z0 - Z1
  const cz = (Z0 + Z1) / 2
  const light = useRef<THREE.PointLight>(null)
  useJourneyFrame(() => {
    if (light.current) light.current.intensity = 55 * J.lightChamber
  })
  return (
    <group>
      <Room z0={Z0} z1={Z1}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, cz]} material={mat.floorStd}>
          <planeGeometry args={[2 * W, depth]} />
        </mesh>
        <gridHelper args={[2 * W, 12, '#2a3142', '#171b26']} position={[0, 0.01, cz]} scale={[1, 1, depth / (2 * W)]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * (W + 0.15), H / 2, cz]} material={mat.wall}>
              <boxGeometry args={[0.3, H, depth]} />
            </mesh>
            {[-27, -30, -33, -36, -39].map((z) => (
              <mesh key={z} position={[s * (W - 0.02), H / 2, z]} material={mat.lineWhite}>
                <boxGeometry args={[0.012, H - 0.6, 0.012]} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, H + 0.15, cz]} material={mat.wall}>
          <boxGeometry args={[2 * W + 0.6, 0.3, depth]} />
        </mesh>
      </Room>
      <pointLight ref={light} position={[0, 4.8, -31.5]} color="#bcd2ff" distance={16} decay={1.5} />
    </group>
  )
}
