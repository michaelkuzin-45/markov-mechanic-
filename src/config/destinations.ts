import { frameSets } from '@/scene/sequence/frameSets'

export interface Destination {
  index: string
  title: string
  copy: string
  path: string
  /** Card image: a still from the hero's own rendered camera move (already cached). */
  image: string
}

const still = (i: number) => frameSets.desktop.url(i)

/**
 * The floating navigation cards at the end of the hero. They mirror the site
 * structure of markovautomotive.com (Services, Work, Workshop, Contact).
 * Those pages are still placeholders in this build ("coming soon").
 */
export const destinations: readonly Destination[] = [
  {
    index: '01',
    title: 'Services',
    copy: 'Maintenance, diagnostics, brakes + suspension, turbo systems and performance installs.',
    path: '/services',
    image: still(18),
  },
  {
    index: '02',
    title: 'Past Work',
    copy: 'Cars and builds we have done.',
    path: '/work',
    image: still(30),
  },
  {
    index: '03',
    title: 'Workshop',
    copy: 'Enthusiast cars, from 1990s Miatas and classic Corvettes to modified and DIY builds, plus everyday cars.',
    path: '/workshop',
    image: still(56),
  },
  {
    index: '04',
    title: 'Contact',
    copy: 'Tell us what your car needs.',
    path: '/contact',
    image: still(95),
  },
]
