import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { getRole } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { PageHero } from '@/components/content/PageHero'
import { CancelRegistrationButton } from '@/components/events/CancelRegistrationButton'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import type { Event, User } from '@/payload-types'
import { formatDateTime } from '@/utilities/date-time'
import { createPageMetadata } from '@/utilities/metadata'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/events/registrations/manage',
    description: 'Manage authorized chapter event registrations and capacity release.',
    seo: { noIndex: true },
    title: 'Manage Event Registrations',
  })
}

export default async function ManageEventRegistrationsPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/events/registrations/manage')
  if (!['chapterAdmin', 'admin', 'superAdmin'].includes(getRole(user) ?? '')) notFound()
  const payload = await getPayload({ config })
  const registrations = await payload.find({
    collection: 'eventRegistrations',
    depth: 2,
    limit: 300,
    overrideAccess: false,
    pagination: false,
    sort: '-createdAt',
    user,
    where: { status: { in: ['pending', 'confirmed'] } },
  })

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Only assigned chapter records are visible to chapter administrators. Cancellation closes pending attempts, releases capacity, and immediately reprocesses the waitlist."
          eyebrow="Authorized event operations"
          title="Manage event registrations"
        />
        <section className="page-section">
          <Container>
            <div className="membership-actions">
              <Link className="button button--secondary" href="/payments/review?type=event">
                Review event payments
              </Link>
              <Link className="button button--secondary" href="/events">
                Browse events
              </Link>
            </div>
            <div className="review-list">
              {registrations.docs.length ? (
                registrations.docs.map((registration) => {
                  const event =
                    typeof registration.event === 'object'
                      ? (registration.event as Event)
                      : undefined
                  const owner =
                    typeof registration.user === 'object'
                      ? (registration.user as User)
                      : undefined
                  return (
                    <article className="surface-card" key={registration.id}>
                      <p className="eyebrow">Registration #{registration.id}</p>
                      <h2>{registration.eventTitleSnapshot}</h2>
                      <p>
                        {[owner?.firstName, owner?.lastName].filter(Boolean).join(' ') ||
                          owner?.email ||
                          'Registered user'}{' '}
                        · {registration.quantity} attendee
                        {registration.quantity === 1 ? '' : 's'}
                      </p>
                      <p>
                        <Badge tone={registration.status === 'confirmed' ? 'green' : 'gold'}>
                          {registration.status}
                        </Badge>{' '}
                        {registration.paymentStatus ? (
                          <Badge
                            tone={
                              registration.paymentStatus === 'paid'
                                ? 'green'
                                : registration.paymentStatus === 'failed'
                                  ? 'red'
                                  : 'gold'
                            }
                          >
                            Payment {registration.paymentStatus}
                          </Badge>
                        ) : null}
                      </p>
                      <p>
                        Event time:{' '}
                        {formatDateTime(registration.eventStartAtSnapshot, {
                          timeZone: event?.timezone,
                        })}
                      </p>
                      <CancelRegistrationButton registrationID={registration.id} />
                    </article>
                  )
                })
              ) : (
                <p className="empty-inline">There are no active registrations in your scope.</p>
              )}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
