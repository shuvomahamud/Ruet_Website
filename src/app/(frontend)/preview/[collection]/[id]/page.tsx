import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { isElevated } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import type {
  Announcement,
  Chapter,
  CommitteeTerm,
  Event,
  HistoryEntry,
  Page,
  Post,
} from '@/payload-types'
import { formatDateTime } from '@/utilities/date-time'

const previewCollections = [
  'announcements',
  'chapters',
  'committeeTerms',
  'events',
  'historyEntries',
  'pages',
  'posts',
] as const
type PreviewCollection = (typeof previewCollections)[number]

const isPreviewCollection = (value: string): value is PreviewCollection =>
  previewCollections.includes(value as PreviewCollection)

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Content preview | RUETIAN USA',
}

const PreviewFrame = ({
  children,
  status,
}: {
  children: React.ReactNode
  status?: string | null
}) => (
  <>
    <SiteHeader />
    <main>
      <div className="preview-notice" role="status">
        <Container>
          <strong>Editorial preview</strong>
          <span>This protected view may include unpublished changes.</span>
          <Badge tone={status === 'approved' ? 'green' : status === 'inReview' ? 'gold' : 'blue'}>
            {status === 'inReview' ? 'In review' : status || 'Draft'}
          </Badge>
        </Container>
      </div>
      {children}
    </main>
    <SiteFooter />
  </>
)

const TextPreview = ({
  description,
  eyebrow,
  facts,
  title,
}: {
  description?: string | null
  eyebrow: string
  facts?: Array<{ label: string; value?: string | null }>
  title: string
}) => (
  <>
    <PageHero description={description} eyebrow={eyebrow} title={title} />
    <section className="page-section">
      <Container narrow>
        {facts?.length ? (
          <dl className="preview-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value || 'Not set'}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>
    </section>
  </>
)

const renderPreview = (collection: PreviewCollection, value: unknown) => {
  switch (collection) {
    case 'pages': {
      const page = value as Page
      return (
        <>
          <PageHero
            description={page.heroDescription}
            eyebrow={page.heroEyebrow}
            title={page.heroTitle || page.title}
          />
          <section className="page-section">
            <Container narrow>
              <PageSections sections={page.sections || []} />
            </Container>
          </section>
        </>
      )
    }
    case 'posts': {
      const post = value as Post
      return (
        <TextPreview
          description={post.excerpt}
          eyebrow={post.contentType || 'Article'}
          facts={[
            { label: 'Author', value: post.authorName },
            { label: 'Body', value: post.body },
          ]}
          title={post.title}
        />
      )
    }
    case 'events': {
      const event = value as Event
      return (
        <TextPreview
          description={event.summary}
          eyebrow={`${event.eventMode} event`}
          facts={[
            { label: 'Starts', value: formatDateTime(event.startAt, { timeZone: event.timezone }) },
            { label: 'Ends', value: formatDateTime(event.endAt, { timeZone: event.timezone }) },
            { label: 'Venue', value: event.venue },
            { label: 'Details', value: event.details },
          ]}
          title={event.title}
        />
      )
    }
    case 'chapters': {
      const chapter = value as Chapter
      return (
        <TextPreview
          description={chapter.summary}
          eyebrow={chapter.regionOrState || 'RUETIAN USA Chapter'}
          facts={[
            { label: 'Status', value: chapter.chapterStatus },
            { label: 'Contact', value: chapter.contactEmail },
            { label: 'Overview', value: chapter.description },
          ]}
          title={chapter.name}
        />
      )
    }
    case 'announcements': {
      const announcement = value as Announcement
      return (
        <TextPreview
          description={announcement.summary}
          eyebrow={`${announcement.audience} announcement`}
          facts={[
            { label: 'Details', value: announcement.details },
            { label: 'Active from', value: announcement.activeFrom },
            { label: 'Active to', value: announcement.activeTo },
          ]}
          title={announcement.title}
        />
      )
    }
    case 'historyEntries': {
      const entry = value as HistoryEntry
      return (
        <TextPreview
          description={entry.summary}
          eyebrow={entry.endYear ? `${entry.startYear}–${entry.endYear}` : String(entry.startYear)}
          facts={[{ label: 'Full entry', value: entry.body }]}
          title={entry.title}
        />
      )
    }
    case 'committeeTerms': {
      const term = value as CommitteeTerm
      return (
        <TextPreview
          description={term.summary}
          eyebrow={`${term.committeeType} committee`}
          facts={[
            { label: 'Starts', value: term.startDate },
            { label: 'Ends', value: term.endDate },
            {
              label: 'Members',
              value: (term.members || [])
                .map((member) => `${member.name} — ${member.role}`)
                .join(', '),
            },
          ]}
          title={term.title}
        />
      )
    }
  }
}

export default async function ContentPreviewPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>
}) {
  const { collection, id } = await params
  if (!isPreviewCollection(collection) || !/^\d+$/.test(id)) notFound()

  const user = await authenticateRequest(await headers())
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(`/preview/${collection}/${id}`)}`)
  if (!isElevated(user)) notFound()

  const payload = await getPayload({ config })
  let doc: unknown
  try {
    doc = await payload.findByID({
      collection,
      depth: 2,
      draft: true,
      id: Number(id),
      overrideAccess: false,
      user,
    })
  } catch {
    notFound()
  }

  const status = (doc as { editorialStatus?: string | null }).editorialStatus
  return <PreviewFrame status={status}>{renderPreview(collection, doc)}</PreviewFrame>
}
