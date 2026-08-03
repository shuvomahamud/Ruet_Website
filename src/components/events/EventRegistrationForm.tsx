'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, Fragment, useState } from 'react'

import { FormMessage } from '@/components/auth/FormMessage'
import type {
  EventPriceTier,
  EventRegistrationIntent,
  EventQuote,
} from '@/services/event-registration'
import { formatCurrency } from '@/utilities/formatters'

type Props = {
  eventSlug: string
  eventTitle: string
  fixedQuantity?: number
  initialQuote: EventQuote
  intent: EventRegistrationIntent
  isPaid: boolean
  manualReviewNote: string
  maxQuantity: number
  paymentTerms: string
  priceTiers: EventPriceTier[]
  zelleInstructions: string
  zelleRecipient?: string | null
  zelleRecipientName?: string | null
}

export const EventRegistrationForm = ({
  eventSlug,
  eventTitle,
  fixedQuantity,
  initialQuote,
  intent,
  isPaid,
  manualReviewNote,
  maxQuantity,
  paymentTerms,
  priceTiers,
  zelleInstructions,
  zelleRecipient,
  zelleRecipientName,
}: Props) => {
  const router = useRouter()
  const [quantity, setQuantity] = useState(fixedQuantity ?? initialQuote.quantity)
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialQuote.lineItems.map((item) => [item.tierID, item.quantity])),
  )
  const [quote, setQuote] = useState(initialQuote)
  const [promotionCode, setPromotionCode] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkingCode, setCheckingCode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const usesPayment = isPaid && intent !== 'waitlist'
  const permitsPromotion = usesPayment && intent !== 'resubmit'

  const selectedTickets = (quantities = ticketQuantities) =>
    priceTiers
      .map((tier) => ({ quantity: quantities[tier.id] ?? 0, tierID: tier.id }))
      .filter((selection) => selection.quantity > 0)

  const refreshQuote = async (nextQuantity = quantity, nextTicketQuantities = ticketQuantities) => {
    setCheckingCode(true)
    setMessage('')
    const response = await fetch(`/api/events/${eventSlug}/quote`, {
      body: JSON.stringify({
        promotionCode,
        quantity: nextQuantity,
        ticketSelections: priceTiers.length ? selectedTickets(nextTicketQuantities) : undefined,
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string; quote?: EventQuote }
    if (response.ok && result.quote) {
      setQuote(result.quote)
      setSuccess(true)
      setMessage(
        result.quote.discountTotal > 0
          ? `Promotion applied. The verified total is ${formatCurrency(result.quote.total, result.quote.currency)}.`
          : 'The standard event price applies.',
      )
    } else {
      setSuccess(false)
      setMessage(result.message || 'The event price could not be checked.')
    }
    setCheckingCode(false)
  }

  const changeQuantity = async (nextQuantity: number) => {
    setQuantity(nextQuantity)
    if (usesPayment && intent !== 'resubmit') await refreshQuote(nextQuantity)
    else setQuote((current) => ({ ...current, quantity: nextQuantity }))
  }

  const changeTicketQuantity = async (tierID: string, nextQuantity: number) => {
    const nextTicketQuantities = { ...ticketQuantities, [tierID]: nextQuantity }
    const nextTotal = selectedTickets(nextTicketQuantities).reduce(
      (total, selection) => total + selection.quantity,
      0,
    )
    setTicketQuantities(nextTicketQuantities)
    setQuantity(nextTotal)
    if (nextTotal > 0 && nextTotal <= maxQuantity && usesPayment) {
      await refreshQuote(nextTotal, nextTicketQuantities)
    } else {
      setQuote((current) => ({ ...current, quantity: nextTotal }))
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    if (usesPayment) {
      const proof = form.get('proof')
      const hasProof = proof instanceof File && proof.size > 0
      const hasTransactionID = Boolean(String(form.get('transactionId') || '').trim())
      if (!hasProof && !hasTransactionID) {
        setSuccess(false)
        setMessage('Provide a Zelle transaction ID, payment proof, or both.')
        return
      }
    }
    form.set('intent', intent)
    form.set('quantity', String(quantity))
    if (priceTiers.length && intent !== 'resubmit') {
      form.set('ticketSelections', JSON.stringify(selectedTickets()))
    }
    if (permitsPromotion) form.set('promotionCode', promotionCode)
    setSubmitting(true)
    setMessage('')
    const response = await fetch(`/api/events/${eventSlug}/registration`, {
      body: form,
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setSuccess(response.ok)
    setMessage(result.message || 'The event registration could not be submitted.')
    setSubmitting(false)
    if (response.ok) {
      formElement.reset()
      router.refresh()
    }
  }

  const heading =
    intent === 'waitlist'
      ? 'Join the waitlist'
      : intent === 'accept_offer'
        ? 'Accept your seat offer'
        : intent === 'resubmit'
          ? 'Resubmit Zelle details'
          : 'Register for this event'

  return (
    <form className="auth-form event-registration-form" onSubmit={submit}>
      <div>
        <p className="eyebrow">{usesPayment ? 'Zelle registration' : 'Event registration'}</p>
        <h2>{heading}</h2>
        <p>{eventTitle}</p>
      </div>
      <FormMessage message={message} success={success} />
      {fixedQuantity ? (
        <p>
          This offer reserves <strong>{fixedQuantity}</strong> attendee
          {fixedQuantity === 1 ? '' : 's'}.
        </p>
      ) : priceTiers.length && intent !== 'resubmit' ? (
        <fieldset className="form-fieldset">
          <legend>Tickets</legend>
          {priceTiers.map((tier) => (
            <label key={tier.id}>
              {tier.label} — {formatCurrency(tier.price, quote.currency)}
              {tier.description ? <span className="form-help">{tier.description}</span> : null}
              <select
                aria-label={`${tier.label} quantity`}
                onChange={(event) => void changeTicketQuantity(tier.id, Number(event.target.value))}
                value={ticketQuantities[tier.id] ?? 0}
              >
                {Array.from({ length: maxQuantity + 1 }, (_, index) => index).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <p className="form-help">
            {quantity} of {maxQuantity} ticket{maxQuantity === 1 ? '' : 's'} selected.
          </p>
        </fieldset>
      ) : intent !== 'resubmit' ? (
        <label>
          Number of attendees
          <select
            name="quantity"
            onChange={(event) => void changeQuantity(Number(event.target.value))}
            value={quantity}
          >
            {Array.from({ length: maxQuantity }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {usesPayment ? (
        <>
          <aside className="event-zelle-instructions">
            <dl>
              <div>
                <dt>Zelle recipient</dt>
                <dd>{zelleRecipientName || 'RUETIAN USA'}</dd>
              </div>
              <div>
                <dt>Email or phone</dt>
                <dd>{zelleRecipient || 'Not configured yet'}</dd>
              </div>
              <div>
                <dt>Exact amount</dt>
                <dd>{formatCurrency(quote.total, quote.currency)}</dd>
              </div>
            </dl>
            <p>{zelleInstructions}</p>
            <p className="form-help">{manualReviewNote}</p>
          </aside>
          {permitsPromotion ? (
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
                onClick={() => void refreshQuote()}
                type="button"
              >
                {checkingCode ? 'Checking…' : 'Apply code'}
              </button>
            </div>
          ) : null}
          <div aria-live="polite" className="membership-total">
            {quote.lineItems.length > 1
              ? quote.lineItems.map((item) => (
                  <Fragment key={item.tierID}>
                    <span>
                      {item.label} × {item.quantity}
                    </span>
                    <strong>{formatCurrency(item.subtotal, quote.currency)}</strong>
                  </Fragment>
                ))
              : null}
            <span>Ticket subtotal</span>
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
            <input
              accept="image/jpeg,image/png,image/webp,application/pdf"
              name="proof"
              type="file"
            />
          </label>
          <p className="form-help">JPG, PNG, WebP, or PDF; maximum 4 MB.</p>
          <p className="membership-terms-note">{paymentTerms}</p>
          <label className="check-field">
            <input name="paymentTermsAccepted" required type="checkbox" />
            <span>
              I agree to the{' '}
              <Link href="/terms-of-use#payments-and-events">
                Zelle payment and no-refund terms
              </Link>
              .
            </span>
          </label>
        </>
      ) : intent === 'waitlist' ? (
        <p className="form-help">
          Joining the waitlist does not create a charge. If a fitting offer becomes available, you
          will receive an email with its expiration time.
        </p>
      ) : null}

      <button
        className="button button--primary"
        disabled={
          submitting || quantity < 1 || quantity > maxQuantity || (usesPayment && !zelleRecipient)
        }
        type="submit"
      >
        {submitting
          ? 'Submitting…'
          : intent === 'waitlist'
            ? 'Join waitlist'
            : usesPayment
              ? 'Submit registration for review'
              : 'Confirm free registration'}
      </button>
      {usesPayment && !zelleRecipient ? (
        <FormMessage message="Paid registration is paused until an administrator configures the Zelle recipient." />
      ) : null}
      {success ? (
        <Link className="surface-card__link" href="/events/registrations">
          View registration history
        </Link>
      ) : null}
    </form>
  )
}
