import type { GlobalConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { adminsOnly } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  access: {
    read: anyone,
    update: adminsOnly,
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
      defaultValue:
        'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.',
      required: true,
    },
    {
      name: 'manualPaymentReviewNote',
      type: 'textarea',
      defaultValue:
        'Payment proof is reviewed by authorized volunteers. No turnaround time is promised until the organization approves a review SLA.',
      required: true,
    },
    {
      name: 'noRefundNotice',
      type: 'textarea',
      defaultValue:
        'No-refund wording is awaiting final stakeholder and legal approval before launch.',
      required: true,
    },
    {
      name: 'eventPaymentTerms',
      type: 'textarea',
      defaultValue:
        'Paid event registration is reserved while Zelle proof is reviewed. Event payments are not automatically debited. No refunds are issued; contact the event chapter for exceptional handling.',
      required: true,
    },
  ],
  label: 'Site Settings',
}
