type Props = {
  items: string[]
}

export function Marquee({ items }: Props) {
  const doubled = [...items, ...items]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {doubled.map((it, i) => (
          <span className="marquee__item" key={i}>
            <span>{it}</span>
            <span className="marquee__dot">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
