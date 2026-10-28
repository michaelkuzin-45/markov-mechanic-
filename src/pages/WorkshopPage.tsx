import { useEffect } from 'react'
import { site } from '@/config/site'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Arrival } from '@/sections/services/Arrival'
import { Stage } from '@/sections/workshop/Stage'
import { Bench } from '@/sections/workshop/Bench'
import { Vehicles } from '@/sections/workshop/Vehicles'
import { Process } from '@/sections/workshop/Process'

/**
 * Workshop: the car and what we look at (live 3D, or stills), photographs from the bench, the cars we work on,
 * and how to bring one in. Arrival is the same card-launch landing the Services page uses.
 */
export function WorkshopPage() {
  useEffect(() => {
    const previous = document.title
    document.title = `Workshop | ${site.name}`
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <>
      <Arrival />
      <Stage />
      <Bench />
      <Vehicles />
      <Process />
      <SiteFooter />
    </>
  )
}
