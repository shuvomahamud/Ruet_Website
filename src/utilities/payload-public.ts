import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { fallbackFooter, fallbackHeader, fallbackSiteSettings } from '@/constants/site'
import type {
  Announcement,
  Chapter,
  Event,
  Footer,
  HistoryEntry,
  Home,
  MembershipPlan,
  Page,
  Post,
  SiteSetting,
  Header as HeaderGlobal,
  Category,
  CommitteeTerm,
  Media,
  SeoDefault,
  User,
} from '@/payload-types'
import type { Where } from 'payload'
import { getEventAvailability, type EventAvailability } from '@/services/event-registration'

const getClient = async () => getPayload({ config: configPromise })

export const getCachedGlobal = <T>(slug: string, fallbackValue: T) =>
  unstable_cache(
    async () => {
      try {
        const payload = await getClient()
        return (await payload.findGlobal({
          depth: 1,
          slug: slug as never,
        })) as T
      } catch {
        return fallbackValue
      }
    },
    [`global-${slug}`],
    { tags: [`global_${slug}`] },
  )

export const getSiteSettings = () =>
  getCachedGlobal<SiteSetting>('siteSettings', fallbackSiteSettings)()
export const getHeaderGlobal = () => getCachedGlobal<HeaderGlobal>('header', fallbackHeader)()
export const getFooterGlobal = () => getCachedGlobal<Footer>('footer', fallbackFooter)()
export const getHomeGlobal = () =>
  getCachedGlobal('home', {
    heroDescription:
      'Connect with RUET alumni across the United States through membership, regional chapters, events, and shared professional learning.',
    heroEyebrow: 'RUET Alumni Association',
    id: 0,
    heroTitle: 'A professional, chapter-centered home for RUET alumni in the United States.',
    membershipSectionDescription:
      'Annual membership helps sustain alumni programming, regional chapters, professional development, and community connections.',
    membershipSectionTitle: 'One community, year-round connection',
    primaryCtaHref: '/membership',
    primaryCtaLabel: 'Join Membership',
    secondaryCtaHref: '/chapters',
    secondaryCtaLabel: 'Explore Chapters',
    stats: [
      { label: 'Members', value: '0+' },
      { label: 'Chapters', value: '0' },
      { label: 'Upcoming Events', value: '0' },
      { label: 'Years of Community', value: '0' },
    ],
  })() as Promise<Home>

export const getSeoDefaults = () =>
  getCachedGlobal<SeoDefault>('seoDefaults', {
    defaultDescription:
      'RUETIAN USA is a chapter-driven alumni association platform for community, membership, events, and institutional continuity.',
    id: 0,
    siteName: 'RUETIAN USA',
    titleSuffix: ' | RUETIAN USA',
  } as SeoDefault)()

export const getPublishedPageBySlug = async (slug: string): Promise<Page | null> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}

export const getPublishedPosts = async (limit = 6): Promise<Post[]> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return result.docs
}

export const getLearningCategories = async (): Promise<Category[]> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'title',
  })
  return result.docs
}

export const getLearningPosts = async ({
  category,
  contentType,
  limit = 9,
  page = 1,
  query,
}: {
  category?: string
  contentType?: string
  limit?: number
  page?: number
  query?: string
}) => {
  const payload = await getClient()
  const clauses: Where[] = [{ _status: { equals: 'published' } }]

  if (query?.trim()) {
    clauses.push({
      or: [
        { title: { contains: query.trim() } },
        { excerpt: { contains: query.trim() } },
        { body: { contains: query.trim() } },
      ],
    })
  }

  if (category) {
    const categoryResult = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      where: { slug: { equals: category } },
    })
    if (!categoryResult.docs[0]) {
      return {
        docs: [],
        hasNextPage: false,
        hasPrevPage: false,
        page: 1,
        totalDocs: 0,
        totalPages: 0,
      }
    }
    clauses.push({ categories: { contains: categoryResult.docs[0].id } })
  }

  if (contentType && ['article', 'resource', 'news'].includes(contentType)) {
    clauses.push({ contentType: { equals: contentType } })
  }

  return payload.find({
    collection: 'posts',
    depth: 2,
    limit,
    overrideAccess: false,
    page: Math.max(1, page),
    sort: ['-featured', '-publishedAt'],
    where: { and: clauses },
  })
}

export const getPublishedPostBySlug = async (slug: string): Promise<Post | null> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: {
      _status: {
        equals: 'published',
      },
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}

