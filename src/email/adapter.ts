import { randomUUID } from 'node:crypto'

import type { Payload, PayloadEmailAdapter, SendEmailOptions } from 'payload'

import { env } from '@/utilities/env'

export type EmailTransport = 'capture' | 'resend'

export type EmailSendResult = {
  id: string
  transport: EmailTransport
}

export type CapturedEmail = EmailSendResult & {
  from: string
  html?: string
  idempotencyKey?: string
  sentAt: string
  subject: string
  text?: string
  to: string[]
}

type AdapterOptions = {
  apiKey?: string
  fetcher?: typeof fetch
  fromAddress?: string
  fromName?: string
  transport?: EmailTransport
}

const captureKey = Symbol.for('ruetianusa.email.capture')
const captureStore = globalThis as typeof globalThis & {
  [captureKey]?: CapturedEmail[]
}

const captures = () => {
  captureStore[captureKey] ??= []
  return captureStore[captureKey]
}

export const clearCapturedEmails = () => {
  captures().splice(0)
}

export const getCapturedEmails = (): CapturedEmail[] => captures().map((email) => ({ ...email }))

const stringifyAddress = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'address' in value) {
    const address = String(value.address)
    const name = 'name' in value && value.name ? String(value.name) : ''
    return name ? `${name} <${address}>` : address
  }
  throw new Error('Email address format is not supported.')
}

const addressList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(stringifyAddress)
  if (value === undefined || value === null) return []
  return [stringifyAddress(value)]
}

const messageString = (value: unknown, field: string): string | undefined => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') throw new Error(`${field} must be a string.`)
  return value
}

const headerEntries = (headers: SendEmailOptions['headers']): Array<[string, string]> => {
  if (!headers || Array.isArray(headers)) return []
  return Object.entries(headers).flatMap(([name, value]) => {
    if (value === undefined || value === null) return []
    if (typeof value === 'string') return [[name, value]]
    if (typeof value === 'number') return [[name, String(value)]]
    return []
  })
}

const prepareMessage = (
  message: SendEmailOptions,
  defaults: { fromAddress: string; fromName: string },
) => {
  if (message.attachments?.length) {
    throw new Error('Email attachments are not enabled for this application.')
  }
  const to = addressList(message.to)
  if (!to.length) throw new Error('At least one email recipient is required.')
  if (!message.subject) throw new Error('An email subject is required.')

  const entries = headerEntries(message.headers)
  const idempotencyEntry = entries.find(
    ([name]) => name.toLowerCase() === 'x-ruetian-idempotency-key',
  )
  const emailHeaders = Object.fromEntries(
    entries.filter(([name]) => name.toLowerCase() !== 'x-ruetian-idempotency-key'),
  )

  return {
    bcc: addressList(message.bcc),
    cc: addressList(message.cc),
    emailHeaders,
    from: message.from
      ? stringifyAddress(message.from)
      : `${defaults.fromName} <${defaults.fromAddress}>`,
    html: messageString(message.html, 'Email HTML'),
    idempotencyKey: idempotencyEntry?.[1],
    replyTo: addressList(message.replyTo),
    subject: String(message.subject),
    text: messageString(message.text, 'Email text'),
    to,
  }
}

const parseProviderError = async (response: Response) => {
  const body = (await response.text()).slice(0, 500)
  return `Resend rejected the email with status ${response.status}${body ? `: ${body}` : '.'}`
}

export const createEmailAdapter =
  (options: AdapterOptions = {}): PayloadEmailAdapter<EmailSendResult> =>
  ({ payload }: { payload: Payload }) => {
    const transport = options.transport ?? env.EMAIL_TRANSPORT
    const fromAddress = options.fromAddress ?? env.EMAIL_FROM_ADDRESS ?? 'no-reply@ruetianusa.org'
    const fromName = options.fromName ?? env.EMAIL_FROM_NAME
    const apiKey = options.apiKey ?? env.RESEND_API_KEY
    const fetcher = options.fetcher ?? fetch

    return {
      defaultFromAddress: fromAddress,
      defaultFromName: fromName,
      name: `ruetian-${transport}`,
      sendEmail: async (message) => {
        const prepared = prepareMessage(message, { fromAddress, fromName })

        if (transport === 'capture') {
          if (env.NODE_ENV === 'production') {
            throw new Error('Production email capture is disabled. Configure the Resend transport.')
          }
          const existing = prepared.idempotencyKey
            ? captures().find((email) => email.idempotencyKey === prepared.idempotencyKey)
            : undefined
          if (existing) return { id: existing.id, transport }

          const captured: CapturedEmail = {
            from: prepared.from,
            html: prepared.html,
            id: `capture-${randomUUID()}`,
            idempotencyKey: prepared.idempotencyKey,
            sentAt: new Date().toISOString(),
            subject: prepared.subject,
            text: prepared.text,
            to: prepared.to,
            transport,
          }
          captures().push(captured)
          payload.logger.info({
            msg: `Captured email to ${prepared.to.length} recipient(s): ${prepared.subject}`,
          })
          return { id: captured.id, transport }
        }

        if (!apiKey) throw new Error('RESEND_API_KEY is required for the Resend transport.')
        const response = await fetcher('https://api.resend.com/emails', {
          body: JSON.stringify({
            bcc: prepared.bcc.length ? prepared.bcc : undefined,
            cc: prepared.cc.length ? prepared.cc : undefined,
            from: prepared.from,
            headers: Object.keys(prepared.emailHeaders).length ? prepared.emailHeaders : undefined,
            html: prepared.html,
            reply_to: prepared.replyTo.length ? prepared.replyTo : undefined,
            subject: prepared.subject,
            text: prepared.text,
            to: prepared.to,
          }),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...(prepared.idempotencyKey
              ? { 'Idempotency-Key': prepared.idempotencyKey.slice(0, 256) }
              : {}),
            'User-Agent': 'RUETIAN-USA-Website/1.0',
          },
          method: 'POST',
        })
        if (!response.ok) throw new Error(await parseProviderError(response))
        const result = (await response.json()) as { id?: string }
        if (!result.id) throw new Error('Resend returned no email identifier.')
        return { id: result.id, transport }
      },
    }
  }
