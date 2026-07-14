import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Forward-only content cleanup for databases created before the Phase 4 copy refresh.
 * Exact-match updates preserve any stakeholder-authored content, while the legal-link
 * inserts only seed an otherwise empty footer.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET "footer_note" = 'Membership, chapters, events, and learning opportunities for the RUET alumni community.'
    WHERE "footer_note" = 'The website content, branding, and legal copy will continue to evolve as later implementation phases are completed.';

    UPDATE "footer"
    SET "newsletter_summary" = 'Receive organization news, chapter updates, event notices, and learning resources.'
    WHERE "newsletter_summary" = 'Newsletter sending will be enabled in a later phase once the email provider is configured.';

    INSERT INTO "footer_legal_links" ("_order", "_parent_id", "id", "label", "href")
    SELECT links."link_order", "footer"."id", links."link_id" || "footer"."id"::text,
      links."label", links."href"
    FROM "footer"
    CROSS JOIN (VALUES
      (0, 'phase8-privacy-', 'Privacy', '/privacy'),
      (1, 'phase8-website-terms-', 'Website terms', '/terms-of-use'),
      (2, 'phase8-membership-terms-', 'Membership terms', '/membership-terms')
    ) AS links("link_order", "link_id", "label", "href")
    WHERE NOT EXISTS (
      SELECT 1 FROM "footer_legal_links" WHERE "_parent_id" = "footer"."id"
    );
  `)
}

// Content migrations are intentionally not reversed: a rollback must not restore stale
// placeholder copy or remove links that administrators may have subsequently edited.
export async function down(_args: MigrateDownArgs): Promise<void> {}
