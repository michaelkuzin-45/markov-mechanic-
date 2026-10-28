import { MeshReflectorMaterial } from '@react-three/drei'

/** Glossy dark studio floor with a blurred reflection of the car. */
export function Floor({ quality = 'high' }: { quality?: 'high' | 'low' }) {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        resolution={quality === 'high' ? 1024 : 512}
        blur={[400, 120]}
        mixBlur={1}
        mixStrength={30}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        roughness={1}
        metalness={0.6}
        color="#08080a"
      />
    </mesh>
  )
}
