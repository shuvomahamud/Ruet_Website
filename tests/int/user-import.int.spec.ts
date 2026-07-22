import { createLocalReq, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Chapter, User } from '@/payload-types'
import {
  createUserImportTemplate,
  importUsersFromCSV,
  parseUserImportCSV,
  USER_IMPORT_HEADERS,
} from '@/services/user-import'
import { getTestPayload } from '../helpers/payload'

describe.sequential('administrator CSV user import', () => {
  let payload: Payload
  let admin: User
  let chapter: Chapter
  const createdUserIDs: number[] = []
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  beforeAll(async () => {
    payload = await getTestPayload()
    admin = await payload.create({
      collection: 'users',
      context: { seedTestUser: true },
      data: {
        accountStatus: 'active',
        email: `csv-admin-${nonce}@example.test`,
        password: `Csv-Admin-${nonce}-9A`,
        role: 'admin',
      },
      overrideAccess: true,
    })
    chapter = await payload.create({
      collection: 'chapters',
      context: { editorialWorkflowBypass: true },
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `CSV Import Chapter ${nonce}`,
        slug: `csv-import-${nonce}`,
        summary: 'Chapter used for partial CSV import testing.',
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    const logs = await payload.find({
      collection: 'auditLogs',
      limit: 100,
      overrideAccess: true,
      where: { actor: { equals: admin?.id } },
    })
    for (const log of logs.docs)
      await payload.delete({ collection: 'auditLogs', id: log.id, overrideAccess: true })
    for (const id of createdUserIDs)
      await payload.delete({ collection: 'users', id, overrideAccess: true })
    if (chapter?.id)
      await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
    if (admin?.id) await payload.delete({ collection: 'users', id: admin.id, overrideAccess: true })
  })

  it('publishes the canonical sample template', () => {
    expect(createUserImportTemplate().replace(/^\uFEFF/, '')).toMatch(
      new RegExp(`^${USER_IMPORT_HEADERS.join(',')}`),
    )
    expect(createUserImportTemplate()).toContain('replace-with-active-chapter-slug')
  })

  it('reports missing file headers', () => {
    const parsed = parseUserImportCSV('email,first_name\nmember@example.test,Member\n')
    expect(parsed.fileErrors.map((error) => error.field)).toContain('roll_number')
  })

  it('imports valid rows while retaining row-level errors for invalid rows', async () => {
    const goodEmail = `csv-good-${nonce}@example.test`
    const badEmail = `csv-bad-${nonce}@example.test`
    const csv = [
      USER_IMPORT_HEADERS.join(','),
      [
        goodEmail,
        'CSV',
        'Member',
        ` CSV ${nonce} `,
        'CSE',
        chapter.slug,
        'New York',
        'NY',
        'United States',
        '',
        '',
        '',
        '',
      ].join(','),
      [
        badEmail,
        'Missing',
        'Department',
        `BAD-${nonce}`,
        '',
        chapter.slug,
        'Boston',
        'MA',
        'United States',
        '',
        '',
        '',
        '',
      ].join(','),
    ].join('\n')

    const req = await createLocalReq({ user: admin }, payload)
    const result = await importUsersFromCSV(req, csv)
    expect(result.importedCount).toBe(1)
    expect(result.skippedCount).toBe(1)
    expect(result.rows.find((row) => row.email === badEmail)?.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'ruet_department' })]),
    )

    const imported = await payload.find({
      collection: 'users',
      limit: 1,
      overrideAccess: true,
      where: { email: { equals: goodEmail } },
    })
    expect(imported.docs).toHaveLength(1)
    expect(imported.docs[0]?.accountStatus).toBe('pending')
    expect(imported.docs[0]?.rollNumber).not.toContain(' ')
    createdUserIDs.push(...imported.docs.map((user) => user.id))
  })
})
