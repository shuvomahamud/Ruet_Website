# Admin account and membership workflows

Only `admin` and `superAdmin` users can use these bulk actions. Chapter admins keep their existing chapter-scoped payment review access.

## Approve new accounts

1. Open Payload Admin and select **Users**.
2. Select one or more pending users whose email is verified.
3. Choose **Approve accounts** and confirm.

The action is hidden if any selected account is not eligible. Approval activates website access but does not create a paid membership.

## Add paid memberships

1. In **Users**, select approved, active users who do not have a current or pending membership.
2. Choose **Add paid membership** and confirm.

For each successful user the system creates an active annual membership, a paid order, and an approved payment using the active plan price and the user's primary chapter. The records are labeled **Admin Bulk**, and the generated reference has the form `ADMIN-BULK-YYYYMMDD-USER123`. No refund or Zelle proof is created or implied.

The action is hidden when any selected user is pending, suspended, missing a primary chapter, already a member, or has a membership/payment awaiting review. Each user is processed independently; the completion message reports successes and failures.

## Cancel paid memberships

1. Open **Memberships** and select active, grace-period, or suspended memberships.
2. Enter the required shared reason.
3. Choose **Cancel memberships** and confirm.

Cancellation sets each membership to **Cancelled By Admin**, keeps all membership/order/payment history, records an audit entry, and queues a required member notice. It does not issue a refund.

## Signup and roll numbers

New password and Google signups are created as **Pending**. After email verification, login displays an approval-pending message until an administrator approves the account. Roll number replaces graduation year, is normalized by removing whitespace and uppercasing letters, and must be unique for new signups and complete profiles. Existing users may remain without a roll number until their next profile update.
