type Service = {
  num: string
  title: string
  body: string
  bullets: string[]
}

type Props = {
  index: string
  eyebrow: string
  title: React.ReactNode
  services: Service[]
}

export function Services({ index, eyebrow, title, services }: Props) {
  return (
    <section className="services" id="services">
      <div className="container">
        <header className="services__head reveal">
          <span className="services__index">{index}</span>
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="h-lg services__title">{title}</h2>
          </div>
        </header>

        <div className="services__list">
          {services.map((s, i) => (
            <article
              className="service reveal"
              key={i}
              style={{ transitionDelay: `${(i % 2) * 0.08}s` }}
            >
              <div className="service__top">
                <span className="service__num">{s.num}</span>
                <h3 className="h-md service__title">{s.title}</h3>
              </div>
              <p className="service__body">{s.body}</p>
              <ul className="service__bullets">
                {s.bullets.map((b, j) => (
                  <li key={j}>
                    <span className="service__dot" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
