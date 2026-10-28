# Original photographs from the reference site

Generated facts (page, dimensions, bytes, format, alt text, hash) come from `scripts/extract-reference-images.mjs` and are stored in
`assets/reference-images/inventory.json`. The originals are extracted byte for byte (never re-encoded) into
`assets/reference-images/originals/` and are not served by the site. The "Depicts" column is what can be seen in the image
(plus the shop's own alt text and captions); make and model are only given where the source or a visible badge states them.

**Rights: every photograph below is PENDING CLIENT APPROVAL.** Appearing on the old website does not prove that the shop owns the
photograph or may use it commercially. Where the picture looks like a press, show or museum photograph rather than one taken at the
shop, that is noted as an observation only. It is not evidence either way, and it raises the importance of asking Dima.

## Counts

- 5 reference HTML files: `index (19)`, `services (5)`, `workshop (2)`, `work (2)`, `contact (14)`. (`work (2)(1).html` was not in the
  project; `work (2).html` is byte-identical to the Downloads copy, so nothing is missing.)
- 21 embedded raster images (all WebP) + 5 embedded SVGs (logo/icons, not photographs).
- **12 unique files, 10 distinct photographs plus the BMW = 11 photographs.** Some appear on several pages, and two photographs are each embedded twice
  with different encodings (the hood-up Miata on `index` and `work`; the Audi on `contact` and `work`). 10 of the 11 are served (see `docs/image-assignments.md`).

## Inventory

| ID | Seen on | Pixels | Size | Depicts | Source alt text / caption | Plate or private info | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `index-01` | index | 1179x1453 (portrait) | 214 kB | Dark red coupe with a BMW badge and kidney grille, in a lit underground car park; a second car far behind. Model not stated. | "A deep red sports coupe parked in a softly lit garage" (original home-page hero) | None visible | Not tied to any entry on the shop's Work list |
| `index-02` | index, services | 1448x1086 | 154 kB | Blue Mazda Miata, nose in to a garage, hood up, turbocharged engine, shelving and tires | "Blue Mazda Miata with the hood open in the workshop, turbo engine exposed" | **Plate legible** | Same scene as `work-02` (different encoding) |
| `work-02` | work, workshop | 1448x1086 | 167 kB | The same hood-up Miata photograph | "Blue turbo Mazda Miata with the hood open in the workshop"; caption "Turbo Mazda Miata" | **Plate legible** | Larger encoding of the pair, preferred |
| `index-03` | index, work, workshop | 1500x834 | 175 kB | Blue Mazda Miata parked in a narrow garage bay, wire shelving above, floor jack and bicycle | "Blue Mazda Miata parked inside the Markov Auto workshop"; caption "Mazda Miata Service" | **Plate legible** | White strips at the left and right edges are in the photograph |
| `services-02` | services, work | 1411x1115 | 159 kB | Engine bay of a turbocharged Mazda Miata: copper valve cover, blue silicone hoses, turbocharger with conical filter, aluminium radiator | "Turbocharged Mazda Miata engine bay with a copper valve cover and blue silicone hoses"; caption "1995 Mazda Miata Turbo Build" | None visible | The strongest engine and performance photograph |
| `work-05` | work | 1399x898 | 77 kB | Red first-generation Mazda Miata, pop-up headlights raised, on a paved rooftop-style plaza | "Red first-generation Mazda Miata with pop-up headlights raised"; caption "Red Mazda Miata" | None visible | Looks like a professionally shot press-style photograph |
| `work-06` | work | 1448x1086 | 126 kB | White Audi A5 coupe at night at a fuel station | "White Audi A5 coupe at night"; caption "Audi A5 Coupe" | None visible (fuel-station signs and logos in the background) | Same scene as `contact-01` |
| `contact-01` | contact | 1448x1086 | 117 kB | The same Audi A5 photograph | "White Audi A5 at night" | None visible | Smaller encoding of the pair; used on the old Contact page |
| `work-07` | work | 1448x1086 | 315 kB | Dark blue Mercedes-Benz sedan parked at a brick apartment building | "Dark blue Mercedes-Benz E-Class sedan"; caption "Mercedes-Benz" | None visible | Large file for its size |
| `index-04` | index, work | 1150x599 | 56 kB | Red mid-engine Chevrolet C8 Corvette on a showroom or exhibition floor | "Red mid-engine Chevrolet C8 Corvette"; caption "Chevrolet C8 Corvette" | None visible | Looks like a show or museum display photograph; low resolution |
| `contact-03` | contact, work | 1500x843 | 65 kB | Red Porsche Cayman S at a coastline, cliffs behind | "Red Porsche Cayman S by the coast"; caption "Porsche Cayman S" | **German plate legible** | Looks like a manufacturer-style press photograph |
| `work-10` | work | 1150x766 | 57 kB | Red and white classic Chevrolet Corvette convertible in a museum-style hall with other vintage cars | "Red and white classic Chevrolet Corvette convertible"; caption "Classic Corvette" | None visible | Looks like a museum or collection photograph; other cars in the background |

Earlier versions of the site also had `miata-engine-inspect.webp` (1411x794), which is a crop of `services-02` (matched by pixel comparison:
window y=140, height 794). It is now regenerated from the original with the same window. The older `public/photos` files were re-encodes of these
originals (pixel difference at encoding-noise level) and have been removed.

## Shop's own pairing of photographs to Work entries

Taken from the reference `work (2).html`, not guessed:

| Work entry (shop's caption) | Photograph |
| --- | --- |
| Turbo Mazda Miata | `work-02` |
| 1995 Mazda Miata Turbo Build | `services-02` |
| Mazda Miata Service | `index-03` |
| Red Mazda Miata | `work-05` |
| Audi A5 Coupe | `work-06` |
| Mercedes-Benz | `work-07` |
| Chevrolet C8 Corvette | `index-04` |
| Porsche Cayman S | `contact-03` |
| Classic Corvette | `work-10` |

This settles the earlier open question about which photograph belongs to which entry (the pairing is the shop's, from its own page).
It does not settle who took the photographs.
