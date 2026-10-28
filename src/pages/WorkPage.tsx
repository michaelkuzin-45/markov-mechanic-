import { useEffect } from 'react'
import { site } from '@/config/site'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { fromSite } from '@/work/content'
import { WorkStage } from '@/sections/work/WorkStage'
import { Invitation } from '@/sections/work/Invitation'

/**
 * Work: the featured builds, one at a time, and the way in. (The cinematic flight into the title is added in the
 * next stage; this is also the layout visitors get with reduced motion or without WebGL.)
 */
export function WorkPage() {
  useEffect(() => {
    const previous = document.title
    document.title = `${fromSite.title} | ${site.name}`
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <>
      <WorkStage />
      <Invitation />
      <SiteFooter />
    </>
  )
}
