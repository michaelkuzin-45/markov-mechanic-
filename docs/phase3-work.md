# Work page (`/work`): cinematic redesign

Screenshots: `docs/work-screenshots/`, captured from the production build while it played in real time.
Checkpoint before the redesign: tag `work-before-cinematic` (commit `558bdba`). Image update: see `docs/image-assignments.md` (nine builds, tag `images-before-audit` before it).

## The experience

One continuous camera shot, then a gallery you move through.

1. **Facing the word.** "THE WORK" as solid, extruded 3D capitals in a dark space, "Every build has a story." underneath. The
   shot holds for a moment, then the camera starts slowly.
2. **Through the word.** The camera accelerates (field of view widens slightly), drifts to the "O" and passes through its counter.
   As it passes, every letter shatters: about 29,000 small triangles spin and fly outward and past the camera, then shrink away.
3. **Dive.** On through a dark space with drifting dust. A faint column of light blooms ahead, marking the gallery. The path
   curves right then left while diving toward the floor; the camera banks into each turn (peak roll 11 degrees on desktop, 7 on phones)
   and the horizon visibly tilts. It levels out, rises slightly, and settles in front of the first photograph.
4. **First build.** One large photograph on a dark floor (with a reflection), the build's name, the shop's own description, a
   counter ("01 / 03"), Previous and Next.
5. **Between builds.** The builds are exhibits on a ring. Next swings the camera round the ring, pulling back a little and banking
   into the turn; the old text steps back, and the new text rises in half way through. Previous reverses it. Rapid clicks never overlap:
   moves run one at a time and only the latest request waits its turn. Arrow keys and touch swipes work too.
6. **The way in.** After the last build, scroll on to the closing invitation and footer.

Skip intro (visible from the first frame) fast-forwards the same path in about a second, never cutting. Replay intro restarts it.
Changing builds never replays the intro.

## Sections removed (from the earlier Work page)

- "Craftsmanship, up close": the zoom lens and selectable engine details (`Craft`, `details.ts`).
- "The photographs": the gallery, including the Miata photograph in the garage, and the full-bleed band (`Gallery`).
- The old "Featured work" tab list with the six "photograph awaiting approval" entries (`Featured`), the fullscreen viewer (`Lightbox`),
  and the old arrival (`WorkArrival`), all replaced by the stage.
- Assets used only by these: the 800 px copy of `miata-engine-inspect` (`public/work/`) and its line in `blender/scripts/photo_variants.py`.
  The original `public/photos/miata-engine-inspect.webp` stays: the Workshop and Services pages use it.

## How it is built

- `src/sections/work/WorkStage.tsx`: state machine (loading, intro, gallery), navigation, keyboard, swipe, scroll lock during
  the intro. All text and controls are real HTML. The first photograph and the 3D code are loaded together, and the intro does not start
  until both are ready, the textures are on the GPU and the shaders are compiled (no hitch at the start).
