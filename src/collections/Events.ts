import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { eventVirtualLinkReadAccess } from '@/access/events'
import { chapterScopedAccess, elevatedOnly, publishedOrManagedChapterAccess } from '@/access/roles'
import {
  createPreviewURL,
  editorialFields,
  enforceEditorialWorkflow,
} from '@/cms/editorial-workflow'
import { revalidateCollectionPaths } from '@/cms/revalidation'
import {
  validateNonNegativeMoney,
  validateOptionalNonNegativeMoney,
  validatePositiveInteger,
  validateUSD,
} from '@/domain/validation'
import { seoFields } from '@/fields/seo'
import { enforceManagedChapter } from '@/hooks/enforceManagedChapter'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

const revalidation = revalidateCollectionPaths(['/events', '/events/[slug]', '/chapters/[slug]'])

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: elevatedOnly,
    delete: chapterScopedAccess('chapter'),
    read: publishedOrManagedChapterAccess('chapter'),
    update: chapterScopedAccess('chapter'),
  },
  admin: {
    defaultColumns: ['title', 'chapter', 'status', 'editorialStatus', '_status', 'startAt'],
    description: 'Chapter programs, registration rules, capacity, pricing, and post-event recaps.',
    listSearchableFields: ['title', 'slug', 'summary', 'venue'],
    preview: createPreviewURL('events'),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
    },
    {
      name: 'eventMode',
      type: 'select',
      options: [
        { label: 'In Person', value: 'inPerson' },
        { label: 'Virtual', value: 'virtual' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
      required: true,
    },
    {
      name: 'startAt',
      type: 'date',
      required: true,
    },
    {
      name: 'endAt',
      type: 'date',
      required: true,
    },
    {
      name: 'timezone',
      type: 'select',
      defaultValue: 'America/New_York',
      options: [
        { label: 'Eastern Time', value: 'America/New_York' },
        { label: 'Central Time', value: 'America/Chicago' },
        { label: 'Mountain Time', value: 'America/Denver' },
        { label: 'Pacific Time', value: 'America/Los_Angeles' },
      ],
      required: true,
    },
    {
      name: 'venue',
      type: 'text',
    },
    {
      name: 'virtualLink',
      type: 'text',
      access: {
        read: eventVirtualLinkReadAccess,
      },
    },
    {
      name: 'virtualAccessVisibility',
      type: 'select',
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Registered Users', value: 'registered' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'details',
      type: 'textarea',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isPaid',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'basePrice',
      type: 'number',
      defaultValue: 0,
      validate: validateOptionalNonNegativeMoney,
      admin: {
        description:
          'Single-ticket fallback price. When price tiers are added below, registrations use the tier prices instead.',
      },
    },
    {
      name: 'priceTiers',
      type: 'array',
      admin: {
        description:
          'Optional ticket categories such as Adult, Child, or Under 5. Tier prices replace the single base price.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Optional eligibility note, for example “Ages 6–12”.',
          },
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          validate: validateNonNegativeMoney,
        },
      ],
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      validate: validateUSD,
    },
    {
      name: 'capacity',
      type: 'number',
      validate: (value: unknown) =>
        value === null || value === undefined ? true : validatePositiveInteger(value),
    },
    {
      name: 'registrationOpensAt',
      type: 'date',
      admin: {
        description:
          'Optional. If empty, registration is available as soon as the event is published.',
      },
    },
    {
      name: 'registrationClosesAt',
      type: 'date',
      admin: {
        description: 'Optional. If empty, registration closes when the event starts.',
      },
    },
    {
      name: 'waitlistEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'waitlistOfferHours',
      type: 'number',
      defaultValue: 48,
      required: true,
      validate: validatePositiveInteger,
      admin: {
        description: 'Hours a promoted attendee has to accept an available-seat offer.',
      },
    },
    {
      name: 'maxRegistrationQuantity',
      type: 'number',
      defaultValue: 1,
      validate: validatePositiveInteger,
    },
    {
      name: 'galleryAfterCompletion',
      type: 'relationship',
      hasMany: true,
      relationTo: 'media',
    },
    {
      name: 'recapSummary',
      type: 'textarea',
      admin: {
        description: 'Optional public recap shown after the event ends.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    seoFields(),
    ...editorialFields(),
  ],
  hooks: {
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
    beforeChange: [
      enforceManagedChapter('chapter'),
      async ({ data, originalDoc, req }) => {
        if (!Object.prototype.hasOwnProperty.call(data, 'galleryAfterCompletion')) return data
        const gallery = Array.isArray(data.galleryAfterCompletion)
          ? data.galleryAfterCompletion
          : []
        if (!gallery.length) return data
        const endAt = data.endAt ?? originalDoc?.endAt
        if (!endAt || new Date(String(endAt)) > new Date()) {
          throw new AppError('Event gallery media can be attached only after the event ends.', {
            code: 'EVENT_GALLERY_BEFORE_COMPLETION',
            status: 409,
          })
        }
        const chapterID = getRelationshipID(data.chapter ?? originalDoc?.chapter)
        for (const value of gallery) {
          const mediaID = getRelationshipID(value)
          if (!mediaID) continue
          const media = await req.payload.findByID({
            collection: 'media',
            depth: 0,
            id: mediaID,
            overrideAccess: true,
            req,
          })
          if (media.visibility !== 'public' || getRelationshipID(media.chapter) !== chapterID) {
            throw new AppError('Event gallery images must be public media from the same chapter.', {
              code: 'INVALID_EVENT_GALLERY_MEDIA',
              status: 409,
            })
          }
        }
        return data
      },
      ({ data, originalDoc }) => {
        const startAt = data.startAt ?? originalDoc?.startAt
        const endAt = data.endAt ?? originalDoc?.endAt

        if (startAt && endAt && new Date(String(endAt)) <= new Date(String(startAt))) {
          throw new Error('Event end time must be after its start time.')
        }

        const registrationOpensAt = data.registrationOpensAt ?? originalDoc?.registrationOpensAt
        const registrationClosesAt = data.registrationClosesAt ?? originalDoc?.registrationClosesAt
        if (
          registrationOpensAt &&
          registrationClosesAt &&
          new Date(String(registrationClosesAt)) <= new Date(String(registrationOpensAt))
        ) {
          throw new Error('Registration close time must be after its open time.')
        }
        if (
          registrationClosesAt &&
          endAt &&
          new Date(String(registrationClosesAt)) > new Date(String(endAt))
        ) {
          throw new Error('Registration cannot close after the event ends.')
        }

        const capacity = data.capacity ?? originalDoc?.capacity
        const maximumQuantity =
          data.maxRegistrationQuantity ?? originalDoc?.maxRegistrationQuantity ?? 1
        if (typeof capacity === 'number' && maximumQuantity > capacity) {
          throw new Error('Maximum registration quantity cannot exceed event capacity.')
        }

        const isPaid = data.isPaid ?? originalDoc?.isPaid ?? false
        const basePrice = data.basePrice ?? originalDoc?.basePrice ?? 0
        const priceTiers = data.priceTiers ?? originalDoc?.priceTiers ?? []
        const tierPrices = Array.isArray(priceTiers)
          ? priceTiers.map((tier) => Number(tier?.price ?? 0))
          : []
        const tierLabels = Array.isArray(priceTiers)
          ? priceTiers.map((tier) =>
              String(tier?.label ?? '')
                .trim()
                .toLocaleLowerCase(),
            )
          : []
        if (tierLabels.some((label) => !label) || new Set(tierLabels).size !== tierLabels.length) {
          throw new Error('Event price tier names must be present and unique.')
        }
        if (isPaid && tierPrices.length && !tierPrices.some((price) => price > 0)) {
          throw new Error('A paid event needs at least one price tier above zero.')
        }
        if (isPaid && !tierPrices.length && basePrice <= 0) {
          throw new Error('A paid event needs a positive base price or at least one price tier.')
        }
        if (!isPaid && (basePrice !== 0 || tierPrices.some((price) => price !== 0))) {
          throw new Error('Free events must have zero pricing.')
        }

        return data
      },
      enforceEditorialWorkflow,
    ],
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
