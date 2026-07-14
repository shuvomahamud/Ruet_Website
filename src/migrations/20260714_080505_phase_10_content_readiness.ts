import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum__pages_v_version_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum_posts_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum__posts_v_version_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum_announcements_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum__announcements_v_version_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum_chapters_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum__chapters_v_version_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum_events_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum__events_v_version_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum_committee_terms_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum__committee_terms_v_version_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum_history_entries_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum__history_entries_v_version_editorial_status" AS ENUM('draft', 'inReview', 'approved');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_header_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__header_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_seo_defaults_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__seo_defaults_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_organization_name" varchar DEFAULT 'RUETIAN USA',
  	"version_tagline" varchar DEFAULT 'RUET alumni community in the United States',
  	"version_primary_email" varchar DEFAULT 'info@ruetianusa.org',
  	"version_chapter_support_email" varchar,
  	"version_primary_phone" varchar,
  	"version_mailing_address" varchar,
  	"version_contact_response_note" varchar DEFAULT 'Send us a message and the appropriate RUETIAN USA volunteer will follow up when available.',
  	"version_utility_message" varchar DEFAULT 'Connecting RUET alumni across the United States',
  	"version_footer_note" varchar DEFAULT 'Membership, chapters, events, and learning opportunities for the RUET alumni community.',
  	"version_zelle_recipient_name" varchar DEFAULT 'RUETIAN USA',
  	"version_zelle_recipient" varchar,
  	"version_zelle_instructions" varchar DEFAULT 'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.',
  	"version_manual_payment_review_note" varchar DEFAULT 'Payment proof is reviewed manually by authorized volunteers. Review timing may vary.',
  	"version_no_refund_notice" varchar DEFAULT 'Zelle payments are non-refundable. Contact RUETIAN USA before paying if you have questions about an order.',
  	"version_event_payment_terms" varchar DEFAULT 'Paid event registration is reserved while Zelle proof is reviewed. Event payments are not automatically debited. No refunds are issued; contact the event chapter for exceptional handling.',
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_header_v_version_utility_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar,
  	"link_description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v_version_main_links_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar,
  	"link_description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v_version_main_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar,
  	"link_description" varchar,
  	"featured_eyebrow" varchar,
  	"featured_title" varchar,
  	"featured_description" varchar,
  	"featured_label" varchar,
  	"featured_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_primary_cta_label" varchar DEFAULT 'Join Membership',
  	"version_primary_cta_href" varchar DEFAULT '/membership',
  	"version__status" "enum__header_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_footer_v_version_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar,
  	"link_description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_newsletter_title" varchar DEFAULT 'Stay connected',
  	"version_newsletter_summary" varchar DEFAULT 'Receive organization news, chapter updates, event notices, and learning resources.',
  	"version_newsletter_cta_label" varchar DEFAULT 'Manage newsletter preferences',
  	"version_newsletter_cta_href" varchar DEFAULT '/communications/preferences',
  	"version_legal_notice" varchar DEFAULT 'RUETIAN USA is an alumni-led community serving RUET graduates in the United States.',
  	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_home_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_eyebrow" varchar DEFAULT 'RUET Alumni Association',
  	"version_hero_title" varchar DEFAULT 'A professional, chapter-centered home for RUET alumni in the United States.',
  	"version_hero_description" varchar DEFAULT 'Connect with RUET alumni across the United States through membership, regional chapters, events, and shared professional learning.',
  	"version_primary_cta_label" varchar DEFAULT 'Explore Membership',
  	"version_primary_cta_href" varchar DEFAULT '/membership',
  	"version_secondary_cta_label" varchar DEFAULT 'Find a Chapter',
  	"version_secondary_cta_href" varchar DEFAULT '/chapters',
  	"version_network_panel_eyebrow" varchar DEFAULT 'Our alumni network',
  	"version_network_panel_title" varchar DEFAULT 'Connected by RUET, strengthened by community.',
  	"version_network_panel_description" varchar DEFAULT 'Discover chapters, upcoming programs, and stories from RUET alumni across the United States.',
  	"version_stats_section_eyebrow" varchar DEFAULT 'Our community at a glance',
  	"version_stats_section_title" varchar DEFAULT 'A growing alumni network built for participation',
  	"version_announcement_section_title" varchar DEFAULT 'Latest organization notices',
  	"version_announcement_section_description" varchar DEFAULT 'Stay informed about association news, chapter updates, and opportunities across the alumni network.',
  	"version_membership_section_title" varchar DEFAULT 'One community, year-round connection',
  	"version_membership_section_description" varchar DEFAULT 'Annual membership helps sustain alumni programming, regional chapters, professional development, and community connections.',
  	"version_chapters_section_title" varchar DEFAULT 'Find your local alumni community',
  	"version_chapters_section_description" varchar DEFAULT 'Regional chapters create opportunities to meet, volunteer, learn, and stay connected.',
  	"version_events_section_title" varchar DEFAULT 'Meet, learn, and participate',
  	"version_events_section_description" varchar DEFAULT 'Explore in-person, virtual, and hybrid programs hosted across the alumni network.',
  	"version_history_section_title" varchar DEFAULT 'Milestones that connect generations',
  	"version_history_section_description" varchar DEFAULT 'Explore the people, places, and moments that shape RUET and its alumni community.',
  	"version_committees_section_title" varchar DEFAULT 'Volunteer leadership and continuity',
  	"version_committees_section_description" varchar DEFAULT 'Meet current running and advisory committee members serving the national organization.',
  	"version_learning_section_title" varchar DEFAULT 'Knowledge shared across generations',
  	"version_learning_section_description" varchar DEFAULT 'Read alumni perspectives, professional development articles, and practical community resources.',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_seo_defaults_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'RUETIAN USA',
  	"version_title_suffix" varchar DEFAULT ' | RUETIAN USA',
  	"version_default_description" varchar DEFAULT 'RUETIAN USA is a chapter-driven alumni association platform built for community, membership, events, and institutional continuity.',
  	"version_default_image_id" integer,
  	"version_social_handle" varchar,
  	"version__status" "enum__seo_defaults_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "site_settings" ALTER COLUMN "organization_name" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "zelle_instructions" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "manual_payment_review_note" SET DEFAULT 'Payment proof is reviewed manually by authorized volunteers. Review timing may vary.';
  ALTER TABLE "site_settings" ALTER COLUMN "manual_payment_review_note" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "no_refund_notice" SET DEFAULT 'Zelle payments are non-refundable. Contact RUETIAN USA before paying if you have questions about an order.';
  ALTER TABLE "site_settings" ALTER COLUMN "no_refund_notice" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "event_payment_terms" DROP NOT NULL;
  ALTER TABLE "header_utility_links" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "header_utility_links" ALTER COLUMN "link_href" DROP NOT NULL;
  ALTER TABLE "header_main_links_children" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "header_main_links_children" ALTER COLUMN "link_href" DROP NOT NULL;
  ALTER TABLE "header_main_links" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "header_main_links" ALTER COLUMN "link_href" DROP NOT NULL;
  ALTER TABLE "header" ALTER COLUMN "primary_cta_label" DROP NOT NULL;
  ALTER TABLE "header" ALTER COLUMN "primary_cta_href" DROP NOT NULL;
  ALTER TABLE "footer_groups_links" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "footer_groups_links" ALTER COLUMN "link_href" DROP NOT NULL;
  ALTER TABLE "footer_groups" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "footer_legal_links" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "footer_legal_links" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "footer_social_links" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "footer_social_links" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "newsletter_cta_label" DROP NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "newsletter_cta_href" DROP NOT NULL;
  ALTER TABLE "home_stats" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "home_stats" ALTER COLUMN "value" DROP NOT NULL;
  ALTER TABLE "home" ALTER COLUMN "hero_title" DROP NOT NULL;
  ALTER TABLE "home" ALTER COLUMN "primary_cta_label" SET DEFAULT 'Explore Membership';
  ALTER TABLE "home" ALTER COLUMN "secondary_cta_label" SET DEFAULT 'Find a Chapter';
  ALTER TABLE "pages" ADD COLUMN "editorial_status" "enum_pages_editorial_status" DEFAULT 'draft';
  ALTER TABLE "pages" ADD COLUMN "review_note" varchar;
  ALTER TABLE "pages" ADD COLUMN "reviewed_by_id" integer;
  ALTER TABLE "pages" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_editorial_status" "enum__pages_v_version_editorial_status" DEFAULT 'draft';
  ALTER TABLE "_pages_v" ADD COLUMN "version_review_note" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_reviewed_by_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "editorial_status" "enum_posts_editorial_status" DEFAULT 'draft';
  ALTER TABLE "posts" ADD COLUMN "review_note" varchar;
  ALTER TABLE "posts" ADD COLUMN "reviewed_by_id" integer;
  ALTER TABLE "posts" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_editorial_status" "enum__posts_v_version_editorial_status" DEFAULT 'draft';
  ALTER TABLE "_posts_v" ADD COLUMN "version_review_note" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_reviewed_by_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "announcements" ADD COLUMN "editorial_status" "enum_announcements_editorial_status" DEFAULT 'draft';
  ALTER TABLE "announcements" ADD COLUMN "review_note" varchar;
  ALTER TABLE "announcements" ADD COLUMN "reviewed_by_id" integer;
  ALTER TABLE "announcements" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_announcements_v" ADD COLUMN "version_editorial_status" "enum__announcements_v_version_editorial_status" DEFAULT 'draft';
  ALTER TABLE "_announcements_v" ADD COLUMN "version_review_note" varchar;
  ALTER TABLE "_announcements_v" ADD COLUMN "version_reviewed_by_id" integer;
  ALTER TABLE "_announcements_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "chapters" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "chapters" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "chapters" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "chapters" ADD COLUMN "seo_no_index" boolean DEFAULT false;
  ALTER TABLE "chapters" ADD COLUMN "editorial_status" "enum_chapters_editorial_status" DEFAULT 'draft';
  ALTER TABLE "chapters" ADD COLUMN "review_note" varchar;
  ALTER TABLE "chapters" ADD COLUMN "reviewed_by_id" integer;
  ALTER TABLE "chapters" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_chapters_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_chapters_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "_chapters_v" ADD COLUMN "version_seo_image_id" integer;
  ALTER TABLE "_chapters_v" ADD COLUMN "version_seo_no_index" boolean DEFAULT false;
  ALTER TABLE "_chapters_v" ADD COLUMN "version_editorial_status" "enum__chapters_v_version_editorial_status" DEFAULT 'draft';
  ALTER TABLE "_chapters_v" ADD COLUMN "version_review_note" varchar;
  ALTER TABLE "_chapters_v" ADD COLUMN "version_reviewed_by_id" integer;
  ALTER TABLE "_chapters_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "events" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "events" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "events" ADD COLUMN "seo_no_index" boolean DEFAULT false;
  ALTER TABLE "events" ADD COLUMN "editorial_status" "enum_events_editorial_status" DEFAULT 'draft';
  ALTER TABLE "events" ADD COLUMN "review_note" varchar;
  ALTER TABLE "events" ADD COLUMN "reviewed_by_id" integer;
  ALTER TABLE "events" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_seo_image_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_seo_no_index" boolean DEFAULT false;
  ALTER TABLE "_events_v" ADD COLUMN "version_editorial_status" "enum__events_v_version_editorial_status" DEFAULT 'draft';
  ALTER TABLE "_events_v" ADD COLUMN "version_review_note" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_reviewed_by_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "committee_terms" ADD COLUMN "editorial_status" "enum_committee_terms_editorial_status" DEFAULT 'draft';
  ALTER TABLE "committee_terms" ADD COLUMN "review_note" varchar;
  ALTER TABLE "committee_terms" ADD COLUMN "reviewed_by_id" integer;
  ALTER TABLE "committee_terms" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_committee_terms_v" ADD COLUMN "version_editorial_status" "enum__committee_terms_v_version_editorial_status" DEFAULT 'draft';
  ALTER TABLE "_committee_terms_v" ADD COLUMN "version_review_note" varchar;
  ALTER TABLE "_committee_terms_v" ADD COLUMN "version_reviewed_by_id" integer;
  ALTER TABLE "_committee_terms_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "history_entries" ADD COLUMN "editorial_status" "enum_history_entries_editorial_status" DEFAULT 'draft';
  ALTER TABLE "history_entries" ADD COLUMN "review_note" varchar;
  ALTER TABLE "history_entries" ADD COLUMN "reviewed_by_id" integer;
  ALTER TABLE "history_entries" ADD COLUMN "reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_history_entries_v" ADD COLUMN "version_editorial_status" "enum__history_entries_v_version_editorial_status" DEFAULT 'draft';
  ALTER TABLE "_history_entries_v" ADD COLUMN "version_review_note" varchar;
  ALTER TABLE "_history_entries_v" ADD COLUMN "version_reviewed_by_id" integer;
  ALTER TABLE "_history_entries_v" ADD COLUMN "version_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "_status" "enum_site_settings_status" DEFAULT 'draft';
  ALTER TABLE "header" ADD COLUMN "_status" "enum_header_status" DEFAULT 'draft';
  ALTER TABLE "footer" ADD COLUMN "_status" "enum_footer_status" DEFAULT 'draft';
  ALTER TABLE "home" ADD COLUMN "network_panel_eyebrow" varchar DEFAULT 'Our alumni network';
  ALTER TABLE "home" ADD COLUMN "network_panel_title" varchar DEFAULT 'Connected by RUET, strengthened by community.';
  ALTER TABLE "home" ADD COLUMN "network_panel_description" varchar DEFAULT 'Discover chapters, upcoming programs, and stories from RUET alumni across the United States.';
  ALTER TABLE "home" ADD COLUMN "stats_section_eyebrow" varchar DEFAULT 'Our community at a glance';
  ALTER TABLE "home" ADD COLUMN "stats_section_title" varchar DEFAULT 'A growing alumni network built for participation';
  ALTER TABLE "home" ADD COLUMN "announcement_section_title" varchar DEFAULT 'Latest organization notices';
  ALTER TABLE "home" ADD COLUMN "announcement_section_description" varchar DEFAULT 'Stay informed about association news, chapter updates, and opportunities across the alumni network.';
  ALTER TABLE "home" ADD COLUMN "chapters_section_title" varchar DEFAULT 'Find your local alumni community';
  ALTER TABLE "home" ADD COLUMN "chapters_section_description" varchar DEFAULT 'Regional chapters create opportunities to meet, volunteer, learn, and stay connected.';
  ALTER TABLE "home" ADD COLUMN "events_section_title" varchar DEFAULT 'Meet, learn, and participate';
  ALTER TABLE "home" ADD COLUMN "events_section_description" varchar DEFAULT 'Explore in-person, virtual, and hybrid programs hosted across the alumni network.';
  ALTER TABLE "home" ADD COLUMN "history_section_title" varchar DEFAULT 'Milestones that connect generations';
  ALTER TABLE "home" ADD COLUMN "history_section_description" varchar DEFAULT 'Explore the people, places, and moments that shape RUET and its alumni community.';
  ALTER TABLE "home" ADD COLUMN "committees_section_title" varchar DEFAULT 'Volunteer leadership and continuity';
  ALTER TABLE "home" ADD COLUMN "committees_section_description" varchar DEFAULT 'Meet current running and advisory committee members serving the national organization.';
  ALTER TABLE "home" ADD COLUMN "learning_section_title" varchar DEFAULT 'Knowledge shared across generations';
  ALTER TABLE "home" ADD COLUMN "learning_section_description" varchar DEFAULT 'Read alumni perspectives, professional development articles, and practical community resources.';
  ALTER TABLE "home" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "home" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "home" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "home" ADD COLUMN "seo_no_index" boolean DEFAULT false;
  ALTER TABLE "home" ADD COLUMN "_status" "enum_home_status" DEFAULT 'draft';
  ALTER TABLE "seo_defaults" ADD COLUMN "_status" "enum_seo_defaults_status" DEFAULT 'draft';
  ALTER TABLE "_header_v_version_utility_links" ADD CONSTRAINT "_header_v_version_utility_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_main_links_children" ADD CONSTRAINT "_header_v_version_main_links_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v_version_main_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_main_links" ADD CONSTRAINT "_header_v_version_main_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_groups_links" ADD CONSTRAINT "_footer_v_version_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_groups" ADD CONSTRAINT "_footer_v_version_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_links" ADD CONSTRAINT "_footer_v_version_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_links" ADD CONSTRAINT "_footer_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_stats" ADD CONSTRAINT "_home_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_defaults_v" ADD CONSTRAINT "_seo_defaults_v_version_default_image_id_media_id_fk" FOREIGN KEY ("version_default_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "_site_settings_v_autosave_idx" ON "_site_settings_v" USING btree ("autosave");
  CREATE INDEX "_header_v_version_utility_links_order_idx" ON "_header_v_version_utility_links" USING btree ("_order");
  CREATE INDEX "_header_v_version_utility_links_parent_id_idx" ON "_header_v_version_utility_links" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_main_links_children_order_idx" ON "_header_v_version_main_links_children" USING btree ("_order");
  CREATE INDEX "_header_v_version_main_links_children_parent_id_idx" ON "_header_v_version_main_links_children" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_main_links_order_idx" ON "_header_v_version_main_links" USING btree ("_order");
  CREATE INDEX "_header_v_version_main_links_parent_id_idx" ON "_header_v_version_main_links" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_version__status_idx" ON "_header_v" USING btree ("version__status");
  CREATE INDEX "_header_v_created_at_idx" ON "_header_v" USING btree ("created_at");
  CREATE INDEX "_header_v_updated_at_idx" ON "_header_v" USING btree ("updated_at");
  CREATE INDEX "_header_v_latest_idx" ON "_header_v" USING btree ("latest");
  CREATE INDEX "_header_v_autosave_idx" ON "_header_v" USING btree ("autosave");
  CREATE INDEX "_footer_v_version_groups_links_order_idx" ON "_footer_v_version_groups_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_groups_links_parent_id_idx" ON "_footer_v_version_groups_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_groups_order_idx" ON "_footer_v_version_groups" USING btree ("_order");
  CREATE INDEX "_footer_v_version_groups_parent_id_idx" ON "_footer_v_version_groups" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_legal_links_order_idx" ON "_footer_v_version_legal_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_legal_links_parent_id_idx" ON "_footer_v_version_legal_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_social_links_order_idx" ON "_footer_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_social_links_parent_id_idx" ON "_footer_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE INDEX "_footer_v_autosave_idx" ON "_footer_v" USING btree ("autosave");
  CREATE INDEX "_home_v_version_stats_order_idx" ON "_home_v_version_stats" USING btree ("_order");
  CREATE INDEX "_home_v_version_stats_parent_id_idx" ON "_home_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_seo_version_seo_image_idx" ON "_home_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "_home_v_autosave_idx" ON "_home_v" USING btree ("autosave");
  CREATE INDEX "_seo_defaults_v_version_version_default_image_idx" ON "_seo_defaults_v" USING btree ("version_default_image_id");
  CREATE INDEX "_seo_defaults_v_version_version__status_idx" ON "_seo_defaults_v" USING btree ("version__status");
  CREATE INDEX "_seo_defaults_v_created_at_idx" ON "_seo_defaults_v" USING btree ("created_at");
  CREATE INDEX "_seo_defaults_v_updated_at_idx" ON "_seo_defaults_v" USING btree ("updated_at");
  CREATE INDEX "_seo_defaults_v_latest_idx" ON "_seo_defaults_v" USING btree ("latest");
  CREATE INDEX "_seo_defaults_v_autosave_idx" ON "_seo_defaults_v" USING btree ("autosave");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "announcements" ADD CONSTRAINT "announcements_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_announcements_v" ADD CONSTRAINT "_announcements_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "committee_terms" ADD CONSTRAINT "committee_terms_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_committee_terms_v" ADD CONSTRAINT "_committee_terms_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "history_entries" ADD CONSTRAINT "history_entries_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_entries_v" ADD CONSTRAINT "_history_entries_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_reviewed_by_idx" ON "pages" USING btree ("reviewed_by_id");
  CREATE INDEX "_pages_v_version_version_reviewed_by_idx" ON "_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "posts_reviewed_by_idx" ON "posts" USING btree ("reviewed_by_id");
  CREATE INDEX "_posts_v_version_version_reviewed_by_idx" ON "_posts_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "announcements_reviewed_by_idx" ON "announcements" USING btree ("reviewed_by_id");
  CREATE INDEX "_announcements_v_version_version_reviewed_by_idx" ON "_announcements_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "chapters_seo_seo_image_idx" ON "chapters" USING btree ("seo_image_id");
  CREATE INDEX "chapters_reviewed_by_idx" ON "chapters" USING btree ("reviewed_by_id");
  CREATE INDEX "_chapters_v_version_seo_version_seo_image_idx" ON "_chapters_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_chapters_v_version_version_reviewed_by_idx" ON "_chapters_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "events_seo_seo_image_idx" ON "events" USING btree ("seo_image_id");
  CREATE INDEX "events_reviewed_by_idx" ON "events" USING btree ("reviewed_by_id");
  CREATE INDEX "_events_v_version_seo_version_seo_image_idx" ON "_events_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_events_v_version_version_reviewed_by_idx" ON "_events_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "committee_terms_reviewed_by_idx" ON "committee_terms" USING btree ("reviewed_by_id");
  CREATE INDEX "_committee_terms_v_version_version_reviewed_by_idx" ON "_committee_terms_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "history_entries_reviewed_by_idx" ON "history_entries" USING btree ("reviewed_by_id");
  CREATE INDEX "_history_entries_v_version_version_reviewed_by_idx" ON "_history_entries_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "header__status_idx" ON "header" USING btree ("_status");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");
  CREATE INDEX "home_seo_seo_image_idx" ON "home" USING btree ("seo_image_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "seo_defaults__status_idx" ON "seo_defaults" USING btree ("_status");

  UPDATE "pages" SET "editorial_status" = 'approved' WHERE "_status" = 'published';
  UPDATE "posts" SET "editorial_status" = 'approved' WHERE "_status" = 'published';
  UPDATE "announcements" SET "editorial_status" = 'approved' WHERE "_status" = 'published';
  UPDATE "chapters" SET "editorial_status" = 'approved' WHERE "_status" = 'published';
  UPDATE "events" SET "editorial_status" = 'approved' WHERE "_status" = 'published';
  UPDATE "committee_terms" SET "editorial_status" = 'approved' WHERE "_status" = 'published';
  UPDATE "history_entries" SET "editorial_status" = 'approved' WHERE "_status" = 'published';

  UPDATE "_pages_v" SET "version_editorial_status" = 'approved' WHERE "version__status" = 'published';
  UPDATE "_posts_v" SET "version_editorial_status" = 'approved' WHERE "version__status" = 'published';
  UPDATE "_announcements_v" SET "version_editorial_status" = 'approved' WHERE "version__status" = 'published';
  UPDATE "_chapters_v" SET "version_editorial_status" = 'approved' WHERE "version__status" = 'published';
  UPDATE "_events_v" SET "version_editorial_status" = 'approved' WHERE "version__status" = 'published';
  UPDATE "_committee_terms_v" SET "version_editorial_status" = 'approved' WHERE "version__status" = 'published';
  UPDATE "_history_entries_v" SET "version_editorial_status" = 'approved' WHERE "version__status" = 'published';

  UPDATE "site_settings" SET "_status" = 'published';
  UPDATE "header" SET "_status" = 'published';
  UPDATE "footer" SET "_status" = 'published';
  UPDATE "home" SET "_status" = 'published';
  UPDATE "seo_defaults" SET "_status" = 'published';

  UPDATE "footer_legal_links"
    SET "href" = '/privacy-policy', "label" = 'Privacy policy'
    WHERE "href" = '/privacy';
  UPDATE "site_settings"
    SET "manual_payment_review_note" = 'Payment proof is reviewed manually by authorized volunteers. Review timing may vary.'
    WHERE "manual_payment_review_note" = 'Payment proof is reviewed by authorized volunteers. No turnaround time is promised until the organization approves a review SLA.';
  UPDATE "site_settings"
    SET "no_refund_notice" = 'Zelle payments are non-refundable. Contact RUETIAN USA before paying if you have questions about an order.'
    WHERE "no_refund_notice" = 'No-refund wording is awaiting final stakeholder and legal approval before launch.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_site_settings_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v_version_utility_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v_version_main_links_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v_version_main_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_groups_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_seo_defaults_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_header_v_version_utility_links" CASCADE;
  DROP TABLE "_header_v_version_main_links_children" CASCADE;
  DROP TABLE "_header_v_version_main_links" CASCADE;
  DROP TABLE "_header_v" CASCADE;
  DROP TABLE "_footer_v_version_groups_links" CASCADE;
  DROP TABLE "_footer_v_version_groups" CASCADE;
  DROP TABLE "_footer_v_version_legal_links" CASCADE;
  DROP TABLE "_footer_v_version_social_links" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TABLE "_home_v_version_stats" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_seo_defaults_v" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "announcements" DROP CONSTRAINT "announcements_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_announcements_v" DROP CONSTRAINT "_announcements_v_version_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "chapters" DROP CONSTRAINT "chapters_seo_image_id_media_id_fk";
  
  ALTER TABLE "chapters" DROP CONSTRAINT "chapters_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_chapters_v" DROP CONSTRAINT "_chapters_v_version_seo_image_id_media_id_fk";
  
  ALTER TABLE "_chapters_v" DROP CONSTRAINT "_chapters_v_version_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_seo_image_id_media_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_seo_image_id_media_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "committee_terms" DROP CONSTRAINT "committee_terms_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_committee_terms_v" DROP CONSTRAINT "_committee_terms_v_version_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "history_entries" DROP CONSTRAINT "history_entries_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_history_entries_v" DROP CONSTRAINT "_history_entries_v_version_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "home" DROP CONSTRAINT "home_seo_image_id_media_id_fk";
  
  DROP INDEX "pages_reviewed_by_idx";
  DROP INDEX "_pages_v_version_version_reviewed_by_idx";
  DROP INDEX "posts_reviewed_by_idx";
  DROP INDEX "_posts_v_version_version_reviewed_by_idx";
  DROP INDEX "announcements_reviewed_by_idx";
  DROP INDEX "_announcements_v_version_version_reviewed_by_idx";
  DROP INDEX "chapters_seo_seo_image_idx";
  DROP INDEX "chapters_reviewed_by_idx";
  DROP INDEX "_chapters_v_version_seo_version_seo_image_idx";
  DROP INDEX "_chapters_v_version_version_reviewed_by_idx";
  DROP INDEX "events_seo_seo_image_idx";
  DROP INDEX "events_reviewed_by_idx";
  DROP INDEX "_events_v_version_seo_version_seo_image_idx";
  DROP INDEX "_events_v_version_version_reviewed_by_idx";
  DROP INDEX "committee_terms_reviewed_by_idx";
  DROP INDEX "_committee_terms_v_version_version_reviewed_by_idx";
  DROP INDEX "history_entries_reviewed_by_idx";
  DROP INDEX "_history_entries_v_version_version_reviewed_by_idx";
  DROP INDEX "site_settings__status_idx";
  DROP INDEX "header__status_idx";
  DROP INDEX "footer__status_idx";
  DROP INDEX "home_seo_seo_image_idx";
  DROP INDEX "home__status_idx";
  DROP INDEX "seo_defaults__status_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "organization_name" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "zelle_instructions" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "manual_payment_review_note" SET DEFAULT 'Payment proof is reviewed by authorized volunteers. No turnaround time is promised until the organization approves a review SLA.';
  ALTER TABLE "site_settings" ALTER COLUMN "manual_payment_review_note" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "no_refund_notice" SET DEFAULT 'No-refund wording is awaiting final stakeholder and legal approval before launch.';
  ALTER TABLE "site_settings" ALTER COLUMN "no_refund_notice" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "event_payment_terms" SET NOT NULL;
  ALTER TABLE "header_utility_links" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "header_utility_links" ALTER COLUMN "link_href" SET NOT NULL;
  ALTER TABLE "header_main_links_children" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "header_main_links_children" ALTER COLUMN "link_href" SET NOT NULL;
  ALTER TABLE "header_main_links" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "header_main_links" ALTER COLUMN "link_href" SET NOT NULL;
  ALTER TABLE "header" ALTER COLUMN "primary_cta_label" SET NOT NULL;
  ALTER TABLE "header" ALTER COLUMN "primary_cta_href" SET NOT NULL;
  ALTER TABLE "footer_groups_links" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "footer_groups_links" ALTER COLUMN "link_href" SET NOT NULL;
  ALTER TABLE "footer_groups" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "footer_legal_links" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "footer_legal_links" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "footer_social_links" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "footer_social_links" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "newsletter_cta_label" SET NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "newsletter_cta_href" SET NOT NULL;
  ALTER TABLE "home_stats" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "home_stats" ALTER COLUMN "value" SET NOT NULL;
  ALTER TABLE "home" ALTER COLUMN "hero_title" SET NOT NULL;
  ALTER TABLE "home" ALTER COLUMN "primary_cta_label" SET DEFAULT 'Join Membership';
  ALTER TABLE "home" ALTER COLUMN "secondary_cta_label" SET DEFAULT 'Explore Chapters';
  ALTER TABLE "pages" DROP COLUMN "editorial_status";
  ALTER TABLE "pages" DROP COLUMN "review_note";
  ALTER TABLE "pages" DROP COLUMN "reviewed_by_id";
  ALTER TABLE "pages" DROP COLUMN "reviewed_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_editorial_status";
  ALTER TABLE "_pages_v" DROP COLUMN "version_review_note";
  ALTER TABLE "_pages_v" DROP COLUMN "version_reviewed_by_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "posts" DROP COLUMN "editorial_status";
  ALTER TABLE "posts" DROP COLUMN "review_note";
  ALTER TABLE "posts" DROP COLUMN "reviewed_by_id";
  ALTER TABLE "posts" DROP COLUMN "reviewed_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_editorial_status";
  ALTER TABLE "_posts_v" DROP COLUMN "version_review_note";
  ALTER TABLE "_posts_v" DROP COLUMN "version_reviewed_by_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "announcements" DROP COLUMN "editorial_status";
  ALTER TABLE "announcements" DROP COLUMN "review_note";
  ALTER TABLE "announcements" DROP COLUMN "reviewed_by_id";
  ALTER TABLE "announcements" DROP COLUMN "reviewed_at";
  ALTER TABLE "_announcements_v" DROP COLUMN "version_editorial_status";
  ALTER TABLE "_announcements_v" DROP COLUMN "version_review_note";
  ALTER TABLE "_announcements_v" DROP COLUMN "version_reviewed_by_id";
  ALTER TABLE "_announcements_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "chapters" DROP COLUMN "seo_title";
  ALTER TABLE "chapters" DROP COLUMN "seo_description";
  ALTER TABLE "chapters" DROP COLUMN "seo_image_id";
  ALTER TABLE "chapters" DROP COLUMN "seo_no_index";
  ALTER TABLE "chapters" DROP COLUMN "editorial_status";
  ALTER TABLE "chapters" DROP COLUMN "review_note";
  ALTER TABLE "chapters" DROP COLUMN "reviewed_by_id";
  ALTER TABLE "chapters" DROP COLUMN "reviewed_at";
  ALTER TABLE "_chapters_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_chapters_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_chapters_v" DROP COLUMN "version_seo_image_id";
  ALTER TABLE "_chapters_v" DROP COLUMN "version_seo_no_index";
  ALTER TABLE "_chapters_v" DROP COLUMN "version_editorial_status";
  ALTER TABLE "_chapters_v" DROP COLUMN "version_review_note";
  ALTER TABLE "_chapters_v" DROP COLUMN "version_reviewed_by_id";
  ALTER TABLE "_chapters_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "events" DROP COLUMN "seo_title";
  ALTER TABLE "events" DROP COLUMN "seo_description";
  ALTER TABLE "events" DROP COLUMN "seo_image_id";
  ALTER TABLE "events" DROP COLUMN "seo_no_index";
  ALTER TABLE "events" DROP COLUMN "editorial_status";
  ALTER TABLE "events" DROP COLUMN "review_note";
  ALTER TABLE "events" DROP COLUMN "reviewed_by_id";
  ALTER TABLE "events" DROP COLUMN "reviewed_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_events_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_events_v" DROP COLUMN "version_seo_image_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_seo_no_index";
  ALTER TABLE "_events_v" DROP COLUMN "version_editorial_status";
  ALTER TABLE "_events_v" DROP COLUMN "version_review_note";
  ALTER TABLE "_events_v" DROP COLUMN "version_reviewed_by_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "committee_terms" DROP COLUMN "editorial_status";
  ALTER TABLE "committee_terms" DROP COLUMN "review_note";
  ALTER TABLE "committee_terms" DROP COLUMN "reviewed_by_id";
  ALTER TABLE "committee_terms" DROP COLUMN "reviewed_at";
  ALTER TABLE "_committee_terms_v" DROP COLUMN "version_editorial_status";
  ALTER TABLE "_committee_terms_v" DROP COLUMN "version_review_note";
  ALTER TABLE "_committee_terms_v" DROP COLUMN "version_reviewed_by_id";
  ALTER TABLE "_committee_terms_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "history_entries" DROP COLUMN "editorial_status";
  ALTER TABLE "history_entries" DROP COLUMN "review_note";
  ALTER TABLE "history_entries" DROP COLUMN "reviewed_by_id";
  ALTER TABLE "history_entries" DROP COLUMN "reviewed_at";
  ALTER TABLE "_history_entries_v" DROP COLUMN "version_editorial_status";
  ALTER TABLE "_history_entries_v" DROP COLUMN "version_review_note";
  ALTER TABLE "_history_entries_v" DROP COLUMN "version_reviewed_by_id";
  ALTER TABLE "_history_entries_v" DROP COLUMN "version_reviewed_at";
  ALTER TABLE "site_settings" DROP COLUMN "_status";
  ALTER TABLE "header" DROP COLUMN "_status";
  ALTER TABLE "footer" DROP COLUMN "_status";
  ALTER TABLE "home" DROP COLUMN "network_panel_eyebrow";
  ALTER TABLE "home" DROP COLUMN "network_panel_title";
  ALTER TABLE "home" DROP COLUMN "network_panel_description";
  ALTER TABLE "home" DROP COLUMN "stats_section_eyebrow";
  ALTER TABLE "home" DROP COLUMN "stats_section_title";
  ALTER TABLE "home" DROP COLUMN "announcement_section_title";
  ALTER TABLE "home" DROP COLUMN "announcement_section_description";
  ALTER TABLE "home" DROP COLUMN "chapters_section_title";
  ALTER TABLE "home" DROP COLUMN "chapters_section_description";
  ALTER TABLE "home" DROP COLUMN "events_section_title";
  ALTER TABLE "home" DROP COLUMN "events_section_description";
  ALTER TABLE "home" DROP COLUMN "history_section_title";
  ALTER TABLE "home" DROP COLUMN "history_section_description";
  ALTER TABLE "home" DROP COLUMN "committees_section_title";
  ALTER TABLE "home" DROP COLUMN "committees_section_description";
  ALTER TABLE "home" DROP COLUMN "learning_section_title";
  ALTER TABLE "home" DROP COLUMN "learning_section_description";
  ALTER TABLE "home" DROP COLUMN "seo_title";
  ALTER TABLE "home" DROP COLUMN "seo_description";
  ALTER TABLE "home" DROP COLUMN "seo_image_id";
  ALTER TABLE "home" DROP COLUMN "seo_no_index";
  ALTER TABLE "home" DROP COLUMN "_status";
  ALTER TABLE "seo_defaults" DROP COLUMN "_status";
  DROP TYPE "public"."enum_pages_editorial_status";
  DROP TYPE "public"."enum__pages_v_version_editorial_status";
  DROP TYPE "public"."enum_posts_editorial_status";
  DROP TYPE "public"."enum__posts_v_version_editorial_status";
  DROP TYPE "public"."enum_announcements_editorial_status";
  DROP TYPE "public"."enum__announcements_v_version_editorial_status";
  DROP TYPE "public"."enum_chapters_editorial_status";
  DROP TYPE "public"."enum__chapters_v_version_editorial_status";
  DROP TYPE "public"."enum_events_editorial_status";
  DROP TYPE "public"."enum__events_v_version_editorial_status";
  DROP TYPE "public"."enum_committee_terms_editorial_status";
  DROP TYPE "public"."enum__committee_terms_v_version_editorial_status";
  DROP TYPE "public"."enum_history_entries_editorial_status";
  DROP TYPE "public"."enum__history_entries_v_version_editorial_status";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum_header_status";
  DROP TYPE "public"."enum__header_v_version_status";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_status";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_status";
  DROP TYPE "public"."enum_seo_defaults_status";
  DROP TYPE "public"."enum__seo_defaults_v_version_status";`)
}
