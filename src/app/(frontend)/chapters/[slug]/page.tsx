import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'

import { authenticateRequest } from '@/auth/current-user'
import { AnnouncementFeed } from '@/components/communications/AnnouncementFeed'
import { CollectionCard } from '@/components/content/CollectionCard'
import { Gallery } from '@/components/content/Gallery'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Media } from '@/payload-types'
import { formatDateTime } from '@/utilities/date-time'
import { createPageMetadata } from '@/utilities/metadata'
import { getActiveChapterBySlug, getChapterPublicModules } from '@/utilities/payload-public'

const galleryImage = (image: Media) =>
  image.url
    ? { alt: image.alt, height: image.height, id: image.id, url: image.url, width: image.width }
    : null

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
    seo: chapter?.seo || { image: chapter?.heroImage },
    title: chapter?.name || 'Chapter',
  })
}

export default async function ChapterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const chapter = await getActiveChapterBySlug(slug)
  if (!chapter) notFound()
  const user = await authenticateRequest(await headers())
  const modules = await getChapterPublicModules(chapter.id, user ?? undefined)
  const currentCommittees = modules.committees
  const images = modules.media.map(galleryImage).filter((item) => item !== null)

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          description={chapter.summary}
          eyebrow={chapter.regionOrState || 'RUETIAN USA Chapter'}
          title={chapter.name}
        />
        <section className="chapter-detail-band">
          <Container>
            <Badge tone="green">Active chapter</Badge>
            {chapter.contactEmail ? (
              <Link href={`mailto:${chapter.contactEmail}`}>{chapter.contactEmail}</Link>
            ) : null}
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <div className="chapter-overview-grid">
              <div>
                <p className="eyebrow">Overview</p>
                <h2>About this chapter</h2>
                <p>{chapter.description || chapter.summary}</p>
              </div>
              <aside className="surface-card">
                <h2>Get involved locally</h2>
                <p>
                  Contact chapter leadership for local programs, volunteering, and community
                  information.
                </p>
                {chapter.contactEmail ? (
                  <Link className="button button--primary" href={`mailto:${chapter.contactEmail}`}>
                    Contact the chapter
                  </Link>
                ) : (
                  <Link className="button button--primary" href="/contact">
                    Contact RUETIAN USA
                  </Link>
                )}
              </aside>
            </div>
          </Container>
        </section>

        {currentCommittees.length ? (
          <section className="page-section page-section--alt">
            <Container>
              <SectionHeading eyebrow="Leadership" title="Current chapter committees" />
              <div className="committee-term-grid">
                {currentCommittees.map((term) => (
                  <article className="surface-card" key={term.id}>
                    <Badge>{term.committeeType}</Badge>
                    <h3>{term.title}</h3>
                    {term.summary ? <p>{term.summary}</p> : null}
                    <ul className="leadership-list">
                      {(term.members ?? []).map((member) => (
                        <li key={member.id || `${member.name}-${member.role}`}>
                          <strong>{member.name}</strong>
                          <span>{member.role}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {modules.announcements.length ? (
          <section className="page-section">
            <Container>
              <SectionHeading eyebrow="Chapter updates" title="Announcements" />
              <AnnouncementFeed announcements={modules.announcements} />
            </Container>
          </section>
        ) : null}

        {modules.events.length ? (
          <section className="page-section page-section--alt">
            <Container>
              <SectionHeading eyebrow="Participate" title="Upcoming chapter events" />
              <div className="card-grid">
                {modules.events.map((event) => (
                  <CollectionCard
                    description={event.summary}
                    href={`/events/${event.slug}`}
                    key={event.id}
                    meta={`${formatDateTime(event.startAt)} · ${event.eventMode}`}
                    title={event.title}
                  />
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {images.length ? (
          <section className="page-section">
            <Container>
              <SectionHeading eyebrow="Community" title="Chapter gallery" />
              <Gallery images={images} label={`${chapter.name} gallery`} />
            </Container>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}
