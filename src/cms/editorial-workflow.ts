import type { CollectionBeforeChangeHook, Field, GeneratePreviewURL } from 'payload'

import { elevatedFieldOnly, getRole, isAdmin, serverFieldOnly } from '@/access/roles'
import { AppError } from '@/utilities/errors'

export type PublicContentCollection =
  | 'announcements'
  | 'chapters'
  | 'committeeTerms'
  | 'events'
  | 'historyEntries'
  | 'pages'
  | 'posts'

export const editorialFields = (): Field[] => [
  {
    name: 'editorialStatus',
    type: 'select',
    access: {
      create: elevatedFieldOnly,
      read: elevatedFieldOnly,
      update: elevatedFieldOnly,
    },
    admin: {
      description:
        'Draft: still being edited. In review: ready for an administrator. Approved: may be published.',
      position: 'sidebar',
    },
    defaultValue: 'draft',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'In review', value: 'inReview' },
      { label: 'Approved', value: 'approved' },
    ],
  },
  {
    name: 'reviewNote',
    type: 'textarea',
    access: {
      create: elevatedFieldOnly,
      read: elevatedFieldOnly,
      update: elevatedFieldOnly,
    },
    admin: {
      description: 'Internal note for the editor and reviewer. This is never exposed publicly.',
      position: 'sidebar',
    },
  },
  {
    name: 'reviewedBy',
    type: 'relationship',
    access: {
      create: serverFieldOnly,
      read: elevatedFieldOnly,
      update: serverFieldOnly,
    },
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
    relationTo: 'users',
  },
  {
    name: 'reviewedAt',
    type: 'date',
    access: {
      create: serverFieldOnly,
      read: elevatedFieldOnly,
      update: serverFieldOnly,
    },
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
]

/**
 * Keeps authoring and approval separate for chapter editors and prevents Payload's publish action
 * from bypassing the explicit review state. Seed/migration operations may opt in to the narrowly
 * scoped `editorialWorkflowBypass` request context.
 */
export const enforceEditorialWorkflow: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (req.context?.editorialWorkflowBypass === true) return data

  // Anonymous local operations can reach this hook only when trusted code explicitly overrides
  // collection access. Preserve existing migrations, tests, and server workflows without creating
  // a public bypass; unauthenticated HTTP mutations are rejected by collection access first.
  if (!req.user && data._status === 'published') {
    data.editorialStatus = 'approved'
    return data
  }

  const role = getRole(req.user)
  const editorialStatus = String(data.editorialStatus ?? originalDoc?.editorialStatus ?? 'draft')
  const payloadStatus = String(data._status ?? originalDoc?._status ?? 'draft')

  if (role === 'chapterAdmin' && editorialStatus === 'approved') {
    throw new AppError('Chapter editors must submit content for administrator review.', {
      code: 'EDITORIAL_APPROVAL_REQUIRED',
      status: 403,
    })
  }

  if (role === 'chapterAdmin' && payloadStatus === 'published') {
    throw new AppError('Only an administrator can publish reviewed content.', {
      code: 'EDITORIAL_PUBLISH_FORBIDDEN',
      status: 403,
    })
  }

  if (payloadStatus === 'published' && editorialStatus !== 'approved') {
    throw new AppError('Content must be approved before it can be published.', {
      code: 'EDITORIAL_APPROVAL_REQUIRED',
      status: 409,
    })
  }

  const wasApproved = originalDoc?.editorialStatus === 'approved'
  if (editorialStatus === 'approved' && !wasApproved) {
    if (!isAdmin(req.user)) {
      throw new AppError('Only an administrator can approve content.', {
        code: 'EDITORIAL_APPROVAL_FORBIDDEN',
        status: 403,
      })
    }
    data.reviewedBy = req.user?.id
    data.reviewedAt = new Date().toISOString()
  } else if (editorialStatus !== 'approved' && wasApproved) {
    data.reviewedBy = null
    data.reviewedAt = null
  }

  return data
}

export const createPreviewURL =
  (collection: PublicContentCollection): GeneratePreviewURL =>
  (doc) => {
    if (doc.id === null || doc.id === undefined) return null
    return `/preview/${collection}/${encodeURIComponent(String(doc.id))}`
  }
