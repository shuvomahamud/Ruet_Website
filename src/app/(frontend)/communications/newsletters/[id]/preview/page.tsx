import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { renderEmailTemplate } from '@/email/templates'
import { env } from '@/utilities/env'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false },
  title: 'Newsletter Preview | RUETIAN USA',
}

export default async function NewsletterPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await authenticateRequest(await headers())
  const { id } = await params
  if (!user) redirect(`/login?returnTo=/communications/newsletters/${id}/preview`)
  if (!isAdmin(user)) redirect('/account/settings')
  const campaignID = Number(id)
  if (!Number.isSafeInteger(campaignID) || campaignID < 1) notFound()

  const payload = await getPayload({ config })
  const campaign = await payload.findByID({
    collection: 'newsletterCampaigns',
    depth: 0,
    id: campaignID,
    overrideAccess: false,
    user,
  })
  const rendered = renderEmailTemplate('newsletter', {
    body: campaign.body,
    subject: campaign.subject,
    title: campaign.title,
    unsubscribeUrl: `${env.NEXT_PUBLIC_SITE_URL}/communications/preferences?source=newsletter`,
  })

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero hero--compact">
          <Container>
            <p className="eyebrow">Administrator preview</p>
            <h1>{campaign.title}</h1>
            <p className="hero__lede">Subject: {rendered.subject}</p>
            <Link className="button button--secondary" href="/communications/newsletters">
              Back to campaigns
            </Link>
          </Container>
        </section>
        <section className="page-section">
          <Container>
            <iframe
              className="newsletter-preview-frame"
              sandbox=""
              srcDoc={rendered.html}
              title={`Email preview: ${campaign.title}`}
            />
            <details className="newsletter-text-preview">
              <summary>Plain-text version</summary>
              <pre>{rendered.text}</pre>
            </details>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

