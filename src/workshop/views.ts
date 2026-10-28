import raw from './views.json'

/** Camera views, shared with the Blender stills (see views.json). Three coordinates, +X front, left is -Z. */
export type ViewId = keyof typeof raw.views

export interface View {
  pos: readonly [number, number, number]
  target: readonly [number, number, number]
  /** Vertical field of view in degrees. */
  fov: number
  /** Fraction of the width the car is moved right on wide layouts, to make room for the text column. */
  shift: number
  /** Opening angle of the left and right door, degrees. */
  doors: readonly [number, number]
  /** Front-wheel steering angle, degrees. */
  steer: number
  lights: boolean
}

export const views = raw.views as unknown as Record<ViewId, View>

export const stillSrc = (id: ViewId, small = false) => `/workshop/stills/${id}${small ? '-800' : ''}.webp`
