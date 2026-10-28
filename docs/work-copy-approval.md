# Work page: what Dima needs to approve

Source of truth in code: `src/work/content.ts` (`fromSite` = the shop's own published wording, `pending` = new),
`src/work/projects.ts` (the builds shown). Nothing below is live-approved until Dima says so.

## 1. Wording taken as written from markovautomotive.com (please check it is still true)

- Page name "Work".
- The nine builds' names and descriptions, verbatim (first three shown here): "Turbo Mazda Miata" ("Regular maintenance on the turbo and engine system of this Mazda
  Miata."), "1995 Mazda Miata Turbo Build" ("Completing a turbo build to increase the performance output of this 1995 Mazda Miata."),
  "Mazda Miata Service" ("Mazda Miata getting its service done.").
- "Want work like this on your car?" and "Tell us what car you have and what it needs."

## 2. New copy written for this page (please approve or rewrite)

| Where | Text |
| --- | --- |
| Opening (kept from the first version) | "The Work"; "Every build has a story."; "Photographs from the workshop." |
| Controls | "Skip intro", "Replay intro", "Previous build", "Next build", "Build 1 of 9" (screen readers), "Loading", carousel label "Featured builds" |
| Closing | "YOUR PROJECT STARTS HERE."; temporary box "Booking is not connected yet" / "Contact details will appear here once the shop confirms how customers should reach it. Nothing is being collected on this page." / "Get in touch: coming soon" |
| Image descriptions (screen readers) | Written in `src/images/registry.ts`; they describe only what is visible |
| Failed image | "This photograph could not be loaded." |

Questions inside this list:
- **Pairing** is no longer an assumption: each entry uses the photograph the shop's own old Work page showed with it (docs/image-inventory.md).
- "Every build has a story." is a slogan, not a claim about a specific job. Keep, or replace?
- Is it right to describe the photographs as "from the workshop"?

## 3. Needed from Dima before launch

1. **Photo rights.** All ten photographs (docs/image-assignments.md) are pending client approval: ownership and commercial usage rights are not confirmed.
2. **More builds.** All nine entries on the shop's list are shown. To add more, put cleared photographs in `assets/reference-images/`, add them to `derivatives.json`, rerun `blender/scripts/site_images.py`, register them in `src/images/registry.ts` and add the entry to `src/work/projects.ts` (the ring holds about eleven at the current 32 degree spacing).
3. **How customers get in touch.** No phone, email, hours, address or booking system is published, so none is shown. Set `destination` in
   `src/config/booking.ts`; the Work closing and the Workshop closing read it.

## 4. Services page plates (resolved)

The Services page used to serve unblurred photographs with a legible licence plate. Every photograph the site serves is now a plate-pixelated
derivative of the original (docs/image-assignments.md). Rights for those photographs are still pending (item 1).
