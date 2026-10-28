# Site-wide image assignments

Every photograph the site serves is a derivative (plates pixelated, WebP, 3 to 4 widths) made from the untouched originals in
`assets/reference-images/originals/` by `blender/scripts/site_images.py` and described by `assets/reference-images/derivatives.json`.
Code reaches them only through `src/images/registry.ts`. What each photograph is: `docs/image-inventory.md`.

**Rights: all 10 served photographs are PENDING CLIENT APPROVAL. Do not deploy to production until Dima has confirmed each one.**

## Photograph IDs (registry)

| Registry ID | Derivative | Original | Subject |
| --- | --- | --- | --- |
| `hoodUp` | `miata-hood-up` | `work-02` (same photograph as `index-02`) | Blue Miata, hood up, turbo engine; plate pixelated |
| `garageBay` | `miata-garage-bay` | `index-03` | Blue Miata in the bay with shelving, jack, bicycle; plate pixelated |
| `turboEngine` | `miata-turbo-engine` | `services-02` | Turbocharged Miata engine bay |
| `engineWide` | `miata-engine-wide` | `services-02`, window y=140, height 794 | 16:9 crop of the engine bay (the inspection points and bench callouts are positioned on it) |
| `miataRed` | `miata-red-popup` | `work-05` | Red first-generation Miata, pop-up lights raised |
| `audi` | `audi-a5-night` | `work-06` (same photograph as `contact-01`) | White Audi A5 coupe at a fuel station at night |
| `mercedes` | `mercedes-e-class` | `work-07` | Dark blue Mercedes-Benz sedan |
| `corvetteC8` | `corvette-c8` | `index-04` | Red C8 Corvette |
| `porsche` | `porsche-cayman` | `contact-03` | Red Porsche Cayman S by the coast; German plate pixelated |
| `corvetteClassic` | `corvette-classic` | `work-10` | Red and white classic Corvette in a museum-style hall |

## Old to new, by page

### Homepage `/`
No photographic placements: the page is the animated Gallardo/Corvette hero (frames in `public/hero`) plus type. Nothing changed, and no
photograph was added. The BMW photograph (`index-01`, the old home-page hero) was not used: it matches no entry on the shop's lists
and the page has no slot for it.

### Services `/services` (sections and the 3D journey)

| Placement | Was | Now | Why |
| --- | --- | --- | --- |
| Story 1, "Built for enthusiast cars" | Red Miata | Red Miata (kept) | Already the strongest match: a 1990s Miata |
| Story 2, "1990s Miatas. Classic Corvettes." | Classic Corvette | kept | Names the car |
| Story 3, "And everyday cars too." | Mercedes | kept | A regular car |
| Panel Maintenance | Garage Miata, **plate legible** | `garageBay`, plate pixelated | Same photograph; privacy fix |
| Panel Diagnostics | Turbo engine close-up | `hoodUp` | The whole engine bay, the same picture the Diagnostics viewer marks up (overheating, boost leak, misfire) |
| Panel Brakes + Suspension | Audi | `corvetteClassic`, cropped on the whitewall wheel | The shop's own caption for that car mentions brake maintenance |
| Panel Turbo Systems | Hood-up Miata, **plate legible** | `turboEngine` | The turbo, intake and silicone piping this service describes |
| Panel Performance Installs | C8 Corvette | `audi` | The shop's own caption for that car: turbo and engine-performance upgrades |
| Inspection lens | Engine crop (made earlier) | `engineWide`, regenerated from the original at the same window | Hotspot coordinates unchanged |
| Closing "Tell us what your car needs" | Porsche, **plate legible** | `porsche`, plate pixelated | Privacy fix |
| Diagnostics viewer | Hood-up Miata, **plate legible** | `hoodUp`, plate pixelated | Privacy fix; hotspots checked on the new image |
| Journey: opening plane, load poster, flat fallback | Hood-up Miata, **plate legible** | `hoodUp` | Privacy fix |
| Journey: turbo room | Turbo engine | kept | Matches |
| Journey: showroom | C8 | kept | Matches |
| Journey: vault (two crops) | Audi, Mercedes | kept | Matches (wheel and brake close-ups) |
| Journey: gallery plane | Porsche, **plate legible** | `porsche`, plate pixelated | Privacy fix |
| Journey: editorial layer | Porsche, Red Miata, Classic Corvette, Mercedes, garage Miata (**plate legible**) | same five from the registry | Privacy fix; responsive widths |

