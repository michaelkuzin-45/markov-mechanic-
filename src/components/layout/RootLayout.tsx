import { Outlet, ScrollRestoration } from 'react-router'
import { MotionConfig } from 'motion/react'
import { SiteHeader } from './SiteHeader'

export function RootLayout() {
  return (
    // "user": Motion skips transform/layout animations when the visitor
    // prefers reduced motion (CSS animations are handled in global.css).
    <MotionConfig reducedMotion="user">
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <ScrollRestoration />
    </MotionConfig>
  )
}
