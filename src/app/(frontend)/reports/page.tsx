import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { getRole } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { AccountNavigation } from '@/components/account/AccountNavigation'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getReportingData, parseReportFilters } from '@/services/reporting'
import { formatDateTime } from '@/utilities/date-time'
import { AppError } from '@/utilities/errors'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import { humanizeStatus, statusTone } from '@/utilities/status'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/reports',
    description: 'Authorized operational membership, payment, event, waitlist, and promotion reports.',
    seo: { noIndex: true },
    title: 'Operational Reports',
  })
}

const parameter = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/reports')
  if (!['chapterAdmin', 'admin', 'superAdmin'].includes(getRole(user) ?? '')) notFound()
  const params = await searchParams
  const query = new URLSearchParams()
  for (const key of ['chapter', 'from', 'to']) {
    const value = parameter(params[key])
    if (value) query.set(key, value)
  }

  const payload = await getPayload({ config })
  let report
  try {
    report = await getReportingData({
      filters: parseReportFilters(new URL(`/reports?${query}`, 'http://local')),
      payload,
      user,
    })
  } catch (error) {
    if (error instanceof AppError) notFound()
    throw error
  }
  const exportHref = `/api/reports/export${query.size ? `?${query}` : ''}`

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Membership, Zelle approval, revenue, registration, capacity, waitlist, renewal, reactivation, and promotion totals from immutable source records."
          eyebrow="Authorized operations"
          title="Operational reports"
        />
        <section className="account-navigation-band">
          <Container>
            <AccountNavigation user={user} />
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <form className="filter-bar report-filter-bar" method="get">
              <label>
                Chapter
                <select defaultValue={report.filters.chapterID ?? ''} name="chapter">
                  <option value="">All permitted chapters</option>
                  {report.chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                From
                <input defaultValue={report.filters.from} name="from" type="date" />
              </label>
              <label>
                Through
                <input defaultValue={report.filters.to} name="to" type="date" />
              </label>
              <div className="filter-bar__actions">
                <button className="button button--primary" type="submit">
                  Apply filters
                </button>
                <Link className="button button--secondary" href="/reports">
                  Reset
                </Link>
              </div>
            </form>
            <div className="report-scope-heading">
              <p>
                Reporting scope: <strong>{report.scopeLabel}</strong>
              </p>
              <a className="button button--secondary" href={exportHref}>
                Export summary CSV
              </a>
            </div>

            <div className="report-stat-grid">
              <article className="surface-card">
                <p className="surface-card__label">Approved Zelle revenue</p>
                <strong>{formatCurrency(report.totals.approvedRevenue, 'USD')}</strong>
              </article>
              <article className="surface-card">
                <p className="surface-card__label">Attendee registrations</p>
                <strong>{report.totals.registrations}</strong>
              </article>
              <article className="surface-card">
                <p className="surface-card__label">Waitlist attendees</p>
                <strong>{report.totals.waitlistEntries}</strong>
              </article>
              <article className="surface-card">
                <p className="surface-card__label">Failed payment attempts</p>
                <strong>{report.totals.failedPayments}</strong>
              </article>
            </div>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              description="Every membership term is counted, including join, annual renewal, and post-expiration reactivation records."
              eyebrow="Membership operations"
              title="Membership state and term outcomes"
            />
            <div className="report-metric-columns">
              <article className="surface-card">
                <h3>Status counts</h3>
                <ul className="report-metric-list">
                  {report.memberships.map((item) => (
                    <li key={item.status}>
                      <Badge tone={statusTone(item.status)}>{humanizeStatus(item.status)}</Badge>
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="surface-card">
                <h3>Term outcomes</h3>
                <ul className="report-metric-list">
                  {report.membershipTermOutcomes.map((item) => (
                    <li key={item.kind}>
                      <span>
                        {humanizeStatus(item.kind)}
                        <small>
                          {item.activeOrGrace} active/grace · {item.pending} pending · {item.failed}{' '}
                          failed · {item.expired} expired
                        </small>
                      </span>
                      <strong>{item.total}</strong>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="surface-card">
                <h3>Manual approval outcomes</h3>
                <ul className="report-metric-list">
                  {report.approvalOutcomes.map((item) => (
                    <li key={item.status}>
                      <Badge tone={statusTone(item.status)}>{humanizeStatus(item.status)}</Badge>
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <SectionHeading
              description="Revenue is recognized only from approved Zelle attempts and grouped by the immutable chapter snapshot."
              eyebrow="Financial reconciliation"
              title="Approved revenue by chapter"
            />
            {report.revenue.length ? (
              <div className="responsive-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Chapter</th>
                      <th scope="col">Membership</th>
                      <th scope="col">Events</th>
                      <th scope="col">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.revenue.map((item) => (
                      <tr key={item.chapter}>
                        <th scope="row">{item.chapter}</th>
                        <td>{formatCurrency(item.membership, 'USD')}</td>
                        <td>{formatCurrency(item.event, 'USD')}</td>
                        <td>{formatCurrency(item.total, 'USD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-inline">No approved Zelle revenue matches these filters.</p>
            )}
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              description="Pending registrations reserve seats. Remaining capacity subtracts both pending and confirmed attendee quantities."
              eyebrow="Event operations"
              title="Registration and capacity report"
            />
            {report.events.length ? (
              <div className="responsive-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Event</th>
                      <th scope="col">Chapter</th>
                      <th scope="col">Starts</th>
                      <th scope="col">Pending</th>
                      <th scope="col">Confirmed</th>
                      <th scope="col">Waitlist</th>
                      <th scope="col">Capacity left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.events.map((item) => (
                      <tr key={`${item.chapter}-${item.event}-${item.startAt}`}>
                        <th scope="row">{item.event}</th>
                        <td>{item.chapter}</td>
                        <td>{formatDateTime(item.startAt)}</td>
                        <td>{item.pending}</td>
                        <td>{item.confirmed}</td>
                        <td>{item.waitlisted}</td>
                        <td>{item.capacity === undefined ? 'Unlimited' : item.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-inline">No events match these filters.</p>
            )}
            <div className="report-metric-columns report-metric-columns--two">
              <article className="surface-card">
                <h3>Registration outcomes</h3>
                <ul className="report-metric-list">
                  {report.eventRegistrations.map((item) => (
                    <li key={item.status}>
                      <span>{humanizeStatus(item.status)}</span>
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="surface-card">
                <h3>Waitlist outcomes</h3>
                <ul className="report-metric-list">
                  {report.waitlistOutcomes.map((item) => (
                    <li key={item.status}>
                      <span>{humanizeStatus(item.status)}</span>
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <SectionHeading eyebrow="Promotion operations" title="Promotion usage" />
            {report.promotions.length ? (
              <div className="responsive-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Code snapshot</th>
                      <th scope="col">Uses</th>
                      <th scope="col">Paid</th>
                      <th scope="col">Pending</th>
                      <th scope="col">Failed / cancelled</th>
                      <th scope="col">Discount</th>
                      <th scope="col">Paid revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.promotions.map((item) => (
                      <tr key={item.code}>
                        <th scope="row">{item.code}</th>
                        <td>{item.uses}</td>
                        <td>{item.paid}</td>
                        <td>{item.pending}</td>
                        <td>{item.failed}</td>
                        <td>{formatCurrency(item.discount, 'USD')}</td>
                        <td>{formatCurrency(item.revenue, 'USD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-inline">No promotion usage matches these filters.</p>
            )}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
