import { Suspense, lazy, useEffect } from 'react'
import { images } from '@/images/registry'
import { ScrollTrigger } from '@/lib/gsap'
import { site } from '@/config/site'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { flatRequested, webglAvailable } from '@/journey/support'
import { Arrival } from '@/sections/services/Arrival'
import { ServicesStory } from '@/sections/services/ServicesStory'
import { ServicePanels } from '@/sections/services/ServicePanels'
import { InspectionLens } from '@/sections/services/InspectionLens'
import { ServicesClosing } from '@/sections/services/ServicesClosing'
import { SiteFooter } from '@/components/layout/SiteFooter'

const JourneyExperience = lazy(() => import('@/journey/JourneyExperience'))

export function ServicesPage() {
  const reduced = usePrefersReducedMotion()
  // The spatial journey needs WebGL and motion; everyone else gets the photographic page.
  const journey = !reduced && !flatRequested() && webglAvailable()

  useEffect(() => {
    const previous = document.title
    document.title = `Services | ${site.name}`
    // Web fonts change text heights: re-measure scroll triggers once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <>
      <Arrival />
      {journey ? (
        <Suspense fallback={<div style={{ height: '100svh', background: `#040405 url(${images.hoodUp.src}) center / cover no-repeat` }} />}>
          <JourneyExperience />
        </Suspense>
      ) : (
        <>
          <ServicesStory />
          <ServicePanels />
          <InspectionLens />
          <ServicesClosing />
        </>
      )}
      <SiteFooter />
    </>
  )
}
