import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_memberships_payment_method" ADD VALUE IF NOT EXISTS 'adminBulk';
    ALTER TYPE "public"."enum_orders_payment_method" ADD VALUE IF NOT EXISTS 'adminBulk';
    ALTER TYPE "public"."enum_payments_payment_source" ADD VALUE IF NOT EXISTS 'adminBulk';
    CREATE TYPE "public"."enum_memberships_membership_source" AS ENUM('memberCheckout', 'adminBulk');

    ALTER TABLE "users" ADD COLUMN "roll_number" varchar;
    ALTER TABLE "users" DROP COLUMN "graduation_year";
    ALTER TABLE "users" ALTER COLUMN "account_status" SET DEFAULT 'pending';
    CREATE UNIQUE INDEX "users_roll_number_idx" ON "users" USING btree ("roll_number");

    ALTER TABLE "memberships" ADD COLUMN "membership_source" "enum_memberships_membership_source" DEFAULT 'memberCheckout' NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "memberships" DROP COLUMN "membership_source";
    DROP TYPE "public"."enum_memberships_membership_source";

    DROP INDEX "users_roll_number_idx";
    ALTER TABLE "users" DROP COLUMN "roll_number";
    ALTER TABLE "users" ADD COLUMN "graduation_year" numeric;
    ALTER TABLE "users" ALTER COLUMN "account_status" SET DEFAULT 'active';
  `)
}
