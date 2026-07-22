import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { authenticateRequest } from '@/auth/current-user'
import { AnnouncementFeed } from '@/components/communications/AnnouncementFeed'
import { CollectionCard } from '@/components/content/CollectionCard'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Home, Media } from '@/payload-types'
import { formatDateTime } from '@/utilities/date-time'
import { formatCurrency } from '@/utilities/formatters'
import { createPageMetadata } from '@/utilities/metadata'
import {
  getActiveAnnouncements,
  getActiveChapters,
  getActiveHistoryEntries,
  getActiveMembershipPlan,
  getHomeGlobal,
  getNationalCommitteeTerms,
  getPageStats,
  getPublishedPosts,
  getUpcomingEvents,
} from '@/utilities/payload-public'

export const dynamic = 'force-dynamic'

const mediaRecord = (value: Media | number | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

const HomepageHeroPanel = ({ home }: { home: Home }) => {
  const advertisement = home.heroAdvertisement
  const media = mediaRecord(advertisement?.media)
  const type = advertisement?.type ?? 'text'
  const showAdvertisement =
    advertisement?.enabled === true &&
    (type === 'text' || Boolean(media?.url && media.mimeType?.startsWith(`${type}/`)))

  if (!showAdvertisement) {
    return (
      <aside className="hero__panel">
        <p className="hero__panel-label">{home.networkPanelEyebrow}</p>
        <h2>{home.networkPanelTitle}</h2>
        <p>{home.networkPanelDescription}</p>
        <Link className="surface-card__link" href="/about">
          Learn about RUETIAN USA
        </Link>
      </aside>
    )
  }

  return (
    <aside className="hero__panel hero__panel--advertisement" aria-label="Advertisement">
      <p className="hero__panel-label">{advertisement.label || 'Advertisement'}</p>
      {type === 'image' && media?.url ? (
        <Image
          alt={media.alt}
          className="hero-advertisement__media"
          height={media.height || 720}
          sizes="(max-width: 1100px) 100vw, 36vw"
          src={media.url}
          width={media.width || 960}
        />
      ) : null}
      {type === 'video' && media?.url ? (
        <video
          aria-label={advertisement.headline || media.alt}
          className="hero-advertisement__media"
          controls
          playsInline
          preload="metadata"
        >
          <source src={media.url} type={media.mimeType || 'video/mp4'} />
          Your browser does not support embedded video.
        </video>
      ) : null}
      {advertisement.headline ? <h2>{advertisement.headline}</h2> : null}
      {advertisement.body ? <p>{advertisement.body}</p> : null}
      {advertisement.ctaHref && advertisement.ctaLabel ? (
        <Link className="surface-card__link" href={advertisement.ctaHref}>
          {advertisement.ctaLabel}
        </Link>
      ) : null}
    </aside>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomeGlobal()

  return createPageMetadata({
    canonicalPath: '/',
    description: home.heroDescription,
    seo: home.seo,
    title: home.heroTitle || 'RUETIAN USA',
  })
}

export default async function HomePage() {
  const user = await authenticateRequest(await headers())
  const [home, stats, announcements, chapters, events, history, committees, posts, plan] =
    await Promise.all([
      getHomeGlobal(),
      getPageStats(),
      getActiveAnnouncements({ limit: 3, scope: 'home', user: user ?? undefined }),
      getActiveChapters(3),
      getUpcomingEvents(3),
      getActiveHistoryEntries(3),
      getNationalCommitteeTerms({ current: true }),
      getPublishedPosts(3),
      getActiveMembershipPlan(),
    ])

  const configuredStats = home.stats ?? []
  const statItems = [
    {
      label: configuredStats[0]?.label || 'Active members',
      value:
        stats.activeMembers > 0 ? String(stats.activeMembers) : configuredStats[0]?.value || '0',
    },
    {
      label: configuredStats[1]?.label || 'Active chapters',
      value: stats.chapters > 0 ? String(stats.chapters) : configuredStats[1]?.value || '0',
    },
    {
      label: configuredStats[2]?.label || 'Upcoming events',
      value: stats.events > 0 ? String(stats.events) : configuredStats[2]?.value || '0',
    },
    {
      label: configuredStats[3]?.label || 'Published resources',
      value: stats.posts > 0 ? String(stats.posts) : configuredStats[3]?.value || '0',
    },
  ]
  const spotlight = chapters[0]

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
                    {home.primaryCtaLabel || 'Explore Membership'}
                  </Link>
                  <Link
                    className="button button--secondary"
                    href={home.secondaryCtaHref || '/chapters'}
                  >
                    {home.secondaryCtaLabel || 'Find a Chapter'}
                  </Link>
                </div>
              </div>

              <HomepageHeroPanel home={home} />
            </div>
          </Container>
        </section>

        <section aria-labelledby="homepage-stats-title" className="credibility-band">
          <Container>
            <div className="credibility-band__heading">
              <p className="eyebrow">{home.statsSectionEyebrow}</p>
              <h2 id="homepage-stats-title">{home.statsSectionTitle}</h2>
            </div>
            <dl className="credibility-band__stats">
              {statItems.map((item) => (
                <div key={item.label}>
                  <dd>{item.value}</dd>
                  <dt>{item.label}</dt>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              eyebrow="Announcements"
              title={home.announcementSectionTitle || 'Latest organization notices'}
              description={home.announcementSectionDescription || undefined}
            />
            {announcements.length ? (
              <AnnouncementFeed announcements={announcements} />
            ) : (
              <article className="surface-card surface-card--empty">
                <h3>All caught up</h3>
                <p>There are no active organization notices at this time.</p>
              </article>
            )}
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <SectionHeading
              eyebrow="Membership"
              title={home.membershipSectionTitle || 'One community, year-round connection'}
              description={home.membershipSectionDescription || undefined}
            />
            <div className="membership-highlight">
              <div className="surface-card surface-card--feature">
                <p className="surface-card__label">Annual membership</p>
                <h3>{plan?.title || 'RUETIAN USA Membership'}</h3>
                <p>
                  {plan?.publicSummary ||
                    'Connect with alumni across chapters, careers, service, and community programs.'}
                </p>
                <strong className="membership-highlight__price">
                  {plan ? formatCurrency(plan.annualPrice ?? 50, plan.currency || 'USD') : '$50.00'}
                  <span> / year</span>
                </strong>
                <Link className="button button--primary" href="/membership">
                  Explore membership
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              eyebrow="Featured events"
              title={home.eventsSectionTitle || 'Meet, learn, and participate'}
              description={home.eventsSectionDescription || undefined}
              action={{ href: '/events', label: 'View all events' }}
            />
            <div className="card-grid">
              {events.length ? (
                events.map((event) => (
                  <CollectionCard
                    description={event.summary}
                    href={`/events/${event.slug}`}
                    key={event.id}
                    meta={`${formatDateTime(event.startAt, { timeZone: event.timezone })} · ${event.eventMode}`}
                    title={event.title}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>No upcoming events</h3>
                  <p>Browse the event archive or check back for the next alumni program.</p>
                </article>
              )}
            </div>
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <SectionHeading
              eyebrow="Chapter spotlight"
              title={home.chaptersSectionTitle || 'Find your local alumni community'}
              description={home.chaptersSectionDescription || undefined}
              action={{ href: '/chapters', label: 'Explore all chapters' }}
            />
            {spotlight ? (
              <div className="homepage-spotlight">
                <article className="surface-card surface-card--feature">
                  <Badge tone="green">Active chapter</Badge>
                  <p className="surface-card__label">
                    {spotlight.regionOrState || 'United States'}
                  </p>
                  <h3>{spotlight.name}</h3>
                  <p>{spotlight.description || spotlight.summary}</p>
                  <Link className="button button--primary" href={`/chapters/${spotlight.slug}`}>
                    Visit chapter
                  </Link>
                </article>
                {chapters.slice(1).map((chapter) => (
                  <CollectionCard
                    description={chapter.summary}
                    href={`/chapters/${chapter.slug}`}
                    key={chapter.id}
                    meta={chapter.regionOrState || 'RUETIAN USA Chapter'}
                    title={chapter.name}
                  />
                ))}
              </div>
            ) : (
              <article className="surface-card surface-card--empty">
                <h3>Connect with the national community</h3>
                <p>Explore chapter formation or propose a community in your region.</p>
                <Link className="surface-card__link" href="/chapters/request">
                  Request a chapter
                </Link>
              </article>
            )}
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              eyebrow="Our history"
              title={home.historySectionTitle || 'Milestones that connect generations'}
              description={home.historySectionDescription || undefined}
              action={{ href: '/history', label: 'Explore the timeline' }}
            />
            <div className="card-grid">
              {history.length ? (
                history.map((entry) => (
                  <CollectionCard
                    description={entry.summary}
                    href="/history"
                    key={entry.id}
                    meta={
                      entry.endYear
                        ? `${entry.startYear}–${entry.endYear}`
                        : String(entry.startYear)
                    }
                    title={entry.title}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>Explore the living archive</h3>
                  <p>RUET milestones and alumni memories are organized in the history timeline.</p>
                </article>
              )}
            </div>
          </Container>
        </section>

        <section className="page-section">
          <Container>
            <SectionHeading
              eyebrow="Committees"
              title={home.committeesSectionTitle || 'Volunteer leadership and continuity'}
              description={home.committeesSectionDescription || undefined}
              action={{ href: '/committees/running', label: 'Meet our leadership' }}
            />
            <div className="card-grid">
              {committees.length ? (
                committees
                  .slice(0, 3)
                  .map((term) => (
                    <CollectionCard
                      description={
                        term.summary ||
                        `${term.members?.length || 0} volunteer leaders serving this term.`
                      }
                      href={`/committees/${term.committeeType}`}
                      key={term.id}
                      meta={`${term.committeeType} committee · ${term.members?.length || 0} members`}
                      title={term.title}
                    />
                  ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>Leadership records</h3>
                  <p>View current and historical running and advisory committee terms.</p>
                </article>
              )}
            </div>
          </Container>
        </section>

        <section className="page-section page-section--alt">
          <Container>
            <SectionHeading
              eyebrow="Learning"
              title={home.learningSectionTitle || 'Knowledge shared across generations'}
              description={home.learningSectionDescription || undefined}
              action={{ href: '/learning', label: 'Visit the learning hub' }}
            />
            <div className="card-grid">
              {posts.length ? (
                posts.map((post) => (
                  <CollectionCard
                    description={post.excerpt}
                    href={`/learning/${post.slug}`}
                    key={post.id}
                    meta={post.contentType || 'Article'}
                    title={post.title}
                  />
                ))
              ) : (
                <article className="surface-card surface-card--empty">
                  <h3>Explore learning resources</h3>
                  <p>
                    Professional knowledge and alumni perspectives are collected in the learning
                    hub.
                  </p>
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
