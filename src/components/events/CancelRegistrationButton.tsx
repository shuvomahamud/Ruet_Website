'use client'

import { useState } from 'react'

export const CancelRegistrationButton = ({ registrationID }: { registrationID: number }) => {
  const [message, setMessage] = useState('')
  const [working, setWorking] = useState(false)
  const [done, setDone] = useState(false)

  const cancel = async () => {
    if (!window.confirm('Cancel this registration and release its reserved seats?')) return
    setWorking(true)
    setMessage('')
    const response = await fetch(`/api/events/registrations/${registrationID}/cancel`, {
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message || 'The registration could not be cancelled.')
    setDone(response.ok)
    setWorking(false)
  }

  return (
    <div className="registration-cancel-action">
      <button
        className="button button--secondary"
        disabled={working || done}
        onClick={() => void cancel()}
        type="button"
      >
        {working ? 'Cancelling…' : done ? 'Cancelled' : 'Cancel registration'}
      </button>
      {message ? <p aria-live="polite">{message}</p> : null}
    </div>
  )
}
