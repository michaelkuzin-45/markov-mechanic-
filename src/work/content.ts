/**
 * Work page wording, split by who has approved it (same rule as the Workshop page).
 *
 * `fromSite` is the shop's own published text (markovautomotive.com/work and /workshop), used as written.
 * `pending` is new copy for this page; all of it needs Dima's approval (docs/work-copy-approval.md).
 */
export const fromSite = {
  title: 'Work',
  heading: 'Cars and builds we have done',
  closingQuestion: 'Want work like this on your car?',
  closingBody: 'Tell us what car you have and what it needs.',
} as const

export const pending = {
  arrival: {
    first: 'The',
    second: 'Work',
    line: 'Every build has a story.',
    note: 'Photographs from the workshop.',
  },
  stage: {
    label: 'Featured builds',
    skip: 'Skip intro',
    replay: 'Replay intro',
    previous: 'Previous build',
    next: 'Next build',
    loading: 'Loading',
    counter: (i: number, n: number) => `Build ${i} of ${n}`,
  },
  closing: {
    first: 'Your project',
    second: 'starts here.',
    stateTitle: 'Booking is not connected yet',
    stateCopy:
      'Contact details will appear here once the shop confirms how customers should reach it. Nothing is being collected on this page.',
    stateButton: 'Get in touch: coming soon',
  },
  unavailable: 'This photograph could not be loaded.',
} as const
