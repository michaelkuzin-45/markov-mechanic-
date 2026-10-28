# Stage 6 — C8-inspired car, cinematic camera, streaks, floating cards

## Status

Done: car reshape (2 passes), showroom lighting, new camera path, canvas light
streaks, floating navigation cards with click transition, verified business
content, new desktop + mobile frame sets. See "Known issues" at the end.

## Car (Blender)

Working file: `blender/markov-c8-concept.blend` (the Stage 1–5 file
`blender/markov-concept-car.blend` is untouched).

Changes, all in the generator scripts so the car is reproducible:

- `build_body.py`: every section key point is a crease (`SHARP = (1..7)`), so the
  body is built from flat, angled planes instead of one soft curve; arrow-shaped
  plan view (`NOSE_TAPER`); deeper, longer side scoop; bigger rear haunch flare;
  auto-smooth 26°.
- `build_details.py`: swept headlights that wrap the fender corner, larger
  corner intakes and grille, big C8-style side intake, wide angular taillights,
  Z06-style **centre** quad exhaust (four hollow tubes with lip, inner wall and
  dark core in a black bezel), rear spoiler with raised end flicks, door
  mirrors, Z06 wheel sizes (275/30 R20 front, 345/25 R21 rear), separate roof
  panel and engine cover with seven louvres (replacing boolean recesses that
  distorted reflections).
- `materials.py`: paint lifted to dark graphite metallic under clear coat so
  the body's planes read in the dark room.
- `showroom.py`: two long rim lights along the flanks, gentle key specular,
  stronger red/blue accents, glossier floor/dais (less noise), ceiling strips
  raised to 6.6 m for the overhead shot, exposure 1.0.

Reference note: the production Corvette Z06 has its four round tips in the
**centre** of the rear fascia (the Stingray has pairs at the corners), per
GM Authority / Motor Authority coverage of the 2023 Z06. The model follows the
Z06. No reference photos were downloaded; proportions come from published
specs (184.6 in long, 79.7 in wide, 48.6 in tall, 107.2 in wheelbase).

## Camera (`camera_path.py`)

Front hero (car in the lower half, title above) → front-left three-quarter →
left side → rise to a high overhead view from the left (whole car in frame,
roof and louvred engine cover) → descent behind → low rear view of the
taillights and quad exhaust. Samples are arc-length spaced; frame i of N is
scroll progress i/(N-1) of the camera segment.

## Regenerating the frames

Full rebuild inside Blender (MCP or Scripting tab), in order:

```
build_body.py → build_details.py → materials.py → bake_body.py →
fix_paint_slot.py → showroom.py → camera_path.py
```

Then save and render headlessly (~32 min desktop + ~15 min mobile on the i5-7500):

```
"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b blender\markov-c8-concept.blend ^
    --python blender\scripts\render_web_sets.py -- desktop mobile
```

Frames land in `blender/renders/stage6/` (git-ignored); copy them to
`public/hero/desktop/` and `public/hero/mobile/`. Previews used during the
work are in `blender/previews/stage6/`.

## Website

- `src/sections/home/Hero.tsx`: scroll map — 0–0.84 camera move, 0.84–1 hold
  on the rear view while the cards float in. Three lower-third captions show
  the real services by scene. Rail fill is set by direct transform (no
  inherited CSS variable).
- `src/scene/streaks/StreakField.ts`: canvas light streaks. Position is a pure
  function of scroll, so reverse scrolling reverses them; trail length and
  brightness follow scroll speed; strongest over the roof; the centre (car) is
  kept clear. DPR capped at 1; nothing redrawn while still.
- `src/components/FloatingNavCards/`: reusable cards (Services, Past Work,
  Workshop, Contact). CSS float cycle per card, contact shadow, pointer tilt
  written directly to the element, glow ring + bloom by opacity, hover gated to
  fine pointers. Click: card flies at the viewer, streak tunnel, fade to black,
  route change after 720 ms. Reduced motion: still grid, plain links.
- Content: `src/config/services.ts`, `destinations.ts`, `site.ts` use only
  wording from markovautomotive.com. No address/phone/hours are published
  there, so none are shown. Destination pages are still "coming soon"
  placeholders.

## Test results (production build, headless Chrome, Intel HD 630)

