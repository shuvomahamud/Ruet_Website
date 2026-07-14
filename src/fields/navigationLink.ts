import type { Field } from 'payload'

import { validateSafeHref } from '@/utilities/links'

export const navigationLinkField = (): Field => ({
  name: 'link',
  type: 'group',
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      validate: validateSafeHref,
    },
    {
      name: 'href',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
})
