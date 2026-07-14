import type { GlobalConfig } from 'payload'

import { publishedGlobalRead } from '@/access/authenticatedOrPublished'
import { adminsOnly } from '@/access/roles'
import { revalidateGlobal } from '@/cms/revalidation'

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
      defaultValue:
        'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.',
      required: true,
    },
    {
      name: 'manualPaymentReviewNote',
      type: 'textarea',
      defaultValue:
        'Payment proof is reviewed manually by authorized volunteers. Review timing may vary.',
      required: true,
    },
    {
      name: 'noRefundNotice',
      type: 'textarea',
      defaultValue:
        'Zelle payments are non-refundable. Contact RUETIAN USA before paying if you have questions about an order.',
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
  hooks: {
    afterChange: [revalidateGlobal('siteSettings')],
  },
  versions: {
    drafts: { autosave: { interval: 500 }, schedulePublish: true },
  },
  label: 'Site Settings',
}
