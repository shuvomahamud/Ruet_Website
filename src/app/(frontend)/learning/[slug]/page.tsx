import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContentCard } from '@/components/content/ContentCard'
import { ContentRail } from '@/components/content/ContentRail'
import { CTASection } from '@/components/content/CTASection'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Media, Post } from '@/payload-types'
import { createPageMetadata } from '@/utilities/metadata'
import { getPublishedPostBySlug, getRelatedPosts } from '@/utilities/payload-public'

const imageFromPost = (post: Post) => {
  const image = post.featuredImage
  if (!image || typeof image === 'number' || !image.url) return undefined
  return { alt: image.alt, height: image.height, url: image.url, width: image.width }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)
  if (!post) return {}
  return createPageMetadata({
    canonicalPath: `/learning/${post.slug}`,
    description: post.excerpt,
    seo: post.seo as { image?: Media | number | null } | undefined,
    title: post.title,
    type: 'article',
  })
}

export default async function LearningDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)
  if (!post) notFound()
  const related = await getRelatedPosts(post)
  const categories = (post.categories ?? []).filter((item) => typeof item !== 'number')
  const publishedAt = post.publishedAt
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(post.publishedAt))
    : undefined

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={post.excerpt}
          eyebrow={post.contentType || 'Article'}
          title={post.title}
        />
        <section className="article-meta-band">
          <Container narrow>
            <div>
              {categories.map((category) => (
                <Badge key={category.id}>{category.title}</Badge>
              ))}
            </div>
            <p>
              {[
                post.authorName,
                publishedAt,
                post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </Container>
        </section>
        <section className="page-section">
          <Container narrow>
            <article className="rich-article rich-article--learning">
              {post.richBody ? <RichText data={post.richBody} /> : <p>{post.body}</p>}
            </article>
          </Container>
        </section>

        {related.length ? (
          <section className="page-section page-section--alt">
            <Container>
              <SectionHeading eyebrow="Continue learning" title="Related articles and resources" />
              <ContentRail label="Related learning content">
                {related.map((item) => (
                  <ContentCard
                    badge={item.contentType || 'article'}
                    description={item.excerpt}
                    href={`/learning/${item.slug}`}
                    image={imageFromPost(item)}
                    key={item.id}
                    title={item.title}
                  />
                ))}
              </ContentRail>
            </Container>
          </section>
        ) : null}
        <CTASection
          description="Membership keeps you connected to alumni programs, chapters, events, and professional knowledge."
          eyebrow="Stay connected"
          primaryHref="/membership"
          primaryLabel="Explore membership"
          secondaryHref="/learning"
          secondaryLabel="Back to learning"
          title="Keep learning with the RUETIAN USA community"
        />
      </main>
      <SiteFooter />
    </>
  )
}
