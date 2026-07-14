import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM "orders" LIMIT 1)
      OR EXISTS (SELECT 1 FROM "payments" LIMIT 1)
      OR EXISTS (SELECT 1 FROM "memberships" LIMIT 1) THEN
      RAISE EXCEPTION 'Zelle-only migration stopped: transactional rows exist. Archive and transform their legacy provider fields before retrying.';
    END IF;
  END $$;

  CREATE TYPE "public"."enum_media_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum_orders_promotion_discount_type_snapshot" AS ENUM('fixed', 'percent');
  CREATE TYPE "public"."enum_payments_order_type_snapshot" AS ENUM('membership', 'event');
  CREATE TYPE "public"."enum_audit_logs_outcome" AS ENUM('succeeded', 'rejected', 'no_change');
  CREATE TABLE "payment_proofs" (
     "id" serial PRIMARY KEY NOT NULL,
     "owner_id" integer NOT NULL,
     "chapter_id" integer,
     "description" varchar,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "url" varchar,
     "thumbnail_u_r_l" varchar,
     "filename" varchar,
     "mime_type" varchar,
     "filesize" numeric,
     "width" numeric,
     "height" numeric,
     "focal_x" numeric,
     "focal_y" numeric
  );

  CREATE TABLE "audit_logs" (
     "id" serial PRIMARY KEY NOT NULL,
     "actor_id" integer,
     "actor_role_snapshot" varchar,
     "action" varchar NOT NULL,
     "entity_type" varchar NOT NULL,
     "entity_i_d" varchar NOT NULL,
     "outcome" "enum_audit_logs_outcome" NOT NULL,
     "before_status" varchar,
     "after_status" varchar,
     "metadata" jsonb,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "membership_plans" RENAME COLUMN "auto_renew_enabled" TO "renewal_reminder_enabled";
  ALTER TABLE "memberships" RENAME COLUMN "chapter_snapshot" TO "chapter_name_snapshot";
  ALTER TABLE "payments" DROP CONSTRAINT "payments_proof_image_id_media_id_fk";

  ALTER TABLE "memberships" ALTER COLUMN "payment_method" SET DATA TYPE text;
  ALTER TABLE "memberships" ALTER COLUMN "payment_method" SET DEFAULT 'zelle'::text;
  DROP TYPE "public"."enum_memberships_payment_method";
  CREATE TYPE "public"."enum_memberships_payment_method" AS ENUM('zelle');
  ALTER TABLE "memberships" ALTER COLUMN "payment_method" SET DEFAULT 'zelle'::"public"."enum_memberships_payment_method";
  ALTER TABLE "memberships" ALTER COLUMN "payment_method" SET DATA TYPE "public"."enum_memberships_payment_method" USING "payment_method"::"public"."enum_memberships_payment_method";
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DEFAULT 'zelle'::text;
  DROP TYPE "public"."enum_orders_payment_method";
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('zelle');
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DEFAULT 'zelle'::"public"."enum_orders_payment_method";
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE "public"."enum_orders_payment_method" USING "payment_method"::"public"."enum_orders_payment_method";
  ALTER TABLE "payments" ALTER COLUMN "payment_source" SET DATA TYPE text;
  ALTER TABLE "payments" ALTER COLUMN "payment_source" SET DEFAULT 'zelle'::text;
  DROP TYPE "public"."enum_payments_payment_source";
  CREATE TYPE "public"."enum_payments_payment_source" AS ENUM('zelle');
  ALTER TABLE "payments" ALTER COLUMN "payment_source" SET DEFAULT 'zelle'::"public"."enum_payments_payment_source";
  ALTER TABLE "payments" ALTER COLUMN "payment_source" SET DATA TYPE "public"."enum_payments_payment_source" USING "payment_source"::"public"."enum_payments_payment_source";
  ALTER TABLE "memberships" ALTER COLUMN "payment_method" SET NOT NULL;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET NOT NULL;
  ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending';
  ALTER TABLE "payments" ALTER COLUMN "submitted_at" SET NOT NULL;
  ALTER TABLE "media" ADD COLUMN "owner_id" integer;
  ALTER TABLE "media" ADD COLUMN "chapter_id" integer;
  ALTER TABLE "media" ADD COLUMN "visibility" "enum_media_visibility" DEFAULT 'public' NOT NULL;
  ALTER TABLE "membership_plans" ADD COLUMN "renewal_reminder_days_before" numeric DEFAULT 30;
  ALTER TABLE "membership_plans" ADD COLUMN "sort_order" numeric DEFAULT 0;
  ALTER TABLE "memberships" ADD COLUMN "chapter_attribution_id" integer;
  ALTER TABLE "orders" ADD COLUMN "membership_id" integer;
  ALTER TABLE "orders" ADD COLUMN "event_registration_id" integer;
  ALTER TABLE "orders" ADD COLUMN "promotion_id" integer;
  ALTER TABLE "orders" ADD COLUMN "promotion_code_snapshot" varchar;
  ALTER TABLE "orders" ADD COLUMN "promotion_discount_type_snapshot" "enum_orders_promotion_discount_type_snapshot";
  ALTER TABLE "orders" ADD COLUMN "promotion_discount_value_snapshot" numeric;
  ALTER TABLE "orders" ADD COLUMN "chapter_name_snapshot" varchar;
  ALTER TABLE "payments" ADD COLUMN "amount_snapshot" numeric NOT NULL;
  ALTER TABLE "payments" ADD COLUMN "currency_snapshot" varchar DEFAULT 'USD' NOT NULL;
  ALTER TABLE "payments" ADD COLUMN "order_type_snapshot" "enum_payments_order_type_snapshot" NOT NULL;
  ALTER TABLE "payments" ADD COLUMN "chapter_name_snapshot" varchar;
  ALTER TABLE "payments" ADD COLUMN "approved_by_role_snapshot" varchar;
  ALTER TABLE "payments" ADD COLUMN "rejected_by_role_snapshot" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payment_proofs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_logs_id" integer;
  ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payment_proofs_owner_idx" ON "payment_proofs" USING btree ("owner_id");
  CREATE INDEX "payment_proofs_chapter_idx" ON "payment_proofs" USING btree ("chapter_id");
  CREATE INDEX "payment_proofs_updated_at_idx" ON "payment_proofs" USING btree ("updated_at");
  CREATE INDEX "payment_proofs_created_at_idx" ON "payment_proofs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payment_proofs_filename_idx" ON "payment_proofs" USING btree ("filename");
  CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  ALTER TABLE "media" ADD CONSTRAINT "media_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_chapter_attribution_id_chapters_id_fk" FOREIGN KEY ("chapter_attribution_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_event_registration_id_event_registrations_id_fk" FOREIGN KEY ("event_registration_id") REFERENCES "public"."event_registrations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_proof_image_id_payment_proofs_id_fk" FOREIGN KEY ("proof_image_id") REFERENCES "public"."payment_proofs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_proofs_fk" FOREIGN KEY ("payment_proofs_id") REFERENCES "public"."payment_proofs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_owner_idx" ON "media" USING btree ("owner_id");
  CREATE INDEX "media_chapter_idx" ON "media" USING btree ("chapter_id");
  CREATE INDEX "memberships_chapter_attribution_idx" ON "memberships" USING btree ("chapter_attribution_id");
  CREATE INDEX "orders_membership_idx" ON "orders" USING btree ("membership_id");
  CREATE INDEX "orders_event_registration_idx" ON "orders" USING btree ("event_registration_id");
  CREATE INDEX "orders_promotion_idx" ON "orders" USING btree ("promotion_id");
  CREATE INDEX "payload_locked_documents_rels_payment_proofs_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_proofs_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  ALTER TABLE "memberships" DROP COLUMN "auto_renew_enabled";
  ALTER TABLE "orders" DROP COLUMN "stripe_session_id";
  ALTER TABLE "payments" DROP COLUMN "external_reference";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_memberships_payment_method" ADD VALUE 'stripe' BEFORE 'zelle';
  ALTER TYPE "public"."enum_orders_payment_method" ADD VALUE 'stripe' BEFORE 'zelle';
  ALTER TYPE "public"."enum_payments_payment_source" ADD VALUE 'stripe' BEFORE 'zelle';
  ALTER TABLE "payment_proofs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payment_proofs" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  ALTER TABLE "membership_plans" RENAME COLUMN "renewal_reminder_enabled" TO "auto_renew_enabled";
  ALTER TABLE "memberships" RENAME COLUMN "chapter_name_snapshot" TO "chapter_snapshot";
  ALTER TABLE "media" DROP CONSTRAINT "media_owner_id_users_id_fk";

  ALTER TABLE "media" DROP CONSTRAINT "media_chapter_id_chapters_id_fk";

  ALTER TABLE "memberships" DROP CONSTRAINT "memberships_chapter_attribution_id_chapters_id_fk";

  ALTER TABLE "orders" DROP CONSTRAINT "orders_membership_id_memberships_id_fk";

  ALTER TABLE "orders" DROP CONSTRAINT "orders_event_registration_id_event_registrations_id_fk";

  ALTER TABLE "orders" DROP CONSTRAINT "orders_promotion_id_promotions_id_fk";

  ALTER TABLE "payments" DROP CONSTRAINT "payments_proof_image_id_payment_proofs_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payment_proofs_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audit_logs_fk";

  DROP INDEX "media_owner_idx";
  DROP INDEX "media_chapter_idx";
  DROP INDEX "memberships_chapter_attribution_idx";
  DROP INDEX "orders_membership_idx";
  DROP INDEX "orders_event_registration_idx";
  DROP INDEX "orders_promotion_idx";
  DROP INDEX "payload_locked_documents_rels_payment_proofs_id_idx";
  DROP INDEX "payload_locked_documents_rels_audit_logs_id_idx";
  ALTER TABLE "memberships" ALTER COLUMN "payment_method" DROP DEFAULT;
  ALTER TABLE "memberships" ALTER COLUMN "payment_method" DROP NOT NULL;
  ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "orders" ALTER COLUMN "payment_method" DROP DEFAULT;
  ALTER TABLE "orders" ALTER COLUMN "payment_method" DROP NOT NULL;
  ALTER TABLE "payments" ALTER COLUMN "payment_source" DROP DEFAULT;
  ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "payments" ALTER COLUMN "submitted_at" DROP NOT NULL;
  ALTER TABLE "memberships" ADD COLUMN "auto_renew_enabled" boolean DEFAULT true;
  ALTER TABLE "orders" ADD COLUMN "stripe_session_id" varchar;
  ALTER TABLE "payments" ADD COLUMN "external_reference" varchar;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_proof_image_id_media_id_fk" FOREIGN KEY ("proof_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" DROP COLUMN "owner_id";
  ALTER TABLE "media" DROP COLUMN "chapter_id";
  ALTER TABLE "media" DROP COLUMN "visibility";
  ALTER TABLE "membership_plans" DROP COLUMN "renewal_reminder_days_before";
  ALTER TABLE "membership_plans" DROP COLUMN "sort_order";
  ALTER TABLE "memberships" DROP COLUMN "chapter_attribution_id";
  ALTER TABLE "orders" DROP COLUMN "membership_id";
  ALTER TABLE "orders" DROP COLUMN "event_registration_id";
  ALTER TABLE "orders" DROP COLUMN "promotion_id";
  ALTER TABLE "orders" DROP COLUMN "promotion_code_snapshot";
  ALTER TABLE "orders" DROP COLUMN "promotion_discount_type_snapshot";
  ALTER TABLE "orders" DROP COLUMN "promotion_discount_value_snapshot";
  ALTER TABLE "orders" DROP COLUMN "chapter_name_snapshot";
  ALTER TABLE "payments" DROP COLUMN "amount_snapshot";
  ALTER TABLE "payments" DROP COLUMN "currency_snapshot";
  ALTER TABLE "payments" DROP COLUMN "order_type_snapshot";
  ALTER TABLE "payments" DROP COLUMN "chapter_name_snapshot";
  ALTER TABLE "payments" DROP COLUMN "approved_by_role_snapshot";
  ALTER TABLE "payments" DROP COLUMN "rejected_by_role_snapshot";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payment_proofs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_logs_id";
  DROP TYPE "public"."enum_media_visibility";
  DROP TYPE "public"."enum_orders_promotion_discount_type_snapshot";
  DROP TYPE "public"."enum_payments_order_type_snapshot";
  DROP TYPE "public"."enum_audit_logs_outcome";`)
}
