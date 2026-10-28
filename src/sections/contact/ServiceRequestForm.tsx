import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FORM_NAME, serviceOptions } from '@/config/contact'
import styles from './ServiceRequestForm.module.css'

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'preview'
type Field = 'name' | 'phone' | 'email' | 'year' | 'details'
type Errors = Partial<Record<Field, string>>

const ORDER: readonly Field[] = ['name', 'phone', 'email', 'year', 'details']

const isLocal = () => location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)

function validate(f: FormData): Errors {
  const v = (k: string) => String(f.get(k) ?? '').trim()
  const e: Errors = {}
  if (!v('name')) e.name = 'Enter your full name.'
  if (!v('phone')) e.phone = 'Enter a phone number.'
  else if (v('phone').replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number.'
  if (!v('email')) e.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) e.email = 'Enter a valid email address, like name@example.com.'
  if (v('year') && !/^(19|20)\d{2}$/.test(v('year'))) e.year = 'Use a four-digit year, like 1995.'
  if (!v('details')) e.details = 'Describe the problem or the work you want done.'
  return e
}

const MESSAGES = {
  success: 'Thanks, your request was sent. We will get back to you as soon as possible.',
  error: 'Sorry, your request could not be sent. Please try again in a moment.',
  preview:
    'Local preview: the form is set up for Netlify Forms and sends once the site is deployed on Netlify. Nothing was sent.',
} as const

export function ServiceRequestForm() {
  const form = useRef<HTMLFormElement>(null)
  const sending = useRef(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Errors>({})

  // ?service=Diagnostics preselects the type of service, as on the original page.
  useEffect(() => {
    const wanted = new URLSearchParams(location.search).get('service')?.toLowerCase()
    const match = serviceOptions.find((o) => o.toLowerCase() === wanted)
    const select = form.current?.elements.namedItem('service') as HTMLSelectElement | null
    if (match && select) select.value = match
  }, [])

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (sending.current) return // a second click or Enter press while one request is in flight
    const el = ev.currentTarget
    const data = new FormData(el)
    const found = validate(data)
    setErrors(found)
    const first = ORDER.find((k) => found[k])
    if (first) {
      setStatus('idle')
      ;(el.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }

    sending.current = true
    setStatus('submitting')
    try {
      data.set('form-name', FORM_NAME)
      const body = new URLSearchParams(data as unknown as Record<string, string>).toString()
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (!res.ok) throw new Error(String(res.status))
      // Only a real deployment may report success: a local server answers POST / without storing anything.
      if (isLocal()) {
        setStatus('preview')
        return
      }
      el.reset()
      setStatus('success')
    } catch {
      setStatus(isLocal() ? 'preview' : 'error')
    } finally {
      sending.current = false
    }
  }

  const busy = status === 'submitting'
  const bad = (k: Field) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `e-${k}` } : {})
  const msg = (k: Field) =>
    errors[k] ? (
      <p className={styles.error} id={`e-${k}`}>
        {errors[k]}
      </p>
    ) : null

  return (
    <form
      ref={form}
      id="service-request"
      className={styles.form}
      name={FORM_NAME}
      method="POST"
      action="/"
      noValidate
      onSubmit={onSubmit}
    >
      <input type="hidden" name="form-name" value={FORM_NAME} />
      <p className={styles.trap} aria-hidden="true">
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <h2 className={styles.title}>Request service</h2>
      <p className={styles.intro}>Tell us a little about your vehicle and what you need.</p>
      <p className={styles.req}>
        Fields marked <span aria-hidden="true">*</span>
        <span className="visually-hidden"> with an asterisk</span> are required.
      </p>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="f-name">
            Full name <span aria-hidden="true">*</span>
          </label>
          <input id="f-name" name="name" autoComplete="name" aria-required="true" {...bad('name')} />
          {msg('name')}
        </div>
        <div className={styles.field}>
          <label htmlFor="f-phone">
            Phone number <span aria-hidden="true">*</span>
          </label>
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" aria-required="true" {...bad('phone')} />
          {msg('phone')}
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          <label htmlFor="f-email">
            Email address <span aria-hidden="true">*</span>
          </label>
          <input id="f-email" name="email" type="email" autoComplete="email" aria-required="true" {...bad('email')} />
          {msg('email')}
        </div>

        <div className={styles.field}>
          <label htmlFor="f-year">Vehicle year</label>
          <input id="f-year" name="year" inputMode="numeric" maxLength={4} autoComplete="off" {...bad('year')} />
          {msg('year')}
        </div>
        <div className={styles.field}>
          <label htmlFor="f-make">Vehicle make</label>
          <input id="f-make" name="make" autoComplete="off" />
        </div>
        <div className={styles.field}>
          <label htmlFor="f-model">Vehicle model</label>
          <input id="f-model" name="model" autoComplete="off" />
        </div>

        <div className={styles.field}>
          <label htmlFor="f-service">Type of service</label>
          <select id="f-service" name="service" defaultValue="">
            <option value="">Select a service</option>
            {serviceOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="f-emergency">Emergency?</label>
          <select id="f-emergency" name="emergency" defaultValue="No">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div className={`${styles.field} ${styles.wide}`}>
          <label htmlFor="f-details">
            What is happening with the car? <span aria-hidden="true">*</span>
          </label>
          <textarea id="f-details" name="details" rows={5} aria-required="true" {...bad('details')} />
          {msg('details')}
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <p className={styles.summary} role="alert">
          Please fix the highlighted fields and send again.
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={busy}>
        {busy ? 'Submitting…' : 'Send service request'}
      </button>

      <p
        className={`${styles.status} ${status === 'success' ? styles.ok : ''} ${status === 'error' || status === 'preview' ? styles.fail : ''}`}
        role="status"
        aria-live="polite"
      >
        {status === 'idle' ? '' : busy ? 'Submitting…' : MESSAGES[status]}
      </p>
    </form>
  )
}
