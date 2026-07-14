import Link from 'next/link'

import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import type { Page } from '@/payload-types'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const LegalPage = ({ page }: { page: Page }) => {
  const sections = (page.sections ?? []).map((section) => ({
    ...section,
    anchor: section.anchor || slugify(section.title),
  }))
  const reviewed = page.lastReviewedAt || page.publishedAt

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={page.heroDescription}
          eyebrow={page.heroEyebrow || 'Legal'}
          title={page.heroTitle || page.title}
        />
        <section className="legal-status-band">
          <Container narrow>
            <Badge tone={page.legalStatus === 'approved' ? 'green' : 'gold'}>
              {page.legalStatus === 'approved'
                ? 'Approved policy'
                : 'Placeholder — legal approval pending'}
            </Badge>
            {reviewed ? (
              <span>
                Last updated{' '}
                {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(reviewed))}
              </span>
            ) : null}
          </Container>
        </section>
        <section className="page-section">
          <Container narrow>
            {sections.length > 1 ? (
              <nav aria-label="On this page" className="legal-toc">
                <h2>On this page</h2>
                <ol>
                  {sections.map((section) => (
                    <li key={section.anchor}>
                      <Link href={`#${section.anchor}`}>{section.title}</Link>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
            <div className="legal-content">
              <PageSections sections={sections} />
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
