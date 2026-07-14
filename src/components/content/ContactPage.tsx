import Link from 'next/link'

import { ContactForm } from '@/components/contact/ContactForm'
import { PageHero } from '@/components/content/PageHero'
import { PageSections } from '@/components/content/PageSections'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import type { Page, SiteSetting } from '@/payload-types'

export const ContactPage = ({ page, settings }: { page: Page; settings: SiteSetting }) => (
  <>
    <SiteHeader />
    <main>
      <PageHero
        description={page.heroDescription}
        eyebrow={page.heroEyebrow}
        title={page.heroTitle || page.title}
      />
      <section className="page-section">
        <Container>
          <div className="contact-layout">
            <div>
              <p className="eyebrow">Send a message</p>
              <h2>How can we help?</h2>
              <p>{settings.contactResponseNote}</p>
              <ContactForm />
            </div>
            <aside className="contact-sidebar">
              <h2>Contact information</h2>
              {settings.primaryEmail ? (
                <div>
                  <span>General inquiries</span>
                  <Link href={`mailto:${settings.primaryEmail}`}>{settings.primaryEmail}</Link>
                </div>
              ) : null}
              {settings.chapterSupportEmail ? (
                <div>
                  <span>Chapter support</span>
                  <Link href={`mailto:${settings.chapterSupportEmail}`}>
                    {settings.chapterSupportEmail}
                  </Link>
                </div>
              ) : null}
              {settings.primaryPhone ? (
                <div>
                  <span>Phone</span>
                  <Link href={`tel:${settings.primaryPhone.replace(/[^+\d]/g, '')}`}>
                    {settings.primaryPhone}
                  </Link>
                </div>
              ) : null}
              {settings.mailingAddress ? (
                <div>
                  <span>Mailing address</span>
                  <p>{settings.mailingAddress}</p>
                </div>
              ) : null}
            </aside>
          </div>
          {page.sections?.length ? (
            <div className="page-section__stack">
              <PageSections sections={page.sections} />
            </div>
          ) : null}
        </Container>
      </section>
    </main>
    <SiteFooter />
  </>
)
