import { Link } from 'react-router'
import styles from './PlaceholderPage.module.css'

interface PlaceholderPageProps {
  eyebrow: string
  title: string
}

/** Temporary page shell for routes that haven't been designed yet. */
export function PlaceholderPage({ eyebrow, title }: PlaceholderPageProps) {
  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.note}>This page is coming soon.</p>
      <Link to="/" className={styles.back}>
        ← Back to home
      </Link>
    </section>
  )
}
