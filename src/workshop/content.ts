/**
 * Workshop page wording, split by who has approved it.
 *
 * `fromSite` is the factual wording published on markovautomotive.com (Workshop and
 * Services pages), used as written.
 *
 * `pending` is new copy written for this page. Every string in it needs Dima's
 * approval before launch; the full list is in docs/workshop-copy-approval.md.
 * Do not add claims to either object that the shop has not made itself.
 */
import { services } from '@/config/services'

const service = (title: string) => services.find((s) => s.title === title)!

export const fromSite = {
  title: 'Workshop',
  place: 'Springfield, Virginia',
  intro: [
    'Our workshop is located in Springfield, Virginia. We mainly specialize in servicing enthusiast cars, including 1990s Miatas, classic Corvettes, modified cars, and custom or DIY builds.',
    'We also service and maintain regular cars. If your car needs maintenance or repair, we are more than happy to help.',
  ],
  enthusiast: ['1990s Miatas', 'Classic Corvettes', 'Modified cars', 'Custom & DIY builds'],
  everyday: 'Regular cars',
  everydayNote: 'If your car needs maintenance or repair, we are more than happy to help.',
  stepsTitle: 'Three simple steps',
  steps: [
    { title: 'Reach out', copy: 'Tell us what car you have and what it needs.' },
    { title: 'Bring the car', copy: 'We inspect it and confirm the work.' },
    { title: 'Mechanical work done', copy: 'We complete the service or repair.' },
  ],
  cta: { title: 'Bring your car to our workshop', copy: 'Tell us what car you have and what it needs.' },
  /** Service descriptions, verbatim from config/services.ts (the Services page wording). */
  service: {
    brakes: service('Brakes + Suspension'),
    diagnostics: service('Diagnostics'),
    performance: service('Performance Installs'),
    turbo: service('Turbo Systems'),
  },
} as const

export const pending = {
  statement:
    'An independent repair and performance workshop. This is not a dealership, and nothing on this page is for sale.',
  stageHint: 'Drag to turn the car. Pick a part to see how we work on it.',
  modelNote: 'Reference model, not an inventory vehicle. Markov Automotive is not affiliated with Lamborghini.',
  stageHeading: 'Look the car over',
  hotspots: {
    wheels: { title: 'Wheels and brakes', cue: 'Steer the front wheels' },
    cabin: { title: 'Cabin', cue: 'Open or close the door' },
    rear: { title: 'Rear and exhaust' },
    engine: { title: 'Engine and turbo' },
  },
  engine: {
    lead: 'This model has no engine bay on show, so here is the real thing: a turbocharged Mazda Miata in our workshop. A different car from the one you were just looking at.',
    back: 'Back to the car',
  },
  bench: {
    heading: 'From our bench',
    lead: 'Photographs from the workshop, not renders. A turbocharged Mazda Miata, shown in detail.',
    carLabel: 'A Mazda Miata in our workshop, not the model above.',
    callouts: [
      { id: 'radiator', label: 'Aluminium radiator', x: 17, y: 62 },
      { id: 'cover', label: 'Copper-finish valve cover', x: 52, y: 40 },
      { id: 'hoses', label: 'Blue silicone hoses', x: 36, y: 58 },
      { id: 'turbo', label: 'Turbocharger and intake filter', x: 47, y: 79 },
    ],
    hood: 'The same Miata with the hood up, in the bay.',
    garage: 'The bay.',
  },
  vehicles: {
    heading: 'Cars we work on',
    enthusiastLabel: 'Enthusiast cars',
    everydayLabel: 'Everyday cars',
    miataCaption: 'A 1990s Mazda Miata in the workshop.',
    modifiedCaption: 'A modified Miata engine bay.',
    classicCaption: 'A classic Chevrolet Corvette.',
    everydayCaption: 'A Mercedes-Benz sedan.',
  },
  booking: {
    stateTitle: 'Booking is not connected yet',
    stateCopy:
      'Contact details will appear here once the shop confirms how customers should reach it. Nothing is being collected on this page.',
    stateButton: 'Schedule service: coming soon',
  },
  controls: {
    lights: 'Lights',
    reset: 'Reset view',
    stills: 'Use still images',
    live: 'Use interactive 3D',
    degraded: 'Switched to still images to keep the page smooth.',
    contextLost: 'The 3D view stopped, so still images are showing.',
  },
} as const
