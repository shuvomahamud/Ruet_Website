type EmailAction = {
  label: string
  url: string
}

export type EmailTemplateData = {
  accountVerification: {
    actionUrl: string
  }
  membershipReminder: {
    actionUrl: string
    firstName?: string
    renewalDate: string
  }
  newsletter: {
    body: string
    title: string
    unsubscribeUrl: string
  }
  passwordReset: {
    actionUrl: string
  }
  systemNotice: {
    action?: EmailAction
    message: string
    preheader?: string
    subject: string
    title: string
  }
  waitlistPromotion: {
    actionUrl: string
    eventTitle: string
    expiresAt?: string
  }
}

export type EmailTemplateSlug = keyof EmailTemplateData

export type RenderedEmail = {
  html: string
  subject: string
  template: EmailTemplateSlug
  text: string
}

const escapeHTML = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const safeAction = (action: EmailAction | undefined): EmailAction | undefined => {
  if (!action) return undefined
  const url = new URL(action.url)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Email actions require HTTP(S).')
  return action
}

const textToParagraphs = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHTML(paragraph.trim()).replaceAll('\n', '<br />')}</p>`)
    .join('')

export const renderEmailLayout = ({
  action,
  body,
  preheader,
  title,
}: {
  action?: EmailAction
  body: string
  preheader: string
  title: string
}) => {
  const normalizedAction = safeAction(action)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHTML(title)}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { width: 100% !important; }
        .email-content { padding: 28px 22px !important; }
        .email-action { display: block !important; text-align: center !important; }
      }
    </style>
  </head>
  <body style="background:#eef2f6;margin:0;padding:0">
    <div style="display:none;font-size:1px;color:#eef2f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHTML(preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#eef2f6;border-collapse:collapse">
      <tr>
        <td align="center" style="padding:32px 12px">
          <table class="email-shell" role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-collapse:collapse;border-radius:12px;overflow:hidden;width:600px;max-width:100%">
            <tr><td style="background:#12306b;color:#ffffff;font-family:Arial,sans-serif;font-size:18px;font-weight:700;padding:20px 32px">RUETIAN USA</td></tr>
            <tr>
              <td class="email-content" style="color:#243244;font-family:Arial,sans-serif;font-size:16px;line-height:1.65;padding:36px 32px">
                <h1 style="color:#12306b;font-size:28px;line-height:1.2;margin:0 0 20px">${escapeHTML(title)}</h1>
                ${body}
                ${
                  normalizedAction
                    ? `<p style="margin:28px 0"><a class="email-action" href="${escapeHTML(normalizedAction.url)}" style="background:#1e4faf;border-radius:8px;color:#ffffff;display:inline-block;font-weight:700;padding:13px 20px;text-decoration:none">${escapeHTML(normalizedAction.label)}</a></p>`
                    : ''
                }
                <p style="border-top:1px solid #dbe3ec;color:#657386;font-size:13px;margin:32px 0 0;padding-top:20px">This message was sent by RUETIAN USA. Required account and transaction messages are sent even when optional communication preferences are disabled.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

const renderers: {
  [Slug in EmailTemplateSlug]: (data: EmailTemplateData[Slug]) => RenderedEmail
} = {
  accountVerification: (data) => ({
    html: renderEmailLayout({
      action: { label: 'Verify email', url: data.actionUrl },
      body: '<p>Confirm your email address to activate password sign-in.</p><p>If you did not create this account, you can ignore this message.</p>',
      preheader: 'Confirm your RUETIAN USA email address.',
      title: 'Verify your RUETIAN USA email',
    }),
    subject: 'Verify your RUETIAN USA email',
    template: 'accountVerification',
    text: `Verify your RUETIAN USA email\n\nConfirm your email address to activate password sign-in.\n\n${data.actionUrl}\n\nIf you did not create this account, you can ignore this message.`,
  }),
  membershipReminder: (data) => {
    const greeting = data.firstName ? `Hello ${data.firstName},` : 'Hello,'
    return {
      html: renderEmailLayout({
        action: { label: 'Review membership', url: data.actionUrl },
        body: `<p>${escapeHTML(greeting)}</p><p>Your annual RUETIAN USA membership is due for renewal on <strong>${escapeHTML(data.renewalDate)}</strong>. Renewal uses a new Zelle proof submission and is never charged automatically.</p>`,
        preheader: `Membership renewal reminder for ${data.renewalDate}.`,
        title: 'Membership renewal reminder',
      }),
      subject: 'Your RUETIAN USA membership renewal reminder',
      template: 'membershipReminder',
      text: `${greeting}\n\nYour annual RUETIAN USA membership is due for renewal on ${data.renewalDate}. Renewal uses a new Zelle proof submission and is never charged automatically.\n\n${data.actionUrl}`,
    }
  },
  newsletter: (data) => ({
    html: renderEmailLayout({
      body: `${textToParagraphs(data.body)}<p style="font-size:13px"><a href="${escapeHTML(data.unsubscribeUrl)}">Manage newsletter preferences</a></p>`,
      preheader: data.title,
      title: data.title,
    }),
    subject: data.title,
    template: 'newsletter',
    text: `${data.title}\n\n${data.body}\n\nManage newsletter preferences: ${data.unsubscribeUrl}`,
  }),
  passwordReset: (data) => ({
    html: renderEmailLayout({
      action: { label: 'Reset password', url: data.actionUrl },
      body: '<p>Use the secure link below within one hour to choose a new password.</p><p>If you did not request this, you can ignore this message.</p>',
      preheader: 'Use this secure link to reset your password.',
      title: 'Reset your RUETIAN USA password',
    }),
    subject: 'Reset your RUETIAN USA password',
    template: 'passwordReset',
    text: `Reset your RUETIAN USA password\n\nUse this secure link within one hour to choose a new password.\n\n${data.actionUrl}\n\nIf you did not request this, you can ignore this message.`,
  }),
  systemNotice: (data) => ({
    html: renderEmailLayout({
      action: data.action,
      body: textToParagraphs(data.message),
      preheader: data.preheader || data.message.slice(0, 120),
      title: data.title,
    }),
    subject: data.subject,
    template: 'systemNotice',
    text: `${data.title}\n\n${data.message}${data.action ? `\n\n${data.action.label}: ${data.action.url}` : ''}`,
  }),
  waitlistPromotion: (data) => ({
    html: renderEmailLayout({
      action: { label: 'Review your registration', url: data.actionUrl },
      body: `<p>Space is now available for <strong>${escapeHTML(data.eventTitle)}</strong>.</p>${data.expiresAt ? `<p>Please respond by ${escapeHTML(data.expiresAt)}.</p>` : ''}`,
      preheader: `Space is available for ${data.eventTitle}.`,
      title: 'A place is available from the waitlist',
    }),
    subject: `A place is available for ${data.eventTitle}`,
    template: 'waitlistPromotion',
    text: `A place is available from the waitlist\n\nSpace is now available for ${data.eventTitle}.${data.expiresAt ? ` Please respond by ${data.expiresAt}.` : ''}\n\n${data.actionUrl}`,
  }),
}

export const renderEmailTemplate = <Slug extends EmailTemplateSlug>(
  template: Slug,
  data: EmailTemplateData[Slug],
): RenderedEmail => renderers[template](data as never)
