import { useState } from 'react'
import { COMPANY, SERVICES } from '../a1Data'
import { Phone, ArrowRight } from './A1Icons'

export function A1Contact() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="a1-section a1-contact" id="contact">
      <div className="a1-container">
        <div className="a1-contact__grid">
          <div className="a1-contact__copy a1-reveal">
            <span className="a1-eyebrow">10 — Free Estimate</span>
            <h2 className="a1-contact__big">
              Protect your driveway.<br />
              Or your <em>parking lot.</em>
            </h2>
            <p className="a1-lede" style={{ color: '#cfcfcf' }}>
              Send a few details, or call {COMPANY.phone}. We will set up a time to come out, look at the property and quote it on the spot — no fee, no obligation.
            </p>
            <div className="a1-contact__direct">
              <a className="a1-contact__direct-row" href={COMPANY.phoneHref}>
                <span className="a1-contact__direct-label">Call</span>
                <span className="a1-contact__direct-value">{COMPANY.phone}</span>
              </a>
              <div className="a1-contact__direct-row">
                <span className="a1-contact__direct-label">Hours</span>
                <span className="a1-contact__direct-value" style={{ fontSize: 16, letterSpacing: '0.04em' }}>
                  Estimates by appointment · 7 days
                </span>
              </div>
              <div className="a1-contact__direct-row">
                <span className="a1-contact__direct-label">CEO</span>
                <span className="a1-contact__direct-value" style={{ fontSize: 16, letterSpacing: '0.04em' }}>
                  {COMPANY.ceo}
                </span>
              </div>
            </div>
          </div>

          {/* Netlify-static form. data-netlify="true" + a name is enough for Netlify forms.
              We also keep an honeypot field to deter bots. Submission goes via standard
              form-encoded POST so it works without JS in production on Netlify. */}
          <form
            className="a1-form a1-reveal a1-reveal--right"
            name="a1-estimate"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={() => {
              // Optimistic UX; Netlify will still process the POST.
              setSubmitted(true)
            }}
          >
            <input type="hidden" name="form-name" value="a1-estimate" />
            <p style={{ display: 'none' }}>
              <label>Don't fill this out: <input name="bot-field" /></label>
            </p>

            <div className="a1-field a1-field--row">
              <div className="a1-field">
                <label htmlFor="a1-name">Your name</label>
                <input id="a1-name" name="name" type="text" required autoComplete="name" />
              </div>
              <div className="a1-field">
                <label htmlFor="a1-phone">Phone</label>
                <input id="a1-phone" name="phone" type="tel" required autoComplete="tel" placeholder="(___) ___-____" />
              </div>
            </div>

            <div className="a1-field">
              <label htmlFor="a1-email">Email (optional)</label>
              <input id="a1-email" name="email" type="email" autoComplete="email" />
            </div>

            <div className="a1-field">
              <label htmlFor="a1-service">Service needed</label>
              <select id="a1-service" name="service" required defaultValue="">
                <option value="" disabled>Select a service…</option>
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
                <option value="Not sure / multiple">Not sure / multiple</option>
              </select>
            </div>

            <div className="a1-field">
              <label htmlFor="a1-message">Tell us about the property</label>
              <textarea
                id="a1-message"
                name="message"
                placeholder="Driveway size, parking lot, last time it was sealed, any cracks or issues."
              />
            </div>

            <button className="a1-btn a1-btn--primary a1-form__submit" type="submit" disabled={submitted}>
              <span>{submitted ? 'Sent — we’ll be in touch' : 'Request estimate'}</span>
              {submitted ? null : <span className="a1-btn__arrow"><ArrowRight width={16} height={16} /></span>}
            </button>

            <p className="a1-form__note">
              Prefer to talk now? <a href={COMPANY.phoneHref} style={{ color: '#fff', borderBottom: '1px solid currentColor' }}>
                <Phone width={12} height={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {COMPANY.phone}
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
