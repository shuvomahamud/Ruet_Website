const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:'])

export const isSafeHref = (value: unknown): boolean => {
  if (typeof value !== 'string') return false
  const href = value.trim()
  if (!href) return false
  if (/\p{Cc}/u.test(href) || href.includes('\\')) return false
  if (href.startsWith('/') && !href.startsWith('//')) return true

  try {
    const url = new URL(href)
    return allowedProtocols.has(url.protocol) && !url.username && !url.password
  } catch {
    return false
  }
}

export const validateSafeHref = (value: unknown) =>
  isSafeHref(value) ? true : 'Use an internal path or an HTTP(S), email, or phone link.'
