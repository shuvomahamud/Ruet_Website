import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { env } from '@/utilities/env'
import { Announcements } from './collections/Announcements'
import { Categories } from './collections/Categories'
import { ChapterRequests } from './collections/ChapterRequests'
import { Chapters } from './collections/Chapters'
import { CommitteeTerms } from './collections/CommitteeTerms'
import { EventRegistrations } from './collections/EventRegistrations'
import { Events } from './collections/Events'
import { HistoryEntries } from './collections/HistoryEntries'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { MembershipPlans } from './collections/MembershipPlans'
import { Memberships } from './collections/Memberships'
import { NewsletterCampaigns } from './collections/NewsletterCampaigns'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Payments } from './collections/Payments'
import { Posts } from './collections/Posts'
import { Promotions } from './collections/Promotions'
import { WaitlistEntries } from './collections/WaitlistEntries'
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
    Media,
    Categories,
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
    Promotions,
    CommitteeTerms,
    HistoryEntries,
    NewsletterCampaigns,
  ],
  editor: lexicalEditor(),
  globals: [SiteSettings, Header, Footer, Home, SeoDefaults],
  secret: env.PAYLOAD_SECRET,
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
