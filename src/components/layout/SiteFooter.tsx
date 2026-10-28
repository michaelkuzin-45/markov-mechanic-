import { Link } from 'react-router'
import { navItems } from '@/config/navigation'
import { site } from '@/config/site'
import styles from './SiteFooter.module.css'

/** Footer: only details published on markovautomotive.com (no address, phone or hours). */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          <div>
            <p className={styles.name}>{site.name}</p>
            <p className={styles.meta}>
              {site.tagline} · {site.location}
            </p>
          </div>
        </div>
        <nav aria-label="Footer">
          <ul className={styles.links}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className={styles.legal}>
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  )
}
