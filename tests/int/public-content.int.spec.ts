import type { Category, ContactSubmission, Post, User } from '@/payload-types'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getLearningPosts, getRelatedPosts } from '@/utilities/payload-public'
import { getTestPayload } from '../helpers/payload'

describe.sequential('public content and contact workflows', () => {
  let payload: Payload
  let admin: User
  let category: Category
  let article: Post
  let resource: Post
  let draft: Post
  let submission: ContactSubmission
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  beforeAll(async () => {
    payload = await getTestPayload()
    admin = { accountStatus: 'active', id: -1, role: 'admin' } as User
    category = await payload.create({
      collection: 'categories',
      data: { slug: `phase3-${nonce}`, title: `Phase 3 ${nonce}` },
      overrideAccess: true,
    })

    const publishedAt = new Date().toISOString()
    article = await payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        authorName: 'RUETIAN USA Test Team',
        body: `Distinctive public learning article ${nonce}.`,
        categories: [category.id],
        contentType: 'article',
        excerpt: `Searchable alumni engineering insight ${nonce}.`,
        featured: true,
        publishedAt,
        readingTimeMinutes: 4,
        slug: `phase3-article-${nonce}`,
        title: `Phase 3 Article ${nonce}`,
      },
      draft: false,
      overrideAccess: true,
    })
    resource = await payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        body: `Distinctive public learning resource ${nonce}.`,
        categories: [category.id],
        contentType: 'resource',
        excerpt: `Practical alumni resource ${nonce}.`,
        publishedAt,
        slug: `phase3-resource-${nonce}`,
        title: `Phase 3 Resource ${nonce}`,
      },
      draft: false,
      overrideAccess: true,
    })
    draft = await payload.create({
      collection: 'posts',
      data: {
        _status: 'draft',
        body: `Unpublished private content ${nonce}.`,
        categories: [category.id],
        contentType: 'article',
        excerpt: `Unpublished searchable insight ${nonce}.`,
        slug: `phase3-draft-${nonce}`,
        title: `Phase 3 Draft ${nonce}`,
      },
      draft: true,
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    if (submission?.id) {
      await payload.delete({
        collection: 'contactSubmissions',
        id: submission.id,
        overrideAccess: true,
      })
    }
    for (const post of [article, resource, draft]) {
      if (post?.id) await payload.delete({ collection: 'posts', id: post.id, overrideAccess: true })
    }
    if (category?.id) {
      await payload.delete({ collection: 'categories', id: category.id, overrideAccess: true })
    }
  })

  it('rejects unvalidated contact writes and protects submissions from public reads', async () => {
    await expect(
      payload.create({
        collection: 'contactSubmissions',
        data: {
          email: `contact-${nonce}@example.test`,
          message: 'This direct write must not bypass the public route validation.',
          name: 'Direct Writer',
          status: 'closed',
          subject: 'Attempted direct write',
          submittedAt: '2000-01-01T00:00:00.000Z',
          topic: 'general',
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    submission = await payload.create({
      collection: 'contactSubmissions',
      context: { publicContactSubmissionValidated: true },
      data: {
        email: `contact-${nonce}@example.test`,
        internalNotes: 'Untrusted internal note',
        message: 'This validated inquiry should be stored for an administrator to review.',
        name: 'Phase Three Contact',
        status: 'closed',
        subject: 'Membership question',
        submittedAt: '2000-01-01T00:00:00.000Z',
        topic: 'membership',
      },
      overrideAccess: false,
    })

    expect(submission.status).toBe('new')
    expect(submission.internalNotes).toBeFalsy()
    expect(new Date(submission.submittedAt).getUTCFullYear()).not.toBe(2000)
    await expect(
      payload.find({ collection: 'contactSubmissions', overrideAccess: false }),
    ).rejects.toThrow()

    const adminView = await payload.find({
      collection: 'contactSubmissions',
      overrideAccess: false,
      user: admin,
      where: { id: { equals: submission.id } },
    })
    expect(adminView.docs).toHaveLength(1)
  })

  it('searches and filters published learning content without leaking drafts', async () => {
    const searched = await getLearningPosts({ query: `engineering insight ${nonce}` })
    expect(searched.docs.map((post) => post.id)).toEqual([article.id])

    const filtered = await getLearningPosts({
      category: category.slug,
      contentType: 'resource',
    })
    expect(filtered.docs.map((post) => post.id)).toEqual([resource.id])

    const categoryResults = await getLearningPosts({ category: category.slug })
    expect(categoryResults.docs.map((post) => post.id)).toEqual(
      expect.arrayContaining([article.id, resource.id]),
    )
    expect(categoryResults.docs.map((post) => post.id)).not.toContain(draft.id)
  })

  it('returns related published content from a shared category', async () => {
    const related = await getRelatedPosts(article)
    expect(related.map((post) => post.id)).toContain(resource.id)
    expect(related.map((post) => post.id)).not.toContain(article.id)
    expect(related.map((post) => post.id)).not.toContain(draft.id)
  })

  it('keeps the seeded institutional, contact, legal, navigation, and SEO models complete', async () => {
    const [about, contact, privacy, header, seo] = await Promise.all([
      payload.find({
        collection: 'pages',
        limit: 1,
        overrideAccess: false,
        where: { slug: { equals: 'about' } },
      }),
      payload.find({
        collection: 'pages',
        limit: 1,
        overrideAccess: false,
        where: { slug: { equals: 'contact' } },
      }),
      payload.find({
        collection: 'pages',
        limit: 1,
        overrideAccess: false,
        where: { slug: { equals: 'privacy-policy' } },
      }),
      payload.findGlobal({ slug: 'header' }),
      payload.findGlobal({ slug: 'seoDefaults' }),
    ])

    expect(about.docs[0]).toMatchObject({ pageType: 'institutional' })
    expect(about.docs[0]?.sections?.map((section) => section.anchor)).toEqual(
      expect.arrayContaining(['mission', 'vision', 'governance']),
    )
    expect(contact.docs[0]?.sections?.length).toBeGreaterThan(0)
    expect(privacy.docs[0]).toMatchObject({ legalStatus: 'placeholder', pageType: 'legal' })
    expect(privacy.docs[0]?.sections?.length).toBeGreaterThan(1)
    expect(header.mainLinks?.some((item) => (item.children?.length ?? 0) > 0)).toBe(true)
    expect(seo.siteName).toBe('RUETIAN USA')
  })
})
