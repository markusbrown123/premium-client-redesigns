import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

type DirectLink = { label: string; value: string; href?: string }

type Props = {
  eyebrow: string
  title: ReactNode
  lede: string
  services: string[]
  budgets?: string[]
  direct: DirectLink[]
  submitLabel?: string
}

const DEFAULT_BUDGETS = ['< $25k', '$25–75k', '$75–250k', '$250k+'] as const

export function ContactCTA({
  eyebrow,
  title,
  lede,
  services,
  budgets = [...DEFAULT_BUDGETS],
  direct,
  submitLabel = 'Send enquiry',
}: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [picked, setPicked] = useState<string[]>([])

  function toggle(s: string) {
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact__row reveal">
          <div className="contact__left">
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="display contact__title">{title}</h2>
            <p className="lede contact__lede">{lede}</p>
            <ul className="contact__direct">
              {direct.map((d, i) => (
                <li key={i}>
                  <span className="contact__dlabel">{d.label}</span>
                  {d.href ? <a href={d.href}>{d.value}</a> : <span>{d.value}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="contact__right">
            {submitted ? (
              <div className="contact__thanks">
                <span className="eyebrow">Received</span>
                <h3 className="h-md">Thank you — we'll be in touch within one business day.</h3>
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setSubmitted(false)
                    setPicked([])
                  }}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form className="contact__form" onSubmit={onSubmit}>
                <div className="field">
                  <label htmlFor="cf-name">Name</label>
                  <input id="cf-name" name="name" type="text" required />
                </div>
                <div className="field">
                  <label htmlFor="cf-email">Email</label>
                  <input id="cf-email" name="email" type="email" required />
                </div>
                <div className="field">
                  <label htmlFor="cf-company">Company / brand</label>
                  <input id="cf-company" name="company" type="text" />
                </div>

                <div className="field">
                  <label>Services</label>
                  <div className="chips">
                    {services.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`chip ${picked.includes(s) ? 'is-on' : ''}`}
                        onClick={() => toggle(s)}
                        aria-pressed={picked.includes(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="cf-budget">Budget</label>
                  <div className="radios" role="radiogroup" aria-labelledby="cf-budget">
                    {budgets.map((b) => (
                      <label key={b} className="radio">
                        <input type="radio" name="budget" value={b} />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="cf-msg">Project brief</label>
                  <textarea id="cf-msg" name="message" rows={5} required />
                </div>

                <button type="submit" className="btn btn--primary btn--block">
                  <span>{submitLabel}</span>
                  <span aria-hidden="true">→</span>
                </button>
                <p className="contact__fine">
                  By submitting you agree to our privacy notice. We never share briefs with third parties.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
