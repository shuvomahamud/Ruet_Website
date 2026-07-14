import { env } from '@/utilities/env'

export const imageSource = (value: string): string => {
  try {
    const url = new URL(value)
    const siteURL = new URL(env.NEXT_PUBLIC_SITE_URL)
    return url.origin === siteURL.origin ? `${url.pathname}${url.search}` : value
  } catch {
    return value
  }
}