### Workshop `/workshop`
The 3D Gallardo, hotspots, doors, wheels, camera and tiers are untouched.

| Placement | Was | Now | Why |
| --- | --- | --- | --- |
| Bench: main engine photo with callouts | Engine crop | `engineWide` | Same crop, from the original |
| Bench: hood-up | Blurred copy (made earlier) | `hoodUp` | Same photograph, regenerated from the original |
| Bench: the bay | Blurred copy | `garageBay` | Same |
| Stage: engine panel | Engine crop | `engineWide` | Same |
| Cars: "1990s Miatas" | Garage Miata | kept | A Miata in the workshop |
| Cars: "Classic Corvettes" | no photograph | `corvetteClassic` | The shop has a photograph of exactly this |
| Cars: "Modified cars" | Turbo engine | kept | Matches the existing caption |
| Cars: "Custom & DIY builds" | no photograph | none | No honest match; left as type |
| Cars: "Regular cars" | no photograph | `mercedes` | The shop's own caption: an older Mercedes receiving regular service |

### Work `/work`
| | Was | Now |
| --- | --- | --- |
| Builds | 3 (Miata only), pairing assumed | **All 9** entries of the shop's own list, each with the photograph the shop's own page shows with it: Turbo Mazda Miata `hoodUp`; 1995 Mazda Miata Turbo Build `turboEngine`; Mazda Miata Service `garageBay`; Red Mazda Miata `miataRed`; Audi A5 Coupe `audi`; Mercedes-Benz `mercedes`; Chevrolet C8 Corvette `corvetteC8`; Porsche Cayman S `porsche`; Classic Corvette `corvetteClassic` |

The cinematic flight, shatter, dive, landing, circular navigation, Next/Previous, Skip and Replay are unchanged; the ring now holds nine
exhibits (32 degrees apart). Only the first photograph gates the opening; the other eight load while the camera is in the dark.
The removed gallery, lens and standalone-photo sections were not restored.

### Contact `/contact`
Still a placeholder with no image placements, so it was not touched or built.

## Retained, excluded, removed

- **Retained because already the best match:** Red Miata (story 1), Classic Corvette (story 2), Mercedes (story 3), turbo room, showroom C8, vault Audi and
  Mercedes, Workshop 1990s Miatas and Modified cars, closing Porsche.
- **Excluded:** `index-01` (BMW coupe in a car park): matches no entry and has no slot. `index-02` and `contact-01`: the same photographs as `work-02` and `work-06`
  in a smaller encoding, so they are not separate images.
- **Removed from the site:** all of `public/photos/` (older re-encodes, including the unblurred copies with legible plates), `public/work/`, and the scripts that made them.
  The originals remain in `assets/reference-images/originals/`.

## Needs Dima's approval

All ten served photographs. Observations that make confirming them more important (appearance only, not evidence of anything):
the red Miata, the C8 Corvette, the Porsche Cayman S (manufacturer-style, German plate) and the classic Corvette (museum-style hall) look like
press, show or museum photographs rather than shop photographs; the Audi, Mercedes and the Miata photographs look like owner or shop snapshots.
Please also confirm the pairing of photographs to Work entries is the shop's (it is taken from the shop's own old page).
Licence plates are pixelated in every served derivative (three photographs have a plate: the two garage Miata photographs and the Porsche).
