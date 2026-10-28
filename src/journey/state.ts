/**
 * Shared, mutable state for the Services journey. The master GSAP timeline
 * (timeline.ts) animates these numbers; the R3F scene components only ever
 * read them inside useFrame. Nothing here causes a React re-render.
 */
export const J = {
  /** Camera path position as a fractional keyframe index (see cameraPath.ts). */
  t: 0,
  /** Slow idle camera drift while a scene is settled (metres, added to the path). */
  driftX: 0,
  driftY: 0,

  // Architectural transformations, each 0 (closed / assembled) -> 1 (open / exploded)
  fgWall: 0, // showroom foreground wall slides away
  op1: 0, // opening: strips of each photograph slide away
  op2: 0,
  op3: 0,
  wall1: 0, // showroom back wall: two panels slide apart
  louvre: 0, // workshop photo installation: slats turn edge-on
  photoSlide: 0, // diagnostic photo slides into the chamber wall
  scan: 0, // scanning plane sweep
  markers: 0, // inspection markers + lines draw in
  portal: 0, // portal ring glow
  brake: 0, // brake assembly exploded view
  shutter: 0, // vault end wall splits
  turbo: 0, // turbo exploded view
  slabs: 0, // turbo room end wall slabs slide away
  pivot: 0, // gallery pivot doors

  // Per-room light level 0..1 (also dims the photographs hung in that room)
  lightShow: 1,
  lightShop: 1,
  lightChamber: 0.0,
  lightVault: 0.0,
  lightTurbo: 0.0,
  lightShow2: 0.0,
  lightGallery: 0.0,

  /** Active inspection marker (0-3), driven by the timeline. */
  marker: 0,
  /** Active turbo marker (user-selected). */
  marker2: -1,
}

export type JourneyState = typeof J

export function resetJourney() {
  Object.assign(J, {
    t: 0, driftX: 0, driftY: 0, fgWall: 0, op1: 0, op2: 0, op3: 0, wall1: 0, louvre: 0, photoSlide: 0, scan: 0, markers: 0, portal: 0,
    brake: 0, shutter: 0, turbo: 0, slabs: 0, pivot: 0, lightShow: 1, lightShop: 1, lightChamber: 0,
    lightVault: 0, lightTurbo: 0, lightShow2: 0, lightGallery: 0, marker: 0, marker2: -1,
  })
}
