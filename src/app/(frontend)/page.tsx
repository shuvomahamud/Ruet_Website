import Link from 'next/link'
import type { Metadata } from 'next'

import { CollectionCard } from '@/components/content/CollectionCard'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import {
  getActiveAnnouncements,
  getActiveChapters,
  getActiveMembershipPlan,
  getHomeGlobal,
  getPageStats,
  getPublishedPosts,
  getUpcomingEvents,
} from '@/utilities/payload-public'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomeGlobal()

  return createPageMetadata({
    canonicalPath: '/',
    description: home.heroDescription,
    title: home.heroTitle || 'RUETIAN USA',
  })
}

export default async function HomePage() {
  const [home, stats, announcements, chapters, events, posts, plan] = await Promise.all([
    getHomeGlobal(),
    getPageStats(),
    getActiveAnnouncements(3),
    getActiveChapters(3),
    getUpcomingEvents(3),
    getPublishedPosts(3),
    getActiveMembershipPlan(),
  ])

  const statItems = [
    {
      label: 'Members',
      value: stats.activeMembers > 0 ? `${stats.activeMembers}+` : home.stats?.[0]?.value,
    },
    {
      label: 'Chapters',
      value: stats.chapters > 0 ? String(stats.chapters) : home.stats?.[1]?.value,
    },
    {
      label: 'Upcoming Events',
      value: stats.events > 0 ? String(stats.events) : home.stats?.[2]?.value,
    },
    { label: 'Published Updates', value: stats.posts > 0 ? String(stats.posts) : '0' },
  ]

  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero">
          <Container>
            <div className="hero__content">
              <div className="hero__copy">
                <p className="eyebrow">{home.heroEyebrow}</p>
                <h1>{home.heroTitle}</h1>
                <p className="hero__lede">{home.heroDescription}</p>
                <div className="hero__actions">
                  <Link
                    className="button button--primary"
                    href={home.primaryCtaHref || '/membership'}
                  >
                    {home.primaryCtaLabel || 'Join Membership'}
                  </Link>
                  <Link
                    className="button button--secondary"
                    href={home.secondaryCtaHref || '/chapters'}
                  >
                    {home.secondaryCtaLabel || 'Explore Chapters'}
                  </Link>
                </div>
              </div>

              <aside className="hero__panel">
                <p className="hero__panel-label">Our alumni network</p>
                <h2>Connected by RUET, strengthened by community.</h2>
                <p>
                  Discover members, chapters, upcoming programs, and stories from RUET alumni across
                  the United States.
                </p>
                <dl className="hero__meta">
                  {statItems.map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value || '0'}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            </div>
          </Container>
        </section>

        {announcements.length ? (
          <section className="page-section page-section--alt">
            <Container>
              <SectionHeading
                eyebrow="Announcements"
                title="Latest organization notices"
                description="Stay informed about association news, chapter updates, and opportunities across the alumni network."
              />
              <div className="card-grid card-grid--compact">
                {announcements.map((announcement) => (
                  <article className="surface-card" key={announcement.id}>
                    <p className="surface-card__label">{announcement.audience || 'public'}</p>
                    <h3>{announcement.title}</h3>
                    <p>{announcement.summary}</p>
                    {announcement.ctaHref && announcement.ctaLabel ? (
                      <Link className="surface-card__link" href={announcement.ctaHref}>
                        {announcement.ctaLabel}
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        <section className="page-section">
          <Container>
            <SectionHeading
              eyebrow="Membership"
              title={home.membershipSectionTitle || 'One community, year-round connection'}
              description={
                home.membershipSectionDescription ||
                'Annual membership supports alumni programs, local chapters, learning, and community connections.'
              }
            />

            <div className="membership-highlight">
              <div className="surface-card surface-card--feature">
                <p className="surface-card__label">Launch plan</p>
                <h3>{plan?.title || 'Annual Membership'}</h3>
                <p>
                  {plan?.publicSummary ||
                    'One annual membership connecting RUET alumni across chapters, careers, and communities.'}
                </p>
                <strong className="membership-highlight__price">
                  {plan ? formatCurrency(plan.annualPrice ?? 50, plan.currency || 'USD') : '$50.00'}
                  <span> / year</span>
                </strong>
                <Link className="button button--primary" href="/membership">
                  View membership page
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              eyebrow="Chapters"
              title="Find your local alumni community"
              description="Regional chapters create opportunities to meet, volunteer, learn, and stay connected."
            />

            <div className="card-grid">
              {chapters.length ? (
                chapters.map((chapter) => (
                  <CollectionCard
                    description={chapter.summary}
                    href={`/chapters/${chapter.slug}`}
                    key={chapter.id}
                    meta={chapter.regionOrState || 'RUETIAN USA Chapter'}
                    title={chapter.name}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>No active chapters yet</h3>
                  <p>New regional chapters will appear here as they become active.</p>
                </article>
              )}
            </div>
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <SectionHeading
              eyebrow="Events"
              title="Meet, learn, and participate"
              description="Explore in-person, virtual, and hybrid programs hosted across the alumni network."
            />

            <div className="card-grid">
              {events.length ? (
                events.map((event) => (
                  <CollectionCard
                    description={event.summary}
                    href={`/events/${event.slug}`}
                    key={event.id}
                    meta={`${event.eventMode || 'event'} • ${event.timezone || 'timezone not set'}`}
                    title={event.title}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>No published events yet</h3>
                  <p>Upcoming alumni programs will be shared here when registration opens.</p>
                </article>
              )}
            </div>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              eyebrow="Learning"
              title="Knowledge shared across generations"
              description="Read alumni perspectives, professional development articles, and practical community resources."
            />

            <div className="card-grid">
              {posts.length ? (
                posts.map((post) => (
                  <CollectionCard
                    description={post.excerpt}
                    href={`/learning/${post.slug}`}
                    key={post.id}
                    meta="Learning & Development"
                    title={post.title}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>No published articles yet</h3>
                  <p>New articles and community resources will be shared here.</p>
                </article>
              )}
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
