import Link from 'next/link'

type Section = {
  body?: string | null
  ctaHref?: string | null
  ctaLabel?: string | null
  eyebrow?: string | null
  id?: string | null
  title?: string | null
}

export const PageSections = ({ sections }: { sections: Section[] }) => {
  if (!sections.length) return null

  return (
    <div className="content-sections">
      {sections.map((section, index) => (
        <section className="content-section" key={section.id ?? `${section.title}-${index}`}>
          {section.eyebrow ? <p className="section-heading__eyebrow">{section.eyebrow}</p> : null}
          {section.title ? <h2>{section.title}</h2> : null}
          {section.body ? <p>{section.body}</p> : null}
          {section.ctaHref && section.ctaLabel ? (
            <Link className="button button--secondary" href={section.ctaHref}>
              {section.ctaLabel}
            </Link>
          ) : null}
        </section>
      ))}
    </div>
  )
}
