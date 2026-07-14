'use client'

import { FormEvent, useState } from 'react'

import type { Chapter, User } from '@/payload-types'
import { getRelationshipID } from '@/utilities/relationships'

import { FormMessage } from './FormMessage'

export const ProfileForm = ({ chapters, user }: { chapters: Chapter[]; user: User }) => {
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const preferences = user.communicationPreferences

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/account/profile', {
      body: JSON.stringify({
        alumniReference: form.get('alumniReference'),
        city: form.get('city'),
        communicationPreferences: {
          allowAnnouncements: form.get('allowAnnouncements') === 'on',
          allowNewsletters: form.get('allowNewsletters') === 'on',
          allowSystemEmails: form.get('allowSystemEmails') === 'on',
        },
        country: form.get('country'),
        employer: form.get('employer'),
        firstName: form.get('firstName'),
        graduationYear: form.get('graduationYear'),
        lastName: form.get('lastName'),
        phoneNumber: form.get('phoneNumber'),
        primaryChapter: form.get('primaryChapter'),
        professionalTitle: form.get('professionalTitle'),
        ruetDepartment: form.get('ruetDepartment'),
        state: form.get('state'),
      }),
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      method: 'PATCH',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message ?? 'Profile could not be saved.')
    setSuccess(response.ok)
    setSubmitting(false)
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <FormMessage message={message} success={success} />
      <div className="form-grid form-grid--two">
        <label>
          First name
          <input defaultValue={user.firstName ?? ''} name="firstName" required />
        </label>
        <label>
          Last name
          <input defaultValue={user.lastName ?? ''} name="lastName" required />
        </label>
      </div>
      <label>
        Email address
        <input disabled value={user.email} />
      </label>
      <div className="form-grid form-grid--two">
        <label>
          RUET department
          <input defaultValue={user.ruetDepartment ?? ''} name="ruetDepartment" required />
        </label>
        <label>
          Graduation year
          <input
            defaultValue={user.graduationYear ?? ''}
            name="graduationYear"
            required
            type="number"
          />
        </label>
      </div>
      <label>
        Alumni reference
        <input defaultValue={user.alumniReference ?? ''} name="alumniReference" />
      </label>
      <label>
        Primary chapter
        <select
          defaultValue={getRelationshipID(user.primaryChapter) ?? ''}
          name="primaryChapter"
          required
        >
          <option value="">Select a chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.name}
            </option>
          ))}
        </select>
      </label>
      <div className="form-grid form-grid--two">
        <label>
          City
          <input defaultValue={user.city ?? ''} name="city" required />
        </label>
        <label>
          State
          <input defaultValue={user.state ?? ''} name="state" required />
        </label>
      </div>
      <label>
        Country
        <input defaultValue={user.country ?? 'United States'} name="country" required />
      </label>
      <div className="form-grid form-grid--two">
        <label>
          Phone number
          <input defaultValue={user.phoneNumber ?? ''} name="phoneNumber" type="tel" />
        </label>
        <label>
          Employer
          <input defaultValue={user.employer ?? ''} name="employer" />
        </label>
      </div>
      <label>
        Professional title
        <input defaultValue={user.professionalTitle ?? ''} name="professionalTitle" />
      </label>
      <fieldset className="form-fieldset">
        <legend>Communication preferences</legend>
        <label className="check-field">
          <input
            defaultChecked={preferences?.allowAnnouncements ?? true}
            name="allowAnnouncements"
            type="checkbox"
          />
          <span>Announcements</span>
        </label>
        <label className="check-field">
          <input
            defaultChecked={preferences?.allowNewsletters ?? true}
            name="allowNewsletters"
            type="checkbox"
          />
          <span>Newsletters</span>
        </label>
        <label className="check-field">
          <input
            defaultChecked={preferences?.allowSystemEmails ?? true}
            name="allowSystemEmails"
            type="checkbox"
          />
          <span>Optional account reminders</span>
        </label>
        <p className="form-help">
          Required security, payment, registration, and account-status messages are always sent.
        </p>
      </fieldset>
      <button className="button button--primary auth-button" disabled={submitting} type="submit">
        {submitting ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  )
}