export const getRelatedPosts = async (post: Post, limit = 3): Promise<Post[]> => {
  const payload = await getClient()
  const categoryIDs = (post.categories ?? [])
    .map((category) => (typeof category === 'number' ? category : category.id))
    .filter((value): value is number => typeof value === 'number')
  const clauses: Where[] = [{ _status: { equals: 'published' } }, { id: { not_equals: post.id } }]
  if (categoryIDs.length) clauses.push({ categories: { in: categoryIDs } })

  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    limit,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    where: { and: clauses },
  })
  return result.docs
}

export const getActiveAnnouncements = async (limit = 3): Promise<Announcement[]> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'announcements',
    depth: 1,
    limit,
    overrideAccess: false,
    sort: '-updatedAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return result.docs
}

export const getActiveChapters = async (limit = 6): Promise<Chapter[]> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'chapters',
    depth: 1,
    limit,
    overrideAccess: false,
    sort: 'name',
    where: {
      chapterStatus: {
        equals: 'active',
      },
    },
  })

  return result.docs
}

export const getChapterDirectory = async ({
  limit = 12,
  page = 1,
  query,
  region,
}: {
  limit?: number
  page?: number
  query?: string
  region?: string
}) => {
  const payload = await getClient()
  const clauses: Where[] = [
    { _status: { equals: 'published' } },
    { chapterStatus: { equals: 'active' } },
  ]
  if (query?.trim()) {
    clauses.push({
      or: [
        { name: { contains: query.trim() } },
        { regionOrState: { contains: query.trim() } },
        { summary: { contains: query.trim() } },
      ],
    })
  }
  if (region?.trim()) clauses.push({ regionOrState: { equals: region.trim() } })

  return payload.find({
    collection: 'chapters',
    depth: 1,
    limit,
    overrideAccess: false,
    page: Math.max(1, page),
    sort: 'name',
    where: { and: clauses },
  })
}

export const getChapterRegions = async (): Promise<string[]> => {
  const chapters = await getActiveChapters(500)
  return Array.from(
    new Set(chapters.map((chapter) => chapter.regionOrState?.trim()).filter(Boolean) as string[]),
  ).sort((left, right) => left.localeCompare(right))
}

export const getActiveChapterBySlug = async (slug: string): Promise<Chapter | null> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'chapters',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
      chapterStatus: {
        equals: 'active',
      },
    },
  })

  return result.docs[0] ?? null
}

export const getChapterPublicModules = async (chapterID: number) => {
  const payload = await getClient()
  const now = new Date().toISOString()
  const [announcements, events, committees, media] = await Promise.all([
    payload.find({
      collection: 'announcements',
      depth: 1,
      limit: 6,
      overrideAccess: false,
      pagination: false,
      sort: '-publishedAt',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { chapter: { equals: chapterID } },
          { or: [{ activeFrom: { exists: false } }, { activeFrom: { less_than_equal: now } }] },
          { or: [{ activeTo: { exists: false } }, { activeTo: { greater_than_equal: now } }] },
        ],
      },
    }),
    payload.find({
      collection: 'events',
      depth: 1,
      limit: 6,
      overrideAccess: false,
      pagination: false,
      sort: 'startAt',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { chapter: { equals: chapterID } },
          { status: { equals: 'published' } },
          { endAt: { greater_than_equal: now } },
        ],
      },
    }),
    payload.find({
      collection: 'committeeTerms',
      depth: 2,
      limit: 10,
      overrideAccess: false,
      pagination: false,
      sort: ['-isCurrent', '-startDate'],
      where: {
        and: [
          { _status: { equals: 'published' } },
          { chapter: { equals: chapterID } },
          { isCurrent: { equals: true } },
        ],
      },
    }),
    payload.find({
      collection: 'media',
      depth: 0,
      limit: 12,
      overrideAccess: false,
      pagination: false,
      sort: '-createdAt',
      where: {
        and: [
          { chapter: { equals: chapterID } },
          { mimeType: { contains: 'image/' } },
          { visibility: { equals: 'public' } },
        ],
      },
    }),
  ])

  return {
    announcements: announcements.docs,
    committees: committees.docs,
    events: events.docs,
    media: media.docs as Media[],
  }
}

export const getUpcomingEvents = async (limit = 6): Promise<Event[]> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit,
    overrideAccess: false,
    sort: 'startAt',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { status: { equals: 'published' } },
        { endAt: { greater_than_equal: new Date().toISOString() } },
      ],
    },
  })

  return result.docs
}

export const getPublishedEventBySlug = async (
  slug: string,
  user?: User,
): Promise<Event | null> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    user,
    where: {
      _status: {
        equals: 'published',
      },
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}

