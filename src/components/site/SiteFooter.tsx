import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { fallbackFooter, fallbackSiteSettings } from '@/constants/site'
import { getFooterGlobal, getSiteSettings } from '@/utilities/payload-public'

export const SiteFooter = async () => {
  const [footer, siteSettings] = await Promise.all([getFooterGlobal(), getSiteSettings()])

  const groups = footer.groups?.length ? footer.groups : fallbackFooter.groups

  return (
    <footer className="site-footer" id="developer-handoff">
      <Container>
        <div className="site-footer__top">
          <div className="site-footer__intro">
            <p className="site-footer__eyebrow">RUETIAN USA</p>
            <h2>{siteSettings.organizationName || fallbackSiteSettings.organizationName}</h2>
            <p>{siteSettings.footerNote || fallbackSiteSettings.footerNote}</p>
          </div>

          <div className="site-footer__groups">
            {groups.map((group, groupIndex) => (
              <div className="site-footer__group" key={`${group.title}-${groupIndex}`}>
                <h3>{group.title}</h3>
                <ul>
                  {group.links?.map((item, index) => (
                    <li key={`${item.link?.href}-${index}`}>
                      <Link href={item.link?.href || '#'}>{item.link?.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="site-footer__newsletter">
          <h3>{footer.newsletterTitle || fallbackFooter.newsletterTitle}</h3>
          <p>{footer.newsletterSummary || fallbackFooter.newsletterSummary}</p>
        </div>

        <div className="site-footer__bottom">
          <p>{footer.legalNotice || fallbackFooter.legalNotice}</p>
          <p>{siteSettings.primaryEmail || fallbackSiteSettings.primaryEmail}</p>
        </div>
      </Container>
    </footer>
  )
}
