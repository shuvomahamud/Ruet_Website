import type { MetadataRoute } from 'next'

import { env } from '@/utilities/env'

export default function robots(): MetadataRoute.Robots {
  const siteURL = new URL(env.NEXT_PUBLIC_SITE_URL)

  return {
    host: siteURL.origin,
    rules: {
      allow: '/',
      disallow: [
        '/account/',
        '/admin/',
        '/api/',
        '/chapter-requests/',
        '/communications/',
        '/dashboard',
        '/events/registrations/',
        '/membership/payments/',
        '/payments/',
        '/preview/',
        '/reports',
      ],
      userAgent: '*',
    },
    sitemap: new URL('/sitemap.xml', siteURL).toString(),
  }
}
