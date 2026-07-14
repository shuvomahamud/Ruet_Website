import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_events_status" ADD VALUE IF NOT EXISTS 'archived';
  ALTER TYPE "public"."enum__events_v_version_status" ADD VALUE IF NOT EXISTS 'archived';
  ALTER TYPE "public"."enum_waitlist_entries_status" ADD VALUE 'accepted' BEFORE 'expired';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'eventLifecycle' BEFORE 'membershipLifecycle';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'eventLifecycle' BEFORE 'membershipLifecycle';
  ALTER TABLE "events" ADD COLUMN "registration_opens_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN "registration_closes_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN "waitlist_offer_hours" numeric DEFAULT 48;
  ALTER TABLE "events" ADD COLUMN "recap_summary" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_registration_opens_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_registration_closes_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_waitlist_offer_hours" numeric DEFAULT 48;
  ALTER TABLE "_events_v" ADD COLUMN "version_recap_summary" varchar;
  ALTER TABLE "event_registrations" ADD COLUMN "unit_price_snapshot" numeric;
  ALTER TABLE "event_registrations" ADD COLUMN "currency_snapshot" varchar DEFAULT 'USD';
  ALTER TABLE "event_registrations" ADD COLUMN "event_title_snapshot" varchar;
  ALTER TABLE "event_registrations" ADD COLUMN "event_start_at_snapshot" timestamp(3) with time zone;
  ALTER TABLE "event_registrations" ADD COLUMN "chapter_name_snapshot" varchar;
  ALTER TABLE "event_registrations" ADD COLUMN "waitlist_entry_id" integer;
  ALTER TABLE "waitlist_entries" ADD COLUMN "accepted_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "event_payment_terms" varchar DEFAULT 'Paid event registration is reserved while Zelle proof is reviewed. Event payments are not automatically debited. No refunds are issued; contact the event chapter for exceptional handling.' NOT NULL;
  UPDATE "event_registrations" AS "registration"
  SET
    "unit_price_snapshot" = CASE
      WHEN "registration"."quantity" > 0
      THEN "registration"."registration_price_snapshot" / "registration"."quantity"
      ELSE 0
    END,
    "currency_snapshot" = COALESCE("event"."currency", 'USD'),
    "event_title_snapshot" = "event"."title",
    "event_start_at_snapshot" = "event"."start_at",
    "chapter_name_snapshot" = "chapter"."name"
  FROM "events" AS "event"
  JOIN "chapters" AS "chapter" ON "chapter"."id" = "event"."chapter_id"
  WHERE "registration"."event_id" = "event"."id";
  ALTER TABLE "event_registrations" ALTER COLUMN "unit_price_snapshot" SET NOT NULL;
  ALTER TABLE "event_registrations" ALTER COLUMN "currency_snapshot" SET NOT NULL;
  ALTER TABLE "event_registrations" ALTER COLUMN "event_title_snapshot" SET NOT NULL;
  ALTER TABLE "event_registrations" ALTER COLUMN "event_start_at_snapshot" SET NOT NULL;
  ALTER TABLE "event_registrations" ALTER COLUMN "chapter_name_snapshot" SET NOT NULL;
  ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_waitlist_entry_id_waitlist_entries_id_fk" FOREIGN KEY ("waitlist_entry_id") REFERENCES "public"."waitlist_entries"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "event_registrations_waitlist_entry_idx" ON "event_registrations" USING btree ("waitlist_entry_id");
  CREATE UNIQUE INDEX "event_registrations_active_user_event_unique"
    ON "event_registrations" ("user_id", "event_id")
    WHERE "status" IN ('pending', 'confirmed', 'waitlisted');
  CREATE UNIQUE INDEX "waitlist_entries_active_user_event_unique"
    ON "waitlist_entries" ("user_id", "event_id")
    WHERE "status" IN ('waiting', 'promoted');
  CREATE UNIQUE INDEX "event_registrations_waitlist_entry_unique"
    ON "event_registrations" ("waitlist_entry_id")
    WHERE "waitlist_entry_id" IS NOT NULL;
  CREATE INDEX "event_registrations_capacity_idx"
    ON "event_registrations" ("event_id", "status");
  CREATE INDEX "waitlist_entries_processing_idx"
    ON "waitlist_entries" ("event_id", "status", "joined_at", "promotion_expiry_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_registrations" DROP CONSTRAINT "event_registrations_waitlist_entry_id_waitlist_entries_id_fk";
  DROP INDEX IF EXISTS "waitlist_entries_processing_idx";
  DROP INDEX IF EXISTS "event_registrations_capacity_idx";
  DROP INDEX IF EXISTS "event_registrations_waitlist_entry_unique";
  DROP INDEX IF EXISTS "waitlist_entries_active_user_event_unique";
  DROP INDEX IF EXISTS "event_registrations_active_user_event_unique";

  ALTER TABLE "events" ALTER COLUMN "status" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_status";
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  ALTER TABLE "events" ALTER COLUMN "status" SET DATA TYPE "public"."enum_events_status" USING "status"::"public"."enum_events_status";
  ALTER TABLE "_events_v" ALTER COLUMN "version_status" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_version_status";
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  ALTER TABLE "_events_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__events_v_version_status" USING "version_status"::"public"."enum__events_v_version_status";

  ALTER TABLE "waitlist_entries" ALTER COLUMN "status" SET DATA TYPE text;
  DROP TYPE "public"."enum_waitlist_entries_status";
  CREATE TYPE "public"."enum_waitlist_entries_status" AS ENUM('waiting', 'promoted', 'expired');
  ALTER TABLE "waitlist_entries" ALTER COLUMN "status" SET DATA TYPE "public"."enum_waitlist_entries_status" USING "status"::"public"."enum_waitlist_entries_status";
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'deliverEmail', 'membershipLifecycle', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'deliverEmail', 'membershipLifecycle', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "event_registrations_waitlist_entry_idx";
  ALTER TABLE "events" DROP COLUMN "registration_opens_at";
  ALTER TABLE "events" DROP COLUMN "registration_closes_at";
  ALTER TABLE "events" DROP COLUMN "waitlist_offer_hours";
  ALTER TABLE "events" DROP COLUMN "recap_summary";
  ALTER TABLE "_events_v" DROP COLUMN "version_registration_opens_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_registration_closes_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_waitlist_offer_hours";
  ALTER TABLE "_events_v" DROP COLUMN "version_recap_summary";
  ALTER TABLE "event_registrations" DROP COLUMN "unit_price_snapshot";
  ALTER TABLE "event_registrations" DROP COLUMN "currency_snapshot";
  ALTER TABLE "event_registrations" DROP COLUMN "event_title_snapshot";
  ALTER TABLE "event_registrations" DROP COLUMN "event_start_at_snapshot";
  ALTER TABLE "event_registrations" DROP COLUMN "chapter_name_snapshot";
  ALTER TABLE "event_registrations" DROP COLUMN "waitlist_entry_id";
  ALTER TABLE "waitlist_entries" DROP COLUMN "accepted_at";
  ALTER TABLE "site_settings" DROP COLUMN "event_payment_terms";`)
}
