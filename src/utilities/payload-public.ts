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
} from '@/payload-types'

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

export const getSiteSettings = () => getCachedGlobal<SiteSetting>('siteSettings', fallbackSiteSettings)()
export const getHeaderGlobal = () => getCachedGlobal<HeaderGlobal>('header', fallbackHeader)()
export const getFooterGlobal = () => getCachedGlobal<Footer>('footer', fallbackFooter)()
export const getHomeGlobal = () =>
  getCachedGlobal('home', {
    heroDescription:
      'This foundation now supports dynamic content, publishing workflows, chapter structure, membership data models, and the public site shell needed for the next implementation phases.',
    heroEyebrow: 'RUET Alumni Association',
    id: 0,
    heroTitle: 'A professional, chapter-centered home for RUET alumni in the United States.',
    membershipSectionDescription:
      'The site is structured for one annual membership plan at launch, with configurable pricing and future-ready schema support.',
    membershipSectionTitle: 'Membership foundation',
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

export const getPublishedPostBySlug = async (slug: string): Promise<Post | null> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
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

export const getUpcomingEvents = async (limit = 6): Promise<Event[]> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'events',
    depth: 1,
    limit,
    overrideAccess: false,
    sort: 'startAt',
    where: {
      _status: {
        equals: 'published',
      },
      endAt: {
        greater_than_equal: new Date().toISOString(),
      },
    },
  })

  return result.docs
}

export const getPublishedEventBySlug = async (slug: string): Promise<Event | null> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'events',
    depth: 1,
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

export const getActiveMembershipPlan = async (): Promise<MembershipPlan | null> => {
  const payload = await getClient()
  const result = await payload.find({
    collection: 'membershipPlans',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      active: {
        equals: true,
      },
    },
  })

  return result.docs[0] ?? null
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
