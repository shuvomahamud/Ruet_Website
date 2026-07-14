'use client'

import { FormEvent, useState } from 'react'

import { FormMessage } from '@/components/auth/FormMessage'

type ReviewRequest = {
  id: number
  motivation?: string | null
  requestedName: string
  requestedRegion?: string | null
}

export const ChapterRequestReviewList = ({ requests }: { requests: ReviewRequest[] }) => {
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [workingID, setWorkingID] = useState<number | null>(null)
  const [completed, setCompleted] = useState<number[]>([])

  const review = async (event: FormEvent<HTMLFormElement>, requestID: number) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    setWorkingID(requestID)
    setMessage('')
    const response = await fetch(`/api/chapter-requests/${requestID}/review`, {
      body: JSON.stringify({ decision: submitter?.value, notes: form.get('notes') }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message || 'The review could not be saved.')
    setSuccess(response.ok)
    setWorkingID(null)
    if (response.ok) setCompleted((items) => [...items, requestID])
  }

  if (!requests.length) {
    return <p className="empty-inline">There are no pending chapter requests.</p>
  }

  return (
    <div>
      <FormMessage message={message} success={success} />
      <div className="review-list">
        {requests.map((request) =>
          completed.includes(request.id) ? null : (
            <article className="surface-card" key={request.id}>
              <p className="eyebrow">Pending request #{request.id}</p>
              <h2>{request.requestedName}</h2>
              {request.requestedRegion ? <p>{request.requestedRegion}</p> : null}
              {request.motivation ? <p>{request.motivation}</p> : null}
              <form onSubmit={(event) => review(event, request.id)}>
                <label>
                  Review notes
                  <textarea maxLength={2000} name="notes" rows={4} />
                </label>
                <div className="review-list__actions">
                  <button
                    className="button button--primary"
                    disabled={workingID === request.id}
                    name="decision"
                    type="submit"
                    value="approve"
                  >
                    Approve and publish chapter
                  </button>
                  <button
                    className="button button--secondary"
                    disabled={workingID === request.id}
                    name="decision"
                    type="submit"
                    value="reject"
                  >
                    Reject request
                  </button>
                </div>
              </form>
            </article>
          ),
        )}
      </div>
    </div>
  )
}
