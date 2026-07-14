import { notFound } from 'next/navigation'

import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { formatCurrency } from '@/utilities/formatters'
import { getActiveMembershipPlan, getPublishedPageBySlug } from '@/utilities/payload-public'

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

            <div className="membership-highlight">
              <div className="surface-card surface-card--feature">
                <strong className="membership-highlight__price">
                  {plan ? formatCurrency(plan.annualPrice ?? 50, plan.currency || 'USD') : '$50.00'}
                  <span> / year</span>
                </strong>
                {plan?.title ? <h3>{plan.title}</h3> : null}
                {plan?.publicSummary ? <p>{plan.publicSummary}</p> : null}
                {plan?.benefits?.length ? (
                  <ul className="bullet-list">
                    {plan.benefits.map((benefit, index) => (
                      <li key={`${benefit.label}-${index}`}>{benefit.label}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

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
