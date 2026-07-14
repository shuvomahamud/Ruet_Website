import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { Gallery } from '@/components/content/Gallery'
import { PageHero } from '@/components/content/PageHero'
import { EventRegistrationForm } from '@/components/events/EventRegistrationForm'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import type { Chapter, Media } from '@/payload-types'
import { getEventAvailability, type EventQuote } from '@/services/event-registration'
import { formatDateTime } from '@/utilities/date-time'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import { getPublishedEventBySlug } from '@/utilities/payload-public'
import { getRelationshipID } from '@/utilities/relationships'

export const dynamic = 'force-dynamic'

const modeLabel = (mode: string) =>
  mode === 'inPerson' ? 'In person' : mode === 'hybrid' ? 'Hybrid' : 'Virtual'

const galleryImage = (value: number | Media) => {
  if (typeof value === 'number' || !value.url || value.visibility !== 'public') return null
  return {
    alt: value.alt,
    height: value.height,
    id: value.id,
    url: value.url,
    width: value.width,
  }
}

const statusTone = (status: string): 'blue' | 'gold' | 'green' | 'red' => {
  if (['confirmed', 'accepted', 'paid'].includes(status)) return 'green'
  if (['failed', 'cancelled', 'expired'].includes(status)) return 'red'
  if (['pending', 'waiting', 'promoted'].includes(status)) return 'gold'
  return 'blue'
}

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
    seo: event?.seo,
    title: event?.title || 'Event',
  })
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await authenticateRequest(await headers())
  const event = await getPublishedEventBySlug(slug, user ?? undefined)
  if (!event) notFound()
  const payload = await getPayload({ config })
  const [availability, settings] = await Promise.all([
    getEventAvailability({ event, payload, userID: user?.id }),
    payload.findGlobal({ depth: 0, overrideAccess: false, slug: 'siteSettings', user }),
  ])
  const chapter = typeof event.chapter === 'object' ? (event.chapter as Chapter) : undefined
  const ended = new Date(event.endAt) <= new Date() || event.status === 'archived'
  const registration = availability.userRegistration
  const waitlist = availability.userWaitlistEntry
  const registrationOrder = registration
    ? (
        await payload.find({
          collection: 'orders',
          depth: 0,
          limit: 1,
          overrideAccess: false,
          pagination: false,
          sort: '-createdAt',
          user,
          where: { eventRegistration: { equals: registration.id } },
        })
      ).docs[0]
    : undefined
  const quantity = waitlist?.status === 'promoted' ? waitlist.quantity : 1
  const initialQuote: EventQuote = registrationOrder
    ? {
        currency: registrationOrder.currency,
        discountTotal: registrationOrder.discountTotal ?? 0,
        eventID: event.id,
        eventTitle: event.title,
        promotionCode: registrationOrder.promotionCodeSnapshot ?? undefined,
        promotionID: getRelationshipID(registrationOrder.promotion),
        quantity: registration?.quantity ?? quantity,
        subtotal: registrationOrder.subtotal,
        total: registrationOrder.total,
        unitPrice: registration?.unitPriceSnapshot ?? event.basePrice ?? 0,
      }
    : {
        currency: event.currency ?? 'USD',
        discountTotal: 0,
        eventID: event.id,
        eventTitle: event.title,
        quantity,
        subtotal: (event.isPaid ? (event.basePrice ?? 0) : 0) * quantity,
        total: (event.isPaid ? (event.basePrice ?? 0) : 0) * quantity,
        unitPrice: event.isPaid ? (event.basePrice ?? 0) : 0,
      }
  const images = ended
    ? (event.galleryAfterCompletion ?? [])
        .map(galleryImage)
        .filter((image): image is NonNullable<typeof image> => Boolean(image))
    : []
  const registrationIntent =
    registration?.status === 'pending' && registration.paymentStatus === 'failed'
      ? ('resubmit' as const)
      : waitlist?.status === 'promoted'
        ? ('accept_offer' as const)
        : availability.isFull
          ? ('waitlist' as const)
          : ('register' as const)

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={event.summary}
          eyebrow={`${modeLabel(event.eventMode)} · ${chapter?.name ?? 'RUETIAN USA'}`}
          title={event.title}
        />

        <section className="event-detail-band">
          <Container>
            <div>
              <Badge tone={event.isPaid ? 'gold' : 'green'}>
                {event.isPaid
                  ? formatCurrency(event.basePrice ?? 0, event.currency ?? 'USD')
                  : 'Free event'}
              </Badge>
              <Badge>{event.timezone}</Badge>
              {ended ? (
                <Badge tone="blue">Completed</Badge>
              ) : availability.isFull ? (
                <Badge tone="red">Full — waitlist available</Badge>
              ) : (
                <Badge tone="green">Registration open</Badge>
              )}
            </div>
            <Link href="/events">Back to all events</Link>
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <div className="event-detail-layout">
              <div className="content-sections">
                <section className="content-section">
                  <p className="eyebrow">Event overview</p>
                  <h2>{ended ? 'Event recap' : 'About this event'}</h2>
                  <p>
                    {ended && event.recapSummary
                      ? event.recapSummary
                      : event.details || event.summary}
                  </p>
                </section>

                <section className="content-section">
                  <h2>Schedule and location</h2>
                  <dl className="event-facts">
                    <div>
                      <dt>Starts</dt>
                      <dd>{formatDateTime(event.startAt, { timeZone: event.timezone })}</dd>
                    </div>
                    <div>
                      <dt>Ends</dt>
                      <dd>{formatDateTime(event.endAt, { timeZone: event.timezone })}</dd>
                    </div>
                    <div>
                      <dt>Timezone</dt>
                      <dd>{event.timezone}</dd>
                    </div>
                    <div>
                      <dt>Mode</dt>
                      <dd>{modeLabel(event.eventMode)}</dd>
                    </div>
                    {event.eventMode !== 'virtual' ? (
                      <div>
                        <dt>Venue</dt>
                        <dd>{event.venue || 'Venue details will be announced.'}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>

                {event.eventMode !== 'inPerson' ? (
                  <section className="content-section">
                    <h2>Virtual access</h2>
                    {event.virtualLink ? (
                      <p>
                        <a className="surface-card__link" href={event.virtualLink} rel="noreferrer">
                          Open virtual event access
                        </a>
                      </p>
                    ) : event.virtualAccessVisibility === 'registered' ? (
                      <p>
                        The meeting link is private and appears here only for confirmed registrants
                        and authorized event administrators.
                      </p>
                    ) : (
                      <p>Virtual access details will be published here when ready.</p>
                    )}
                  </section>
                ) : null}

                {ended && images.length ? (
                  <section className="content-section">
                    <h2>Event gallery</h2>
                    <Gallery images={images} label={`${event.title} gallery`} />
                  </section>
                ) : null}
              </div>

              <aside className="event-registration-rail">
                <article className="surface-card event-summary-card">
                  <p className="eyebrow">Registration summary</p>
                  <h2>{ended ? 'This event has ended' : event.title}</h2>
                  <dl>
                    <div>
                      <dt>Price</dt>
                      <dd>
                        {event.isPaid
                          ? formatCurrency(event.basePrice ?? 0, event.currency ?? 'USD')
                          : 'Free'}
                      </dd>
                    </div>
                    <div>
                      <dt>Capacity</dt>
                      <dd>{availability.capacity ?? 'No fixed limit'}</dd>
                    </div>
                    <div>
                      <dt>Seats remaining</dt>
                      <dd>{availability.remainingSeats ?? 'No fixed limit'}</dd>
                    </div>
                    <div>
                      <dt>Max per registration</dt>
                      <dd>{event.maxRegistrationQuantity ?? 1}</dd>
                    </div>
                  </dl>
                  {settings.eventPaymentTerms && event.isPaid ? (
                    <p className="form-help">{settings.eventPaymentTerms}</p>
                  ) : null}
                </article>

                {registration ? (
                  <article className="surface-card event-current-state">
                    <p className="eyebrow">Your registration</p>
                    <h2>{registration.eventTitleSnapshot}</h2>
                    <p>
                      <Badge tone={statusTone(registration.status)}>{registration.status}</Badge>{' '}
                      {registration.paymentStatus ? (
                        <Badge tone={statusTone(registration.paymentStatus)}>
                          Payment {registration.paymentStatus}
                        </Badge>
                      ) : null}
                    </p>
                    <p>
                      {registration.quantity} attendee{registration.quantity === 1 ? '' : 's'} ·{' '}
                      {formatCurrency(
                        registration.registrationPriceSnapshot - registration.discountSnapshot,
                        registration.currencySnapshot,
                      )}
                    </p>
                  </article>
                ) : waitlist ? (
                  <article className="surface-card event-current-state">
                    <p className="eyebrow">Your waitlist status</p>
                    <h2>
                      {waitlist.status === 'promoted' ? 'Seats are available' : 'Waiting for seats'}
                    </h2>
                    <p>
                      <Badge tone={statusTone(waitlist.status)}>{waitlist.status}</Badge> for{' '}
                      {waitlist.quantity} attendee{waitlist.quantity === 1 ? '' : 's'}
                    </p>
                    {waitlist.promotionExpiryAt ? (
                      <p>
                        Accept by{' '}
                        {formatDateTime(waitlist.promotionExpiryAt, { timeZone: event.timezone })}.
                      </p>
                    ) : null}
                  </article>
                ) : null}

                {!ended && availability.registrationOpen ? (
                  !user ? (
                    <div className="empty-state">
                      <h2>Sign in to register</h2>
                      <p>Any active account can register; paid membership is not required.</p>
                      <Link
                        className="button button--primary"
                        href={`/login?returnTo=${encodeURIComponent(`/events/${event.slug}`)}`}
                      >
                        Sign in
                      </Link>
                    </div>
                  ) : registration &&
                    registration.paymentStatus !== 'failed' ? null : waitlist?.status ===
                    'waiting' ? null : (
                    <EventRegistrationForm
                      eventSlug={event.slug}
                      eventTitle={event.title}
                      fixedQuantity={
                        registrationIntent === 'accept_offer' ? waitlist?.quantity : undefined
                      }
                      initialQuote={initialQuote}
                      intent={registrationIntent}
                      isPaid={Boolean(event.isPaid)}
                      manualReviewNote={settings.manualPaymentReviewNote}
                      maxQuantity={event.maxRegistrationQuantity ?? 1}
                      paymentTerms={settings.eventPaymentTerms}
                      zelleInstructions={settings.zelleInstructions}
                      zelleRecipient={settings.zelleRecipient}
                      zelleRecipientName={settings.zelleRecipientName}
                    />
                  )
                ) : !ended ? (
                  <div className="empty-state">
                    <h2>Registration is closed</h2>
                    <p>The event remains visible, but it is outside its registration window.</p>
                  </div>
                ) : null}
              </aside>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
