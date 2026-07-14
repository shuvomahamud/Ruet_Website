import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { PageHero } from '@/components/content/PageHero'
import { MembershipCheckoutForm } from '@/components/membership/MembershipCheckoutForm'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { createPageMetadata } from '@/utilities/metadata'
import { getActiveMembershipPlan } from '@/utilities/payload-public'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/membership/renew',
    description: 'Renew, reactivate, or resubmit a RUETIAN USA membership payment.',
    seo: { noIndex: true },
    title: 'Renew Membership',
  })
}

export default async function RenewMembershipPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/membership/renew')
  const payload = await getPayload({ config })
  const [memberships, plan, settings] = await Promise.all([
    payload.find({
      collection: 'memberships',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      sort: '-createdAt',
      user,
    }),
    getActiveMembershipPlan(),
    payload.findGlobal({ depth: 0, overrideAccess: true, slug: 'siteSettings' }),
  ])
  const latest = memberships.docs[0]
  const pendingOrder =
    latest?.status === 'failed_manual_payment'
      ? (
          await payload.find({
            collection: 'orders',
            depth: 0,
            limit: 1,
            overrideAccess: false,
            sort: '-createdAt',
            user,
            where: {
              and: [{ membership: { equals: latest.id } }, { status: { equals: 'pending' } }],
            },
          })
        ).docs[0]
      : undefined
  const intent =
    latest?.status === 'failed_manual_payment'
      ? 'resubmit'
      : latest?.status === 'expired'
        ? 'reactivation'
        : latest && ['active', 'grace_period'].includes(latest.status)
          ? 'renewal'
          : undefined
  const alreadyRenewed =
    latest?.status === 'active' &&
    latest.startedAt &&
    new Date(latest.startedAt).getTime() > new Date(latest.updatedAt).getTime()

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Every annual term requires a new Zelle payment. There is no automatic debit or automatic renewal."
          eyebrow="Membership lifecycle"
          title="Renew or reactivate membership"
        />
        <section className="page-section">
          <Container>
            {user.profileStatus !== 'complete' ? (
              <div className="empty-state">
                <h2>Update your profile first</h2>
                <p>A complete profile and active primary chapter are required.</p>
                <Link className="button button--primary" href="/account/settings">
                  Complete account profile
                </Link>
              </div>
            ) : !latest ? (
              <div className="empty-state">
                <h2>No previous membership found</h2>
                <p>Start with a new annual membership.</p>
                <Link className="button button--primary" href="/membership/join">
                  Join membership
                </Link>
              </div>
            ) : ['pending_payment', 'pending_manual_approval'].includes(latest.status) ? (
              <div className="empty-state">
                <h2>Your payment is already pending</h2>
                <p>An authorized volunteer must review it before another attempt can be created.</p>
                <Link className="button button--primary" href="/membership/status">
                  View current status
                </Link>
              </div>
            ) : alreadyRenewed ? (
              <div className="empty-state">
                <h2>Your next annual term is already approved</h2>
                <p>The future start and expiration dates are available on your status page.</p>
                <Link className="button button--primary" href="/membership/status">
                  View membership dates
                </Link>
              </div>
            ) : intent && (plan || pendingOrder) ? (
              <MembershipCheckoutForm
                initialQuote={
                  intent === 'resubmit' && pendingOrder
                    ? {
                        currency: pendingOrder.currency,
                        discountTotal: pendingOrder.discountTotal ?? 0,
                        planTitle: latest.planTitleSnapshot,
                        subtotal: pendingOrder.subtotal,
                        total: pendingOrder.total,
                      }
                    : {
                        currency: plan!.currency,
                        discountTotal: 0,
                        planTitle: plan!.title,
                        subtotal: plan!.annualPrice,
                        total: plan!.annualPrice,
                      }
                }
                intent={intent}
                manualReviewNote={settings.manualPaymentReviewNote}
                noRefundNotice={settings.noRefundNotice}
                zelleInstructions={settings.zelleInstructions}
                zelleRecipient={settings.zelleRecipient}
                zelleRecipientName={settings.zelleRecipientName}
              />
            ) : (
              <div className="empty-state">
                <h2>This membership cannot be renewed online</h2>
                <p>
                  Its status is {latest.status.replaceAll('_', ' ')} or the required plan/order is
                  unavailable. Contact an administrator for review.
                </p>
                <Link className="button button--secondary" href="/contact">
                  Contact RUETIAN USA
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
