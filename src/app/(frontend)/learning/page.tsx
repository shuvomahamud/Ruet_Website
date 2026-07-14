import { notFound } from 'next/navigation'

import { CollectionCard } from '@/components/content/CollectionCard'
import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getPublishedPageBySlug, getPublishedPosts } from '@/utilities/payload-public'

export default async function LearningPage() {
  const [page, posts] = await Promise.all([
    getPublishedPageBySlug('learning'),
    getPublishedPosts(12),
  ])

  if (!page) {
    notFound()
  }

  const introSection = page.sections?.[0]
  const additionalSections = page.sections?.slice(1) || []

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero description={page.heroDescription} eyebrow={page.heroEyebrow} title={page.heroTitle} />

        <section className="page-section">
          <Container>
            {introSection ? (
              <SectionHeading
                eyebrow={introSection.eyebrow || undefined}
                title={introSection.title}
                description={introSection.body}
              />
            ) : null}

            <div className="card-grid">
              {posts.length ? (
                posts.map((post) => (
                  <CollectionCard
                    description={post.excerpt}
                    href={`/learning/${post.slug}`}
                    key={post.id}
                    meta="Published article"
                    title={post.title}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>No published articles yet</h3>
                  <p>Create posts in Payload admin to populate this section.</p>
                </article>
              )}
            </div>

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
