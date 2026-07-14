import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '@/payload.config'
import { clearCapturedEmails, createEmailAdapter, getCapturedEmails } from '@/email/adapter'
import { executeEmailDelivery, queueEmail, shouldDeliverEmail } from '@/email/delivery'
import { renderEmailTemplate } from '@/email/templates'
import type { EmailDelivery, PayloadJob, User } from '@/payload-types'

describe('email delivery and background-job foundation', () => {
  let payload: Payload
  let user: User
  const deliveries: EmailDelivery[] = []
  const jobs: PayloadJob[] = []
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  beforeAll(async () => {
    payload = await getPayload({ config })
    user = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        communicationPreferences: {
          allowAnnouncements: false,
          allowNewsletters: false,
          allowSystemEmails: false,
        },
        email: `email-jobs-${nonce}@example.test`,
        _verified: true,
        password: 'EmailJobsPassword123!',
        role: 'member',
        termsAcceptedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
  })

  beforeEach(() => clearCapturedEmails())

  afterAll(async () => {
    for (const job of jobs) {
      await payload.delete({ collection: 'payload-jobs', id: job.id, overrideAccess: true })
    }
    for (const delivery of deliveries) {
      await payload.delete({ collection: 'emailDeliveries', id: delivery.id, overrideAccess: true })
    }
    await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
  })

  const rememberDelivery = (delivery: EmailDelivery) => {
    deliveries.push(delivery)
    return delivery
  }

  const rememberJob = async (delivery: EmailDelivery) => {
    if (!delivery.jobId) return
    const job = await payload.findByID({
      collection: 'payload-jobs',
      id: Number(delivery.jobId),
      overrideAccess: true,
    })
    jobs.push(job)
  }

  it('renders responsive typed templates and escapes untrusted content', () => {
    const rendered = renderEmailTemplate('systemNotice', {
      action: { label: 'Review safely', url: 'https://example.test/account' },
      message: '<script>not markup</script> Keep your account current.',
      subject: 'Account notice',
      title: 'A <safe> title',
    })

    expect(rendered.html).toContain('name="viewport"')
    expect(rendered.html).toContain('@media only screen and (max-width: 620px)')
    expect(rendered.html).toContain('A &lt;safe&gt; title')
    expect(rendered.html).not.toContain('<script>not markup</script>')
    expect(rendered.text).toContain('Keep your account current.')
  })

  it('captures local email without duplication and exercises the Resend request contract', async () => {
    const capture = createEmailAdapter({ transport: 'capture' })({ payload })
    const first = await capture.sendEmail({
      headers: { 'X-RUETIAN-Idempotency-Key': `capture-${nonce}` },
      html: '<p>Captured safely.</p>',
      subject: 'Capture test',
      to: user.email,
    })
    const repeated = await capture.sendEmail({
      headers: { 'X-RUETIAN-Idempotency-Key': `capture-${nonce}` },
      html: '<p>Captured safely.</p>',
      subject: 'Capture test',
      to: user.email,
    })
    expect(repeated.id).toBe(first.id)
    expect(getCapturedEmails().filter((email) => email.subject === 'Capture test')).toHaveLength(1)

    const fetcher = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(
        new Response(JSON.stringify({ id: 'resend-provider-id' }), {
          headers: { 'content-type': 'application/json' },
          status: 200,
        }),
      ),
    )
    const resend = createEmailAdapter({
      apiKey: 're_test_secret_value',
      fetcher: fetcher as unknown as typeof fetch,
      fromAddress: 'verified@example.test',
      fromName: 'RUETIAN USA',
      transport: 'resend',
    })({ payload })
    const sent = await resend.sendEmail({
      headers: { 'X-RUETIAN-Idempotency-Key': `resend-${nonce}` },
      html: '<p>Production-like delivery.</p>',
      subject: 'Resend contract',
      to: user.email,
    })

    expect(sent).toEqual({ id: 'resend-provider-id', transport: 'resend' })
    const [url, options] = fetcher.mock.calls[0]!
    expect(url).toBe('https://api.resend.com/emails')
    expect(options?.headers).toMatchObject({
      Authorization: 'Bearer re_test_secret_value',
      'Idempotency-Key': `resend-${nonce}`,
      'User-Agent': 'RUETIAN-USA-Website/1.0',
    })
    expect(options?.body).not.toContain('re_test_secret_value')
  })

  it('suppresses optional categories while required system messages bypass preferences', async () => {
    expect(shouldDeliverEmail({ category: 'newsletter', required: false, user })).toMatchObject({
      deliver: false,
    })
    expect(shouldDeliverEmail({ category: 'system', required: true, user })).toEqual({
      deliver: true,
    })

    const newsletter = await queueEmail(payload, {
      category: 'newsletter',
      data: {
        body: 'Optional organization news.',
        title: 'Newsletter preference test',
        unsubscribeUrl: 'https://example.test/account/settings',
      },
      deduplicationKey: `newsletter-suppressed-${nonce}`,
      queue: 'newsletters',
      template: 'newsletter',
      userID: user.id,
    })
    rememberDelivery(newsletter.delivery)
    expect(newsletter).toMatchObject({ queued: false })
    expect(newsletter.delivery.status).toBe('suppressed')
    expect(newsletter.delivery.jobId).toBeFalsy()

    const required = await queueEmail(payload, {
      category: 'system',
      data: {
        message: 'Your payment review status changed.',
        subject: 'Payment status',
        title: 'Payment status updated',
      },
      deduplicationKey: `required-system-${nonce}`,
      queue: 'transactional',
      required: true,
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000),
      template: 'systemNotice',
      userID: user.id,
    })
    rememberDelivery(required.delivery)
    await rememberJob(required.delivery)
    expect(required).toMatchObject({ queued: true })
    expect(required.delivery.status).toBe('queued')
  })

  it('delivers a queued job once and deduplicates repeated business events', async () => {
    const key = `job-delivery-${nonce}`
    const queued = await queueEmail(payload, {
      category: 'system',
      data: {
        message: 'This required test message should be delivered once.',
        subject: 'Queued delivery',
        title: 'Queued delivery test',
      },
      deduplicationKey: key,
      queue: 'transactional',
      required: true,
      template: 'systemNotice',
      userID: user.id,
    })
    rememberDelivery(queued.delivery)
    await rememberJob(queued.delivery)

    await payload.jobs.run({
      queue: 'transactional',
      sequential: true,
      where: { id: { equals: Number(queued.delivery.jobId) } },
    })
    const sent = await payload.findByID({
      collection: 'emailDeliveries',
      id: queued.delivery.id,
      overrideAccess: true,
    })
    expect(sent).toMatchObject({ attempts: 1, provider: 'capture', status: 'sent' })
    expect(sent.providerMessageId).toMatch(/^capture-/)
    expect(getCapturedEmails().filter((email) => email.idempotencyKey === key)).toHaveLength(1)

    const repeated = await queueEmail(payload, {
      category: 'system',
      data: {
        message: 'This required test message should be delivered once.',
        subject: 'Queued delivery',
        title: 'Queued delivery test',
      },
      deduplicationKey: key,
      required: true,
      template: 'systemNotice',
      userID: user.id,
    })
    expect(repeated).toMatchObject({ deduplicated: true, queued: false })
    expect(getCapturedEmails().filter((email) => email.idempotencyKey === key)).toHaveLength(1)
  })

  it('records sanitized failures and permits a safe retry of the same delivery', async () => {
    const queued = await queueEmail(payload, {
      category: 'system',
      data: {
        message: 'Retry this required delivery.',
        subject: 'Retry delivery',
        title: 'Retry test',
      },
      deduplicationKey: `retry-${nonce}`,
      required: true,
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000),
      template: 'systemNotice',
      userID: user.id,
    })
    rememberDelivery(queued.delivery)
    await rememberJob(queued.delivery)
    const job = await payload.findByID({
      collection: 'payload-jobs',
      id: Number(queued.delivery.jobId),
      overrideAccess: true,
    })
    const input = job.input as { deliveryID: number; html: string; text: string }

    await expect(
      executeEmailDelivery({
        input,
        payload,
        sendEmail: async () => {
          throw new Error('Provider failed with Bearer re_should_never_be_logged')
        },
      }),
    ).rejects.toThrow('Provider failed')
    let delivery = await payload.findByID({
      collection: 'emailDeliveries',
      id: queued.delivery.id,
      overrideAccess: true,
    })
    expect(delivery).toMatchObject({ attempts: 1, status: 'failed' })
    expect(delivery.errorMessage).toContain('[redacted]')
    expect(delivery.errorMessage).not.toContain('re_should_never_be_logged')

    await executeEmailDelivery({
      input,
      payload,
      sendEmail: async () => ({ id: 'retry-provider-id', transport: 'resend' }),
    })
    delivery = await payload.findByID({
      collection: 'emailDeliveries',
      id: queued.delivery.id,
      overrideAccess: true,
    })
    expect(delivery).toMatchObject({
      attempts: 2,
      errorMessage: null,
      providerMessageId: 'retry-provider-id',
      status: 'sent',
    })
  })

  it('supports isolated scheduled queues and keeps delivery audits private', async () => {
    const scheduledFor = new Date(Date.now() + 2 * 60 * 60 * 1000)
    for (const queue of ['reminders', 'waitlist', 'newsletters'] as const) {
      const queued = await queueEmail(payload, {
        category: 'system',
        data: {
          message: `Scheduled foundation for ${queue}.`,
          subject: `Scheduled ${queue}`,
          title: `Scheduled ${queue}`,
        },
        deduplicationKey: `scheduled-${queue}-${nonce}`,
        queue,
        required: true,
        scheduledFor,
        template: 'systemNotice',
        userID: user.id,
      })
      rememberDelivery(queued.delivery)
      await rememberJob(queued.delivery)
      const job = await payload.findByID({
        collection: 'payload-jobs',
        id: Number(queued.delivery.jobId),
        overrideAccess: true,
      })
      expect(job.queue).toBe(queue)
      expect(job.waitUntil).toBe(scheduledFor.toISOString())
      expect(job.concurrencyKey).toBe(`email-delivery:${queued.delivery.id}`)
    }

    await expect(
      payload.find({
        collection: 'emailDeliveries',
        limit: 10,
        overrideAccess: false,
        user,
      }),
    ).rejects.toThrow('not allowed')
  })
})
