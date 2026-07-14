import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM "memberships"
      WHERE "plan_title_snapshot" IS NULL
        OR "plan_price_snapshot" IS NULL
        OR "currency_snapshot" IS NULL
        OR "billing_interval_snapshot" IS NULL
    ) OR EXISTS (
      SELECT 1
      FROM "event_registrations"
      WHERE "registration_price_snapshot" IS NULL
    ) THEN
      RAISE EXCEPTION 'Required-snapshot migration stopped: backfill historical snapshot values before retrying.';
    END IF;
  END $$;

  UPDATE "event_registrations" SET "discount_snapshot" = 0 WHERE "discount_snapshot" IS NULL;
  ALTER TABLE "memberships" ALTER COLUMN "plan_title_snapshot" SET NOT NULL;
  ALTER TABLE "memberships" ALTER COLUMN "plan_price_snapshot" SET NOT NULL;
  ALTER TABLE "memberships" ALTER COLUMN "currency_snapshot" SET NOT NULL;
  ALTER TABLE "memberships" ALTER COLUMN "billing_interval_snapshot" SET NOT NULL;
  ALTER TABLE "event_registrations" ALTER COLUMN "registration_price_snapshot" SET NOT NULL;
  ALTER TABLE "event_registrations" ALTER COLUMN "discount_snapshot" SET DEFAULT 0;
  ALTER TABLE "event_registrations" ALTER COLUMN "discount_snapshot" SET NOT NULL;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "memberships" ALTER COLUMN "plan_title_snapshot" DROP NOT NULL;
  ALTER TABLE "memberships" ALTER COLUMN "plan_price_snapshot" DROP NOT NULL;
  ALTER TABLE "memberships" ALTER COLUMN "currency_snapshot" DROP NOT NULL;
  ALTER TABLE "memberships" ALTER COLUMN "billing_interval_snapshot" DROP NOT NULL;
  ALTER TABLE "event_registrations" ALTER COLUMN "registration_price_snapshot" DROP NOT NULL;
  ALTER TABLE "event_registrations" ALTER COLUMN "discount_snapshot" DROP DEFAULT;
  ALTER TABLE "event_registrations" ALTER COLUMN "discount_snapshot" DROP NOT NULL;`)
}
