/**
 * Where the "Schedule Service" buttons on the Workshop and Work pages lead: the service request form on /contact.
 * markovautomotive.com publishes no phone number, email address, hours or address, so none are invented here.
 * Set `destination` to null to bring back the "not connected" state on those pages.
 */
export interface BookingDestination {
  /** Button text: say what happens when it is used. */
  label: string
  href: string
}

export const booking: { destination: BookingDestination | null } = {
  destination: { label: 'Request service', href: '/contact#service-request' },
}
