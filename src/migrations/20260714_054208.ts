import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_memberships_membership_kind" AS ENUM('join', 'renewal', 'reactivation');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'membershipLifecycle' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'membershipLifecycle' BEFORE 'schedulePublish';
  CREATE TABLE "membership_plans_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "membership_plans" ADD COLUMN "renewal_policy" varchar DEFAULT 'Membership is annual and renews only after a new Zelle payment proof is approved. The website never debits members automatically.' NOT NULL;
  ALTER TABLE "membership_plans" ADD COLUMN "terms_summary" varchar DEFAULT 'Membership payments are reviewed manually. Final membership and no-refund terms must be approved before launch.' NOT NULL;
  ALTER TABLE "memberships" ADD COLUMN "membership_kind" "enum_memberships_membership_kind" DEFAULT 'join' NOT NULL;
  ALTER TABLE "memberships" ADD COLUMN "previous_membership_id" integer;
  ALTER TABLE "memberships" ADD COLUMN "grace_period_days_snapshot" numeric DEFAULT 7 NOT NULL;
  ALTER TABLE "memberships" ADD COLUMN "renewal_reminder_enabled_snapshot" boolean DEFAULT true NOT NULL;
  ALTER TABLE "memberships" ADD COLUMN "renewal_reminder_days_before_snapshot" numeric DEFAULT 30 NOT NULL;
  ALTER TABLE "payload_jobs" ADD COLUMN "meta" jsonb;
  ALTER TABLE "site_settings" ADD COLUMN "zelle_recipient_name" varchar DEFAULT 'RUETIAN USA';
  ALTER TABLE "site_settings" ADD COLUMN "zelle_recipient" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "zelle_instructions" varchar DEFAULT 'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "manual_payment_review_note" varchar DEFAULT 'Payment proof is reviewed by authorized volunteers. No turnaround time is promised until the organization approves a review SLA.' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "no_refund_notice" varchar DEFAULT 'No-refund wording is awaiting final stakeholder and legal approval before launch.' NOT NULL;
  WITH ranked_active_plans AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "sort_order" ASC, "id" ASC) AS row_number
    FROM "membership_plans"
    WHERE "active" = true
  )
  UPDATE "membership_plans"
  SET "active" = false
  WHERE "id" IN (SELECT "id" FROM ranked_active_plans WHERE row_number > 1);
  CREATE UNIQUE INDEX "membership_plans_single_active_idx" ON "membership_plans" ((1)) WHERE "active" = true;
  ALTER TABLE "membership_plans_faqs" ADD CONSTRAINT "membership_plans_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."membership_plans"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "membership_plans_faqs_order_idx" ON "membership_plans_faqs" USING btree ("_order");
  CREATE INDEX "membership_plans_faqs_parent_id_idx" ON "membership_plans_faqs" USING btree ("_parent_id");
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_previous_membership_id_memberships_id_fk" FOREIGN KEY ("previous_membership_id") REFERENCES "public"."memberships"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "memberships_previous_membership_idx" ON "memberships" USING btree ("previous_membership_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "membership_plans_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "membership_plans_faqs" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "memberships" DROP CONSTRAINT "memberships_previous_membership_id_memberships_id_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'deliverEmail', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'deliverEmail', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "memberships_previous_membership_idx";
  DROP INDEX "membership_plans_single_active_idx";
  ALTER TABLE "membership_plans" DROP COLUMN "renewal_policy";
  ALTER TABLE "membership_plans" DROP COLUMN "terms_summary";
  ALTER TABLE "memberships" DROP COLUMN "membership_kind";
  ALTER TABLE "memberships" DROP COLUMN "previous_membership_id";
  ALTER TABLE "memberships" DROP COLUMN "grace_period_days_snapshot";
  ALTER TABLE "memberships" DROP COLUMN "renewal_reminder_enabled_snapshot";
  ALTER TABLE "memberships" DROP COLUMN "renewal_reminder_days_before_snapshot";
  ALTER TABLE "payload_jobs" DROP COLUMN "meta";
  ALTER TABLE "site_settings" DROP COLUMN "zelle_recipient_name";
  ALTER TABLE "site_settings" DROP COLUMN "zelle_recipient";
  ALTER TABLE "site_settings" DROP COLUMN "zelle_instructions";
  ALTER TABLE "site_settings" DROP COLUMN "manual_payment_review_note";
  ALTER TABLE "site_settings" DROP COLUMN "no_refund_notice";
  DROP TYPE "public"."enum_memberships_membership_kind";`)
}
