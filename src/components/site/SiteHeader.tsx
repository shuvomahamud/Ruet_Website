import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { fallbackHeader, fallbackSiteSettings } from '@/constants/site'
import { getSiteLogoPath } from '@/utilities/site-logo'
import { getHeaderGlobal, getSiteSettings } from '@/utilities/payload-public'

export const SiteHeader = async () => {
  const [header, logoPath, siteSettings] = await Promise.all([
    getHeaderGlobal(),
    getSiteLogoPath(),
    getSiteSettings(),
  ])

  const utilityLinks = header.utilityLinks?.length ? header.utilityLinks : fallbackHeader.utilityLinks
  const mainLinks = header.mainLinks?.length ? header.mainLinks : fallbackHeader.mainLinks
  const ctaHref = header.primaryCtaHref || fallbackHeader.primaryCtaHref
  const ctaLabel = header.primaryCtaLabel || fallbackHeader.primaryCtaLabel

  return (
    <header className="site-header">
      <div className="site-header__utility">
        <Container>
          <div className="site-header__utility-row">
            <span className="site-header__eyebrow">
              {siteSettings.utilityMessage || fallbackSiteSettings.utilityMessage}
            </span>
            <nav aria-label="Utility navigation" className="site-header__utility-nav">
              {utilityLinks.map((item, index) => (
                <Link href={item.link?.href || '#'} key={`${item.link?.href}-${index}`}>
                  {item.link?.label}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </div>

      <div className="site-header__main">
        <Container>
          <div className="site-header__main-row">
            <div className="brand-lockup">
              {logoPath ? (
                <Image
                  alt={`${siteSettings.organizationName || fallbackSiteSettings.organizationName} logo`}
                  className="brand-lockup__logo"
                  height="54"
                  src={logoPath}
                  width="54"
                />
              ) : (
                <div className="brand-lockup__mark" aria-hidden="true">
                  R
                </div>
              )}
              <div>
                <p className="brand-lockup__name">
                  {siteSettings.organizationName || fallbackSiteSettings.organizationName}
                </p>
                <p className="brand-lockup__subline">
                  {siteSettings.tagline || fallbackSiteSettings.tagline}
                </p>
              </div>
            </div>

            <nav aria-label="Primary navigation" className="site-header__primary-nav">
              {mainLinks.map((item, index) => (
                <Link href={item.link?.href || '#'} key={`${item.link?.href}-${index}`}>
                  {item.link?.label}
                </Link>
              ))}
            </nav>

            <Link className="button button--primary" href={ctaHref}>
              {ctaLabel}
            </Link>
          </div>
        </Container>
      </div>
    </header>
  )
}
