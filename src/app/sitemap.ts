import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { env } from '@/utilities/env'

export const dynamic = 'force-dynamic'

const pagePath = (slug: string) => {
  if (slug === 'running-committee') return '/committees/running'
  if (slug === 'advisory-committee') return '/committees/advisory'
  if (slug === 'committee-history') return '/committees/history'
  return `/${slug}`
}

const absoluteURL = (path: string) => new URL(path, env.NEXT_PUBLIC_SITE_URL).toString()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const [pages, posts, chapters, events] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      sort: 'slug',
      where: {
        and: [{ _status: { equals: 'published' } }, { 'seo.noIndex': { not_equals: true } }],
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      sort: '-updatedAt',
      where: {
        and: [{ _status: { equals: 'published' } }, { 'seo.noIndex': { not_equals: true } }],
      },
    }),
    payload.find({
      collection: 'chapters',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      sort: 'name',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { chapterStatus: { equals: 'active' } },
          { 'seo.noIndex': { not_equals: true } },
        ],
      },
    }),
    payload.find({
      collection: 'events',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      sort: '-updatedAt',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { status: { in: ['published', 'archived'] } },
          { 'seo.noIndex': { not_equals: true } },
        ],
      },
    }),
  ])

  const entries: MetadataRoute.Sitemap = [
    { changeFrequency: 'daily', priority: 1, url: absoluteURL('/') },
  ]
  const seen = new Set(entries.map((entry) => entry.url))
  const add = (path: string, updatedAt: string, priority: number) => {
    const url = absoluteURL(path)
    if (seen.has(url)) return
    seen.add(url)
    entries.push({ changeFrequency: 'weekly', lastModified: updatedAt, priority, url })
  }

  for (const page of pages.docs) add(pagePath(page.slug), page.updatedAt, 0.8)
  for (const post of posts.docs) add(`/learning/${post.slug}`, post.updatedAt, 0.7)
  for (const chapter of chapters.docs) add(`/chapters/${chapter.slug}`, chapter.updatedAt, 0.7)
  for (const event of events.docs) add(`/events/${event.slug}`, event.updatedAt, 0.7)

  return entries
}
