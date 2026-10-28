import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { dprCap, modelUrl } from '../capability'
import { views } from '../views'
import { Car } from './Car'
import { buildEnvironment } from './environment'
import { Monitor } from './Monitor'
import { Rig } from './Rig'
import type { LiveViewProps } from './types'
import styles from './LiveView.module.css'

const ENV_SIZE = { full: 256, lite: 128 } as const

/** Begin fetching and decoding the model before the viewer mounts (same cache key the viewer will use). */
export function preloadModel(tier: 'full' | 'lite') {
  useGLTF.preload(modelUrl[tier], '/draco/')
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={[0xaab4c8, 0x14141a, 0.7]} />
      <directionalLight position={[4, 6, -3]} intensity={3.4} color="#fff1e2" />
      <directionalLight position={[-5, 3, 4]} intensity={1.8} color="#8fb0ff" />
      <directionalLight position={[-3, 2, -5]} intensity={1.1} color="#ff6a50" />
    </>
  )
}

/** A soft floor pool and a contact shadow, both flat textures: no shadow pass, no reflection pass. */
function Floor() {
  const { pool, shadow } = useMemo(() => {
    const radial = (stops: [number, string][]) => {
      const c = document.createElement('canvas')
      c.width = c.height = 256
      const g = c.getContext('2d')!
      const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
      for (const [at, color] of stops) grad.addColorStop(at, color)
      g.fillStyle = grad
      g.fillRect(0, 0, 256, 256)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      return t
    }
    return {
      pool: radial([[0, 'rgba(70,70,80,0.95)'], [0.5, 'rgba(32,32,38,0.7)'], [1, 'rgba(6,6,7,0)']]),
      shadow: radial([[0, 'rgba(0,0,0,0.85)'], [0.55, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]),
    }
  }, [])
  useEffect(() => () => { pool.dispose(); shadow.dispose() }, [pool, shadow])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.004} renderOrder={-2}>
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial map={pool} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002} scale={[1, 0.46, 1]} renderOrder={-1}>
        <planeGeometry args={[5.4, 5.4]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

interface SceneProps extends Omit<LiveViewProps, 'active' | 'onFail'> {
  dpr: number
  minDpr: number
  maxDpr: number
  onDpr: (n: number) => void
  onSlow: () => void
  nudge: Parameters<typeof Rig>[0]['nudge']
}

function Scene({ tier, view, pose, motion, autoRotate, resetKey, markerEls, onReady, onInteract, dpr, minDpr, maxDpr, onDpr, onSlow, nudge }: SceneProps) {
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const env = useMemo(() => buildEnvironment(gl, ENV_SIZE[tier]), [gl, tier])
  useEffect(() => () => env.dispose(), [env])
  const driving = useRef(false)

  const ready = useCallback(() => {
    onReady()
    // The hotspot markers mount after this and are positioned by rendered frames: ask for a couple.
    window.setTimeout(invalidate, 120)
    window.setTimeout(invalidate, 600)
  }, [onReady, invalidate])

  return (
    <>
      <Lighting />
      <Floor />
      <Car tier={tier} env={env} pose={pose} motion={motion} onReady={ready} />
      <Rig view={view} motion={motion} autoRotate={autoRotate} resetKey={resetKey} markerEls={markerEls} nudge={nudge} driving={driving} onInteract={onInteract} />
      <Monitor dpr={dpr} minDpr={minDpr} maxDpr={maxDpr} onDpr={onDpr} onSlow={onSlow} driving={driving} />
    </>
  )
}

/**
 * Development only (stripped from production builds): exposes the renderer and a GPU-synced benchmark on
 * window.__workshop so frame cost can be measured in the real page. The loop renders and calls gl.finish()
 * back to back while orbiting, so it measures throughput rather than vsync.
 */
function exposeForMeasurement(gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, invalidate: () => void) {
  const benchmark = (frames = 240) => {
    const ctx = gl.getContext()
    const saved = camera.position.clone()
    const target = new THREE.Vector3(0, 0.5, 0)
    const times: number[] = []
    for (let i = 0; i < frames; i++) {
      const a = (i / frames) * Math.PI * 2
      camera.position.set(Math.cos(a) * 6, 1.8, Math.sin(a) * 6)
      camera.lookAt(target)
      const t = performance.now()
      gl.render(scene, camera)
      ctx.finish()
      times.push(performance.now() - t)
    }
    camera.position.copy(saved)
    times.sort((x, y) => x - y)
    const mean = times.reduce((x, y) => x + y, 0) / frames
    return {
      frames,
      meanMs: +mean.toFixed(2),
      medianMs: +times[frames >> 1]!.toFixed(2),
      p95Ms: +times[Math.floor(frames * 0.95)]!.toFixed(2),
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      canvas: [gl.domElement.width, gl.domElement.height],
      dpr: gl.getPixelRatio(),
    }
  }
  Object.assign(window, { __workshop: { gl, scene, camera, invalidate, benchmark } })
}

const CANVAS_LABEL =
  'Interactive 3D model of a reference car. Use the arrow keys to turn it and plus and minus to zoom. The parts list beside it does the same job.'

const KEYS: Record<string, [number, number, number]> = {
  ArrowLeft: [-10, 0, 1],
  ArrowRight: [10, 0, 1],
  ArrowUp: [0, 5, 1],
  ArrowDown: [0, -5, 1],
  '+': [0, 0, 0.88],
  '=': [0, 0, 0.88],
  '-': [0, 0, 1.14],
}

export default function LiveView({ tier, view, pose, active, motion, autoRotate, resetKey, markerEls, onReady, onFail, onInteract }: LiveViewProps) {
  const cap = dprCap[tier]
  const startDpr = Math.min(window.devicePixelRatio || 1, cap)
  const [dpr, setDpr] = useState(startDpr)
  const nudge = useRef<(az: number, pol: number, zoom: number) => void>(() => undefined)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  const first = views[view]

  return (
    <div
      className={styles.wrap}
      onKeyDown={(e) => {
        const k = KEYS[e.key]
        if (!k) return
        e.preventDefault()
        nudge.current(...k)
      }}
    >
      <Canvas
        className={styles.canvas}
        frameloop={active ? 'demand' : 'never'}
        dpr={dpr}
        camera={{ fov: first.fov, position: [...first.pos], near: 0.1, far: 60 }}
        gl={{ antialias: startDpr < 1.5, powerPreference: 'high-performance', alpha: true, stencil: false }}
        onCreated={({ gl, scene, camera, invalidate }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1
          if (import.meta.env.DEV) exposeForMeasurement(gl, scene, camera, invalidate)
          const el = gl.domElement
          el.tabIndex = 0
          el.setAttribute('role', 'img')
          el.setAttribute('aria-label', CANVAS_LABEL)
          el.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            if (alive.current) onFail('context-lost') // a loss caused by our own unmount is not news
          })
        }}
      >
        <Scene
          tier={tier}
          view={view}
          pose={pose}
          motion={motion}
          autoRotate={autoRotate}
          resetKey={resetKey}
          markerEls={markerEls}
          onReady={onReady}
          onInteract={onInteract}
          dpr={dpr}
          minDpr={0.75}
          maxDpr={cap}
          onDpr={setDpr}
          onSlow={() => onFail('slow')}
          nudge={nudge}
        />
      </Canvas>
    </div>
  )
}
