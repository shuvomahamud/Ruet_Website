import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { getRole } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { PageHero } from '@/components/content/PageHero'
import {
  MembershipPaymentReviewList,
  type ReviewPayment,
} from '@/components/membership/MembershipPaymentReviewList'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import type { PaymentProof, User } from '@/payload-types'
import { createPageMetadata } from '@/utilities/metadata'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/membership/payments/review',
    description: 'Review chapter-scoped pending membership Zelle payments.',
    seo: { noIndex: true },
    title: 'Review Membership Payments',
  })
}

export default async function MembershipPaymentReviewPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/membership/payments/review')
  if (!['chapterAdmin', 'admin', 'superAdmin'].includes(getRole(user) ?? '')) notFound()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'payments',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: 'submittedAt',
    user,
    where: {
      and: [
        { orderTypeSnapshot: { equals: 'membership' } },
        { status: { equals: 'pending' } },
      ],
    },
  })
  const payments: ReviewPayment[] = result.docs.map((payment) => {
    const owner = typeof payment.user === 'object' ? (payment.user as User) : undefined
    const proof =
      typeof payment.proofImage === 'object' ? (payment.proofImage as PaymentProof) : undefined
    return {
      amount: payment.amountSnapshot,
      currency: payment.currencySnapshot,
      id: payment.id,
      member:
        [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') ||
        owner?.email ||
        `Member #${typeof payment.user === 'number' ? payment.user : payment.user.id}`,
      proofUrl: proof?.url || undefined,
      submittedAt: payment.submittedAt,
      transactionId: payment.proofTransactionId || undefined,
    }
  })

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Verify the Zelle evidence and exact order amount. Rejections require a reason and preserve the failed attempt for audit history."
          eyebrow="Chapter-scoped manual review"
          title="Review membership payments"
        />
        <section className="page-section">
          <Container>
            <MembershipPaymentReviewList payments={payments} />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
