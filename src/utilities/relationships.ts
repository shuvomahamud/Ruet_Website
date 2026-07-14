export const getRelationshipID = (
  value: number | string | { id?: number | string } | null | undefined,
): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  if (value && typeof value === 'object') return getRelationshipID(value.id)
  return undefined
}
