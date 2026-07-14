import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminsOnly } from '@/access/roles'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import {
  createPreviewURL,
  editorialFields,
  enforceEditorialWorkflow,
} from '@/cms/editorial-workflow'
import { revalidateCollectionPaths } from '@/cms/revalidation'
import { seoFields } from '@/fields/seo'

const revalidation = revalidateCollectionPaths(['/learning', '/learning/[slug]'])

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: authenticatedOrPublished,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'contentType', 'editorialStatus', '_status', 'publishedAt'],
    description: 'Articles, resources, and organization news for the learning hub.',
    listSearchableFields: ['title', 'slug', 'excerpt', 'authorName'],
    preview: createPreviewURL('posts'),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'richBody',
      type: 'richText',
      admin: {
        description: 'Preferred rich article body. The plain body remains as a legacy fallback.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'categories',
      type: 'relationship',
      hasMany: true,
      relationTo: 'categories',
    },
    {
      name: 'authorName',
      type: 'text',
    },
    {
      name: 'readingTimeMinutes',
      type: 'number',
      min: 1,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'contentType',
      type: 'select',
      defaultValue: 'article',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Resource', value: 'resource' },
        { label: 'News', value: 'news' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField({
      position: undefined,
    }),
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
