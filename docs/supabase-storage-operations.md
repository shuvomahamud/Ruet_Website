# Supabase Storage Operations

Updated: 2026-07-14

## Selected Production Design

All production uploads are stored in one private Supabase Storage file bucket. Payload uses Supabase's S3-compatible server endpoint through `@payloadcms/storage-s3`; this is a protocol client, not an AWS storage dependency.

The bucket contains separate prefixes:

- `media/` for editorial images and documents
- `payment-proofs/` for private Zelle evidence

Payload's file proxy and collection access rules remain enabled. Payment proofs are readable only by the submitting owner, an assigned chapter reviewer, an administrator, or a super administrator. Do not make the bucket public and do not enable `disablePayloadAccessControl`.

## Supabase Setup

In the Supabase project dashboard:

1. Open **Storage** and create a standard file bucket such as `ruetian-usa`.
2. Keep **Public bucket** disabled.
3. Set the bucket file-size limit to `4 MiB` or stricter.
4. Allow only JPG, PNG, WebP, and PDF when the dashboard supports bucket MIME restrictions. Payload also enforces collection-specific MIME types.
5. Open **Storage > Configuration > S3** and enable the S3 protocol.
6. Generate a server-side access-key pair and immediately save both values in the secret manager. The secret is shown only once.
7. Copy the exact region and direct storage endpoint. The endpoint normally has the form `https://PROJECT_REF.storage.supabase.co/storage/v1/s3`.

The generated access keys bypass Storage RLS across the project's buckets. Keep them server-only, grant access only to the deployment administrators, and rotate them if exposed. The browser-facing Supabase publishable key is not a substitute for these credentials.

## Application Variables

Local development uses disk storage:

```env
STORAGE_PROVIDER=local
```

Vercel Preview and Production use:

```env
STORAGE_PROVIDER=supabase
SUPABASE_STORAGE_BUCKET=ruetian-usa
SUPABASE_STORAGE_REGION=copy-from-supabase-s3-settings
SUPABASE_STORAGE_ENDPOINT=https://PROJECT_REF.storage.supabase.co/storage/v1/s3
SUPABASE_STORAGE_ACCESS_KEY_ID=copy-from-supabase-s3-settings
SUPABASE_STORAGE_SECRET_ACCESS_KEY=copy-from-supabase-s3-settings
```

Set these only as encrypted server environment variables. Do not prefix them with `NEXT_PUBLIC_`, store them in Payload globals, commit them, or paste them into issue trackers.

## Upload And Retention Policy

- Maximum request/file size: `4 MiB`.
- Payment proof formats: JPG, PNG, WebP, or PDF.
- Editorial media formats are constrained by the `media` collection.
- Payment-proof files are deleted after the administrator-configured retention period, defaulting to 180 days after approval or rejection.
- Payment, order, membership/registration, reviewer, and audit metadata remain after the binary proof is deleted.
- Supabase Storage does not provide S3 object versioning. Deletion is permanent, so change retention deliberately and test it before shortening the period.

## Deployment Verification

Before promotion:

1. Run `pnpm validate:production` with the intended Vercel variables.
2. Upload one small editorial image and confirm it renders through Payload.
3. Submit one controlled Zelle proof and confirm its database record uses `payment-proofs/`.
4. Confirm an unrelated member and an anonymous request cannot read the proof URL.
5. Confirm the owner and an authorized reviewer can read it.
6. Reject a file over 4 MiB and a disallowed MIME type.
7. Delete the test records and confirm the corresponding Supabase objects are removed.

## Credential Rotation

Generate a new S3 access-key pair in Supabase, update both Vercel variables together, deploy, complete the upload/read/delete smoke test, and then revoke the old pair. Never revoke the active pair before the replacement deployment is verified.
