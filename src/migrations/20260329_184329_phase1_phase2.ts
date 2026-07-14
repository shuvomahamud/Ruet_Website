import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('member', 'chapterAdmin', 'admin', 'superAdmin');
  CREATE TYPE "public"."enum_users_account_status" AS ENUM('pending', 'active', 'suspended', 'deleted');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_announcements_audience" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum_announcements_tone" AS ENUM('info', 'success', 'alert');
  CREATE TYPE "public"."enum_announcements_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__announcements_v_version_audience" AS ENUM('public', 'members');
  CREATE TYPE "public"."enum__announcements_v_version_tone" AS ENUM('info', 'success', 'alert');
  CREATE TYPE "public"."enum__announcements_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_chapters_chapter_status" AS ENUM('active', 'inactive', 'planning');
  CREATE TYPE "public"."enum_chapters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__chapters_v_version_chapter_status" AS ENUM('active', 'inactive', 'planning');
  CREATE TYPE "public"."enum__chapters_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_chapter_requests_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_memberships_status" AS ENUM('pending_payment', 'pending_manual_approval', 'active', 'grace_period', 'expired', 'failed_manual_payment', 'cancelled_by_admin', 'suspended');
  CREATE TYPE "public"."enum_memberships_payment_method" AS ENUM('stripe', 'zelle');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_event_mode" AS ENUM('inPerson', 'virtual', 'hybrid');
  CREATE TYPE "public"."enum_events_timezone" AS ENUM('America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles');
  CREATE TYPE "public"."enum_events_virtual_access_visibility" AS ENUM('public', 'registered');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_event_mode" AS ENUM('inPerson', 'virtual', 'hybrid');
  CREATE TYPE "public"."enum__events_v_version_timezone" AS ENUM('America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles');
  CREATE TYPE "public"."enum__events_v_version_virtual_access_visibility" AS ENUM('public', 'registered');
  CREATE TYPE "public"."enum_event_registrations_status" AS ENUM('pending', 'confirmed', 'waitlisted', 'cancelled');
  CREATE TYPE "public"."enum_event_registrations_payment_status" AS ENUM('pending', 'paid', 'failed');
  CREATE TYPE "public"."enum_waitlist_entries_status" AS ENUM('waiting', 'promoted', 'expired');
  CREATE TYPE "public"."enum_orders_order_type" AS ENUM('membership', 'event');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'paid', 'failed', 'cancelled');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('stripe', 'zelle');
  CREATE TYPE "public"."enum_payments_payment_source" AS ENUM('stripe', 'zelle');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('pending', 'approved', 'failed');
  CREATE TYPE "public"."enum_promotions_scope" AS ENUM('membership', 'event', 'both');
  CREATE TYPE "public"."enum_promotions_discount_type" AS ENUM('fixed', 'percent');
  CREATE TYPE "public"."enum_committee_terms_committee_type" AS ENUM('running', 'advisory');
  CREATE TYPE "public"."enum_committee_terms_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__committee_terms_v_version_committee_type" AS ENUM('running', 'advisory');
  CREATE TYPE "public"."enum__committee_terms_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_history_entries_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__history_entries_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_newsletter_campaigns_audience" AS ENUM('all', 'members');
  CREATE TYPE "public"."enum_newsletter_campaigns_status" AS ENUM('draft', 'scheduled', 'sent');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"chapters_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_description" varchar,
  	"summary" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_eyebrow" varchar,
  	"version_hero_title" varchar,
  	"version_hero_description" varchar,
  	"version_summary" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"body" varchar,
  	"featured_image_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" varchar,
  	"version_featured_image_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"details" varchar,
  	"chapter_id" integer,
  	"audience" "enum_announcements_audience" DEFAULT 'public',
  	"tone" "enum_announcements_tone" DEFAULT 'info',
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"active_from" timestamp(3) with time zone,
  	"active_to" timestamp(3) with time zone,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_announcements_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_announcements_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_details" varchar,
  	"version_chapter_id" integer,
  	"version_audience" "enum__announcements_v_version_audience" DEFAULT 'public',
  	"version_tone" "enum__announcements_v_version_tone" DEFAULT 'info',
  	"version_cta_label" varchar,
  	"version_cta_href" varchar,
  	"version_active_from" timestamp(3) with time zone,
  	"version_active_to" timestamp(3) with time zone,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__announcements_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"chapter_status" "enum_chapters_chapter_status" DEFAULT 'active',
  	"region_or_state" varchar,
  	"summary" varchar,
  	"description" varchar,
  	"contact_email" varchar,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_chapters_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "chapters_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_chapters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_chapter_status" "enum__chapters_v_version_chapter_status" DEFAULT 'active',
  	"version_region_or_state" varchar,
  	"version_summary" varchar,
  	"version_description" varchar,
  	"version_contact_email" varchar,
  	"version_hero_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__chapters_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_chapters_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "chapter_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"requested_name" varchar NOT NULL,
  	"requester_id" integer NOT NULL,
  	"status" "enum_chapter_requests_status" DEFAULT 'pending' NOT NULL,
  	"notes" varchar,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "membership_plans_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "membership_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"public_summary" varchar,
  	"annual_price" numeric DEFAULT 50 NOT NULL,
  	"currency" varchar DEFAULT 'USD' NOT NULL,
  	"active" boolean DEFAULT true,
  	"auto_renew_enabled" boolean DEFAULT true,
  	"grace_period_days" numeric DEFAULT 7,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"plan_id" integer NOT NULL,
  	"status" "enum_memberships_status" NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"renewal_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone,
  	"grace_ends_at" timestamp(3) with time zone,
  	"auto_renew_enabled" boolean DEFAULT true,
  	"payment_method" "enum_memberships_payment_method",
  	"chapter_snapshot" varchar,
  	"plan_title_snapshot" varchar,
  	"plan_price_snapshot" numeric,
  	"currency_snapshot" varchar,
  	"billing_interval_snapshot" varchar DEFAULT 'annual',
  	"reactivation_eligible" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"chapter_id" integer,
  	"status" "enum_events_status" DEFAULT 'draft',
  	"event_mode" "enum_events_event_mode",
  	"start_at" timestamp(3) with time zone,
  	"end_at" timestamp(3) with time zone,
  	"timezone" "enum_events_timezone" DEFAULT 'America/New_York',
  	"venue" varchar,
  	"virtual_link" varchar,
  	"virtual_access_visibility" "enum_events_virtual_access_visibility" DEFAULT 'public',
  	"summary" varchar,
  	"details" varchar,
  	"featured_image_id" integer,
  	"is_paid" boolean DEFAULT false,
  	"base_price" numeric DEFAULT 0,
  	"currency" varchar DEFAULT 'USD',
  	"capacity" numeric,
  	"waitlist_enabled" boolean DEFAULT true,
  	"max_registration_quantity" numeric DEFAULT 1,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_chapter_id" integer,
  	"version_status" "enum__events_v_version_status" DEFAULT 'draft',
  	"version_event_mode" "enum__events_v_version_event_mode",
  	"version_start_at" timestamp(3) with time zone,
  	"version_end_at" timestamp(3) with time zone,
  	"version_timezone" "enum__events_v_version_timezone" DEFAULT 'America/New_York',
  	"version_venue" varchar,
  	"version_virtual_link" varchar,
  	"version_virtual_access_visibility" "enum__events_v_version_virtual_access_visibility" DEFAULT 'public',
  	"version_summary" varchar,
  	"version_details" varchar,
  	"version_featured_image_id" integer,
  	"version_is_paid" boolean DEFAULT false,
  	"version_base_price" numeric DEFAULT 0,
  	"version_currency" varchar DEFAULT 'USD',
  	"version_capacity" numeric,
  	"version_waitlist_enabled" boolean DEFAULT true,
  	"version_max_registration_quantity" numeric DEFAULT 1,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "event_registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"status" "enum_event_registrations_status" NOT NULL,
  	"order_id" integer,
  	"payment_status" "enum_event_registrations_payment_status",
  	"registration_price_snapshot" numeric,
  	"discount_snapshot" numeric,
  	"waitlist_position" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "waitlist_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"joined_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_waitlist_entries_status" NOT NULL,
  	"promoted_at" timestamp(3) with time zone,
  	"promotion_expiry_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"order_type" "enum_orders_order_type" NOT NULL,
  	"chapter_attribution_id" integer,
  	"status" "enum_orders_status" NOT NULL,
  	"subtotal" numeric NOT NULL,
  	"discount_total" numeric DEFAULT 0,
  	"total" numeric NOT NULL,
  	"currency" varchar DEFAULT 'USD' NOT NULL,
  	"payment_method" "enum_orders_payment_method",
  	"stripe_session_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"order_id" integer NOT NULL,
  	"payment_source" "enum_payments_payment_source" NOT NULL,
  	"status" "enum_payments_status" NOT NULL,
  	"external_reference" varchar,
  	"proof_image_id" integer,
  	"proof_transaction_id" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"first_reviewer_chapter_id" integer,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"rejected_by_id" integer,
  	"rejected_at" timestamp(3) with time zone,
  	"rejection_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"scope" "enum_promotions_scope" NOT NULL,
  	"discount_type" "enum_promotions_discount_type" NOT NULL,
  	"discount_value" numeric NOT NULL,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"usage_limit" numeric,
  	"active" boolean DEFAULT true,
  	"member_only" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "committee_terms_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"bio" varchar
  );
  
  CREATE TABLE "committee_terms_event_recaps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"event_date" timestamp(3) with time zone,
  	"summary" varchar
  );
  
  CREATE TABLE "committee_terms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"committee_type" "enum_committee_terms_committee_type",
  	"chapter_id" integer,
  	"title" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"is_current" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_committee_terms_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "committee_terms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_committee_terms_v_version_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"bio" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_committee_terms_v_version_event_recaps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"event_date" timestamp(3) with time zone,
  	"summary" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_committee_terms_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_committee_type" "enum__committee_terms_v_version_committee_type",
  	"version_chapter_id" integer,
  	"version_title" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_is_current" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__committee_terms_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_committee_terms_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "history_entries_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "history_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"start_year" numeric,
  	"end_year" numeric,
  	"summary" varchar,
  	"body" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_history_entries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "history_entries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_history_entries_v_version_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_history_entries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_start_year" numeric,
  	"version_end_year" numeric,
  	"version_summary" varchar,
  	"version_body" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__history_entries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_history_entries_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "newsletter_campaigns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"summary" varchar,
  	"body" varchar NOT NULL,
  	"audience" "enum_newsletter_campaigns_audience" NOT NULL,
  	"status" "enum_newsletter_campaigns_status" DEFAULT 'draft' NOT NULL,
  	"scheduled_at" timestamp(3) with time zone,
  	"sent_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_name" varchar DEFAULT 'RUETIAN USA' NOT NULL,
  	"tagline" varchar DEFAULT 'RUET alumni community in the United States',
  	"primary_email" varchar DEFAULT 'info@ruetianusa.org',
  	"utility_message" varchar DEFAULT 'Association website foundation',
  	"footer_note" varchar DEFAULT 'The website content, branding, and legal copy will continue to evolve as later implementation phases are completed.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_utility_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"link_description" varchar
  );
  
  CREATE TABLE "header_main_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"link_description" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"primary_cta_label" varchar DEFAULT 'Join Membership' NOT NULL,
  	"primary_cta_href" varchar DEFAULT '/membership' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"link_description" varchar
  );
  
  CREATE TABLE "footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"newsletter_title" varchar DEFAULT 'Stay connected',
  	"newsletter_summary" varchar DEFAULT 'Newsletter sending will be enabled in a later phase once the email provider is configured.',
  	"legal_notice" varchar DEFAULT 'Final legal copy is still an open item and will be added before launch.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'RUET Alumni Association',
  	"hero_title" varchar DEFAULT 'A professional, chapter-centered home for RUET alumni in the United States.' NOT NULL,
  	"hero_description" varchar DEFAULT 'This foundation now supports dynamic content, publishing workflows, chapter structure, membership data models, and the public site shell needed for the next implementation phases.',
  	"primary_cta_label" varchar DEFAULT 'Join Membership',
  	"primary_cta_href" varchar DEFAULT '/membership',
  	"secondary_cta_label" varchar DEFAULT 'Explore Chapters',
  	"secondary_cta_href" varchar DEFAULT '/chapters',
  	"membership_section_title" varchar DEFAULT 'Membership foundation',
  	"membership_section_description" varchar DEFAULT 'The site is structured for one annual membership plan at launch, with configurable pricing and future-ready schema support.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title_suffix" varchar DEFAULT ' | RUETIAN USA',
  	"default_description" varchar DEFAULT 'RUETIAN USA is a chapter-driven alumni association platform built for community, membership, events, and institutional continuity.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "first_name" varchar;
  ALTER TABLE "users" ADD COLUMN "last_name" varchar;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'member' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "account_status" "enum_users_account_status" DEFAULT 'active' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "primary_chapter_id" integer;
  ALTER TABLE "users" ADD COLUMN "phone_number" varchar;
  ALTER TABLE "users" ADD COLUMN "ruet_department" varchar;
  ALTER TABLE "users" ADD COLUMN "graduation_year" numeric;
  ALTER TABLE "users" ADD COLUMN "alumni_reference" varchar;
  ALTER TABLE "users" ADD COLUMN "city" varchar;
  ALTER TABLE "users" ADD COLUMN "state" varchar;
  ALTER TABLE "users" ADD COLUMN "country" varchar DEFAULT 'United States';
  ALTER TABLE "users" ADD COLUMN "employer" varchar;
  ALTER TABLE "users" ADD COLUMN "professional_title" varchar;
  ALTER TABLE "users" ADD COLUMN "communication_preferences_allow_announcements" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "communication_preferences_allow_newsletters" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "communication_preferences_allow_system_emails" boolean DEFAULT true;
  ALTER TABLE "media" ADD COLUMN "caption" varchar;
  ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "announcements_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chapters_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chapter_requests_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "membership_plans_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "memberships_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_registrations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "waitlist_entries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "promotions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "committee_terms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "history_entries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletter_campaigns_id" integer;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections" ADD CONSTRAINT "_pages_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "announcements" ADD CONSTRAINT "announcements_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_announcements_v" ADD CONSTRAINT "_announcements_v_parent_id_announcements_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."announcements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_announcements_v" ADD CONSTRAINT "_announcements_v_version_chapter_id_chapters_id_fk" FOREIGN KEY ("version_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters_rels" ADD CONSTRAINT "chapters_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_rels" ADD CONSTRAINT "chapters_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_parent_id_chapters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v_rels" ADD CONSTRAINT "_chapters_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_rels" ADD CONSTRAINT "_chapters_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapter_requests" ADD CONSTRAINT "chapter_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapter_requests" ADD CONSTRAINT "chapter_requests_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership_plans_benefits" ADD CONSTRAINT "membership_plans_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."membership_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_plan_id_membership_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_chapter_id_chapters_id_fk" FOREIGN KEY ("version_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_chapter_attribution_id_chapters_id_fk" FOREIGN KEY ("chapter_attribution_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_proof_image_id_media_id_fk" FOREIGN KEY ("proof_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_first_reviewer_chapter_id_chapters_id_fk" FOREIGN KEY ("first_reviewer_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_rejected_by_id_users_id_fk" FOREIGN KEY ("rejected_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "committee_terms_members" ADD CONSTRAINT "committee_terms_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "committee_terms_members" ADD CONSTRAINT "committee_terms_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."committee_terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_terms_event_recaps" ADD CONSTRAINT "committee_terms_event_recaps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."committee_terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_terms" ADD CONSTRAINT "committee_terms_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "committee_terms_rels" ADD CONSTRAINT "committee_terms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."committee_terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "committee_terms_rels" ADD CONSTRAINT "committee_terms_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_committee_terms_v_version_members" ADD CONSTRAINT "_committee_terms_v_version_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_committee_terms_v_version_members" ADD CONSTRAINT "_committee_terms_v_version_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_committee_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_committee_terms_v_version_event_recaps" ADD CONSTRAINT "_committee_terms_v_version_event_recaps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_committee_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_committee_terms_v" ADD CONSTRAINT "_committee_terms_v_parent_id_committee_terms_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."committee_terms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_committee_terms_v" ADD CONSTRAINT "_committee_terms_v_version_chapter_id_chapters_id_fk" FOREIGN KEY ("version_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_committee_terms_v_rels" ADD CONSTRAINT "_committee_terms_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_committee_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_committee_terms_v_rels" ADD CONSTRAINT "_committee_terms_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_entries_external_links" ADD CONSTRAINT "history_entries_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_entries_rels" ADD CONSTRAINT "history_entries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."history_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_entries_rels" ADD CONSTRAINT "history_entries_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_entries_v_version_external_links" ADD CONSTRAINT "_history_entries_v_version_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_entries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_entries_v" ADD CONSTRAINT "_history_entries_v_parent_id_history_entries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."history_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_entries_v_rels" ADD CONSTRAINT "_history_entries_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_history_entries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_entries_v_rels" ADD CONSTRAINT "_history_entries_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_utility_links" ADD CONSTRAINT "header_utility_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_main_links" ADD CONSTRAINT "header_main_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_groups_links" ADD CONSTRAINT "footer_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_groups" ADD CONSTRAINT "footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stats" ADD CONSTRAINT "home_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_chapters_id_idx" ON "users_rels" USING btree ("chapters_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "pages_sections_order_idx" ON "pages_sections" USING btree ("_order");
  CREATE INDEX "pages_sections_parent_id_idx" ON "pages_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_version_sections_order_idx" ON "_pages_v_version_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_parent_id_idx" ON "_pages_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "announcements_chapter_idx" ON "announcements" USING btree ("chapter_id");
  CREATE INDEX "announcements_updated_at_idx" ON "announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");
  CREATE INDEX "announcements__status_idx" ON "announcements" USING btree ("_status");
  CREATE INDEX "_announcements_v_parent_idx" ON "_announcements_v" USING btree ("parent_id");
  CREATE INDEX "_announcements_v_version_version_chapter_idx" ON "_announcements_v" USING btree ("version_chapter_id");
  CREATE INDEX "_announcements_v_version_version_updated_at_idx" ON "_announcements_v" USING btree ("version_updated_at");
  CREATE INDEX "_announcements_v_version_version_created_at_idx" ON "_announcements_v" USING btree ("version_created_at");
  CREATE INDEX "_announcements_v_version_version__status_idx" ON "_announcements_v" USING btree ("version__status");
  CREATE INDEX "_announcements_v_created_at_idx" ON "_announcements_v" USING btree ("created_at");
  CREATE INDEX "_announcements_v_updated_at_idx" ON "_announcements_v" USING btree ("updated_at");
  CREATE INDEX "_announcements_v_latest_idx" ON "_announcements_v" USING btree ("latest");
  CREATE INDEX "_announcements_v_autosave_idx" ON "_announcements_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "chapters_slug_idx" ON "chapters" USING btree ("slug");
  CREATE INDEX "chapters_hero_image_idx" ON "chapters" USING btree ("hero_image_id");
  CREATE INDEX "chapters_updated_at_idx" ON "chapters" USING btree ("updated_at");
  CREATE INDEX "chapters_created_at_idx" ON "chapters" USING btree ("created_at");
  CREATE INDEX "chapters__status_idx" ON "chapters" USING btree ("_status");
  CREATE INDEX "chapters_rels_order_idx" ON "chapters_rels" USING btree ("order");
  CREATE INDEX "chapters_rels_parent_idx" ON "chapters_rels" USING btree ("parent_id");
  CREATE INDEX "chapters_rels_path_idx" ON "chapters_rels" USING btree ("path");
  CREATE INDEX "chapters_rels_users_id_idx" ON "chapters_rels" USING btree ("users_id");
  CREATE INDEX "_chapters_v_parent_idx" ON "_chapters_v" USING btree ("parent_id");
  CREATE INDEX "_chapters_v_version_version_slug_idx" ON "_chapters_v" USING btree ("version_slug");
  CREATE INDEX "_chapters_v_version_version_hero_image_idx" ON "_chapters_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_chapters_v_version_version_updated_at_idx" ON "_chapters_v" USING btree ("version_updated_at");
  CREATE INDEX "_chapters_v_version_version_created_at_idx" ON "_chapters_v" USING btree ("version_created_at");
  CREATE INDEX "_chapters_v_version_version__status_idx" ON "_chapters_v" USING btree ("version__status");
  CREATE INDEX "_chapters_v_created_at_idx" ON "_chapters_v" USING btree ("created_at");
  CREATE INDEX "_chapters_v_updated_at_idx" ON "_chapters_v" USING btree ("updated_at");
  CREATE INDEX "_chapters_v_latest_idx" ON "_chapters_v" USING btree ("latest");
  CREATE INDEX "_chapters_v_autosave_idx" ON "_chapters_v" USING btree ("autosave");
  CREATE INDEX "_chapters_v_rels_order_idx" ON "_chapters_v_rels" USING btree ("order");
  CREATE INDEX "_chapters_v_rels_parent_idx" ON "_chapters_v_rels" USING btree ("parent_id");
  CREATE INDEX "_chapters_v_rels_path_idx" ON "_chapters_v_rels" USING btree ("path");
  CREATE INDEX "_chapters_v_rels_users_id_idx" ON "_chapters_v_rels" USING btree ("users_id");
  CREATE INDEX "chapter_requests_requester_idx" ON "chapter_requests" USING btree ("requester_id");
  CREATE INDEX "chapter_requests_reviewed_by_idx" ON "chapter_requests" USING btree ("reviewed_by_id");
  CREATE INDEX "chapter_requests_updated_at_idx" ON "chapter_requests" USING btree ("updated_at");
  CREATE INDEX "chapter_requests_created_at_idx" ON "chapter_requests" USING btree ("created_at");
  CREATE INDEX "membership_plans_benefits_order_idx" ON "membership_plans_benefits" USING btree ("_order");
  CREATE INDEX "membership_plans_benefits_parent_id_idx" ON "membership_plans_benefits" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "membership_plans_slug_idx" ON "membership_plans" USING btree ("slug");
  CREATE INDEX "membership_plans_updated_at_idx" ON "membership_plans" USING btree ("updated_at");
  CREATE INDEX "membership_plans_created_at_idx" ON "membership_plans" USING btree ("created_at");
  CREATE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");
  CREATE INDEX "memberships_plan_idx" ON "memberships" USING btree ("plan_id");
  CREATE INDEX "memberships_updated_at_idx" ON "memberships" USING btree ("updated_at");
  CREATE INDEX "memberships_created_at_idx" ON "memberships" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_chapter_idx" ON "events" USING btree ("chapter_id");
  CREATE INDEX "events_featured_image_idx" ON "events" USING btree ("featured_image_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_media_id_idx" ON "events_rels" USING btree ("media_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_chapter_idx" ON "_events_v" USING btree ("version_chapter_id");
  CREATE INDEX "_events_v_version_version_featured_image_idx" ON "_events_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_media_id_idx" ON "_events_v_rels" USING btree ("media_id");
  CREATE INDEX "event_registrations_event_idx" ON "event_registrations" USING btree ("event_id");
  CREATE INDEX "event_registrations_user_idx" ON "event_registrations" USING btree ("user_id");
  CREATE INDEX "event_registrations_order_idx" ON "event_registrations" USING btree ("order_id");
  CREATE INDEX "event_registrations_updated_at_idx" ON "event_registrations" USING btree ("updated_at");
  CREATE INDEX "event_registrations_created_at_idx" ON "event_registrations" USING btree ("created_at");
  CREATE INDEX "waitlist_entries_event_idx" ON "waitlist_entries" USING btree ("event_id");
  CREATE INDEX "waitlist_entries_user_idx" ON "waitlist_entries" USING btree ("user_id");
  CREATE INDEX "waitlist_entries_updated_at_idx" ON "waitlist_entries" USING btree ("updated_at");
  CREATE INDEX "waitlist_entries_created_at_idx" ON "waitlist_entries" USING btree ("created_at");
  CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");
  CREATE INDEX "orders_chapter_attribution_idx" ON "orders" USING btree ("chapter_attribution_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id");
  CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");
  CREATE INDEX "payments_proof_image_idx" ON "payments" USING btree ("proof_image_id");
  CREATE INDEX "payments_first_reviewer_chapter_idx" ON "payments" USING btree ("first_reviewer_chapter_id");
  CREATE INDEX "payments_approved_by_idx" ON "payments" USING btree ("approved_by_id");
  CREATE INDEX "payments_rejected_by_idx" ON "payments" USING btree ("rejected_by_id");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE UNIQUE INDEX "promotions_code_idx" ON "promotions" USING btree ("code");
  CREATE INDEX "promotions_updated_at_idx" ON "promotions" USING btree ("updated_at");
  CREATE INDEX "promotions_created_at_idx" ON "promotions" USING btree ("created_at");
  CREATE INDEX "committee_terms_members_order_idx" ON "committee_terms_members" USING btree ("_order");
  CREATE INDEX "committee_terms_members_parent_id_idx" ON "committee_terms_members" USING btree ("_parent_id");
  CREATE INDEX "committee_terms_members_photo_idx" ON "committee_terms_members" USING btree ("photo_id");
  CREATE INDEX "committee_terms_event_recaps_order_idx" ON "committee_terms_event_recaps" USING btree ("_order");
  CREATE INDEX "committee_terms_event_recaps_parent_id_idx" ON "committee_terms_event_recaps" USING btree ("_parent_id");
  CREATE INDEX "committee_terms_chapter_idx" ON "committee_terms" USING btree ("chapter_id");
  CREATE INDEX "committee_terms_updated_at_idx" ON "committee_terms" USING btree ("updated_at");
  CREATE INDEX "committee_terms_created_at_idx" ON "committee_terms" USING btree ("created_at");
  CREATE INDEX "committee_terms__status_idx" ON "committee_terms" USING btree ("_status");
  CREATE INDEX "committee_terms_rels_order_idx" ON "committee_terms_rels" USING btree ("order");
  CREATE INDEX "committee_terms_rels_parent_idx" ON "committee_terms_rels" USING btree ("parent_id");
  CREATE INDEX "committee_terms_rels_path_idx" ON "committee_terms_rels" USING btree ("path");
  CREATE INDEX "committee_terms_rels_media_id_idx" ON "committee_terms_rels" USING btree ("media_id");
  CREATE INDEX "_committee_terms_v_version_members_order_idx" ON "_committee_terms_v_version_members" USING btree ("_order");
  CREATE INDEX "_committee_terms_v_version_members_parent_id_idx" ON "_committee_terms_v_version_members" USING btree ("_parent_id");
  CREATE INDEX "_committee_terms_v_version_members_photo_idx" ON "_committee_terms_v_version_members" USING btree ("photo_id");
  CREATE INDEX "_committee_terms_v_version_event_recaps_order_idx" ON "_committee_terms_v_version_event_recaps" USING btree ("_order");
  CREATE INDEX "_committee_terms_v_version_event_recaps_parent_id_idx" ON "_committee_terms_v_version_event_recaps" USING btree ("_parent_id");
  CREATE INDEX "_committee_terms_v_parent_idx" ON "_committee_terms_v" USING btree ("parent_id");
  CREATE INDEX "_committee_terms_v_version_version_chapter_idx" ON "_committee_terms_v" USING btree ("version_chapter_id");
  CREATE INDEX "_committee_terms_v_version_version_updated_at_idx" ON "_committee_terms_v" USING btree ("version_updated_at");
  CREATE INDEX "_committee_terms_v_version_version_created_at_idx" ON "_committee_terms_v" USING btree ("version_created_at");
  CREATE INDEX "_committee_terms_v_version_version__status_idx" ON "_committee_terms_v" USING btree ("version__status");
  CREATE INDEX "_committee_terms_v_created_at_idx" ON "_committee_terms_v" USING btree ("created_at");
  CREATE INDEX "_committee_terms_v_updated_at_idx" ON "_committee_terms_v" USING btree ("updated_at");
  CREATE INDEX "_committee_terms_v_latest_idx" ON "_committee_terms_v" USING btree ("latest");
  CREATE INDEX "_committee_terms_v_autosave_idx" ON "_committee_terms_v" USING btree ("autosave");
  CREATE INDEX "_committee_terms_v_rels_order_idx" ON "_committee_terms_v_rels" USING btree ("order");
  CREATE INDEX "_committee_terms_v_rels_parent_idx" ON "_committee_terms_v_rels" USING btree ("parent_id");
  CREATE INDEX "_committee_terms_v_rels_path_idx" ON "_committee_terms_v_rels" USING btree ("path");
  CREATE INDEX "_committee_terms_v_rels_media_id_idx" ON "_committee_terms_v_rels" USING btree ("media_id");
  CREATE INDEX "history_entries_external_links_order_idx" ON "history_entries_external_links" USING btree ("_order");
  CREATE INDEX "history_entries_external_links_parent_id_idx" ON "history_entries_external_links" USING btree ("_parent_id");
  CREATE INDEX "history_entries_updated_at_idx" ON "history_entries" USING btree ("updated_at");
  CREATE INDEX "history_entries_created_at_idx" ON "history_entries" USING btree ("created_at");
  CREATE INDEX "history_entries__status_idx" ON "history_entries" USING btree ("_status");
  CREATE INDEX "history_entries_rels_order_idx" ON "history_entries_rels" USING btree ("order");
  CREATE INDEX "history_entries_rels_parent_idx" ON "history_entries_rels" USING btree ("parent_id");
  CREATE INDEX "history_entries_rels_path_idx" ON "history_entries_rels" USING btree ("path");
  CREATE INDEX "history_entries_rels_media_id_idx" ON "history_entries_rels" USING btree ("media_id");
  CREATE INDEX "_history_entries_v_version_external_links_order_idx" ON "_history_entries_v_version_external_links" USING btree ("_order");
  CREATE INDEX "_history_entries_v_version_external_links_parent_id_idx" ON "_history_entries_v_version_external_links" USING btree ("_parent_id");
  CREATE INDEX "_history_entries_v_parent_idx" ON "_history_entries_v" USING btree ("parent_id");
  CREATE INDEX "_history_entries_v_version_version_updated_at_idx" ON "_history_entries_v" USING btree ("version_updated_at");
  CREATE INDEX "_history_entries_v_version_version_created_at_idx" ON "_history_entries_v" USING btree ("version_created_at");
  CREATE INDEX "_history_entries_v_version_version__status_idx" ON "_history_entries_v" USING btree ("version__status");
  CREATE INDEX "_history_entries_v_created_at_idx" ON "_history_entries_v" USING btree ("created_at");
  CREATE INDEX "_history_entries_v_updated_at_idx" ON "_history_entries_v" USING btree ("updated_at");
  CREATE INDEX "_history_entries_v_latest_idx" ON "_history_entries_v" USING btree ("latest");
  CREATE INDEX "_history_entries_v_autosave_idx" ON "_history_entries_v" USING btree ("autosave");
  CREATE INDEX "_history_entries_v_rels_order_idx" ON "_history_entries_v_rels" USING btree ("order");
  CREATE INDEX "_history_entries_v_rels_parent_idx" ON "_history_entries_v_rels" USING btree ("parent_id");
  CREATE INDEX "_history_entries_v_rels_path_idx" ON "_history_entries_v_rels" USING btree ("path");
  CREATE INDEX "_history_entries_v_rels_media_id_idx" ON "_history_entries_v_rels" USING btree ("media_id");
  CREATE INDEX "newsletter_campaigns_updated_at_idx" ON "newsletter_campaigns" USING btree ("updated_at");
  CREATE INDEX "newsletter_campaigns_created_at_idx" ON "newsletter_campaigns" USING btree ("created_at");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "header_utility_links_order_idx" ON "header_utility_links" USING btree ("_order");
  CREATE INDEX "header_utility_links_parent_id_idx" ON "header_utility_links" USING btree ("_parent_id");
  CREATE INDEX "header_main_links_order_idx" ON "header_main_links" USING btree ("_order");
  CREATE INDEX "header_main_links_parent_id_idx" ON "header_main_links" USING btree ("_parent_id");
  CREATE INDEX "footer_groups_links_order_idx" ON "footer_groups_links" USING btree ("_order");
  CREATE INDEX "footer_groups_links_parent_id_idx" ON "footer_groups_links" USING btree ("_parent_id");
  CREATE INDEX "footer_groups_order_idx" ON "footer_groups" USING btree ("_order");
  CREATE INDEX "footer_groups_parent_id_idx" ON "footer_groups" USING btree ("_parent_id");
  CREATE INDEX "home_stats_order_idx" ON "home_stats" USING btree ("_order");
  CREATE INDEX "home_stats_parent_id_idx" ON "home_stats" USING btree ("_parent_id");
  ALTER TABLE "users" ADD CONSTRAINT "users_primary_chapter_id_chapters_id_fk" FOREIGN KEY ("primary_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chapter_requests_fk" FOREIGN KEY ("chapter_requests_id") REFERENCES "public"."chapter_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membership_plans_fk" FOREIGN KEY ("membership_plans_id") REFERENCES "public"."membership_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_memberships_fk" FOREIGN KEY ("memberships_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_registrations_fk" FOREIGN KEY ("event_registrations_id") REFERENCES "public"."event_registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_waitlist_entries_fk" FOREIGN KEY ("waitlist_entries_id") REFERENCES "public"."waitlist_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_committee_terms_fk" FOREIGN KEY ("committee_terms_id") REFERENCES "public"."committee_terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_history_entries_fk" FOREIGN KEY ("history_entries_id") REFERENCES "public"."history_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_campaigns_fk" FOREIGN KEY ("newsletter_campaigns_id") REFERENCES "public"."newsletter_campaigns"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_primary_chapter_idx" ON "users" USING btree ("primary_chapter_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload_locked_documents_rels" USING btree ("announcements_id");
  CREATE INDEX "payload_locked_documents_rels_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("chapters_id");
  CREATE INDEX "payload_locked_documents_rels_chapter_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("chapter_requests_id");
  CREATE INDEX "payload_locked_documents_rels_membership_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("membership_plans_id");
  CREATE INDEX "payload_locked_documents_rels_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("memberships_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_event_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("event_registrations_id");
  CREATE INDEX "payload_locked_documents_rels_waitlist_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("waitlist_entries_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_promotions_id_idx" ON "payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX "payload_locked_documents_rels_committee_terms_id_idx" ON "payload_locked_documents_rels" USING btree ("committee_terms_id");
  CREATE INDEX "payload_locked_documents_rels_history_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("history_entries_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_campaigns_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_campaigns_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "announcements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_announcements_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapter_requests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_plans_benefits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "memberships" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_registrations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "waitlist_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "promotions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_terms_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_terms_event_recaps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_terms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "committee_terms_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_committee_terms_v_version_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_committee_terms_v_version_event_recaps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_committee_terms_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_committee_terms_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "history_entries_external_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "history_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "history_entries_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_history_entries_v_version_external_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_history_entries_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_history_entries_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletter_campaigns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_utility_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_main_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_groups_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "seo_defaults" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "pages_sections" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_version_sections" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "announcements" CASCADE;
  DROP TABLE "_announcements_v" CASCADE;
  DROP TABLE "chapters" CASCADE;
  DROP TABLE "chapters_rels" CASCADE;
  DROP TABLE "_chapters_v" CASCADE;
  DROP TABLE "_chapters_v_rels" CASCADE;
  DROP TABLE "chapter_requests" CASCADE;
  DROP TABLE "membership_plans_benefits" CASCADE;
  DROP TABLE "membership_plans" CASCADE;
  DROP TABLE "memberships" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "event_registrations" CASCADE;
  DROP TABLE "waitlist_entries" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "promotions" CASCADE;
  DROP TABLE "committee_terms_members" CASCADE;
  DROP TABLE "committee_terms_event_recaps" CASCADE;
  DROP TABLE "committee_terms" CASCADE;
  DROP TABLE "committee_terms_rels" CASCADE;
  DROP TABLE "_committee_terms_v_version_members" CASCADE;
  DROP TABLE "_committee_terms_v_version_event_recaps" CASCADE;
  DROP TABLE "_committee_terms_v" CASCADE;
  DROP TABLE "_committee_terms_v_rels" CASCADE;
  DROP TABLE "history_entries_external_links" CASCADE;
  DROP TABLE "history_entries" CASCADE;
  DROP TABLE "history_entries_rels" CASCADE;
  DROP TABLE "_history_entries_v_version_external_links" CASCADE;
  DROP TABLE "_history_entries_v" CASCADE;
  DROP TABLE "_history_entries_v_rels" CASCADE;
  DROP TABLE "newsletter_campaigns" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "header_utility_links" CASCADE;
  DROP TABLE "header_main_links" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_groups_links" CASCADE;
  DROP TABLE "footer_groups" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "home_stats" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "seo_defaults" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_primary_chapter_id_chapters_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_announcements_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chapters_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chapter_requests_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_membership_plans_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_memberships_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_registrations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_waitlist_entries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_promotions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_committee_terms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_history_entries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_newsletter_campaigns_fk";
  
  DROP INDEX "users_primary_chapter_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  DROP INDEX "payload_locked_documents_rels_announcements_id_idx";
  DROP INDEX "payload_locked_documents_rels_chapters_id_idx";
  DROP INDEX "payload_locked_documents_rels_chapter_requests_id_idx";
  DROP INDEX "payload_locked_documents_rels_membership_plans_id_idx";
  DROP INDEX "payload_locked_documents_rels_memberships_id_idx";
  DROP INDEX "payload_locked_documents_rels_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_event_registrations_id_idx";
  DROP INDEX "payload_locked_documents_rels_waitlist_entries_id_idx";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_payments_id_idx";
  DROP INDEX "payload_locked_documents_rels_promotions_id_idx";
  DROP INDEX "payload_locked_documents_rels_committee_terms_id_idx";
  DROP INDEX "payload_locked_documents_rels_history_entries_id_idx";
  DROP INDEX "payload_locked_documents_rels_newsletter_campaigns_id_idx";
  ALTER TABLE "users" DROP COLUMN "first_name";
  ALTER TABLE "users" DROP COLUMN "last_name";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "account_status";
  ALTER TABLE "users" DROP COLUMN "primary_chapter_id";
  ALTER TABLE "users" DROP COLUMN "phone_number";
  ALTER TABLE "users" DROP COLUMN "ruet_department";
  ALTER TABLE "users" DROP COLUMN "graduation_year";
  ALTER TABLE "users" DROP COLUMN "alumni_reference";
  ALTER TABLE "users" DROP COLUMN "city";
  ALTER TABLE "users" DROP COLUMN "state";
  ALTER TABLE "users" DROP COLUMN "country";
  ALTER TABLE "users" DROP COLUMN "employer";
  ALTER TABLE "users" DROP COLUMN "professional_title";
  ALTER TABLE "users" DROP COLUMN "communication_preferences_allow_announcements";
  ALTER TABLE "users" DROP COLUMN "communication_preferences_allow_newsletters";
  ALTER TABLE "users" DROP COLUMN "communication_preferences_allow_system_emails";
  ALTER TABLE "media" DROP COLUMN "caption";
  ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "announcements_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chapters_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chapter_requests_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "membership_plans_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "memberships_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_registrations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "waitlist_entries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "promotions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "committee_terms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "history_entries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletter_campaigns_id";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_account_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_announcements_audience";
  DROP TYPE "public"."enum_announcements_tone";
  DROP TYPE "public"."enum_announcements_status";
  DROP TYPE "public"."enum__announcements_v_version_audience";
  DROP TYPE "public"."enum__announcements_v_version_tone";
  DROP TYPE "public"."enum__announcements_v_version_status";
  DROP TYPE "public"."enum_chapters_chapter_status";
  DROP TYPE "public"."enum_chapters_status";
  DROP TYPE "public"."enum__chapters_v_version_chapter_status";
  DROP TYPE "public"."enum__chapters_v_version_status";
  DROP TYPE "public"."enum_chapter_requests_status";
  DROP TYPE "public"."enum_memberships_status";
  DROP TYPE "public"."enum_memberships_payment_method";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum_events_event_mode";
  DROP TYPE "public"."enum_events_timezone";
  DROP TYPE "public"."enum_events_virtual_access_visibility";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum__events_v_version_event_mode";
  DROP TYPE "public"."enum__events_v_version_timezone";
  DROP TYPE "public"."enum__events_v_version_virtual_access_visibility";
  DROP TYPE "public"."enum_event_registrations_status";
  DROP TYPE "public"."enum_event_registrations_payment_status";
  DROP TYPE "public"."enum_waitlist_entries_status";
  DROP TYPE "public"."enum_orders_order_type";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_payments_payment_source";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_promotions_scope";
  DROP TYPE "public"."enum_promotions_discount_type";
  DROP TYPE "public"."enum_committee_terms_committee_type";
  DROP TYPE "public"."enum_committee_terms_status";
  DROP TYPE "public"."enum__committee_terms_v_version_committee_type";
  DROP TYPE "public"."enum__committee_terms_v_version_status";
  DROP TYPE "public"."enum_history_entries_status";
  DROP TYPE "public"."enum__history_entries_v_version_status";
  DROP TYPE "public"."enum_newsletter_campaigns_audience";
  DROP TYPE "public"."enum_newsletter_campaigns_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
