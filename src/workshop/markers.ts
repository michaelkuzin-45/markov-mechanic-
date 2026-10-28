import type { HotspotId } from './hotspots'

/**
 * Pointer shortcuts drawn over the live 3D car. They only duplicate the hotspot list (which is the accessible
 * control), so the buttons are hidden from assistive tech. Positions are car-frame three coordinates; a marker
 * is hidden when its outward normal faces away from the camera.
 */
export interface MarkerSpec {
  id: string
  hotspot: HotspotId
  anchor: readonly [number, number, number]
  normal: readonly [number, number, number]
}

export const markers: readonly MarkerSpec[] = [
  { id: 'wheels-l', hotspot: 'wheels', anchor: [1.27, 0.33, -1.04], normal: [0, 0, -1] },
  { id: 'wheels-r', hotspot: 'wheels', anchor: [1.24, 0.33, 1.04], normal: [0, 0, 1] },
  { id: 'cabin', hotspot: 'cabin', anchor: [0.05, 1.14, -0.3], normal: [0, 1, 0] },
  { id: 'rear', hotspot: 'rear', anchor: [-2.12, 0.62, 0], normal: [-1, 0, 0] },
  { id: 'engine', hotspot: 'engine', anchor: [-1.24, 0.9, 0], normal: [0, 1, 0] },
]
