import type { Access } from 'payload'

import { isAdmin } from './roles'

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user && isAdmin(user)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}

/** Public visitors may read only the published global value, never drafts or version history. */
export const publishedGlobalRead: Access = ({ req }) => {
  if (isAdmin(req.user)) return true

  const queryDraft = req.query?.draft
  const urlDraft = new URL(req.url ?? '/', 'http://payload.local').searchParams.get('draft')
  return !['1', 'true'].includes(String(queryDraft ?? urlDraft ?? '').toLowerCase())
}
