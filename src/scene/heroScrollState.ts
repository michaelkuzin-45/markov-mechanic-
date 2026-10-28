/**
 * Mutable scroll state shared between the DOM (GSAP ScrollTrigger writes it)
 * and the 3D scene (useFrame reads it). A plain object avoids React re-renders
 * on every scroll tick.
 */
export const heroScroll = {
  /** 0 at the top of the hero, 1 once the hero has scrolled fully out of view. */
  progress: 0,
}
