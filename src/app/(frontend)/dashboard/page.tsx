import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { AccountNavigation } from '@/components/account/AccountNavigation'
import { AnnouncementFeed } from '@/components/communications/AnnouncementFeed'
import { EmptyState } from '@/components/content/EmptyState'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Event, Order } from '@/payload-types'
import {
  getMemberDashboardData,
  getMembershipDashboardAction,
} from '@/services/member-dashboard'
import { formatDateTime } from '@/utilities/date-time'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import { getRelationshipID } from '@/utilities/relationships'
import { humanizeStatus, statusTone } from '@/utilities/status'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/dashboard',
    description: 'View your RUETIAN USA membership, chapter, events, announcements, and payments.',
    seo: { noIndex: true },
    title: 'Member Dashboard',
  })
}

const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(
        new Date(value),
      )
    : 'Not set'

export default async function DashboardPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/dashboard')
  const payload = await getPayload({ config })
  const data = await getMemberDashboardData({ payload, user })
  const membershipAction = getMembershipDashboardAction(data.membership)

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Your membership, chapter, registrations, payments, and current notices in one private account view."
          eyebrow="Member home"
          title={`Welcome${user.firstName ? `, ${user.firstName}` : ''}`}
        />
        <section className="account-navigation-band">
          <Container>
            <AccountNavigation user={user} />
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <div className="dashboard-overview-grid">
              <article className="surface-card dashboard-membership-card">
                <p className="surface-card__label">Membership</p>
                <div className="dashboard-card-heading">
                  <h2>{data.membership?.planTitleSnapshot ?? 'No membership yet'}</h2>
                  {data.membership ? (
                    <Badge tone={statusTone(data.membership.status)}>
                      {humanizeStatus(data.membership.status)}
                    </Badge>
                  ) : null}
                </div>
                {data.membership ? (
                  <dl className="dashboard-facts">
                    <div>
                      <dt>Term expires</dt>
                      <dd>{date(data.membership.expiresAt)}</dd>
                    </div>
                    <div>
                      <dt>Term type</dt>
                      <dd>{humanizeStatus(data.membership.membershipKind)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p>Join the annual plan to activate member status after Zelle approval.</p>
                )}
                <div className="dashboard-card-actions">
                  <Link className="button button--primary" href={membershipAction.href}>
                    {membershipAction.label}
                  </Link>
                  <Link className="button button--secondary" href="/membership/status">
                    Full membership history
                  </Link>
                </div>
              </article>

              <article className="surface-card dashboard-chapter-card">
                <p className="surface-card__label">Primary chapter</p>
                <h2>{data.chapter?.name ?? 'No chapter selected'}</h2>
                <p>
                  {data.chapter?.summary ??
                    'Choose an active primary chapter in profile settings to receive local notices.'}
                </p>
                <div className="dashboard-card-actions">
                  {data.chapter?.slug ? (
                    <Link className="button button--secondary" href={`/chapters/${data.chapter.slug}`}>
                      Visit chapter
                    </Link>
                  ) : null}
                  <Link href="/account/settings">Update profile</Link>
                </div>
              </article>
            </div>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              description="Pending paid registrations reserve capacity while Zelle evidence is reviewed."
              eyebrow="Your schedule"
              title="Upcoming registrations"
            />
            {data.registrations.length ? (
              <div className="card-grid card-grid--compact">
                {data.registrations.map((registration) => {
                  const event = typeof registration.event === 'object' ? (registration.event as Event) : undefined
                  return (
                    <article className="surface-card" key={registration.id}>
                      <Badge tone={statusTone(registration.status)}>
                        {humanizeStatus(registration.status)}
                      </Badge>
                      <h3>{registration.eventTitleSnapshot}</h3>
                      <p>{formatDateTime(registration.eventStartAtSnapshot)}</p>
                      <p>
                        {registration.quantity} attendee{registration.quantity === 1 ? '' : 's'} ·{' '}
                        {formatCurrency(
                          registration.registrationPriceSnapshot - registration.discountSnapshot,
                          registration.currencySnapshot,
                        )}
                      </p>
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
                actionHref="/events"
                actionLabel="Browse events"
                description="Confirmed and pending future registrations will appear here."
                title="No upcoming registrations"
              />
            )}
            {data.waitlist.length ? (
              <div className="dashboard-waitlist-summary">
                <h3>Active waitlist entries</h3>
                <ul>
                  {data.waitlist.map((entry) => {
                    const event = typeof entry.event === 'object' ? (entry.event as Event) : undefined
                    return (
                      <li key={entry.id}>
                        <span>{event?.title ?? `Event #${getRelationshipID(entry.event)}`}</span>
                        <Badge tone={statusTone(entry.status)}>{humanizeStatus(entry.status)}</Badge>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <SectionHeading eyebrow="Account activity" title="Recent Zelle payment attempts" />
            {data.payments.length ? (
              <div className="responsive-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Attempt</th>
                      <th scope="col">Purpose</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Submitted</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((payment) => {
                      const order = typeof payment.order === 'object' ? (payment.order as Order) : undefined
                      return (
                        <tr key={payment.id}>
                          <th scope="row">#{payment.id}</th>
                          <td>
                            {humanizeStatus(payment.orderTypeSnapshot)}
                            {order?.promotionCodeSnapshot ? ` · ${order.promotionCodeSnapshot}` : ''}
                          </td>
                          <td>{formatCurrency(payment.amountSnapshot, payment.currencySnapshot)}</td>
                          <td>{formatDateTime(payment.submittedAt)}</td>
                          <td>
                            <Badge tone={statusTone(payment.status)}>
                              {humanizeStatus(payment.status)}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-inline">No Zelle payment attempts have been submitted.</p>
            )}
            <Link className="surface-card__link" href="/account/payments">
              View complete payment history
            </Link>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading eyebrow="Current notices" title="Announcements for you" />
            <AnnouncementFeed
              announcements={data.announcements}
              emptyMessage="There are no active organization or chapter notices for you."
            />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

