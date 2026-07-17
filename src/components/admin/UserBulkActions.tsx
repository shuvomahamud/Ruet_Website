'use client'

import { useAuth, useSelection } from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'

type Eligibility = { eligible: boolean; id: number; reason?: string }
type SelectionResult = { approval: Eligibility[]; paidMembership: Eligibility[] }
type KeyedResult = { key: string; value: SelectionResult }

export const UserBulkActions = () => {
  const { user } = useAuth()
  const { selectedIDs, selectAll, toggleAll } = useSelection()
  const authorized = ['admin', 'superAdmin'].includes((user as { role?: string } | null)?.role ?? '')
  const ids = useMemo(() => selectedIDs.map(Number).filter(Number.isSafeInteger), [selectedIDs])
  const selectionKey = ids.join(',')
  const [selectionResult, setSelectionResult] = useState<KeyedResult | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!authorized || !ids.length) return
    const key = ids.join(',')
    const controller = new AbortController()
    fetch('/api/admin/users/selection', {
      body: JSON.stringify({ ids }), credentials: 'include', headers: { 'content-type': 'application/json' },
      method: 'POST', signal: controller.signal,
    }).then(async (response) => {
      if (response.status === 403) throw new Error('Administrator access is required for these actions.')
      const body = await response.json()
      if (!response.ok) throw new Error(body.message ?? 'Selection could not be checked.')
      return body as SelectionResult
    }).then((value) => {
      if (value) setSelectionResult({ key, value })
    }).catch((error) => {
      if (error.name !== 'AbortError') setMessage(error.message)
    })
    return () => controller.abort()
  }, [authorized, ids])

  const result = selectionResult?.key === selectionKey ? selectionResult.value : null

  if (!authorized) return null
  if (!ids.length) {
    if (selectAll === 'allAvailable') return <div className="admin-bulk-actions">Select rows on the current page to use workflow actions.</div>
    return null
  }
  if (!result && !message) return <div className="admin-bulk-actions">Checking {ids.length} selected user(s)…</div>
  if (!result) return message ? <div className="admin-bulk-actions admin-bulk-actions--error">{message}</div> : null

  const allApproval = result.approval.every((item) => item.eligible)
  const allPaid = result.paidMembership.every((item) => item.eligible)
  const explain = !allApproval && !allPaid
    ? [...result.approval, ...result.paidMembership].find((item) => !item.eligible)?.reason
    : undefined

  const run = async (kind: 'approve' | 'paid') => {
    const label = kind === 'approve' ? 'approve these accounts' : 'add paid membership to these users'
    if (!window.confirm(`Confirm you want to ${label}?`)) return
    setBusy(true); setMessage('')
    const response = await fetch(kind === 'approve' ? '/api/admin/users/approve' : '/api/admin/memberships/bulk-add', {
      body: JSON.stringify(kind === 'approve' ? { ids } : { userIDs: ids }), credentials: 'include',
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
    <div className="admin-bulk-actions">
      <strong>{ids.length} user(s) selected.</strong>
      {allApproval ? <button disabled={busy} onClick={() => run('approve')} type="button">Approve accounts</button> : null}
      {allPaid ? <button disabled={busy} onClick={() => run('paid')} type="button">Add paid membership</button> : null}
      {explain ? <span>{explain} Actions appear only when every selected user is eligible.</span> : null}
      {message ? <span>{message}</span> : null}
    </div>
  )
}
