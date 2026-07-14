import { revalidatePath, revalidateTag } from 'next/cache.js'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

const safelyRevalidate = (run: () => void) => {
  try {
    run()
  } catch {
    // Payload CLI processes do not always have a Next request cache. Web requests do.
  }
}

export const revalidateCollectionPaths = (
  paths: string[],
): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} => ({
  afterChange: ({ doc }) => {
    if (doc._status && doc._status !== 'published') return doc
    for (const path of paths) safelyRevalidate(() => revalidatePath(path, 'page'))
    safelyRevalidate(() => revalidatePath('/', 'page'))
    safelyRevalidate(() => revalidatePath('/sitemap.xml', 'page'))
    return doc
  },
  afterDelete: ({ doc }) => {
    for (const path of paths) safelyRevalidate(() => revalidatePath(path, 'page'))
    safelyRevalidate(() => revalidatePath('/', 'page'))
    safelyRevalidate(() => revalidatePath('/sitemap.xml', 'page'))
    return doc
  },
})

export const revalidateGlobal =
  (slug: string, paths: string[] = ['/']): GlobalAfterChangeHook =>
  ({ doc }) => {
    safelyRevalidate(() => revalidateTag(`global_${slug}`, 'max'))
    for (const path of paths) safelyRevalidate(() => revalidatePath(path, 'layout'))
    return doc
  }
