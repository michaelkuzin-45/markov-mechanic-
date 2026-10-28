import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { samplePath } from './cameraPath'
import { J } from './state'

const pos = new THREE.Vector3()
const look = new THREE.Vector3()
const REF_ASPECT = 1.6

/** Drives the camera from the journey state. Portrait screens widen the lens so the composition still fits. */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)

  useFrame(() => {
    samplePath(J.t, pos, look)
    pos.x += J.driftX
    pos.y += J.driftY
    camera.position.copy(pos)
    camera.lookAt(look)
    const aspect = size.width / size.height
    const base = 34
    const fov = aspect >= REF_ASPECT ? base : Math.min(80, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(base) / 2) * (REF_ASPECT / aspect) ** 0.85)))
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })
  return null
}
