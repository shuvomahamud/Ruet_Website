import { parse } from 'csv-parse/sync'
import type { PayloadRequest } from 'payload'
import { z } from 'zod'

import { generateOpaqueToken } from '@/auth/crypto'
import { normalizeRollNumberValue } from '@/hooks/normalizeRollNumber'
import type { Chapter, User } from '@/payload-types'
import { writeAuditLog } from '@/services/audit'

export const USER_IMPORT_MAX_BYTES = 2 * 1024 * 1024
export const USER_IMPORT_MAX_ROWS = 1_000

export const USER_IMPORT_HEADERS = [
  'email',
  'first_name',
  'last_name',
  'roll_number',
  'ruet_department',
  'primary_chapter_slug',
  'city',
  'state',
  'country',
  'phone_number',
  'alumni_reference',
  'employer',
  'professional_title',
] as const

export const USER_IMPORT_REQUIRED_HEADERS = USER_IMPORT_HEADERS.slice(0, 9)

export type UserImportError = {
  code: string
  field?: string
  message: string
}

export type UserImportRowResult = {
  email?: string
  errors: UserImportError[]
  original: Record<string, string>
  row: number
  status: 'invalid' | 'ready'
  userID?: number
}

export type UserImportValidation = {
  fileErrors: UserImportError[]
  invalidCount: number
  readyCount: number
  rows: UserImportRowResult[]
  totalRows: number
  warnings: string[]
}

export type UserImportResult = UserImportValidation & {
  importedCount: number
  skippedCount: number
}

type NormalizedUserRow = {
  alumniReference?: string
  city: string
  country: string
  email: string
  employer?: string
  firstName: string
  lastName: string
  phoneNumber?: string
  primaryChapter: number
  professionalTitle?: string
  rollNumber: string
  ruetDepartment: string
  state: string
}

