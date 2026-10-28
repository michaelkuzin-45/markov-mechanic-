import * as THREE from 'three'

/**
 * A small studio drawn from emissive panels and prefiltered once (PMREM) into a reflection map. It echoes the
 * showroom the stills are rendered in: an overhead softbox, two long strip lights, a front fill and one warm
 * and one cool accent. Nothing is downloaded and nothing is redrawn per frame.
 */
export function buildEnvironment(gl: THREE.WebGLRenderer, size: number): THREE.Texture {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020203)
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []

  const panel = (w: number, h: number, rgb: readonly [number, number, number], pos: readonly [number, number, number]) => {
    const geometry = new THREE.PlaneGeometry(w, h)
    // Colour components above 1 are deliberate: these are light sources, and PMREM keeps the range.
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb), side: THREE.DoubleSide, toneMapped: false })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...pos)
    mesh.lookAt(0, 0.5, 0)
    scene.add(mesh)
    geometries.push(geometry)
    materials.push(material)
  }

  panel(6, 2.2, [9, 9, 9.4], [0, 5.5, 0.4]) // overhead softbox: small, so it reads as a highlight on dark paint
  panel(12, 0.5, [18, 18, 18], [0, 2.2, 6]) // strip, right side
  panel(12, 0.5, [18, 18, 18], [0, 2.2, -6]) // strip, left side
  panel(6, 3, [3, 3, 3.2], [8, 2, 0]) // front fill
  panel(5, 2.2, [6, 0.7, 0.5], [-7, 2, 3]) // warm accent, rear
  panel(5, 2.2, [0.6, 1.4, 6.5], [6, 1.4, -5]) // cool accent, front left
  panel(9, 1.2, [2.2, 2.2, 2.4], [0, 0.4, -8]) // low bounce, shows in the lower body

  const pmrem = new THREE.PMREMGenerator(gl)
  const target = pmrem.fromScene(scene, 0.03, 0.1, 100, { size })
  pmrem.dispose()
  geometries.forEach((g) => g.dispose())
  materials.forEach((m) => m.dispose())
  return target.texture
}
