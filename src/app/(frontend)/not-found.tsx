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
            <h1>The requested page does not exist yet.</h1>
            <p className="page-hero__description">
              Some routes will be filled with richer content as later feature phases are completed.
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
