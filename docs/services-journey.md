# Services page: the 3D journey

`/services` is a continuous camera journey through seven connected spaces,
built with React Three Fiber and driven by one scrubbed GSAP timeline.
Everything lives in `src/journey/` and is loaded lazily; the homepage and its
Gallardo sequence are untouched.

Fallbacks (the previous photographic page, unchanged): `prefers-reduced-motion`,
no WebGL2, or `/services?flat`.

## Asset audit

| Need | What exists | Used as |
| --- | --- | --- |
| Showroom sports car | `blender/markov-gallardo.blend` (CC0 Gallardo, Blend Swap #81248) | Exported once to `public/models/gallardo.glb` (Draco, 1.4 MB) from collection `MKV_Gallardo`. **Genuine 3D.** |
| Performance car | `blender/exports/markov_car_draco.glb`, Markov's own C8-inspired concept (built in Blender, not a real Corvette) | `public/models/markov-c8-concept.glb`. **Genuine 3D, stand-in for the Corvette.** |
| Miata workshop, engine bay, Porsche | Real photographs from the original site (`assets/reference-site`) | `public/photos/*.webp`, applied to 3D surfaces (slats, slabs, hung frames). **Photographic.** |
| Brake assembly | none | `scenes/Brake.tsx`: abstract placeholder (hub, rotor, pads, caliper, bracket). Not an accurate part. |
| Turbocharger | none | `scenes/Turbo.tsx`: abstract placeholder (cover, wheels, centre housing, turbine housing). Not an accurate part. |
| Real Corvette | none | The Markov concept stands in. |

### Missing assets (exact)

1. **Licensed brake-assembly GLB** with separate nodes `Rotor`, `Caliper`,
   `PadA`, `PadB`, `Hub`, `Bracket`. Replace `Brake.tsx`; the exploded-view
   offsets are in its `useJourneyFrame`.
2. **Licensed turbocharger GLB** with nodes `CompressorCover`,
   `CompressorWheel`, `CenterHousing`, `TurbineWheel`, `TurbineHousing`.
   Replace `Turbo.tsx` (same offsets pattern, axis along X).
3. **A Corvette GLB** (licensed or an owned customer car) to replace the
   concept car in `scenes/Showroom2.tsx`.
4. Higher-resolution originals of the Miata, engine-bay and Porsche
   photographs (the embedded ones are 1.1–1.5k px wide).

No model was downloaded; nothing here claims to be a customer car.

## World layout (camera travels along -Z)

| z | Space | Transformation |
| --- | --- | --- |
| +12 … -8 | 1 Showroom (Gallardo) | back wall: two panels slide apart |
| -8 … -24 | 2 Workshop | far wall = 12 slats carrying the workshop photo; they turn edge-on |
| -24 … -41 | 3 Diagnostic chamber | engine-bay photo, scan plane, 4 markers + lines; photo slides into the wall; portal wall with a circular opening |
| -41 … -56 | 4 Brake chamber | exploded view and reassembly; end wall splits up / down |
| -56 … -72 | 5 Turbo room | exploded view and reassembly; end wall = 4 photo slabs sliding away alternately |
| -72 … -92 | 6 Performance showroom | concept car, pull-back; end wall = 2 pivot doors |
| -92 … -108 | 7 Gallery | Porsche photograph, closing call to action |

## How it is wired

- `state.ts`: one mutable object `J` (camera index, wall/louvre/explode/shutter values, per-room light levels). No React re-renders.
- `timeline.ts`: the single master timeline. Every state tween is a `fromTo` with a known start, so jumping or reversing the scroll always lands on the same pose. Camera legs have their own ease (decelerate into a held composition, continuous through openings). Captions are in the same timeline.
- `cameraPath.ts`: named key poses, interpolated with Catmull-Rom curves.
- `scenes/*`: one component per room; geometry is wrapped in `<Room>` (drawn only when the camera is near), lights stay outside it so the light count never changes.
- `JourneyExperience.tsx`: a tall section with a sticky stage; `ScrollTrigger` scrubs the timeline (40 vh of scroll per timeline unit, 46 vh on phones).
- Quality: `quality.ts`. Phones skip the reflective floors and use a lower pixel ratio and fewer fins.
- Dev only: `window.__journey = { tl, st, duration }` (jump the timeline with `__journey.st.kill(false); __journey.tl.time(12)`).

Scroll length and pacing are the first things to tune: change `VH_PER_UNIT`
and the times in `timeline.ts`.
