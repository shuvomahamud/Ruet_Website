import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "events_price_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"price" numeric
  );
  
  CREATE TABLE "_events_v_version_price_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"price" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "event_registrations_ticket_selections_snapshot" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tier_i_d" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"subtotal" numeric NOT NULL
  );
  
  CREATE TABLE "waitlist_entries_ticket_selections_snapshot" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tier_i_d" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"subtotal" numeric NOT NULL
  );
  
  ALTER TABLE "events_price_tiers" ADD CONSTRAINT "events_price_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_price_tiers" ADD CONSTRAINT "_events_v_version_price_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_registrations_ticket_selections_snapshot" ADD CONSTRAINT "event_registrations_ticket_selections_snapshot_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "waitlist_entries_ticket_selections_snapshot" ADD CONSTRAINT "waitlist_entries_ticket_selections_snapshot_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."waitlist_entries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_price_tiers_order_idx" ON "events_price_tiers" USING btree ("_order");
  CREATE INDEX "events_price_tiers_parent_id_idx" ON "events_price_tiers" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_price_tiers_order_idx" ON "_events_v_version_price_tiers" USING btree ("_order");
  CREATE INDEX "_events_v_version_price_tiers_parent_id_idx" ON "_events_v_version_price_tiers" USING btree ("_parent_id");
  CREATE INDEX "event_registrations_ticket_selections_snapshot_order_idx" ON "event_registrations_ticket_selections_snapshot" USING btree ("_order");
  CREATE INDEX "event_registrations_ticket_selections_snapshot_parent_id_idx" ON "event_registrations_ticket_selections_snapshot" USING btree ("_parent_id");
  CREATE INDEX "waitlist_entries_ticket_selections_snapshot_order_idx" ON "waitlist_entries_ticket_selections_snapshot" USING btree ("_order");
  CREATE INDEX "waitlist_entries_ticket_selections_snapshot_parent_id_idx" ON "waitlist_entries_ticket_selections_snapshot" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "events_price_tiers" CASCADE;
  DROP TABLE "_events_v_version_price_tiers" CASCADE;
  DROP TABLE "event_registrations_ticket_selections_snapshot" CASCADE;
  DROP TABLE "waitlist_entries_ticket_selections_snapshot" CASCADE;`)
}
