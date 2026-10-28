import { images, type SiteImage } from '@/images/registry'

/**
 * The photographs the Workshop page uses, from the shared registry (src/images/registry.ts). All come from the shop's
 * previous site and are PENDING CLIENT APPROVAL: Dima still has to confirm ownership and commercial usage rights
 * (docs/image-inventory.md). Photographs of cars with a legible licence plate are the plate-pixelated derivatives.
 */
export interface WorkshopPhoto {
  src: string
  srcSet: string
  width: number
  height: number
}

const use = (image: SiteImage): WorkshopPhoto => ({ src: image.src, srcSet: image.srcSet, width: image.width, height: image.height })

export const photos = {
  /** The engine bay cropped to 16:9: the bench callouts are positioned on this crop. */
  engine: use(images.engineWide),
  engineTall: use(images.turboEngine),
  hoodUp: use(images.hoodUp),
  bay: use(images.garageBay),
  classic: use(images.corvetteClassic),
  everyday: use(images.mercedes),
} as const satisfies Record<string, WorkshopPhoto>
