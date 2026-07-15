import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "rate_limit_buckets" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "count" numeric NOT NULL,
    "reset_at" timestamp(3) with time zone NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rate_limit_buckets_id" integer;
  CREATE UNIQUE INDEX "rate_limit_buckets_key_idx" ON "rate_limit_buckets" USING btree ("key");
  CREATE INDEX "rate_limit_buckets_reset_at_idx" ON "rate_limit_buckets" USING btree ("reset_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rate_limit_buckets_fk" FOREIGN KEY ("rate_limit_buckets_id") REFERENCES "public"."rate_limit_buckets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_rate_limit_buckets_id_idx" ON "payload_locked_documents_rels" USING btree ("rate_limit_buckets_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rate_limit_buckets_fk";
  DROP INDEX "payload_locked_documents_rels_rate_limit_buckets_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rate_limit_buckets_id";
  ALTER TABLE "rate_limit_buckets" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "rate_limit_buckets" CASCADE;`)
}
