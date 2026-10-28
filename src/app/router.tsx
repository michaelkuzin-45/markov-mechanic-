import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { ServicesPage } from '@/pages/ServicesPage'
import { ContactPage } from '@/pages/ContactPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/** Shown while a lazily loaded page (Workshop) resolves on a direct visit: the site's own background, not a flash of white. */
function PageFallback() {
  return <div aria-hidden="true" style={{ minHeight: '100svh', background: 'var(--color-bg)' }} />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    HydrateFallback: PageFallback,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', element: <ServicesPage /> },
      {
        path: 'workshop',
        // Loaded on demand: the 3D stage and its photographs add nothing to the homepage bundle.
        lazy: async () => ({ Component: (await import('@/pages/WorkshopPage')).WorkshopPage }),
      },
      {
        path: 'work',
        lazy: async () => ({ Component: (await import('@/pages/WorkPage')).WorkPage }),
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
