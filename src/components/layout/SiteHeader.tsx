import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { navItems } from '@/config/navigation'
import { site } from '@/config/site'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label={`${site.name} home`}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>{site.shortName}</span>
          <span className={styles.brandSub}>Automotive</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Link to="/contact" className={styles.cta}>
          Schedule Service
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <span className={styles.bar} data-open={menuOpen || undefined} />
          <span className={styles.bar} data-open={menuOpen || undefined} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            className={styles.mobileMenu}
            aria-label="Mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul>
              {navItems.map((item, i) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      isActive ? `${styles.mobileLink} ${styles.active}` : styles.mobileLink
                    }
                  >
                    <span className={styles.mobileIndex}>{String(i + 1).padStart(2, '0')}</span>
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
