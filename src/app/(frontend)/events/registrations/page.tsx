import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload, type Where } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { AccountNavigation } from '@/components/account/AccountNavigation'
import { EmptyState } from '@/components/content/EmptyState'
import { PageHero } from '@/components/content/PageHero'
import { Pagination } from '@/components/content/Pagination'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import type { Event, Order } from '@/payload-types'
import { formatDateTime } from '@/utilities/date-time'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import { getRelationshipID } from '@/utilities/relationships'
import { humanizeStatus, statusTone } from '@/utilities/status'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/events/registrations',
    description: 'View private event registration, waitlist, order, and payment history.',
    seo: { noIndex: true },
    title: 'Event Registrations',
  })
}

const parameter = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined

export default async function EventRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/events/registrations')
  const params = await searchParams
  const status = parameter(params.status) ?? 'all'
  const timing = parameter(params.timing) ?? 'all'
  const requestedPage = Number(parameter(params.page) ?? '1')
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const requestedWaitlistPage = Number(parameter(params.waitlistPage) ?? '1')
  const waitlistPage =
    Number.isSafeInteger(requestedWaitlistPage) && requestedWaitlistPage > 0
      ? requestedWaitlistPage
      : 1
  const now = new Date().toISOString()
  const clauses: Where[] = [{ user: { equals: user.id } }]
  if (['pending', 'confirmed', 'waitlisted', 'cancelled'].includes(status)) {
    clauses.push({ status: { equals: status } })
  }
  if (timing === 'upcoming') clauses.push({ eventStartAtSnapshot: { greater_than_equal: now } })
  if (timing === 'past') clauses.push({ eventStartAtSnapshot: { less_than: now } })

  const payload = await getPayload({ config })
  const [registrations, waitlist] = await Promise.all([
    payload.find({
      collection: 'eventRegistrations',
      depth: 1,
      limit: 8,
      overrideAccess: false,
      page,
      sort: '-eventStartAtSnapshot',
      user,
      where: { and: clauses },
    }),
    payload.find({
      collection: 'waitlistEntries',
      depth: 1,
      limit: 8,
      overrideAccess: false,
      page: waitlistPage,
      sort: '-joinedAt',
      user,
      where: { user: { equals: user.id } },
    }),
  ])
  const registrationIDs = registrations.docs.map((registration) => registration.id)
  const orders = registrationIDs.length
    ? await payload.find({
        collection: 'orders',
        depth: 0,
        limit: 100,
        overrideAccess: false,
        pagination: false,
        user,
        where: {
          and: [
            { user: { equals: user.id } },
            { eventRegistration: { in: registrationIDs } },
          ],
        },
      })
    : { docs: [] }
  const orderIDs = orders.docs.map((order) => order.id)
  const payments = orderIDs.length
    ? await payload.find({
        collection: 'payments',
        depth: 0,
        limit: 200,
        overrideAccess: false,
        pagination: false,
        sort: '-submittedAt',
        user,
        where: { and: [{ user: { equals: user.id } }, { order: { in: orderIDs } }] },
      })
    : { docs: [] }
  const paginationQuery = new URLSearchParams()
  if (status !== 'all') paginationQuery.set('status', status)
  if (timing !== 'all') paginationQuery.set('timing', timing)
  const waitlistPaginationQuery = new URLSearchParams(paginationQuery)
  if (page > 1) waitlistPaginationQuery.set('page', String(page))

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Registration, capacity reservation, waitlist offers, and every immutable Zelle attempt are shown here."
          eyebrow="Private account view"
          title="Event registrations"
        />
        <section className="account-navigation-band">
          <Container>
            <AccountNavigation user={user} />
          </Container>
        </section>
        <section className="page-section">
          <Container>
            <div className="membership-status-heading">
              <p>Paid tickets remain pending until an authorized reviewer approves the Zelle proof.</p>
              <Link className="button button--primary" href="/events">
                Browse events
              </Link>
            </div>
            <form className="filter-bar history-filter-bar" method="get">
              <label>
                Registration status
                <select defaultValue={status} name="status">
                  <option value="all">All statuses</option>
                  <option value="pending">Pending payment</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="waitlisted">Waitlisted</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label>
                Event timing
                <select defaultValue={timing} name="timing">
                  <option value="all">Upcoming and past</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </label>
              <div className="filter-bar__actions">
                <button className="button button--primary" type="submit">
                  Apply filters
                </button>
                <Link className="button button--secondary" href="/events/registrations">
                  Reset
                </Link>
              </div>
            </form>

            {registrations.docs.length ? (
              <div className="membership-records">
                {registrations.docs.map((registration) => {
                  const event =
                    typeof registration.event === 'object'
                      ? (registration.event as Event)
                      : undefined
                  const order = orders.docs.find(
                    (item) => getRelationshipID(item.eventRegistration) === registration.id,
                  ) as Order | undefined
                  const attempts = order
                    ? payments.docs.filter((item) => getRelationshipID(item.order) === order.id)
                    : []
                  return (
                    <article className="surface-card membership-record" key={registration.id}>
                      <div className="membership-record__heading">
                        <div>
                          <p className="eyebrow">{formatDateTime(registration.eventStartAtSnapshot)}</p>
                          <h2>{registration.eventTitleSnapshot}</h2>
                        </div>
                        <Badge tone={statusTone(registration.status)}>
                          {humanizeStatus(registration.status)}
                        </Badge>
                      </div>
                      <dl className="membership-record__details">
                        <div>
                          <dt>Attendees</dt>
                          <dd>{registration.quantity}</dd>
                        </div>
                        <div>
                          <dt>Chapter snapshot</dt>
                          <dd>{registration.chapterNameSnapshot}</dd>
                        </div>
                        <div>
                          <dt>Registration total</dt>
                          <dd>
                            {formatCurrency(
                              registration.registrationPriceSnapshot - registration.discountSnapshot,
                              registration.currencySnapshot,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Payment</dt>
                          <dd>
                            {registration.paymentStatus ? (
                              <Badge tone={statusTone(registration.paymentStatus)}>
                                {humanizeStatus(registration.paymentStatus)}
                              </Badge>
                            ) : (
                              'Free registration'
                            )}
                          </dd>
                        </div>
                      </dl>
                      {attempts.length ? (
                        <ul className="payment-attempt-list">
                          {attempts.map((payment) => (
                            <li key={payment.id}>
                              Attempt #{payment.id} · {formatDateTime(payment.submittedAt)} ·{' '}
                              <Badge tone={statusTone(payment.status)}>
                                {humanizeStatus(payment.status)}
                              </Badge>
                              {payment.rejectionReason ? ` — ${payment.rejectionReason}` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {event?.slug ? (
                        <Link className="surface-card__link" href={`/events/${event.slug}`}>
                          View event
                        </Link>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                actionHref="/events/registrations"
                actionLabel="Clear filters"
                description="No registrations match the selected status and event timing."
                title="No registrations found"
              />
            )}
            <Pagination
              basePath="/events/registrations"
              page={registrations.page || page}
              query={paginationQuery}
              totalPages={registrations.totalPages}
            />

            <section className="event-history-waitlist">
              <h2>Waitlist history</h2>
              {waitlist.docs.length ? (
                <div className="card-grid card-grid--compact">
                  {waitlist.docs.map((entry) => {
                    const event = typeof entry.event === 'object' ? (entry.event as Event) : undefined
                    return (
                      <article className="surface-card" key={entry.id}>
                        <Badge tone={statusTone(entry.status)}>
                          {humanizeStatus(entry.status)}
                        </Badge>
                        <h3>{event?.title ?? `Event #${getRelationshipID(entry.event)}`}</h3>
                        <p>
                          {entry.quantity} attendee{entry.quantity === 1 ? '' : 's'} · joined{' '}
                          {formatDateTime(entry.joinedAt)}
                        </p>
                        {entry.promotionExpiryAt ? (
                          <p>Offer expires: {formatDateTime(entry.promotionExpiryAt)}</p>
                        ) : null}
                        {event?.slug ? (
                          <Link className="surface-card__link" href={`/events/${event.slug}`}>
                            View event
                          </Link>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="empty-inline">No waitlist history yet.</p>
              )}
              <Pagination
                basePath="/events/registrations"
                page={waitlist.page || waitlistPage}
                pageParam="waitlistPage"
                query={waitlistPaginationQuery}
                totalPages={waitlist.totalPages}
              />
            </section>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
