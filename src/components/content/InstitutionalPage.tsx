import Link from 'next/link'

import { CTASection } from '@/components/content/CTASection'
import { PageHero } from '@/components/content/PageHero'
import { StatsStrip } from '@/components/content/StatsStrip'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import type { Home, Page } from '@/payload-types'

export const InstitutionalPage = ({ home, page }: { home: Home; page: Page }) => {
  const sections = page.sections ?? []
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={page.heroDescription}
          eyebrow={page.heroEyebrow}
          title={page.heroTitle || page.title}
        />
        <section className="page-section institutional-sections">
          <Container>
            <div className="institutional-grid">
              {sections.map((section, index) => (
                <article
                  className={
                    index === 0
                      ? 'institutional-card institutional-card--lead'
                      : 'institutional-card'
                  }
                  id={section.anchor || undefined}
                  key={section.id ?? `${section.title}-${index}`}
                >
                  {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  {section.ctaHref && section.ctaLabel ? (
                    <Link href={section.ctaHref}>{section.ctaLabel} →</Link>
                  ) : null}
                </article>
              ))}
            </div>
          </Container>
        </section>
        {home.stats?.length ? (
          <StatsStrip
            items={home.stats.map(({ label, value }) => ({ label, value }))}
            label="RUETIAN USA at a glance"
          />
        ) : null}
        <section className="page-section page-section--alt">
          <Container>
            <div className="institutional-link-grid">
              <Link href="/history">
                <span>Our story</span>
                <strong>Explore RUET history</strong>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/committees/running">
                <span>Leadership</span>
                <strong>Meet the current committee</strong>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/chapters">
                <span>Our network</span>
                <strong>Find a chapter</strong>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Container>
        </section>
        <CTASection
          description="Membership, chapters, events, and learning connect alumni across careers and communities."
          eyebrow="Participate"
          primaryHref="/membership"
          primaryLabel="Explore membership"
          secondaryHref="/contact"
          secondaryLabel="Contact us"
          title="Build the alumni network with us"
        />
      </main>
      <SiteFooter />
    </>
  )
}
