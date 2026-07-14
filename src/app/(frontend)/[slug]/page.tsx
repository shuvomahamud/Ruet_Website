import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContactPage } from '@/components/content/ContactPage'
import { InstitutionalPage } from '@/components/content/InstitutionalPage'
import { LegalPage } from '@/components/content/LegalPage'
import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import type { Media } from '@/payload-types'
import { createPageMetadata } from '@/utilities/metadata'
import { getHomeGlobal, getPublishedPageBySlug, getSiteSettings } from '@/utilities/payload-public'

const legalSlugs = new Set(['privacy-policy', 'terms-of-use', 'membership-terms'])

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPublishedPageBySlug(slug)
  if (!page) return {}
  return createPageMetadata({
    canonicalPath: `/${slug}`,
    description: page.heroDescription || page.summary,
    seo: page.seo as { image?: Media | number | null } | undefined,
    title: page.title,
  })
}

export default async function StandardContentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getPublishedPageBySlug(slug)
  if (!page) notFound()

  if (slug === 'about' || page.pageType === 'institutional') {
    return <InstitutionalPage home={await getHomeGlobal()} page={page} />
  }
  if (slug === 'contact') {
    return <ContactPage page={page} settings={await getSiteSettings()} />
  }
  if (legalSlugs.has(slug) || page.pageType === 'legal') {
    return <LegalPage page={page} />
  }

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={page.heroDescription}
          eyebrow={page.heroEyebrow}
          title={page.heroTitle || page.title}
        />
        <section className="page-section">
          <Container narrow>
            <PageSections sections={page.sections || []} />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
