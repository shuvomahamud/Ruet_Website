import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'paymentProofRetention' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'paymentProofRetention' BEFORE 'schedulePublish';
  ALTER TABLE "site_settings" ADD COLUMN "payment_proof_retention_days" numeric DEFAULT 180;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_payment_proof_retention_days" numeric DEFAULT 180;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "payload_jobs_log" WHERE "task_slug" = 'paymentProofRetention';
  DELETE FROM "payload_jobs" WHERE "task_slug" = 'paymentProofRetention';
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'deliverEmail', 'eventLifecycle', 'membershipLifecycle', 'newsletterLifecycle', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'deliverEmail', 'eventLifecycle', 'membershipLifecycle', 'newsletterLifecycle', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  ALTER TABLE "site_settings" DROP COLUMN "payment_proof_retention_days";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_payment_proof_retention_days";`)
}
