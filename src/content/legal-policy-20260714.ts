/**
 * Immutable stakeholder-authorized legal-content snapshot.
 *
 * Future policy changes must create a new dated snapshot and forward migration so
 * payment acceptance records continue to identify the exact applicable version.
 */

export const LEGAL_POLICY_EFFECTIVE_DATE = '2026-07-14'
export const LEGAL_POLICY_REVIEWED_AT = '2026-07-14T04:00:00.000Z'
export const PAYMENT_TERMS_VERSION = '2026-07-14'

export type LegalPolicyPage = {
  _status: 'published'
  editorialStatus: 'approved'
  heroDescription: string
  heroEyebrow: string
  heroTitle: string
  lastReviewedAt: string
  legalStatus: 'approved'
  pageType: 'legal'
  sections: Array<{
    anchor: string
    body: string
    title: string
  }>
  seo: {
    description: string
    title: string
  }
  slug: 'membership-terms' | 'privacy-policy' | 'terms-of-use'
  summary: string
  title: string
}

export const STANDARD_NO_REFUND_NOTICE =
  'Membership dues and paid event fees sent through Zelle are final and non-refundable, except where a refund is required by applicable law or expressly authorized in writing by RUETIAN USA. Verify the recipient and exact amount before sending.'

export const STANDARD_EVENT_PAYMENT_TERMS =
  'Paid registration is not confirmed until RUETIAN USA approves the Zelle payment proof. Seats may be reserved while review is pending. Event fees are final and non-refundable, except where required by applicable law or expressly authorized in writing by RUETIAN USA. Cancellation does not create an automatic refund.'

export const STANDARD_ZELLE_INSTRUCTIONS =
  'Verify the displayed RUETIAN USA recipient, then send the exact order total through Zelle and include your name in the memo. Submit the transaction ID, a screenshot or PDF, or both. Zelle payments can be difficult or impossible to cancel and do not include Zelle purchase protection. Your membership or paid registration remains pending until an authorized reviewer approves the proof.'

export const STANDARD_MANUAL_REVIEW_NOTE =
  'Authorized RUETIAN USA volunteers review payment proof manually. Submission does not guarantee approval. Review timing may vary, and invalid, duplicate, incomplete, or mismatched proof may be rejected.'

