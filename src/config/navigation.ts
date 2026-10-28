export interface NavItem {
  label: string
  path: string
}

export const navItems: readonly NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Workshop', path: '/workshop' },
  { label: 'Work', path: '/work' },
  { label: 'Contact', path: '/contact' },
]
