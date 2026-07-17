import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'
import { z } from 'zod'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { getApprovalEligibility, getPaidMembershipEligibility } from '@/services/admin-bulk-actions'

const schema = z.object({ ids: z.array(z.coerce.number().int().positive()).min(1).max(100) })

export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!isAdmin(user)) return Response.json({ message: 'Administrator access is required.' }, { status: 403 })
  const input = schema.safeParse(await request.json())
  if (!input.success) return Response.json({ message: 'Select between 1 and 100 users.' }, { status: 400 })
  const payload = await getPayload({ config })
  const req = await createLocalReq({ user }, payload)
  const [approval, paidMembership] = await Promise.all([
    getApprovalEligibility(req, input.data.ids),
    getPaidMembershipEligibility(req, input.data.ids),
  ])
  return Response.json({ approval, paidMembership })
}
