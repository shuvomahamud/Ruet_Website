import type { GlobalConfig } from 'payload'

import { publishedGlobalRead } from '@/access/authenticatedOrPublished'
import { adminsOnly } from '@/access/roles'
import { revalidateGlobal } from '@/cms/revalidation'
import {
  STANDARD_EVENT_PAYMENT_TERMS,
  STANDARD_MANUAL_REVIEW_NOTE,
  STANDARD_NO_REFUND_NOTICE,
  STANDARD_ZELLE_INSTRUCTIONS,
} from '@/content/legal-policy-20260714'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  access: {
    read: publishedGlobalRead,
    readVersions: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    description: 'Organization identity, contact details, and public Zelle payment instructions.',
  },
  fields: [
    {
      name: 'organizationName',
      type: 'text',
      defaultValue: 'RUETIAN USA',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'RUET alumni community in the United States',
    },
    {
      name: 'primaryEmail',
      type: 'email',
      defaultValue: 'info@ruetianusa.org',
    },
    {
      name: 'chapterSupportEmail',
      type: 'email',
    },
    {
      name: 'primaryPhone',
      type: 'text',
    },
    {
      name: 'mailingAddress',
      type: 'textarea',
    },
    {
      name: 'contactResponseNote',
      type: 'textarea',
      defaultValue:
        'Send us a message and the appropriate RUETIAN USA volunteer will follow up when available.',
    },
    {
      name: 'utilityMessage',
      type: 'text',
      defaultValue: 'Connecting RUET alumni across the United States',
    },
    {
      name: 'footerNote',
      type: 'textarea',
      defaultValue:
        'Membership, chapters, events, and learning opportunities for the RUET alumni community.',
    },
    {
      name: 'zelleRecipientName',
      type: 'text',
      defaultValue: 'RUETIAN USA',
    },
    {
      name: 'zelleRecipient',
      type: 'text',
      admin: {
        description: 'The approved Zelle email address or US phone number.',
      },
    },
    {
      name: 'zelleInstructions',
      type: 'textarea',
      defaultValue: STANDARD_ZELLE_INSTRUCTIONS,
      required: true,
    },
    {
      name: 'manualPaymentReviewNote',
      type: 'textarea',
      defaultValue: STANDARD_MANUAL_REVIEW_NOTE,
      required: true,
    },
    {
      name: 'paymentProofRetentionDays',
      type: 'number',
      admin: {
        description:
          'Finalized payment-proof files are permanently deleted after this many days. Payment, order, and audit records remain.',
      },
      defaultValue: 180,
      max: 3650,
      min: 30,
      required: true,
    },
    {
      name: 'noRefundNotice',
      type: 'textarea',
      defaultValue: STANDARD_NO_REFUND_NOTICE,
      required: true,
    },
    {
      name: 'eventPaymentTerms',
      type: 'textarea',
      defaultValue: STANDARD_EVENT_PAYMENT_TERMS,
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal('siteSettings')],
  },
  versions: {
    drafts: { autosave: { interval: 500 }, schedulePublish: true },
  },
  label: 'Site Settings',
}
