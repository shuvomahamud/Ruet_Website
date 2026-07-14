import { notFound } from 'next/navigation'

import { CollectionCard } from '@/components/content/CollectionCard'
import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getActiveChapters, getPublishedPageBySlug } from '@/utilities/payload-public'

export default async function ChaptersPage() {
  const [page, chapters] = await Promise.all([
    getPublishedPageBySlug('chapters'),
    getActiveChapters(24),
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
        <PageHero description={page.heroDescription} eyebrow={page.heroEyebrow} title={page.heroTitle} />
        <section className="page-section">
          <Container>
            {introSection ? (
              <SectionHeading
                eyebrow={introSection.eyebrow || undefined}
                title={introSection.title}
                description={introSection.body}
              />
            ) : null}

            <div className="card-grid">
              {chapters.length ? (
                chapters.map((chapter) => (
                  <CollectionCard
                    description={chapter.summary}
                    href={`/chapters/${chapter.slug}`}
                    key={chapter.id}
                    meta={chapter.regionOrState || 'RUETIAN USA Chapter'}
                    title={chapter.name}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>No active chapters yet</h3>
                  <p>Add chapter records in Payload admin to populate this listing.</p>
                </article>
              )}
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
