import type { CollectionConfig } from 'payload'

import { announcementReadAccess } from '@/access/announcements'
import {
  chapterScopedAccess,
  elevatedOnly,
} from '@/access/roles'
import { enforceManagedChapter } from '@/hooks/enforceManagedChapter'
import { validateAnnouncement } from '@/hooks/validateAnnouncement'
import { validateSafeHref } from '@/utilities/links'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  access: {
    create: elevatedOnly,
    delete: chapterScopedAccess('chapter'),
    read: announcementReadAccess,
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
      validate: (value: unknown) =>
        value === null || value === undefined || value === '' ? true : validateSafeHref(value),
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
    beforeChange: [enforceManagedChapter('chapter'), validateAnnouncement],
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
