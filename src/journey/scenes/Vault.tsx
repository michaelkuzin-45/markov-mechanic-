import { useMemo, useRef } from 'react'
import { images } from '@/images/registry'
import * as THREE from 'three'
import { mat } from '../materials'
import { J } from '../state'
import type { StackPanel } from "../shared"
import { PhotoStack, Spot, useJourneyFrame, Room } from '../shared'

/**
 * Scene 4 world: x +-5.2, z -41.25 .. -56, ceiling 5.6.
 *  - z -41: the chamber's far wall, with a circular opening (a ring of light)
 *  - the mechanical display chamber with the brake assembly at z -49.5
 *  - z -56.2: shutter wall, split into an upper slab (slides up into the
 *    ceiling) and a lower slab (slides down into the floor)
 */
const W = 5.2
const H = 5.6
const Z_PORTAL = -41
const Z0 = -41.25
const Z1 = -56
const BRAKE_PANELS: StackPanel[] = [
  { src: images.audi.src, crop: [0.1, 0.35, 0.85, 1], w: 3.4, h: 2.5, pos: [-0.5, 0, 0], spread: [-0.7, 0, 1.0], yaw: 0.12, label: 'Front wheel + brake area' },
  { src: images.mercedes.src, crop: [0.1, 0.5, 0.6, 1], w: 2.0, h: 1.8, pos: [2.2, 0.55, -0.5], spread: [0.8, 0.1, -1.1], yaw: -0.25, label: 'Wheel + suspension area' },
]
const HOLE = { x: 0, y: 1.95, r: 1.55 }

function PortalWall() {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    const w = 6.2
    s.moveTo(-w, 0)
    s.lineTo(w, 0)
    s.lineTo(w, 6)
    s.lineTo(-w, 6)
    s.closePath()
    const hole = new THREE.Path()
    hole.absarc(HOLE.x, HOLE.y, HOLE.r, 0, Math.PI * 2, true)
    s.holes.push(hole)
    return new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: false, curveSegments: 72 })
  }, [])
  const ring = useRef<THREE.Mesh>(null)
  useJourneyFrame(() => {
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.25 + 0.75 * J.portal
    }
  })
  return (
    <group position={[0, 0, Z_PORTAL]}>
      <mesh geometry={geo} position={[0, 0, -0.2]} material={mat.panel} />
      <mesh ref={ring} position={[HOLE.x, HOLE.y, 0.005]}>
        <torusGeometry args={[HOLE.r, 0.022, 10, 120]} />
        <meshBasicMaterial color="#ff2a1f" toneMapped={false} transparent opacity={0.25} />
      </mesh>
      <mesh position={[HOLE.x, HOLE.y, 0.005]}>
        <torusGeometry args={[HOLE.r + 0.22, 0.008, 8, 120]} />
        <meshBasicMaterial color="#cfd6e6" toneMapped={false} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export function Vault() {
  const depth = Z0 - Z1
  const cz = (Z0 + Z1) / 2
  const upper = useRef<THREE.Mesh>(null)
  const lower = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.SpotLight>(null)
  const rim = useRef<THREE.PointLight>(null)

  useJourneyFrame(() => {
    const s = J.shutter
    if (upper.current) upper.current.position.y = H * 0.75 + 2.9 * s
    if (lower.current) lower.current.position.y = H * 0.25 - 2.9 * s
    const l = J.lightVault
    if (light.current) light.current.intensity = 260 * l
    if (rim.current) rim.current.intensity = 40 * l
  })

  return (
    <group>
      <Room z0={-41} z1={-56.3}>
      <PortalWall />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, cz]} material={mat.floorStd}>
        <planeGeometry args={[2 * W, depth]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W + 0.15), H / 2, cz]} material={mat.wall}>
          <boxGeometry args={[0.3, H, depth]} />
        </mesh>
      ))}
      <mesh position={[0, H + 0.15, cz]} material={mat.wall}>
        <boxGeometry args={[2 * W + 0.6, 0.3, depth]} />
      </mesh>
      {/* circular ribs: the portal's shape repeats down the chamber */}
      {[-43.8, -46.6, -52.4, -54.8].map((z) => (
        <mesh key={z} position={[0, H / 2, z]} material={mat.lineWhite}>
          <torusGeometry args={[2.75, 0.014, 8, 96]} />
        </mesh>
      ))}
      {/* display plinth + ring on the floor under the assembly */}
      <mesh position={[1.3, 0.03, -49.5]} material={mat.panelEdge}>
        <cylinderGeometry args={[1.5, 1.55, 0.06, 64]} />
      </mesh>
      <mesh position={[1.3, 0.065, -49.5]} rotation-x={Math.PI / 2} material={mat.lightRed}>
        <torusGeometry args={[1.45, 0.012, 8, 96]} />
      </mesh>

      <PhotoStack
        position={[1.3, 1.75, -49.5]}
        panels={BRAKE_PANELS}
        amount={() => J.brake}
        level={() => 0.15 + 0.85 * J.lightVault}
      />

      {/* shutter wall */}
      <mesh ref={upper} position={[0, H * 0.75, Z1 - 0.2]} material={mat.panel}>
        <boxGeometry args={[2 * W, H / 2, 0.3]} />
      </mesh>
      <mesh ref={lower} position={[0, H * 0.25, Z1 - 0.2]} material={mat.panel}>
        <boxGeometry args={[2 * W, H / 2, 0.3]} />
      </mesh>
      <mesh position={[0, H / 2, Z1 - 0.02]} material={mat.lightRed}>
        <boxGeometry args={[2 * W - 0.2, 0.02, 0.01]} />
      </mesh>      </Room>


      <Spot ref={light} target={[1.3, 1.5, -49.5]} position={[1.3, 5.3, -46.5]} angle={0.55} penumbra={1} color="#dfe8ff" distance={14} />
      <pointLight ref={rim} position={[-3.5, 1.2, -52.5]} color="#ff3a2a" distance={9} decay={1.6} />
    </group>
  )
}
