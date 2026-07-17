import type { CollectionBeforeChangeHook } from 'payload'

export const normalizeRollNumberValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '')
  return normalized || undefined
}

export const normalizeRollNumber: CollectionBeforeChangeHook = ({ data }) => {
  if (!Object.prototype.hasOwnProperty.call(data, 'rollNumber')) return data
  return { ...data, rollNumber: normalizeRollNumberValue(data.rollNumber) }
}
