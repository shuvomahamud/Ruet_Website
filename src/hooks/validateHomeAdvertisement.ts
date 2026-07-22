import type { GlobalBeforeChangeHook } from 'payload'

import type { Media } from '@/payload-types'
import { AppError } from '@/utilities/errors'

export const validateHomeAdvertisement: GlobalBeforeChangeHook = async ({ data, req }) => {
  const advertisement = data.heroAdvertisement as
    | {
        body?: string | null
        enabled?: boolean | null
        headline?: string | null
        media?: Media | number | null
        type?: 'image' | 'text' | 'video' | null
      }
    | null
    | undefined

  if (!advertisement?.enabled) return data
  const type = advertisement.type ?? 'text'
  if (type === 'text' && !advertisement.headline?.trim() && !advertisement.body?.trim()) {
    throw new AppError('A text advertisement needs a headline or body.', {
      code: 'ADVERTISEMENT_CONTENT_REQUIRED',
      status: 400,
    })
  }
  if (type === 'text') return data

  const mediaID =
    typeof advertisement.media === 'number' ? advertisement.media : advertisement.media?.id
  if (!mediaID) {
    throw new AppError(
      `Select ${type === 'image' ? 'an image' : 'a video'} for this advertisement.`,
      {
        code: 'ADVERTISEMENT_MEDIA_REQUIRED',
        status: 400,
      },
    )
  }

  const media = await req.payload.findByID({
    collection: 'media',
    depth: 0,
    id: mediaID,
    overrideAccess: true,
    req,
  })
  if (media.visibility !== 'public') {
    throw new AppError('Advertisement media must have public visibility.', {
      code: 'ADVERTISEMENT_MEDIA_PRIVATE',
      status: 400,
    })
  }
  if (!media.mimeType?.startsWith(`${type}/`)) {
    throw new AppError(`The selected file must be ${type === 'image' ? 'an image' : 'a video'}.`, {
      code: 'ADVERTISEMENT_MEDIA_TYPE',
      status: 400,
    })
  }
  return data
}
