# Editable Sample Content Guide

Updated: 2026-07-14

## Database

The website uses PostgreSQL as its primary database. Payload CMS connects through `@payloadcms/db-postgres` using `DATABASE_URL` from `.env`. The local example database is named `ruet_alumni_website`.

## Install The Sample Content

From the project root:

```bash
pnpm seed:sample
pnpm audit:sample
```

`seed:sample` installs or refreshes editable public content for:

- organization identity, contact details, navigation, footer, homepage, SEO, and core pages
- the approved legal policies and Zelle/no-refund defaults
- annual membership plan, benefits, FAQs, and a sample promotion
- four sample chapters with public descriptions and `.test` contact addresses
- current running and advisory committees, historical committee terms, chapter leadership, member biographies, and recaps
- history timeline entries
- learning articles, a resource, and clearly labeled sample news
- upcoming free, paid, and virtual events plus an archived event recap
- public, member, and chapter announcements
- learning categories

The command does not create users, memberships, orders, payments, registrations, payment proofs, or waitlist records. Those remain exclusive to authenticated workflows and the separate non-production `seed:uat` command.

The seeded phone number, mailing address, chapter-support email, social destinations, and Zelle recipient are visibly fictional. Addresses use the reserved `.test` domain, social links use `example.com`, and the phone number uses the fictional `555-01xx` range. Replace all of them in Site Settings and Footer before accepting real inquiries or payments.

## Where To Change It In Payload Admin

| Content                                                                        | Payload Admin area                     |
| ------------------------------------------------------------------------------ | -------------------------------------- |
| Organization name, email, phone, address, Zelle recipient, and payment notices | Website → Site Settings                |
| Homepage hero and section headings                                             | Website → Home                         |
| Header, footer, and SEO defaults                                               | Website → Header, Footer, SEO Defaults |
| About, contact, membership, directory, history, committee, and legal page copy | Content → Pages                        |
| Chapter names, descriptions, contacts, status, and hero images                 | Community → Chapters                   |
| Current/past leadership, member profiles, photos, and recaps                   | Community → Committee Terms            |
| Timeline milestones, images, documents, and links                              | Community → History Entries            |
| Learning articles/resources/news and categories                                | Content → Posts and Categories         |
| Event schedules, pricing, capacity, registration rules, images, and recaps     | Events → Events                        |
| Public/member/chapter notices and display windows                              | Communications → Announcements         |
| Annual price, benefits, FAQs, renewal settings, and terms summary              | Membership → Membership Plans          |
| Sample discounts                                                               | Commerce → Promotions                  |

Routine edits can be drafted, previewed, approved, and published without changing code. Super-admin permission is required for chapter creation and membership-plan changes; administrators can manage organization pages and globals.

## Important Reset Rule

Run `seed:sample` to install the initial dataset or intentionally reset known sample records. It refreshes the canonical pages, globals, membership plan, and known sample fixtures. After editors begin replacing the samples, back up PostgreSQL and do not rerun the seed unless that reset is intended.

The `pnpm audit:sample` command is read-only. It checks minimum public-content counts and required organization/home fields without changing content.

Sample content is not stakeholder-approved production copy. Replace sample people, `.test` email addresses, organization history, chapter information, committee records, announcements, programs, and imagery before launch.
