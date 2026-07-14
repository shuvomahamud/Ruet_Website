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
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Media, Post } from '@/payload-types'
import { createPageMetadata } from '@/utilities/metadata'
import {
  getLearningCategories,
  getLearningPosts,
  getPublishedPageBySlug,
} from '@/utilities/payload-public'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const valueOf = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined

const postImage = (post: Post) => {
  const image = post.featuredImage
  if (!image || typeof image === 'number' || !image.url) return undefined
  return {
    alt: image.alt,
    height: image.height,
    url: image.url,
    width: image.width,
  }
}

const postMeta = (post: Post) => {
  const published = post.publishedAt
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(post.publishedAt))
    : 'RUETIAN USA'
  return [published, post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : null]
    .filter(Boolean)
    .join(' · ')
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug('learning')
  return createPageMetadata({
    canonicalPath: '/learning',
    description: page?.heroDescription,
    seo: page?.seo as { image?: Media | number | null } | undefined,
    title: page?.title || 'Learning & Development',
  })
}

export default async function LearningPage({ searchParams }: { searchParams: SearchParams }) {
  const values = await searchParams
  const category = valueOf(values.category)
  const contentType = valueOf(values.type)
  const query = valueOf(values.q)?.trim()
  const requestedPage = Number(valueOf(values.page) || '1')
  const pageNumber = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const [page, categories, posts] = await Promise.all([
    getPublishedPageBySlug('learning'),
    getLearningCategories(),
    getLearningPosts({ category, contentType, page: pageNumber, query }),
  ])

  if (!page) notFound()

  const introSection = page.sections?.[0]
  const additionalSections = page.sections?.slice(1) || []
  const paginationQuery = new URLSearchParams()
  if (query) paginationQuery.set('q', query)
  if (category) paginationQuery.set('category', category)
  if (contentType) paginationQuery.set('type', contentType)

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
                eyebrow={introSection.eyebrow || undefined}
                title={introSection.title}
                description={introSection.body}
              />
            ) : null}

            <div aria-label="Learning categories" className="chip-list">
              <Link aria-current={!category ? 'page' : undefined} href="/learning">
                All
              </Link>
              {categories.map((item) => (
                <Link
                  aria-current={category === item.slug ? 'page' : undefined}
                  href={`/learning?category=${encodeURIComponent(item.slug)}`}
                  key={item.id}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            <form action="/learning" method="get">
              <FilterBar label="Search and filter learning content">
                <label>
                  Search
                  <input
                    defaultValue={query}
                    name="q"
                    placeholder="Search articles and resources"
                    type="search"
                  />
                </label>
                <label>
                  Category
                  <select defaultValue={category || ''} name="category">
                    <option value="">All categories</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.slug}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Content type
                  <select defaultValue={contentType || ''} name="type">
                    <option value="">All types</option>
                    <option value="article">Articles</option>
                    <option value="resource">Resources</option>
                    <option value="news">News</option>
                  </select>
                </label>
                <div className="filter-bar__actions">
                  <button className="button button--primary" type="submit">
                    Apply filters
                  </button>
                  {query || category || contentType ? (
                    <Link className="button button--secondary" href="/learning">
                      Clear
                    </Link>
                  ) : null}
                </div>
              </FilterBar>
            </form>

            <div className="learning-results__heading">
              <p>
                <strong>{posts.totalDocs}</strong> {posts.totalDocs === 1 ? 'result' : 'results'}
              </p>
              {query ? <Badge>Search: {query}</Badge> : null}
            </div>

            <div className="card-grid learning-grid">
              {posts.docs.length ? (
                posts.docs.map((post) => (
                  <ContentCard
                    badge={post.contentType || 'article'}
                    description={post.excerpt}
                    href={`/learning/${post.slug}`}
                    image={postImage(post)}
                    key={post.id}
                    meta={postMeta(post)}
                    title={post.title}
                  />
                ))
              ) : (
                <EmptyState
                  actionHref="/learning"
                  actionLabel="Clear filters"
                  description="Try a broader search or a different category."
                  title="No learning content matched"
                />
              )}
            </div>

            <Pagination
              basePath="/learning"
              page={posts.page || pageNumber}
              query={paginationQuery}
              totalPages={posts.totalPages}
            />

            {additionalSections.length ? (
              <div className="page-section__stack">
                <PageSections sections={additionalSections} />
              </div>
            ) : null}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
