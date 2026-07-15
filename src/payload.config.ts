import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type CollectionConfig, type GlobalConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { getRole } from '@/access/roles'
import { createEmailAdapter } from '@/email/adapter'
import { env } from '@/utilities/env'
import { Announcements } from './collections/Announcements'
import { AuditLogs } from './collections/AuditLogs'
import { Categories } from './collections/Categories'
import { ChapterRequests } from './collections/ChapterRequests'
import { Chapters } from './collections/Chapters'
import { CommitteeTerms } from './collections/CommitteeTerms'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { EmailDeliveries } from './collections/EmailDeliveries'
import { EventRegistrations } from './collections/EventRegistrations'
import { Events } from './collections/Events'
import { HistoryEntries } from './collections/HistoryEntries'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { MembershipPlans } from './collections/MembershipPlans'
import { Memberships } from './collections/Memberships'
import { NewsletterCampaigns } from './collections/NewsletterCampaigns'
import { OAuthSessions } from './collections/OAuthSessions'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Payments } from './collections/Payments'
import { PaymentProofs } from './collections/PaymentProofs'
import { Posts } from './collections/Posts'
import { Promotions } from './collections/Promotions'
import { RateLimitBuckets } from './collections/RateLimitBuckets'
import { WaitlistEntries } from './collections/WaitlistEntries'
import { deliverEmailTask } from './jobs/deliver-email'
import { eventLifecycleTask } from './jobs/event-lifecycle'
import { membershipLifecycleTask } from './jobs/membership-lifecycle'
import { newsletterLifecycleTask } from './jobs/newsletter-lifecycle'
import { paymentProofRetentionTask } from './jobs/payment-proof-retention'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Home } from './globals/Home'
import { SeoDefaults } from './globals/SeoDefaults'
import { SiteSettings } from './globals/SiteSettings'
import { MAX_UPLOAD_BYTES, storagePlugins } from './storage/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const withCollectionGroup = (collection: CollectionConfig, group: string): CollectionConfig => ({
  ...collection,
  admin: {
    ...collection.admin,
    group,
  },
})

const withGlobalGroup = (global: GlobalConfig, group = 'Website'): GlobalConfig => ({
  ...global,
  admin: {
    ...global.admin,
    group,
  },
})

export default buildConfig({
  admin: {
    meta: {
      description: 'RUETIAN USA admin panel powered by Payload CMS.',
      titleSuffix: ' | RUETIAN USA',
    },
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    withCollectionGroup(Users, 'Accounts & access'),
    withCollectionGroup(OAuthSessions, 'Accounts & access'),
    withCollectionGroup(Media, 'Content'),
    withCollectionGroup(PaymentProofs, 'Commerce'),
    withCollectionGroup(Categories, 'Content'),
    withCollectionGroup(ContactSubmissions, 'Communications'),
    withCollectionGroup(EmailDeliveries, 'Operations'),
    withCollectionGroup(Pages, 'Content'),
    withCollectionGroup(Posts, 'Content'),
    withCollectionGroup(Announcements, 'Communications'),
    withCollectionGroup(Chapters, 'Community'),
    withCollectionGroup(ChapterRequests, 'Community'),
    withCollectionGroup(MembershipPlans, 'Membership'),
    withCollectionGroup(Memberships, 'Membership'),
    withCollectionGroup(Events, 'Events'),
    withCollectionGroup(EventRegistrations, 'Events'),
    withCollectionGroup(WaitlistEntries, 'Events'),
    withCollectionGroup(Orders, 'Commerce'),
    withCollectionGroup(Payments, 'Commerce'),
    withCollectionGroup(AuditLogs, 'Operations'),
    withCollectionGroup(Promotions, 'Commerce'),
    withCollectionGroup(CommitteeTerms, 'Community'),
    withCollectionGroup(HistoryEntries, 'Content'),
    withCollectionGroup(NewsletterCampaigns, 'Communications'),
    RateLimitBuckets,
  ],
  editor: lexicalEditor(),
  email: createEmailAdapter(),
  cors: [env.NEXT_PUBLIC_SITE_URL],
  csrf: [env.NEXT_PUBLIC_SITE_URL],
  globals: [SiteSettings, Header, Footer, Home, SeoDefaults].map((global) =>
    withGlobalGroup(global),
  ),
  jobs: {
    access: {
      cancel: ({ req }) => getRole(req.user) === 'superAdmin',
      queue: ({ req }) => getRole(req.user) === 'superAdmin',
      run: ({ req }) => getRole(req.user) === 'superAdmin',
    },
    ...(env.JOBS_AUTORUN
      ? {
          autoRun: [
            {
              allQueues: true,
              cron: env.JOBS_POLL_CRON,
              limit: 25,
            },
          ],
        }
      : {}),
    deleteJobOnComplete: false,
    enableConcurrencyControl: true,
    processingOrder: 'createdAt',
    tasks: [
      deliverEmailTask,
      eventLifecycleTask,
      membershipLifecycleTask,
      newsletterLifecycleTask,
      paymentProofRetentionTask,
    ],
  },
  secret: env.PAYLOAD_SECRET,
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      allowExitOnIdle: true,
      connectionTimeoutMillis: 10_000,
      connectionString: env.DATABASE_URL,
      idleTimeoutMillis: 10_000,
      max: env.DATABASE_POOL_MAX,
    },
    push: false,
  }),
  sharp,
  upload: {
    abortOnLimit: true,
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
      files: 1,
    },
    responseOnLimit: 'The uploaded file exceeds the 4 MB limit.',
    safeFileNames: true,
  },
  plugins: storagePlugins,
})
