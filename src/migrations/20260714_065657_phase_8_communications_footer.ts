import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_newsletter_campaigns_status" ADD VALUE 'sending' BEFORE 'sent';
  ALTER TYPE "public"."enum_newsletter_campaigns_status" ADD VALUE 'cancelled';
  ALTER TYPE "public"."enum_newsletter_campaigns_status" ADD VALUE 'failed';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'newsletterLifecycle' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'newsletterLifecycle' BEFORE 'schedulePublish';
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  ALTER TABLE "email_deliveries" ADD COLUMN "campaign_id" integer;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "send_started_at" timestamp(3) with time zone;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "cancelled_at" timestamp(3) with time zone;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "created_by_id" integer;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "last_action_by_id" integer;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "recipient_count" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "queued_count" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "suppressed_count" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "failed_count" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "newsletter_campaigns" ADD COLUMN "send_error" varchar;
  ALTER TABLE "footer" ADD COLUMN "newsletter_cta_label" varchar DEFAULT 'Manage newsletter preferences' NOT NULL;
  ALTER TABLE "footer" ADD COLUMN "newsletter_cta_href" varchar DEFAULT '/communications/preferences' NOT NULL;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_campaign_id_newsletter_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."newsletter_campaigns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_last_action_by_id_users_id_fk" FOREIGN KEY ("last_action_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "email_deliveries_campaign_idx" ON "email_deliveries" USING btree ("campaign_id");
  CREATE INDEX "newsletter_campaigns_status_idx" ON "newsletter_campaigns" USING btree ("status");
  CREATE INDEX "newsletter_campaigns_scheduled_at_idx" ON "newsletter_campaigns" USING btree ("scheduled_at");
  CREATE INDEX "newsletter_campaigns_created_by_idx" ON "newsletter_campaigns" USING btree ("created_by_id");
  CREATE INDEX "newsletter_campaigns_last_action_by_idx" ON "newsletter_campaigns" USING btree ("last_action_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_social_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  ALTER TABLE "email_deliveries" DROP CONSTRAINT "email_deliveries_campaign_id_newsletter_campaigns_id_fk";
  
  ALTER TABLE "newsletter_campaigns" DROP CONSTRAINT "newsletter_campaigns_created_by_id_users_id_fk";
  
  ALTER TABLE "newsletter_campaigns" DROP CONSTRAINT "newsletter_campaigns_last_action_by_id_users_id_fk";
  
  ALTER TABLE "newsletter_campaigns" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "newsletter_campaigns" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_newsletter_campaigns_status";
  CREATE TYPE "public"."enum_newsletter_campaigns_status" AS ENUM('draft', 'scheduled', 'sent');
  ALTER TABLE "newsletter_campaigns" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_newsletter_campaigns_status";
  ALTER TABLE "newsletter_campaigns" ALTER COLUMN "status" SET DATA TYPE "public"."enum_newsletter_campaigns_status" USING "status"::"public"."enum_newsletter_campaigns_status";
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'deliverEmail', 'eventLifecycle', 'membershipLifecycle', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'deliverEmail', 'eventLifecycle', 'membershipLifecycle', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "email_deliveries_campaign_idx";
  DROP INDEX "newsletter_campaigns_status_idx";
  DROP INDEX "newsletter_campaigns_scheduled_at_idx";
  DROP INDEX "newsletter_campaigns_created_by_idx";
  DROP INDEX "newsletter_campaigns_last_action_by_idx";
  ALTER TABLE "email_deliveries" DROP COLUMN "campaign_id";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "send_started_at";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "cancelled_at";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "created_by_id";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "last_action_by_id";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "recipient_count";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "queued_count";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "suppressed_count";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "failed_count";
  ALTER TABLE "newsletter_campaigns" DROP COLUMN "send_error";
  ALTER TABLE "footer" DROP COLUMN "newsletter_cta_label";
  ALTER TABLE "footer" DROP COLUMN "newsletter_cta_href";`)
}
