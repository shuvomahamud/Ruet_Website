import type { CollectionBeforeChangeHook } from 'payload'

const requiredProfileFields = [
  'firstName',
  'lastName',
  'ruetDepartment',
  'graduationYear',
  'city',
  'state',
  'country',
  'primaryChapter',
] as const

export const deriveProfileStatus: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const values = Object.fromEntries(
    requiredProfileFields.map((field) => [field, data[field] ?? originalDoc?.[field]]),
  )
  const termsAcceptedAt = data.termsAcceptedAt ?? originalDoc?.termsAcceptedAt
  const privacyAcceptedAt = data.privacyAcceptedAt ?? originalDoc?.privacyAcceptedAt

  return {
    ...data,
    profileStatus:
      requiredProfileFields.every((field) => Boolean(values[field])) &&
      Boolean(termsAcceptedAt) &&
      Boolean(privacyAcceptedAt)
        ? 'complete'
        : 'incomplete',
  }
}
