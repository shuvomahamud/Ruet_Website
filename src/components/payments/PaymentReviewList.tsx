'use client'

import { FormEvent, useState } from 'react'

import { FormMessage } from '@/components/auth/FormMessage'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utilities/formatters'

export type ReviewQueuePayment = {
  amount: number
  chapter: string
  currency: string
  id: number
  owner: string
  proofUrl?: string
  rejectionReason?: string
  status: 'approved' | 'failed' | 'pending'
  submittedAt: string
  target: string
  transactionId?: string
  type: 'event' | 'membership'
}

export const PaymentReviewList = ({ payments }: { payments: ReviewQueuePayment[] }) => {
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [workingID, setWorkingID] = useState<number | null>(null)
  const [completed, setCompleted] = useState<number[]>([])

  const review = async (event: FormEvent<HTMLFormElement>, paymentID: number) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    setWorkingID(paymentID)
    setMessage('')
    const response = await fetch(`/api/payments/${paymentID}/review`, {
      body: JSON.stringify({ decision: submitter?.value, reason: form.get('reason') }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message || 'The payment review could not be saved.')
    setSuccess(response.ok)
    setWorkingID(null)
    if (response.ok) setCompleted((items) => [...items, paymentID])
  }

  if (!payments.length) return <p className="empty-inline">No payments match this review filter.</p>

  return (
    <div>
      <FormMessage message={message} success={success} />
      <div className="review-list">
        {payments.map((payment) =>
          completed.includes(payment.id) ? null : (
            <article className="surface-card" key={payment.id}>
              <div className="payment-review-heading">
                <div>
                  <p className="eyebrow">
                    {payment.type} payment #{payment.id}
                  </p>
                  <h2>{payment.target}</h2>
                </div>
                <Badge
                  tone={
                    payment.status === 'approved'
                      ? 'green'
                      : payment.status === 'failed'
                        ? 'red'
                        : 'gold'
                  }
                >
                  {payment.status}
                </Badge>
              </div>
              <dl className="payment-review-details">
                <div>
                  <dt>Payer</dt>
                  <dd>{payment.owner}</dd>
                </div>
                <div>
                  <dt>Chapter</dt>
                  <dd>{payment.chapter}</dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd>{formatCurrency(payment.amount, payment.currency)}</dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{new Date(payment.submittedAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Transaction ID</dt>
                  <dd>{payment.transactionId || 'Not provided'}</dd>
                </div>
                <div>
                  <dt>Uploaded proof</dt>
                  <dd>
                    {payment.proofUrl ? (
                      <a href={payment.proofUrl} rel="noreferrer" target="_blank">
                        Open private proof in a new tab
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </dd>
                </div>
              </dl>
              {payment.rejectionReason ? <p>Rejection reason: {payment.rejectionReason}</p> : null}
              {payment.status === 'pending' ? (
                <form onSubmit={(event) => review(event, payment.id)}>
                  <label>
                    Rejection reason <span>(required only when rejecting)</span>
                    <textarea maxLength={2000} name="reason" rows={4} />
                  </label>
                  <div className="review-list__actions">
                    <button
                      className="button button--primary"
                      disabled={workingID === payment.id}
                      name="decision"
                      type="submit"
                      value="approve"
                    >
                      Approve payment
                    </button>
                    <button
                      className="button button--secondary"
                      disabled={workingID === payment.id}
                      name="decision"
                      type="submit"
                      value="reject"
                    >
                      Reject payment
                    </button>
                  </div>
                </form>
              ) : null}
            </article>
          ),
        )}
      </div>
    </div>
  )
}
