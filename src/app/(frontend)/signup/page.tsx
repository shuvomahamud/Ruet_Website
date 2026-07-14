import { AuthPage } from '@/components/auth/AuthPage'
import { GoogleAuthLink } from '@/components/auth/GoogleAuthLink'
import { SignupForm } from '@/components/auth/SignupForm'
import { integrationStatus } from '@/utilities/env'
import { getActiveChapters } from '@/utilities/payload-public'

export default async function SignupPage() {
  const chapters = await getActiveChapters(100)
  return (
    <AuthPage
      description="Create your alumni account. Email verification is required before password sign-in."
      title="Join the RUETIAN USA community"
    >
      <SignupForm chapters={chapters.map(({ id, name }) => ({ id, name }))} />
      <div className="auth-divider">
        <span>or</span>
      </div>
      <GoogleAuthLink enabled={integrationStatus.googleAuth} label="Sign up with Google" />
    </AuthPage>
  )
}
