type Props = {
  description?: string | null
  eyebrow?: string | null
  title: string
}

export const PageHero = ({ description, eyebrow, title }: Props) => (
  <section className="page-hero">
    <div className="container container--narrow">
      {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p className="page-hero__description">{description}</p> : null}
    </div>
  </section>
)
