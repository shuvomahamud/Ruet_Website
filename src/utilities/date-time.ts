export const formatDateTime = (
  value: Date | string,
  options: Intl.DateTimeFormatOptions = {},
): string => {
  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(date)
}
