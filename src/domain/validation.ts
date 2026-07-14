export const validateNonNegativeMoney = (value: unknown): string | true =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? true
    : 'Enter a non-negative monetary amount.'

export const validatePositiveInteger = (value: unknown): string | true =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? true
    : 'Enter a positive whole number.'

export const validateNonNegativeInteger = (value: unknown): string | true =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? true
    : 'Enter zero or a positive whole number.'

export const validateUSD = (value: unknown): string | true =>
  value === 'USD' ? true : 'Only USD is supported at launch.'

export const validateOptionalNonNegativeMoney = (value: unknown): string | true =>
  value === null || value === undefined ? true : validateNonNegativeMoney(value)
