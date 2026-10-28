import { images, type ImageId } from '@/images/registry'
import { services, type Service } from './services'

/**
 * Content and art direction for the Services page.
 *
 * All wording comes from markovautomotive.com (via services.ts / site.ts and
 * the homepage intro). Nothing here adds services or claims.
 *
 * IMAGES: the opening shot is still the homepage's Gallardo render (so the
 * card click lands on the image it showed). Everything below it uses the real
 * photographs embedded in the original Markov Automotive site (extracted from
 * assets/reference-site; served as the plate-safe, responsive derivatives in public/images, see src/images/registry.ts).
 * All photographs are PENDING CLIENT APPROVAL (docs/image-inventory.md).
 */

export interface Photo {
  src: string
  /** Every derivative width, for the srcset attribute. */
  srcSet: string
  alt: string
  width: number
  height: number
  /** Default object-position for cover crops. */
  focus: string
}

/** A placement of a registry photograph (src/images/registry.ts) with the crop this layout wants. */
const photo = (id: ImageId, alt: string, focus = '50% 50%'): Photo => {
  const image = images[id]
  return { src: image.src, srcSet: image.srcSet, alt, width: image.width, height: image.height, focus }
}

export const photos = {
  miataRed: photo('miataRed', 'Red first-generation Mazda Miata with pop-up headlights raised', '50% 55%'),
  corvetteClassic: photo('corvetteClassic', 'Red and white classic Chevrolet Corvette convertible', '50% 60%'),
  mercedes: photo('mercedes', 'Dark blue Mercedes-Benz E-Class sedan', '50% 60%'),
  miataWorkshop: photo('garageBay', 'Blue Mazda Miata parked inside the Markov Auto workshop', '50% 60%'),
  miataHoodOpen: photo('hoodUp', 'Blue Mazda Miata with the hood open in the workshop, turbo engine exposed', '50% 45%'),
  audi: photo('audi', 'White Audi A5 coupe at night', '50% 60%'),
  turboEngine: photo('turboEngine', 'Turbocharged Mazda Miata engine bay with a copper valve cover and blue silicone hoses', '50% 55%'),
  corvetteC8: photo('corvetteC8', 'Red mid-engine Chevrolet C8 Corvette', '50% 50%'),
  porsche: photo('porsche', 'Red Porsche Cayman S by the coast', '50% 55%'),
}

export interface StoryBeat {
  kicker: string
  lines: string[]
  body?: string
  photo: Photo
  /** Crop on portrait phones (object-position). */
  focusMobile: string
}

export const opening = {
  eyebrow: 'Services',
  lines: ['Precision', 'in every', 'detail.'],
  lede: 'Maintenance, diagnostics, brakes + suspension, turbo systems and performance installs, for enthusiast cars and everyday cars.',
  /** Gallardo still, same as the homepage Services card, so the click lands on the image it showed. */
  frame: 18,
}

export const storyBeats: StoryBeat[] = [
  {
    kicker: 'Markov Automotive · Springfield, Virginia',
    lines: ['Built for', 'enthusiast cars.'],
    photo: photos.miataRed,
    focusMobile: '33% 55%',
  },
  {
    kicker: 'What comes through the door',
    lines: ['1990s Miatas.', 'Classic Corvettes.'],
    photo: photos.corvetteClassic,
    focusMobile: '62% 60%',
  },
  {
    kicker: 'Modified, custom and DIY builds',
    lines: ['And everyday', 'cars too.'],
    body: 'We also service and maintain regular cars. If your car needs maintenance or repair, we are more than happy to help.',
    photo: photos.mercedes,
    focusMobile: '38% 60%',
  },
]

export interface ServicePanel extends Service {
  /** Short points, taken word for word from the service copy. */
  details: string[]
  photo: Photo
  /** The point the crop and zoom centre on. */
  focus: string
  /** Crop on phones (object-position). */
  focusMobile: string
  zoom: number
}

