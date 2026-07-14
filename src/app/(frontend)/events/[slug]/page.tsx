import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { formatDateTime } from '@/utilities/date-time'
import { createPageMetadata } from '@/utilities/metadata'
import { getPublishedEventBySlug } from '@/utilities/payload-public'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getPublishedEventBySlug(slug)

  return createPageMetadata({
    canonicalPath: `/events/${slug}`,
    description: event?.summary,
    title: event?.title || 'Event',
  })
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getPublishedEventBySlug(slug)

  if (!event) {
    notFound()
  }

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={event.summary}
          eyebrow={event.eventMode || 'Event'}
          title={event.title}
        />
        <section className="page-section">
          <Container narrow>
            <div className="content-sections">
              <section className="content-section">
                <h2>Event details</h2>
                {event.details ? <p>{event.details}</p> : <p>{event.summary}</p>}
              </section>
              <section className="content-section">
                <h2>Operational fields already modeled</h2>
                <p>
                  Start: {event.startAt ? formatDateTime(event.startAt) : 'Not set'} <br />
                  End: {event.endAt ? formatDateTime(event.endAt) : 'Not set'} <br />
                  Timezone: {event.timezone || 'Not set'} <br />
                  Capacity: {event.capacity ?? 'Not set'} <br />
                  Waitlist enabled: {event.waitlistEnabled ? 'Yes' : 'No'}
                </p>
              </section>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
