import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_auth_methods" AS ENUM('password', 'google');
  CREATE TYPE "public"."enum_users_profile_status" AS ENUM('incomplete', 'complete');
  CREATE TYPE "public"."enum_oauth_sessions_provider" AS ENUM('google');
  CREATE TABLE "users_auth_methods" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_auth_methods",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "oauth_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"provider" "enum_oauth_sessions_provider" DEFAULT 'google' NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"revoked_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "google_subject" varchar;
  ALTER TABLE "users" ADD COLUMN "profile_status" "enum_users_profile_status" DEFAULT 'incomplete';
  ALTER TABLE "users" ADD COLUMN "terms_accepted_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "privacy_accepted_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "anonymized_reference" varchar;
  ALTER TABLE "users" ADD COLUMN "_verified" boolean;
  ALTER TABLE "users" ADD COLUMN "_verificationtoken" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "oauth_sessions_id" integer;
  UPDATE "users" SET "_verified" = true;
  INSERT INTO "users_auth_methods" ("order", "parent_id", "value")
    SELECT 1, "id", 'password'::"enum_users_auth_methods" FROM "users";
  ALTER TABLE "users_auth_methods" ADD CONSTRAINT "users_auth_methods_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "oauth_sessions" ADD CONSTRAINT "oauth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_auth_methods_order_idx" ON "users_auth_methods" USING btree ("order");
  CREATE INDEX "users_auth_methods_parent_idx" ON "users_auth_methods" USING btree ("parent_id");
  CREATE UNIQUE INDEX "oauth_sessions_token_hash_idx" ON "oauth_sessions" USING btree ("token_hash");
  CREATE INDEX "oauth_sessions_user_idx" ON "oauth_sessions" USING btree ("user_id");
  CREATE INDEX "oauth_sessions_expires_at_idx" ON "oauth_sessions" USING btree ("expires_at");
  CREATE INDEX "oauth_sessions_updated_at_idx" ON "oauth_sessions" USING btree ("updated_at");
  CREATE INDEX "oauth_sessions_created_at_idx" ON "oauth_sessions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_oauth_sessions_fk" FOREIGN KEY ("oauth_sessions_id") REFERENCES "public"."oauth_sessions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "users_google_subject_idx" ON "users" USING btree ("google_subject");
  CREATE UNIQUE INDEX "users_anonymized_reference_idx" ON "users" USING btree ("anonymized_reference");
  CREATE INDEX "payload_locked_documents_rels_oauth_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("oauth_sessions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_auth_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "oauth_sessions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_auth_methods" CASCADE;
  DROP TABLE "oauth_sessions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_oauth_sessions_fk";
  
  DROP INDEX "users_google_subject_idx";
  DROP INDEX "users_anonymized_reference_idx";
  DROP INDEX "payload_locked_documents_rels_oauth_sessions_id_idx";
  ALTER TABLE "users" DROP COLUMN "google_subject";
  ALTER TABLE "users" DROP COLUMN "profile_status";
  ALTER TABLE "users" DROP COLUMN "terms_accepted_at";
  ALTER TABLE "users" DROP COLUMN "privacy_accepted_at";
  ALTER TABLE "users" DROP COLUMN "deleted_at";
  ALTER TABLE "users" DROP COLUMN "anonymized_reference";
  ALTER TABLE "users" DROP COLUMN "_verified";
  ALTER TABLE "users" DROP COLUMN "_verificationtoken";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "oauth_sessions_id";
  DROP TYPE "public"."enum_users_auth_methods";
  DROP TYPE "public"."enum_users_profile_status";
  DROP TYPE "public"."enum_oauth_sessions_provider";`)
}
