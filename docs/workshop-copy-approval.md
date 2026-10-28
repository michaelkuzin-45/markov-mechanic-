# Workshop page: what Dima needs to approve

Source of truth in code: `src/workshop/content.ts` (`fromSite` = the shop's own published wording, `pending` = new).
Nothing below is live-approved until Dima says so.

## 1. Wording taken as written from markovautomotive.com (no approval needed, please check it is still true)

- Heading and place: "Workshop", "Springfield, Virginia".
- The two intro paragraphs ("Our workshop is located in Springfield, Virginia. We mainly specialize in servicing
  enthusiast cars, including 1990s Miatas, classic Corvettes, modified cars, and custom or DIY builds." and "We also
  service and maintain regular cars. If your car needs maintenance or repair, we are more than happy to help.").
- The five vehicle lines: 1990s Miatas, Classic Corvettes, Modified cars, Custom & DIY builds, Regular cars.
- The three steps and their sentences: Reach out, Bring the car, Mechanical work done.
- "Bring your car to our workshop" and "Tell us what car you have and what it needs."
- Service descriptions used on the hotspots, verbatim from the Services page: Brakes + Suspension, Diagnostics,
  Performance Installs, Turbo Systems.

Only the capitalisation of headings was changed to sentence case ("Three Simple Steps." became "Three simple steps").

## 2. New copy written for this page (please approve or rewrite)

| Where | Text |
| --- | --- |
| Opening statement | "An independent repair and performance workshop. This is not a dealership, and nothing on this page is for sale." |
| Model note under the parts list | "Reference model, not an inventory vehicle. Markov Automotive is not affiliated with Lamborghini." |
| Stage hint | "Drag to turn the car. Pick a part to see how we work on it." |
| Parts list heading | "Look the car over" |
| Part names | "Wheels and brakes", "Cabin", "Rear and exhaust", "Engine and turbo" |
| Tool labels | "Steer the front wheels", "Closer look at the brake", "Back to the wheel", "Open the door", "Close the door", "Lights", "Reset view", "Use still images", "Use interactive 3D" |
| Engine panel | "This model has no engine bay on show, so here is the real thing: a turbocharged Mazda Miata in our workshop. A different car from the one you were just looking at." |
| Fallback messages | "Switched to still images to keep the page smooth." / "The 3D view stopped, so still images are showing." |
| Bench section | Heading "From our bench"; "Photographs from the workshop, not renders. A turbocharged Mazda Miata, shown in detail."; caption "A Mazda Miata in our workshop, not the model above."; "The same Miata with the hood up, in the bay."; "The bay." |
| Photo callouts (describe only what is visible) | "Aluminium radiator", "Copper-finish valve cover", "Blue silicone hoses", "Turbocharger and intake filter" |
| Cars section | Heading "Cars we work on"; group labels "Enthusiast cars" and "Everyday cars"; captions "A 1990s Mazda Miata in the workshop." and "A modified Miata engine bay." |
| Booking area (temporary state) | "Booking is not connected yet" / "Contact details will appear here once the shop confirms how customers should reach it. Nothing is being collected on this page." / button "Schedule service: coming soon" |
| Image descriptions (screen readers) | Written in `Stage.tsx`, `Bench.tsx`, `Vehicles.tsx`; they describe what is in each picture |

Questions inside this list:
- Is "independent" accurate for the shop?
- Is it right to say the Miata photos show "our workshop" and a car "in our workshop"?
- Is the line about Lamborghini wanted, or should the model be credited another way?

## 3. Needed from Dima before launch

1. **Photo rights.** The four Miata photographs (`miata-engine-inspect`, `miata-turbo-engine`, and the plate-blurred
   `miata-hood-open-blur`, `miata-workshop-blur`) are used provisionally. Confirm ownership and commercial usage
   rights. No other photographs are used on this page.
2. **How customers book.** The page has no phone number, email, hours, address or booking system because none is
   published. When the shop decides, set `destination` in `src/config/booking.ts` (a label and a `mailto:`, `tel:` or
   URL) and the temporary box is replaced by a real button. The "Schedule Service" button in the site header still
   points at the unfinished `/contact` page; that is outside this page.
3. **The car model.** It is a CC0 model of a Lamborghini Gallardo, modified (black paint, new materials, split doors).
   CC0 needs no credit. Decide whether the page should name the model at all.

## 4. Known separate issue (not changed here)

The Services page still serves the original, unblurred `miata-hood-open.webp` and `miata-workshop.webp` (licence plate
legible) and uses photographs whose ownership is unverified (red Miata, Corvettes, Mercedes, Audi, Porsche). That page
was left untouched on purpose and needs its own follow-up.
