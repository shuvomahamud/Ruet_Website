import type { CollectionConfig } from 'payload'

import type { Where } from 'payload'

import {
  chapterScopedAccess,
  elevatedOnly,
  getManagedChapterIDs,
  getRole,
  isAdmin,
} from '@/access/roles'
import { enforceManagedChapter } from '@/hooks/enforceManagedChapter'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  access: {
    create: elevatedOnly,
    delete: chapterScopedAccess('chapter'),
    read: ({ req: { user } }) => {
      if (isAdmin(user)) return true

      const publishedAudience: Where = {
        and: [
          { _status: { equals: 'published' } },
          ...(user ? [] : [{ audience: { equals: 'public' } }]),
        ],
      }

      if (getRole(user) !== 'chapterAdmin') return publishedAudience

      const managedChapterIDs = getManagedChapterIDs(user)
      return {
        or: [
          publishedAudience,
          ...(managedChapterIDs.length ? [{ chapter: { in: managedChapterIDs } }] : []),
        ],
      } as Where
    },
    update: chapterScopedAccess('chapter'),
  },
  admin: {
    defaultColumns: ['title', 'chapter', 'audience', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'details',
      type: 'textarea',
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'audience',
      type: 'select',
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Members', value: 'members' },
      ],
      required: true,
    },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Alert', value: 'alert' },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
    },
    {
      name: 'ctaHref',
      type: 'text',
    },
    {
      name: 'activeFrom',
      type: 'date',
    },
    {
      name: 'activeTo',
      type: 'date',
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
  ],
  hooks: {
    beforeChange: [enforceManagedChapter('chapter')],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 250,
      },
      schedulePublish: true,
    },
  },
}
