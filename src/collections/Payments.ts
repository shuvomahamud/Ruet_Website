import type { CollectionConfig } from 'payload'

import { denyAll, userOrChapterScopedAccess } from '@/access/roles'
import { PAYMENT_TERMS_VERSION } from '@/content/legal-policy-20260714'
import { validateNonNegativeMoney, validateUSD } from '@/domain/validation'
import { protectImmutableFields } from '@/hooks/protectImmutableFields'
import { validatePaymentSnapshots } from '@/hooks/validateCommerceRelationships'
import { validateWorkflowTransition } from '@/hooks/validateWorkflowTransition'

export const Payments: CollectionConfig = {
  slug: 'payments',
  access: {
    create: denyAll,
    delete: denyAll,
    read: userOrChapterScopedAccess('user', 'firstReviewerChapter'),
    update: denyAll,
  },
  admin: {
    defaultColumns: [
      'orderTypeSnapshot',
      'paymentSource',
      'amountSnapshot',
      'status',
      'submittedAt',
    ],
    useAsTitle: 'status',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'paymentSource',
      type: 'select',
      defaultValue: 'zelle',
      options: [{ label: 'Zelle', value: 'zelle' }],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
    },
    {
      name: 'proofImage',
      type: 'upload',
      relationTo: 'paymentProofs',
    },
    {
      name: 'proofTransactionId',
      type: 'text',
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'paymentTermsAcceptedAt',
      type: 'date',
      admin: {
        description:
          'Server-recorded time when the payer explicitly accepted the applicable Zelle and no-refund terms.',
        readOnly: true,
      },
    },
    {
      name: 'paymentTermsVersionSnapshot',
      type: 'text',
      admin: {
        description: 'Immutable policy version accepted for this payment attempt.',
        readOnly: true,
      },
      defaultValue: PAYMENT_TERMS_VERSION,
    },
    {
      name: 'amountSnapshot',
      type: 'number',
      required: true,
      validate: validateNonNegativeMoney,
    },
    {
      name: 'currencySnapshot',
      type: 'text',
      defaultValue: 'USD',
      required: true,
      validate: validateUSD,
    },
    {
      name: 'orderTypeSnapshot',
      type: 'select',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Event', value: 'event' },
      ],
      required: true,
    },
    {
      name: 'chapterNameSnapshot',
      type: 'text',
    },
    {
      name: 'firstReviewerChapter',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'approvedAt',
      type: 'date',
    },
    {
      name: 'approvedByRoleSnapshot',
      type: 'text',
    },
    {
      name: 'rejectedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'rejectedAt',
      type: 'date',
    },
    {
      name: 'rejectedByRoleSnapshot',
      type: 'text',
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [
      validatePaymentSnapshots,
      protectImmutableFields([
        'user',
        'order',
        'paymentSource',
        'proofImage',
        'proofTransactionId',
        'submittedAt',
        'paymentTermsAcceptedAt',
        'paymentTermsVersionSnapshot',
        'amountSnapshot',
        'currencySnapshot',
        'orderTypeSnapshot',
        'firstReviewerChapter',
        'chapterNameSnapshot',
      ]),
      validateWorkflowTransition('payment'),
      ({ data, operation, originalDoc }) => {
        if (operation !== 'create') return data

        const proofImage = data.proofImage ?? originalDoc?.proofImage
        const proofTransactionID = data.proofTransactionId ?? originalDoc?.proofTransactionId

        if (!proofImage && !proofTransactionID) {
          throw new Error('Provide a Zelle transaction ID, payment proof, or both.')
        }

        return data
      },
    ],
  },
}
