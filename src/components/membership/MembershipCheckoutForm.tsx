'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

import { FormMessage } from '@/components/auth/FormMessage'
import { formatCurrency } from '@/utilities/formatters'

type Quote = {
  currency: string
  discountTotal: number
  planTitle: string
  subtotal: number
  total: number
}

type Props = {
  initialQuote: Quote
  intent: 'join' | 'renewal' | 'reactivation' | 'resubmit'
  manualReviewNote: string
  noRefundNotice: string
  zelleInstructions: string
  zelleRecipient?: string | null
  zelleRecipientName?: string | null
}

export const MembershipCheckoutForm = ({
  initialQuote,
  intent,
  manualReviewNote,
  noRefundNotice,
  zelleInstructions,
  zelleRecipient,
  zelleRecipientName,
}: Props) => {
  const [quote, setQuote] = useState(initialQuote)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkingCode, setCheckingCode] = useState(false)
  const [promotionCode, setPromotionCode] = useState('')

  const applyPromotion = async () => {
    setCheckingCode(true)
    setMessage('')
    const response = await fetch('/api/membership/quote', {
      body: JSON.stringify({ promotionCode }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string; quote?: Quote }
    if (response.ok && result.quote) {
      setQuote(result.quote)
      setSuccess(true)
      setMessage(
        result.quote.discountTotal > 0
          ? `Promotion applied. Your verified total is ${formatCurrency(result.quote.total, result.quote.currency)}.`
          : 'The standard membership price applies.',
      )
    } else {
      setSuccess(false)
      setMessage(result.message || 'The promotion code could not be checked.')
    }
    setCheckingCode(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const proof = form.get('proof')
    const hasProof = proof instanceof File && proof.size > 0
    const hasTransactionID = Boolean(String(form.get('transactionId') || '').trim())
    if (!hasProof && !hasTransactionID) {
      setSuccess(false)
      setMessage('Provide a Zelle transaction ID, payment proof, or both.')
      return
    }

    form.set('intent', intent)
    if (intent !== 'resubmit') form.set('promotionCode', promotionCode)
    setSubmitting(true)
    setMessage('')
    const response = await fetch('/api/membership/checkout', { body: form, method: 'POST' })
    const result = (await response.json()) as { message?: string }
    setSuccess(response.ok)
    setMessage(result.message || 'The membership payment could not be submitted.')
    setSubmitting(false)
    if (response.ok) formElement.reset()
  }

  return (
    <div className="membership-checkout">
      <aside className="surface-card membership-payment-instructions">
        <p className="eyebrow">Zelle only</p>
        <h2>Send the exact total</h2>
        <dl>
          <div>
            <dt>Recipient</dt>
            <dd>{zelleRecipientName || 'RUETIAN USA'}</dd>
          </div>
          <div>
            <dt>Zelle email or phone</dt>
            <dd>{zelleRecipient || 'Not configured yet'}</dd>
          </div>
          <div>
            <dt>Amount</dt>
            <dd>{formatCurrency(quote.total, quote.currency)}</dd>
          </div>
        </dl>
        <p>{zelleInstructions}</p>
        <p className="form-help">{manualReviewNote}</p>
      </aside>

      <form className="auth-form surface-card" onSubmit={submit}>
        <div>
          <p className="eyebrow">Payment evidence</p>
          <h2>{intent === 'resubmit' ? 'Resubmit Zelle details' : quote.planTitle}</h2>
        </div>
        <FormMessage message={message} success={success} />
        {intent !== 'resubmit' ? (
          <div className="promotion-field">
            <label>
              Promotion code <span>(optional; one per order)</span>
              <input
                autoComplete="off"
                maxLength={80}
                onChange={(event) => setPromotionCode(event.target.value.toUpperCase())}
                value={promotionCode}
              />
            </label>
            <button
              className="button button--secondary"
              disabled={checkingCode || submitting}
              onClick={applyPromotion}
              type="button"
            >
              {checkingCode ? 'Checking…' : 'Apply code'}
            </button>
          </div>
        ) : null}
        <div className="membership-total" aria-live="polite">
          <span>Annual price</span>
          <strong>{formatCurrency(quote.subtotal, quote.currency)}</strong>
          {quote.discountTotal > 0 ? (
            <>
              <span>Promotion discount</span>
              <strong>−{formatCurrency(quote.discountTotal, quote.currency)}</strong>
            </>
          ) : null}
          <span>Amount sent by Zelle</span>
          <strong>{formatCurrency(quote.total, quote.currency)}</strong>
        </div>
        <label>
          Zelle transaction ID <span>(optional if proof is attached)</span>
          <input autoComplete="off" maxLength={160} name="transactionId" />
        </label>
        <label>
          Screenshot or PDF proof <span>(optional if transaction ID is provided)</span>
          <input accept="image/jpeg,image/png,image/webp,application/pdf" name="proof" type="file" />
        </label>
        <p className="form-help">JPG, PNG, WebP, or PDF; maximum 8 MB.</p>
        <p className="membership-terms-note">
          {noRefundNotice} This form records a manual payment attempt. It does not debit your
          account and does not activate membership before approval. See the{' '}
          <Link href="/membership-terms">membership terms</Link>.
        </p>
        <button
          className="button button--primary"
          disabled={submitting || !zelleRecipient}
          type="submit"
        >
          {submitting ? 'Submitting…' : 'Submit for manual review'}
        </button>
        {!zelleRecipient ? (
          <FormMessage message="Checkout is paused until an administrator configures the final Zelle recipient." />
        ) : null}
        {success ? (
          <Link className="surface-card__link" href="/membership/status">
            View membership status
          </Link>
        ) : null}
      </form>
    </div>
  )
}
