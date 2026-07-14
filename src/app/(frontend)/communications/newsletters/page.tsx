import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createLocalReq, getPayload } from 'payload'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { NewsletterCampaignActions } from '@/components/communications/NewsletterCampaignActions'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { getNewsletterDeliverySummary } from '@/services/newsletter-campaigns'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false },
  title: 'Newsletter Operations | RUETIAN USA',
}

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Not set'

export default async function NewsletterOperationsPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/communications/newsletters')
  if (!isAdmin(user)) redirect('/account/settings')

  const payload = await getPayload({ config })
  const req = await createLocalReq({ user }, payload)
  const result = await payload.find({
    collection: 'newsletterCampaigns',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: '-createdAt',
    user,
  })
  const campaigns = await Promise.all(
    result.docs.map(async (campaign) => ({
      campaign,
      deliveries: await getNewsletterDeliverySummary(req, campaign.id),
    })),
  )

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero hero--compact">
          <Container>
            <p className="eyebrow">Administrator operations</p>
            <h1>Newsletter campaigns</h1>
            <p className="hero__lede">
              Author content in Payload, preview the exact email, then schedule, cancel, send, or
              retry through this audited workflow.
            </p>
            <div className="hero__actions">
              <Link
                className="button button--primary"
                href="/admin/collections/newsletterCampaigns/create"
              >
                Create campaign in Payload
              </Link>
              <Link className="button button--secondary" href="/admin/collections/emailDeliveries">
                Inspect delivery audits
              </Link>
            </div>
          </Container>
        </section>
        <section className="page-section">
          <Container>
            <div className="newsletter-campaign-list">
              {campaigns.length ? (
                campaigns.map(({ campaign, deliveries }) => (
                  <article className="surface-card newsletter-campaign-card" key={campaign.id}>
                    <div className="newsletter-campaign-card__heading">
                      <div>
                        <p className="surface-card__label">Campaign #{campaign.id}</p>
                        <h2>{campaign.title}</h2>
                      </div>
                      <Badge
                        tone={
                          campaign.status === 'sent'
                            ? 'green'
                            : campaign.status === 'failed'
                              ? 'red'
                              : campaign.status === 'scheduled'
                                ? 'gold'
                                : 'blue'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <p>{campaign.summary || campaign.subject}</p>
                    <dl className="newsletter-campaign-card__facts">
                      <div>
                        <dt>Audience</dt>
                        <dd>{campaign.audience}</dd>
                      </div>
                      <div>
                        <dt>Scheduled</dt>
                        <dd>{formatDate(campaign.scheduledAt)}</dd>
                      </div>
                      <div>
                        <dt>Sent</dt>
                        <dd>{formatDate(campaign.sentAt)}</dd>
                      </div>
                      <div>
                        <dt>Selected</dt>
                        <dd>{campaign.recipientCount ?? 0}</dd>
                      </div>
                      <div>
                        <dt>Queued / suppressed</dt>
                        <dd>
                          {campaign.queuedCount ?? 0} / {campaign.suppressedCount ?? 0}
                        </dd>
                      </div>
                      <div>
                        <dt>Delivery sent / failed</dt>
                        <dd>
                          {deliveries.sent} / {deliveries.failed}
                        </dd>
                      </div>
                    </dl>
                    {campaign.sendError ? (
                      <p className="form-message form-message--error">{campaign.sendError}</p>
                    ) : null}
                    <div className="newsletter-campaign-card__links">
                      <Link href={`/communications/newsletters/${campaign.id}/preview`}>
                        Preview email
                      </Link>
                      {campaign.status === 'draft' ? (
                        <Link href={`/admin/collections/newsletterCampaigns/${campaign.id}`}>
                          Edit draft in Payload
                        </Link>
                      ) : null}
                    </div>
                    <NewsletterCampaignActions campaign={campaign} />
                  </article>
                ))
              ) : (
                <article className="empty-state">
                  <span aria-hidden="true">✉</span>
                  <h2>No newsletter campaigns yet</h2>
                  <p>Create a draft in Payload to begin the preview and scheduling workflow.</p>
                </article>
              )}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

