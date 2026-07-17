import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'
import { z } from 'zod'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { cancelMemberships } from '@/services/admin-bulk-actions'

const schema = z.object({ membershipIDs: z.array(z.coerce.number().int().positive()).min(1).max(100), reason: z.string().trim().min(1).max(2000) })
export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!isAdmin(user)) return Response.json({ message: 'Administrator access is required.' }, { status: 403 })
  const input = schema.safeParse(await request.json())
  if (!input.success) return Response.json({ message: 'Select memberships and provide a cancellation reason.' }, { status: 400 })
  const payload = await getPayload({ config })
  const result = await cancelMemberships(await createLocalReq({ user }, payload), input.data.membershipIDs, input.data.reason)
  return Response.json({ ...result, message: `${result.succeeded.length} membership(s) cancelled; ${result.failed.length} failed.` })
}
