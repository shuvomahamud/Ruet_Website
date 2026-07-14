'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { FormMessage } from './FormMessage'

export const DeleteAccountForm = ({ passwordRequired }: { passwordRequired: boolean }) => {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/delete', {
      body: JSON.stringify({
        confirmation: form.get('confirmation'),
        password: form.get('password'),
      }),
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    if (response.ok) {
      router.push('/login?account=deleted')
      router.refresh()
      return
    }
    setMessage(result.message ?? 'Account deletion failed.')
    setSubmitting(false)
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <FormMessage message={message} />
      <p>
        This permanently removes your personal profile and sign-in access. Financial and audit
        records remain anonymized for organizational recordkeeping.
      </p>
      <label>
        Type DELETE MY ACCOUNT
        <input autoComplete="off" name="confirmation" required />
      </label>
      {passwordRequired ? (
        <label>
          Current password
          <input autoComplete="current-password" name="password" required type="password" />
        </label>
      ) : null}
      <button className="button danger-button auth-button" disabled={submitting} type="submit">
        {submitting ? 'Deleting…' : 'Delete my account'}
      </button>
    </form>
  )
}
