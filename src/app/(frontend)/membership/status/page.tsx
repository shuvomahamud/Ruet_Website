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
import { createPageMetadata } from '@/utilities/metadata'
import { formatCurrency } from '@/utilities/formatters'
import { getRelationshipID } from '@/utilities/relationships'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/membership/status',
    description: 'View your private RUETIAN USA membership and payment history.',
    seo: { noIndex: true },
    title: 'Membership Status',
  })
}

const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(
        new Date(value),
      )
    : 'Not set'

const tone = (status: string): 'blue' | 'gold' | 'green' | 'red' => {
  if (['active', 'approved', 'paid'].includes(status)) return 'green'
  if (['failed', 'failed_manual_payment', 'expired', 'cancelled_by_admin'].includes(status)) {
    return 'red'
  }
  if (['pending', 'pending_payment', 'pending_manual_approval', 'grace_period'].includes(status)) {
    return 'gold'
  }
  return 'blue'
}

export default async function MembershipStatusPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/membership/status')
  const payload = await getPayload({ config })
  const [memberships, orders, payments] = await Promise.all([
    payload.find({
      collection: 'memberships',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: '-createdAt',
      user,
    }),
    payload.find({
      collection: 'orders',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: '-createdAt',
      user,
      where: { orderType: { equals: 'membership' } },
    }),
    payload.find({
      collection: 'payments',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: '-submittedAt',
      user,
      where: { orderTypeSnapshot: { equals: 'membership' } },
    }),
  ])

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Payment attempts remain immutable. Approval, rejection, annual dates, grace periods, and expiration are shown here."
          eyebrow="Private account view"
          title="Membership status"
        />
        <section className="page-section">
          <Container>
            <div className="membership-status-heading">
              <p>
                Membership is never activated before Zelle approval and is never charged
                automatically.
              </p>
              <div className="membership-actions">
                <Link className="button button--primary" href="/membership/renew">
                  Renew, reactivate, or resubmit
                </Link>
                <Link className="button button--secondary" href="/account/settings">
                  Account settings
                </Link>
              </div>
            </div>

            {memberships.docs.length ? (
              <div className="membership-records">
                {memberships.docs.map((membership) => {
                  const order = orders.docs.find(
                    (item) => getRelationshipID(item.membership) === membership.id,
                  )
                  const attempts = order
                    ? payments.docs.filter(
                        (payment) => getRelationshipID(payment.order) === order.id,
                      )
                    : []
                  return (
                    <article className="surface-card membership-record" key={membership.id}>
                      <div className="membership-record__heading">
                        <div>
                          <p className="eyebrow">{membership.membershipKind} term</p>
                          <h2>{membership.planTitleSnapshot}</h2>
                        </div>
                        <Badge tone={tone(membership.status)}>
                          {membership.status.replaceAll('_', ' ')}
                        </Badge>
                      </div>
                      <dl className="membership-record__details">
                        <div>
                          <dt>Plan price snapshot</dt>
                          <dd>
                            {formatCurrency(
                              membership.planPriceSnapshot,
                              membership.currencySnapshot,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Term starts</dt>
                          <dd>{date(membership.startedAt)}</dd>
                        </div>
                        <div>
                          <dt>Term expires</dt>
                          <dd>{date(membership.expiresAt)}</dd>
                        </div>
                        <div>
                          <dt>Grace ends</dt>
                          <dd>{date(membership.graceEndsAt)}</dd>
                        </div>
                      </dl>
                      {order ? (
                        <div className="membership-order-summary">
                          <p>
                            Order #{order.id}: {formatCurrency(order.total, order.currency)} ·{' '}
                            <Badge tone={tone(order.status)}>{order.status}</Badge>
                          </p>
                          {attempts.length ? (
                            <ul>
                              {attempts.map((payment) => (
                                <li key={payment.id}>
                                  Attempt #{payment.id} · {date(payment.submittedAt)} ·{' '}
                                  <Badge tone={tone(payment.status)}>{payment.status}</Badge>
                                  {payment.rejectionReason ? (
                                    <span> — {payment.rejectionReason}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <h2>No membership record yet</h2>
                <p>Join the annual plan to create your first membership and payment record.</p>
                <Link className="button button--primary" href="/membership/join">
                  Join membership
                </Link>
              </div>
            )}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
