'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

import { FormMessage } from './FormMessage'

export const ResetPasswordForm = ({ token }: { token?: string }) => {
  const [message, setMessage] = useState(token ? '' : 'This reset link is incomplete.')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    if (form.get('password') !== form.get('confirmPassword')) {
      setMessage('Passwords do not match.')
      setSubmitting(false)
      return
    }
    const response = await fetch('/api/users/reset-password', {
      body: JSON.stringify({ password: form.get('password'), token }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    setSuccess(response.ok)
    setMessage(
      response.ok
        ? 'Password updated. You can now sign in.'
        : 'This reset link is invalid or expired.',
    )
    setSubmitting(false)
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <FormMessage message={message} success={success} />
      {!success ? (
        <>
          <label>
            New password
            <input
              autoComplete="new-password"
              minLength={12}
              name="password"
              required
              type="password"
            />
          </label>
          <label>
            Confirm new password
            <input
              autoComplete="new-password"
              minLength={12}
              name="confirmPassword"
              required
              type="password"
            />
          </label>
          <button
            className="button button--primary auth-button"
            disabled={submitting || !token}
            type="submit"
          >
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </>
      ) : (
        <Link className="button button--primary auth-button" href="/login">
          Sign in
        </Link>
      )}
    </form>
  )
}
