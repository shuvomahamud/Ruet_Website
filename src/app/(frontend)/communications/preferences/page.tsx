import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'

import { authenticateRequest } from '@/auth/current-user'
import { AccountNavigation } from '@/components/account/AccountNavigation'
import { CommunicationPreferencesForm } from '@/components/communications/CommunicationPreferencesForm'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  description: 'Subscribe to or opt out of RUETIAN USA newsletters and optional updates.',
  title: 'Communication Preferences | RUETIAN USA',
}

export default async function CommunicationPreferencesPage() {
  const user = await authenticateRequest(await headers())
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero hero--compact">
          <Container>
            <p className="eyebrow">Stay connected</p>
            <h1>Communication preferences</h1>
            <p className="hero__lede">
              Subscribe to organization newsletters and choose which optional updates you receive.
            </p>
          </Container>
        </section>
        {user ? (
          <section className="account-navigation-band">
            <Container>
              <AccountNavigation user={user} />
            </Container>
          </section>
        ) : null}
        <section className="page-section">
          <Container>
            {user ? (
              <div className="communications-preferences-layout">
                <article className="surface-card">
                  <p className="surface-card__label">Signed in as</p>
                  <h2>{user.email}</h2>
                  <p>Preferences apply immediately to future scheduled campaigns.</p>
                </article>
                <div className="account-panel">
                  <CommunicationPreferencesForm user={user} />
                </div>
              </div>
            ) : (
              <article className="empty-state communications-signup">
                <span aria-hidden="true">✉</span>
                <h2>Use a verified account for newsletter signup</h2>
                <p>
                  Sign in to change an existing subscription, or create an account so RUETIAN USA
                  can verify the address and protect your preferences.
                </p>
                <div className="hero__actions">
                  <Link
                    className="button button--primary"
                    href="/login?returnTo=/communications/preferences"
                  >
                    Sign in to manage preferences
                  </Link>
                  <Link className="button button--secondary" href="/signup">
                    Create an account
                  </Link>
                </div>
              </article>
            )}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
