import { Suspense } from 'react'

import { AuthPage } from '@/components/auth/AuthPage'
import { GoogleAuthLink } from '@/components/auth/GoogleAuthLink'
import { LoginForm } from '@/components/auth/LoginForm'
import { integrationStatus } from '@/utilities/env'

export default function LoginPage() {
  return (
    <AuthPage
      description="Sign in to manage your profile, membership, registrations, and chapter activity."
      title="Welcome back"
    >
      <Suspense fallback={<p>Loading sign-in…</p>}>
        <LoginForm />
      </Suspense>
      <div className="auth-divider">
        <span>or</span>
      </div>
      <GoogleAuthLink enabled={integrationStatus.googleAuth} />
    </AuthPage>
  )
}
