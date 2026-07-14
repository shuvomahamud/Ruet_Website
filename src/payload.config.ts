import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
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
import { WaitlistEntries } from './collections/WaitlistEntries'
import { deliverEmailTask } from './jobs/deliver-email'
import { membershipLifecycleTask } from './jobs/membership-lifecycle'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Home } from './globals/Home'
import { SeoDefaults } from './globals/SeoDefaults'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
    Users,
    OAuthSessions,
    Media,
    PaymentProofs,
    Categories,
    ContactSubmissions,
    EmailDeliveries,
    Pages,
    Posts,
    Announcements,
    Chapters,
    ChapterRequests,
    MembershipPlans,
    Memberships,
    Events,
    EventRegistrations,
    WaitlistEntries,
    Orders,
    Payments,
    AuditLogs,
    Promotions,
    CommitteeTerms,
    HistoryEntries,
    NewsletterCampaigns,
  ],
  editor: lexicalEditor(),
  email: createEmailAdapter(),
  cors: [env.NEXT_PUBLIC_SITE_URL],
  csrf: [env.NEXT_PUBLIC_SITE_URL],
  globals: [SiteSettings, Header, Footer, Home, SeoDefaults],
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
    tasks: [deliverEmailTask, membershipLifecycleTask],
  },
  secret: env.PAYLOAD_SECRET,
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [],
})
