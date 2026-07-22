'use client'

import { useAuth } from '@payloadcms/ui'
import { ChangeEvent, useState } from 'react'

type ImportError = { code: string; field?: string; message: string }
type ImportRow = {
  email?: string
  errors: ImportError[]
  original: Record<string, string>
  row: number
  status: 'invalid' | 'ready'
  userID?: number
}
type Validation = {
  fileErrors: ImportError[]
  importedCount?: number
  invalidCount: number
  message?: string
  readyCount: number
  rows: ImportRow[]
  skippedCount?: number
  totalRows: number
  warnings: string[]
}

const csvCell = (value: unknown) => {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

const downloadFailureReport = (rows: ImportRow[]) => {
  const failed = rows.filter((row) => row.status === 'invalid')
  if (!failed.length) return
  const originalHeaders = Array.from(new Set(failed.flatMap((row) => Object.keys(row.original))))
  const headers = [...originalHeaders, 'import_status', 'error_fields', 'error_messages']
  const lines = [
    headers.map(csvCell).join(','),
    ...failed.map((row) =>
      [
        ...originalHeaders.map((header) => row.original[header] ?? ''),
        'not_imported',
        row.errors
          .map((error) => error.field ?? '')
          .filter(Boolean)
          .join(';'),
        row.errors.map((error) => error.message).join('; '),
      ]
        .map(csvCell)
        .join(','),
    ),
  ]
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${lines.join('\r\n')}\r\n`], { type: 'text/csv;charset=utf-8' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'ruetian-usa-user-import-failures.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

export const UserBulkImport = () => {
  const { user } = useAuth()
  const authorized = ['admin', 'superAdmin'].includes(
    (user as { role?: string } | null)?.role ?? '',
  )
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Validation | null>(null)
  const [busy, setBusy] = useState<'import' | 'validate' | null>(null)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)

  if (!authorized) return null

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null)
    setResult(null)
    setMessage('')
    setMessageIsError(false)
  }

  const send = async (kind: 'import' | 'validate') => {
    if (!file) return
    setBusy(kind)
    setMessage('')
    setMessageIsError(false)
    const data = new FormData()
    data.append('file', file)
    try {
      const response = await fetch(
        kind === 'validate' ? '/api/admin/users/import/validate' : '/api/admin/users/import',
        { body: data, credentials: 'include', method: 'POST' },
      )
      const body = (await response.json()) as Validation
      if (!response.ok) throw new Error(body.message ?? 'The CSV could not be processed.')
      setResult(body)
      if (kind === 'import') {
        setMessage(body.message ?? `${body.importedCount ?? 0} user(s) imported.`)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The CSV could not be processed.')
      setMessageIsError(true)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="admin-user-import">
      <div className="admin-user-import__heading">
        <div>
          <strong>Import multiple users</strong>
          <span>Upload a CSV, review row-level validation, then import only valid users.</span>
        </div>
        <button onClick={() => setOpen((value) => !value)} type="button">
          {open ? 'Close importer' : 'Import users'}
        </button>
      </div>

      {open ? (
        <div className="admin-user-import__body">
          <p>
            Required: email, first name, last name, roll number, RUET department, active chapter
            slug, city, state, and country. Invalid or duplicate rows are skipped without blocking
            other users. Replace or remove the example row in the downloaded template.
          </p>
          <div className="admin-user-import__controls">
            <button
              className="admin-user-import__download"
              onClick={() => window.location.assign('/api/admin/users/import/sample')}
              type="button"
            >
              Download sample CSV
            </button>
            <label>
              <span>Choose CSV file</span>
              <input accept=".csv,text/csv" onChange={chooseFile} type="file" />
            </label>
            <button
              disabled={!file || Boolean(busy)}
              onClick={() => send('validate')}
              type="button"
            >
              {busy === 'validate' ? 'Validating…' : 'Validate CSV'}
            </button>
          </div>

          {result ? (
            <div className="admin-user-import__results">
              {result.fileErrors.length ? (
                <div className="admin-user-import__errors">
                  {result.fileErrors.map((error) => (
                    <p key={`${error.code}-${error.field}`}>{error.message}</p>
                  ))}
                </div>
              ) : (
                <>
                  <div className="admin-user-import__summary">
                    <strong>
                      {result.importedCount === undefined
                        ? `${result.readyCount} ready`
                        : `${result.importedCount} imported`}
                    </strong>
                    <span>{result.invalidCount} invalid</span>
                    <span>{result.totalRows} total rows</span>
                  </div>
                  {result.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                  <div className="admin-user-import__table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Problems</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.slice(0, 100).map((row) => (
                          <tr key={row.row}>
                            <td>{row.row}</td>
                            <td>{row.email || '—'}</td>
                            <td>
                              {row.userID
                                ? 'Imported'
                                : row.status === 'ready'
                                  ? 'Ready'
                                  : 'Not imported'}
                            </td>
                            <td>{row.errors.map((error) => error.message).join(' ') || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.rows.length > 100 ? <p>Showing the first 100 rows.</p> : null}
                  <div className="admin-user-import__actions">
                    {result.importedCount === undefined ? (
                      <button
                        disabled={!result.readyCount || Boolean(busy)}
                        onClick={() => send('import')}
                        type="button"
                      >
                        {busy === 'import'
                          ? 'Importing…'
                          : `Import ${result.readyCount} valid user(s)`}
                      </button>
                    ) : null}
                    {result.invalidCount ? (
                      <button onClick={() => downloadFailureReport(result.rows)} type="button">
                        Download failed rows
                      </button>
                    ) : null}
                    {result.importedCount ? (
                      <button onClick={() => window.location.reload()} type="button">
                        Refresh user list
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          ) : null}
          {message ? (
            <p
              className={`admin-user-import__message${messageIsError ? ' admin-user-import__message--error' : ''}`}
              role="status"
            >
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
