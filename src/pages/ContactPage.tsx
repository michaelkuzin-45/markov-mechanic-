import type { CSSProperties } from 'react'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { contactDetails, steps } from '@/config/contact'
import { ServiceRequestForm } from '@/sections/contact/ServiceRequestForm'
import styles from './ContactPage.module.css'

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

/** Final page: a plain, fast service-request page. No canvas, no images, no scroll animation. */
export function ContactPage() {
  const { location, phone, email, hours } = contactDetails
  return (
    <>
      <section className={styles.hero} aria-labelledby="contact-title">
        <p className={`${styles.label} ${styles.in}`} style={stagger(0)}>
          Contact Markov Automotive
        </p>
        <h1 id="contact-title" className={`${styles.title} ${styles.in}`} style={stagger(1)}>
          Let&rsquo;s get your car <span className={styles.accent}>right.</span>
        </h1>
        <p className={`${styles.lede} ${styles.in}`} style={stagger(2)}>
          Whether it&rsquo;s routine maintenance, diagnostics, or a performance upgrade, tell us what your vehicle needs
          and we&rsquo;ll get back to you.
        </p>
      </section>

      <section className={styles.layout}>
        <div className={styles.formCol}>
          <ServiceRequestForm />
        </div>

        <aside className={styles.side} aria-label="Contact details and process">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Contact details</h2>
            <dl className={styles.details}>
              <div>
                <dt>Location</dt>
                <dd>{location}</dd>
              </div>
              {phone && (
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>
                  </dd>
                </div>
              )}
              {email && (
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${email}`}>{email}</a>
                  </dd>
                </div>
              )}
              {hours && (
                <div>
                  <dt>Hours</dt>
                  <dd>{hours}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>What happens next</h2>
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className={styles.num} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </section>
      <SiteFooter />
    </>
  )
}
