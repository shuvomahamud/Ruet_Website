import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { authenticateRequest } from '@/auth/current-user'
import { AccountNavigation } from '@/components/account/AccountNavigation'
import { DeleteAccountForm } from '@/components/auth/DeleteAccountForm'
import { GoogleAuthLink } from '@/components/auth/GoogleAuthLink'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'
import { integrationStatus } from '@/utilities/env'
import { getActiveChapters } from '@/utilities/payload-public'

export default async function AccountSettingsPage() {
  const user = await authenticateRequest(await headers())
  if (!user) redirect('/login?returnTo=/account/settings')
  const chapters = await getActiveChapters(100)
  const authMethods = user.authMethods ?? ['password']

  return (
    <>
      <SiteHeader />
      <main className="account-page">
        <Container>
          <div className="account-page__heading">
            <div>
              <p className="eyebrow">Member account</p>
              <h1>Account settings</h1>
              <p>
                Profile status: <strong>{user.profileStatus ?? 'incomplete'}</strong>
              </p>
            </div>
            <LogoutButton />
          </div>
          <AccountNavigation user={user} />
          <section className="account-panel">
            <h2>Profile</h2>
            <ProfileForm chapters={chapters} user={user} />
          </section>
          <section className="account-panel">
            <h2>Sign-in methods</h2>
            <p>Connected: {authMethods.join(', ')}.</p>
            {authMethods.includes('google') ? (
              <p className="form-message form-message--success">Google is connected.</p>
            ) : (
              <GoogleAuthLink
                enabled={integrationStatus.googleAuth}
                label="Link Google account"
                mode="link"
              />
            )}
          </section>
          <section className="account-panel account-panel--danger">
            <h2>Delete account</h2>
            <DeleteAccountForm passwordRequired={authMethods.includes('password')} />
          </section>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
