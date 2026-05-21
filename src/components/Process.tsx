type Step = {
  num: string
  title: string
  body: string
  duration: string
}

type Props = {
  index: string
  eyebrow: string
  title: React.ReactNode
  steps: Step[]
}

export function Process({ index, eyebrow, title, steps }: Props) {
  return (
    <section className="process" id="process">
      <div className="container">
        <header className="process__head reveal">
          <span className="process__index">{index}</span>
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="h-lg process__title">{title}</h2>
          </div>
        </header>

        <ol className="process__list">
          {steps.map((s, i) => (
            <li
              key={i}
              className="process__row reveal"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <span className="process__num">{s.num}</span>
              <h3 className="process__rtitle">{s.title}</h3>
              <p className="process__rbody">{s.body}</p>
              <span className="process__dur">{s.duration}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
