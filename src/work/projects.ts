import { images, type ImageId, type SiteImage } from '@/images/registry'

/**
 * The builds shown on the Work page: the nine entries on the shop's own Work list (markovautomotive.com/work), in
 * its order, with its captions word for word. The photograph for each is the one the shop's own page shows with that
 * entry (docs/image-inventory.md). Nothing here was written for this page: no specifications, dates, results or
 * stories are added, and different cars are never presented as one build.
 *
 * Every photograph is PENDING CLIENT APPROVAL: the page must not go to production until Dima confirms them.
 */
export interface Project {
  id: string
  title: string
  /** The shop's caption, as published. */
  caption: string
  image: ImageId
}

export const featured: readonly Project[] = [
  {
    id: 'turbo-miata',
    title: 'Turbo Mazda Miata',
    caption: 'Regular maintenance on the turbo and engine system of this Mazda Miata.',
    image: 'hoodUp',
  },
  {
    id: 'miata-turbo-build',
    title: '1995 Mazda Miata Turbo Build',
    caption: 'Completing a turbo build to increase the performance output of this 1995 Mazda Miata.',
    image: 'turboEngine',
  },
  {
    id: 'miata-service',
    title: 'Mazda Miata Service',
    caption: 'Mazda Miata getting its service done.',
    image: 'garageBay',
  },
  {
    id: 'red-miata',
    title: 'Red Mazda Miata',
    caption: 'Customer’s red Mazda Miata receiving routine service.',
    image: 'miataRed',
  },
  {
    id: 'audi-a5',
    title: 'Audi A5 Coupe',
    caption:
      'A strong street-enthusiast platform and a great starting point for performance builds. This car received turbo and engine-performance upgrades.',
    image: 'audi',
  },
  {
    id: 'mercedes',
    title: 'Mercedes-Benz',
    caption: 'An older Mercedes receiving regular service and mechanical maintenance.',
    image: 'mercedes',
  },
  {
    id: 'c8',
    title: 'Chevrolet C8 Corvette',
    caption: 'Mid-engine Chevrolet C8 Corvette receiving an engine-oil change.',
    image: 'corvetteC8',
  },
  {
    id: 'cayman',
    title: 'Porsche Cayman S',
    caption: 'Porsche Cayman S receiving an engine-oil change and performance upgrades.',
    image: 'porsche',
  },
  {
    id: 'classic-corvette',
    title: 'Classic Corvette',
    caption: 'Classic Corvette receiving engine, brake, and cooling-system maintenance.',
    image: 'corvetteClassic',
  },
]

export const imageOf = (p: Project): SiteImage => images[p.image]
