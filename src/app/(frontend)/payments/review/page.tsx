import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload, type Where } from 'payload'

import { getRole } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { PageHero } from '@/components/content/PageHero'
import {
  PaymentReviewList,
  type ReviewQueuePayment,
} from '@/components/payments/PaymentReviewList'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import type { EventRegistration, Membership, Order, PaymentProof, User } from '@/payload-types'
import { createPageMetadata } from '@/utilities/metadata'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/payments/review',
    description: 'Review authorized chapter and organization-wide Zelle payments.',
    seo: { noIndex: true },
    title: 'Manual Payment Review',
  })
}

const parameter = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined

export default async function PaymentReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/payments/review')
  if (!['chapterAdmin', 'admin', 'superAdmin'].includes(getRole(user) ?? '')) notFound()
  const params = await searchParams
  const type = parameter(params.type) ?? 'all'
  const status = parameter(params.status) ?? 'pending'
  const chapter = parameter(params.chapter)
  const clauses: Where[] = []
  if (['event', 'membership'].includes(type)) clauses.push({ orderTypeSnapshot: { equals: type } })
  if (['pending', 'approved', 'failed'].includes(status)) clauses.push({ status: { equals: status } })
  if (chapter && Number.isSafeInteger(Number(chapter))) {
    clauses.push({ firstReviewerChapter: { equals: Number(chapter) } })
  }

  const payload = await getPayload({ config })
  const [result, chapters] = await Promise.all([
    payload.find({
      collection: 'payments',
      depth: 2,
      limit: 200,
      overrideAccess: false,
      pagination: false,
      sort: 'submittedAt',
      user,
      where: clauses.length ? { and: clauses } : undefined,
    }),
    payload.find({
      collection: 'chapters',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      sort: 'name',
      user,
    }),
  ])
  const payments: ReviewQueuePayment[] = result.docs.map((payment) => {
    const owner = typeof payment.user === 'object' ? (payment.user as User) : undefined
    const proof =
      typeof payment.proofImage === 'object' ? (payment.proofImage as PaymentProof) : undefined
    const order = typeof payment.order === 'object' ? (payment.order as Order) : undefined
    const membership =
      order && typeof order.membership === 'object' ? (order.membership as Membership) : undefined
    const registration =
      order && typeof order.eventRegistration === 'object'
        ? (order.eventRegistration as EventRegistration)
        : undefined
    return {
      amount: payment.amountSnapshot,
      chapter: payment.chapterNameSnapshot || 'Organization-wide',
      currency: payment.currencySnapshot,
      id: payment.id,
      owner:
        [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') ||
        owner?.email ||
        `User #${typeof payment.user === 'number' ? payment.user : payment.user.id}`,
      proofUrl: proof?.url || undefined,
      rejectionReason: payment.rejectionReason || undefined,
      status: payment.status,
      submittedAt: payment.submittedAt,
      target:
        payment.orderTypeSnapshot === 'event'
          ? registration?.eventTitleSnapshot || 'Event registration'
          : membership?.planTitleSnapshot || 'Annual membership',
      transactionId: payment.proofTransactionId || undefined,
      type: payment.orderTypeSnapshot,
    }
  })

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Chapter administrators see only assigned-chapter proofs. Administrators and super administrators see the organization-wide queue."
          eyebrow="Authorized manual review"
          title="Zelle payment review"
        />
        <section className="page-section">
          <Container>
            <form className="filter-bar" method="get">
              <label>
                Transaction type
                <select defaultValue={type} name="type">
                  <option value="all">Membership and events</option>
                  <option value="membership">Membership</option>
                  <option value="event">Events</option>
                </select>
              </label>
              <label>
                Status
                <select defaultValue={status} name="status">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="failed">Rejected / failed</option>
                  <option value="all">All statuses</option>
                </select>
              </label>
              <label>
                Chapter
                <select defaultValue={chapter ?? ''} name="chapter">
                  <option value="">All permitted chapters</option>
                  {chapters.docs.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="filter-bar__actions">
                <button className="button button--primary" type="submit">
                  Apply filters
                </button>
                <Link className="button button--secondary" href="/payments/review">
                  Reset
                </Link>
              </div>
            </form>
            <PaymentReviewList payments={payments} />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
