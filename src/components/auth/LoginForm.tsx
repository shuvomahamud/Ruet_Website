'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { FormMessage } from './FormMessage'

const oauthErrors: Record<string, string> = {
  account_link_required: 'Sign in with your password, then link Google in account settings.',
  google_auth_cancelled: 'Google sign-in was cancelled.',
  oauth_state_invalid: 'The Google sign-in request expired. Please try again.',
}

export const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState(() => {
    const error = searchParams.get('error')
    return error ? (oauthErrors[error] ?? 'Google sign-in could not be completed.') : ''
  })
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/users/login', {
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })

    if (response.ok) {
      const requested = searchParams.get('returnTo')
      const returnTo =
        requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/account/settings'
      router.push(returnTo)
      router.refresh()
      return
    }

    setMessage('Email or password is incorrect, or the account is not available.')
    setSubmitting(false)
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <FormMessage message={message} />
      <label>
        Email address
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        Password
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      <button className="button button--primary auth-button" disabled={submitting} type="submit">
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
      <div className="auth-form__links">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/signup">Create an account</Link>
      </div>
    </form>
  )
}
