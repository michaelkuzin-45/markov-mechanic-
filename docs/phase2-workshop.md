# Workshop page: what was built, how it was tested, what is left

Route `/workshop`. Checkpoints: `f0d53e1` (page, content, stills), `4dcbba4` (live 3D, tiers), and the commit that
adds this file. Phase 1 assets: `7f5485d`. The homepage and Services page are unchanged.

Screenshots of the states described here are in `docs/workshop-screenshots/`.

## What the visitor gets

1. **The car and the parts list (first screen).** Arrival and inspection share one viewport so the car is on screen
   at first paint and there is a single WebGL context. "Workshop, Springfield, Virginia", the statement that this is
   not a dealership, and four parts to look at: wheels and brakes, cabin, rear and exhaust, engine and turbo. Each
   shows the shop's own service wording. Wheels: steer the front wheels, closer look at the brake. Cabin: open or
   close the door. Engine: a real photograph of a turbocharged Miata, captioned as a different car; the Gallardo's
   engine cover stays closed and no engine bay is ever shown. Lights switch, reset view, drag to orbit, arrow keys.
2. **From our bench.** The Miata engine-bay photograph with callouts on what is visible, the shop's turbo wording,
   and two workshop photographs.
3. **Cars we work on.** The shop's five vehicle lines as large type. Only the Miata and modified-car lines carry a
   photograph (the only verified ones); Corvettes, custom builds and regular cars are set as type.
4. **Three simple steps and the way in.** The shop's three steps, then a clearly labelled temporary state: "Booking
   is not connected yet", with a visibly disabled button. `src/config/booking.ts` takes the real destination later.

"Body and paint" and "front and lights" were dropped as hotspots: the first has no service wording of its own on the
site, and the lights are a switch, not a place.

## Tiers

| Tier | Who | What |
| --- | --- | --- |
| Full | desktop with WebGL2 | LOD0 (194k triangles), pixel ratio up to 1.5, idle turntable for 14 s until touched |
| Lite | phones, touch screens, narrow windows | LOD1 (136k), pixel ratio up to 1.25, no turntable |
| Static | no WebGL2, reduced motion, save-data, `?flat`, lost GL context, or a device that cannot hold the frame rate | Seven pre-rendered views of the same car in the existing showroom, same parts list |

