import manifest from './manifest.generated.json'

/**
 * Every photograph the site shows. All of them come from the shop's previous website (the originals are kept,
 * untouched, in assets/reference-images/originals and are inventoried in docs/image-inventory.md). What is served is
 * a derivative made by blender/scripts/site_images.py: licence plates pixelated, several widths, WebP.
 *
 * RIGHTS: every photograph is PENDING CLIENT APPROVAL. Appearing on the old site does not prove the shop may use
 * it commercially. Do not deploy to production until Dima has confirmed each one (docs/image-inventory.md).
 */
export type ImageId =
  | 'hoodUp'
  | 'garageBay'
  | 'turboEngine'
  | 'engineWide'
  | 'miataRed'
  | 'audi'
  | 'mercedes'
  | 'corvetteC8'
  | 'porsche'
  | 'corvetteClassic'

export type Rights = 'pending-client-approval'

interface Def {
  slug: keyof typeof manifest
  /** The reference file it was made from (docs/image-inventory.md). */
  source: string
  /** The shop's own alt text for the photograph, or a plain description of what is visible. */
  alt: string
}

const defs: Record<ImageId, Def> = {
  hoodUp: { slug: 'miata-hood-up', source: 'work-02', alt: 'Blue Mazda Miata nose-in to a workshop bay with its hood up, shelving and stacked tires on the left, tools and boxes on the right.' },
  garageBay: { slug: 'miata-garage-bay', source: 'index-03', alt: 'A blue Mazda Miata parked in a single workshop bay with wire shelving above, a floor jack and oil containers on the left and a bicycle on the right.' },
  turboEngine: { slug: 'miata-turbo-engine', source: 'services-02', alt: 'Engine bay of a turbocharged Mazda Miata: copper-finish valve cover, blue silicone hoses, a turbocharger with a conical intake filter, and an aluminium radiator.' },
  engineWide: { slug: 'miata-engine-wide', source: 'services-02 (crop)', alt: 'Wide view of the turbocharged Mazda Miata engine bay: an aluminium radiator on the left, the copper-finish valve cover in the centre and the turbocharger below it.' },
  miataRed: { slug: 'miata-red-popup', source: 'work-05', alt: 'Red first-generation Mazda Miata with pop-up headlights raised' },
  audi: { slug: 'audi-a5-night', source: 'work-06', alt: 'White Audi A5 coupe at night' },
  mercedes: { slug: 'mercedes-e-class', source: 'work-07', alt: 'Dark blue Mercedes-Benz E-Class sedan' },
  corvetteC8: { slug: 'corvette-c8', source: 'index-04', alt: 'Red mid-engine Chevrolet C8 Corvette' },
  porsche: { slug: 'porsche-cayman', source: 'contact-03', alt: 'Red Porsche Cayman S by the coast' },
  corvetteClassic: { slug: 'corvette-classic', source: 'work-10', alt: 'Red and white classic Chevrolet Corvette convertible' },
}

export interface SiteImage {
  id: ImageId
  width: number
  height: number
  alt: string
  /** The largest derivative (the original's own width). */
  src: string
  /** The 800 px derivative, for phones and small textures. */
  small: string
  /** `srcset` value listing every derivative. */
  srcSet: string
  /** The original reference file this was made from. */
  source: string
  rights: Rights
}

const file = (slug: string, width: number) => `/images/${slug}-${width}.webp`

function build(id: ImageId): SiteImage {
  const def = defs[id]
  const entry = manifest[def.slug]
  const widths = Object.keys(entry.files).map(Number).sort((a, b) => a - b)
  const largest = widths[widths.length - 1]!
  return {
    id,
    width: entry.width,
    height: entry.height,
    alt: def.alt,
    src: file(def.slug, largest),
    small: file(def.slug, 800),
    srcSet: widths.map((w) => `${file(def.slug, w)} ${w}w`).join(', '),
    source: def.source,
    rights: 'pending-client-approval',
  }
}

export const images = Object.fromEntries((Object.keys(defs) as ImageId[]).map((id) => [id, build(id)])) as Record<ImageId, SiteImage>
