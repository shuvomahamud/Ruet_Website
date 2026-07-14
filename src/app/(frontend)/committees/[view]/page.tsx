import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { EmptyState } from '@/components/content/EmptyState'
import { FilterBar } from '@/components/content/FilterBar'
import { Gallery } from '@/components/content/Gallery'
import { PageHero } from '@/components/content/PageHero'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import type { CommitteeTerm, Media } from '@/payload-types'
import { createPageMetadata } from '@/utilities/metadata'
import { imageSource } from '@/utilities/media-url'
import { getNationalCommitteeTerms, getPublishedPageBySlug } from '@/utilities/payload-public'

type CommitteeView = 'advisory' | 'history' | 'running'
const pageSlug: Record<CommitteeView, string> = {
  advisory: 'advisory-committee',
  history: 'committee-history',
  running: 'running-committee',
}
const isView = (value: string): value is CommitteeView =>
  ['advisory', 'history', 'running'].includes(value)
const relationshipMedia = (value: number | Media | null | undefined) =>
  !value || typeof value === 'number' ? null : value

const CommitteeTermView = ({ term }: { term: CommitteeTerm }) => (
  <article className="committee-term">
    <header className="committee-term__heading">
      <div>
        <Badge tone={term.isCurrent ? 'green' : 'blue'}>
          {term.isCurrent ? 'Current term' : 'Archived term'}
        </Badge>
        <h2>{term.title}</h2>
        <p>
          {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
            new Date(term.startDate),
          )}{' '}
          –{' '}
          {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(term.endDate))}
        </p>
      </div>
      <span>{term.committeeType} committee</span>
    </header>
    {term.summary ? <p className="committee-term__summary">{term.summary}</p> : null}
    {term.members?.length ? (
      <div className="committee-member-grid">
        {term.members.map((member) => {
          const photo = relationshipMedia(member.photo)
          return (
            <section
              className="committee-member"
              key={member.id || `${member.name}-${member.role}`}
            >
              {photo?.url ? (
                <Image
                  alt={photo.alt}
                  height={photo.height || 480}
                  src={imageSource(photo.url)}
                  width={photo.width || 480}
                />
              ) : (
                <div aria-hidden="true" className="committee-member__placeholder">
                  {member.name.charAt(0)}
                </div>
              )}
              <div>
                <p>{member.role}</p>
                <h3>{member.name}</h3>
                {member.bio ? <p>{member.bio}</p> : null}
              </div>
            </section>
          )
        })}
      </div>
    ) : null}
    {term.eventRecaps?.length ? (
      <div className="committee-recaps">
        <h3>Programs completed during this term</h3>
        {term.eventRecaps.map((recap) => {
          const images = (recap.photoGallery ?? [])
            .map(relationshipMedia)
            .filter((item): item is Media => Boolean(item?.url))
            .map((item) => ({
              alt: item.alt,
              height: item.height,
              id: item.id,
              url: item.url || '',
              width: item.width,
            }))
          return (
            <article key={recap.id || recap.title}>
              <div>
                <h4>{recap.title}</h4>
                {recap.eventDate ? (
                  <p>
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(
                      new Date(recap.eventDate),
                    )}
                  </p>
                ) : null}
                <p>{recap.summary}</p>
              </div>
              <Gallery images={images} label={`${recap.title} photos`} />
            </article>
          )
        })}
      </div>
    ) : null}
  </article>
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ view: string }>
}): Promise<Metadata> {
  const { view } = await params
  if (!isView(view)) return {}
  const page = await getPublishedPageBySlug(pageSlug[view])
  return createPageMetadata({
    canonicalPath: `/committees/${view}`,
    description: page?.heroDescription,
    seo: page?.seo,
    title: page?.title || `${view} committee`,
  })
}

export default async function CommitteePage({
  params,
  searchParams,
}: {
  params: Promise<{ view: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { view } = await params
  if (!isView(view)) notFound()
  const values = await searchParams
  const filterValue =
    typeof values.type === 'string' && ['running', 'advisory'].includes(values.type)
      ? (values.type as 'running' | 'advisory')
      : undefined
  const [page, terms] = await Promise.all([
    getPublishedPageBySlug(pageSlug[view]),
    getNationalCommitteeTerms(
      view === 'history' ? { committeeType: filterValue } : { committeeType: view, current: true },
    ),
  ])
  if (!page) notFound()

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
            <div className="committee-view-links">
              <Link
                aria-current={view === 'running' ? 'page' : undefined}
                href="/committees/running"
              >
                Running committee
              </Link>
              <Link
                aria-current={view === 'advisory' ? 'page' : undefined}
                href="/committees/advisory"
              >
                Advisory committee
              </Link>
              <Link
                aria-current={view === 'history' ? 'page' : undefined}
                href="/committees/history"
              >
                Committee archive
              </Link>
            </div>
            {view === 'history' ? (
              <form action="/committees/history" method="get">
                <FilterBar label="Filter committee archive">
                  <label>
                    Committee type
                    <select defaultValue={filterValue || ''} name="type">
                      <option value="">All committees</option>
                      <option value="running">Running committee</option>
                      <option value="advisory">Advisory committee</option>
                    </select>
                  </label>
                  <div className="filter-bar__actions">
                    <button className="button button--primary" type="submit">
                      Apply filter
                    </button>
                    {filterValue ? (
                      <Link className="button button--secondary" href="/committees/history">
                        Clear
                      </Link>
                    ) : null}
                  </div>
                </FilterBar>
              </form>
            ) : null}
            <div className="committee-terms-stack">
              {terms.length ? (
                terms.map((term) => <CommitteeTermView key={term.id} term={term} />)
              ) : (
                <EmptyState
                  actionHref={view === 'history' ? '/committees/history' : '/contact'}
                  actionLabel={view === 'history' ? 'Clear filters' : 'Contact RUETIAN USA'}
                  description={
                    view === 'history'
                      ? 'Try another committee type.'
                      : 'Committee information will appear after an authorized editor publishes the current term.'
                  }
                  title={
                    view === 'history'
                      ? 'No committee terms matched'
                      : 'No current committee is published'
                  }
                />
              )}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
