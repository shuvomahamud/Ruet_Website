import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import type { Event } from '@/payload-types'
import { formatDateTime } from '@/utilities/date-time'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import { getRelationshipID } from '@/utilities/relationships'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/events/registrations',
    description: 'View private event registration, waitlist, order, and payment history.',
    seo: { noIndex: true },
    title: 'Event Registrations',
  })
}

const tone = (status: string): 'blue' | 'gold' | 'green' | 'red' => {
  if (['accepted', 'approved', 'confirmed', 'paid'].includes(status)) return 'green'
  if (['cancelled', 'expired', 'failed'].includes(status)) return 'red'
  if (['pending', 'promoted', 'waiting'].includes(status)) return 'gold'
  return 'blue'
}

export default async function EventRegistrationsPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/events/registrations')
  const payload = await getPayload({ config })
  const [registrations, waitlist, orders, payments] = await Promise.all([
    payload.find({
      collection: 'eventRegistrations',
      depth: 1,
      limit: 200,
      overrideAccess: false,
      pagination: false,
      sort: '-createdAt',
      user,
    }),
    payload.find({
      collection: 'waitlistEntries',
      depth: 1,
      limit: 200,
      overrideAccess: false,
      pagination: false,
      sort: '-joinedAt',
      user,
    }),
    payload.find({
      collection: 'orders',
      depth: 0,
      limit: 200,
      overrideAccess: false,
      pagination: false,
      sort: '-createdAt',
      user,
      where: { orderType: { equals: 'event' } },
    }),
    payload.find({
      collection: 'payments',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      sort: '-submittedAt',
      user,
      where: { orderTypeSnapshot: { equals: 'event' } },
    }),
  ])

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Registration, capacity reservation, waitlist offers, and every immutable Zelle attempt are shown here."
          eyebrow="Private account view"
          title="Event registrations"
        />
        <section className="page-section">
          <Container>
            <div className="membership-status-heading">
              <p>Paid tickets remain pending until an authorized reviewer approves the Zelle proof.</p>
              <div className="membership-actions">
                <Link className="button button--primary" href="/events">
                  Browse events
                </Link>
                <Link className="button button--secondary" href="/account/settings">
                  Account settings
                </Link>
              </div>
            </div>

            {registrations.docs.length ? (
              <div className="membership-records">
                {registrations.docs.map((registration) => {
                  const event =
                    typeof registration.event === 'object'
                      ? (registration.event as Event)
                      : undefined
                  const order = orders.docs.find(
                    (item) => getRelationshipID(item.eventRegistration) === registration.id,
                  )
                  const attempts = order
                    ? payments.docs.filter((item) => getRelationshipID(item.order) === order.id)
                    : []
                  return (
                    <article className="surface-card membership-record" key={registration.id}>
                      <div className="membership-record__heading">
                        <div>
                          <p className="eyebrow">
                            {formatDateTime(registration.eventStartAtSnapshot)}
                          </p>
                          <h2>{registration.eventTitleSnapshot}</h2>
                        </div>
                        <Badge tone={tone(registration.status)}>{registration.status}</Badge>
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
                              registration.registrationPriceSnapshot -
                                registration.discountSnapshot,
                              registration.currencySnapshot,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Payment</dt>
                          <dd>
                            {registration.paymentStatus ? (
                              <Badge tone={tone(registration.paymentStatus)}>
                                {registration.paymentStatus}
                              </Badge>
                            ) : (
                              'Free'
                            )}
                          </dd>
                        </div>
                      </dl>
                      {attempts.length ? (
                        <ul>
                          {attempts.map((payment) => (
                            <li key={payment.id}>
                              Attempt #{payment.id} · {formatDateTime(payment.submittedAt)} ·{' '}
                              <Badge tone={tone(payment.status)}>{payment.status}</Badge>
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
              <div className="empty-state">
                <h2>No event registrations yet</h2>
                <p>Browse upcoming events to create your first free or paid registration.</p>
              </div>
            )}

            {waitlist.docs.length ? (
              <section className="event-history-waitlist">
                <h2>Waitlist history</h2>
                <div className="card-grid card-grid--compact">
                  {waitlist.docs.map((entry) => {
                    const event = typeof entry.event === 'object' ? (entry.event as Event) : undefined
                    return (
                      <article className="surface-card" key={entry.id}>
                        <Badge tone={tone(entry.status)}>{entry.status}</Badge>
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
              </section>
            ) : null}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
