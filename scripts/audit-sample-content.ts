import { getPayload } from 'payload'

import config from '../src/payload.config'

const payload = await getPayload({ config })

const minimums = [
  ['pages', 13],
  ['chapters', 4],
  ['committeeTerms', 5],
  ['historyEntries', 3],
  ['posts', 4],
  ['events', 4],
  ['announcements', 3],
  ['categories', 2],
  ['promotions', 1],
] as const

let failed = false
for (const [collection, minimum] of minimums) {
  const result = await payload.count({ collection, overrideAccess: true })
  const ready = result.totalDocs >= minimum
  console.log(`${collection}: ${result.totalDocs} (minimum ${minimum}) ${ready ? 'OK' : 'MISSING'}`)
  if (!ready) failed = true
}

const [footer, home, siteSettings] = await Promise.all([
  payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true }),
  payload.findGlobal({ slug: 'home', depth: 0, overrideAccess: true }),
  payload.findGlobal({ slug: 'siteSettings', depth: 0, overrideAccess: true }),
])

if (!home.heroTitle || !home.heroDescription) {
  console.error('home: MISSING required sample hero content')
  failed = true
} else {
  console.log('home: required sample hero content OK')
}

if (
  !siteSettings.organizationName ||
  !siteSettings.primaryEmail ||
  !siteSettings.chapterSupportEmail ||
  !siteSettings.primaryPhone ||
  !siteSettings.mailingAddress ||
  !siteSettings.zelleRecipient
) {
  console.error('siteSettings: MISSING organization, contact, address, or Zelle sample content')
  failed = true
} else {
  console.log('siteSettings: organization, contact, address, and Zelle sample content OK')
}

if (!footer.socialLinks?.length) {
  console.error('footer: MISSING sample social destinations')
  failed = true
} else {
  console.log('footer: sample social destinations OK')
}

await payload.destroy()

if (failed) {
  console.error('Sample content audit failed.')
  process.exit(1)
}

console.log('Sample content audit passed.')
process.exit(0)
