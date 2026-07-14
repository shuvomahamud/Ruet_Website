export const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    notation: 'compact',
  }).format(value)

export const formatCurrency = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', {
    currency,
    style: 'currency',
  }).format(value)
