import { useRef } from 'react'
import { images } from '@/images/registry'
import * as THREE from 'three'
import { mat } from '../materials'
import { J } from '../state'
import { GlossFloor, PhotoPlane, Spot, useJourneyFrame, Room } from '../shared'

/**
 * Scene 7 world: x +-9, z -92.2 .. -108, ceiling 7. A final gallery: the real
 * Porsche Cayman photograph hung as the centrepiece, with the polished floor
 * reflecting it.
 */
const W = 9
const H = 7
const Z0 = -92.2
const Z1 = -108
const PHOTO = { src: images.porsche.src, w: 9.8, h: 5.5, y: 3.6, z: -107.55 }

export function Gallery() {
  const depth = Z0 - Z1
  const cz = (Z0 + Z1) / 2
  const wash = useRef<THREE.SpotLight>(null)

  useJourneyFrame(() => {
    const l = J.lightGallery
    if (wash.current) wash.current.intensity = 160 * l
  })

  return (
    <group>
      <Room z0={-92.2} z1={-108.2}>
      <GlossFloor width={2 * W} depth={depth} position={[0, 0, cz]} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W + 0.15), H / 2, cz]} material={mat.wall}>
          <boxGeometry args={[0.3, H, depth]} />
        </mesh>
      ))}
      <mesh position={[0, H + 0.15, cz]} material={mat.wall}>
        <boxGeometry args={[2 * W + 0.6, 0.3, depth]} />
      </mesh>
      <mesh position={[0, H / 2, Z1 - 0.15]} material={mat.wall}>
        <boxGeometry args={[2 * W, H, 0.3]} />
      </mesh>

      {/* the photograph, in a thin frame with a light line under it */}
      <mesh position={[0, PHOTO.y, PHOTO.z - 0.1]} material={mat.panelEdge}>
        <boxGeometry args={[PHOTO.w + 0.3, PHOTO.h + 0.3, 0.1]} />
      </mesh>
      <PhotoPlane src={PHOTO.src} width={PHOTO.w} height={PHOTO.h} level={() => 0.08 + 0.92 * J.lightGallery} position={[0, PHOTO.y, PHOTO.z + 0.01]} />
      <mesh position={[0, PHOTO.y - PHOTO.h / 2 - 0.35, PHOTO.z + 0.02]} material={mat.lineWhite}>
        <boxGeometry args={[PHOTO.w, 0.012, 0.01]} />
      </mesh>
      {[-6.2, 6.2].map((x) => (
        <mesh key={x} position={[x, H / 2, -107.4]} material={mat.lightRed}>
          <boxGeometry args={[0.03, H - 0.8, 0.03]} />
        </mesh>
      ))}      </Room>


      <Spot ref={wash} target={[0, 3.4, -107.5]} position={[0, 6.6, -101]} angle={0.8} penumbra={1} color="#fff1e6" distance={20} />
    </group>
  )
}
