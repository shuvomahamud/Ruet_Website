import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ContentCard } from '@/components/content/ContentCard'
import { EmptyState } from '@/components/content/EmptyState'
import { FilterBar } from '@/components/content/FilterBar'
import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { Pagination } from '@/components/content/Pagination'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Chapter } from '@/payload-types'
import { createPageMetadata } from '@/utilities/metadata'
import {
  getChapterDirectory,
  getChapterRegions,
  getPublishedPageBySlug,
} from '@/utilities/payload-public'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
const valueOf = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined

const chapterImage = (chapter: Chapter) => {
  const image = chapter.heroImage
  if (!image || typeof image === 'number' || !image.url) return undefined
  return { alt: image.alt, height: image.height, url: image.url, width: image.width }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug('chapters')

  return createPageMetadata({
    canonicalPath: '/chapters',
    description: page?.heroDescription,
    seo: page?.seo,
    title: page?.title || 'Chapters',
  })
}

export default async function ChaptersPage({ searchParams }: { searchParams: SearchParams }) {
  const values = await searchParams
  const query = valueOf(values.q)?.trim()
  const region = valueOf(values.region)?.trim()
  const requestedPage = Number(valueOf(values.page) || '1')
  const pageNumber = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const [page, chapters, regions] = await Promise.all([
    getPublishedPageBySlug('chapters'),
    getChapterDirectory({ page: pageNumber, query, region }),
    getChapterRegions(),
  ])

  if (!page) notFound()
  const introSection = page.sections?.[0]
  const additionalSections = page.sections?.slice(1) || []
  const paginationQuery = new URLSearchParams()
  if (query) paginationQuery.set('q', query)
  if (region) paginationQuery.set('region', region)

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
            {introSection ? (
              <SectionHeading
                description={introSection.body}
                eyebrow={introSection.eyebrow || undefined}
                title={introSection.title}
              />
            ) : null}

            <form action="/chapters" method="get">
              <FilterBar label="Search and filter chapters">
                <label>
                  Search
                  <input
                    defaultValue={query}
                    name="q"
                    placeholder="Chapter name or location"
                    type="search"
                  />
                </label>
                <label>
                  State or region
                  <select defaultValue={region || ''} name="region">
                    <option value="">All locations</option>
                    {regions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="filter-bar__actions">
                  <button className="button button--primary" type="submit">
                    Apply filters
                  </button>
                  {query || region ? (
                    <Link className="button button--secondary" href="/chapters">
                      Clear
                    </Link>
                  ) : null}
                </div>
              </FilterBar>
            </form>

            <div className="directory-heading">
              <p>
                <strong>{chapters.totalDocs}</strong> active{' '}
                {chapters.totalDocs === 1 ? 'chapter' : 'chapters'}
              </p>
              <Link href="/chapters/request">Request a new chapter →</Link>
            </div>

            <div className="card-grid">
              {chapters.docs.length ? (
                chapters.docs.map((chapter) => (
                  <ContentCard
                    badge="Active chapter"
                    description={chapter.summary}
                    href={`/chapters/${chapter.slug}`}
                    image={chapterImage(chapter)}
                    key={chapter.id}
                    meta={chapter.regionOrState || 'United States'}
                    title={chapter.name}
                  />
                ))
              ) : (
                <EmptyState
                  actionHref="/chapters"
                  actionLabel="Clear filters"
                  description="Try a broader name or choose a different location."
                  title="No active chapters matched"
                />
              )}
            </div>
            <Pagination
              basePath="/chapters"
              page={chapters.page || pageNumber}
              query={paginationQuery}
              totalPages={chapters.totalPages}
            />
            {additionalSections.length ? <PageSections sections={additionalSections} /> : null}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
