import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Homepage preview | RUETIAN USA',
}

export default async function HomePreviewPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=%2Fpreview%2Fglobals%2Fhome')
  if (!isAdmin(user)) notFound()

  const payload = await getPayload({ config })
  const home = await payload.findGlobal({
    depth: 1,
    draft: true,
    overrideAccess: false,
    slug: 'home',
    user,
  })

  return (
    <>
      <SiteHeader />
      <main>
        <div className="preview-notice" role="status">
          <Container>
            <strong>Homepage editorial preview</strong>
            <span>This protected view shows the latest saved homepage copy.</span>
          </Container>
        </div>
        <PageHero
          description={home.heroDescription}
          eyebrow={home.heroEyebrow}
          title={home.heroTitle}
        />
        <section className="page-section">
          <Container>
            <div className="card-grid">
              {[
                ['Credibility', home.statsSectionTitle],
                ['Announcements', home.announcementSectionTitle],
                ['Membership', home.membershipSectionTitle],
                ['Events', home.eventsSectionTitle],
                ['Chapters', home.chaptersSectionTitle],
                ['History', home.historySectionTitle],
                ['Committees', home.committeesSectionTitle],
                ['Learning', home.learningSectionTitle],
              ].map(([label, title]) => (
                <article className="surface-card" key={label}>
                  <p className="surface-card__label">{label}</p>
                  <h2>{title}</h2>
                </article>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
