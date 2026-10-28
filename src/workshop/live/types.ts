import type { MutableRefObject } from 'react'
import type { ViewId } from '../views'

export type FailReason = 'slow' | 'context-lost' | 'error'

/** What the car is doing, apart from where the camera is. */
export interface Pose {
  doors: readonly [number, number]
  steer: number
  lights: boolean
}

export interface LiveViewProps {
  tier: 'full' | 'lite'
  view: ViewId
  pose: Pose
  /** Stage is on screen: when false the render loop stops completely. */
  active: boolean
  /** False under prefers-reduced-motion (visitor opted in to 3D): camera and parts cut instead of tween. */
  motion: boolean
  /** Slow idle turntable, Full tier only, until the visitor touches the car. */
  autoRotate: boolean
  /** Bumped by the Reset button. */
  resetKey: number
  /** DOM elements for the hotspot markers; positions are written straight to styles each rendered frame. */
  markerEls: MutableRefObject<Map<string, HTMLElement>>
  onReady: () => void
  onFail: (reason: FailReason) => void
  onInteract: () => void
}
