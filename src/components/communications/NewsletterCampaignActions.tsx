'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { NewsletterCampaign } from '@/payload-types'

import { FormMessage } from '../auth/FormMessage'

const localDateTimeValue = (value: Date | string) => {
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

export const NewsletterCampaignActions = ({ campaign }: { campaign: NewsletterCampaign }) => {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const action = async (value: 'cancel' | 'retry' | 'schedule' | 'send', scheduledAt?: string) => {
    setSubmitting(true)
    setMessage('')
    const response = await fetch(`/api/newsletters/${campaign.id}/action`, {
      body: JSON.stringify({
        action: value,
        ...(scheduledAt ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}),
      }),
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message ?? 'The campaign action could not be completed.')
    setSuccess(response.ok)
    setSubmitting(false)
    if (response.ok) router.refresh()
  }

  const schedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const scheduledAt = form.get('scheduledAt')
    if (typeof scheduledAt === 'string' && scheduledAt) await action('schedule', scheduledAt)
  }

  return (
    <div className="newsletter-actions">
      <FormMessage message={message} success={success} />
      {['draft', 'cancelled', 'scheduled'].includes(campaign.status) ? (
        <form className="newsletter-schedule-form" onSubmit={schedule}>
          <label>
            Send date and time
            <input
              defaultValue={
                campaign.scheduledAt ? localDateTimeValue(campaign.scheduledAt) : ''
              }
              min={localDateTimeValue(new Date())}
              name="scheduledAt"
              required
              type="datetime-local"
            />
          </label>
          <button className="button button--secondary" disabled={submitting} type="submit">
            {campaign.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
          </button>
        </form>
      ) : null}
      <div className="newsletter-actions__buttons">
        {campaign.status === 'scheduled' ? (
          <button
            className="button button--secondary"
            disabled={submitting}
            onClick={() => void action('cancel')}
            type="button"
          >
            Cancel schedule
          </button>
        ) : null}
        {['draft', 'scheduled'].includes(campaign.status) ? (
          <button
            className="button button--primary"
            disabled={submitting}
            onClick={() => void action('send')}
            type="button"
          >
            Send now
          </button>
        ) : null}
        {campaign.status === 'failed' ? (
          <button
            className="button button--primary"
            disabled={submitting}
            onClick={() => void action('retry')}
            type="button"
          >
            Retry failed dispatch
          </button>
        ) : null}
      </div>
    </div>
  )
}
