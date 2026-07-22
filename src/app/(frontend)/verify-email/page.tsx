import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import { AuthPage } from '@/components/auth/AuthPage'
import { EmailRequestForm } from '@/components/auth/EmailRequestForm'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  let verified = false
  if (token) {
    try {
      const payload = await getPayload({ config })
      verified = await payload.verifyEmail({ collection: 'users', token })
    } catch {
      verified = false
    }
  }

  return (
    <AuthPage
      description="Email verification protects member accounts and enables password sign-in."
      title={verified ? 'Email verified' : 'Verify your email'}
    >
      {verified ? (
        <>
          <p className="form-message form-message--success">
            Your email is verified. Your account is awaiting administrator approval.
          </p>
          <Link className="button button--primary auth-button" href="/login">
            Sign in
          </Link>
          <p className="form-help">
            If an administrator imported your account, first{' '}
            <Link href="/forgot-password">set your password</Link> using this verified email.
          </p>
        </>
      ) : (
        <>
          <p>The verification link is missing, invalid, or already used. Request another below.</p>
          <EmailRequestForm endpoint="/api/auth/resend-verification" label="Resend verification" />
        </>
      )}
    </AuthPage>
  )
}
