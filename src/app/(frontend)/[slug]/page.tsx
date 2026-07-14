import { notFound } from 'next/navigation'

import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { getPublishedPageBySlug } from '@/utilities/payload-public'

export default async function StandardContentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getPublishedPageBySlug(slug)

  if (!page) {
    notFound()
  }

  const title = page.heroTitle || page.title
  const description = page.heroDescription
  const eyebrow = page.heroEyebrow
  const sections = (page.sections as never[] | undefined) || []

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero description={description} eyebrow={eyebrow} title={title} />
        <section className="page-section">
          <Container narrow>
            <PageSections sections={sections} />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