| Profile | Avg FPS (scroll down+up 10 s) | p95 frame | Frames > 33 ms | Network idle | Transfer | Console errors |
|---|---|---|---|---|---|---|
| Desktop 1440×900 | 57.9 | 17.0 ms | 4 of 580 | 2.5 s | 4.64 MB | none |
| Mobile 390×844 @2x | 59.9 | 16.9 ms | 0 of 600 | 1.7 s | 2.21 MB | none |

The streak canvas renders at 60% resolution on wide screens (it was 48.6 FPS
at full resolution). Checked in Playwright: head-on opening frame, front
three-quarter, overhead, rear with quad exhaust, cards, hover tilt/glow,
click → light tunnel → route, reverse scroll, mobile layout, reduced motion.
Screenshots: `docs/stage6-screenshots/`.

Testing note: the visible Playwright MCP window is background-throttled
(rAF ~1 fps), and react-router's scroll restoration can race scripted
scrolling right after a reload. Measure in headless Chrome.

## Known issues

- Desktop frames are 4.6 MB total (Stage 5: 1.8 MB); they stream
  coarse-to-fine, so the move is scrubbable early.
- The car is a C8-inspired concept, not an exact Corvette: the side intake
  reads as two dark shapes, and the floor shows slight grain at 20 samples.
- Services / Work / Workshop / Contact are still "coming soon" placeholders.

## Stage 7 — Lamborghini Gallardo replaces the procedural car

- Source: `assets/car-models/Gallardo 2006 Yellow.zip` (Blend Swap #81248,
  **CC0 1.0**, Blender 2.75 / Cycles). Working file:
  `blender/markov-gallardo.blend` (`markov-c8-concept.blend` is untouched; the
  C8 is only excluded from the view layer there).
- Appended into collection `MKV_Gallardo` under `MKV_Gallardo_Root`
  (rotated 180° so the front faces +X, centred on the dais). True scale
  (4.28 m), no rescale.
- Trademark/third-party: Lamborghini bull, badges, letters and plate hidden;
  embedded photos of real dashboard screens replaced with dark materials.
- EEVEE fixes: Cycles holdout planes hidden / holdout slots → matte black;
  glass → `MKV_Glass_Clear`; emissive head/tail/turn-signal materials
  (`MKV_G_*`); yellow seats → red leather; paint → `MKV_Paint_Black` (deeper);
  subdivision capped at 1 (1.6M → 572k triangles).
- Camera: overhead point raised to (-0.7, 2.8, 6.05) and re-aimed so the whole
  car fits. Ceiling strips 7.0 → 4.5 to soften hood/roof reflections.
- The Gallardo has two exhaust tips (as the real car).
- Render: same driver, `-b blender\markov-gallardo.blend --python
  blender\scripts\render_web_sets.py -- desktop mobile`.
- Results (production build, headless Chrome, HD 630): desktop 58.8 FPS
  (p95 16.9 ms, 4.85 MB), mobile 58.7 FPS (p95 17.9 ms, 2.2 MB), no console
  errors. Forward/reverse scroll, head-on opening, overhead, rear, cards,
  hover and click navigation checked on desktop and mobile
  (`docs/stage7-screenshots/`). Render time on this PC: ~70 s/frame desktop,
  ~40 s/frame mobile (~2.5 h total).

## Stage 8 — dark luxury showroom

- `blender/scripts/showroom_v2.py` replaces the `MKV_Showroom` contents:
  32 × 24 m hall, 9 m ceiling, near-black walls with seams, large dark display
  panels with soft edge light, ceiling truss with 35 spot fixtures (fixtures do
  not cast shadows), six spot lights on the car, rectangular light frame above
  it, rim lights (no shadows), back-wall wash, matte dark tile floor at z = 0.
- Tried and removed: two-tier platform with LED ring (its edges rendered as a
  grainy band in EEVEE at these sample counts — `PLATFORM = False`), haze
  (accent lights became blotches). Fast GI is off.
- Working file: `blender/markov-gallardo-showroom.blend` (built from
  `markov-gallardo.blend` by `preview_path_views.py`, which also renders
  four path previews). Rollback point for the previous look: `d768847`.
- Frames: desktop 3.8 MB, mobile 1.3 MB. Headless Chrome on HD 630:
  desktop 55.2 FPS (p95 18.3 ms), mobile 57.0 FPS, no console errors.
  Screenshots: `docs/stage8-screenshots/`.
