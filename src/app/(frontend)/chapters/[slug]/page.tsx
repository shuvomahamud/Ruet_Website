import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { createPageMetadata } from '@/utilities/metadata'
import { getActiveChapterBySlug } from '@/utilities/payload-public'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const chapter = await getActiveChapterBySlug(slug)

  return createPageMetadata({
    canonicalPath: `/chapters/${slug}`,
    description: chapter?.summary,
    title: chapter?.name || 'Chapter',
  })
}

export default async function ChapterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const chapter = await getActiveChapterBySlug(slug)

  if (!chapter) {
    notFound()
  }

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={chapter.summary}
          eyebrow={chapter.regionOrState || 'RUETIAN USA Chapter'}
          title={chapter.name}
        />
        <section className="page-section">
          <Container narrow>
            <div className="content-sections">
              <section className="content-section">
                <h2>Chapter overview</h2>
                <p>{chapter.description || chapter.summary}</p>
              </section>

              <section className="content-section">
                <h2>Operational status</h2>
                <p>
                  Status: <strong>{chapter.chapterStatus}</strong>
                </p>
                {chapter.contactEmail ? <p>Contact: {chapter.contactEmail}</p> : null}
              </section>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
