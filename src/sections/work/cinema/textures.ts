import * as THREE from 'three'
import { imageOf, type Project } from '@/work/projects'

/**
 * Loads (and decodes) one build's photograph as a texture. Phones get the 800 px copy. Only the first build's texture
 * is awaited before the opening starts, so the photograph the camera flies toward is already sharp when it arrives;
 * the others load in the background while the camera is in the dark and are shown as they arrive.
 */
export function loadPhotoTexture(project: Project, small: boolean, anisotropy: number): Promise<THREE.Texture> {
  const image = imageOf(project)
  return new Promise<THREE.Texture>((resolve, reject) => {
    new THREE.TextureLoader().load(
      small ? image.small : image.src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = anisotropy
        texture.generateMipmaps = true
        texture.minFilter = THREE.LinearMipmapLinearFilter
        resolve(texture)
      },
      undefined,
      () => reject(new Error(`Could not load ${image.src}`)),
    )
  })
}
