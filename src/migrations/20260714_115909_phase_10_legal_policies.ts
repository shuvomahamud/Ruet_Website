import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import {
  LEGAL_POLICY_REVIEWED_AT,
  legalPolicyPages,
} from '../content/legal-policy-20260714'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "membership_plans" ALTER COLUMN "terms_summary" SET DEFAULT 'Membership activates only after the annual Zelle payment is manually approved, and renewal is never automatic. Membership dues and paid event fees sent through Zelle are final and non-refundable, except where a refund is required by applicable law or expressly authorized in writing by RUETIAN USA. Verify the recipient and exact amount before sending.';
  ALTER TABLE "site_settings" ALTER COLUMN "zelle_instructions" SET DEFAULT 'Verify the displayed RUETIAN USA recipient, then send the exact order total through Zelle and include your name in the memo. Submit the transaction ID, a screenshot or PDF, or both. Zelle payments can be difficult or impossible to cancel and do not include Zelle purchase protection. Your membership or paid registration remains pending until an authorized reviewer approves the proof.';
  ALTER TABLE "site_settings" ALTER COLUMN "manual_payment_review_note" SET DEFAULT 'Authorized RUETIAN USA volunteers review payment proof manually. Submission does not guarantee approval. Review timing may vary, and invalid, duplicate, incomplete, or mismatched proof may be rejected.';
  ALTER TABLE "site_settings" ALTER COLUMN "no_refund_notice" SET DEFAULT 'Membership dues and paid event fees sent through Zelle are final and non-refundable, except where a refund is required by applicable law or expressly authorized in writing by RUETIAN USA. Verify the recipient and exact amount before sending.';
  ALTER TABLE "site_settings" ALTER COLUMN "event_payment_terms" SET DEFAULT 'Paid registration is not confirmed until RUETIAN USA approves the Zelle payment proof. Seats may be reserved while review is pending. Event fees are final and non-refundable, except where required by applicable law or expressly authorized in writing by RUETIAN USA. Cancellation does not create an automatic refund.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_zelle_instructions" SET DEFAULT 'Verify the displayed RUETIAN USA recipient, then send the exact order total through Zelle and include your name in the memo. Submit the transaction ID, a screenshot or PDF, or both. Zelle payments can be difficult or impossible to cancel and do not include Zelle purchase protection. Your membership or paid registration remains pending until an authorized reviewer approves the proof.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_manual_payment_review_note" SET DEFAULT 'Authorized RUETIAN USA volunteers review payment proof manually. Submission does not guarantee approval. Review timing may vary, and invalid, duplicate, incomplete, or mismatched proof may be rejected.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_no_refund_notice" SET DEFAULT 'Membership dues and paid event fees sent through Zelle are final and non-refundable, except where a refund is required by applicable law or expressly authorized in writing by RUETIAN USA. Verify the recipient and exact amount before sending.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_event_payment_terms" SET DEFAULT 'Paid registration is not confirmed until RUETIAN USA approves the Zelle payment proof. Seats may be reserved while review is pending. Event fees are final and non-refundable, except where required by applicable law or expressly authorized in writing by RUETIAN USA. Cancellation does not create an automatic refund.';
  ALTER TABLE "payments" ADD COLUMN "payment_terms_accepted_at" timestamp(3) with time zone;
  ALTER TABLE "payments" ADD COLUMN "payment_terms_version_snapshot" varchar DEFAULT '2026-07-14';

  UPDATE "site_settings"
  SET "zelle_instructions" = 'Verify the displayed RUETIAN USA recipient, then send the exact order total through Zelle and include your name in the memo. Submit the transaction ID, a screenshot or PDF, or both. Zelle payments can be difficult or impossible to cancel and do not include Zelle purchase protection. Your membership or paid registration remains pending until an authorized reviewer approves the proof.'
  WHERE "zelle_instructions" = 'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.';

  UPDATE "site_settings"
  SET "manual_payment_review_note" = 'Authorized RUETIAN USA volunteers review payment proof manually. Submission does not guarantee approval. Review timing may vary, and invalid, duplicate, incomplete, or mismatched proof may be rejected.'
  WHERE "manual_payment_review_note" = 'Payment proof is reviewed manually by authorized volunteers. Review timing may vary.';

  UPDATE "site_settings"
  SET "no_refund_notice" = 'Membership dues and paid event fees sent through Zelle are final and non-refundable, except where a refund is required by applicable law or expressly authorized in writing by RUETIAN USA. Verify the recipient and exact amount before sending.'
  WHERE "no_refund_notice" = 'Zelle payments are non-refundable. Contact RUETIAN USA before paying if you have questions about an order.';

  UPDATE "site_settings"
  SET "event_payment_terms" = 'Paid registration is not confirmed until RUETIAN USA approves the Zelle payment proof. Seats may be reserved while review is pending. Event fees are final and non-refundable, except where required by applicable law or expressly authorized in writing by RUETIAN USA. Cancellation does not create an automatic refund.'
  WHERE "event_payment_terms" = 'Paid event registration is reserved while Zelle proof is reviewed. Event payments are not automatically debited. No refunds are issued; contact the event chapter for exceptional handling.';

  UPDATE "membership_plans"
  SET "terms_summary" = 'Membership activates only after the annual Zelle payment is manually approved, and renewal is never automatic. Membership dues are final and non-refundable except where required by law or expressly authorized in writing by RUETIAN USA.'
  WHERE "terms_summary" IN (
    'Membership activates after the annual Zelle payment is manually approved. Payments are non-refundable and renewal is never automatic.',
    'Membership payments are reviewed manually. Final membership and no-refund terms must be approved before launch.'
  );`)

  for (const policy of legalPolicyPages) {
    const existing = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
      where: { slug: { equals: policy.slug } },
    })
    const current = existing.docs[0]
    const containsPlaceholder = (current?.sections ?? []).some((section) =>
      section.body?.startsWith('Approval placeholder:'),
    )

    // Preserve any independently approved stakeholder policy. Only replace the
    // shipped placeholder or create the missing canonical route.
    if (current && current.legalStatus !== 'placeholder' && !containsPlaceholder) continue

    const data = {
      ...policy,
      publishedAt: current?.publishedAt || LEGAL_POLICY_REVIEWED_AT,
    }
    if (current) {
      await payload.update({
        collection: 'pages',
        context: { editorialWorkflowBypass: true },
        data,
        draft: false,
        id: current.id,
        overrideAccess: true,
        req,
      })
    } else {
      await payload.create({
        collection: 'pages',
        context: { editorialWorkflowBypass: true },
        data,
        draft: false,
        overrideAccess: true,
        req,
      })
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "membership_plans" ALTER COLUMN "terms_summary" SET DEFAULT 'Membership payments are reviewed manually. Final membership and no-refund terms must be approved before launch.';
  ALTER TABLE "site_settings" ALTER COLUMN "zelle_instructions" SET DEFAULT 'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.';
  ALTER TABLE "site_settings" ALTER COLUMN "manual_payment_review_note" SET DEFAULT 'Payment proof is reviewed manually by authorized volunteers. Review timing may vary.';
  ALTER TABLE "site_settings" ALTER COLUMN "no_refund_notice" SET DEFAULT 'Zelle payments are non-refundable. Contact RUETIAN USA before paying if you have questions about an order.';
  ALTER TABLE "site_settings" ALTER COLUMN "event_payment_terms" SET DEFAULT 'Paid event registration is reserved while Zelle proof is reviewed. Event payments are not automatically debited. No refunds are issued; contact the event chapter for exceptional handling.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_zelle_instructions" SET DEFAULT 'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_manual_payment_review_note" SET DEFAULT 'Payment proof is reviewed manually by authorized volunteers. Review timing may vary.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_no_refund_notice" SET DEFAULT 'Zelle payments are non-refundable. Contact RUETIAN USA before paying if you have questions about an order.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_event_payment_terms" SET DEFAULT 'Paid event registration is reserved while Zelle proof is reviewed. Event payments are not automatically debited. No refunds are issued; contact the event chapter for exceptional handling.';
  ALTER TABLE "payments" DROP COLUMN "payment_terms_accepted_at";
  ALTER TABLE "payments" DROP COLUMN "payment_terms_version_snapshot";`)
}
