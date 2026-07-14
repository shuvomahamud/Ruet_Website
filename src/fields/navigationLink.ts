import type { Field } from 'payload'

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
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
})
