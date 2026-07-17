import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'
import { z } from 'zod'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { addPaidMemberships } from '@/services/admin-bulk-actions'

const schema = z.object({ userIDs: z.array(z.coerce.number().int().positive()).min(1).max(100) })
export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!isAdmin(user)) return Response.json({ message: 'Administrator access is required.' }, { status: 403 })
  const input = schema.safeParse(await request.json())
  if (!input.success) return Response.json({ message: 'Select between 1 and 100 users.' }, { status: 400 })
  const payload = await getPayload({ config })
  const result = await addPaidMemberships(await createLocalReq({ user }, payload), input.data.userIDs)
  return Response.json({ ...result, message: `${result.succeeded.length} membership(s) added; ${result.failed.length} failed.` })
}
