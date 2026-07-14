import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CollectionCard } from '@/components/content/CollectionCard'
import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { createPageMetadata } from '@/utilities/metadata'
import { getPublishedPageBySlug, getUpcomingEvents } from '@/utilities/payload-public'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug('events')

  return createPageMetadata({
    canonicalPath: '/events',
    description: page?.heroDescription,
    seo: page?.seo,
    title: page?.title || 'Events',
  })
}

export default async function EventsPage() {
  const [page, events] = await Promise.all([
    getPublishedPageBySlug('events'),
    getUpcomingEvents(24),
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

            <div className="card-grid">
              {events.length ? (
                events.map((event) => (
                  <CollectionCard
                    description={event.summary}
                    href={`/events/${event.slug}`}
                    key={event.id}
                    meta={`${event.eventMode || 'event'} • ${event.timezone || 'timezone not set'}`}
                    title={event.title}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>No upcoming published events</h3>
                  <p>Create published event records in Payload admin to populate this listing.</p>
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
