import { useEffect, type MutableRefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { CinemaWorld, type PhotoInfo, type TargetRect } from './world'

export interface CinemaProps {
  /** One slot per build. Slots fill as photographs load; the parent mutates this array and calls `setTexture`. */
  textures: (THREE.Texture | null)[]
  photos: PhotoInfo[]
  mobile: boolean
  /** Largest device pixel ratio the canvas may use. */
  dpr: number
  getTarget: () => TargetRect
  controller: MutableRefObject<CinemaWorld | null>
  /** The world is built, textures are on the GPU and shaders are compiled: the first frame is safe to show. */
  onReady: () => void
  /** WebGL cannot be used (context lost): the page falls back to the plain presentation. */
  onFail: () => void
}

function Rig({ textures, photos, mobile, getTarget, controller, onReady, onFail }: CinemaProps) {
  const { gl, scene, camera, invalidate, size } = useThree()

  useEffect(() => {
    const world = new CinemaWorld({
      scene,
      camera: camera as THREE.PerspectiveCamera,
      renderer: gl,
      textures,
      photos,
      mobile,
      invalidate,
      getTarget,
    })
    controller.current = world
    if (import.meta.env.DEV) (window as unknown as { __cinema?: CinemaWorld }).__cinema = world
    world.prepare({ w: size.width, h: size.height })
    let cancelled = false
    void world.warm().then(() => {
      if (!cancelled) onReady()
    })
    const lost = (e: Event) => {
      e.preventDefault()
      onFail()
    }
    gl.domElement.addEventListener('webglcontextlost', lost)
    return () => {
      cancelled = true
      gl.domElement.removeEventListener('webglcontextlost', lost)
      world.dispose()
      controller.current = null
    }
    // The world is built once per canvas; size changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    controller.current?.resize(size.width, size.height)
  }, [size.width, size.height, controller])

  return null
}

export default function CinemaCanvas(props: CinemaProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, props.dpr]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 220, position: [0, 14, 30] }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <Rig {...props} />
    </Canvas>
  )
}
