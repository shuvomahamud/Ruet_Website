# RUETIAN USA Membership Requirements

Updated: 2026-07-13

## 1. Purpose

This document is the normalized source of truth for membership requirements. It converts the latest stakeholder decisions into implementable business rules.

## 1.1 Current Implementation Alignment

Current implementation behavior for membership content ownership:

- public membership page copy is now expected to come from the Payload `Pages` collection using the `membership` slug
- plan title, price, benefits, active state, renewal-reminder settings, and grace-period configuration remain owned by the `membershipPlans` collection
- this keeps editorial page copy and business-plan data separated cleanly inside the CMS
- membership, order, payment, chapter, plan-price, currency, promotion, proof, and reviewer relationships/snapshots are now validated and protected as audit data
- the annual membership experience is implemented end to end: single active plan, profile-gated join, server-authoritative promotions, Zelle transaction/proof submission, immutable pending attempts, chapter-scoped review, approval/rejection notices, renewal, grace, expiration, and pay-to-reactivate
- daily scheduled lifecycle work sends deduplicated pre-expiration and grace reminders while preserving the rule that the website never automatically debits a member
- implementation and verification evidence is recorded in [phase-6-membership-zelle-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-6-membership-zelle-verification.md)
- public account signup, verification, password reset, Google sign-in/linking, protected profile settings, chapter changes, preferences, and audited account anonymization are implemented; production Google and email-provider credentials remain explicit environment/launch inputs

## 2. Final Membership Baseline

The launch membership model is:

- one membership type at launch
- annual only
- global, not chapter-specific
- editable by super admin from admin UI without code changes
- manual annual renewal through Zelle, supported by system reminders
- no chapter-based pricing

The recommended phase-1 placeholder is:

- `USD 50 / year`

This is dummy launch data only and must remain editable from admin.

## 3. Membership Plan Configuration

The single launch plan should still be stored in a configurable structure such as a Payload collection or singleton-backed model.

Required editable fields:

- title
- slug
- public summary
- detailed description
- benefits list
- annual price
- currency
- active / inactive status
- renewal-reminder configuration
- grace period in days
- sort order

Optional future-ready fields:

- eligibility notes
- membership badge label
- marketing CTA copy

## 4. Signup And Account Access

### 4.1 Self-signup

Self-signup is open to everyone.

Public signup creates a standard user account only. Elevated roles are assigned internally.

### 4.2 Authentication methods

The system must support:

- email/password signup and login
- Google sign-in
- password reset
- email verification for local accounts

### 4.3 Recommended signup fields

The recommended signup fields are:

- first name
- last name
- email
- password for local auth
- phone number optional
- RUET department / program
- graduation year
- student ID or alumni reference optional
- current city
- current state
- current country
- primary chapter
- employer optional
- professional title optional
- communication preferences and consent

These fields are sufficient for alumni identification, chapter routing, and later reporting.

### 4.4 Account deletion

Users must be able to delete their own accounts.

Implementation rule:

- the UI provides self-service delete from account settings
- the system should preserve financial and audit records while anonymizing personal data where appropriate

## 5. Membership Lifecycle

### 5.1 Membership states

The system should support at least:

- `pending_payment`
- `pending_manual_approval`
- `active`
- `grace_period`
- `expired`
- `failed_manual_payment`
- `cancelled_by_admin`
- `suspended`

### 5.2 Membership start rule

The rule is finalized:

- membership starts on payment date

Implementation detail:

- Zelle-paid memberships start on the authorized approval date

### 5.3 Renewal rule

The rule is finalized:

- membership renewal is annual and requires a new Zelle proof submission

Implementation detail:

- the website does not automatically debit the member
- renewal reminders should be sent before expiration and during the configurable grace period
- the user experience must communicate clearly that proof approval is required every year

### 5.4 Grace period

Stakeholder intent is "standard" grace behavior. The recommended documented default is:

- `7` days after failed renewal payment

This must be configurable by super admin.

During grace period:

- membership remains visible as expiring / grace
- renewal reminders continue
- if payment succeeds, status returns to active
- if payment does not succeed by grace end, membership becomes expired

### 5.5 Expiration and reactivation

The rule is finalized:

- expired users are shown a pay-to-reactivate path

System behavior:

- expired members keep their account
- protected member benefits can be restricted according to business rules
- reactivation creates a new paid membership cycle linked to the same user

### 5.6 Price changes

The rule is finalized:

- price changes apply at the next annual renewal

Because of that:

- the current plan price is used for the next renewal calculation
- the membership record must store pricing snapshots for auditability
- payment and order records must also store snapshots

## 6. Pricing And Commercial Rules

### 6.1 Price scope

- launch price is global
- chapter affiliation never changes membership price

### 6.2 Promotions

Membership checkout must support promotions.

Business rules:

- promo codes may apply to membership when configured by admin
- one promo code per checkout
- automatic member discounts may be configured by admin where needed
- member-only or campaign-specific promotion rules may exist

### 6.3 Refunds and cancellation

The membership policy is:

- no refunds
- no self-service cancellation flow on the website
- cancellation or special handling requests are sent by email to admin

Operational note:

- admin may record cancellation outcomes internally, but the public UX should not present a cancel-membership workflow

## 7. Payment Method

Membership payments use `Zelle` only.

### 7.1 Zelle

Manual Zelle payment must support:

- transaction ID only
- screenshot only
- both together

Manual-payment workflow rules:

- membership remains pending until approval
- the relevant chapter admin receives the submission first
- chapter admin, admin, and super admin may approve
- invalid proof triggers email notification to the payer
- invalid proof marks the payment failed
- resubmission is treated as a new payment attempt

## 8. Admin Controls

### 8.1 Super admin controls

Super admin must be able to:

- edit the membership plan
- change annual price
- activate or deactivate the plan
- edit grace-period length
- view membership records
- manage approvals
- manage promotions
- view payment history

### 8.2 Admin and chapter-admin controls

Authorized admin roles must be able to:

- review manual payments
- approve or reject proof submissions
- see pending membership states
- notify members when action is needed

## 9. Reporting Requirements

The system should support reporting for:

- active memberships
- memberships in grace period
- expired memberships
- revenue from memberships
- renewals
- failed renewals
- manual-payment approval outcomes
- promotion usage
- reactivations after expiration

## 10. Data Requirements

Each membership record should store:

- user
- plan
- status
- start date
- renewal date
- expiration date
- grace end date
- renewal-reminder state where required
- payment method
- chapter snapshot
- plan title snapshot
- plan price snapshot
- currency snapshot
- billing interval snapshot

Each membership payment or order record should store:

- membership reference
- total charged
- discount applied
- payment method
- payment status
- external payment reference
- approval metadata when manual payment is used

## 11. Open Items

Membership-related open items are now limited to:

1. final legal membership terms and payment language
2. expected SLA for manual approval

There are no remaining functional blockers for schema or interface design.

## 12. Final Summary

The normalized membership direction is:

- one configurable global membership plan at launch
- annual billing only
- placeholder price starts at `USD 50 / year`
- super admin can edit plan details from admin
- renewal is manual through Zelle and supported by reminders
- membership starts on payment date
- price changes apply at next annual renewal
- no refunds
- expired members can pay to reactivate
- users can delete their own accounts
