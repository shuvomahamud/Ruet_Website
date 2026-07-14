import type { PayloadRequest } from 'payload'
import { Forbidden } from 'payload'

import { getRole } from '@/access/roles'
import type { ChapterRequest } from '@/payload-types'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'
import { writeAuditLog } from './audit'
import { lockWorkflowRecord, runInTransaction } from './transaction'

type ReviewInput = {
  decision: 'approve' | 'reject'
  notes?: string
  req: PayloadRequest
  requestID: number
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const reviewChapterRequest = async ({ decision, notes, req, requestID }: ReviewInput) =>
  runInTransaction(req, async () => {
    if (getRole(req.user) !== 'superAdmin') throw new Forbidden(req.t)
    await lockWorkflowRecord(req, 'chapter_requests', requestID)

    const request = (await req.payload.findByID({
      collection: 'chapterRequests',
      depth: 0,
      id: requestID,
      overrideAccess: true,
      req,
    })) as ChapterRequest
    const targetStatus = decision === 'approve' ? 'approved' : 'rejected'

    if (request.status === targetStatus) {
      await writeAuditLog(req, {
        action: `chapter_request.${decision}`,
        afterStatus: targetStatus,
        beforeStatus: targetStatus,
        entityID: request.id,
        entityType: 'chapterRequest',
        metadata: { idempotent: true },
        outcome: 'no_change',
      })
      return { idempotent: true, request }
    }
    if (request.status !== 'pending') {
      throw new AppError('This chapter request already has a different final decision.', {
        code: 'CHAPTER_REQUEST_ALREADY_REVIEWED',
        status: 409,
      })
    }
    if (decision === 'reject' && !notes?.trim()) {
      throw new AppError('A rejection reason is required.', {
        code: 'REJECTION_REASON_REQUIRED',
        status: 400,
      })
    }

    let resultingChapter = getRelationshipID(request.resultingChapter)
    if (decision === 'approve' && !resultingChapter) {
      const baseSlug = slugify(request.requestedName) || `chapter-${request.id}`
      const collision = await req.payload.find({
        collection: 'chapters',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        req,
        where: { slug: { equals: baseSlug } },
      })
      const chapter = await req.payload.create({
        collection: 'chapters',
        data: {
          _status: 'published',
          chapterStatus: 'active',
          editorialStatus: 'approved',
          name: request.requestedName,
          regionOrState: request.requestedRegion,
          slug: collision.docs.length ? `${baseSlug}-${request.id}` : baseSlug,
          summary:
            request.motivation ||
            `${request.requestedName} connects RUET alumni through local programs and community.`,
        },
        draft: false,
        overrideAccess: true,
        req,
      })
      resultingChapter = chapter.id
    }

    const reviewed = (await req.payload.update({
      collection: 'chapterRequests',
      context: { chapterRequestReview: true },
      data: {
        notes: notes?.trim() || request.notes,
        resultingChapter,
        reviewedAt: new Date().toISOString(),
        reviewedBy: Number(req.user?.id),
        status: targetStatus,
      },
      id: request.id,
      overrideAccess: true,
      req,
    })) as ChapterRequest

    await writeAuditLog(req, {
      action: `chapter_request.${decision}`,
      afterStatus: targetStatus,
      beforeStatus: request.status,
      entityID: request.id,
      entityType: 'chapterRequest',
      metadata: { idempotent: false, resultingChapter: resultingChapter ?? null },
      outcome: 'succeeded',
    })

    return { idempotent: false, request: reviewed }
  })
