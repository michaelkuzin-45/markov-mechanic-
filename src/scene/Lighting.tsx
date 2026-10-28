import { Environment, Lightformer } from '@react-three/drei'

/**
 * Studio lighting: a procedural environment (no HDR download) for paint
 * reflections, plus red rim lights for the signature accent.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.08} />

      {/* Red rim lights, behind and to either side of the car */}
      <spotLight
        position={[-6, 4, -5]}
        angle={0.5}
        penumbra={1}
        intensity={180}
        color="#ff1a0a"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight position={[6, 3, -4]} angle={0.55} penumbra={1} intensity={90} color="#ff2a1f" />

      {/* Cool key light from the front, kept low so the car stays moody */}
      <spotLight position={[4, 6, 6]} angle={0.4} penumbra={1} intensity={40} color="#dfe6ff" />

      <Environment resolution={256} frames={1}>
        {/* Overhead softbox — the long highlight along the body */}
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 2, 1]} />
        {/* Side strips */}
        <Lightformer form="rect" intensity={1.2} position={[-6, 1.5, 2]} rotation-y={Math.PI / 2} scale={[8, 0.4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[8, 0.4, 1]} />
        {/* Red accents */}
        <Lightformer form="ring" color="#ff1a0a" intensity={6} position={[-4, 2, -6]} scale={3} />
        <Lightformer form="rect" color="#e10600" intensity={4} position={[4, 0.6, -6]} scale={[6, 0.3, 1]} />
      </Environment>
    </>
  )
}
