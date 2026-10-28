import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroScroll } from './heroScrollState'

const target = new THREE.Vector3()
const desired = new THREE.Vector3()

/**
 * Frames the car for the current aspect ratio, adds a subtle pointer
 * parallax, and dollies back as the hero scrolls away.
 */
export function CameraRig({ interactive }: { interactive: boolean }) {
  const size = useThree((s) => s.size)
  const aspect = size.width / size.height
  const portrait = aspect < 0.85

  // Portrait screens need the camera further back to fit the car's length.
  const distance = portrait ? 1.9 : aspect < 1.3 ? 1.35 : 1.15
  const base = { x: 6.2 * distance, y: portrait ? 2.4 : 1.25, z: 7.2 * distance }
  // Look below the car on portrait so it sits in the top half,
  // leaving room for the headline beneath it.
  const lookY = portrait ? -1.1 : 0.45

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera
    const px = interactive ? state.pointer.x : 0
    const py = interactive ? state.pointer.y : 0
    const scroll = heroScroll.progress

    desired.set(
      base.x + px * 0.6,
      base.y + py * 0.25 + scroll * 1.2,
      base.z + scroll * 2.5,
    )
    cam.position.x = THREE.MathUtils.damp(cam.position.x, desired.x, 2.5, delta)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, desired.y, 2.5, delta)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, desired.z, 2.5, delta)

    target.set(0, lookY, 0)
    cam.lookAt(target)

    // Shift the frame so the car sits right of centre on wide screens,
    // clear of the headline on the left.
    const offset = portrait ? 0 : aspect > 1.3 ? -6 : -3
    if (cam.filmOffset !== offset) {
      cam.filmOffset = offset
      cam.updateProjectionMatrix()
    }
  })

  return null
}
