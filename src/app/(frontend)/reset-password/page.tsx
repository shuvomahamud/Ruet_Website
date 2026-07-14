import { AuthPage } from '@/components/auth/AuthPage'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return (
    <AuthPage
      description="Choose a new, unique password for your account."
      title="Set a new password"
    >
      <ResetPasswordForm token={token} />
    </AuthPage>
  )
}
