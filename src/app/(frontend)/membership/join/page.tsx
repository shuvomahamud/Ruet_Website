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
    canonicalPath: '/membership/join',
    description: 'Join RUETIAN USA with one annual Zelle payment and manual approval.',
    seo: { noIndex: true },
    title: 'Join Membership',
  })
}

export default async function JoinMembershipPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/membership/join')
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

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Complete your alumni profile, send the exact annual total through Zelle, and submit proof for manual review."
          eyebrow="Annual membership"
          title="Join RUETIAN USA"
        />
        <section className="page-section">
          <Container>
            {user.profileStatus !== 'complete' ? (
              <div className="empty-state">
                <h2>Complete your profile first</h2>
                <p>
                  Your department, graduation year, contact details, location, and active primary
                  chapter are required before membership checkout.
                </p>
                <Link className="button button--primary" href="/account/settings">
                  Complete account profile
                </Link>
              </div>
            ) : latest ? (
              <div className="empty-state">
                <h2>You already have a membership record</h2>
                <p>
                  Its current status is <strong>{latest.status.replaceAll('_', ' ')}</strong>. Use
                  renewal, reactivation, or resubmission so your history stays intact.
                </p>
                <Link className="button button--primary" href="/membership/renew">
                  Continue with existing membership
                </Link>
              </div>
            ) : plan ? (
              <MembershipCheckoutForm
                initialQuote={{
                  currency: plan.currency,
                  discountTotal: 0,
                  planTitle: plan.title,
                  subtotal: plan.annualPrice,
                  total: plan.annualPrice,
                }}
                intent="join"
                manualReviewNote={settings.manualPaymentReviewNote}
                noRefundNotice={settings.noRefundNotice}
                zelleInstructions={settings.zelleInstructions}
                zelleRecipient={settings.zelleRecipient}
                zelleRecipientName={settings.zelleRecipientName}
              />
            ) : (
              <div className="empty-state">
                <h2>Membership enrollment is temporarily unavailable</h2>
                <p>No active annual membership plan is configured.</p>
              </div>
            )}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