export const legalPolicyPages: LegalPolicyPage[] = [
  {
    _status: 'published',
    editorialStatus: 'approved',
    heroDescription:
      'Effective July 14, 2026. This policy explains how RUETIAN USA collects, uses, discloses, retains, and protects information through its website and member services.',
    heroEyebrow: 'Legal',
    heroTitle: 'Privacy Policy',
    lastReviewedAt: LEGAL_POLICY_REVIEWED_AT,
    legalStatus: 'approved',
    pageType: 'legal',
    sections: [
      {
        anchor: 'scope',
        body: 'This Privacy Policy applies to the RUETIAN USA website, accounts, membership services, chapters, events, communications, contact forms, and related online services (collectively, the “Services”). RUETIAN USA is the organization responsible for the information described here. By using the Services, you acknowledge this Policy. If you do not agree with these practices, do not provide personal information or use an account-based Service.',
        title: 'Scope and effective date',
      },
      {
        anchor: 'information-you-provide',
        body: 'We collect information you provide when you create or update an account, including your name, email address, optional phone number, RUET department or program, graduation year, alumni reference, city, state, country, employer or professional title, primary chapter, and communication preferences. We also collect information in chapter requests, event registrations and waitlists, contact inquiries, profile changes, newsletter preferences, and other submissions. Passwords are processed through the authentication system and are not available to administrators in readable form. If you choose Google sign-in, we receive the account identifier and profile information Google makes available for authentication.',
        title: 'Information you provide',
      },
      {
        anchor: 'membership-events-and-payments',
        body: 'We maintain membership applications, terms, status history, renewal and reactivation records, event registrations, attendance quantity, waitlist activity, promotions, chapter attribution, order amounts, and payment decisions. For Zelle payments, we collect the transaction ID, uploaded screenshot or PDF, submitted amount, submission time, review result, reviewer role, and any rejection reason. Payment proof may contain information visible in the file you choose to upload. We do not ask for or store your online-banking password, debit-card number, or bank-account credentials, and the website does not initiate a debit from your account.',
        title: 'Membership, event, and Zelle records',
      },
      {
        anchor: 'technical-information-and-cookies',
        body: 'The Services process ordinary request and device information needed to operate and secure the website, which may include IP address, browser or device characteristics, requested pages, timestamps, error information, and rate-limit or security events. We use authentication and security cookies for signed-in sessions and Google sign-in state. As of the effective date, the website does not use advertising cookies or behavioral-advertising trackers. If analytics or materially different cookies are introduced, this Policy and any required consent controls must be updated before use.',
        title: 'Technical information and cookies',
      },
      {
        anchor: 'how-we-use-information',
        body: 'We use information to create and secure accounts; verify identity and alumni/member information; provide profiles, membership, chapter, event, waitlist, payment-review, reporting, and communication functions; calculate prices and promotions; send required security, transaction, renewal, waitlist, and service messages; send optional announcements or newsletters according to preferences; respond to inquiries; prevent fraud and abuse; diagnose errors; maintain records; enforce our agreements; comply with law; and improve the Services. Authorized reports may use aggregated membership, chapter, event, promotion, and revenue information.',
        title: 'How we use information',
      },
      {
        anchor: 'how-we-disclose-information',
        body: 'We disclose information only as reasonably necessary: to authorized RUETIAN USA volunteers, chapter administrators, administrators, and service personnel whose roles require it; to vendors supporting hosting, databases, storage, email delivery, security, and similar operations under appropriate obligations; to Google when you elect Google authentication; to comply with legal process, protect rights or safety, investigate misuse, or enforce agreements; and in connection with an organizational restructuring or transfer, subject to applicable law. Chapter administrators receive only information within their assigned operational scope. We do not sell or rent personal information, and we do not disclose it for cross-context behavioral advertising.',
        title: 'How we disclose information',
      },
      {
        anchor: 'zelle-and-third-party-services',
        body: 'A Zelle transfer is initiated separately through your bank or credit union, not through this website. RUETIAN USA receives the transfer through its configured recipient account and receives only the information made available through that payment relationship and the proof you submit here. Zelle, Google, email providers, linked websites, and financial institutions operate under their own privacy terms. RUETIAN USA is not responsible for those independent privacy practices.',
        title: 'Zelle and other third-party services',
      },
      {
        anchor: 'choices-and-requests',
        body: 'You can review and update eligible profile fields and communication preferences from account settings. Required account-security and transaction messages may still be sent when needed to provide the Services. You may request access, correction, deletion, or other privacy action by contacting info@ruetianusa.org. We may verify your identity, ask for information needed to locate the records, deny or limit a request where permitted by law, and retain information that must or may lawfully be preserved. Residents of a jurisdiction with additional privacy rights may exercise those rights through the same contact.',
        title: 'Your choices and privacy requests',
      },
      {
        anchor: 'retention-and-account-deletion',
        body: 'We retain information for as long as reasonably necessary for the purposes described in this Policy, including providing the Services, maintaining membership and event history, resolving disputes, preventing fraud, enforcing agreements, and meeting legal, tax, accounting, and audit obligations. Retention varies by record type and operational need. Self-service account deletion disables the account and anonymizes eligible profile and authentication information. Financial, membership, registration, payment-proof, delivery, workflow, and audit records may be retained after account deletion where reasonably necessary, with direct identifiers removed or restricted when appropriate.',
        title: 'Retention and account deletion',
      },
      {
        anchor: 'security',
        body: 'We use administrative, technical, and access-control measures designed to protect information, including role- and chapter-scoped access, private payment-proof storage, session controls, validation, rate limiting, and audit records. No website, transmission, or storage system can be guaranteed completely secure. You are responsible for protecting your credentials, using a unique password, signing out on shared devices, and promptly notifying us of suspected account misuse.',
        title: 'Security',
      },
      {
        anchor: 'children-and-international-use',
        body: 'The Services are intended for adults and are not directed to children under 13. We do not knowingly collect personal information online from a child under 13. If you believe a child has provided information, contact us so we can review and take appropriate action. RUETIAN USA operates its online Services in the United States. If you access them from another country, your information may be processed and stored in the United States, where privacy laws may differ.',
        title: 'Children and international use',
      },
      {
        anchor: 'policy-changes',
        body: 'We may update this Policy when the Services, practices, or legal requirements change. The revised version will show a new effective or last-updated date. When required by law or appropriate for a material change, we will provide additional notice or request renewed acknowledgement. Earlier transaction and acceptance records may continue to identify the policy version that applied when they were created.',
        title: 'Changes to this Policy',
      },
      {
        anchor: 'contact',
        body: 'For privacy questions or requests, contact RUETIAN USA at info@ruetianusa.org. Include “Privacy Request” in the subject line and describe the account or record involved. Do not send passwords, bank credentials, or unnecessary sensitive information by email.',
        title: 'Privacy contact',
      },
    ],
    seo: {
      description:
        'How RUETIAN USA collects, uses, discloses, retains, and protects website and member information.',
      title: 'Privacy Policy',
    },
    slug: 'privacy-policy',
    summary:
      'Effective July 14, 2026: privacy practices for RUETIAN USA accounts, membership, events, communications, and Zelle payment proof.',
    title: 'Privacy Policy',
  },
  {
    _status: 'published',
    editorialStatus: 'approved',
    heroDescription:
      'Effective July 14, 2026. These Terms govern access to and use of the RUETIAN USA website, accounts, content, and online services.',
    heroEyebrow: 'Legal',
    heroTitle: 'Terms of Use',
    lastReviewedAt: LEGAL_POLICY_REVIEWED_AT,
    legalStatus: 'approved',
    pageType: 'legal',
    sections: [
      {
        anchor: 'acceptance-and-eligibility',
        body: 'These Terms of Use form an agreement between you and RUETIAN USA and apply to the website and related online services (the “Services”). By accessing the Services, creating an account, or submitting a registration or payment proof, you agree to these Terms and the Privacy Policy. You must be at least 18 years old and legally able to enter this agreement. If you use the Services for another person or organization, you represent that you have authority to do so.',
        title: 'Acceptance and eligibility',
      },
      {
        anchor: 'accounts',
        body: 'You must provide accurate, current information and keep eligible account information updated. You are responsible for safeguarding your password and session, for activity performed through your account, and for promptly reporting suspected unauthorized access. You may not share an account, impersonate another person, create deceptive identities, or attempt to obtain elevated permissions. RUETIAN USA may require email verification, identity or alumni verification, or additional information before providing account, member, chapter, payment, or event functions.',
        title: 'Accounts and account security',
      },
      {
        anchor: 'acceptable-use',
        body: 'You may use the Services only for lawful RUETIAN USA community, membership, event, learning, and organizational purposes. You may not interfere with operation or security; probe or bypass access controls; scrape or harvest information without written permission; upload malware or unlawful, infringing, deceptive, harassing, or harmful material; misuse contact or communication tools; submit false payment proof; reverse engineer restricted portions; or use another person’s data without authority. Automated access requires prior written approval.',
        title: 'Acceptable use',
      },
      {
        anchor: 'content-and-intellectual-property',
        body: 'The Services and their organization, design, text, graphics, logos, software, and original content are owned by RUETIAN USA or used with permission and are protected by applicable law. RUET and third-party names, marks, and materials remain the property of their respective owners. You receive a limited, revocable, non-exclusive, non-transferable right to access the Services for their intended personal or authorized organizational use. No other license is granted.',
        title: 'Content and intellectual property',
      },
      {
        anchor: 'user-submissions',
        body: 'You retain ownership of material you lawfully submit. You represent that you have the rights and permissions needed to submit it and that it does not violate law or another person’s rights. You grant RUETIAN USA a non-exclusive, worldwide, royalty-free license to host, store, reproduce, format, display, and distribute the submission only as reasonably necessary to operate, administer, archive, and promote the Services and RUETIAN USA activities. Private payment proof and account records are not licensed for promotional use. We may remove or restrict material that violates these Terms or organizational policy.',
        title: 'User submissions',
      },
      {
        anchor: 'communications',
        body: 'You agree that RUETIAN USA may send required account, security, membership, payment, registration, waitlist, and service communications. Optional announcements and newsletters are controlled through available preferences and unsubscribe mechanisms. You are responsible for maintaining a working email address. Electronic notices satisfy any requirement that a communication be in writing to the extent permitted by law.',
        title: 'Electronic communications',
      },
      {
        anchor: 'membership-and-events',
        body: 'Membership is governed additionally by the Membership Terms, which are incorporated into these Terms. Event descriptions, eligibility, capacity, schedules, locations, speakers, access links, and benefits may change. Registration does not guarantee admission if requirements are not met, capacity changes, payment is not approved, or an event is modified or cancelled. Virtual access may be restricted to confirmed registrants and may not be shared. RUETIAN USA may establish reasonable event and community conduct rules.',
        title: 'Membership and events',
      },
      {
        anchor: 'payments-and-events',
        body: 'Zelle is the only website-supported payment method for paid membership and events. The website calculates an order total, but you separately authorize the transfer through your financial institution. A submitted transaction ID or proof does not confirm payment or activate a membership or paid registration; authorized RUETIAN USA personnel must approve it. Membership dues and paid event fees are final and non-refundable, except where a refund is required by applicable law or expressly authorized in writing by RUETIAN USA. Cancellation, nonattendance, account deletion, suspension, benefit nonuse, payment-proof rejection, or a mistaken transfer does not create an automatic refund. Contact info@ruetianusa.org promptly about a duplicate or incorrect transfer.',
        title: 'Payments, cancellations, and no-refund rule',
      },
      {
        anchor: 'zelle-disclosure',
        body: 'Zelle is a third-party payment network offered through participating financial institutions. RUETIAN USA is not Zelle or Early Warning Services, LLC and is not affiliated with or endorsed by them. Zelle does not offer purchase protection for authorized payments, and a payment generally cannot be cancelled after it is sent to an enrolled recipient. Before sending, verify the displayed RUETIAN USA recipient and exact amount. Your financial institution’s and Zelle’s terms, fees, limits, error-resolution rights, and privacy practices apply independently.',
        title: 'Zelle disclosure',
      },
      {
        anchor: 'suspension-and-termination',
        body: 'RUETIAN USA may investigate suspected misuse and may limit, suspend, or terminate access, membership privileges, content, registrations, or administrative permissions for violations of these Terms, nonpayment, safety or security concerns, legal requirements, or conduct harmful to the organization or community. Where practical, we may provide notice or an opportunity to respond, but immediate action may be taken when reasonably necessary. Account deletion and termination do not eliminate provisions or records that by their nature should survive.',
        title: 'Suspension and termination',
      },
      {
        anchor: 'third-party-services',
        body: 'The Services may use or link to independent providers and websites, including Google, Zelle, financial institutions, email providers, meeting platforms, and external resources. RUETIAN USA does not control and is not responsible for their content, availability, security, terms, or practices. A link or integration does not imply endorsement. Your use of a third-party service is governed by its own agreement.',
        title: 'Third-party services and links',
      },
      {
        anchor: 'disclaimers',
        body: 'To the maximum extent permitted by law, the Services are provided “as is” and “as available.” RUETIAN USA disclaims implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, and uninterrupted or error-free operation. We do not guarantee employment, professional, immigration, financial, tax, legal, educational, networking, or other outcomes; uninterrupted access; the accuracy of member or third-party submissions; or that every defect or security risk will be eliminated. Nothing in the Services is professional advice.',
        title: 'Disclaimers',
      },
      {
        anchor: 'limitation-of-liability',
        body: 'To the maximum extent permitted by law, RUETIAN USA and its officers, committee members, chapter leaders, volunteers, agents, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, lost profits, lost data, loss of goodwill, or business interruption arising from the Services. Their total aggregate liability for a claim will not exceed the greater of 100 U.S. dollars or the amount you paid through the Services during the 12 months before the event giving rise to the claim. These limits do not apply where liability cannot lawfully be limited.',
        title: 'Limitation of liability',
      },
      {
        anchor: 'indemnification',
        body: 'To the extent permitted by law, you agree to defend, indemnify, and hold harmless RUETIAN USA and its officers, committee members, chapter leaders, volunteers, and agents from third-party claims, damages, judgments, costs, and reasonable legal fees arising from your unlawful use of the Services, your material breach of these Terms, or content you submit, except to the extent caused by the indemnified party’s own unlawful conduct.',
        title: 'Indemnification',
      },
      {
        anchor: 'governing-law-and-disputes',
        body: 'These Terms are governed by applicable United States federal law and, to the extent state law applies, the law of the state in which RUETIAN USA is legally organized, without regard to conflict-of-law principles. Before filing a claim, you and RUETIAN USA agree to make a good-faith effort to resolve it by written notice and informal discussion for at least 30 days, unless urgent injunctive relief is reasonably necessary. Any court proceeding must be brought in a court with lawful subject-matter and personal jurisdiction. Nothing here waives a right that cannot lawfully be waived.',
        title: 'Governing law and disputes',
      },
      {
        anchor: 'changes-and-general-terms',
        body: 'We may update these Terms for changes in the Services, organizational rules, or law. The posted version will identify its effective date, and material changes will receive additional notice where required. If a provision is unenforceable, it will be limited to the minimum extent necessary and the remainder will continue. Failure to enforce a provision is not a waiver. You may not assign this agreement without written consent; RUETIAN USA may assign it in connection with an organizational restructuring or lawful transfer. These Terms, the Privacy Policy, Membership Terms when applicable, and posted transaction terms form the complete online-services agreement.',
        title: 'Changes and general terms',
      },
      {
        anchor: 'contact',
        body: 'Questions about these Terms may be sent to info@ruetianusa.org with “Terms Question” in the subject line. Do not send passwords, banking credentials, or unnecessary sensitive information by email.',
        title: 'Contact',
      },
    ],
    seo: {
      description:
        'Terms governing RUETIAN USA website accounts, content, membership, events, communications, and Zelle payments.',
      title: 'Terms of Use',
    },
    slug: 'terms-of-use',
    summary:
      'Effective July 14, 2026: terms governing the RUETIAN USA website, accounts, services, events, and payments.',
    title: 'Terms of Use',
  },
  {
    _status: 'published',
    editorialStatus: 'approved',
    heroDescription:
      'Effective July 14, 2026. This agreement governs annual RUETIAN USA membership, manual Zelle verification, renewal, conduct, and the no-refund policy.',
    heroEyebrow: 'Legal',
    heroTitle: 'Membership Agreement and Payment Terms',
    lastReviewedAt: LEGAL_POLICY_REVIEWED_AT,
    legalStatus: 'approved',
    pageType: 'legal',
    sections: [
      {
        anchor: 'agreement-and-eligibility',
        body: 'This Membership Agreement is between the applicant or member (“you”) and RUETIAN USA. It supplements and incorporates the Terms of Use and Privacy Policy. By submitting a membership payment or renewal proof, you confirm that your account and alumni-related information are accurate, that you are legally able to enter this agreement, and that you meet the eligibility rules displayed for the active membership plan. RUETIAN USA may request reasonable information to verify eligibility and may approve or deny an application in accordance with organizational rules and applicable law.',
        title: 'Agreement and eligibility',
      },
      {
        anchor: 'annual-membership',
        body: 'The launch offering is one global annual RUETIAN USA membership. Chapter affiliation supports community routing and reporting but does not change the standard membership price. Membership is personal, non-transferable, and may not be shared. The current plan title, price, benefits, renewal reminder timing, and grace period are displayed before payment and stored with the transaction for audit purposes.',
        title: 'Annual membership',
      },
      {
        anchor: 'dues-pricing-and-promotions',
        body: 'You must pay the exact server-confirmed U.S.-dollar total displayed for the transaction. A valid promotion may reduce that total, subject to its scope, dates, eligibility, and usage limits. Price changes apply to a later membership or renewal and do not alter a completed transaction’s stored price. Membership dues are not represented as tax-deductible charitable contributions. Consult your own tax adviser about any possible deduction; a receipt or payment record is not tax advice or a representation of RUETIAN USA’s tax status.',
        title: 'Dues, pricing, promotions, and taxes',
      },
      {
        anchor: 'zelle-payment-instructions',
        body: 'Zelle is the only website-supported payment method. Verify the recipient name and email address or U.S. mobile number displayed at checkout, send the exact total through your participating bank or credit union, and include your name or requested reference in the memo. The website does not debit your account, store your bank credentials, or automatically renew membership. Zelle does not offer purchase protection for authorized payments, and a transfer generally cannot be cancelled after it reaches an enrolled recipient. Your financial institution’s and Zelle’s separate terms apply.',
        title: 'Zelle payment instructions and risk disclosure',
      },
      {
        anchor: 'proof-and-manual-review',
        body: 'After sending the Zelle payment, submit the transaction ID, an eligible screenshot or PDF, or both. Submission creates an immutable payment attempt and does not prove receipt or activate membership. Authorized RUETIAN USA chapter or organization administrators manually compare the proof, amount, order, recipient information, and available payment record. Incomplete, duplicate, altered, mismatched, or unverifiable proof may be rejected with a reason. A rejected attempt remains in the audit history; any resubmission is a new payment attempt and requires renewed agreement to the then-current payment terms.',
        title: 'Proof submission and manual review',
      },
      {
        anchor: 'activation-renewal-and-grace',
        body: 'Membership becomes active only after authorized approval of the applicable Zelle payment, and the system records the approval date as the start of the annual term. Membership does not renew automatically. Each annual renewal requires a new Zelle transfer, proof submission, and approval at the then-current plan price. Optional reminders may be sent before expiration and during the configured grace period. If renewal is not approved by the end of the grace period, membership expires; reactivation requires a new paid term and approval.',
        title: 'Activation, renewal, grace, and reactivation',
      },
      {
        anchor: 'no-refunds',
        body: 'Membership dues sent through Zelle are final, non-refundable, non-transferable, and not prorated, except where a refund is required by applicable law or expressly authorized in writing by RUETIAN USA. Application denial, payment-proof rejection, nonuse of benefits, chapter change, resignation, account deletion, suspension, termination, expiration, duplicate submission, incorrect amount, or transfer to an incorrect recipient does not create an automatic refund. Contact info@ruetianusa.org promptly about an incorrect or duplicate transfer; review or special handling is not guaranteed.',
        title: 'Final payment and no-refund policy',
      },
      {
        anchor: 'benefits-and-chapters',
        body: 'Membership may provide access to organization or chapter programs, member communications, professional learning, opportunities, discounts, or other benefits described by the active plan. Benefits have no guaranteed cash value and may be modified, replaced, limited, or discontinued for operational, safety, legal, or financial reasons. Membership does not guarantee admission to capacity-limited events, employment, immigration support, professional services, leadership selection, or any particular outcome. Your primary chapter may be changed through available account settings subject to active chapter availability.',
        title: 'Benefits and chapter affiliation',
      },
      {
        anchor: 'member-conduct',
        body: 'Members must act lawfully and respectfully; protect account and event-access information; follow reasonable organization, chapter, event, and community rules; avoid harassment, discrimination, threats, fraud, payment deception, and misuse of personal information; and refrain from implying authority to speak for RUETIAN USA without authorization. Members must promptly correct material account or eligibility inaccuracies and cooperate with reasonable payment or safety reviews.',
        title: 'Member responsibilities and conduct',
      },
      {
        anchor: 'suspension-and-termination',
        body: 'RUETIAN USA may suspend, cancel, or decline to renew membership for a material breach of this Agreement or the Terms of Use, ineligibility, nonpayment, fraud, safety or security concerns, harmful conduct, or other grounds permitted by organizational rules and law. Where practical, RUETIAN USA may give notice and an opportunity to respond, but immediate restrictions may be imposed when reasonably necessary. Suspension or termination does not erase payment, membership, workflow, or audit records and does not create a refund except where required by law or authorized in writing.',
        title: 'Suspension and termination',
      },
      {
        anchor: 'privacy-and-communications',
        body: 'Membership and payment information is handled under the Privacy Policy. Payment proof is private to you and authorized reviewers within their role or chapter scope. You agree to receive required membership, payment, security, renewal-status, and service communications. Optional announcements and newsletters are controlled through available preferences. Deleting an account anonymizes eligible profile information but may preserve membership, financial, registration, proof, delivery, and audit records as described in the Privacy Policy.',
        title: 'Privacy, records, and communications',
      },
      {
        anchor: 'changes',
        body: 'RUETIAN USA may update this Agreement, membership plans, prices, benefits, and operational rules prospectively. The terms and price accepted for a recorded payment attempt remain identified in its audit snapshot; a later renewal or resubmission uses the version presented at that time. Material changes will receive notice where required by law. If a provision is unenforceable, it will be limited to the minimum extent necessary and the remaining provisions will continue.',
        title: 'Changes to membership terms',
      },
      {
        anchor: 'contact',
        body: 'For membership, renewal, Zelle-proof, or special-handling questions, contact info@ruetianusa.org before sending payment whenever possible. Include “Membership Support” in the subject line and the relevant order or payment reference. Never send your password, bank login, full bank-account number, or other unnecessary financial credentials by email.',
        title: 'Membership support',
      },
    ],
    seo: {
      description:
        'RUETIAN USA annual membership agreement, Zelle proof and review terms, renewal rules, conduct standards, and no-refund policy.',
      title: 'Membership Agreement and Zelle Payment Terms',
    },
    slug: 'membership-terms',
    summary:
      'Effective July 14, 2026: annual membership, Zelle verification, renewal, conduct, and final-payment terms.',
    title: 'Membership Agreement and Payment Terms',
  },
]
