'use client'

import { FormEvent, useState } from 'react'

import { FormMessage } from '@/components/auth/FormMessage'

export const ChapterRequestForm = () => {
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setSubmitting(true)
    setMessage('')

    const response = await fetch('/api/chapter-requests', {
      body: JSON.stringify({
        motivation: form.get('motivation'),
        requestedName: form.get('requestedName'),
        requestedRegion: form.get('requestedRegion'),
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message || 'The request could not be submitted.')
    setSuccess(response.ok)
    setSubmitting(false)
    if (response.ok) formElement.reset()
  }

  return (
    <form className="auth-form chapter-request-form" onSubmit={submit}>
      <FormMessage message={message} success={success} />
      <label>
        Proposed chapter name
        <input maxLength={160} name="requestedName" required />
      </label>
      <label>
        City, state, or region <span>(optional)</span>
        <input maxLength={160} name="requestedRegion" />
      </label>
      <label>
        Why would this chapter help local alumni? <span>(optional)</span>
        <textarea maxLength={2000} name="motivation" rows={6} />
      </label>
      <button className="button button--primary" disabled={submitting} type="submit">
        {submitting ? 'Submitting…' : 'Submit chapter request'}
      </button>
    </form>
  )
}