`?tier=full|lite|static` forces a tier. A visitor can always switch to stills, and back to 3D ("Use interactive
3D"; under reduced motion the camera then cuts instead of tweening).

Rendering is on demand (nothing is drawn while the car is still) and stops completely while the stage is off screen.

## Measured results

Intel HD 630 (the weakest GPU available), Chrome. GPU-synced loop (`render` then `gl.finish`), orbiting the car,
3 runs of 240 frames after a warm-up, in the real page.

| Real page | Canvas | Frame (mean) | p95 | Triangles | Draw calls |
| --- | --- | --- | --- | --- | --- |
| Full, DPR 1 | 1425x900 | 9.0 ms | 16.6 ms | 195,569 | 69 |
| Full, DPR 1.5 (the cap) | 2137x1350 | 15.8 ms | 31.8 ms | 195,569 | 69 |
| Lite at its 1.25 cap (desktop GPU, phone-sized canvas) | 487x364 | 3.2 ms | 6.2 ms | 137,570 | 69 |

The Lite numbers come from a desktop integrated GPU drawing a phone-sized canvas. **They say nothing about real
phone hardware, which has not been tested.**

- Page-level frame rate on a healthy tab while the turntable runs (22 s): 59.8 fps average, worst gap 34 ms.
- Reflections only on hero materials (paint, glass, rims, chrome, discs, calipers, lamps), A/B in the same page:
  about 9.4 ms versus 10.9 ms with the reflection map on every material. A saving of roughly 1.5 ms (14 %), close to the
  run-to-run noise of about 1.5 ms; kept because the plain-lit seats and dash look the same either way.
- Load, production build, localhost: first contentful paint 236 ms, layout shift 0, overview still 55 KB first,
  live 3D requested at 235 ms (idle) and ready at **1.49 s**. Before the model and Draco decoder were started in
  parallel with the reflection map, the decoder began at about 2.5 s; now at 365 ms.
- Slow 4G (1.6 Mbps, 150 ms RTT): first contentful paint 1.9 s, still on screen by 2.5 s, live 3D ready at 4.5 s.
  The page is never blank or waiting on the 3D payload.
- Code: the page itself is about 7 KB gzipped plus 3.7 KB CSS (5 KB before the live viewer was wired in). The live
  viewer adds 29.5 KB gzipped, on top of the shared three.js chunks that the Services page already loads. The 1 MB model and 188 KB Draco
  decoder download only when the stage is idle.
- Lighthouse (dev server): accessibility 96, best practices 100, SEO 92. The remaining failures are not in this page's
  code: the header logo label, the footer copyright contrast, and `robots.txt` / `llms.txt` (the dev server answers with
  the app shell).

## What was tested, and what happened

| Test | Result |
| --- | --- |
| All four hotspots, steering slider, brake close-up, door, lights, reset | Work. Engine never exposes an engine bay |
| Real mouse drag (CDP) | Orbits; elevation clamps |
| Keyboard: Tab, Enter, Escape, arrow keys on the canvas | Row expands and focus moves into its controls; Escape closes; arrows turn the car without scrolling the page |
| Static tier (`?tier=static`) | No canvas, no 3D download, one still on first paint; stills follow the hotspots; lights switch the overview |
| Real reduced-motion preference | Static tier, arrival fade skipped; opting in to 3D cuts the camera instantly |
| WebGL context loss (forced through the extension) | Falls back to stills with the right message; "Use interactive 3D" restores it, stable for 10 s |
| Slow device (injected 80 ms per frame; also a throttled tab at ~1.4 fps) | Pixel ratio steps down, then falls back to stills with "Switched to still images to keep the page smooth" |
| Healthy device | No change of pixel ratio and no fallback over 22 s of turntable (DPR 1). Through 12 camera moves at the 1.5 cap the HD 630 eased the pixel ratio to 1.25, still 3D, page at 57.7 fps |
| Mobile 390x844 (3x, touch), tablet 820x1180, laptop 1280x720, desktop 1440x900 | Layouts correct, no horizontal scroll; phone picture pins under the header while the list scrolls |

Problems found while testing and fixed: a title clipped by its column; a car that overlapped the text and a washed-out
silver paint; over-large "Cars we work on" thumbnails; marker labels clipped at the screen edge and markers sitting on the
text; the engine caption falling below the fold on laptop-height screens; contrast failures on captions and labels;
a retry that could not restart after an error; the frame monitor ignoring genuinely slow frames and, in the next
version, ratcheting quality down on a normal 30 fps-capped display. Each is covered by the re-test above.

## Not verified

- **Real phones.** No phone hardware was available. Mobile layout and the Lite tier were tested in emulation on a
  desktop GPU only. On a 3x screen the capped pixel ratio looks soft, which is the intended trade.
- Safari, Firefox, and low-end Android; screen readers (only the accessibility tree and Lighthouse were checked).
- Frame spacing is a proxy for GPU cost (GPU timer queries are not available everywhere), so the monitor's thresholds
  are deliberately lenient: a locked 30 fps counts as fine.

## Known limits and things outside this work

- The Static tier cannot steer the wheels or close the door (the stills have one pose each). The overview has a lights-off
  still; other views do not.
- LOD1 loses tire tread in the wheel close-up (Phase 1 note). Rims read as silver, not the source's matte white.
- Stills were rendered from the exported model in the existing showroom. After any change to the model or
  `src/workshop/views.json`, re-render:
  `blender -b blender/markov-gallardo-showroom.blend --python blender/scripts/render_workshop_stills.py -- --glb public/models/gallardo/gallardo-lod0.glb --views src/workshop/views.json --out public/workshop/stills`
- `THREE.Clock is deprecated` is logged by react-three-fiber itself.
- `index.html` preloads the homepage's first hero frame on every route, so it is fetched and unused here (and on Services).
- The header's "Schedule Service" button still goes to the unfinished `/contact` page.
- The Services page still serves the unblurred Miata photographs (licence plate legible) and photographs with unverified
  ownership. Left untouched on purpose; it needs its own follow-up.

## What Dima must approve or supply

See `docs/workshop-copy-approval.md`: the new wording (including "independent" and the Lamborghini line), ownership and
commercial rights for the four Miata photographs, and how customers should reach the shop (a phone, email or booking
link for `src/config/booking.ts`).
