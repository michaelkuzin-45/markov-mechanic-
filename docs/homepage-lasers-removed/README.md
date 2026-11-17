# Original homepage with the lasers removed

Branch `fix/original-hero-no-lasers` (local only, cut from `main`; nothing pushed, merged or deployed). The experiment branch `experiment/homepage-intro` (new hero concept) is kept untouched and is not used here.

## What changed (and only this)
- `src/sections/home/Hero.tsx`: removed the light-streak canvas (`StreakField` instance, its draw call, resize call, scroll-velocity maths and the `<canvas>`). The frame player, scroll smoothing, the three scroll captions, rail, scroll cue, intro animation and navigation cards are unchanged.
- `src/components/FloatingNavCards/FloatingNavCards.tsx`: removed the streak "tunnel" burst that played when a card was clicked. The card fly-out, dark fade and navigation still happen.
- `public/hero-clean/` + `src/scene/sequence/frameSets.ts` + `index.html`: the rendered frames contain a thin white horizontal bar baked into the image (an emissive display-panel edge in the Blender scene, visible behind the car in the first two thirds of the move). `scripts/remove-baked-lines.mjs` paints it out into a copy of every frame (96 desktop, 72 phone); the app now reads the copies. `public/hero/` is untouched: point the two URLs in `frameSets.ts` (and the two preload links in `index.html`) back to `/hero/` to restore them.
- Not touched: headline (the red-to-purple gradient on AUTOMOTIVE), typography, car, camera path, captions text, nav cards, other pages. `src/scene/streaks/StreakField.ts` is still in the repo because the Services page arrival (`sections/services/Arrival.tsx`) uses it; it is not part of the homepage.

## About the "callouts with lines"
In this repository's history (including commit `ed593d4`, the first scroll-driven hero) the homepage has never had labels with lines pointing at car parts. It has three scroll captions (01 Maintenance + Diagnostics, 02 Turbo Systems + Performance, 03 Brakes + Suspension: a small number, a title and a line of text, with a thin red rule) that appear in turn at the bottom left and right as the camera moves; those are all kept exactly. Dot-and-label callouts do exist elsewhere: on the Workshop page (hotspot markers on the live 3D car and annotated engine-bay photographs). If the comparison video shows something different on the homepage, please send the video file: I could not find it on this machine and did not guess.

## Tested (production build, Chrome, software rendering)
Only the frame canvas remains; the AUTOMOTIVE gradient is intact; captions 01, 02, 03 appear at the same scroll positions as before and reverse correctly; the navigation cards appear at the end and a click still navigates; phone: one canvas, caption shows, no horizontal scroll; reduced motion: static hero and cards; `/services`, `/workshop`, `/work`, `/contact` load; no console errors or failed requests. Matching-position screenshots: `before/` (original) and `after/`, with `compare_desktop.png` and `compare_mobile.png` (left = original, right = lasers removed).
Not tested: a real phone and real-GPU frame rate.
