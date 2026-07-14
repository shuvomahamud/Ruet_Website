'use client'

import { FormEvent, useState } from 'react'

import { FormMessage } from './FormMessage'

export const EmailRequestForm = ({
  endpoint,
  label,
}: {
  endpoint: '/api/auth/forgot-password' | '/api/auth/resend-verification'
  label: string
}) => {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch(endpoint, {
      body: JSON.stringify({ email: form.get('email') }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message ?? 'Please try again later.')
    setSubmitting(false)
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <FormMessage message={message} success={Boolean(message)} />
      <label>
        Email address
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <button className="button button--primary auth-button" disabled={submitting} type="submit">
        {submitting ? 'Sending…' : label}
      </button>
    </form>
  )
}
