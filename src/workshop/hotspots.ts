import { fromSite, pending } from './content'
import type { ViewId } from './views'

export type HotspotId = 'wheels' | 'cabin' | 'rear' | 'engine'

export interface Hotspot {
  id: HotspotId
  /** Camera view the stage moves to (and the still shown in the Static tier). */
  view: ViewId
  title: string
  /** Service wording from the shop's own site (verbatim). */
  service: { title: string; copy: string }
  /**
   * 'photo' hotspots leave the 3D car for a real photograph. The car has no engine bay
   * (the engine cover is a closed panel), so the engine is shown on a separate Miata.
   */
  kind: 'car' | 'photo'
}

/**
 * Four hotspots. "Body and paint" and "front and lights" were considered and dropped: the first has no
 * service wording of its own on the site, and the lights are a switch on the stage, not a place.
 */
export const hotspots: readonly Hotspot[] = [
  { id: 'wheels', view: 'wheels', title: pending.hotspots.wheels.title, service: fromSite.service.brakes, kind: 'car' },
  { id: 'cabin', view: 'cabin', title: pending.hotspots.cabin.title, service: fromSite.service.diagnostics, kind: 'car' },
  { id: 'rear', view: 'rear', title: pending.hotspots.rear.title, service: fromSite.service.performance, kind: 'car' },
  { id: 'engine', view: 'engine', title: pending.hotspots.engine.title, service: fromSite.service.turbo, kind: 'photo' },
]

export const hotspotById = (id: HotspotId | null) => hotspots.find((h) => h.id === id) ?? null
