'use client'

import { FormEvent, useState } from 'react'

import { FormMessage } from '@/components/auth/FormMessage'

export const ContactForm = () => {
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setSubmitting(true)
    setMessage('')

    const response = await fetch('/api/contact', {
      body: JSON.stringify({
        email: form.get('email'),
        message: form.get('message'),
        name: form.get('name'),
        subject: form.get('subject'),
        topic: form.get('topic'),
        website: form.get('website'),
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message || 'Your message could not be sent.')
    setSuccess(response.ok)
    setSubmitting(false)
    if (response.status === 201) formElement.reset()
  }

  return (
    <form className="auth-form contact-form" onSubmit={submit}>
      <FormMessage message={message} success={success} />
      <div className="form-grid form-grid--two">
        <label>
          Name
          <input autoComplete="name" name="name" required />
        </label>
        <label>
          Email address
          <input autoComplete="email" name="email" required type="email" />
        </label>
      </div>
      <label>
        Topic
        <select defaultValue="general" name="topic">
          <option value="general">General question</option>
          <option value="membership">Membership</option>
          <option value="chapter">Chapter support</option>
          <option value="events">Events</option>
          <option value="website">Website help</option>
        </select>
      </label>
      <label>
        Subject
        <input maxLength={180} name="subject" required />
      </label>
      <label>
        Message
        <textarea maxLength={5000} minLength={20} name="message" required rows={8} />
      </label>
      <label aria-hidden="true" className="contact-form__honeypot">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <button className="button button--primary auth-button" disabled={submitting} type="submit">
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