const detailsByTitle: Record<string, Omit<ServicePanel, keyof Service>> = {
  Maintenance: {
    details: ['Regular maintenance', 'Modified + performance cars', 'Every 3,000–5,000 miles'],
    photo: photos.miataWorkshop,
    focus: '62% 62%',
    focusMobile: '42% 60%',
    zoom: 1,
  },
  Diagnostics: {
    details: ['No-start', 'Boost leak', 'Overheating', 'Misfire', 'Unusual noises', 'Electrical problems'],
    // The hood-up photograph: the engine bay as a whole, the same picture the Diagnostics viewer marks up.
    photo: photos.miataHoodOpen,
    focus: '50% 45%',
    focusMobile: '50% 45%',
    zoom: 1,
  },
  'Brakes + Suspension': {
    details: ['Pads', 'Rotors', 'Fluid', 'Coilovers', 'Bushings', 'Control arms', 'Alignment preparation'],
    // The shop's own caption for this car mentions brake maintenance; the wheel and whitewall tire are the subject.
    photo: photos.corvetteClassic,
    focus: '24% 80%',
    focusMobile: '24% 80%',
    zoom: 1.04,
  },
  'Turbo Systems': {
    details: ['Custom turbo systems', 'Intercooler piping', 'Intake routing', 'Oil + coolant lines', 'Heat management'],
    // The turbo itself, with intake and silicone piping: what this service describes.
    photo: photos.turboEngine,
    focus: '50% 62%',
    focusMobile: '50% 62%',
    zoom: 1,
  },
  'Performance Installs': {
    details: ['Performance + supporting parts', 'Intake + exhaust', 'Suspension upgrades', 'Cooling upgrades'],
    // The shop's own caption for this car: turbo and engine-performance upgrades.
    photo: photos.audi,
    focus: '50% 62%',
    focusMobile: '42% 62%',
    zoom: 1,
  },
}

export const servicePanels: ServicePanel[] = services.map((s) => ({ ...s, ...detailsByTitle[s.title]! }))

/** Inspection lens: points on the engine-bay photo (x / y as 0..1 of the image). */
export interface InspectionPoint {
  label: string
  service: string
  copy: string
  x: number
  y: number
}

export const inspection = {
  /** The Miata engine bay, cropped to 16:9 so the points below line up. */
  image: {
    src: images.engineWide.src,
    alt: 'Turbocharged Mazda Miata engine bay with four inspection points',
    width: images.engineWide.width,
    height: images.engineWide.height,
  },
  kicker: 'Inspection',
  title: 'Every detail, checked.',
  points: [
    {
      label: 'Cooling',
      service: 'Performance Installs',
      copy: 'Cooling upgrades alongside intake, exhaust and suspension.',
      x: 0.163,
      y: 0.529,
    },
    {
      label: 'Turbo + intake',
      service: 'Turbo Systems',
      copy: 'Intercooler piping, intake routing and heat management for reliable power.',
      x: 0.496,
      y: 0.819,
    },
    {
      label: 'Suspension',
      service: 'Brakes + Suspension',
      copy: 'Coilovers, bushings and control arms.',
      x: 0.454,
      y: 0.126,
    },
    {
      label: 'Brakes',
      service: 'Brakes + Suspension',
      copy: 'Pads, rotors and fluid.',
      x: 0.737,
      y: 0.869,
    },
  ] satisfies InspectionPoint[],
}

export const closing = {
  kicker: 'Contact',
  lines: ['Tell us what', 'your car needs.'],
  photo: photos.porsche,
}

/**
 * Diagnostics viewer (journey). Uses the hood-open Miata photograph, a different
 * original from the engine-bay close-up used for Turbo Systems. Points are
 * fractions of the photograph; wording comes from the Diagnostics service copy.
 */
export const diagnostics = {
  image: { src: images.hoodUp.src, width: images.hoodUp.width, height: images.hoodUp.height, alt: 'Blue Mazda Miata with the hood open in the Markov workshop, engine bay exposed' },
  points: [
    { label: 'Coolant reservoir', x: 0.325, y: 0.525, checks: 'Overheating', copy: 'The coolant reservoir and cooling system: bring it in and we find the cause of overheating in-house.' },
    { label: 'Radiator', x: 0.48, y: 0.66, checks: 'Overheating', copy: 'Radiator and cap checked as part of tracing an overheating problem.' },
    { label: 'Intake piping', x: 0.413, y: 0.608, checks: 'Boost leak', copy: 'Intake piping checked for leaks, so the power you built is the power you get.' },
    { label: 'Engine + ignition', x: 0.49, y: 0.54, checks: 'Misfire · unusual noises', copy: 'Misfires and unusual noises traced to the source before any parts are replaced.' },
  ],
}
