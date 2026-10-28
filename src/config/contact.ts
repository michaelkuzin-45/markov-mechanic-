// Contact details as published on markovautomotive.com (Markov Auto).
// The reference Contact page publishes no phone number, email address, street address or hours,
// so none are shown. When the shop confirms them, add them here and the page renders them
// (phone becomes a tel: link, email a mailto: link).
import { site } from '@/config/site'

export interface ContactDetails {
  location: string
  phone: string | null // e.g. '+1 703 555 0100'
  email: string | null // e.g. 'shop@example.com'
  hours: string | null
}

export const contactDetails: ContactDetails = {
  location: site.location,
  phone: null,
  email: null,
  hours: null,
}

/** Netlify Forms name; must match the static definition in index.html. */
export const FORM_NAME = 'service-request'

/** Service categories, as listed on the original Contact page. */
export const serviceOptions = [
  'Regular Maintenance',
  'Diagnostics',
  'Brakes or Suspension',
  'Turbo System',
  'Performance Install',
  'Other',
] as const

export const steps = [
  { title: 'Send your request', copy: 'Tell us about your vehicle and what needs attention.' },
  { title: 'We review it', copy: "We'll review your request and discuss the next steps." },
  { title: 'Bring your vehicle', copy: 'Arrange a time to bring your vehicle in for inspection or service.' },
] as const
