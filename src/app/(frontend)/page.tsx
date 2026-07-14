import Link from 'next/link'

import { CollectionCard } from '@/components/content/CollectionCard'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { formatCurrency } from '@/utilities/formatters'
import {
  getActiveAnnouncements,
  getActiveChapters,
  getActiveMembershipPlan,
  getHomeGlobal,
  getPageStats,
  getPublishedPosts,
  getUpcomingEvents,
} from '@/utilities/payload-public'

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
    { label: 'Members', value: stats.activeMembers > 0 ? `${stats.activeMembers}+` : home.stats?.[0]?.value },
    { label: 'Chapters', value: stats.chapters > 0 ? String(stats.chapters) : home.stats?.[1]?.value },
    { label: 'Upcoming Events', value: stats.events > 0 ? String(stats.events) : home.stats?.[2]?.value },
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
                  <Link className="button button--primary" href={home.primaryCtaHref || '/membership'}>
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
                <p className="hero__panel-label">Why this foundation matters</p>
                <h2>Phase 1 and Phase 2 are now live in the codebase.</h2>
                <p>
                  Payload now owns the main content model, access groundwork, publishing structure,
                  and the public shell that later feature phases will extend.
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
                description="Announcements are now driven by Payload and can support both site-wide and chapter-scoped publishing."
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
              title={home.membershipSectionTitle || 'Membership foundation'}
              description={
                home.membershipSectionDescription ||
                'The single annual membership model is already represented in the Payload schema and admin layer.'
              }
            />

            <div className="membership-highlight">
              <div className="surface-card surface-card--feature">
                <p className="surface-card__label">Launch plan</p>
                <h3>{plan?.title || 'Annual Membership'}</h3>
                <p>
                  {plan?.publicSummary ||
                    'One annual membership type at launch, configurable in admin, with renewal and lifecycle fields already modeled.'}
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
              title="The chapter network has a working content model"
              description="Chapter records, request workflow, and public listing/detail routes are now in place."
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
                  <p>
                    The schema and listing route are ready. Add chapter records from Payload admin to
                    populate this section.
                  </p>
                </article>
              )}
            </div>
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <SectionHeading
              eyebrow="Events"
              title="Event structure, timezone support, and waitlist-ready fields exist now"
              description="Phase 1 added the event, registration, and waitlist schema. This homepage now surfaces upcoming published events."
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
                  <p>
                    Add events in Payload admin to populate this section and the public events listing.
                  </p>
                </article>
              )}
            </div>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              eyebrow="Learning"
              title="The publishing system is live"
              description="Posts, categories, announcements, pages, and history entries can now be managed through Payload."
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
                  <p>Create posts in Payload to populate the learning section and article routes.</p>
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
