# Workshop, phase 1: Gallardo assets and technical foundation

Everything here is reproducible from the repo. The source model is never modified.

## What was produced

| File | What |
| --- | --- |
| `public/models/gallardo/gallardo-lod0.glb` | Desktop LOD, Draco, 1.05 MB |
| `public/models/gallardo/gallardo-lod1.glb` | Mobile LOD, Draco, 0.72 MB |
| `public/models/gallardo/gallardo.meta.json` | Node names, pivots, axes, anchors, per-class triangle counts, licence |
| `public/photos/miata-hood-open-blur.webp`, `miata-workshop-blur.webp` | Plate-blurred copies (originals untouched) |
| `blender/scripts/export_gallardo.py` | The export pipeline |
| `blender/scripts/render_gallardo_compare.py` | Same cameras/lights for the original and the GLBs |
| `blender/scripts/blur_plates.py` | Plate blur |
| `prototypes/gallardo.html` / `.ts` | Dev-only browser check (not in the build) |
| `blender/previews/phase1/` | Comparison renders (`orig_*`, `lod0_*`, `lod1_*`, `sheet_*` = original / LOD0 / LOD1) and browser screenshots (`three_*`) |

```
blender -b blender/markov-gallardo.blend --python blender/scripts/export_gallardo.py -- --out public/models/gallardo
blender -b --python blender/scripts/blur_plates.py
# check: npx vite --port 5174, then /prototypes/gallardo.html?lod=0|1&view=front34&door=55
```

`--lods 2` (with `--out` elsewhere) writes an unreduced reference with the same pipeline and materials; it was
used only as the measurement baseline and is not shipped.

## Size

| | Triangles | File |
| --- | --- | --- |
| Source collection `MKV_Gallardo`, visible parts (the whole `.blend` is 9.2 MB) | 566,934 | 1.81 MB (unreduced Draco GLB, same pipeline) |
| LOD0, desktop | 193,954 (-66 %) | 1.05 MB |
| LOD1, mobile | 135,989 (-76 %) | 0.72 MB |

Where the source triangles were: tires 264k (47 %), interior 89k, brake discs 70k, rims 55k, body 55k,
exhaust 17k, door 9k, glass 2k, calipers 6k. The exterior body, door, glass and calipers are kept at full
detail in LOD0.

## Interaction contract (what is real)

Frame: +Y up, +X front, left side is -Z, ground at Y = 0, origin at the middle of the wheelbase. Pivots and axes are
in `gallardo.meta.json`; nodes are named so they can be driven directly.

| Component | Nodes | Motion | Verified |
| --- | --- | --- | --- |
| Doors (both) | `Door_L`, `Door_R` | Rotate about Y; hinge at the front edge of the shell; opens outward. Mirror, handle, door glass and door card move with it. | Swept 0 to 70 degrees on both LODs: no door vertex enters the front tire (clearance 9.7 to 10.6 cm LOD0, 7 to 10.5 cm LOD1); a top-down view at 70 degrees shows both doors clear of the fenders. |
| Wheels (4) | `Spin_FL/FR/RL/RR` (rim, tire, disc) | Roll: rotate about Z (negative angle = forward) | Concentric with the hub (0.00 cm); spinning moves nothing beyond a 0.3 cm bounding-box artifact. |
| Front steering | `Corner_FL`, `Corner_FR` | Rotate about Y (positive = left); calipers steer, discs spin | Front corners reach 25 degrees, rear corners stay at 0. |
| Brake discs, calipers | `Disc_*`, `Caliper_*` | Camera targets; discs spin with the wheel | Visible through the spokes at close range. |
| Lamps | Materials `LampLED`, `LampAmber`, `LampTail` | Emissive on/off | Toggled in the browser, intensity restored correctly. |
| Steering wheel | `SteeringWheel` | Rotate about `steeringWheel.axis` (column rake 24 degrees) | Visual test at 0, 60 and 120 degrees through the open door: the ring stays put while the spoke blades turn in its plane. |
| Paint | Material `Paint` | Colour / clearcoat tweak | Standard material property. |

Not interactive, on purpose: **hood and engine cover** (the source has only flat filler panels under them, so
opening would show an empty void), mirrors on their own, wipers, the rear window. There is no engine, turbo, brake
pad/hub/line or suspension geometry in the source and none was added.

### Corrections made to the source (all reported, none invented)

- Front axle was lopsided: rims and discs sat 2 to 5 cm off their tires, in opposite directions on each side
  (left rim 4.3 cm, right 5.2 cm). A spinning wheel would wobble. Rim, tire and disc are now centred on the
  wheel-arch centre (the rear axle already matched to 0.6 cm). Amounts are in `corners.*.recentredCm`.
- Door, handle, mirror and door card are single meshes covering both sides. They are split by connected piece;
  the door card is cut at the hinge line because it extended 19 cm ahead of it, and the front sliver of side
  glass stays on the body.

## Final verification (exported models, browser)

Run on both LODs from a clean load, doors closed, precise bounding boxes (`prototypes/gallardo.html`).

