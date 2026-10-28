import { useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Stylised low-poly sports-car silhouette built from extruded side profiles.
 * Temporary stand-in for the Corvette GLB — swap it out in `HeroCar.tsx`.
 * Units are roughly metres; the car is ~4.6 m long, nose pointing +X.
 */

const WHEEL_RADIUS = 0.36
const WHEEL_WIDTH = 0.28
const FRONT_AXLE_X = 1.45
const REAR_AXLE_X = -1.42
const ARCH_RADIUS = 0.42
const BODY_DEPTH = 1.7
const CABIN_DEPTH = 1.24
const TRACK_Z = 0.86

function createBodyShape() {
  const s = new THREE.Shape()
  const groundY = 0.24
  const axleY = WHEEL_RADIUS

  s.moveTo(-2.25, groundY)
  s.lineTo(-2.3, 0.62)
  s.lineTo(-2.22, 0.86) // rear spoiler lip
  s.lineTo(-1.2, 0.92)
  s.lineTo(0.95, 0.96) // cowl / windshield base
  s.lineTo(2.0, 0.76) // hood
  s.lineTo(2.3, 0.58) // nose
  s.lineTo(2.28, groundY)

  // Front wheel arch
  s.lineTo(FRONT_AXLE_X + ARCH_RADIUS, groundY)
  s.lineTo(FRONT_AXLE_X + ARCH_RADIUS, axleY)
  s.absarc(FRONT_AXLE_X, axleY, ARCH_RADIUS, 0, Math.PI, false)
  s.lineTo(FRONT_AXLE_X - ARCH_RADIUS, groundY)

  // Rear wheel arch
  s.lineTo(REAR_AXLE_X + ARCH_RADIUS, groundY)
  s.lineTo(REAR_AXLE_X + ARCH_RADIUS, axleY)
  s.absarc(REAR_AXLE_X, axleY, ARCH_RADIUS, 0, Math.PI, false)
  s.lineTo(REAR_AXLE_X - ARCH_RADIUS, groundY)

  s.closePath()
  return s
}

function createCabinShape() {
  const s = new THREE.Shape()
  s.moveTo(-1.3, 0.86)
  s.lineTo(-0.5, 1.22) // fastback roofline
  s.lineTo(0.2, 1.25)
  s.lineTo(1.0, 0.9) // raked windshield
  s.closePath()
  return s
}

const smoothstep = THREE.MathUtils.smoothstep

/**
 * Extrudes a side profile, then sculpts it: the upper body pulls inward
 * (tumblehome) and the nose and tail narrow in plan view, so the slab reads
 * as a car rather than a brick.
 */
function extrude(
  shape: THREE.Shape,
  depth: number,
  bevel: number,
  taper: { fromY: number; toY: number; amount: number },
) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.7,
    bevelSegments: 8,
    curveSegments: 24,
    steps: 1,
  })
  geometry.translate(0, 0, -depth / 2)

  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    let scale = 1 - taper.amount * smoothstep(y, taper.fromY, taper.toY)
    scale *= 1 - 0.14 * smoothstep(x, 1.5, 2.4) // nose
    scale *= 1 - 0.06 * smoothstep(-x, 1.8, 2.4) // tail
    pos.setZ(i, pos.getZ(i) * scale)
  }
  geometry.computeVertexNormals()
  return geometry
}

function Wheel({ position }: { position: [number, number, number] }) {
  const outward = position[2] > 0 ? 1 : -1
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 40]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.85} />
      </mesh>
      {/* Rim face */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, outward * 0.006]}>
        <cylinderGeometry args={[WHEEL_RADIUS * 0.68, WHEEL_RADIUS * 0.68, WHEEL_WIDTH + 0.01, 40]} />
        <meshStandardMaterial color="#2a2a2e" metalness={1} roughness={0.28} />
      </mesh>
      {/* Brake caliper — the red accent */}
      <mesh position={[0.1, 0.1, outward * (WHEEL_WIDTH / 2 - 0.04)]}>
        <boxGeometry args={[0.16, 0.12, 0.06]} />
        <meshStandardMaterial
          color="#e10600"
          emissive="#e10600"
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}

export function PlaceholderCar(props: ThreeElements['group']) {
  const bodyGeometry = useMemo(
    () => extrude(createBodyShape(), BODY_DEPTH, 0.12, { fromY: 0.45, toY: 1.0, amount: 0.12 }),
    [],
  )
  const cabinGeometry = useMemo(
    () => extrude(createCabinShape(), CABIN_DEPTH, 0.1, { fromY: 0.86, toY: 1.3, amount: 0.3 }),
    [],
  )

  return (
    <group {...props}>
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#16161a"
          metalness={0.85}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.4}
        />
      </mesh>

      <mesh geometry={cabinGeometry} castShadow>
        <meshPhysicalMaterial
          color="#050507"
          metalness={0.2}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Headlights */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[2.2, 0.66, side * 0.66]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.28, 0.035, 0.34]} />
          <meshStandardMaterial color="#ffffff" emissive="#dfe8ff" emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}

      {/* Full-width tail-light bar */}
      <mesh position={[-2.33, 0.74, 0]}>
        <boxGeometry args={[0.04, 0.05, BODY_DEPTH + 0.1]} />
        <meshStandardMaterial color="#ff1a0a" emissive="#ff1a0a" emissiveIntensity={6} toneMapped={false} />
      </mesh>

      {/* Side accent line */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0.1, 0.5, side * (BODY_DEPTH / 2 + 0.121)]}>
          <boxGeometry args={[2.0, 0.012, 0.004]} />
          <meshStandardMaterial color="#e10600" emissive="#e10600" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}

      <Wheel position={[FRONT_AXLE_X, WHEEL_RADIUS, TRACK_Z]} />
      <Wheel position={[FRONT_AXLE_X, WHEEL_RADIUS, -TRACK_Z]} />
      <Wheel position={[REAR_AXLE_X, WHEEL_RADIUS, TRACK_Z]} />
      <Wheel position={[REAR_AXLE_X, WHEEL_RADIUS, -TRACK_Z]} />
    </group>
  )
}
