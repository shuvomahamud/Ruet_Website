import { s3Storage } from '@payloadcms/storage-s3'

import { env } from '@/utilities/env'

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
export const MAX_UPLOAD_MEGABYTES = MAX_UPLOAD_BYTES / (1024 * 1024)

/**
 * Local disk remains convenient for development. Production deployments use
 * one private Supabase Storage bucket through Supabase's S3-compatible server
 * endpoint. Payload's file proxy/access checks remain enabled, so a payment
 * proof is never exposed by a public bucket URL.
 */
const supabaseStorageEnabled = env.STORAGE_PROVIDER === 'supabase'

export const storagePlugins = [
  s3Storage({
    // Keep the upload schema identical in local, test, preview, and production.
    // With enabled=false Payload inserts the prefix fields but retains local disk storage.
    alwaysInsertFields: true,
    bucket: env.SUPABASE_STORAGE_BUCKET ?? 'local-schema-only',
    collections: {
      media: { prefix: 'media' },
      paymentProofs: { prefix: 'payment-proofs' },
    },
    config: {
      credentials:
        env.SUPABASE_STORAGE_ACCESS_KEY_ID && env.SUPABASE_STORAGE_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.SUPABASE_STORAGE_ACCESS_KEY_ID,
              secretAccessKey: env.SUPABASE_STORAGE_SECRET_ACCESS_KEY,
            }
          : undefined,
      endpoint: env.SUPABASE_STORAGE_ENDPOINT,
      forcePathStyle: true,
      region: env.SUPABASE_STORAGE_REGION ?? 'local',
    },
    enabled: supabaseStorageEnabled,
  }),
]
