import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { authenticateRequest } from '@/auth/current-user'
import { AnnouncementFeed } from '@/components/communications/AnnouncementFeed'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { getActiveAnnouncements } from '@/utilities/payload-public'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  description: 'Current RUETIAN USA organization and chapter announcements.',
  title: 'Announcements | RUETIAN USA',
}

export default async function AnnouncementsPage() {
  const user = await authenticateRequest(await headers())
  const announcements = await getActiveAnnouncements({
    limit: 100,
    scope: 'all',
    user: user ?? undefined,
  })
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero hero--compact">
          <Container>
            <p className="eyebrow">Current notices</p>
            <h1>Announcements</h1>
            <p className="hero__lede">
              Public notices are visible to everyone. Signed-in members also see current member
              notices for the organization and their primary chapter.
            </p>
          </Container>
        </section>
        <section className="page-section">
          <Container>
            <AnnouncementFeed
              announcements={announcements}
              emptyMessage="There are no active announcements for your audience."
            />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

