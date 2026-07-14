import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { env } from '@/utilities/env'
import { getSeoDefaults } from '@/utilities/payload-public'

type SEOOverrides = {
  description?: string | null
  image?: Media | number | null
  noIndex?: boolean | null
  title?: string | null
}

const imageURL = (image: Media | number | null | undefined): string | undefined => {
  if (!image || typeof image === 'number' || !image.url) return undefined
  return new URL(image.url, env.NEXT_PUBLIC_SITE_URL).toString()
}

export const createPageMetadata = async ({
  canonicalPath,
  description,
  seo,
  title,
  type = 'website',
}: {
  canonicalPath: string
  description?: string | null
  seo?: SEOOverrides | null
  title: string
  type?: 'article' | 'website'
}): Promise<Metadata> => {
  const defaults = await getSeoDefaults()
  const resolvedTitle = seo?.title || title
  const siteName = defaults.siteName || 'RUETIAN USA'
  const titleSuffix = defaults.titleSuffix || ` | ${siteName}`
  const metadataTitle = resolvedTitle.includes(siteName)
    ? resolvedTitle
    : `${resolvedTitle}${titleSuffix}`
  const resolvedDescription =
    seo?.description || description || defaults.defaultDescription || undefined
  const resolvedImage = imageURL(seo?.image) || imageURL(defaults.defaultImage)
  const canonical = new URL(canonicalPath, env.NEXT_PUBLIC_SITE_URL).toString()

  return {
    alternates: { canonical },
    description: resolvedDescription,
    openGraph: {
      description: resolvedDescription,
      images: resolvedImage ? [{ url: resolvedImage }] : undefined,
      siteName,
      title: metadataTitle,
      type,
      url: canonical,
    },
    robots: seo?.noIndex ? { follow: false, index: false } : undefined,
    title: { absolute: metadataTitle },
    twitter: {
      card: resolvedImage ? 'summary_large_image' : 'summary',
      creator: defaults.socialHandle || undefined,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
      title: metadataTitle,
    },
  }
}
