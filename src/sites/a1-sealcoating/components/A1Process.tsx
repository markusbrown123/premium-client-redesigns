import { PROCESS_STEPS } from '../a1Data'

export function A1Process() {
  return (
    <section className="a1-section a1-process" id="process">
      <div className="a1-container">
        <header className="a1-section__head">
          <div className="a1-section__head-title a1-reveal">
            <span className="a1-eyebrow">06 — How we work</span>
            <h2 className="a1-h2">From <em>walk-through</em> to caution tape.</h2>
          </div>
          <p className="a1-section__head-meta a1-lede a1-reveal">
            Five clear steps. No surprises, no high-pressure sales pitch, no rushed prep work.
          </p>
        </header>
        <div className="a1-process__grid">
          {PROCESS_STEPS.map((s, i) => (
            <article className="a1-process__step a1-reveal" key={s.n} style={{ ['--i' as never]: i }}>
              <span className="a1-process__num">{s.n}</span>
              <h3 className="a1-process__title">{s.title}</h3>
              <p className="a1-process__body">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
