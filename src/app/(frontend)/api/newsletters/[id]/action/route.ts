import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { newsletterCampaignActionSchema } from '@/communications/schema'
import {
  cancelNewsletterCampaign,
  scheduleNewsletterCampaign,
  sendNewsletterCampaign,
} from '@/services/newsletter-campaigns'
import { AppError } from '@/utilities/errors'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!isAdmin(user)) {
    return Response.json({ message: 'Only administrators can manage newsletters.' }, { status: 403 })
  }
  const campaignID = Number((await params).id)
  const input = newsletterCampaignActionSchema.safeParse(await request.json())
  if (!Number.isSafeInteger(campaignID) || campaignID < 1 || !input.success) {
    return Response.json({ message: 'Check the newsletter action details.' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })
    const req = await createLocalReq({ user }, payload)
    if (input.data.action === 'cancel') {
      const result = await cancelNewsletterCampaign({ campaignID, req })
      return Response.json({
        message: result.idempotent
          ? 'This campaign was already cancelled.'
          : 'The scheduled campaign was cancelled.',
      })
    }
    if (input.data.action === 'schedule') {
      const result = await scheduleNewsletterCampaign({
        campaignID,
        req,
        scheduledAt: new Date(input.data.scheduledAt),
      })
      return Response.json({
        message: result.idempotent
          ? 'This campaign already has that schedule.'
          : 'The newsletter was scheduled.',
      })
    }
    const result = await sendNewsletterCampaign({ campaignID, req })
    return Response.json({
      message: result.idempotent
        ? result.processing
          ? 'This campaign is already being processed.'
          : 'This campaign was already sent.'
        : result.failed
          ? `Dispatch completed with ${result.failed} recipient error(s). Retry is available.`
          : `Newsletter queued for ${result.queued} opted-in recipient(s); ${result.suppressed} preference suppression(s) recorded.`,
    })
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500
    return Response.json(
      {
        message:
          error instanceof AppError ? error.message : 'The newsletter action could not be completed.',
      },
      { status },
    )
  }
}

