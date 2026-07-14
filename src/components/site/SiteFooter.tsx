import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { fallbackFooter, fallbackSiteSettings } from '@/constants/site'
import { isSafeHref } from '@/utilities/links'
import { getFooterGlobal, getSiteSettings } from '@/utilities/payload-public'

const FooterLink = ({ href, label }: { href: string; label: string }) => {
  const safeHref = isSafeHref(href) ? href : '/'
  const external = /^https?:\/\//i.test(safeHref)
  return (
    <Link
      href={safeHref}
      rel={external ? 'noreferrer' : undefined}
      target={external ? '_blank' : undefined}
    >
      {label}
    </Link>
  )
}

export const SiteFooter = async () => {
  const [footer, siteSettings] = await Promise.all([getFooterGlobal(), getSiteSettings()])

  const groups = footer.groups?.length ? footer.groups : fallbackFooter.groups
  const newsletterHref = isSafeHref(footer.newsletterCtaHref)
    ? footer.newsletterCtaHref
    : fallbackFooter.newsletterCtaHref

  return (
    <footer className="site-footer" id="site-footer">
      <Container>
        <div className="site-footer__top">
          <div className="site-footer__intro">
            <p className="site-footer__eyebrow">RUETIAN USA</p>
            <h2>{siteSettings.organizationName || fallbackSiteSettings.organizationName}</h2>
            <p>{siteSettings.footerNote || fallbackSiteSettings.footerNote}</p>
          </div>

          <nav aria-label="Footer navigation" className="site-footer__groups">
            {groups.map((group, groupIndex) => (
              <div className="site-footer__group" key={`${group.title}-${groupIndex}`}>
                <h3>{group.title}</h3>
                <ul>
                  {group.links?.map((item, index) => (
                    <li key={`${item.link?.href}-${index}`}>
                      <FooterLink href={item.link?.href || '/'} label={item.link?.label || 'Link'} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="site-footer__group site-footer__group--contact">
              <h3>Contact</h3>
              <ul>
                <li>
                  <a href={`mailto:${siteSettings.primaryEmail || fallbackSiteSettings.primaryEmail}`}>
                    {siteSettings.primaryEmail || fallbackSiteSettings.primaryEmail}
                  </a>
                </li>
                {siteSettings.primaryPhone ? (
                  <li>
                    <a href={`tel:${siteSettings.primaryPhone}`}>{siteSettings.primaryPhone}</a>
                  </li>
                ) : null}
                {siteSettings.mailingAddress ? <li>{siteSettings.mailingAddress}</li> : null}
                <li>
                  <Link href="/contact">Contact RUETIAN USA</Link>
                </li>
                <li>
                  <Link href="/announcements">Announcements</Link>
                </li>
                <li>
                  <Link href="/account/settings">Account settings</Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="site-footer__newsletter">
          <div>
            <h3>{footer.newsletterTitle || fallbackFooter.newsletterTitle}</h3>
            <p>{footer.newsletterSummary || fallbackFooter.newsletterSummary}</p>
          </div>
          <Link
            className="button button--light"
            href={newsletterHref}
          >
            {footer.newsletterCtaLabel || fallbackFooter.newsletterCtaLabel}
          </Link>
        </div>

        <div className="site-footer__bottom">
          <p>{footer.legalNotice || fallbackFooter.legalNotice}</p>
          <nav aria-label="Legal and social links" className="site-footer__legal-links">
            {(footer.legalLinks?.length ? footer.legalLinks : fallbackFooter.legalLinks).map(
              (item, index) => (
                <FooterLink
                  href={item.href}
                  key={`${item.href}-${index}`}
                  label={item.label}
                />
              ),
            )}
            {footer.socialLinks?.map((item, index) => (
              <FooterLink href={item.href} key={`${item.href}-${index}`} label={item.label} />
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  )
}
