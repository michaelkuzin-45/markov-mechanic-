# Stage 4 — Rendering approach comparison

Measured on the development PC: Intel i5-7500, Intel HD 630 (Chrome, ANGLE/D3D11,
confirmed via `WEBGL_debug_renderer_info`), 8 GB RAM. Viewport 1280×720.
Harness: headless Chrome driven by puppeteer-core, scrolling the page top→bottom→top
over 10 s, one scroll step per animation frame.

Prototypes live in `prototypes/` (dev-server only, not part of the production build):

- **A — live GLB** (`prototypes/live.html`): React Three Fiber, Draco GLB exported
  from Blender, `MeshReflectorMaterial` floor, Lightformer strips, accent spotlights,
  camera driven by `camera_path.json`.
- **B — frame sequence** (`prototypes/frames.html`): 24 Blender EEVEE frames
  (1280×720, WebP q80) scrubbed on a 2D canvas with neighbour cross-fade.

## Results

| Metric | A: live GLB | B: frame sequence |
|---|---|---|
| Average FPS while scrolling | **29.9** | **59.9** |
| Median / p95 frame time | 33.3 / 33.6 ms | 16.7 / 16.8 ms |
| Worst frame | 1218 ms (shader compile hitch) | 17.2 ms |
| Frames > 33 ms | 74 of 389 | 0 of 602 |
| Time to ready (dev server) | 2.55 s | 0.41 s |
| JS heap | 30.4 MB | 1.4 MB |
| Production payload (est.) | ~0.93 MB: three/R3F/drei chunk 264 KB gz + GLB 419 KB (Draco) + decoder ~250 KB | ~13–17 KB per frame: 96 desktop frames ≈ 1.6 MB, 72 mobile ≈ 1 MB; no 3D library |
| Visual quality | Approximate: procedural materials lost in glTF (carbon/skirts render pink, flake, tyre texture), no ray-traced reflections, glass/interior read poorly, harsh accent tinting | Full Blender EEVEE: ray-traced reflections, probes, bloom, AgX, all procedural materials |
| Camera freedom | Any path, mouse parallax possible | Fixed path (by design here) |
| Console errors | favicon 404 only | favicon 404 only |

Screenshots: `blender/previews/stage4/compare/A_live_*.png`, `B_frames_*.png`.
Raw metrics: `*_metrics.json` in the same folder.

## Decision: B — pre-rendered frame sequence

Chosen on the measurements: twice the frame rate with zero dropped frames on the
target-class GPU, ~6× faster to interactive, ~20× less memory, and clearly better
image quality. The frames are dark, so WebP compresses them to ~13–17 KB each,
which keeps the payload comparable to the live option while removing three.js from
the homepage entirely.

Trade-offs accepted:

- The camera path is fixed (the brief wants exactly one path anyway).
- Portrait phones need their own frame set (different framing / lens).
- With only 24 frames the cross-fade shows ghosting mid-scroll (frames ~77 cm of
  camera travel apart); production uses 96 desktop / 72 mobile frames (~19–26 cm).
- Changing the car or lighting means re-rendering (~13–17 s per 1600×900 frame,
  ~25 min for the desktop set on this PC).

## Render cost on this PC

| Set | Resolution | Samples | Time / frame | Size / frame |
|---|---|---|---|---|
| Path test | 480×270 | 8 | 2.5–3.4 s | — (PNG) |
| Comparison | 1280×720 | 16 | ~9.3 s | ~13 KB |
| Desktop production (96 frames) | 1600×900 | 16 | ~12–15 s | ~19 KB (1.84 MB total) |
| Mobile production (72 frames, 34 mm, horizontal fit) | 720×1280 | 16 | ~9 s | ~17 KB (1.24 MB total) |

Total render time for both production sets on this PC: ~35 minutes.

First frame of each Blender call adds a 20–60 s warm-up (shader compile / scene sync).
