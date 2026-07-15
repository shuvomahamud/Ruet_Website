import { getPayload } from 'payload'

import config from '../src/payload.config'

const payload = await getPayload({ config })
let failed = false

const check = (condition: boolean, label: string) => {
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`)
  if (!condition) failed = true
}

const isPlaceholder = (value: unknown) =>
  typeof value === 'string' &&
  /(example\.(com|test)|@example|\bsample\b|555-01\d{2}|replace[-_ ]?me)/i.test(value)

const [siteSettings, footer, activePlans, legalPages, chapters, elevatedUsers] = await Promise.all([
  payload.findGlobal({ slug: 'siteSettings', depth: 0, overrideAccess: true }),
  payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true }),
  payload.find({
    collection: 'membershipPlans',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: { active: { equals: true } },
  }),
  payload.find({
    collection: 'pages',
    depth: 0,
    limit: 10,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { slug: { in: ['privacy-policy', 'terms-of-use', 'membership-terms'] } },
        { _status: { equals: 'published' } },
        { editorialStatus: { equals: 'approved' } },
        { legalStatus: { equals: 'approved' } },
      ],
    },
  }),
  payload.find({
    collection: 'chapters',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: { and: [{ chapterStatus: { equals: 'active' } }, { _status: { equals: 'published' } }] },
  }),
  payload.find({
    collection: 'users',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { accountStatus: { equals: 'active' } },
        { _verified: { equals: true } },
        { role: { in: ['admin', 'superAdmin'] } },
      ],
    },
  }),
])

check(siteSettings._status === 'published', 'Site Settings are published')
check(!isPlaceholder(siteSettings.primaryEmail), 'primary organization email is not a sample')
check(!isPlaceholder(siteSettings.chapterSupportEmail), 'chapter support email is not a sample')
check(!isPlaceholder(siteSettings.primaryPhone), 'organization phone is not a sample')
check(!isPlaceholder(siteSettings.mailingAddress), 'mailing address is not a sample')
check(!isPlaceholder(siteSettings.zelleRecipient), 'Zelle recipient is not a sample')
check(
  Boolean(siteSettings.manualPaymentReviewNote?.trim()),
  'manual-review language intentionally states the selected timing policy',
)
check(
  Number(siteSettings.paymentProofRetentionDays) >= 30,
  'payment-proof retention period is configured',
)

check(activePlans.docs.length === 1, 'exactly one active membership plan exists')
check(legalPages.docs.length === 3, 'all three approved legal pages are published')
check(chapters.docs.length > 0, 'at least one active chapter is published')
check(
  chapters.docs.every(
    (chapter) =>
      !isPlaceholder(chapter.contactEmail) &&
      !isPlaceholder(chapter.summary) &&
      !isPlaceholder(chapter.description),
  ),
  'published chapter copy and contacts contain no sample markers',
)
check(
  !(footer.socialLinks ?? []).some(
    (link) => isPlaceholder(link.href) || isPlaceholder(link.label),
  ),
  'footer social links contain no sample destinations',
)

const realElevatedUsers = elevatedUsers.docs.filter((user) => !isPlaceholder(user.email))
check(
  realElevatedUsers.some((user) => user.role === 'superAdmin'),
  'a verified, active, non-test super administrator exists',
)
check(
  realElevatedUsers.some((user) => user.role === 'admin'),
  'a verified, active, non-test least-privilege administrator exists',
)

for (const variable of [
  'LAUNCH_CONTENT_APPROVED_BY',
  'LAUNCH_OPERATIONS_OWNER',
  'LAUNCH_SECURITY_CONTACT',
  'LAUNCH_UAT_SIGNED_OFF_BY',
]) {
  check(Boolean(process.env[variable]?.trim()), `${variable} records a named launch owner`)
}

await payload.destroy()

if (failed) {
  console.error('Launch readiness audit failed. No deployment should be promoted.')
  process.exit(1)
}

console.log('Launch readiness audit passed.')
