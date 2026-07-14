import Link from 'next/link'

type Props = {
  action?: {
    href: string
    label: string
  }
  eyebrow?: string
  title: string
  description?: string
}

export const SectionHeading = ({ action, eyebrow, title, description }: Props) => (
  <div className="section-heading">
    {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
    <h2 className="section-heading__title">{title}</h2>
    {description ? <p className="section-heading__description">{description}</p> : null}
    {action ? (
      <Link className="section-heading__action" href={action.href}>
        {action.label}
      </Link>
    ) : null}
  </div>
)
