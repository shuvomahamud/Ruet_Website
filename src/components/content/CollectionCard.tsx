import Link from 'next/link'

type Props = {
  description: string
  href: string
  meta?: string
  title: string
}

export const CollectionCard = ({ description, href, meta, title }: Props) => (
  <article className="surface-card surface-card--interactive">
    {meta ? <p className="surface-card__label">{meta}</p> : null}
    <h3>{title}</h3>
    <p>{description}</p>
    <Link className="surface-card__link" href={href}>
      View details
    </Link>
  </article>
)
