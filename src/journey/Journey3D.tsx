import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { CameraRig } from './CameraRig'
import { QualityContext, type Quality } from './quality'
import { Opening } from './scenes/Opening'
import { Chamber } from './scenes/Chamber'
import { Vault } from './scenes/Vault'
import { TurboRoom } from './scenes/TurboRoom'
import { Showroom2 } from './scenes/Showroom2'
import { Gallery } from './scenes/Gallery'

/** Mounts only when the Suspense boundary above has resolved (the opening photograph is loaded). */
function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => onReady?.(), [onReady])
  return null
}

const BG = '#040405'

export default function Journey3D({ quality, onReady }: { quality: Quality; onReady?: () => void }) {
  return (
    <Canvas
      dpr={quality.dpr}
      camera={{ fov: 34, near: 0.1, far: 220, position: [-2.4, 1.9, 18.5] }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => gl.domElement.setAttribute('aria-hidden', 'true')}
    >
      <QualityContext.Provider value={quality}>
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 24, 70]} />
        <Suspense fallback={null}>
          <Ready onReady={onReady} />
          <Environment resolution={128} frames={1} environmentIntensity={1.1}>
            <Lightformer form="rect" intensity={4} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[14, 6, 1]} color="#fff4e4" />
            <Lightformer form="rect" intensity={1} position={[-6, 1.5, 2]} rotation-y={Math.PI / 2} scale={[8, 0.4, 1]} />
            <Lightformer form="rect" intensity={1} position={[6, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[8, 0.4, 1]} />
            <Lightformer form="rect" intensity={2.2} position={[5, 3, 4]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#fff0dc" />
          </Environment>
          <Opening />
          <Chamber />
          <Vault />
          <TurboRoom />
          <Showroom2 />
          <Gallery />
        </Suspense>
        <CameraRig />
      </QualityContext.Provider>
    </Canvas>
  )
}
