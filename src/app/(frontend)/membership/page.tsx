import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import { getActiveMembershipPlan, getPublishedPageBySlug } from '@/utilities/payload-public'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug('membership')

  return createPageMetadata({
    canonicalPath: '/membership',
    description: page?.heroDescription,
    seo: page?.seo,
    title: page?.title || 'Membership',
  })
}

export default async function MembershipPage() {
  const [page, plan] = await Promise.all([
    getPublishedPageBySlug('membership'),
    getActiveMembershipPlan(),
  ])

  if (!page) {
    notFound()
  }

  const introSection = page.sections?.[0]
  const additionalSections = page.sections?.slice(1) || []

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={page.heroDescription}
          eyebrow={page.heroEyebrow}
          title={page.heroTitle}
        />

        <section className="page-section">
          <Container>
            {introSection ? (
              <SectionHeading
                eyebrow={introSection.eyebrow || undefined}
                title={introSection.title}
                description={introSection.body}
              />
            ) : null}

            {plan ? (
              <div className="membership-overview-grid">
                <div className="surface-card surface-card--feature">
                  <strong className="membership-highlight__price">
                    {formatCurrency(plan.annualPrice, plan.currency)}
                    <span> / year</span>
                  </strong>
                  <h3>{plan.title}</h3>
                  {plan.publicSummary ? <p>{plan.publicSummary}</p> : null}
                  {plan.benefits?.length ? (
                    <ul className="bullet-list">
                      {plan.benefits.map((benefit, index) => (
                        <li key={`${benefit.label}-${index}`}>{benefit.label}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="membership-actions">
                    <Link className="button button--primary" href="/membership/join">
                      Join membership
                    </Link>
                    <Link className="button button--secondary" href="/membership/renew">
                      Renew or reactivate
                    </Link>
                    <Link className="surface-card__link" href="/membership/status">
                      Check my status
                    </Link>
                  </div>
                </div>
                <aside className="surface-card membership-policy-card">
                  <h3>Annual renewal</h3>
                  <p>{plan.renewalPolicy}</p>
                  <h3>Payment and terms</h3>
                  <p>{plan.termsSummary}</p>
                  <p>
                    Zelle is the only payment method. Membership never renews or debits
                    automatically.
                  </p>
                </aside>
              </div>
            ) : (
              <div className="empty-state">
                <h2>Membership enrollment is temporarily unavailable</h2>
                <p>An administrator must publish one active annual plan before checkout opens.</p>
              </div>
            )}

            {plan?.faqs?.length ? (
              <section className="membership-faqs" aria-labelledby="membership-faq-title">
                <h2 id="membership-faq-title">Membership questions</h2>
                {plan.faqs.map((faq, index) => (
                  <details key={`${faq.question}-${index}`}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </section>
            ) : null}

            {additionalSections.length ? (
              <div className="page-section__stack">
                <PageSections sections={additionalSections} />
              </div>
            ) : null}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