| Check | LOD0 | LOD1 |
| --- | --- | --- |
| Nodes in the contract present (Body, Interior, RearGrille, SteeringWheel, 2 doors, 4 x corner/spin/rim/tire/disc/caliper) | all | all |
| Rim, tire, disc concentric with hub | 0.00 cm | 0.00 to 0.01 cm |
| Drift of those parts after spinning 137 degrees | at most 0.3 cm (bounding-box artifact) | at most 0.3 cm |
| Tire diameter / lowest point | 0.651 m / Y = 0.000 | 0.650 m / Y = 0.001 |
| Steer 25 degrees: front / rear corners | 25 / 0 | 25 / 0 |
| Doors vs front tire, 0 to 70 degrees | no penetration | no penetration |
| Lamps off / on | 0 / 2, 2, 3 | 0 / 2, 2, 3 |

Camera anchors (`meta.anchors`): every anchor is inside the car box. Lamps, tailpipes, door handles, gauges, wing and
roof lie within 0.1 to 2.5 cm of a surface. Dashboard (4.7 cm), seats (7.6 cm) and hood (8.2 cm) are volume centres,
so aim at them rather than on them. A marker overlay (hubs, hinges, steering pivot, anchors) sat on the intended
parts from front and rear views.

## Materials

The source uses procedural nodes that glTF cannot carry. 28 clean PBR materials replace them (`MATS` in the
script): values taken from the source where they are plain inputs (paint, lamps, red leather, matte, screen),
hand-matched where procedural (rim, discs, dash, seats). Glass is alpha-blended. The rear hex grilles use a
generated hexagon texture (2048 px LOD0, 1024 px LOD1, 14 to 80 KB): the source image has no documented origin.
No other textures ship. The source's gauge, radio and leather photographs are not exported.

Known look difference: the source rims are matte off-white; the export reads as satin silver metal, so they pick
up the environment strongly.

## Measurements

Intel HD 630 (ANGLE/D3D11), Chrome, 1280x720, DPR 1, GPU-synced loop (`render` + `gl.finish`, 240 frames
orbiting the car, 2 runs per model, run twice in opposite order). Localhost, so load time is decode plus parse only.

| Model | Triangles | Draw calls | Frame (mean) | p95 | Load |
| --- | --- | --- | --- | --- | --- |
| Reference (unreduced) | 568,640 | 68 | 15.0 ms | 25 to 33 ms | 0.2 s |
| LOD0 | 195,629 | 68 | 13.75 ms | 29 to 30 ms | 0.1 to 0.3 s |
| LOD1 | 137,630 | 68 | 12.55 ms | 24 to 26 ms | 0.14 s |

Run-to-run spread is about +-1.5 ms, so LOD0 vs the reference is barely outside noise; LOD1 vs the reference is
consistent across both passes (about 16 %). **Triangles are not the bottleneck on this GPU.** Diagnostics on LOD0:

| Change | Frame |
| --- | --- |
| Baseline | 11 to 13 ms |
| Lambert materials instead of PBR | 3.4 ms |
| No environment map | 4.9 ms |
| Quarter of the pixels (DPR 0.5) | 5.4 ms |
| Hide interior, hide glass, or Physical to Standard | no measurable change |
| DPR 2 (2560x1440) | 31 ms (LOD1: 29 ms) |
| LOD1, phone-shaped 390x844 canvas at DPR 2 / 1.5 | 13.6 ms / 7.8 ms |

So the real levers are pixel ratio and environment-map shading, not more decimation. The phone-shaped numbers
come from a desktop iGPU; no real phone was available, so mobile performance is **not** verified.

## Photographs

Usable for mechanical sections (Miata with turbo conversion): `miata-engine-inspect`, `miata-turbo-engine`,
`miata-hood-open-blur`, `miata-workshop-blur`. Plates are mosaic-blurred in the `-blur` copies. A small
windshield sticker remains in the hood-open photo. They were taken from the client's previous site and are
**provisionally usable only**: Dima must still confirm ownership and commercial usage rights. No further
unverified photographs are to be added. Not used: `miata-red`, `corvette-*` (look like stock images), and the exterior
shots (`mercedes`, `audi`, `porsche`) unless wanted for a "regular cars" strip.

## Licence

Source: Blend Swap #81248 "Gallardo 2006 Yellow", **CC0 1.0**; the licence states there are no requirements.
Voluntary credit: Pranavjit (hood and steering-wheel logo) and CGAlpha (leather texture), neither exported.
"Lamborghini" and the bull are trademarks: do not imply affiliation, and the export contains no logos. The blend
in this repo is a Markov-modified derivative (black paint, showroom, details).

## Limitations

- LOD1 tires lose tread and show a faceted silhouette at wheel close-up; use LOD0 (or LOD0 wheels) for close-ups.
- Brake detail is discs and calipers only (the source has no pads, hubs or lines).
- Gauge and screen faces are plain dark glass (source textures not exported).
- Glass is alpha-blended; sorting is acceptable for this car but should be watched in Phase 2.
- The dev page uses a procedural room environment; the site's own lightformer environment will cost differently.
