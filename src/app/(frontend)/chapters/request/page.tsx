import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { ChapterRequestForm } from '@/components/chapters/ChapterRequestForm'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { createPageMetadata } from '@/utilities/metadata'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/chapters/request',
    description: 'Propose a regional RUETIAN USA chapter for review by the national organization.',
    seo: { noIndex: true },
    title: 'Request a Chapter',
  })
}

export default async function ChapterRequestPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/chapters/request')
  const payload = await getPayload({ config })
  const requests = await payload.find({
    collection: 'chapterRequests',
    limit: 20,
    overrideAccess: false,
    sort: '-createdAt',
    user,
  })

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Tell us where alumni are organizing. A super administrator reviews every proposal before a public chapter is created."
          eyebrow="Chapter network"
          title="Request a new chapter"
        />
        <section className="page-section">
          <Container>
            <div className="chapter-request-layout">
              <div>
                <h2>Propose your local chapter</h2>
                <p>The proposed chapter name is the only required organizational detail.</p>
                <ChapterRequestForm />
              </div>
              <aside>
                <h2>Your requests</h2>
                {requests.docs.length ? (
                  <ul className="request-status-list">
                    {requests.docs.map((item) => (
                      <li key={item.id}>
                        <div>
                          <strong>{item.requestedName}</strong>
                          {item.requestedRegion ? <span>{item.requestedRegion}</span> : null}
                        </div>
                        <Badge
                          tone={
                            item.status === 'approved'
                              ? 'green'
                              : item.status === 'rejected'
                                ? 'red'
                                : 'gold'
                          }
                        >
                          {item.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>You have not submitted a chapter request.</p>
                )}
              </aside>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
