import type { CollectionConfig } from 'payload'

import { denyAll } from '@/access/roles'

/**
 * Internal fixed-window counters shared by every application instance.
 *
 * The public API writes these rows atomically through PostgreSQL. Keeping the
 * table in Payload's schema ensures migrations own it, while denying every
 * collection operation prevents it from becoming an accidental admin/API
 * surface.
 */
export const RateLimitBuckets: CollectionConfig = {
  slug: 'rateLimitBuckets',
  access: {
    create: denyAll,
    delete: denyAll,
    read: denyAll,
    update: denyAll,
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'count',
      type: 'number',
      min: 1,
      required: true,
    },
    {
      name: 'resetAt',
      type: 'date',
      index: true,
      required: true,
    },
  ],
  timestamps: false,
}
