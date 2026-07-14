import Link from 'next/link'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <Container narrow>
            <p className="section-heading__eyebrow">Not found</p>
            <h1>We could not find that page.</h1>
            <p className="page-hero__description">
              The address may have changed, or the page may no longer be available.
            </p>
            <Link className="button button--primary" href="/">
              Return to homepage
            </Link>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
