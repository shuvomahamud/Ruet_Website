import type { ReactNode } from 'react'

export const Timeline = ({
  items,
}: {
  items: Array<{ content: ReactNode; id: number | string; label: string; title: string }>
}) => (
  <ol className="timeline">
    {items.map((item) => (
      <li key={item.id}>
        <div className="timeline__marker" aria-hidden="true" />
        <div className="timeline__card">
          <p>{item.label}</p>
          <h3>{item.title}</h3>
          {item.content}
        </div>
      </li>
    ))}
  </ol>
)