type ParsedRow = {
  original: Record<string, string>
  row: number
}

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`)

const rowSchema = z.object({
  city: requiredText('City', 120),
  country: requiredText('Country', 120),
  email: z.email('Enter a valid email address.').transform((value) => value.toLowerCase()),
  first_name: requiredText('First name', 80),
  last_name: requiredText('Last name', 80),
  primary_chapter_slug: requiredText('Primary chapter slug', 160).transform((value) =>
    value.toLowerCase(),
  ),
  roll_number: requiredText('Roll number', 40).transform(
    (value) => normalizeRollNumberValue(value) ?? '',
  ),
  ruet_department: requiredText('RUET department', 120),
  state: requiredText('State', 120),
})

const optionalValue = (value: string | undefined, max: number): string | undefined => {
  const normalized = value?.trim()
  if (!normalized) return undefined
  return normalized.slice(0, max)
}

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()

export const createUserImportTemplate = (): string =>
  `\uFEFF${USER_IMPORT_HEADERS.join(',')}\r\nmember@example.test,First,Last,RUET_ROLL_NUMBER,CSE,replace-with-active-chapter-slug,New York,NY,United States,,,,\r\n`

export const parseUserImportCSV = (
  csv: string,
): { fileErrors: UserImportError[]; rows: ParsedRow[]; warnings: string[] } => {
  let records: string[][]
  try {
    records = parse(csv, {
      bom: true,
      relax_column_count: true,
      skip_empty_lines: true,
    }) as string[][]
  } catch (error) {
    return {
      fileErrors: [
        {
          code: 'malformed_csv',
          message: error instanceof Error ? error.message : 'The CSV could not be parsed.',
        },
      ],
      rows: [],
      warnings: [],
    }
  }

  if (!records.length) {
    return {
      fileErrors: [{ code: 'empty_file', message: 'The CSV is empty.' }],
      rows: [],
      warnings: [],
    }
  }

  const headers = records[0]!.map(normalizeHeader)
  const duplicateHeaders = headers.filter(
    (header, index) => header && headers.indexOf(header) !== index,
  )
  const missingHeaders = USER_IMPORT_REQUIRED_HEADERS.filter((header) => !headers.includes(header))
  const fileErrors: UserImportError[] = [
    ...missingHeaders.map((field) => ({
      code: 'missing_header',
      field,
      message: `Required column “${field}” is missing.`,
    })),
    ...Array.from(new Set(duplicateHeaders)).map((field) => ({
      code: 'duplicate_header',
      field,
      message: `Column “${field}” appears more than once.`,
    })),
  ]
  const unknownHeaders = headers.filter(
    (header): header is string =>
      Boolean(header) && !(USER_IMPORT_HEADERS as readonly string[]).includes(header),
  )
  const warnings = unknownHeaders.length
    ? [`Ignored unrecognized column(s): ${Array.from(new Set(unknownHeaders)).join(', ')}.`]
    : []

  const rows = records.slice(1).map((record, index) => ({
    original: Object.fromEntries(
      headers.map((header, column) => [
        header || `column_${column + 1}`,
        String(record[column] ?? '').trim(),
      ]),
    ),
    row: index + 2,
  }))

  if (rows.length > USER_IMPORT_MAX_ROWS) {
    fileErrors.push({
      code: 'too_many_rows',
      message: `The CSV contains ${rows.length} rows; the maximum is ${USER_IMPORT_MAX_ROWS}.`,
    })
  }

  return { fileErrors, rows: rows.slice(0, USER_IMPORT_MAX_ROWS), warnings }
}

const zodErrors = (error: z.ZodError): UserImportError[] =>
  error.issues.map((issue) => ({
    code: issue.code,
    field: String(issue.path[0] ?? 'row'),
    message: issue.message,
  }))

export const validateUserImport = async (
  req: PayloadRequest,
  csv: string,
): Promise<UserImportValidation> => {
  const parsed = parseUserImportCSV(csv)
  if (parsed.fileErrors.length) {
    return {
      fileErrors: parsed.fileErrors,
      invalidCount: parsed.rows.length,
      readyCount: 0,
      rows: parsed.rows.map((row) => ({
        ...row,
        errors: parsed.fileErrors,
        status: 'invalid' as const,
      })),
      totalRows: parsed.rows.length,
      warnings: parsed.warnings,
    }
  }

  const preliminary = parsed.rows.map(({ original, row }) => {
    const result = rowSchema.safeParse(original)
    const errors = result.success ? [] : zodErrors(result.error)
    for (const field of [
      'phone_number',
      'alumni_reference',
      'employer',
      'professional_title',
    ] as const) {
      if ((original[field]?.trim().length ?? 0) > 120)
        errors.push({
          code: 'too_big',
          field,
          message: `${field.replaceAll('_', ' ')} must be 120 characters or fewer.`,
        })
    }
    return {
      email: result.success ? result.data.email : optionalValue(original.email, 320)?.toLowerCase(),
      errors,
      original,
      parsed: result.success ? result.data : null,
      row,
    }
  })

  const emails = preliminary.flatMap((item) => (item.parsed ? [item.parsed.email] : []))
  const rolls = preliminary.flatMap((item) => (item.parsed ? [item.parsed.roll_number] : []))
  const chapterSlugs = preliminary.flatMap((item) =>
    item.parsed ? [item.parsed.primary_chapter_slug] : [],
  )

  const [existingUsers, chapters] = await Promise.all([
    emails.length || rolls.length
      ? req.payload.find({
          collection: 'users',
          depth: 0,
          limit: USER_IMPORT_MAX_ROWS * 2,
          overrideAccess: true,
          pagination: false,
          req,
          where: {
            or: [
              ...(emails.length ? [{ email: { in: emails } }] : []),
              ...(rolls.length ? [{ rollNumber: { in: rolls } }] : []),
            ],
          },
        })
      : Promise.resolve({ docs: [] as User[] }),
    chapterSlugs.length
      ? req.payload.find({
          collection: 'chapters',
          depth: 0,
          limit: USER_IMPORT_MAX_ROWS,
          overrideAccess: true,
          pagination: false,
          req,
          where: {
            and: [
              { slug: { in: chapterSlugs } },
              { chapterStatus: { equals: 'active' } },
              { _status: { equals: 'published' } },
            ],
          },
        })
      : Promise.resolve({ docs: [] as Chapter[] }),
  ])

  const existingEmails = new Set(existingUsers.docs.map((user) => user.email.toLowerCase()))
  const existingRolls = new Set(
    existingUsers.docs.flatMap((user) => (user.rollNumber ? [user.rollNumber] : [])),
  )
  const chaptersBySlug = new Map(
    chapters.docs.map((chapter) => [chapter.slug?.toLowerCase(), chapter.id]),
  )
  const emailCounts = new Map<string, number>()
  const rollCounts = new Map<string, number>()
  for (const item of preliminary) {
    if (!item.parsed) continue
    emailCounts.set(item.parsed.email, (emailCounts.get(item.parsed.email) ?? 0) + 1)
    rollCounts.set(item.parsed.roll_number, (rollCounts.get(item.parsed.roll_number) ?? 0) + 1)
  }

  const rows = preliminary.map<UserImportRowResult & { normalized?: NormalizedUserRow }>((item) => {
    if (!item.parsed) return { ...item, status: 'invalid' }
    const errors = [...item.errors]
    if ((emailCounts.get(item.parsed.email) ?? 0) > 1)
      errors.push({
        code: 'duplicate_in_file',
        field: 'email',
        message: 'Email is duplicated in this CSV.',
      })
    if ((rollCounts.get(item.parsed.roll_number) ?? 0) > 1)
      errors.push({
        code: 'duplicate_in_file',
        field: 'roll_number',
        message: 'Roll number is duplicated in this CSV.',
      })
    if (existingEmails.has(item.parsed.email))
      errors.push({
        code: 'already_exists',
        field: 'email',
        message: 'A user with this email already exists.',
      })
    if (existingRolls.has(item.parsed.roll_number))
      errors.push({
        code: 'already_exists',
        field: 'roll_number',
        message: 'A user with this roll number already exists.',
      })
    const chapterID = chaptersBySlug.get(item.parsed.primary_chapter_slug)
    if (!chapterID)
      errors.push({
        code: 'invalid_chapter',
        field: 'primary_chapter_slug',
        message: 'Chapter must match an active, published chapter slug.',
      })

    return {
      email: item.parsed.email,
      errors,
      normalized: chapterID
        ? {
            alumniReference: optionalValue(item.original.alumni_reference, 120),
            city: item.parsed.city,
            country: item.parsed.country,
            email: item.parsed.email,
            employer: optionalValue(item.original.employer, 120),
            firstName: item.parsed.first_name,
            lastName: item.parsed.last_name,
            phoneNumber: optionalValue(item.original.phone_number, 120),
            primaryChapter: chapterID,
            professionalTitle: optionalValue(item.original.professional_title, 120),
            rollNumber: item.parsed.roll_number,
            ruetDepartment: item.parsed.ruet_department,
            state: item.parsed.state,
          }
        : undefined,
      original: item.original,
      row: item.row,
      status: errors.length ? 'invalid' : 'ready',
    }
  })

  const publicRows = rows.map(({ normalized: _normalized, ...row }) => row)
  const readyCount = publicRows.filter((row) => row.status === 'ready').length
  return {
    fileErrors: [],
    invalidCount: publicRows.length - readyCount,
    readyCount,
    rows: publicRows,
    totalRows: publicRows.length,
    warnings: parsed.warnings,
  }
}

export const importUsersFromCSV = async (
  req: PayloadRequest,
  csv: string,
): Promise<UserImportResult> => {
  const validation = await validateUserImport(req, csv)
  if (validation.fileErrors.length) {
    return { ...validation, importedCount: 0, skippedCount: validation.totalRows }
  }

  const readyChapterSlugs = validation.rows.flatMap((row) =>
    row.status === 'ready' ? [rowSchema.parse(row.original).primary_chapter_slug] : [],
  )
  const currentChapters = readyChapterSlugs.length
    ? await req.payload.find({
        collection: 'chapters',
        depth: 0,
        limit: USER_IMPORT_MAX_ROWS,
        overrideAccess: true,
        pagination: false,
        req,
        where: {
          and: [
            { slug: { in: readyChapterSlugs } },
            { chapterStatus: { equals: 'active' } },
            { _status: { equals: 'published' } },
          ],
        },
      })
    : { docs: [] as Chapter[] }
  const currentChaptersBySlug = new Map(
    currentChapters.docs.map((chapter) => [chapter.slug?.toLowerCase(), chapter.id]),
  )

  const results: UserImportRowResult[] = []
  let importedCount = 0
  for (const row of validation.rows) {
    if (row.status !== 'ready') {
      results.push(row)
      continue
    }

    const parsed = rowSchema.parse(row.original)
    try {
      const chapterID = currentChaptersBySlug.get(parsed.primary_chapter_slug)
      if (!chapterID) throw new Error('Chapter is no longer active and published.')
      const user = await req.payload.create({
        collection: 'users',
        context: { systemGeneratedPassword: true },
        data: {
          accountStatus: 'pending',
          alumniReference: optionalValue(row.original.alumni_reference, 120),
          city: parsed.city,
          country: parsed.country,
          email: parsed.email,
          employer: optionalValue(row.original.employer, 120),
          firstName: parsed.first_name,
          lastName: parsed.last_name,
          password: generateOpaqueToken(48),
          phoneNumber: optionalValue(row.original.phone_number, 120),
          primaryChapter: chapterID,
          professionalTitle: optionalValue(row.original.professional_title, 120),
          role: 'member',
          rollNumber: parsed.roll_number,
          ruetDepartment: parsed.ruet_department,
          state: parsed.state,
        },
        overrideAccess: false,
        req,
      })
      importedCount += 1
      results.push({ ...row, userID: user.id })
    } catch (error) {
      results.push({
        ...row,
        errors: [
          {
            code: 'create_failed',
            message: error instanceof Error ? error.message : 'User could not be created.',
          },
        ],
        status: 'invalid',
      })
    }
  }

  await writeAuditLog(req, {
    action: 'user.csv_import',
    entityID: `batch-${Date.now()}`,
    entityType: 'userImport',
    metadata: {
      importedCount,
      skippedCount: results.length - importedCount,
      totalRows: results.length,
    },
    outcome: importedCount ? 'succeeded' : 'rejected',
  })

  return {
    ...validation,
    importedCount,
    invalidCount: results.length - importedCount,
    readyCount: importedCount,
    rows: results,
    skippedCount: results.length - importedCount,
  }
}
