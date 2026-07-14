import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { fallbackHeader, fallbackSiteSettings } from '@/constants/site'
import { getSiteLogoPath } from '@/utilities/site-logo'
import { getHeaderGlobal, getSiteSettings } from '@/utilities/payload-public'
import { PrimaryNavigation } from './PrimaryNavigation'

export const SiteHeader = async () => {
  const [header, logoPath, siteSettings] = await Promise.all([
    getHeaderGlobal(),
    getSiteLogoPath(),
    getSiteSettings(),
  ])

  const utilityLinks = header.utilityLinks?.length
    ? header.utilityLinks
    : fallbackHeader.utilityLinks
  const configuredMainLinks = header.mainLinks?.length ? header.mainLinks : fallbackHeader.mainLinks
  const mainLinks = configuredMainLinks.map((item) => {
    if (item.children?.length) return item
    const defaultItem = fallbackHeader.mainLinks.find(
      (fallback) => fallback.link.href === item.link.href,
    )
    return defaultItem ? { ...defaultItem, ...item, children: defaultItem.children } : item
  })
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
                <Link
                  href={
                    item.link?.label === 'Sign In' && item.link?.href === '/admin'
                      ? '/login'
                      : item.link?.href || '#'
                  }
                  key={`${item.link?.href}-${index}`}
                >
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
            <Link aria-label="RUETIAN USA home" className="brand-lockup" href="/">
              {logoPath ? (
                <Image
                  alt={`${siteSettings.organizationName || fallbackSiteSettings.organizationName} logo`}
                  className="brand-lockup__logo"
                  height="54"
                  priority
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
            </Link>

            <PrimaryNavigation ctaHref={ctaHref} ctaLabel={ctaLabel} items={mainLinks} />

            <Link className="button button--primary" href={ctaHref}>
              {ctaLabel}
            </Link>
          </div>
        </Container>
      </div>
    </header>
  )
}
