import { useState } from 'react'
import { FAQ } from '../a1Data'
import { Plus } from './A1Icons'

export function A1Faq() {
  const [open, setOpen] = useState<number>(0)

  return (
    <section className="a1-section a1-faq" id="faq">
      <div className="a1-container">
        <header className="a1-section__head">
          <div className="a1-section__head-title a1-reveal">
            <span className="a1-eyebrow">09 — Common Questions</span>
            <h2 className="a1-h2">Things <em>homeowners</em> and property managers ask.</h2>
          </div>
        </header>

        <div className="a1-faq__list">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <div className="a1-faq__item a1-reveal" key={item.q}>
                <button
                  type="button"
                  className="a1-faq__btn"
                  aria-expanded={isOpen}
                  aria-controls={`faq-body-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{item.q}</span>
                  <span className="a1-faq__chev"><Plus width={22} height={22} /></span>
                </button>
                <div className="a1-faq__body" id={`faq-body-${i}`}>
                  <div className="a1-faq__body-inner">{item.a}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
