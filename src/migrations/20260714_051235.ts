import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_email_deliveries_category" AS ENUM('system', 'announcement', 'newsletter');
  CREATE TYPE "public"."enum_email_deliveries_status" AS ENUM('queued', 'processing', 'sent', 'failed', 'suppressed');
  CREATE TYPE "public"."enum_email_deliveries_queue" AS ENUM('transactional', 'reminders', 'waitlist', 'newsletters');
  CREATE TYPE "public"."enum_email_deliveries_provider" AS ENUM('capture', 'resend');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'deliverEmail' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'deliverEmail' BEFORE 'schedulePublish';
  CREATE TABLE "email_deliveries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"deduplication_key" varchar NOT NULL,
  	"category" "enum_email_deliveries_category" NOT NULL,
  	"required" boolean DEFAULT false NOT NULL,
  	"recipient" varchar NOT NULL,
  	"user_id" integer,
  	"subject" varchar NOT NULL,
  	"template" varchar NOT NULL,
  	"status" "enum_email_deliveries_status" DEFAULT 'queued' NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"queue" "enum_email_deliveries_queue" NOT NULL,
  	"job_id" varchar,
  	"provider" "enum_email_deliveries_provider",
  	"provider_message_id" varchar,
  	"last_attempt_at" timestamp(3) with time zone,
  	"sent_at" timestamp(3) with time zone,
  	"scheduled_for" timestamp(3) with time zone,
  	"suppressed_reason" varchar,
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_jobs" ADD COLUMN "concurrency_key" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_deliveries_id" integer;
  ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "email_deliveries_deduplication_key_idx" ON "email_deliveries" USING btree ("deduplication_key");
  CREATE INDEX "email_deliveries_recipient_idx" ON "email_deliveries" USING btree ("recipient");
  CREATE INDEX "email_deliveries_user_idx" ON "email_deliveries" USING btree ("user_id");
  CREATE INDEX "email_deliveries_status_idx" ON "email_deliveries" USING btree ("status");
  CREATE INDEX "email_deliveries_updated_at_idx" ON "email_deliveries" USING btree ("updated_at");
  CREATE INDEX "email_deliveries_created_at_idx" ON "email_deliveries" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_deliveries_fk" FOREIGN KEY ("email_deliveries_id") REFERENCES "public"."email_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_jobs_concurrency_key_idx" ON "payload_jobs" USING btree ("concurrency_key");
  CREATE INDEX "payload_locked_documents_rels_email_deliveries_id_idx" ON "payload_locked_documents_rels" USING btree ("email_deliveries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_deliveries_fk";
  DROP INDEX "payload_locked_documents_rels_email_deliveries_id_idx";
  ALTER TABLE "email_deliveries" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "email_deliveries" CASCADE;

  DELETE FROM "payload_jobs_log" WHERE "task_slug" = 'deliverEmail';
  DELETE FROM "payload_jobs" WHERE "task_slug" = 'deliverEmail';
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_jobs_concurrency_key_idx";
  ALTER TABLE "payload_jobs" DROP COLUMN "concurrency_key";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_deliveries_id";
  DROP TYPE "public"."enum_email_deliveries_category";
  DROP TYPE "public"."enum_email_deliveries_status";
  DROP TYPE "public"."enum_email_deliveries_queue";
  DROP TYPE "public"."enum_email_deliveries_provider";`)
}
