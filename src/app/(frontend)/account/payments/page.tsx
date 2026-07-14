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
import type { Order } from '@/payload-types'
import { formatDateTime } from '@/utilities/date-time'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import { humanizeStatus, statusTone } from '@/utilities/status'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/account/payments',
    description: 'View your private immutable Zelle payment-attempt history.',
    seo: { noIndex: true },
    title: 'Payment History',
  })
}

const parameter = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined

export default async function PaymentHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/account/payments')
  const params = await searchParams
  const status = parameter(params.status) ?? 'all'
  const type = parameter(params.type) ?? 'all'
  const from = parameter(params.from)
  const to = parameter(params.to)
  const requestedPage = Number(parameter(params.page) ?? '1')
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const clauses: Where[] = [{ user: { equals: user.id } }]
  if (['pending', 'approved', 'failed'].includes(status)) clauses.push({ status: { equals: status } })
  if (['membership', 'event'].includes(type)) {
    clauses.push({ orderTypeSnapshot: { equals: type } })
  }
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
    clauses.push({ submittedAt: { greater_than_equal: `${from}T00:00:00.000Z` } })
  }
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    clauses.push({ submittedAt: { less_than_equal: `${to}T23:59:59.999Z` } })
  }

  const payload = await getPayload({ config })
  const payments = await payload.find({
    collection: 'payments',
    depth: 1,
    limit: 10,
    overrideAccess: false,
    page,
    sort: '-submittedAt',
    user,
    where: { and: clauses },
  })
  const paginationQuery = new URLSearchParams()
  if (status !== 'all') paginationQuery.set('status', status)
  if (type !== 'all') paginationQuery.set('type', type)
  if (from) paginationQuery.set('from', from)
  if (to) paginationQuery.set('to', to)

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Every Zelle submission remains as an immutable attempt. Approval and rejection decisions are shown separately."
          eyebrow="Private account view"
          title="Payment history"
        />
        <section className="account-navigation-band">
          <Container>
            <AccountNavigation user={user} />
          </Container>
        </section>
        <section className="page-section">
          <Container>
            <form className="filter-bar" method="get">
              <label>
                Purpose
                <select defaultValue={type} name="type">
                  <option value="all">Membership and events</option>
                  <option value="membership">Membership</option>
                  <option value="event">Events</option>
                </select>
              </label>
              <label>
                Zelle status
                <select defaultValue={status} name="status">
                  <option value="all">All statuses</option>
                  <option value="pending">Pending review</option>
                  <option value="approved">Approved</option>
                  <option value="failed">Rejected / failed</option>
                </select>
              </label>
              <label>
                Submitted from
                <input defaultValue={from} name="from" type="date" />
              </label>
              <label>
                Through
                <input defaultValue={to} name="to" type="date" />
              </label>
              <div className="filter-bar__actions">
                <button className="button button--primary" type="submit">
                  Apply filters
                </button>
                <Link className="button button--secondary" href="/account/payments">
                  Reset
                </Link>
              </div>
            </form>

            {payments.docs.length ? (
              <div className="responsive-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Attempt</th>
                      <th scope="col">Purpose</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Submitted</th>
                      <th scope="col">Transaction ID</th>
                      <th scope="col">Status</th>
                      <th scope="col">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.docs.map((payment) => {
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
                          <td>{payment.proofTransactionId || 'Image proof'}</td>
                          <td>
                            <Badge tone={statusTone(payment.status)}>
                              {humanizeStatus(payment.status)}
                            </Badge>
                          </td>
                          <td>
                            {payment.status === 'approved' && payment.approvedAt
                              ? `Approved ${formatDateTime(payment.approvedAt)}`
                              : payment.status === 'failed'
                                ? payment.rejectionReason || 'Proof was rejected.'
                                : 'Awaiting authorized review'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                actionHref="/account/payments"
                actionLabel="Clear filters"
                description="No Zelle payment attempts match the selected filters."
                title="No payment attempts found"
              />
            )}
            <Pagination
              basePath="/account/payments"
              page={payments.page || page}
              query={paginationQuery}
              totalPages={payments.totalPages}
            />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
