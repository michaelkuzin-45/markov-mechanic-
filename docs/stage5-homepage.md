# Stage 5 — Homepage integration

## What changed

- **Hero** (`src/sections/home/Hero.tsx`) is now a scroll-pinned section (420svh
  desktop / 340svh mobile) whose sticky frame plays the pre-rendered Blender camera
  move. Scroll progress → eased progress → frame; fully reversible.
- **Frame player** (`src/scene/sequence/`): streams frames coarse-to-fine (every
  8th, 4th, 2nd, then all) so the whole path is scrubbable early; draws the nearest
  loaded frame; cross-fades neighbours while moving and settles onto an exact frame
  when the scroll rests (no doubled highlights on still views).
- **Frame sets** (`public/hero/`): desktop 96 × 1600×900 (1.84 MB), portrait
  72 × 720×1280 (1.24 MB), WebP. Portrait set is used when width/height < 0.8.
  The first frame of each set is preloaded from `index.html` per orientation.
- **Overlays**: MARKOV AUTOMOTIVE intro (fades out as the move begins), three
  service navigation cards revealed at successive camera angles, closing
  "Every detail. Every drive." call to action, progress rail, occasional
  red/blue/violet/spectrum light streaks (`LightStreaks.tsx`, pure CSS).
- **Fallbacks**: reduced-motion → static poster hero + service cards as a normal
  grid, no scroll-scrub, no streaks, no GSAP reveals (`MotionConfig
  reducedMotion="user"` site-wide). Data-saver / `deviceMemory < 4` → half the
  frames, no cross-fade.
- **IntroSection** pillars now describe the workshop's values (the services live
  in the hero cards).
- three.js / React Three Fiber are no longer loaded on the homepage. The old R3F
  hero scene (`src/scene/HeroCanvas.tsx` etc.) is kept in the repo, unused, for
  reference.

## Test results (production build, `vite preview`, headless Chrome on the Intel HD 630)

| Profile | First frame | Network idle | Transfer | Avg FPS (scroll down+up 10 s) | p95 | Frames > 33 ms | Console errors |
|---|---|---|---|---|---|---|---|
| Desktop 1440×900 | 0.69 s | 2.2 s | 2.06 MB | 56.6 | 18.4 ms | 1 of ~560 | none |
| Mobile 390×844 @2x | 0.33 s | 1.5 s | 1.46 MB | 56.6 | 18.4 ms | 0 | none |
| Reduced motion | — | 1.1 s | 0.21 MB | static | — | — | none |

- JS: one 195 KB (gzip) bundle; CSS 4.4 KB gzip. JS heap ~3.5 MB.
- `tsc -b`: pass. `npm run build`: pass.
- Reversibility: `*_p030.png` (reached scrolling down) and `*_p030_reverse.png`
  (reached scrolling up) are the same frame.
- Screenshots: `docs/stage5-screenshots/`. Raw numbers: `site_test_report.json`.

Note: this PC has Windows *Animation effects* turned off, so browsers here report
`prefers-reduced-motion: reduce` and show the static fallback. The tests emulate
both preferences explicitly. To see the scroll experience on this PC, enable
Settings → Accessibility → Visual effects → Animation effects.
