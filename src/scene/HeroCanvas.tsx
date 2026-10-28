import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { CameraRig } from './CameraRig'
import { Floor } from './Floor'
import { HeroCar } from './HeroCar'
import { Lighting } from './Lighting'

const BG = '#060607'

interface HeroCanvasProps {
  onReady?: () => void
}

/** Full-bleed WebGL scene behind the homepage hero. Lazy-loaded. */
export function HeroCanvas({ onReady }: HeroCanvasProps) {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()

  return (
    <Canvas
      shadows="percentage"
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: 32, near: 0.1, far: 100, position: [6, 2, 7] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={() => onReady?.()}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 9, 24]} />

      <Suspense fallback={null}>
        <Lighting />
        <HeroCar animate={!reducedMotion} />
        <Floor quality={isMobile ? 'low' : 'high'} />
      </Suspense>

      <CameraRig interactive={!reducedMotion && !isMobile} />
    </Canvas>
  )
}

export default HeroCanvas
