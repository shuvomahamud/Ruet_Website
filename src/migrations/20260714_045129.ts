import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chapter_requests" ADD COLUMN "requested_region" varchar;
  ALTER TABLE "chapter_requests" ADD COLUMN "motivation" varchar;
  ALTER TABLE "chapter_requests" ADD COLUMN "resulting_chapter_id" integer;
  ALTER TABLE "committee_terms" ADD COLUMN "summary" varchar;
  ALTER TABLE "_committee_terms_v" ADD COLUMN "version_summary" varchar;
  ALTER TABLE "history_entries" ADD COLUMN "sort_order" numeric DEFAULT 0;
  ALTER TABLE "history_entries" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "_history_entries_v" ADD COLUMN "version_sort_order" numeric DEFAULT 0;
  ALTER TABLE "_history_entries_v" ADD COLUMN "version_featured" boolean DEFAULT false;
  ALTER TABLE "chapter_requests" ADD CONSTRAINT "chapter_requests_resulting_chapter_id_chapters_id_fk" FOREIGN KEY ("resulting_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "chapter_requests_resulting_chapter_idx" ON "chapter_requests" USING btree ("resulting_chapter_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chapter_requests" DROP CONSTRAINT "chapter_requests_resulting_chapter_id_chapters_id_fk";
  
  DROP INDEX "chapter_requests_resulting_chapter_idx";
  ALTER TABLE "chapter_requests" DROP COLUMN "requested_region";
  ALTER TABLE "chapter_requests" DROP COLUMN "motivation";
  ALTER TABLE "chapter_requests" DROP COLUMN "resulting_chapter_id";
  ALTER TABLE "committee_terms" DROP COLUMN "summary";
  ALTER TABLE "_committee_terms_v" DROP COLUMN "version_summary";
  ALTER TABLE "history_entries" DROP COLUMN "sort_order";
  ALTER TABLE "history_entries" DROP COLUMN "featured";
  ALTER TABLE "_history_entries_v" DROP COLUMN "version_sort_order";
  ALTER TABLE "_history_entries_v" DROP COLUMN "version_featured";`)
}
