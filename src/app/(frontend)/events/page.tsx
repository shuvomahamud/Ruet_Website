import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { authenticateRequest } from '@/auth/current-user'
import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Chapter } from '@/payload-types'
import { formatDateTime } from '@/utilities/date-time'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import { getEventCatalog, getPublishedPageBySlug } from '@/utilities/payload-public'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const parameter = (params: Record<string, string | string[] | undefined>, key: string) => {
  const value = params[key]
  return typeof value === 'string' ? value : undefined
}

const modeLabel = (mode: string) =>
  mode === 'inPerson' ? 'In person' : mode === 'hybrid' ? 'Hybrid' : 'Virtual'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug('events')
  return createPageMetadata({
    canonicalPath: '/events',
    description: page?.heroDescription,
    seo: page?.seo,
    title: page?.title || 'Events',
  })
}

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const user = await authenticateRequest(await headers())
  const filters = {
    availability: parameter(params, 'availability'),
    chapter: parameter(params, 'chapter'),
    dateFrom: parameter(params, 'from'),
    dateTo: parameter(params, 'to'),
    mode: parameter(params, 'mode'),
    price: parameter(params, 'price'),
    view: parameter(params, 'view') ?? 'upcoming',
  }
  const [page, catalog] = await Promise.all([
    getPublishedPageBySlug('events'),
    getEventCatalog({ ...filters, user: user ?? undefined }),
  ])
  if (!page) notFound()
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
                description={introSection.body}
                eyebrow={introSection.eyebrow || undefined}
                title={introSection.title}
              />
            ) : null}

            <form className="filter-bar" method="get">
              <label>
                View
                <select defaultValue={filters.view} name="view">
                  <option value="upcoming">Upcoming events</option>
                  <option value="archive">Past events and recaps</option>
                </select>
              </label>
              <label>
                From date
                <input defaultValue={filters.dateFrom} name="from" type="date" />
              </label>
              <label>
                Through date
                <input defaultValue={filters.dateTo} name="to" type="date" />
              </label>
              <label>
                Chapter
                <select defaultValue={filters.chapter ?? ''} name="chapter">
                  <option value="">All chapters</option>
                  {catalog.chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.slug}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Mode
                <select defaultValue={filters.mode ?? ''} name="mode">
                  <option value="">All modes</option>
                  <option value="inPerson">In person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>
              <label>
                Price
                <select defaultValue={filters.price ?? ''} name="price">
                  <option value="">Free and paid</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
              {filters.view !== 'archive' ? (
                <label>
                  Availability
                  <select defaultValue={filters.availability ?? ''} name="availability">
                    <option value="">Any availability</option>
                    <option value="available">Seats available</option>
                    <option value="full">Full / waitlist</option>
                  </select>
                </label>
              ) : null}
              <div className="filter-bar__actions">
                <button className="button button--primary" type="submit">
                  Apply filters
                </button>
                <Link className="button button--secondary" href="/events">
                  Reset
                </Link>
              </div>
            </form>

            <div className="event-card-grid">
              {catalog.items.length ? (
                catalog.items.map(({ availability, event }) => {
                  const chapter =
                    typeof event.chapter === 'object' ? (event.chapter as Chapter) : undefined
                  const archived = new Date(event.endAt) < new Date() || event.status === 'archived'
                  return (
                    <article className="surface-card event-card" key={event.id}>
                      <div className="event-card__badges">
                        <Badge>{modeLabel(event.eventMode)}</Badge>
                        <Badge tone={event.isPaid ? 'gold' : 'green'}>
                          {event.isPaid
                            ? formatCurrency(event.basePrice ?? 0, event.currency ?? 'USD')
                            : 'Free'}
                        </Badge>
                        {archived ? (
                          <Badge tone="blue">Archive</Badge>
                        ) : availability.isFull ? (
                          <Badge tone="red">Full</Badge>
                        ) : (
                          <Badge tone="green">Seats available</Badge>
                        )}
                      </div>
                      <p className="event-card__date">
                        {formatDateTime(event.startAt, { timeZone: event.timezone })}
                      </p>
                      <h2>{event.title}</h2>
                      <p>{event.summary}</p>
                      <dl className="event-card__meta">
                        <div>
                          <dt>Chapter</dt>
                          <dd>{chapter?.name ?? 'RUETIAN USA'}</dd>
                        </div>
                        <div>
                          <dt>Timezone</dt>
                          <dd>{event.timezone}</dd>
                        </div>
                        <div>
                          <dt>Capacity</dt>
                          <dd>
                            {archived
                              ? 'Completed'
                              : availability.remainingSeats === null
                                ? 'No fixed limit'
                                : `${availability.remainingSeats} remaining`}
                          </dd>
                        </div>
                      </dl>
                      <Link className="surface-card__link" href={`/events/${event.slug}`}>
                        {archived ? 'View recap' : 'View event and register'}
                      </Link>
                    </article>
                  )
                })
              ) : (
                <article className="surface-card surface-card--empty">
                  <h2>No events match these filters</h2>
                  <p>Change a filter or switch between upcoming events and the archive.</p>
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
