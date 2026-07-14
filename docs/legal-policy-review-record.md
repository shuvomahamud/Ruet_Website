# RUETIAN USA Standard Legal Policy Review Record

Effective date: July 14, 2026  
Policy version: `2026-07-14`  
Stakeholder authorization: standard legal baseline requested for implementation on July 14, 2026

## Implemented Policies

The public CMS contains approved, versioned content for:

- Privacy Policy at `/privacy-policy`
- Terms of Use at `/terms-of-use`
- Membership Agreement and Payment Terms at `/membership-terms`
- Zelle payment, manual-review, and no-refund notices used by membership and paid-event forms

The immutable source snapshot is [legal-policy-20260714.ts](/Users/shuvomahamud/Projects/RUET_Website/src/content/legal-policy-20260714.ts). A later policy change must use a new dated snapshot and forward migration; changing this historical snapshot would make stored acceptance-version evidence inaccurate.

## Application-Practice Audit

The policy language was matched to the implemented application behavior:

- account signup records Terms and Privacy acknowledgement timestamps and the accepted policy version
- local authentication stores protected credentials; optional Google OAuth stores a Google subject and secure session records
- member profiles collect RUET, location, chapter, and optional professional/contact details
- membership, event, waitlist, promotion, order, and payment records retain immutable operational snapshots
- Zelle is the only supported paid method; users transfer funds outside the website and submit a transaction ID, screenshot/PDF, or both
- payment proof is owner- and authorized-reviewer-scoped; the website does not collect banking credentials or initiate debits
- paid membership and event forms now require explicit agreement to the applicable Zelle/no-refund terms
- each new payment attempt stores the accepted policy version and server timestamp
- self-service deletion disables the account and anonymizes eligible profile/authentication data while preserving necessary financial and audit relationships
- required transactional messages remain available; optional announcements/newsletters honor preferences
- production email may use Resend; optional authentication may use Google; no advertising or behavioral-analytics integration is currently configured

## Authoritative Guidance Consulted

- The Federal Trade Commission advises organizations to state their actual privacy practices clearly, honor those promises, minimize data, secure retained data, and dispose of it appropriately: [FTC Privacy and Security guidance](https://www.ftc.gov/business-guidance/privacy-security).
- The FTC explains that commercial email requires accurate sender information and prompt handling of opt-out requests, while qualifying transactional or relationship messages are treated differently: [CAN-SPAM compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).
- The FTC explains that COPPA applies to child-directed services and general-audience services with actual knowledge that they collect information from a child under 13: [FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions).
- Zelle states that authorized payments do not include Zelle purchase protection, should be sent only after verifying a trusted recipient, and generally cannot be cancelled after reaching an enrolled recipient: [Zelle Safety 101](https://www.zellepay.com/safety-education/zeller-safety-101) and [Zelle cancellation FAQ](https://www.zellepay.com/faq/can-i-cancel-payment).
- The IRS explains that deductibility of membership dues depends on the organization and the value of benefits, so the policy makes no tax-deductibility representation: [IRS Publication 526](https://www.irs.gov/publications/p526).

## Organizational Review Still Recommended

This is a standard U.S.-oriented operational baseline, not an opinion from RUETIAN USA's attorney. Before a production launch or after any material organizational change, qualified counsel should verify at least:

- the organization's exact legal name, entity type, state of organization, and mailing address
- tax-exemption and dues-deductibility status
- insurance, volunteer, event, and chapter-governance requirements
- state-specific privacy, consumer, automatic-renewal, fundraising, and record-retention obligations
- whether a jurisdiction-specific dispute venue or additional notices are desirable

Those checks do not prevent the approved standard baseline from being installed and used now; any resulting revision must be published as a new policy version.