- `cinema/letters.ts`: the letters are built in code from straight strokes and arcs and extruded (the installed three has no bundled font, and
  turning the site's own font into geometry would need a new dependency). One merged non-indexed mesh; each triangle carries its own
  centre and a random vector.
- `cinema/world.ts`: the scene and camera. The shatter is a vertex shader driven by one number (camera progress), so there is no per-frame
  simulation and the shot can be scrubbed or skipped. Floor and light column are small shaders. Exhibits are textured planes with a mirrored,
  faded reflection. The gallery orbit is a GSAP tween around the ring.
- `cinema/flight.ts`: one `CatmullRomCurve3` path. Everything (position, direction, roll, field of view, breaking) is a function of progress along it,
  so nothing can jump. Roll comes from how fast the heading turns, smoothed, and eased to zero at both ends.
- `cinema/CinemaCanvas.tsx`: React Three Fiber canvas with `frameloop="demand"`. `cinema/textures.ts`: loads the photographs.
- The photograph in the 3D scene is sized to the area the page reserves for it (`getTarget`), so the landing frame sits above the text at any window size.
- No new dependencies.

Fallbacks (same builds, text and controls, no 3D, no intro, no scroll lock): reduced motion, no WebGL2, save-data, `?tier=static`, a lost GL
context, textures or the 3D code failing to load, not ready within 12 s, or a median frame time over 55 ms in the first second of the flight.
Phones and touch devices get the lighter tier: fewer triangles (about 4,800), fewer dust points, 800 px photographs, pixel ratio cap 1.25
(1.5 on desktop), smaller roll and a slightly shorter shot.

## Assets and rights

The page now shows all nine entries of the shop's own Work list. Each uses the photograph the shop's own old page shows with it, served as a
plate-pixelated derivative from `src/images/registry.ts`. Every photograph is PENDING CLIENT APPROVAL. Full table: `docs/image-assignments.md`;
what each photograph is: `docs/image-inventory.md`.

## Measurements

Production build, local `vite preview`, headless Chromium on this development machine. These are not phone numbers; no real phone was used.

- **Frame time across the whole opening (about 12 s):** median 16.7 ms, 95th percentile 16.9 ms (60 fps), desktop and 390 px profile.
  The only frames over 33 ms (up to 267 ms desktop, 101 ms phone profile) happen while loading, before the canvas is visible (texture upload and shader
  compile). None during the flight or the orbit.
- **Renderer:** 4 draw calls and about 29,400 triangles while the word is on screen; 15 draw calls and 136 triangles in the gallery. Pixel ratio capped
  (1.5 desktop, 1.25 phones). Rendering is on demand: 1 render in 2 s when idle.
- **Ready:** first frame ready 0.92 to 0.93 s after navigation (desktop), 0.65 s (phone profile).
- **Transfer (decoded bytes, first load of `/work`):** about 2.3 MB desktop (1.5 MB JS, photographs 195 + 156 + 211 kB), about 2.0 MB phone profile
  (photographs 98 + 108 + 93 kB). The 3D code is a separate lazy chunk set: `CinemaCanvas` 21.8 kB (7.9 kB gzip), `three.core` 377 kB (101 kB gzip) and
  `react-three-fiber` 544 kB (146 kB gzip), the last two shared with the Workshop page. `WorkPage` is 12.0 kB (4.8 kB gzip) + 6.7 kB CSS (2.1 kB gzip).
  The main `index` chunk is unchanged at 615 kB (205 kB gzip). Visitors on the plain presentation (reduced motion, no WebGL) never download the 3D code.
- **Layout shift:** CLS 0.002 desktop, 0.006 phone profile. **LCP:** 388 to 420 ms desktop, 324 to 340 ms phone profile (local, unthrottled).
- No horizontal overflow at 390, 820, 1280 or 1440.

## Testing done (real Chromium, Playwright, production build unless noted)

Real-time playback at 1440x900, 1280x720, 820x1180 and 390x844 (touch): the word framed square at the start; the camera passes through the
"O"; the letters shatter (frames at progress 0.13, 0.16, 0.20 checked); forward flight then dive with visible banking (horizon tilt at 0.42 and 0.62);
level-out and landing with the first photograph framed above the text; Next, Previous, six rapid Next and six rapid Previous clicks (always settle on the
right build, camera phase monotonic, no overlapping moves); arrow keys; touch swipes both ways; Skip intro (about 1.3 s, ends in the same landing pose);
Replay intro; window resize in the gallery (photograph re-fits the reserved area); scroll lock released after the intro and on every failure path;
reduced motion (direct to build 1, no canvas, no scroll lock); WebGL disabled; a failing photograph (falls back). The same failure handler also covers the 3D chunk failing to load, but that exact case was not simulated. No page errors. Dev-only: a `window.__cinema` hook to freeze the shot at any progress (stripped from the production build).

## Limits

- Not tested on a real phone, Safari or Firefox. The 60 fps result is for this machine; a weak integrated GPU may drop frames, in which case the slow-device
  guard falls back to the plain presentation after the first second of the flight.
- The letters are a built geometric capital set, not the site's Archivo typeface.
- On a slow connection a first visit shows the dark stage and tagline with "Loading" while about 250 kB gzip of 3D code and the photographs arrive.
- The existing header nav links are 35 px tall on mobile (shared component, not changed). `index.html` still preloads a Homepage hero frame (existing warning).
- Rights for all ten photographs are unconfirmed (see `docs/image-assignments.md`); the page must not go to production until they are.
