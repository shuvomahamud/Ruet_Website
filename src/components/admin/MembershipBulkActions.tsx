'use client'

import { useAuth, useSelection } from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'

type Eligibility = { eligible: boolean; id: number; reason?: string }

export const MembershipBulkActions = () => {
  const { user } = useAuth()
  const { selectedIDs, selectAll, toggleAll } = useSelection()
  const authorized = ['admin', 'superAdmin'].includes((user as { role?: string } | null)?.role ?? '')
  const ids = useMemo(() => selectedIDs.map(Number).filter(Number.isSafeInteger), [selectedIDs])
  const selectionKey = ids.join(',')
  const [selectionResult, setSelectionResult] = useState<{ key: string; value: Eligibility[] } | null>(null)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!authorized || !ids.length) return
    const key = ids.join(',')
    const controller = new AbortController()
    fetch('/api/admin/memberships/selection', {
      body: JSON.stringify({ ids }), credentials: 'include', headers: { 'content-type': 'application/json' }, method: 'POST', signal: controller.signal,
    }).then(async (response) => {
      if (response.status === 403) throw new Error('Administrator access is required for these actions.')
      const body = await response.json()
      if (!response.ok) throw new Error(body.message ?? 'Selection could not be checked.')
      return body.cancellation as Eligibility[]
    }).then((value) => {
      if (value) {
        setSelectionResult({ key, value })
        setReason('')
      }
    }).catch((error) => {
      if (error.name !== 'AbortError') setMessage(error.message)
    })
    return () => controller.abort()
  }, [authorized, ids])

  const eligibility = selectionResult?.key === selectionKey ? selectionResult.value : null

  if (!authorized) return null
  if (!ids.length) {
    if (selectAll === 'allAvailable') return <div className="admin-bulk-actions">Select rows on the current page to use workflow actions.</div>
    return null
  }
  if (!eligibility && !message) return <div className="admin-bulk-actions">Checking {ids.length} selected membership(s)…</div>
  if (!eligibility) return message ? <div className="admin-bulk-actions admin-bulk-actions--error">{message}</div> : null
  const allEligible = eligibility.every((item) => item.eligible)
  const blockedReason = eligibility.find((item) => !item.eligible)?.reason

  const cancel = async () => {
    if (!reason.trim() || !window.confirm('Cancel the selected memberships? No refund will be issued automatically.')) return
    setBusy(true); setMessage('')
    const response = await fetch('/api/admin/memberships/bulk-cancel', {
      body: JSON.stringify({ membershipIDs: ids, reason }), credentials: 'include',
      headers: { 'content-type': 'application/json' }, method: 'POST',
    })
    const body = await response.json()
    setMessage(body.message ?? 'Action completed.')
    setBusy(false)
    if (response.ok) {
      toggleAll(false)
      window.setTimeout(() => window.location.reload(), 600)
    }
  }

  return (
    <div className="admin-bulk-actions admin-bulk-actions--stacked">
      <strong>{ids.length} membership(s) selected.</strong>
      {allEligible ? (
        <>
          <textarea maxLength={2000} onChange={(event) => setReason(event.target.value)} placeholder="Required cancellation reason" rows={2} value={reason} />
          <button disabled={busy || !reason.trim()} onClick={cancel} type="button">Cancel memberships</button>
          <span>No refund is issued by this action; financial history is preserved.</span>
        </>
      ) : <span>{blockedReason} The action appears only when every selected membership is eligible.</span>}
      {message ? <span>{message}</span> : null}
    </div>
  )
}
