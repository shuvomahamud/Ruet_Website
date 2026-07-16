'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const LogoutButton = ({
  className = 'button button--secondary',
}: {
  className?: string
}) => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const logout = async () => {
    setSubmitting(true)
    await fetch('/api/users/logout', { credentials: 'include', method: 'POST' }).catch(
      () => undefined,
    )
    await fetch('/api/auth/logout', { credentials: 'include', method: 'POST' }).catch(
      () => undefined,
    )
    router.push('/login')
    router.refresh()
  }

  return (
    <button className={className} disabled={submitting} onClick={logout} type="button">
      {submitting ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
