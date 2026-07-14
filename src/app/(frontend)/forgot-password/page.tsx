import Link from 'next/link'

import { AuthPage } from '@/components/auth/AuthPage'
import { EmailRequestForm } from '@/components/auth/EmailRequestForm'

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      description="We will send a time-limited reset link if the address belongs to an eligible account."
      title="Reset your password"
    >
      <EmailRequestForm endpoint="/api/auth/forgot-password" label="Send reset link" />
      <p className="form-help">
        <Link href="/login">Return to sign in</Link>
      </p>
    </AuthPage>
  )
}
