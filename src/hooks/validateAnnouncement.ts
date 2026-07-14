import type { CollectionBeforeChangeHook } from 'payload'

import { AppError } from '@/utilities/errors'
import { isSafeHref } from '@/utilities/links'

const resolved = (data: Record<string, unknown>, originalDoc: Record<string, unknown> | undefined, field: string) =>
  Object.prototype.hasOwnProperty.call(data, field) ? data[field] : originalDoc?.[field]

export const validateAnnouncement: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const activeFrom = resolved(data, originalDoc, 'activeFrom')
  const activeTo = resolved(data, originalDoc, 'activeTo')
  if (activeFrom && activeTo && new Date(String(activeTo)) <= new Date(String(activeFrom))) {
    throw new AppError('Announcement end time must be after its start time.', {
      code: 'INVALID_ANNOUNCEMENT_WINDOW',
      status: 400,
    })
  }

  const ctaLabel = resolved(data, originalDoc, 'ctaLabel')
  const ctaHref = resolved(data, originalDoc, 'ctaHref')
  if (Boolean(ctaLabel) !== Boolean(ctaHref)) {
    throw new AppError('Announcement CTA label and destination must be provided together.', {
      code: 'INCOMPLETE_ANNOUNCEMENT_CTA',
      status: 400,
    })
  }
  if (ctaHref && !isSafeHref(String(ctaHref))) {
    throw new AppError('Announcement CTA must use a safe internal, HTTP(S), email, or phone link.', {
      code: 'UNSAFE_ANNOUNCEMENT_CTA',
      status: 400,
    })
  }

  const publishing = data._status === 'published' && originalDoc?._status !== 'published'
  return publishing && !data.publishedAt
    ? { ...data, publishedAt: new Date().toISOString() }
    : data
}
