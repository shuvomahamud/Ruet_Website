import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { getRole } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import {
  queueEventCancellationNotice,
  queueWaitlistPromotionNotices,
} from '@/services/event-notifications'
import { cancelEventRegistration } from '@/services/event-registration'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(_request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!['chapterAdmin', 'admin', 'superAdmin'].includes(getRole(user) ?? '')) {
    return Response.json({ message: 'You are not authorized to cancel registrations.' }, { status: 403 })
  }
  const registrationID = Number((await params).id)
  if (!Number.isSafeInteger(registrationID) || registrationID < 1) {
    return Response.json({ message: 'Select a valid registration.' }, { status: 400 })
  }
  try {
    const payload = await getPayload({ config })
    const req = await createLocalReq({ user }, payload)
    const result = await cancelEventRegistration({ registrationID, req })
    const eventID = getRelationshipID(result.registration.event)
    const registrationUserID = getRelationshipID(result.registration.user)
    if (eventID) {
      const event = await payload.findByID({
        collection: 'events',
        depth: 0,
        id: eventID,
        overrideAccess: true,
      })
      try {
        await Promise.all([
          queueWaitlistPromotionNotices(payload, event, result.promoted),
          registrationUserID
            ? queueEventCancellationNotice(payload, event, registrationID, registrationUserID)
            : Promise.resolve(),
        ])
      } catch (error) {
        payload.logger.error({ err: error, msg: 'Event cancellation notification could not queue.' })
      }
    }
    return Response.json({ message: 'The registration was cancelled and capacity was reprocessed.' })
  } catch (error) {
    const status =
      error instanceof AppError
        ? error.status
        : typeof error === 'object' && error && 'status' in error
          ? Number(error.status)
          : 500
    return Response.json(
      { message: error instanceof AppError ? error.message : 'The registration could not be cancelled.' },
      { status: Number.isInteger(status) ? status : 500 },
    )
  }
}
