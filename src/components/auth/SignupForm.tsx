'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

import { FormMessage } from './FormMessage'

type ChapterOption = { id: number; name: string }

export const SignupForm = ({ chapters }: { chapters: ChapterOption[] }) => {
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const response = await fetch('/api/auth/signup', {
      body: JSON.stringify({
        city: form.get('city'),
        confirmPassword: form.get('confirmPassword'),
        country: form.get('country'),
        email: form.get('email'),
        firstName: form.get('firstName'),
        rollNumber: form.get('rollNumber'),
        lastName: form.get('lastName'),
        password: form.get('password'),
        primaryChapter: form.get('primaryChapter'),
        privacyAccepted: form.get('privacyAccepted') === 'on',
        ruetDepartment: form.get('ruetDepartment'),
        state: form.get('state'),
        termsAccepted: form.get('termsAccepted') === 'on',
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message ?? 'Your request could not be completed.')
    setSuccess(response.ok)
    setSubmitting(false)
    if (response.status === 201) formElement.reset()
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <FormMessage message={message} success={success} />
      <div className="form-grid form-grid--two">
        <label>
          First name
          <input autoComplete="given-name" name="firstName" required />
        </label>
        <label>
          Last name
          <input autoComplete="family-name" name="lastName" required />
        </label>
      </div>
      <label>
        Email address
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <div className="form-grid form-grid--two">
        <label>
          Password
          <input
            autoComplete="new-password"
            minLength={12}
            name="password"
            required
            type="password"
          />
        </label>
        <label>
          Confirm password
          <input
            autoComplete="new-password"
            minLength={12}
            name="confirmPassword"
            required
            type="password"
          />
        </label>
      </div>
      <p className="form-help">Use 12+ characters with upper/lowercase letters and a number.</p>
      <div className="form-grid form-grid--two">
        <label>
          RUET department
          <input name="ruetDepartment" required />
        </label>
        <label>
          Roll number
          <input autoComplete="off" name="rollNumber" required />
        </label>
      </div>
      <label>
        Primary chapter
        <select disabled={!chapters.length} name="primaryChapter" required>
          <option value="">Select a chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.name}
            </option>
          ))}
        </select>
      </label>
      {!chapters.length ? (
        <FormMessage message="No active chapters are available for signup yet." />
      ) : null}
      <div className="form-grid form-grid--two">
        <label>
          City
          <input autoComplete="address-level2" name="city" required />
        </label>
        <label>
          State
          <input autoComplete="address-level1" name="state" required />
        </label>
      </div>
      <label>
        Country
        <input autoComplete="country-name" defaultValue="United States" name="country" required />
      </label>
      <label className="check-field">
        <input name="termsAccepted" required type="checkbox" />
        <span>
          I agree to the <Link href="/terms-of-use">terms of use</Link>.
        </span>
      </label>
      <label className="check-field">
        <input name="privacyAccepted" required type="checkbox" />
        <span>
          I acknowledge the <Link href="/privacy-policy">privacy policy</Link>.
        </span>
      </label>
      <button
        className="button button--primary auth-button"
        disabled={submitting || !chapters.length}
        type="submit"
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
      <p className="form-help">
        Already registered? <Link href="/login">Sign in</Link>.
      </p>
    </form>
  )
}
