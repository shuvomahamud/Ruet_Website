import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_home_hero_advertisement_type" AS ENUM('text', 'image', 'video');
  CREATE TYPE "public"."enum__home_v_version_hero_advertisement_type" AS ENUM('text', 'image', 'video');
  ALTER TABLE "home" ADD COLUMN "hero_advertisement_enabled" boolean DEFAULT false;
  ALTER TABLE "home" ADD COLUMN "hero_advertisement_type" "enum_home_hero_advertisement_type" DEFAULT 'text';
  ALTER TABLE "home" ADD COLUMN "hero_advertisement_label" varchar DEFAULT 'Advertisement';
  ALTER TABLE "home" ADD COLUMN "hero_advertisement_headline" varchar;
  ALTER TABLE "home" ADD COLUMN "hero_advertisement_body" varchar;
  ALTER TABLE "home" ADD COLUMN "hero_advertisement_media_id" integer;
  ALTER TABLE "home" ADD COLUMN "hero_advertisement_cta_label" varchar;
  ALTER TABLE "home" ADD COLUMN "hero_advertisement_cta_href" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_advertisement_enabled" boolean DEFAULT false;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_advertisement_type" "enum__home_v_version_hero_advertisement_type" DEFAULT 'text';
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_advertisement_label" varchar DEFAULT 'Advertisement';
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_advertisement_headline" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_advertisement_body" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_advertisement_media_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_advertisement_cta_label" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_advertisement_cta_href" varchar;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_advertisement_media_id_media_id_fk" FOREIGN KEY ("hero_advertisement_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_advertisement_media_id_media_id_fk" FOREIGN KEY ("version_hero_advertisement_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_hero_advertisement_hero_advertisement_media_idx" ON "home" USING btree ("hero_advertisement_media_id");
  CREATE INDEX "_home_v_version_hero_advertisement_version_hero_advertis_idx" ON "_home_v" USING btree ("version_hero_advertisement_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" DROP CONSTRAINT "home_hero_advertisement_media_id_media_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_hero_advertisement_media_id_media_id_fk";
  
  DROP INDEX "home_hero_advertisement_hero_advertisement_media_idx";
  DROP INDEX "_home_v_version_hero_advertisement_version_hero_advertis_idx";
  ALTER TABLE "home" DROP COLUMN "hero_advertisement_enabled";
  ALTER TABLE "home" DROP COLUMN "hero_advertisement_type";
  ALTER TABLE "home" DROP COLUMN "hero_advertisement_label";
  ALTER TABLE "home" DROP COLUMN "hero_advertisement_headline";
  ALTER TABLE "home" DROP COLUMN "hero_advertisement_body";
  ALTER TABLE "home" DROP COLUMN "hero_advertisement_media_id";
  ALTER TABLE "home" DROP COLUMN "hero_advertisement_cta_label";
  ALTER TABLE "home" DROP COLUMN "hero_advertisement_cta_href";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_advertisement_enabled";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_advertisement_type";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_advertisement_label";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_advertisement_headline";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_advertisement_body";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_advertisement_media_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_advertisement_cta_label";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_advertisement_cta_href";
  DROP TYPE "public"."enum_home_hero_advertisement_type";
  DROP TYPE "public"."enum__home_v_version_hero_advertisement_type";`)
}
