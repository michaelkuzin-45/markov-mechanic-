import { PhotoPlane } from '../shared'
import { images } from '@/images/registry'
import { J } from '../state'

/**
 * The opening: ONE uninterrupted photograph of a real Markov vehicle (the Miata with its
 * hood open in the workshop), hung in the dark. Nothing is split or duplicated; the depth comes
 * from the camera: it eases in, then arcs around the side of the photograph
 * on its way to the workshop (see cameraPath.ts: o0, mA, mB, mC).
 */
const W = 6.67
const H = 5

export function Opening() {
  return (
    <group position={[0, 2.4, 6]} rotation-y={-0.16}>
      <PhotoPlane src={images.hoodUp.src} width={W} height={H} level={() => Math.max(0, Math.min(1, 1 - (J.t - 1.2) * 1.6))} />
    </group>
  )
}
