'use client'

import { FormEvent, useState } from 'react'

import type { User } from '@/payload-types'

import { FormMessage } from '../auth/FormMessage'

export const CommunicationPreferencesForm = ({ user }: { user: User }) => {
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const preferences = user.communicationPreferences

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/communication-preferences', {
      body: JSON.stringify({
        allowAnnouncements: form.get('allowAnnouncements') === 'on',
        allowNewsletters: form.get('allowNewsletters') === 'on',
        allowSystemEmails: form.get('allowSystemEmails') === 'on',
      }),
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      method: 'PATCH',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message ?? 'Preferences could not be saved.')
    setSuccess(response.ok)
    setSubmitting(false)
  }

  return (
    <form className="auth-form communications-preferences-form" onSubmit={submit}>
      <FormMessage message={message} success={success} />
      <fieldset className="form-fieldset">
        <legend>Email subscriptions</legend>
        <label className="check-field">
          <input
            defaultChecked={preferences?.allowNewsletters ?? true}
            name="allowNewsletters"
            type="checkbox"
          />
          <span>Scheduled newsletters</span>
        </label>
        <label className="check-field">
          <input
            defaultChecked={preferences?.allowAnnouncements ?? true}
            name="allowAnnouncements"
            type="checkbox"
          />
          <span>Optional announcement emails</span>
        </label>
        <label className="check-field">
          <input
            defaultChecked={preferences?.allowSystemEmails ?? true}
            name="allowSystemEmails"
            type="checkbox"
          />
          <span>Optional account and renewal reminders</span>
        </label>
      </fieldset>
      <p className="form-help">
        Required security, payment, registration, and account-status messages always send.
        Unchecking newsletters prevents future campaign delivery and records a preference
        suppression without exposing your choice to other members. Audience-appropriate notices
        remain available on the website.
      </p>
      <button className="button button--primary" disabled={submitting} type="submit">
        {submitting ? 'Saving…' : 'Save communication preferences'}
      </button>
    </form>
  )
}
