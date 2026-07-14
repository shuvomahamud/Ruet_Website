type Props = {
  eyebrow?: string
  title: string
  description?: string
}

export const SectionHeading = ({ eyebrow, title, description }: Props) => (
  <div className="section-heading">
    {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
    <h2 className="section-heading__title">{title}</h2>
    {description ? <p className="section-heading__description">{description}</p> : null}
  </div>
)
