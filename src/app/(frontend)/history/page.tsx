import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { EmptyState } from '@/components/content/EmptyState'
import { Gallery } from '@/components/content/Gallery'
import { PageHero } from '@/components/content/PageHero'
import { Timeline } from '@/components/content/Timeline'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import type { Media } from '@/payload-types'
import { createPageMetadata } from '@/utilities/metadata'
import { getPublishedHistoryEntries, getPublishedPageBySlug } from '@/utilities/payload-public'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
const valueOf = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined
const mediaRecord = (value: number | Media): Media | null =>
  typeof value === 'number' ? null : value

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug('history')
  return createPageMetadata({
    canonicalPath: '/history',
    description: page?.heroDescription,
    seo: page?.seo,
    title: page?.title || 'Our History',
  })
}

export default async function HistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const values = await searchParams
  const selectedDecade = valueOf(values.decade)
  const [page, entries] = await Promise.all([
    getPublishedPageBySlug('history'),
    getPublishedHistoryEntries(),
  ])
  if (!page) notFound()

  const decades = Array.from(
    new Set(entries.map((entry) => `${Math.floor(entry.startYear / 10) * 10}s`)),
  ).sort()
  const filtered = selectedDecade
    ? entries.filter((entry) => `${Math.floor(entry.startYear / 10) * 10}s` === selectedDecade)
    : entries

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={page.heroDescription}
          eyebrow={page.heroEyebrow}
          title={page.heroTitle}
        />
        <section className="page-section">
          <Container>
            {decades.length > 1 ? (
              <nav aria-label="History archive by decade" className="chip-list history-filters">
                <Link aria-current={!selectedDecade ? 'page' : undefined} href="/history">
                  All years
                </Link>
                {decades.map((decade) => (
                  <Link
                    aria-current={selectedDecade === decade ? 'page' : undefined}
                    href={`/history?decade=${decade}`}
                    key={decade}
                  >
                    {decade}
                  </Link>
                ))}
              </nav>
            ) : null}

            {filtered.length ? (
              <Timeline
                items={filtered.map((entry) => {
                  const images = (entry.images ?? [])
                    .map(mediaRecord)
                    .filter((item): item is Media => Boolean(item?.url))
                    .map((item) => ({
                      alt: item.alt,
                      height: item.height,
                      id: item.id,
                      url: item.url || '',
                      width: item.width,
                    }))
                  const documents = (entry.documents ?? [])
                    .map(mediaRecord)
                    .filter((item): item is Media => Boolean(item?.url))
                  return {
                    content: (
                      <div className="timeline-entry-content">
                        <p>{entry.body || entry.summary}</p>
                        {images.length ? (
                          <Gallery images={images} label={`${entry.title} images`} />
                        ) : null}
                        {documents.length || entry.externalLinks?.length ? (
                          <div className="timeline-entry-links">
                            {documents.map((document) => (
                              <Link href={document.url || '#'} key={document.id}>
                                {document.caption || document.filename || 'View document'}
                              </Link>
                            ))}
                            {(entry.externalLinks ?? []).map((item) => (
                              <Link href={item.href} key={item.id || item.href}>
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ),
                    id: entry.id,
                    label: entry.endYear
                      ? `${entry.startYear}–${entry.endYear}`
                      : String(entry.startYear),
                    title: entry.title,
                  }
                })}
              />
            ) : (
              <EmptyState
                actionHref="/history"
                actionLabel="View all years"
                description="Choose another decade to continue exploring the archive."
                title="No history entries matched"
              />
            )}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