export type EventCatalogItem = {
  availability: EventAvailability
  event: Event
}

export const getEventCatalog = async ({
  availability,
  chapter,
  dateFrom,
  dateTo,
  mode,
  price,
  user,
  view = 'upcoming',
}: {
  availability?: string
  chapter?: string
  dateFrom?: string
  dateTo?: string
  mode?: string
  price?: string
  user?: User
  view?: string
}): Promise<{ chapters: Chapter[]; items: EventCatalogItem[] }> => {
  const payload = await getClient()
  const now = new Date().toISOString()
  const clauses: Where[] = [
    { _status: { equals: 'published' } },
    view === 'archive'
      ? { or: [{ endAt: { less_than: now } }, { status: { equals: 'archived' } }] }
      : { and: [{ endAt: { greater_than_equal: now } }, { status: { equals: 'published' } }] },
  ]
  if (mode && ['inPerson', 'virtual', 'hybrid'].includes(mode)) {
    clauses.push({ eventMode: { equals: mode } })
  }
  if (price === 'free') clauses.push({ isPaid: { equals: false } })
  if (price === 'paid') clauses.push({ isPaid: { equals: true } })
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom ?? '')) {
    clauses.push({ startAt: { greater_than_equal: `${dateFrom}T00:00:00.000Z` } })
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo ?? '')) {
    const exclusiveEnd = new Date(`${dateTo}T00:00:00.000Z`)
    exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1)
    clauses.push({ startAt: { less_than: exclusiveEnd.toISOString() } })
  }
  const chaptersResult = await payload.find({
    collection: 'chapters',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: 'name',
    where: { chapterStatus: { equals: 'active' } },
  })
  if (chapter) {
    const selected = chaptersResult.docs.find((item) => item.slug === chapter)
    if (!selected) return { chapters: chaptersResult.docs, items: [] }
    clauses.push({ chapter: { equals: selected.id } })
  }
  const events = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 200,
    overrideAccess: false,
    pagination: false,
    sort: view === 'archive' ? '-startAt' : 'startAt',
    user,
    where: { and: clauses },
  })
  const items = await Promise.all(
    events.docs.map(async (event) => ({
      availability: await getEventAvailability({ event, payload, userID: user?.id }),
      event,
    })),
  )
  return {
    chapters: chaptersResult.docs,
    items: items.filter((item) => {
      if (availability === 'available') return !item.availability.isFull
      if (availability === 'full') return item.availability.isFull
      return true
    }),
  }
}

export const getActiveMembershipPlan = async (): Promise<MembershipPlan | null> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'membershipPlans',
    depth: 1,
    limit: 2,
    overrideAccess: false,
    where: {
      active: {
        equals: true,
      },
    },
  })

  return result.docs.length === 1 ? result.docs[0] : null
}

export const getActiveHistoryEntries = async (limit = 6): Promise<HistoryEntry[]> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'historyEntries',
    depth: 1,
    limit,
    overrideAccess: false,
    sort: '-startYear',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return result.docs
}

export const getPublishedHistoryEntries = async (): Promise<HistoryEntry[]> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'historyEntries',
    depth: 2,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    sort: ['sortOrder', 'startYear'],
    where: { _status: { equals: 'published' } },
  })
  return result.docs
}

export const getNationalCommitteeTerms = async ({
  committeeType,
  current,
}: {
  committeeType?: 'advisory' | 'running'
  current?: boolean
}): Promise<CommitteeTerm[]> => {
  const payload = await getClient()
  const clauses: Where[] = [{ _status: { equals: 'published' } }, { chapter: { exists: false } }]
  if (committeeType) clauses.push({ committeeType: { equals: committeeType } })
  if (typeof current === 'boolean') clauses.push({ isCurrent: { equals: current } })
  const result = await payload.find({
    collection: 'committeeTerms',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: ['-isCurrent', '-startDate'],
    where: { and: clauses },
  })
  return result.docs
}

export const getPageStats = async () => {
  const payload = await getClient()
  const [chapters, events, members, posts] = await Promise.all([
    payload.count({
      collection: 'chapters',
      where: {
        chapterStatus: {
          equals: 'active',
        },
      },
    }),
    payload.count({
      collection: 'events',
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
    payload.count({
      collection: 'memberships',
      where: {
        status: {
          equals: 'active',
        },
      },
    }),
    payload.count({
      collection: 'posts',
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
  ])

  return {
    activeMembers: members.totalDocs,
    chapters: chapters.totalDocs,
    events: events.totalDocs,
    posts: posts.totalDocs,
  }
}
