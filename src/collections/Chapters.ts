import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import {
  adminFieldOnly,
  managedChapterAccessByDocumentID,
  publishedOrManagedChapterDocumentAccess,
  superAdminsOnly,
} from '@/access/roles'
import {
  createPreviewURL,
  editorialFields,
  enforceEditorialWorkflow,
} from '@/cms/editorial-workflow'
import { revalidateCollectionPaths } from '@/cms/revalidation'
import { seoFields } from '@/fields/seo'

const revalidation = revalidateCollectionPaths(['/chapters', '/chapters/[slug]'])

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: publishedOrManagedChapterDocumentAccess,
    update: managedChapterAccessByDocumentID,
  },
  admin: {
    defaultColumns: ['name', 'chapterStatus', 'editorialStatus', '_status', 'updatedAt'],
    description: 'Regional chapter profiles, contacts, administrators, and public visibility.',
    listSearchableFields: ['name', 'slug', 'regionOrState', 'summary'],
    preview: createPreviewURL('chapters'),
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      access: {
        update: adminFieldOnly,
      },
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'chapterStatus',
      type: 'select',
      access: {
        update: adminFieldOnly,
      },
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Planning', value: 'planning' },
      ],
      required: true,
    },
    {
      name: 'regionOrState',
      type: 'text',
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'chapterAdmins',
      type: 'relationship',
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
      hasMany: true,
      relationTo: 'users',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    seoFields(),
    ...editorialFields(),
  ],
  hooks: {
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
    beforeChange: [enforceEditorialWorkflow],
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
