import type { Field } from 'payload'

export const seoFields = (): Field => ({
  name: 'seo',
  type: 'group',
  admin: {
    description: 'Optional page-level overrides. Site SEO defaults are used when these are empty.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      maxLength: 70,
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 180,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
})
