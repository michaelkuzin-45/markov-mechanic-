import { useRef } from 'react'
import { images } from '@/images/registry'
import * as THREE from 'three'
import { mat } from '../materials'
import { J } from '../state'
import { PhotoPlane, Spot, useJourneyFrame, Room } from '../shared'

/**
 * Scene 6 world: x +-9, z -72.2 .. -92, ceiling 7. The performance showroom.
 * A white hall with the real Corvette photograph on a standing plate.
 * The end wall is two pivot doors that swing open into the gallery.
 */
const W = 9
const H = 7
const Z0 = -72.2
const Z1 = -92

export function Showroom2() {
  const depth = Z0 - Z1
  const cz = (Z0 + Z1) / 2
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const key = useRef<THREE.SpotLight>(null)
  const rimL = useRef<THREE.SpotLight>(null)
  const rimR = useRef<THREE.SpotLight>(null)

  useJourneyFrame(() => {
    const a = (Math.PI / 2) * 0.96 * J.pivot
    if (left.current) left.current.rotation.y = a
    if (right.current) right.current.rotation.y = -a
    const l = J.lightShow2
    if (key.current) key.current.intensity = 90 * l
    if (rimL.current) rimL.current.intensity = 40 * l
    if (rimR.current) rimR.current.intensity = 30 * l
  })

  return (
    <group>
      <Room z0={-72.2} z1={-92.2}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, cz]}>
        <planeGeometry args={[2 * W, depth]} />
        <meshStandardMaterial color="#c9c3b8" roughness={0.38} metalness={0} envMapIntensity={0.8} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (W + 0.15), H / 2, cz]} material={mat.whiteWall}>
            <boxGeometry args={[0.3, H, depth]} />
          </mesh>
          {[-76, -80, -84, -88].map((z) => (
            <mesh key={z} position={[s * (W - 0.02), H / 2, z]} material={mat.lightRed}>
              <boxGeometry args={[0.012, H - 0.8, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, H + 0.15, cz]} material={mat.whiteWall}>
        <boxGeometry args={[2 * W + 0.6, 0.3, depth]} />
      </mesh>
      {[-4, 0, 4].map((x) => (
        <mesh key={x} position={[x, H - 0.02, -83]} material={mat.lightWhite}>
          <boxGeometry args={[0.16, 0.04, 14]} />
        </mesh>
      ))}

      {/* a standing photographic plate with a real photograph of Dima's work */}
      <group position={[-2.2, 0, -85]} rotation-y={0.22}>
        <mesh position={[0, 0.06, -0.12]} material={mat.whiteEdge}>
          <boxGeometry args={[6.6000000000000005, 0.12, 0.7]} />
        </mesh>
        <mesh position={[0, 1.965, -0.07]} material={mat.whiteEdge}>
          <boxGeometry args={[6.5, 3.43, 0.08]} />
        </mesh>
        <PhotoPlane src={images.corvetteC8.src} width={6.4} height={3.33} level={() => 1} position={[0, 1.965, 0]} />
      </group>

      {/* pivot doors: hinged on the outer walls, swinging into the gallery */}
      <group ref={left} position={[-W, H / 2, Z1]}>
        <mesh position={[W / 2, 0, -0.15]} material={mat.whitePanel}>
          <boxGeometry args={[W, H, 0.3]} />
        </mesh>
        <mesh position={[W - 0.03, 0, 0.01]} material={mat.lightRed}>
          <boxGeometry args={[0.025, H - 0.4, 0.02]} />
        </mesh>
      </group>
      <group ref={right} position={[W, H / 2, Z1]}>
        <mesh position={[-W / 2, 0, -0.15]} material={mat.whitePanel}>
          <boxGeometry args={[W, H, 0.3]} />
        </mesh>
        <mesh position={[-W + 0.03, 0, 0.01]} material={mat.lightRed}>
          <boxGeometry args={[0.025, H - 0.4, 0.02]} />
        </mesh>
      </group>      </Room>


      <Spot ref={key} target={[0, 0.6, -85]} position={[0, 6.4, -83]} angle={0.5} penumbra={1} color="#e8eeff" distance={14} />
      <Spot ref={rimL} target={[0, 0.6, -85]} position={[-6, 3.4, -90]} angle={0.55} penumbra={1} color="#fff1e6" distance={15} />
      <Spot ref={rimR} target={[0, 0.6, -85]} position={[6.5, 3.2, -80]} angle={0.55} penumbra={1} color="#fff1e6" distance={15} />
    </group>
  )
}
