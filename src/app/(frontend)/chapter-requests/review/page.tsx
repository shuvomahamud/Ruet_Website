import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { getRole } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { ChapterRequestReviewList } from '@/components/chapters/ChapterRequestReviewList'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { createPageMetadata } from '@/utilities/metadata'

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    canonicalPath: '/chapter-requests/review',
    description: 'Review pending RUETIAN USA chapter proposals.',
    seo: { noIndex: true },
    title: 'Review Chapter Requests',
  })
}

export default async function ChapterRequestReviewPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/chapter-requests/review')
  if (getRole(user) !== 'superAdmin') notFound()
  const payload = await getPayload({ config })
  const requests = await payload.find({
    collection: 'chapterRequests',
    limit: 100,
    overrideAccess: false,
    sort: 'createdAt',
    user,
    where: { status: { equals: 'pending' } },
  })

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description="Approvals create and publish one active chapter atomically. Rejections require a reason."
          eyebrow="Super-admin workflow"
          title="Review chapter requests"
        />
        <section className="page-section">
          <Container>
            <ChapterRequestReviewList requests={requests.docs} />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
