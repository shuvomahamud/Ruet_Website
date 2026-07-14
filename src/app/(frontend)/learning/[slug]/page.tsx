import { notFound } from 'next/navigation'

import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { getPublishedPostBySlug } from '@/utilities/payload-public'

export default async function LearningDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero description={post.excerpt} eyebrow="Article" title={post.title} />
        <section className="page-section">
          <Container narrow>
            <article className="rich-article">
              <p>{post.body}</p>
            </article>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
