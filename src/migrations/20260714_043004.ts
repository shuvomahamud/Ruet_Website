import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_submissions_topic" AS ENUM('general', 'membership', 'chapter', 'events', 'website');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'in_review', 'closed');
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('standard', 'institutional', 'legal');
  CREATE TYPE "public"."enum_pages_legal_status" AS ENUM('placeholder', 'approved');
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('standard', 'institutional', 'legal');
  CREATE TYPE "public"."enum__pages_v_version_legal_status" AS ENUM('placeholder', 'approved');
  CREATE TYPE "public"."enum_posts_content_type" AS ENUM('article', 'resource', 'news');
  CREATE TYPE "public"."enum__posts_v_version_content_type" AS ENUM('article', 'resource', 'news');
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"topic" "enum_contact_submissions_topic" DEFAULT 'general' NOT NULL,
  	"status" "enum_contact_submissions_status" DEFAULT 'new' NOT NULL,
  	"submitted_at" timestamp(3) with time zone NOT NULL,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_main_links_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"link_description" varchar
  );
  
  ALTER TABLE "site_settings" ALTER COLUMN "utility_message" SET DEFAULT 'Connecting RUET alumni across the United States';
  ALTER TABLE "site_settings" ALTER COLUMN "footer_note" SET DEFAULT 'Membership, chapters, events, and learning opportunities for the RUET alumni community.';
  ALTER TABLE "footer" ALTER COLUMN "newsletter_summary" SET DEFAULT 'Receive organization news, chapter updates, event notices, and learning resources.';
  ALTER TABLE "footer" ALTER COLUMN "legal_notice" SET DEFAULT 'RUETIAN USA is an alumni-led community serving RUET graduates in the United States.';
  ALTER TABLE "home" ALTER COLUMN "hero_description" SET DEFAULT 'Connect with RUET alumni across the United States through membership, regional chapters, events, and shared professional learning.';
  ALTER TABLE "home" ALTER COLUMN "membership_section_title" SET DEFAULT 'One community, year-round connection';
  ALTER TABLE "home" ALTER COLUMN "membership_section_description" SET DEFAULT 'Annual membership helps sustain alumni programming, regional chapters, professional development, and community connections.';
  ALTER TABLE "pages_sections" ADD COLUMN "anchor" varchar;
  ALTER TABLE "pages" ADD COLUMN "page_type" "enum_pages_page_type" DEFAULT 'standard';
  ALTER TABLE "pages" ADD COLUMN "legal_status" "enum_pages_legal_status" DEFAULT 'placeholder';
  ALTER TABLE "pages" ADD COLUMN "last_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "pages" ADD COLUMN "seo_no_index" boolean DEFAULT false;
  ALTER TABLE "_pages_v_version_sections" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_page_type" "enum__pages_v_version_page_type" DEFAULT 'standard';
  ALTER TABLE "_pages_v" ADD COLUMN "version_legal_status" "enum__pages_v_version_legal_status" DEFAULT 'placeholder';
  ALTER TABLE "_pages_v" ADD COLUMN "version_last_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_image_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_no_index" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "rich_body" jsonb;
  ALTER TABLE "posts" ADD COLUMN "author_name" varchar;
  ALTER TABLE "posts" ADD COLUMN "reading_time_minutes" numeric;
  ALTER TABLE "posts" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "content_type" "enum_posts_content_type" DEFAULT 'article';
  ALTER TABLE "posts" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "posts" ADD COLUMN "seo_no_index" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_rich_body" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_author_name" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_reading_time_minutes" numeric;
  ALTER TABLE "_posts_v" ADD COLUMN "version_featured" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_content_type" "enum__posts_v_version_content_type" DEFAULT 'article';
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_image_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_no_index" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_submissions_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "chapter_support_email" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "primary_phone" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "mailing_address" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contact_response_note" varchar DEFAULT 'Send us a message and the appropriate RUETIAN USA volunteer will follow up when available.';
  ALTER TABLE "header_main_links" ADD COLUMN "featured_eyebrow" varchar;
  ALTER TABLE "header_main_links" ADD COLUMN "featured_title" varchar;
  ALTER TABLE "header_main_links" ADD COLUMN "featured_description" varchar;
  ALTER TABLE "header_main_links" ADD COLUMN "featured_label" varchar;
  ALTER TABLE "header_main_links" ADD COLUMN "featured_href" varchar;
  ALTER TABLE "seo_defaults" ADD COLUMN "site_name" varchar DEFAULT 'RUETIAN USA';
  ALTER TABLE "seo_defaults" ADD COLUMN "default_image_id" integer;
  ALTER TABLE "seo_defaults" ADD COLUMN "social_handle" varchar;
  ALTER TABLE "header_main_links_children" ADD CONSTRAINT "header_main_links_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_main_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE INDEX "header_main_links_children_order_idx" ON "header_main_links_children" USING btree ("_order");
  CREATE INDEX "header_main_links_children_parent_id_idx" ON "header_main_links_children" USING btree ("_parent_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_defaults" ADD CONSTRAINT "seo_defaults_default_image_id_media_id_fk" FOREIGN KEY ("default_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "posts_seo_seo_image_idx" ON "posts" USING btree ("seo_image_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_image_idx" ON "_posts_v" USING btree ("version_seo_image_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "seo_defaults_default_image_idx" ON "seo_defaults" USING btree ("default_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_main_links_children" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "header_main_links_children" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_seo_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_seo_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk";
  
  ALTER TABLE "seo_defaults" DROP CONSTRAINT "seo_defaults_default_image_id_media_id_fk";
  
  DROP INDEX "pages_seo_seo_image_idx";
  DROP INDEX "_pages_v_version_seo_version_seo_image_idx";
  DROP INDEX "posts_seo_seo_image_idx";
  DROP INDEX "_posts_v_version_seo_version_seo_image_idx";
  DROP INDEX "payload_locked_documents_rels_contact_submissions_id_idx";
  DROP INDEX "seo_defaults_default_image_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "utility_message" SET DEFAULT 'Association website foundation';
  ALTER TABLE "site_settings" ALTER COLUMN "footer_note" SET DEFAULT 'The website content, branding, and legal copy will continue to evolve as later implementation phases are completed.';
  ALTER TABLE "footer" ALTER COLUMN "newsletter_summary" SET DEFAULT 'Newsletter sending will be enabled in a later phase once the email provider is configured.';
  ALTER TABLE "footer" ALTER COLUMN "legal_notice" SET DEFAULT 'Final legal copy is still an open item and will be added before launch.';
  ALTER TABLE "home" ALTER COLUMN "hero_description" SET DEFAULT 'This foundation now supports dynamic content, publishing workflows, chapter structure, membership data models, and the public site shell needed for the next implementation phases.';
  ALTER TABLE "home" ALTER COLUMN "membership_section_title" SET DEFAULT 'Membership foundation';
  ALTER TABLE "home" ALTER COLUMN "membership_section_description" SET DEFAULT 'The site is structured for one annual membership plan at launch, with configurable pricing and future-ready schema support.';
  ALTER TABLE "pages_sections" DROP COLUMN "anchor";
  ALTER TABLE "pages" DROP COLUMN "page_type";
  ALTER TABLE "pages" DROP COLUMN "legal_status";
  ALTER TABLE "pages" DROP COLUMN "last_reviewed_at";
  ALTER TABLE "pages" DROP COLUMN "seo_title";
  ALTER TABLE "pages" DROP COLUMN "seo_description";
  ALTER TABLE "pages" DROP COLUMN "seo_image_id";
  ALTER TABLE "pages" DROP COLUMN "seo_no_index";
  ALTER TABLE "_pages_v_version_sections" DROP COLUMN "anchor";
  ALTER TABLE "_pages_v" DROP COLUMN "version_page_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_legal_status";
  ALTER TABLE "_pages_v" DROP COLUMN "version_last_reviewed_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_no_index";
  ALTER TABLE "posts" DROP COLUMN "rich_body";
  ALTER TABLE "posts" DROP COLUMN "author_name";
  ALTER TABLE "posts" DROP COLUMN "reading_time_minutes";
  ALTER TABLE "posts" DROP COLUMN "featured";
  ALTER TABLE "posts" DROP COLUMN "content_type";
  ALTER TABLE "posts" DROP COLUMN "seo_title";
  ALTER TABLE "posts" DROP COLUMN "seo_description";
  ALTER TABLE "posts" DROP COLUMN "seo_image_id";
  ALTER TABLE "posts" DROP COLUMN "seo_no_index";
  ALTER TABLE "_posts_v" DROP COLUMN "version_rich_body";
  ALTER TABLE "_posts_v" DROP COLUMN "version_author_name";
  ALTER TABLE "_posts_v" DROP COLUMN "version_reading_time_minutes";
  ALTER TABLE "_posts_v" DROP COLUMN "version_featured";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content_type";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_no_index";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_submissions_id";
  ALTER TABLE "site_settings" DROP COLUMN "chapter_support_email";
  ALTER TABLE "site_settings" DROP COLUMN "primary_phone";
  ALTER TABLE "site_settings" DROP COLUMN "mailing_address";
  ALTER TABLE "site_settings" DROP COLUMN "contact_response_note";
  ALTER TABLE "header_main_links" DROP COLUMN "featured_eyebrow";
  ALTER TABLE "header_main_links" DROP COLUMN "featured_title";
  ALTER TABLE "header_main_links" DROP COLUMN "featured_description";
  ALTER TABLE "header_main_links" DROP COLUMN "featured_label";
  ALTER TABLE "header_main_links" DROP COLUMN "featured_href";
  ALTER TABLE "seo_defaults" DROP COLUMN "site_name";
  ALTER TABLE "seo_defaults" DROP COLUMN "default_image_id";
  ALTER TABLE "seo_defaults" DROP COLUMN "social_handle";
  DROP TYPE "public"."enum_contact_submissions_topic";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum_pages_legal_status";
  DROP TYPE "public"."enum__pages_v_version_page_type";
  DROP TYPE "public"."enum__pages_v_version_legal_status";
  DROP TYPE "public"."enum_posts_content_type";
  DROP TYPE "public"."enum__posts_v_version_content_type";`)
}
