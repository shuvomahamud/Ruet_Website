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
    },
    {
      name: 'href',
      type: 'text',
      admin: {
        description: 'Use an internal path or an HTTP(S), email, or phone destination.',
      },
      required: true,
      validate: validateSafeHref,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
})
