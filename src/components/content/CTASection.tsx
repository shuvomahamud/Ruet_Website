import Link from 'next/link'

import { Container } from '@/components/ui/Container'

export const CTASection = ({
  description,
  eyebrow,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: {
  description: string
  eyebrow?: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  title: string
}) => (
  <section className="cta-section">
    <Container>
      <div className="cta-section__content">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="cta-section__actions">
          <Link className="button button--primary" href={primaryHref}>
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link className="button button--secondary" href={secondaryHref}>
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </Container>
  </section>
)
