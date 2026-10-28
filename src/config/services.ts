export interface Service {
  title: string
  copy: string
}

/**
 * The services listed on markovautomotive.com/services, wording lightly
 * shortened. Do not add services that are not offered there.
 */
export const services: readonly Service[] = [
  {
    title: 'Maintenance',
    copy: 'Regular maintenance keeps your car reliable. Performance-driven or modified cars may need service every 3,000 to 5,000 miles.',
  },
  {
    title: 'Diagnostics',
    copy: 'No-start, boost leak, overheating, misfire, unusual noises or electrical problems: bring it in and we find the cause in-house.',
  },
  {
    title: 'Brakes + Suspension',
    copy: 'Pads, rotors, fluid, coilovers, bushings, control arms and alignment preparation.',
  },
  {
    title: 'Turbo Systems',
    copy: 'Custom turbo systems, intercooler piping, intake routing, oil and coolant lines, and heat management for reliable power.',
  },
  {
    title: 'Performance Installs',
    copy: 'Performance and supporting parts, intake and exhaust, suspension and cooling upgrades installed for your build.',
  },
]

/** Scroll captions in the hero: real services, grouped by camera scene. */
export const heroCaptions = [
  { index: '01', title: 'Maintenance + Diagnostics', copy: 'Reliable cars, and the real cause of the problem found in-house.' },
  { index: '02', title: 'Turbo Systems + Performance', copy: 'Custom turbo work and performance installs, done for reliable power.' },
  { index: '03', title: 'Brakes + Suspension', copy: 'Pads, rotors, coilovers, bushings and control arms.' },
] as const
